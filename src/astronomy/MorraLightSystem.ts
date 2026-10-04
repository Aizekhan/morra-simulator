import * as THREE from "three";

import { CelestialBody }
from "./CelestialBody";

import { MORRA_CONFIG }
from "../world/MorraConfig";

export class MorraLightSystem {

  largeLight: THREE.PointLight;
  mediumLight: THREE.PointLight;
  smallLight: THREE.PointLight;

  largeSun: CelestialBody;
  mediumSun: CelestialBody;
  smallSun: CelestialBody;

  largeHelper: THREE.PointLightHelper;
  mediumHelper: THREE.PointLightHelper;
  smallHelper: THREE.PointLightHelper;

  constructor(
    scene: THREE.Scene,
    largeSun: CelestialBody,
    mediumSun: CelestialBody,
    smallSun: CelestialBody
  ) {

    this.largeSun =
      largeSun;

    this.mediumSun =
      mediumSun;

    this.smallSun =
      smallSun;

    // =====================
    // LARGE
    // =====================

    this.largeLight =
      new THREE.PointLight(
        MORRA_CONFIG.LIGHTS.LARGE.color,
        MORRA_CONFIG.LIGHTS.LARGE.intensity,
        MORRA_CONFIG.LIGHTS.LARGE.distance
      );

    this.largeLight.castShadow =
      true;

    scene.add(
      this.largeLight
    );

    // =====================
    // MEDIUM
    // =====================

    this.mediumLight =
      new THREE.PointLight(
        MORRA_CONFIG.LIGHTS.MEDIUM.color,
        MORRA_CONFIG.LIGHTS.MEDIUM.intensity,
        MORRA_CONFIG.LIGHTS.MEDIUM.distance
      );

    this.mediumLight.castShadow =
      true;

    scene.add(
      this.mediumLight
    );

    // =====================
    // SMALL
    // =====================

    this.smallLight =
      new THREE.PointLight(
        MORRA_CONFIG.LIGHTS.SMALL.color,
        MORRA_CONFIG.LIGHTS.SMALL.intensity,
        MORRA_CONFIG.LIGHTS.SMALL.distance
      );

    this.smallLight.castShadow =
      true;

    scene.add(
      this.smallLight
    );

    // =====================
    // HELPERS
    // =====================

    this.largeHelper =
      new THREE.PointLightHelper(
        this.largeLight,
        50
      );

    this.mediumHelper =
      new THREE.PointLightHelper(
        this.mediumLight,
        40
      );

    this.smallHelper =
      new THREE.PointLightHelper(
        this.smallLight,
        30
      );

    scene.add(
      this.largeHelper
    );

    scene.add(
      this.mediumHelper
    );

    scene.add(
      this.smallHelper
    );
  }

  update() {

    // =====================
    // POSITIONS
    // =====================

    this.largeLight.position.copy(
      this.largeSun.mesh.position
    );

    this.mediumLight.position.copy(
      this.mediumSun.mesh.position
    );

    this.smallLight.position.copy(
      this.smallSun.mesh.position
    );

    // =====================
    // LIVE CONFIG
    // =====================

    this.largeLight.color.setHex(
      MORRA_CONFIG.LIGHTS.LARGE.color
    );

    this.mediumLight.color.setHex(
      MORRA_CONFIG.LIGHTS.MEDIUM.color
    );

    this.smallLight.color.setHex(
      MORRA_CONFIG.LIGHTS.SMALL.color
    );

    this.largeLight.intensity =
      MORRA_CONFIG.LIGHTS.LARGE.intensity;

    this.mediumLight.intensity =
      MORRA_CONFIG.LIGHTS.MEDIUM.intensity;

    this.smallLight.intensity =
      MORRA_CONFIG.LIGHTS.SMALL.intensity;

    this.largeLight.distance =
      MORRA_CONFIG.LIGHTS.LARGE.distance;

    this.mediumLight.distance =
      MORRA_CONFIG.LIGHTS.MEDIUM.distance;

    this.smallLight.distance =
      MORRA_CONFIG.LIGHTS.SMALL.distance;

    // =====================
    // HELPERS
    // =====================

    const helpersVisible =
      MORRA_CONFIG.DEBUG.showLightHelpers;

    this.largeHelper.visible =
      helpersVisible;

    this.mediumHelper.visible =
      helpersVisible;

    this.smallHelper.visible =
      helpersVisible;

    this.largeHelper.update();

    this.mediumHelper.update();

    this.smallHelper.update();
  }
}