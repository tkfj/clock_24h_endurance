"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { getZonedParts, getZoneLabel } from "@/lib/tz";

type Props = {
  tz: string;
  label?: string;
  now: Date;
  width?: number; // CSSピクセル
  height?: number; // CSSピクセル
};

export default function ClockCanvas({
  tz,
  label,
  now,
  width = 240,
  height = 240,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // DPRスケール
  useLayoutEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    cvs.style.width = `${width}px`;
    cvs.style.height = `${height}px`;
    cvs.width = Math.floor(width * dpr);
    cvs.height = Math.floor(height * dpr);
    const ctx = cvs.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // 以降の描画はCSSピクセル基準
  }, [width, height]);

  // 描画
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;

    // クリア
    ctx.clearRect(0, 0, width, height);

    // 文字時刻（まずは数字で見えることを確認）
    const { hour, minute, second } = getZonedParts(now, tz);
    const hh = hour % 12;
    const cx = width / 2,
      cy = height / 2;
    const r = Math.min(cx, cy) - 10;

    // 盤
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 目盛り（簡易）
    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 1; i <= 60; i++) {
      ctx.rotate((Math.PI * 2) / 60);
      ctx.beginPath();
      ctx.moveTo(r - (i % 5 === 0 ? 12 : 6), 0);
      ctx.lineTo(r, 0);
      ctx.strokeStyle = i % 5 === 0 ? "#666" : "#aaa";
      ctx.lineWidth = i % 5 === 0 ? 2 : 1;
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
      color: string
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle - Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(-8, 0);
      ctx.lineTo(length, 0);
      ctx.strokeStyle = color;
      ctx.lineWidth = lw;
      ctx.lineCap = "round";
      ctx.stroke();
      ctx.restore();
    };

    // 針
    drawHand(hourAngle, r * 0.55, 4, "#333");
    drawHand(minAngle, r * 0.8, 3, "#333");
    drawHand(secAngle, r * 0.9, 1, "#d33");

    // 中心点
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = "#333";
    ctx.fill();

    // === ラベル描画 ===
    ctx.font = "bold 14px system-ui, sans-serif";
    ctx.fillStyle = "#222";
    ctx.textAlign = "center";
    if (label) {
      ctx.fillText(label, width / 2, height - 28); // 場所名 (大きめ)
    }

    ctx.font = "12px system-ui, sans-serif";
    ctx.fillStyle = "#555";
    const zoneLabel = getZoneLabel(now, tz);
    ctx.fillText(zoneLabel, width / 2, height - 12); // CEST+0200 (小さめ)
  }, [now, tz, label, width, height]);

  return <canvas ref={canvasRef} />;
}
