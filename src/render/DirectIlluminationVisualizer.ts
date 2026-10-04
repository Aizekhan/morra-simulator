import * as THREE from "three";

import {
  MorraEnvironmentEngine
} from "../physics/MorraEnvironmentEngine";

export class DirectIlluminationVisualizer {

  private readonly engine:
    MorraEnvironmentEngine;

  private readonly root:
    THREE.Group;

  private readonly beams:
    THREE.Line[] = [];

  private readonly spots:
    THREE.Mesh[] = [];

  private enabled =
    true;

  constructor(
    scene: THREE.Scene,
    engine: MorraEnvironmentEngine
  ) {

    this.engine =
      engine;

    this.root =
      new THREE.Group();

    this.root.name =
      "DirectIllumination";

    scene.add(
      this.root
    );
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
      !this.enabled
    ) {
      this.clear();
      return;
    }

    const center =
      this.engine.morra.mesh
        .getWorldPosition(
          new THREE.Vector3()
        );

    const radius =
      this.engine.morra.radius;

    this.clear();

    for(
      const source
      of this.engine.radiation.getSources()
    ) {

      if(
        !source.body.mesh.visible
      ) {
        continue;
      }

      const sourcePosition =
        source.body.mesh
          .getWorldPosition(
            new THREE.Vector3()
          );

      const direction =
        sourcePosition
          .clone()
          .sub(
            center
          );

      const distance =
        Math.max(
          direction.length(),
          0.001
        );

      direction.normalize();

      const surfacePoint =
        center
          .clone()
          .addScaledVector(
            direction,
            radius *
            1.002
          );

      const beamGeometry =
        new THREE.BufferGeometry();

      beamGeometry.setFromPoints([
        sourcePosition,
        surfacePoint
      ]);

      const color =
        source.body.mesh.material instanceof
        THREE.MeshBasicMaterial
          ? source.body.mesh.material.color.getHex()
          : 0xffffff;

      const beamMaterial =
        new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity: 0.28
        });

      const beam =
        new THREE.Line(
          beamGeometry,
          beamMaterial
        );

      this.root.add(
        beam
      );

      this.beams.push(
        beam
      );

      const apparentRadius =
        THREE.MathUtils.clamp(
          radius *
          Math.tan(
            Math.asin(
              THREE.MathUtils.clamp(
                source.body.radius /
                  distance,
                0,
                0.999999
              )
            )
          ),
          2,
          18
        );

      const spotGeometry =
        new THREE.CircleGeometry(
          apparentRadius,
          40
        );

      const spotMaterial =
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.11,
          depthWrite: false,
          side: THREE.DoubleSide
        });

      const spot =
        new THREE.Mesh(
          spotGeometry,
          spotMaterial
        );

      spot.position.copy(
        surfacePoint
      );

      spot.quaternion.setFromUnitVectors(
        new THREE.Vector3(
          0,
          0,
          1
        ),
        direction
      );

      this.root.add(
        spot
      );

      this.spots.push(
        spot
      );
    }
  }

  private clear() {

    for(
      const beam
      of this.beams
    ) {

      beam.geometry.dispose();

      const material =
        beam.material;

      if(
        material instanceof
        THREE.Material
      ) {
        material.dispose();
      }

      this.root.remove(
        beam
      );
    }

    for(
      const spot
      of this.spots
    ) {

      spot.geometry.dispose();

      const material =
        spot.material;

      if(
        material instanceof
        THREE.Material
      ) {
        material.dispose();
      }

      this.root.remove(
        spot
      );
    }

    this.beams.length =
      0;

    this.spots.length =
      0;
  }

  dispose() {

    this.clear();

    this.root.removeFromParent();
  }
}
