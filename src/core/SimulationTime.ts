import { MORRA_CONFIG } from "../world/MorraConfig";

export interface CalendarSnapshot {

  totalHours: number;

  year: number;
  month: number;
  day: number;
  hour: number;

  yearProgress: number;
  dayProgress: number;
}

export class SimulationTime {

  totalHours = 0;

  isPaused = false;

  timeScale =
    MORRA_CONFIG.TIME_SPEED;

  update(
    realDeltaSeconds: number
  ) {

    if(
      this.isPaused
    ) {
      return;
    }

    this.totalHours +=
      realDeltaSeconds *
      this.timeScale;
  }

  pause() {

    this.isPaused =
      !this.isPaused;
  }

  setTimeScale(
    value: number
  ) {

    this.timeScale =
      Math.max(
        0,
        value
      );

    MORRA_CONFIG.TIME_SPEED =
      this.timeScale;
  }

  setAbsoluteHours(
    value: number
  ) {

    this.totalHours =
      Math.max(
        0,
        value
      );
  }

  addHours(
    value: number
  ) {

    this.setAbsoluteHours(
      this.totalHours + value
    );
  }

  setDate(
    year: number,
    month: number,
    day: number,
    hour: number
  ) {

    const hoursInDay =
      this.getHoursInDay();

    const hoursInMonth =
      this.getHoursInMonth();

    const hoursInYear =
      this.getHoursInYear();

    const normalizedYear =
      Math.max(
        1,
        Math.floor(year)
      );

    const normalizedMonth =
      Math.max(
        1,
        Math.min(
          MORRA_CONFIG.MONTHS_IN_YEAR,
          Math.floor(month)
        )
      );

    const normalizedDay =
      Math.max(
        1,
        Math.min(
          MORRA_CONFIG.DAYS_IN_MONTH,
          Math.floor(day)
        )
      );

    const normalizedHour =
      Math.max(
        0,
        Math.min(
          hoursInDay - Number.EPSILON,
          hour
        )
      );

    this.totalHours =
      (
        (normalizedYear - 1) *
        hoursInYear
      ) +
      (
        (normalizedMonth - 1) *
        hoursInMonth
      ) +
      (
        (normalizedDay - 1) *
        hoursInDay
      ) +
      normalizedHour;
  }

  getHoursInDay() {

    return MORRA_CONFIG.HOURS_IN_DAY;
  }

  getHoursInMonth() {

    return (
      this.getHoursInDay() *
      MORRA_CONFIG.DAYS_IN_MONTH
    );
  }

  getHoursInYear() {

    return (
      this.getHoursInMonth() *
      MORRA_CONFIG.MONTHS_IN_YEAR
    );
  }

  getSnapshot(): CalendarSnapshot {

    const hoursInDay =
      this.getHoursInDay();

    const hoursInMonth =
      this.getHoursInMonth();

    const hoursInYear =
      this.getHoursInYear();

    const year =
      Math.floor(
        this.totalHours /
        hoursInYear
      ) + 1;

    const yearHour =
      this.totalHours %
      hoursInYear;

    const month =
      Math.floor(
        yearHour /
        hoursInMonth
      ) + 1;

    const monthHour =
      yearHour %
      hoursInMonth;

    const day =
      Math.floor(
        monthHour /
        hoursInDay
      ) + 1;

    const hour =
      monthHour %
      hoursInDay;

    return {
      totalHours:
        this.totalHours,

      year,
      month,
      day,
      hour,

      yearProgress:
        yearHour /
        hoursInYear,

      dayProgress:
        hour /
        hoursInDay
    };
  }
}
