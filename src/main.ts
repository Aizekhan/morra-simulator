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

cameraController.setMorraRadius(
  simulation.morraSystem.morra.radius
);

cameraController.setSystemExtent(
  Math.max(
    simulation.morraSystem.sunLarge.orbitRadius +
      simulation.morraSystem.sunLarge.radius,
    simulation.morraSystem.sunMedium.orbitRadius +
      simulation.morraSystem.sunMedium.radius,
    simulation.morraSystem.sunSmall.orbitRadius +
      simulation.morraSystem.sunSmall.radius,
    simulation.morraSystem.moonNorth.orbitRadius +
      simulation.morraSystem.moonNorth.radius,
    simulation.morraSystem.moonEquator.orbitRadius +
      simulation.morraSystem.moonEquator.radius
  )
);

const debugPanel =
  new DebugPanel(
    simulation.timeControls,
    cameraController,
    {
      sunLarge:
        simulation.morraSystem.sunLarge,
      sunMedium:
        simulation.morraSystem.sunMedium,
      sunSmall:
        simulation.morraSystem.sunSmall,
      moonNorth:
        simulation.morraSystem.moonNorth,
      moonEquator:
        simulation.morraSystem.moonEquator
    }
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
    simulation.morraSystem.celestialInteractionSystem
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

  renderer.update(
    MORRA_CONFIG.LIGHTS.ambient
  );

  const frame =
    simulation.update();

  // Build the authoritative physical surface field even when the diagnostic
  // overlay is hidden. Rendering must never fall back to an unrelated light
  // calculation just because debug visualization is disabled.
  simulation.morraSystem.surfaceFieldEngine.getOrCreateMap(
    frame.time.totalHours
  );

  // Presentation lights must be synchronized after the deterministic
  // astronomy/physics step so visuals use exactly the same source positions
  // as radiation, shadows and surface fields for this frame.
  renderer.syncCelestialLights([
    {
      mesh:
        simulation.morraSystem.sunLarge.mesh,
      color:
        MORRA_CONFIG.LIGHTS.LARGE.color,
      intensity:
        MORRA_CONFIG.LIGHTS.LARGE.intensity,
      visible:
        simulation.morraSystem.sunLarge.mesh.visible,
      sourceRadius:
        simulation.morraSystem.sunLarge.radius,
      referenceDistance:
        simulation.morraSystem.sunLarge.orbitRadius,
      radiationScale:
        MORRA_CONFIG.LIGHTS.LARGE.radiationScale,
      presentationScale:
        MORRA_CONFIG.LIGHTS.LARGE.presentationScale
    },
    {
      mesh:
        simulation.morraSystem.sunMedium.mesh,
      color:
        MORRA_CONFIG.LIGHTS.MEDIUM.color,
      intensity:
        MORRA_CONFIG.LIGHTS.MEDIUM.intensity,
      visible:
        simulation.morraSystem.sunMedium.mesh.visible,
      sourceRadius:
        simulation.morraSystem.sunMedium.radius,
      referenceDistance:
        simulation.morraSystem.sunMedium.orbitRadius,
      radiationScale:
        MORRA_CONFIG.LIGHTS.MEDIUM.radiationScale,
      presentationScale:
        MORRA_CONFIG.LIGHTS.MEDIUM.presentationScale
    },
    {
      mesh:
        simulation.morraSystem.sunSmall.mesh,
      color:
        MORRA_CONFIG.LIGHTS.SMALL.color,
      intensity:
        MORRA_CONFIG.LIGHTS.SMALL.intensity,
      visible:
        simulation.morraSystem.sunSmall.mesh.visible,
      sourceRadius:
        simulation.morraSystem.sunSmall.radius,
      referenceDistance:
        simulation.morraSystem.sunSmall.orbitRadius,
      radiationScale:
        MORRA_CONFIG.LIGHTS.SMALL.radiationScale,
      presentationScale:
        MORRA_CONFIG.LIGHTS.SMALL.presentationScale
    }
  ]);

  cameraController.setMorraRadius(
    simulation.morraSystem.morra.radius
  );

  cameraController.setSystemExtent(
    Math.max(
      simulation.morraSystem.sunLarge.orbitRadius +
        simulation.morraSystem.sunLarge.radius,
      simulation.morraSystem.sunMedium.orbitRadius +
        simulation.morraSystem.sunMedium.radius,
      simulation.morraSystem.sunSmall.orbitRadius +
        simulation.morraSystem.sunSmall.radius,
      simulation.morraSystem.moonNorth.orbitRadius +
        simulation.morraSystem.moonNorth.radius,
      simulation.morraSystem.moonEquator.orbitRadius +
        simulation.morraSystem.moonEquator.radius
    )
  );

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

  simulation.morraSystem.updatePresentation(
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
