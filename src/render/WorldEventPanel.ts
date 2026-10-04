import {
  SimulationTime
} from "../core/SimulationTime";

import {
  createWorldEvent
} from "../world/WorldEvent";

import {
  WorldEventSystem
} from "../world/WorldEventSystem";

export class WorldEventPanel {

  private readonly root:
    HTMLDivElement;

  private readonly titleInput:
    HTMLInputElement;

  private readonly locationInput:
    HTMLInputElement;

  private readonly descriptionInput:
    HTMLTextAreaElement;

  private readonly list:
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
      "14px";

    this.root.style.bottom =
      "14px";

    this.root.style.width =
      "300px";

    this.root.style.maxHeight =
      "260px";

    this.root.style.padding =
      "12px";

    this.root.style.background =
      "rgba(0, 0, 0, 0.82)";

    this.root.style.border =
      "1px solid #30343a";

    this.root.style.borderRadius =
      "10px";

    this.root.style.color =
      "#ddd";

    this.root.style.fontFamily =
      "system-ui, sans-serif";

    this.root.style.fontSize =
      "12px";

    this.root.style.zIndex =
      "850";

    const heading =
      document.createElement(
        "div"
      );

    heading.textContent =
      "WORLD EVENT";

    heading.style.fontWeight =
      "700";

    heading.style.marginBottom =
      "8px";

    this.titleInput =
      this.createInput(
        "Title"
      );

    this.locationInput =
      this.createInput(
        "Location ID or selected point"
      );

    this.descriptionInput =
      document.createElement(
        "textarea"
      );

    this.descriptionInput.placeholder =
      "Description";

    this.descriptionInput.rows =
      2;

    this.descriptionInput.style.width =
      "100%";

    this.descriptionInput.style.resize =
      "vertical";

    this.descriptionInput.style.marginBottom =
      "6px";

    const addButton =
      document.createElement(
        "button"
      );

    addButton.textContent =
      "Create event at current time";

    addButton.style.width =
      "100%";

    addButton.addEventListener(
      "click",
      () => {

        if(
          !this.titleInput.value.trim()
        ) {
          return;
        }

        this.events.add(
          createWorldEvent(
            this.titleInput.value,
            this.descriptionInput.value,
            this.locationInput.value,
            this.time.totalHours
          )
        );

        this.titleInput.value =
          "";

        this.descriptionInput.value =
          "";

        this.renderList();
      }
    );

    this.list =
      document.createElement(
        "div"
      );

    this.list.style.marginTop =
      "8px";

    this.list.style.maxHeight =
      "100px";

    this.list.style.overflow =
      "auto";

    this.root.append(
      heading,
      this.titleInput,
      this.locationInput,
      this.descriptionInput,
      addButton,
      this.list
    );

    document.body.appendChild(
      this.root
    );

    this.renderList();
  }

  setLocation(
    locationId: string
  ) {

    this.locationInput.value =
      locationId;
  }

  update() {

    this.renderList();
  }

  private createInput(
    placeholder: string
  ) {

    const input =
      document.createElement(
        "input"
      );

    input.placeholder =
      placeholder;

    input.style.width =
      "100%";

    input.style.marginBottom =
      "6px";

    return input;
  }

  private renderList() {

    const events =
      this.events.getEvents()
        .slice(-8)
        .reverse();

    this.list.innerHTML =
      "";

    const yearHours =
      this.time.getHoursInYear();

    for(
      const event of events
    ) {

      const row =
        document.createElement(
          "div"
        );

      row.style.display =
        "flex";

      row.style.alignItems =
        "center";

      row.style.gap =
        "6px";

      row.style.borderTop =
        "1px solid #2b2f35";

      row.style.padding =
        "5px 0";

      const text =
        document.createElement(
          "span"
        );

      const year =
        Math.floor(
          event.absoluteHour /
          yearHours
        ) + 1;

      const local =
        event.absoluteHour %
        yearHours;

      text.textContent =
        "Y" +
        year +
        " +" +
        Math.floor(local) +
        "h · " +
        event.title;

      text.style.flex =
        "1";

      const remove =
        document.createElement(
          "button"
        );

      remove.textContent =
        "×";

      remove.addEventListener(
        "click",
        () => {

          this.events.remove(
            event.id
          );

          this.renderList();
        }
      );

      row.append(
        text,
        remove
      );

      this.list.append(
        row
      );
    }
  }

  dispose() {

    this.root.remove();
  }
}
