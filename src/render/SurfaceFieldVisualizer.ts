import * as THREE from "three";

import type {
  SurfaceFieldMap
} from "../physics/SurfaceFieldEngine";

export type SurfaceFieldChannel =
  | "LIGHT"
  | "HEAT"
  | "MAGIC"
  | "MAGOSPHERE"
  | "ANOMALY"
  | "SHADOW"
  | "UMBRA"
  | "PENUMBRA"
  | "LIGHT_TOTAL"
  | "HEAT_TOTAL"
  | "MAGIC_TOTAL";

export class SurfaceFieldVisualizer {

  private readonly morra:
    THREE.Mesh;

  private readonly overlay:
    THREE.Mesh;

  private readonly material:
    THREE.ShaderMaterial;

  private readonly texture:
    THREE.DataTexture;

  private readonly valueTexture:
    THREE.DataTexture;

  private readonly normalTexture:
    THREE.DataTexture;

  private channel:
    SurfaceFieldChannel =
      "MAGIC";

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
      THREE.LinearFilter;    this.valueTexture =
      this.texture;

    this.normalTexture =
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

    this.normalTexture.colorSpace =
      THREE.NoColorSpace;

    this.normalTexture.flipY =
      true;

    this.normalTexture.minFilter =
      THREE.LinearFilter;

    this.normalTexture.magFilter =
      THREE.LinearFilter;



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
          valueTexture: {
            value:
              this.valueTexture
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
          uniform sampler2D valueTexture;

          varying vec2 vUv;

          void main() {

            float value =
              texture2D(
                valueTexture,
                vUv
              ).r;

            if(value <= 0.0001) {
              value =
                texture2D(
                  fieldTexture,
                  vUv
                ).r;
            }

            vec3 color =
              mix(
                lowColor,
                highColor,
                value
              );

            float alpha =
              opacity *
              smoothstep(
                0.0,
                0.001,
                value
              );

            if(alpha <= 0.001) {
              discard;
            }

            gl_FragColor =
              vec4(
                color,
                alpha
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

    this.setEnabled(
      false
    );
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

      case "LIGHT":
        return {
          low: 0x07142c,
          high: 0xfff1a8
        };

      case "HEAT":
        return {
          low: 0x10204a,
          high: 0xff3b20
        };

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

      case "MAGIC":
      default:
        return {
          low: 0x12002d,
          high: 0x46e6ff
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

      const byte =
        Math.round(
          normalized *
          255
        );

      const offset =
        index *
        4;

      data[offset] =
        byte;

      data[offset + 1] =
        byte;

      data[offset + 2] =
        byte;

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

      case "LIGHT":
        return map.light;

      case "HEAT":
        return map.heat;

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

      case "LIGHT_TOTAL":
        return map.light;

      case "HEAT_TOTAL":
        return map.heat;

      case "MAGIC_TOTAL":
        return map.magic;

      case "MAGIC":
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

      case "LIGHT":
        return map.lightStats;

      case "HEAT":
        return map.heatStats;

      case "MAGOSPHERE":
        return {
          min: 0,
          max: 1,
          average: 0
        };

      case "ANOMALY":
        return {
          min: 0,
          max: 1,
          average: 0
        };

      case "SHADOW":
        return map.shadowStats;

      case "UMBRA":
        return {
          min: 0,
          max: 1,
          average: 0
        };

      case "PENUMBRA":
        return {
          min: 0,
          max: 1,
          average: 0
        };

      case "LIGHT_TOTAL":
        return map.lightStats;

      case "HEAT_TOTAL":
        return map.heatStats;

      case "MAGIC_TOTAL":
        return map.magicStats;

      case "MAGIC":
      default:
        return map.magicStats;
    }
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

    this.overlay.geometry.dispose();

    this.material.dispose();

    this.texture.dispose();

    this.morra.remove(
      this.overlay
    );
  }
}
