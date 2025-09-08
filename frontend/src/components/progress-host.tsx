// src/components/ProgressBarHost.tsx
"use client";
import { useElementSize } from "@/hooks/use-element-size";
import ProgressBarCanvas from "@/components/progress-canvas";
import { SolarEvent, StateKind } from "@/lib/solar";

export default function ProgressBarHost(props: {
  start: Date;
  end: Date;
  now: Date;
  solarEvents: SolarEvent[];
  solarInitialState: StateKind | null;
}) {
  const { ref, width } = useElementSize<HTMLDivElement>();
  return (
    <div ref={ref} style={{ width: "100%", height: "6vw" }}>
      {width > 0 && (
        <ProgressBarCanvas
          start={props.start}
          end={props.end}
          now={props.now}
          solarEvents={props.solarEvents}
          solarInitialState={props.solarInitialState}
        />
      )}
    </div>
  );
}
