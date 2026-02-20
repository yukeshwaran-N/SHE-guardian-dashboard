// src/pages/delivery/DeliveryDashboard.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  CheckCircle, 
  Clock, 
  MapPin,
  TrendingUp,
  Calendar,
  Navigation,
  Phone,
  Mail,
  Award,
  Star
} from "lucide-react";
import { deliveriesService } from "@/services/deliveriesService";
import { inventoryService } from "@/services/inventoryService";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    completed: 0,
    pending: 0,
    distance: 0,
    rating: 4.8,
    completedThisWeek: 0
  });

  const [currentTask, setCurrentTask] = useState<any>(null);
  const [upcomingDeliveries, setUpcomingDeliveries] = useState<any[]>([]);

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  const fetchDeliveryData = async () => {
    try {
      setLoading(true);
      const deliveries = await deliveriesService.getDeliveriesByPartner(user?.id || '');
      
      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const todayDeliveries = deliveries.filter(d => d.scheduled_date === today);
      const completed = deliveries.filter(d => d.status === 'delivered');
      const pending = deliveries.filter(d => d.status === 'assigned' || d.status === 'in-transit');

      setStats({
        todayDeliveries: todayDeliveries.length,
        completed: completed.length,
        pending: pending.length,
        distance: 24,
        rating: 4.8,
        completedThisWeek: 12
      });

      // Set current task (first pending delivery)
      setCurrentTask(pending[0] || null);
      
      // Set upcoming deliveries
      setUpcomingDeliveries(deliveries.slice(0, 3));
    } catch (error) {
      console.error("Error fetching delivery data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, subtitle, color }: any) => (
    <Card className="stat-card hover-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-full bg-${color}-100 dark:bg-${color}-900/20 flex items-center justify-center`}>
            <Icon className={`h-6 w-6 text-${color}-600 dark:text-${color}-400`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header with Profile */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-4 border-primary/20">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.id}`} />
            <AvatarFallback>{user?.id?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Hello, {user?.id}!
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="gap-1">
                <Award className="h-3 w-3" />
                Gold Status
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                {stats.rating} Rating
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Phone className="h-4 w-4 mr-2" />
            Support
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <Navigation className="h-4 w-4 mr-2" />
            Start Route
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Deliveries"
          value={stats.todayDeliveries}
          icon={Package}
          subtitle="Scheduled for today"
          color="blue"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          subtitle="This week: +12"
          color="green"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          subtitle="Awaiting delivery"
          color="orange"
        />
        <StatCard
          title="Distance Today"
          value={`${stats.distance} km`}
          icon={MapPin}
          subtitle="Estimated route"
          color="purple"
        />
      </div>

      {/* Current Task & Progress */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Current Task */}
        <Card className="hover-card overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-green-600" />
              Current Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentTask ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{currentTask.woman_name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {currentTask.address}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Items:</span>
                    <span className="font-medium">{currentTask.items?.length || 0} packages</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Distance from you:</span>
                    <span className="font-medium">2.5 km</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Estimated time:</span>
                    <span className="font-medium">15 mins</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Navigation className="h-4 w-4 mr-2" />
                  Navigate to Location
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-muted-foreground">No current tasks. Take a break!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deliveries */}
        <Card className="hover-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Upcoming Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingDeliveries.map((delivery, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{delivery.woman_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{delivery.address}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {delivery.items?.length || 0} items
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {delivery.scheduled_date}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats & Performance */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Performance This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98%</div>
            <p className="text-xs text-muted-foreground mt-1">On-time delivery rate</p>
            <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full w-[98%] bg-green-600 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Customer Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">4.8</div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`h-4 w-4 ${star <= 4 ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'}`} />
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Based on 156 reviews</p>
          </CardContent>
        </Card>

        <Card className="hover-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Next Break</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2:30 PM</div>
            <p className="text-xs text-muted-foreground mt-1">After 3 more deliveries</p>
            <Button variant="link" className="p-0 h-auto text-xs mt-2">
              Request schedule change
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}