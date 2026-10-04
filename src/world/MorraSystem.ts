import * as THREE from "three";

import { CelestialBody } from "../astronomy/CelestialBody";
import { CelestialSystem } from "../astronomy/CelestialSystem";
import { MorraLightSystem } from "../astronomy/MorraLightSystem";
import { OrbitSystem } from "../astronomy/OrbitSystem";

import { MORRA_CONFIG } from "./MorraConfig";
import { MorraAxis } from "./MorraAxis";
import { MorraConfigSynchronizer } from "./MorraConfigSynchronizer";

import {
  MorraEnvironmentEngine
} from "../physics/MorraEnvironmentEngine";

import {
  SurfaceFieldEngine
} from "../physics/SurfaceFieldEngine";

import {
  SurfaceFieldVisualizer
} from "../render/SurfaceFieldVisualizer";

export class MorraSystem {

  scene: THREE.Scene;

  morra: CelestialBody;

  axis: MorraAxis;

  moonNorth: CelestialBody;
  moonEquator: CelestialBody;

  sunLarge: CelestialBody;
  sunMedium: CelestialBody;
  sunSmall: CelestialBody;

  celestialSystem: CelestialSystem;
  orbitSystem: OrbitSystem;

  configSynchronizer:
    MorraConfigSynchronizer;

  lightSystem:
    MorraLightSystem;

  environmentEngine:
    MorraEnvironmentEngine;

  surfaceFieldEngine:
    SurfaceFieldEngine;

  surfaceFieldVisualizer:
    SurfaceFieldVisualizer;

