// src/lib/solar-range.ts
// 既存のNOAA近似ロジックを汎用化：高度閾値を指定できるように
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

function julianDay(dateUTC00: Date): number {
  const y = dateUTC00.getUTCFullYear();
  const m = dateUTC00.getUTCMonth() + 1;
  const d = dateUTC00.getUTCDate();
  // 00:00 UTC 前提でOK（丸め誤差を避ける）
  const A = Math.floor((14 - m) / 12);
  const Y = y + 4800 - A;
  const M = m + 12 * A - 3;
  return (
    Math.floor((153 * M + 2) / 5) +
    d +
    365 * Y +
    Math.floor(Y / 4) -
    Math.floor(Y / 100) +
    Math.floor(Y / 400) -
    32045
  );
}
const julianCentury = (JD: number) => (JD - 2451545.0) / 36525.0;
const geomMeanLongSun = (T: number) =>
  (((280.46646 + T * (36000.76983 + 0.0003032 * T)) % 360) + 360) % 360;
const geomMeanAnomalySun = (T: number) =>
  357.52911 + T * (35999.05029 - 0.0001537 * T);
const eccEarthOrbit = (T: number) =>
  0.016708634 - T * (0.000042037 + 0.0000001267 * T);
const meanObliqEcliptic = (T: number) =>
  23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
const sunEqOfCenter = (T: number, M: number) =>
  Math.sin(rad(M)) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
  Math.sin(rad(2 * M)) * (0.019993 - 0.000101 * T) +
  Math.sin(rad(3 * M)) * 0.000289;
const sunTrueLong = (L0: number, C: number) => L0 + C;
const sunAppLong = (T: number, trueLong: number) => {
  const omega = 125.04 - 1934.136 * T;
  return trueLong - 0.00569 - 0.00478 * Math.sin(rad(omega));
};
const obliqCorr = (T: number, e0: number) => {
  const omega = 125.04 - 1934.136 * T;
  return e0 + 0.00256 * Math.cos(rad(omega));
};
function sunDeclination(T: number): number {
  const L0 = geomMeanLongSun(T);
  const M = geomMeanAnomalySun(T);
  const C = sunEqOfCenter(T, M);
  const trueLong = sunTrueLong(L0, C);
  const lambda = sunAppLong(T, trueLong);
  const e = obliqCorr(T, meanObliqEcliptic(T));
  return deg(Math.asin(Math.sin(rad(e)) * Math.sin(rad(lambda))));
}
function equationOfTimeMin(T: number): number {
  const L0 = geomMeanLongSun(T);
  const M = geomMeanAnomalySun(T);
  const e = eccEarthOrbit(T);
  const y = Math.tan(rad(meanObliqEcliptic(T) / 2));
  const y2 = y * y;
  const E =
    y2 * Math.sin(2 * rad(L0)) -
    2 * e * Math.sin(rad(M)) +
    4 * e * y2 * Math.sin(rad(M)) * Math.cos(2 * rad(L0)) -
    0.5 * y2 * y2 * Math.sin(4 * rad(L0)) -
    1.25 * e * e * Math.sin(2 * rad(M));
  return deg(E) * 4; // minutes
}

const dayStartUTC = (d: Date) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
const addDaysUTC = (d: Date, n: number) =>
  new Date(d.getTime() + n * 86400_000);

export type SolarEventKind =
  | "sunrise"
  | "sunset"
  // 将来拡張（薄明など）
  | "civilBegin"
  | "civilEnd"
  | "nauticalBegin"
  | "nauticalEnd"
  | "astroBegin"
  | "astroEnd";

export interface SolarEvent {
  kind: SolarEventKind;
  whenUTC: Date; // UTCの瞬間
  altitudeDeg: number; // 閾値（例: -0.833, -6, -12, -18）
}

type RiseSetResult =
  | { status: "ok"; riseUTC: Date; setUTC: Date }
  | { status: "sunNeverRises" | "sunNeverSets" | "noEvent" };

