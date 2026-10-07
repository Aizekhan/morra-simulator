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

    // Keep ambient light near zero. Visible surface illumination comes from
    // the current celestial source lights rather than a global wash.
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
      sourceRadius?: number;
      radiationScale?: number;
      presentationScale?: number;
      referenceDistance?: number;
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

      const sourcePosition =
        body.mesh.getWorldPosition(
          new THREE.Vector3()
        );

      const referenceDistance =
        Math.max(
          body.referenceDistance ?? 1,
          1
        );

      const finiteSourceReferenceScale =
        body.sourceRadius !== undefined
          ? (
              body.sourceRadius *
              body.sourceRadius
            ) /
            (
              referenceDistance *
              referenceDistance
            )
          : 1;

      const presentationScale =
        body.presentationScale ?? 1;

      light.intensity =
        body.visible
          ? body.intensity *
            finiteSourceReferenceScale *
            (body.radiationScale ?? 1) *
            presentationScale
          : 0;

      light.distance = 0;
      light.decay = 2;

      light.position.copy(
        sourcePosition
      );
    });

    for(let i = bodies.length; i < this.celestialLights.length; i++) {
      this.celestialLights[i].intensity = 0;
    }
  }

  /**
   * Presentation lights are optional. The physical surface field is the
   * authoritative illumination model; this method only keeps the legacy
   * Three.js lights useful for auxiliary scene objects.
   */
  setPresentationLightsEnabled(
    enabled: boolean
  ) {
    for(const light of this.celestialLights) {
      light.visible = enabled;
    }
  }

  update(
    _ambientIntensity = 0
  ) {

    // Morra's surface is now illuminated by the authoritative physical
    // LIGHT_TOTAL field. The global ambient channel is reserved for future
    // non-surface scene elements and does not wash the planet uniformly.
    this.ambientLight.intensity = 0;

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
