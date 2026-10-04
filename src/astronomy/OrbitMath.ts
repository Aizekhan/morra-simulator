import * as THREE from "three";

import type {
  OrbitPlane
} from "./CelestialBody";

export interface OrbitBasis {

  primary: THREE.Vector3;

  secondary: THREE.Vector3;

  normal: THREE.Vector3;
}

export class OrbitMath {

  static getBaseBasis(
    plane: OrbitPlane
  ): OrbitBasis {

    switch (plane) {

      case "XZ":

        return {
          primary:
            new THREE.Vector3(1, 0, 0),
          secondary:
            new THREE.Vector3(0, 0, 1),
          normal:
            new THREE.Vector3(0, 1, 0)
        };

      case "YZ":

        return {
          primary:
            new THREE.Vector3(0, 1, 0),
          secondary:
            new THREE.Vector3(0, 0, 1),
          normal:
            new THREE.Vector3(1, 0, 0)
        };

      case "XY":

        return {
          primary:
            new THREE.Vector3(1, 0, 0),
          secondary:
            new THREE.Vector3(0, 1, 0),
          normal:
            new THREE.Vector3(0, 0, 1)
        };
    }
  }

  static getBasis(
    plane: OrbitPlane,
    inclinationDegrees: number,
    ascendingNodeDegrees: number
  ): OrbitBasis {

    const base =
      this.getBaseBasis(
        plane
      );

    const nodeAngle =
      THREE.MathUtils.degToRad(
        ascendingNodeDegrees
      );

    const inclination =
      THREE.MathUtils.degToRad(
        inclinationDegrees
      );

    const primary =
      base.primary
        .clone()
        .multiplyScalar(
          Math.cos(nodeAngle)
        )
        .add(
          base.secondary
            .clone()
            .multiplyScalar(
              Math.sin(nodeAngle)
            )
        )
        .normalize();

    const secondary =
      primary
        .clone()
        .cross(
          base.normal
        )
        .normalize()
        .applyAxisAngle(
          primary,
          inclination
        );

    const normal =
      primary
        .clone()
        .cross(
          secondary
        )
        .normalize();

    return {
      primary,
      secondary,
      normal
    };
  }

  static solveEccentricAnomaly(
    meanAnomaly: number,
    eccentricity: number
  ): number {

    const e =
      THREE.MathUtils.clamp(
        eccentricity,
        0,
        0.999999
      );

    let m =
      meanAnomaly %
      (Math.PI * 2);

    if (m > Math.PI) {
      m -= Math.PI * 2;
    }

    if (m < -Math.PI) {
      m += Math.PI * 2;
    }

    let eccentricAnomaly =
      e < 0.8
        ? m
        : Math.PI;

    for (
      let i = 0;
      i < 12;
      i++
    ) {

      const correction =
        (
          eccentricAnomaly -
          e *
          Math.sin(
            eccentricAnomaly
          ) -
          m
        ) /
        (
          1 -
          e *
          Math.cos(
            eccentricAnomaly
          )
        );

      eccentricAnomaly -=
        correction;

      if (
        Math.abs(
          correction
        ) < 1e-10
      ) {
        break;
      }
    }

    return eccentricAnomaly;
  }

  static getEllipsePoint(
    radius: number,
    eccentricity: number,
    eccentricAnomaly: number
  ): {
    primary: number;
    secondary: number;
  } {

    const e =
      THREE.MathUtils.clamp(
        eccentricity,
        0,
        0.999999
      );

    const semiMajor =
      Math.max(
        0,
        radius
      );

    const semiMinor =
      semiMajor *
      Math.sqrt(
        1 -
        e *
        e
      );

    return {
      primary:
        semiMajor *
        (
          Math.cos(
            eccentricAnomaly
          ) -
          e
        ),

      secondary:
        semiMinor *
        Math.sin(
          eccentricAnomaly
        )
    };
  }
}
