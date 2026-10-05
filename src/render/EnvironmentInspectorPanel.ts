import * as THREE from "three";

import type {
  MorraEnvironmentEngine,
  MorraEnvironmentSample
} from "../physics/MorraEnvironmentEngine";

import type {
  CalendarSnapshot
} from "../core/SimulationTime";

import {
  MORRA_CONFIG
} from "../world/MorraConfig";

const SOURCE_LABELS: Record<string, string> = {
  "large-sun": "LARGE SUN",
  "medium-sun": "MEDIUM SUN",
  "small-sun": "SMALL SUN",
  "north-moon-reflection": "NORTH MOON",
  "equator-moon-reflection": "EQUATOR MOON"
};

export class EnvironmentInspectorPanel {

  private readonly engine:
    MorraEnvironmentEngine;

  private readonly root:
    HTMLDivElement;

  private localPoint:
    THREE.Vector3 | null = null;

  constructor(
    engine: MorraEnvironmentEngine
  ) {

    this.engine =
      engine;

    this.root =
      document.createElement(
        "div"
      );

    this.root.style.position =
      "fixed";

    this.root.style.right =
      "14px";

    this.root.style.bottom =
      "14px";

    this.root.style.width =
      "300px";

    this.root.style.maxHeight =
      "calc(100vh - 28px)";

    this.root.style.overflowY =
      "auto";

    this.root.style.minHeight =
      "164px";

    this.root.style.padding =
      "12px";

    this.root.style.background =
      "rgba(0,0,0,0.84)";

    this.root.style.border =
      "1px solid #30343a";

    this.root.style.borderRadius =
      "10px";

    this.root.style.color =
      "#ddd";

    this.root.style.fontFamily =
      "monospace";

    this.root.style.fontSize =
      "12px";

    this.root.style.zIndex =
      "850";

    document.body.appendChild(
      this.root
    );

    this.render(
      null
    );
  }

  setPoint(
    localPoint: THREE.Vector3
  ) {

    this.localPoint =
      localPoint
        .clone();

  }

  update(
    _snapshot: CalendarSnapshot
  ) {

    this.root.style.display =
      MORRA_CONFIG.DEBUG.showTimePanel &&
      this.localPoint
        ? "block"
        : "none";

    if(
      !this.localPoint
    ) {
      return;
    }

    const diagnostic =
      this.engine
        .evaluateSurfacePointDiagnostics(
          this.localPoint
        );

    this.render(
      diagnostic.sample,
      diagnostic
    );
  }

