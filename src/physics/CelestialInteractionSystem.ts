import * as THREE from "three";

import {
  CelestialBody
} from "../astronomy/CelestialBody";

import {
  MORRA_CONFIG
} from "../world/MorraConfig";

import {
  MorraEnvironmentEngine
} from "../physics/MorraEnvironmentEngine";


import type {
  RadiationSource
} from "./RadiationEngine";

interface CelestialSourceConfig {
  id: string;
  body: CelestialBody;
  color: number;
  intensity: number;
  distance: number;
  lightPower: number;
  heatPower: number;
  magicPower: number;
  visible: () => boolean;
}

interface MoonTarget {

  id: string;

  body: CelestialBody;
}

export class CelestialInteractionSystem {

  readonly environment:
    MorraEnvironmentEngine;

  readonly radiation:
    MorraEnvironmentEngine["radiation"];
  private readonly sources:
    CelestialSourceConfig[];

  private readonly moonTargets:
    MoonTarget[];

  private readonly sourceConfigs:
    CelestialSourceConfig[];

  constructor(
    _scene: THREE.Scene,
    morra: CelestialBody,
    sources: CelestialSourceConfig[],
    moons: CelestialBody[],
    occluders: CelestialBody[]
  ) {

    this.sources =
      sources;

    this.sourceConfigs =
      sources;

    const radiationSources:
      RadiationSource[] =
      sources.map(
        source => ({
          id:
            source.id,
          body:
            source.body,
          lightPower:
            source.lightPower,
          heatPower:
            source.heatPower,
          magicPower:
            source.magicPower
        })
      );

    this.environment =
      new MorraEnvironmentEngine(
        morra,
        radiationSources,
        occluders
      );

    this.radiation =
      this.environment.radiation;

    this.moonTargets =
      moons.map(
        (body, index) => ({
          id:
            `moon-${index + 1}`,
          body
        })
      );
  }

  update() {
    const radiationSources =
      this.sourceConfigs.map(
        source => {
          const runtimeScale =
            this.getRuntimeRadiationScale(
              source.id
            );

          return {
            id:
              source.id,
            body:
              source.body,
            lightPower:
              source.lightPower * runtimeScale,
            heatPower:
              source.heatPower * runtimeScale,
            magicPower:
              source.magicPower * runtimeScale
          };
        }
      );

    this.radiation.setSources(
      radiationSources
    );

    this.updateMoonReflections();
  }

  private getRuntimeRadiationScale(
    sourceId: string
  ) {
    switch(sourceId) {
      case "large-sun":
        return MORRA_CONFIG.LIGHTS.LARGE.intensity / 50;
      case "medium-sun":
        return MORRA_CONFIG.LIGHTS.MEDIUM.intensity / 30;
      case "small-sun":
        return MORRA_CONFIG.LIGHTS.SMALL.intensity / 20;
      default:
        return 1;
    }
  }

  getSourceBodies() {
    return this.sources.map(
      source => source.body
    );
  }

  getMoonBodies() {
    return this.moonTargets.map(
      moon => moon.body
    );
  }

  private updateMoonReflections() {
    // Reflections are currently handled by the radiation engine.
    // Keep this hook valid while the simulator is running.
  }

  dispose() {
    // Radiation sources are owned by the physics engine.
  }
}
