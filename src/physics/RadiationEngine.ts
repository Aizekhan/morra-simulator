import * as THREE from "three";

import {
  CelestialBody
} from "../astronomy/CelestialBody";

export interface RadiationSource {

  id: string;

  body: CelestialBody;

  lightPower: number;

  heatPower: number;

  magicPower: number;
}

export interface RadiationContribution {

  sourceId: string;

  distance: number;

  illuminationFactor: number;

  visibilityFactor: number;

  light: number;

  heat: number;

  magic: number;
}

export interface RadiationSample {

  light: number;

  heat: number;

  magic: number;

  unobstructedMagic: number;

  contributions: RadiationContribution[];
}

export class RadiationEngine {

  private readonly sources: RadiationSource[] = [];

  private static readonly EPSILON =
    1e-8;

  setSources(
    sources: RadiationSource[]
  ) {

    this.sources.length =
      0;

    this.sources.push(
      ...sources
    );
  }

  getSources() {

    return [
      ...this.sources
    ];
  }

  evaluateSurfacePoint(
    worldPoint: THREE.Vector3,
    surfaceNormal: THREE.Vector3,
    occluders: CelestialBody[]
  ): RadiationSample {

    const normal =
      surfaceNormal
        .clone()
        .normalize();

    const contributions:
      RadiationContribution[] = [];

    let light = 0;

    let heat = 0;

    let magic = 0;

    let unobstructedMagic = 0;

    for(
      const source of this.sources
    ) {

      const sourcePosition =
        source.body.mesh
          .getWorldPosition(
            new THREE.Vector3()
          );

      const toSource =
        sourcePosition
          .clone()
          .sub(
            worldPoint
          );

      const distance =
        Math.max(
          toSource.length(),
          RadiationEngine.EPSILON
        );

      const direction =
        toSource
          .clone()
          .normalize();

      const illuminationFactor =
        Math.max(
          0,
          normal.dot(
            direction
          )
        );

      const visibilityFactor =
        this.getVisibilityFactor(
          worldPoint,
          source,
          occluders
        );

      const inverseSquare =
        1 /
        (
          distance *
          distance
        );

      const lightContribution =
        source.lightPower *
        inverseSquare *
        illuminationFactor *
        visibilityFactor;

      const heatContribution =
        source.heatPower *
        inverseSquare *
        illuminationFactor *
        visibilityFactor;

      const unobstructedMagicContribution =
        source.magicPower *
        inverseSquare *
        illuminationFactor;

      const magicContribution =
        unobstructedMagicContribution *
        visibilityFactor;

      light +=
        lightContribution;

      heat +=
        heatContribution;

      magic +=
        magicContribution;

      unobstructedMagic +=
        unobstructedMagicContribution;

      contributions.push({
        sourceId:
          source.id,

        distance,

        illuminationFactor,

        visibilityFactor,

        light:
          lightContribution,

        heat:
          heatContribution,

        magic:
          magicContribution
      });
    }

    return {
      light,
      heat,
      magic,
      unobstructedMagic,
      contributions
    };
  }

  getVisibilityFactor(
    worldPoint: THREE.Vector3,
    source: RadiationSource,
    occluders: CelestialBody[]
  ) {

    let visibility =
      1;

    const sourcePosition =
      source.body.mesh
        .getWorldPosition(
          new THREE.Vector3()
        );

    const sourceVector =
      sourcePosition
        .clone()
        .sub(
          worldPoint
        );

    const sourceDistance =
      sourceVector.length();

    if(
      sourceDistance <=
      RadiationEngine.EPSILON
    ) {
      return 0;
    }

    const sourceDirection =
      sourceVector
        .clone()
        .normalize();

    const sourceAngularRadius =
      RadiationEngine.angularRadius(
        source.body.radius,
        sourceDistance
      );

    for(
      const occluder of occluders
    ) {

      if(
        occluder ===
        source.body
      ) {
        continue;
      }

      const occluderPosition =
        occluder.mesh
          .getWorldPosition(
            new THREE.Vector3()
          );

      const occluderVector =
        occluderPosition
          .clone()
          .sub(
            worldPoint
          );

      const occluderDistance =
        occluderVector.length();

      if(
        occluderDistance <=
        RadiationEngine.EPSILON ||
        occluderDistance >=
        sourceDistance
      ) {
        continue;
      }

      const occluderDirection =
        occluderVector
          .clone()
          .normalize();

      const angularSeparation =
        Math.acos(
          THREE.MathUtils.clamp(
            sourceDirection.dot(
              occluderDirection
            ),
            -1,
            1
          )
        );

      const occluderAngularRadius =
        RadiationEngine.angularRadius(
          occluder.radius,
          occluderDistance
        );

      const blockedFraction =
        RadiationEngine.circleOverlapFraction(
          sourceAngularRadius,
          occluderAngularRadius,
          angularSeparation
        );

      visibility *=
        1 -
        blockedFraction;

      if(
        visibility <=
        RadiationEngine.EPSILON
      ) {
        return 0;
      }
    }

    return THREE.MathUtils.clamp(
      visibility,
      0,
      1
    );
  }

  private static angularRadius(
    radius: number,
    distance: number
  ) {

    return Math.asin(
      THREE.MathUtils.clamp(
        radius /
          Math.max(
            distance,
            RadiationEngine.EPSILON
          ),
        0,
        0.999999
      )
    );
  }

  private static circleOverlapFraction(
    sourceRadius: number,
    occluderRadius: number,
    separation: number
  ) {

    const sourceArea =
      Math.PI *
      sourceRadius *
      sourceRadius;

    if(
      sourceArea <=
      RadiationEngine.EPSILON
    ) {
      return 0;
    }

    if(
      separation >=
      sourceRadius +
      occluderRadius
    ) {
      return 0;
    }

    if(
      separation <=
      Math.abs(
        sourceRadius -
        occluderRadius
      )
    ) {

      const coveredRadius =
        Math.min(
          sourceRadius,
          occluderRadius
        );

      return (
        Math.PI *
        coveredRadius *
        coveredRadius
      ) /
      sourceArea;
    }

    const sourceSquared =
      sourceRadius *
      sourceRadius;

    const occluderSquared =
      occluderRadius *
      occluderRadius;

    const alpha =
      THREE.MathUtils.acos(
        THREE.MathUtils.clamp(
          (
            separation *
            separation +
            sourceSquared -
            occluderSquared
          ) /
          (
            2 *
            separation *
            sourceRadius
          ),
          -1,
          1
        )
      );

    const beta =
      THREE.MathUtils.acos(
        THREE.MathUtils.clamp(
          (
            separation *
            separation +
            occluderSquared -
            sourceSquared
          ) /
          (
            2 *
            separation *
            occluderRadius
          ),
          -1,
          1
        )
      );

    const triangle =
      0.5 *
      Math.sqrt(
        Math.max(
          0,
          (
            -separation +
            sourceRadius +
            occluderRadius
          ) *
          (
            separation +
            sourceRadius -
            occluderRadius
          ) *
          (
            separation -
            sourceRadius +
            occluderRadius
          ) *
          (
            separation +
            sourceRadius +
            occluderRadius
          )
        )
      );

    const overlapArea =
      sourceSquared *
      alpha +
      occluderSquared *
      beta -
      triangle;

    return THREE.MathUtils.clamp(
      overlapArea /
      sourceArea,
      0,
      1
    );
  }
}
