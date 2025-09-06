import { ClockPoint } from "@/types/clock";
export type RaceSchedule = {
  start: Date; // UTC
  end: Date; // UTC
  point: ClockPoint;
};
