import * as THREE from "three";

import {
  MorraEnvironmentEngine
} from "./MorraEnvironmentEngine";

export interface SurfaceFieldConfig {

  latitudeSegments: number;

  longitudeSegments: number;

  updateIntervalHours: number;

  updateIntervalMilliseconds: number;
}

export interface SurfaceFieldSample {

  latitude: number;

  longitude: number;

  light: number;

  heat: number;

  magic: number;

  magosphereStability: number;

  anomalyStrength: number;

  // Normalized diagnostic maps for the first field-audit step.
  // Raw light/heat/magic remain untouched.
  shadow: number;

  umbra: number;

  penumbra: number;

  largeSunLight: number;
  mediumSunLight: number;
  smallSunLight: number;
  northMoonLight: number;
  equatorMoonLight: number;
  spectrumRed: number;
  spectrumGreen: number;
  spectrumBlue: number;
}

export interface SurfaceFieldStats {

  min: number;

  max: number;

  average: number;
}

export interface SurfaceFieldMap {

  absoluteHours: number;

  width: number;

  height: number;

  samples: SurfaceFieldSample[];

  light: Float32Array;

  heat: Float32Array;

  magic: Float32Array;

  magosphereStability: Float32Array;

  anomalyStrength: Float32Array;

  shadow: Float32Array;

  umbra: Float32Array;

  penumbra: Float32Array;

  largeSunLight: Float32Array;
  mediumSunLight: Float32Array;
  smallSunLight: Float32Array;
  northMoonLight: Float32Array;
  equatorMoonLight: Float32Array;
  spectrumRed: Float32Array;
  spectrumGreen: Float32Array;
  spectrumBlue: Float32Array;

  largeSunLightStats: SurfaceFieldStats;
  mediumSunLightStats: SurfaceFieldStats;
  smallSunLightStats: SurfaceFieldStats;
  northMoonLightStats: SurfaceFieldStats;
  equatorMoonLightStats: SurfaceFieldStats;

  lightStats: SurfaceFieldStats;

  heatStats: SurfaceFieldStats;

  magicStats: SurfaceFieldStats;

  shadowStats: SurfaceFieldStats;

  umbraStats: SurfaceFieldStats;

  penumbraStats: SurfaceFieldStats;
}

export class SurfaceFieldEngine {

  private readonly environment:
    MorraEnvironmentEngine;

  private config:
    SurfaceFieldConfig;

  private map:
    SurfaceFieldMap | null = null;

  private lastUpdateTimestamp:
    number | null = null;

  constructor(
    environment:
      MorraEnvironmentEngine,
    config:
      SurfaceFieldConfig
  ) {

    this.environment =
      environment;

    this.config = {
      latitudeSegments:
        Math.max(
          4,
          Math.floor(
            config.latitudeSegments
          )
        ),
      longitudeSegments:
        Math.max(
          8,
          Math.floor(
            config.longitudeSegments
          )
        ),
      updateIntervalHours:
        Math.max(
          0,
          config.updateIntervalHours
        ),
      updateIntervalMilliseconds:
        Math.max(
          16,
          config.updateIntervalMilliseconds ?? 100
        )
    };
  }

  setConfig(
    config:
      Partial<SurfaceFieldConfig>
  ) {

    const next = {
      ...this.config,
      ...config
    };

    const changed =
      next.latitudeSegments !==
        this.config.latitudeSegments ||
      next.longitudeSegments !==
        this.config.longitudeSegments ||
      next.updateIntervalHours !==
        this.config.updateIntervalHours ||
      next.updateIntervalMilliseconds !==
        this.config.updateIntervalMilliseconds;

    this.config = {
      latitudeSegments:
        Math.max(
          4,
          Math.floor(
            next.latitudeSegments
          )
        ),
      longitudeSegments:
        Math.max(
          8,
          Math.floor(
            next.longitudeSegments
          )
        ),
      updateIntervalHours:
        Math.max(
          0,
          next.updateIntervalHours
        ),
      updateIntervalMilliseconds:
        Math.max(
          16,
          next.updateIntervalMilliseconds
        )
    };

    if(changed) {
      this.map =
        null;
    }
  }

  getConfig() {

    return {
      ...this.config
    };
  }

  getMap() {

    return this.map;
  }

