import * as THREE from "three";

export class CameraController {

  camera: THREE.PerspectiveCamera;

  distance = 2500;

  zoomSpeed = 1;

  // The camera may zoom from system scale down to just above Morra's surface.
  private morraRadius = 120;

  private initializedForMorra = false;

  setMorraRadius(radius: number) {
    this.morraRadius = Math.max(0.1, radius);

    if(!this.initializedForMorra) {
      this.distance = this.getFramingDistance();
      this.initializedForMorra = true;
      return;
    }

    this.distance = Math.max(
      this.distance,
      this.minimumSurfaceDistance
    );
  }

  getDistance() {
    return this.distance;
  }

  setDistance(distance: number) {
    this.distance = THREE.MathUtils.clamp(
      distance,
      this.minimumSurfaceDistance,
      this.maximumDistance
    );
  }

  setZoomLevel(level: number) {
    const normalized =
      THREE.MathUtils.clamp(
        level,
        0,
        1
      );

    const logarithmicRange =
      Math.log(
        this.maximumDistance /
        this.minimumSurfaceDistance
      );

    this.setDistance(
      this.minimumSurfaceDistance *
      Math.exp(
        logarithmicRange *
        (1 - normalized)
      )
    );
  }

  getZoomLevel() {
    const logarithmicRange =
      Math.log(
        this.maximumDistance /
        this.minimumSurfaceDistance
      );

    if(logarithmicRange <= 0) {
      return 0.5;
    }

    return THREE.MathUtils.clamp(
      1 -
      Math.log(
        this.distance /
        this.minimumSurfaceDistance
      ) /
      logarithmicRange,
      0,
      1
    );
  }

  resetView() {
    this.distance = this.getFramingDistance();
    this.yaw = 0;
    this.pitch = 0.2;
  }

  snapToView(
    view:
      "FRONT" |
      "BACK" |
      "WEST" |
      "EAST" |
      "SOUTH" |
      "NORTH"
  ) {
    switch(view) {
      case "FRONT":
        this.yaw = 0;
        this.pitch = 0;
        break;
      case "BACK":
        this.yaw = Math.PI;
        this.pitch = 0;
        break;
      case "WEST":
        this.yaw = Math.PI / 2;
        this.pitch = 0;
        break;
      case "EAST":
        this.yaw = -Math.PI / 2;
        this.pitch = 0;
        break;
      case "NORTH":
        this.yaw = 0;
        this.pitch = Math.PI / 2 - 0.001;
        break;
      case "SOUTH":
        this.yaw = 0;
        this.pitch = -Math.PI / 2 + 0.001;
        break;
    }
  }

  private get minimumSurfaceDistance() {
    return this.morraRadius * 1.001;
  }

  private get maximumDistance() {
    return Math.min(
      Math.min(
        Math.max(
          this.morraRadius * 40,
          1000000
        ),
        1800000
      )
    );
  }

  private getFramingDistance() {
    return this.morraRadius * 2.6;
  }

  yaw = 0;
  pitch = 0.2;

  dragging = false;

  lastX = 0;
  lastY = 0;

  constructor(
    camera: THREE.PerspectiveCamera,
    domElement: HTMLElement
  ) {

    this.camera = camera;

    domElement.addEventListener(
      "mousedown",
      (e) => {
        this.dragging = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
      }
    );

    window.addEventListener(
      "mouseup",
      () => {
        this.dragging = false;
      }
    );

    window.addEventListener(
      "mousemove",
      (e) => {

        if (!this.dragging) return;

        const dx =
          e.clientX - this.lastX;

        const dy =
          e.clientY - this.lastY;

        this.lastX = e.clientX;
        this.lastY = e.clientY;

        this.yaw -= dx * 0.005;
        this.pitch -= dy * 0.005;

        const limit =
          Math.PI / 2 - 0.05;

        this.pitch =
          Math.max(
            -limit,
            Math.min(
              limit,
              this.pitch
            )
          );
      }
    );

    domElement.addEventListener(
      "wheel",
      (e) => {

        const zoomFactor =
          Math.exp(
            e.deltaY *
            0.001 *
            this.zoomSpeed
          );

        this.setDistance(
          this.distance *
          zoomFactor
        );

      }
    );
  }

  update() {

    const x =
      Math.cos(this.pitch) *
      Math.sin(this.yaw) *
      this.distance;

    const y =
      Math.sin(this.pitch) *
      this.distance;

    const z =
      Math.cos(this.pitch) *
      Math.cos(this.yaw) *
      this.distance;

    this.camera.position.set(
      x,
      y,
      z
    );

    this.camera.lookAt(
      0,
      0,
      0
    );
  }
}