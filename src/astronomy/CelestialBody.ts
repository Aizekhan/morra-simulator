import * as THREE from "three";

export class CelestialBody {

  mesh: THREE.Mesh;

  geometry: THREE.SphereGeometry;

  radius: number;

  orbitRadius: number;
  orbitSpeed: number;

  angle: number;

  orbitPlane: "XZ" | "YZ" | "XY";

  orbitOffsetX: number;
  orbitOffsetY: number;
  orbitOffsetZ: number;

  constructor(
    radius: number,
    color: number,
    orbitRadius = 0,
    orbitSpeed = 0,
    orbitPlane: "XZ" | "YZ" | "XY" = "XZ",
    orbitOffsetX = 0,
    orbitOffsetY = 0,
    orbitOffsetZ = 0
  ) {

    this.radius =
      radius;

    this.geometry =
      new THREE.SphereGeometry(
        radius,
        32,
        32
      );

    const material =
      new THREE.MeshStandardMaterial({
        color,
        roughness: 1,
        metalness: 0,
        emissive: color,
        emissiveIntensity: 0.05
      });

    this.mesh =
      new THREE.Mesh(
        this.geometry,
        material
      );

    this.mesh.castShadow =
      true;

    this.mesh.receiveShadow =
      true;

    this.orbitRadius =
      orbitRadius;

    this.orbitSpeed =
      orbitSpeed;

    this.orbitPlane =
      orbitPlane;

    this.orbitOffsetX =
      orbitOffsetX;

    this.orbitOffsetY =
      orbitOffsetY;

    this.orbitOffsetZ =
      orbitOffsetZ;

    this.angle =
      Math.random() *
      Math.PI *
      2;
  }

  setRadius(
    radius:number
  ) {

    if(
      this.radius === radius
    ){
      return;
    }

    this.radius =
      radius;

    this.geometry.dispose();

    this.geometry =
      new THREE.SphereGeometry(
        radius,
        32,
        32
      );

    this.mesh.geometry =
      this.geometry;
  }

  setOrbitRadius(
    radius:number
  ) {

    this.orbitRadius =
      radius;
  }

  setOrbitSpeed(
    speed:number
  ) {

    this.orbitSpeed =
      speed;
  }

  setOrbitHeight(
    height:number
  ) {

    this.orbitOffsetY =
      height;
  }

  update(
    delta:number
  ) {

    this.angle +=
      this.orbitSpeed *
      delta;

    const c =
      Math.cos(
        this.angle
      );

    const s =
      Math.sin(
        this.angle
      );

    if(
      this.orbitPlane === "XZ"
    ){

      this.mesh.position.set(
        c *
          this.orbitRadius +
          this.orbitOffsetX,

        this.orbitOffsetY,

        s *
          this.orbitRadius +
          this.orbitOffsetZ
      );
    }

    if(
      this.orbitPlane === "YZ"
    ){

      this.mesh.position.set(
        this.orbitOffsetX,

        c *
          this.orbitRadius +
          this.orbitOffsetY,

        s *
          this.orbitRadius +
          this.orbitOffsetZ
      );
    }

    if(
      this.orbitPlane === "XY"
    ){

      this.mesh.position.set(
        c *
          this.orbitRadius +
          this.orbitOffsetX,

        s *
          this.orbitRadius +
          this.orbitOffsetY,

        this.orbitOffsetZ
      );
    }
  }
}