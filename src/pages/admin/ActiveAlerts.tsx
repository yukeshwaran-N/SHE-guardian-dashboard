// src/pages/admin/ActiveAlerts.tsx
import { useState, useEffect } from "react";
import { alertsService } from "@/services/alertsService";
import { Alert } from "@/services/supabase";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ActiveAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await alertsService.getActiveAlerts();
      setAlerts(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching alerts:", err);
      setError("Failed to load alerts");
      toast({
        title: "Error",
        description: "Could not fetch alerts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await alertsService.resolveAlert(alertId);
      // Remove from local state
      setAlerts(alerts.filter(alert => alert.id !== alertId));
      toast({
        title: "Success",
        description: "Alert resolved successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-medium text-destructive">{error}</h3>
        <Button onClick={fetchAlerts} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Active Alerts</h1>
        <Button onClick={fetchAlerts} variant="outline">
          Refresh
        </Button>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              <CheckCircle className="mx-auto h-12 w-12 mb-4 text-green-500" />
              <h3 className="text-lg font-medium">No Active Alerts</h3>
              <p>All clear! No alerts at the moment.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <Card key={alert.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{alert.woman_name}</h3>
                      <StatusBadge status={alert.severity} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Type: {alert.type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Location: {alert.location}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Time: {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolveAlert(alert.id)}
                  >
                    Resolve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}