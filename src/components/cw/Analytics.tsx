import { useChargeWise } from "@/lib/chargewise/store";
import { fmtInr, fmtMin } from "@/lib/chargewise/engine";
import { ErrorBoundary } from "./ErrorBoundary";

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-card ${className}`}>
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

export function AnalyticsCards() {
  const { results, inputs } = useChargeWise();
  const ok = results.filter((r) => r.eligible);
  const nearest = [...ok].sort((a, b) => a.station.distanceKm - b.station.distanceKm)[0];
  const fastest = [...ok].sort((a, b) => a.totalMin - b.totalMin)[0];
  const cheapest = [...ok].sort((a, b) => a.cost - b.cost)[0];
  const avail = Math.round((results.reduce((a, r) => a + r.station.available, 0) / results.reduce((a, r) => a + r.station.total, 0)) * 100);
  const none = <p className="mt-2 text-sm text-muted-foreground">None reachable</p>;

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      <Card title="Current Battery">
        <p className="mt-2 font-display text-2xl font-bold tabular">{inputs.soc}%</p>
        <p className="text-xs text-muted-foreground tabular">{Math.round((inputs.soc / 100) * inputs.range)} km estimated range</p>
      </Card>
      <Card title="Nearest Reachable Charger">
        {nearest ? <><p className="mt-2 font-semibold">{nearest.station.shortName}</p><p className="text-xs text-muted-foreground tabular">{nearest.station.distanceKm} km · {nearest.station.driveMin} min</p></> : none}
      </Card>
      <Card title="Fastest Charging">
        {fastest ? <><p className="mt-2 font-semibold">{fastest.station.shortName}</p><p className="text-xs text-muted-foreground tabular">{fastest.station.powerKw} kW · {fmtMin(fastest.chargeMin)}</p></> : none}
      </Card>
      <Card title="Lowest Cost">
        {cheapest ? <><p className="mt-2 font-semibold">{cheapest.station.shortName} · <span className="tabular">{fmtInr(cheapest.cost)}</span></p><p className="text-xs text-muted-foreground">Lowest cost does not necessarily mean fastest.</p></> : none}
      </Card>
      <Card title="Average Nearby Availability" className="col-span-2 md:col-span-1">
        <p className="mt-2 font-display text-2xl font-bold tabular">{avail}%</p>
        <div className="mt-2 h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-success" style={{ width: `${avail}%` }} /></div>
      </Card>
    </div>
  );
}

function AvailabilityDonut() {
  const { results } = useChargeWise();
  const free = results.reduce((a, r) => a + r.station.available, 0);
  const total = results.reduce((a, r) => a + r.station.total, 0);
  const c = 2 * Math.PI * 40;
  return (
    <Card title="Charger Availability">
      <div className="mt-3 flex items-center gap-5">
        <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90" role="img" aria-label={`${free} of ${total} chargers available`}>
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--destructive)" strokeOpacity="0.55" strokeWidth="14" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--success)" strokeWidth="14" strokeDasharray={c} strokeDashoffset={c * (1 - free / total)} className="transition-all duration-700" />
        </svg>
        <ul className="space-y-2 text-sm tabular">
          <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-success" />Available <strong>{free}</strong></li>
          <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-destructive" />Occupied <strong>{total - free}</strong></li>
        </ul>
      </div>
    </Card>
  );
}

function StopTimeBars() {
  const { results, best } = useChargeWise();
  const max = Math.max(...results.map((r) => r.totalMin));
  return (
    <Card title="Total Stop Time">
      <ul className="mt-3 space-y-2.5">
        {results.map((r) => (
          <li key={r.station.id} className="text-xs">
            <div className="mb-1 flex justify-between"><span>{r.station.shortName}</span><span className="tabular font-semibold">{fmtMin(r.totalMin)}</span></div>
            <div className="h-2 rounded-full bg-muted">
              <div className={`h-full rounded-full transition-all duration-700 ${r.station.id === best?.station.id ? "bg-primary" : r.eligible ? "bg-muted-foreground/60" : "bg-destructive/60"}`} style={{ width: `${(r.totalMin / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function CostScatter() {
  const { results, best } = useChargeWise();
  const maxT = Math.max(...results.map((r) => r.totalMin)) * 1.1;
  const maxC = Math.max(...results.map((r) => r.cost)) * 1.15;
  return (
    <Card title="Charging Cost vs Total Stop Time">
      <svg viewBox="0 0 200 120" className="mt-3 w-full" role="img" aria-label="Scatter plot of cost versus total stop time">
        <line x1="20" y1="100" x2="195" y2="100" stroke="var(--border)" />
        <line x1="20" y1="5" x2="20" y2="100" stroke="var(--border)" />
        <text x="195" y="115" textAnchor="end" fontSize="7" fill="var(--muted-foreground)">Total stop time →</text>
        <text x="2" y="10" fontSize="7" fill="var(--muted-foreground)">₹</text>
        {results.map((r) => {
          const x = 20 + (r.totalMin / maxT) * 175;
          const y = 100 - (r.cost / maxC) * 95;
          const isBest = r.station.id === best?.station.id;
          return (
            <g key={r.station.id}>
              <circle cx={x} cy={y} r={isBest ? 4.5 : 3.2} fill={isBest ? "var(--primary)" : "var(--chart-3)"} />
              <text x={x + 5} y={y + 2} fontSize="6" fill="var(--foreground)">{r.station.shortName}</text>
            </g>
          );
        })}
      </svg>
    </Card>
  );
}

function BatteryForecast() {
  const { best, inputs } = useChargeWise();
  const arrival = best ? Math.round(best.arrivalSoc) : inputs.soc;
  const pts = [
    { label: "Now", v: inputs.soc },
    { label: "Arrival", v: arrival },
    { label: "After charge", v: inputs.target },
  ];
  const y = (v: number) => 100 - v * 0.9;
  return (
    <Card title="Battery Forecast">
      <svg viewBox="0 0 200 110" className="mt-3 w-full" role="img" aria-label={`Battery ${inputs.soc}% now, ${arrival}% at arrival, ${inputs.target}% after charging`}>
        <line x1="10" x2="195" y1={y(inputs.reserve)} y2={y(inputs.reserve)} stroke="var(--destructive)" strokeDasharray="3 2" />
        <text x="195" y={y(inputs.reserve) - 2} textAnchor="end" fontSize="6.5" fill="var(--destructive)">{inputs.reserve}% safety reserve</text>
        <polyline points={pts.map((p, i) => `${20 + i * 80},${y(p.v)}`).join(" ")} fill="none" stroke="var(--primary)" strokeWidth="2" />
        {pts.map((p, i) => (
          <g key={p.label}>
            <circle cx={20 + i * 80} cy={y(p.v)} r="3.5" fill="var(--primary)" />
            <text x={20 + i * 80} y={y(p.v) - 6} textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--foreground)">{p.v}%</text>
            <text x={20 + i * 80} y="108" textAnchor="middle" fontSize="6.5" fill="var(--muted-foreground)">{p.label}</text>
          </g>
        ))}
      </svg>
    </Card>
  );
}

export function Charts() {
  const fb = (t: string) => <Card title={t}><p className="mt-3 text-sm text-muted-foreground">Chart unavailable right now.</p></Card>;
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <ErrorBoundary fallback={fb("Charger Availability")}><AvailabilityDonut /></ErrorBoundary>
      <ErrorBoundary fallback={fb("Total Stop Time")}><StopTimeBars /></ErrorBoundary>
      <ErrorBoundary fallback={fb("Cost vs Time")}><CostScatter /></ErrorBoundary>
      <ErrorBoundary fallback={fb("Battery Forecast")}><BatteryForecast /></ErrorBoundary>
    </div>
  );
}
