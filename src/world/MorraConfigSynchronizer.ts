import { CelestialBody } from "../astronomy/CelestialBody";

import {
  OrbitMath
} from "../astronomy/OrbitMath";

import {
  MORRA_CONFIG
} from "./MorraConfig";

export class MorraConfigSynchronizer {

  private readonly bodies: {
    morra: CelestialBody;
    moonNorth: CelestialBody;
    moonEquator: CelestialBody;
    sunLarge: CelestialBody;
    sunMedium: CelestialBody;
    sunSmall: CelestialBody;
  };

  constructor(
    bodies: {
      morra: CelestialBody;
      moonNorth: CelestialBody;
      moonEquator: CelestialBody;
      sunLarge: CelestialBody;
      sunMedium: CelestialBody;
      sunSmall: CelestialBody;
    }
  ) {
    this.bodies = bodies;
  }

  sync() {

    // Visibility is a live render-state switch. Keep all celestial meshes
    // synchronized directly from their GUI/config flags every simulation tick.
    this.bodies.sunLarge.mesh.visible =
      MORRA_CONFIG.SUN_LARGE.visible;

    this.bodies.sunMedium.mesh.visible =
      MORRA_CONFIG.SUN_MEDIUM.visible;

    this.bodies.sunSmall.mesh.visible =
      MORRA_CONFIG.SUN_SMALL.visible;

    this.bodies.moonNorth.mesh.visible =
      MORRA_CONFIG.MOON_NORTH.visible;

    this.bodies.moonEquator.mesh.visible =
      MORRA_CONFIG.MOON_EQUATOR.visible;

    const morraRadius =
      Math.max(
        0.1,
        MORRA_CONFIG.MORRA_RADIUS
      );

    this.bodies.morra.setRadius(
      morraRadius
    );

    this.bodies.morra.setColor(
      MORRA_CONFIG.MORRA_COLOR
    );

    this.bodies.morra.setSelfIllumination(
      MORRA_CONFIG.MORRA_BASE_EMISSIVE
    );

    this.bodies.morra.mesh.layers.set(
      0
    );

    this.bodies.morra.mesh.visible =
      MORRA_CONFIG.MORRA_VISIBLE;

    this.bodies.moonNorth.setColor(
      MORRA_CONFIG.MOON_NORTH.color
    );

    this.bodies.moonEquator.setColor(
      MORRA_CONFIG.MOON_EQUATOR.color
    );

    this.bodies.sunLarge.setColor(
      MORRA_CONFIG.LIGHTS.LARGE.color
    );

    this.bodies.sunMedium.setColor(
      MORRA_CONFIG.LIGHTS.MEDIUM.color
    );

    this.bodies.sunSmall.setColor(
      MORRA_CONFIG.LIGHTS.SMALL.color
    );

    this.bodies.sunLarge.setSelfIllumination(1.8);
    this.bodies.sunMedium.setSelfIllumination(1.8);
    this.bodies.sunSmall.setSelfIllumination(1.8);

    this.bodies.moonNorth.setSelfIllumination(0.35);
    this.bodies.moonEquator.setSelfIllumination(0.35);

    this.syncBody(
      this.bodies.moonNorth,
      MORRA_CONFIG.MOON_NORTH,
      morraRadius + MORRA_CONFIG.MOON_NORTH.radius + 10
    );

    this.syncBody(
      this.bodies.moonEquator,
      MORRA_CONFIG.MOON_EQUATOR,
      morraRadius + MORRA_CONFIG.MOON_EQUATOR.radius + 10
    );

    this.syncBody(
      this.bodies.sunLarge,
      MORRA_CONFIG.SUN_LARGE,
      morraRadius + MORRA_CONFIG.SUN_LARGE.radius + 100
    );

    this.syncBody(
      this.bodies.sunMedium,
      MORRA_CONFIG.SUN_MEDIUM,
      morraRadius + MORRA_CONFIG.SUN_MEDIUM.radius + 100
    );

    this.syncBody(
      this.bodies.sunSmall,
      MORRA_CONFIG.SUN_SMALL,
      morraRadius + MORRA_CONFIG.SUN_SMALL.radius + 100
    );
  }

  private syncBody(
    body: CelestialBody,
    config: {
      radius: number;
      orbitRadius: number;
      orbitSpeed: number;
      orbitPlane: "XZ" | "YZ" | "XY";
      orbitInclination: number;
      orbitAscendingNode: number;
      orbitEccentricity: number;
      orbitPlaneOffset: number;
      reverseOrbit: boolean;
      visible: boolean;
    },
    minimumOrbitRadius: number
  ) {

    body.setRadius(
      config.radius
    );

    const effectiveOrbitRadius =
      Math.max(
        config.orbitRadius,
        minimumOrbitRadius
      );

    config.orbitRadius =
      effectiveOrbitRadius;

    body.setOrbitRadius(
      effectiveOrbitRadius
    );

    body.setOrbitSpeed(
      config.orbitSpeed
    );

    body.setOrbitPlane(
      config.orbitPlane
    );

    body.setOrbitInclination(
      config.orbitInclination
    );

    body.setOrbitAscendingNode(
      config.orbitAscendingNode
    );

    const maxEccentricity =
      OrbitMath.getMaxEccentricity(
        effectiveOrbitRadius,
        minimumOrbitRadius
      );

    config.orbitEccentricity =
      Math.min(
        config.orbitEccentricity,
        maxEccentricity
      );

    body.setOrbitEccentricity(
      config.orbitEccentricity
    );

    body.setOrbitPlaneOffset(
      config.orbitPlaneOffset
    );

    body.setReverseOrbit(
      config.reverseOrbit
    );

    body.mesh.layers.set(
      0
    );

    body.mesh.visible =
      config.visible;
  }
}
