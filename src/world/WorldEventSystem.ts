import {
  WorldEvent
} from "./WorldEvent";

const STORAGE_KEY =
  "morra.world-events";

export class WorldEventSystem {

  private events: WorldEvent[] =
    this.load();

  getEvents() {

    return [
      ...this.events
    ].sort(
      (a, b) =>
        a.absoluteHour -
        b.absoluteHour
    );
  }

  add(
    event: WorldEvent
  ) {

    this.events.push(
      event
    );

    this.save();
  }

  remove(
    id: string
  ) {

    this.events =
      this.events.filter(
        event =>
          event.id !== id
      );

    this.save();
  }

  getAtTime(
    absoluteHour: number
  ) {

    return this.getEvents().filter(
      event =>
        Math.abs(
          event.absoluteHour -
          absoluteHour
        ) < 0.5
    );
  }

  private load(): WorldEvent[] {

    try {

      const raw =
        localStorage.getItem(
          STORAGE_KEY
        );

      if(
        !raw
      ) {
        return [];
      }

      const parsed =
        JSON.parse(
          raw
        );

      if(
        !Array.isArray(parsed)
      ) {
        return [];
      }

      return parsed;
    }
    catch {

      return [];
    }
  }

  private save() {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        this.events
      )
    );
  }
}
