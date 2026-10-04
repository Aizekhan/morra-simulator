import * as THREE from "three";

import {
  CelestialBody
} from "../astronomy/CelestialBody";

import {
  WorldLocation
} from "../world/WorldLocation";

import {
  WorldLocationSystem
} from "../world/WorldLocationSystem";

export interface SelectedWorldLocation {

  location: WorldLocation;

  point: THREE.Vector3;
}

export class WorldInteractionSystem {

  private readonly camera: THREE.PerspectiveCamera;

  private readonly domElement: HTMLElement;

  private readonly morra: CelestialBody;

  private readonly locations: WorldLocationSystem;

  private readonly onSelect:
    (selection: SelectedWorldLocation) => void;

  private readonly raycaster =
    new THREE.Raycaster();

  private readonly pointer =
    new THREE.Vector2();

  private readonly marker:
    THREE.Mesh;

  private pointerDownX = 0;
  private pointerDownY = 0;

  constructor(
    camera: THREE.PerspectiveCamera,
    domElement: HTMLElement,
    morra: CelestialBody,
    locations: WorldLocationSystem,
    onSelect:
      (selection: SelectedWorldLocation) => void
  ) {

    this.camera = camera;
    this.domElement = domElement;
    this.morra = morra;
    this.locations = locations;
    this.onSelect = onSelect;

    this.marker =
      new THREE.Mesh(
        new THREE.SphereGeometry(
          3,
          16,
          16
        ),
        new THREE.MeshBasicMaterial({
          color: 0xffffff
        })
      );

    this.marker.visible =
      false;

    morra.mesh.add(
      this.marker
    );

    this.domElement.addEventListener(
      "pointerdown",
      this.handlePointerDown
    );

    this.domElement.addEventListener(
      "pointerup",
      this.handlePointerUp
    );
  }

  private handlePointerDown = (
    event: PointerEvent
  ) => {

    this.pointerDownX =
      event.clientX;

    this.pointerDownY =
      event.clientY;
  };

  private handlePointerUp = (
    event: PointerEvent
  ) => {

    const moved =
      Math.hypot(
        event.clientX -
          this.pointerDownX,
        event.clientY -
          this.pointerDownY
      );

    if(
      moved > 5
    ) {
      return;
    }

    const rect =
      this.domElement.getBoundingClientRect();

    this.pointer.x =
      (
        (event.clientX -
          rect.left) /
        rect.width
      ) * 2 - 1;

    this.pointer.y =
      -(
        (event.clientY -
          rect.top) /
        rect.height
      ) * 2 + 1;

    this.raycaster.setFromCamera(
      this.pointer,
      this.camera
    );

    const hits =
      this.raycaster.intersectObject(
        this.morra.mesh,
        false
      );

    if(
      hits.length === 0
    ) {
      return;
    }

    const hit =
      hits[0];

    const localPoint =
      this.morra.mesh.worldToLocal(
        hit.point.clone()
      );

    const radius =
      this.morra.radius;

    const normalizedY =
      THREE.MathUtils.clamp(
        localPoint.y /
          radius,
        -1,
        1
      );

    const latitude =
      THREE.MathUtils.radToDeg(
        Math.asin(
          normalizedY
        )
      );

    const longitude =
      THREE.MathUtils.radToDeg(
        Math.atan2(
          localPoint.z,
          localPoint.x
        )
      );

    const latitudeKey =
      latitude.toFixed(3);

    const longitudeKey =
      longitude.toFixed(3);

    const id =
      `point:${latitudeKey}:${longitudeKey}`;

    const location: WorldLocation = {
      id,
      name:
        `Point ${latitudeKey}, ${longitudeKey}`,
      latitude,
      longitude,
      elevation: 0
    };

    this.locations.add(
      location
    );

    this.marker.position.copy(
      localPoint.clone()
        .normalize()
        .multiplyScalar(
          radius + 3
        )
    );

    this.marker.visible =
      true;

    this.onSelect({
      location,
      point:
        localPoint
    });
  };

  dispose() {

    this.domElement.removeEventListener(
      "pointerdown",
      this.handlePointerDown
    );

    this.domElement.removeEventListener(
      "pointerup",
      this.handlePointerUp
    );

    this.marker.geometry.dispose();

    const material =
      this.marker.material;

    if(
      material instanceof THREE.Material
    ) {
      material.dispose();
    }

    this.morra.mesh.remove(
      this.marker
    );
  }
}
