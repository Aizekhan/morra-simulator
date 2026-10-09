import * as THREE from "three";

import { CelestialBody } from "../astronomy/CelestialBody";
import { CelestialSystem } from "../astronomy/CelestialSystem";
import { OrbitSystem } from "../astronomy/OrbitSystem";

import { MORRA_CONFIG } from "./MorraConfig";
import { MorraAxis } from "./MorraAxis";
import { MorraConfigSynchronizer } from "./MorraConfigSynchronizer";

import {
  MorraEnvironmentEngine
} from "../physics/MorraEnvironmentEngine";

import {
  CelestialInteractionSystem
} from "../physics/CelestialInteractionSystem";

import {
  SurfaceFieldEngine
} from "../physics/SurfaceFieldEngine";

import {
  SurfaceFieldVisualizer
} from "../render/SurfaceFieldVisualizer";

import {
  ShadowVolumeVisualizer
} from "../render/ShadowVolumeVisualizer";


import {
  CelestialPresentationSystem
} from "../render/CelestialPresentationSystem";

import {
  RadiationConeVisualizer
} from "../render/RadiationConeVisualizer";

import {
  EclipseShadowVisualizer
} from "../render/EclipseShadowVisualizer";

import {
  RadiationRayVisualizer
} from "../render/RadiationRayVisualizer";

import {
  MORRA_CONTINENTS,
  latitudeLongitudeToDirection
} from "./MorraContinents";

export class MorraSystem {

  scene: THREE.Scene;

  morra: CelestialBody;

  axis: MorraAxis;

  moonNorth: CelestialBody;
  moonEquator: CelestialBody;

  sunLarge: CelestialBody;
  sunMedium: CelestialBody;
  sunSmall: CelestialBody;

  celestialSystem: CelestialSystem;
  orbitSystem: OrbitSystem;

  configSynchronizer:
    MorraConfigSynchronizer;

  celestialInteractionSystem:
    CelestialInteractionSystem;

  environmentEngine:
    MorraEnvironmentEngine;

  surfaceFieldEngine:
    SurfaceFieldEngine;

  surfaceFieldVisualizer:
    SurfaceFieldVisualizer;

  shadowVolumeVisualizer:
    ShadowVolumeVisualizer;

  celestialPresentation:
    CelestialPresentationSystem;

  radiationConeVisualizer:
    RadiationConeVisualizer;

  eclipseShadowVisualizer:
    EclipseShadowVisualizer;

  radiationRayVisualizer:
    RadiationRayVisualizer;

  private worldTexture:
    THREE.Texture | null = null;

  private worldTexturePath =
    "";

  private worldTextureLoadError:
    unknown = null;

  private worldTextureRequestedPath =
    "";

  getSurfaceTextureStatus() {
    return {
      enabled: MORRA_CONFIG.MORRA_SURFACE_TEXTURE_ENABLED,
      loaded: this.worldTexture !== null,
      path: this.worldTexturePath,
      requestedPath: this.worldTextureRequestedPath,
      failed: this.worldTextureLoadError !== null,
      error: this.worldTextureLoadError instanceof Error
        ? this.worldTextureLoadError.message
        : this.worldTextureLoadError === null
          ? null
          : String(this.worldTextureLoadError),
      assignedToMaterial:
        this.morra.material.map === this.worldTexture &&
        this.worldTexture !== null,
      materialMapPresent:
        this.morra.material.map !== null
    };
  }

