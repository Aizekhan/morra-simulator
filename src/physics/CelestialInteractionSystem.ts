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

  /**
   * Optional emission geometry override used by the physical
   * radiation layer. Defaults to the body's visual radius.
   */
  emissionReferenceRadius?: number;

  visible: () => boolean;
}

interface MoonTarget {

  id: string;

  body: CelestialBody;

  reflectionId: string;
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
            source.magicPower,
          emissionReferenceRadius:
            source.emissionReferenceRadius
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
          body,
          reflectionId:
            index === 0
              ? "north-moon-reflection"
              : "equator-moon-reflection"
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
              source.magicPower * runtimeScale,
            emissionReferenceRadius:
              source.emissionReferenceRadius,
            allowSecondaryReflection:
              false,
            allowIndirectReflection:
              false
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

  private getMoonPhaseFraction(
    sunPosition: THREE.Vector3,
    moonPosition: THREE.Vector3,
    observerPosition: THREE.Vector3
  ) {
    const sunDirection =
      sunPosition
        .clone()
        .sub(moonPosition)
        .normalize();

    const observerDirection =
      observerPosition
        .clone()
        .sub(moonPosition)
        .normalize();

    const phaseCosine =
      THREE.MathUtils.clamp(
        sunDirection.dot(observerDirection),
        -1,
        1
      );

    return (
      1 +
      phaseCosine
    ) *
    0.5;
  }

  private getMultiSunMoonIllumination(
    sunSources: CelestialSourceConfig[],
    moon: MoonTarget,
    observerPosition: THREE.Vector3
  ) {
    const moonPosition =
      moon.body.mesh.getWorldPosition(
        new THREE.Vector3()
      );

    let total = 0;

    for(const sun of sunSources) {
      const runtimeScale =
        this.getRuntimeRadiationScale(
          sun.id
        );

      if(!sun.body.mesh.visible) {
        continue;
      }

      const sunPosition =
        sun.body.mesh.getWorldPosition(
          new THREE.Vector3()
        );

      const distance =
        Math.max(
          moonPosition.distanceTo(
            sunPosition
          ),
          1
        );

      const visibility =
        this.radiation.getVisibilityFactor(
          moonPosition,
          {
            id: sun.id,
            body: sun.body,
            lightPower: sun.lightPower * runtimeScale,
            heatPower: 0,
            magicPower: 0,
            allowSecondaryReflection: false,
            allowIndirectReflection: false
          },
          [
            ...this.getSourceBodies(),
            ...this.getMoonBodies()
          ].filter(
            body => body !== moon.body
          )
        );

      const irradiance =
        sun.lightPower *
        runtimeScale *
        (moon.body.radius * moon.body.radius) /
        (distance * distance) *
        visibility;

      const visiblePhase =
        this.getMoonPhaseFraction(
          sunPosition,
          moonPosition,
          observerPosition
        );

      total +=
        irradiance *
        MORRA_CONFIG.MOON_REFLECTION.albedo *
        visiblePhase;
    }

    return total;
  }

  private updateMoonReflections() {
    if(!MORRA_CONFIG.MOON_REFLECTION.enabled) {
      for(const moon of this.moonTargets) {
        this.radiation.removeDynamicSource(
          moon.reflectionId
        );
      }
      return;
    }

    const sunSources =
      this.sourceConfigs.filter(
        source =>
          source.id === "large-sun" ||
          source.id === "medium-sun" ||
          source.id === "small-sun"
      );

    const observerPosition =
      this.environment.morra.mesh.getWorldPosition(
        new THREE.Vector3()
      );

    for(const moon of this.moonTargets) {
      // The moon's apparent brightness is the sum of the contributions from
      // every visible sun. Each sun gets its own source distance, shadowing
      // and phase relative to Morra; the result is then treated as one
      // reflected radiation source for Morra.
      const reflectedPower =
        this.getMultiSunMoonIllumination(
          sunSources,
          moon,
          observerPosition
        ) *
        MORRA_CONFIG.MOON_REFLECTION.intensityScale;

      if(reflectedPower <= 0) {
        this.radiation.removeDynamicSource(
          moon.reflectionId
        );
        continue;
      }

      const boundedPower =
        THREE.MathUtils.clamp(
          reflectedPower,
          0,
          MORRA_CONFIG.MOON_REFLECTION.maxIntensity
        );

      this.radiation.addDynamicSource({
        id:
          moon.reflectionId,
        body:
          moon.body,
        lightPower:
          boundedPower,
        heatPower:
          0,
        magicPower:
          0,
        allowIndirectReflection:
          false
      });
    }
  }

  dispose() {
    // Radiation sources are owned by the physics engine.
  }
}
