// src/pages/admin/DeliveryStatus.tsx
import { useState, useEffect } from "react";
import { deliveriesService } from "@/services/deliveriesService";
import { supabase } from "@/services/supabase"; // Add this import
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Truck,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  MapPin,
  Phone,
  Calendar,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Printer,
  Mail,
  Loader2
} from "lucide-react";

// Import the Delivery type from your service
import { Delivery } from "@/services/supabase";

export default function DeliveryStatus() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf' | 'excel'>('csv');
  const [actionLoading, setActionLoading] = useState(false);
  const [deliveryPartners, setDeliveryPartners] = useState<{id: string, name: string}[]>([]);
  const [editForm, setEditForm] = useState({
    woman_name: '',
    address: '',
    contact: '',
    scheduled_date: '',
    items: '',
    order_id: ''
  });
  
  const { toast } = useToast();
  const itemsPerPage = 6;

  // Load deliveries from Supabase
  useEffect(() => {
    fetchDeliveries();
    fetchDeliveryPartners();
  }, []);

  useEffect(() => {
    let filtered = deliveries;
    
    if (searchTerm) {
      filtered = filtered.filter(d =>
        (d.woman_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.order_id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (d.address?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(d => d.status === statusFilter);
    }
    
    setFilteredDeliveries(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, deliveries]);

  // Fetch deliveries from Supabase
  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const data = await deliveriesService.getAllDeliveries();
      setDeliveries(data);
      setFilteredDeliveries(data);
      toast({
        title: "Success",
        description: `Loaded ${data.length} deliveries from database`,
      });
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      toast({
        title: "Error",
        description: "Failed to load deliveries from database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch delivery partners for assignment
  const fetchDeliveryPartners = async () => {
    try {
      // Fetch users with role 'delivery' from your users table
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('role', 'delivery');
      
      if (error) throw error;
      setDeliveryPartners(data || []);
    } catch (error) {
      console.error("Error fetching delivery partners:", error);
    }
  };

  // Export functionality
  const handleExport = async () => {
    setActionLoading(true);
    try {
      const dataToExport = filteredDeliveries;
      
      if (exportFormat === 'csv') {
        const csv = convertToCSV(dataToExport);
        downloadFile(csv, `deliveries_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
        toast({
          title: "Export Successful",
          description: `Exported ${dataToExport.length} deliveries as CSV`,
        });
      } else {
        toast({
          title: "Export Format",
          description: `${exportFormat.toUpperCase()} export coming soon`,
        });
      }
      setIsExportDialogOpen(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const convertToCSV = (data: Delivery[]) => {
    const headers = ['ID', 'Order ID', 'Woman Name', 'Address', 'Items', 'Status', 'Scheduled Date', 'Delivery Partner'];
    const rows = data.map(d => [
      d.id,
      d.order_id || '',
      d.woman_name || '',
      d.address || '',
      d.items ? (Array.isArray(d.items) ? d.items.join('; ') : JSON.stringify(d.items)) : '',
      d.status || '',
      d.scheduled_date || '',
      d.delivery_partner || ''
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  };

  const downloadFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Create new delivery in Supabase
  const handleCreateDelivery = async () => {
    setActionLoading(true);
    try {
      // Validate form
      if (!editForm.woman_name || !editForm.address) {
        throw new Error("Please fill all required fields");
      }

      const newDelivery = {
        id: `DEL${Date.now()}`,
        order_id: editForm.order_id || `ORD${Date.now()}`,
        woman_name: editForm.woman_name,
        address: editForm.address,
        items: editForm.items ? editForm.items.split(',').map(item => item.trim()) : [],
        status: 'pending',
        scheduled_date: editForm.scheduled_date || null,
        delivery_partner: null
      };

      const created = await deliveriesService.createDelivery(newDelivery);
      
      setDeliveries([created, ...deliveries]);
      setIsNewDialogOpen(false);
      setEditForm({
        woman_name: '',
        address: '',
        contact: '',
        scheduled_date: '',
        items: '',
        order_id: ''
      });
      
      toast({
        title: "Success",
        description: "New delivery created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create delivery",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Update delivery in Supabase
  const handleUpdateDelivery = async () => {
    if (!selectedDelivery) return;
    
    setActionLoading(true);
    try {
      const updatedDelivery = {
        ...selectedDelivery,
        woman_name: editForm.woman_name,
        address: editForm.address,
        scheduled_date: editForm.scheduled_date || null,
        items: editForm.items ? editForm.items.split(',').map(item => item.trim()) : selectedDelivery.items,
        order_id: editForm.order_id || selectedDelivery.order_id
      };

      const result = await deliveriesService.updateDelivery(selectedDelivery.id, updatedDelivery);
      
      setDeliveries(deliveries.map(d => 
        d.id === selectedDelivery.id ? result : d
      ));
      
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Delivery updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update delivery",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Assign delivery to partner
  const handleAssignDelivery = async (partnerId: string, partnerName: string) => {
    if (!selectedDelivery) return;
    
    setActionLoading(true);
    try {
      const updatedDelivery = await deliveriesService.assignDelivery(
        selectedDelivery.id, 
        partnerId
      );

      setDeliveries(deliveries.map(d => 
        d.id === selectedDelivery.id ? updatedDelivery : d
      ));
      
      setIsAssignDialogOpen(false);
      toast({
        title: "Success",
        description: `Delivery assigned to ${partnerName}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign delivery",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Update delivery status
  const handleUpdateStatus = async (delivery: Delivery, newStatus: string) => {
    try {
      const updatedDelivery = await deliveriesService.updateDeliveryStatus(
        delivery.id, 
        newStatus
      );
      
      setDeliveries(deliveries.map(d => 
        d.id === delivery.id ? updatedDelivery : d
      ));
      
      toast({
        title: "Status Updated",
        description: `Delivery status changed to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  // Delete/cancel delivery
  const handleConfirmDelete = async () => {
    if (!selectedDelivery) return;
    
    setActionLoading(true);
    try {
      await deliveriesService.deleteDelivery(selectedDelivery.id);
      
      setDeliveries(deliveries.filter(d => d.id !== selectedDelivery.id));
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Delivery cancelled successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel delivery",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Contact via phone (if contact field exists)
  const handleContact = (delivery: Delivery) => {
    toast({
      title: "Contact",
      description: "Contact feature coming soon",
    });
  };

  // Print delivery details
  const handlePrint = (delivery: Delivery) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Delivery Details - ${delivery.id}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; }
              .details { margin-top: 20px; }
              .row { margin: 10px 0; }
              .label { font-weight: bold; color: #666; }
            </style>
          </head>
          <body>
            <h1>Delivery Details</h1>
            <div class="details">
              <div class="row"><span class="label">ID:</span> ${delivery.id}</div>
              <div class="row"><span class="label">Order ID:</span> ${delivery.order_id || 'N/A'}</div>
              <div class="row"><span class="label">Woman Name:</span> ${delivery.woman_name || 'N/A'}</div>
              <div class="row"><span class="label">Address:</span> ${delivery.address || 'N/A'}</div>
              <div class="row"><span class="label">Items:</span> ${delivery.items ? (Array.isArray(delivery.items) ? delivery.items.join(', ') : JSON.stringify(delivery.items)) : 'N/A'}</div>
              <div class="row"><span class="label">Status:</span> ${delivery.status || 'N/A'}</div>
              <div class="row"><span class="label">Scheduled Date:</span> ${delivery.scheduled_date || 'N/A'}</div>
              ${delivery.delivery_partner ? `<div class="row"><span class="label">Delivery Partner:</span> ${delivery.delivery_partner}</div>` : ''}
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Email delivery details
  const handleEmail = (delivery: Delivery) => {
    const subject = `Delivery Update - ${delivery.id}`;
    const body = `
Delivery Details:
ID: ${delivery.id}
Order ID: ${delivery.order_id || 'N/A'}
Woman Name: ${delivery.woman_name || 'N/A'}
Address: ${delivery.address || 'N/A'}
Items: ${delivery.items ? (Array.isArray(delivery.items) ? delivery.items.join(', ') : JSON.stringify(delivery.items)) : 'N/A'}
Status: ${delivery.status || 'N/A'}
Scheduled Date: ${delivery.scheduled_date || 'N/A'}
    `.trim();
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    toast({
      title: "Email Client Opened",
      description: "Check your email client to send the details",
    });
  };

  const getStatusIcon = (status: string | null) => {
    switch(status) {
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-transit': return <Truck className="h-5 w-5 text-blue-500" />;
      case 'assigned': return <User className="h-5 w-5 text-yellow-500" />;
      case 'pending': return <Clock className="h-5 w-5 text-orange-500" />;
      case 'cancelled': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-transit': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assigned': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Note: priority doesn't exist in your table, so we'll use a default
  const getPriorityColor = (priority: string = 'medium') => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const stats = {
    total: deliveries.length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    inTransit: deliveries.filter(d => d.status === 'in-transit').length,
    pending: deliveries.filter(d => d.status === 'pending' || d.status === 'assigned').length,
    highPriority: 0 // Priority not in your table
  };

  const paginatedDeliveries = filteredDeliveries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Delivery Status
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage all health kit deliveries in real-time
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDeliveries} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsExportDialogOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600" onClick={() => setIsNewDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Delivery
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="hover-card cursor-pointer" onClick={() => setStatusFilter("all")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-card cursor-pointer" onClick={() => setStatusFilter("delivered")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Delivered</p>
                <p className="text-2xl font-bold">{stats.delivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-card cursor-pointer" onClick={() => setStatusFilter("in-transit")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Truck className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Transit</p>
                <p className="text-2xl font-bold">{stats.inTransit}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-card cursor-pointer" onClick={() => setStatusFilter("pending")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, woman name, address..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paginatedDeliveries.map((delivery) => (
          <Card key={delivery.id} className="hover-card overflow-hidden group">
            <CardContent className="p-5">
              {/* Header with ID and Actions */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(delivery.status)}
                  <div>
                    <p className="font-semibold">{delivery.id}</p>
                    {delivery.order_id && (
                      <p className="text-xs text-muted-foreground">Order: {delivery.order_id}</p>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      setSelectedDelivery(delivery);
                      setIsViewDialogOpen(true);
                    }}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSelectedDelivery(delivery);
                      setEditForm({
                        woman_name: delivery.woman_name || '',
                        address: delivery.address || '',
                        contact: '',
                        scheduled_date: delivery.scheduled_date || '',
                        items: delivery.items ? (Array.isArray(delivery.items) ? delivery.items.join(', ') : JSON.stringify(delivery.items)) : '',
                        order_id: delivery.order_id || ''
                      });
                      setIsEditDialogOpen(true);
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Delivery
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setSelectedDelivery(delivery);
                      setIsAssignDialogOpen(true);
                    }}>
                      <User className="h-4 w-4 mr-2" />
                      Assign Partner
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handlePrint(delivery)}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEmail(delivery)}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => {
                        setSelectedDelivery(delivery);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Cancel Delivery
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Woman Info */}
              <div className="mb-3">
                <h3 className="font-semibold text-lg">{delivery.woman_name || 'Unknown'}</h3>
                {delivery.address && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{delivery.address}</span>
                  </div>
                )}
              </div>

              {/* Items */}
              {delivery.items && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1">Items:</p>
                  <div className="flex flex-wrap gap-1">
                    {(Array.isArray(delivery.items) ? delivery.items : [delivery.items]).map((item, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {typeof item === 'string' ? item : JSON.stringify(item)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Status Update Buttons */}
              <div className="flex gap-1 mb-3">
                {delivery.status === 'pending' && (
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleUpdateStatus(delivery, 'assigned')}>
                    <User className="h-3 w-3 mr-1" />
                    Assign
                  </Button>
                )}
                {delivery.status === 'assigned' && (
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleUpdateStatus(delivery, 'in-transit')}>
                    <Truck className="h-3 w-3 mr-1" />
                    Start
                  </Button>
                )}
                {delivery.status === 'in-transit' && (
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => handleUpdateStatus(delivery, 'delivered')}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </Button>
                )}
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 mb-3">
                <Badge className={getStatusColor(delivery.status)}>
                  {delivery.status || 'Unknown'}
                </Badge>
              </div>

              {/* Progress Bar */}
              {delivery.status && delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>
                      {delivery.status === 'assigned' ? '25%' :
                       delivery.status === 'in-transit' ? '75%' : '0%'}
                    </span>
                  </div>
                  <Progress value={
                    delivery.status === 'assigned' ? 25 :
                    delivery.status === 'in-transit' ? 75 : 0
                  } className="h-1" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {paginatedDeliveries.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No deliveries found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? "Try adjusting your filters" 
                : "Get started by creating your first delivery"}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button onClick={() => setIsNewDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Delivery
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {filteredDeliveries.length > itemsPerPage && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredDeliveries.length)} of {filteredDeliveries.length} deliveries
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {[...Array(Math.ceil(filteredDeliveries.length / itemsPerPage))].map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredDeliveries.length / itemsPerPage), p + 1))}
              disabled={currentPage === Math.ceil(filteredDeliveries.length / itemsPerPage)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Delivery Details</DialogTitle>
            <DialogDescription>
              Complete information for delivery {selectedDelivery?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDelivery && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Delivery ID</Label>
                  <p className="font-medium">{selectedDelivery.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Order ID</Label>
                  <p className="font-medium">{selectedDelivery.order_id || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Woman Name</Label>
                  <p className="font-medium">{selectedDelivery.woman_name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(selectedDelivery.status)}>
                    {selectedDelivery.status || 'N/A'}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Address</Label>
                <p className="font-medium">{selectedDelivery.address || 'N/A'}</p>
              </div>

              {selectedDelivery.items && (
                <div>
                  <Label className="text-muted-foreground">Items</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(Array.isArray(selectedDelivery.items) ? selectedDelivery.items : [selectedDelivery.items]).map((item, idx) => (
                      <Badge key={idx} variant="secondary">{typeof item === 'string' ? item : JSON.stringify(item)}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Scheduled Date</Label>
                  <p className="font-medium">{selectedDelivery.scheduled_date || 'N/A'}</p>
                </div>
                {selectedDelivery.delivery_partner && (
                  <div>
                    <Label className="text-muted-foreground">Delivery Partner</Label>
                    <p className="font-medium">{selectedDelivery.delivery_partner}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => handlePrint(selectedDelivery!)}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Delivery Dialog */}
      <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Delivery</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new delivery
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="woman_name">Woman Name *</Label>
              <Input
                id="woman_name"
                value={editForm.woman_name}
                onChange={(e) => setEditForm({...editForm, woman_name: e.target.value})}
                placeholder="Enter woman's name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={editForm.address}
                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                placeholder="Full address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="items">Items (comma separated)</Label>
              <Input
                id="items"
                value={editForm.items}
                onChange={(e) => setEditForm({...editForm, items: e.target.value})}
                placeholder="e.g., Sanitary Kit, Vitamins, Nutrition Pack"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Scheduled Date</Label>
              <Input
                id="scheduled_date"
                type="date"
                value={editForm.scheduled_date}
                onChange={(e) => setEditForm({...editForm, scheduled_date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order_id">Order ID (Optional)</Label>
              <Input
                id="order_id"
                value={editForm.order_id}
                onChange={(e) => setEditForm({...editForm, order_id: e.target.value})}
                placeholder="e.g., ORD001"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDelivery} disabled={actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Delivery Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Delivery</DialogTitle>
            <DialogDescription>
              Update the delivery information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_woman_name">Woman Name</Label>
              <Input
                id="edit_woman_name"
                value={editForm.woman_name}
                onChange={(e) => setEditForm({...editForm, woman_name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_address">Address</Label>
              <Input
                id="edit_address"
                value={editForm.address}
                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_items">Items (comma separated)</Label>
              <Input
                id="edit_items"
                value={editForm.items}
                onChange={(e) => setEditForm({...editForm, items: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_scheduled_date">Scheduled Date</Label>
              <Input
                id="edit_scheduled_date"
                type="date"
                value={editForm.scheduled_date}
                onChange={(e) => setEditForm({...editForm, scheduled_date: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDelivery} disabled={actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Delivery Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Delivery Partner</DialogTitle>
            <DialogDescription>
              Select a delivery partner to assign this delivery to
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {deliveryPartners.length > 0 ? (
              deliveryPartners.map((partner) => (
                <div
                  key={partner.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleAssignDelivery(partner.id, partner.name)}
                >
                  <div>
                    <p className="font-medium">{partner.name}</p>
                    <p className="text-xs text-muted-foreground">Available now</p>
                  </div>
                  <Button size="sm" variant="outline">Select</Button>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No delivery partners available</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Delivery</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this delivery? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedDelivery && (
              <div className="space-y-2">
                <p><span className="font-medium">Delivery ID:</span> {selectedDelivery.id}</p>
                <p><span className="font-medium">Woman:</span> {selectedDelivery.woman_name || 'Unknown'}</p>
                {selectedDelivery.scheduled_date && (
                  <p><span className="font-medium">Scheduled:</span> {selectedDelivery.scheduled_date}</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              No, Keep it
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Yes, Cancel Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Deliveries</DialogTitle>
            <DialogDescription>
              Choose export format
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={exportFormat === 'csv' ? 'default' : 'outline'}
                  onClick={() => setExportFormat('csv')}
                >
                  CSV
                </Button>
                <Button
                  variant={exportFormat === 'pdf' ? 'default' : 'outline'}
                  onClick={() => setExportFormat('pdf')}
                >
                  PDF
                </Button>
                <Button
                  variant={exportFormat === 'excel' ? 'default' : 'outline'}
                  onClick={() => setExportFormat('excel')}
                >
                  Excel
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Data to Export</Label>
              <p className="text-sm text-muted-foreground">
                {filteredDeliveries.length} deliveries will be exported
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Download className="h-4 w-4 mr-2" />
              Export Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}