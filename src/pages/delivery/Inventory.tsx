// src/pages/delivery/Inventory.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Package,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Plus,
  Minus,
  Truck,
  Box,
  TrendingUp,
  TrendingDown,
  Bell,
  AlertOctagon,
  Loader2,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Archive,
  ShoppingCart
} from "lucide-react";

interface InventoryItem {
  id: string;
  name: string | null;
  category: string | null;
  quantity: number | null;
  unit: string | null;
  threshold: number | null;
  last_restocked: string | null;
}

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [restockAmount, setRestockAmount] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    threshold: 0
  });

  const { toast } = useToast();

  // Fetch inventory from Supabase
  useEffect(() => {
    fetchInventory();

    const subscription = supabase
      .channel('inventory-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'inventory' 
      }, () => {
        fetchInventory(true);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    filterInventory();
  }, [searchTerm, categoryFilter, statusFilter, inventory]);

  const fetchInventory = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name');

      if (error) throw error;
      
      setInventory(data || []);
      setFilteredInventory(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory",
        variant: "destructive",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const filterInventory = () => {
    let filtered = [...inventory];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(term) ||
        item.id?.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      switch(statusFilter) {
        case "low":
          filtered = filtered.filter(item => 
            item.quantity !== null && 
            item.threshold !== null && 
            item.quantity <= item.threshold
          );
          break;
        case "critical":
          filtered = filtered.filter(item => 
            item.quantity !== null && 
            item.threshold !== null && 
            item.quantity <= item.threshold * 0.5
          );
          break;
        case "healthy":
          filtered = filtered.filter(item => 
            item.quantity !== null && 
            item.threshold !== null && 
            item.quantity > item.threshold
          );
          break;
      }
    }

    setFilteredInventory(filtered);
  };

  const handleRestock = async () => {
    if (!selectedItem) return;
    setActionLoading(true);

    try {
      const newQuantity = (selectedItem.quantity || 0) + restockAmount;
      
      const { error } = await supabase
        .from('inventory')
        .update({ 
          quantity: newQuantity,
          last_restocked: new Date().toISOString().split('T')[0]
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      setInventory(prev => prev.map(item => 
        item.id === selectedItem.id 
          ? { 
              ...item, 
              quantity: newQuantity,
              last_restocked: new Date().toISOString().split('T')[0]
            }
          : item
      ));

      setIsRestockDialogOpen(false);
      toast({
        title: "Restock Successful",
        description: `${selectedItem.name} updated to ${newQuantity} ${selectedItem.unit}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restock item",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedItem) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('inventory')
        .update({
          name: editForm.name,
          category: editForm.category,
          quantity: editForm.quantity,
          unit: editForm.unit,
          threshold: editForm.threshold
        })
        .eq('id', selectedItem.id);

      if (error) throw error;

      await fetchInventory(true);
      setIsEditDialogOpen(false);
      toast({
        title: "Success",
        description: "Item updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === null || item.threshold === null || item.threshold === 0) {
      return { label: 'Unknown', color: 'bg-gray-100 text-gray-800', icon: Package };
    }
    
    const ratio = item.quantity / item.threshold;
    if (ratio <= 0.3) return { label: 'Critical', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertOctagon };
    if (ratio <= 0.5) return { label: 'Low', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertTriangle };
    if (ratio <= 0.8) return { label: 'Warning', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock };
    return { label: 'Healthy', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle };
  };

  const categories = [...new Set(inventory.map(item => item.category).filter(Boolean))];

  const lowStockItems = inventory.filter(item => 
    item.quantity !== null && 
    item.threshold !== null && 
    item.quantity <= item.threshold
  );

  const criticalItems = inventory.filter(item => 
    item.quantity !== null && 
    item.threshold !== null && 
    item.quantity <= item.threshold * 0.5
  );

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Inventory Management
          </h1>
          <p className="text-gray-500 mt-1">
            {inventory.length} total items • {lowStockItems.length} low stock • {criticalItems.length} critical
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchInventory()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="text-2xl font-bold">{inventory.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertOctagon className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Critical</p>
                <p className="text-2xl font-bold">{criticalItems.length}</p>
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
                <p className="text-sm text-gray-500">Healthy</p>
                <p className="text-2xl font-bold">{inventory.length - lowStockItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert Banner */}
      {criticalItems.length > 0 && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertOctagon className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <p className="font-medium text-red-800">
                  {criticalItems.length} items critically low
                </p>
                <p className="text-sm text-red-600">
                  These items need immediate restock
                </p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="bg-white"
                onClick={() => setStatusFilter("critical")}
              >
                View Items
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, ID, category..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                Category
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat || ''}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                Stock Status
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="low">Low Stock</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Item</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Category</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Stock</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Last Restocked</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-500">
                    No items found
                  </td>
                </tr>
              ) : (
                filteredInventory.map((item) => {
                  const status = getStockStatus(item);
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-gray-500">{item.id}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{item.category}</Badge>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{item.quantity ?? 0} {item.unit}</p>
                          <p className="text-xs text-gray-500">Threshold: {item.threshold ?? 0}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {item.last_restocked ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {new Date(item.last_restocked).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-gray-400">Never</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {item.quantity !== null && 
                           item.threshold !== null && 
                           item.quantity <= item.threshold && (
                            <Button
                              size="sm"
                              className="bg-teal-600 text-white hover:bg-teal-700"
                              onClick={() => {
                                setSelectedItem(item);
                                setRestockAmount(item.threshold! - item.quantity! + 10);
                                setIsRestockDialogOpen(true);
                              }}
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Restock
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Item Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedItem.name}</h3>
                <p className="text-sm text-gray-500">ID: {selectedItem.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="font-medium">{selectedItem.category || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-500">Unit</p>
                  <p className="font-medium">{selectedItem.unit || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-500">Current Stock</p>
                  <p className="font-medium">{selectedItem.quantity ?? 0} {selectedItem.unit}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-xs text-gray-500">Threshold</p>
                  <p className="font-medium">{selectedItem.threshold ?? 0} {selectedItem.unit}</p>
                </div>
                {selectedItem.last_restocked && (
                  <div className="col-span-2 bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-500">Last Restocked</p>
                    <p className="font-medium">{new Date(selectedItem.last_restocked).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restock Dialog */}
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock Item</DialogTitle>
            <DialogDescription>
              Enter the quantity to add to inventory
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{selectedItem.name}</p>
                <p className="text-sm text-gray-500">
                  Current: {selectedItem.quantity ?? 0} {selectedItem.unit}
                </p>
                <p className="text-sm text-gray-500">
                  Threshold: {selectedItem.threshold ?? 0} {selectedItem.unit}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="restock">Quantity to Add</Label>
                <Input
                  id="restock"
                  type="number"
                  min={1}
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="bg-blue-50 p-3 rounded">
                <p className="text-sm text-blue-800">
                  New total: {(selectedItem.quantity || 0) + restockAmount} {selectedItem.unit}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRestock}
              disabled={actionLoading || restockAmount <= 0}
              className="bg-teal-600 text-white hover:bg-teal-700"
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Restock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}