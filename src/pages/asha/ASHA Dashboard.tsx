// src/pages/asha/ASHA Dashboard.tsx
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ashaDashboardService, ASHADashboardData } from "@/services/ashaDashboardService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Star,
  Activity,
  Heart,
  FileText,
  PlusCircle,
  Loader2,
  TrendingUp
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function ASHADashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<ASHADashboardData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      if (user?.role === 'asha') {
        const data = await ashaDashboardService.getASHADashboard(user.id);
        setDashboardData(data);
      }
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

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch(risk) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Welcome to ASHA Dashboard</h2>
        <p className="text-muted-foreground mt-2">Your dashboard is being set up</p>
      </div>
    );
  }

  const { profile, stats, assignedWomen, upcomingVisits, recentAlerts, recentDeliveries, performance } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header with Profile */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">ASHA Worker Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, {profile.full_name}
          </p>
        </div>
        <Card className="w-64">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback>{getInitials(profile.full_name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{profile.sector}</p>
                <p className="text-sm text-muted-foreground">{profile.village}</p>
                <div className="flex items-center mt-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span className="text-xs ml-1">{profile.performance_rating?.toFixed(1) || '0.0'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assigned Women</p>
              <p className="text-2xl font-bold">{stats.assignedWomen}</p>
              <p className="text-xs text-red-600 mt-1">{stats.highRiskWomen} high risk</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Visits</p>
              <p className="text-2xl font-bold">{stats.totalVisits}</p>
              <p className="text-xs text-green-600 mt-1">{stats.successfulVisits} successful</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Visits</p>
              <p className="text-2xl font-bold">{stats.pendingVisits}</p>
              <p className="text-xs text-yellow-600 mt-1">{stats.completedToday} completed today</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Performance</p>
              <p className="text-2xl font-bold">
                {stats.totalVisits ? Math.round((stats.successfulVisits / stats.totalVisits) * 100) : 0}%
              </p>
              <p className="text-xs text-purple-600 mt-1">success rate</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Visits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performance.monthlyVisits}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performance.riskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="count"
                  >
                    {performance.riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="women" className="space-y-4">
        <TabsList>
          <TabsTrigger value="women">Assigned Women</TabsTrigger>
          <TabsTrigger value="visits">Upcoming Visits</TabsTrigger>
          <TabsTrigger value="alerts">Recent Alerts</TabsTrigger>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
        </TabsList>

        <TabsContent value="women" className="space-y-4">
          <div className="grid gap-4">
            {assignedWomen.map((woman) => (
              <Card key={woman.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarFallback>{getInitials(woman.users?.full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{woman.users?.full_name}</h3>
                          <Badge variant={getRiskBadgeVariant(woman.risk_level)}>
                            {woman.risk_level?.toUpperCase() || 'UNKNOWN'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{woman.users?.phone}</p>
                        <p className="text-sm flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {woman.village || woman.district || 'Address not available'}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          Last visit: {woman.last_visit_date || 'Never'}
                          <Heart className="h-3 w-3 ml-3 mr-1" />
                          Age: {woman.age || 'N/A'}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="visits" className="space-y-4">
          {upcomingVisits.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming visits scheduled</p>
                <Button className="mt-4">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Schedule Visit
                </Button>
              </CardContent>
            </Card>
          ) : (
            upcomingVisits.map((visit) => (
              <Card key={visit.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{visit.women?.users?.full_name}</h3>
                        <Badge variant="outline">{visit.visit_type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {visit.women?.village}
                      </p>
                      <div className="flex items-center mt-2 space-x-4">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(visit.visit_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-1" />
                          {visit.visit_time || 'Flexible'}
                        </div>
                      </div>
                      {visit.notes && (
                        <p className="text-sm mt-2 p-2 bg-muted rounded">
                          {visit.notes}
                        </p>
                      )}
                    </div>
                    <div className="space-x-2">
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                      <Button size="sm">
                        Start Visit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {recentAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>No active alerts</p>
                <p className="text-sm mt-1">All assigned women are safe</p>
              </CardContent>
            </Card>
          ) : (
            recentAlerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        alert.severity === 'high' ? 'bg-red-100' :
                        alert.severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        <AlertTriangle className={`h-4 w-4 ${
                          alert.severity === 'high' ? 'text-red-600' :
                          alert.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{alert.women?.users?.full_name}</h3>
                          <Badge variant={
                            alert.severity === 'high' ? 'destructive' :
                            alert.severity === 'medium' ? 'warning' : 'secondary'
                          }>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">{alert.type}</p>
                        <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button size="sm">Respond</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="deliveries" className="space-y-4">
          {recentDeliveries.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No deliveries scheduled</p>
              </CardContent>
            </Card>
          ) : (
            recentDeliveries.map((delivery) => (
              <Card key={delivery.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{delivery.women?.users?.full_name}</h3>
                        <Badge variant="outline">{delivery.status}</Badge>
                      </div>
                      <p className="text-sm mt-1">Order #{delivery.order_number}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(delivery.scheduled_date).toLocaleDateString()}
                        </div>
                        {delivery.items && (
                          <div className="text-sm text-muted-foreground">
                            {delivery.items.length} items
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant={
                      delivery.status === 'delivered' ? 'default' :
                      delivery.status === 'cancelled' ? 'destructive' : 'secondary'
                    }>
                      {delivery.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <PlusCircle className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <h3 className="font-semibold">Schedule Visit</h3>
            <p className="text-sm text-muted-foreground mt-1">Plan a new home visit</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <h3 className="font-semibold">Update Records</h3>
            <p className="text-sm text-muted-foreground mt-1">Add health observations</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Heart className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <h3 className="font-semibold">Health Tips</h3>
            <p className="text-sm text-muted-foreground mt-1">Share with women</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}