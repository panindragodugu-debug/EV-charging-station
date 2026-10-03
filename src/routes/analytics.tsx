import { createFileRoute } from "@tanstack/react-router";
import { PageHeading } from "@/components/cw/PageHeading";
import { AnalyticsCards, Charts } from "@/components/cw/Analytics";
import { ScoreExplanation } from "@/components/cw/ScoreExplanation";
import { ErrorBoundary } from "@/components/cw/ErrorBoundary";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Charging Analytics — ChargeWise Pro" },
      { name: "description", content: "Availability, stop time, cost and battery forecasts for nearby EV chargers." },
      { property: "og:title", content: "Charging Analytics — ChargeWise Pro" },
      { property: "og:description", content: "Visual insights into nearby EV charging options." },
    ],
  }),
  component: () => (
    <div className="space-y-5">
      <PageHeading title="Analytics" subtitle="How nearby chargers compare right now" />
      <ErrorBoundary title="Analytics"><AnalyticsCards /></ErrorBoundary>
      <Charts />
      <ErrorBoundary title="Score explanation"><ScoreExplanation /></ErrorBoundary>
    </div>
  ),
});
