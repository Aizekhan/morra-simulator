import * as THREE from "three";

import { MORRA_CONFIG } from "../world/MorraConfig";

import {
  RENDER_LAYERS
} from "./RenderLayers";

export class Renderer {

  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  private ambientLight: THREE.AmbientLight;

  private planetAmbientLight:
    THREE.AmbientLight;

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

    this.camera.layers.enable(
      RENDER_LAYERS.MORRA_LIGHT_RECEIVER
    );

    this.camera.layers.enable(
      RENDER_LAYERS.MOON_LIGHT_RECEIVER
    );

    this.renderer =
      new THREE.WebGLRenderer({
        antialias: true
      });

    this.renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio,
        2
      )
    );

    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    this.renderer.shadowMap.enabled =
      true;

    const canvas =
      this.renderer.domElement;

    canvas.style.position =
      "fixed";

    canvas.style.inset =
      "0";

    canvas.style.width =
      "100vw";

    canvas.style.height =
      "100vh";

    canvas.style.display =
      "block";

    canvas.style.zIndex =
      "0";

    document.body.style.margin =
      "0";

    document.body.style.overflow =
      "hidden";

    document.body.style.width =
      "100vw";

    document.body.style.height =
      "100vh";

    document.body.appendChild(
      canvas
    );

    this.ambientLight =
      new THREE.AmbientLight(
        0xffffff,
        MORRA_CONFIG.LIGHTS.ambient
      );

    this.scene.add(
      this.ambientLight
    );

    this.planetAmbientLight =
      new THREE.AmbientLight(
        0xffffff,
        MORRA_CONFIG.LIGHTS.ambient
      );

    this.planetAmbientLight.layers.set(
      RENDER_LAYERS.MORRA_LIGHT_RECEIVER
    );

    this.scene.add(
      this.planetAmbientLight
    );

    window.addEventListener(
      "resize",
      this.handleResize
    );
  }

  update() {

    this.ambientLight.intensity =
      MORRA_CONFIG.LIGHTS.ambient;

    this.planetAmbientLight.intensity =
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

    this.renderer.dispose();

    this.renderer.domElement.remove();
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
