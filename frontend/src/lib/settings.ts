import { ClockPoint } from "@/types/clock";
import { RaceSchedule } from "@/types/race";

export type Race = {
  id: string;
  name: string;
  start: Date;
  end: Date;
  place: ClockPoint;
};

const PLACE_DEFAULT: ClockPoint = {
  label: "tokyo",
  tz: "Asia/Tokyo",
  lat: 35.6983712,
  lon: 139.7728281,
};
const place_lemans: ClockPoint = {
  label: "le mans",
  tz: "Europe/Paris",
  lat: 47.9498628,
  lon: 0.207354,
};
const place_spa: ClockPoint = {
  label: "spa francorchamps",
  tz: "Europe/Brussels",
  lat: 0,
  lon: 0,
};
export const RACES: Race[] = [
  {
    id: "lemans-2026",
    name: "24 Heures du Mans 2026",
    start: new Date("2026-06-13T14:00:00+02:00"),
    end: new Date("2026-06-14T14:00:00+02:00"),
    place: place_lemans,
  },
  {
    id: "lemans-2025",
    name: "24 Heures du Mans 2025",
    start: new Date("2025-06-14T14:00:00+02:00"),
    end: new Date("2025-06-15T14:00:00+02:00"),
    place: place_lemans,
  },
];

export type Settings = {
  raceId: string;
  race: RaceSchedule;
  otherPlace: ClockPoint;
};
export const SETTINGS_DEFAULT: Settings = {
  raceId: RACES[0].id,
  race: {
    start: RACES[0].start,
    end: RACES[0].end,
    point: RACES[0].place,
  },
  otherPlace: PLACE_DEFAULT,
};
export type SettingsInternal = {
  raceId: string;
  place: string;
  tz: string;
  lat: number;
  lon: number;
};
export const SETTINGS_INTERNAL_DEFAULT: SettingsInternal = {
  raceId: SETTINGS_DEFAULT.raceId,
  place: SETTINGS_DEFAULT.otherPlace.label,
  tz: SETTINGS_DEFAULT.otherPlace.tz,
  lat: SETTINGS_DEFAULT.otherPlace.lat,
  lon: SETTINGS_DEFAULT.otherPlace.lon,
};

const LS_KEY = "24hclock.settings.v1";
export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const internal: SettingsInternal = raw
      ? JSON.parse(raw)
      : SETTINGS_INTERNAL_DEFAULT;
    const race_tmp = RACES.find((r) => r.id === internal.raceId);
    const race: Race = race_tmp ? race_tmp : RACES[0];
    return {
      raceId: internal.raceId,
      race: {
        start: race.start,
        end: race.end,
        point: race.place,
      },
      otherPlace: {
        label: internal.place,
        tz: internal.tz,
        lat: internal.lat,
        lon: internal.lon,
      },
    };
  } catch {
    return SETTINGS_DEFAULT;
  }
}