  /**
   * Keep Morra's visual axis helpers in the same transform space as
   * the planet surface. The helpers are authored in Morra-local
   * coordinates and follow the planet's full orientation in world space.
   */
  private updateAxisHelpers() {
    this.axis.axisLine.position.copy(
      this.morra.mesh.position
    );
    this.axis.axisLine.quaternion.copy(
      this.morra.mesh.quaternion
    );

    this.axis.northPole.position.set(
      0,
      this.morra.radius,
      0
    );
    this.axis.northPole.position.applyQuaternion(
      this.morra.mesh.quaternion
    );
    this.axis.northPole.position.add(
      this.morra.mesh.position
    );

    this.axis.southPole.position.set(
      0,
      -this.morra.radius,
      0
    );
    this.axis.southPole.position.applyQuaternion(
      this.morra.mesh.quaternion
    );
    this.axis.southPole.position.add(
      this.morra.mesh.position
    );

    this.axis.equator.position.copy(
      this.morra.mesh.position
    );
    this.axis.equator.quaternion.copy(
      this.morra.mesh.quaternion
    );
  }

  continents:
    THREE.Group;


  constructor(
    scene: THREE.Scene
  ) {

    this.scene =
      scene;

    this.morra =
      new CelestialBody(
        MORRA_CONFIG.MORRA_RADIUS,
        MORRA_CONFIG.MORRA_COLOR
      );

    scene.add(
      this.morra.mesh
    );

    // Morra is the actual world surface, not a distant-object marker.
    // Keep it on the real physically lit mesh at every camera distance.
    this.morra.mesh.userData.disablePresentationProxy = true;
    this.morra.mesh.userData.celestialBody =
      this.morra;
    this.morra.mesh.frustumCulled = false;
    this.morra.mesh.visible = true;


    this.axis =
      new MorraAxis(
        scene,
        MORRA_CONFIG.MORRA_RADIUS,
        MORRA_CONFIG.AXIS_TILT
      );

    this.moonNorth =
      new CelestialBody(
        MORRA_CONFIG.MOON_NORTH.radius,
        MORRA_CONFIG.MOON_NORTH.color,
        MORRA_CONFIG.MOON_NORTH.orbitRadius,
        MORRA_CONFIG.MOON_NORTH.orbitSpeed,
        MORRA_CONFIG.MOON_NORTH.orbitPlane,
        0,
        0,
        0,
        {
          orbitInclination:
            MORRA_CONFIG.MOON_NORTH.orbitInclination,
          orbitAscendingNode:
            MORRA_CONFIG.MOON_NORTH.orbitAscendingNode,
          orbitEccentricity:
            MORRA_CONFIG.MOON_NORTH.orbitEccentricity,
          orbitPlaneOffset:
            MORRA_CONFIG.MOON_NORTH.orbitPlaneOffset,
          reverseOrbit:
            MORRA_CONFIG.MOON_NORTH.reverseOrbit,
          emissiveIntensity:
            0.25
        }
      );

    scene.add(
      this.moonNorth.mesh
    );

    this.moonNorth.mesh.userData.celestialBody =
      this.moonNorth;

    this.moonEquator =
      new CelestialBody(
        MORRA_CONFIG.MOON_EQUATOR.radius,
        MORRA_CONFIG.MOON_EQUATOR.color,
        MORRA_CONFIG.MOON_EQUATOR.orbitRadius,
        MORRA_CONFIG.MOON_EQUATOR.orbitSpeed,
        MORRA_CONFIG.MOON_EQUATOR.orbitPlane,
        0,
        0,
        0,
        {
          orbitInclination:
            MORRA_CONFIG.MOON_EQUATOR.orbitInclination,
          orbitAscendingNode:
            MORRA_CONFIG.MOON_EQUATOR.orbitAscendingNode,
          orbitEccentricity:
            MORRA_CONFIG.MOON_EQUATOR.orbitEccentricity,
          orbitPlaneOffset:
            MORRA_CONFIG.MOON_EQUATOR.orbitPlaneOffset,
          reverseOrbit:
            MORRA_CONFIG.MOON_EQUATOR.reverseOrbit,
          emissiveIntensity:
            0.08
        }
      );

    scene.add(
      this.moonEquator.mesh
    );

    this.moonEquator.mesh.userData.celestialBody =
      this.moonEquator;

    this.sunLarge =
      new CelestialBody(
        MORRA_CONFIG.SUN_LARGE.radius,
        MORRA_CONFIG.LIGHTS.LARGE.color,
        MORRA_CONFIG.SUN_LARGE.orbitRadius,
        MORRA_CONFIG.SUN_LARGE.orbitSpeed,
        MORRA_CONFIG.SUN_LARGE.orbitPlane,
        0,
        0,
        0,
        {
          orbitInclination:
            MORRA_CONFIG.SUN_LARGE.orbitInclination,
          orbitAscendingNode:
            MORRA_CONFIG.SUN_LARGE.orbitAscendingNode,
          orbitEccentricity:
            MORRA_CONFIG.SUN_LARGE.orbitEccentricity,
          orbitPlaneOffset:
            MORRA_CONFIG.SUN_LARGE.orbitPlaneOffset,
          reverseOrbit:
            MORRA_CONFIG.SUN_LARGE.reverseOrbit,
          emissiveIntensity:
            1.2,
          renderMode:
            "SELF_LUMINOUS"
        }
      );

    scene.add(
      this.sunLarge.mesh
    );

    this.sunLarge.mesh.userData.celestialBody =
      this.sunLarge;

    this.sunMedium =
      new CelestialBody(
        MORRA_CONFIG.SUN_MEDIUM.radius,
        MORRA_CONFIG.LIGHTS.MEDIUM.color,
        MORRA_CONFIG.SUN_MEDIUM.orbitRadius,
        MORRA_CONFIG.SUN_MEDIUM.orbitSpeed,
        MORRA_CONFIG.SUN_MEDIUM.orbitPlane,
        0,
        0,
        0,
        {
          orbitInclination:
            MORRA_CONFIG.SUN_MEDIUM.orbitInclination,
          orbitAscendingNode:
            MORRA_CONFIG.SUN_MEDIUM.orbitAscendingNode,
          orbitEccentricity:
            MORRA_CONFIG.SUN_MEDIUM.orbitEccentricity,
          orbitPlaneOffset:
            MORRA_CONFIG.SUN_MEDIUM.orbitPlaneOffset,
          reverseOrbit:
            MORRA_CONFIG.SUN_MEDIUM.reverseOrbit,
          emissiveIntensity:
            1.2,
          renderMode:
            "SELF_LUMINOUS"
        }
      );

    scene.add(
      this.sunMedium.mesh
    );

    this.sunMedium.mesh.userData.celestialBody =
      this.sunMedium;

    this.sunSmall =
      new CelestialBody(
        MORRA_CONFIG.SUN_SMALL.radius,
        MORRA_CONFIG.LIGHTS.SMALL.color,
        MORRA_CONFIG.SUN_SMALL.orbitRadius,
        MORRA_CONFIG.SUN_SMALL.orbitSpeed,
        MORRA_CONFIG.SUN_SMALL.orbitPlane,
        0,
        0,
        0,
        {
          orbitInclination:
            MORRA_CONFIG.SUN_SMALL.orbitInclination,
          orbitAscendingNode:
            MORRA_CONFIG.SUN_SMALL.orbitAscendingNode,
          orbitEccentricity:
            MORRA_CONFIG.SUN_SMALL.orbitEccentricity,
          orbitPlaneOffset:
            MORRA_CONFIG.SUN_SMALL.orbitPlaneOffset,
          reverseOrbit:
            MORRA_CONFIG.SUN_SMALL.reverseOrbit,
          emissiveIntensity:
            1.2,
          renderMode:
            "SELF_LUMINOUS"
        }
      );

    scene.add(
      this.sunSmall.mesh
    );

    this.sunSmall.mesh.userData.celestialBody =
      this.sunSmall;

    this.celestialSystem =
      new CelestialSystem();

    this.celestialSystem.add(
      this.moonNorth
    );

    this.celestialSystem.add(
      this.moonEquator
    );

    this.celestialSystem.add(
      this.sunLarge
    );

    this.celestialSystem.add(
      this.sunMedium
    );

    this.celestialSystem.add(
      this.sunSmall
    );

    this.orbitSystem =
      new OrbitSystem(
        scene
      );

    this.orbitSystem.add(
      this.sunLarge,
      () =>
        MORRA_CONFIG.LIGHTS.LARGE.color
    );

    this.orbitSystem.add(
      this.sunMedium,
      () =>
        MORRA_CONFIG.LIGHTS.MEDIUM.color
    );

    this.orbitSystem.add(
      this.sunSmall,
      () =>
        MORRA_CONFIG.LIGHTS.SMALL.color
    );

    this.orbitSystem.add(
      this.moonNorth,
      () =>
        MORRA_CONFIG.MOON_NORTH.orbitColor
    );

    this.orbitSystem.add(
      this.moonEquator,
      () =>
        MORRA_CONFIG.MOON_EQUATOR.orbitColor
    );

    this.configSynchronizer =
      new MorraConfigSynchronizer({
        morra: this.morra,
        moonNorth: this.moonNorth,
        moonEquator: this.moonEquator,
        sunLarge: this.sunLarge,
        sunMedium: this.sunMedium,
        sunSmall: this.sunSmall
      });

    this.celestialInteractionSystem =
      new CelestialInteractionSystem(
        scene,
        this.morra,
        [
          {
            id:
              "large-sun",
            body:
              this.sunLarge,
            color:
              MORRA_CONFIG.LIGHTS.LARGE.color,
            intensity:
              MORRA_CONFIG.LIGHTS.LARGE.intensity,
            distance:
              MORRA_CONFIG.LIGHTS.LARGE.distance,
            lightPower:
              MORRA_CONFIG.RADIATION_PROFILES[
                MORRA_CONFIG.SUN_LARGE.radiationRole
              ].lightPower *
              MORRA_CONFIG.LIGHTS.LARGE.radiationScale,
            heatPower:
              MORRA_CONFIG.RADIATION_PROFILES[
                MORRA_CONFIG.SUN_LARGE.radiationRole
              ].heatPower *
              MORRA_CONFIG.LIGHTS.LARGE.radiationScale,
            magicPower:
              MORRA_CONFIG.RADIATION_PROFILES[
                MORRA_CONFIG.SUN_LARGE.radiationRole
              ].magicPower *
              MORRA_CONFIG.LIGHTS.LARGE.radiationScale,
            emissionReferenceRadius:
              MORRA_CONFIG.SUN_LARGE.radius,
            visible:
              () =>
                MORRA_CONFIG.SUN_LARGE.visible
          },
          {
            id:
              "medium-sun",
            body:
              this.sunMedium,
            color:
              MORRA_CONFIG.LIGHTS.MEDIUM.color,
            intensity:
              MORRA_CONFIG.LIGHTS.MEDIUM.intensity,
            distance:
              MORRA_CONFIG.LIGHTS.MEDIUM.distance,
            lightPower:
              MORRA_CONFIG.RADIATION_PROFILES[
                MORRA_CONFIG.SUN_MEDIUM.radiationRole
              ].lightPower *
              MORRA_CONFIG.LIGHTS.MEDIUM.radiationScale,
            heatPower:
              MORRA_CONFIG.RADIATION_PROFILES[
                MORRA_CONFIG.SUN_MEDIUM.radiationRole
              ].heatPower *
              MORRA_CONFIG.LIGHTS.MEDIUM.radiationScale,
            magicPower:
              MORRA_CONFIG.RADIATION_PROFILES[
                MORRA_CONFIG.SUN_MEDIUM.radiationRole
              ].magicPower *
              MORRA_CONFIG.LIGHTS.MEDIUM.radiationScale,
            emissionReferenceRadius:
              MORRA_CONFIG.SUN_MEDIUM.radius,
            visible:
              () =>
                MORRA_CONFIG.SUN_MEDIUM.visible
          },
          {
            id:
              "small-sun",
            body:
              this.sunSmall,
            color:
              MORRA_CONFIG.LIGHTS.SMALL.color,
            intensity:
              MORRA_CONFIG.LIGHTS.SMALL.intensity,
            distance:
              MORRA_CONFIG.LIGHTS.SMALL.distance,
            lightPower:
              MORRA_CONFIG.RADIATION_PROFILES[
                MORRA_CONFIG.SUN_SMALL.radiationRole
              ].lightPower *
              MORRA_CONFIG.LIGHTS.SMALL.radiationScale,
            heatPower:
              MORRA_CONFIG.RADIATION_PROFILES[
                MORRA_CONFIG.SUN_SMALL.radiationRole
              ].heatPower *
              MORRA_CONFIG.LIGHTS.SMALL.radiationScale,
            magicPower:
              MORRA_CONFIG.RADIATION_PROFILES[
                MORRA_CONFIG.SUN_SMALL.radiationRole
              ].magicPower *
              MORRA_CONFIG.LIGHTS.SMALL.radiationScale,
            emissionReferenceRadius:
              MORRA_CONFIG.SUN_SMALL.radius,
            visible:
              () =>
                MORRA_CONFIG.SUN_SMALL.visible
          }
        ],
        [
          this.moonNorth,
          this.moonEquator
        ],
        [
          this.sunLarge,
          this.sunMedium,
          this.sunSmall,
          this.moonNorth,
          this.moonEquator
        ]
      );

    this.environmentEngine =
      this.celestialInteractionSystem.environment;

    this.surfaceFieldEngine =
      new SurfaceFieldEngine(
        this.environmentEngine,
        {
          latitudeSegments:
            MORRA_CONFIG.SURFACE_FIELD.latitudeSegments,
          longitudeSegments:
            MORRA_CONFIG.SURFACE_FIELD.longitudeSegments,
          updateIntervalHours:
            MORRA_CONFIG.SURFACE_FIELD.updateIntervalHours,
          updateIntervalMilliseconds:
            100,
          surfaceMaterial:
            MORRA_CONFIG.SURFACE_MATERIAL
        }
      );

    this.sunLarge.mesh.userData.radiationId =
      "Large Sun";

    this.sunMedium.mesh.userData.radiationId =
      "Medium Sun";

    this.sunSmall.mesh.userData.radiationId =
      "Small Sun";

    this.moonNorth.mesh.userData.radiationId =
      "North Moon";

    this.moonEquator.mesh.userData.radiationId =
      "Equator Moon";

    this.surfaceFieldVisualizer =
      new SurfaceFieldVisualizer(
        this.morra.mesh,
        MORRA_CONFIG.SURFACE_FIELD.longitudeSegments,
        MORRA_CONFIG.SURFACE_FIELD.latitudeSegments
      );

    // The surface-field shader blends diagnostics over the actual world map,
    // so enabling a field never destroys geographic readability.

    this.morra.mesh.userData.presentationMinimumPixels =
      28;

    // Keep the authoritative world mesh visible. The presentation system may
    // add a readability proxy for distant bodies, but it must never replace
    // or hide Morra itself.
    this.morra.mesh.visible =
      MORRA_CONFIG.MORRA_VISIBLE;
    this.morra.mesh.frustumCulled = false;

    this.moonNorth.mesh.userData.presentationMinimumPixels =
      12;

    this.moonEquator.mesh.userData.presentationMinimumPixels =
      14;

    this.sunLarge.mesh.userData.presentationMinimumPixels =
      12;

    this.sunMedium.mesh.userData.presentationMinimumPixels =
      12;

    this.sunSmall.mesh.userData.presentationMinimumPixels =
      12;

    this.radiationConeVisualizer =
      new RadiationConeVisualizer(
        scene,
        this.morra,
        [
          {
            id:
              "large-sun",
            kind:
              "MAGIC",
            color:
              0xb070ff
          },
          {
            id:
              "medium-sun",
            kind:
              "LIGHT",
            color:
              0xffc66d
          },
          {
            id:
              "small-sun",
            kind:
              "HEAT",
            color:
              0xff5d3d
          }
        ]
      );

    this.radiationConeVisualizer.setConfig({
      enabled:
        MORRA_CONFIG.RADIATION_CONES.enabled,
      length:
        MORRA_CONFIG.RADIATION_CONES.length,
      radialScale:
        MORRA_CONFIG.RADIATION_CONES.radialScale,
      rangeScale:
        MORRA_CONFIG.RADIATION_CONES.rangeScale,
      opacity:
        MORRA_CONFIG.RADIATION_CONES.opacity,
      edgeOpacity:
        MORRA_CONFIG.RADIATION_CONES.edgeOpacity
    });

    this.radiationRayVisualizer =
      new RadiationRayVisualizer(
        scene,
        this.environmentEngine
      );

    this.eclipseShadowVisualizer =
      new EclipseShadowVisualizer(
        scene,
        this.morra,
        {
          enabled:
            true,
          opacity:
            0.32,
          softness:
            0.18
        }
      );

    this.continents =
      new THREE.Group();

    this.continents.name =
      "Morra Continents";

    for(
      const continent
      of MORRA_CONTINENTS
    ) {

      const direction =
        latitudeLongitudeToDirection(
          continent.latitude,
          continent.longitude
        );

      const center =
        direction
          .clone()
          .multiplyScalar(
            this.morra.radius + 0.7
          );

      const geometry =
        new THREE.CircleGeometry(
          1,
          32
        );

      const material =
        new THREE.MeshBasicMaterial({
          color:
            continent.color,
          side:
            THREE.DoubleSide
        });

      const mesh =
        new THREE.Mesh(
          geometry,
          material
        );

      mesh.name =
        continent.name;

      mesh.scale.set(
        continent.width *
          0.5,
        continent.height *
          0.5,
        1
      );

      mesh.position.copy(
        center
      );

      const up =
        direction.clone();

      mesh.setRotationFromQuaternion(
        new THREE.Quaternion()
          .setFromUnitVectors(
            new THREE.Vector3(
              0,
              0,
              1
            ),
            up
          )
      );

      mesh.rotateZ(
        THREE.MathUtils.degToRad(
          continent.rotation
        )
      );

      mesh.userData.morraContinentId =
        continent.id;

      mesh.userData.morraContinentName =
        continent.name;

      this.continents.add(
        mesh
      );
    }

    this.morra.mesh.add(
      this.continents
    );

    this.surfaceFieldVisualizer.setRadius(
      this.morra.radius
    );

    this.celestialPresentation =
      new CelestialPresentationSystem(
        scene,
        [
          this.morra,
          this.moonNorth,
          this.moonEquator,
          this.sunLarge,
          this.sunMedium,
          this.sunSmall
        ],
        20
      );

    this.shadowVolumeVisualizer =
      new ShadowVolumeVisualizer(
        scene,
        this.environmentEngine,
        {
          enabled:
            MORRA_CONFIG.SHADOW_VOLUMES.enabled,
          length:
            MORRA_CONFIG.SHADOW_VOLUMES.length,
          opacity:
            MORRA_CONFIG.SHADOW_VOLUMES.opacity,
          showUmbra:
            MORRA_CONFIG.SHADOW_VOLUMES.showUmbra,
          showPenumbra:
            MORRA_CONFIG.SHADOW_VOLUMES.showPenumbra
        }
      );
  }

