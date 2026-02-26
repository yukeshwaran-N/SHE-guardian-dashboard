// src/pages/delivery/DeliveryDashboard.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { deliveriesService, Delivery } from "@/services/deliveriesService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Search,
  Loader2,
  Navigation,
  AlertCircle
} from "lucide-react";

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [stats, setStats] = useState({
    assigned: 0,
    inTransit: 0,
    delivered: 0,
    total: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchDeliveries();
    }
  }, [user]);

  useEffect(() => {
    filterDeliveries();
  }, [deliveries, searchTerm]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      if (user?.role === 'delivery') {
        const data = await deliveriesService.getDeliveriesByPartner(user.id);
        setDeliveries(data);
        
        // Calculate stats
        const assigned = data.filter(d => d.status === 'assigned').length;
        const inTransit = data.filter(d => d.status === 'in-transit').length;
        const delivered = data.filter(d => d.status === 'delivered').length;
        
        setStats({
          assigned,
          inTransit,
          delivered,
          total: data.length
        });
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

  const filterDeliveries = () => {
    if (!searchTerm) {
      setFilteredDeliveries(deliveries);
      return;
    }

    const filtered = deliveries.filter(delivery =>
      delivery.woman_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.woman_phone?.includes(searchTerm) ||
      delivery.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredDeliveries(filtered);
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setUpdating(true);
      await deliveriesService.updateStatus(id, newStatus);
      
      // Update local state
      setDeliveries(prev =>
        prev.map(d => d.id === id ? { ...d, status: newStatus as any } : d)
      );
      
      if (selectedDelivery?.id === id) {
        setSelectedDelivery({ ...selectedDelivery, status: newStatus as any });
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

  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case 'assigned': return 'secondary';
      case 'in-transit': return 'warning';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'assigned': return <Clock className="h-4 w-4" />;
      case 'in-transit': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const openInGoogleMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Delivery Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user?.full_name}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Assigned</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assigned</p>
              <p className="text-2xl font-bold">{stats.assigned}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <Truck className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Transit</p>
              <p className="text-2xl font-bold">{stats.inTransit}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Delivered</p>
              <p className="text-2xl font-bold">{stats.delivered}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deliveries by order number, woman name, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={fetchDeliveries}>
          Refresh
        </Button>
      </div>

      {/* Deliveries Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Deliveries</TabsTrigger>
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
          <TabsTrigger value="in-transit">In Transit</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <DeliveryTable 
            deliveries={filteredDeliveries}
            onViewDetails={(delivery) => {
              setSelectedDelivery(delivery);
              setIsDetailsOpen(true);
            }}
            onStatusUpdate={handleStatusUpdate}
            updating={updating}
          />
        </TabsContent>

        <TabsContent value="assigned" className="space-y-4">
          <DeliveryTable 
            deliveries={filteredDeliveries.filter(d => d.status === 'assigned')}
            onViewDetails={(delivery) => {
              setSelectedDelivery(delivery);
              setIsDetailsOpen(true);
            }}
            onStatusUpdate={handleStatusUpdate}
            updating={updating}
          />
        </TabsContent>

        <TabsContent value="in-transit" className="space-y-4">
          <DeliveryTable 
            deliveries={filteredDeliveries.filter(d => d.status === 'in-transit')}
            onViewDetails={(delivery) => {
              setSelectedDelivery(delivery);
              setIsDetailsOpen(true);
            }}
            onStatusUpdate={handleStatusUpdate}
            updating={updating}
          />
        </TabsContent>

        <TabsContent value="delivered" className="space-y-4">
          <DeliveryTable 
            deliveries={filteredDeliveries.filter(d => d.status === 'delivered')}
            onViewDetails={(delivery) => {
              setSelectedDelivery(delivery);
              setIsDetailsOpen(true);
            }}
            onStatusUpdate={handleStatusUpdate}
            updating={updating}
          />
        </TabsContent>
      </Tabs>

      {/* Delivery Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Delivery Details</DialogTitle>
          </DialogHeader>
          {selectedDelivery && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Order Information</h3>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Order #:</span>{' '}
                      {selectedDelivery.order_number}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Status:</span>{' '}
                      <Badge variant={getStatusBadgeVariant(selectedDelivery.status)}>
                        {selectedDelivery.status}
                      </Badge>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Scheduled:</span>{' '}
                      {selectedDelivery.scheduled_date || 'Not scheduled'}
                    </p>
                    {selectedDelivery.delivered_date && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Delivered:</span>{' '}
                        {selectedDelivery.delivered_date}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold">Woman Information</h3>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm flex items-center">
                      <User className="h-3 w-3 mr-2" />
                      {selectedDelivery.woman_name}
                    </p>
                    {selectedDelivery.woman_phone && (
                      <p className="text-sm flex items-center">
                        <Phone className="h-3 w-3 mr-2" />
                        {selectedDelivery.woman_phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold">Delivery Address</h3>
                <p className="text-sm mt-1">{selectedDelivery.address}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => openInGoogleMaps(selectedDelivery.address)}
                >
                  <Navigation className="h-3 w-3 mr-2" />
                  Open in Maps
                </Button>
              </div>

              <div>
                <h3 className="font-semibold">Items</h3>
                <div className="mt-2 space-y-2">
                  {selectedDelivery.items && selectedDelivery.items.length > 0 ? (
                    selectedDelivery.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm border-b pb-1">
                        <span>{item.name || item}</span>
                        {item.quantity && <span>x{item.quantity}</span>}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No items listed</p>
                  )}
                </div>
              </div>

              {selectedDelivery.notes && (
                <div>
                  <h3 className="font-semibold">Notes</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selectedDelivery.notes}</p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                {selectedDelivery.status === 'assigned' && (
                  <Button
                    onClick={() => {
                      handleStatusUpdate(selectedDelivery.id, 'in-transit');
                      setIsDetailsOpen(false);
                    }}
                    disabled={updating}
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Start Delivery
                  </Button>
                )}
                {selectedDelivery.status === 'in-transit' && (
                  <Button
                    onClick={() => {
                      handleStatusUpdate(selectedDelivery.id, 'delivered');
                      setIsDetailsOpen(false);
                    }}
                    disabled={updating}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Delivered
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Delivery Table Component
function DeliveryTable({ 
  deliveries, 
  onViewDetails, 
  onStatusUpdate,
  updating 
}: { 
  deliveries: Delivery[];
  onViewDetails: (delivery: Delivery) => void;
  onStatusUpdate: (id: string, status: string) => void;
  updating: boolean;
}) {
  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case 'assigned': return 'secondary';
      case 'in-transit': return 'warning';
      case 'delivered': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  if (deliveries.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No deliveries found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Woman</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.map((delivery) => (
              <TableRow key={delivery.id}>
                <TableCell className="font-medium">{delivery.order_number}</TableCell>
                <TableCell>
                  <div>
                    <p>{delivery.woman_name}</p>
                    {delivery.woman_phone && (
                      <p className="text-xs text-muted-foreground">{delivery.woman_phone}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="text-sm truncate max-w-[200px]">{delivery.address}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {delivery.scheduled_date || 'TBD'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(delivery.status)}>
                    {delivery.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(delivery)}
                  >
                    View Details
                  </Button>
                  {delivery.status === 'assigned' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStatusUpdate(delivery.id, 'in-transit')}
                      disabled={updating}
                    >
                      Start
                    </Button>
                  )}
                  {delivery.status === 'in-transit' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStatusUpdate(delivery.id, 'delivered')}
                      disabled={updating}
                    >
                      Complete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}