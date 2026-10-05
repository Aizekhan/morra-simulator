import * as THREE from "three";

import {
  CelestialBody
} from "../astronomy/CelestialBody";

export interface EclipseShadowConfig {

  enabled: boolean;

  opacity: number;

  softness: number;
}

interface EclipsePair {

  source: CelestialBody;

  occluder: CelestialBody;

  material:
    THREE.ShaderMaterial;
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
          occluderDirections: {
            value:
              Array.from(
                { length: 4 },
                () =>
                  new THREE.Vector3()
              )
          },
          occluderAngularRadii: {
            value:
              new Float32Array(4)
          },
          sourceAngularRadii: {
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
          uniform vec3 occluderDirections[4];
          uniform float occluderAngularRadii[4];
          uniform float sourceAngularRadii[4];

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

              vec3 sourceDirection =
                normalize(
                  sourcePositions[i] -
                  vWorldPosition
                );

              float angularSeparation =
                acos(
                  clamp(
                    dot(
                      sourceDirection,
                      occluderDirections[i]
                    ),
                    -1.0,
                    1.0
                  )
                );

              float sourceRadius =
                sourceAngularRadii[i];

              float occluderRadius =
                occluderAngularRadii[i];

              float umbraEdge =
                max(
                  occluderRadius -
                  sourceRadius,
                  0.0
                );

              float fullUmbra =
                1.0 -
                smoothstep(
                  max(
                    0.0,
                    umbraEdge -
                    softness *
                    sourceRadius
                  ),
                  umbraEdge +
                  softness *
                  sourceRadius,
                  angularSeparation
                );

              float penumbra =
                1.0 -
                smoothstep(
                  max(
                    0.0,
                    occluderRadius -
                    sourceRadius -
                    softness *
                    sourceRadius
                  ),
                  occluderRadius +
                  sourceRadius +
                  softness *
                  sourceRadius,
                  angularSeparation
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
                    fullUmbra,
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

    const occluderDirections =
      this.material.uniforms.occluderDirections.value as
      THREE.Vector3[];

    const sourceAngularRadii =
      this.material.uniforms.sourceAngularRadii.value as
      Float32Array;

    const occluderAngularRadii =
      this.material.uniforms.occluderAngularRadii.value as
      Float32Array;

    this.material.uniforms.sourcePositions.needsUpdate = true;
    this.material.uniforms.occluderDirections.needsUpdate = true;

    for(let i = 0; i < 4; i++) {
      sourcePositions[i].set(0, 0, 0);
      occluderDirections[i].set(0, 0, 1);
      sourceAngularRadii[i] = 0;
      occluderAngularRadii[i] = 0;
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

        sourcePositions[count].copy(
          sourcePosition
        );

        occluderDirections[count].copy(
          direction
        );

        sourceAngularRadii[count] =
          Math.asin(
            THREE.MathUtils.clamp(
              source.radius /
              Math.max(
                sourceDistance,
                1e-6
              ),
              0,
              0.999999
            )
          );

        occluderAngularRadii[count] =
          Math.asin(
            THREE.MathUtils.clamp(
              occluder.radius /
              Math.max(
                projection,
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

    this.material.uniforms.sourceAngularRadii.needsUpdate =
      true;

    this.material.uniforms.occluderAngularRadii.needsUpdate =
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
