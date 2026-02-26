// src/pages/admin/Inventory.tsx
import { useState, useEffect } from "react";
import { inventoryService, InventoryItem } from "@/services/inventoryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2,
  Package,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Archive,
  Filter,
  Download,
  Upload
} from "lucide-react";

export default function Inventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRestockDialogOpen, setIsRestockDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);
  const [formData, setFormData] = useState<any>({
    name: "",
    category: "",
    description: "",
    quantity: 0,
    unit: "",
    threshold: 10,
    price: 0,
    image_url: "",
    last_restocked: new Date().toISOString().split('T')[0]
  });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStock: 0,
    categories: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchStats();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchTerm, categoryFilter, stockFilter]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getAllItems();
      setItems(data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast({
        title: "Error",
        description: "Failed to load inventory",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await inventoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await inventoryService.getInventoryStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const filterItems = () => {
    let filtered = [...items];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    // Apply stock filter
    if (stockFilter === "low") {
      filtered = filtered.filter(item => 
        item.quantity <= (item.threshold || 10)
      );
    } else if (stockFilter === "out") {
      filtered = filtered.filter(item => item.quantity === 0);
    } else if (stockFilter === "active") {
      filtered = filtered.filter(item => item.is_active);
    } else if (stockFilter === "inactive") {
      filtered = filtered.filter(item => !item.is_active);
    }

    setFilteredItems(filtered);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (selectedItem) {
        // Update existing item
        await inventoryService.updateItem(selectedItem.id, formData);
        toast({
          title: "Success",
          description: "Item updated successfully",
        });
      } else {
        // Create new item
        await inventoryService.createItem(formData);
        toast({
          title: "Success",
          description: "Item added successfully",
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      await fetchItems();
      await fetchCategories();
      await fetchStats();
    } catch (error) {
      console.error("Error saving item:", error);
      toast({
        title: "Error",
        description: "Failed to save item",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRestock = async () => {
    if (!selectedItem) return;
    
    try {
      setSaving(true);
      await inventoryService.restockItem(selectedItem.id, restockAmount);
      await fetchItems();
      await fetchStats();
      setIsRestockDialogOpen(false);
      toast({
        title: "Success",
        description: `Added ${restockAmount} ${selectedItem.unit || 'units'} to inventory`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to restock item",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      await inventoryService.deleteItem(itemToDelete);
      await fetchItems();
      await fetchStats();
      toast({
        title: "Success",
        description: "Item deactivated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description || "",
      quantity: item.quantity,
      unit: item.unit || "",
      threshold: item.threshold || 10,
      price: item.price || 0,
      image_url: item.image_url || "",
      is_active: item.is_active,
      last_restocked: item.last_restocked || new Date().toISOString().split('T')[0]
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedItem(null);
    setFormData({
      name: "",
      category: "",
      description: "",
      quantity: 0,
      unit: "",
      threshold: 10,
      price: 0,
      image_url: "",
      last_restocked: new Date().toISOString().split('T')[0]
    });
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantity === 0) return { label: "Out of Stock", variant: "destructive" };
    if (item.quantity <= (item.threshold || 10)) return { label: "Low Stock", variant: "warning" };
    return { label: "In Stock", variant: "default" };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage products, stock levels, and restocking
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedItem ? "Edit Item" : "Add New Inventory Item"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Hygiene, Medicine, Nutrition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleNumberChange}
                    required
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    placeholder="packs, bottles, boxes"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="threshold">Low Stock Threshold</Label>
                  <Input
                    id="threshold"
                    name="threshold"
                    type="number"
                    value={formData.threshold}
                    onChange={handleNumberChange}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleNumberChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Item description..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    selectedItem ? "Update Item" : "Add Item"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{stats.totalItems}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inventory Value</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-2xl font-bold">{stats.lowStock}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold">{stats.categories}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="low">Low Stock</SelectItem>
                  <SelectItem value="out">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={filterItems}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Restocked</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No inventory items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  const stockStatus = getStockStatus(item);
                  return (
                    <TableRow key={item.id} className={!item.is_active ? "opacity-50" : ""}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={item.quantity <= (item.threshold || 10) ? "text-orange-600 font-medium" : ""}>
                          {item.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{item.unit || '-'}</TableCell>
                      <TableCell>{item.price ? formatCurrency(item.price) : '-'}</TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.variant as any}>
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{item.last_restocked || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsRestockDialogOpen(true);
                          }}
                          title="Restock"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setItemToDelete(item.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Restock Dialog */}
      <Dialog open={isRestockDialogOpen} onOpenChange={setIsRestockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock Item</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{selectedItem.name}</p>
                <p className="text-sm text-muted-foreground">
                  Current Quantity: {selectedItem.quantity} {selectedItem.unit || 'units'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="restock">Quantity to Add</Label>
                <Input
                  id="restock"
                  type="number"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(parseInt(e.target.value) || 0)}
                  min="1"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsRestockDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRestock} disabled={saving || restockAmount <= 0}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Restocking...
                    </>
                  ) : (
                    "Restock"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the item. It won't be visible in active inventory but data will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}