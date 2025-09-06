"use client";

import { useEffect, useState, useMemo } from "react";
import ClockCanvas from "@/components/clock-canvas";
import ProgressBar from "@/components/progress-bar";
import RaceClocks from "@/components/race-clocks";
import { ClockPoint } from "@/types/clock";
import { localDayKey, keyToDayStartUTC, getDayStartLocal } from "@/lib/tz";
import { solarEventsInRangeWithPrev } from "@/lib/solar";
import { RaceSchedule } from "@/types/race";

export default function ClockShell({
  clocks,
  race,
}: {
  clocks: ClockPoint[];
  race: RaceSchedule;
}) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const {
    events: raceSolarEvents,
    prevEvent: raceSolarEventPrev,
    initialState: raceSolarInitialState,
  } = solarEventsInRangeWithPrev(
    race.start,
    race.end,
    race.point.lat,
    race.point.lon
  );

  const clocks_plus = useMemo(() => {
    return clocks.map((c) => {
      const key = localDayKey(now, c.tz);
      const dayStartUTC = keyToDayStartUTC(key);
      const dayStart = getDayStartLocal(now, c.tz);
      const dayEnd = new Date(dayStart.getTime() + 1000 * 60 * 60 * 24);
      const solarEvents = solarEventsInRangeWithPrev(
        dayStart,
        dayEnd,
        c.lat,
        c.lon
      );
      return {
        ...c,
        dayStart: dayStart,
        dayEnd: dayEnd,
        solarEvents: solarEvents,
      };
    });
  }, [now, clocks]);

  return (
    <div suppressHydrationWarning>
      <div className="grid">
        <RaceClocks start={race.start} end={race.end} now={now} />
        <ProgressBar
          start={race.start}
          end={race.end}
          now={now}
          solarEvents={raceSolarEvents}
          solarInitialState={raceSolarInitialState}
        />
        {clocks_plus.map((c) => {
          return (
            <>
              <ClockCanvas key={c.label} tz={c.tz} label={c.label} now={now} />
              <ProgressBar
                start={c.dayStart}
                end={c.dayEnd}
                now={now}
                solarEvents={c.solarEvents.events}
                solarInitialState={c.solarEvents.initialState}
              />
            </>
          );
        })}
      </div>
    </div>
  );
}
