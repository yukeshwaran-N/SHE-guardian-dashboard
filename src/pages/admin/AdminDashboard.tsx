// src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usersService } from "@/services/usersService";
import { womenService } from "@/services/womenService";
import { doctorsService } from "@/services/doctorsService";
import { ashaService } from "@/services/ashaService";
import { alertsService } from "@/services/alertsService";
import { deliveriesService } from "@/services/deliveriesService";
import { inventoryService } from "@/services/inventoryService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserPlus, 
  Activity, 
  AlertTriangle,
  Package,
  Truck,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Loader2,
  Heart,
  Stethoscope,
  ClipboardList
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface DashboardStats {
  totalUsers: number;
  totalWomen: number;
  totalDoctors: number;
  totalASHA: number;
  activeAlerts: number;
  pendingDeliveries: number;
  lowStockItems: number;
  totalRevenue: number;
  womenByRisk: {
    low: number;
    medium: number;
    high: number;
  };
  deliveriesByStatus: {
    pending: number;
    assigned: number;
    inTransit: number;
    delivered: number;
  };
  recentActivities: any[];
  monthlyStats: any[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalWomen: 0,
    totalDoctors: 0,
    totalASHA: 0,
    activeAlerts: 0,
    pendingDeliveries: 0,
    lowStockItems: 0,
    totalRevenue: 0,
    womenByRisk: { low: 0, medium: 0, high: 0 },
    deliveriesByStatus: { pending: 0, assigned: 0, inTransit: 0, delivered: 0 },
    recentActivities: [],
    monthlyStats: []
  });
  const { toast } = useToast();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        users,
        women,
        doctors,
        asha,
        alerts,
        deliveries,
        inventory
      ] = await Promise.all([
        usersService.getAllUsers(),
        womenService.getAllWomen(),
        doctorsService.getAllDoctors(),
        ashaService.getAllASHAWorkers(),
        alertsService.getAllAlerts(),
        deliveriesService.getAllDeliveries(),
        inventoryService.getAllItems()
      ]);

      // Calculate women by risk level
      const womenByRisk = {
        low: women.filter(w => w.risk_level === 'low').length,
        medium: women.filter(w => w.risk_level === 'medium').length,
        high: women.filter(w => w.risk_level === 'high').length
      };

      // Calculate deliveries by status
      const deliveriesByStatus = {
        pending: deliveries.filter(d => d.status === 'pending').length,
        assigned: deliveries.filter(d => d.status === 'assigned').length,
        inTransit: deliveries.filter(d => d.status === 'in-transit').length,
        delivered: deliveries.filter(d => d.status === 'delivered').length
      };

      // Calculate low stock items
      const lowStockItems = inventory.filter(item => 
        item.quantity <= (item.threshold || 10)
      ).length;

      // Calculate total revenue from delivered items
      const totalRevenue = deliveries
        .filter(d => d.status === 'delivered' && d.total_amount)
        .reduce((sum, d) => sum + (d.total_amount || 0), 0);

      // Generate monthly stats (mock data for now - replace with actual data)
      const monthlyStats = [
        { name: 'Jan', women: 65, deliveries: 28, alerts: 12 },
        { name: 'Feb', women: 75, deliveries: 32, alerts: 15 },
        { name: 'Mar', women: 85, deliveries: 35, alerts: 18 },
        { name: 'Apr', women: 95, deliveries: 40, alerts: 22 },
        { name: 'May', women: 105, deliveries: 45, alerts: 25 },
        { name: 'Jun', women: 115, deliveries: 48, alerts: 28 },
      ];

      // Create recent activities
      const recentActivities = [
        ...alerts.slice(0, 3).map(a => ({
          id: a.id,
          type: 'alert',
          title: `New ${a.severity} priority alert`,
          description: a.type,
          time: new Date(a.created_at).toLocaleDateString(),
          icon: AlertTriangle,
          color: 'text-red-500'
        })),
        ...deliveries.slice(0, 3).map(d => ({
          id: d.id,
          type: 'delivery',
          title: `Delivery ${d.status}`,
          description: `Order #${d.order_number}`,
          time: new Date(d.created_at).toLocaleDateString(),
          icon: Truck,
          color: 'text-blue-500'
        })),
        ...women.slice(0, 3).map(w => ({
          id: w.id,
          type: 'woman',
          title: 'New woman registered',
          description: w.full_name,
          time: new Date(w.created_at || '').toLocaleDateString(),
          icon: UserPlus,
          color: 'text-green-500'
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

      setStats({
        totalUsers: users.length,
        totalWomen: women.length,
        totalDoctors: doctors.length,
        totalASHA: asha.length,
        activeAlerts: alerts.filter(a => a.status === 'active').length,
        pendingDeliveries: deliveries.filter(d => d.status === 'pending').length,
        lowStockItems,
        totalRevenue,
        womenByRisk,
        deliveriesByStatus,
        recentActivities,
        monthlyStats
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user?.full_name}. Here's what's happening with your platform.
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Women</p>
              <p className="text-2xl font-bold">{stats.totalWomen}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Stethoscope className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Doctors</p>
              <p className="text-2xl font-bold">{stats.totalDoctors}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                +3 new this month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ASHA Workers</p>
              <p className="text-2xl font-bold">{stats.totalASHA}</p>
              <p className="text-xs text-green-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                {stats.totalASHA} active
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
              <p className="text-2xl font-bold">{stats.activeAlerts}</p>
              <p className="text-xs text-red-600 flex items-center mt-1">
                <TrendingDown className="h-3 w-3 mr-1" />
                {stats.activeAlerts} need attention
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Package className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Deliveries</p>
              <p className="text-2xl font-bold">{stats.pendingDeliveries}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-bold">{stats.lowStockItems}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-indigo-100 rounded-full">
              <Truck className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Transit</p>
              <p className="text-2xl font-bold">{stats.deliveriesByStatus.inTransit}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-emerald-100 rounded-full">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="women">Women Analytics</TabsTrigger>
          <TabsTrigger value="deliveries">Delivery Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Monthly Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="women" stroke="#8884d8" name="Women" />
                      <Line type="monotone" dataKey="deliveries" stroke="#82ca9d" name="Deliveries" />
                      <Line type="monotone" dataKey="alerts" stroke="#ff7300" name="Alerts" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Women by Risk Level */}
            <Card>
              <CardHeader>
                <CardTitle>Women by Risk Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Low Risk', value: stats.womenByRisk.low },
                          { name: 'Medium Risk', value: stats.womenByRisk.medium },
                          { name: 'High Risk', value: stats.womenByRisk.high }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.womenByRisk.low > 0 && <Cell fill="#00C49F" />}
                        {stats.womenByRisk.medium > 0 && <Cell fill="#FFBB28" />}
                        {stats.womenByRisk.high > 0 && <Cell fill="#FF8042" />}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="women" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Women Growth Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Women Registration Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="women" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* ASHA Worker Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>ASHA Worker Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Active', value: stats.totalASHA - 2 },
                      { name: 'On Leave', value: 2 },
                      { name: 'Inactive', value: 1 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8">
                        <Cell fill="#00C49F" />
                        <Cell fill="#FFBB28" />
                        <Cell fill="#FF8042" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Deliveries by Status */}
            <Card>
              <CardHeader>
                <CardTitle>Deliveries by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Pending', value: stats.deliveriesByStatus.pending },
                          { name: 'Assigned', value: stats.deliveriesByStatus.assigned },
                          { name: 'In Transit', value: stats.deliveriesByStatus.inTransit },
                          { name: 'Delivered', value: stats.deliveriesByStatus.delivered }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#FFBB28" />
                        <Cell fill="#0088FE" />
                        <Cell fill="#FF8042" />
                        <Cell fill="#00C49F" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Deliveries Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.monthlyStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="deliveries" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 border-b last:border-0 pb-4 last:pb-0">
                <div className={`p-2 rounded-full bg-opacity-10 ${activity.color}`}>
                  <activity.icon className={`h-4 w-4 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <UserPlus className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <h3 className="font-semibold">Register New Woman</h3>
            <p className="text-sm text-muted-foreground mt-1">Add a new woman to the registry</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <h3 className="font-semibold">Create Delivery</h3>
            <p className="text-sm text-muted-foreground mt-1">Schedule a new delivery</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <ClipboardList className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <h3 className="font-semibold">Generate Report</h3>
            <p className="text-sm text-muted-foreground mt-1">Create monthly statistics report</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}