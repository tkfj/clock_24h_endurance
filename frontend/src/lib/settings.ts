import { ClockPoint } from "@/types/clock";
import { RaceSchedule } from "@/types/race";

export type Race = {
  id: string;
  name: string;
  start: Date;
  end: Date;
  place: ClockPoint;
  logo: Logo;
};
export type Logo = {
  imageFile: string;
  foregroundColor: string;
  backgroundColor: string;
}

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
  label: "spa-francorchamps",
  tz: "Europe/Brussels",
  lat: 50.4428908,
  lon: 5.9652831,
};
const place_nur: ClockPoint = {
  label: "nürburgring",
  tz: "Europe/Berlin",
  lat: 50.3355987,
  lon: 6.947032,
};
const place_daytona: ClockPoint = {
  label: "daytona",
  tz: "America/New_York",
  lat: 29.1876752,
  lon: -81.0729835,
};
export const RACES: Race[] = [
  {
    id: "2026-lemans24",
    name: "2026 - 24 Heures du Mans",
    start: new Date("2026-06-13T14:00:00+02:00"),//FIX済
    end: new Date("2026-06-14T14:00:00+02:00"),
    place: place_lemans,
    logo: {
      imageFile:"/24h_lemans.png",
      foregroundColor:"#0d64ff",
      backgroundColor:"#ffffff",
    }
  },
  {
    id: "2026-daytona24",
    name: "2026 - ROREX 24 AT DAYTONA",
    start: new Date("2026-01-24T13:40:00-05:00"), //時間は前年踏襲で仮置き
    end: new Date("2026-01-25T13:40:00-05:00"),
    place: place_daytona,
    logo: {
      imageFile:"/R24Logo_218x180.png",
      foregroundColor:"rgba(0,0,0,0)",
      backgroundColor:"rgb(255,255,255)",
    }
  },
  {
    id: "2026-spa24",
    name: "2026 - CrowdStrike 24 Hours of Spa",
    //start: new Date("2026-06-24T00:00:00Z"),//公式サイトのカウントダウンがここを目指しているがおそらくプログラム開始当日のUTCゼロ時という意味と思われる。レースは例年通りの時間なら↓
    //end: new Date("2026-06-25T00:00:00Z"),
    start: new Date("2026-06-27T16:30:00+02:00"),
    end: new Date("2026-06-28T16:30:00+02:00"),
    place: place_spa,
    logo: {
      imageFile:"/crowdstrike-24-hours-spa-logo.svg",
      foregroundColor:"rgba(0,0,0,0)",
      backgroundColor:"rgb(255,255,255)",
    }
  },
  {
    id: "2026-nur24",
    name: "2026 - ADAC RAVENOL 24h Nürburgring",
    start: new Date("2026-05-16T16:00:00+02:00"),//時間は昨年踏襲で仮置き(開催が1か月早まるので変わるかもな)
    end: new Date("2026-05-17T16:00:00+02:00"),
    place: place_nur,
    logo: {
      imageFile:"/ADAC_Ravenol_24h_2024_CMYK_1c_trans.png",
      foregroundColor:"rgb(255,255,255)",
      backgroundColor:"#43632d",
    }
  },
  {
    id: "2025-daytona24",
    name: "2025 - ROREX 24 AT DAYTONA",
    start: new Date("2025-01-25T13:40:00-05:00"),
    end: new Date("2025-01-26T13:40:00-05:00"),
    place: place_daytona,
    logo: {
      imageFile:"/R24Logo_218x180.png",
      foregroundColor:"rgba(0,0,0,0)",
      backgroundColor:"rgb(255,255,255)",
    }
  },
  {
    id: "2025-lemans24",
    name: "2025 - 24 Heures du Mans",
    start: new Date("2025-06-14T14:00:00+02:00"),
    end: new Date("2025-06-15T14:00:00+02:00"),
    place: place_lemans,
    logo: {
      imageFile:"/24h_lemans.png",
      foregroundColor:"rgba(0,0,0,0)",
      backgroundColor:"rgb(255,255,255)",
    }
  },
  {
    id: "2025-nur24",
    name: "2025 - ADAC RAVENOL 24h Nürburgring",
    start: new Date("2025-06-21T16:00:00+02:00"),
    end: new Date("2025-06-22T16:00:00+02:00"),
    place: place_nur,
    logo: {
      imageFile:"/ADAC_Ravenol_24h_2024_CMYK_1c_trans.png",
      foregroundColor:"rgb(255,255,255)",
      backgroundColor:"#43632d",
    }
  },
  {
    id: "2025-spa24",
    name: "2025 - CrowdStrike 24 Hours of Spa",
    start: new Date("2025-06-28T16:30:00+02:00"),
    end: new Date("2025-06-29T16:30:00+02:00"),
    place: place_spa,
    logo: {
      imageFile:"/crowdstrike-24-hours-spa-logo.svg",
      foregroundColor:"rgba(0,0,0,0)",
      backgroundColor:"rgb(255,255,255)",
    }
  },
];

export type Settings = {
  raceId: string;
  race: RaceSchedule;
  otherPlace: ClockPoint;
  logoImageFile:string;
  logoForegroundColor:string;
  logoBackgroundColor:string;
};
export const SETTINGS_DEFAULT: Settings = {
  raceId: RACES[0].id,
  race: {
    start: RACES[0].start,
    end: RACES[0].end,
    point: RACES[0].place,
  },
  otherPlace: PLACE_DEFAULT,
  logoImageFile:"/24h_lemans.png",
  logoForegroundColor:"rgba(0,0,0,0.5)",
  logoBackgroundColor:"rgba(255,255,255,0.5)",
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
      logoImageFile: race.logo.imageFile,
      logoForegroundColor: race.logo.foregroundColor,
      logoBackgroundColor: race.logo.backgroundColor,
    };
  } catch {
    return SETTINGS_DEFAULT;
  }
}
