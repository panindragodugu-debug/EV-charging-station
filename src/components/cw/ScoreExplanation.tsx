import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useChargeWise } from "@/lib/chargewise/store";
import { fmtMin } from "@/lib/chargewise/engine";

export function ScoreExplanation() {
  const { best, results, inputs } = useChargeWise();
  if (!best) return null;
  const b = best.breakdown;
  const rows = [
    { label: "Reachability & battery safety", v: b.safety, max: 30 },
    { label: "Total trip + charging time", v: b.time, max: 25 },
    { label: "Availability & expected wait", v: b.availability, max: 20 },
    { label: "Distance / route detour", v: b.detour, max: 10 },
    { label: "Charger power & compatibility", v: b.power, max: 10 },
    { label: "Cost & reliability", v: b.costRel, max: 5 },
  ];
  const runnerUp = results.filter((r) => r.eligible)[1];
  const excluded = results.filter((r) => !r.eligible);

  return (
    <Collapsible className="rounded-2xl border border-border bg-card shadow-card">
      <CollapsibleTrigger className="group flex w-full items-center justify-between p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl">
        <span className="text-base font-semibold">How is this recommendation calculated?</span>
        <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]:rotate-180" aria-hidden />
      </CollapsibleTrigger>
      <CollapsibleContent className="px-5 pb-5">
        <div className="grid gap-6 lg:grid-cols-2">
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.label}>
                <div className="mb-1 flex justify-between text-sm"><span>{r.label}</span><span className="tabular font-semibold">{Math.round(r.v)} / {r.max}</span></div>
                <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(r.v / r.max) * 100}%` }} /></div>
              </li>
            ))}
            <li className="flex justify-between border-t border-border pt-3 text-sm font-bold"><span>Final score</span><span className="tabular">{best.score} / 100</span></li>
          </ul>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong className="text-foreground">{best.station.name} is #1</strong> because you arrive with {Math.round(best.arrivalSoc)}% battery — safely above your {inputs.reserve}% reserve — and the whole stop takes {fmtMin(best.totalMin)}.</p>
            {runnerUp && <p>The runner-up, {runnerUp.station.name}, would take {fmtMin(runnerUp.totalMin)} with {runnerUp.station.available} of {runnerUp.station.total} chargers free.</p>}
            {excluded.length > 0 && <p>Excluded for safety or compatibility: {excluded.map((r) => `${r.station.shortName} (${r.badges[0]})`).join(", ")}.</p>}
            <p>Safety always overrides price: a station you can't reach with your reserve, or one without a {inputs.connector} connector, is never recommended.</p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
