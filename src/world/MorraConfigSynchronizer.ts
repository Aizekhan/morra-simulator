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

    body.mesh.visible =
      config.visible;

      }
}
