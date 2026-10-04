import {
  SimulationTime
} from "../core/SimulationTime";

export class TimeControls {

  private readonly time: SimulationTime;

  pause: () => void;

  speed1: () => void;
  speed10: () => void;
  speed100: () => void;
  speed1000: () => void;

  addHour: () => void;
  addDay: () => void;

  constructor(
    time: SimulationTime
  ) {

    this.time = time;

    this.pause =
      () => this.time.pause();

    this.speed1 =
      () => this.time.setTimeScale(1);

    this.speed10 =
      () => this.time.setTimeScale(10);

    this.speed100 =
      () => this.time.setTimeScale(100);

    this.speed1000 =
      () => this.time.setTimeScale(1000);

    this.addHour =
      () => this.time.addHours(1);

    this.addDay =
      () => this.time.addHours(
        this.time.getHoursInDay()
      );
  }

  get timeScale() {

    return this.time.timeScale;
  }

  set timeScale(
    value: number
  ) {

    this.time.setTimeScale(
      value
    );
  }

  get absoluteHours() {

    return this.time.totalHours;
  }

  set absoluteHours(
    value: number
  ) {

    this.time.setAbsoluteHours(
      value
    );
  }

  get hoursInDay() {

    return this.time.getHoursInDay();
  }
}
