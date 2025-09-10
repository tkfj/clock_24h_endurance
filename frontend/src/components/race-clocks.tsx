import { useThemeColors } from "@/hooks/use-theme-colors";
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
  logoImageFile: string;
  logoForegroundColor: string;
  logoBackgroundColor: string;
};

function msToHMS(ms: number, isRemain: number) {
  if (!Number.isFinite(ms)) return "--------";
  const sign = isRemain ? (ms < 0 ? "+" : "-") : ms < 0 ? "-" : "+";
  if (ms < 0) ms = -ms;
  const totalSec = isRemain
    ? Math.ceil(ms / 1000)
    : sign === "+"
    ? Math.floor(ms / 1000)
    : Math.ceil(ms / 1000);
  const micro = ms % 1000;
  const hh = Math.floor(totalSec / 3600);
  const h = hh >= 24 ? hh % 24 : hh;
  const d = hh >= 24 ? Math.floor(hh / 24) : 0;
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const sep = sign == "-" ? (micro < 500 ? " " : ":") : micro < 500 ? ":" : " ";

  return `${sign}${d > 0 ? String(d) + "d" : ""}${String(h).padStart(
    2,
    "0"
  )}${sep}${String(m).padStart(2, "0")}${sep}${String(s).padStart(2, "0")}`;
}

export default function RaceClocks({ start, end, now, logoImageFile, logoForegroundColor, logoBackgroundColor }: Props) {
  const { edColor, darkColor, lightColor } = useThemeColors();
  const within = +now >= +start && +now <= +end;

  const elapsed = +now - +start;
  const remain = +end - +now;

  const mainText = remain >= 0 ? `${msToHMS(elapsed, 0)}` : "";
  const subText = elapsed >= 0 ? `${msToHMS(remain, 1)}` : "";

  const tail = elapsed > remain;
  const checker = tail && remain <= 0;

  return (
    <div
      style={{
        display: "grid",
        height: "9.2vw",
        gridTemplateColumns: "2fr 3fr 2fr",
        gap: 0,
        alignItems: "center",
      }}
    >
      <div
        style={{
          height: "9.2vw",
          margin: 0,
          padding: 0,
          alignSelf: "end",
        }}
      >
        <Image
          src={logoImageFile}
          alt="logo"
          width={480}
          height={480}
          style={{
            width: "auto",
            height: "100%",
            border: `1px solid ${edColor}`,
            backgroundColor:logoBackgroundColor,
            color:logoForegroundColor,
            fill:logoForegroundColor,
          }}
        />
      </div>
      <div
        className={checker ? "checker" : font_mono.className}
        style={{
          fontSize: elapsed > -24 * 60 * 60 * 1000 + 1000 ? "6.4vw" : "4.4vw",
          padding: "0 1vw",
          textAlign: "center",
          alignSelf: "end",
        }}
      >
        {checker ? "" : tail ? subText : mainText}
      </div>
      <div
        className={font_mono.className}
        style={{
          fontSize: "3.6vw",
          padding: "0 1vw",
          textAlign: "right",
          alignSelf: "end",
        }}
      >
        {tail ? mainText : subText}
      </div>
      <style jsx>{`
        .checker {
          height: 9.2vw;
          --cell: 2.3vw;
          --dark: ${darkColor};
          --light: ${lightColor};
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