  private render(
    sample:
      MorraEnvironmentSample | null,
    diagnostic?: {
      sourceCount: number;
      minVisibility: number;
      maxShadow: number;
      blockedSources: number;
      umbraSources: number;
      penumbraSources: number;
    }
  ) {

    let html =
      "<div style=\"font-weight:700;font-size:15px;margin-bottom:8px\">MORRA ENVIRONMENT</div>";

    if(
      !sample
    ) {

      html +=
        "<div style=\"height:125px;display:flex;align-items:center;opacity:.65\">Select a point on Morra</div>";

      this.root.innerHTML =
        html;

      return;
    }

    html +=
      "<div style=\"display:flex;justify-content:space-between\"><span>LIGHT</span><span>" +
      sample.radiation.light.toExponential(3) +
      "</span></div>";

    html +=
      "<div style=\"display:flex;justify-content:space-between\"><span>HEAT</span><span>" +
      sample.radiation.heat.toExponential(3) +
      "</span></div>";

    html +=
      "<div style=\"display:flex;justify-content:space-between\"><span>MAGIC</span><span>" +
      sample.radiation.magic.toExponential(3) +
      "</span></div>";

    html +=
      "<div style=\"border-top:1px solid #3a3f46;margin:8px 0 6px;padding-top:6px\">MAGOSPHERE</div>";

    html +=
      "<div style=\"display:flex;justify-content:space-between\"><span>STABILITY</span><span>" +
      (
        sample.magosphere.stability *
        100
      ).toFixed(1) +
      "%</span></div>";

    html +=
      "<div style=\"display:flex;justify-content:space-between\"><span>ANOMALY</span><span>" +
      (
        sample.magosphere.anomalyStrength *
        100
      ).toFixed(1) +
      "%</span></div>";

    html +=
      "<div style=\"display:flex;justify-content:space-between\"><span>GRAVITY</span><span>" +
      (
        sample.gravity.gravityScale *
        sample.gravity.baseGravity *
        100
      ).toFixed(1) +
      "%</span></div>";

    if(diagnostic) {
      html +=
        "<div style=\"border-top:1px solid #3a3f46;margin:8px 0 6px;padding-top:6px\">RADIATION DEBUG</div>";

      html +=
        "<div style=\"display:flex;justify-content:space-between\"><span>MIN VISIBILITY</span><span>" +
        (diagnostic.minVisibility * 100).toFixed(1) +
        "%</span></div>";

      html +=
        "<div style=\"display:flex;justify-content:space-between\"><span>MAX SHADOW</span><span>" +
        (diagnostic.maxShadow * 100).toFixed(1) +
        "%</span></div>";

      html +=
        "<div style=\"display:flex;justify-content:space-between\"><span>BLOCKED SOURCES</span><span>" +
        diagnostic.blockedSources +
        " / " +
        diagnostic.sourceCount +
        "</span></div>";

      html +=
        "<div style=\"display:flex;justify-content:space-between\"><span>UMBRA</span><span>" +
        diagnostic.umbraSources +
        "</span></div>";

      html +=
        "<div style=\"display:flex;justify-content:space-between\"><span>PENUMBRA</span><span>" +
        diagnostic.penumbraSources +
        "</span></div>";
    }

    html +=
      "<div style=\"border-top:1px solid #3a3f46;margin:8px 0 6px;padding-top:6px\">SOURCE CONTRIBUTIONS</div>";

    for(
      const contribution
      of sample.radiation.contributions
    ) {

      const label =
        SOURCE_LABELS[contribution.sourceId] ??
        contribution.sourceId.toUpperCase();

      const contributionRows = [
        this.row(
          "LIGHT",
          contribution.light.toExponential(3)
        ),
        this.row(
          "HEAT",
          contribution.heat.toExponential(3)
        ),
        this.row(
          "MAGIC",
          contribution.magic.toExponential(3)
        ),
        this.row(
          "DISTANCE",
          contribution.distance.toFixed(3)
        ),
        this.row(
          "ILLUMINATION",
          (
            contribution.illuminationFactor *
            100
          ).toFixed(1) + "%"
        ),
        this.row(
          "VISIBILITY",
          (
            contribution.visibilityFactor *
            100
          ).toFixed(1) + "%"
        )
      ].join("");

      const primaryOccluder =
        contribution.primaryOccluderId
          ? "<div style=\"margin:2px 0 5px 8px;opacity:.65;font-size:10px\">PRIMARY OCCLUDER: " +
            contribution.primaryOccluderId +
            "</div>"
          : "";

      const blockers =
        contribution.blockingOccluderIds.length > 0
          ? "<div style=\"margin:2px 0 5px 8px;opacity:.65;font-size:10px\">BLOCKERS: " +
            contribution.blockingOccluderIds.join(", ") +
            "</div>"
          : "";

      const shadowState =
        contribution.umbra
          ? "<span style=\"color:#ff7676\">UMBRA</span>"
          : contribution.penumbra
            ? "<span style=\"color:#ffd27a\">PENUMBRA</span>"
            : "<span style=\"opacity:.55\">CLEAR</span>";

      html +=
        "<div style=\"margin-bottom:7px;padding:6px 7px;border:1px solid #292d33;border-radius:6px;background:rgba(255,255,255,.025)\">" +
        "<div style=\"display:flex;justify-content:space-between;font-weight:700\"><span>" +
        label +
        "</span><span>" +
        shadowState +
        "</span></div>" +
        contributionRows +
        primaryOccluder +
        blockers +
        "</div>";
    }

    html +=
      "<div style=\"border-top:1px solid #3a3f46;margin:8px 0 6px;padding-top:6px\">TOTAL CHECK</div>";

    html +=
      this.row(
        "LIGHT SUM",
        sample.radiation.light.toExponential(3)
      );

    html +=
      this.row(
        "LIGHT UNOBSTRUCTED",
        sample.radiation.unobstructedLight.toExponential(3)
      );

    html +=
      this.row(
        "HEAT SUM",
        sample.radiation.heat.toExponential(3)
      );

    html +=
      this.row(
        "HEAT UNOBSTRUCTED",
        sample.radiation.unobstructedHeat.toExponential(3)
      );

    html +=
      this.row(
        "MAGIC SUM",
        sample.radiation.magic.toExponential(3)
      );

    html +=
      this.row(
        "MAGIC UNOBSTRUCTED",
        sample.radiation.unobstructedMagic.toExponential(3)
      );

    html +=
      this.row(
        "LIGHT VISIBILITY",
        (
          sample.radiation.lightVisibility *
          100
        ).toFixed(1) + "%"
      );

    html +=
      this.row(
        "HEAT VISIBILITY",
        (
          sample.radiation.heatVisibility *
          100
        ).toFixed(1) + "%"
      );

    html +=
      this.row(
        "MAGIC VISIBILITY",
        (
          sample.radiation.magicVisibility *
          100
        ).toFixed(1) + "%"
      );

    this.root.innerHTML =
      html;
  }

  private row(
    label: string,
    value: string
  ) {

    return (
      "<div style=\"display:flex;justify-content:space-between;margin:1px 0\"><span>" +
      label +
      "</span><span>" +
      value +
      "</span></div>"
    );
  }

  dispose() {

    this.root.remove();
  }
}
