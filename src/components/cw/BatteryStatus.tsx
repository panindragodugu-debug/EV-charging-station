import { BatteryCharging } from "lucide-react";
import { useChargeWise } from "@/lib/chargewise/store";
import { cn } from "@/lib/utils";

export function BatteryStatus() {
  const { inputs } = useChargeWise();
  const rangeKm = Math.round((inputs.soc / 100) * inputs.range);
  const safeKm = Math.max(0, Math.round(((inputs.soc - inputs.reserve) / 100) * inputs.range));
  const tone = inputs.soc <= inputs.reserve ? "bg-destructive" : inputs.soc < 25 ? "bg-warning" : "bg-success";

  const stats = [
    { label: "Est. range", value: `${rangeKm} km` },
    { label: "Capacity", value: `${inputs.capacity} kWh` },
    { label: "Target", value: `${inputs.target}%` },
    { label: "Reserve", value: `${inputs.reserve}%` },
  ];

  return (
    <section aria-label="Battery status" className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex flex-col gap-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-success/12 text-success">
            <BatteryCharging className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current battery</p>
            <p className="font-display text-3xl font-bold tabular">{inputs.soc}%</p>
          </div>
        </div>

        <div className="flex-1">
          <div className="relative h-4 overflow-hidden rounded-full bg-muted" role="meter" aria-valuenow={inputs.soc} aria-valuemin={0} aria-valuemax={100} aria-label="Battery level">
            <div className={cn("h-full rounded-full transition-all duration-500", tone)} style={{ width: `${inputs.soc}%` }} />
            <div className="absolute inset-y-0 w-0.5 bg-destructive" style={{ left: `${inputs.reserve}%` }} title="Reserve" />
            <div className="absolute inset-y-0 w-0.5 bg-primary" style={{ left: `${inputs.target}%` }} title="Target" />
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Safe estimated driving range: <strong className="text-foreground tabular">{safeKm} km</strong></span>
            <span className="hidden sm:inline">Reserve {inputs.reserve}% · Target {inputs.target}%</span>
          </div>
        </div>

        <dl className="grid grid-cols-4 gap-3 md:w-auto md:gap-6">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="text-[11px] text-muted-foreground">{s.label}</dt>
              <dd className="text-sm font-semibold tabular">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
