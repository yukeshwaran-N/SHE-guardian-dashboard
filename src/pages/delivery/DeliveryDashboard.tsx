// src/pages/delivery/DeliveryDashboard.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  Truck,
  Package,
  CheckCircle,
  Clock,
  Navigation,
  Phone,
  Star,
  Award,
  TrendingUp,
  Calendar,
  User,
  MapPin,
  DollarSign,
  Loader2,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";

// Vehicle animation component (kept as requested)
const MovingVehicle = () => {
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        const newPos = prev + direction * 0.5;
        if (newPos >= 90 || newPos <= 0) {
          setDirection(d => -d);
          return prev;
        }
        return newPos;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [direction]);

  return (
    <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg overflow-hidden shadow-lg">
      {/* Road lines */}
      <div className="absolute bottom-8 w-full h-0.5 bg-white/30">
        <motion.div
          className="absolute h-full w-16 bg-white"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      {/* Moving vehicle */}
      <motion.div
        className="absolute bottom-4"
        animate={{ left: `${position}%` }}
        transition={{ type: "tween", ease: "linear", duration: 0.05 }}
      >
        <div className="relative">
          <div className="w-16 h-8 bg-blue-400 rounded-lg shadow-lg flex items-center justify-center border-2 border-white/30">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <div className="absolute -bottom-2 left-1 w-3 h-3 bg-gray-800 rounded-full border border-gray-600" />
          <div className="absolute -bottom-2 right-1 w-3 h-3 bg-gray-800 rounded-full border border-gray-600" />
          <div className="absolute right-0 top-2 w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
        </div>
      </motion.div>

      <div className="absolute top-2 right-2 bg-black/40 rounded-lg px-3 py-1 text-white text-sm backdrop-blur-sm">
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-yellow-400" />
          On Route
        </span>
      </div>
    </div>
  );
};

