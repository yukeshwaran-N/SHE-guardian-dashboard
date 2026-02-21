// src/pages/delivery/MyPayments.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import {
  IndianRupee,
  Search,
  RefreshCw,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Package,
  Copy,
  Download,
  Eye,
  User,
  Hash,
  CreditCard,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface Payment {
  id: string;
  user_id: string | null;
  payment_id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  payment_type: 'product' | 'consultation' | null;
  item_id: string | null;
  item_name: string | null;
  razorpay_response: any | null;
  created_at: string;
  updated_at: string;
}

export default function MyPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
    totalAmount: 0,
    products: 0,
    consultations: 0
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = payments.filter(p => 
        p.payment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.item_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (p.user_id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
      setFilteredPayments(filtered);
    } else {
      setFilteredPayments(payments);
    }
  }, [searchTerm, payments]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setPayments(data || []);
      setFilteredPayments(data || []);

      // Calculate detailed stats
      const stats = {
        total: data?.length || 0,
        success: data?.filter(p => p.status === 'success').length || 0,
        pending: data?.filter(p => p.status === 'pending').length || 0,
        failed: data?.filter(p => p.status === 'failed').length || 0,
        refunded: data?.filter(p => p.status === 'refunded').length || 0,
        totalAmount: data?.reduce((sum, p) => sum + (p.status === 'success' ? p.amount : 0), 0) || 0,
        products: data?.filter(p => p.payment_type === 'product').length || 0,
        consultations: data?.filter(p => p.payment_type === 'consultation').length || 0
      };
      setStats(stats);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" /> Success
        </Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">
          <XCircle className="h-3 w-3 mr-1" /> Failed
        </Badge>;
      case 'refunded':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">
          <RefreshCw className="h-3 w-3 mr-1" /> Refunded
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentTypeBadge = (type: string | null) => {
    if (!type) return null;
    return type === 'product' 
      ? <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Product</Badge>
      : <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Consultation</Badge>;
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-gray-500">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Payments Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Complete payment transaction history
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchPayments}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards - More Detailed */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Transactions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {stats.products} Products • {stats.consultations} Consultations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Successful</p>
                <p className="text-2xl font-bold text-green-600">{stats.success}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {((stats.success / stats.total) * 100 || 0).toFixed(1)}% success rate
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending/Failed</p>
                <p className="text-2xl font-bold">
                  {stats.pending + stats.failed}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {stats.pending} pending • {stats.failed} failed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalAmount)}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Avg: {formatCurrency(stats.totalAmount / (stats.success || 1))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by payment ID, order ID, item, or user ID..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Payments Table - Now with ALL columns */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Payment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Item ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8 text-gray-500">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment, index) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {payment.payment_id.slice(0, 12)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(payment.payment_id)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {payment.order_id.slice(0, 12)}...
                      </code>
                    </TableCell>
                    <TableCell>
                      {payment.user_id ? (
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {payment.user_id.slice(0, 8)}...
                          </code>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-sm">{payment.item_name || '—'}</span>
                    </TableCell>
                    <TableCell>
                      {payment.item_id ? (
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {payment.item_id.slice(0, 8)}...
                        </code>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getPaymentTypeBadge(payment.payment_type)}
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-green-600">
                        {formatCurrency(payment.amount, payment.currency)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {payment.currency}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-500">
                        {formatDate(payment.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-400">
                        {payment.updated_at ? formatDate(payment.updated_at) : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Full Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Complete Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Payment ID</p>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedPayment.payment_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedPayment.order_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedPayment.user_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Item ID</p>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded">{selectedPayment.item_id || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Item Name</p>
                  <p className="font-medium">{selectedPayment.item_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Type</p>
                  <p className="font-medium capitalize">{selectedPayment.payment_type || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Currency</p>
                  <p className="font-medium">{selectedPayment.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div>{getStatusBadge(selectedPayment.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Created At</p>
                  <p>{formatDate(selectedPayment.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Updated At</p>
                  <p>{selectedPayment.updated_at ? formatDate(selectedPayment.updated_at) : 'N/A'}</p>
                </div>
              </div>

              {selectedPayment.razorpay_response && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Razorpay Response</p>
                  <pre className="text-xs bg-gray-100 p-3 rounded max-h-40 overflow-auto">
                    {JSON.stringify(selectedPayment.razorpay_response, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer Summary */}
      {filteredPayments.length > 0 && (
        <div className="text-sm text-gray-500 text-right">
          Showing {filteredPayments.length} of {payments.length} payments
        </div>
      )}
    </div>
  );
}