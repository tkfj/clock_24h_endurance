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
};

function msToHMS(ms: number, isRemain: number) {
  if (!Number.isFinite(ms)) return "--------";
  const sign = isRemain ? (ms < 0 ? "+" : "-") : ms < 0 ? "-" : "+";
  if (ms < 0) ms = -ms;
  const totalSec = isRemain ? Math.ceil(ms / 1000) : Math.floor(ms / 1000);
  const micro = ms % 1000;
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const sep = isRemain ? (micro < 500 ? " " : ":") : micro < 500 ? ":" : " ";
  // 時は 24h超もそのまま伸びる（例: 25:03:07）
  if (isRemain && sign == "+") {
    if (sep == ":") {
      return "/# # # #.";
    } else {
      return "| # # # .";
    }
  }

  return `${sign}${String(h).padStart(2, "0")}${sep}${String(m).padStart(
    2,
    "0"
  )}${sep}${String(s).padStart(2, "0")}`;
}

export default function RaceClocks({ start, end, now }: Props) {
  const within = +now >= +start && +now <= +end;

  const elapsed = +now - +start;
  const remain = +end - +now;

  const mainText = `${msToHMS(elapsed, 0)}`;
  const subText = `${msToHMS(remain, 1)}`;

  const tail = elapsed > remain;
  const checker = tail && remain <= 0;

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
        className={checker ? "checker" : font_mono.className}
        style={{
          fontSize: "6.4vw",
          padding: "0 1vw",
          color: "#004465",
          textAlign: "center",
          alignSelf: "end",
        }}
      >
        {checker ? "" : tail ? subText : mainText}
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
        {tail ? mainText : subText}
      </div>
      <style jsx>{`
        .checker {
          height: 9.4vw;
          --cell: 16px;
          --dark: #111;
          --light: #eee;
          /* 市松模様 左上を黒にするために90度回転*/
          background: repeating-conic-gradient(
              from 90deg,
              var(--dark) 0 25%,
              var(--light) 0 50%
            )
            0 0 / calc(var(--cell) * 2) calc(var(--cell) * 2);
        }
      `}</style>
    </div>
  );
}
