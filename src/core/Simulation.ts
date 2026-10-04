import * as THREE from "three";

import { MorraSystem }
from "../world/MorraSystem";

import { MorraTimeSystem }
from "../world/MorraTimeSystem";

import { TimeHUD }
from "../render/TimeHUD";

import { TimeControls }
from "../render/TimeControls";

export class Simulation {

  scene: THREE.Scene;

  morraSystem: MorraSystem;

  timeSystem: MorraTimeSystem;

  timeControls: TimeControls;

  timeHud: TimeHUD;

  clock: THREE.Clock;

  constructor(
    scene: THREE.Scene
  ) {

    this.scene = scene;

    this.clock =
      new THREE.Clock();

    this.timeSystem =
      new MorraTimeSystem();

    this.timeControls =
      new TimeControls(
        this.timeSystem
      );

    this.timeHud =
      new TimeHUD();

    this.morraSystem =
      new MorraSystem(
        scene
      );
  }

  update() {

    const delta =
      this.clock.getDelta();

    this.timeSystem.update(
      delta
    );

    this.morraSystem.update(
      delta
    );

    this.timeHud.update(
      this.timeSystem.currentYear,
      this.timeSystem.currentMonth,
      this.timeSystem.currentDay,
      this.timeSystem.currentHour
    );
  }
}