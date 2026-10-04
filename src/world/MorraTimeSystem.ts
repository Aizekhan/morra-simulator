import { MORRA_CONFIG }
from "./MorraConfig";

export class MorraTimeSystem {

  currentYear: number;

  currentMonth: number;

  currentDay: number;

  currentHour: number;

  isPaused: boolean;

  constructor() {

    this.currentYear = 1;

    this.currentMonth = 1;

    this.currentDay = 1;

    this.currentHour = 0;

    this.isPaused = false;
  }

  update(
    delta:number
  ) {

    if(
      this.isPaused
    ) {
      return;
    }

    this.currentHour +=
      delta *
      MORRA_CONFIG.TIME_SPEED;

    while(
      this.currentHour >=
      MORRA_CONFIG.HOURS_IN_DAY
    ) {

      this.currentHour -=
        MORRA_CONFIG.HOURS_IN_DAY;

      this.currentDay++;
    }

    while(
      this.currentDay >
      MORRA_CONFIG.DAYS_IN_MONTH
    ) {

      this.currentDay = 1;

      this.currentMonth++;
    }

    while(
      this.currentMonth >
      MORRA_CONFIG.MONTHS_IN_YEAR
    ) {

      this.currentMonth = 1;

      this.currentYear++;
    }
  }

  pause() {

    this.isPaused =
      !this.isPaused;
  }

  speed1() {

    MORRA_CONFIG.TIME_SPEED =
      1;
  }

  speed10() {

    MORRA_CONFIG.TIME_SPEED =
      10;
  }

  speed100() {

    MORRA_CONFIG.TIME_SPEED =
      100;
  }

  speed1000() {

    MORRA_CONFIG.TIME_SPEED =
      1000;
  }

  addHour() {

    this.currentHour++;

    if(
      this.currentHour >=
      MORRA_CONFIG.HOURS_IN_DAY
    ) {

      this.currentHour = 0;

      this.currentDay++;
    }
  }

  addDay() {

    this.currentDay++;

    if(
      this.currentDay >
      MORRA_CONFIG.DAYS_IN_MONTH
    ) {

      this.currentDay = 1;

      this.currentMonth++;
    }
  }

  setHour(
    value:number
  ) {

    this.currentHour =
      value;
  }

  setDay(
    value:number
  ) {

    this.currentDay =
      value;
  }

  setMonth(
    value:number
  ) {

    this.currentMonth =
      value;
  }

  setYear(
    value:number
  ) {

    this.currentYear =
      value;
  }

  getTimelinePercent() {

    return (
      this.currentHour /
      MORRA_CONFIG.HOURS_IN_DAY
    ) * 100;
  }

  getDateString() {

    return `
YEAR ${this.currentYear}
MONTH ${this.currentMonth}
DAY ${this.currentDay}
`;
  }

  getTimeString() {

    return `
HOUR ${Math.floor(
      this.currentHour
    )}
`;
  }
}