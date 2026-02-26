// src/pages/delivery/Orders.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Package,
  Search,
  Loader2,
  Eye,
  MapPin,
  Calendar,
  User,
  Phone,
  Clock,
  CheckCircle,
  Truck
} from "lucide-react";

interface Order {
  id: string;
  order_number: string;
  woman_name: string;
  woman_phone: string;
  address: string;
  items: { name: string; quantity: number }[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  order_date: string;
  delivery_date?: string;
}

export default function DeliveryOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockOrders: Order[] = [
        {
          id: "1",
          order_number: "ORD-001",
          woman_name: "Priya Sharma",
          woman_phone: "+91 98765 43210",
          address: "123 Main St, Block A, Sector 12",
          items: [
            { name: "Sanitary Kit", quantity: 2 },
            { name: "Nutrition Pack", quantity: 1 }
          ],
          status: "shipped",
          total_amount: 450,
          order_date: "2024-02-20",
          delivery_date: "2024-02-22"
        },
        {
          id: "2",
          order_number: "ORD-002",
          woman_name: "Sunita Patel",
          woman_phone: "+91 98765 43211",
          address: "456 Oak St, Block C, Sector 15",
          items: [
            { name: "Prenatal Vitamins", quantity: 1 },
            { name: "Health Supplements", quantity: 2 }
          ],
          status: "delivered",
          total_amount: 550,
          order_date: "2024-02-18",
          delivery_date: "2024-02-20"
        },
        {
          id: "3",
          order_number: "ORD-003",
          woman_name: "Lakshmi Devi",
          woman_phone: "+91 98765 43212",
          address: "789 Pine St, Block B, Sector 10",
          items: [
            { name: "Postnatal Care Kit", quantity: 1 }
          ],
          status: "processing",
          total_amount: 300,
          order_date: "2024-02-21"
        },
        {
          id: "4",
          order_number: "ORD-004",
          woman_name: "Kavita Singh",
          woman_phone: "+91 98765 43213",
          address: "321 Elm St, Block D, Sector 14",
          items: [
            { name: "Sanitary Kit", quantity: 3 },
            { name: "Prenatal Vitamins", quantity: 1 },
            { name: "Health Supplements", quantity: 1 }
          ],
          status: "pending",
          total_amount: 700,
          order_date: "2024-02-22"
        }
      ];
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (!searchTerm) {
      setFilteredOrders(orders);
      return;
    }

    const filtered = orders.filter(o =>
      o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.woman_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.woman_phone.includes(searchTerm)
    );
    setFilteredOrders(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'delivered':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Delivered</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-500"><Truck className="h-3 w-3 mr-1" /> Shipped</Badge>;
      case 'processing':
        return <Badge variant="secondary"><Package className="h-3 w-3 mr-1" /> Processing</Badge>;
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-muted-foreground mt-2">
          Track and manage your delivery orders
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {orders.filter(o => o.status === 'pending').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Processing</p>
            <p className="text-2xl font-bold text-blue-600">
              {orders.filter(o => o.status === 'processing' || o.status === 'shipped').length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Delivered</p>
            <p className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === 'delivered').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order number, woman name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={fetchOrders}>
          Refresh
        </Button>
      </div>

      {/* Orders Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <OrdersList 
            orders={filteredOrders} 
            onViewDetails={setSelectedOrder}
            setShowDetails={setShowDetails}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <OrdersList 
            orders={filteredOrders.filter(o => o.status === 'pending')} 
            onViewDetails={setSelectedOrder}
            setShowDetails={setShowDetails}
          />
        </TabsContent>

        <TabsContent value="processing" className="space-y-4">
          <OrdersList 
            orders={filteredOrders.filter(o => o.status === 'processing' || o.status === 'shipped')} 
            onViewDetails={setSelectedOrder}
            setShowDetails={setShowDetails}
          />
        </TabsContent>

        <TabsContent value="delivered" className="space-y-4">
          <OrdersList 
            orders={filteredOrders.filter(o => o.status === 'delivered')} 
            onViewDetails={setSelectedOrder}
            setShowDetails={setShowDetails}
          />
        </TabsContent>
      </Tabs>

      {/* Order Details Dialog */}
      {selectedOrder && showDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Order Details</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Number</p>
                    <p className="font-mono font-medium">{selectedOrder.order_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div>{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Customer Information</p>
                  <Card>
                    <CardContent className="p-3 space-y-2">
                      <p className="flex items-center"><User className="h-4 w-4 mr-2" /> {selectedOrder.woman_name}</p>
                      <p className="flex items-center"><Phone className="h-4 w-4 mr-2" /> {selectedOrder.woman_phone}</p>
                      <p className="flex items-start"><MapPin className="h-4 w-4 mr-2 mt-1" /> {selectedOrder.address}</p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Items</p>
                  <Card>
                    <CardContent className="p-3">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex justify-between py-2 border-b last:border-0">
                          <span>{item.name}</span>
                          <Badge variant="outline">x{item.quantity}</Badge>
                        </div>
                      ))}
                      <div className="flex justify-between mt-2 pt-2 border-t font-bold">
                        <span>Total</span>
                        <span>₹{selectedOrder.total_amount}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Date</p>
                    <p>{formatDate(selectedOrder.order_date)}</p>
                  </div>
                  {selectedOrder.delivery_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery Date</p>
                      <p>{formatDate(selectedOrder.delivery_date)}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowDetails(false)}>
                    Close
                  </Button>
                  {selectedOrder.status === 'processing' && (
                    <Button>Mark as Shipped</Button>
                  )}
                  {selectedOrder.status === 'shipped' && (
                    <Button>Mark as Delivered</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function OrdersList({ orders, onViewDetails, setShowDetails }: { 
  orders: Order[], 
  onViewDetails: (order: Order) => void,
  setShowDetails: (show: boolean) => void
}) {
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'delivered':
        return <Badge className="bg-green-500">Delivered</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-500">Shipped</Badge>;
      case 'processing':
        return <Badge variant="secondary">Processing</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No orders found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold">{order.order_number}</h3>
                  {getStatusBadge(order.status)}
                </div>
                <p className="text-sm">{order.woman_name}</p>
                <p className="text-sm text-muted-foreground">{order.items.length} items • ₹{order.total_amount}</p>
                <p className="text-xs text-muted-foreground flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(order.order_date).toLocaleDateString()}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  onViewDetails(order);
                  setShowDetails(true);
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}