  update(
    absoluteHours: number
  ) {

    this.configSynchronizer.sync();

    this.applyWorldTexture();

    const axisTilt =
      THREE.MathUtils.degToRad(
        MORRA_CONFIG.AXIS_TILT
      );

    // The tilt belongs to the spin axis; the daily rotation must occur
    // around that tilted axis, not around the global Y axis.
    const spinAngle =
      MORRA_CONFIG.ROTATION_SPEED *
      absoluteHours;

    const tiltQuaternion =
      new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 0, 1),
        axisTilt
      );

    // Morra's local Y axis is the spin axis. Tilt that local axis first,
    // then apply the elapsed daily angle in Morra-local space.
    const spinQuaternion =
      new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        spinAngle
      );

    this.morra.mesh.quaternion.copy(
      tiltQuaternion
    );
    this.morra.mesh.quaternion.multiply(
      spinQuaternion
    );

    this.axis.update(
      this.morra.radius,
      0
    );

    this.updateAxisHelpers();

    // One deterministic simulation step:
    // 1) move every celestial body first;
    // 2) only then evaluate radiation, shadows and debug geometry.
    this.celestialSystem.update(absoluteHours);
    this.orbitSystem.update();

    this.axis.axisLine.visible = MORRA_CONFIG.DEBUG.showAxis;
    this.axis.northPole.visible = MORRA_CONFIG.DEBUG.showAxis;
    this.axis.southPole.visible = MORRA_CONFIG.DEBUG.showAxis;
    this.axis.equator.visible = MORRA_CONFIG.DEBUG.showEquator;
    this.orbitSystem.setVisible(MORRA_CONFIG.DEBUG.showOrbits);

    this.celestialInteractionSystem.update();

    // Keep the physical surface field as the authoritative visual source.
    // Presentation point lights are disabled for the planet so they cannot
    // globally wash the Morra surface.
    this.surfaceFieldEngine.setConfig({
      surfaceMaterial:
        MORRA_CONFIG.SURFACE_MATERIAL,
      latitudeSegments:
        MORRA_CONFIG.SURFACE_FIELD.latitudeSegments,
      longitudeSegments:
        MORRA_CONFIG.SURFACE_FIELD.longitudeSegments,
      updateIntervalHours:
        MORRA_CONFIG.SURFACE_FIELD.updateIntervalHours,
      // SurfaceField is the authoritative physical input for Morra's surface material.
      updateIntervalMilliseconds:
        MORRA_CONFIG.SURFACE_FIELD.updateIntervalHours > 0
          ? 250
          : 100
    });

    // The physical field is required for the surface presentation even when
    // the diagnostic overlay is hidden. Reuse the same cached map instead of
    // running a second radiation calculation.
    const fieldMap =
      this.surfaceFieldEngine.getOrCreateMap(
        absoluteHours
      );

    this.surfaceFieldVisualizer.setRadius(
      this.morra.radius
    );

    this.surfaceFieldVisualizer.setChannel(
      MORRA_CONFIG.SURFACE_FIELD.channel
    );

    this.surfaceFieldVisualizer.setOpacity(
      MORRA_CONFIG.SURFACE_FIELD.opacity
    );

    // The physical LIGHT_TOTAL layer is part of Morra's final surface
    // appearance. DEBUG.showSurfaceField controls only diagnostic UI,
    // not whether physical illumination is rendered.
    this.surfaceFieldVisualizer.setEnabled(
      true
    );

    if(fieldMap) {
      this.surfaceFieldVisualizer.update(fieldMap);
    }

    // Radiation geometry is debug-only and is rebuilt from the already-updated
    // celestial positions, so it cannot oscillate between stale/current states.
    this.radiationConeVisualizer.setConfig({
      enabled: MORRA_CONFIG.RADIATION_CONES.enabled,
      length: MORRA_CONFIG.RADIATION_CONES.length,
      radialScale: MORRA_CONFIG.RADIATION_CONES.radialScale,
      rangeScale: MORRA_CONFIG.RADIATION_CONES.rangeScale,
      opacity: MORRA_CONFIG.RADIATION_CONES.opacity,
      edgeOpacity: MORRA_CONFIG.RADIATION_CONES.edgeOpacity
    });

    this.radiationConeVisualizer.update([
      this.sunLarge,
      this.sunMedium,
      this.sunSmall
    ]);

    this.radiationRayVisualizer.setEnabled(
      MORRA_CONFIG.DEBUG.showLightHelpers
    );

    // Debug radiation rays use the actual geometric center of Morra.
    // The cyan center marker is intentionally independent from the axis helpers.

    this.radiationRayVisualizer.update();

    this.eclipseShadowVisualizer.setConfig({
      enabled:
        MORRA_CONFIG.DEBUG.showEclipseShadows
    });

    this.eclipseShadowVisualizer.update(
      this.celestialInteractionSystem.radiation.getSources().map(
        source => source.body
      ),
      this.environmentEngine.getOccluders()
    );

    this.shadowVolumeVisualizer.setConfig({
      enabled: MORRA_CONFIG.SHADOW_VOLUMES.enabled,
      length: MORRA_CONFIG.SHADOW_VOLUMES.length,
      opacity: MORRA_CONFIG.SHADOW_VOLUMES.opacity,
      showUmbra: MORRA_CONFIG.SHADOW_VOLUMES.showUmbra,
      showPenumbra: MORRA_CONFIG.SHADOW_VOLUMES.showPenumbra
    });

    this.shadowVolumeVisualizer.update();
  }

  private applyWorldTexture() {

    const enabled =
      MORRA_CONFIG.MORRA_SURFACE_TEXTURE_ENABLED;

    const path =
      MORRA_CONFIG.MORRA_SURFACE_TEXTURE.trim();

    if(
      !enabled ||
      path.length === 0
    ) {
      if(this.worldTexture) {
        this.worldTexture.dispose();
        this.worldTexture = null;
      }

      this.morra.setSurfaceTexture(
        null
      );

      this.worldTexturePath =
        "";

      return;
    }

    if(
      path ===
      this.worldTexturePath
    ) {
      return;
    }

    // Track the attempted path independently from the successfully loaded texture.
    // This prevents the UI from reporting a blank path after a failed request.
    this.worldTextureRequestedPath = path;
    this.worldTextureLoadError = null;

    const loader =
      new THREE.TextureLoader();

    loader.load(
      path,
      loaded => {

        loaded.colorSpace =
          THREE.SRGBColorSpace;

        loaded.needsUpdate =
          true;

        this.morra.setSurfaceTextureEquirectangular(
          loaded
        );

        if(
          this.worldTexture &&
          this.worldTexture !== loaded
        ) {
          this.worldTexture.dispose();
        }

        this.worldTexture =
          loaded;

        this.worldTexturePath =
          path;
      },
      undefined,
      error => {
        console.error(
          "[Morra] Failed to load surface texture:",
          path,
          error
        );

        this.worldTextureLoadError = error;
        this.worldTexturePath = "";
        this.morra.setSurfaceTexture(null);

      }
    );
  }

  updatePresentation(
    camera:
      THREE.PerspectiveCamera,
    viewportHeight:
      number
  ) {

    this.celestialPresentation.update(
      camera,
      viewportHeight
    );
  }

  dispose() {

    this.orbitSystem.dispose();

    this.celestialInteractionSystem.dispose();

    this.continents.clear();

    this.morra.mesh.remove(
      this.continents
    );

    this.surfaceFieldVisualizer.dispose();

    this.radiationConeVisualizer.dispose();

    this.radiationRayVisualizer.dispose();

    this.shadowVolumeVisualizer.dispose();

    this.eclipseShadowVisualizer.dispose();

    if(this.worldTexture) {
      this.worldTexture.dispose();
      this.worldTexture = null;
    }




    this.moonNorth.dispose();
    this.moonEquator.dispose();

    this.sunLarge.dispose();
    this.sunMedium.dispose();
    this.sunSmall.dispose();

    this.axis.dispose();

    this.scene.remove(
      this.morra.mesh
    );

    this.scene.remove(
      this.moonNorth.mesh
    );

    this.scene.remove(
      this.moonEquator.mesh
    );

    this.scene.remove(
      this.sunLarge.mesh
    );

    this.scene.remove(
      this.sunMedium.mesh
    );

    this.scene.remove(
      this.sunSmall.mesh
    );
  }
}
