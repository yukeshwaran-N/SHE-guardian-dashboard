// src/pages/delivery/CompletedDeliveries.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Search,
  CheckCircle,
  Calendar,
  MapPin,
  Package,
  Star,
  MessageCircle,
  Download,
  Filter,
  Award,
  Clock,
  Phone,
  User,
  DollarSign,
  Truck,
  Loader2,
  RefreshCw
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface Delivery {
  id: string;
  order_id: string | null;
  woman_name: string | null;
  address: string | null;
  items: any | null;
  status: string | null;
  scheduled_date: string | null;
  delivery_partner: string | null;
}

export default function CompletedDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [selectedTab, setSelectedTab] = useState("all");
  
  const { toast } = useToast();

  // Fetch deliveries from Supabase
  useEffect(() => {
    fetchDeliveries();
  }, []);

  useEffect(() => {
    filterDeliveries();
  }, [searchTerm, timeFilter, selectedTab, deliveries]);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .order('scheduled_date', { ascending: false });

      if (error) throw error;

      console.log('Fetched deliveries:', data); // Debug log
      setDeliveries(data || []);
      setFilteredDeliveries(data || []);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      toast({
        title: "Error",
        description: "Failed to load deliveries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterDeliveries = () => {
    let filtered = [...deliveries];

    // Filter by status based on selected tab
    if (selectedTab === "completed") {
      filtered = filtered.filter(d => d.status === 'delivered');
    } else if (selectedTab === "high-rated") {
      // For now, just show delivered items
      filtered = filtered.filter(d => d.status === 'delivered');
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.woman_name?.toLowerCase().includes(term) ||
        d.id?.toLowerCase().includes(term) ||
        d.order_id?.toLowerCase().includes(term) ||
        d.address?.toLowerCase().includes(term)
      );
    }

    // Time filter
    if (timeFilter !== "all") {
      const now = new Date();
      filtered = filtered.filter(d => {
        if (!d.scheduled_date) return false;
        const deliveryDate = new Date(d.scheduled_date);
        const diffDays = Math.floor((now.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (timeFilter === "today") return diffDays === 0;
        if (timeFilter === "week") return diffDays <= 7;
        if (timeFilter === "month") return diffDays <= 30;
        return true;
      });
    }

    setFilteredDeliveries(filtered);
  };

  // Calculate stats for completed deliveries only
  const completedDeliveries = deliveries.filter(d => d.status === 'delivered');
  
  const stats = {
    total: completedDeliveries.length,
    earnings: completedDeliveries.length * 150, // Mock earnings calculation
    avgRating: 4.8, // Mock rating
    fiveStar: Math.floor(completedDeliveries.length * 0.8) // Mock five-star count
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-${color}-50 rounded-xl p-4 border border-${color}-200 shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`h-12 w-12 rounded-full bg-${color}-100 flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-500">Loading deliveries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Completed Deliveries
            </h1>
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              {completedDeliveries.length} Completed
            </Badge>
          </div>
          <p className="text-gray-500 mt-1">
            History of all your successful deliveries
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDeliveries}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Deliveries"
          value={stats.total}
          icon={Package}
          color="blue"
          subtitle="Completed"
        />
        <StatCard
          title="Total Earnings"
          value={`₹${stats.earnings}`}
          icon={DollarSign}
          color="green"
          subtitle="This month"
        />
        <StatCard
          title="Average Rating"
          value={stats.avgRating.toFixed(1)}
          icon={Star}
          color="yellow"
          subtitle={`${stats.fiveStar} five-star`}
        />
        <StatCard
          title="On-Time Rate"
          value="98%"
          icon={Truck}
          color="purple"
          subtitle="Performance"
        />
      </div>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by ID, order ID, or woman name..."
                className="pl-9 border-gray-200 focus:border-blue-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[140px] border-gray-200">
                <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                <SelectValue placeholder="Time" />
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

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger value="all" className="data-[state=active]:bg-white">
            All Deliveries
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-white">
            Completed
          </TabsTrigger>
          <TabsTrigger value="high-rated" className="data-[state=active]:bg-white">
            High Rated
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Deliveries Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDeliveries.length === 0 ? (
          <Card className="col-span-full border border-gray-200">
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No deliveries found</h3>
              <p className="text-gray-500">
                {searchTerm || timeFilter !== 'all'
                  ? "Try adjusting your filters"
                  : "No deliveries in the system yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDeliveries.map((delivery, index) => (
            <motion.div
              key={delivery.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
                {/* Status color bar */}
                <div className={`h-1 w-full ${
                  delivery.status === 'delivered' ? 'bg-green-400' :
                  delivery.status === 'in-transit' ? 'bg-blue-400' :
                  delivery.status === 'pending' ? 'bg-yellow-400' :
                  'bg-gray-400'
                }`} />
                
                <CardContent className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">{delivery.id}</p>
                      <p className="text-xs text-gray-500">Order: {delivery.order_id}</p>
                    </div>
                    <Badge className={
                      delivery.status === 'delivered' ? 'bg-green-100 text-green-700 border-green-200' :
                      delivery.status === 'in-transit' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }>
                      {delivery.status}
                    </Badge>
                  </div>

                  {/* Woman Info */}
                  <h3 className="font-semibold text-lg text-gray-800">{delivery.woman_name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{delivery.address || 'Address not available'}</span>
                  </div>

                  {/* Items */}
                  {delivery.items && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">Items:</p>
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(delivery.items) ? delivery.items : []).map((item, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-gray-50 border-gray-200">
                            {typeof item === 'string' ? item : 'Item'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Date */}
                  <div className="mt-3 text-sm bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-gray-600">
                        {delivery.scheduled_date ? format(new Date(delivery.scheduled_date), 'dd MMM yyyy') : 'Date not set'}
                      </span>
                    </div>
                  </div>

                  {/* For delivered items, show completed badge */}
                  {delivery.status === 'delivered' && (
                    <div className="mt-3 flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        <Award className="h-3 w-3 mr-1" />
                        +₹150
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Summary Footer - Only show if there are completed deliveries */}
      {completedDeliveries.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-yellow-300" />
                </div>
                <div>
                  <p className="text-sm text-blue-100">Total Completed</p>
                  <p className="text-2xl font-bold">{completedDeliveries.length} Deliveries</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-blue-100">Success Rate</p>
                  <p className="text-2xl font-bold">
                    {Math.round((completedDeliveries.length / deliveries.length) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}