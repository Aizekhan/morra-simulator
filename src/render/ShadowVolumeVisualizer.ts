import * as THREE from "three";

import {
  MorraEnvironmentEngine
} from "../physics/MorraEnvironmentEngine";

export interface ShadowVolumeConfig {

  length: number;

  opacity: number;

  showUmbra: boolean;

  showPenumbra: boolean;
}

interface ShadowPair {

  source: THREE.Object3D;

  occluder: THREE.Object3D;

  sourceBody:
    {
      radius: number;
    };

  occluderBody:
    {
      radius: number;
    };

  umbra:
    THREE.Mesh | null;

  penumbra:
    THREE.Mesh | null;
}

export class ShadowVolumeVisualizer {

  private readonly engine:
    MorraEnvironmentEngine;

  private readonly root:
    THREE.Group;

  private readonly umbraMaterial:
    THREE.MeshBasicMaterial;

  private readonly penumbraMaterial:
    THREE.MeshBasicMaterial;

  private readonly pairs:
    ShadowPair[] = [];

  private config:
    ShadowVolumeConfig;

  private dirty =
    true;

  constructor(
    scene: THREE.Scene,
    engine: MorraEnvironmentEngine,
    config:
      ShadowVolumeConfig
  ) {

    this.engine =
      engine;

    this.config = {
      length:
        Math.max(
          50,
          config.length
        ),
      opacity:
        THREE.MathUtils.clamp(
          config.opacity,
          0,
          1
        ),
      showUmbra:
        config.showUmbra,
      showPenumbra:
        config.showPenumbra
    };

    this.root =
      new THREE.Group();

    this.root.name =
      "ShadowVolumes";

    scene.add(
      this.root
    );

    this.umbraMaterial =
      new THREE.MeshBasicMaterial({
        color:
          0xff2020,
        transparent:
          true,
        opacity:
          this.config.opacity * 0.9,
        depthWrite:
          false,
        side:
          THREE.DoubleSide
      });

    this.penumbraMaterial =
      new THREE.MeshBasicMaterial({
        color:
          0xffc247,
        transparent:
          true,
        opacity:
          this.config.opacity * 0.32,
        depthWrite:
          false,
        side:
          THREE.DoubleSide
      });
  }

  setConfig(
    config:
      Partial<ShadowVolumeConfig>
  ) {

    this.config = {
      ...this.config,
      ...config
    };

    this.config.length =
      Math.max(
        50,
        this.config.length
      );

    this.config.opacity =
      THREE.MathUtils.clamp(
        this.config.opacity,
        0,
        1
      );

    this.umbraMaterial.opacity =
      this.config.opacity *
      0.9;

    this.penumbraMaterial.opacity =
      this.config.opacity *
      0.32;

    this.dirty =
      true;
  }

  update() {

    if(
      !this.dirty
    ) {
      this.updateTransforms();
      return;
    }

    this.clear();

    const sources =
      this.engine.radiation.getSources();

    const occluders =
      this.engine.getOccluders();

    for(
      const source
      of sources
    ) {

      if(
        !source.body.mesh.visible
      ) {
        continue;
      }

      for(
        const occluder
        of occluders
      ) {

        if(
          occluder ===
          source.body ||
          !occluder.mesh.visible
        ) {
          continue;
        }

        const pair: ShadowPair = {
          source:
            source.body.mesh,
          occluder:
            occluder.mesh,
          sourceBody:
            source.body,
          occluderBody:
            occluder,
          umbra:
            null,
          penumbra:
            null
        };

        this.pairs.push(
          pair
        );

        this.buildPairGeometry(
          pair
        );
      }
    }

    this.dirty =
      false;
  }

  private buildPairGeometry(
    pair:
      ShadowPair
  ) {

    const sourcePosition =
      pair.source.getWorldPosition(
        new THREE.Vector3()
      );

    const occluderPosition =
      pair.occluder.getWorldPosition(
        new THREE.Vector3()
      );

    const axis =
      occluderPosition
        .clone()
        .sub(
          sourcePosition
        );

    const sourceDistance =
      axis.length();

    if(
      sourceDistance <=
      pair.sourceBody.radius +
      pair.occluderBody.radius +
      0.001
    ) {
      return;
    }

    axis.normalize();

    const sourceRadius =
      pair.sourceBody.radius;

    const occluderRadius =
      pair.occluderBody.radius;

    const length =
      this.getEffectiveLength(
        sourceRadius,
        occluderRadius,
        sourceDistance
      );

    const startGap =
      Math.max(
        1,
        occluderRadius *
        0.03
      );

    const start =
      occluderPosition
        .clone()
        .addScaledVector(
          axis,
          startGap
        );

    const visiblePenumbra =
      this.config.showPenumbra &&
      this.addPenumbra(
        pair,
        start,
        axis,
        sourceDistance,
        sourceRadius,
        occluderRadius,
        length
      );

    if(
      this.config.showUmbra
    ) {
      this.addUmbra(
        pair,
        start,
        axis,
        sourceDistance,
        sourceRadius,
        occluderRadius,
        length
      );
    }

    if(
      !visiblePenumbra &&
      !pair.umbra
    ) {
      return;
    }
  }

