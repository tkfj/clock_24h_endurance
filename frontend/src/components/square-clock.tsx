"use client";

import { useElementSize } from "@/hooks/use-element-size";
import ClockCanvas from "@/components/clock-canvas";

export default function SquareClock(props: {
  tz: string;
  label: string;
  now: Date;
}) {
  const { ref, width, height } = useElementSize<HTMLDivElement>();
  const sz = Math.floor(Math.min(width, height));

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        aspectRatio: "1 / 1", // ←正方形をCSSで維持
        display: "grid",
        placeItems: "center",
      }}
    >
      {sz > 0 && (
        <ClockCanvas tz={props.tz} label={props.label} now={props.now} />
      )}
    </div>
  );
}
