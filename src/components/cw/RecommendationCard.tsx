import { CheckCircle2, Clock, Navigation, Plug, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useChargeWise } from "@/lib/chargewise/store";
import { fmtInr, fmtMin, type Result } from "@/lib/chargewise/engine";
import { toast } from "sonner";

export function ScoreRing({ score, size = 104 }: { score: number; size?: number }) {
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`Recommendation score ${score} out of 100`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth={8} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--primary)" strokeWidth={8} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-3xl font-bold tabular leading-none">{score}</div>
          <div className="mt-1 text-[10px] text-muted-foreground">/ 100</div>
        </div>
      </div>
    </div>
  );
}

export function startNavigation(r: Result) {
  toast.success(`Navigation started to ${r.station.name}`, { description: `${r.station.distanceKm} km · ${r.station.driveMin} min drive (demo)` });
}

function explain(r: Result, reserve: number, all: Result[]) {
  const fastest = [...all].filter((x) => x.eligible).sort((a, b) => a.totalMin - b.totalMin)[0];
  const parts = [`reachable with a ${Math.round(r.arrivalSoc)}% arrival battery (above your ${reserve}% reserve)`];
  parts.push(r.station.available > 0 ? `${r.station.available} of ${r.station.total} chargers available now` : "a short queue expected");
  if (fastest?.station.id === r.station.id) parts.push("the shortest total drive-plus-charge time");
  else parts.push(`a strong balance of speed, wait and cost`);
  return `Best option: ${parts.join(", ")}.`;
}

export function RecommendationCard() {
  const { best, results, inputs, loading, openDrawer } = useChargeWise();

  if (loading) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6" aria-busy="true">
        <p className="text-sm text-muted-foreground">Updating real-time charging availability…</p>
        <div className="mt-4 flex gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-3"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-4 w-1/3" /><Skeleton className="h-16 w-full" /></div>
        </div>
      </section>
    );
  }

  if (!best) {
    return (
      <section className="rounded-2xl border border-destructive/40 bg-destructive/10 p-6">
        <h2 className="text-lg font-semibold">No safe recommendation</h2>
        <p className="mt-1 text-sm text-muted-foreground">We never recommend a station you can't safely reach. Adjust your reserve, connector or detour to see options.</p>
      </section>
    );
  }

  const s = best.station;
  const margin = Math.round(best.arrivalSoc - inputs.reserve);
  const metrics = [
    { label: "Distance", value: `${s.distanceKm} km` },
    { label: "Drive", value: `${s.driveMin} min` },
    { label: "Battery on arrival", value: `${Math.round(best.arrivalSoc)}%` },
    { label: "Available", value: `${s.available} / ${s.total}` },
    { label: "Charger", value: `${inputs.connector} · ${s.powerKw} kW` },
    { label: "Expected wait", value: `${s.waitMin} min` },
    { label: "Charging time", value: fmtMin(best.chargeMin) },
    { label: "Estimated cost", value: fmtInr(best.cost) },
  ];

  return (
    <section aria-labelledby="best-title" className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card p-5 shadow-glow sm:p-6">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" aria-hidden />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p id="best-title" className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Best Station for You</p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">{s.name}</h2>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            {s.operator}
            <span className="inline-flex items-center gap-1 text-warning"><Star className="h-3.5 w-3.5" fill="currentColor" aria-hidden />{s.rating}</span>
          </p>
        </div>
        <ScoreRing score={best.score} />
      </div>

      <dl className="relative mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl bg-secondary/60 p-3">
            <dt className="text-[11px] text-muted-foreground">{m.label}</dt>
            <dd className="mt-0.5 text-base font-semibold tabular">{m.value}</dd>
          </div>
        ))}
      </dl>

      <div className="relative mt-5 rounded-xl border border-border bg-background/40 p-4">
        <div className="flex items-baseline justify-between">
          <span className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" aria-hidden />Total stop time</span>
          <span className="font-display text-2xl font-bold tabular">{fmtMin(best.totalMin)}</span>
        </div>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm tabular text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Navigation className="h-3.5 w-3.5" aria-hidden />{s.driveMin} min drive</span>+
          <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" aria-hidden />{s.waitMin} min wait</span>+
          <span className="inline-flex items-center gap-1"><Zap className="h-3.5 w-3.5" aria-hidden />{fmtMin(best.chargeMin)} charging</span>
        </p>
      </div>

      <p className="relative mt-4 flex items-center gap-2 text-sm font-semibold text-success">
        <CheckCircle2 className="h-4 w-4" aria-hidden /> Reachable with {margin}% reserve margin
      </p>
      <p className="relative mt-2 text-sm text-muted-foreground">{explain(best, inputs.reserve, results)}</p>

      <div className="relative mt-5 flex flex-col gap-2 sm:flex-row">
        <Button className="h-12 flex-1 text-base font-semibold" onClick={() => startNavigation(best)}>
          <Navigation className="mr-2 h-4 w-4" /> Start Navigation
        </Button>
        <Button variant="outline" className="h-12 sm:w-auto" onClick={() => openDrawer(s.id)}>
          <Plug className="mr-2 h-4 w-4" /> View Station Details
        </Button>
      </div>
    </section>
  );
}