// Delivery Partner Card - Shows essential info
const DeliveryPartnerCard = () => {
  const { user } = useAuth();
  
  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-indigo-600 to-blue-600 shadow-xl">
      <CardContent className="relative p-5 text-white">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
            <AvatarFallback className="bg-white text-indigo-700 text-xl font-bold">
              {user?.id?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-bold">{user?.id || 'Partner'}</h3>
            <Badge className="bg-yellow-500 text-white border-0 text-xs mt-1">
              <Star className="h-3 w-3 mr-1 fill-white" />
              Gold Status
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Current Task Card - Shows active delivery
const CurrentTaskCard = ({ task, onNavigate, onCall }: any) => {
  if (!task) return null;

  return (
    <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-xl border-0">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Badge className="bg-white/20 text-white border-white/30">
            <Truck className="h-3 w-3 mr-1" />
            Current Task
          </Badge>
          <Badge className="bg-white/20 text-white border-white/30">
            <Clock className="h-3 w-3 mr-1" />
            ETA: {task.eta}
          </Badge>
        </div>

        <h3 className="text-xl font-bold">{task.woman_name}</h3>
        <p className="text-blue-100 text-sm mt-1 flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {task.address}
        </p>

        <div className="flex items-center gap-4 mt-3 text-sm text-blue-100">
          <span className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            {task.items?.length || 0} items
          </span>
          <span className="flex items-center gap-1">
            <Navigation className="h-3 w-3" />
            {task.distance}
          </span>
        </div>

        {task.progress && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-blue-100 mb-1">
              <span>Progress</span>
              <span>{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-2 bg-white/30" indicatorClassName="bg-white" />
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button 
            className="flex-1 bg-white text-blue-600 hover:bg-gray-100 font-medium"
            onClick={onNavigate}
          >
            <Navigation className="h-4 w-4 mr-2" />
            Navigate
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 bg-transparent border-white/30 text-white hover:bg-white/20"
            onClick={onCall}
          >
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    completed: 0,
    pending: 0,
    earnings: 0,
    rating: 0
  });
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<any[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Get today's deliveries
      const today = new Date().toISOString().split('T')[0];
      
      const { data: deliveries, error } = await supabase
        .from('deliveries')
        .select('*')
        .eq('delivery_partner', user.id)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;

      // Calculate stats
      const todayDeliveries = deliveries?.filter(d => 
        d.scheduled_date === today
      ).length || 0;

      const completed = deliveries?.filter(d => 
        d.status === 'delivered'
      ).length || 0;

      const pending = deliveries?.filter(d => 
        d.status === 'pending' || d.status === 'assigned'
      ).length || 0;

      // Get current task (first in-transit or assigned delivery)
      const current = deliveries?.find(d => 
        d.status === 'in-transit' || d.status === 'assigned'
      );

      if (current) {
        setCurrentTask({
          id: current.id,
          woman_name: current.woman_name,
          address: current.address,
          items: current.items,
          distance: '2.5 km', // Calculate from coordinates
          eta: '15 min',
          progress: current.status === 'in-transit' ? 65 : 25
        });
      }

      // Get upcoming deliveries (next 3 pending)
      const upcoming = deliveries
        ?.filter(d => d.status === 'pending' || d.status === 'assigned')
        .slice(0, 3)
        .map(d => ({
          id: d.id,
          woman_name: d.woman_name,
          address: d.address,
          time: d.scheduled_date ? format(new Date(d.scheduled_date), 'h:mm a') : 'TBD'
        })) || [];

      setUpcomingDeliveries(upcoming);

      setStats({
        todayDeliveries,
        completed,
        pending,
        earnings: completed * 150, // ₹150 per delivery
        rating: 4.8 // Get from ratings table
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    if (currentTask) {
      navigate('/delivery/map', {
        state: {
          id: currentTask.id,
          lat: 28.6139, // Get from database
          lng: 77.2090,
          address: currentTask.address,
          womanName: currentTask.woman_name
        }
      });
    }
  };

  const handleCall = () => {
    // Implement call functionality
    toast({
      title: "Calling",
      description: "Connecting to customer...",
    });
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-800">{greeting}, {user?.id}!</h1>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </motion.div>
          </div>
          <p className="text-gray-500">
            {format(currentTime, "EEEE, MMMM do, yyyy • h:mm a")}
          </p>
        </div>
        <Badge className="bg-green-100 text-green-700 border-green-200 px-3 py-1">
          <span className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-ping" />
          Online
        </Badge>
      </motion.div>

      {/* Vehicle Animation */}
      <MovingVehicle />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Today's Deliveries</p>
                <p className="text-2xl font-bold text-gray-800">{stats.todayDeliveries}</p>
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
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-800">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Earnings</p>
                <p className="text-2xl font-bold text-gray-800">₹{stats.earnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Column - Partner Profile */}
        <div className="space-y-4">
          <DeliveryPartnerCard />
          
          {/* Rating Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Your Rating</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-3xl font-bold text-gray-800">{stats.rating}</span>
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Current Task & Upcoming */}
        <div className="md:col-span-2 space-y-4">
          {/* Current Task */}
          {currentTask ? (
            <CurrentTaskCard 
              task={currentTask}
              onNavigate={handleNavigate}
              onCall={handleCall}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Truck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No active deliveries</p>
                <p className="text-sm text-gray-400 mt-1">Take a break or check assigned deliveries</p>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Deliveries */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Upcoming Deliveries</h3>
              {upcomingDeliveries.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No upcoming deliveries</p>
              ) : (
                <div className="space-y-2">
                  {upcomingDeliveries.map((delivery, index) => (
                    <motion.div
                      key={delivery.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate('/delivery/assigned')}
                    >
                      <div>
                        <p className="font-medium text-gray-800">{delivery.woman_name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{delivery.address}</p>
                      </div>
                      <Badge variant="outline" className="border-gray-300 text-gray-600">
                        {delivery.time}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Button 
          className="h-16 flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => navigate('/delivery/assigned')}
        >
          <Package className="h-5 w-5 mb-1" />
          <span className="text-xs">Assigned</span>
        </Button>
        <Button 
          className="h-16 flex flex-col items-center justify-center bg-green-600 hover:bg-green-700 text-white"
          onClick={() => navigate('/delivery/completed')}
        >
          <CheckCircle className="h-5 w-5 mb-1" />
          <span className="text-xs">Completed</span>
        </Button>
        <Button 
          className="h-16 flex flex-col items-center justify-center bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => navigate('/delivery/map')}
        >
          <Navigation className="h-5 w-5 mb-1" />
          <span className="text-xs">Live Map</span>
        </Button>
      </div>
    </div>
  );
}