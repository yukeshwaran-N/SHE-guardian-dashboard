// src/pages/admin/DeliveryDashboard.tsx
import { useState, useEffect } from "react";
import { deliveriesService } from "@/services/deliveriesService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Star,
  TrendingUp,
  TrendingDown,
  Activity,
  Navigation,
  Printer,
  Mail,
  Share2,
  BarChart3,
  PieChart,
  Clock4,
  CheckCheck,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  Zap,
  Shield,
  Heart,
  Users,
  Map,
  Layers
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { format, formatDistance } from 'date-fns';

interface Delivery {
  id: string;
  order_id: string | null;
  woman_name: string | null;
  address: string | null;
  items: any | null;
  status: string | null;
  scheduled_date: string | null;
  delivery_partner: string | null;
  contact?: string;
  priority?: 'high' | 'medium' | 'low';
}

export default function DeliveryDashboard() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('week');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    fetchDeliveries();
    // Simulate real-time updates
    const interval = setInterval(() => {
      fetchDeliveries(true);
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = deliveries;
    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.woman_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(d => d.status === statusFilter);
    }
    setFilteredDeliveries(filtered);
  }, [searchTerm, statusFilter, deliveries]);

  const fetchDeliveries = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await deliveriesService.getAllDeliveries();
      setDeliveries(data);
      if (!silent) setFilteredDeliveries(data);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Statistics with animations
  const stats = {
    total: deliveries.length,
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    inTransit: deliveries.filter(d => d.status === 'in-transit').length,
    pending: deliveries.filter(d => d.status === 'pending' || d.status === 'assigned').length,
    cancelled: deliveries.filter(d => d.status === 'cancelled').length,
    onTimeRate: calculateOnTimeRate(deliveries),
    avgDeliveryTime: calculateAvgDeliveryTime(deliveries)
  };

  // Chart data
  const statusData = [
    { name: 'Delivered', value: stats.delivered, color: '#10b981' },
    { name: 'In Transit', value: stats.inTransit, color: '#3b82f6' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Cancelled', value: stats.cancelled, color: '#ef4444' },
  ];

  const weeklyData = generateWeeklyData(deliveries);
  const partnerPerformance = generatePartnerPerformance(deliveries);

  // Helper functions
  function calculateOnTimeRate(deliveries: Delivery[]) {
    const delivered = deliveries.filter(d => d.status === 'delivered');
    if (delivered.length === 0) return 100;
    // This is a mock calculation - replace with actual logic
    return 94;
  }

  function calculateAvgDeliveryTime(deliveries: Delivery[]) {
    // Mock calculation - replace with actual logic
    return '2.5 hrs';
  }

  function generateWeeklyData(deliveries: Delivery[]) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      deliveries: Math.floor(Math.random() * 10) + 5,
      completed: Math.floor(Math.random() * 8) + 3
    }));
  }

  function generatePartnerPerformance(deliveries: Delivery[]) {
    return [
      { name: 'Rajesh Kumar', deliveries: 45, rating: 4.8, onTime: 98 },
      { name: 'Meena Devi', deliveries: 38, rating: 4.9, onTime: 99 },
      { name: 'Suresh Singh', deliveries: 42, rating: 4.7, onTime: 95 },
      { name: 'Priya ASHA', deliveries: 35, rating: 4.8, onTime: 97 },
    ];
  }

  const getStatusIcon = (status: string | null) => {
    switch(status) {
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-transit': return <Truck className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'assigned': return <User className="h-5 w-5 text-yellow-500" />;
      case 'pending': return <Clock className="h-5 w-5 text-orange-500" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-transit': return 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse';
      case 'assigned': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, subtitle }: any) => (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold mt-2">{value}</h3>
              {trend && (
                <span className={`text-sm flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {Math.abs(trend)}%
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`h-12 w-12 rounded-full bg-${color.split(' ')[0]}-100 flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <Icon className={`h-6 w-6 text-${color.split(' ')[0]}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground animate-pulse">Loading delivery dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Live Status */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Delivery Operations
            </h1>
            <Badge variant="outline" className="animate-pulse bg-green-100 text-green-800">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-ping"></span>
              Live
            </Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-time tracking and management of all health kit deliveries
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchDeliveries()} className="relative">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Auto-refresh (30s)
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowAnalytics(!showAnalytics)}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            New Delivery
          </Button>
        </div>
      </div>

      {/* Analytics Section - Toggleable */}
      {showAnalytics && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
          <CardContent className="p-6">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="h-[300px]">
                    <h3 className="text-sm font-medium mb-2">Delivery Status Distribution</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={statusData.filter(d => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="h-[300px]">
                    <h3 className="text-sm font-medium mb-2">Weekly Delivery Trends</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyData}>
                        <defs>
                          <linearGradient id="colorDeliveries" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="deliveries" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDeliveries)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="performance">
                <div className="grid gap-4 md:grid-cols-2">
                  {partnerPerformance.map((partner, idx) => (
                    <Card key={idx}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{partner.name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{partner.name}</p>
                              <p className="text-xs text-muted-foreground">{partner.deliveries} deliveries</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-green-100">
                            {partner.onTime}% on time
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < Math.floor(partner.rating) ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                          ))}
                          <span className="text-xs ml-1">{partner.rating}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid with Live Updates */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Deliveries"
          value={stats.total}
          icon={Package}
          trend={12}
          color="from-blue-600 to-cyan-600"
          subtitle="+23 from last month"
        />
        <StatCard
          title="In Transit"
          value={stats.inTransit}
          icon={Truck}
          trend={8}
          color="from-yellow-600 to-orange-600"
          subtitle="Live tracking active"
        />
        <StatCard
          title="Completed"
          value={stats.delivered}
          icon={CheckCircle}
          trend={15}
          color="from-green-600 to-emerald-600"
          subtitle="Today: 8 deliveries"
        />
        <StatCard
          title="On-Time Rate"
          value={`${stats.onTimeRate}%`}
          icon={Award}
          trend={5}
          color="from-purple-600 to-pink-600"
          subtitle="Avg: 2.5 hrs per delivery"
        />
      </div>

      {/* Live Map Preview - Mock */}
      <Card className="relative overflow-hidden bg-gradient-to-r from-blue-900 to-purple-900 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              <h3 className="font-semibold">Live Delivery Tracking</h3>
            </div>
            <Badge variant="outline" className="bg-white/20 text-white border-white/30">
              <span className="h-2 w-2 bg-green-400 rounded-full mr-2 animate-ping"></span>
              3 Active Vehicles
            </Badge>
          </div>
          <div className="relative h-48 bg-blue-800/30 rounded-lg overflow-hidden">
            {/* Mock Map Grid */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
              backgroundSize: '40px 40px'
            }} />
            {/* Moving Dots Animation */}
            <div className="absolute top-1/4 left-1/4 animate-bounce">
              <div className="h-3 w-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50" />
            </div>
            <div className="absolute top-1/2 left-1/2 animate-pulse">
              <div className="h-3 w-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />
            </div>
            <div className="absolute bottom-1/3 right-1/4 animate-bounce delay-1000">
              <div className="h-3 w-3 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
              <p className="text-sm">3 deliveries in progress • ETA: 15-30 mins</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter Bar */}
      <Card className="sticky top-0 z-10 backdrop-blur-lg bg-background/80">
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
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
              <Button variant="outline" size="icon" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                <Layers className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Cards Grid/List */}
      <div className={viewMode === 'grid' 
        ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" 
        : "space-y-4"
      }>
        {filteredDeliveries.map((delivery, index) => (
          <Card 
            key={delivery.id} 
            className="group hover:shadow-xl transition-all duration-300 animate-slide-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-0">
              {/* Priority Indicator */}
              <div className={`h-1 w-full rounded-t-lg ${
                delivery.priority === 'high' ? 'bg-red-500' :
                delivery.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`} />
              
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(delivery.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{delivery.id}</p>
                        {delivery.priority === 'high' && (
                          <Badge variant="destructive" className="animate-pulse">URGENT</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">Order: {delivery.order_id}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Woman Info */}
                <div className="mb-3">
                  <h3 className="font-semibold text-lg">{delivery.woman_name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{delivery.address}</span>
                  </div>
                  {delivery.contact && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>{delivery.contact}</span>
                    </div>
                  )}
                </div>

                {/* Items with Icons */}
                {delivery.items && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Items:</p>
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(delivery.items) ? delivery.items : [delivery.items]).map((item, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs group-hover:bg-primary/10 transition-colors">
                          <Package className="h-3 w-3 mr-1" />
                          {typeof item === 'string' ? item : 'Item'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delivery Info Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm bg-muted/30 p-2 rounded-lg">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span>{delivery.scheduled_date || 'Not scheduled'}</span>
                  </div>
                  {delivery.delivery_partner && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">{delivery.delivery_partner}</span>
                    </div>
                  )}
                </div>

                {/* Status and Actions */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getStatusColor(delivery.status)}>
                    {delivery.status}
                  </Badge>
                  <div className="flex-1" />
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Print">
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Email">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>

                {/* Progress Bar for Active Deliveries */}
                {delivery.status === 'in-transit' && (
                  <div className="space-y-1 animate-pulse">
                    <div className="flex justify-between text-xs">
                      <span>Delivery Progress</span>
                      <span className="font-medium text-primary">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      <Navigation className="h-3 w-3 inline mr-1" />
                      ETA: 15 minutes
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredDeliveries.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-bounce mb-4">
              <Package className="h-16 w-16 text-muted-foreground mx-auto" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No deliveries found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? "Try adjusting your search or filters" 
                : "Ready to start delivering? Create your first delivery request."}
            </p>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Create New Delivery
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Floating Action Button for Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button size="lg" className="h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-purple-600">
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}