// src/pages/delivery/AssignedDeliveries.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { deliveriesService, Delivery } from "@/services/deliveriesService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  User,
  Calendar,
  Loader2,
  Navigation
} from "lucide-react";

export default function AssignedDeliveries() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchDeliveries();
    }
  }, [user]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      if (user?.role === 'delivery') {
        const data = await deliveriesService.getDeliveriesByPartner(user.id);
        // Filter only assigned and in-transit deliveries
        setDeliveries(data.filter(d => d.status === 'assigned' || d.status === 'in-transit'));
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      toast({
        title: "Error",
        description: "Failed to load deliveries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setUpdating(true);
      await deliveriesService.updateStatus(id, newStatus);
      
      // Remove from list if delivered
      if (newStatus === 'delivered') {
        setDeliveries(prev => prev.filter(d => d.id !== id));
      } else {
        setDeliveries(prev =>
          prev.map(d => d.id === id ? { ...d, status: newStatus as any } : d)
        );
      }
      
      toast({
        title: "Success",
        description: `Delivery status updated to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const openInGoogleMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case 'assigned': return 'secondary';
      case 'in-transit': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Assigned Deliveries</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your current deliveries
        </p>
      </div>

      {deliveries.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium">No active deliveries</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You don't have any assigned deliveries at the moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {deliveries.map((delivery) => (
            <Card key={delivery.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{delivery.order_number}</h3>
                        <Badge variant={getStatusBadgeVariant(delivery.status)} className="mt-1">
                          {delivery.status === 'assigned' ? (
                            <><Clock className="h-3 w-3 mr-1" /> Ready to Start</>
                          ) : (
                            <><Truck className="h-3 w-3 mr-1" /> In Transit</>
                          )}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Scheduled</p>
                        <p className="font-medium">{delivery.scheduled_date || 'ASAP'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="text-sm text-muted-foreground">Woman</p>
                        <p className="font-medium flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {delivery.woman_name}
                        </p>
                        {delivery.woman_phone && (
                          <p className="text-sm flex items-center mt-1">
                            <Phone className="h-3 w-3 mr-2" />
                            {delivery.woman_phone}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Delivery Address</p>
                        <p className="text-sm flex items-start">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{delivery.address}</span>
                        </p>
                      </div>
                    </div>

                    {delivery.items && delivery.items.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Items</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {delivery.items.map((item: any, index: number) => (
                            <Badge key={index} variant="outline">
                              {item.name || item}
                              {item.quantity && ` (x${item.quantity})`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => openInGoogleMaps(delivery.address)}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Navigate
                    </Button>
                    
                    {delivery.status === 'assigned' && (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleStatusUpdate(delivery.id, 'in-transit')}
                        disabled={updating}
                      >
                        <Truck className="h-4 w-4 mr-2" />
                        Start Delivery
                      </Button>
                    )}
                    
                    {delivery.status === 'in-transit' && (
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleStatusUpdate(delivery.id, 'delivered')}
                        disabled={updating}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Delivered
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}