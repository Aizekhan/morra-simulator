import * as THREE from "three";

import {
  CelestialBody
} from "../astronomy/CelestialBody";

export interface EclipseShadowConfig {

  enabled: boolean;

  opacity: number;

  softness: number;
}

export class EclipseShadowVisualizer {

  private readonly morra:
    CelestialBody;

  private readonly root:
    THREE.Group;

  private readonly overlay:
    THREE.Mesh;

  private readonly material:
    THREE.ShaderMaterial;

  private config:
    EclipseShadowConfig;

  constructor(
    scene: THREE.Scene,
    morra: CelestialBody,
    config:
      EclipseShadowConfig
  ) {

    this.morra =
      morra;

    this.config = {
      enabled:
        config.enabled,
      opacity:
        THREE.MathUtils.clamp(
          config.opacity,
          0,
          1
        ),
      softness:
        THREE.MathUtils.clamp(
          config.softness,
          0,
          1
        )
    };

    this.root =
      new THREE.Group();

    this.root.name =
      "EclipseShadow";

    scene.add(
      this.root
    );

    this.material =
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        depthTest: true,
        side: THREE.FrontSide,
        toneMapped: false,
        uniforms: {
          enabled: {
            value:
              this.config.enabled
          },
          eclipseCount: {
            value: 0
          },
          opacity: {
            value:
              this.config.opacity
          },
          softness: {
            value:
              this.config.softness
          },
          morraCenter: {
            value:
              new THREE.Vector3()
          },
          morraRadius: {
            value:
              this.morra.radius
          },
          sourcePositions: {
            value:
              Array.from(
                { length: 4 },
                () =>
                  new THREE.Vector3()
              )
          },
          shadowCenters: {
            value:
              Array.from(
                { length: 4 },
                () =>
                  new THREE.Vector3()
              )
          },
          umbraAngularRadii: {
            value:
              new Float32Array(4)
          },
          penumbraAngularRadii: {
            value:
              new Float32Array(4)
          }
        },
        vertexShader: `
          varying vec3 vWorldPosition;
          varying vec3 vWorldNormal;

          void main() {

            vec4 worldPosition =
              modelMatrix *
              vec4(
                position,
                1.0
              );

            vWorldPosition =
              worldPosition.xyz;

            vWorldNormal =
              normalize(
                mat3(
                  modelMatrix
                ) *
                normal
              );

            gl_Position =
              projectionMatrix *
              viewMatrix *
              worldPosition;
          }
        `,
        fragmentShader: `
          uniform bool enabled;
          uniform int eclipseCount;
          uniform float opacity;
          uniform float softness;
          uniform vec3 morraCenter;
          uniform float morraRadius;

          uniform vec3 sourcePositions[4];
          uniform vec3 shadowCenters[4];
          uniform float umbraAngularRadii[4];
          uniform float penumbraAngularRadii[4];

          varying vec3 vWorldPosition;
          varying vec3 vWorldNormal;

          void main() {

            if(!enabled || eclipseCount <= 0) {
              discard;
            }

            vec3 pointDirection =
              normalize(
                vWorldPosition -
                morraCenter
              );

            float totalShadow =
              0.0;

            for(int i = 0; i < 4; i++) {

              if(i >= eclipseCount) {
                break;
              }

              float shadowSeparation =
                acos(
                  clamp(
                    dot(
                      pointDirection,
                      shadowCenters[i]
                    ),
                    -1.0,
                    1.0
                  )
                );

              float umbraRadius =
                umbraAngularRadii[i];

              float penumbraRadius =
                penumbraAngularRadii[i];

              float umbraEdge =
                1.0 -
                smoothstep(
                  max(
                    0.0,
                    umbraRadius -
                    softness *
                    umbraRadius
                  ),
                  umbraRadius +
                  softness *
                  umbraRadius,
                  shadowSeparation
                );

              float penumbra =
                1.0 -
                smoothstep(
                  max(
                    0.0,
                    penumbraRadius -
                    softness *
                    penumbraRadius
                  ),
                  penumbraRadius +
                  softness *
                  penumbraRadius,
                  shadowSeparation
                );

              vec3 sourceDirection =
                normalize(
                  sourcePositions[i] -
                  vWorldPosition
                );

              float facing =
                max(
                  dot(
                    vWorldNormal,
                    sourceDirection
                  ),
                  0.0
                );

              totalShadow =
                max(
                  totalShadow,
                  max(
                    umbraEdge,
                    penumbra *
                    0.65
                  ) *
                  facing
                );
            }

            float alpha =
              totalShadow *
              opacity;

            if(alpha <= 0.001) {
              discard;
            }

            gl_FragColor =
              vec4(
                vec3(0.0),
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

    this.overlay.name =
      "EclipseShadowSurface";

    this.overlay.scale.setScalar(
      this.morra.radius * 1.003
    );

    this.overlay.renderOrder =
      3;

    this.root.add(
      this.overlay
    );
  }

  setConfig(
    config:
      Partial<EclipseShadowConfig>
  ) {

    this.config = {
      ...this.config,
      ...config,
      opacity:
        THREE.MathUtils.clamp(
          config.opacity ??
            this.config.opacity,
          0,
          1
        ),
      softness:
        THREE.MathUtils.clamp(
          config.softness ??
            this.config.softness,
          0,
          1
        )
    };

    this.material.uniforms.enabled.value =
      this.config.enabled;

    this.material.uniforms.opacity.value =
      this.config.opacity;

    this.material.uniforms.softness.value =
      this.config.softness;

    this.root.visible =
      this.config.enabled;
  }

  update(
    sources: CelestialBody[],
    occluders: CelestialBody[]
  ) {

    if(
      !this.config.enabled
    ) {
      this.root.visible =
        false;
      return;
    }

    this.root.visible =
      true;

    const center =
      this.morra.mesh.getWorldPosition(
        new THREE.Vector3()
      );

    this.material.uniforms.morraCenter.value.copy(
      center
    );

    this.material.uniforms.morraRadius.value =
      this.morra.radius;

    const sourcePositions =
      this.material.uniforms.sourcePositions.value as
      THREE.Vector3[];

    const shadowCenters =
      this.material.uniforms.shadowCenters.value as
      THREE.Vector3[];

    const umbraAngularRadii =
      this.material.uniforms.umbraAngularRadii.value as
      Float32Array;

    const penumbraAngularRadii =
      this.material.uniforms.penumbraAngularRadii.value as
      Float32Array;

    this.material.uniforms.sourcePositions.needsUpdate = true;
    this.material.uniforms.shadowCenters.needsUpdate = true;

    for(let i = 0; i < 4; i++) {
      sourcePositions[i].set(0, 0, 0);
      shadowCenters[i].set(0, 0, 1);
      umbraAngularRadii[i] = 0;
      penumbraAngularRadii[i] = 0;
    }

    let count =
      0;

    for(
      const source
      of sources
    ) {

      if(
        count >= 4 ||
        !source.mesh.visible
      ) {
        continue;
      }

      const sourcePosition =
        source.mesh.getWorldPosition(
          new THREE.Vector3()
        );

      const sourceDistance =
        sourcePosition
          .distanceTo(
            center
          );

      if(
        sourceDistance <=
        this.morra.radius
      ) {
        continue;
      }

      for(
        const occluder
        of occluders
      ) {

        if(
          count >= 4 ||
          occluder === source ||
          !occluder.mesh.visible
        ) {
          continue;
        }

        const occluderPosition =
          occluder.mesh.getWorldPosition(
            new THREE.Vector3()
          );

        const sourceToOccluder =
          occluderPosition
            .clone()
            .sub(
              sourcePosition
            );

        const sourceToOccluderDistance =
          sourceToOccluder.length();

        if(
          sourceToOccluderDistance <=
          1e-6
        ) {
          continue;
        }

        const direction =
          sourceToOccluder
            .normalize();

        const sourceToMorra =
          center
            .clone()
            .sub(
              sourcePosition
            );

        const axis =
          sourceToMorra
            .normalize();

        const projection =
          occluderPosition
            .clone()
            .sub(
              sourcePosition
            )
            .dot(
              axis
            );

        const morraDistance =
          center
            .distanceTo(
              sourcePosition
            );

        if(
          projection <= 0 ||
          projection >=
          morraDistance
        ) {
          continue;
        }

        const lateral =
          occluderPosition
            .clone()
            .sub(
              sourcePosition
            )
            .sub(
              axis.clone()
                .multiplyScalar(
                  projection
                )
            )
            .length();

        const projectedOccluderRadius =
          occluder.radius *
          morraDistance /
          Math.max(
            projection,
            1e-6
          );

        const projectedSourceRadius =
          source.radius *
          (
            morraDistance -
            projection
          ) /
          Math.max(
            projection,
            1e-6
          );

        const umbraRadius =
          Math.max(
            0,
            projectedOccluderRadius -
            projectedSourceRadius
          );

        const penumbraRadius =
          projectedOccluderRadius +
          projectedSourceRadius;

        if(
          lateral >
          penumbraRadius
        ) {
          continue;
        }

        const shadowCenter =
          sourcePosition
            .clone()
            .addScaledVector(
              axis,
              morraDistance
            );

        const projectedOffset =
          occluderPosition
            .clone()
            .sub(
              shadowCenter
            )
            .length();

        sourcePositions[count].copy(
          sourcePosition
        );

        shadowCenters[count].copy(
          occluderPosition
            .clone()
            .sub(
              center
            )
            .normalize()
        );

        umbraAngularRadii[count] =
          Math.asin(
            THREE.MathUtils.clamp(
              umbraRadius /
              Math.max(
                morraDistance,
                1e-6
              ),
              0,
              0.999999
            )
          );

        penumbraAngularRadii[count] =
          Math.asin(
            THREE.MathUtils.clamp(
              penumbraRadius /
              Math.max(
                morraDistance,
                1e-6
              ),
              0,
              0.999999
            )
          );

        count +=
          1;
      }
    }

    this.material.uniforms.eclipseCount.value =
      count;

    this.material.uniforms.umbraAngularRadii.needsUpdate =
      true;

    this.material.uniforms.penumbraAngularRadii.needsUpdate =
      true;
  }

  setRadius(
    radius: number
  ) {

    this.overlay.scale.setScalar(
      radius * 1.003
    );
  }

  dispose() {

    this.overlay.geometry.dispose();
    this.material.dispose();
    this.root.removeFromParent();
  }
}
