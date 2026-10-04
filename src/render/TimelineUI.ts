import {
  CalendarSnapshot,
  SimulationTime
} from "../core/SimulationTime";

export class TimelineUI {

  private readonly root:
    HTMLDivElement;

  private readonly yearLabel:
    HTMLSpanElement;

  private readonly dateLabel:
    HTMLSpanElement;

  private readonly slider:
    HTMLInputElement;

  private readonly previousButton:
    HTMLButtonElement;

  private readonly nextButton:
    HTMLButtonElement;

  constructor(
    private readonly time:
      SimulationTime
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

    this.previousButton =
      previous;

    const next =
      document.createElement(
        "button"
      );

    next.textContent =
      "›";

    next.title =
      "Next year";

    this.nextButton =
      next;

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

    this.slider.addEventListener(
      "input",
      () => {

        const year =
          this.time.getSnapshot()
            .year;

        const value =
          Number(
            this.slider.value
          );

        this.time.setAbsoluteHours(
          (
            year - 1
          ) *
          this.time.getHoursInYear() +
          value
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
      this.slider
    );

    document.body.appendChild(
      this.root
    );
  }

  update(
    snapshot: CalendarSnapshot
  ) {

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
      `YEAR ${snapshot.year}`;

    this.dateLabel.textContent =
      `M:${snapshot.month} D:${snapshot.day} H:${Math.floor(snapshot.hour)}`;
  }

  dispose() {

    this.root.remove();
  }
}
