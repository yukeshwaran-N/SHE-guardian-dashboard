// src/pages/admin/HealthProfiles.tsx
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
  Heart,
  Activity,
  Calendar,
  Droplet,
  Pill,
  AlertTriangle,
  Baby,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Loader2,
  RefreshCw,
  Thermometer,
  Stethoscope,
  Users,
  UserCircle,
  UserX
} from "lucide-react";

interface HealthProfile {
  id: string;
  user_id: string | null;
  periods_regular: string | null;
  period_cycle_length: number | null;
  period_bleeding_days: number | null;
  missed_periods_frequency: string | null;
  last_menstrual_period: string | null;
  common_symptoms: any | null;
  has_chronic_conditions: boolean | null;
  chronic_conditions: any | null;
  current_medications: any | null;
  is_pregnant: boolean | null;
  due_date: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface UserData {
  id: string;
  full_name: string | null;
  email: string | null;
}

export default function HealthProfiles() {
  const [profiles, setProfiles] = useState<HealthProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<HealthProfile[]>([]);
  const [users, setUsers] = useState<Record<string, UserData>>({});
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<HealthProfile | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [pregnancyFilter, setPregnancyFilter] = useState<string>("all");
  const [chronicFilter, setChronicFilter] = useState<string>("all");
  const [regularFilter, setRegularFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await fetchUsers();
      await fetchProfiles();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email');

      if (error) throw error;

      const userMap: Record<string, UserData> = {};
      data?.forEach(user => {
        userMap[user.id] = user;
      });
      setUsers(userMap);
      console.log('Users loaded:', Object.keys(userMap).length);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('health_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Profiles loaded:', data?.length);
      setProfiles(data || []);
      setFilteredProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load health profiles",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (profiles.length > 0) {
      filterProfiles();
    }
  }, [searchTerm, pregnancyFilter, chronicFilter, regularFilter, profiles, users]);

  const filterProfiles = () => {
    let filtered = [...profiles];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(profile => {
        const user = profile.user_id ? users[profile.user_id] : null;
        const userName = user?.full_name?.toLowerCase() || '';
        const userEmail = user?.email?.toLowerCase() || '';
        
        return userName.includes(term) || 
               userEmail.includes(term) ||
               profile.id.toLowerCase().includes(term);
      });
    }

    if (pregnancyFilter !== "all") {
      const isPregnant = pregnancyFilter === "pregnant";
      filtered = filtered.filter(p => p.is_pregnant === isPregnant);
    }

    if (chronicFilter !== "all") {
      const hasChronic = chronicFilter === "yes";
      filtered = filtered.filter(p => p.has_chronic_conditions === hasChronic);
    }

    if (regularFilter !== "all") {
      const isRegular = regularFilter === "regular";
      filtered = filtered.filter(p => p.periods_regular === (isRegular ? 'regular' : 'irregular'));
    }

    setFilteredProfiles(filtered);
  };

  const getUserInfo = (profile: HealthProfile) => {
    if (!profile.user_id) {
      return { 
        name: 'No User Linked', 
        email: '', 
        exists: false,
        initials: 'NU'
      };
    }
    
    const user = users[profile.user_id];
    if (!user) {
      return { 
        name: 'Deleted User', 
        email: '', 
        exists: false,
        initials: 'DU'
      };
    }
    
    return { 
      name: user.full_name || user.email?.split('@')[0] || 'Unknown', 
      email: user.email || '',
      exists: true,
      initials: (user.full_name ? 
        user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 
        user.email?.slice(0, 2).toUpperCase() || '??')
    };
  };

  const handleDeleteProfile = async () => {
    if (!selectedProfile) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('health_profiles')
        .delete()
        .eq('id', selectedProfile.id);

      if (error) throw error;

      await fetchProfiles();
      setIsDeleteDialogOpen(false);
      toast({
        title: "Success",
        description: "Health profile deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete profile",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const parseJsonArray = (data: any): string[] => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    return [];
  };

  const getPeriodStatusColor = (status: string | null) => {
    switch(status) {
      case 'regular': return 'bg-green-100 text-green-800';
      case 'irregular': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalProfiles = profiles.length;
  const pregnantCount = profiles.filter(p => p.is_pregnant).length;
  const chronicCount = profiles.filter(p => p.has_chronic_conditions).length;
  const regularCount = profiles.filter(p => p.periods_regular === 'regular').length;

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
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Health Profiles
          </h1>
          <p className="text-gray-500 mt-1">
            {filteredProfiles.length} health records
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total" value={totalProfiles} icon={Users} color="blue" />
        <StatCard title="Pregnant" value={pregnantCount} icon={Baby} color="pink" />
        <StatCard title="Chronic" value={chronicCount} icon={Stethoscope} color="amber" />
        <StatCard title="Regular" value={regularCount} icon={Activity} color="green" />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={pregnancyFilter} onValueChange={setPregnancyFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="h-4 w-4 mr-2" />
                Pregnancy
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pregnant">Pregnant</SelectItem>
                <SelectItem value="not">Not Pregnant</SelectItem>
              </SelectContent>
            </Select>
            <Select value={chronicFilter} onValueChange={setChronicFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                Chronic
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Has Conditions</SelectItem>
                <SelectItem value="no">No Conditions</SelectItem>
              </SelectContent>
            </Select>
            <Select value={regularFilter} onValueChange={setRegularFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                Periods
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="irregular">Irregular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Profiles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProfiles.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No health profiles found</p>
            </CardContent>
          </Card>
        ) : (
          filteredProfiles.map((profile) => {
            const userInfo = getUserInfo(profile);
            const symptoms = parseJsonArray(profile.common_symptoms);

            return (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className={`hover:shadow-lg transition-shadow ${
                  !userInfo.exists ? 'border-orange-200 bg-orange-50/30' : ''
                }`}>
                  <CardContent className="p-4">
                    {/* User Info */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={`${
                            userInfo.exists 
                              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white' 
                              : 'bg-gray-400 text-white'
                          }`}>
                            {userInfo.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1">
                            <p className="font-medium text-gray-800">{userInfo.name}</p>
                            {!userInfo.exists && (
                              <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-200">
                                <UserX className="h-3 w-3 mr-1" />
                                Missing
                              </Badge>
                            )}
                          </div>
                          {userInfo.email ? (
                            <p className="text-xs text-gray-500 truncate max-w-[150px]">
                              {userInfo.email}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400 italic">No email</p>
                          )}
                        </div>
                      </div>
                      {profile.is_pregnant && (
                        <Badge className="bg-pink-100 text-pink-800">
                          <Baby className="h-3 w-3 mr-1" />
                          Pregnant
                        </Badge>
                      )}
                    </div>

                    {/* Health Stats */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="bg-pink-50 p-2 rounded">
                        <p className="text-xs text-pink-600 mb-1">Periods</p>
                        <Badge className={getPeriodStatusColor(profile.periods_regular)}>
                          {profile.periods_regular || 'N/A'}
                        </Badge>
                      </div>
                      <div className="bg-purple-50 p-2 rounded">
                        <p className="text-xs text-purple-600 mb-1">Cycle</p>
                        <p className="text-sm font-medium">
                          {profile.period_cycle_length ? `${profile.period_cycle_length}d` : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-amber-50 p-2 rounded">
                        <p className="text-xs text-amber-600 mb-1">Chronic</p>
                        <Badge className={profile.has_chronic_conditions ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}>
                          {profile.has_chronic_conditions ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-xs text-blue-600 mb-1">Created</p>
                        <p className="text-xs">
                          {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Symptoms */}
                    {symptoms.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Symptoms:</p>
                        <div className="flex flex-wrap gap-1">
                          {symptoms.slice(0, 2).map((s, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {s}
                            </Badge>
                          ))}
                          {symptoms.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{symptoms.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedProfile(profile);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600"
                        onClick={() => {
                          setSelectedProfile(profile);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Health Profile Details</DialogTitle>
          </DialogHeader>
          {selectedProfile && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-r from-pink-600 to-purple-600 text-white">
                    {getUserInfo(selectedProfile).initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{getUserInfo(selectedProfile).name}</h3>
                  <p className="text-sm text-gray-500">{getUserInfo(selectedProfile).email || 'No email'}</p>
                  {!getUserInfo(selectedProfile).exists && (
                    <Badge variant="outline" className="mt-1 bg-orange-100 text-orange-800 border-orange-200">
                      User account no longer exists
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Periods</Label>
                  <p>{selectedProfile.periods_regular || 'N/A'}</p>
                </div>
                <div>
                  <Label>Cycle Length</Label>
                  <p>{selectedProfile.period_cycle_length ? `${selectedProfile.period_cycle_length} days` : 'N/A'}</p>
                </div>
                <div>
                  <Label>Bleeding Days</Label>
                  <p>{selectedProfile.period_bleeding_days ? `${selectedProfile.period_bleeding_days} days` : 'N/A'}</p>
                </div>
                <div>
                  <Label>Missed Periods</Label>
                  <p>{selectedProfile.missed_periods_frequency || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <Label>Last Period</Label>
                  <p>{selectedProfile.last_menstrual_period ? new Date(selectedProfile.last_menstrual_period).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              {selectedProfile.common_symptoms && (
                <div>
                  <Label>Symptoms</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {parseJsonArray(selectedProfile.common_symptoms).map((s, i) => (
                      <Badge key={i} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedProfile.has_chronic_conditions && (
                <div>
                  <Label>Chronic Conditions</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {parseJsonArray(selectedProfile.chronic_conditions).map((c, i) => (
                      <Badge key={i} variant="destructive">{c}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedProfile.is_pregnant && (
                <div>
                  <Label>Due Date</Label>
                  <p>{selectedProfile.due_date ? new Date(selectedProfile.due_date).toLocaleDateString() : 'N/A'}</p>
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

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Profile</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this health profile?</p>
          {selectedProfile && (
            <p className="font-medium">for {getUserInfo(selectedProfile).name}</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteProfile} disabled={actionLoading}>
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}