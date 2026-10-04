import "./style.css";

import { Simulation } from "./core/Simulation";

import { CameraController }
from "./render/CameraController";

import { DebugPanel }
from "./render/DebugPanel";

import { Renderer }
from "./render/Renderer";

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

function animate() {

  requestAnimationFrame(
    animate
  );

  renderer.update();

  simulation.update();

  cameraController.update();

  renderer.render();
}

animate();

window.addEventListener(
  "beforeunload",
  () => {

    debugPanel.destroy();
    renderer.dispose();
  }
);
