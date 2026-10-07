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

  private readonly material:
    THREE.ShaderMaterial;

  private readonly texture:
    THREE.DataTexture;

  private baseTexture:
    THREE.Texture | null = null;

  private readonly surfaceMesh:
    THREE.Mesh;

  private width: number;
  private height: number;
  private surfaceRadius = 1;
  private enabled = true;
  private channel: SurfaceFieldChannel = "LIGHT_TOTAL";
  private opacity = 1;
  private lastMap: SurfaceFieldMap | null = null;

  constructor(
    morra: THREE.Mesh,
    initialWidth: number,
    initialHeight: number
  ) {

    this.morra = morra;
    this.width = initialWidth;
    this.height = initialHeight;

    this.texture = new THREE.DataTexture(
      new Uint8Array(initialWidth * initialHeight * 4),
      initialWidth,
      initialHeight,
      THREE.RGBAFormat,
      THREE.UnsignedByteType
    );

    this.texture.flipY = false;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.colorSpace = THREE.NoColorSpace;
    this.texture.needsUpdate = true;

    this.material = new THREE.ShaderMaterial({
      transparent: false,
      depthWrite: true,
      depthTest: true,
      side: THREE.FrontSide,
      toneMapped: false,
      uniforms: {
        fieldTexture: { value: this.texture },
        baseTexture: { value: null },
        physicalExposure: { value: 1 },
        physicalFloor: { value: 0.03 },
        physicalGamma: { value: 0.5 }
      },

      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position =
            projectionMatrix *
            modelViewMatrix *
            vec4(position, 1.0);
        }
      `,

      fragmentShader: `
        uniform sampler2D fieldTexture;
        uniform sampler2D baseTexture;
        uniform float physicalExposure;
        uniform float physicalFloor;
        uniform float physicalGamma;

        varying vec2 vUv;

        void main() {
          vec4 base = texture2D(baseTexture, vUv);

          float lightSignal =
            clamp(
              texture2D(fieldTexture, vUv).r *
              physicalExposure,
              0.0,
              1.0
            );

          float brightness =
            mix(
              physicalFloor,
              1.0,
              pow(lightSignal, physicalGamma)
            );

          gl_FragColor =
            vec4(
              base.rgb * brightness,
              1.0
            );
        }
      `
    });

    this.surfaceMesh =
      this.materialMesh();

    this.morra.add(
      this.surfaceMesh
    );

    this.setRadius(this.surfaceRadius);
    this.setEnabled(true);
  }

  private materialMesh() {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 32),
      this.material
    );

    mesh.name = "Morra Physical Surface";
    mesh.renderOrder = 1;
    mesh.frustumCulled = false;
    mesh.userData.isMorraPhysicalSurface = true;

    return mesh;
  }

  private get mesh(): THREE.Mesh {
    return this.surfaceMesh;
  }

  setBaseTexture(texture: THREE.Texture | null) {
    this.baseTexture = texture;
    this.material.uniforms.baseTexture.value =
      texture ?? null;
  }

  setChannel(channel: SurfaceFieldChannel) {
    this.channel = channel;
    if(this.lastMap) {
      this.updateMap(this.lastMap);
    }
  }

  getChannel() {
    return this.channel;
  }

  setOpacity(opacity: number) {
    this.opacity = THREE.MathUtils.clamp(opacity, 0, 1);
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    this.mesh.visible = enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  update(map: SurfaceFieldMap | null) {
    if(!map) return;

    if(
      map.width !== this.width ||
      map.height !== this.height
    ) {
      this.recreateTexture(map.width, map.height);
    }

    this.lastMap = map;
    this.updateMap(map);
  }

  setRadius(radius: number) {
    this.surfaceRadius = radius;
    this.mesh.scale.setScalar(radius * 1.0002);
  }

  private updateMap(map: SurfaceFieldMap) {
    const data = this.texture.image.data as Uint8Array;

    const values = this.getChannelValues(map);
    const stats = this.getChannelStats(map);
    const hasRange =
      Number.isFinite(stats.min) &&
      Number.isFinite(stats.max) &&
      stats.max > stats.min;
    const range = hasRange ? stats.max - stats.min : 1;

    for(let i = 0; i < values.length; i++) {
      const raw = Number.isFinite(values[i]) ? values[i] : 0;

      const normalized =
        this.channel === "LIGHT_TOTAL"
          ? THREE.MathUtils.clamp(raw * 1000000, 0, 1)
          : hasRange
            ? THREE.MathUtils.clamp((raw - stats.min) / range, 0, 1)
            : THREE.MathUtils.clamp(raw, 0, 1);

      const offset = i * 4;
      data[offset] = Math.round(normalized * 255);
      data[offset + 1] = Math.round(normalized * 255);
      data[offset + 2] = Math.round(normalized * 255);
      data[offset + 3] = 255;
    }

    this.texture.needsUpdate = true;
  }

  private getChannelValues(map: SurfaceFieldMap) {
    switch(this.channel) {
      case "MAGOSPHERE": return map.magosphereStability;
      case "ANOMALY": return map.anomalyStrength;
      case "SHADOW": return map.shadow;
      case "UMBRA": return map.umbra;
      case "PENUMBRA": return map.penumbra;
      case "LARGE_SUN": return map.largeSunLight;
      case "MEDIUM_SUN": return map.mediumSunLight;
      case "SMALL_SUN": return map.smallSunLight;
      case "NORTH_MOON": return map.northMoonLight;
      case "EQUATOR_MOON": return map.equatorMoonLight;
      case "SPECTRUM": return map.spectrumIntensity;
      case "DAY_NIGHT": return map.dayNight;
      case "HEAT_TOTAL": return map.heat;
      case "MAGIC_TOTAL": return map.magic;
      case "LIGHT_TOTAL":
      default:
        return map.light;
    }
  }

  private getChannelStats(map: SurfaceFieldMap) {
    switch(this.channel) {
      case "MAGOSPHERE":
        return { min: 0, max: 1, average: this.average(map.magosphereStability) };
      case "ANOMALY":
        return { min: 0, max: 1, average: this.average(map.anomalyStrength) };
      case "SHADOW":
        return map.shadowStats;
      case "UMBRA":
        return { min: 0, max: 1, average: this.average(map.umbra) };
      case "PENUMBRA":
        return { min: 0, max: 1, average: this.average(map.penumbra) };
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

  private average(values: Float32Array) {
    let sum = 0;
    for(const value of values) sum += value;
    return sum / Math.max(values.length, 1);
  }

  private recreateTexture(width: number, height: number) {
    this.texture.image = {
      data: new Uint8Array(width * height * 4),
      width,
      height
    };
    this.width = width;
    this.height = height;
    this.texture.needsUpdate = true;
  }

  dispose() {
    this.surfaceMesh.removeFromParent();
    this.surfaceMesh.geometry.dispose();
    this.material.dispose();
    this.texture.dispose();
  }
}