  constructor(
    scene: THREE.Scene
  ) {

    this.scene =
      scene;

    this.morra =
      new CelestialBody(
        MORRA_CONFIG.MORRA_RADIUS,
        MORRA_CONFIG.MORRA_COLOR
      );

    scene.add(
      this.morra.mesh
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
        MORRA_CONFIG.MOON_NORTH.orbitPlane,
        0,
        0,
        0,
        {
          orbitInclination:
            MORRA_CONFIG.MOON_NORTH.orbitInclination,
          orbitAscendingNode:
            MORRA_CONFIG.MOON_NORTH.orbitAscendingNode,
          orbitEccentricity:
            MORRA_CONFIG.MOON_NORTH.orbitEccentricity,
          orbitPlaneOffset:
            MORRA_CONFIG.MOON_NORTH.orbitPlaneOffset,
          reverseOrbit:
            MORRA_CONFIG.MOON_NORTH.reverseOrbit
        }
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
        MORRA_CONFIG.MOON_EQUATOR.orbitPlane,
        0,
        0,
        0,
        {
          orbitInclination:
            MORRA_CONFIG.MOON_EQUATOR.orbitInclination,
          orbitAscendingNode:
            MORRA_CONFIG.MOON_EQUATOR.orbitAscendingNode,
          orbitEccentricity:
            MORRA_CONFIG.MOON_EQUATOR.orbitEccentricity,
          orbitPlaneOffset:
            MORRA_CONFIG.MOON_EQUATOR.orbitPlaneOffset,
          reverseOrbit:
            MORRA_CONFIG.MOON_EQUATOR.reverseOrbit
        }
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
        0,
        0,
        {
          orbitInclination:
            MORRA_CONFIG.SUN_LARGE.orbitInclination,
          orbitAscendingNode:
            MORRA_CONFIG.SUN_LARGE.orbitAscendingNode,
          orbitEccentricity:
            MORRA_CONFIG.SUN_LARGE.orbitEccentricity,
          orbitPlaneOffset:
            MORRA_CONFIG.SUN_LARGE.orbitPlaneOffset,
          reverseOrbit:
            MORRA_CONFIG.SUN_LARGE.reverseOrbit
        }
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
        0,
        0,
        {
          orbitInclination:
            MORRA_CONFIG.SUN_MEDIUM.orbitInclination,
          orbitAscendingNode:
            MORRA_CONFIG.SUN_MEDIUM.orbitAscendingNode,
          orbitEccentricity:
            MORRA_CONFIG.SUN_MEDIUM.orbitEccentricity,
          orbitPlaneOffset:
            MORRA_CONFIG.SUN_MEDIUM.orbitPlaneOffset,
          reverseOrbit:
            MORRA_CONFIG.SUN_MEDIUM.reverseOrbit
        }
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
        MORRA_CONFIG.SUN_SMALL.orbitPlane,
        0,
        0,
        0,
        {
          orbitInclination:
            MORRA_CONFIG.SUN_SMALL.orbitInclination,
          orbitAscendingNode:
            MORRA_CONFIG.SUN_SMALL.orbitAscendingNode,
          orbitEccentricity:
            MORRA_CONFIG.SUN_SMALL.orbitEccentricity,
          orbitPlaneOffset:
            MORRA_CONFIG.SUN_SMALL.orbitPlaneOffset,
          reverseOrbit:
            MORRA_CONFIG.SUN_SMALL.reverseOrbit
        }
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

    this.orbitSystem =
      new OrbitSystem(
        scene
      );

    this.orbitSystem.add(
      this.sunLarge,
      () =>
        MORRA_CONFIG.LIGHTS.LARGE.color
    );

    this.orbitSystem.add(
      this.sunMedium,
      () =>
        MORRA_CONFIG.LIGHTS.MEDIUM.color
    );

    this.orbitSystem.add(
      this.sunSmall,
      () =>
        MORRA_CONFIG.LIGHTS.SMALL.color
    );

    this.orbitSystem.add(
      this.moonNorth,
      () =>
        MORRA_CONFIG.MOON_NORTH.orbitColor
    );

    this.orbitSystem.add(
      this.moonEquator,
      () =>
        MORRA_CONFIG.MOON_EQUATOR.orbitColor
    );

    this.configSynchronizer =
      new MorraConfigSynchronizer({
        morra: this.morra,
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

    this.environmentEngine =
      new MorraEnvironmentEngine(
        this.morra,
        [
          {
            id: "large-sun",
            body:
              this.sunLarge,
            ...MORRA_CONFIG.RADIATION_PROFILES[
              MORRA_CONFIG.SUN_LARGE.radiationRole
            ]
          },
          {
            id: "medium-sun",
            body:
              this.sunMedium,
            ...MORRA_CONFIG.RADIATION_PROFILES[
              MORRA_CONFIG.SUN_MEDIUM.radiationRole
            ]
          },
          {
            id: "small-sun",
            body:
              this.sunSmall,
            ...MORRA_CONFIG.RADIATION_PROFILES[
              MORRA_CONFIG.SUN_SMALL.radiationRole
            ]
          }
        ],
        [
          this.sunLarge,
          this.sunMedium,
          this.sunSmall,
          this.moonNorth,
          this.moonEquator
        ]
      );

    this.surfaceFieldEngine =
      new SurfaceFieldEngine(
        this.environmentEngine,
        {
          latitudeSegments:
            MORRA_CONFIG.SURFACE_FIELD.latitudeSegments,
          longitudeSegments:
            MORRA_CONFIG.SURFACE_FIELD.longitudeSegments,
          updateIntervalHours:
            MORRA_CONFIG.SURFACE_FIELD.updateIntervalHours
        }
      );

    this.surfaceFieldVisualizer =
      new SurfaceFieldVisualizer(
        this.morra.mesh
      );
  }

  update(
    absoluteHours: number
  ) {

    this.configSynchronizer.sync();

    const axisTilt =
      THREE.MathUtils.degToRad(
        MORRA_CONFIG.AXIS_TILT
      );

    this.morra.mesh.rotation.z =
      axisTilt;

    this.morra.mesh.rotation.y =
      MORRA_CONFIG.ROTATION_SPEED *
      absoluteHours;

    this.axis.update(
      this.morra.radius,
      MORRA_CONFIG.AXIS_TILT
    );

    this.celestialSystem.update(
      absoluteHours
    );

    this.orbitSystem.update();

    this.axis.axisLine.visible =
      MORRA_CONFIG.DEBUG.showAxis;

    this.axis.northPole.visible =
      MORRA_CONFIG.DEBUG.showAxis;

    this.axis.southPole.visible =
      MORRA_CONFIG.DEBUG.showAxis;

    this.axis.equator.visible =
      MORRA_CONFIG.DEBUG.showEquator;

    this.orbitSystem.setVisible(
      MORRA_CONFIG.DEBUG.showOrbits
    );

    this.lightSystem.update();

    this.surfaceFieldEngine.setConfig({
      latitudeSegments:
        MORRA_CONFIG.SURFACE_FIELD.latitudeSegments,
      longitudeSegments:
        MORRA_CONFIG.SURFACE_FIELD.longitudeSegments,
      updateIntervalHours:
        MORRA_CONFIG.SURFACE_FIELD.updateIntervalHours
    });

    const fieldMap =
      this.surfaceFieldEngine.update(
        absoluteHours
      );

    this.surfaceFieldVisualizer.setRadius(
      this.morra.radius
    );

    this.surfaceFieldVisualizer.setChannel(
      MORRA_CONFIG.SURFACE_FIELD.channel
    );

    this.surfaceFieldVisualizer.setOpacity(
      MORRA_CONFIG.SURFACE_FIELD.opacity
    );

    this.surfaceFieldVisualizer.setEnabled(
      MORRA_CONFIG.DEBUG.showSurfaceField
    );

    this.surfaceFieldVisualizer.update(
      fieldMap
    );
  }

  dispose() {

    this.orbitSystem.dispose();

    this.lightSystem.dispose();

    this.surfaceFieldVisualizer.dispose();

    this.morra.dispose();

    this.moonNorth.dispose();
    this.moonEquator.dispose();

    this.sunLarge.dispose();
    this.sunMedium.dispose();
    this.sunSmall.dispose();

    this.axis.dispose();

    this.scene.remove(
      this.morra.mesh
    );

    this.scene.remove(
      this.moonNorth.mesh
    );

    this.scene.remove(
      this.moonEquator.mesh
    );

    this.scene.remove(
      this.sunLarge.mesh
    );

    this.scene.remove(
      this.sunMedium.mesh
    );

    this.scene.remove(
      this.sunSmall.mesh
    );
  }
}
