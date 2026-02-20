import { useState } from "react";
import { mockDeliveries } from "@/data/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import type { DeliveryRequest } from "@/types";
import { toast } from "sonner";

export default function AssignedDeliveries() {
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>(
    mockDeliveries.filter((d) => d.status !== "delivered")
  );

  const updateStatus = (id: string, newStatus: DeliveryRequest["status"]) => {
    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: newStatus, ...(newStatus === "delivered" ? { deliveredAt: new Date().toISOString() } : {}) }
          : d
      )
    );
    const labels = { accepted: "Delivery accepted", in_transit: "Delivery started", delivered: "Delivery completed!" };
    toast.success(labels[newStatus] || "Status updated");
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Assigned Deliveries</h2>
        <p className="text-sm text-muted-foreground">Manage your delivery assignments</p>
      </div>

      <div className="space-y-3">
        {deliveries.map((d) => (
          <div key={d.id} className="rounded-lg border bg-card p-4 shadow-sm animate-fade-in">
            <div className="flex flex-wrap items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-card-foreground">{d.requestId}</span>
                  <StatusBadge variant={d.priority} />
                  <StatusBadge variant={d.status} />
                </div>
                <p className="mt-1 text-sm text-card-foreground">{d.kitType}</p>
                <p className="mt-1 text-xs text-muted-foreground">📍 {d.location}</p>
                <p className="mt-1 text-xs text-muted-foreground">📞 {d.contact}</p>
              </div>

              <div className="flex flex-col gap-2">
                {d.status === "pending" && (
                  <Button size="sm" onClick={() => updateStatus(d.id, "accepted")}>Accept</Button>
                )}
                {d.status === "accepted" && (
                  <Button size="sm" onClick={() => updateStatus(d.id, "in_transit")}>Start Delivery</Button>
                )}
                {d.status === "in_transit" && (
                  <Button size="sm" variant="default" onClick={() => updateStatus(d.id, "delivered")}>Mark Delivered</Button>
                )}
              </div>
            </div>

            {/* Timeline */}
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
        {deliveries.length === 0 && (
          <p className="py-8 text-center text-muted-foreground">No pending deliveries</p>
        )}
      </div>
    </div>
  );
}
