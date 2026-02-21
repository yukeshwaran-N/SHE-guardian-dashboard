// src/pages/admin/WomenRegistry.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Users,
  UserCheck,
  Heart,
  RefreshCw,
  Loader2,
  MapPin,
  Shield,
  Award,
  Star,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
  MessageSquare,
  MoreHorizontal,
  Sparkles,
  Crown,
  Medal,
  Activity,
  Thermometer,
  Droplet,
  Baby,
  Stethoscope,
  Pill,
  FileText,
  Share2,
  Printer
} from "lucide-react";

interface User {
  id: string;
  auth_id: string | null;
  phone: string | null;
  email: string | null;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  preferred_language: string | null;
  avatar_url: string | null;
  is_onboarding_complete: boolean | null;
  has_completed_questionnaire: boolean | null;
  last_active: string | null;
  created_at: string | null;
  updated_at: string | null;
}

// Extended user with computed fields
interface EnhancedUser extends User {
  risk_level: 'low' | 'medium' | 'high';
  last_visit_days: number;
  health_score: number;
  location?: string;
}

export default function WomenRegistry() {
  const [users, setUsers] = useState<EnhancedUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<EnhancedUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<EnhancedUser | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showSensitive, setShowSensitive] = useState<{[key: string]: boolean}>({});
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  
  const { toast } = useToast();

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    date_of_birth: '',
    gender: '',
    preferred_language: 'en',
    is_onboarding_complete: false,
    has_completed_questionnaire: false
  });

  // Fetch data on mount
  useEffect(() => {
    fetchUsers();

    const subscription = supabase
      .channel('users-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'users' 
      }, () => {
        fetchUsers(true);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Filter users when search/filters change
  useEffect(() => {
    filterUsers();
  }, [searchTerm, statusFilter, riskFilter, users]);

  const enhanceUsers = (rawUsers: User[]): EnhancedUser[] => {
    return rawUsers.map(user => {
      // Calculate risk level based on profile completeness and activity
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      const lastActive = user.last_active ? new Date(user.last_active) : null;
      const now = new Date();
      const daysSinceLastActive = lastActive ? Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)) : 999;
      
      if (!user.has_completed_questionnaire || daysSinceLastActive > 30) {
        riskLevel = 'high';
      } else if (!user.is_onboarding_complete || daysSinceLastActive > 14) {
        riskLevel = 'medium';
      }

      // Calculate health score (0-100)
      let healthScore = 0;
      if (user.is_onboarding_complete) healthScore += 30;
      if (user.has_completed_questionnaire) healthScore += 40;
      if (lastActive && daysSinceLastActive < 7) healthScore += 30;
      else if (lastActive && daysSinceLastActive < 14) healthScore += 15;

      return {
        ...user,
        risk_level: riskLevel,
        last_visit_days: daysSinceLastActive,
        health_score: healthScore,
        location: 'Not specified' // You can extract from address if you add that field
      };
    });
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.full_name?.toLowerCase().includes(term) ||
        user.phone?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.id?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== "all") {
      if (statusFilter === "onboarded") {
        filtered = filtered.filter(u => u.is_onboarding_complete);
      } else if (statusFilter === "pending") {
        filtered = filtered.filter(u => !u.is_onboarding_complete);
      } else if (statusFilter === "health-data") {
        filtered = filtered.filter(u => u.has_completed_questionnaire);
      }
    }

    if (riskFilter !== "all") {
      filtered = filtered.filter(u => u.risk_level === riskFilter);
    }

    setFilteredUsers(filtered);
  };

  const fetchUsers = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const enhanced = enhanceUsers(data || []);
      setUsers(enhanced);
      setFilteredUsers(enhanced);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSensitive = (userId: string) => {
    setShowSensitive(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const maskPhone = (phone: string | null) => {
    if (!phone) return 'N/A';
    return phone.replace(/(\d{2})\d{6}(\d{2})/, '$1••••••$2');
  };

  const maskEmail = (email: string | null) => {
    if (!email) return 'N/A';
    const [local, domain] = email.split('@');
    if (local.length <= 4) return `${local}@${domain}`;
    const maskedLocal = local.slice(0, 2) + '•••' + local.slice(-2);
    return `${maskedLocal}@${domain}`;
  };

  const handleEdit = (user: EnhancedUser) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name || '',
      phone: user.phone || '',
      email: user.email || '',
      date_of_birth: user.date_of_birth || '',
      gender: user.gender || '',
      preferred_language: user.preferred_language || 'en',
      is_onboarding_complete: user.is_onboarding_complete || false,
      has_completed_questionnaire: user.has_completed_questionnaire || false
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: editForm.full_name,
          phone: editForm.phone || null,
          email: editForm.email || null,
          date_of_birth: editForm.date_of_birth || null,
          gender: editForm.gender || null,
          preferred_language: editForm.preferred_language,
          is_onboarding_complete: editForm.is_onboarding_complete,
          has_completed_questionnaire: editForm.has_completed_questionnaire,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      await fetchUsers(true);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', selectedUser.id);

      if (error) throw error;

      await fetchUsers(true);
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Record deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Date of Birth', 'Gender', 'Language', 'Risk Level', 'Health Score', 'Onboarding', 'Questionnaire', 'Last Active', 'Joined'];
    const rows = filteredUsers.map(u => [
      u.full_name,
      u.phone || '',
      u.email || '',
      u.date_of_birth || '',
      u.gender || '',
      u.preferred_language || 'en',
      u.risk_level,
      u.health_score,
      u.is_onboarding_complete ? 'Yes' : 'No',
      u.has_completed_questionnaire ? 'Yes' : 'No',
      u.last_active ? new Date(u.last_active).toLocaleDateString() : '',
      u.created_at ? new Date(u.created_at).toLocaleDateString() : ''
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell || ''}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `women_registry_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: `${filteredUsers.length} records exported`,
    });
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch(risk) {
      case 'high': return <AlertCircle className="h-4 w-4" />;
      case 'medium': return <Activity className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const stats = {
    total: users.length,
    onboarded: users.filter(u => u.is_onboarding_complete).length,
    questionnaire: users.filter(u => u.has_completed_questionnaire).length,
    highRisk: users.filter(u => u.risk_level === 'high').length,
    mediumRisk: users.filter(u => u.risk_level === 'medium').length,
    lowRisk: users.filter(u => u.risk_level === 'low').length,
    activeToday: users.filter(u => {
      if (!u.last_active) return false;
      const lastActive = new Date(u.last_active).toDateString();
      const today = new Date().toDateString();
      return lastActive === today;
    }).length
  };

  const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
              {trend && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  {trend}
                </p>
              )}
            </div>
            <div className={`h-12 w-12 rounded-full bg-${color}-100 flex items-center justify-center`}>
              <Icon className={`h-6 w-6 text-${color}-600`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading women registry...</p>
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
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Women Registry
            </h1>
            <Badge variant="outline" className="bg-green-100 text-green-800">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              {stats.activeToday} Active Today
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            {filteredUsers.length} registered women • {stats.highRisk} high risk
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}>
            {viewMode === 'grid' ? 'Table View' : 'Grid View'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => fetchUsers()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard title="Total" value={stats.total} icon={Users} color="blue" />
        <StatCard title="Onboarded" value={stats.onboarded} icon={UserCheck} color="green" trend="+12%" />
        <StatCard title="Health Data" value={stats.questionnaire} icon={Heart} color="purple" />
        <StatCard title="High Risk" value={stats.highRisk} icon={AlertCircle} color="red" />
        <StatCard title="Medium Risk" value={stats.mediumRisk} icon={Activity} color="yellow" />
        <StatCard title="Low Risk" value={stats.lowRisk} icon={CheckCircle} color="green" />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, email..."
                className="pl-10"
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
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="onboarded">Onboarded</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="health-data">Has Health Data</SelectItem>
              </SelectContent>
            </Select>
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-[150px]">
                <AlertCircle className="h-4 w-4 mr-2" />
                Risk Level
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid/Table View */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filteredUsers.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No women found</p>
                </CardContent>
              </Card>
            ) : (
              filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Risk indicator bar */}
                    <div className={`h-1 w-full ${
                      user.risk_level === 'high' ? 'bg-red-500' :
                      user.risk_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    
                    <CardContent className="p-5">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2 border-primary/20">
                            <AvatarFallback className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
                              {user.full_name?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-lg">{user.full_name}</h3>
                            <p className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}</p>
                          </div>
                        </div>
                        <Badge className={getRiskColor(user.risk_level)}>
                          {getRiskIcon(user.risk_level)}
                          <span className="ml-1 capitalize">{user.risk_level} risk</span>
                        </Badge>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {showSensitive[user.id] ? user.phone : maskPhone(user.phone)}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => toggleSensitive(user.id)}
                          >
                            {showSensitive[user.id] ? 
                              <EyeOff className="h-3 w-3" /> : 
                              <Eye className="h-3 w-3" />
                            }
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {showSensitive[user.id] ? user.email : maskEmail(user.email)}
                        </div>
                      </div>

                      {/* Health Stats Grid */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-pink-50 p-2 rounded">
                          <p className="text-xs text-pink-600 mb-1">Health Score</p>
                          <div className="flex items-center gap-1">
                            <span className="text-lg font-bold">{user.health_score}</span>
                            <span className="text-xs">/100</span>
                          </div>
                          <Progress value={user.health_score} className="h-1 mt-1" />
                        </div>
                        <div className="bg-purple-50 p-2 rounded">
                          <p className="text-xs text-purple-600 mb-1">Last Active</p>
                          <p className="text-sm font-medium">
                            {user.last_visit_days === 999 ? 'Never' : 
                             user.last_visit_days === 0 ? 'Today' :
                             `${user.last_visit_days}d ago`}
                          </p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {user.is_onboarding_complete && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Onboarded
                          </Badge>
                        )}
                        {user.has_completed_questionnaire && (
                          <Badge className="bg-purple-100 text-purple-800 text-xs">
                            <Heart className="h-3 w-3 mr-1" />
                            Health Data
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {user.preferred_language || 'en'}
                        </Badge>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* More Actions Menu */}
                      <div className="mt-2 flex justify-end">
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <MoreHorizontal className="h-4 w-4 mr-1" />
                          More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Table View */
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Health Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>{user.full_name?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-xs text-muted-foreground">{user.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {showSensitive[user.id] ? user.phone : maskPhone(user.phone)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {showSensitive[user.id] ? user.email : maskEmail(user.email)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRiskColor(user.risk_level)}>
                        {user.risk_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.health_score}</span>
                        <Progress value={user.health_score} className="w-16 h-1" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {user.is_onboarding_complete && (
                          <Badge className="bg-green-100 text-green-800 text-xs">Onboarded</Badge>
                        )}
                        {user.has_completed_questionnaire && (
                          <Badge className="bg-purple-100 text-purple-800 text-xs">Health Data</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.last_visit_days === 999 ? 'Never' : 
                       user.last_visit_days === 0 ? 'Today' :
                       `${user.last_visit_days} days ago`}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => {
                          setSelectedUser(user);
                          setIsViewDialogOpen(true);
                        }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600" onClick={() => {
                          setSelectedUser(user);
                          setIsDeleteDialogOpen(true);
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg">
                <Avatar className="h-16 w-16 border-2 border-white">
                  <AvatarFallback className="bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xl">
                    {selectedUser.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.full_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getRiskColor(selectedUser.risk_level)}>
                      {selectedUser.risk_level} risk
                    </Badge>
                    <Badge variant="outline">Health Score: {selectedUser.health_score}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedUser.email || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date of Birth</Label>
                  <p className="font-medium">{formatDate(selectedUser.date_of_birth)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Gender</Label>
                  <p className="font-medium">{selectedUser.gender || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Language</Label>
                  <p className="font-medium">{selectedUser.preferred_language || 'en'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Active</Label>
                  <p className="font-medium">{formatDate(selectedUser.last_active)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Joined</Label>
                  <p className="font-medium">{formatDate(selectedUser.created_at)}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Health Status</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Onboarding</span>
                      <span>{selectedUser.is_onboarding_complete ? 'Completed' : 'Pending'}</span>
                    </div>
                    <Progress value={selectedUser.is_onboarding_complete ? 100 : 0} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Health Questionnaire</span>
                      <span>{selectedUser.has_completed_questionnaire ? 'Completed' : 'Pending'}</span>
                    </div>
                    <Progress value={selectedUser.has_completed_questionnaire ? 100 : 0} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setIsViewDialogOpen(false);
              handleEdit(selectedUser!);
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog - Keep existing edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={editForm.date_of_birth}
                  onChange={(e) => setEditForm({...editForm, date_of_birth: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={editForm.gender}
                  onValueChange={(value) => setEditForm({...editForm, gender: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Preferred Language</Label>
                <Select
                  value={editForm.preferred_language}
                  onValueChange={(value) => setEditForm({...editForm, preferred_language: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="ta">Tamil</SelectItem>
                    <SelectItem value="te">Telugu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.is_onboarding_complete}
                    onChange={(e) => setEditForm({...editForm, is_onboarding_complete: e.target.checked})}
                  />
                  <span>Onboarding Complete</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.has_completed_questionnaire}
                    onChange={(e) => setEditForm({...editForm, has_completed_questionnaire: e.target.checked})}
                  />
                  <span>Health Questionnaire Complete</span>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
            <DialogDescription>
              Are you sure? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <p>
              Delete <span className="font-medium">{selectedUser.full_name}'s</span> record?
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}