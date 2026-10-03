import { Crosshair, Search } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChargeWise } from "@/lib/chargewise/store";
import { PREFERENCES, type Preference } from "@/lib/chargewise/engine";
import type { Connector } from "@/lib/chargewise/stations";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CONNECTORS: { value: Connector; label: string }[] = [
  { value: "CCS", label: "CCS" },
  { value: "CHAdeMO", label: "CHAdeMO" },
  { value: "Type 2", label: "Type 2" },
  { value: "NACS", label: "Tesla / NACS" },
];

function SliderRow({ id, label, value, onChange, min = 0, max = 100, step = 1, unit = "%", withInput }: {
  id: string; label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; unit?: string; withInput?: boolean;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">{label}</Label>
        {withInput ? (
          <div className="flex items-center gap-1">
            <Input
              id={id}
              type="number"
              min={min}
              max={max}
              value={value}
              onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
              className="h-7 w-16 text-right text-sm font-semibold tabular"
            />
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
        ) : (
          <span className="text-sm font-semibold tabular">{value}{unit === "%" ? "%" : ` ${unit}`}</span>
        )}
      </div>
      <Slider aria-label={label} id={withInput ? undefined : id} value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0] ?? value)} />
    </div>
  );
}

export function DriverPanel({ onSubmit }: { onSubmit?: () => void }) {
  const { inputs, setInput, useMyLocation, refresh } = useChargeWise();
  return (
    <section aria-labelledby="driver-title" className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <h2 id="driver-title" className="text-base font-semibold">Driver &amp; Vehicle</h2>
      <p className="mt-0.5 text-xs text-muted-foreground">Changes update recommendations instantly</p>

      <div className="mt-5 space-y-5">
        <SliderRow id="soc" label="Current battery" value={inputs.soc} onChange={(v) => setInput("soc", v)} withInput />

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="cap" className="text-xs text-muted-foreground">Battery capacity (kWh)</Label>
            <Input id="cap" type="number" min={10} max={200} value={inputs.capacity} onChange={(e) => setInput("capacity", Math.max(10, Number(e.target.value) || 10))} className="tabular" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="range" className="text-xs text-muted-foreground">Real-world range (km)</Label>
            <Input id="range" type="number" min={50} max={1000} value={inputs.range} onChange={(e) => setInput("range", Math.max(50, Number(e.target.value) || 50))} className="tabular" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="loc" className="text-xs text-muted-foreground">Current location</Label>
          <div className="flex gap-2">
            <Input id="loc" value={inputs.location} onChange={(e) => setInput("location", e.target.value)} />
            <Button type="button" variant="secondary" size="icon" onClick={useMyLocation} aria-label="Use my location" title="Use my location">
              <Crosshair className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dest" className="text-xs text-muted-foreground">Route destination</Label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input id="dest" value={inputs.destination} onChange={(e) => setInput("destination", e.target.value)} className="pl-9" placeholder="Search destination" />
          </div>
        </div>

        <SliderRow id="reserve" label="Minimum arrival reserve" value={inputs.reserve} max={40} onChange={(v) => setInput("reserve", v)} />
        <SliderRow id="target" label="Desired departure battery" value={inputs.target} min={50} max={100} onChange={(v) => setInput("target", v)} />

        <fieldset className="space-y-2">
          <legend className="text-xs font-medium text-muted-foreground">Connector type</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {CONNECTORS.map((c) => (
              <button
                key={c.value}
                type="button"
                aria-pressed={inputs.connector === c.value}
                onClick={() => setInput("connector", c.value)}
                className={cn(
                  "min-h-10 rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  inputs.connector === c.value ? "border-primary bg-primary/15 text-primary" : "border-border hover:bg-accent",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>

        <SliderRow id="detour" label="Maximum detour" value={inputs.maxDetour} min={2} max={30} unit="km" onChange={(v) => setInput("maxDetour", v)} />

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Recommendation preference</Label>
          <Select value={inputs.preference} onValueChange={(v) => setInput("preference", v as Preference)}>
            <SelectTrigger aria-label="Recommendation preference"><SelectValue>{PREFERENCES.find((p) => p.value === inputs.preference)?.label}</SelectValue></SelectTrigger>
            <SelectContent>
              {PREFERENCES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Button
          className="h-11 w-full text-sm font-semibold"
          onClick={() => {
            refresh();
            toast.success("Recalculating with live availability…");
            onSubmit?.();
          }}
        >
          Find Best Charger
        </Button>
      </div>
    </section>
  );
}
