// app/page.tsx（Server Component）
import ClockShell from "@/components/clock-shell";
import { ClockPoint } from "@/types/clock";
import { RaceSchedule } from "@/types/race";

export default function Page() {
  const raceStart = new Date("2025-09-05T22:00:00+0900");
  const raceEnd = new Date("2025-09-06T22:00:00+0900");
  const clock_race: ClockPoint = {
    tz: "Europe/Paris",
    label: "le mans",
    lat: 47.9498628,
    lon: 0.207354,
  };
  const clock_view: ClockPoint = {
    tz: "Asia/Tokyo",
    label: "tokyo",
    lat: 35.6983712,
    lon: 139.7728281,
  };
  const race: RaceSchedule = {
    start: raceStart,
    end: raceEnd,
    point: clock_race,
  };

  return (
    <main>
      <h1>24時間耐久レース時計</h1>
      <ClockShell clocks={[clock_race, clock_view]} race={race} />
    </main>
  );
}
