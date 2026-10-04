import * as THREE from "three";

import type {
  SurfaceFieldMap
} from "../physics/SurfaceFieldEngine";

export type SurfaceFieldChannel =
  | "LIGHT"
  | "HEAT"
  | "MAGIC"
  | "MAGOSPHERE"
  | "ANOMALY";

export class SurfaceFieldVisualizer {

  private readonly morra:
    THREE.Mesh;

  private readonly overlay:
    THREE.Mesh;

  private readonly material:
    THREE.ShaderMaterial;

  private readonly texture:
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
    morra: THREE.Mesh
  ) {

    this.morra =
      morra;

    const initialWidth =
      engine.getConfig()
        .longitudeSegments;

    const initialHeight =
      engine.getConfig()
        .latitudeSegments;

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

    this.texture.needsUpdate =
      true;

    this.material =
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          fieldTexture: {
            value:
              this.texture
          },
          opacity: {
            value:
              this.opacity
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

          varying vec2 vUv;

          void main() {

            float value =
              texture2D(
                fieldTexture,
                vUv
              ).r;

            vec3 cold =
              vec3(
                0.02,
                0.08,
                0.35
              );

            vec3 hot =
              vec3(
                1.0,
                0.85,
                0.12
              );

            vec3 color =
              mix(
                cold,
                hot,
                value
              );

            float alpha =
              opacity *
              smoothstep(
                0.0,
                0.08,
                value
              );

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

    if(
      this.lastMap
    ) {
      this.updateMap(
        this.lastMap
      );
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

    if(
      this.lastMap ===
      map
    ) {
      return;
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

    const range =
      Math.max(
        stats.max -
          stats.min,
        Number.EPSILON
      );

    for(
      let index = 0;
      index < values.length;
      index++
    ) {

      const normalized =
        THREE.MathUtils.clamp(
          (
            values[index] -
            stats.min
          ) /
          range,
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
