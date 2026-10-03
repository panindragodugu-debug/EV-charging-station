import { createFileRoute } from "@tanstack/react-router";
import { PageHeading } from "@/components/cw/PageHeading";
import { StationComparison } from "@/components/cw/StationComparison";
import { MapView, MapFallback } from "@/components/cw/MapView";
import { ErrorBoundary } from "@/components/cw/ErrorBoundary";

export const Route = createFileRoute("/stations")({
  head: () => ({
    meta: [
      { title: "Nearby Stations — ChargeWise Pro" },
      { name: "description", content: "Compare nearby EV charging stations by reachability, availability, speed and cost." },
      { property: "og:title", content: "Nearby Stations — ChargeWise Pro" },
      { property: "og:description", content: "Sortable comparison of EV chargers near you." },
    ],
  }),
  component: () => (
    <div className="space-y-5">
      <PageHeading title="Stations" subtitle="Every nearby charger, ranked for your vehicle" />
      <ErrorBoundary fallback={<MapFallback />}><MapView /></ErrorBoundary>
      <ErrorBoundary title="Station list"><StationComparison /></ErrorBoundary>
    </div>
  ),
});
