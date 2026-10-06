import * as THREE from "three";

export class Renderer {

  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  private ambientLight: THREE.AmbientLight;

  private readonly celestialLights:
    THREE.PointLight[] = [];


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
        antialias: true,
        logarithmicDepthBuffer: true
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

    // Keep ambient light as a low baseline only. Celestial point lights
    // are attached to the actual source bodies and provide visible shading.
    this.scene.add(
      this.ambientLight
    );

    // These lights are a presentation layer only. Their positions and
    // colors follow the celestial bodies; physical radiation remains the
    // authoritative simulation used by SurfaceFieldEngine.

    window.addEventListener(
      "resize",
      this.handleResize
    );
  }

  syncCelestialLights(
    bodies: Array<{
      mesh: THREE.Object3D;
      color: number;
      intensity: number;
      visible: boolean;
    }>
  ) {
    while(this.celestialLights.length < bodies.length) {
      const light =
        new THREE.PointLight(0xffffff, 0, 0);

      this.scene.add(light);
      this.celestialLights.push(light);
    }

    bodies.forEach((body, index) => {
      const light =
        this.celestialLights[index];

      light.color.setHex(body.color);
      light.intensity = body.visible ? body.intensity * 0.08 : 0;
      light.distance = 0;
      light.decay = 2;
      light.position.copy(body.mesh.getWorldPosition(new THREE.Vector3()));
    });

    for(let i = bodies.length; i < this.celestialLights.length; i++) {
      this.celestialLights[i].intensity = 0;
    }
  }

  update(
    ambientIntensity = 0
  ) {

    this.ambientLight.intensity =
      THREE.MathUtils.clamp(
        ambientIntensity,
        0,
        10
      );

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

    for(const light of this.celestialLights) {
      light.removeFromParent();
    }

    this.celestialLights.length = 0;

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
