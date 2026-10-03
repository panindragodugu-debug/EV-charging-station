import { useState } from "react";
import { Crosshair, LocateFixed, Minus, Plus, Layers } from "lucide-react";
import { useChargeWise } from "@/lib/chargewise/store";
import { availabilityOf, fmtMin } from "@/lib/chargewise/engine";
import { DESTINATION_POS, VEHICLE_POS } from "@/lib/chargewise/stations";
import { availTone } from "./StatusBadge";
import { cn } from "@/lib/utils";

const fill = { available: "var(--success)", limited: "var(--warning)", unavailable: "var(--destructive)" };

/** API-key-free interactive SVG map. Swap for a real map provider later. */
export function MapView() {
  const { results, best, selected, selectStation, openDrawer, inputs } = useChargeWise();
  const [zoom, setZoom] = useState(1);
  const [satellite, setSatellite] = useState(false);
  const target = best?.station ?? null;

  return (
    <section aria-label="Charging map" className="relative overflow-hidden rounded-2xl border border-border bg-map shadow-card">
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <g style={{ transform: `scale(${zoom})`, transformOrigin: "50% 50%", transition: "transform .3s" }}>
            <defs>
              <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
                <path d="M5 0H0V5" fill="none" stroke="var(--map-grid)" strokeWidth="0.2" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill={satellite ? "var(--secondary)" : "url(#grid)"} />
            <path d="M0 64 C25 60 40 70 60 52 S90 36 100 38" stroke="var(--map-road)" strokeWidth="1.6" fill="none" />
            <path d="M28 0 C32 30 36 60 30 100" stroke="var(--map-road)" strokeWidth="1.2" fill="none" />
            <path d="M0 30 C30 34 60 22 100 28" stroke="var(--map-road)" strokeWidth="0.9" fill="none" />
            <path d="M62 100 C60 70 70 40 78 0" stroke="var(--map-road)" strokeWidth="0.9" fill="none" />
            <ellipse cx="50" cy="80" rx="9" ry="5" fill="var(--primary)" opacity="0.08" />
            {target && (
              <path
                d={`M${VEHICLE_POS.x} ${VEHICLE_POS.y} Q ${(VEHICLE_POS.x + target.x) / 2 - 6} ${(VEHICLE_POS.y + target.y) / 2 + 6} ${target.x} ${target.y} T ${DESTINATION_POS.x} ${DESTINATION_POS.y}`}
                stroke="var(--primary)" strokeWidth="0.9" fill="none" strokeDasharray="2 1.2" strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 3 }}
              />
            )}
          </g>
        </svg>

        <div className="absolute inset-0" style={{ transform: `scale(${zoom})`, transformOrigin: "50% 50%", transition: "transform .3s" }}>
          <Marker x={VEHICLE_POS.x} y={VEHICLE_POS.y} label="Your vehicle">
            <span className="relative grid h-5 w-5 place-items-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-primary/50" />
              <span className="relative h-4 w-4 rounded-full border-2 border-foreground bg-primary" />
            </span>
          </Marker>
          <Marker x={DESTINATION_POS.x} y={DESTINATION_POS.y} label={`Destination: ${inputs.destination}`}>
            <span className="rounded-md bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background">DEST</span>
          </Marker>
          {results.map((r) => {
            const a = availabilityOf(r);
            const isBest = r.station.id === best?.station.id;
            const isSel = r.station.id === selected?.station.id;
            return (
              <button
                key={r.station.id}
                onClick={() => selectStation(r.station.id)}
                aria-label={`${r.station.name}, ${availTone[a].label}, ${r.station.distanceKm} km`}
                aria-pressed={isSel}
                className="absolute -translate-x-1/2 -translate-y-full focus-visible:outline-none"
                style={{ left: `${r.station.x}%`, top: `${r.station.y}%` }}
              >
                <span className="flex flex-col items-center">
                  <span className={cn("mb-1 whitespace-nowrap rounded-md bg-background/90 px-1.5 py-0.5 text-[10px] font-semibold tabular", isSel && "ring-1 ring-primary")}>
                    {r.station.distanceKm} km
                  </span>
                  <span
                    className={cn("relative grid place-items-center rounded-full border-2 border-background text-background transition-transform hover:scale-110", isBest ? "h-9 w-9" : "h-7 w-7", isSel && "scale-110")}
                    style={{ background: isBest ? "var(--primary)" : fill[a], boxShadow: isBest ? "0 0 0 6px color-mix(in oklab, var(--primary) 30%, transparent), 0 0 24px var(--primary)" : undefined }}
                  >
                    ⚡
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          {[
            { icon: Plus, label: "Zoom in", on: () => setZoom((z) => Math.min(1.8, z + 0.2)) },
            { icon: Minus, label: "Zoom out", on: () => setZoom((z) => Math.max(0.8, z - 0.2)) },
            { icon: Crosshair, label: "Recenter", on: () => setZoom(1) },
            { icon: LocateFixed, label: "Current location", on: () => selectStation(best?.station.id ?? "") },
            { icon: Layers, label: "Toggle map style", on: () => setSatellite((s) => !s) },
          ].map(({ icon: Icon, label, on }) => (
            <button key={label} onClick={on} aria-label={label} title={label} className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card/90 backdrop-blur hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Icon className="h-4 w-4" aria-hidden />
            </button>
          ))}
        </div>

        <div className="absolute bottom-3 left-3 flex flex-wrap gap-3 rounded-lg bg-card/90 px-3 py-2 text-[11px] backdrop-blur">
          {(["available", "limited", "unavailable"] as const).map((k) => (
            <span key={k} className="flex items-center gap-1.5"><span className={cn("h-2.5 w-2.5 rounded-full", availTone[k].dot)} />{availTone[k].label}</span>
          ))}
          <span>⚡ Fast charger</span>
        </div>
      </div>

      {selected && (
        <div className="flex items-center justify-between gap-3 border-t border-border bg-card p-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{selected.station.name}</p>
            <p className="text-xs text-muted-foreground tabular">
              {selected.station.available}/{selected.station.total} free · {selected.station.powerKw} kW · {fmtMin(selected.totalMin)} total
            </p>
          </div>
          <button onClick={() => openDrawer(selected.station.id)} className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-accent">Details</button>
        </div>
      )}
    </section>
  );
}

function Marker({ x, y, label, children }: { x: number; y: number; label: string; children: React.ReactNode }) {
  return (
    <div role="img" aria-label={label} title={label} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
      {children}
    </div>
  );
}

export function MapFallback() {
  return (
    <div role="alert" className="grid aspect-[16/10] place-items-center rounded-2xl border border-border bg-map p-6 text-center">
      <div>
        <p className="font-semibold">Map unavailable</p>
        <p className="mt-1 text-sm text-muted-foreground">Station data is still available, but route visualization cannot currently be loaded.</p>
      </div>
    </div>
  );
}