/** 指定日の「高度=altDeg」での昇没をUTCで求める（近似）。lonは東経+ 西経− */
export function riseSetAtAltitude(
  dayUTC00: Date,
  lat: number,
  lon: number,
  altDeg: number
): RiseSetResult {
  const JD = julianDay(dayUTC00);
  const T = julianCentury(JD);
  const decl = sunDeclination(T);
  const eqMin = equationOfTimeMin(T);

  const latR = rad(lat);
  const decR = rad(decl);
  const h0 = rad(altDeg);

  const cosH =
    (Math.sin(h0) - Math.sin(latR) * Math.sin(decR)) /
    (Math.cos(latR) * Math.cos(decR));
  if (cosH < -1) return { status: "sunNeverSets" }; // 終日太陽あり（その高度を下回らない）
  if (cosH > 1) return { status: "sunNeverRises" }; // 終日太陽なし（その高度に達しない）

  const H = deg(Math.acos(cosH)); // 度
  const solarNoonMinUTC = 720 - 4 * lon - eqMin; // NOAA式
  const riseMinUTC = solarNoonMinUTC - 4 * H;
  const setMinUTC = solarNoonMinUTC + 4 * H;

  const riseUTC = new Date(
    dayUTC00.getTime() + Math.round(riseMinUTC) * 60_000
  );
  const setUTC = new Date(dayUTC00.getTime() + Math.round(setMinUTC) * 60_000);
  return { status: "ok", riseUTC, setUTC };
}

/** 期間[fromUTC,toUTC]にある全イベントを発生順で返す（日の出/日の入り） */
export function solarEventsInRange(
  fromUTC: Date,
  toUTC: Date,
  lat: number,
  lon: number,
  opts?: { includeTwilight?: boolean } // 将来拡張フラグ
): SolarEvent[] {
  if (!(+toUTC >= +fromUTC)) return [];

  // バッファ：FROM前日〜TO翌日までを走査（境界に掛かるイベントも拾う）
  const startDay = dayStartUTC(addDaysUTC(fromUTC, -1));
  const endDay = dayStartUTC(addDaysUTC(toUTC, +1));

  const out: SolarEvent[] = [];
  for (let day = startDay; +day <= +endDay; day = addDaysUTC(day, 1)) {
    // 日の出/入り（太陽中心高度 -0.833°）
    const rs = riseSetAtAltitude(day, lat, lon, -0.833);
    if (rs.status === "ok") {
      out.push({
        kind: "sunrise",
        state: "day",
        whenUTC: rs.riseUTC,
        altitudeDeg: -0.833,
      });
      out.push({
        kind: "sunset",
        state: "night",
        whenUTC: rs.setUTC,
        altitudeDeg: -0.833,
      });
    }
    // 将来：薄明（civil −6°, nautical −12°, astro −18°）
    // if (opts?.includeTwilight) { ...同様に push（kindを civilBegin/civilEnd 等で） }
  }

  // ソート→範囲に絞り込み（同時刻同値の重複はunique化）
  out.sort((a, b) => +a.whenUTC - +b.whenUTC);
  const filtered: SolarEvent[] = [];
  let prevKey = "";
  for (const e of out) {
    const inRange = +e.whenUTC >= +fromUTC && +e.whenUTC <= +toUTC;
    if (!inRange) continue;
    const key = `${e.kind}@${e.whenUTC.toISOString()}`;
    if (key !== prevKey) filtered.push(e), (prevKey = key);
  }
  return filtered;
}

export type PolarStatus = "sunNeverRises" | "sunNeverSets" | "ok";

export interface SolarEvent {
  kind: SolarEventKind;
  state: StateKind;
  whenUTC: Date;
  altitudeDeg: number; // -0.833
}

