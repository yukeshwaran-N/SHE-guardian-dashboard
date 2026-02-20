// src/pages/delivery/CompletedDeliveries.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  CheckCircle,
  Calendar,
  MapPin,
  Package,
  Star,
  ThumbsUp,
  MessageCircle,
  Download,
  Filter,
  Award,
  TrendingUp,
  Clock
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CompletedDeliveries() {
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");

  const completedDeliveries = [
    {
      id: "DEL001",
      orderId: "ORD001",
      womanName: "Priya Sharma",
      address: "House 123, Block A, Sector 12",
      items: ["Sanitary Kit", "Nutrition Pack"],
      completedDate: "2024-02-20",
      completedTime: "10:30 AM",
      rating: 5,
      feedback: "Very prompt and professional service. The delivery person was very courteous.",
      earnings: 150,
      distance: "2.5 km",
      duration: "25 mins"
    },
    {
      id: "DEL002",
      orderId: "ORD002",
      womanName: "Sunita Patel",
      address: "House 45, Block C, Sector 15",
      items: ["Prenatal Vitamins"],
      completedDate: "2024-02-20",
      completedTime: "11:45 AM",
      rating: 4,
      feedback: "Good service, on time delivery",
      earnings: 120,
      distance: "3.2 km",
      duration: "30 mins"
    },
    {
      id: "DEL003",
      orderId: "ORD003",
      womanName: "Lakshmi Devi",
      address: "House 67, Block B, Sector 10",
      items: ["Postnatal Care Kit"],
      completedDate: "2024-02-19",
      completedTime: "2:15 PM",
      rating: 5,
      feedback: "Excellent care and attention to detail",
      earnings: 180,
      distance: "1.8 km",
      duration: "20 mins"
    },
    {
      id: "DEL004",
      orderId: "ORD004",
      womanName: "Kavita Singh",
      address: "House 89, Block D, Sector 14",
      items: ["Health Supplements"],
      completedDate: "2024-02-19",
      completedTime: "4:30 PM",
      rating: 5,
      feedback: "Very helpful, explained the contents well",
      earnings: 100,
      distance: "4.1 km",
      duration: "35 mins"
    },
    {
      id: "DEL005",
      orderId: "ORD005",
      womanName: "Meena Kumari",
      address: "House 234, Block E, Sector 16",
      items: ["Emergency Kit"],
      completedDate: "2024-02-18",
      completedTime: "9:45 AM",
      rating: 4,
      feedback: "Good service",
      earnings: 140,
      distance: "3.5 km",
      duration: "28 mins"
    }
  ];

  const stats = {
    totalDeliveries: completedDeliveries.length,
    totalEarnings: completedDeliveries.reduce((sum, d) => sum + d.earnings, 0),
    averageRating: (completedDeliveries.reduce((sum, d) => sum + d.rating, 0) / completedDeliveries.length).toFixed(1),
    totalDistance: completedDeliveries.reduce((sum, d) => sum + parseFloat(d.distance), 0).toFixed(1)
  };

  const filteredDeliveries = completedDeliveries.filter(d =>
    d.womanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRecentFeedback = () => {
    return completedDeliveries
      .filter(d => d.feedback)
      .slice(0, 3);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Completed Deliveries
          </h1>
          <p className="text-muted-foreground mt-1">
            History of all your successful deliveries
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Deliveries</p>
                <p className="text-3xl font-bold mt-1">{stats.totalDeliveries}</p>
              </div>
              <Package className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Earnings</p>
                <p className="text-3xl font-bold mt-1">₹{stats.totalEarnings}</p>
              </div>
              <TrendingUp className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Average Rating</p>
                <p className="text-3xl font-bold mt-1">{stats.averageRating}</p>
              </div>
              <Star className="h-8 w-8 opacity-80 fill-white" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Distance</p>
                <p className="text-3xl font-bold mt-1">{stats.totalDistance}km</p>
              </div>
              <MapPin className="h-8 w-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Feedback Section */}
      <Card className="border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700">
            <MessageCircle className="h-5 w-5" />
            Recent Customer Feedback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {getRecentFeedback().map((delivery, idx) => (
              <Card key={idx} className="bg-white dark:bg-gray-900">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < delivery.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{delivery.completedDate}</span>
                  </div>
                  <p className="text-sm mb-2">"{delivery.feedback}"</p>
                  <p className="text-xs font-medium">— {delivery.womanName}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, order ID, or woman name..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Completed Deliveries Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDeliveries.map((delivery, idx) => (
          <Card key={delivery.id} className="group hover:shadow-xl transition-all animate-slide-in" style={{ animationDelay: `${idx * 100}ms` }}>
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">{delivery.id}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Order: {delivery.orderId}</p>
                </div>
                <Badge variant="success" className="bg-green-100">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              </div>

              {/* Woman Info */}
              <h3 className="font-semibold text-lg">{delivery.womanName}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{delivery.address}</span>
              </div>

              {/* Items */}
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-1">Items delivered:</p>
                <div className="flex flex-wrap gap-1">
                  {delivery.items.map((item, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Delivery Details Grid */}
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span>{delivery.completedDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span>{delivery.completedTime}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span>{delivery.distance}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3 text-muted-foreground" />
                  <span>{delivery.duration}</span>
                </div>
              </div>

              {/* Rating and Earnings */}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < delivery.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <Badge variant="outline" className="bg-green-100">
                  <Award className="h-3 w-3 mr-1" />
                  +₹{delivery.earnings}
                </Badge>
              </div>

              {/* Feedback (if exists) */}
              {delivery.feedback && (
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-xs italic">"{delivery.feedback}"</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredDeliveries.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No completed deliveries found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search" : "Complete your first delivery to see it here"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}