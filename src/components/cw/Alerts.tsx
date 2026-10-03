import { AlertTriangle, Info, MapPinOff, Sparkles, X } from "lucide-react";
import type { ReactNode } from "react";
import { useChargeWise } from "@/lib/chargewise/store";
import { cn } from "@/lib/utils";

function AlertBanner({ tone, icon, title, children, actions, onClose }: {
  tone: "danger" | "warning" | "info"; icon: ReactNode; title: string; children: ReactNode; actions?: ReactNode; onClose?: () => void;
}) {
  const cls = { danger: "border-destructive/40 bg-destructive/10", warning: "border-warning/40 bg-warning/10", info: "border-primary/40 bg-primary/10" }[tone];
  const ic = { danger: "text-destructive", warning: "text-warning", info: "text-primary" }[tone];
  return (
    <div role="alert" className={cn("flex gap-3 rounded-2xl border p-4", cls)}>
      <span className={cn("mt-0.5", ic)}>{icon}</span>
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{children}</p>
        {actions && <div className="mt-3 flex flex-wrap gap-2">{actions}</div>}
      </div>
      {onClose && <button onClick={onClose} aria-label="Dismiss alert" className="h-8 w-8 rounded-lg hover:bg-accent"><X className="mx-auto h-4 w-4" /></button>}
    </div>
  );
}

const btn = "rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function Alerts() {
  const { results, inputs, setInput, liveAlerts, dismissAlert, selectStation, openDrawer, locationError, useMyLocation } = useChargeWise();
  const compatible = results.filter((r) => r.compatible && r.withinDetour);
  const reachable = compatible.filter((r) => r.reachable);

  return (
    <div className="space-y-3" aria-live="polite">
      {compatible.length === 0 ? (
        <AlertBanner tone="warning" icon={<Info className="h-5 w-5" />} title="No compatible charger found">
          Try another connector type or increase your maximum detour.
        </AlertBanner>
      ) : reachable.length === 0 ? (
        <AlertBanner tone="danger" icon={<AlertTriangle className="h-5 w-5" />} title="⚠ No reachable charger"
          actions={<>
            <button className={btn} onClick={() => setInput("maxDetour", 30)}>Find Emergency Charger</button>
            <button className={btn} onClick={() => setInput("reserve", Math.max(5, inputs.reserve - 5))}>Reduce Reserve</button>
            <button className={btn} onClick={() => document.getElementById("dest")?.focus()}>Change Route</button>
          </>}>
          Your current battery level may not be sufficient to reach any compatible station while maintaining your {inputs.reserve}% reserve.
        </AlertBanner>
      ) : null}

      {locationError && (
        <AlertBanner tone="info" icon={<MapPinOff className="h-5 w-5" />} title="Location access required"
          actions={<button className={btn} onClick={useMyLocation}>Enable Location</button>}>
          We couldn't read your location. You can still type it in manually.
        </AlertBanner>
      )}

      {liveAlerts.map((a) => (
        <AlertBanner key={a.id} tone={a.kind === "occupied" ? "warning" : "info"} icon={a.kind === "occupied" ? <AlertTriangle className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
          title={a.kind === "occupied" ? `⚠ ${a.title}` : a.title} onClose={() => dismissAlert(a.id)}
          actions={a.kind === "occupied"
            ? <><button className={btn} onClick={() => { const alt = results.find((r) => r.eligible); if (alt) openDrawer(alt.station.id); dismissAlert(a.id); }}>View Alternative</button><button className={btn} onClick={() => dismissAlert(a.id)}>Keep Monitoring</button></>
            : <button className={btn} onClick={() => { if (a.stationId) selectStation(a.stationId); dismissAlert(a.id); }}>Switch Recommendation</button>}>
          {a.message}
        </AlertBanner>
      ))}
    </div>
  );
}
