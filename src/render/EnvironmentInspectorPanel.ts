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
      "250px";

    this.root.style.minHeight =
      "164px";

    this.root.style.padding =
      "12px";

    this.root.style.background =
      "rgba(0,0,0,0.82)";

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

    const sample =
      this.engine
        .evaluateLocalPoint(
          this.localPoint
        );

    this.render(
      sample
    );
  }

  private render(
    sample:
      MorraEnvironmentSample | null
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
      "<div style=\"border-top:1px solid #3a3f46;margin:8px 0 6px;padding-top:6px\">SOURCES</div>";

    for(
      const contribution
      of sample.radiation.contributions
    ) {

      html +=
        "<div style=\"display:flex;justify-content:space-between\"><span>" +
        contribution.sourceId +
        "</span><span>" +
        (
          contribution.visibilityFactor *
          100
        ).toFixed(0) +
        "% visible</span></div>" +
        (
          contribution.blockingOccluderIds.length > 0
            ? "<div style=\"opacity:.55;font-size:10px\">BLOCKED</div>"
            : ""
        );
    }

    this.root.innerHTML =
      html;
  }

  dispose() {

    this.root.remove();
  }
}
