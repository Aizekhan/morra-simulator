import * as THREE from "three";

import {
  MorraEnvironmentEngine
} from "../physics/MorraEnvironmentEngine";

export class RadiationRayVisualizer {

  private readonly engine:
    MorraEnvironmentEngine;

  private readonly root:
    THREE.Group;

  private readonly lines:
    THREE.Line[];

  private readonly marker:
    THREE.Mesh;

  private localPoint:
    THREE.Vector3 | null =
    new THREE.Vector3(
      1,
      0,
      0
    );

  private enabled =
    true;

  private readonly centerMarker:
    THREE.Mesh;

  constructor(
    scene: THREE.Scene,
    engine: MorraEnvironmentEngine
  ) {

    this.engine =
      engine;

    this.root =
      new THREE.Group();

    this.root.name =
      "RadiationRayDebug";

    scene.add(
      this.root
    );

    this.lines = [];

    this.marker =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          4,
          12,
          12
        ),
        new THREE.MeshBasicMaterial({
          color:
            0xffffff
        })
      );

    this.root.add(
      this.marker
    );

    this.centerMarker =
      new THREE.Mesh(
        new THREE.SphereGeometry(8, 16, 16),
        new THREE.MeshBasicMaterial({
          color: 0x00ffff
        })
      );

    this.root.add(
      this.centerMarker
    );

    this.marker.visible =
      false;

    this.centerMarker.visible =
      false;
  }

  setPoint(
    localPoint:
      THREE.Vector3 | null
  ) {

    this.localPoint =
      localPoint
        ? localPoint.clone()
        : null;
  }

  setEnabled(
    enabled: boolean
  ) {

    this.enabled =
      enabled;

    this.root.visible =
      enabled;
  }

  update() {

    if(
      !this.enabled ||
      !this.localPoint
    ) {
      this.clearLines();
      this.marker.visible =
        false;
      return;
    }

    const sample =
      this.engine
        .evaluateLocalPoint(
          this.localPoint
        );

    const center =
      this.engine.morra.mesh.getWorldPosition(
        new THREE.Vector3()
      );

    this.centerMarker.position.copy(center);
    this.centerMarker.visible = true;

    this.marker.position.copy(
      sample.point
    );

    this.marker.visible =
      true;

    this.clearLines();

    const sources =
      this.engine.radiation.getSources();

    for(
      const contribution
      of sample.radiation.contributions
    ) {

      const source =
        sources.find(
          item =>
            item.id ===
            contribution.sourceId
        );

      if(
        !source
      ) {
        continue;
      }

      const sourcePosition =
        source.body.mesh
          .getWorldPosition(
            new THREE.Vector3()
          );

      const geometry =
        new THREE.BufferGeometry();

      geometry.setFromPoints([
        sample.point,
        sourcePosition
      ]);

      const color =
        contribution.visibilityFactor >=
          0.999
          ? 0x55ff88
          : contribution.visibilityFactor > 0
            ? 0xffc857
            : 0xff3344;

      const material =
        new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0.9
        });

      const line =
        new THREE.Line(
          geometry,
          material
        );

      this.lines.push(
        line
      );

      this.root.add(
        line
      );
    }
  }

  private clearLines() {

    for(
      const line of this.lines
    ) {

      line.geometry.dispose();

      const material =
        line.material;

      if(
        material instanceof
        THREE.Material
      ) {
        material.dispose();
      }

      this.root.remove(
        line
      );
    }

    this.lines.length =
      0;
  }

  dispose() {

    this.clearLines();

    this.marker.geometry.dispose();

    const material =
      this.marker.material;

    if(
      material instanceof
      THREE.Material
    ) {
      material.dispose();
    }

    this.root.remove(
      this.marker
    );

    this.centerMarker.geometry.dispose();

    const centerMaterial =
      this.centerMarker.material;

    if(
      centerMaterial instanceof
      THREE.Material
    ) {
      centerMaterial.dispose();
    }

    this.root.remove(
      this.centerMarker
    );

    this.engine.morra.mesh.remove(
      this.root
    );

    this.root.removeFromParent();
  }
}
