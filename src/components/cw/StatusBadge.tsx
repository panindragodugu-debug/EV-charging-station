import { cn } from "@/lib/utils";
import type { Badge, Availability } from "@/lib/chargewise/engine";

const tone: Record<Badge, string> = {
  Recommended: "bg-primary/15 text-primary border-primary/30",
  Fastest: "bg-success/15 text-success border-success/30",
  "Lowest Cost": "bg-success/10 text-success border-success/25",
  Available: "bg-success/10 text-success border-success/25",
  "Limited Availability": "bg-warning/15 text-warning border-warning/30",
  "Slow Charger": "bg-warning/10 text-warning border-warning/25",
  Occupied: "bg-destructive/15 text-destructive border-destructive/30",
  "Not Reachable": "bg-destructive/15 text-destructive border-destructive/30",
  Incompatible: "bg-muted text-muted-foreground border-border",
  "Too Far": "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ badge, className }: { badge: Badge; className?: string }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-semibold", tone[badge], className)}>
      {badge}
    </span>
  );
}

export const availTone: Record<Availability, { dot: string; text: string; label: string }> = {
  available: { dot: "bg-success", text: "text-success", label: "Available" },
  limited: { dot: "bg-warning", text: "text-warning", label: "Limited" },
  unavailable: { dot: "bg-destructive", text: "text-destructive", label: "Unavailable" },
};
