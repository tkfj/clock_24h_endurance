export type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

export function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    // 固定フォーマット向けに機械可読なロケール
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = fmt.formatToParts(date);
  const pick = (t: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === t)?.value);
  return {
    year: pick("year"),
    month: pick("month"),
    day: pick("day"),
    hour: pick("hour"),
    minute: pick("minute"),
    second: pick("second"),
  };
}

export function getOffsetMinutes(date: Date, tz: string): number {
  const s = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "shortOffset",
    hour12: false,
  }).format(date); // e.g. "GMT+2" / "GMT-3:30"
  const m = s.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
  if (!m) return 0;
  const sign = Math.sign(parseInt(m[1], 10));
  const hours = Math.abs(parseInt(m[1], 10));
  const mins = m[2] ? parseInt(m[2], 10) : 0;
  return sign * (hours * 60 + mins);
}

export function formatOffsetHHMM(mins: number): string {
  const sign = mins >= 0 ? "+" : "-";
  const abs = Math.abs(mins);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return `${sign}${hh}${mm}`;
}

export function getZoneAbbr(date: Date, tz: string): string | null {
  // 英語の long 名を頭字語に（例: "Central European Summer Time" → CEST）
  const long = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    timeZoneName: "long",
  })
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName")?.value;

  if (!long || /^GMT/.test(long)) return null;

  // 単語の頭文字（大文字）を抽出して連結
  const acronym = (long.match(/\b([A-Z])/g) || []).join("");
  return acronym || null;
}

export function getZoneLabel(date: Date, tz: string): string {
  const abbr = getZoneAbbr(date, tz); // 例: CEST / CET / JST / PDT
  const offset = formatOffsetHHMM(getOffsetMinutes(date, tz)); // 例: +0200
  return abbr ? `${abbr}${offset}` : `UTC${offset}`; // フォールバック
}

// 現地“今日”のキーを作る（依存に使う）
export function localDayKey(nowUTC: Date, tz: string): string {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(nowUTC);
  const get = (t: Intl.DateTimeFormatPartTypes) =>
    p.find((x) => x.type === t)!.value;
  return `${get("year")}-${get("month")}-${get("day")}@${tz}`;
}

// // キーから UTC 00:00 の Date を生成（計算用）
// export function keyToDayStartUTC(key: string): Date {
//   const [ymd] = key.split("@");
//   const [y, m, d] = ymd.split("-").map(Number);
//   return new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
// }
// ローカルタイム 00:00 の Date を生成（計算用）
export function getDayStartLocal(nowUTC: Date, tz: string): Date {
  const offsetMins = getOffsetMinutes(nowUTC, tz);
  return new Date(
    Date.UTC(
      nowUTC.getUTCFullYear(),
      nowUTC.getUTCMonth(),
      nowUTC.getUTCDate(),
      0,
      0,
      0
    ) -
      offsetMins * 60 * 1000
  );
}
