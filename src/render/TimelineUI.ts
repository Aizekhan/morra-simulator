import {
  CalendarSnapshot,
  SimulationTime
} from "../core/SimulationTime";

import {
  MORRA_CONFIG
} from "../world/MorraConfig";

import {
  WorldEventSystem
} from "../world/WorldEventSystem";

export class TimelineUI {

  private readonly root:
    HTMLDivElement;

  private readonly yearLabel:
    HTMLSpanElement;

  private readonly dateLabel:
    HTMLSpanElement;

  private readonly slider:
    HTMLInputElement;

  private readonly markerLayer:
    HTMLDivElement;

  constructor(
    private readonly time:
      SimulationTime,

    private readonly events:
      WorldEventSystem
  ) {

    this.root =
      document.createElement(
        "div"
      );

    this.root.style.position =
      "fixed";

    this.root.style.left =
      "50%";

    this.root.style.bottom =
      "14px";

    this.root.style.transform =
      "translateX(-50%)";

    this.root.style.width =
      "min(760px, calc(100vw - 40px))";

    this.root.style.padding =
      "10px 14px";

    this.root.style.background =
      "rgba(0, 0, 0, 0.82)";

    this.root.style.border =
      "1px solid #30343a";

    this.root.style.borderRadius =
      "10px";

    this.root.style.color =
      "#ddd";

    this.root.style.fontFamily =
      "monospace";

    this.root.style.zIndex =
      "900";

    const header =
      document.createElement(
        "div"
      );

    header.style.display =
      "flex";

    header.style.alignItems =
      "center";

    header.style.gap =
      "10px";

    const previous =
      document.createElement(
        "button"
      );

    previous.textContent =
      "‹";

    previous.title =
      "Previous year";

    const next =
      document.createElement(
        "button"
      );

    next.textContent =
      "›";

    next.title =
      "Next year";

    this.yearLabel =
      document.createElement(
        "span"
      );

    this.yearLabel.style.fontWeight =
      "700";

    this.dateLabel =
      document.createElement(
        "span"
      );

    this.dateLabel.style.marginLeft =
      "auto";

    header.append(
      previous,
      this.yearLabel,
      next,
      this.dateLabel
    );

    const track =
      document.createElement(
        "div"
      );

    track.style.position =
      "relative";

    track.style.paddingTop =
      "5px";

    this.slider =
      document.createElement(
        "input"
      );

    this.slider.type =
      "range";

    this.slider.min =
      "0";

    this.slider.step =
      "0.1";

    this.slider.style.width =
      "100%";

    this.markerLayer =
      document.createElement(
        "div"
      );

    this.markerLayer.style.position =
      "absolute";

    this.markerLayer.style.left =
      "7px";

    this.markerLayer.style.right =
      "7px";

    this.markerLayer.style.top =
      "16px";

    this.markerLayer.style.height =
      "12px";

    this.markerLayer.style.pointerEvents =
      "none";

    track.append(
      this.slider,
      this.markerLayer
    );

    this.slider.addEventListener(
      "input",
      () => {

        const year =
          this.time.getSnapshot()
            .year;

        this.time.setAbsoluteHours(
          (
            year - 1
          ) *
          this.time.getHoursInYear() +
          Number(
            this.slider.value
          )
        );
      }
    );

    previous.addEventListener(
      "click",
      () => {

        const snapshot =
          this.time.getSnapshot();

        this.time.setDate(
          Math.max(
            1,
            snapshot.year - 1
          ),
          snapshot.month,
          snapshot.day,
          snapshot.hour
        );
      }
    );

    next.addEventListener(
      "click",
      () => {

        const snapshot =
          this.time.getSnapshot();

        this.time.setDate(
          snapshot.year + 1,
          snapshot.month,
          snapshot.day,
          snapshot.hour
        );
      }
    );

    header.querySelectorAll(
      "button"
    ).forEach(
      button => {

        button.style.background =
          "#202328";

        button.style.color =
          "#ddd";

        button.style.border =
          "1px solid #3a3f46";

        button.style.borderRadius =
          "5px";

        button.style.cursor =
          "pointer";
      }
    );

    this.root.append(
      header,
      track
    );

    document.body.appendChild(
      this.root
    );
  }

  update(
    snapshot: CalendarSnapshot
  ) {

    this.root.style.display =
      MORRA_CONFIG.DEBUG.showTimeline
        ? "block"
        : "none";

    const yearHours =
      this.time.getHoursInYear();

    const localHours =
      snapshot.totalHours %
      yearHours;

    this.slider.max =
      String(
        yearHours
      );

    this.slider.value =
      String(
        localHours
      );

    this.yearLabel.textContent =
      "YEAR " +
      snapshot.year;

    this.dateLabel.textContent =
      "M:" +
      snapshot.month +
      " D:" +
      snapshot.day +
      " H:" +
      Math.floor(
        snapshot.hour
      );

    this.renderMarkers(
      snapshot.year,
      yearHours
    );
  }

  private renderMarkers(
    year: number,
    yearHours: number
  ) {

    this.markerLayer.innerHTML =
      "";

    const events =
      this.events.getEvents()
        .filter(
          event =>
            Math.floor(
              event.absoluteHour /
              yearHours
            ) + 1 ===
            year
        );

    for(
      const event of events
    ) {

      const localHours =
        event.absoluteHour %
        yearHours;

      const marker =
        document.createElement(
          "button"
        );

      marker.title =
        event.title;

      marker.style.position =
        "absolute";

      marker.style.left =
        (
          (
            localHours /
            yearHours
          ) *
          100
        ) +
        "%";

      marker.style.top =
        "0";

      marker.style.width =
        "5px";

      marker.style.height =
        "12px";

      marker.style.padding =
        "0";

      marker.style.border =
        "0";

      marker.style.cursor =
        "pointer";

      marker.style.pointerEvents =
        "auto";

      marker.style.background =
        "#ffffff";

      marker.addEventListener(
        "click",
        () => {

          this.time.setAbsoluteHours(
            event.absoluteHour
          );
        }
      );

      this.markerLayer.append(
        marker
      );
    }
  }

  dispose() {

    this.root.remove();
  }
}
