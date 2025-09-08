"use client";

import { resizeCanvasToDisplaySize } from "@/lib/canvas";
import { SolarEvent, StateKind } from "@/lib/solar";
import { useCallback, useEffect, useRef } from "react";
import { useThemeColors } from "@/hooks/use-theme-colors";

type Props = {
  start: Date; // 期間開始(UTC)
  end: Date; // 期間終了(UTC)
  now: Date; // 親から供給（1秒更新など）
  solarEvents: SolarEvent[];
  solarInitialState: StateKind | null;
};

export default function ProgressBar({
  start,
  end,
  now,
  solarEvents,
  solarInitialState,
}: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const { fg, bg, ac } = useThemeColors();

  const render = useCallback(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    const { cssW, cssH } = resizeCanvasToDisplaySize(cvs);
    const width = cssW;
    const height = cssH;
    ctx.clearRect(0, 0, width, height);

    // ---- 基本値
    const W = width,
      H = (height * 2) / 3;
    const h0 = height / 3;
    const pad = 1; // 内側余白（必要なら調整）
    const barX = pad,
      barY = pad,
      barW = W - pad * 2,
      barH = H - pad * 2;

    const total = +end - +start;
    const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
    const ratio_raw = (+now - +start) / total;
    const ratio = clamp01(ratio_raw);

    // ---- 背景
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = bg;
    ctx.fillRect(barX, barY + h0, barW, barH);

    // ---- 帯（day/night/dawn/dusk）
    const colorFor = (k: StateKind | null) =>
      k === "day"
        ? "rgb(255, 223, 0)"
        : k === "twilight_civil"
        ? "rgb(240, 80, 28)"
        : k === "twilight_naut"
        ? "rgb(192, 0, 128)"
        : k === "twilight_astro"
        ? "rgb(83, 38, 116)"
        : "rgb(54, 38, 112)";

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
      ctx.fillStyle = colorFor(s.kind);
      ctx.fillRect(x, barY + h0, w, barH);
    });

    // ---- 現在位置マーカー 一旦範囲外は描画しない(TODO 呼び元で制御)
    if (ratio === ratio_raw) {
      const x = barX + barW * ratio;
      ctx.save();
      ctx.lineWidth = 2;
      ctx.strokeStyle = ac;
      ctx.fillStyle = ac;
      ctx.shadowColor = bg;
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 5;
      ctx.beginPath();
      ctx.moveTo(x, barY + barH);
      ctx.lineTo(x - barH / 2.2, barY);
      ctx.lineTo(x + barH / 2.2, barY);
      ctx.lineTo(x, barY + barH);
      ctx.fill();
      ctx.restore();
    }
  }, [start, end, now, solarEvents, solarInitialState]);

  useEffect(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const ro = new ResizeObserver(() => render());
    ro.observe(cvs);
    // 初回も描画
    render();
    return () => ro.disconnect();
  }, [render]);
  useEffect(() => {
    render();
  }, [render]);

  return (
    <canvas
      ref={ref}
      style={{
        display: "block",
        width: "100%", // 見た目は常に親幅にフィット
        height: "100%", // 高さも親に従う（親が正方形を担保）
      }}
    />
  );
}
