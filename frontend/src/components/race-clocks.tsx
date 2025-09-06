type Props = {
  start: Date; // UTCの瞬間
  end: Date; // UTCの瞬間
  now: Date; // 親で集約した "now"
  // 表示の細かいオプションが欲しくなったらここに足す
};

function msToHMS(ms: number) {
  if (!Number.isFinite(ms) || ms < 0) return "-";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  // 時は 24h超もそのまま伸びる（例: 25:03:07）
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(
    s
  ).padStart(2, "0")}`;
}

export default function RaceClocks({ start, end, now }: Props) {
  const within = +now >= +start && +now <= +end;

  const elapsed = within ? +now - +start : NaN;
  const remain = within ? +end - +now : NaN;

  const mainText = within ? msToHMS(elapsed) : "-";
  const subText = within ? msToHMS(remain) : "-";

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
        alignItems: "center",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      >
        <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
          Main（経過）
        </div>
        <div style={{ fontSize: 28, fontWeight: 700 }}>{mainText}</div>
      </div>

      <div
        style={{
          padding: "12px 16px",
          border: "1px solid #ddd",
          borderRadius: 8,
        }}
      >
        <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>
          Sub（残り）
        </div>
        <div style={{ fontSize: 28, fontWeight: 700 }}>{subText}</div>
      </div>
    </div>
  );
}
