import * as THREE from "three";

export class MorraAxis {

  axisLine: THREE.Line;

  northPole: THREE.Mesh;
  southPole: THREE.Mesh;

  equator: THREE.LineLoop;

  private scene: THREE.Scene;

  private axisMaterial: THREE.LineBasicMaterial;
  private equatorMaterial: THREE.LineBasicMaterial;

  private poleGeometry: THREE.SphereGeometry;
  private northMaterial: THREE.MeshBasicMaterial;
  private southMaterial: THREE.MeshBasicMaterial;

  constructor(
    scene: THREE.Scene,
    radius: number,
    tilt: number
  ) {

    this.scene =
      scene;

    this.axisMaterial =
      new THREE.LineBasicMaterial({
        color: 0x00ffff
      });

    this.equatorMaterial =
      new THREE.LineBasicMaterial({
        color: 0x00ff00
      });

    this.poleGeometry =
      new THREE.SphereGeometry(
        5,
        16,
        16
      );

    this.northMaterial =
      new THREE.MeshBasicMaterial({
        color: 0x00ffff
      });

    this.southMaterial =
      new THREE.MeshBasicMaterial({
        color: 0xff4444
      });

    this.axisLine =
      new THREE.Line(
        new THREE.BufferGeometry(),
        this.axisMaterial
      );

    this.northPole =
      new THREE.Mesh(
        this.poleGeometry,
        this.northMaterial
      );

    this.southPole =
      new THREE.Mesh(
        this.poleGeometry,
        this.southMaterial
      );

    this.equator =
      new THREE.LineLoop(
        new THREE.BufferGeometry(),
        this.equatorMaterial
      );

    scene.add(
      this.axisLine
    );

    scene.add(
      this.northPole
    );

    scene.add(
      this.southPole
    );

    scene.add(
      this.equator
    );

    this.update(
      radius,
      tilt
    );
  }

  update(
    radius: number,
    tilt: number
  ) {

    const safeRadius =
      Math.max(
        0.1,
        radius
      );

    const tiltRad =
      THREE.MathUtils.degToRad(
        tilt
      );

    const axis =
      new THREE.Vector3(
        Math.sin(tiltRad),
        Math.cos(tiltRad),
        0
      ).normalize();

    const axisGeometry =
      new THREE.BufferGeometry()
      .setFromPoints([
        axis.clone()
          .multiplyScalar(
            -safeRadius * 2
          ),

        axis.clone()
          .multiplyScalar(
            safeRadius * 2
          )
      ]);

    this.axisLine.geometry.dispose();

    this.axisLine.geometry =
      axisGeometry;

    this.northPole.position.copy(
      axis.clone()
        .multiplyScalar(
          safeRadius
        )
    );

    this.southPole.position.copy(
      axis.clone()
        .multiplyScalar(
          -safeRadius
        )
    );

    const helper =
      Math.abs(
        axis.y
      ) > 0.99
        ? new THREE.Vector3(
            1,
            0,
            0
          )
        : new THREE.Vector3(
            0,
            1,
            0
          );

    const basis1 =
      new THREE.Vector3()
      .crossVectors(
        axis,
        helper
      )
      .normalize();

    const basis2 =
      new THREE.Vector3()
      .crossVectors(
        axis,
        basis1
      )
      .normalize();

    const points:
      THREE.Vector3[] = [];

    for(
      let i = 0;
      i <= 256;
      i++
    ) {

      const angle =
        (
          i /
          256
        ) *
        Math.PI *
        2;

      points.push(
        basis1.clone()
        .multiplyScalar(
          Math.cos(angle) *
          safeRadius
        )
        .add(
          basis2.clone()
          .multiplyScalar(
            Math.sin(angle) *
            safeRadius
          )
        )
      );
    }

    const equatorGeometry =
      new THREE.BufferGeometry()
      .setFromPoints(
        points
      );

    this.equator.geometry.dispose();

    this.equator.geometry =
      equatorGeometry;
  }

  dispose() {

    this.axisLine.geometry.dispose();

    this.equator.geometry.dispose();

    this.poleGeometry.dispose();

    this.axisMaterial.dispose();

    this.equatorMaterial.dispose();

    this.northMaterial.dispose();

    this.southMaterial.dispose();

    this.scene.remove(
      this.axisLine
    );

    this.scene.remove(
      this.northPole
    );

    this.scene.remove(
      this.southPole
    );

    this.scene.remove(
      this.equator
    );
  }
}
