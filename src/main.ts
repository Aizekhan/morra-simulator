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
    }
  );

function animate() {

  requestAnimationFrame(
    animate
  );

  renderer.update();

  const frame =
    simulation.update();

  timeHud.update(
    frame.time,
    frame.astronomy
  );

  timeline.update(
    frame.time
  );

  debugPanel.update();

  cameraController.update();

  renderer.render();
}

animate();

window.addEventListener(
  "beforeunload",
  () => {

    worldInteraction.dispose();

    eventPanel.dispose();

    timeline.dispose();

    timeHud.dispose();

    debugPanel.destroy();

    simulation.dispose();

    renderer.dispose();
  }
);
