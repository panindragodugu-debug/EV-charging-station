import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { BarChart3, Heart, LayoutDashboard, MapPin, RefreshCw, Route as RouteIcon, Settings, User, Zap } from "lucide-react";
import { useChargeWise } from "@/lib/chargewise/store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/stations", label: "Stations", icon: MapPin },
  { to: "/route-planner", label: "Route Planner", icon: RouteIcon },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/favorites", label: "Favorites", icon: Heart },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
        <Zap className="h-5 w-5" fill="currentColor" aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-[15px] font-bold tracking-tight">ChargeWise</span>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Pro</span>
      </span>
    </Link>
  );
}

function useAgo(ts: number | null) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, [ts]);
  if (!ts || !now) return "Updated just now";
  const m = Math.floor((now - ts) / 60_000);
  return m < 1 ? "Updated just now" : `Updated ${m} min ago`;
}

export function AppHeader() {
  const { inputs, refresh, loading, lastUpdated } = useChargeWise();
  const ago = useAgo(lastUpdated);
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">EV Charge Finder</h1>
        <p className="mt-1 text-sm text-muted-foreground">Find the fastest and most reliable charging stop</p>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5">
          <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden />
          <span className="max-w-[180px] truncate">{inputs.location}</span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5 font-semibold text-success">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
          </span>
          Live
        </span>
        <span className="text-muted-foreground tabular" aria-live="polite">{loading ? "Updating…" : ago}</span>
        <button
          onClick={refresh}
          disabled={loading}
          aria-label="Refresh real-time station data"
          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} aria-hidden />
        </button>
        <Link to="/settings" aria-label="Settings" className="hidden h-9 w-9 place-items-center rounded-full border border-border bg-card hover:bg-accent sm:grid">
          <Settings className="h-4 w-4" aria-hidden />
        </Link>
        <span aria-label="Profile" className="grid h-9 w-9 place-items-center rounded-full bg-secondary">
          <User className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        <Logo />
        <nav aria-label="Main" className="mt-10 flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              aria-current={isActive(to) ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive(to) && "bg-sidebar-accent text-sidebar-foreground shadow-[inset_3px_0_0_var(--primary)]",
              )}
            >
              <Icon className={cn("h-4 w-4", isActive(to) && "text-primary")} aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border border-border bg-card p-4 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Demo data mode</p>
          <p className="mt-1">Using simulated live station data. Ready to connect a real charging network.</p>
        </div>
      </aside>

      <div className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
        <Logo />
      </div>

      <main className="px-4 pb-40 pt-5 sm:px-6 lg:ml-[248px] lg:px-8 lg:pb-12 lg:pt-8">
        <div className="mx-auto max-w-[1440px]">{children}</div>
      </main>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-border bg-sidebar/95 backdrop-blur lg:hidden">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            aria-label={label}
            aria-current={isActive(to) ? "page" : undefined}
            className={cn("flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] text-muted-foreground", isActive(to) && "text-primary")}
          >
            <Icon className="h-5 w-5" aria-hidden />
            <span className="truncate">{label.split(" ")[0]}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
