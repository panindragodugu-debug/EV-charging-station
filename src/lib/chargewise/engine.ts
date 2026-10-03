import type { Connector, Station } from "./stations";

export type Preference = "balanced" | "fastest" | "cost" | "detour" | "reliable";

export const PREFERENCES: { value: Preference; label: string }[] = [
  { value: "balanced", label: "Balanced" },
  { value: "fastest", label: "Fastest arrival" },
  { value: "cost", label: "Lowest cost" },
  { value: "detour", label: "Shortest detour" },
  { value: "reliable", label: "Most reliable" },
];

export interface Inputs {
  soc: number;
  capacity: number;
  range: number;
  reserve: number;
  target: number;
  connector: Connector;
  maxDetour: number;
  preference: Preference;
  location: string;
  destination: string;
  vehicleMaxKw: number;
}

export const DEFAULT_INPUTS: Inputs = {
  soc: 35,
  capacity: 75,
  range: 420,
  reserve: 15,
  target: 80,
  connector: "CCS",
  maxDetour: 15,
  preference: "balanced",
  location: "Hyderabad, Telangana",
  destination: "Gachibowli, Hyderabad",
  vehicleMaxKw: 150,
};

export type Badge =
  | "Recommended"
  | "Fastest"
  | "Lowest Cost"
  | "Limited Availability"
  | "Occupied"
  | "Slow Charger"
  | "Not Reachable"
  | "Incompatible"
  | "Too Far"
  | "Available";

export interface Breakdown {
  safety: number;
  time: number;
  availability: number;
  detour: number;
  power: number;
  costRel: number;
}

export interface Result {
  station: Station;
  arrivalSoc: number;
  reachable: boolean;
  compatible: boolean;
  withinDetour: boolean;
  eligible: boolean;
  energyKwh: number;
  effectiveKw: number;
  chargeMin: number;
  totalMin: number;
  cost: number;
  breakdown: Breakdown;
  score: number;
  badges: Badge[];
  rank: number;
}

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/** Fraction of peak DC power available at a given SOC (simulated taper). */
function taper(soc: number) {
  if (soc < 50) return 1;
  if (soc < 80) return 1 - ((soc - 50) / 30) * 0.55;
  return 0.45 - ((soc - 80) / 20) * 0.3;
}

export function effectivePower(stationKw: number, vehicleMaxKw: number) {
  // AC chargers are limited by the on-board charger (~11 kW).
  return stationKw <= 22 ? Math.min(stationKw, 11) : Math.min(stationKw, vehicleMaxKw);
}

export function chargingMinutes(from: number, to: number, stationKw: number, inp: Inputs) {
  if (to <= from) return 0;
  const peak = effectivePower(stationKw, inp.vehicleMaxKw);
  const isDc = stationKw > 22;
  let minutes = 0;
  for (let s = Math.max(0, from); s < to; s += 1) {
    const kw = peak * (isDc ? taper(s) : 1);
    minutes += ((inp.capacity * 0.01) / kw) * 60;
  }
  return minutes;
}

export function arrivalSoc(distanceKm: number, inp: Inputs) {
  const energy = (distanceKm * inp.capacity) / inp.range;
  return inp.soc - (energy / inp.capacity) * 100;
}

