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

    if (Math.abs(e) < 1e-12) {
      return m;
    }

    let eccentricAnomaly =
      e < 0.8
        ? m
        : Math.sign(m || 1) * Math.PI;

    let converged =
      false;

    for (
      let i = 0;
      i < 32;
      i++
    ) {

      const f =
        eccentricAnomaly -
        e *
        Math.sin(
          eccentricAnomaly
        ) -
        m;

      const derivative =
        1 -
        e *
        Math.cos(
          eccentricAnomaly
        );

      if (
        Math.abs(derivative) < 1e-8
      ) {
        break;
      }

      const correction =
        THREE.MathUtils.clamp(
          f / derivative,
          -Math.PI / 2,
          Math.PI / 2
        );

      eccentricAnomaly -=
        correction;

      if (
        Math.abs(
          correction
        ) < 1e-11
      ) {
        converged = true;
        break;
      }
    }

    if (!converged) {

      let low = -Math.PI;
      let high = Math.PI;

      for (
        let i = 0;
        i < 48;
        i++
      ) {

        const middle =
          (low + high) * 0.5;

        const value =
          middle -
          e *
          Math.sin(
            middle
          ) -
          m;

        if (value > 0) {
          high = middle;
        } else {
          low = middle;
        }
      }

      eccentricAnomaly =
        (low + high) * 0.5;
    }

    return eccentricAnomaly;
  }

  static getMaxEccentricity(
    semiMajorAxis: number,
    minimumPeriapsisDistance: number
  ): number {

    const a =
      Math.max(
        0,
        semiMajorAxis
      );

    const periapsis =
      Math.max(
        0,
        minimumPeriapsisDistance
      );

    if (a <= 0) {
      return 0;
    }

    return THREE.MathUtils.clamp(
      1 -
      periapsis / a,
      0,
      0.99
    );
  }

  static getPosition(
    radius: number,
    eccentricity: number,
    anomaly: number,
    plane: OrbitPlane,
    inclinationDegrees: number,
    ascendingNodeDegrees: number,
    planeOffset: number,
    offsetX = 0,
    offsetY = 0,
    offsetZ = 0
  ): THREE.Vector3 {

    const eccentricAnomaly =
      this.solveEccentricAnomaly(
        anomaly,
        eccentricity
      );

    const ellipsePoint =
      this.getEllipsePoint(
        radius,
        eccentricity,
        eccentricAnomaly
      );

    const basis =
      this.getBasis(
        plane,
        inclinationDegrees,
        ascendingNodeDegrees
      );

    return basis.primary
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
          offsetX,
          offsetY,
          offsetZ
        )
      )
      .add(
        basis.normal
          .clone()
          .multiplyScalar(
            planeOffset
          )
      );
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
