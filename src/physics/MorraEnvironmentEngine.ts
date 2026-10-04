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

export interface MorraEnvironmentSample {

  point: THREE.Vector3;

  normal: THREE.Vector3;

  radiation: RadiationSample;

  magosphere: MagosphereSample;
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

    return {
      point:
        worldPoint,

      normal,

      radiation,

      magosphere
    };
  }
}