export function computeResults(stations: Station[], inp: Inputs): Result[] {
  const base = stations.map((station) => {
    const arr = arrivalSoc(station.distanceKm, inp);
    const reachable = arr >= inp.reserve;
    const compatible = station.connectors.includes(inp.connector);
    const withinDetour = station.distanceKm <= inp.maxDetour;
    const energyKwh = Math.max(0, (inp.capacity * (inp.target - arr)) / 100);
    const chargeMin = chargingMinutes(arr, inp.target, station.powerKw, inp);
    const totalMin = station.driveMin + station.waitMin + chargeMin;
    const cost = energyKwh * station.pricePerKwh;
    return {
      station,
      arrivalSoc: arr,
      reachable,
      compatible,
      withinDetour,
      eligible: reachable && compatible && withinDetour,
      energyKwh,
      effectiveKw: effectivePower(station.powerKw, inp.vehicleMaxKw),
      chargeMin,
      totalMin,
      cost,
    };
  });

  const pool = base.filter((r) => r.compatible);
  const minTotal = Math.min(...pool.map((r) => r.totalMin), Infinity);
  const minCost = Math.min(...pool.map((r) => r.cost || 1), Infinity);

  const scored = base.map((r) => {
    const s = r.station;
    const margin = r.arrivalSoc - inp.reserve;
    const safety = r.reachable ? 30 * clamp(0.75 + margin / 80) : 0;
    const time = 25 * clamp(minTotal / r.totalMin);
    const ratio = s.available / s.total;
    const availability = s.available === 0 ? 20 * clamp(1 - s.waitMin / 30) * 0.3 : 12 * ratio + 8 * clamp(1 - s.waitMin / 30);
    const detour = 10 * clamp(1 - r.station.distanceKm / Math.max(inp.maxDetour, 1) * 0.6);
    const power = r.compatible ? 10 * clamp(r.effectiveKw / 150) : 0;
    const costRel = 2.5 * clamp(minCost / (r.cost || 1)) + 2.5 * clamp(s.reliability);
    const breakdown = { safety, time, availability, detour, power, costRel };
    let score = Object.values(breakdown).reduce((a, b) => a + b, 0);
    // Safety overrides everything: unsafe or unusable stations can never outrank eligible ones.
    if (!r.compatible) score = 0;
    else if (!r.reachable) score = Math.min(score, 25);
    else if (!r.withinDetour) score = Math.min(score, 40);
    return { ...r, breakdown, score: Math.round(clamp(score, 0, 100)) };
  });

  const prefKey = (r: (typeof scored)[number]) => {
    switch (inp.preference) {
      case "fastest":
        return r.totalMin;
      case "cost":
        return r.cost;
      case "detour":
        return r.station.distanceKm;
      case "reliable":
        return -(r.station.reliability * 100 + r.station.rating);
      default:
        return -r.score;
    }
  };

  const sorted = [...scored].sort((a, b) => {
    if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
    return prefKey(a) - prefKey(b) || b.score - a.score;
  });

  const eligible = sorted.filter((r) => r.eligible);
  const fastestId = [...eligible].sort((a, b) => a.totalMin - b.totalMin)[0]?.station.id;
  const cheapestId = [...eligible].sort((a, b) => a.cost - b.cost)[0]?.station.id;
  const bestId = eligible[0]?.station.id;

  return sorted.map((r, i) => {
    const badges: Badge[] = [];
    const s = r.station;
    if (!r.compatible) badges.push("Incompatible");
    else if (!r.reachable) badges.push("Not Reachable");
    else if (!r.withinDetour) badges.push("Too Far");
    else {
      if (s.id === bestId) badges.push("Recommended");
      if (s.id === fastestId && s.id !== bestId) badges.push("Fastest");
      if (s.id === cheapestId && s.id !== bestId) badges.push("Lowest Cost");
      if (s.available === 0) badges.push("Occupied");
      else if (s.available / s.total < 0.34) badges.push("Limited Availability");
      if (s.powerKw <= 22) badges.push("Slow Charger");
      if (badges.length === 0) badges.push("Available");
    }
    return { ...r, badges, rank: i + 1 };
  });
}

export type Availability = "available" | "limited" | "unavailable";

export function availabilityOf(r: Result): Availability {
  if (!r.eligible || r.station.available === 0) return "unavailable";
  if (r.station.available / r.station.total < 0.5 || r.station.waitMin > 10) return "limited";
  return "available";
}

export function fmtMin(m: number) {
  const v = Math.round(m);
  if (v < 60) return `${v} min`;
  const h = Math.floor(v / 60);
  const r = v % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}

export const fmtInr = (v: number) => `₹${Math.round(v).toLocaleString("en-IN")}`;
