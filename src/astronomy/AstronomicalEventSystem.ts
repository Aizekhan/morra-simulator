import {
  CelestialBody
} from "./CelestialBody";

export interface AstronomicalEventState {

  solarEclipses: string[];

  lunarEclipses: string[];
}

export class AstronomicalEventSystem {

  private readonly morra: CelestialBody;

  private readonly suns: CelestialBody[];

  private readonly moons: CelestialBody[];

  constructor(
    morra: CelestialBody,
    suns: CelestialBody[],
    moons: CelestialBody[]
  ) {

    this.morra = morra;
    this.suns = suns;
    this.moons = moons;
  }

  evaluate():
    AstronomicalEventState {

    const solarEclipses:
      string[] = [];

    const lunarEclipses:
      string[] = [];

    for(
      let sunIndex = 0;
      sunIndex < this.suns.length;
      sunIndex++
    ) {

      const sun =
        this.suns[sunIndex];

      for(
        let moonIndex = 0;
        moonIndex < this.moons.length;
        moonIndex++
      ) {

        const moon =
          this.moons[moonIndex];

        if(
          this.isSolarEclipse(
            sun,
            moon
          )
        ) {

          solarEclipses.push(
            `Sun ${sunIndex + 1} / Moon ${moonIndex + 1}`
          );
        }

        if(
          this.isLunarEclipse(
            sun,
            moon
          )
        ) {

          lunarEclipses.push(
            `Sun ${sunIndex + 1} / Moon ${moonIndex + 1}`
          );
        }
      }
    }

    return {
      solarEclipses,
      lunarEclipses
    };
  }

  private isSolarEclipse(
    sun: CelestialBody,
    moon: CelestialBody
  ) {

    const sunDistance =
      sun.mesh.position.length();

    const moonDistance =
      moon.mesh.position.length();

    if(
      moonDistance >=
      sunDistance
    ) {
      return false;
    }

    const sunDirection =
      sun.mesh.position.clone()
        .normalize();

    const moonDirection =
      moon.mesh.position.clone()
        .normalize();

    const alignment =
      sunDirection.dot(
        moonDirection
      );

    const angularRadiusSun =
      Math.atan2(
        sun.radius,
        sunDistance
      );

    const angularRadiusMoon =
      Math.atan2(
        moon.radius,
        moonDistance
      );

    const allowedAngle =
      angularRadiusMoon +
      angularRadiusSun;

    return (
      alignment >
      Math.cos(
        allowedAngle
      )
    ) &&
    angularRadiusMoon >=
      angularRadiusSun * 0.5;
  }

  private isLunarEclipse(
    sun: CelestialBody,
    moon: CelestialBody
  ) {

    const sunDistance =
      sun.mesh.position.length();

    const moonDistance =
      moon.mesh.position.length();

    const sunDirection =
      sun.mesh.position.clone()
        .normalize();

    const moonDirection =
      moon.mesh.position.clone()
        .normalize();

    const antiAlignment =
      -sunDirection.dot(
        moonDirection
      );

    const umbraAngle =
      Math.atan2(
        this.morra.radius,
        moonDistance
      );

    const allowedAngle =
      umbraAngle +
      Math.atan2(
        this.morra.radius,
        sunDistance
      );

    return (
      antiAlignment >
      Math.cos(
        allowedAngle
      )
    );
  }
}
