// src/pages/delivery/Inventory.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Package,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  Plus,
  Minus,
  Truck,
  Box,
  Layers,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const inventory = [
    {
      id: "INV001",
      name: "Sanitary Napkins - Regular",
      category: "Hygiene",
      quantity: 45,
      unit: "packs",
      threshold: 20,
      status: "good",
      lastRestocked: "2024-02-18",
      location: "Shelf A1"
    },
    {
      id: "INV002",
      name: "Prenatal Vitamins",
      category: "Medicine",
      quantity: 12,
      unit: "bottles",
      threshold: 15,
      status: "low",
      lastRestocked: "2024-02-10",
      location: "Shelf B2"
    },
    {
      id: "INV003",
      name: "Postnatal Care Kits",
      category: "Medical",
      quantity: 8,
      unit: "kits",
      threshold: 10,
      status: "critical",
      lastRestocked: "2024-02-15",
      location: "Shelf C3"
    },
    {
      id: "INV004",
      name: "Iron Supplements",
      category: "Medicine",
      quantity: 25,
      unit: "bottles",
      threshold: 20,
      status: "good",
      lastRestocked: "2024-02-17",
      location: "Shelf B3"
    },
    {
      id: "INV005",
      name: "Baby Diapers",
      category: "Baby Care",
      quantity: 32,
      unit: "packs",
      threshold: 25,
      status: "good",
      lastRestocked: "2024-02-19",
      location: "Shelf D1"
    },
    {
      id: "INV006",
      name: "Emergency Kits",
      category: "Medical",
      quantity: 5,
      unit: "kits",
      threshold: 8,
      status: "low",
      lastRestocked: "2024-02-14",
      location: "Shelf C1"
    }
  ];

  const categories = [...new Set(inventory.map(item => item.category))];
  
  const stats = {
    total: inventory.length,
    lowStock: inventory.filter(i => i.status === 'low' || i.status === 'critical').length,
    critical: inventory.filter(i => i.status === 'critical').length,
    good: inventory.filter(i => i.status === 'good').length
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'good': return 'bg-green-100 text-green-800 border-green-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200 animate-pulse';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'low': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Inventory Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your delivery inventory
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-teal-600 to-cyan-600">
            <Plus className="h-4 w-4 mr-2" />
            Request Stock
          </Button>
        </div>
      </div>

      {/* Alert Banner for Low Stock */}
      {stats.lowStock > 0 && (
        <Card className="border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  {stats.lowStock} items are running low on stock
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  {stats.critical} items critically low - Please restock soon
                </p>
              </div>
              <Button variant="outline" size="sm" className="bg-white">
                View All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Stock</p>
                <p className="text-2xl font-bold">{stats.good}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold">{stats.lowStock}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold">{stats.critical}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredInventory.map((item, idx) => (
          <Card key={item.id} className="group hover:shadow-xl transition-all animate-slide-in" style={{ animationDelay: `${idx * 100}ms` }}>
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.id}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
              </div>

              {/* Category and Location */}
              <div className="flex items-center gap-2 text-sm mb-3">
                <Badge variant="outline">{item.category}</Badge>
                <Badge variant="outline" className="bg-primary/5">
                  <Box className="h-3 w-3 mr-1" />
                  {item.location}
                </Badge>
              </div>

              {/* Quantity Indicator */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Stock</span>
                  <span className="font-medium">{item.quantity} {item.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Minimum Required</span>
                  <span className="font-medium">{item.threshold} {item.unit}</span>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Stock Level</span>
                    <span className={item.quantity < item.threshold ? 'text-red-600' : 'text-green-600'}>
                      {Math.round((item.quantity / item.threshold) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((item.quantity / item.threshold) * 100, 100)} 
                    className={`h-2 ${
                      item.quantity < item.threshold ? 'bg-red-100' : 'bg-green-100'
                    }`}
                    indicatorClassName={
                      item.quantity < item.threshold ? 'bg-red-500' : 'bg-green-500'
                    }
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-muted-foreground">
                  Last restocked: {item.lastRestocked}
                </p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredInventory.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No items found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search" : "Inventory is empty"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}