import * as THREE from "three";

import type {
  SurfaceFieldMap
} from "../physics/SurfaceFieldEngine";

export type SurfaceFieldChannel =
  | "MAGOSPHERE"
  | "ANOMALY"
  | "SHADOW"
  | "UMBRA"
  | "PENUMBRA"
  | "LIGHT_TOTAL"
  | "HEAT_TOTAL"
  | "MAGIC_TOTAL"
  | "LARGE_SUN"
  | "MEDIUM_SUN"
  | "SMALL_SUN"
  | "NORTH_MOON"
  | "EQUATOR_MOON"
  | "SPECTRUM"
  | "DAY_NIGHT";

export class SurfaceFieldVisualizer {

  private readonly texture: THREE.DataTexture;
  private readonly material: THREE.MeshStandardMaterial;
  private width: number;
  private height: number;
  private channel: SurfaceFieldChannel = "LIGHT_TOTAL";
  private enabled = true;
  private lastMap: SurfaceFieldMap | null = null;

  constructor(
    morra: THREE.Mesh,
    initialWidth: number,
    initialHeight: number
  ) {
    this.width = initialWidth;
    this.height = initialHeight;

    if(!(morra.material instanceof THREE.MeshStandardMaterial)) {
      throw new Error("Morra surface field requires MeshStandardMaterial");
    }

    this.material = morra.material;

    // Fail-safe until the first valid physical field arrives:
    // a neutral factor keeps Morra's base map visible instead of black.
    const initialPixels =
      new Uint8Array(
        initialWidth *
        initialHeight *
        4
      );

    for(let i = 0; i < initialPixels.length; i += 4) {
      initialPixels[i] = 255;
      initialPixels[i + 1] = 255;
      initialPixels[i + 2] = 255;
      initialPixels[i + 3] = 255;
    }

    this.texture = new THREE.DataTexture(
      initialPixels,
      initialWidth,
      initialHeight,
      THREE.RGBAFormat,
      THREE.UnsignedByteType
    );

    // The surface map is sampled in the same equirectangular UV orientation
    // as Morra's world texture.
    this.texture.flipY = true;
    this.texture.wrapS = THREE.ClampToEdgeWrapping;
    this.texture.wrapT = THREE.ClampToEdgeWrapping;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.colorSpace = THREE.NoColorSpace;
    this.texture.needsUpdate = true;

    // The physical field must not replace or overwrite Morra's geographic map.
    // Keep the field DataTexture separate and use it only as a display overlay.
    // Its initial all-white pixels are neutral so the map can be shown immediately.
    this.material.color.setHex(0xffffff);
    this.material.emissive.setHex(0x000000);
    this.material.emissiveMap = null;
    this.material.emissiveIntensity = 0;
    this.material.needsUpdate = true;

  }

  setBaseTexture(
    _texture: THREE.Texture | null
  ) {
    // Geographic texture remains owned by Morra's own material.
  }

  setChannel(
    channel: SurfaceFieldChannel
  ) {
    this.channel = channel;
    if(this.lastMap) {
      this.updateMap(this.lastMap);
    }
  }

  getChannel() {
    return this.channel;
  }

  setOpacity(
    _opacity: number
  ) {
    // Kept for compatibility with the existing GUI/config contract.
  }

  setEnabled(
    enabled: boolean
  ) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  update(
    map: SurfaceFieldMap | null
  ) {
    if(!map || !this.enabled) {
      return;
    }

    if(
      map.width !== this.width ||
      map.height !== this.height
    ) {
      this.recreateTexture(
        map.width,
        map.height
      );
    }

    this.lastMap = map;
    this.updateMap(map);
  }

  setRadius(
    _radius: number
  ) {
    // No secondary geometry: Morra's own mesh is the only rendered surface.
  }