  private addPenumbra(
    pair:
      ShadowPair,
    start:
      THREE.Vector3,
    axis:
      THREE.Vector3,
    sourceDistance:
      number,
    sourceRadius:
      number,
    occluderRadius:
      number,
    length:
      number
  ) {

    const tangent =
      (sourceRadius +
        occluderRadius) /
      sourceDistance;

    const endRadius =
      occluderRadius +
      length *
      tangent;

    const geometry =
      new THREE.CylinderGeometry(
        endRadius,
        occluderRadius,
        length,
        40,
        1,
        true
      );

    const mesh =
      new THREE.Mesh(
        geometry,
        this.penumbraMaterial
      );

    this.alignAlongAxis(
      mesh,
      start,
      axis,
      length
    );

    mesh.userData.shadowType =
      "PENUMBRA";

    mesh.userData.sourceId =
      pair.source.userData.radiationId ??
      pair.source.uuid;

    mesh.userData.occluderId =
      pair.occluder.userData.radiationId ??
      pair.occluder.uuid;

    this.root.add(
      mesh
    );

    pair.penumbra =
      mesh;

    return true;
  }

  private addUmbra(
    pair:
      ShadowPair,
    start:
      THREE.Vector3,
    axis:
      THREE.Vector3,
    sourceDistance:
      number,
    sourceRadius:
      number,
    occluderRadius:
      number,
    length:
      number
  ) {

    if(
      occluderRadius <=
      sourceRadius
    ) {
      return;
    }

    const apexDistance =
      sourceDistance *
      occluderRadius /
      (
        occluderRadius -
        sourceRadius
      );

    const umbraLength =
      Math.min(
        length,
        Math.max(
          1,
          apexDistance -
          Math.max(
            1,
            occluderRadius *
            0.03
          )
        )
      );

    if(
      umbraLength <=
      1
    ) {
      return;
    }

    const geometry =
      new THREE.ConeGeometry(
        occluderRadius,
        umbraLength,
        40,
        1,
        true
      );

    const mesh =
      new THREE.Mesh(
        geometry,
        this.umbraMaterial
      );

    this.alignAlongAxis(
      mesh,
      start,
      axis,
      umbraLength
    );

    mesh.userData.shadowType =
      "UMBRA";

    mesh.userData.sourceId =
      pair.source.userData.radiationId ??
      pair.source.uuid;

    mesh.userData.occluderId =
      pair.occluder.userData.radiationId ??
      pair.occluder.uuid;

    this.root.add(
      mesh
    );

    pair.umbra =
      mesh;
  }

  private alignAlongAxis(
    mesh:
      THREE.Mesh,
    start:
      THREE.Vector3,
    axis:
      THREE.Vector3,
    length:
      number
  ) {

    mesh.position
      .copy(start)
      .addScaledVector(
        axis,
        length *
        0.5
      );

    mesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(
        0,
        1,
        0
      ),
      axis
    );

    mesh.updateMatrixWorld();
  }

  private getEffectiveLength(
    sourceRadius:
      number,
    occluderRadius:
      number,
    sourceDistance:
      number
  ) {

    if(
      occluderRadius <=
      sourceRadius
    ) {
      return this.config.length;
    }

    const apexDistance =
      sourceDistance *
      occluderRadius /
      (
        occluderRadius -
        sourceRadius
      );

    return Math.min(
      this.config.length,
      Math.max(
        100,
        apexDistance
      )
    );
  }

  private updateTransforms() {

    for(
      const pair
      of this.pairs
    ) {

      this.updateMeshTransform(
        pair.penumbra
      );

      this.updateMeshTransform(
        pair.umbra
      );
    }
  }

  private updateMeshTransform(
    mesh:
      THREE.Mesh | null
  ) {

    if(
      !mesh
    ) {
      return;
    }

    // Rebuild is required when object radii/positions
    // change; mark dirty externally through setConfig.
    // This branch intentionally keeps transforms cheap.
  }

  private clear() {

    for(
      const pair
      of this.pairs
    ) {

      if(
        pair.penumbra
      ) {
        pair.penumbra.geometry.dispose();
        this.root.remove(
          pair.penumbra
        );
      }

      if(
        pair.umbra
      ) {
        pair.umbra.geometry.dispose();
        this.root.remove(
          pair.umbra
        );
      }
    }

    this.pairs.length =
      0;
  }

  dispose() {

    this.clear();

    this.umbraMaterial.dispose();

    this.penumbraMaterial.dispose();

    this.root.removeFromParent();
  }
}
