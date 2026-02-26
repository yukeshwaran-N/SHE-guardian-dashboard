// src/pages/admin/WomanDashboard.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { womanDashboardService, WomanDashboardData } from "@/services/womanDashboardService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertTriangle,
  Package,
  Video,
  Heart,
  Activity,
  ArrowLeft,
  Loader2,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function WomanDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WomanDashboardData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchWomanData(id);
    }
  }, [id]);

  const fetchWomanData = async (womanId: string) => {
    try {
      setLoading(true);
      const dashboardData = await womanDashboardService.getWomanDashboard(womanId);
      setData(dashboardData);
    } catch (error) {
      console.error("Error fetching woman data:", error);
      toast({
        title: "Error",
        description: "Failed to load woman dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch(risk) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (date: string, time: string) => {
    return new Date(`${date}T${time}`).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Woman Not Found</h2>
        <p className="text-muted-foreground mt-2">The requested woman profile does not exist.</p>
        <Button className="mt-4" onClick={() => navigate('/admin/registry')}>
          Back to Registry
        </Button>
      </div>
    );
  }

  const { profile, healthProfile, recentConsultations, recentDeliveries, recentAlerts, upcomingAppointments, statistics } = data;

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/registry')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Woman Dashboard</h1>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl">{getInitials(profile.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                <Badge variant={getRiskBadgeVariant(profile.risk_level)}>
                  {profile.risk_level?.toUpperCase()} RISK
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  {profile.email || 'No email'}
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  {profile.phone || 'No phone'}
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  DOB: {profile.date_of_birth ? formatDate(profile.date_of_birth) : 'N/A'} 
                  {profile.age && ` (${profile.age} years)`}
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  {profile.village || profile.district || 'No address'}
                </div>
              </div>
            </div>
          </div>

          {/* ASHA Worker Info */}
          {profile.asha_worker_name && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Assigned ASHA Worker</p>
              <div className="flex items-center justify-between mt-1">
                <span>{profile.asha_worker_name}</span>
                <span className="text-sm text-muted-foreground">{profile.asha_worker_phone}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Video className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Consultations</p>
              <p className="text-2xl font-bold">{statistics.totalConsultations}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deliveries</p>
              <p className="text-2xl font-bold">{statistics.totalDeliveries}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Alerts</p>
              <p className="text-2xl font-bold">{statistics.totalAlerts}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Checkup</p>
              <p className="text-2xl font-bold">{statistics.lastCheckup === 'Never' ? 'Never' : formatDate(statistics.lastCheckup)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Profile (if available) */}
      {healthProfile && (
        <Card>
          <CardHeader>
            <CardTitle>Health Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {healthProfile.blood_group && (
                <div>
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <p className="font-medium">{healthProfile.blood_group}</p>
                </div>
              )}
              {healthProfile.height && (
                <div>
                  <p className="text-sm text-muted-foreground">Height</p>
                  <p className="font-medium">{healthProfile.height} cm</p>
                </div>
              )}
              {healthProfile.weight && (
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-medium">{healthProfile.weight} kg</p>
                </div>
              )}
              {healthProfile.is_pregnant && (
                <div>
                  <p className="text-sm text-muted-foreground">Pregnancy</p>
                  <p className="font-medium">Week {healthProfile.pregnancy_weeks || '?'}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different sections */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming appointments</p>
              </CardContent>
            </Card>
          ) : (
            upcomingAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">Dr. {appointment.doctors?.name}</h3>
                      <p className="text-sm text-muted-foreground">{appointment.doctors?.specialty}</p>
                      <p className="text-sm mt-2">
                        {formatDateTime(appointment.scheduled_date, appointment.scheduled_time)}
                      </p>
                      <Badge variant="outline" className="mt-2">
                        {appointment.consultation_type}
                      </Badge>
                    </div>
                    <Badge>{appointment.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="consultations" className="space-y-4">
          {recentConsultations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No consultations found</p>
              </CardContent>
            </Card>
          ) : (
            recentConsultations.map((consultation) => (
              <Card key={consultation.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">Dr. {consultation.doctors?.name}</h3>
                      <p className="text-sm text-muted-foreground">{consultation.doctors?.specialty}</p>
                      <p className="text-sm mt-2">
                        {formatDateTime(consultation.scheduled_date, consultation.scheduled_time)}
                      </p>
                      {consultation.symptoms && (
                        <p className="text-sm mt-2">Symptoms: {consultation.symptoms}</p>
                      )}
                    </div>
                    <Badge variant={
                      consultation.status === 'completed' ? 'default' :
                      consultation.status === 'cancelled' ? 'destructive' : 'secondary'
                    }>
                      {consultation.status}
                    </Badge>
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
                <p>No deliveries found</p>
              </CardContent>
            </Card>
          ) : (
            recentDeliveries.map((delivery) => (
              <Card key={delivery.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">Order #{delivery.order_number}</h3>
                      <p className="text-sm">Scheduled: {formatDate(delivery.scheduled_date)}</p>
                      {delivery.items && delivery.items.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Items:</p>
                          <ul className="text-sm text-muted-foreground">
                            {delivery.items.map((item: any, i: number) => (
                              <li key={i}>• {item.name || item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
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

        <TabsContent value="alerts" className="space-y-4">
          {recentAlerts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>No alerts - All clear!</p>
              </CardContent>
            </Card>
          ) : (
            recentAlerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{alert.type}</h3>
                      <p className="text-sm mt-1">{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDateTime(alert.created_at, '00:00')}
                      </p>
                    </div>
                    <Badge variant={alert.severity === 'high' ? 'destructive' : 'warning'}>
                      {alert.severity}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}