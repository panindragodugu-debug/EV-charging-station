import { createFileRoute } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { PageHeading } from "@/components/cw/PageHeading";
import { StatusBadge } from "@/components/cw/StatusBadge";
import { useChargeWise } from "@/lib/chargewise/store";
import { fmtMin } from "@/lib/chargewise/engine";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Favorite Stations — ChargeWise Pro" },
      { name: "description", content: "Your saved EV charging stations with live availability." },
      { property: "og:title", content: "Favorite Stations — ChargeWise Pro" },
      { property: "og:description", content: "Quick access to the chargers you trust." },
    ],
  }),
  component: Favorites,
});

function Favorites() {
  const { results, favorites, openDrawer } = useChargeWise();
  const favs = results.filter((r) => favorites.includes(r.station.id));
  return (
    <div className="space-y-5">
      <PageHeading title="Favorites" subtitle="Chargers you've saved" />
      {favs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          <Heart className="mx-auto h-6 w-6" aria-hidden />
          <p className="mt-2">No favorites yet. Open any station and tap the heart to save it.</p>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {favs.map((r) => (
            <li key={r.station.id}>
              <button onClick={() => openDrawer(r.station.id)} className="w-full rounded-2xl border border-border bg-card p-5 text-left shadow-card hover:border-primary/40">
                <p className="font-semibold">{r.station.name}</p>
                <p className="text-xs text-muted-foreground">{r.station.address}</p>
                <div className="mt-2 flex flex-wrap gap-1">{r.badges.map((b) => <StatusBadge key={b} badge={b} />)}</div>
                <p className="mt-3 text-sm tabular">{r.station.available}/{r.station.total} free · {fmtMin(r.totalMin)} total stop</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
