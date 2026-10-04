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

    const basis =
      OrbitMath.getBasis(
        shape.plane,
        shape.inclination,
        shape.ascendingNode
      );

    const points:
      THREE.Vector3[] = [];

    for(
      let i = 0;
      i <= 256;
      i++
    ) {

      const eccentricAnomaly =
        (
          i /
          256
        ) *
        Math.PI *
        2;

      const ellipsePoint =
        OrbitMath.getEllipsePoint(
          shape.radius,
          shape.eccentricity,
          eccentricAnomaly
        );

      points.push(
        basis.primary
          .clone()
          .multiplyScalar(
            ellipsePoint.primary
          )
          .add(
            basis.secondary
              .clone()
              .multiplyScalar(
                ellipsePoint.secondary
              )
          )
          .add(
            new THREE.Vector3(
              shape.offsetX,
              shape.offsetY,
              shape.offsetZ
            )
          )
      );
    }

    const oldGeometry =
      line.geometry;

    line.geometry =
      new THREE.BufferGeometry()
      .setFromPoints(points);

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
