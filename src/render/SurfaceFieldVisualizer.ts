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
  private readonly originalOnBeforeCompile:
    THREE.Material["onBeforeCompile"];

  private readonly shaderUniforms: {
    lightField?: { value: THREE.Texture };
  } = {};
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
    this.originalOnBeforeCompile =
      this.material.onBeforeCompile;

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

    // Do not let the physical-field visualization erase the geographic map
    // while shader compilation or field initialization is still pending.
    this.material.emissive.setHex(0x000000);
    this.material.emissiveMap = null;
    this.material.emissiveIntensity = 0;
    this.material.color.setHex(0xffffff);

    // LIGHT_TOTAL is applied to Morra's actual material. The geographic
    // texture remains authoritative; no secondary surface geometry is used.
    this.material.onBeforeCompile = (shader, renderer) => {
      if(this.originalOnBeforeCompile) {
        this.originalOnBeforeCompile(
          shader,
          renderer
        );
      }

      shader.uniforms.morraLightField = { value: this.texture };

      const vertexCommonMarker = "#include <common>";
      const vertexBeginMarker = "#include <begin_vertex>";
      const fragmentCommonMarker = "#include <common>";
      // opaque_fragment runs after outgoingLight is assembled in
      // Three.js' standard physical-material shader. Injecting before this
      // chunk avoids touching the variable before it exists.

      // Three.js shader chunks are an internal integration boundary.
      // Verify every expected insertion point before mutating either shader;
      // otherwise leave the material's standard geographic rendering intact.
      const missingMarkers = [
        !shader.vertexShader.includes(vertexCommonMarker) ? vertexCommonMarker : null,
        !shader.vertexShader.includes(vertexBeginMarker) ? vertexBeginMarker : null,
        !shader.fragmentShader.includes(fragmentCommonMarker) ? fragmentCommonMarker : null,
        !shader.fragmentShader.includes(lightingMarker) ? lightingMarker : null
      ].filter((marker): marker is string => marker !== null);

      if(missingMarkers.length > 0) {
        console.error(
          "[Morra] Physical surface-light shader hooks unavailable; retaining standard surface rendering.",
          missingMarkers
        );
        return;
      }

      shader.vertexShader = shader.vertexShader.replace(
        vertexCommonMarker,
        vertexCommonMarker + "\nvarying vec2 morraFieldUv;"
      );

      shader.vertexShader = shader.vertexShader.replace(
        vertexBeginMarker,
        vertexBeginMarker + "\nmorraFieldUv = vec2(1.0 - uv.x, 1.0 - uv.y);"
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        fragmentCommonMarker,
        fragmentCommonMarker + "\nuniform sampler2D morraLightField;\nvarying vec2 morraFieldUv;"
      );


      const outputMarker = "#include <opaque_fragment>";
      if(!shader.fragmentShader.includes(outputMarker)) {
        console.error(
          "[Morra] Physical surface-light output hook unavailable; retaining standard surface rendering.",
          outputMarker
        );
        return;
      }

      const lightingReplacement =
        "float morraPhysicalLight = clamp(texture2D(morraLightField, morraFieldUv).r, 0.0, 1.0);\\n" +
        "outgoingLight *= morraPhysicalLight;\\n" +
        outputMarker;

      shader.fragmentShader = shader.fragmentShader.replace(
        outputMarker,
        lightingReplacement
      );
      this.shaderUniforms.lightField = shader.uniforms.morraLightField;

      console.info(
        "[Morra] Physical surface-light shader compiled."
      );
    };

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

    if(this.shaderUniforms.lightField) {
      this.shaderUniforms.lightField.value = this.texture;
    }

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
    this.material.onBeforeCompile = this.originalOnBeforeCompile;
    this.material.needsUpdate = true;
  }
}
