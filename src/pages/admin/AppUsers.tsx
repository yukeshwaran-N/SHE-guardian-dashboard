// src/pages/admin/AppUsers.tsx
import { useState, useEffect } from "react";
import { appUsersService, AppUser, AppSession, AppFeedback } from "@/services/appUsersService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Users,
  Search,
  Loader2,
  Phone,
  Mail,
  Clock,
  Activity,
  MapPin,
  Smartphone,
  Star,
  MessageCircle,
  AlertCircle,
  Ban,
  CheckCircle,
  Send,
  BarChart3,
  Download
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AppUsers() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AppUser[]>([]);
  const [sessions, setSessions] = useState<AppSession[]>([]);
  const [feedback, setFeedback] = useState<AppFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    activeToday: 0,
    pendingFeedback: 0
  });
  const [versionDistribution, setVersionDistribution] = useState<any[]>([]);
  const [notificationText, setNotificationText] = useState("");
  const [notificationTitle, setNotificationTitle] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData, versionsData] = await Promise.all([
        appUsersService.getAllAppUsers(),
        appUsersService.getUserStats(),
        appUsersService.getVersionDistribution()
      ]);
      
      setUsers(usersData);
      setFilteredUsers(usersData);
      setStats(statsData);
      setVersionDistribution(versionsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load app users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSessions = async (userId: string) => {
    try {
      const sessionsData = await appUsersService.getUserSessions(userId);
      setSessions(sessionsData);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const fetchUserFeedback = async () => {
    try {
      const feedbackData = await appUsersService.getUserFeedback();
      setFeedback(feedbackData);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  };

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm) ||
      user.role?.includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleUserSelect = async (user: AppUser) => {
    setSelectedUser(user);
    await fetchUserSessions(user.id);
    setShowUserDetails(true);
  };

  const handleToggleBlock = async (userId: string, currentStatus: boolean) => {
    try {
      await appUsersService.toggleUserBlock(userId, currentStatus);
      await fetchData();
      toast({
        title: "Success",
        description: `User ${currentStatus ? 'blocked' : 'unblocked'}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleSendNotification = async () => {
    if (!selectedUser || !notificationTitle || !notificationText) return;
    
    try {
      await appUsersService.sendPushNotification(
        selectedUser.id,
        notificationTitle,
        notificationText,
        { type: 'admin_message' }
      );
      
      toast({
        title: "Success",
        description: "Notification sent successfully",
      });
      
      setNotificationTitle("");
      setNotificationText("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    }
  };

  const handleUpdateFeedbackStatus = async (feedbackId: string, status: string) => {
    try {
      await appUsersService.updateFeedbackStatus(feedbackId, status);
      await fetchUserFeedback();
      toast({
        title: "Success",
        description: `Feedback marked as ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update feedback status",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
      <div>
        <h1 className="text-3xl font-bold">App Users</h1>
        <p className="text-muted-foreground mt-2">
          Monitor and manage users from the mobile app
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Today</p>
                <p className="text-2xl font-bold">{stats.activeToday}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Feedback</p>
                <p className="text-2xl font-bold">{stats.pendingFeedback}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>App Version Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={versionDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="count"
                  >
                    {versionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Mon', users: 45 },
                  { name: 'Tue', users: 52 },
                  { name: 'Wed', users: 48 },
                  { name: 'Thu', users: 61 },
                  { name: 'Fri', users: 55 },
                  { name: 'Sat', users: 38 },
                  { name: 'Sun', users: 30 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, email, phone, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={fetchData}>
          <Loader2 className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Users Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="women">Women</TabsTrigger>
          <TabsTrigger value="asha">ASHA Workers</TabsTrigger>
          <TabsTrigger value="active">Active Now</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <UsersList 
            users={filteredUsers}
            onSelectUser={handleUserSelect}
            onToggleBlock={handleToggleBlock}
          />
        </TabsContent>

        <TabsContent value="women" className="space-y-4">
          <UsersList 
            users={filteredUsers.filter(u => u.role === 'woman')}
            onSelectUser={handleUserSelect}
            onToggleBlock={handleToggleBlock}
          />
        </TabsContent>

        <TabsContent value="asha" className="space-y-4">
          <UsersList 
            users={filteredUsers.filter(u => u.role === 'asha')}
            onSelectUser={handleUserSelect}
            onToggleBlock={handleToggleBlock}
          />
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <UsersList 
            users={filteredUsers.filter(u => u.is_active)}
            onSelectUser={handleUserSelect}
            onToggleBlock={handleToggleBlock}
          />
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{item.user_name}</span>
                            <Badge variant={
                              item.status === 'new' ? 'destructive' :
                              item.status === 'reviewed' ? 'warning' : 'default'
                            }>
                              {item.status}
                            </Badge>
                          </div>
                          <div className="flex items-center mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= item.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm mt-2">{item.feedback}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(item.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateFeedbackStatus(item.id, 'reviewed')}
                          >
                            Mark Reviewed
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateFeedbackStatus(item.id, 'resolved')}
                          >
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Details Dialog */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>User Details</span>
                <Button variant="ghost" size="sm" onClick={() => setShowUserDetails(false)}>
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User Info */}
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">{getInitials(selectedUser.full_name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedUser.full_name}</h3>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <p className="text-sm flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {selectedUser.email}
                    </p>
                    <p className="text-sm flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {selectedUser.phone}
                    </p>
                    <p className="text-sm flex items-center">
                      <Activity className="h-4 w-4 mr-2" />
                      Role: <Badge className="ml-2">{selectedUser.role}</Badge>
                    </p>
                    <p className="text-sm flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Last active: {selectedUser.last_active ? new Date(selectedUser.last_active).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Device Info */}
              {selectedUser.device_info && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Device Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><span className="text-muted-foreground">Platform:</span> {selectedUser.device_info.platform}</p>
                      <p><span className="text-muted-foreground">Version:</span> {selectedUser.device_info.version}</p>
                      <p><span className="text-muted-foreground">Model:</span> {selectedUser.device_info.model}</p>
                      <p><span className="text-muted-foreground">App Version:</span> {selectedUser.stats.last_app_version}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Location Info */}
              {selectedUser.location && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Last Known Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <p>Lat: {selectedUser.location.latitude}</p>
                        <p>Lng: {selectedUser.location.longitude}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Updated: {new Date(selectedUser.location.last_updated).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`https://www.google.com/maps?q=${selectedUser.location?.latitude},${selectedUser.location?.longitude}`)}
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        View on Map
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* User Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">User Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{selectedUser.stats.total_logins}</p>
                      <p className="text-xs text-muted-foreground">Total Logins</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{selectedUser.stats.total_sessions}</p>
                      <p className="text-xs text-muted-foreground">Sessions</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatDuration(selectedUser.stats.avg_session_duration)}</p>
                      <p className="text-xs text-muted-foreground">Avg. Duration</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="text-sm">
                            {new Date(session.started_at).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {session.device_info?.platform} • {session.ip_address}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {session.duration ? formatDuration(session.duration) : 'Active'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Send Notification */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Send Push Notification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Input
                      placeholder="Notification Title"
                      value={notificationTitle}
                      onChange={(e) => setNotificationTitle(e.target.value)}
                    />
                    <Input
                      placeholder="Notification Message"
                      value={notificationText}
                      onChange={(e) => setNotificationText(e.target.value)}
                    />
                    <Button 
                      onClick={handleSendNotification}
                      disabled={!notificationTitle || !notificationText}
                      className="w-full"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send Notification
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="destructive"
                  onClick={() => handleToggleBlock(selectedUser.id, selectedUser.is_active)}
                >
                  {selectedUser.is_active ? (
                    <>
                      <Ban className="h-4 w-4 mr-2" />
                      Block User
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Unblock User
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Users List Component
function UsersList({ users, onSelectUser, onToggleBlock }: {
  users: AppUser[];
  onSelectUser: (user: AppUser) => void;
  onToggleBlock: (id: string, currentStatus: boolean) => void;
}) {
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No users found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold">{user.full_name}</h3>
                    <Badge variant={user.role === 'admin' ? 'destructive' : 'default'}>
                      {user.role}
                    </Badge>
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-sm">{user.phone}</p>
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    Last active: {user.last_active ? new Date(user.last_active).toLocaleDateString() : 'Never'}
                    <Smartphone className="h-3 w-3 ml-3 mr-1" />
                    v{user.stats.last_app_version}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectUser(user)}
                >
                  View Details
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleBlock(user.id, user.is_active)}
                >
                  {user.is_active ? 'Block' : 'Unblock'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}