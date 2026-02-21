// src/pages/admin/ActiveAlerts.tsx
import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  AlertTriangle,
  Search,
  Filter,
  Bell,
  BellRing,
  BellOff,
  Clock,
  MapPin,
  User,
  Tag,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Eye,
  Trash2,
  AlertCircle,
  AlertOctagon,
  Info,
  Flame,
  Droplet,
  Heart,
  Activity,
  Shield,
  Star,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Sparkles,
  Zap
} from "lucide-react";

interface Alert {
  id: number;
  woman_name: string | null;
  type: string | null;
  severity: string | null;
  timestamp: string | null;
  location: string | null;
  status: string | null;
}

export default function ActiveAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    high: 0,
    medium: 0,
    low: 0,
    resolved: 0
  });

  const { toast } = useToast();

  // Fetch alerts on mount
  useEffect(() => {
    fetchAlerts();

    // Real-time subscription
    const subscription = supabase
      .channel('alerts-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'alerts' 
      }, () => {
        fetchAlerts(true);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Filter alerts when search/filters change
  useEffect(() => {
    filterAlerts();
  }, [searchTerm, severityFilter, typeFilter, alerts]);

  // Calculate stats whenever alerts change
  useEffect(() => {
    calculateStats();
  }, [alerts]);

  const filterAlerts = () => {
    let filtered = [...alerts];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(alert =>
        alert.woman_name?.toLowerCase().includes(term) ||
        alert.type?.toLowerCase().includes(term) ||
        alert.location?.toLowerCase().includes(term) ||
        alert.id.toString().includes(term)
      );
    }

    // Apply severity filter
    if (severityFilter !== "all") {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(alert => alert.type === typeFilter);
    }

    setFilteredAlerts(filtered);
  };

  const calculateStats = () => {
    setStats({
      total: alerts.length,
      high: alerts.filter(a => a.severity === 'high' && a.status === 'active').length,
      medium: alerts.filter(a => a.severity === 'medium' && a.status === 'active').length,
      low: alerts.filter(a => a.severity === 'low' && a.status === 'active').length,
      resolved: alerts.filter(a => a.status === 'resolved').length
    });
  };

  const fetchAlerts = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      
      setAlerts(data || []);
      setFilteredAlerts(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async () => {
    if (!selectedAlert) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('alerts')
        .update({ status: 'resolved' })
        .eq('id', selectedAlert.id);

      if (error) throw error;

      await fetchAlerts(true);
      setIsResolveDialogOpen(false);
      
      toast({
        title: "Alert Resolved",
        description: "The alert has been marked as resolved",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resolve alert",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAlert = async () => {
    if (!selectedAlert) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', selectedAlert.id);

      if (error) throw error;

      await fetchAlerts(true);
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Alert Deleted",
        description: "The alert has been permanently deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete alert",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Woman Name', 'Type', 'Severity', 'Location', 'Status', 'Timestamp'];
    const rows = filteredAlerts.map(a => [
      a.id,
      a.woman_name || '',
      a.type || '',
      a.severity || '',
      a.location || '',
      a.status || '',
      a.timestamp ? new Date(a.timestamp).toLocaleString() : ''
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alerts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: `${filteredAlerts.length} alerts exported`,
    });
  };

  const getSeverityIcon = (severity: string | null) => {
    switch(severity) {
      case 'high': return <Flame className="h-5 w-5 text-red-500" />;
      case 'medium': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'low': return <Info className="h-5 w-5 text-green-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string | null) => {
    switch(severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string | null) => {
    switch(status) {
      case 'active': return 'bg-red-100 text-red-800 border-red-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="relative overflow-hidden group">
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity`} />
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            </div>
            <div className={`h-10 w-10 rounded-full bg-${color.split(' ')[0]}-100 flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <Icon className={`h-5 w-5 text-${color.split(' ')[0]}-600`} />
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
          <p className="text-muted-foreground animate-pulse">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Active Alerts
            </h1>
            {stats.high > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, delay: 0.5 }}
              >
                <Badge variant="destructive" className="animate-pulse">
                  <Flame className="h-3 w-3 mr-1" />
                  {stats.high} High Priority
                </Badge>
              </motion.div>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            {filteredAlerts.length} alerts • {stats.resolved} resolved
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchAlerts()}>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Alerts"
          value={stats.total}
          icon={Bell}
          color="from-blue-600 to-cyan-600"
          subtitle="All time"
        />
        <StatCard
          title="High Priority"
          value={stats.high}
          icon={Flame}
          color="from-red-600 to-orange-600"
          subtitle="Urgent attention"
        />
        <StatCard
          title="Medium Priority"
          value={stats.medium}
          icon={AlertCircle}
          color="from-yellow-600 to-amber-600"
          subtitle="Needs review"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle}
          color="from-green-600 to-emerald-600"
          subtitle="Completed"
        />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by woman name, type, location..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                Severity
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <Tag className="h-4 w-4 mr-2" />
                Type
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Health Emergency">Health Emergency</SelectItem>
                <SelectItem value="Missed Checkup">Missed Checkup</SelectItem>
                <SelectItem value="Delivery Assistance">Delivery Assistance</SelectItem>
                <SelectItem value="Medication">Medication</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {filteredAlerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full"
            >
              <Card>
                <CardContent className="p-12 text-center">
                  <BellOff className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No alerts found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || severityFilter !== 'all' || typeFilter !== 'all'
                      ? "Try adjusting your filters"
                      : "All clear! No active alerts at the moment."}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className={`relative overflow-hidden group ${
                  alert.status === 'active' && alert.severity === 'high' 
                    ? 'border-2 border-red-200 shadow-lg shadow-red-100' 
                    : ''
                }`}>
                  {/* Animated gradient for high priority */}
                  {alert.status === 'active' && alert.severity === 'high' && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                  
                  <CardContent className="p-5 relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getSeverityIcon(alert.severity)}
                        <div>
                          <p className="font-semibold">Alert #{alert.id}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(alert.timestamp)}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(alert.status)}>
                        {alert.status}
                      </Badge>
                    </div>

                    {/* Woman Name */}
                    <h3 className="text-lg font-semibold mb-2">
                      {alert.woman_name || 'Unknown'}
                    </h3>

                    {/* Type and Location */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Tag className="h-4 w-4 text-muted-foreground" />
                        <span>{alert.type || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{alert.location || 'No location'}</span>
                      </div>
                    </div>

                    {/* Severity Badge */}
                    <div className="mb-4">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity?.toUpperCase() || 'UNKNOWN'} PRIORITY
                      </Badge>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setSelectedAlert(alert);
                          setIsViewDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      {alert.status === 'active' && (
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                          onClick={() => {
                            setSelectedAlert(alert);
                            setIsResolveDialogOpen(true);
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Resolve
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 w-9 p-0 text-red-600"
                        onClick={() => {
                          setSelectedAlert(alert);
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
        </AnimatePresence>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alert Details</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {getSeverityIcon(selectedAlert.severity)}
                <div>
                  <h3 className="text-xl font-semibold">Alert #{selectedAlert.id}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedAlert.timestamp ? new Date(selectedAlert.timestamp).toLocaleString() : 'No timestamp'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Woman Name</Label>
                  <p className="font-medium">{selectedAlert.woman_name || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="font-medium">{selectedAlert.type || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Severity</Label>
                  <Badge className={getSeverityColor(selectedAlert.severity)}>
                    {selectedAlert.severity?.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <Badge className={getStatusColor(selectedAlert.status)}>
                    {selectedAlert.status?.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Location</Label>
                <p className="font-medium">{selectedAlert.location || 'N/A'}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {selectedAlert?.status === 'active' && (
              <Button
                className="bg-gradient-to-r from-green-600 to-emerald-600"
                onClick={() => {
                  setIsViewDialogOpen(false);
                  setIsResolveDialogOpen(true);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolve Alert
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Alert</DialogTitle>
            <DialogDescription>
              Mark this alert as resolved. This action can be reversed later.
            </DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="py-4">
              <p>
                Resolve alert for <span className="font-medium">{selectedAlert.woman_name}</span>?
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Type: {selectedAlert.type} • Severity: {selectedAlert.severity}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-green-600 to-emerald-600"
              onClick={handleResolveAlert}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Alert</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the alert.
            </DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="py-4">
              <p>
                Delete alert for <span className="font-medium">{selectedAlert.woman_name}</span>?
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAlert}
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}