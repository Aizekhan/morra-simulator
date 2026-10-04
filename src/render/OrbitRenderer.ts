import * as THREE from "three";

export class OrbitRenderer {

  static createOrbit(
    radius: number,
    color: number,
    plane: "XZ" | "YZ" | "XY",
    offsetX = 0,
    offsetY = 0,
    offsetZ = 0
  ) {

    const points: THREE.Vector3[] = [];

    for(let i=0;i<=256;i++){

      const a =
        (i / 256) *
        Math.PI *
        2;

      let x = 0;
      let y = 0;
      let z = 0;

      if(plane === "XZ"){

        x =
          Math.cos(a) * radius +
          offsetX;

        y =
          offsetY;

        z =
          Math.sin(a) * radius +
          offsetZ;
      }

      if(plane === "YZ"){

        x =
          offsetX;

        y =
          Math.cos(a) * radius +
          offsetY;

        z =
          Math.sin(a) * radius +
          offsetZ;
      }

      if(plane === "XY"){

        x =
          Math.cos(a) * radius +
          offsetX;

        y =
          Math.sin(a) * radius +
          offsetY;

        z =
          offsetZ;
      }

      points.push(
        new THREE.Vector3(
          x,
          y,
          z
        )
      );
    }

    const geometry =
      new THREE.BufferGeometry()
      .setFromPoints(points);

    const material =
      new THREE.LineBasicMaterial({
        color
      });

    return new THREE.LineLoop(
      geometry,
      material
    );
  }
}