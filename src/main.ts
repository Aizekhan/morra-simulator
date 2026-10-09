import * as THREE from "three";

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

  // Presentation lights must be synchronized after the deterministic
  // astronomy/physics step so visuals use exactly the same source positions
  // as radiation, shadows and surface fields for this frame.
  // Keep celestial point lights available for auxiliary scene objects,
  // but do not use them to shade Morra itself. Morra's surface is rendered
  // from the authoritative physical LIGHT_TOTAL field.
  renderer.syncCelestialLights([
    {
      mesh: simulation.morraSystem.sunLarge.mesh,
      color: MORRA_CONFIG.LIGHTS.LARGE.color,
      intensity: MORRA_CONFIG.LIGHTS.LARGE.intensity,
      visible: MORRA_CONFIG.SUN_LARGE.visible,
      sourceRadius: simulation.morraSystem.sunLarge.radius,
      radiationScale: MORRA_CONFIG.LIGHTS.LARGE.radiationScale,
      referenceDistance: MORRA_CONFIG.SUN_LARGE.orbitRadius
    },
    {
      mesh: simulation.morraSystem.sunMedium.mesh,
      color: MORRA_CONFIG.LIGHTS.MEDIUM.color,
      intensity: MORRA_CONFIG.LIGHTS.MEDIUM.intensity,
      visible: MORRA_CONFIG.SUN_MEDIUM.visible,
      sourceRadius: simulation.morraSystem.sunMedium.radius,
      radiationScale: MORRA_CONFIG.LIGHTS.MEDIUM.radiationScale,
      referenceDistance: MORRA_CONFIG.SUN_MEDIUM.orbitRadius
    },
    {
      mesh: simulation.morraSystem.sunSmall.mesh,
      color: MORRA_CONFIG.LIGHTS.SMALL.color,
      intensity: MORRA_CONFIG.LIGHTS.SMALL.intensity,
      visible: MORRA_CONFIG.SUN_SMALL.visible,
      sourceRadius: simulation.morraSystem.sunSmall.radius,
      radiationScale: MORRA_CONFIG.LIGHTS.SMALL.radiationScale,
      referenceDistance: MORRA_CONFIG.SUN_SMALL.orbitRadius
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

  // Low-noise diagnostics for the current render/field health.
  // Helps distinguish a missing body from a missing texture or uninitialized field.
  const diagnostics = (
    window as unknown as {
      __MORRA_DIAGNOSTICS__?: {
        at: number;
        texture: {
          loaded: boolean;
          path: string;
          failed: boolean;
        };
        field: {
          exists: boolean;
          time: number | null;
          samples: number;
          min: number | null;
          max: number | null;
          finite: number;
        };
        planet: {
          visible: boolean;
          material: string;
          radius: number;
          cameraDistance: number;
          renderOrder: number;
          frustumCulled: boolean;
          worldPosition: { x: number; y: number; z: number };
          scale: { x: number; y: number; z: number };
          textureAssigned: boolean;
        };
        renderer: {
          webglAvailable: boolean;
          pixelRatio: number;
          viewportWidth: number;
          viewportHeight: number;
        };
      };
    }
  );

  const map =
    simulation.morraSystem.surfaceFieldEngine.getMap();

  const lightValues =
    map?.light;

  let finiteSamples = 0;
  let minLight = Number.POSITIVE_INFINITY;
  let maxLight = Number.NEGATIVE_INFINITY;

  if(lightValues) {
    for(const value of lightValues) {
      if(Number.isFinite(value)) {
        finiteSamples += 1;
        minLight = Math.min(minLight, value);
        maxLight = Math.max(maxLight, value);
      }
    }
  }

  diagnostics.__MORRA_DIAGNOSTICS__ = {
    at: frame.time.totalHours,
    texture:
      simulation.morraSystem.getSurfaceTextureStatus(),
    field: {
      exists: map !== null,
      time: map?.absoluteHours ?? null,
      samples: lightValues?.length ?? 0,
      min: finiteSamples > 0 ? minLight : null,
      max: finiteSamples > 0 ? maxLight : null,
      finite: finiteSamples
    },
    planet: {
      visible: simulation.morraSystem.morra.mesh.visible,
      material: simulation.morraSystem.morra.material.type,
      radius: simulation.morraSystem.morra.radius,
      cameraDistance: renderer.camera.position.distanceTo(
        simulation.morraSystem.morra.mesh.getWorldPosition(
          new THREE.Vector3()
        )
      ),
      renderOrder: simulation.morraSystem.morra.mesh.renderOrder,
      frustumCulled: simulation.morraSystem.morra.mesh.frustumCulled,
      worldPosition: (() => {
        const position = simulation.morraSystem.morra.mesh.getWorldPosition(
          new THREE.Vector3()
        );
        return { x: position.x, y: position.y, z: position.z };
      })(),
      scale: {
        x: simulation.morraSystem.morra.mesh.scale.x,
        y: simulation.morraSystem.morra.mesh.scale.y,
        z: simulation.morraSystem.morra.mesh.scale.z
      },
      textureAssigned:
        simulation.morraSystem.morra.material.map !== null
    },
    renderer: {
      webglAvailable: renderer.renderer.getContext() !== null,
      pixelRatio: renderer.renderer.getPixelRatio(),
      viewportWidth: renderer.renderer.domElement.width,
      viewportHeight: renderer.renderer.domElement.height
    }
  };
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
