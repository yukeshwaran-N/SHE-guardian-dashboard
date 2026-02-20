import { mockInventory } from "@/data/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { AlertTriangle } from "lucide-react";

export default function Inventory() {
  const lowStockItems = mockInventory.filter((i) => i.lowStock);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Inventory</h2>
        <p className="text-sm text-muted-foreground">Available health kits and supplies</p>
      </div>

      {/* Low stock alert */}
      {lowStockItems.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-warning shrink-0" />
          <div>
            <p className="text-sm font-semibold text-warning-foreground">Low Stock Alert</p>
            <p className="text-xs text-muted-foreground">
              {lowStockItems.map((i) => i.name).join(", ")} — please request restock.
            </p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50 text-left">
              <th className="px-4 py-3 font-medium text-muted-foreground">Item</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Available</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Total</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {mockInventory.map((item) => (
              <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-card-foreground">{item.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.category}</td>
                <td className="px-4 py-3 text-card-foreground">
                  <div className="flex items-center gap-2">
                    <span>{item.available}</span>
                    {/* Stock bar */}
                    <div className="h-1.5 w-16 rounded-full bg-border">
                      <div
                        className={`h-1.5 rounded-full ${item.lowStock ? "bg-destructive" : "bg-primary"}`}
                        style={{ width: `${(item.available / item.total) * 100}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{item.total}</td>
                <td className="px-4 py-3">
                  {item.lowStock ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                      Low Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                      In Stock
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
