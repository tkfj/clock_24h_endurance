"use client";

import { useElementSize } from "@/hooks/use-element-size";
import ProgressBarCanvas from "@/components/progress-canvas";
import ClockCanvas from "@/components/clock-canvas";
import { solarEventsInRangeWithPrev } from "@/lib/solar";
import { getDayStartLocal, getZoneLabel, localDayKey } from "@/lib/tz";
import { useMemo } from "react";
import { ClockPoint } from "@/types/clock";

import { Prompt } from "next/font/google";

const font_prompt = Prompt({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});
export default function ClockPanel(props: { point: ClockPoint; now: Date }) {
  const { ref, width } = useElementSize<HTMLDivElement>();
  const tzLabel = getZoneLabel(props.now, props.point.tz);

  const dayKey = useMemo(
    () => localDayKey(props.now, props.point.tz),
    [props.now, props.point.tz]
  );
  const dayStart = useMemo(
    () => getDayStartLocal(props.now, props.point.tz),
    [dayKey, props.point.tz]
  );
  const dayEnd = useMemo(
    () => new Date(dayStart.getTime() + 1000 * 60 * 60 * 24),
    [dayStart]
  );
  const solarEvents = useMemo(
    () =>
      solarEventsInRangeWithPrev(
        dayStart,
        dayEnd,
        props.point.lat,
        props.point.lon
      ),
    [dayKey]
  );

  return (
    <div ref={ref} className="panel">
      <div className={font_prompt.className}>
        <span className="point-label">{props.point.label} </span>
        <span className="point-tz">{tzLabel}</span>
      </div>
      {width > 0 && (
        <div className="progress">
          <ProgressBarCanvas
            start={dayStart}
            end={dayEnd}
            now={props.now}
            solarEvents={solarEvents.events}
            solarInitialState={solarEvents.initialState}
          />
        </div>
      )}
      <div style={{ width: "100%", display: "grid", placeItems: "center" }}>
        <div className="square">
          {width > 0 && (
            <ClockCanvas
              tz={props.point.tz}
              label={props.point.label}
              now={props.now}
            />
          )}
        </div>
      </div>
      <style jsx>{`
        .point-label {
          font-size: 3.6vw;
          font-weight: bold;
        }
        .point-tz {
          font-size: 1.6vw;
        }
        .progress {
          width: 100%;
          height: 4vw;
        }
        .panel {
          width: 100%;
          display: grid;
          gap: 0px;
          color: #004465;
        }
        .square {
          width: min(
            100%,
            var(--clock-edge)
          ); /* 画面基準の上限 × 親カラムにフィット */
          aspect-ratio: 1 / 1; /* 正方形を保証 */
          display: grid;
          place-items: center;
        }
      `}</style>
    </div>
  );
}
