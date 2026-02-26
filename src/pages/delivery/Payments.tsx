// src/pages/delivery/Payments.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  IndianRupee,
  Search,
  Loader2,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

interface Payment {
  id: string;
  payment_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  payment_type: 'product' | 'consultation';
  item_name: string;
  created_at: string;
}

export default function DeliveryPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockPayments: Payment[] = [
        {
          id: "1",
          payment_id: "PAY-001",
          amount: 500,
          currency: "INR",
          status: "success",
          payment_type: "product",
          item_name: "Sanitary Kit",
          created_at: "2024-02-20T10:30:00"
        },
        {
          id: "2",
          payment_id: "PAY-002",
          amount: 300,
          currency: "INR",
          status: "pending",
          payment_type: "consultation",
          item_name: "Video Consultation",
          created_at: "2024-02-21T14:15:00"
        },
        {
          id: "3",
          payment_id: "PAY-003",
          amount: 750,
          currency: "INR",
          status: "success",
          payment_type: "product",
          item_name: "Health Supplements",
          created_at: "2024-02-19T09:45:00"
        },
        {
          id: "4",
          payment_id: "PAY-004",
          amount: 200,
          currency: "INR",
          status: "failed",
          payment_type: "product",
          item_name: "Prenatal Vitamins",
          created_at: "2024-02-18T16:20:00"
        }
      ];
      setPayments(mockPayments);
      setFilteredPayments(mockPayments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast({
        title: "Error",
        description: "Failed to load payments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    if (!searchTerm) {
      setFilteredPayments(payments);
      return;
    }

    const filtered = payments.filter(p =>
      p.payment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPayments(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'success':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Success</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      case 'refunded':
        return <Badge variant="outline">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalEarnings = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + p.amount, 0);

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
        <h1 className="text-3xl font-bold">My Payments</h1>
        <p className="text-muted-foreground mt-2">
          View your payment history and earnings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <IndianRupee className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold">₹{totalEarnings}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Successful</p>
              <p className="text-2xl font-bold">{payments.filter(p => p.status === 'success').length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{payments.filter(p => p.status === 'pending').length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by payment ID, item, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={fetchPayments}>
          Refresh
        </Button>
      </div>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-sm">{payment.payment_id}</TableCell>
                    <TableCell>{payment.item_name}</TableCell>
                    <TableCell className="capitalize">{payment.payment_type}</TableCell>
                    <TableCell className="font-medium">₹{payment.amount}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(payment.created_at)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Statement
        </Button>
      </div>
    </div>
  );
}