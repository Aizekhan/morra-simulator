import * as THREE from "three";

import {
  CelestialInteractionSystem
} from "../physics/CelestialInteractionSystem";

import {
  MORRA_CONFIG
} from "../world/MorraConfig";

const SOURCE_COLORS: Record<
  string,
  number
> = {
  "large-sun":
    0xffcc88,
  "medium-sun":
    0xffaa55,
  "small-sun":
    0xffffcc
};

interface SourceVisual {

  sourceId:
    string;

  line:
    THREE.Line;

  spot:
    THREE.Mesh;

}

interface MoonVisual {

  moonId:
    string;

  incomingLine:
    THREE.Line;

  reflectedLine:
    THREE.Line;

  spot:
    THREE.Mesh;

}

export class DirectIlluminationVisualizer {

  private readonly engine:
    CelestialInteractionSystem;

  private readonly root:
    THREE.Group;

  private readonly visuals:
    SourceVisual[] = [];

  private readonly moonVisuals:
    MoonVisual[] = [];

  private enabled =
    true;

  constructor(
    scene: THREE.Scene,
    engine: CelestialInteractionSystem
  ) {

    this.engine =
      engine;

    this.root =
      new THREE.Group();

    this.root.name =
      "DirectIllumination";

    scene.add(
      this.root
    );

    for(
      const source
      of this.engine.radiation.getSources()
    ) {

      const color =
        SOURCE_COLORS[
          source.id
        ] ??
        0xffffff;

      this.visuals.push({
        sourceId:
          source.id,

        line:
          this.createLine(
            color,
            0.28
          ),

        spot:
          this.createSpot(
            color,
            0.13
          )
      });
    }

    for(
      const moon
      of this.engine.getMoonBodies()
    ) {

      this.moonVisuals.push({
        moonId:
          String(
            moon.mesh.userData.radiationId ??
            moon.mesh.uuid
          ),

        incomingLine:
          this.createLine(
            0xd9e7ff,
            0.12
          ),

        reflectedLine:
          this.createLine(
            0xaecbff,
            0.32
          ),

        spot:
          this.createSpot(
            0xbfd8ff,
            0.16
          )
      });
    }
  }

