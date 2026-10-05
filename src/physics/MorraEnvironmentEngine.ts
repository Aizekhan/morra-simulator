import * as THREE from "three";

import {
  CelestialBody
} from "../astronomy/CelestialBody";

import {
  MagosphereEngine,
  type MagosphereSample
} from "./MagosphereEngine";

import {
  RadiationEngine,
  type RadiationSample,
  type RadiationSource
} from "./RadiationEngine";

export type GravityCurrentType =
  | "NONE"
  | "VERTICAL"
  | "HORIZONTAL"
  | "SPIRAL";

export interface GravityCurrentSample {

  type: GravityCurrentType;

  strength: number;

  direction: THREE.Vector3;
}

export interface GravitySample {

  baseGravity: number;

  gravityEffect: number;

  gravityScale: number;

  current: GravityCurrentSample;
}

export interface MorraEnvironmentSample {

  point: THREE.Vector3;

  normal: THREE.Vector3;

  radiation: RadiationSample;

  magosphere: MagosphereSample;

  gravity: GravitySample;
}

export class MorraEnvironmentEngine {

  readonly radiation =
    new RadiationEngine();

  readonly magosphere =
    new MagosphereEngine();

  readonly morra:
    CelestialBody;

  private readonly occluders:
    CelestialBody[];

  private readonly baseGravity =
    0.9;

  constructor(
    morra: CelestialBody,
    sources: RadiationSource[],
    occluders: CelestialBody[]
  ) {

    this.morra =
      morra;

    this.occluders =
      occluders;

    this.radiation.setSources(
      sources
    );
  }

  getOccluders() {

    return [
      ...this.occluders
    ];
  }

  evaluateLocalPoint(
    localPoint: THREE.Vector3
  ): MorraEnvironmentSample {

    const normalized =
      localPoint
        .clone()
        .normalize();

    const worldPoint =
      this.morra.mesh.localToWorld(
        normalized
          .clone()
          .multiplyScalar(
            this.morra.radius
          )
      );

    const worldCenter =
      this.morra.mesh
        .getWorldPosition(
          new THREE.Vector3()
        );

    const normal =
      worldPoint
        .clone()
        .sub(
          worldCenter
        )
        .normalize();

    const radiation =
      this.radiation
        .evaluateSurfacePoint(
          worldPoint,
          normal,
          this.occluders
        );

    const magosphere =
      this.magosphere.evaluate(
        radiation
      );

    const gravityEffect =
      magosphere.gravityEffect;

    const current: GravityCurrentSample =
      this.evaluateGravityCurrent(
        normalized,
        gravityEffect
      );

    const gravity: GravitySample = {

      baseGravity:
        this.baseGravity,

      gravityEffect,

      // A stable Magosphere preserves canonical 0.9g.
      // Instability lowers the local effective gravity.
      gravityScale:
        THREE.MathUtils.clamp(
          1 -
          gravityEffect,
          0,
          1
        ),

      current
    };

    return {

      point:
        worldPoint,

      normal,

      radiation,

      magosphere,

      gravity
    };
  }

  private evaluateGravityCurrent(
    normal: THREE.Vector3,
    strength: number
  ): GravityCurrentSample {

    const clampedStrength =
      THREE.MathUtils.clamp(
        strength,
        0,
        1
      );

    if(
      clampedStrength <=
      Number.EPSILON
    ) {
      return {
        type: "NONE",
        strength: 0,
        direction:
          new THREE.Vector3()
      };
    }

    const axial =
      Math.abs(normal.y);

    const radial =
      Math.sqrt(
        normal.x * normal.x +
        normal.z * normal.z
      );

    if(
      axial >= 0.75
    ) {
      return {
        type: "VERTICAL",
        strength: clampedStrength,
        direction:
          new THREE.Vector3(
            0,
            normal.y >= 0
              ? 1
              : -1,
            0
          )
      };
    }

    if(
      radial <= 0.35
    ) {
      return {
        type: "VERTICAL",
        strength: clampedStrength,
        direction:
          new THREE.Vector3(
            0,
            normal.y >= 0
              ? 1
              : -1,
            0
          )
      };
    }

    if(
      axial <= 0.2
    ) {
      const tangent =
        new THREE.Vector3(
          -normal.z,
          0,
          normal.x
        ).normalize();

      return {
        type: "HORIZONTAL",
        strength: clampedStrength,
        direction:
          tangent
      };
    }

    const tangent =
      new THREE.Vector3(
        -normal.z,
        0,
        normal.x
      );

    const spiralDirection =
      new THREE.Vector3()
        .copy(tangent)
        .multiplyScalar(0.75)
        .add(
          new THREE.Vector3(
            0,
            normal.y >= 0
              ? 0.66
              : -0.66,
            0
          )
        )
        .normalize();

    return {
      type: "SPIRAL",
      strength: clampedStrength,
      direction:
        spiralDirection
    };
  }

  evaluateSurfacePointDiagnostics(
    localPoint: THREE.Vector3
  ) {

    const sample =
      this.evaluateLocalPoint(
        localPoint
      );

    let maxShadow = 0;
    let minVisibility = 1;
    let blockedSources = 0;
    let umbraSources = 0;
    let penumbraSources = 0;

    for(
      const contribution of
      sample.radiation.contributions
    ) {

      minVisibility = Math.min(
        minVisibility,
        contribution.visibilityFactor
      );

      const blocked =
        1 - contribution.visibilityFactor;

      maxShadow = Math.max(
        maxShadow,
        blocked
      );

      if(
        contribution.blockingOccluderIds.length > 0
      ) {
        blockedSources += 1;
      }

      if(
        contribution.umbra
      ) {
        umbraSources += 1;
      }

      if(
        contribution.penumbra
      ) {
        penumbraSources += 1;
      }
    }

    return {

      sample,

      sourceCount:
        sample.radiation.contributions.length,

      minVisibility,

      maxShadow,

      blockedSources,

      umbraSources,

      penumbraSources
    };
  }
}
