// src/pages/delivery/AssignedDeliveries.tsx
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  MapPin,
  Phone,
  Calendar,
  Package,
  Clock,
  Navigation,
  CheckCircle,
  AlertCircle,
  Filter,
  SortAsc,
  RefreshCw,
  User,
  Home,
  Briefcase
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function AssignedDeliveries() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");

  const deliveries = [
    {
      id: "DEL001",
      priority: "high",
      womanName: "Priya Sharma",
      address: "House 123, Block A, Sector 12",
      items: ["Sanitary Kit", "Nutrition Pack", "Vitamins"],
      scheduledTime: "10:30 AM",
      distance: "2.5 km",
      status: "assigned",
      contact: "+91 98765 43210",
      instructions: "Call before arrival"
    },
    {
      id: "DEL002",
      priority: "medium",
      womanName: "Sunita Patel",
      address: "House 45, Block C, Sector 15",
      items: ["Prenatal Vitamins", "Iron Tablets"],
      scheduledTime: "11:45 AM",
      distance: "3.2 km",
      status: "assigned",
      contact: "+91 98765 43211"
    },
    {
      id: "DEL003",
      priority: "high",
      womanName: "Lakshmi Devi",
      address: "House 67, Block B, Sector 10",
      items: ["Postnatal Care Kit", "Baby Essentials"],
      scheduledTime: "2:00 PM",
      distance: "1.8 km",
      status: "in-transit",
      contact: "+91 98765 43212",
      progress: 45
    },
    {
      id: "DEL004",
      priority: "low",
      womanName: "Kavita Singh",
      address: "House 89, Block D, Sector 14",
      items: ["Health Supplements"],
      scheduledTime: "4:30 PM",
      distance: "4.1 km",
      status: "assigned",
      contact: "+91 98765 43213"
    }
  ];

  const filteredDeliveries = deliveries.filter(d => 
    d.womanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Assigned Deliveries
          </h1>
          <p className="text-muted-foreground mt-1">
            You have {deliveries.length} deliveries scheduled for today
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-orange-600 to-red-600">
            <Navigation className="h-4 w-4 mr-2" />
            Optimize Route
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">8</p>
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
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">5</p>
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
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold">2</p>
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
                placeholder="Search by ID, woman name, address..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <SortAsc className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-transit">In Transit</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {filteredDeliveries.map((delivery, idx) => (
            <Card key={delivery.id} className="group hover:shadow-xl transition-all animate-slide-in" style={{ animationDelay: `${idx * 100}ms` }}>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-lg">{delivery.womanName}</h3>
                        <Badge className={getPriorityColor(delivery.priority)}>
                          {delivery.priority} priority
                        </Badge>
                        {delivery.status === 'in-transit' && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            <Navigation className="h-3 w-3 mr-1 animate-pulse" />
                            In Transit
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {delivery.address}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="h-3 w-3 mr-1" />
                          {delivery.scheduledTime}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Navigation className="h-3 w-3 mr-1" />
                          {delivery.distance}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Phone className="h-3 w-3 mr-1" />
                          {delivery.contact}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {delivery.items.map((item, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>

                      {delivery.instructions && (
                        <p className="text-xs text-amber-600 bg-amber-50 p-1 rounded mt-2">
                          📝 {delivery.instructions}
                        </p>
                      )}

                      {delivery.progress && (
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Delivery Progress</span>
                            <span>{delivery.progress}%</span>
                          </div>
                          <Progress value={delivery.progress} className="h-1" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2 lg:min-w-[120px]">
                    <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                      <Navigation className="h-4 w-4 mr-2" />
                      Navigate
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pending">
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No pending deliveries</h3>
            <p className="text-muted-foreground">Take a break or check back later</p>
          </div>
        </TabsContent>

        <TabsContent value="in-transit">
          <div className="text-center py-12">
            <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No active deliveries</h3>
            <p className="text-muted-foreground">Start a delivery to see progress</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}