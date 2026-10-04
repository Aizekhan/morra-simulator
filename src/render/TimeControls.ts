import { MorraTimeSystem }
from "../world/MorraTimeSystem";

export class TimeControls {

  pause: () => void;

  speed1: () => void;

  speed10: () => void;

  speed100: () => void;

  speed1000: () => void;

  addHour: () => void;

  addDay: () => void;

  constructor(
    timeSystem: MorraTimeSystem
  ) {

    this.pause =
      () => timeSystem.pause();

    this.speed1 =
      () => timeSystem.speed1();

    this.speed10 =
      () => timeSystem.speed10();

    this.speed100 =
      () => timeSystem.speed100();

    this.speed1000 =
      () => timeSystem.speed1000();

    this.addHour =
      () => timeSystem.addHour();

    this.addDay =
      () => timeSystem.addDay();
  }
}