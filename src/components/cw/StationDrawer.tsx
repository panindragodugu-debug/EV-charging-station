import { Heart, Navigation, Star } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChargeWise } from "@/lib/chargewise/store";
import { fmtInr, fmtMin } from "@/lib/chargewise/engine";
import { StatusBadge } from "./StatusBadge";
import { startNavigation } from "./RecommendationCard";
import { toast } from "sonner";

export function StationDrawer() {
  const { drawerId, openDrawer, results, selectStation, favorites, toggleFavorite, lastUpdated } = useChargeWise();
  const isMobile = useIsMobile();
  const r = results.find((x) => x.station.id === drawerId);

  return (
    <Sheet open={!!r} onOpenChange={(o) => !o && openDrawer(null)}>
      <SheetContent side={isMobile ? "bottom" : "right"} className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        {r && (
          <>
            <SheetHeader>
              <SheetTitle className="text-xl">{r.station.name}</SheetTitle>
              <SheetDescription className="flex items-center gap-2">
                {r.station.operator}
                <span className="inline-flex items-center gap-1 text-warning"><Star className="h-3.5 w-3.5" fill="currentColor" aria-hidden />{r.station.rating}</span>
              </SheetDescription>
              <div className="flex flex-wrap gap-1">{r.badges.map((b) => <StatusBadge key={b} badge={b} />)}</div>
            </SheetHeader>
            <dl className="grid grid-cols-2 gap-3 px-4 text-sm tabular">
              {[
                ["Reliability", `${Math.round(r.station.reliability * 100)}% uptime`],
                ["Distance", `${r.station.distanceKm} km`],
                ["Drive time", `${r.station.driveMin} min`],
                ["Available", `${r.station.available} / ${r.station.total}`],
                ["Connectors", r.station.connectors.join(", ")],
                ["Power", `${r.station.powerKw} kW`],
                ["Pricing", `₹${r.station.pricePerKwh}/kWh`],
                ["Est. cost", fmtInr(r.cost)],
                ["Expected wait", `${r.station.waitMin} min`],
                ["Charging time", fmtMin(r.chargeMin)],
                ["Arrival battery", `${Math.round(r.arrivalSoc)}%`],
                ["Score", `${r.score} / 100`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-secondary/60 p-2.5">
                  <dt className="text-[11px] text-muted-foreground">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="space-y-1 px-4 text-sm text-muted-foreground">
              <p><span className="text-foreground">Address:</span> {r.station.address}</p>
              <p><span className="text-foreground">Hours:</span> {r.station.hours}</p>
              <p><span className="text-foreground">Recent status:</span> {r.station.recentStatus}</p>
              <p><span className="text-foreground">Last updated:</span> {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : "just now"}</p>
            </div>
            <div className="flex flex-col gap-2 p-4">
              <Button className="h-11" disabled={!r.eligible} onClick={() => startNavigation(r)}><Navigation className="mr-2 h-4 w-4" />Navigate</Button>
              <div className="flex gap-2">
                <Button variant="outline" className="h-11 flex-1" onClick={() => { selectStation(r.station.id); toast(`${r.station.name} selected`); openDrawer(null); }}>Select This Station</Button>
                <Button variant="outline" size="icon" className="h-11 w-11" aria-label="Toggle favorite" aria-pressed={favorites.includes(r.station.id)} onClick={() => toggleFavorite(r.station.id)}>
                  <Heart className="h-4 w-4" fill={favorites.includes(r.station.id) ? "currentColor" : "none"} />
                </Button>
              </div>
              {!r.eligible && <p className="text-xs text-destructive">Navigation disabled: this station isn't a safe or compatible option with your current settings.</p>}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
