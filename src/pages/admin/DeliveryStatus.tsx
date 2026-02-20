import { mockDeliveries } from "@/data/mockData";
import { StatusBadge } from "@/components/StatusBadge";

export default function DeliveryStatus() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Delivery Status</h2>
        <p className="text-sm text-muted-foreground">Track all health kit deliveries</p>
      </div>

      <div className="space-y-3">
        {mockDeliveries.map((d) => (
          <div key={d.id} className="rounded-lg border bg-card p-4 shadow-sm animate-fade-in">
            <div className="flex flex-wrap items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-card-foreground">{d.requestId}</span>
                  <StatusBadge variant={d.priority} />
                  <StatusBadge variant={d.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{d.kitType}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  📍 {d.location} · 📞 {d.contact}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Requested: {new Date(d.requestedAt).toLocaleString()}
                  {d.assignedTo && ` · Assigned: ${d.assignedTo}`}
                  {d.deliveredAt && ` · Delivered: ${new Date(d.deliveredAt).toLocaleString()}`}
                </p>
              </div>
            </div>

            {/* Status timeline */}
            <div className="mt-3 flex items-center gap-1 text-xs">
              {(["pending", "accepted", "in_transit", "delivered"] as const).map((step, i) => {
                const steps = ["pending", "accepted", "in_transit", "delivered"];
                const currentIdx = steps.indexOf(d.status);
                const done = i <= currentIdx;
                return (
                  <div key={step} className="flex items-center gap-1">
                    <div className={`h-2 w-2 rounded-full ${done ? "bg-primary" : "bg-border"}`} />
                    <span className={done ? "text-primary font-medium" : "text-muted-foreground"}>
                      {step === "in_transit" ? "In Transit" : step.charAt(0).toUpperCase() + step.slice(1)}
                    </span>
                    {i < 3 && <div className={`h-px w-4 ${done && i < currentIdx ? "bg-primary" : "bg-border"}`} />}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
