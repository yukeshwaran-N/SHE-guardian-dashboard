import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "destructive" | "warning" | "success";
  className?: string;
}

const iconBg: Record<string, string> = {
  default: "bg-primary/10 text-primary",
  destructive: "bg-destructive/10 text-destructive",
  warning: "bg-warning/10 text-warning",
  success: "bg-success/10 text-success",
};

export function SummaryCard({ title, value, icon: Icon, variant = "default", className }: SummaryCardProps) {
  return (
    <div className={cn("rounded-lg border bg-card p-5 shadow-sm animate-fade-in", className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-bold text-card-foreground">{value}</p>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg", iconBg[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
