import "./style.css";

import {
  Simulation
} from "./core/Simulation";

import {
  CameraController
} from "./render/CameraController";

import {
  DebugPanel
} from "./render/DebugPanel";

import {
  Renderer
} from "./render/Renderer";

import {
  TimeHUD
} from "./render/TimeHUD";

import {
  TimelineUI
} from "./render/TimelineUI";

import {
  WorldEventPanel
} from "./render/WorldEventPanel";

import {
  EnvironmentInspectorPanel
} from "./render/EnvironmentInspectorPanel";

import {
  SurfaceFieldHUD
} from "./render/SurfaceFieldHUD";

import {
  MORRA_CONFIG
} from "./world/MorraConfig";

import {
  DirectIlluminationVisualizer
} from "./render/DirectIlluminationVisualizer";

import {
  WorldInteractionSystem
} from "./world/WorldInteractionSystem";

const renderer =
  new Renderer();

const simulation =
  new Simulation(
    renderer.scene
  );

const cameraController =
  new CameraController(
    renderer.camera,
    renderer.renderer.domElement
  );

const debugPanel =
  new DebugPanel(
    simulation.timeControls
  );

const timeHud =
  new TimeHUD();

const timeline =
  new TimelineUI(
    simulation.timeSystem,
    simulation.worldEventSystem
  );

const eventPanel =
  new WorldEventPanel(
    simulation.timeSystem,
    simulation.worldEventSystem
  );

const environmentPanel =
  new EnvironmentInspectorPanel(
    simulation.morraSystem.environmentEngine
  );

const surfaceFieldHUD =
  new SurfaceFieldHUD();

const directIlluminationVisualizer =
  new DirectIlluminationVisualizer(
    renderer.scene,
    simulation.morraSystem.environmentEngine
  );

const worldInteraction =
  new WorldInteractionSystem(
    renderer.camera,
    renderer.renderer.domElement,
    simulation.morraSystem.morra,
    simulation.worldLocationSystem,
    selection => {
      eventPanel.setLocation(
        selection.location.id
      );

      environmentPanel.setPoint(
        selection.point
      );


    }
  );

function animate() {

  requestAnimationFrame(
    animate
  );

  renderer.update();

  const frame =
    simulation.update();

  cameraController.update();

  timeHud.update(
    frame.time,
    frame.astronomy
  );

  timeline.update(
    frame.time
  );

  environmentPanel.update(
    frame.time
  );

  surfaceFieldHUD.update(
    simulation.morraSystem.surfaceFieldEngine.getMap(),
    MORRA_CONFIG.SURFACE_FIELD.channel
  );

  directIlluminationVisualizer.setEnabled(
    MORRA_CONFIG.DEBUG.showDirectIllumination
  );

  directIlluminationVisualizer.update();

  debugPanel.update();

  simulation.morraSystem.update(
    frame.time.absoluteHours,
    renderer.camera,
    renderer.renderer.domElement.clientHeight
  );

  renderer.render();
}

animate();

window.addEventListener(
  "beforeunload",
  () => {

    worldInteraction.dispose();

    eventPanel.dispose();

    environmentPanel.dispose();

    surfaceFieldHUD.dispose();

    directIlluminationVisualizer.dispose();

    timeline.dispose();

    timeHud.dispose();

    debugPanel.destroy();

    simulation.dispose();

    renderer.dispose();
  }
);
