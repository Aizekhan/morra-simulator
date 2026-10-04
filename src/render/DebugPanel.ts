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

    this.createWorldFolder(
      timeControls
    );

    this.createTimeFolder();

    this.createMorraFolder();

    this.createSunFolders();

    this.createMoonFolders();

    this.createLightingFolder();

    this.createDebugFolder();
  }

  private createWorldFolder(
    timeControls: TimeControls
  ) {

    const folder =
      this.gui.addFolder("World");

    folder.add(
      timeControls,
      "timeScale",
      MORRA_CONFIG.LIMITS.TIME_SPEED.min,
      MORRA_CONFIG.LIMITS.TIME_SPEED.max,
      MORRA_CONFIG.LIMITS.TIME_SPEED.step
    ).name("TIME SCALE");

    folder.add(
      MORRA_CONFIG,
      "ROTATION_SPEED",
      MORRA_CONFIG.LIMITS.ROTATION_SPEED.min,
      MORRA_CONFIG.LIMITS.ROTATION_SPEED.max,
      MORRA_CONFIG.LIMITS.ROTATION_SPEED.step
    );
  }

  private createTimeFolder() {

    const folder =
      this.gui.addFolder("Time");

    folder.add(
      MORRA_CONFIG,
      "HOURS_IN_DAY",
      1,
      500,
      1
    );

    folder.add(
      MORRA_CONFIG,
      "DAYS_IN_MONTH",
      1,
      500,
      1
    );

    folder.add(
      MORRA_CONFIG,
      "MONTHS_IN_YEAR",
      1,
      100,
      1
    );

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
    ).listen();

    folder.addColor(
      MORRA_CONFIG,
      "MORRA_COLOR"
    ).name("COLOR").listen();

    folder.add(
      MORRA_CONFIG,
      "AXIS_TILT",
      MORRA_CONFIG.LIMITS.AXIS_TILT.min,
      MORRA_CONFIG.LIMITS.AXIS_TILT.max,
      MORRA_CONFIG.LIMITS.AXIS_TILT.step
    ).listen();
  }

  private createSunFolders() {

    this.createSunFolder(
      "Large Sun",
      MORRA_CONFIG.SUN_LARGE,
      MORRA_CONFIG.LIGHTS.LARGE
    );

    this.createSunFolder(
      "Medium Sun",
      MORRA_CONFIG.SUN_MEDIUM,
      MORRA_CONFIG.LIGHTS.MEDIUM
    );

    this.createSunFolder(
      "Small Sun",
      MORRA_CONFIG.SUN_SMALL,
      MORRA_CONFIG.LIGHTS.SMALL
    );
  }

  private createSunFolder(
    name: string,
    sun: {
      radius: number;
      orbitRadius: number;
      orbitSpeed: number;
      orbitHeight: number;
    },
    light: {
      color: number;
    }
  ) {

    const folder =
      this.gui.addFolder(name);

    folder.addColor(
      light,
      "color"
    ).name("COLOR");

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
      color: number;
      orbitColor: number;
      orbitRadius: number;
      orbitSpeed: number;
    }
  ) {

    const folder =
      this.gui.addFolder(name);

    folder.addColor(
      moon,
      "color"
    ).name("COLOR");

    folder.addColor(
      moon,
      "orbitColor"
    ).name("ORBIT COLOR");

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
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.min,
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.max,
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.step
    );

    folder.add(
      MORRA_CONFIG.LIGHTS.MEDIUM,
      "intensity",
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.min,
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.max,
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.step
    );

    folder.add(
      MORRA_CONFIG.LIGHTS.SMALL,
      "intensity",
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.min,
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.max,
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.step
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
