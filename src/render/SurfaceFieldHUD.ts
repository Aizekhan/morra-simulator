import {
  MORRA_CONFIG
} from "../world/MorraConfig";

import type {
  SurfaceFieldMap
} from "../physics/SurfaceFieldEngine";

import type {
  SurfaceFieldChannel
} from "./SurfaceFieldVisualizer";

export class SurfaceFieldHUD {

  private readonly root:
    HTMLDivElement;

  private lastMap:
    SurfaceFieldMap | null =
    null;

  private lastChannel:
    string =
      "";

  constructor() {

    this.root =
      document.createElement(
        "div"
      );

    this.root.style.position =
      "fixed";

    this.root.style.left =
      "14px";

    this.root.style.top =
      "112px";

    this.root.style.width =
      "270px";

    this.root.style.padding =
      "10px 12px";

    this.root.style.background =
      "rgba(0,0,0,0.78)";

    this.root.style.border =
      "1px solid #30343a";

    this.root.style.borderRadius =
      "10px";

    this.root.style.color =
      "#ddd";

    this.root.style.fontFamily =
      "monospace";

    this.root.style.fontSize =
      "11px";

    this.root.style.zIndex =
      "850";

    document.body.appendChild(
      this.root
    );

    this.render(
      null,
      MORRA_CONFIG.SURFACE_FIELD.channel
    );
  }

  update(
    map:
      SurfaceFieldMap | null,
    channel:
      SurfaceFieldChannel
  ) {

    const changed =
      map !== this.lastMap ||
      channel !== this.lastChannel;

    this.root.style.display =
      MORRA_CONFIG.DEBUG.showSurfaceField
        ? "block"
        : "none";

    if(
      !MORRA_CONFIG.DEBUG.showSurfaceField
    ) {
      return;
    }

    if(
      !changed
    ) {
      return;
    }

    this.lastMap =
      map;

    this.lastChannel =
      channel;

    this.render(
      map,
      channel
    );
  }

  private render(
    map:
      SurfaceFieldMap | null,
    channel:
      SurfaceFieldChannel
  ) {

    const colors =
      this.getColors(
        channel
      );

    const channelStats =
      map
        ? this.getStats(
            map,
            channel
          )
        : null;

    const title =
      this.getTitle(
        channel
      );

    const valueText =
      channelStats
        ? "MIN " +
          this.format(
            channelStats.min
          ) +
          "   AVG " +
          this.format(
            channelStats.average
          ) +
          "   MAX " +
          this.format(
            channelStats.max
          )
        : "Calculating surface field...";

    this.root.innerHTML =
      "<div style=\"display:flex;justify-content:space-between;align-items:center;margin-bottom:7px\">" +
      "<strong style=\"font-size:13px\">MORRA FIELD</strong>" +
      "<span style=\"font-weight:700\">" +
      title +
      "</span></div>" +
      "<div style=\"height:8px;border-radius:6px;background:linear-gradient(90deg," +
      colors.low +
      "," +
      colors.high +
      ");margin-bottom:6px\"></div>" +
      "<div style=\"opacity:.7\">" +
      valueText +
      "</div>" +
      "<div style=\"opacity:.5;margin-top:5px\">" +
      "GLOBAL SURFACE MAP · " +
      (
        map
          ? map.width +
            "×" +
            map.height
          : "--"
      ) +
      "</div>";
  }

  private getTitle(
    channel:
      SurfaceFieldChannel
  ) {

    switch(channel) {
      case "LIGHT":
        return "LIGHT";
      case "HEAT":
        return "HEAT";
      case "MAGIC":
        return "MAGIC";
      case "MAGOSPHERE":
        return "MAGOSPHERE";
      case "ANOMALY":
        return "ANOMALY";
      case "SHADOW":
        return "SHADOW";
      case "UMBRA":
        return "UMBRA";
      case "PENUMBRA":
        return "PENUMBRA";
    }
  }

  private getStats(
    map:
      SurfaceFieldMap,
    channel:
      SurfaceFieldChannel
  ) {

    switch(channel) {
      case "LIGHT":
        return map.lightStats;
      case "HEAT":
        return map.heatStats;
      case "MAGIC":
        return map.magicStats;
      case "MAGOSPHERE":
        return {
          min: 0,
          max: 1,
          average:
            this.average(
              map.magosphereStability
            )
        };
      case "ANOMALY":
        return {
          min: 0,
          max: 1,
          average:
            this.average(
              map.anomalyStrength
            )
        };
      case "SHADOW":
        return map.shadowStats;
      case "UMBRA":
        return {
          min: 0,
          max: 1,
          average:
            this.average(
              map.umbra
            )
        };
      case "PENUMBRA":
        return {
          min: 0,
          max: 1,
          average:
            this.average(
              map.penumbra
            )
        };
    }
  }

  private average(
    values:
      Float32Array
  ) {

    let sum =
      0;

    for(
      const value of values
    ) {
      sum += value;
    }

    return sum /
      values.length;
  }

  private format(
    value: number
  ) {

    if(
      value === 0
    ) {
      return "0";
    }

    return value
      .toExponential(
        2
      );
  }

  private getColors(
    channel:
      SurfaceFieldChannel
  ) {

    switch(channel) {
      case "LIGHT":
        return {
          low: "#07142c",
          high: "#fff1a8"
        };

      case "HEAT":
        return {
          low: "#10204a",
          high: "#ff3b20"
        };

      case "MAGOSPHERE":
        return {
          low: "#2b0710",
          high: "#59ffb0"
        };

      case "ANOMALY":
        return {
          low: "#07111f",
          high: "#ff4d00"
        };

      case "SHADOW":
        return {
          low: "#061526",
          high: "#ff1b24"
        };

      case "UMBRA":
        return {
          low: "#120000",
          high: "#ff1020"
        };

      case "PENUMBRA":
        return {
          low: "#2b1600",
          high: "#ffc247"
        };

      case "MAGIC":
      default:
        return {
          low: "#12002d",
          high: "#46e6ff"
        };
    }
  }

  dispose() {

    this.root.remove();
  }
}
