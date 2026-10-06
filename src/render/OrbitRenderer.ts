import * as THREE from "three";

import type {
  OrbitPlane
} from "../astronomy/CelestialBody";

import {
  OrbitMath
} from "../astronomy/OrbitMath";

export interface OrbitShape {

  radius: number;

  color: number;

  plane: OrbitPlane;

  offsetX: number;
  offsetY: number;
  offsetZ: number;

  planeOffset: number;

  inclination: number;

  ascendingNode: number;

  eccentricity: number;
}

export class OrbitRenderer {

  static createOrbit(
    radius: number,
    color: number,
    plane: OrbitPlane,
    offsetX = 0,
    offsetY = 0,
    offsetZ = 0,
    planeOffset = 0,
    inclination = 0,
    ascendingNode = 0,
    eccentricity = 0
  ) {

    const line =
      new THREE.LineLoop(
        new THREE.BufferGeometry(),
        new THREE.LineBasicMaterial({
          color
        })
      );

    OrbitRenderer.updateOrbit(
      line,
      {
        radius,
        color,
        plane,
        offsetX,
        offsetY,
        offsetZ,
        planeOffset,
        inclination,
        ascendingNode,
        eccentricity
      }
    );

    return line;
  }

  static updateOrbit(
    line: THREE.LineLoop,
    shape: OrbitShape
  ) {

    const points:
      THREE.Vector3[] = [];

    for(
      let i = 0;
      i <= 256;
      i++
    ) {

      const anomaly =
        (
          i /
          256
        ) *
        Math.PI *
        2;

      points.push(
        OrbitMath.getPosition(
          shape.radius,
          shape.eccentricity,
          anomaly,
          shape.plane,
          shape.inclination,
          shape.ascendingNode,
          shape.planeOffset,
          shape.offsetX,
          shape.offsetY,
          shape.offsetZ
        )
      );
    }

    const geometry =
      new THREE.BufferGeometry()
      .setFromPoints(points);

    line.geometry.dispose();

    line.geometry =
      geometry;

    const material =
      line.material;

    if(
      material instanceof THREE.LineBasicMaterial
    ) {

      material.color.setHex(
        shape.color
      );
    }
  }
}