  private createLine(
    color: number,
    opacity: number
  ) {

    const geometry =
      new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        new Float32Array(
          6
        ),
        3
      )
    );

    const line =
      new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({
          color,
          transparent:
            true,
          opacity
        })
      );

    this.root.add(
      line
    );

    return line;
  }

  private createSpot(
    color: number,
    opacity: number
  ) {

    const spot =
      new THREE.Mesh(
        new THREE.CircleGeometry(
          1,
          32
        ),
        new THREE.MeshBasicMaterial({
          color,
          transparent:
            true,
          opacity,
          depthWrite:
            false,
          side:
            THREE.DoubleSide
        })
      );

    this.root.add(
      spot
    );

    return spot;
  }

  setEnabled(
    enabled: boolean
  ) {

    this.enabled =
      enabled;

    this.root.visible =
      enabled;
  }

  update() {

    if(
      !this.enabled
    ) {
      return;
    }

    const center =
      this.engine.environment.morra.mesh
        .getWorldPosition(
          new THREE.Vector3()
        );

    const radius =
      this.engine.environment.morra.radius;

    this.updateDirectSources(
      center,
      radius
    );

    this.updateMoonReflections(
      center,
      radius
    );

    this.updatePlanetCoverage(
      center,
      radius
    );
  }

  private updateDirectSources(
    center: THREE.Vector3,
    radius: number
  ) {

    const sources =
      this.engine.radiation.getSources();

    for(
      const visual
      of this.visuals
    ) {

      const source =
        sources.find(
          item =>
            item.id ===
            visual.sourceId
        );

      if(
        !source ||
        !source.body.mesh.visible
      ) {

        visual.line.visible =
          false;

        visual.spot.visible =
          false;

        continue;
      }

      visual.line.visible =
        true;

      visual.spot.visible =
        true;

      const sourcePosition =
        source.body.mesh
          .getWorldPosition(
            new THREE.Vector3()
          );

      const direction =
        sourcePosition
          .clone()
          .sub(
            center
          );

      const distance =
        Math.max(
          direction.length(),
          0.001
        );

      direction.normalize();

      const surfacePoint =
        center
          .clone()
          .addScaledVector(
            direction,
            radius * 1.002
          );

      this.setLine(
        visual.line,
        sourcePosition,
        surfacePoint
      );

      visual.spot.position.copy(
        surfacePoint
      );

      visual.spot.quaternion.setFromUnitVectors(
        new THREE.Vector3(
          0,
          0,
          1
        ),
        direction
      );

      const apparentRadius =
        THREE.MathUtils.clamp(
          radius *
          Math.tan(
            Math.asin(
              THREE.MathUtils.clamp(
                source.body.radius /
                  distance,
                0,
                0.999999
              )
            )
          ),
          2,
          18
        );

      visual.spot.scale.setScalar(
        apparentRadius
      );
    }
  }

  private updateMoonReflections(
    center: THREE.Vector3,
    radius: number
  ) {

    if(
      !MORRA_CONFIG.MOON_REFLECTION.enabled
    ) {

      for(
        const visual
        of this.moonVisuals
      ) {

        visual.incomingLine.visible =
          false;

        visual.reflectedLine.visible =
          false;

        visual.spot.visible =
          false;
      }

      return;
    }

    const sources =
      this.engine.radiation.getSources();

    const occluders =
      this.engine.environment.getOccluders();

    const moons =
      this.engine.getMoonBodies();

    for(
      const visual
      of this.moonVisuals
    ) {

      const moon =
        moons.find(
          body =>
            String(
              body.mesh.userData.radiationId ??
              body.mesh.uuid
            ) ===
            visual.moonId
        );

      if(
        !moon ||
        !moon.mesh.visible
      ) {

        visual.incomingLine.visible =
          false;

        visual.reflectedLine.visible =
          false;

        visual.spot.visible =
          false;

        continue;
      }

      const moonPosition =
        moon.mesh.getWorldPosition(
          new THREE.Vector3()
        );

      const moonToMorra =
        center
          .clone()
          .sub(
            moonPosition
          );

      const moonMorraDistance =
        Math.max(
          moonToMorra.length(),
          0.001
        );

      const moonToMorraDirection =
        moonToMorra
          .clone()
          .normalize();

      const surfacePoint =
        center
          .clone()
          .addScaledVector(
            moonToMorraDirection.clone().negate(),
            radius * 1.002
          );

      let totalReflected =
        0;

      let strongestContribution =
        0;

      let strongestSource:
        typeof sources[number] |
        null =
        null;

      let reflectedColor =
        new THREE.Color(
          0x000000
        );

      let colorWeight =
        0;

      for(
        const source
        of sources
      ) {

        if(
          !source.body.mesh.visible
        ) {
          continue;
        }

        const sourcePosition =
          source.body.mesh
            .getWorldPosition(
              new THREE.Vector3()
            );

        const moonToSource =
          sourcePosition
            .clone()
            .sub(
              moonPosition
            );

        const sourceDistance =
          Math.max(
            moonToSource.length(),
            0.001
          );

        moonToSource.normalize();

        const visibility =
          this.engine.radiation
            .getVisibilityDetails(
              moonPosition,
              source,
              occluders
            );

        const sourceIrradiance =
          source.lightPower /
          (
            sourceDistance *
            sourceDistance
          ) *
          visibility.factor;

        const phaseAngle =
          Math.acos(
            THREE.MathUtils.clamp(
              -moonToSource.dot(
                moonToMorraDirection
              ),
              -1,
              1
            )
          );

        const phase =
          (
            Math.sin(
              phaseAngle
            ) +
            (
              Math.PI -
              phaseAngle
            ) *
            Math.cos(
              phaseAngle
            )
          ) /
          Math.PI;

        const reflected =
          sourceIrradiance *
          moon.radius *
          moon.radius *
          MORRA_CONFIG.MOON_REFLECTION.albedo *
          phase /
          (
            moonMorraDistance *
            moonMorraDistance
          ) *
          MORRA_CONFIG.MOON_REFLECTION.intensityScale;

        totalReflected +=
          reflected;

        reflectedColor.add(
          new THREE.Color(
            SOURCE_COLORS[source.id] ??
            0xffffff
          ).multiplyScalar(
            reflected
          )
        );

        colorWeight +=
          reflected;

        if(
          reflected >
          strongestContribution
        ) {

          strongestContribution =
            reflected;

          strongestSource =
            source;
        }
      }

      if(
        !strongestSource ||
        strongestContribution <= 0
      ) {

        visual.incomingLine.visible =
          false;

        visual.reflectedLine.visible =
          false;

        visual.spot.visible =
          false;

        continue;
      }

      visual.incomingLine.visible =
        true;

      visual.reflectedLine.visible =
        true;

      visual.spot.visible =
        true;

      const incomingSourcePosition =
        strongestSource.body.mesh
          .getWorldPosition(
            new THREE.Vector3()
          );

      this.setLine(
        visual.incomingLine,
        incomingSourcePosition,
        moonPosition
      );

      this.setLine(
        visual.reflectedLine,
        moonPosition,
        surfacePoint
      );

      const normalizedReflection =
        THREE.MathUtils.clamp(
          totalReflected /
          Math.max(
            MORRA_CONFIG.MOON_REFLECTION.maxIntensity,
            0.001
          ),
          0,
          1
        );

      const incomingMaterial =
        visual.incomingLine.material as
        THREE.LineBasicMaterial;

      incomingMaterial.opacity =
        0.06 +
        strongestContribution /
        Math.max(
          MORRA_CONFIG.MOON_REFLECTION.maxIntensity,
          0.001
        ) *
        0.18;

      const reflectedMaterial =
        visual.reflectedLine.material as
        THREE.LineBasicMaterial;

      reflectedMaterial.opacity =
        0.08 +
        normalizedReflection *
        0.5;

      if(
        colorWeight > 0
      ) {

        reflectedColor.multiplyScalar(
          1 /
          colorWeight
        );

        const spotMaterial =
          visual.spot.material as
          THREE.MeshBasicMaterial;

        spotMaterial.color.copy(
          reflectedColor
        );

        reflectedMaterial.color.copy(
          reflectedColor
        );
      }

      visual.spot.position.copy(
        surfacePoint
      );

      visual.spot.quaternion.setFromUnitVectors(
        new THREE.Vector3(
          0,
          0,
          1
        ),
        moonToMorraDirection.clone().negate()
      );

      visual.spot.scale.setScalar(
        THREE.MathUtils.clamp(
          2 +
          normalizedReflection * 14,
          2,
          16
        )
      );
    }
  }

  private setLine(
    line: THREE.Line,
    start: THREE.Vector3,
    end: THREE.Vector3
  ) {

    const positionAttribute =
      line.geometry.getAttribute(
        "position"
      ) as THREE.BufferAttribute;

    const array =
      positionAttribute.array as
      Float32Array;

    array[0] =
      start.x;

    array[1] =
      start.y;

    array[2] =
      start.z;

    array[3] =
      end.x;

    array[4] =
      end.y;

    array[5] =
      end.z;

    positionAttribute.needsUpdate =
      true;
  }

  dispose() {

    for(
      const visual
      of this.visuals
    ) {

      visual.line.geometry.dispose();

      const lineMaterial =
        visual.line.material;

      if(
        lineMaterial instanceof
        THREE.Material
      ) {
        lineMaterial.dispose();
      }

      visual.spot.geometry.dispose();

      const spotMaterial =
        visual.spot.material;

      if(
        spotMaterial instanceof
        THREE.Material
      ) {
        spotMaterial.dispose();
      }
    }

    for(
      const visual
      of this.moonVisuals
    ) {

      visual.incomingLine.geometry.dispose();

      const incomingMaterial =
        visual.incomingLine.material;

      if(
        incomingMaterial instanceof
        THREE.Material
      ) {
        incomingMaterial.dispose();
      }

      visual.reflectedLine.geometry.dispose();

      const reflectedMaterial =
        visual.reflectedLine.material;

      if(
        reflectedMaterial instanceof
        THREE.Material
      ) {
        reflectedMaterial.dispose();
      }

      visual.spot.geometry.dispose();

      const spotMaterial =
        visual.spot.material;

      if(
        spotMaterial instanceof
        THREE.Material
      ) {
        spotMaterial.dispose();
      }
    }

    this.visuals.length =
      0;

    this.moonVisuals.length =
      0;

    this.root.removeFromParent();
  }
}
