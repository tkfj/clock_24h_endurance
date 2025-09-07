import { Courier_Prime } from "next/font/google";
import Image from "next/image";

// 等幅フォント（コード用など）
const font_mono = Courier_Prime({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

type Props = {
  start: Date; // UTCの瞬間
  end: Date; // UTCの瞬間
  now: Date; // 親で集約した "now"
  // 表示の細かいオプションが欲しくなったらここに足す
};

function msToHMS(ms: number, isRemain: number) {
  if (!Number.isFinite(ms) || ms < 0) return "--------";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const micro = ms - totalSec * 1000;
  const sep = isRemain ? (micro < 500 ? " " : ":") : micro < 500 ? ":" : " ";
  // 時は 24h超もそのまま伸びる（例: 25:03:07）
  return `${String(h).padStart(2, "0")}${sep}${String(m).padStart(
    2,
    "0"
  )}${sep}${String(s).padStart(2, "0")}`;
}

export default function RaceClocks({ start, end, now }: Props) {
  const within = +now >= +start && +now <= +end;

  const elapsed = +now - +start;
  const remain = within ? +end - +now : NaN;

  const mainText = `+${msToHMS(elapsed, 0)}`;
  const subText = within ? `-${msToHMS(remain, 1)}` : "--------";

  const tail = within ? (elapsed > remain ? 0 : 1) : 0;

  return (
    <div
      style={{
        display: "grid",
        height: "9.4vw",
        gridTemplateColumns: "2fr 3fr 2fr",
        gap: 0,
        alignItems: "center",
      }}
    >
      <div
        style={{
          height: "9.4vw",
          margin: 0,
          padding: 0,
          alignSelf: "end",
        }}
      >
        <Image
          src="/24h_lemans.png"
          alt="logo"
          width={480}
          height={480}
          style={{ width: "auto", height: "100%" }}
        />
      </div>

      <div
        className={font_mono.className}
        style={{
          fontSize: "6.4vw",
          padding: "0 1vw",
          color: "#004465",
          textAlign: "center",
          alignSelf: "end",
        }}
      >
        {tail === 0 ? subText : mainText}
      </div>
      <div
        className={font_mono.className}
        style={{
          // height: "9.4vw",
          fontSize: "3.6vw",
          padding: "0 1vw",
          color: "#004465",
          textAlign: "right",
          alignSelf: "end",
        }}
      >
        {tail === 0 ? mainText : subText}
      </div>
    </div>
  );
}
