import * as THREE from "three";

import type {
  CelestialBody
} from "../astronomy/CelestialBody";

export type RadiationConeKind =
  | "LIGHT"
  | "HEAT"
  | "MAGIC";

interface RadiationConeDefinition {
  id: string;
  kind: RadiationConeKind;
  color: number;
}

interface RadiationConeVisual {
  group: THREE.Group;
  material: THREE.Material;
  edgeMaterial: THREE.Material;
}

export class RadiationConeVisualizer {

  private readonly scene: THREE.Scene;
  private readonly morra: CelestialBody;
  private readonly definitions: RadiationConeDefinition[];
  private readonly visuals: RadiationConeVisual[] = [];
  private readonly root: THREE.Group;

  private enabled = true;
  private length = 2100;
  private radialScale = 1;
  private rangeScale = 1;
  private opacity = 0.08;
  private edgeOpacity = 0.35;

  constructor(
    scene: THREE.Scene,
    morra: CelestialBody,
    definitions: RadiationConeDefinition[]
  ) {

    this.scene =
      scene;

    this.morra =
      morra;

    this.definitions =
      definitions;

    this.root =
      new THREE.Group();

    this.root.name =
      "Radiation Cones";

    this.scene.add(
      this.root
    );
  }

  setConfig(
    config: {
      enabled?: boolean;
      length?: number;
      radialScale?: number;
      rangeScale?: number;
      opacity?: number;
      edgeOpacity?: number;
    }
  ) {

    if(
      config.enabled !== undefined
    ) {
      this.enabled =
        config.enabled;
    }

    if(
      config.length !== undefined
    ) {
      this.length =
        Math.max(
          1,
          config.length
        );
    }

    if(
      config.radialScale !== undefined
    ) {
      this.radialScale =
        Math.max(
          0.01,
          config.radialScale
        );
    }

    if(
      config.rangeScale !== undefined
    ) {
      this.rangeScale =
        Math.max(
          0.01,
          config.rangeScale
        );
    }

    if(
      config.opacity !== undefined
    ) {
      this.opacity =
        THREE.MathUtils.clamp(
          config.opacity,
          0,
          1
        );
    }

    if(
      config.edgeOpacity !== undefined
    ) {
      this.edgeOpacity =
        THREE.MathUtils.clamp(
          config.edgeOpacity,
          0,
          1
        );
    }
  }

  update(
    sources: CelestialBody[]
  ) {

    this.clear();

    this.root.visible =
      this.enabled;

    if(
      !this.enabled
    ) {
      return;
    }

    for(
      let i = 0;
      i < Math.min(
        sources.length,
        this.definitions.length
      );
      i++
    ) {

      this.addCone(
        sources[i],
        this.definitions[i]
      );
    }
  }

  private addCone(
    source: CelestialBody,
    definition: RadiationConeDefinition
  ) {

    const sourcePosition =
      source.mesh.getWorldPosition(
        new THREE.Vector3()
      );

    const morraPosition =
      this.morra.mesh.getWorldPosition(
        new THREE.Vector3()
      );

    const sourceToMorra =
      morraPosition.clone().sub(sourcePosition);

    const targetDistance =
      sourceToMorra.length();

    if(targetDistance <= 1e-6) {
      return;
    }

    const direction =
      sourceToMorra.normalize();

    const occlusionHit =
      this.findNearestOccluderHit(
        source,
        sourcePosition,
        direction,
        targetDistance
      );

    const visibleDistance =
      occlusionHit?.distance ?? targetDistance;

    if(visibleDistance <= 1) {
      return;
    }

    const sizeFactor =
      source.radius /
      Math.max(this.referenceSourceRadius(), 1e-6);

    const influenceRange =
      this.length *
      sizeFactor *
      this.rangeScale;

    const coneDepth =
      Math.min(
        influenceRange,
        visibleDistance
      );

    if(coneDepth <= 1) {
      return;
    }

    const startRadius =
      Math.max(source.radius, 0.01);

    const radiusGrowth =
      Math.tan(
        THREE.MathUtils.clamp(
          source.radius /
          Math.max(targetDistance, 1e-6),
          0,
          0.45
        )
      ) * this.radialScale;

    const endRadius =
      Math.max(
        startRadius,
        startRadius + coneDepth * radiusGrowth
      );

    const geometry =
      this.createConeGeometry(
        sourcePosition,
        direction,
        coneDepth,
        startRadius,
        endRadius
      );

    const material =
      new THREE.MeshBasicMaterial({
        color: definition.color,
        transparent: true,
        opacity: this.opacity,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });

    const mesh =
      new THREE.Mesh(geometry, material);

    const edgeGeometry =
      new THREE.EdgesGeometry(geometry);

    const edgeMaterial =
      new THREE.LineBasicMaterial({
        color: definition.color,
        transparent: true,
        opacity: this.edgeOpacity,
        depthWrite: false
      });

    mesh.add(
      new THREE.LineSegments(
        edgeGeometry,
        edgeMaterial
      )
    );

    const group =
      new THREE.Group();

    group.name =
      definition.id + "-cone-group";

    group.add(mesh);
    this.root.add(group);

    this.visuals.push({
      group,
      material,
      edgeMaterial
    });
  }

