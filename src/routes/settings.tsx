import { createFileRoute } from "@tanstack/react-router";
import { PageHeading } from "@/components/cw/PageHeading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChargeWise } from "@/lib/chargewise/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ChargeWise Pro" },
      { name: "description", content: "Configure your vehicle and data sources for ChargeWise Pro." },
      { property: "og:title", content: "Settings — ChargeWise Pro" },
      { property: "og:description", content: "Vehicle and data preferences for EV charging recommendations." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { inputs, setInput } = useChargeWise();
  return (
    <div className="space-y-5">
      <PageHeading title="Settings" subtitle="Vehicle profile and data sources" />
      <section className="max-w-xl space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-semibold">Vehicle</h2>
        <div className="space-y-1.5">
          <Label htmlFor="vmax">Maximum DC charging power (kW)</Label>
          <Input id="vmax" type="number" min={20} max={350} value={inputs.vehicleMaxKw} onChange={(e) => setInput("vehicleMaxKw", Math.max(20, Number(e.target.value) || 20))} />
          <p className="text-xs text-muted-foreground">Charging time is limited by whichever is lower: your car or the charger.</p>
        </div>
      </section>
      <section className="max-w-xl rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-semibold">Data source</h2>
        <p className="mt-1 text-sm text-muted-foreground">Currently using simulated live data for 5 Hyderabad stations. A real charging network can be connected later.</p>
      </section>
    </div>
  );
}
