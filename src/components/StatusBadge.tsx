import { cn } from "@/lib/utils";

type Variant = "red" | "yellow" | "green" | "urgent" | "normal" | "high" | "medium" | "low" | "pending" | "accepted" | "in_transit" | "delivered" | "active" | "inactive" | "assigned" | "resolved";

const variantStyles: Record<Variant, string> = {
  red: "bg-destructive/15 text-destructive border-destructive/30",
  yellow: "bg-warning/15 text-warning-foreground border-warning/30",
  green: "bg-success/15 text-success border-success/30",
  urgent: "bg-destructive/15 text-destructive border-destructive/30",
  normal: "bg-info/15 text-info border-info/30",
  high: "bg-destructive/15 text-destructive border-destructive/30",
  medium: "bg-warning/15 text-warning-foreground border-warning/30",
  low: "bg-success/15 text-success border-success/30",
  pending: "bg-warning/15 text-warning-foreground border-warning/30",
  accepted: "bg-info/15 text-info border-info/30",
  in_transit: "bg-primary/15 text-primary border-primary/30",
  delivered: "bg-success/15 text-success border-success/30",
  active: "bg-success/15 text-success border-success/30",
  inactive: "bg-muted text-muted-foreground border-border",
  assigned: "bg-info/15 text-info border-info/30",
  resolved: "bg-muted text-muted-foreground border-border",
};

const labels: Record<Variant, string> = {
  red: "RED", yellow: "YELLOW", green: "GREEN",
  urgent: "Urgent", normal: "Normal",
  high: "High Risk", medium: "Medium Risk", low: "Low Risk",
  pending: "Pending", accepted: "Accepted", in_transit: "In Transit", delivered: "Delivered",
  active: "Active", inactive: "Inactive", assigned: "Assigned", resolved: "Resolved",
};

export function StatusBadge({ variant, className }: { variant: Variant; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", variantStyles[variant], className)}>
      {labels[variant]}
    </span>
  );
}
