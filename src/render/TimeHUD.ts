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

    this.element.style.height =
      "96px";

    this.element.style.padding =
      "10px";

    this.element.style.overflow =
      "hidden";

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

    const eventText =
      events.length > 0
        ? events.join(" · ")
        : "";

    let html =
      "<div style=\"font-size:17px;font-weight:700;margin-bottom:8px;height:20px;line-height:20px;white-space:nowrap\">MORRA</div>";

    html +=
      "<div style=\"display:grid;grid-template-columns:65px 55px 55px 50px;width:225px;min-width:225px;max-width:225px;margin-bottom:6px;height:18px;line-height:18px;white-space:nowrap;overflow:hidden\">" +
      "<span style=\"display:block;width:65px;min-width:65px;max-width:65px;text-align:left;overflow:hidden\">Y:" +
      snapshot.year +
      "</span>" +
      "<span style=\"display:block;width:55px;min-width:55px;max-width:55px;text-align:left;overflow:hidden\">M:" +
      snapshot.month +
      "</span>" +
      "<span style=\"display:block;width:55px;min-width:55px;max-width:55px;text-align:left;overflow:hidden\">D:" +
      snapshot.day +
      "</span>" +
      "<span style=\"display:block;width:50px;min-width:50px;max-width:50px;text-align:left;overflow:hidden\">H:" +
      Math.floor(snapshot.hour) +
      "</span>" +
      "</div>";

    html +=
      "<div style=\"box-sizing:border-box;border-top:1px solid #444;margin-top:6px;padding-top:6px;height:28px;line-height:17px;white-space:nowrap;overflow:hidden;visibility:" +
      (
        eventText
          ? "visible"
          : "hidden"
      ) +
      "\">" +
      eventText +
      "</div>";

    this.element.innerHTML =
      html;
  }

  dispose() {

    this.element.remove();
  }
}