  update(
    absoluteHours: number,
    force = false
  ) {

    const now =
      typeof performance !== "undefined"
        ? performance.now()
        : Date.now();

    const wallClockChangedEnough =
      this.lastUpdateTimestamp === null ||
      now -
        this.lastUpdateTimestamp >=
        this.config.updateIntervalMilliseconds;

    if(
      !force &&
      this.map &&
      !wallClockChangedEnough
    ) {
      return this.map;
    }

    const map =
      this.buildMap(
        absoluteHours
      );

    this.map =
      map;

    this.lastUpdateTimestamp =
      now;

    return map;
  }

  private buildMap(
    absoluteHours: number
  ): SurfaceFieldMap {

    const width =
      this.config.longitudeSegments;

    const height =
      this.config.latitudeSegments;

    const count =
      width *
      height;

    const samples:
      SurfaceFieldSample[] =
        new Array(
          count
        );

    const light =
      new Float32Array(
        count
      );

    const heat =
      new Float32Array(
        count
      );

    const magic =
      new Float32Array(
        count
      );

    const magosphereStability =
      new Float32Array(
        count
      );

    const anomalyStrength =
      new Float32Array(
        count
      );

    const shadow =
      new Float32Array(
        count
      );

    const umbra =
      new Float32Array(
        count
      );

    const penumbra =
      new Float32Array(
        count
      );

    const largeSunLight =
      new Float32Array(count);

    const mediumSunLight =
      new Float32Array(count);

    const smallSunLight =
      new Float32Array(count);

    const northMoonLight =
      new Float32Array(count);

    const equatorMoonLight =
      new Float32Array(count);

    const spectrumRed =
      new Float32Array(count);

    const spectrumGreen =
      new Float32Array(count);

    const spectrumBlue =
      new Float32Array(count);

    let northMoonLightSum = 0;
    let equatorMoonLightSum = 0;

    let northMoonLightMin =
      Number.POSITIVE_INFINITY;
    let equatorMoonLightMin =
      Number.POSITIVE_INFINITY;

    let northMoonLightMax =
      Number.NEGATIVE_INFINITY;
    let equatorMoonLightMax =
      Number.NEGATIVE_INFINITY;

    let largeSunLightSum = 0;
    let mediumSunLightSum = 0;
    let smallSunLightSum = 0;

    let largeSunLightMin =
      Number.POSITIVE_INFINITY;
    let mediumSunLightMin =
      Number.POSITIVE_INFINITY;
    let smallSunLightMin =
      Number.POSITIVE_INFINITY;

    let largeSunLightMax =
      Number.NEGATIVE_INFINITY;
    let mediumSunLightMax =
      Number.NEGATIVE_INFINITY;
    let smallSunLightMax =
      Number.NEGATIVE_INFINITY;

    let lightSum =
      0;

    let heatSum =
      0;

    let magicSum =
      0;

    let lightMin =
      Number.POSITIVE_INFINITY;

    let heatMin =
      Number.POSITIVE_INFINITY;

    let magicMin =
      Number.POSITIVE_INFINITY;

    let lightMax =
      Number.NEGATIVE_INFINITY;

    let heatMax =
      Number.NEGATIVE_INFINITY;

    let magicMax =
      Number.NEGATIVE_INFINITY;

    let shadowSum =
      0;

    let shadowMin =
      Number.POSITIVE_INFINITY;

    let shadowMax =
      Number.NEGATIVE_INFINITY;

    let umbraSum =
      0;

    let umbraMin =
      Number.POSITIVE_INFINITY;

    let umbraMax =
      Number.NEGATIVE_INFINITY;

    let penumbraSum =
      0;

    let penumbraMin =
      Number.POSITIVE_INFINITY;

    let penumbraMax =
      Number.NEGATIVE_INFINITY;

    for(
      let y = 0;
      y < height;
      y++
    ) {

      const latitude =
        90 -
        (
          (
            y +
            0.5
          ) /
          height
        ) *
        180;

      const latitudeRadians =
        THREE.MathUtils.degToRad(
          latitude
        );

      const cosLatitude =
        Math.cos(
          latitudeRadians
        );

      const sinLatitude =
        Math.sin(
          latitudeRadians
        );

      for(
        let x = 0;
        x < width;
        x++
      ) {

        const longitude =
          (
            (
              x +
              0.5
            ) /
            width
          ) *
          360 -
          180;

        const longitudeRadians =
          THREE.MathUtils.degToRad(
            longitude
          );

        const localPoint =
          new THREE.Vector3(
            cosLatitude *
              Math.cos(
                longitudeRadians
              ),
            sinLatitude,
            cosLatitude *
              Math.sin(
                longitudeRadians
              )
          );

        const sample =
          this.environment
            .evaluateLocalPoint(
              localPoint
            );

        const index =
          y *
          width +
          x;

        const contributions =
          sample.radiation.contributions;

        const strongestShadow =
          contributions.reduce(
            (max, contribution) =>
              Math.max(
                max,
                1 - contribution.visibilityFactor
              ),
            0
          );

        const hasUmbra =
          contributions.some(
            contribution =>
              contribution.umbra &&
              contribution.visibilityFactor <=
                0.000001
          );

        const hasPenumbra =
          contributions.some(
            contribution =>
              contribution.penumbra ||
              (
                contribution.visibilityFactor >
                  0.000001 &&
                contribution.visibilityFactor <
                  0.999999
              )
          );

        const sampleData: SurfaceFieldSample = {
          latitude,
          longitude,
          light:
            sample.radiation.light,
          heat:
            sample.radiation.heat,
          magic:
            sample.radiation.magic,
          magosphereStability:
            sample.magosphere.stability,
          anomalyStrength:
            sample.magosphere.anomalyStrength,
          shadow:
            THREE.MathUtils.clamp(
              strongestShadow,
              0,
              1
            ),
          umbra:
            hasUmbra
              ? 1
              : 0,
          penumbra:
            hasPenumbra
              ? 1
              : 0,
          largeSunLight:
            contributions.find(
              contribution =>
                contribution.sourceId === "large-sun"
            )?.light ?? 0,
          mediumSunLight:
            contributions.find(
              contribution =>
                contribution.sourceId === "medium-sun"
            )?.light ?? 0,
          smallSunLight:
            contributions.find(
              contribution =>
                contribution.sourceId === "small-sun"
            )?.light ?? 0,
          northMoonLight:
            contributions.find(
              contribution =>
                contribution.sourceId ===
                "north-moon-reflection"
            )?.light ?? 0,
          equatorMoonLight:
            contributions.find(
              contribution =>
                contribution.sourceId ===
                "equator-moon-reflection"
            )?.light ?? 0,
          spectrumRed:
            Math.min(
              1,
              sample.radiation.light +
              sample.radiation.magic * 0.15
            ),
          spectrumGreen:
            Math.min(
              1,
              sample.radiation.heat +
              sample.radiation.light * 0.05
            ),
          spectrumBlue:
            Math.min(
              1,
              sample.radiation.magic +
              sample.radiation.light * 0.2
            )
        };

        samples[index] =
          sampleData;

        light[index] =
          sampleData.light;

        heat[index] =
          sampleData.heat;

        magic[index] =
          sampleData.magic;

        magosphereStability[index] =
          sampleData.magosphereStability;

        anomalyStrength[index] =
          sampleData.anomalyStrength;

        shadow[index] =
          sampleData.shadow;

        umbra[index] =
          sampleData.umbra;

        penumbra[index] =
          sampleData.penumbra;

        largeSunLight[index] =
          sampleData.largeSunLight;

        mediumSunLight[index] =
          sampleData.mediumSunLight;

        smallSunLight[index] =
          sampleData.smallSunLight;

        northMoonLight[index] =
          sampleData.northMoonLight;

        equatorMoonLight[index] =
          sampleData.equatorMoonLight;

        spectrumRed[index] =
          sampleData.spectrumRed;

        spectrumGreen[index] =
          sampleData.spectrumGreen;

        spectrumBlue[index] =
          sampleData.spectrumBlue;

        northMoonLightSum +=
          sampleData.northMoonLight;
        equatorMoonLightSum +=
          sampleData.equatorMoonLight;

        northMoonLightMin =
          Math.min(
            northMoonLightMin,
            sampleData.northMoonLight
          );
        equatorMoonLightMin =
          Math.min(
            equatorMoonLightMin,
            sampleData.equatorMoonLight
          );

        northMoonLightMax =
          Math.max(
            northMoonLightMax,
            sampleData.northMoonLight
          );
        equatorMoonLightMax =
          Math.max(
            equatorMoonLightMax,
            sampleData.equatorMoonLight
          );

        largeSunLightSum +=
          sampleData.largeSunLight;

        mediumSunLightSum +=
          sampleData.mediumSunLight;

        smallSunLightSum +=
          sampleData.smallSunLight;

        largeSunLightMin =
          Math.min(
            largeSunLightMin,
            sampleData.largeSunLight
          );

        mediumSunLightMin =
          Math.min(
            mediumSunLightMin,
            sampleData.mediumSunLight
          );

        smallSunLightMin =
          Math.min(
            smallSunLightMin,
            sampleData.smallSunLight
          );

        largeSunLightMax =
          Math.max(
            largeSunLightMax,
            sampleData.largeSunLight
          );

        mediumSunLightMax =
          Math.max(
            mediumSunLightMax,
            sampleData.mediumSunLight
          );

        smallSunLightMax =
          Math.max(
            smallSunLightMax,
            sampleData.smallSunLight
          );

        lightSum +=
          sampleData.light;

        heatSum +=
          sampleData.heat;

        magicSum +=
          sampleData.magic;

        shadowSum +=
          sampleData.shadow;

        shadowMin =
          Math.min(
            shadowMin,
            sampleData.shadow
          );

        shadowMax =
          Math.max(
            shadowMax,
            sampleData.shadow
          );

        umbraSum +=
          sampleData.umbra;

        umbraMin =
          Math.min(
            umbraMin,
            sampleData.umbra
          );

        umbraMax =
          Math.max(
            umbraMax,
            sampleData.umbra
          );

        penumbraSum +=
          sampleData.penumbra;

        penumbraMin =
          Math.min(
            penumbraMin,
            sampleData.penumbra
          );

        penumbraMax =
          Math.max(
            penumbraMax,
            sampleData.penumbra
          );

        lightMin =
          Math.min(
            lightMin,
            sampleData.light
          );

        heatMin =
          Math.min(
            heatMin,
            sampleData.heat
          );

        magicMin =
          Math.min(
            magicMin,
            sampleData.magic
          );

        lightMax =
          Math.max(
            lightMax,
            sampleData.light
          );

        heatMax =
          Math.max(
            heatMax,
            sampleData.heat
          );

        magicMax =
          Math.max(
            magicMax,
            sampleData.magic
          );
      }
    }

    return {
      absoluteHours,
      width,
      height,
      samples,
      light,
      heat,
      magic,
      magosphereStability,
      anomalyStrength,
      shadow,
      umbra,
      penumbra,
      largeSunLight,
      mediumSunLight,
      smallSunLight,
      northMoonLight,
      equatorMoonLight,
      spectrumRed,
      spectrumGreen,
      spectrumBlue,
      largeSunLightStats: {
        min: largeSunLightMin,
        max: largeSunLightMax,
        average: largeSunLightSum / count
      },
      mediumSunLightStats: {
        min: mediumSunLightMin,
        max: mediumSunLightMax,
        average: mediumSunLightSum / count
      },
      smallSunLightStats: {
        min: smallSunLightMin,
        max: smallSunLightMax,
        average: smallSunLightSum / count
      },
      northMoonLightStats: {
        min: northMoonLightMin,
        max: northMoonLightMax,
        average: northMoonLightSum / count
      },
      equatorMoonLightStats: {
        min: equatorMoonLightMin,
        max: equatorMoonLightMax,
        average: equatorMoonLightSum / count
      },
      lightStats: {
        min:
          lightMin,
        max:
          lightMax,
        average:
          lightSum /
          count
      },
      heatStats: {
        min:
          heatMin,
        max:
          heatMax,
        average:
          heatSum /
          count
      },
      magicStats: {
        min:
          magicMin,
        max:
          magicMax,
        average:
          magicSum /
          count
      },
      shadowStats: {
        min:
          shadowMin,
        max:
          shadowMax,
        average:
          shadowSum /
          count
      },
      umbraStats: {
        min:
          umbraMin,
        max:
          umbraMax,
        average:
          umbraSum /
          count
      },
      penumbraStats: {
        min:
          penumbraMin,
        max:
          penumbraMax,
        average:
          penumbraSum /
          count
      }
    };
  }


}
