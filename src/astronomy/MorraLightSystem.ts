import * as THREE from "three";

import { CelestialBody } from "./CelestialBody";

export class MorraLightSystem {

  largeSun: CelestialBody;
  mediumSun: CelestialBody;
  smallSun: CelestialBody;

  scene: THREE.Scene;

  constructor(
    scene: THREE.Scene,
    largeSun: CelestialBody,
    mediumSun: CelestialBody,
    smallSun: CelestialBody
  ) {

    this.scene =
      scene;

    this.largeSun =
      largeSun;

    this.mediumSun =
      mediumSun;

    this.smallSun =
      smallSun;
  }

  update() {
    // Retained as a compatibility facade for older callers.
    // Surface illumination is calculated by the physical radiation engine.
  }

  dispose() {
    // No Three.js lighting objects are created here anymore.
  }
}
