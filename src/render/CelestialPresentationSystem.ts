import * as THREE from "three";

import {
  CelestialBody
} from "../astronomy/CelestialBody";

export interface CelestialPresentationConfig {

  minimumPixels: number;

  maximumScale: number;
}

export class CelestialPresentationSystem {

  private readonly bodies:
    CelestialBody[];

  private readonly config:
    CelestialPresentationConfig;

  constructor(
    bodies:
      CelestialBody[],    config:
      Partial<CelestialPresentationConfig> = {}
  ) {

    this.bodies =
      bodies;

    this.config = {
      minimumPixels:
        Math.max(
          2,
          config.minimumPixels ??
            10
        ),
      maximumScale:
        Math.max(
          1,
          config.maximumScale ??
            8
        )
    };
  }

  update(
    camera:
      THREE.PerspectiveCamera,
    viewportHeight:
      number
  ) {

    const height =
      Math.max(
        1,
        viewportHeight
      );

    const cameraTan =
      Math.tan(
        THREE.MathUtils.degToRad(
          camera.fov *
          0.5
        )
      );

    const cameraPosition =
      camera.position;

    for(
      const body
      of this.bodies
    ) {

      const mesh =
        body.mesh;

      if(
        !mesh.visible
      ) {
        mesh.userData.presentationMesh &&
          (
            mesh.userData.presentationMesh.visible =
              false
          );

        continue;
      }

      const worldPosition =
        mesh.getWorldPosition(
          new THREE.Vector3()
        );

      const distance =
        Math.max(
          worldPosition.distanceTo(
            cameraPosition
          ),
          0.001
        );

      const projectedDiameterPixels =
        (
          2 *
          body.radius /
          (
            distance *
            cameraTan
          )
        ) *
        height *
        0.5;

      const presentationMesh =
        mesh.userData.presentationMesh as
        THREE.Mesh | undefined;

      if(
        !presentationMesh
      ) {
        continue;
      }

      if(
        projectedDiameterPixels >=
        this.config.minimumPixels
      ) {

        presentationMesh.visible =
          false;

        continue;
      }

      const targetDiameterWorld =
        (
          this.config.minimumPixels /
          height
        ) *
        (
          2 *
          distance *
          cameraTan
        );

      const requiredScale =
        targetDiameterWorld /
        Math.max(
          2 *
          body.radius,
          0.001
        );

      presentationMesh.scale.setScalar(
        THREE.MathUtils.clamp(
          requiredScale,
          1,
          this.config.maximumScale
        )
      );

      presentationMesh.visible =
        true;
    }
  }

  dispose() {

    for(
      const body
      of this.bodies
    ) {

      const presentationMesh =
        body.mesh.userData.presentationMesh as
        THREE.Mesh | undefined;

      if(
        !presentationMesh
      ) {
        continue;
      }

      body.mesh.remove(
        presentationMesh
      );

      presentationMesh.geometry = 
        body.geometry;

      const material =
        presentationMesh.material;

      if(
        material instanceof
        THREE.Material
      ) {
        material.dispose();
      }
    }
  }
}
