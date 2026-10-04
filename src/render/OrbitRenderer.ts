import * as THREE from "three";

import {
  OrbitPlane
} from "../astronomy/CelestialBody";

export interface OrbitShape {

  radius: number;

  color: number;

  plane: OrbitPlane;

  offsetX: number;
  offsetY: number;
  offsetZ: number;
}

export class OrbitRenderer {

  static createOrbit(
    radius: number,
    color: number,
    plane: OrbitPlane,
    offsetX = 0,
    offsetY = 0,
    offsetZ = 0
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
        offsetZ
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

      const angle =
        (
          i /
          256
        ) *
        Math.PI *
        2;

      let x = 0;
      let y = 0;
      let z = 0;

      switch(
        shape.plane
      ) {

        case "XZ":

          x =
            Math.cos(angle) *
            shape.radius +
            shape.offsetX;

          y =
            shape.offsetY;

          z =
            Math.sin(angle) *
            shape.radius +
            shape.offsetZ;

          break;

        case "YZ":

          x =
            shape.offsetX;

          y =
            Math.cos(angle) *
            shape.radius +
            shape.offsetY;

          z =
            Math.sin(angle) *
            shape.radius +
            shape.offsetZ;

          break;

        case "XY":

          x =
            Math.cos(angle) *
            shape.radius +
            shape.offsetX;

          y =
            Math.sin(angle) *
            shape.radius +
            shape.offsetY;

          z =
            shape.offsetZ;

          break;
      }

      points.push(
        new THREE.Vector3(
          x,
          y,
          z
        )
      );
    }

    const oldGeometry =
      line.geometry;

    const geometry =
      new THREE.BufferGeometry()
      .setFromPoints(points);

    line.geometry =
      geometry;

    oldGeometry.dispose();

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
