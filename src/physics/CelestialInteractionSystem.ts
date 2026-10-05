import * as THREE from "three";

import {
  CelestialBody
} from "../astronomy/CelestialBody";

import {
  MorraEnvironmentEngine
} from "../physics/MorraEnvironmentEngine";

import {
  MORRA_CONFIG
} from "../world/MorraConfig";

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

  constructor(
    _scene: THREE.Scene,
    morra: CelestialBody,
    sources: CelestialSourceConfig[],
    moons: CelestialBody[],
    occluders: CelestialBody[]
  ) {

    this.sources =
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
    this.updateMoonReflections();
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
