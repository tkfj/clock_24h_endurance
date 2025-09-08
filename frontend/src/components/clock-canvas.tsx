"use client";

import { useCallback, useEffect, useRef } from "react";
import { getZonedParts } from "@/lib/tz";
import { resizeCanvasToDisplaySize } from "@/lib/canvas";

type Props = {
  tz: string;
  label?: string;
  now: Date;
};

export default function ClockCanvas({ tz, label, now }: Props) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const render = useCallback(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    // 1) 見た目サイズに合わせて内部ビットマップを調整（拡大/縮小どちらも）
    const { cssW, cssH } = resizeCanvasToDisplaySize(cvs);

    // 2) クリア（CSSサイズでOK：座標はすでにDPR補正済み）
    const width = cssW;
    const height = cssH;
    ctx.clearRect(0, 0, cssW, cssH);

    const { hour, minute, second } = getZonedParts(now, tz);
    const hh = hour % 12;
    const cx = width / 2,
      cy = height / 2;
    const r = Math.min(cx, cy) - 10;

    const handhw = (r / 100) * 6 + 1;
    const handmw = (r / 100) * 4 + 1;
    const handsw = (r / 100) * 2 + 1;
    const mem0l = (r / 100) * 15 + 1;
    const mem5l = (r / 100) * 8 + 1;
    const mem1l = (r / 100) * 5 + 1;
    const mem0w = (r / 100) * 6 + 1;
    const mem5w = (r / 100) * 5 + 1;
    const mem1w = (r / 100) * 1.5 + 1;

    // 盤
    // ctx.beginPath();
    // ctx.arc(cx, cy, r, 0, Math.PI * 2);
    // ctx.strokeStyle = "#004465";
    // ctx.lineWidth = 2;
    // ctx.stroke();

    // 目盛り（簡易）
    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 1; i <= 60; i++) {
      ctx.rotate((Math.PI * 2) / 60);
      ctx.beginPath();
      ctx.moveTo(r - (i === 45 ? mem0l : i % 5 === 0 ? mem5l : mem1l), 0);
      ctx.lineTo(r, 0);
      ctx.strokeStyle = "#004465";
      ctx.lineWidth = i === 45 ? mem0w : i % 5 === 0 ? mem5w : mem1w;
      ctx.stroke();
    }
    ctx.restore();

    // 針角度
    const hourAngle = ((hh + minute / 60) / 12) * Math.PI * 2;
    const minAngle = ((minute + second / 60) / 60) * Math.PI * 2;
    const secAngle = (second / 60) * Math.PI * 2;

    // 針描画関数
    const drawHand = (
      angle: number,
      length: number,
      lw: number,
      color: string,
      centersize = 0
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle - Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(-length / 10, 0);
      ctx.lineTo(length, 0);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = lw + 1;
      ctx.lineCap = "round";
      ctx.stroke();
      if (centersize > 0) {
        ctx.fillStyle = "#ffffff";
        ctx.lineWidth = 0;
        ctx.beginPath();
        ctx.arc(0, 0, centersize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.moveTo(-length / 10, 0);
      ctx.lineTo(length, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.lineCap = "round";
      ctx.stroke();
      if (centersize > 0) {
        ctx.fillStyle = color;
        ctx.lineWidth = 0;
        ctx.beginPath();
        ctx.arc(0, 0, centersize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    // 針
    drawHand(hourAngle, r * 0.55, handhw, "#004465");
    drawHand(minAngle, r * 0.92, handmw, "#004465");
    drawHand(secAngle, r * 0.9, handsw, "#c5003f", handsw * 2);

    // 中心点
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#c5003f";
    ctx.fill();

    // // === ラベル描画 ===
    // ctx.font = "bold 14px system-ui, sans-serif";
    // ctx.fillStyle = "#888";
    // ctx.textAlign = "center";
    // if (label) {
    //   ctx.fillText(label, width / 2, height - 28); // 場所名 (大きめ)
    // }

    // ctx.font = "12px system-ui, sans-serif";
    // ctx.fillStyle = "#888";
    // const zoneLabel = getZoneLabel(now, tz);
    // ctx.fillText(zoneLabel, width / 2, height - 12); // CEST+0200 (小さめ)
  }, [now, tz, label]);

  useEffect(() => {
    const cvs = ref.current;
    if (!cvs) return;
    const ro = new ResizeObserver(() => render());
    ro.observe(cvs);
    // 初回も描画
    render();
    return () => ro.disconnect();
  }, [render]);

  // 時間やデータが変わったら再描画
  useEffect(() => {
    render();
  }, [render]);

  return (
    <canvas
      ref={ref}
      style={{
        display: "block",
        width: "100%", //  見た目は常に親幅にフィット
        height: "100%", //  高さも親に従う（親が正方形を担保）
      }}
    />
  );
}
