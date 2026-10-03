import { createFileRoute } from "@tanstack/react-router";
import { SlidersHorizontal, Navigation } from "lucide-react";
import { useState } from "react";
import { AppHeader } from "@/components/cw/AppShell";
import { Alerts } from "@/components/cw/Alerts";
import { BatteryStatus } from "@/components/cw/BatteryStatus";
import { DriverPanel } from "@/components/cw/DriverPanel";
import { RecommendationCard, startNavigation } from "@/components/cw/RecommendationCard";
import { MapView, MapFallback } from "@/components/cw/MapView";
import { StationComparison } from "@/components/cw/StationComparison";
import { AnalyticsCards, Charts } from "@/components/cw/Analytics";
import { ScoreExplanation } from "@/components/cw/ScoreExplanation";
import { ErrorBoundary } from "@/components/cw/ErrorBoundary";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useChargeWise } from "@/lib/chargewise/store";
import { fmtMin } from "@/lib/chargewise/engine";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EV Charge Finder — ChargeWise Pro" },
      { name: "description", content: "Find the fastest, safest and most reliable EV charging stop based on your battery, route and live charger availability." },
      { property: "og:title", content: "EV Charge Finder — ChargeWise Pro" },
      { property: "og:description", content: "Smart EV charging recommendations: reachability, wait, charge time and cost in seconds." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { best } = useChargeWise();
  const [controlsOpen, setControlsOpen] = useState(false);

  return (
    <div className="space-y-5">
      <AppHeader />
      <ErrorBoundary title="Alerts"><Alerts /></ErrorBoundary>
      <ErrorBoundary title="Battery status"><BatteryStatus /></ErrorBoundary>

      <button onClick={() => setControlsOpen(true)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-semibold lg:hidden">
        <SlidersHorizontal className="h-4 w-4" aria-hidden /> Adjust vehicle &amp; trip
      </button>

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="hidden lg:col-span-4 lg:block 2xl:col-span-3">
          <ErrorBoundary title="Driver controls"><DriverPanel /></ErrorBoundary>
        </div>
        <div className="grid gap-5 lg:col-span-8 2xl:col-span-9 2xl:grid-cols-2">
          <ErrorBoundary title="Recommendation"><RecommendationCard /></ErrorBoundary>
          <ErrorBoundary fallback={<MapFallback />}><MapView /></ErrorBoundary>
        </div>
      </div>

      <ErrorBoundary title="Analytics"><AnalyticsCards /></ErrorBoundary>
      <ErrorBoundary title="Station comparison"><StationComparison /></ErrorBoundary>
      <Charts />
      <ErrorBoundary title="Score explanation"><ScoreExplanation /></ErrorBoundary>

      <Sheet open={controlsOpen} onOpenChange={setControlsOpen}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto p-3">
          <SheetHeader className="sr-only"><SheetTitle>Driver &amp; Vehicle</SheetTitle></SheetHeader>
          <DriverPanel onSubmit={() => setControlsOpen(false)} />
        </SheetContent>
      </Sheet>

      {best && (
        <div className="fixed inset-x-0 bottom-14 z-30 border-t border-border bg-card/95 p-3 backdrop-blur lg:hidden">
          <button onClick={() => startNavigation(best)} className="flex h-12 w-full items-center justify-between rounded-xl bg-primary px-4 text-primary-foreground">
            <span className="truncate text-sm font-medium">{best.station.name} • {fmtMin(best.totalMin)}</span>
            <span className="flex items-center gap-1.5 text-sm font-bold"><Navigation className="h-4 w-4" />START</span>
          </button>
        </div>
      )}
    </div>
  );
}
