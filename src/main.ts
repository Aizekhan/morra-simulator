import "./style.css";

import * as THREE from "three";

import { Simulation }
from "./core/Simulation";

import { CameraController }
from "./render/CameraController";

import {
  worldFolder,
  timeFolder,
  morraFolder,
  largeSunFolder,
  mediumSunFolder,
  smallSunFolder,
  moonNorthFolder,
  moonEquatorFolder,
  lightingFolder,
  debugFolder
}
from "./render/DebugPanel";

import { MORRA_CONFIG }
from "./world/MorraConfig";

const scene =
  new THREE.Scene();

scene.background =
  new THREE.Color(
    0x000011
  );

const camera =
  new THREE.PerspectiveCamera(
    60,
    window.innerWidth /
    window.innerHeight,
    0.1,
    50000
  );

camera.position.set(
  0,
  1000,
  2500
);

const renderer =
  new THREE.WebGLRenderer({
    antialias: true
  });

renderer.shadowMap.enabled =
  true;

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

document.body.innerHTML = "";

document.body.style.margin =
  "0";

document.body.appendChild(
  renderer.domElement
);

const ambientLight =
  new THREE.AmbientLight(
    0xffffff,
    MORRA_CONFIG.LIGHTS.ambient
  );

scene.add(
  ambientLight
);

const simulation =
  new Simulation(
    scene
  );

const cameraController =
  new CameraController(
    camera,
    renderer.domElement
  );

// =====================
// WORLD
// =====================

worldFolder.add(
  MORRA_CONFIG,
  "TIME_SPEED",
  MORRA_CONFIG.LIMITS.TIME_SPEED.min,
  MORRA_CONFIG.LIMITS.TIME_SPEED.max,
  MORRA_CONFIG.LIMITS.TIME_SPEED.step
);

worldFolder.add(
  MORRA_CONFIG,
  "ROTATION_SPEED",
  MORRA_CONFIG.LIMITS.ROTATION_SPEED.min,
  MORRA_CONFIG.LIMITS.ROTATION_SPEED.max,
  MORRA_CONFIG.LIMITS.ROTATION_SPEED.step
);

worldFolder.add(
  MORRA_CONFIG,
  "MORRA_RADIUS",
  MORRA_CONFIG.LIMITS.MORRA_RADIUS.min,
  MORRA_CONFIG.LIMITS.MORRA_RADIUS.max,
  MORRA_CONFIG.LIMITS.MORRA_RADIUS.step
);

worldFolder.add(
  MORRA_CONFIG,
  "AXIS_TILT",
  MORRA_CONFIG.LIMITS.AXIS_TILT.min,
  MORRA_CONFIG.LIMITS.AXIS_TILT.max,
  MORRA_CONFIG.LIMITS.AXIS_TILT.step
);

// =====================
// TIME
// =====================

timeFolder.add(
  MORRA_CONFIG,
  "HOURS_IN_DAY",
  1,
  500,
  1
);

timeFolder.add(
  MORRA_CONFIG,
  "DAYS_IN_MONTH",
  1,
  500,
  1
);

timeFolder.add(
  MORRA_CONFIG,
  "MONTHS_IN_YEAR",
  1,
  100,
  1
);

// =====================
// MORRA
// =====================

morraFolder.add(
  MORRA_CONFIG,
  "MORRA_RADIUS",
  MORRA_CONFIG.LIMITS.MORRA_RADIUS.min,
  MORRA_CONFIG.LIMITS.MORRA_RADIUS.max,
  MORRA_CONFIG.LIMITS.MORRA_RADIUS.step
);

morraFolder.add(
  MORRA_CONFIG,
  "AXIS_TILT",
  MORRA_CONFIG.LIMITS.AXIS_TILT.min,
  MORRA_CONFIG.LIMITS.AXIS_TILT.max,
  MORRA_CONFIG.LIMITS.AXIS_TILT.step
);

// =====================
// LARGE SUN
// =====================

largeSunFolder.add(
  MORRA_CONFIG.SUN_LARGE,
  "radius",
  MORRA_CONFIG.LIMITS.BODY_RADIUS.min,
  MORRA_CONFIG.LIMITS.BODY_RADIUS.max,
  MORRA_CONFIG.LIMITS.BODY_RADIUS.step
);

largeSunFolder.add(
  MORRA_CONFIG.SUN_LARGE,
  "orbitRadius",
  MORRA_CONFIG.LIMITS.ORBIT_RADIUS.min,
  MORRA_CONFIG.LIMITS.ORBIT_RADIUS.max,
  MORRA_CONFIG.LIMITS.ORBIT_RADIUS.step
);

largeSunFolder.add(
  MORRA_CONFIG.SUN_LARGE,
  "orbitSpeed",
  MORRA_CONFIG.LIMITS.ORBIT_SPEED.min,
  MORRA_CONFIG.LIMITS.ORBIT_SPEED.max,
  MORRA_CONFIG.LIMITS.ORBIT_SPEED.step
);

largeSunFolder.add(
  MORRA_CONFIG.SUN_LARGE,
  "orbitHeight",
  MORRA_CONFIG.LIMITS.BODY_HEIGHT.min,
  MORRA_CONFIG.LIMITS.BODY_HEIGHT.max,
  MORRA_CONFIG.LIMITS.BODY_HEIGHT.step
);

// =====================
// MEDIUM SUN
// =====================

mediumSunFolder.add(
  MORRA_CONFIG.SUN_MEDIUM,
  "radius",
  MORRA_CONFIG.LIMITS.BODY_RADIUS.min,
  MORRA_CONFIG.LIMITS.BODY_RADIUS.max,
  MORRA_CONFIG.LIMITS.BODY_RADIUS.step
);

