import GUI from "lil-gui";

import { TimeControls } from "./TimeControls";
import { CameraController } from "./CameraController";

import {
  MORRA_CONFIG
} from "../world/MorraConfig";

import {
  OrbitMath
} from "../astronomy/OrbitMath";

import {
  CelestialBody
} from "../astronomy/CelestialBody";

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

  private cameraController:
    CameraController | null = null;

  private cameraControls:
    { distance: number; zoom: number } | null = null;

  private orbitPositionControls:
    Array<{
      value: number;
      body: CelestialBody;
    }> = [];

  constructor(
    timeControls: TimeControls,
    cameraController: CameraController,
    celestialBodies: {
      sunLarge: CelestialBody;
      sunMedium: CelestialBody;
      sunSmall: CelestialBody;
      moonNorth: CelestialBody;
      moonEquator: CelestialBody;
    }
  ) {

    this.gui =
      new GUI({
        title: "MORRA CONTROL CENTER",
        width: 360
      });

    this.injectPanelStyle();

    this.gui.domElement.style.maxHeight =
      "calc(100vh - 24px)";

    this.gui.domElement.style.overflowY =
      "auto";

    this.gui.domElement.style.overflowX =
      "hidden";

    this.createSimulationFolder(
      timeControls
    );

    this.createCalendarFolder();

    this.createCameraFolder(
      cameraController
    );

    this.createMorraFolder();

    this.createSunFolders(
      celestialBodies
    );

    this.createMoonFolders(
      celestialBodies
    );

    this.createLightingFolder();

    this.createSurfaceFieldFolder();

    this.createDebugFolder();
  }

  private injectPanelStyle() {

    const style =
      document.createElement(
        "style"
      );

    style.textContent = `
      .lil-gui.root {
        --background-color: rgba(15, 17, 22, 0.96);
        --widget-color: #242832;
        --hover-color: #303642;
        --focus-color: #343b49;
        --text-color: #e8ecf2;
        --number-color: #7fd7ff;
        --string-color: #9ee7c6;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px;
        box-shadow: 0 18px 50px rgba(0,0,0,0.45);
        backdrop-filter: blur(10px);
      }

      .lil-gui.root > .title {
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.08em;
        padding: 9px 11px;
      }

      .lil-gui .title {
        font-weight: 700;
      }

      .lil-gui .folder > .title {
        min-height: 28px;
        line-height: 28px;
      }
    `;

    document.head.appendChild(
      style
    );
  }

  private createSimulationFolder(
    timeControls: TimeControls
  ) {

    const folder =
      this.gui.addFolder(
        "⚙ SIMULATION"
      );

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
    ).name("MORRA ROTATION").listen();

    folder.close();
  }

  private createCalendarFolder() {

    const folder =
      this.gui.addFolder(
        "📅 CALENDAR"
      );

    folder.add(
      MORRA_CONFIG,
      "HOURS_IN_DAY",
      1,
      500,
      1
    ).name("HOURS / DAY").listen();

    folder.add(
      MORRA_CONFIG,
      "DAYS_IN_MONTH",
      1,
      500,
      1
    ).name("DAYS / MONTH").listen();

    folder.add(
      MORRA_CONFIG,
      "MONTHS_IN_YEAR",
      1,
      100,
      1
    ).name("MONTHS / YEAR").listen();

    folder.close();
  }

  private createCameraFolder(
    cameraController: CameraController
  ) {

    const folder =
      this.gui.addFolder(
        "📷 CAMERA"
      );

    const controls = {
      zoom:
        cameraController.getZoomLevel(),
      zoomSpeed:
        cameraController.zoomSpeed,
      reset: () =>
        cameraController.resetView(),
      front: () =>
        cameraController.snapToView("FRONT"),
      back: () =>
        cameraController.snapToView("BACK"),
      west: () =>
        cameraController.snapToView("WEST"),
      east: () =>
        cameraController.snapToView("EAST"),
      north: () =>
        cameraController.snapToView("NORTH"),
      south: () =>
        cameraController.snapToView("SOUTH")
    };

    folder.add(
      controls,
      "zoom",
      0,
      1,
      0.01
    )
      .name("ZOOM")
      .listen()
      .onChange(
        (value: number) => {
          cameraController.setZoomLevel(
            value
          );
        }
      );

    folder.add(
      controls,
      "zoomSpeed",
      0.2,
      3,
      0.1
    )
      .name("ZOOM SPEED")
      .onChange(
        (value: number) => {
          cameraController.zoomSpeed =
            value;
        }
      );

    folder.add(
      controls,
      "reset"
    ).name("RESET VIEW");

    folder.add(
      controls,
      "front"
    ).name("FRONT");

    folder.add(
      controls,
      "back"
    ).name("BACK");

    folder.add(
      controls,
      "west"
    ).name("WEST");

    folder.add(
      controls,
      "east"
    ).name("EAST");

    folder.add(
      controls,
      "north"
    ).name("NORTH");

    folder.add(
      controls,
      "south"
    ).name("SOUTH");

    folder.close();

    this.cameraController =
      cameraController;

    this.cameraControls = {
      distance: 0,
      zoom: cameraController.getZoomLevel()
    };
  }

  private createMorraFolder() {

    const folder =
      this.gui.addFolder(
        "🌍 MORRA"
      );

    folder.add(
      MORRA_CONFIG,
      "MORRA_RADIUS",
      MORRA_CONFIG.LIMITS.MORRA_RADIUS.min,
      MORRA_CONFIG.LIMITS.MORRA_RADIUS.max,
      MORRA_CONFIG.LIMITS.MORRA_RADIUS.step
    ).name("RADIUS").listen();

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

    folder.close();
  }

  private createSunFolders(
    celestialBodies: {
      sunLarge: CelestialBody;
      sunMedium: CelestialBody;
      sunSmall: CelestialBody;
      moonNorth: CelestialBody;
      moonEquator: CelestialBody;
    }
  ) {

    const root =
      this.gui.addFolder(
        "☀ LIGHTS / STARS"
      );

    this.createSunFolder(
      root,
      "☀ Large Sun",
      MORRA_CONFIG.SUN_LARGE,
      MORRA_CONFIG.LIGHTS.LARGE,
      celestialBodies.sunLarge
    );

    this.createSunFolder(
      root,
      "☀ Medium Sun",
      MORRA_CONFIG.SUN_MEDIUM,
      MORRA_CONFIG.LIGHTS.MEDIUM,
      celestialBodies.sunMedium
    );

    this.createSunFolder(
      root,
      "☀ Small Sun",
      MORRA_CONFIG.SUN_SMALL,
      MORRA_CONFIG.LIGHTS.SMALL,
      celestialBodies.sunSmall
    );

    root.close();
  }

  private createSunFolder(
    parent:
      GUI,
    name:
      string,
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
    },
    body: CelestialBody
  ) {

    const folder =
      parent.addFolder(
        name
      );

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
      100000,
      MORRA_CONFIG.LIMITS.BODY_RADIUS.step
    ).name("RADIUS").listen();

    folder.add(
      sun,
      "orbitRadius",
      MORRA_CONFIG.LIMITS.ORBIT_RADIUS.min,
      MORRA_CONFIG.LIMITS.ORBIT_RADIUS.max,
      MORRA_CONFIG.LIMITS.ORBIT_RADIUS.step
    ).name("ORBIT RADIUS").listen();

    const orbitPosition = {
      value:
        body.angle
    };

    folder.add(
      orbitPosition,
      "value",
      -Math.PI,
      Math.PI,
      0.0001
    )
      .name("ORBIT POSITION")
      .listen()
      .onChange(
        (value: number) =>
          body.setOrbitPosition(
            value
          )
      );

    this.orbitPositionControls.push({
      value:
        orbitPosition.value,
      body
    });

    folder.add(
      sun,
      "orbitPlaneOffset",
      MORRA_CONFIG.LIMITS.ORBIT_PLANE_OFFSET.min,
      MORRA_CONFIG.LIMITS.ORBIT_PLANE_OFFSET.max,
      MORRA_CONFIG.LIMITS.ORBIT_PLANE_OFFSET.step
    ).name("PLANE OFFSET").listen();

    folder.add(
      sun,
      "orbitSpeed",
      MORRA_CONFIG.LIMITS.ORBIT_SPEED.min,
      MORRA_CONFIG.LIMITS.ORBIT_SPEED.max,
      MORRA_CONFIG.LIMITS.ORBIT_SPEED.step
    ).name("ORBIT SPEED").listen();

    folder.add(
      sun,
      "orbitInclination",
      MORRA_CONFIG.LIMITS.ORBIT_INCLINATION.min,
      MORRA_CONFIG.LIMITS.ORBIT_INCLINATION.max,
      MORRA_CONFIG.LIMITS.ORBIT_INCLINATION.step
    ).name("INCLINATION (°)").listen();

    folder.add(
      sun,
      "orbitAscendingNode",
      MORRA_CONFIG.LIMITS.ORBIT_ASCENDING_NODE.min,
      MORRA_CONFIG.LIMITS.ORBIT_ASCENDING_NODE.max,
      MORRA_CONFIG.LIMITS.ORBIT_ASCENDING_NODE.step
    ).name("NODE (°)").listen();

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
      ).name("ECCENTRICITY").listen();

    this.eccentricityControls.push({
      controller:
        eccentricityController,
      config:
        sun,
      clearance:
        100
    });

    folder.close();
  }

  private createMoonFolders(
    celestialBodies: {
      sunLarge: CelestialBody;
      sunMedium: CelestialBody;
      sunSmall: CelestialBody;
      moonNorth: CelestialBody;
      moonEquator: CelestialBody;
    }
  ) {

    const root =
      this.gui.addFolder(
        "🌙 MOONS"
      );

    this.createMoonFolder(
      root,
      "🌙 North Moon",
      MORRA_CONFIG.MOON_NORTH,
      celestialBodies.moonNorth
    );

    this.createMoonFolder(
      root,
      "🌙 Equator Moon",
      MORRA_CONFIG.MOON_EQUATOR,
      celestialBodies.moonEquator
    );

    const reflection =
      root.addFolder(
        "🌙 REFLECTION"
      );

    reflection.add(
      MORRA_CONFIG.MOON_REFLECTION,
      "enabled"
    ).name("ENABLED").listen();

    reflection.add(
      MORRA_CONFIG.MOON_REFLECTION,
      "albedo",
      0,
      1,
      0.01
    ).name("ALBEDO").listen();

    reflection.add(
      MORRA_CONFIG.MOON_REFLECTION,
      "intensityScale",
      0,
      100000000,
      100000
    ).name("INTENSITY SCALE").listen();

    reflection.add(
      MORRA_CONFIG.MOON_REFLECTION,
      "maxIntensity",
      0,
      10,
      0.01
    ).name("MAX INTENSITY").listen();

    reflection.close();

    root.close();
  }

  private createMoonFolder(
    parent:
      GUI,
    name:
      string,
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
    },
    body: CelestialBody
  ) {

    const folder =
      parent.addFolder(
        name
      );

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
    ).name("RADIUS").listen();

    folder.add(
      moon,
      "orbitRadius",
      MORRA_CONFIG.LIMITS.ORBIT_RADIUS.min,
      MORRA_CONFIG.LIMITS.ORBIT_RADIUS.max,
      MORRA_CONFIG.LIMITS.ORBIT_RADIUS.step
    ).name("ORBIT RADIUS").listen();

    const orbitPosition = {
      value:
        body.angle
    };

    folder.add(
      orbitPosition,
      "value",
      -Math.PI,
      Math.PI,
      0.0001
    )
      .name("ORBIT POSITION")
      .listen()
      .onChange(
        (value: number) =>
          body.setOrbitPosition(
            value
          )
      );

    this.orbitPositionControls.push({
      value:
        orbitPosition.value,
      body
    });

    folder.add(
      moon,
      "orbitSpeed",
      MORRA_CONFIG.LIMITS.ORBIT_SPEED.min,
      MORRA_CONFIG.LIMITS.ORBIT_SPEED.max,
      MORRA_CONFIG.LIMITS.ORBIT_SPEED.step
    ).name("ORBIT SPEED").listen();

    folder.add(
      moon,
      "orbitPlaneOffset",
      MORRA_CONFIG.LIMITS.ORBIT_PLANE_OFFSET.min,
      MORRA_CONFIG.LIMITS.ORBIT_PLANE_OFFSET.max,
      MORRA_CONFIG.LIMITS.ORBIT_PLANE_OFFSET.step
    ).name("PLANE OFFSET").listen();

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
    ).name("INCLINATION (°)").listen();

    folder.add(
      moon,
      "orbitAscendingNode",
      MORRA_CONFIG.LIMITS.ORBIT_ASCENDING_NODE.min,
      MORRA_CONFIG.LIMITS.ORBIT_ASCENDING_NODE.max,
      MORRA_CONFIG.LIMITS.ORBIT_ASCENDING_NODE.step
    ).name("NODE (°)").listen();

    folder.add(
      moon,
      "orbitEccentricity",
      MORRA_CONFIG.LIMITS.ORBIT_ECCENTRICITY.min,
      MORRA_CONFIG.LIMITS.ORBIT_ECCENTRICITY.max,
      MORRA_CONFIG.LIMITS.ORBIT_ECCENTRICITY.step
    ).name("ECCENTRICITY").listen();

    folder.close();
  }

  private createLightingFolder() {

    const folder =
      this.gui.addFolder(
        "💡 LIGHTING"
      );

    folder.add(
      MORRA_CONFIG.LIGHTS,
      "ambient",
      0,
      10,
      0.01
    ).name("AMBIENT").listen();

    folder.add(
      MORRA_CONFIG.LIGHTS.LARGE,
      "intensity",
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.min,
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.max,
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.step
    ).name("LARGE SUN").listen();

    folder.add(
      MORRA_CONFIG.LIGHTS.MEDIUM,
      "intensity",
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.min,
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.max,
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.step
    ).name("MEDIUM SUN").listen();

    folder.add(
      MORRA_CONFIG.LIGHTS.SMALL,
      "intensity",
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.min,
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.max,
      MORRA_CONFIG.LIMITS.LIGHT_INTENSITY.step
    ).name("SMALL SUN").listen();

    folder.close();
  }

  private createSurfaceFieldFolder() {

    const folder =
      this.gui.addFolder(
        "🧭 PHYSICS / SURFACE"
      );

    folder.add(
      MORRA_CONFIG.SURFACE_FIELD,
      "latitudeSegments",
      8,
      96,
      4
    ).name("LATITUDE RESOLUTION").listen();

    folder.add(
      MORRA_CONFIG.SURFACE_FIELD,
      "longitudeSegments",
      16,
      192,
      8
    ).name("LONGITUDE RESOLUTION").listen();

    folder.add(
      MORRA_CONFIG.SURFACE_FIELD,
      "updateIntervalHours",
      0,
      10,
      0.05
    ).name("UPDATE INTERVAL").listen();

    folder.add(
      MORRA_CONFIG.SURFACE_FIELD,
      "channel",
      [
        "LIGHT_TOTAL",
        "HEAT_TOTAL",
        "MAGIC_TOTAL",
        "LARGE_SUN",
        "MEDIUM_SUN",
        "SMALL_SUN",
        "NORTH_MOON",
        "EQUATOR_MOON",
        "SPECTRUM",
        "DAY_NIGHT",
        "LIGHT",
        "HEAT",
        "MAGIC",
        "MAGOSPHERE",
        "ANOMALY",
        "SHADOW",
        "UMBRA",
        "PENUMBRA"
      ]
    ).name("FIELD").listen();

    folder.add(
      MORRA_CONFIG.SURFACE_FIELD,
      "opacity",
      0,
      1,
      0.01
    ).name("MAP OPACITY").listen();

    folder.add(
      MORRA_CONFIG.MOON_REFLECTION,
      "enabled"
    ).name("MOON REFLECTION").listen();

    folder.close();
  }

  private createDebugFolder() {

    const folder =
      this.gui.addFolder(
        "🛠 VISUAL DEBUG"
      );

    folder.add(
      MORRA_CONFIG.DEBUG,
      "showAxis"
    ).name("AXIS").listen();

    folder.add(
      MORRA_CONFIG.DEBUG,
      "showEquator"
    ).name("EQUATOR").listen();

    folder.add(
      MORRA_CONFIG.DEBUG,
      "showOrbits"
    ).name("ORBITS").listen();

    folder.add(
      MORRA_CONFIG.DEBUG,
      "showLightHelpers"
    ).name("LIGHT HELPERS").listen();

    folder.add(
      MORRA_CONFIG.DEBUG,
      "showTimePanel"
    ).name("TIME PANEL").listen();

    folder.add(
      MORRA_CONFIG.DEBUG,
      "showTimeline"
    ).name("TIMELINE").listen();

    folder.add(
      MORRA_CONFIG.DEBUG,
      "showSurfaceField"
    ).name("SURFACE MAP").listen();