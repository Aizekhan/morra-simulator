import GUI from "lil-gui";

import { TimeControls } from "./TimeControls";

import {
  MORRA_CONFIG
} from "../world/MorraConfig";

import {
  OrbitMath
} from "../astronomy/OrbitMath";

interface EccentricityControl {

  controller: {

    max(
      value: number
    ): unknown;

  };

  config: {

    radius: number;

    orbitRadius: number;

  };

  clearance: number;

}

export class DebugPanel {

  gui: GUI;

  private eccentricityControls:
    EccentricityControl[] = [];

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
    ).name("TIME SCALE").listen();

    folder.add(
      MORRA_CONFIG,
      "ROTATION_SPEED",
      MORRA_CONFIG.LIMITS.ROTATION_SPEED.min,
      MORRA_CONFIG.LIMITS.ROTATION_SPEED.max,
      MORRA_CONFIG.LIMITS.ROTATION_SPEED.step
    ).listen();
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
    ).listen();

    folder.add(
      MORRA_CONFIG,
      "DAYS_IN_MONTH",
      1,
      500,
      1
    ).listen();

    folder.add(
      MORRA_CONFIG,
      "MONTHS_IN_YEAR",
      1,
      100,
      1
    ).listen();

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

    folder.add(
      MORRA_CONFIG,
      "MORRA_VISIBLE"
    ).name("VISIBLE").listen();

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
    ).name("AXIS TILT (°)").listen();
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
      orbitPlaneOffset: number;
      orbitInclination: number;
      orbitAscendingNode: number;
      orbitEccentricity: number;
      reverseOrbit: boolean;
      visible: boolean;
    },
    light: {
      color: number;
    }
  ) {

    const folder =
      this.gui.addFolder(name);

    folder.add(
      sun,
      "visible"
    ).name("VISIBLE").listen();

    folder.addColor(
      light,
      "color"
    ).name("COLOR").listen();

    folder.add(
      sun,
      "radius",
      MORRA_CONFIG.LIMITS.BODY_RADIUS.min,
      MORRA_CONFIG.LIMITS.BODY_RADIUS.max,
      MORRA_CONFIG.LIMITS.BODY_RADIUS.step
    ).listen();

    folder.add(
      sun,
      "orbitRadius",
      MORRA_CONFIG.LIMITS.ORBIT_RADIUS.min,
      MORRA_CONFIG.LIMITS.ORBIT_RADIUS.max,
      MORRA_CONFIG.LIMITS.ORBIT_RADIUS.step
    ).listen();

    folder.add(
      sun,
      "orbitPlaneOffset",
      MORRA_CONFIG.LIMITS.ORBIT_PLANE_OFFSET.min,
      MORRA_CONFIG.LIMITS.ORBIT_PLANE_OFFSET.max,
      MORRA_CONFIG.LIMITS.ORBIT_PLANE_OFFSET.step
    ).name("ORBIT PLANE OFFSET").listen();

    folder.add(
      sun,
      "orbitSpeed",
      MORRA_CONFIG.LIMITS.ORBIT_SPEED.min,
      MORRA_CONFIG.LIMITS.ORBIT_SPEED.max,
      MORRA_CONFIG.LIMITS.ORBIT_SPEED.step
    ).listen();

    folder.add(
      sun,
      "orbitInclination",
      MORRA_CONFIG.LIMITS.ORBIT_INCLINATION.min,
      MORRA_CONFIG.LIMITS.ORBIT_INCLINATION.max,
      MORRA_CONFIG.LIMITS.ORBIT_INCLINATION.step
    ).name("ORBIT INCLINATION (°)").listen();

    folder.add(
      sun,
      "orbitAscendingNode",
      MORRA_CONFIG.LIMITS.ORBIT_ASCENDING_NODE.min,
      MORRA_CONFIG.LIMITS.ORBIT_ASCENDING_NODE.max,
      MORRA_CONFIG.LIMITS.ORBIT_ASCENDING_NODE.step
    ).name("ORBIT NODE (°)").listen();

    folder.add(
      sun,
      "reverseOrbit"
    ).name("REVERSE ORBIT").listen();

    const eccentricityController =
      folder.add(
        sun,
        "orbitEccentricity",
        MORRA_CONFIG.LIMITS.ORBIT_ECCENTRICITY.min,
        MORRA_CONFIG.LIMITS.ORBIT_ECCENTRICITY.max,
        MORRA_CONFIG.LIMITS.ORBIT_ECCENTRICITY.step
      ).name("ORBIT ECCENTRICITY").listen();

    this.eccentricityControls.push({
      controller:
        eccentricityController,
      config:
        sun,
      clearance:
        100
    });
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
      orbitInclination: number;
      orbitAscendingNode: number;
      orbitEccentricity: number;
      orbitPlaneOffset: number;
      reverseOrbit: boolean;
      visible: boolean;
    }
  ) {

    const folder =
      this.gui.addFolder(name);

    folder.add(
      moon,
      "visible"
    ).name("VISIBLE").listen();

    folder.addColor(
      moon,
      "color"
    ).name("COLOR").listen();

    folder.addColor(
      moon,
      "orbitColor"
    ).name("ORBIT COLOR").listen();

    folder.add(
      moon,
      "radius",
      MORRA_CONFIG.LIMITS.BODY_RADIUS.min,
      MORRA_CONFIG.LIMITS.BODY_RADIUS.max,
      MORRA_CONFIG.LIMITS.BODY_RADIUS.step
    ).listen();

    folder.add(
      moon,
      "orbitRadius",
      MORRA_CONFIG.LIMITS.ORBIT_RADIUS.min,
      MORRA_CONFIG.LIMITS.ORBIT_RADIUS.max,
      MORRA_CONFIG.LIMITS.ORBIT_RADIUS.step
    ).listen();

    folder.add(
      moon,
      "orbitSpeed",
      MORRA_CONFIG.LIMITS.ORBIT_SPEED.min,
      MORRA_CONFIG.LIMITS.ORBIT_SPEED.max,
      MORRA_CONFIG.LIMITS.ORBIT_SPEED.step
    ).listen();

    folder.add(
      moon,
      "orbitPlaneOffset",
      MORRA_CONFIG.LIMITS.ORBIT_PLANE_OFFSET.min,
      MORRA_CONFIG.LIMITS.ORBIT_PLANE_OFFSET.max,
      MORRA_CONFIG.LIMITS.ORBIT_PLANE_OFFSET.step
    ).name("ORBIT PLANE OFFSET").listen();

    folder.add(
      moon,
      "reverseOrbit"
    ).name("REVERSE ORBIT").listen();

    folder.add(
      moon,
      "orbitInclination",
      MORRA_CONFIG.LIMITS.ORBIT_INCLINATION.min,
      MORRA_CONFIG.LIMITS.ORBIT_INCLINATION.max,
      MORRA_CONFIG.LIMITS.ORBIT_INCLINATION.step
    ).name("ORBIT INCLINATION (°)").listen();

    folder.add(
      moon,
      "orbitAscendingNode",
      MORRA_CONFIG.LIMITS.ORBIT_ASCENDING_NODE.min,
      MORRA_CONFIG.LIMITS.ORBIT_ASCENDING_NODE.max,
      MORRA_CONFIG.LIMITS.ORBIT_ASCENDING_NODE.step
    ).name("ORBIT NODE (°)").listen();

    folder.add(
      moon,
      "orbitEccentricity",
      MORRA_CONFIG.LIMITS.ORBIT_ECCENTRICITY.min,
      MORRA_CONFIG.LIMITS.ORBIT_ECCENTRICITY.max,
      MORRA_CONFIG.LIMITS.ORBIT_ECCENTRICITY.step
    ).name("ORBIT ECCENTRICITY").listen();
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
    ).name("AMBIENT LIGHT").listen();

    folder.add(
      MORRA_CONFIG.LIGHTS.LARGE,
      "intensity",
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.min,
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.max,
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.step
    ).name("LARGE SUN INTENSITY").listen();

    folder.add(
      MORRA_CONFIG.LIGHTS.MEDIUM,
      "intensity",
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.min,
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.max,
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.step
    ).name("MEDIUM SUN INTENSITY").listen();

    folder.add(
      MORRA_CONFIG.LIGHTS.SMALL,
      "intensity",
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.min,
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.max,
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.step
    ).name("SMALL SUN INTENSITY").listen();
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

  update() {

    for (
      const control of
      this.eccentricityControls
    ) {

      const minimumPeriapsisDistance =
        MORRA_CONFIG.MORRA_RADIUS +
        control.config.radius +
        control.clearance;

      const maximumEccentricity =
        OrbitMath.getMaxEccentricity(
          control.config.orbitRadius,
          minimumPeriapsisDistance
        );

      control.controller.max(
        maximumEccentricity
      );
    }
  }

  destroy() {

    this.gui.destroy();
  }
}
