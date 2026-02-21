// src/pages/delivery/AssignedDeliveries.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/services/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  MapPin,
  Phone,
  Calendar,
  Package,
  Clock,
  Navigation,
  User,
  Filter,
  RefreshCw,
  AlertCircle,
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Delivery {
  id: string;
  order_id: string | null;
  woman_name: string | null;
  address: string | null;
  items: any | null;
  status: string | null;
  priority?: 'high' | 'medium' | 'low';
  scheduled_date: string | null;
  delivery_partner: string | null;
  contact?: string | null;
  lat?: number;
  lng?: number;
  progress?: number;
}

export default function AssignedDeliveries() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignedDeliveries();
  }, [user]);

  useEffect(() => {
    filterDeliveries();
  }, [searchTerm, statusFilter, deliveries]);

  const fetchAssignedDeliveries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('delivery_partner', user?.id)
        .not('status', 'in', '("delivered","cancelled")')
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      // Add mock data for display
      const deliveriesWithMeta = (data || []).map((delivery, index) => ({
        ...delivery,
        priority: getRandomPriority(),
        progress: delivery.status === 'in-transit' ? Math.floor(Math.random() * 60) + 20 : undefined,
        lat: 28.5900 + (index * 0.01),
        lng: 77.2500 + (index * 0.01)
      }));

      setDeliveries(deliveriesWithMeta);
      setFilteredDeliveries(deliveriesWithMeta);
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

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d => 
        d.woman_name?.toLowerCase().includes(term) ||
        d.address?.toLowerCase().includes(term) ||
        d.id?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(d => d.status === statusFilter);
    }

    setFilteredDeliveries(filtered);
  };

  const handleStatusUpdate = async (deliveryId: string, newStatus: string) => {
    setUpdatingId(deliveryId);
    try {
      // Remove updated_at since it doesn't exist in your table
      const { error } = await supabase
        .from('deliveries')
        .update({ 
          status: newStatus
          // Removed updated_at
        })
        .eq('id', deliveryId);

      if (error) throw error;

      // Update local state
      setDeliveries(prev => prev.map(d => 
        d.id === deliveryId ? { ...d, status: newStatus } : d
      ));

      toast({
        title: "Success",
        description: `Delivery marked as ${newStatus}`,
      });
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleNavigate = (delivery: Delivery) => {
    navigate('/delivery/map', {
      state: {
        id: delivery.id,
        lat: delivery.lat || 28.6139,
        lng: delivery.lng || 77.2090,
        address: delivery.address,
        womanName: delivery.woman_name,
        scheduledTime: formatTime(delivery.scheduled_date),
        distance: calculateDistance(delivery.lat, delivery.lng),
        contact: delivery.contact,
        items: delivery.items,
        status: delivery.status,
        priority: delivery.priority
      }
    });
  };

  const getRandomPriority = (): 'high' | 'medium' | 'low' => {
    const priorities: ('high' | 'medium' | 'low')[] = ['high', 'medium', 'low'];
    return priorities[Math.floor(Math.random() * priorities.length)];
  };

  const formatTime = (date: string | null): string => {
    if (!date) return 'Time TBD';
    try {
      return new Date(date).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return 'Time TBD';
    }
  };

  const calculateDistance = (lat?: number, lng?: number): string => {
    if (!lat || !lng) return 'Distance TBD';
    const distance = (Math.random() * 4 + 1).toFixed(1);
    return `${distance} km`;
  };

  const parseItems = (items: any): string[] => {
    if (!items) return [];
    if (Array.isArray(items)) return items;
    if (typeof items === 'string') {
      try {
        return JSON.parse(items);
      } catch {
        return [items];
      }
    }
    return [];
  };

  const getPriorityColor = (priority?: string) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string | null) => {
    switch(status) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-transit': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assigned': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const stats = {
    total: deliveries.length,
    pending: deliveries.filter(d => d.status === 'pending' || d.status === 'assigned').length,
    inTransit: deliveries.filter(d => d.status === 'in-transit').length,
    highPriority: deliveries.filter(d => d.priority === 'high').length
  };

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Assigned Deliveries
          </h1>
          <p className="text-gray-500 mt-1">
            You have {filteredDeliveries.length} deliveries scheduled
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAssignedDeliveries}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold text-gray-800">{stats.total}</p>
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
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-xl font-bold text-gray-800">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Navigation className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Transit</p>
                <p className="text-xl font-bold text-gray-800">{stats.inTransit}</p>
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
                <p className="text-sm text-gray-500">High Priority</p>
                <p className="text-xl font-bold text-gray-800">{stats.highPriority}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or address..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                Status
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Deliveries List */}
      {filteredDeliveries.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No deliveries assigned</h3>
            <p className="text-gray-500">You'll see your assigned deliveries here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDeliveries.map((delivery) => {
            const items = parseItems(delivery.items);
            
            return (
              <Card key={delivery.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Left Section - Main Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {delivery.woman_name || 'Unknown'}
                        </h3>
                        {delivery.priority && (
                          <Badge className={getPriorityColor(delivery.priority)}>
                            {delivery.priority} priority
                          </Badge>
                        )}
                        <Badge className={getStatusColor(delivery.status)}>
                          {delivery.status || 'pending'}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {delivery.address || 'Address not available'}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-gray-600">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {formatTime(delivery.scheduled_date)}
                          </span>
                          <span className="flex items-center gap-1 text-gray-600">
                            <Navigation className="h-4 w-4 text-gray-400" />
                            {calculateDistance(delivery.lat, delivery.lng)}
                          </span>
                        </div>

                        {/* Items */}
                        {items.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {items.map((item, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs bg-gray-50">
                                <Package className="h-3 w-3 mr-1" />
                                {item}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Progress Bar */}
                        {delivery.progress && delivery.status === 'in-transit' && (
                          <div className="mt-3 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Delivery Progress</span>
                              <span className="font-medium text-gray-700">{delivery.progress}%</span>
                            </div>
                            <Progress value={delivery.progress} className="h-2" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex lg:flex-col gap-2 lg:min-w-[200px]">
                      {delivery.status === 'assigned' && (
                        <Button
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleStatusUpdate(delivery.id, 'in-transit')}
                          disabled={updatingId === delivery.id}
                        >
                          {updatingId === delivery.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Navigation className="h-4 w-4 mr-2" />
                          )}
                          Start Delivery
                        </Button>
                      )}

                      {delivery.status === 'in-transit' && (
                        <Button
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleStatusUpdate(delivery.id, 'delivered')}
                          disabled={updatingId === delivery.id}
                        >
                          {updatingId === delivery.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Package className="h-4 w-4 mr-2" />
                          )}
                          Mark Delivered
                        </Button>
                      )}

                      <Button 
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => handleNavigate(delivery)}
                      >
                        <Navigation className="h-4 w-4 mr-2" />
                        Navigate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}