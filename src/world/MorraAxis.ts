import * as THREE from "three";

export class MorraAxis {

  axisLine!: THREE.Line;

  northPole!: THREE.Mesh;
  southPole!: THREE.Mesh;

  equator!: THREE.LineLoop;

  constructor(
    scene: THREE.Scene,
    radius: number,
    tilt: number
  ) {

    const tiltRad =
      THREE.MathUtils.degToRad(
        tilt
      );

    // ЄДИНА ВІСЬ МОРРИ

    const axis =
      new THREE.Vector3(
        Math.sin(tiltRad),
        Math.cos(tiltRad),
        0
      ).normalize();

    // -----------------
    // AXIS LINE
    // -----------------

    const axisGeometry =
      new THREE.BufferGeometry()
      .setFromPoints([
        axis.clone()
          .multiplyScalar(
            -radius * 2
          ),

        axis.clone()
          .multiplyScalar(
            radius * 2
          )
      ]);

    this.axisLine =
      new THREE.Line(
        axisGeometry,
        new THREE.LineBasicMaterial({
          color: 0x00ffff
        })
      );

    scene.add(
      this.axisLine
    );

    // -----------------
    // POLES
    // -----------------

    const poleGeometry =
      new THREE.SphereGeometry(
        5,
        16,
        16
      );

    this.northPole =
      new THREE.Mesh(
        poleGeometry,
        new THREE.MeshBasicMaterial({
          color: 0x00ffff
        })
      );

    this.southPole =
      new THREE.Mesh(
        poleGeometry,
        new THREE.MeshBasicMaterial({
          color: 0xff4444
        })
      );

    this.northPole.position.copy(
      axis.clone()
        .multiplyScalar(radius)
    );

    this.southPole.position.copy(
      axis.clone()
        .multiplyScalar(-radius)
    );

    scene.add(
      this.northPole
    );

    scene.add(
      this.southPole
    );

    // -----------------
    // EQUATOR
    // -----------------

    const helper =
      Math.abs(axis.y) > 0.99
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

    const points: THREE.Vector3[] =
      [];

    for(let i=0;i<=256;i++){

      const a =
        (i / 256) *
        Math.PI *
        2;

      const p =
        basis1.clone()
          .multiplyScalar(
            Math.cos(a) * radius
          )
          .add(
            basis2.clone()
              .multiplyScalar(
                Math.sin(a) * radius
              )
          );

      points.push(p);
    }

    const equatorGeometry =
      new THREE.BufferGeometry()
        .setFromPoints(
          points
        );

    this.equator =
      new THREE.LineLoop(
        equatorGeometry,
        new THREE.LineBasicMaterial({
          color: 0x00ff00
        })
      );

    scene.add(
      this.equator
    );
  }
}