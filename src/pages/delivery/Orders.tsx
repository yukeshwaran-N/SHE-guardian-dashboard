// src/pages/delivery/Orders.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import {
  Package,
  Search,
  RefreshCw,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  IndianRupee,
  Eye,
  EyeOff,
  Copy,
  User,
  Hash,
  CreditCard
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

interface Order {
  id: string;
  order_id: string;
  payment_id: string;
  amount: number;
  status: 'success' | 'pending' | 'failed' | 'refunded';
  item_name: string;
  item_id: string;
  payment_type: 'product' | 'consultation';
  user_id: string;
  created_at: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    pending: 0,
    totalAmount: 0,
    products: 0,
    consultations: 0
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = orders.filter(o => 
        o.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.order_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  }, [searchTerm, orders]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setOrders(data || []);
      setFilteredOrders(data || []);

      const successful = data?.filter(o => o.status === 'success') || [];
      setStats({
        total: data?.length || 0,
        success: successful.length,
        pending: data?.filter(o => o.status === 'pending').length || 0,
        totalAmount: successful.reduce((sum, o) => sum + o.amount, 0),
        products: data?.filter(o => o.payment_type === 'product').length || 0,
        consultations: data?.filter(o => o.payment_type === 'consultation').length || 0
      });

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Delivered</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" /> Processing</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-purple-100 text-purple-800"><RefreshCw className="h-3 w-3 mr-1" /> Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            My Orders
          </h1>
          <p className="text-gray-500 mt-1">
            Track your orders and purchases
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards - Simple */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{stats.success}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-500">Processing</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by product name or order ID..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Orders Grid - Product Focused */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredOrders.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-5">
                  {/* Product Image/Icon */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <Package className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">
                        {order.item_name || 'Product'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {order.payment_type}
                        </Badge>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  </div>

                  {/* Order Info - Minimal */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Order ID</span>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {order.order_id.slice(0, 12)}...
                      </code>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Date</span>
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                  </div>

                  {/* Price - Prominent */}
                  <div className="border-t pt-3 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Amount</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {formatCurrency(order.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setSelectedOrder(order);
                      setIsViewDialogOpen(true);
                      setShowPaymentDetails(false); // Hide payment details by default
                    }}
                  >
                    View Order Details
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Order Details Dialog - Payment Details Hidden by Default */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              {/* Product Section - Prominent */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-xl bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                    <Package className="h-10 w-10 text-purple-700" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedOrder.item_name}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{selectedOrder.payment_type}</Badge>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">Order ID</Label>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded mt-1">
                    {selectedOrder.order_id}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Order Date</Label>
                  <p className="font-medium mt-1">
                    {format(new Date(selectedOrder.created_at), 'dd MMM yyyy, hh:mm a')}
                  </p>
                </div>
              </div>

              {/* Amount - Prominent */}
              <div className="border-y py-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Amount</span>
                  <span className="text-3xl font-bold text-purple-600">
                    {formatCurrency(selectedOrder.amount)}
                  </span>
                </div>
              </div>

              {/* Toggle Payment Details */}
              <div className="border rounded-lg overflow-hidden">
                <button
                  className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                  onClick={() => setShowPaymentDetails(!showPaymentDetails)}
                >
                  <span className="font-medium">Payment Information</span>
                  {showPaymentDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                
                {showPaymentDetails && (
                  <div className="p-4 space-y-3">
                    <div>
                      <Label className="text-gray-500">Payment ID</Label>
                      <p className="font-mono text-sm">{selectedOrder.payment_id}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Item ID</Label>
                      <p className="font-mono text-sm">{selectedOrder.item_id || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">User ID</Label>
                      <p className="font-mono text-sm">{selectedOrder.user_id}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Copy Order ID */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(selectedOrder.order_id);
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Order ID
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}