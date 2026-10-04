import * as THREE from "three";

import {
  AstronomicalEventSystem
} from "../astronomy/AstronomicalEventSystem";

import {
  SimulationTime
} from "./SimulationTime";

import type {
  AstronomicalEventState
} from "../astronomy/AstronomicalEventSystem";

import type {
  CalendarSnapshot
} from "./SimulationTime";

import {
  MorraSystem
} from "../world/MorraSystem";

import {
  TimeControls
} from "../render/TimeControls";

import {
  WorldEventSystem
} from "../world/WorldEventSystem";

import {
  WorldLocationSystem
} from "../world/WorldLocationSystem";

export interface SimulationFrame {

  time: CalendarSnapshot;

  astronomy: AstronomicalEventState;
}

export class Simulation {

  readonly timeSystem:
    SimulationTime;

  readonly timeControls:
    TimeControls;

  readonly morraSystem:
    MorraSystem;

  readonly worldEventSystem:
    WorldEventSystem;

  readonly worldLocationSystem:
    WorldLocationSystem;

  readonly astronomicalEventSystem:
    AstronomicalEventSystem;

  readonly clock:
    THREE.Clock;

  constructor(
    scene: THREE.Scene
  ) {

    this.clock =
      new THREE.Clock();

    this.timeSystem =
      new SimulationTime();

    this.timeControls =
      new TimeControls(
        this.timeSystem
      );

    this.morraSystem =
      new MorraSystem(
        scene
      );

    this.worldEventSystem =
      new WorldEventSystem();

    this.worldLocationSystem =
      new WorldLocationSystem();

    this.astronomicalEventSystem =
      new AstronomicalEventSystem(
        this.morraSystem.morra,
        [
          this.morraSystem.sunLarge,
          this.morraSystem.sunMedium,
          this.morraSystem.sunSmall
        ],
        [
          this.morraSystem.moonNorth,
          this.morraSystem.moonEquator
        ]
      );
  }

  update():
    SimulationFrame {

    const delta =
      this.clock.getDelta();

    this.timeSystem.update(
      delta
    );

    this.morraSystem.update(
      this.timeSystem.totalHours
    );

    return {
      time:
        this.timeSystem.getSnapshot(),

      astronomy:
        this.astronomicalEventSystem.evaluate()
    };
  }

  dispose() {

    this.morraSystem.dispose();
  }
}
