import * as THREE from "three";

import {
  CelestialBody
} from "./CelestialBody";

import {
  MorraEnvironmentEngine
} from "../physics/MorraEnvironmentEngine";

import {
  MORRA_CONFIG
} from "../world/MorraConfig";

import {
  RENDER_LAYERS
} from "../render/RenderLayers";

interface MoonReflectionTarget {

  id: string;

  body: CelestialBody;

  light: THREE.PointLight;
}

interface SourceDefinition {

  body: CelestialBody;

  color: number;

  intensity: number;

}

export class MoonReflectionLightSystem {

  private readonly scene:
    THREE.Scene;

  private readonly engine:
    MorraEnvironmentEngine;

  private readonly moons:
    MoonReflectionTarget[];

  private readonly sources:
    SourceDefinition[];

  constructor(
    scene:
      THREE.Scene,
    engine:
      MorraEnvironmentEngine,
    moonNorth:
      CelestialBody,
    moonEquator:
      CelestialBody,
    sources:
      SourceDefinition[]
  ) {

    this.scene =
      scene;

    this.engine =
      engine;

    this.sources =
      sources;

    this.moons = [
      this.createTarget(
        "north-moon",
        moonNorth
      ),
      this.createTarget(
        "equator-moon",
        moonEquator
      )
    ];
  }

  private createTarget(
    id: string,
    body: CelestialBody
  ) {

    const light =
      new THREE.PointLight(
        0xffffff,
        0,
        10000,
        2
      );

    light.layers.set(
      RENDER_LAYERS.MORRA_LIGHT_RECEIVER
    );

    light.castShadow =
      false;

    this.scene.add(
      light
    );

    return {
      id,
      body,
      light
    };
  }

  update() {

    const enabled =
      MORRA_CONFIG.MOON_REFLECTION.enabled;

    for(
      const moon
      of this.moons
    ) {

      moon.light.visible =
        enabled &&
        moon.body.mesh.visible;

      if(
        !moon.light.visible
      ) {

        moon.light.intensity =
          0;

        continue;
      }

      const moonPosition =
        moon.body.mesh.getWorldPosition(
          new THREE.Vector3()
        );

      moon.light.position.copy(
        moonPosition
      );

      const morraPosition =
        this.engine.morra.mesh
          .getWorldPosition(
            new THREE.Vector3()
          );

      const moonToMorra =
        morraPosition
          .clone()
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
          !source.body.mesh.visible
        ) {
          continue;
        }

        const sourcePosition =
          source.body.mesh.getWorldPosition(
            new THREE.Vector3()
          );

        const moonToSource =
          sourcePosition
            .clone()
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
          this.engine.radiation
            .getVisibilityDetails(
              moonPosition,
              {
                id:
                  source.body.mesh.userData.radiationId ??
                  "source",
                body:
                  source.body,
                lightPower:
                  source.intensity,
                heatPower:
                  0,
                magicPower:
                  0
              },
              this.engine.getOccluders()
            );

        const sourceIrradiance =
          source.intensity /
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
          (
            moon.body.radius *
            moon.body.radius
          ) *
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

      moon.light.intensity =
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

        moon.light.color.copy(
          reflectedColor
        );
      }
      else {

        moon.light.color.setHex(
          0x111111
        );
      }
    }
  }

  dispose() {

    for(
      const moon
      of this.moons
    ) {

      moon.light.dispose();

      this.scene.remove(
        moon.light
      );
    }
  }
}
