import * as THREE from "three";

export class Renderer {

  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  constructor() {

    this.scene = new THREE.Scene();

    this.scene.background =
      new THREE.Color(0x000011);

    this.camera =
      new THREE.PerspectiveCamera(
        60,
        window.innerWidth /
          window.innerHeight,
        0.1,
        50000
      );

    this.renderer =
      new THREE.WebGLRenderer({
        antialias: true
      });

    this.renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    document.body.appendChild(
      this.renderer.domElement
    );

    const ambient =
      new THREE.AmbientLight(
        0xffffff,
        2
      );

    this.scene.add(ambient);

    window.addEventListener(
      "resize",
      () => {

        this.camera.aspect =
          window.innerWidth /
          window.innerHeight;

        this.camera.updateProjectionMatrix();

        this.renderer.setSize(
          window.innerWidth,
          window.innerHeight
        );
      }
    );
  }

  render() {

    this.renderer.render(
      this.scene,
      this.camera
    );
  }
}