mediumSunFolder.add(
  MORRA_CONFIG.SUN_MEDIUM,
  "orbitRadius",
  MORRA_CONFIG.LIMITS.ORBIT_RADIUS.min,
  MORRA_CONFIG.LIMITS.ORBIT_RADIUS.max,
  MORRA_CONFIG.LIMITS.ORBIT_RADIUS.step
);

mediumSunFolder.add(
  MORRA_CONFIG.SUN_MEDIUM,
  "orbitSpeed",
  MORRA_CONFIG.LIMITS.ORBIT_SPEED.min,
  MORRA_CONFIG.LIMITS.ORBIT_SPEED.max,
  MORRA_CONFIG.LIMITS.ORBIT_SPEED.step
);

mediumSunFolder.add(
  MORRA_CONFIG.SUN_MEDIUM,
  "orbitHeight",
  MORRA_CONFIG.LIMITS.BODY_HEIGHT.min,
  MORRA_CONFIG.LIMITS.BODY_HEIGHT.max,
  MORRA_CONFIG.LIMITS.BODY_HEIGHT.step
);

// =====================
// SMALL SUN
// =====================

smallSunFolder.add(
  MORRA_CONFIG.SUN_SMALL,
  "radius",
  MORRA_CONFIG.LIMITS.BODY_RADIUS.min,
  MORRA_CONFIG.LIMITS.BODY_RADIUS.max,
  MORRA_CONFIG.LIMITS.BODY_RADIUS.step
);

smallSunFolder.add(
  MORRA_CONFIG.SUN_SMALL,
  "orbitRadius",
  MORRA_CONFIG.LIMITS.ORBIT_RADIUS.min,
  MORRA_CONFIG.LIMITS.ORBIT_RADIUS.max,
  MORRA_CONFIG.LIMITS.ORBIT_RADIUS.step
);

smallSunFolder.add(
  MORRA_CONFIG.SUN_SMALL,
  "orbitSpeed",
  MORRA_CONFIG.LIMITS.ORBIT_SPEED.min,
  MORRA_CONFIG.LIMITS.ORBIT_SPEED.max,
  MORRA_CONFIG.LIMITS.ORBIT_SPEED.step
);

smallSunFolder.add(
  MORRA_CONFIG.SUN_SMALL,
  "orbitHeight",
  MORRA_CONFIG.LIMITS.BODY_HEIGHT.min,
  MORRA_CONFIG.LIMITS.BODY_HEIGHT.max,
  MORRA_CONFIG.LIMITS.BODY_HEIGHT.step
);

// =====================
// NORTH MOON
// =====================

moonNorthFolder.add(
  MORRA_CONFIG.MOON_NORTH,
  "radius",
  MORRA_CONFIG.LIMITS.BODY_RADIUS.min,
  MORRA_CONFIG.LIMITS.BODY_RADIUS.max,
  MORRA_CONFIG.LIMITS.BODY_RADIUS.step
);

moonNorthFolder.add(
  MORRA_CONFIG.MOON_NORTH,
  "orbitRadius",
  MORRA_CONFIG.LIMITS.ORBIT_RADIUS.min,
  MORRA_CONFIG.LIMITS.ORBIT_RADIUS.max,
  MORRA_CONFIG.LIMITS.ORBIT_RADIUS.step
);

moonNorthFolder.add(
  MORRA_CONFIG.MOON_NORTH,
  "orbitSpeed",
  MORRA_CONFIG.LIMITS.ORBIT_SPEED.min,
  MORRA_CONFIG.LIMITS.ORBIT_SPEED.max,
  MORRA_CONFIG.LIMITS.ORBIT_SPEED.step
);

// =====================
// EQUATOR MOON
// =====================

moonEquatorFolder.add(
  MORRA_CONFIG.MOON_EQUATOR,
  "radius",
  MORRA_CONFIG.LIMITS.BODY_RADIUS.min,
  MORRA_CONFIG.LIMITS.BODY_RADIUS.max,
  MORRA_CONFIG.LIMITS.BODY_RADIUS.step
);

moonEquatorFolder.add(
  MORRA_CONFIG.MOON_EQUATOR,
  "orbitRadius",
  MORRA_CONFIG.LIMITS.ORBIT_RADIUS.min,
  MORRA_CONFIG.LIMITS.ORBIT_RADIUS.max,
  MORRA_CONFIG.LIMITS.ORBIT_RADIUS.step
);

moonEquatorFolder.add(
  MORRA_CONFIG.MOON_EQUATOR,
  "orbitSpeed",
  MORRA_CONFIG.LIMITS.ORBIT_SPEED.min,
  MORRA_CONFIG.LIMITS.ORBIT_SPEED.max,
  MORRA_CONFIG.LIMITS.ORBIT_SPEED.step
);

// =====================
// LIGHTING
// =====================

lightingFolder.add(
  MORRA_CONFIG.LIGHTS,
  "ambient",
  0,
  10,
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

// =====================
// LOOP
// =====================

function animate() {

  requestAnimationFrame(
    animate
  );

  ambientLight.intensity =
    MORRA_CONFIG.LIGHTS.ambient;

  simulation.update();

  cameraController.update();

  renderer.render(
    scene,
    camera
  );
}

animate();

// =====================
// RESIZE
// =====================

window.addEventListener(
  "resize",
  () => {

    camera.aspect =
      window.innerWidth /
      window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );
  }
);