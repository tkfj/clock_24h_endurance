export type ProgressResult = {
  ratio: number; // 0..1にクランプしない“生”の比率
  clamped: number; // 0..1にクランプした値
  elapsedMs: number;
  totalMs: number;
  remainingMs: number;
};

export function computeProgress(
  start: Date,
  end: Date,
  now: Date
): ProgressResult {
  const total = +end - +start;
  const elapsed = +now - +start;
  const ratio = total > 0 ? elapsed / total : NaN;
  const clamped = Number.isFinite(ratio)
    ? Math.max(0, Math.min(1, ratio))
    : NaN;
  return {
    ratio,
    clamped,
    elapsedMs: elapsed,
    totalMs: total,
    remainingMs: total - elapsed,
  };
}

// 表示用のパーセンテージ（小数1桁など）
export function formatPercent(x: number, digits = 1): string {
  if (!Number.isFinite(x)) return "- %";
  return (x * 100).toFixed(digits) + "%";
}
