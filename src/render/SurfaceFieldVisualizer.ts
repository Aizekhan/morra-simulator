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

  private readonly morra:
    THREE.Mesh;

  private readonly overlay:
    THREE.Mesh;

  private readonly material:
    THREE.ShaderMaterial;

  private baseTexture:
    THREE.Texture | null = null;

  private baseTextureOwned =
    false;

  private readonly texture:
    THREE.DataTexture;

  private readonly valueTexture:
    THREE.DataTexture;



  private channel:
    SurfaceFieldChannel =
      "MAGIC_TOTAL";

  private opacity =
    0.48;

  private enabled =
    false;

  private lastMap:
    SurfaceFieldMap | null =
    null;

  private width:
    number;

  private height:
    number;

  constructor(
    morra: THREE.Mesh,
    initialWidth: number,
    initialHeight: number
  ) {

    this.morra =
      morra;

    this.width =
      initialWidth;

    this.height =
      initialHeight;

    this.texture =
      new THREE.DataTexture(
        new Uint8Array(
          initialWidth *
          initialHeight *
          4
        ),
        initialWidth,
        initialHeight,
        THREE.RGBAFormat,
        THREE.UnsignedByteType
      );

    this.texture.flipY =
      true;

    this.texture.minFilter =
      THREE.LinearFilter;

    this.valueTexture =
      this.texture;

    this.texture.magFilter =
      THREE.LinearFilter;

    this.texture.colorSpace =
      THREE.NoColorSpace;

    this.texture.needsUpdate =
      true;

    this.material =
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
        uniforms: {
          fieldTexture: {
            value:
              this.texture
          },
          opacity: {
            value:
              this.opacity
          },
          lowColor: {
            value:
              new THREE.Color(0x06152f)
          },
          highColor: {
            value:
              new THREE.Color(0x4de9ff)
          },
          channelSpectrum: {
            value:
              false
          },
          valueTexture: {
            value:
              this.valueTexture
          },
          spectrumTexture: {
            value:
              this.valueTexture
          },
          baseTexture: {
            value:
              null
          }
        },
        vertexShader: `
          varying vec2 vUv;

          void main() {
            vUv = uv;

            gl_Position =
              projectionMatrix *
              modelViewMatrix *
              vec4(
                position,
                1.0
              );
          }
        `,
        fragmentShader: `
          uniform sampler2D fieldTexture;
          uniform float opacity;
          uniform vec3 lowColor;
          uniform vec3 highColor;
          uniform sampler2D spectrumTexture;
          uniform sampler2D baseTexture;
          uniform bool channelSpectrum;

          varying vec2 vUv;

          void main() {

            vec4 spectrum =
              texture2D(
                spectrumTexture,
                vUv
              );

            float value =
              texture2D(
                fieldTexture,
                vUv
              ).r;

            vec4 base =
              texture2D(
                baseTexture,
                vUv
              );

            vec3 fieldColor =
              channelSpectrum
                ? spectrum.rgb
                : mix(
                    lowColor,
                    highColor,
                    value
                  );

            float fieldBlend =
              clamp(
                opacity * (
                  0.35 +
                  0.65 * smoothstep(
                    0.0,
                    0.001,
                    value
                  )
                ),
                0.0,
                1.0
              );

            vec3 color =
              mix(
                base.rgb,
                fieldColor,
                fieldBlend
              );

            float fieldPresence =
              smoothstep(
                0.0,
                0.001,
                value
              );

            float alpha =
              fieldPresence;

            if(alpha <= 0.001) {
              discard;
            }

            // Keep the geographic texture visually present under diagnostics.
            // The field is an overlay, not an opaque replacement texture.
            float finalAlpha =
              clamp(
                0.18 +
                fieldBlend * 0.82,
                0.0,
                1.0
              );

            gl_FragColor =
              vec4(
                color,
                finalAlpha
              );
          }
        `
      });

    this.overlay =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          1,
          64,
          32
        ),
        this.material
      );

    this.overlay.renderOrder =
      2;

    this.morra.add(
      this.overlay
    );

    this.applyChannelColors();
    this.updateSpectrumMode();

    this.setEnabled(
      false
    );
  }

  setBaseTexture(
    texture: THREE.Texture | null
  ) {
    if(this.baseTextureOwned && this.baseTexture) {
      this.baseTexture.dispose();
    }

    this.baseTexture = texture;
    this.baseTextureOwned = false;

    this.material.uniforms.baseTexture.value =
      texture ?? this.texture;
  }

  setChannel(
    channel:
      SurfaceFieldChannel
  ) {

    if(
      this.channel ===
      channel
    ) {
      return;
    }

    this.channel =
      channel;

    this.applyChannelColors();
    this.updateSpectrumMode();

    if(
      this.lastMap
    ) {
      this.updateMap(
        this.lastMap
      );
    }
  }

  getChannel() {

    return this.channel;
  }

  private applyChannelColors() {

    const colors =
      this.getChannelColors();

    this.material.uniforms
      .lowColor.value
      .setHex(
        colors.low
      );

    this.material.uniforms
      .highColor.value
      .setHex(
        colors.high
      );
  }

  private getChannelColors() {

    switch(
      this.channel
    ) {

      case "MAGOSPHERE":
        return {
          low: 0x2b0710,
          high: 0x59ffb0
        };

      case "ANOMALY":
        return {
          low: 0x07111f,
          high: 0xff4d00
        };

      case "LARGE_SUN":
        return {
          low: 0x05070f,
          high: 0xffcc88
        };

      case "MEDIUM_SUN":
        return {
          low: 0x08101a,
          high: 0xff8a3d
        };

      case "NORTH_MOON":
        return {
          low: 0x061020,
          high: 0xaac8ff
        };

      case "EQUATOR_MOON":
        return {
          low: 0x10101f,
          high: 0xd0a8ff
        };

      case "SPECTRUM":
        return {
          low: 0x05050a,
          high: 0xffffff
        };

      case "DAY_NIGHT":
        return {
          low: 0x020207,
          high: 0xfff2b0
        };

      case "SMALL_SUN":
        return {
          low: 0x07100a,
          high: 0xffffaa
        };

      case "LIGHT_TOTAL":
        return {
          low: 0x061020,
          high: 0xfff1a8
        };

      case "HEAT_TOTAL":
        return {
          low: 0x10152a,
          high: 0xff3218
        };

      case "MAGIC_TOTAL":
        return {
          low: 0x12002d,
          high: 0x6f4dff
        };

      case "SHADOW":
        return {
          low: 0x07101e,
          high: 0xff2633
        };

      case "UMBRA":
        return {
          low: 0x120000,
          high: 0xff1020
        };

      case "PENUMBRA":
        return {
          low: 0x2b1600,
          high: 0xffc247
        };

      case "MAGIC_TOTAL":
      default:
        return {
          low: 0x12002d,
          high: 0x6f4dff
        };
    }
  }

  setOpacity(
    opacity: number
  ) {

    this.opacity =
      THREE.MathUtils.clamp(
        opacity,
        0,
        1
      );

    this.material.uniforms
      .opacity.value =
      this.opacity;
  }

  private updateSpectrumMode() {

    this.material.uniforms
      .channelSpectrum.value =
      this.channel === "SPECTRUM";
  }

  setEnabled(
    enabled: boolean
  ) {

    this.enabled =
      enabled;

    this.overlay.visible =
      enabled;
  }

  isEnabled() {

    return this.enabled;
  }

  update(
    map:
      SurfaceFieldMap | null
  ) {

    if(
      !map
    ) {
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

    this.lastMap =
      map;

    this.updateMap(
      map
    );
  }

  setRadius(
    radius: number
  ) {

    this.overlay.scale.setScalar(
      radius * 1.006
    );
  }

  private updateMap(
    map:
      SurfaceFieldMap
  ) {

    const data =
      this.texture.image.data as Uint8Array;

    const values =
      this.getChannelValues(
        map
      );

    const stats =
      this.getChannelStats(
        map
      );

    const hasRange =
      Number.isFinite(stats.min) &&
      Number.isFinite(stats.max) &&
      stats.max > stats.min;

    const range =
      hasRange
        ? stats.max - stats.min
        : 1;

    for(
      let index = 0;
      index < values.length;
      index++
    ) {

      const rawValue =
        Number.isFinite(values[index])
          ? values[index]
          : 0;

      const normalized =
        hasRange
          ? THREE.MathUtils.clamp(
              (
                rawValue -
                stats.min
              ) /
              range,
              0,
              1
            )
          : THREE.MathUtils.clamp(
              rawValue,
              0,
              1
            );

      const offset =
        index *
        4;

      let red =
        normalized;

      let green =
        normalized;

      let blue =
        normalized;

      if(
        this.channel === "SPECTRUM"
      ) {

        red =
          THREE.MathUtils.clamp(
            map.spectrumRed[index],
            0,
            1
          );

        green =
          THREE.MathUtils.clamp(
            map.spectrumGreen[index],
            0,
            1
          );

        blue =
          THREE.MathUtils.clamp(
            map.spectrumBlue[index],
            0,
            1
          );
      }

      data[offset] =
        Math.round(
          red * 255
        );

      data[offset + 1] =
        Math.round(
          green * 255
        );

      data[offset + 2] =
        Math.round(
          blue * 255
        );

      data[offset + 3] =
        255;
    }

    this.texture.needsUpdate =
      true;
  }


  private getChannelValues(
    map:
      SurfaceFieldMap
  ) {

    switch(
      this.channel
    ) {

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

      case "LIGHT_TOTAL":
        return map.light;

      case "HEAT_TOTAL":
        return map.heat;

      case "MAGIC_TOTAL":
      default:
        return map.magic;
    }
  }

  private getChannelStats(
    map:
      SurfaceFieldMap
  ) {

    switch(
      this.channel
    ) {

      case "MAGOSPHERE":
        return {
          min: 0,
          max: 1,
          average:
            this.average(
              map.magosphereStability
            )
        };

      case "ANOMALY":
        return {
          min: 0,
          max: 1,
          average:
            this.average(
              map.anomalyStrength
            )
        };

      case "SHADOW":
        return map.shadowStats;

      case "UMBRA":
        return {
          min: 0,
          max: 1,
          average:
            this.average(
              map.umbra
            )
        };

      case "PENUMBRA":
        return {
          min: 0,
          max: 1,
          average:
            this.average(
              map.penumbra
            )
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
      default:
        return map.magicStats;
    }
  }

  private average(
    values:
      Float32Array
  ) {

    let sum = 0;

    for(
      const value of values
    ) {
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

    this.texture.image =
      {
        data:
          new Uint8Array(
            width *
            height *
            4
          ),
        width,
        height
      };

    this.texture.colorSpace =
      THREE.NoColorSpace;

    this.width =
      width;

    this.height =
      height;

    this.texture.needsUpdate =
      true;
  }

  dispose() {

    if(this.baseTextureOwned && this.baseTexture) {
      this.baseTexture.dispose();
    }

    this.overlay.geometry.dispose();

    this.material.dispose();

    this.texture.dispose();

    this.morra.remove(
      this.overlay
    );
  }
}