  private updateMap(
    map: SurfaceFieldMap
  ) {
    const data =
      this.texture.image.data as Uint8Array;

    const values =
      this.getChannelValues(map);

    const stats =
      this.getChannelStats(map);

    const hasRange =
      Number.isFinite(stats.min) &&
      Number.isFinite(stats.max) &&
      stats.max > stats.min;

    const range =
      hasRange
        ? stats.max - stats.min
        : 1;

    for(
      let i = 0;
      i < values.length;
      i++
    ) {
      const raw =
        Number.isFinite(values[i])
          ? values[i]
          : 0;

      // LIGHT_TOTAL is the authoritative physical field. Its display
      // range is derived from the current field, not a hard-coded physics
      // coefficient borrowed from another subsystem.
      const normalized =
        hasRange
          ? THREE.MathUtils.clamp(
              (
                raw -
                stats.min
              ) /
              range,
              0,
              1
            )
          : THREE.MathUtils.clamp(
              raw,
              0,
              1
            );

      const offset =
        i * 4;

      data[offset] =
        Math.round(
          normalized * 255
        );
      data[offset + 1] =
        Math.round(
          normalized * 255
        );
      data[offset + 2] =
        Math.round(
          normalized * 255
        );
      data[offset + 3] =
        255;
    }

    this.texture.needsUpdate = true;
  }

  private getChannelValues(
    map: SurfaceFieldMap
  ) {
    switch(this.channel) {
      case "MAGOSPHERE":
        return map.magosphereStability;
      case "ANOMALY":
        return map.anomalyStrength;
      case "SHADOW":
        return map.shadow;
      case "UMBRA":
        return map.umbra;
      case "PENUMBRA":
        return map.penumbra;
      case "LARGE_SUN":
        return map.largeSunLight;
      case "MEDIUM_SUN":
        return map.mediumSunLight;
      case "SMALL_SUN":
        return map.smallSunLight;
      case "NORTH_MOON":
        return map.northMoonLight;
      case "EQUATOR_MOON":
        return map.equatorMoonLight;
      case "SPECTRUM":
        return map.spectrumIntensity;
      case "DAY_NIGHT":
        return map.dayNight;
      case "HEAT_TOTAL":
        return map.heat;
      case "MAGIC_TOTAL":
        return map.magic;
      case "LIGHT_TOTAL":
      default:
        return map.light;
    }
  }

  private getChannelStats(
    map: SurfaceFieldMap
  ) {
    switch(this.channel) {
      case "MAGOSPHERE":
        return {
          min: 0,
          max: 1,
          average: this.average(map.magosphereStability)
        };
      case "ANOMALY":
        return {
          min: 0,
          max: 1,
          average: this.average(map.anomalyStrength)
        };
      case "SHADOW":
        return map.shadowStats;
      case "UMBRA":
        return {
          min: 0,
          max: 1,
          average: this.average(map.umbra)
        };
      case "PENUMBRA":
        return {
          min: 0,
          max: 1,
          average: this.average(map.penumbra)
        };
      case "LARGE_SUN":
        return map.largeSunLightStats;
      case "MEDIUM_SUN":
        return map.mediumSunLightStats;
      case "SMALL_SUN":
        return map.smallSunLightStats;
      case "NORTH_MOON":
        return map.northMoonLightStats;
      case "EQUATOR_MOON":
        return map.equatorMoonLightStats;
      case "SPECTRUM":
        return map.spectrumStats;
      case "DAY_NIGHT":
        return map.dayNightStats;
      case "LIGHT_TOTAL":
        return map.lightStats;
      case "HEAT_TOTAL":
        return map.heatStats;
      case "MAGIC_TOTAL":
        return map.magicStats;
      default:
        return map.lightStats;
    }
  }

  private average(
    values: Float32Array
  ) {
    let sum = 0;
    for(const value of values) {
      sum += value;
    }
    return sum /
      Math.max(
        values.length,
        1
      );
  }

  private recreateTexture(
    width: number,
    height: number
  ) {
    this.texture.image = {
      data:
        new Uint8Array(
          width *
          height *
          4
        ),
      width,
      height
    };

    this.width =
      width;

    this.height =
      height;

    this.texture.needsUpdate =
      true;
  }

  dispose() {
    this.texture.dispose();
  }
}
