import * as THREE from "three";

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
        1,
        5000000
      );

    this.camera.layers.set(
      0
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

    this.renderer.shadowMap.type =
      THREE.PCFSoftShadowMap;

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
        0
      );

    // Physical illumination comes from Morra's celestial radiation model.
    // Ambient light is disabled so it cannot create a second, detached
    // lighting solution that moves independently from the physical model.
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
      0;

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
