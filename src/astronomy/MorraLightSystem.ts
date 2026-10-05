import * as THREE from "three";

import { CelestialBody } from "./CelestialBody";

import { MORRA_CONFIG } from "../world/MorraConfig";

import {
  RENDER_LAYERS
} from "../render/RenderLayers";

export class MorraLightSystem {

  largeLight: THREE.PointLight;
  mediumLight: THREE.PointLight;
  smallLight: THREE.PointLight;

  largeSun: CelestialBody;
  mediumSun: CelestialBody;
  smallSun: CelestialBody;

  scene:
    THREE.Scene;

  largeHelper: THREE.PointLightHelper;
  mediumHelper: THREE.PointLightHelper;
  smallHelper: THREE.PointLightHelper;

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

    // Legacy render lights remain disabled. Physical surface illumination is
    // derived from celestial radiation, not from Three.js point lights.
  }

  update() {

    this.largeLight.position.copy(
      this.largeSun.mesh.position
    );

    this.mediumLight.position.copy(
      this.mediumSun.mesh.position
    );

    this.smallLight.position.copy(
      this.smallSun.mesh.position
    );

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

    this.largeLight.visible =
      MORRA_CONFIG.SUN_LARGE.visible;

    this.mediumLight.distance =
      MORRA_CONFIG.LIGHTS.MEDIUM.distance;

    this.mediumLight.visible =
      MORRA_CONFIG.SUN_MEDIUM.visible;

    this.smallLight.distance =
      MORRA_CONFIG.LIGHTS.SMALL.distance;

    this.smallLight.visible =
      MORRA_CONFIG.SUN_SMALL.visible;

    const helpersVisible =
      MORRA_CONFIG.DEBUG.showLightHelpers;

    this.largeHelper.visible =
      helpersVisible &&
      MORRA_CONFIG.SUN_LARGE.visible;

    this.mediumHelper.visible =
      helpersVisible &&
      MORRA_CONFIG.SUN_MEDIUM.visible;

    this.smallHelper.visible =
      helpersVisible &&
      MORRA_CONFIG.SUN_SMALL.visible;

    this.largeHelper.update();
    this.mediumHelper.update();
    this.smallHelper.update();
  }

  private configureShadow(
    light: THREE.PointLight
  ) {

    light.shadow.mapSize.set(
      2048,
      2048
    );

    light.shadow.bias =
      -0.0002;

    light.shadow.normalBias =
      0.35;

    light.shadow.radius =
      2;

    light.shadow.camera.near =
      1;

    light.shadow.camera.far =
      Math.max(
        10000,
        light.distance ||
        10000
      );

    light.shadow.camera.layers.enable(
      0
    );

    light.shadow.camera.layers.enable(
      RENDER_LAYERS.MORRA_LIGHT_RECEIVER
    );

    light.shadow.camera.layers.enable(
      RENDER_LAYERS.MOON_LIGHT_RECEIVER
    );

    light.shadow.autoUpdate =
      true;
  }

  dispose() {

    this.largeHelper.dispose();
    this.mediumHelper.dispose();
    this.smallHelper.dispose();

    this.scene.remove(
      this.largeLight
    );

    this.scene.remove(
      this.mediumLight
    );

    this.scene.remove(
      this.smallLight
    );
  }
}
