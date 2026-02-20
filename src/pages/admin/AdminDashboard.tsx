// src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  AlertTriangle, 
  Truck, 
  Activity,
  TrendingUp,
  Calendar,
  Clock,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Download,
  RefreshCw
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { womenService } from "@/services/womenService";
import { alertsService } from "@/services/alertsService";
import { deliveriesService } from "@/services/deliveriesService";
import { inventoryService } from "@/services/inventoryService";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWomen: 0,
    activeAlerts: 0,
    pendingDeliveries: 0,
    ashaWorkers: 0,
    highRiskWomen: 0,
    completedToday: 0,
    inventoryLow: 0
  });

  // Sample data for charts
  const weeklyData = [
    { name: 'Mon', deliveries: 12, alerts: 4 },
    { name: 'Tue', deliveries: 19, alerts: 3 },
    { name: 'Wed', deliveries: 15, alerts: 5 },
    { name: 'Thu', deliveries: 21, alerts: 2 },
    { name: 'Fri', deliveries: 24, alerts: 6 },
    { name: 'Sat', deliveries: 16, alerts: 3 },
    { name: 'Sun', deliveries: 8, alerts: 1 },
  ];

  const riskData = [
    { name: 'High Risk', value: 15, color: '#ef4444' },
    { name: 'Medium Risk', value: 25, color: '#f59e0b' },
    { name: 'Low Risk', value: 60, color: '#10b981' },
  ];

  const recentActivities = [
    { id: 1, action: 'New woman registered', time: '5 min ago', user: 'ASHA Worker' },
    { id: 2, action: 'Alert resolved', time: '15 min ago', user: 'Admin' },
    { id: 3, action: 'Delivery completed', time: '30 min ago', user: 'Delivery Partner' },
    { id: 4, action: 'Inventory restocked', time: '1 hour ago', user: 'Admin' },
    { id: 5, action: 'High-risk case updated', time: '2 hours ago', user: 'Doctor' },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch real data from services
      const women = await womenService.getAllWomen();
      const alerts = await alertsService.getActiveAlerts();
      const deliveries = await deliveriesService.getAllDeliveries();
      const inventory = await inventoryService.getAllInventory();

      setStats({
        totalWomen: women.length,
        activeAlerts: alerts.length,
        pendingDeliveries: deliveries.filter(d => d.status === 'pending' || d.status === 'assigned').length,
        ashaWorkers: 28, // This should come from a separate service
        highRiskWomen: women.filter(w => w.status === 'high-risk').length,
        completedToday: deliveries.filter(d => d.status === 'delivered').length,
        inventoryLow: inventory.filter(i => i.quantity <= i.threshold).length
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
    <Card className="stat-card hover-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-xs ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {trendValue}
                </span>
              </div>
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Welcome back, {user?.id}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your platform today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Women"
          value={stats.totalWomen}
          icon={Users}
          trend="up"
          trendValue="+12% from last month"
          color="blue"
        />
        <StatCard
          title="Active Alerts"
          value={stats.activeAlerts}
          icon={AlertTriangle}
          trend="down"
          trendValue="-5% from yesterday"
          color="red"
        />
        <StatCard
          title="Pending Deliveries"
          value={stats.pendingDeliveries}
          icon={Truck}
          trend="up"
          trendValue="+3 today"
          color="green"
        />
        <StatCard
          title="High Risk Cases"
          value={stats.highRiskWomen}
          icon={Activity}
          trend="up"
          trendValue="+2 this week"
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Weekly Activity Chart */}
        <Card className="col-span-2 hover-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Weekly Activity</CardTitle>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
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
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Area type="monotone" dataKey="deliveries" stroke="#3b82f6" fillOpacity={1} fill="url(#colorDeliveries)" />
                  <Area type="monotone" dataKey="alerts" stroke="#ef4444" fillOpacity={1} fill="url(#colorAlerts)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risk Distribution Chart */}
        <Card className="hover-card">
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="hover-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{activity.user}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="hover-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button className="h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                <Users className="h-5 w-5" />
                <span className="text-xs">Register Woman</span>
              </Button>
              <Button className="h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                <AlertTriangle className="h-5 w-5" />
                <span className="text-xs">Create Alert</span>
              </Button>
              <Button className="h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                <Truck className="h-5 w-5" />
                <span className="text-xs">New Delivery</span>
              </Button>
              <Button className="h-20 flex flex-col items-center justify-center gap-2" variant="outline">
                <Activity className="h-5 w-5" />
                <span className="text-xs">Update Inventory</span>
              </Button>
            </div>

            {/* Upcoming Tasks */}
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Upcoming Tasks</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm">Follow-up with High Risk Patients</span>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">3 pending</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Delivery Schedule Review</span>
                  </div>
                  <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">2 today</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}