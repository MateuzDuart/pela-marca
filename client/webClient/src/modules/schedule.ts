// @ts-ignore
export enum DaysOfTheWeek {
  SUNDAY = "sunday",
  MONDAY = "monday",
  TUESDAY = "tuesday",
  WEDNESDAY = "wednesday",
  THURSDAY = "thursday",
  FRIDAY = "friday",
  SATURDAY = "saturday"
}

export type schedule = Record<DaysOfTheWeek, { hour: string; isActive: boolean }>;

