// src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  AlertTriangle, 
  Truck, 
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Bell,
  Heart,
  Shield,
  Award,
  Target,
  Package,
  UserPlus,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  LineChart,
  Sparkles,
  Crown,
  Medal,
  Loader2
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
} from 'recharts';
import { motion } from 'framer-motion';
import { supabase } from "@/services/supabase";
import { format, subDays, eachDayOfInterval } from "date-fns";

interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  activeAlerts: number;
  pendingDeliveries: number;
  completedToday: number;
  highRiskCases: number;
  totalDeliveries: number;
  satisfaction: number;
  responseTime: string;
}

interface Activity {
  id: string;
  action: string;
  user: string;
  time: string;
  icon: any;
  color: string;
}

interface WeeklyData {
  day: string;
  deliveries: number;
  alerts: number;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  // Real-time stats
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newUsersToday: 0,
    activeAlerts: 0,
    pendingDeliveries: 0,
    completedToday: 0,
    highRiskCases: 0,
    totalDeliveries: 0,
    satisfaction: 98,
    responseTime: '2.5'
  });

  const [liveActivities, setLiveActivities] = useState<Activity[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [riskData, setRiskData] = useState<any[]>([
    { name: 'High Risk', value: 0, color: '#ef4444' },
    { name: 'Medium Risk', value: 0, color: '#f59e0b' },
    { name: 'Low Risk', value: 0, color: '#10b981' },
  ]);

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();

    // Set up real-time subscriptions
    const usersSubscription = supabase
      .channel('admin-users')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'users' }, 
        () => fetchDashboardData()
      )
      .subscribe();

    const alertsSubscription = supabase
      .channel('admin-alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, 
        () => fetchDashboardData()
      )
      .subscribe();

    const deliveriesSubscription = supabase
      .channel('admin-deliveries')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deliveries' }, 
        () => fetchDashboardData()
      )
      .subscribe();

    return () => {
      usersSubscription.unsubscribe();
      alertsSubscription.unsubscribe();
      deliveriesSubscription.unsubscribe();
    };
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchWeeklyData(),
        fetchRiskData(),
        fetchRecentActivities()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get today's new users
      const today = new Date().toISOString().split('T')[0];
      const { count: newUsersToday } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      // Get active alerts
      const { count: activeAlerts } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get high risk alerts
      const { count: highRiskCases } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('severity', 'high')
        .eq('status', 'active');

      // Get pending deliveries
      const { count: pendingDeliveries } = await supabase
        .from('deliveries')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'assigned']);

      // Get completed today
      const { count: completedToday } = await supabase
        .from('deliveries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'delivered')
        .gte('scheduled_date', today);

      // Get total deliveries
      const { count: totalDeliveries } = await supabase
        .from('deliveries')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: totalUsers || 0,
        newUsersToday: newUsersToday || 0,
        activeAlerts: activeAlerts || 0,
        pendingDeliveries: pendingDeliveries || 0,
        completedToday: completedToday || 0,
        highRiskCases: highRiskCases || 0,
        totalDeliveries: totalDeliveries || 0,
        satisfaction: 98,
        responseTime: '2.5'
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchWeeklyData = async () => {
    try {
      const endDate = new Date();
      const startDate = subDays(endDate, 6);
      
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      
      // Initialize weekly data with zeros
      const weekly = days.map(day => ({
        day: format(day, 'EEE'),
        fullDate: format(day, 'yyyy-MM-dd'),
        deliveries: 0,
        alerts: 0
      }));

      // Fetch deliveries for the week using scheduled_date
      const { data: deliveries } = await supabase
        .from('deliveries')
        .select('scheduled_date')
        .not('scheduled_date', 'is', null);

      // Fetch alerts for the week using timestamp
      const { data: alerts } = await supabase
        .from('alerts')
        .select('timestamp')
        .not('timestamp', 'is', null);

      // Count deliveries per day
      deliveries?.forEach(d => {
        if (d.scheduled_date) {
          const dateStr = d.scheduled_date;
          const dayData = weekly.find(w => w.fullDate === dateStr);
          if (dayData) {
            dayData.deliveries++;
          }
        }
      });

      // Count alerts per day
      alerts?.forEach(a => {
        if (a.timestamp) {
          const dateStr = a.timestamp.split('T')[0];
          const dayData = weekly.find(w => w.fullDate === dateStr);
          if (dayData) {
            dayData.alerts++;
          }
        }
      });

      // Remove fullDate before setting state
      const chartData = weekly.map(({ day, deliveries, alerts }) => ({
        day,
        deliveries,
        alerts
      }));

      console.log('Weekly chart data:', chartData);
      setWeeklyData(chartData);

    } catch (error) {
      console.error('Error in fetchWeeklyData:', error);
    }
  };

  const fetchRiskData = async () => {
    try {
      // Get all active alerts
      const { data: alerts, error } = await supabase
        .from('alerts')
        .select('severity')
        .eq('status', 'active');

      if (error) throw error;

      if (!alerts || alerts.length === 0) {
        setRiskData([
          { name: 'High Risk', value: 33, color: '#ef4444' },
          { name: 'Medium Risk', value: 33, color: '#f59e0b' },
          { name: 'Low Risk', value: 34, color: '#10b981' },
        ]);
        return;
      }

      const high = alerts.filter(a => a.severity?.toLowerCase() === 'high').length;
      const medium = alerts.filter(a => a.severity?.toLowerCase() === 'medium').length;
      const low = alerts.filter(a => a.severity?.toLowerCase() === 'low').length;
      const total = high + medium + low;

      setRiskData([
        { name: 'High Risk', value: Math.round((high / total) * 100) || 0, color: '#ef4444' },
        { name: 'Medium Risk', value: Math.round((medium / total) * 100) || 0, color: '#f59e0b' },
        { name: 'Low Risk', value: Math.round((low / total) * 100) || 0, color: '#10b981' },
      ]);

    } catch (error) {
      console.error('Error fetching risk data:', error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const activities: Activity[] = [];

      // Get recent users
      const { data: recentUsers } = await supabase
        .from('users')
        .select('full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(2);

      recentUsers?.forEach(user => {
        if (user.full_name) {
          activities.push({
            id: `user-${Date.now()}-${Math.random()}`,
            action: 'New user registered',
            user: user.full_name,
            time: formatDistanceToNow(new Date(user.created_at)),
            icon: UserPlus,
            color: 'green'
          });
        }
      });

      // Get recent alerts
      const { data: recentAlerts } = await supabase
        .from('alerts')
        .select('woman_name, severity, timestamp')
        .order('timestamp', { ascending: false })
        .limit(2);

      recentAlerts?.forEach(alert => {
        if (alert.woman_name) {
          activities.push({
            id: `alert-${Date.now()}-${Math.random()}`,
            action: 'New alert created',
            user: alert.woman_name,
            time: formatDistanceToNow(new Date(alert.timestamp)),
            icon: AlertTriangle,
            color: alert.severity === 'high' ? 'red' : 'yellow'
          });
        }
      });

      // Get recent deliveries
      const { data: recentDeliveries } = await supabase
        .from('deliveries')
        .select('woman_name, status, scheduled_date')
        .eq('status', 'delivered')
        .order('scheduled_date', { ascending: false })
        .limit(2);

      recentDeliveries?.forEach(delivery => {
        if (delivery.woman_name) {
          activities.push({
            id: `delivery-${Date.now()}-${Math.random()}`,
            action: 'Delivery completed',
            user: delivery.woman_name,
            time: formatDistanceToNow(new Date(delivery.scheduled_date)),
            icon: Truck,
            color: 'blue'
          });
        }
      });

      // Sort by time (most recent first)
      activities.sort((a, b) => {
        if (a.time.includes('just now')) return -1;
        if (b.time.includes('just now')) return 1;
        return 0;
      });

      setLiveActivities(activities.slice(0, 4));

    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color, subtitle, delay }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold mt-2">{value}</h3>
                {trend !== undefined && (
                  <Badge variant={trend >= 0 ? "success" : "destructive"} className="mt-2">
                    {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {Math.abs(trend)}%
                  </Badge>
                )}
              </div>
              {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            </div>
            <div className={`h-12 w-12 rounded-xl bg-${color}-100 flex items-center justify-center`}>
              <Icon className={`h-6 w-6 text-${color}-600`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const LiveActivityItem = ({ activity }: { activity: Activity }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <div className={`h-8 w-8 rounded-full bg-${activity.color}-100 flex items-center justify-center shrink-0`}>
        <activity.icon className={`h-4 w-4 text-${activity.color}-600`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{activity.action}</p>
        <p className="text-xs text-muted-foreground truncate">{activity.user} • {activity.time}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading dashboard...</p>
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
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {user?.id}!
          </h1>
          <p className="text-gray-500 mt-1">
            {format(new Date(), "EEEE, MMMM do, yyyy")}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDashboardData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          trend={12}
          color="blue"
          subtitle={`${stats.newUsersToday} new today`}
          delay={0.1}
        />
        <StatCard
          title="Active Alerts"
          value={stats.activeAlerts}
          icon={AlertTriangle}
          trend={-5}
          color="red"
          subtitle={`${stats.highRiskCases} high priority`}
          delay={0.2}
        />
        <StatCard
          title="Pending Deliveries"
          value={stats.pendingDeliveries}
          icon={Truck}
          trend={8}
          color="yellow"
          subtitle={`${stats.completedToday} completed today`}
          delay={0.3}
        />
        <StatCard
          title="Total Deliveries"
          value={stats.totalDeliveries}
          icon={Package}
          trend={15}
          color="green"
          subtitle="All time"
          delay={0.4}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Weekly Chart */}
        <motion.div 
          className="col-span-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-primary" />
                Weekly Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {weeklyData.length > 0 && weeklyData.some(d => d.deliveries > 0 || d.alerts > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorDeliveries" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="deliveries" 
                        stroke="#3b82f6" 
                        fillOpacity={1} 
                        fill="url(#colorDeliveries)" 
                        name="Deliveries"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="alerts" 
                        stroke="#ef4444" 
                        fillOpacity={1} 
                        fill="url(#colorAlerts)"
                        name="Alerts"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available for this week</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Risk Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Risk Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => 
                        percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                      }
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                {riskData.map((item) => (
                  item.value > 0 && (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                  )
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Live Activity Feed */}
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
                {liveActivities.length > 0 && (
                  <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
                    <span className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                    LIVE
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {liveActivities.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No recent activity</p>
              ) : (
                <div className="space-y-1">
                  {liveActivities.map((activity) => (
                    <LiveActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Satisfaction Rate</span>
                    <span className="font-medium">{stats.satisfaction}%</span>
                  </div>
                  <Progress value={stats.satisfaction} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Response Time</span>
                    <span className="font-medium">{stats.responseTime}m</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <Shield className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">System Status</p>
                    <p className="text-sm font-medium text-green-600">Operational</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <Award className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">Uptime</p>
                    <p className="text-sm font-medium">99.9%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// Helper function for time formatting
function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
}