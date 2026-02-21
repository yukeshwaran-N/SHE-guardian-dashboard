// src/pages/admin/ASHAWorkers.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
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
import { motion } from "framer-motion";
import {
  User,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Star,
  Award,
  Users,
  UserCheck,
  UserX,
  Clock,
  Heart,
  Activity,
  TrendingUp,
  Shield,
  Plus,
  GraduationCap,
  Map,
  Home,
  PhoneCall
} from "lucide-react";

interface ASHAWorker {
  id: string;
  user_id: string | null;
  full_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  sector: string | null;
  village: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  date_of_birth: string | null;
  gender: string | null;
  qualification: string | null;
  experience_years: number | null;
  joining_date: string | null;
  status: 'active' | 'inactive' | 'on-leave' | null;
  assigned_women_count: number | null;
  performance_rating: number | null;
  total_visits: number | null;
  successful_visits: number | null;
  emergency_contact: string | null;
  profile_image: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export default function ASHAWorkers() {
  const [workers, setWorkers] = useState<ASHAWorker[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<ASHAWorker[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState<ASHAWorker | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    sector: '',
    village: '',
    district: '',
    state: '',
    pincode: '',
    qualification: '',
    experience_years: 0,
    status: 'active' as 'active' | 'inactive' | 'on-leave',
    emergency_contact: '',
    notes: ''
  });

  const { toast } = useToast();

  // Fetch workers on mount
  useEffect(() => {
    fetchWorkers();

    // Real-time subscription
    const subscription = supabase
      .channel('asha-workers-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'asha_workers' 
      }, () => {
        fetchWorkers(true);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Filter workers when search/filters change
  useEffect(() => {
    filterWorkers();
  }, [searchTerm, statusFilter, sectorFilter, workers]);

  const filterWorkers = () => {
    let filtered = [...workers];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(worker =>
        worker.full_name?.toLowerCase().includes(term) ||
        worker.phone?.toLowerCase().includes(term) ||
        worker.email?.toLowerCase().includes(term) ||
        worker.sector?.toLowerCase().includes(term) ||
        worker.village?.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(worker => worker.status === statusFilter);
    }

    // Apply sector filter
    if (sectorFilter !== "all") {
      filtered = filtered.filter(worker => worker.sector === sectorFilter);
    }

    setFilteredWorkers(filtered);
  };

  const fetchWorkers = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('asha_workers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Fetched workers:', data);
      setWorkers(data || []);
      setFilteredWorkers(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load ASHA workers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorker = async () => {
    setActionLoading(true);
    try {
      // Validate required fields
      if (!editForm.full_name || !editForm.sector) {
        throw new Error("Name and sector are required");
      }

      const newWorker = {
        full_name: editForm.full_name,
        phone: editForm.phone || null,
        email: editForm.email || null,
        sector: editForm.sector,
        village: editForm.village || null,
        district: editForm.district || null,
        state: editForm.state || null,
        pincode: editForm.pincode || null,
        qualification: editForm.qualification || null,
        experience_years: editForm.experience_years || 0,
        status: editForm.status,
        emergency_contact: editForm.emergency_contact || null,
        notes: editForm.notes || null,
        assigned_women_count: 0,
        performance_rating: 0,
        total_visits: 0,
        successful_visits: 0,
        joining_date: new Date().toISOString().split('T')[0]
      };

      const { data, error } = await supabase
        .from('asha_workers')
        .insert([newWorker])
        .select();

      if (error) throw error;

      await fetchWorkers(true);
      setIsAddDialogOpen(false);
      resetForm();
      
      toast({
        title: "Success",
        description: "ASHA worker added successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add worker",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditWorker = async () => {
    if (!selectedWorker) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('asha_workers')
        .update({
          full_name: editForm.full_name,
          phone: editForm.phone || null,
          email: editForm.email || null,
          sector: editForm.sector,
          village: editForm.village || null,
          district: editForm.district || null,
          state: editForm.state || null,
          pincode: editForm.pincode || null,
          qualification: editForm.qualification || null,
          experience_years: editForm.experience_years || 0,
          status: editForm.status,
          emergency_contact: editForm.emergency_contact || null,
          notes: editForm.notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedWorker.id);

      if (error) throw error;

      await fetchWorkers(true);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Worker updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update worker",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteWorker = async () => {
    if (!selectedWorker) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('asha_workers')
        .delete()
        .eq('id', selectedWorker.id);

      if (error) throw error;

      await fetchWorkers(true);
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Worker deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete worker",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setEditForm({
      full_name: '',
      phone: '',
      email: '',
      sector: '',
      village: '',
      district: '',
      state: '',
      pincode: '',
      qualification: '',
      experience_years: 0,
      status: 'active',
      emergency_contact: '',
      notes: ''
    });
  };

  const exportToCSV = () => {
    try {
      const headers = [
        'Name', 'Phone', 'Email', 'Sector', 'Village', 'District', 'State',
        'Qualification', 'Experience', 'Status', 'Women Assigned', 'Rating',
        'Total Visits', 'Success Rate', 'Joined Date'
      ];
      
      const rows = filteredWorkers.map(w => {
        const successRate = w.total_visits ? Math.round((w.successful_visits || 0) / w.total_visits * 100) : 0;
        return [
          w.full_name,
          w.phone || '',
          w.email || '',
          w.sector || '',
          w.village || '',
          w.district || '',
          w.state || '',
          w.qualification || '',
          w.experience_years || 0,
          w.status || '',
          w.assigned_women_count || 0,
          w.performance_rating || 0,
          w.total_visits || 0,
          `${successRate}%`,
          w.joining_date ? new Date(w.joining_date).toLocaleDateString() : ''
        ];
      });

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `asha_workers_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Exported",
        description: `${filteredWorkers.length} workers exported`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string | null) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'on-leave': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'A';
  };

  // Get unique sectors for filter
  const sectors = [...new Set(workers.map(w => w.sector).filter(Boolean))];

  // Calculate stats
  const totalWorkers = workers.length;
  const activeWorkers = workers.filter(w => w.status === 'active').length;
  const onLeaveWorkers = workers.filter(w => w.status === 'on-leave').length;
  const totalWomenAssigned = workers.reduce((sum, w) => sum + (w.assigned_women_count || 0), 0);
  const avgRating = workers.length 
    ? (workers.reduce((sum, w) => sum + (w.performance_rating || 0), 0) / workers.length).toFixed(1)
    : 0;

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
            <div className={`h-10 w-10 rounded-full bg-${color}-100 flex items-center justify-center`}>
              <Icon className={`h-5 w-5 text-${color}-600`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            ASHA Workers
          </h1>
          <p className="text-muted-foreground mt-1">
            {filteredWorkers.length} workers • {activeWorkers} active
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchWorkers()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600" onClick={() => {
            resetForm();
            setIsAddDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Worker
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total Workers" value={totalWorkers} icon={Users} color="blue" />
        <StatCard title="Active" value={activeWorkers} icon={UserCheck} color="green" />
        <StatCard title="On Leave" value={onLeaveWorkers} icon={Clock} color="yellow" />
        <StatCard title="Women Assigned" value={totalWomenAssigned} icon={Heart} color="pink" />
        <StatCard title="Avg Rating" value={avgRating} icon={Star} color="purple" />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, email, sector..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                Status
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-[140px]">
                <Map className="h-4 w-4 mr-2" />
                Sector
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {sectors.map(sector => (
                  <SelectItem key={sector} value={sector || ''}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredWorkers.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No ASHA workers found</p>
            </CardContent>
          </Card>
        ) : (
          filteredWorkers.map((worker) => (
            <motion.div
              key={worker.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
            >
              <Card className="relative overflow-hidden">
                {/* Status indicator bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  worker.status === 'active' ? 'bg-green-500' :
                  worker.status === 'on-leave' ? 'bg-yellow-500' : 'bg-gray-500'
                }`} />
                
                <CardContent className="p-4 pt-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarFallback className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                          {getInitials(worker.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{worker.full_name}</p>
                        <p className="text-xs text-muted-foreground">{worker.sector || 'No sector'}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(worker.status)}>
                      {worker.status}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 mb-3 text-sm">
                    {worker.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{worker.phone}</span>
                      </div>
                    )}
                    {worker.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate">{worker.email}</span>
                      </div>
                    )}
                    {worker.village && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span>{worker.village}{worker.district ? `, ${worker.district}` : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-blue-50 p-2 rounded text-center">
                      <p className="text-xs text-muted-foreground">Women</p>
                      <p className="font-bold">{worker.assigned_women_count || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-2 rounded text-center">
                      <p className="text-xs text-muted-foreground">Rating</p>
                      <p className="font-bold">{worker.performance_rating || 0}</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded text-center">
                      <p className="text-xs text-muted-foreground">Visits</p>
                      <p className="font-bold">{worker.total_visits || 0}</p>
                    </div>
                  </div>

                  {/* Experience & Qualification */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {worker.experience_years || 0} yrs
                    </span>
                    <span className="flex items-center gap-1">
                      <GraduationCap className="h-3 w-3" />
                      {worker.qualification || 'N/A'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {worker.joining_date ? new Date(worker.joining_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedWorker(worker);
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
                      onClick={() => {
                        setSelectedWorker(worker);
                        setEditForm({
                          full_name: worker.full_name || '',
                          phone: worker.phone || '',
                          email: worker.email || '',
                          sector: worker.sector || '',
                          village: worker.village || '',
                          district: worker.district || '',
                          state: worker.state || '',
                          pincode: worker.pincode || '',
                          qualification: worker.qualification || '',
                          experience_years: worker.experience_years || 0,
                          status: worker.status || 'active',
                          emergency_contact: worker.emergency_contact || '',
                          notes: worker.notes || ''
                        });
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600"
                      onClick={() => {
                        setSelectedWorker(worker);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>ASHA Worker Details</DialogTitle>
          </DialogHeader>
          {selectedWorker && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Profile Header */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                <Avatar className="h-16 w-16 border-2 border-white">
                  <AvatarFallback className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xl">
                    {getInitials(selectedWorker.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedWorker.full_name}</h3>
                  <Badge className={getStatusColor(selectedWorker.status)}>
                    {selectedWorker.status}
                  </Badge>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2 text-emerald-600">
                  <PhoneCall className="h-4 w-4" />
                  Contact Information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="font-medium">{selectedWorker.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedWorker.email || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Emergency Contact</Label>
                    <p className="font-medium">{selectedWorker.emergency_contact || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2 text-teal-600">
                  <MapPin className="h-4 w-4" />
                  Location
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-muted-foreground">Sector</Label>
                    <p className="font-medium">{selectedWorker.sector || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Village</Label>
                    <p className="font-medium">{selectedWorker.village || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">District</Label>
                    <p className="font-medium">{selectedWorker.district || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">State</Label>
                    <p className="font-medium">{selectedWorker.state || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Pincode</Label>
                    <p className="font-medium">{selectedWorker.pincode || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2 text-blue-600">
                  <Briefcase className="h-4 w-4" />
                  Professional Details
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-muted-foreground">Qualification</Label>
                    <p className="font-medium">{selectedWorker.qualification || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Experience</Label>
                    <p className="font-medium">{selectedWorker.experience_years || 0} years</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Joining Date</Label>
                    <p className="font-medium">{selectedWorker.joining_date ? new Date(selectedWorker.joining_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2 text-purple-600">
                  <Activity className="h-4 w-4" />
                  Performance
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Women Assigned</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedWorker.assigned_women_count || 0}</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="text-2xl font-bold text-purple-600">{selectedWorker.performance_rating || 0}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Total Visits</p>
                    <p className="text-2xl font-bold text-green-600">{selectedWorker.total_visits || 0}</p>
                  </div>
                </div>
                {selectedWorker.total_visits ? (
                  <div className="mt-2">
                    <Label className="text-muted-foreground">Success Rate</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${Math.round((selectedWorker.successful_visits || 0) / selectedWorker.total_visits * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round((selectedWorker.successful_visits || 0) / selectedWorker.total_visits * 100)}%
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Notes */}
              {selectedWorker.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="text-sm p-2 bg-muted/30 rounded">{selectedWorker.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isAddDialogOpen ? 'Add ASHA Worker' : 'Edit ASHA Worker'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name *</Label>
                <Input
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  placeholder="Phone number"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  placeholder="Email address"
                />
              </div>
              <div className="space-y-2">
                <Label>Sector *</Label>
                <Input
                  value={editForm.sector}
                  onChange={(e) => setEditForm({...editForm, sector: e.target.value})}
                  placeholder="Sector"
                />
              </div>
              <div className="space-y-2">
                <Label>Village</Label>
                <Input
                  value={editForm.village}
                  onChange={(e) => setEditForm({...editForm, village: e.target.value})}
                  placeholder="Village"
                />
              </div>
              <div className="space-y-2">
                <Label>District</Label>
                <Input
                  value={editForm.district}
                  onChange={(e) => setEditForm({...editForm, district: e.target.value})}
                  placeholder="District"
                />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Input
                  value={editForm.state}
                  onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                  placeholder="State"
                />
              </div>
              <div className="space-y-2">
                <Label>Pincode</Label>
                <Input
                  value={editForm.pincode}
                  onChange={(e) => setEditForm({...editForm, pincode: e.target.value})}
                  placeholder="Pincode"
                />
              </div>
              <div className="space-y-2">
                <Label>Qualification</Label>
                <Input
                  value={editForm.qualification}
                  onChange={(e) => setEditForm({...editForm, qualification: e.target.value})}
                  placeholder="Qualification"
                />
              </div>
              <div className="space-y-2">
                <Label>Experience (years)</Label>
                <Input
                  type="number"
                  value={editForm.experience_years}
                  onChange={(e) => setEditForm({...editForm, experience_years: parseInt(e.target.value) || 0})}
                  placeholder="Years of experience"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value: any) => setEditForm({...editForm, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="on-leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Emergency Contact</Label>
                <Input
                  value={editForm.emergency_contact}
                  onChange={(e) => setEditForm({...editForm, emergency_contact: e.target.value})}
                  placeholder="Emergency contact"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Input
                value={editForm.notes}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                placeholder="Additional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setIsEditDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button 
              onClick={isAddDialogOpen ? handleAddWorker : handleEditWorker}
              disabled={actionLoading}
              className="bg-gradient-to-r from-emerald-600 to-teal-600"
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isAddDialogOpen ? 'Add Worker' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete ASHA Worker</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this worker?</p>
          {selectedWorker && (
            <p className="font-medium">{selectedWorker.full_name}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteWorker} disabled={actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}