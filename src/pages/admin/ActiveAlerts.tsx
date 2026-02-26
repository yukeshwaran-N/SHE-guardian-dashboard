// src/pages/admin/ActiveAlerts.tsx
import { useState, useEffect } from "react";
import { alertsService, Alert } from "@/services/alertsService";
import { womenService } from "@/services/womenService";
import { usersService } from "@/services/usersService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2,
  AlertTriangle,
  MapPin,
  Phone,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Filter
} from "lucide-react";

interface Woman {
  id: string;
  full_name: string;
}

interface ASHAWorker {
  id: string;
  full_name: string;
}

export default function ActiveAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [women, setWomen] = useState<Woman[]>([]);
  const [ashaWorkers, setAshaWorkers] = useState<ASHAWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [alertToDelete, setAlertToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    woman_id: "",
    type: "",
    severity: "medium",
    description: "",
    location: "",
    assigned_to: ""
  });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ active: 0, resolved: 0, highPriority: 0 });
  const { toast } = useToast();

  useEffect(() => {
    fetchAlerts();
    fetchWomen();
    fetchASHAWorkers();
    fetchStats();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, searchTerm, statusFilter, severityFilter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await alertsService.getAllAlerts();
      setAlerts(data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      toast({
        title: "Error",
        description: "Failed to load alerts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWomen = async () => {
    try {
      const data = await womenService.getAllWomen();
      setWomen(data.map(w => ({ id: w.id, full_name: w.full_name || "" })));
    } catch (error) {
      console.error("Error fetching women:", error);
    }
  };

  const fetchASHAWorkers = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('role', 'asha')
        .eq('is_active', true);
      
      setAshaWorkers(data || []);
    } catch (error) {
      console.error("Error fetching ASHA workers:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await alertsService.getAlertStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const filterAlerts = () => {
    let filtered = [...alerts];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.woman_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(alert => alert.status === statusFilter);
    }

    // Apply severity filter
    if (severityFilter !== "all") {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }

    setFilteredAlerts(filtered);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (selectedAlert) {
        // Update existing alert
        await alertsService.updateAlert(selectedAlert.id, formData);
        toast({
          title: "Success",
          description: "Alert updated successfully",
        });
      } else {
        // Create new alert
        await alertsService.createAlert(formData);
        toast({
          title: "Success",
          description: "Alert created successfully",
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      await fetchAlerts();
      await fetchStats();
    } catch (error) {
      console.error("Error saving alert:", error);
      toast({
        title: "Error",
        description: "Failed to save alert",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await alertsService.resolveAlert(id, user?.id || "");
      await fetchAlerts();
      await fetchStats();
      toast({
        title: "Success",
        description: "Alert resolved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve alert",
        variant: "destructive",
      });
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await alertsService.dismissAlert(id);
      await fetchAlerts();
      await fetchStats();
      toast({
        title: "Success",
        description: "Alert dismissed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to dismiss alert",
        variant: "destructive",
      });
    }
  };

  const handleAssign = async (id: string, assignedTo: string) => {
    try {
      await alertsService.assignAlert(id, assignedTo);
      await fetchAlerts();
      toast({
        title: "Success",
        description: "Alert assigned successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign alert",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (alert: Alert) => {
    setSelectedAlert(alert);
    setFormData({
      woman_id: alert.woman_id,
      type: alert.type,
      severity: alert.severity,
      description: alert.description || "",
      location: alert.location || "",
      assigned_to: alert.assigned_to || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!alertToDelete) return;

    try {
      await alertsService.deleteAlert(alertToDelete);
      await fetchAlerts();
      await fetchStats();
      toast({
        title: "Success",
        description: "Alert deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete alert",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setAlertToDelete(null);
    }
  };

  const resetForm = () => {
    setSelectedAlert(null);
    setFormData({
      woman_id: "",
      type: "",
      severity: "medium",
      description: "",
      location: "",
      assigned_to: ""
    });
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch(severity) {
      case 'high': return 'destructive';
      case 'medium': return 'warning';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case 'active': return 'destructive';
      case 'resolved': return 'default';
      case 'dismissed': return 'secondary';
      default: return 'default';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Alerts Management</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage emergency alerts
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedAlert ? "Edit Alert" : "Create New Alert"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="woman_id">Woman *</Label>
                <Select
                  value={formData.woman_id}
                  onValueChange={(value) => handleSelectChange('woman_id', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select woman" />
                  </SelectTrigger>
                  <SelectContent>
                    {women.map((woman) => (
                      <SelectItem key={woman.id} value={woman.id}>
                        {woman.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Alert Type *</Label>
                <Input
                  id="type"
                  name="type"
                  placeholder="e.g., Health Emergency, Accident, etc."
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="severity">Severity *</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => handleSelectChange('severity', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Address or location description"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assigned_to">Assign To (Optional)</Label>
                <Select
                  value={formData.assigned_to}
                  onValueChange={(value) => handleSelectChange('assigned_to', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ASHA worker" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {ashaWorkers.map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Detailed description of the alert..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    selectedAlert ? "Update Alert" : "Create Alert"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Alerts</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-full">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">High Priority</p>
              <p className="text-2xl font-bold">{stats.highPriority}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resolved Today</p>
              <p className="text-2xl font-bold">{stats.resolved}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={filterAlerts}>
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alert Details</TableHead>
                <TableHead>Woman</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No alerts found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{alert.type}</div>
                        <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {alert.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {getInitials(alert.woman_name || "")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">{alert.woman_name}</div>
                          {alert.woman_phone && (
                            <div className="text-xs text-muted-foreground">{alert.woman_phone}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-xs">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate max-w-[120px]">{alert.location || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {alert.assigned_to_name || (
                        <span className="text-muted-foreground text-sm">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSeverityBadgeVariant(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(alert.status)}>
                        {alert.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        {getTimeAgo(alert.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {alert.status === 'active' && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleResolve(alert.id)}
                            title="Resolve"
                          >
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDismiss(alert.id)}
                            title="Dismiss"
                          >
                            <XCircle className="h-4 w-4 text-gray-600" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(alert)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setAlertToDelete(alert.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the alert.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}