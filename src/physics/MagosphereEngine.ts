import * as THREE from "three";

import type {
  RadiationSample
} from "./RadiationEngine";

export interface MagosphereSample {

  magicInput: number;

  referenceMagicInput: number;

  stability: number;

  anomalyStrength: number;
}

export class MagosphereEngine {

  private referenceMagicInput =
    1;

  setReferenceMagicInput(
    value: number
  ) {

    this.referenceMagicInput =
      Math.max(
        Number.EPSILON,
        value
      );
  }

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

    return {
      magicInput:
        radiation.magic,

      referenceMagicInput:
        reference,

      stability,

      anomalyStrength:
        1 -
        stability
    };
  }
}