export interface SolarRangeResult {
  events: SolarEvent[]; // 範囲内
  prevEvent: SolarEvent | null; // 直前（範囲外でも可）
  initialState: StateKind | null;
}

/** [fromUTC, toUTC] の全SR/SS＋from直前イベントと状態を返す */
export function solarEventsInRangeWithPrev(
  fromUTC: Date,
  toUTC: Date,
  lat: number,
  lon: number,
  opts?: {
    searchBackDays?: number; // 直前イベント探索の最大日数（既定 2）
    searchFwdDays?: number; // 将来の拡張用（未使用でもOK、既定 2）
  }
): SolarRangeResult {
  if (!(+toUTC >= +fromUTC)) {
    return { events: [], prevEvent: null, initialState: null };
  }

  const ALT = -0.833;
  const back = Math.max(1, opts?.searchBackDays ?? 14);
  const fwd = Math.max(1, opts?.searchFwdDays ?? 2);

  // 走査範囲：FROMの前日〜TOの翌日（範囲内抽出用）
  const scanStart = dayStartUTC(addDaysUTC(fromUTC, -1));
  const scanEnd = dayStartUTC(addDaysUTC(toUTC, +1));

  // 直前イベント探索のため、FROMの前方に余分にさかのぼる
  const prevScanStart = dayStartUTC(addDaysUTC(fromUTC, -back));

  const all: SolarEvent[] = [];

  // 直前探索を含めた広い範囲をまず収集
  for (let day = prevScanStart; +day <= +scanEnd; day = addDaysUTC(day, 1)) {
    const rs = riseSetAtAltitude(day, lat, lon, ALT);
    if (rs.status === "ok") {
      all.push({
        kind: "sunrise",
        state: "day",
        whenUTC: rs.riseUTC,
        altitudeDeg: ALT,
      });
      all.push({
        kind: "sunset",
        state: "night",
        whenUTC: rs.setUTC,
        altitudeDeg: ALT,
      });
    }
    // sunNeverRises/ sunNeverSets の日はイベントが発生しないため、
    // ここでは追加の擬似イベントは入れません（初期状態で扱う）
  }

  // 時刻順に
  all.sort((a, b) => +a.whenUTC - +b.whenUTC);

  // fromUTC直前の最後のイベント
  const prevEvent = (() => {
    let idx = -1;
    for (let i = 0; i < all.length; i++) {
      if (+all[i].whenUTC < +fromUTC) idx = i;
      else break;
    }
    return idx >= 0 ? all[idx] : null;
  })();

  // 範囲内のイベント（重複排除のおまけ）
  const events: SolarEvent[] = [];
  let lastKey = "";
  for (const e of all) {
    if (+e.whenUTC < +scanStart) continue; // 直前探索ぶんの先頭はスキップ
    if (+e.whenUTC > +scanEnd) break;
    if (+e.whenUTC < +fromUTC || +e.whenUTC > +toUTC) continue;
    const key = `${e.kind}@${e.whenUTC.toISOString()}`;
    if (key !== lastKey) events.push(e), (lastKey = key);
  }

  // 初期状態（fromUTC時点が「昼/夜」か、白夜/極夜か）
  const fromDay = dayStartUTC(fromUTC);
  const rsFrom = riseSetAtAltitude(fromDay, lat, lon, ALT);
  let initialState: SolarRangeResult["initialState"];
  if (rsFrom.status === "sunNeverRises") {
    initialState = "night";
  } else if (rsFrom.status === "sunNeverSets") {
    initialState = "day";
  } else if (rsFrom.status === "ok") {
    // fromUTC が日の出～日の入りの間なら "day"、それ以外は "night"
    initialState =
      +fromUTC >= +rsFrom.riseUTC && +fromUTC < +rsFrom.setUTC
        ? "day"
        : "night";
  } else {
    initialState = null;
  }

  return { events, prevEvent, initialState };
}

export type StateKind = "day" | "night" | "dawn" | "dusk";
