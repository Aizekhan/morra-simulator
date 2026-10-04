import * as THREE from "three";

import {
  CelestialBody
} from "./CelestialBody";

import {
  OrbitRenderer
} from "../render/OrbitRenderer";

import type {
  OrbitShape
} from "../render/OrbitRenderer";

interface OrbitEntry {

  body: CelestialBody;

  line: THREE.LineLoop;

  colorSource: () => number;

  offsetX: number;
  offsetZ: number;

  lastKey: string;
}

export class OrbitSystem {

  private entries: OrbitEntry[] = [];

  private readonly scene: THREE.Scene;

  private showOrbits =
    true;

  constructor(
    scene: THREE.Scene
  ) {
    this.scene = scene;
  }

  add(
    body: CelestialBody,
    colorSource: () => number,
    offsetX = 0,
    offsetZ = 0
  ) {

    const color =
      colorSource();

    const line =
      OrbitRenderer.createOrbit(
        body.orbitRadius,
        color,
        body.orbitPlane,
        offsetX,
        body.orbitOffsetY,
        offsetZ,
        body.orbitPlaneOffset,
        body.orbitInclination,
        body.orbitAscendingNode,
        body.orbitEccentricity
      );

    this.scene.add(
      line
    );

    line.userData.celestialBody =
      body;

    this.entries.push({
      body,
      line,
      colorSource,
      offsetX,
      offsetZ,
      lastKey: ""
    });
  }

  update() {

    for(
      const entry of this.entries
    ) {

      const body =
        entry.body;

      const shape: OrbitShape = {
        radius:
          body.orbitRadius,

        plane:
          body.orbitPlane,

        offsetX:
          entry.offsetX,

        offsetY:
          body.orbitOffsetY,

        offsetZ:
          entry.offsetZ,

        planeOffset:
          body.orbitPlaneOffset,

        inclination:
          body.orbitInclination,

        ascendingNode:
          body.orbitAscendingNode,

        eccentricity:
          body.orbitEccentricity,

        color:
          entry.colorSource()
      };

      const key =
        JSON.stringify(
          shape
        );

      if(
        key !==
        entry.lastKey
      ) {

        OrbitRenderer.updateOrbit(
          entry.line,
          shape
        );

        entry.lastKey =
          key;
      }

      entry.line.visible =
        this.showOrbits &&
        entry.body.mesh.visible;

      continue;

      OrbitRenderer.updateOrbit(
        entry.line,
        shape
      );

      entry.lastKey =
        key;
    }
  }

  setVisible(
    visible: boolean
  ) {

    this.showOrbits =
      visible;

    for(
      const entry of this.entries
    ) {

      entry.line.visible =
        this.showOrbits &&
        entry.body.mesh.visible;
    }
  }

  dispose() {

    for(
      const entry of this.entries
    ) {

      entry.line.geometry.dispose();

      const material =
        entry.line.material;

      if(
        material instanceof THREE.Material
      ) {
        material.dispose();
      }

      this.scene.remove(
        entry.line
      );
    }

    this.entries = [];
  }
}
