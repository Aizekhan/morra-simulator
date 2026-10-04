import * as THREE from "three";

import {
  MorraEnvironmentEngine
} from "../physics/MorraEnvironmentEngine";

const SOURCE_COLORS: Record<
  string,
  number
> = {
  "large-sun":
    0xffcc88,
  "medium-sun":
    0xffaa55,
  "small-sun":
    0xffffcc
};

interface SourceVisual {

  sourceId:
    string;

  line:
    THREE.Line;

  spot:
    THREE.Mesh;

  position:
    THREE.Vector3;
}

export class DirectIlluminationVisualizer {

  private readonly engine:
    MorraEnvironmentEngine;

  private readonly root:
    THREE.Group;

  private readonly visuals:
    SourceVisual[] = [];

  private enabled =
    true;

  private lastRadius =
    Number.NaN;

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

    for(
      const source
      of this.engine.radiation.getSources()
    ) {

      const color =
        SOURCE_COLORS[
          source.id
        ] ??
        0xffffff;

      const lineGeometry =
        new THREE.BufferGeometry();

      lineGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(
          new Float32Array(
            6
          ),
          3
        )
      );

      const line =
        new THREE.Line(
          lineGeometry,
          new THREE.LineBasicMaterial({
            color,
            transparent:
              true,
            opacity:
              0.28
          })
        );

      const spot =
        new THREE.Mesh(
          new THREE.CircleGeometry(
            1,
            24
          ),
          new THREE.MeshBasicMaterial({
            color,
            transparent:
              true,
            opacity:
              0.11,
            depthWrite:
              false,
            side:
              THREE.DoubleSide
          })
        );

      this.root.add(
        line
      );

      this.root.add(
        spot
      );

      this.visuals.push({
        sourceId:
          source.id,
        line,
        spot,
        position:
          new THREE.Vector3()
      });
    }
  }

  setEnabled(
    enabled: boolean
  ) {

    if(
      this.enabled ===
      enabled
    ) {
      this.root.visible =
        enabled;
      return;
    }

    this.enabled =
      enabled;

    this.root.visible =
      enabled;
  }

  update() {

    if(
      !this.enabled
    ) {
      return;
    }

    const center =
      this.engine.morra.mesh
        .getWorldPosition(
          new THREE.Vector3()
        );

    const radius =
      this.engine.morra.radius;

    for(
      const visual
      of this.visuals
    ) {

      const source =
        this.engine.radiation.getSources()
          .find(
            item =>
              item.id ===
              visual.sourceId
          );

      if(
        !source
      ) {
        visual.line.visible =
          false;
        visual.spot.visible =
          false;
        continue;
      }

      if(
        !source.body.mesh.visible
      ) {
        visual.line.visible =
          false;
        visual.spot.visible =
          false;
        continue;
      }

      visual.line.visible =
        true;

      visual.spot.visible =
        true;

      const sourcePosition =
        source.body.mesh
          .getWorldPosition(
            new THREE.Vector3()
          );

      const direction =
        sourcePosition
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

      const positionAttribute =
        visual.line.geometry.getAttribute(
          "position"
        ) as THREE.BufferAttribute;

      const array =
        positionAttribute.array as
        Float32Array;

      array[0] =
        sourcePosition.x;

      array[1] =
        sourcePosition.y;

      array[2] =
        sourcePosition.z;

      array[3] =
        surfacePoint.x;

      array[4] =
        surfacePoint.y;

      array[5] =
        surfacePoint.z;

      positionAttribute.needsUpdate =
        true;

      visual.spot.position.copy(
        surfacePoint
      );

      visual.spot.quaternion.setFromUnitVectors(
        new THREE.Vector3(
          0,
          0,
          1
        ),
        direction
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

      visual.spot.scale.setScalar(
        apparentRadius
      );

      visual.position.copy(
        sourcePosition
      );
    }

    this.lastRadius =
      radius;
  }

  dispose() {

    for(
      const visual
      of this.visuals
    ) {

      visual.line.geometry.dispose();

      const lineMaterial =
        visual.line.material;

      if(
        lineMaterial instanceof
        THREE.Material
      ) {
        lineMaterial.dispose();
      }

      visual.spot.geometry.dispose();

      const spotMaterial =
        visual.spot.material;

      if(
        spotMaterial instanceof
        THREE.Material
      ) {
        spotMaterial.dispose();
      }
    }

    this.visuals.length =
      0;

    this.root.removeFromParent();
  }
}
