import * as THREE from "three";

import {
  CelestialBody
} from "./CelestialBody";

import {
  OrbitRenderer,
  OrbitShape
} from "../render/OrbitRenderer";

interface OrbitEntry {

  body: CelestialBody;

  line: THREE.LineLoop;

  color: number;

  offsetX: number;
  offsetY: number;
  offsetZ: number;

  lastKey: string;
}

export class OrbitSystem {

  private entries: OrbitEntry[] = [];

  constructor(
    private readonly scene: THREE.Scene
  ) {}

  add(
    body: CelestialBody,
    color: number,
    offsetX = 0,
    offsetY = 0,
    offsetZ = 0
  ) {

    const line =
      OrbitRenderer.createOrbit(
        body.orbitRadius,
        color,
        body.orbitPlane,
        offsetX,
        offsetY,
        offsetZ
      );

    this.scene.add(
      line
    );

    this.entries.push({
      body,
      line,
      color,
      offsetX,
      offsetY,
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

        color:
          entry.color
      };

      const key =
        JSON.stringify(
          shape
        );

      if(
        key ===
        entry.lastKey
      ) {
        continue;
      }

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

    for(
      const entry of this.entries
    ) {

      entry.line.visible =
        visible;
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
