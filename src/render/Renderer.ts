import * as THREE from "three";

import { MORRA_CONFIG } from "../world/MorraConfig";

export class Renderer {

  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  private ambientLight: THREE.AmbientLight;

  constructor() {

    this.scene =
      new THREE.Scene();

    this.scene.background =
      new THREE.Color(
        0x000011
      );

    this.camera =
      new THREE.PerspectiveCamera(
        60,
        window.innerWidth /
          window.innerHeight,
        0.1,
        50000
      );

    this.camera.position.set(
      0,
      1000,
      2500
    );

    this.renderer =
      new THREE.WebGLRenderer({
        antialias: true
      });

    this.renderer.shadowMap.enabled =
      true;

    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    document.body.style.margin =
      "0";

    document.body.style.overflow =
      "hidden";

    document.body.appendChild(
      this.renderer.domElement
    );

    this.ambientLight =
      new THREE.AmbientLight(
        0xffffff,
        MORRA_CONFIG.LIGHTS.ambient
      );

    this.scene.add(
      this.ambientLight
    );

    window.addEventListener(
      "resize",
      this.handleResize
    );
  }

  update() {

    this.ambientLight.intensity =
      MORRA_CONFIG.LIGHTS.ambient;
  }

  render() {

    this.renderer.render(
      this.scene,
      this.camera
    );
  }

  dispose() {

    window.removeEventListener(
      "resize",
      this.handleResize
    );
  }

  private handleResize = () => {

    this.camera.aspect =
      window.innerWidth /
      window.innerHeight;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  };
}
