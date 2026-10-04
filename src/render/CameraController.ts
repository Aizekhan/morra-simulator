import * as THREE from "three";

export class CameraController {

  camera: THREE.PerspectiveCamera;

  distance = 2500;
  yaw = 0;
  pitch = 0.3;

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

        this.distance +=
          e.deltaY * 0.5;

        this.distance =
          Math.max(
            300,
            Math.min(
              10000,
              this.distance
            )
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