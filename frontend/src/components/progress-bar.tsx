// src/components/ProgressBarCanvas.tsx
"use client";
import { SolarEvent, StateKind } from "@/lib/solar";
import { useEffect, useLayoutEffect, useRef } from "react";

type Seg = { from: number; to: number; kind: StateKind };

type Props = {
  start: Date; // 期間開始(UTC)
  end: Date; // 期間終了(UTC)
  now: Date; // 親から供給（1秒更新など）
  solarEvents: SolarEvent[];
  solarInitialState: string;
  width?: number; // CSS px
  height?: number; // CSS px（バー太さ）
};

export default function ProgressBar({
  start,
  end,
  now,
  solarEvents,
  solarInitialState,
  width = 600,
  height = 18,
}: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  // DPRスケール
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    el.width = Math.floor(width * dpr);
    el.height = Math.floor(height * dpr);
    const ctx = el.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }, [width, height]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    // ---- 基本値
    const W = width,
      H = height;
    const R = Math.min(8, H / 2); // 角の丸み
    const pad = 0; // 内側余白（必要なら調整）
    const barX = pad,
      barY = pad,
      barW = W - pad * 2,
      barH = H - pad * 2;

    const total = +end - +start;
    const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
    const ratio = clamp01((+now - +start) / total);

    // ---- 背景（薄いグレーの丸角バー）
    ctx.clearRect(0, 0, W, H);
    roundedRect(ctx, barX, barY, barW, barH, R);
    ctx.fillStyle = "#e5e5e5";
    ctx.fill();

    // ---- 帯（day/night/dawn/dusk）
    const colorFor = (k: StateKind | null) =>
      k === "day"
        ? "rgba(255, 210, 60, 0.45)"
        : k === "dawn"
        ? "rgba(255, 160, 60, 0.35)"
        : k === "dusk"
        ? "rgba(255, 140, 80, 0.35)"
        : "rgba(30, 60, 120, 0.35)";

    const points = [start, ...solarEvents.map((x) => x.whenUTC), end];
    const states = [solarInitialState, ...solarEvents.map((x) => x.state)];
    const segments = [];
    for (let i = 0; i < points.length - 1; i++) {
      segments.push({
        from: (+points[i] - +start) / total,
        to: (+points[i + 1] - +start) / total,
        kind: states[i],
      });
    }
    segments.forEach((s) => {
      const f = clamp01(s.from),
        t = clamp01(s.to);
      if (t <= f) return;
      const x = barX + barW * f;
      const w = barW * (t - f);
      roundedRectPart(ctx, x, barY, w, barH, R, f === 0, t === 1);
      ctx.fillStyle = colorFor(s.kind);
      ctx.fill();
    });

    // ---- 進捗フィル（黒の薄め）
    {
      const x = barX;
      const w = barW * ratio;
      roundedRectPart(ctx, x, barY, w, barH, R, true, ratio >= 1 - 1e-9);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fill();
    }

    // ---- 現在位置マーカー
    const x = barX + barW * ratio;
    ctx.beginPath();
    ctx.moveTo(x, barY - 3);
    ctx.lineTo(x, barY + barH + 3);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#222";
    ctx.stroke();

    // ---- % 表示（右上あたり）
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillStyle = "#333";
    ctx.textAlign = "right";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(`${(ratio * 100).toFixed(1)}%`, W - 2, H - 4);

    console.log("start", start);
    console.log("end", end);
    console.log("now", now);
    console.log("ratio", ratio);
  }, [start, end, now, width, height, solarEvents, solarInitialState]);

  return <canvas ref={ref} />;
}

/* ---- ユーティリティ ---- */
function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

// 部分矩形（左端/右端だけ丸め）
function roundedRectPart(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  roundLeft: boolean,
  roundRight: boolean
) {
  const rr = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  if (roundLeft) {
    ctx.moveTo(x + rr, y);
  } else {
    ctx.moveTo(x, y);
  }
  if (roundRight) {
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
  } else {
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
  }
  if (roundLeft) {
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
  } else {
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
}

// import { Andada_Pro } from "next/font/google";

// import { SolarEvent } from "@/lib/solar";
// // src/components/ProgressBar.tsx
// type Props = {
//   start: Date; // UTC 瞬間
//   end: Date; // UTC 瞬間
//   now: Date; // 親の "now" を流す
//   solarEvents: SolarEvent[];
//   solarInitialState: string;
// };

// export default function ProgressBar({
//   start,
//   end,
//   now,
//   solarEvents,
//   solarInitialState,
// }: Props) {
//   console.log("start", start);
//   console.log("end", end);
//   console.log("now", now);
//   console.log("----");
//   const total = +end - +start;
//   const clamp = (x: number) => Math.max(0, Math.min(1, x));
//   const ratio = clamp((+now - +start) / total);

//   // セグメント（day/night）を作る
//   const points = [start, ...solarEvents.map((x) => x.whenUTC), end];
//   const states = [solarInitialState, ...solarEvents.map((x) => x.state)];
//   const segs = [];
//   for (let i = 0; i < points.length - 1; i++) {
//     segs.push({
//       from: (+points[i] - +start) / total,
//       to: (+points[i + 1] - +start) / total,
//       kind: states[i],
//     });
//   }

//   // ざっくりCSS（機能優先）
//   return (
//     <div style={{ display: "grid", gap: 8 }}>
//       {/*
//       <div style={{ fontVariantNumeric: "tabular-nums" }}>
//         progress: {(ratio * 100).toFixed(1)}%
//       </div>
//       */}

//       <div
//         style={{
//           position: "relative",
//           height: 16,
//           borderRadius: 8,
//           overflow: "hidden",
//           background: "#ddd",
//         }}
//       >
//         {/* 背景帯：day/night を横に並べる */}
//         {segs.map((s, i) => (
//           <div
//             key={i}
//             title={`${s.kind} ${Math.round((s.to - s.from) * 100)}%`}
//             style={{
//               position: "absolute",
//               left: `${s.from * 100}%`,
//               width: `${(s.to - s.from) * 100}%`,
//               top: 0,
//               bottom: 0,
//               background:
//                 s.kind === "day"
//                   ? "rgba(255, 215, 0, 0.35)"
//                   : "rgba(30, 60, 120, 0.35)",
//             }}
//           />
//         ))}

//         {/* フィル（進捗） */}
//         <div
//           style={{
//             position: "absolute",
//             left: 0,
//             top: 0,
//             bottom: 0,
//             width: `${ratio * 100}%`,
//             background: "rgba(0,0,0,0.25)",
//           }}
//         />

//         {/* マーカー（現在位置） */}
//         <div
//           style={{
//             position: "absolute",
//             top: -4,
//             bottom: -4,
//             left: `calc(${ratio * 100}% - 1px)`,
//             width: 2,
//             background: "#222",
//           }}
//         />
//       </div>
//       {/*
//       <small>
//         {raceTz} / sunrise {sunriseHHMM} – sunset {sunsetHHMM}
//       </small>
//       */}
//     </div>
//   );
// }
