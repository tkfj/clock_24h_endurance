"use client";

import {
  RACES,
  SETTINGS_INTERNAL_DEFAULT,
  SettingsInternal,
} from "@/lib/settings";
import { Londrina_Outline } from "next/font/google";
import { useEffect, useMemo, useState } from "react";

const LS_KEY = "24hclock.settings.v1";

export default function SettingsForm() {
  const zones = useMemo(() => {
    try {
      return (Intl as any).supportedValuesOf?.("timeZone") ?? [];
    } catch {
      return [];
    }
  }, []);

  const [s, setS] = useState<SettingsInternal>(SETTINGS_INTERNAL_DEFAULT);
  const [saved, setSaved] = useState<null | "ok" | "err">(null);

  // load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setS({ ...s, ...JSON.parse(raw) });
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // save (debounced-ish)
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(s));
        setSaved("ok");
      } catch {
        setSaved("err");
      }
    }, 200);
    return () => clearTimeout(id);
  }, [s]);

  const onGeo = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setS((v) => ({
          ...v,
          lat: +pos.coords.latitude.toFixed(6),
          lon: +pos.coords.longitude.toFixed(6),
        }));
      },
      () => {}
    );
  };

  const update = <K extends keyof SettingsInternal>(
    k: K,
    v: SettingsInternal[K]
  ) => setS((prev) => ({ ...prev, [k]: v }));

  // ざっくりバリデーション（必須 & 範囲）
  const latOk = typeof s.lat === "number" && s.lat >= -90 && s.lat <= 90;
  const lonOk = typeof s.lon === "number" && s.lon >= -180 && s.lon <= 180;

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      style={{ display: "grid", gap: 16 }}
    >
      {/* Race */}
      <label style={{ display: "grid", gap: 8 }}>
        <span>対象レース</span>
        <select
          value={s.raceId}
          onChange={(e) => update("raceId", e.target.value)}
        >
          {RACES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </label>

      {/* Timezone */}
      <label style={{ display: "grid", gap: 8 }}>
        <span>観戦地タイムゾーン（IANA）</span>
        <input
          list="tz-list"
          value={s.tz}
          onChange={(e) => update("tz", e.target.value)}
          placeholder="例: Europe/Paris"
        />
        <datalist id="tz-list">
          {zones.slice(0, 500).map((z) => (
            <option key={z} value={z} />
          ))}
        </datalist>
        <small>候補に無い場合は IANA 文字列を直接入力</small>
      </label>

      {/* Place (観戦地名) */}
      <label style={{ display: "grid", gap: 8 }}>
        <span>観戦地の名称</span>
        <input
          type="text"
          placeholder="例: Tokyo, 新宿, 自宅"
          value={s.place}
          onChange={(e) => update("place", e.target.value)}
        />
      </label>

      {/* Location */}
      <div style={{ display: "grid", gap: 8 }}>
        <span>位置情報（緯度・経度）</span>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr auto",
            gap: 8,
          }}
        >
          <input
            type="number"
            step="0.000001"
            placeholder="lat"
            value={s.lat}
            onChange={(e) =>
              update("lat", e.target.value === "" ? 0 : Number(e.target.value))
            }
          />
          <input
            type="number"
            step="0.000001"
            placeholder="lon"
            value={s.lon}
            onChange={(e) =>
              update("lon", e.target.value === "" ? 0 : Number(e.target.value))
            }
          />
          <button type="button" onClick={onGeo}>
            現在地
          </button>
        </div>
        {!latOk && <small style={{ color: "crimson" }}>緯度は -90〜90</small>}
        {!lonOk && <small style={{ color: "crimson" }}>経度は -180〜180</small>}
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span
          style={{
            color:
              saved === "ok" ? "green" : saved === "err" ? "crimson" : "gray",
          }}
        >
          {saved === "ok"
            ? "保存しました（ブラウザ）"
            : saved === "err"
            ? "保存に失敗"
            : "自動保存"}
        </span>
        <a href="/" style={{ marginLeft: "auto" }}>
          ← 戻る
        </a>
      </div>
    </form>
  );
}
