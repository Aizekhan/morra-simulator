import * as THREE from "three";

import {
  MorraEnvironmentEngine
} from "./MorraEnvironmentEngine";

export interface SurfaceFieldConfig {

  latitudeSegments: number;

  longitudeSegments: number;

  updateIntervalHours: number;
}

export interface SurfaceFieldSample {

  latitude: number;

  longitude: number;

  light: number;

  heat: number;

  magic: number;

  magosphereStability: number;

  anomalyStrength: number;

  shadow: number;

  umbra: number;

  penumbra: number;
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

  private lastAbsoluteHours:
    number | null = null;

  private lastWorldSignature:
    string | null = null;

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
        this.config.updateIntervalHours;

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
        )
    };

    if(changed) {
      this.map =
        null;

      this.lastAbsoluteHours =
        null;

      this.lastWorldSignature =
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

    const signature =
      this.getWorldSignature();

    const timeChangedEnough =
      this.lastAbsoluteHours === null ||
      Math.abs(
        absoluteHours -
        this.lastAbsoluteHours
      ) >=
        this.config.updateIntervalHours;

    const worldChanged =
      signature !==
      this.lastWorldSignature;

    if(
      !force &&
      this.map &&
      !timeChangedEnough &&
      !worldChanged
    ) {
      return this.map;
    }

    const map =
      this.buildMap(
        absoluteHours
      );

    this.map =
      map;

    this.lastAbsoluteHours =
      absoluteHours;

    this.lastWorldSignature =
      signature;

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

        const hasUmbra =
          sample.radiation.contributions.some(
            contribution =>
              contribution.umbra
          );

        const hasPenumbra =
          sample.radiation.contributions.some(
            contribution =>
              contribution.penumbra
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
            1 -
            sample.radiation.magicVisibility
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

  private getWorldSignature() {

    const values =
      [
        this.environment.morra.radius,
        this.environment.morra.mesh.rotation.z
      ];

    for(
      const source
      of this.environment.radiation.getSources()
    ) {

      values.push(
        source.body.radius,
        source.body.orbitRadius,
        source.body.orbitSpeed,
        source.body.orbitInclination,
        source.body.orbitAscendingNode,
        source.body.orbitEccentricity,
        source.body.orbitPlaneOffset,
        source.body.mesh.visible
          ? 1
          : 0,
        source.lightPower,
        source.heatPower,
        source.magicPower
      );
    }

    return values
      .map(
        value =>
          value.toFixed(
            5
          )
      )
      .join(
        "|"
      );
  }
}
