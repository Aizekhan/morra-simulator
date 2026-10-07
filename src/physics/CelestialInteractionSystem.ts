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

  private getMoonSurfaceIllumination(
    sunSources: CelestialSourceConfig[],
    moon: MoonTarget
  ) {
    const moonPosition =
      moon.body.mesh.getWorldPosition(
        new THREE.Vector3()
      );

    const observerPosition =
      this.environment.morra.mesh.getWorldPosition(
        new THREE.Vector3()
      );

    const observerDirection =
      observerPosition
        .clone()
        .sub(moonPosition)
        .normalize();

    const occluders = [
      ...this.getSourceBodies(),
      ...this.getMoonBodies()
    ].filter(
      body => body !== moon.body
    );

    // Integrate only the hemisphere actually visible from Morra.
    // Every sun contributes independently at every visible surface point.
    // This makes multi-sun phases an emergent result of geometry instead
    // of a single scalar phase multiplier.
    const samples = 64;
    let reflectedVisibleSum = 0;
    let visibleWeightSum = 0;

    for(let i = 0; i < samples; i++) {
      const phi =
        Math.acos(
          THREE.MathUtils.clamp(
            1 - 2 * ((i + 0.5) / samples),
            -1,
            1
          )
        );

      const theta =
        Math.PI *
        (3 - Math.sqrt(5)) *
        i;

      const normal =
        new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta),
          Math.cos(phi),
          Math.sin(phi) * Math.sin(theta)
        );

      const visibleCosine =
        Math.max(
          0,
          normal.dot(observerDirection)
        );

      if(visibleCosine <= 0) {
        continue;
      }

      const samplePoint =
        moonPosition
          .clone()
          .addScaledVector(
            normal,
            moon.body.radius
          );

      let incomingIrradiance = 0;

      for(const sun of sunSources) {
        if(
          !sun.body.mesh.visible ||
          !sun.visible()
        ) {
          continue;
        }

        const runtimeScale =
          this.getRuntimeRadiationScale(
            sun.id
          );

        const sunPosition =
          sun.body.mesh.getWorldPosition(
            new THREE.Vector3()
          );

        const toSun =
          sunPosition
            .clone()
            .sub(samplePoint);

        const distance =
          Math.max(
            toSun.length(),
            1
          );

        const direction =
          toSun
            .clone()
            .divideScalar(distance);

        const receiveCosine =
          Math.max(
            0,
            normal.dot(direction)
          );

        if(receiveCosine <= 0) {
          continue;
        }

        const visibility =
          this.radiation.getVisibilityFactor(
            samplePoint,
            {
              id: sun.id,
              body: sun.body,
              lightPower:
                sun.lightPower * runtimeScale,
              heatPower: 0,
              magicPower: 0,
              emissionReferenceRadius:
                sun.emissionReferenceRadius,
              allowSecondaryReflection: false,
              allowIndirectReflection: false
            },
            occluders
          );

        if(visibility <= 0) {
          continue;
        }

        const emissionRadius =
          sun.emissionReferenceRadius ??
          sun.body.radius;

        const emissionAreaScale =
          emissionRadius *
          emissionRadius;

        const irradiance =
          sun.lightPower *
          runtimeScale *
          emissionAreaScale /
          Math.max(
            distance * distance,
            1
          ) *
          receiveCosine *
          visibility;

        incomingIrradiance +=
          irradiance;
      }

      // Lambertian reflection into the Morra-visible hemisphere.
      reflectedVisibleSum +=
        incomingIrradiance *
        MORRA_CONFIG.MOON_REFLECTION.albedo *
        visibleCosine;

      visibleWeightSum +=
        visibleCosine;
    }

    if(visibleWeightSum <= 0) {
      return 0;
    }

    return reflectedVisibleSum /
      visibleWeightSum;
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

    for(const moon of this.moonTargets) {
      // Sample the moon's full visible surface. Each surface point receives
      // the sum of all visible suns, with its own normal, distance and
      // eclipse/visibility factor. The integrated reflected response becomes
      // the moon's apparent brightness to Morra.
      const reflectedPower =
        this.getMoonSurfaceIllumination(
          sunSources,
          moon
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
