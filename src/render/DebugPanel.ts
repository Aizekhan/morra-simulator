import GUI from "lil-gui";

import { TimeControls } from "./TimeControls";

import {
  MORRA_CONFIG
} from "../world/MorraConfig";

export class DebugPanel {

  gui: GUI;

  constructor(
    timeControls: TimeControls
  ) {

    this.gui =
      new GUI({
        title: "MORRA Simulator",
        width: 420
      });

    this.createWorldFolder();
    this.createTimeFolder(timeControls);
    this.createMorraFolder();
    this.createSunFolders();
    this.createMoonFolders();
    this.createLightingFolder();
    this.createDebugFolder();
  }

  private createWorldFolder() {

    const folder =
      this.gui.addFolder("World");

    folder.add(
      MORRA_CONFIG,
      "TIME_SPEED",
      MORRA_CONFIG.LIMITS.TIME_SPEED.min,
      MORRA_CONFIG.LIMITS.TIME_SPEED.max,
      MORRA_CONFIG.LIMITS.TIME_SPEED.step
    );

    folder.add(
      MORRA_CONFIG,
      "ROTATION_SPEED",
      MORRA_CONFIG.LIMITS.ROTATION_SPEED.min,
      MORRA_CONFIG.LIMITS.ROTATION_SPEED.max,
      MORRA_CONFIG.LIMITS.ROTATION_SPEED.step
    );
  }

  private createTimeFolder(
    timeControls: TimeControls
  ) {

    const folder =
      this.gui.addFolder("Time");

    folder.add(
      MORRA_CONFIG.DEBUG,
      "showTimePanel"
    );

    folder.add(
      MORRA_CONFIG.DEBUG,
      "showTimeline"
    );

    folder.add(
      timeControls,
      "pause"
    ).name("Pause / Resume");

    folder.add(
      timeControls,
      "speed1"
    ).name("1x");

    folder.add(
      timeControls,
      "speed10"
    ).name("10x");

    folder.add(
      timeControls,
      "speed100"
    ).name("100x");

    folder.add(
      timeControls,
      "speed1000"
    ).name("1000x");

    folder.add(
      timeControls,
      "addHour"
    ).name("+ 1 Hour");

    folder.add(
      timeControls,
      "addDay"
    ).name("+ 1 Day");

    folder.open();
  }

  private createMorraFolder() {

    const folder =
      this.gui.addFolder("Morra");

    folder.add(
      MORRA_CONFIG,
      "MORRA_RADIUS",
      MORRA_CONFIG.LIMITS.MORRA_RADIUS.min,
      MORRA_CONFIG.LIMITS.MORRA_RADIUS.max,
      MORRA_CONFIG.LIMITS.MORRA_RADIUS.step
    );

    folder.add(
      MORRA_CONFIG,
      "AXIS_TILT",
      MORRA_CONFIG.LIMITS.AXIS_TILT.min,
      MORRA_CONFIG.LIMITS.AXIS_TILT.max,
      MORRA_CONFIG.LIMITS.AXIS_TILT.step
    );
  }

  private createSunFolders() {

    this.createSunFolder(
      "Large Sun",
      MORRA_CONFIG.SUN_LARGE
    );

    this.createSunFolder(
      "Medium Sun",
      MORRA_CONFIG.SUN_MEDIUM
    );

    this.createSunFolder(
      "Small Sun",
      MORRA_CONFIG.SUN_SMALL
    );
  }

  private createSunFolder(
    name: string,
    sun: {
      radius: number;
      orbitRadius: number;
      orbitSpeed: number;
      orbitHeight: number;
    }
  ) {

    const folder =
      this.gui.addFolder(name);

    folder.add(
      sun,
      "radius",
      MORRA_CONFIG.LIMITS.BODY_RADIUS.min,
      MORRA_CONFIG.LIMITS.BODY_RADIUS.max,
      MORRA_CONFIG.LIMITS.BODY_RADIUS.step
    );

    folder.add(
      sun,
      "orbitRadius",
      MORRA_CONFIG.LIMITS.ORBIT_RADIUS.min,
      MORRA_CONFIG.LIMITS.ORBIT_RADIUS.max,
      MORRA_CONFIG.LIMITS.ORBIT_RADIUS.step
    );

    folder.add(
      sun,
      "orbitHeight",
      MORRA_CONFIG.LIMITS.BODY_HEIGHT.min,
      MORRA_CONFIG.LIMITS.BODY_HEIGHT.max,
      MORRA_CONFIG.LIMITS.BODY_HEIGHT.step
    );

    folder.add(
      sun,
      "orbitSpeed",
      MORRA_CONFIG.LIMITS.ORBIT_SPEED.min,
      MORRA_CONFIG.LIMITS.ORBIT_SPEED.max,
      MORRA_CONFIG.LIMITS.ORBIT_SPEED.step
    );
  }

  private createMoonFolders() {

    this.createMoonFolder(
      "North Moon",
      MORRA_CONFIG.MOON_NORTH
    );

    this.createMoonFolder(
      "Equator Moon",
      MORRA_CONFIG.MOON_EQUATOR
    );
  }

  private createMoonFolder(
    name: string,
    moon: {
      radius: number;
      orbitRadius: number;
      orbitSpeed: number;
    }
  ) {

    const folder =
      this.gui.addFolder(name);

    folder.add(
      moon,
      "radius",
      MORRA_CONFIG.LIMITS.BODY_RADIUS.min,
      MORRA_CONFIG.LIMITS.BODY_RADIUS.max,
      MORRA_CONFIG.LIMITS.BODY_RADIUS.step
    );

    folder.add(
      moon,
      "orbitRadius",
      MORRA_CONFIG.LIMITS.ORBIT_RADIUS.min,
      MORRA_CONFIG.LIMITS.ORBIT_RADIUS.max,
      MORRA_CONFIG.LIMITS.ORBIT_RADIUS.step
    );

    folder.add(
      moon,
      "orbitSpeed",
      MORRA_CONFIG.LIMITS.ORBIT_SPEED.min,
      MORRA_CONFIG.LIMITS.ORBIT_SPEED.max,
      MORRA_CONFIG.LIMITS.ORBIT_SPEED.step
    );
  }

  private createLightingFolder() {

    const folder =
      this.gui.addFolder("Lighting");

    folder.add(
      MORRA_CONFIG.LIGHTS,
      "ambient",
      0,
      10,
      0.01
    );

    folder.add(
      MORRA_CONFIG.LIGHTS.LARGE,
      "intensity",
      0,
      500,
      1
    );

    folder.add(
      MORRA_CONFIG.LIGHTS.MEDIUM,
      "intensity",
      0,
      500,
      1
    );

    folder.add(
      MORRA_CONFIG.LIGHTS.SMALL,
      "intensity",
      0,
      500,
      1
    );
  }

  private createDebugFolder() {

    const folder =
      this.gui.addFolder("Debug");

    folder.add(
      MORRA_CONFIG.DEBUG,
      "showAxis"
    );

    folder.add(
      MORRA_CONFIG.DEBUG,
      "showEquator"
    );

    folder.add(
      MORRA_CONFIG.DEBUG,
      "showOrbits"
    );

    folder.add(
      MORRA_CONFIG.DEBUG,
      "showLightHelpers"
    );

    folder.add(
      MORRA_CONFIG.DEBUG,
      "showTimePanel"
    );

    folder.add(
      MORRA_CONFIG.DEBUG,
      "showTimeline"
    );
  }

  destroy() {

    this.gui.destroy();
  }
}
