import GUI from "lil-gui";

import { MORRA_CONFIG }
from "../world/MorraConfig";

export const gui =
  new GUI({
    title: "MORRA Simulator",
    width: 420
  });

// =====================
// FOLDERS
// =====================

export const worldFolder =
  gui.addFolder("World");

export const timeFolder =
  gui.addFolder("Time");

export const morraFolder =
  gui.addFolder("Morra");

export const largeSunFolder =
  gui.addFolder("Large Sun");

export const mediumSunFolder =
  gui.addFolder("Medium Sun");

export const smallSunFolder =
  gui.addFolder("Small Sun");

export const moonNorthFolder =
  gui.addFolder("North Moon");

export const moonEquatorFolder =
  gui.addFolder("Equator Moon");

export const lightingFolder =
  gui.addFolder("Lighting");

export const debugFolder =
  gui.addFolder("Debug");

// =====================
// WORLD
// =====================

worldFolder.add(
  MORRA_CONFIG,
  "TIME_SPEED",
  0,
  10000,
  1
);

worldFolder.add(
  MORRA_CONFIG,
  "ROTATION_SPEED",
  0,
  1,
  0.001
);

worldFolder.add(
  MORRA_CONFIG,
  "AXIS_TILT",
  0,
  90,
  0.1
);

// =====================
// TIME
// =====================

timeFolder.add(
  MORRA_CONFIG.DEBUG,
  "showTimePanel"
);

timeFolder.add(
  MORRA_CONFIG.DEBUG,
  "showTimeline"
);

// =====================
// MORRA
// =====================

morraFolder.add(
  MORRA_CONFIG,
  "MORRA_RADIUS",
  50,
  1000,
  1
);

// =====================
// LARGE SUN
// =====================

largeSunFolder.add(
  MORRA_CONFIG.SUN_LARGE,
  "radius",
  1,
  500,
  1
);

largeSunFolder.add(
  MORRA_CONFIG.SUN_LARGE,
  "orbitRadius",
  50,
  10000,
  1
);

largeSunFolder.add(
  MORRA_CONFIG.SUN_LARGE,
  "orbitHeight",
  -5000,
  5000,
  1
);

largeSunFolder.add(
  MORRA_CONFIG.SUN_LARGE,
  "orbitSpeed",
  0,
  0.05,
  0.0001
);

// =====================
// MEDIUM SUN
// =====================

mediumSunFolder.add(
  MORRA_CONFIG.SUN_MEDIUM,
  "radius",
  1,
  500,
  1
);

mediumSunFolder.add(
  MORRA_CONFIG.SUN_MEDIUM,
  "orbitRadius",
  50,
  10000,
  1
);

mediumSunFolder.add(
  MORRA_CONFIG.SUN_MEDIUM,
  "orbitHeight",
  -5000,
  5000,
  1
);

mediumSunFolder.add(
  MORRA_CONFIG.SUN_MEDIUM,
  "orbitSpeed",
  0,
  0.05,
  0.0001
);

// =====================
// SMALL SUN
// =====================

smallSunFolder.add(
  MORRA_CONFIG.SUN_SMALL,
  "radius",
  1,
  500,
  1
);

smallSunFolder.add(
  MORRA_CONFIG.SUN_SMALL,
  "orbitRadius",
  50,
  10000,
  1
);

smallSunFolder.add(
  MORRA_CONFIG.SUN_SMALL,
  "orbitSpeed",
  0,
  0.05,
  0.0001
);

// =====================
// NORTH MOON
// =====================

moonNorthFolder.add(
  MORRA_CONFIG.MOON_NORTH,
  "radius",
  1,
  300,
  1
);

moonNorthFolder.add(
  MORRA_CONFIG.MOON_NORTH,
  "orbitRadius",
  50,
  5000,
  1
);

moonNorthFolder.add(
  MORRA_CONFIG.MOON_NORTH,
  "orbitSpeed",
  0,
  0.05,
  0.0001
);

// =====================
// EQUATOR MOON
// =====================

moonEquatorFolder.add(
  MORRA_CONFIG.MOON_EQUATOR,
  "radius",
  1,
  300,
  1
);

moonEquatorFolder.add(
  MORRA_CONFIG.MOON_EQUATOR,
  "orbitRadius",
  50,
  5000,
  1
);

moonEquatorFolder.add(
  MORRA_CONFIG.MOON_EQUATOR,
  "orbitSpeed",
  0,
  0.05,
  0.0001
);

// =====================
// LIGHTING
// =====================

lightingFolder.add(
  MORRA_CONFIG.LIGHTS,
  "ambient",
  0,
  5,
  0.01
);

lightingFolder.add(
  MORRA_CONFIG.LIGHTS.LARGE,
  "intensity",
  0,
  500,
  1
);

lightingFolder.add(
  MORRA_CONFIG.LIGHTS.MEDIUM,
  "intensity",
  0,
  500,
  1
);

lightingFolder.add(
  MORRA_CONFIG.LIGHTS.SMALL,
  "intensity",
  0,
  500,
  1
);

// =====================
// DEBUG
// =====================

debugFolder.add(
  MORRA_CONFIG.DEBUG,
  "showAxis"
);

debugFolder.add(
  MORRA_CONFIG.DEBUG,
  "showEquator"
);

debugFolder.add(
  MORRA_CONFIG.DEBUG,
  "showOrbits"
);

debugFolder.add(
  MORRA_CONFIG.DEBUG,
  "showLightHelpers"
);

debugFolder.add(
  MORRA_CONFIG.DEBUG,
  "showTimePanel"
);

debugFolder.add(
  MORRA_CONFIG.DEBUG,
  "showTimeline"
);

// =====================

worldFolder.open();