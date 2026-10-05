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

    for(
      const moon of this.moonTargets
    ) {

      const sourceId =
        moon.id === "moon-1"
          ? "north-moon-reflection"
          : "equator-moon-reflection";

      const enabled =
        MORRA_CONFIG.MOON_REFLECTION.enabled &&
        moon.body.mesh.visible;

      if(!enabled) {
        this.radiation.removeDynamicSource(sourceId);
        continue;
      }

      const moonPosition =
        moon.body.mesh.getWorldPosition(
          new THREE.Vector3()
        );

      const morraPosition =
        this.environment.morra.mesh.getWorldPosition(
          new THREE.Vector3()
        );

      const moonToMorra =
        morraPosition.sub(moonPosition);

      const moonMorraDistance =
        Math.max(moonToMorra.length(), 0.001);

      const moonToMorraDirection =
        moonToMorra.normalize();

      let totalIntensity = 0;

      for(
        const source of this.sources
      ) {

        if(!source.visible()) {
          continue;
        }

        const sourcePosition =
          source.body.mesh.getWorldPosition(
            new THREE.Vector3()
          );

        const moonToSource =
          sourcePosition.sub(moonPosition);

        const sourceDistance =
          Math.max(moonToSource.length(), 0.001);

        const sourceDirection =
          moonToSource.normalize();

        const sourceVisibility =
          this.radiation.getVisibilityDetails(
            moonPosition,
            {
              id: source.id,
              body: source.body,
              lightPower: source.lightPower,
              heatPower: source.heatPower,
              magicPower: source.magicPower
            },
            this.environment.getOccluders()
          );

        const incomingIrradiance =
          source.lightPower /
          (sourceDistance * sourceDistance) *
          sourceVisibility.factor;

        const facing =
          Math.max(
            0,
            sourceDirection.dot(
              moonToMorraDirection.clone().negate()
            )
          );

        const phaseAngle =
          Math.acos(
            THREE.MathUtils.clamp(
              -sourceDirection.dot(
                moonToMorraDirection
              ),
              -1,
              1
            )
          );

        const phase =
          (
            Math.sin(phaseAngle) +
            (Math.PI - phaseAngle) *
            Math.cos(phaseAngle)
          ) /
          Math.PI;

        const reflected =
          incomingIrradiance *
          facing *
          moon.body.radius *
          moon.body.radius *
          MORRA_CONFIG.MOON_REFLECTION.albedo *
          phase /
          (moonMorraDistance * moonMorraDistance) *
          MORRA_CONFIG.MOON_REFLECTION.intensityScale;

        totalIntensity += reflected;
      }

      const reflectedLightPower =
        THREE.MathUtils.clamp(
          totalIntensity,
          0,
          MORRA_CONFIG.MOON_REFLECTION.maxIntensity
        );

      this.radiation.addDynamicSource({
        id: sourceId,
        body: moon.body,
        lightPower: reflectedLightPower,
        heatPower: 0,
        magicPower: 0
      });
    }
  }


    for(
      const moon of this.moonTargets
    ) {

      const sourceId =
        moon.id === "moon-1"
          ? "north-moon-reflection"
          : "equator-moon-reflection";

      const enabled =
        MORRA_CONFIG.MOON_REFLECTION.enabled &&
        moon.body.mesh.visible;

      if(
        !enabled
      ) {

        this.radiation.removeDynamicSource(
          sourceId
        );

        continue;
      }

      const moonPosition =
        moon.body.mesh.getWorldPosition(
          new THREE.Vector3()
        );

      const morraPosition =
        this.environment.morra.mesh.getWorldPosition(
          new THREE.Vector3()
        );

      const moonToMorra =
        morraPosition.sub(
          moonPosition
        );

      const moonMorraDistance =
        Math.max(
          moonToMorra.length(),
          0.001
        );

      const moonToMorraDirection =
        moonToMorra.normalize();

      let totalIntensity = 0;

      for(
        const source of this.sources
      ) {

        if(
          !source.visible()
        ) {
          continue;
        }

        const sourcePosition =
          source.body.mesh.getWorldPosition(
            new THREE.Vector3()
          );

        const moonToSource =
          sourcePosition.sub(
            moonPosition
          );

        const sourceDistance =
          Math.max(
            moonToSource.length(),
            0.001
          );

        moonToSource.normalize();

        const visibility =
          this.radiation.getVisibilityDetails(
            moonPosition,
            {
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
            },
            this.environment.getOccluders()
          );

        const sourceIrradiance =
          source.lightPower /
          (
            sourceDistance *
            sourceDistance
          ) *
          visibility.factor;

        const phaseAngle =
          Math.acos(
            THREE.MathUtils.clamp(
              -moonToSource.dot(
                moonToMorraDirection
              ),
              -1,
              1
            )
          );

        const phase =
          (
            Math.sin(phaseAngle) +
            (
              Math.PI -
              phaseAngle
            ) *
            Math.cos(phaseAngle)
          ) /
          Math.PI;

        totalIntensity +=
          sourceIrradiance *
          moon.body.radius *
          moon.body.radius *
          MORRA_CONFIG.MOON_REFLECTION.albedo *
          phase /
          (
            moonMorraDistance *
            moonMorraDistance
          ) *
          MORRA_CONFIG.MOON_REFLECTION.intensityScale;
      }

      const reflectedLightPower =
        THREE.MathUtils.clamp(
          totalIntensity,
          0,
          MORRA_CONFIG.MOON_REFLECTION.maxIntensity
        );

      this.radiation.addDynamicSource({
        id:
          sourceId,
        body:
          moon.body,
        lightPower:
          reflectedLightPower,
        heatPower:
          0,
        magicPower:
          0
      });
    }
  }

  dispose() {
    // Radiation sources are owned by the physics engine.
  }
}
