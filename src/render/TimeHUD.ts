import type {
  CalendarSnapshot
} from "../core/SimulationTime";

import type {
  AstronomicalEventState
} from "../astronomy/AstronomicalEventSystem";

import {
  MORRA_CONFIG
} from "../world/MorraConfig";

export class TimeHUD {

  readonly element:
    HTMLDivElement;

  constructor() {

    this.element =
      document.createElement(
        "div"
      );

    this.element.style.position =
      "fixed";

    this.element.style.top =
      "10px";

    this.element.style.left =
      "10px";

    this.element.style.width =
      "245px";

    this.element.style.padding =
      "10px";

    this.element.style.background =
      "rgba(0,0,0,0.78)";

    this.element.style.color =
      "#ffffff";

    this.element.style.fontFamily =
      "monospace";

    this.element.style.fontSize =
      "13px";

    this.element.style.border =
      "1px solid #444";

    this.element.style.borderRadius =
      "8px";

    this.element.style.zIndex =
      "800";

    document.body.appendChild(
      this.element
    );
  }

  update(
    snapshot: CalendarSnapshot,
    astronomy: AstronomicalEventState
  ) {

    this.element.style.display =
      MORRA_CONFIG.DEBUG.showTimePanel
        ? "block"
        : "none";

    if(
      !MORRA_CONFIG.DEBUG.showTimePanel
    ) {
      return;
    }

    const events: string[] = [];

    if(
      astronomy.solarEclipses.length > 0
    ) {

      events.push(
        "SOLAR ECLIPSE"
      );
    }

    if(
      astronomy.lunarEclipses.length > 0
    ) {

      events.push(
        "LUNAR ECLIPSE"
      );
    }

    let html =
      "<div style=\"font-size:17px;font-weight:700;margin-bottom:8px\">MORRA</div>";

    html +=
      "<div style=\"display:flex;justify-content:space-between;margin-bottom:6px\">" +
      "<span>Y:" +
      snapshot.year +
      "</span>" +
      "<span>M:" +
      snapshot.month +
      "</span>" +
      "<span>D:" +
      snapshot.day +
      "</span>" +
      "<span>H:" +
      Math.floor(snapshot.hour) +
      "</span>" +
      "</div>";

    if(
      events.length > 0
    ) {

      html +=
        "<div style=\"border-top:1px solid #444;padding-top:6px;margin-top:6px\">" +
        events.join(" · ") +
        "</div>";
    }

    this.element.innerHTML =
      html;
  }

  dispose() {

    this.element.remove();
  }
}
