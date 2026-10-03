import { useMemo, useState } from "react";
import { ArrowDownUp, Star } from "lucide-react";
import { useChargeWise } from "@/lib/chargewise/store";
import { fmtInr, fmtMin, type Result } from "@/lib/chargewise/engine";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";

type SortKey = "score" | "distance" | "total" | "cost" | "availability" | "power";
const SORTS: { key: SortKey; label: string; get: (r: Result) => number; asc: boolean }[] = [
  { key: "score", label: "Score", get: (r) => r.score, asc: false },
  { key: "distance", label: "Distance", get: (r) => r.station.distanceKm, asc: true },
  { key: "total", label: "Total stop", get: (r) => r.totalMin, asc: true },
  { key: "cost", label: "Cost", get: (r) => r.cost, asc: true },
  { key: "availability", label: "Availability", get: (r) => r.station.available / r.station.total, asc: false },
  { key: "power", label: "Power", get: (r) => r.station.powerKw, asc: false },
];

export function StationComparison() {
  const { results, best, openDrawer, selectStation } = useChargeWise();
  const [sort, setSort] = useState<SortKey>("score");
  const rows = useMemo(() => {
    const s = SORTS.find((x) => x.key === sort)!;
    return [...results].sort((a, b) => (s.asc ? s.get(a) - s.get(b) : s.get(b) - s.get(a)));
  }, [results, sort]);

  const open = (id: string) => { selectStation(id); openDrawer(id); };

  return (
    <section aria-labelledby="cmp-title" className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="cmp-title" className="text-base font-semibold">Nearby Charging Stations</h2>
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Sort stations">
          <ArrowDownUp className="h-4 w-4 text-muted-foreground" aria-hidden />
          {SORTS.map((s) => (
            <button key={s.key} aria-pressed={sort === s.key} onClick={() => setSort(s.key)}
              className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", sort === s.key ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:bg-accent")}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 hidden overflow-x-auto lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              {["#", "Station", "Distance", "Drive", "Arrival", "Reach", "Free", "Power", "Wait", "Charge", "Total", "Cost", "Rating", "Score", "Status"].map((h) => (
                <th key={h} className="px-2 py-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="tabular">
            {rows.map((r) => {
              const isBest = r.station.id === best?.station.id;
              return (
                <tr key={r.station.id} onClick={() => open(r.station.id)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && open(r.station.id)}
                  className={cn("cursor-pointer border-b border-border/60 hover:bg-accent/50 focus-visible:bg-accent focus-visible:outline-none", isBest && "bg-primary/8 shadow-[inset_3px_0_0_var(--primary)]")}>
                  <td className="px-2 py-3 text-muted-foreground">{r.rank}</td>
                  <td className="px-2 py-3 font-semibold">{r.station.name}</td>
                  <td className="px-2 py-3">{r.station.distanceKm} km</td>
                  <td className="px-2 py-3">{r.station.driveMin} min</td>
                  <td className="px-2 py-3">{Math.round(r.arrivalSoc)}%</td>
                  <td className={cn("px-2 py-3 font-medium", r.reachable ? "text-success" : "text-destructive")}>{r.reachable ? "Yes" : "No"}</td>
                  <td className="px-2 py-3">{r.station.available}/{r.station.total}</td>
                  <td className="px-2 py-3">{r.station.powerKw} kW</td>
                  <td className="px-2 py-3">{r.station.waitMin} min</td>
                  <td className="px-2 py-3">{fmtMin(r.chargeMin)}</td>
                  <td className="px-2 py-3 font-semibold">{fmtMin(r.totalMin)}</td>
                  <td className="px-2 py-3">{fmtInr(r.cost)}</td>
                  <td className="px-2 py-3"><span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-warning" fill="currentColor" aria-hidden />{r.station.rating}</span></td>
                  <td className="px-2 py-3 font-bold">{r.score}</td>
                  <td className="px-2 py-3"><div className="flex flex-wrap gap-1">{r.badges.map((b) => <StatusBadge key={b} badge={b} />)}</div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="mt-4 space-y-3 lg:hidden">
        {rows.map((r) => (
          <li key={r.station.id}>
            <button onClick={() => open(r.station.id)} className={cn("w-full rounded-xl border p-4 text-left", r.station.id === best?.station.id ? "border-primary/40 bg-primary/8" : "border-border bg-secondary/40")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{r.rank}. {r.station.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1">{r.badges.map((b) => <StatusBadge key={b} badge={b} />)}</div>
                </div>
                <span className="font-display text-xl font-bold tabular">{r.score}</span>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-xs tabular">
                <div><dt className="text-muted-foreground">Distance</dt><dd className="font-semibold">{r.station.distanceKm} km</dd></div>
                <div><dt className="text-muted-foreground">Arrival</dt><dd className="font-semibold">{Math.round(r.arrivalSoc)}%</dd></div>
                <div><dt className="text-muted-foreground">Free</dt><dd className="font-semibold">{r.station.available}/{r.station.total}</dd></div>
                <div><dt className="text-muted-foreground">Power</dt><dd className="font-semibold">{r.station.powerKw} kW</dd></div>
                <div><dt className="text-muted-foreground">Total stop</dt><dd className="font-semibold">{fmtMin(r.totalMin)}</dd></div>
                <div><dt className="text-muted-foreground">Cost</dt><dd className="font-semibold">{fmtInr(r.cost)}</dd></div>
              </dl>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
