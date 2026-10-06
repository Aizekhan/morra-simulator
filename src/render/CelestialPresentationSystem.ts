import * as THREE from "three";

import {
  CelestialBody
} from "../astronomy/CelestialBody";

interface PresentationProxy {
  body: CelestialBody;
  mesh: THREE.Mesh;
  minimumPixels: number;
}

export class CelestialPresentationSystem {

  private readonly scene: THREE.Scene;

  private readonly proxies: PresentationProxy[] = [];

  private readonly maximumScale: number;

  constructor(
    scene: THREE.Scene,
    bodies: CelestialBody[],
    maximumScale = 20
  ) {

    this.scene = scene;

    this.maximumScale =
      Math.max(
        1,
        maximumScale
      );

    for(
      const body of bodies
    ) {

      // Presentation is a fallback for genuinely tiny distant bodies.
      // The real mesh is never hidden by this system.
      if(
        body.mesh.userData.disablePresentationProxy === true
      ) {
        continue;
      }

      const material =
        new THREE.MeshBasicMaterial({
          color:
            body.material.color.clone(),
          depthWrite:
            false,
          depthTest:
            true
        });

      const mesh =
        new THREE.Mesh(
          new THREE.SphereGeometry(
            1,
            16,
            12
          ),
          material
        );

      mesh.name =
        "CelestialPresentationProxy";

      mesh.visible =
        false;

      mesh.renderOrder =
        5;

      mesh.layers.set(
        0
      );

      mesh.frustumCulled =
        false;

      this.scene.add(
        mesh
      );

      this.proxies.push({
        body,
        mesh,
        minimumPixels:
          Math.max(
            4,
            body.mesh.userData.presentationMinimumPixels ?? 10
          )
      });
    }
  }

  update(
    camera: THREE.PerspectiveCamera,
    viewportHeight: number
  ) {

    const height =
      Math.max(
        1,
        viewportHeight
      );

    const cameraTan =
      Math.tan(
        THREE.MathUtils.degToRad(
          camera.fov * 0.5
        )
      );

    for(
      const proxy of this.proxies
    ) {

      const bodyMesh =
        proxy.body.mesh;

      // Respect the physical body's live visibility flag. The proxy
      // may only improve readability while the real body is enabled.
      if(
        bodyMesh.visible === false
      ) {
        proxy.mesh.visible =
          false;
        continue;
      }

      const worldPosition =
        bodyMesh.getWorldPosition(
          new THREE.Vector3()
        );

      const distance =
        Math.max(
          worldPosition.distanceTo(
            camera.position
          ),
          0.001
        );

      const projectedDiameter =
        (
          2 *
          proxy.body.radius /
          (
            distance *
            cameraTan
          )
        ) *
        height *
        0.5;

      proxy.mesh.position.copy(
        worldPosition
      );

      proxy.mesh.updateMatrixWorld();

      proxy.mesh.layers.set(
        0
      );

      // The real mesh is already visible. Proxy is only a minimum-pixel
      // readability aid and must never replace the real body.
      if(
        projectedDiameter >=
        proxy.minimumPixels
      ) {
        proxy.mesh.visible =
          false;
        continue;
      }

      const targetDiameterWorld =
        proxy.minimumPixels /
        height *
        (
          2 *
          distance *
          cameraTan
        );

      const scale =
        THREE.MathUtils.clamp(
          targetDiameterWorld /
            Math.max(
              2 *
              proxy.body.radius,
              0.001
            ),
          1,
          this.maximumScale
        );

      proxy.mesh.scale.set(
        proxy.body.radius * scale,
        proxy.body.radius * scale,
        proxy.body.radius * scale
      );

      if(
        proxy.mesh.material instanceof
        THREE.MeshBasicMaterial
      ) {

        proxy.mesh.material.color.copy(
          proxy.body.material.color
        );
      }

      proxy.mesh.visible =
        true;
    }
  }

  dispose() {

    for(
      const proxy of this.proxies
    ) {

      proxy.mesh.geometry.dispose();

      if(
        proxy.mesh.material instanceof
        THREE.Material
      ) {
        proxy.mesh.material.dispose();
      }

      this.scene.remove(
        proxy.mesh
      );
    }

    this.proxies.length =
      0;
  }
}
