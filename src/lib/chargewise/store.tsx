import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { MOCK_STATIONS, type Station } from "./stations";
import { computeResults, DEFAULT_INPUTS, fmtMin, type Inputs, type Result } from "./engine";

export interface LiveAlert {
  id: string;
  kind: "occupied" | "alternative";
  title: string;
  message: string;
  stationId?: string;
}

interface Ctx {
  inputs: Inputs;
  setInput: <K extends keyof Inputs>(key: K, value: Inputs[K]) => void;
  stations: Station[];
  results: Result[];
  best: Result | null;
  selected: Result | null;
  selectStation: (id: string) => void;
  drawerId: string | null;
  openDrawer: (id: string | null) => void;
  refresh: () => void;
  loading: boolean;
  lastUpdated: number | null;
  liveAlerts: LiveAlert[];
  dismissAlert: (id: string) => void;
  locationError: boolean;
  useMyLocation: () => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

const ChargeWiseContext = createContext<Ctx | null>(null);

export function ChargeWiseProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);
  const [stations, setStations] = useState<Station[]>(MOCK_STATIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [liveAlerts, setLiveAlerts] = useState<LiveAlert[]>([]);
  const [locationError, setLocationError] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(["chargepoint-hub"]);

  useEffect(() => setLastUpdated(Date.now() - 2 * 60_000), []);

  const results = useMemo(() => computeResults(stations, inputs), [stations, inputs]);
  const best = results.find((r) => r.eligible) ?? null;
  const selected = results.find((r) => r.station.id === selectedId) ?? best;

  const prevBest = useRef<Result | null>(best);

  const setInput = useCallback(<K extends keyof Inputs>(key: K, value: Inputs[K]) => {
    setInputs((p) => ({ ...p, [key]: value }));
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    prevBest.current = best;
    setTimeout(() => {
      setStations((prev) => {
        const next = prev.map((s) => {
          const delta = Math.round((Math.random() - 0.5) * 2.4);
          const available = Math.max(0, Math.min(s.total, s.available + delta));
          const waitMin = available === 0 ? Math.round(15 + Math.random() * 15) : Math.max(0, Math.round(s.waitMin + (Math.random() - 0.55) * 6));
          return { ...s, available, waitMin };
        });
        const nextResults = computeResults(next, inputs);
        const nextBest = nextResults.find((r) => r.eligible);
        const old = prevBest.current;
        const alerts: LiveAlert[] = [];
        if (old) {
          const oldNow = next.find((s) => s.id === old.station.id);
          if (oldNow && oldNow.available === 0) {
            alerts.push({
              id: `occ-${Date.now()}`,
              kind: "occupied",
              title: "Station availability changed",
              message: `${oldNow.name} is now fully occupied.`,
              stationId: oldNow.id,
            });
          }
          if (nextBest && nextBest.station.id !== old.station.id) {
            const oldRes = nextResults.find((r) => r.station.id === old.station.id);
            const saved = oldRes ? Math.max(1, Math.round(oldRes.totalMin - nextBest.totalMin)) : 0;
            alerts.push({
              id: `alt-${Date.now()}`,
              kind: "alternative",
              title: "Better option available",
              message: `${nextBest.station.name} is now ${saved > 0 ? `${fmtMin(saved)} faster` : "the better choice"} due to updated charger availability and wait time.`,
              stationId: nextBest.station.id,
            });
          }
        }
        setLiveAlerts(alerts);
        return next;
      });
      setLastUpdated(Date.now());
      setLoading(false);
    }, 900);
  }, [best, inputs]);

  const useMyLocation = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationError(false);
        setInputs((p) => ({ ...p, location: `My location (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)})` }));
      },
      () => setLocationError(true),
      { timeout: 8000 },
    );
  }, []);

  const value: Ctx = {
    inputs,
    setInput,
    stations,
    results,
    best,
    selected,
    selectStation: setSelectedId,
    drawerId,
    openDrawer: setDrawerId,
    refresh,
    loading,
    lastUpdated,
    liveAlerts,
    dismissAlert: (id) => setLiveAlerts((a) => a.filter((x) => x.id !== id)),
    locationError,
    useMyLocation,
    favorites,
    toggleFavorite: (id) => setFavorites((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])),
  };

  return <ChargeWiseContext.Provider value={value}>{children}</ChargeWiseContext.Provider>;
}

export function useChargeWise() {
  const ctx = useContext(ChargeWiseContext);
  if (!ctx) throw new Error("useChargeWise must be used within ChargeWiseProvider");
  return ctx;
}
