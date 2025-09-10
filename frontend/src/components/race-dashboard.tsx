"use client";

import { useEffect, useState } from "react";
import ClockPanel from "@/components/clock-panel";
import RaceClocks from "@/components/race-clocks";
import ProgressBarHost from "./progress-host";
import { solarEventsInRangeWithPrev } from "@/lib/solar";
import { loadSettings } from "@/lib/settings";

export default function RaceDashboard() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 50);
    return () => clearInterval(id);
  }, []);

  const settings = loadSettings();
  const clocks = [settings.race.point, settings.otherPlace];

  const raceSolarEvents = solarEventsInRangeWithPrev(
    settings.race.start,
    settings.race.end,
    settings.race.point.lat,
    settings.race.point.lon
  );

  return (
    <div className="wrap">
      {/* 上：文字のレース時計 */}
      <section className="top">
        <RaceClocks start={settings.race.start} end={settings.race.end} now={now} logoImageFile={settings.logoImageFile} logoForegroundColor={settings.logoForegroundColor} logoBackgroundColor={settings.logoBackgroundColor} />
      </section>

      {/* 中：横幅いっぱいの進捗バー */}
      <section className="bar">
        <ProgressBarHost
          start={settings.race.start}
          end={settings.race.end}
          now={now}
          solarEvents={raceSolarEvents.events}
          solarInitialState={raceSolarEvents.initialState}
        />
      </section>

      {/* 下：アナログ時計（縦長 9:16 未満なら縦並び、それ以外は横並び） */}
      <section className="clocks">
        {clocks.map((c) => {
          return (
            <>
              <ClockPanel point={c} now={now} />
            </>
          );
        })}
      </section>
      <style jsx>{`
        :root {
          --clock-edge: 50vw; /* デフォルトは中間レンジ想定で 1/2 幅 */
        }

        .wrap {
          padding: clamp(8px, 2vw, 20px);
          display: grid;
          gap: clamp(4px, 1vw, 10px);
        }

        .clocks {
          display: grid;
          gap: clamp(10px, 2vw, 16px);
          grid-template-columns: repeat(2, 1fr); /* 既定：横並び */
          align-items: start;
          justify-items: center; /* パネル中央寄せ（余白が気になる場合） */
        }

        /* 縦長：< 9:16 */
        @media (max-aspect-ratio: 9/16) {
          :root {
            --clock-edge: 100vw;
          } /* 画面幅いっぱい */
          .clocks {
            grid-template-columns: 1fr;
          } /* 縦並び */
        }

        /* 中間：9:16 ～ 1:1（既定のまま）
     :root --clock-edge は 50vw のまま、2カラム */

        /* 横長：> 1:1 */
        @media (min-aspect-ratio: 1/1) {
          :root {
            --clock-edge: 50vh;
          } /* 画面高さの 1/2 を基準に */
          .clocks {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
