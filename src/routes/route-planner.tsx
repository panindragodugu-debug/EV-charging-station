import { createFileRoute } from "@tanstack/react-router";
import { PageHeading } from "@/components/cw/PageHeading";
import { DriverPanel } from "@/components/cw/DriverPanel";
import { MapView, MapFallback } from "@/components/cw/MapView";
import { RecommendationCard } from "@/components/cw/RecommendationCard";
import { ErrorBoundary } from "@/components/cw/ErrorBoundary";

export const Route = createFileRoute("/route-planner")({
  head: () => ({
    meta: [
      { title: "Route Planner — ChargeWise Pro" },
      { name: "description", content: "Plan your EV route and find the best charging stop along the way." },
      { property: "og:title", content: "Route Planner — ChargeWise Pro" },
      { property: "og:description", content: "Plan EV trips with safe charging stops." },
    ],
  }),
  component: () => (
    <div className="space-y-5">
      <PageHeading title="Route Planner" subtitle="Set your destination and we'll pick a safe charging stop" />
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-4"><ErrorBoundary title="Trip settings"><DriverPanel /></ErrorBoundary></div>
        <div className="space-y-5 lg:col-span-8">
          <ErrorBoundary fallback={<MapFallback />}><MapView /></ErrorBoundary>
          <ErrorBoundary title="Recommendation"><RecommendationCard /></ErrorBoundary>
        </div>
      </div>
    </div>
  ),
});
