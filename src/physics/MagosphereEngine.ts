import * as THREE from "three";

import type {
  RadiationSample
} from "./RadiationEngine";

export interface MagosphereSample {

  magicInput: number;

  referenceMagicInput: number;

  stability: number;

  anomalyStrength: number;

  gravityEffect: number;
}

export class MagosphereEngine {

  evaluate(
    radiation: RadiationSample
  ): MagosphereSample {

    const reference =
      Math.max(
        Number.EPSILON,
        radiation.unobstructedMagic
      );

    const stability =
      THREE.MathUtils.clamp(
        radiation.magic /
        reference,
        0,
        1
      );

    const anomalyStrength =
      1 -
      stability;

    return {
      magicInput:
        radiation.magic,

      referenceMagicInput:
        reference,

      stability,

      anomalyStrength,

      // Current canonical stage only:
      // Magosphere instability produces a normalized gravity
      // perturbation signal. Spatial direction and currents are
      // implemented in the next physics layer.
      gravityEffect:
        anomalyStrength
    };
  }
}
