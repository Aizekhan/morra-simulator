import { CelestialBody } from "../astronomy/CelestialBody";

import { MORRA_CONFIG } from "./MorraConfig";

export class MorraConfigSynchronizer {

  constructor(
    private readonly bodies: {
      moonNorth: CelestialBody;
      moonEquator: CelestialBody;
      sunLarge: CelestialBody;
      sunMedium: CelestialBody;
      sunSmall: CelestialBody;
    }
  ) {}

  sync() {

    this.syncBody(
      this.bodies.moonNorth,
      MORRA_CONFIG.MOON_NORTH
    );

    this.syncBody(
      this.bodies.moonEquator,
      MORRA_CONFIG.MOON_EQUATOR
    );

    this.syncBody(
      this.bodies.sunLarge,
      MORRA_CONFIG.SUN_LARGE
    );

    this.syncBody(
      this.bodies.sunMedium,
      MORRA_CONFIG.SUN_MEDIUM
    );

    this.syncBody(
      this.bodies.sunSmall,
      MORRA_CONFIG.SUN_SMALL
    );
  }

  private syncBody(
    body: CelestialBody,
    config: {
      radius: number;
      orbitRadius: number;
      orbitSpeed: number;
      orbitPlane: "XZ" | "YZ" | "XY";
      orbitHeight?: number;
    }
  ) {

    body.setRadius(
      config.radius
    );

    body.setOrbitRadius(
      config.orbitRadius
    );

    body.setOrbitSpeed(
      config.orbitSpeed
    );

    body.orbitPlane =
      config.orbitPlane;

    if(
      config.orbitHeight !== undefined
    ) {

      body.setOrbitHeight(
        config.orbitHeight
      );
    }
  }
}
