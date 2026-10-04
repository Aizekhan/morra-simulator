import * as THREE from "three";

import {
  OrbitMath
} from "./OrbitMath";

export type OrbitPlane =
  | "XZ"
  | "YZ"
  | "XY";

export interface CelestialBodyOptions {

  initialAngle?: number;

  segments?: number;

  emissiveIntensity?: number;

  orbitInclination?: number;

  orbitAscendingNode?: number;

  orbitEccentricity?: number;
}

export class CelestialBody {

  mesh: THREE.Mesh;

  geometry: THREE.SphereGeometry;

  material: THREE.MeshStandardMaterial;

  radius: number;

  orbitRadius: number;
  orbitSpeed: number;

  angle: number;

  orbitPlane: OrbitPlane;

  orbitOffsetX: number;
  orbitOffsetY: number;
  orbitOffsetZ: number;

  orbitInclination: number;

  orbitAscendingNode: number;

  orbitEccentricity: number;

  readonly initialAngle: number;

  private readonly segments: number;

  constructor(
    radius: number,
    color: number,
    orbitRadius = 0,
    orbitSpeed = 0,
    orbitPlane: OrbitPlane = "XZ",
    orbitOffsetX = 0,
    orbitOffsetY = 0,
    orbitOffsetZ = 0,
    options: CelestialBodyOptions = {}
  ) {

    this.radius =
      radius;

    this.segments =
      options.segments ?? 32;

    this.geometry =
      new THREE.SphereGeometry(
        radius,
        this.segments,
        this.segments
      );

    this.material =
      new THREE.MeshStandardMaterial({
        color,
        roughness: 1,
        metalness: 0,
        emissive: color,
        emissiveIntensity:
          options.emissiveIntensity ?? 0.05
      });

    this.mesh =
      new THREE.Mesh(
        this.geometry,
        this.material
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

    this.orbitInclination =
      options.orbitInclination ?? 0;

    this.orbitAscendingNode =
      options.orbitAscendingNode ?? 0;

    this.orbitEccentricity =
      options.orbitEccentricity ?? 0;

    this.initialAngle =
      options.initialAngle ?? 0;

    this.angle =
      this.initialAngle;
  }

  setRadius(
    radius: number
  ) {

    const nextRadius =
      Math.max(
        0.1,
        radius
      );

    if(
      this.radius ===
      nextRadius
    ) {
      return;
    }

    this.radius =
      nextRadius;

    this.geometry.dispose();

    this.geometry =
      new THREE.SphereGeometry(
        nextRadius,
        this.segments,
        this.segments
      );

    this.mesh.geometry =
      this.geometry;
  }

  setColor(
    color: number
  ) {

    this.material.color.setHex(
      color
    );

    this.material.emissive.setHex(
      color
    );
  }

  setOrbitRadius(
    radius: number
  ) {

    this.orbitRadius =
      Math.max(
        0,
        radius
      );
  }

  setOrbitSpeed(
    speed: number
  ) {

    this.orbitSpeed =
      speed;
  }

  setOrbitHeight(
    height: number
  ) {

    this.orbitOffsetY =
      height;
  }

  setOrbitPlane(
    plane: OrbitPlane
  ) {

    this.orbitPlane =
      plane;
  }

  setOrbitInclination(
    inclination: number
  ) {

    this.orbitInclination =
      inclination;
  }

  setOrbitAscendingNode(
    angle: number
  ) {

    this.orbitAscendingNode =
      angle;
  }

  setOrbitEccentricity(
    eccentricity: number
  ) {

    this.orbitEccentricity =
      THREE.MathUtils.clamp(
        eccentricity,
        0,
        0.999999
      );
  }

  updateAtTime(
    absoluteHours: number
  ) {

    this.angle =
      this.initialAngle +
      this.orbitSpeed *
      absoluteHours;

    const eccentricAnomaly =
      OrbitMath.solveEccentricAnomaly(
        this.angle,
        this.orbitEccentricity
      );

    const ellipsePoint =
      OrbitMath.getEllipsePoint(
        this.orbitRadius,
        this.orbitEccentricity,
        eccentricAnomaly
      );

    const basis =
      OrbitMath.getBasis(
        this.orbitPlane,
        this.orbitInclination,
        this.orbitAscendingNode
      );

    this.mesh.position
      .copy(
        basis.primary
          .clone()
          .multiplyScalar(
            ellipsePoint.primary
          )
          .add(
            basis.secondary
              .clone()
              .multiplyScalar(
                ellipsePoint.secondary
              )
          )
      )
      .add(
        new THREE.Vector3(
          this.orbitOffsetX,
          this.orbitOffsetY,
          this.orbitOffsetZ
        )
      );



  dispose() {

    this.geometry.dispose();

    this.material.dispose();
  }
}
