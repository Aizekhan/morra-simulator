import * as THREE from "three";

import { CelestialBody } from "../astronomy/CelestialBody";
import { CelestialSystem } from "../astronomy/CelestialSystem";
import { MorraLightSystem } from "../astronomy/MorraLightSystem";

import { OrbitRenderer } from "../render/OrbitRenderer";

import { MORRA_CONFIG } from "./MorraConfig";
import { MorraAxis } from "./MorraAxis";
import { MorraConfigSynchronizer } from "./MorraConfigSynchronizer";

export class MorraSystem {

  scene: THREE.Scene;

  morra: CelestialBody;

  axis: MorraAxis;

  moonNorth: CelestialBody;
  moonEquator: CelestialBody;

  sunLarge: CelestialBody;
  sunMedium: CelestialBody;
  sunSmall: CelestialBody;

  sunLargeOrbit: THREE.LineLoop;
  sunMediumOrbit: THREE.LineLoop;
  sunSmallOrbit: THREE.LineLoop;

  moonNorthOrbit: THREE.LineLoop;
  moonEquatorOrbit: THREE.LineLoop;

  celestialSystem: CelestialSystem;

  configSynchronizer: MorraConfigSynchronizer;

  lightSystem: MorraLightSystem;

  constructor(
    scene: THREE.Scene
  ) {

    this.scene = scene;

    this.morra =
      new CelestialBody(
        MORRA_CONFIG.MORRA_RADIUS,
        MORRA_CONFIG.MORRA_COLOR
      );

    scene.add(
      this.morra.mesh
    );

    this.morra.mesh.rotation.z =
      THREE.MathUtils.degToRad(
        MORRA_CONFIG.AXIS_TILT
      );

    this.axis =
      new MorraAxis(
        scene,
        MORRA_CONFIG.MORRA_RADIUS,
        MORRA_CONFIG.AXIS_TILT
      );

    this.moonNorth =
      new CelestialBody(
        MORRA_CONFIG.MOON_NORTH.radius,
        MORRA_CONFIG.MOON_NORTH.color,
        MORRA_CONFIG.MOON_NORTH.orbitRadius,
        MORRA_CONFIG.MOON_NORTH.orbitSpeed,
        MORRA_CONFIG.MOON_NORTH.orbitPlane
      );

    scene.add(
      this.moonNorth.mesh
    );

    this.moonEquator =
      new CelestialBody(
        MORRA_CONFIG.MOON_EQUATOR.radius,
        MORRA_CONFIG.MOON_EQUATOR.color,
        MORRA_CONFIG.MOON_EQUATOR.orbitRadius,
        MORRA_CONFIG.MOON_EQUATOR.orbitSpeed,
        MORRA_CONFIG.MOON_EQUATOR.orbitPlane
      );

    scene.add(
      this.moonEquator.mesh
    );

    this.sunLarge =
      new CelestialBody(
        MORRA_CONFIG.SUN_LARGE.radius,
        MORRA_CONFIG.LIGHTS.LARGE.color,
        MORRA_CONFIG.SUN_LARGE.orbitRadius,
        MORRA_CONFIG.SUN_LARGE.orbitSpeed,
        MORRA_CONFIG.SUN_LARGE.orbitPlane,
        0,
        MORRA_CONFIG.SUN_LARGE.orbitHeight,
        0
      );

    scene.add(
      this.sunLarge.mesh
    );

    this.sunMedium =
      new CelestialBody(
        MORRA_CONFIG.SUN_MEDIUM.radius,
        MORRA_CONFIG.LIGHTS.MEDIUM.color,
        MORRA_CONFIG.SUN_MEDIUM.orbitRadius,
        MORRA_CONFIG.SUN_MEDIUM.orbitSpeed,
        MORRA_CONFIG.SUN_MEDIUM.orbitPlane,
        0,
        MORRA_CONFIG.SUN_MEDIUM.orbitHeight,
        0
      );

    scene.add(
      this.sunMedium.mesh
    );

    this.sunSmall =
      new CelestialBody(
        MORRA_CONFIG.SUN_SMALL.radius,
        MORRA_CONFIG.LIGHTS.SMALL.color,
        MORRA_CONFIG.SUN_SMALL.orbitRadius,
        MORRA_CONFIG.SUN_SMALL.orbitSpeed,
        MORRA_CONFIG.SUN_SMALL.orbitPlane
      );

    scene.add(
      this.sunSmall.mesh
    );

    this.celestialSystem =
      new CelestialSystem();

    this.celestialSystem.add(
      this.moonNorth
    );

    this.celestialSystem.add(
      this.moonEquator
    );

    this.celestialSystem.add(
      this.sunLarge
    );

    this.celestialSystem.add(
      this.sunMedium
    );

    this.celestialSystem.add(
      this.sunSmall
    );

    this.configSynchronizer =
      new MorraConfigSynchronizer({
        moonNorth: this.moonNorth,
        moonEquator: this.moonEquator,
        sunLarge: this.sunLarge,
        sunMedium: this.sunMedium,
        sunSmall: this.sunSmall
      });

    this.lightSystem =
      new MorraLightSystem(
        scene,
        this.sunLarge,
        this.sunMedium,
        this.sunSmall
      );

    this.sunLargeOrbit =
      OrbitRenderer.createOrbit(
        MORRA_CONFIG.SUN_LARGE.orbitRadius,
        MORRA_CONFIG.LIGHTS.LARGE.color,
        MORRA_CONFIG.SUN_LARGE.orbitPlane,
        0,
        MORRA_CONFIG.SUN_LARGE.orbitHeight,
        0
      );

    this.sunMediumOrbit =
      OrbitRenderer.createOrbit(
        MORRA_CONFIG.SUN_MEDIUM.orbitRadius,
        MORRA_CONFIG.LIGHTS.MEDIUM.color,
        MORRA_CONFIG.SUN_MEDIUM.orbitPlane,
        0,
        MORRA_CONFIG.SUN_MEDIUM.orbitHeight,
        0
      );

    this.sunSmallOrbit =
      OrbitRenderer.createOrbit(
        MORRA_CONFIG.SUN_SMALL.orbitRadius,
        MORRA_CONFIG.LIGHTS.SMALL.color,
        MORRA_CONFIG.SUN_SMALL.orbitPlane
      );

    this.moonNorthOrbit =
      OrbitRenderer.createOrbit(
        MORRA_CONFIG.MOON_NORTH.orbitRadius,
        MORRA_CONFIG.MOON_NORTH.orbitColor,
        MORRA_CONFIG.MOON_NORTH.orbitPlane
      );

    this.moonEquatorOrbit =
      OrbitRenderer.createOrbit(
        MORRA_CONFIG.MOON_EQUATOR.orbitRadius,
        MORRA_CONFIG.MOON_EQUATOR.orbitColor,
        MORRA_CONFIG.MOON_EQUATOR.orbitPlane
      );

    scene.add(this.sunLargeOrbit);
    scene.add(this.sunMediumOrbit);
    scene.add(this.sunSmallOrbit);

    scene.add(this.moonNorthOrbit);
    scene.add(this.moonEquatorOrbit);

    this.setOrbitVisible(
      MORRA_CONFIG.DEBUG.showOrbits
    );
  }

  update(
    delta: number
  ) {

    const simulationDelta =
      delta *
      MORRA_CONFIG.TIME_SPEED;

    this.morra.mesh.rotation.y +=
      MORRA_CONFIG.ROTATION_SPEED *
      simulationDelta;

    this.configSynchronizer.sync();

    this.celestialSystem.update(
      simulationDelta
    );

    this.axis.axisLine.visible =
      MORRA_CONFIG.DEBUG.showAxis;

    this.axis.northPole.visible =
      MORRA_CONFIG.DEBUG.showAxis;

    this.axis.southPole.visible =
      MORRA_CONFIG.DEBUG.showAxis;

    this.axis.equator.visible =
      MORRA_CONFIG.DEBUG.showEquator;

    this.setOrbitVisible(
      MORRA_CONFIG.DEBUG.showOrbits
    );

    this.lightSystem.update();
  }

  setOrbitVisible(
    visible: boolean
  ) {

    this.sunLargeOrbit.visible =
      visible;

    this.sunMediumOrbit.visible =
      visible;

    this.sunSmallOrbit.visible =
      visible;

    this.moonNorthOrbit.visible =
      visible;

    this.moonEquatorOrbit.visible =
      visible;
  }
}
