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

import {
  RENDER_LAYERS
} from "../render/RenderLayers";

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

  reflectedLight: THREE.PointLight;
}

export class CelestialInteractionSystem {

  readonly environment:
    MorraEnvironmentEngine;

  readonly radiation:
    MorraEnvironmentEngine["radiation"];

  private readonly scene:
    THREE.Scene;

  private readonly sources:
    CelestialSourceConfig[];

  private readonly moonTargets:
    MoonTarget[];

  private readonly sourceLights:
    THREE.PointLight[] = [];

  private frameCounter =
    0;

  private readonly shadowUpdateEveryFrames =
    3;

  constructor(
    scene: THREE.Scene,
    morra: CelestialBody,
    sources: CelestialSourceConfig[],
    moons: CelestialBody[],
    occluders: CelestialBody[]
  ) {

    this.scene =
      scene;

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

    for(
      const source
      of this.sources
    ) {

      const light =
        new THREE.PointLight(
          source.color,
          source.intensity,
          source.distance
        );

      light.castShadow =
        true;

      light.layers.set(
        RENDER_LAYERS.MORRA_LIGHT_RECEIVER
      );

      light.layers.enable(
        RENDER_LAYERS.MOON_LIGHT_RECEIVER
      );

      this.configureShadow(
        light
      );

      this.sourceLights.push(
        light
      );

      this.scene.add(
        light
      );
    }

    this.moonTargets =
      moons.map(
        (body, index) => {

          body.mesh.layers.set(
            RENDER_LAYERS.MOON_LIGHT_RECEIVER
          );

          const reflectedLight =
            new THREE.PointLight(
              0xffffff,
              0,
              10000,
              2
            );

          reflectedLight.layers.set(
            RENDER_LAYERS.MORRA_LIGHT_RECEIVER
          );

          reflectedLight.castShadow =
            true;

          this.configureMoonReflectionShadow(
            reflectedLight
          );

          this.scene.add(
            reflectedLight
          );

          return {
            id:
              `moon-${index + 1}`,

            body,

            reflectedLight
          };
        }
      );
  }

  update() {

    this.frameCounter++;

    this.updateDirectLights();

    if(
      this.frameCounter %
      this.shadowUpdateEveryFrames ===
      0
    ) {
      for(
        const light
        of this.sourceLights
      ) {
        light.shadow.needsUpdate =
          true;
      }
    }

    this.updateMoonReflections();
  }

  getSourceBodies() {

    return this.sources.map(
      source =>
        source.body
    );
  }

  getMoonBodies() {

    return this.moonTargets.map(
      moon =>
        moon.body
    );
  }

  private updateDirectLights() {

    for(
      let index = 0;
      index < this.sources.length;
      index++
    ) {

      const source =
        this.sources[index];

      const light =
        this.sourceLights[index];

      const position =
        source.body.mesh
          .getWorldPosition(
            new THREE.Vector3()
          );

      light.position.copy(
        position
      );

      light.color.setHex(
        source.color
      );

      light.intensity =
        source.intensity;

      light.distance =
        source.distance;

      light.visible =
        source.visible();

      this.updateShadowRange(
        light,
        source.distance
      );
    }
  }

  private updateMoonReflections() {

    for(
      const moon
      of this.moonTargets
    ) {

      const reflectedLight =
        moon.reflectedLight;

      const enabled =
        MORRA_CONFIG.MOON_REFLECTION.enabled &&
        moon.body.mesh.visible;

      reflectedLight.visible =
        enabled;

      if(
        !enabled
      ) {

        reflectedLight.intensity =
          0;

        continue;
      }

      const moonPosition =
        moon.body.mesh
          .getWorldPosition(
            new THREE.Vector3()
          );

      reflectedLight.position.copy(
        moonPosition
      );

      const morraPosition =
        this.environment.morra.mesh
          .getWorldPosition(
            new THREE.Vector3()
          );

      const moonToMorra =
        morraPosition
          .sub(
            moonPosition
          );

      const moonMorraDistance =
        Math.max(
          moonToMorra.length(),
          0.001
        );

      const moonToMorraDirection =
        moonToMorra
          .normalize();

      let totalIntensity =
        0;

      const reflectedColor =
        new THREE.Color(
          0x000000
        );

      let colorWeight =
        0;

      for(
        const source
        of this.sources
      ) {

        if(
          !source.visible()
        ) {
          continue;
        }

        const sourcePosition =
          source.body.mesh
            .getWorldPosition(
              new THREE.Vector3()
            );

        const moonToSource =
          sourcePosition
            .sub(
              moonPosition
            );

        const sourceDistance =
          Math.max(
            moonToSource.length(),
            0.001
          );

        moonToSource.normalize();

        const visibility =
          this.radiation
            .getVisibilityDetails(
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
            Math.sin(
              phaseAngle
            ) +
            (
              Math.PI -
              phaseAngle
            ) *
            Math.cos(
              phaseAngle
            )
          ) /
          Math.PI;

        const reflected =
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

        totalIntensity +=
          reflected;

        reflectedColor.add(
          new THREE.Color(
            source.color
          ).multiplyScalar(
            reflected
          )
        );

        colorWeight +=
          reflected;
      }

      reflectedLight.intensity =
        THREE.MathUtils.clamp(
          totalIntensity,
          0,
          MORRA_CONFIG.MOON_REFLECTION.maxIntensity
        );

      if(
        colorWeight >
        0
      ) {

        reflectedColor.multiplyScalar(
          1 /
          colorWeight
        );

        reflectedLight.color.copy(
          reflectedColor
        );
      }
      else {

        reflectedLight.color.setHex(
          0x111111
        );
      }
    }
  }

  private configureShadow(
    light: THREE.PointLight
  ) {

    light.shadow.mapSize.set(
      512,
      512
    );

    light.shadow.bias =
      -0.0002;

    light.shadow.normalBias =
      0.35;

    light.shadow.radius =
      2;

    light.shadow.camera.near =
      1;

    light.shadow.camera.far =
      10000;

    light.shadow.camera.layers.set(
      RENDER_LAYERS.MORRA_LIGHT_RECEIVER
    );

    light.shadow.camera.layers.enable(
      RENDER_LAYERS.MOON_LIGHT_RECEIVER
    );

    light.shadow.autoUpdate =
      false;
  }

  private configureMoonReflectionShadow(
    light: THREE.PointLight
  ) {

    light.shadow.mapSize.set(
      512,
      512
    );

    light.shadow.bias =
      -0.0002;

    light.shadow.normalBias =
      0.2;

    light.shadow.radius =
      1.5;

    light.shadow.camera.near =
      1;

    light.shadow.camera.far =
      10000;

    light.shadow.camera.layers.set(
      RENDER_LAYERS.MORRA_LIGHT_RECEIVER
    );

    light.shadow.camera.layers.enable(
      RENDER_LAYERS.MOON_LIGHT_RECEIVER
    );

    light.shadow.autoUpdate =
      false;
  }

  private updateShadowRange(
    light: THREE.PointLight,
    range: number
  ) {

    light.shadow.camera.far =
      Math.max(
        10000,
        range
      );
  }

  dispose() {

    for(
      const light
      of this.sourceLights
    ) {

      this.scene.remove(
        light
      );
    }

    for(
      const moon
      of this.moonTargets
    ) {

      moon.reflectedLight.dispose();

      this.scene.remove(
        moon.reflectedLight
      );
    }
  }
}