  private createConeGeometry(
    sourcePosition: THREE.Vector3,
    direction: THREE.Vector3,
    depth: number,
    startRadius: number,
    endRadius: number
  ) {

    const radialSegments = 32;
    const basis = this.buildPerpendicularBasis(direction);
    const vertices: number[] = [];
    const indices: number[] = [];

    for(let row = 0; row <= 6; row++) {
      const t = row / 6;
      const distance = depth * t;
      const radius = THREE.MathUtils.lerp(
        startRadius,
        endRadius,
        t
      );

      for(let segment = 0; segment < radialSegments; segment++) {
        const angle =
          segment / radialSegments * Math.PI * 2;

        const radial =
          basis.u.clone().multiplyScalar(Math.cos(angle))
            .add(
              basis.v.clone().multiplyScalar(Math.sin(angle))
            );

        const position =
          sourcePosition.clone()
            .addScaledVector(direction, distance)
            .addScaledVector(radial, radius);

        vertices.push(position.x, position.y, position.z);
      }
    }

    for(let row = 0; row < 6; row++) {
      for(let segment = 0; segment < radialSegments; segment++) {
        const next = (segment + 1) % radialSegments;
        const a = row * radialSegments + segment;
        const b = row * radialSegments + next;
        const c = (row + 1) * radialSegments + next;
        const d = (row + 1) * radialSegments + segment;
        indices.push(a, b, d, b, c, d);
      }
    }

    const geometry =
      new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );

    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
  }

  private buildPerpendicularBasis(
    direction: THREE.Vector3
  ) {

    const reference =
      Math.abs(direction.y) < 0.9
        ? new THREE.Vector3(0, 1, 0)
        : new THREE.Vector3(1, 0, 0);

    const u =
      new THREE.Vector3()
        .crossVectors(direction, reference)
        .normalize();

    const v =
      new THREE.Vector3()
        .crossVectors(direction, u)
        .normalize();

    return { u, v };
  }

  private raySphereEntryDistance(
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    body: CelestialBody
  ) {

    const center =
      body.mesh.getWorldPosition(
        new THREE.Vector3()
      );

    const toCenter =
      center.sub(origin);

    const projection =
      toCenter.dot(direction);

    if(projection <= 0) {
      return null;
    }

    const perpendicularSquared =
      Math.max(
        0,
        toCenter.lengthSq() - projection * projection
      );

    const radius = Math.max(body.radius, 0);
    const radiusSquared = radius * radius;

    if(perpendicularSquared > radiusSquared) {
      return null;
    }

    const offset =
      Math.sqrt(
        Math.max(
          0,
          radiusSquared - perpendicularSquared
        )
      );

    const entry = projection - offset;

    return entry > 1e-4 ? entry : null;
  }

  private findNearestOccluderHit(
    source: CelestialBody,
    origin: THREE.Vector3,
    direction: THREE.Vector3,
    maxDistance: number
  ): {
    body: CelestialBody;
    distance: number;
  } | null {

    const candidates =
      this.getSceneCelestialBodies();

    let nearest:
      {
        body: CelestialBody;
        distance: number;
      } | null =
      null;

    for(
      const body of candidates
    ) {

      if(
        body === source
      ) {
        continue;
      }

      const center =
        body.mesh.getWorldPosition(
          new THREE.Vector3()
        );

      const toCenter =
        center
          .sub(
            origin
          );

      const projection =
        toCenter.dot(
          direction
        );

      if(
        projection <= 0 ||
        projection >=
        maxDistance
      ) {
        continue;
      }

      const perpendicular =
        toCenter
          .sub(
            direction
              .clone()
              .multiplyScalar(
                projection
              )
          );

      const radius =
        Math.max(
          body.radius,
          0
        );

      const radiusSquared =
        radius *
        radius;

      if(
        perpendicular.lengthSq() >
        radiusSquared
      ) {
        continue;
      }

      const hitOffset =
        Math.sqrt(
          Math.max(
            0,
            radiusSquared -
            perpendicular.lengthSq()
          )
        );

      const entry =
        projection -
        hitOffset;

      if(
        entry <=
        1e-4
      ) {
        continue;
      }

      if(
        nearest === null ||
        entry <
        nearest.distance
      ) {

        nearest = {
          body,
          distance:
            entry
        };
      }
    }

    return nearest;
  }

  private getSceneCelestialBodies() {

    const bodies:
      CelestialBody[] = [];

    this.scene.traverse(
      object => {

        const body =
          object.userData
            .celestialBody as
            CelestialBody |
            undefined;

        if(
          body &&
          !bodies.includes(
            body
          )
        ) {

          bodies.push(
            body
          );
        }
      }
    );

    if(
      !bodies.includes(
        this.morra
      )
    ) {

      bodies.push(
        this.morra
      );
    }

    return bodies;
  }

  private referenceSourceRadius() {

    return 40;
  }

  private clear() {

    for(
      const visual of
      this.visuals
    ) {

      visual.group.traverse(
        object => {

          const mesh =
            object as THREE.Mesh;

          const line =
            object as THREE.LineSegments;

          if(
            mesh.geometry
          ) {

            mesh.geometry.dispose();
          }

          if(
            line.geometry
          ) {

            line.geometry.dispose();
          }
        }
      );

      visual.material.dispose();
      visual.edgeMaterial.dispose();
    }

    this.visuals.length =
      0;

    while(
      this.root.children.length >
      0
    ) {

      this.root.remove(
        this.root.children[
          this.root.children.length - 1
        ]
      );
    }
  }

  dispose() {

    this.clear();

    this.root.removeFromParent();
  }
}
