// src/pages/admin/ASHAWorkers.tsx
import { useState, useEffect } from "react";
import { ashaService, ASHAWorker } from "@/services/ashaService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  Users,
  Briefcase,
  Star
} from "lucide-react";

export default function ASHAWorkers() {
  const [workers, setWorkers] = useState<ASHAWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorker, setSelectedWorker] = useState<ASHAWorker | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    full_name: "",
    email: "",
    phone: "",
    password: "asha123",
    sector: "",
    village: "",
    district: "",
    state: "",
    pincode: "",
    qualification: "",
    experience_years: "",
    joining_date: new Date().toISOString().split('T')[0],
    status: "active",
    emergency_contact: ""
  });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ total: 0, active: 0, onLeave: 0 });
  const { toast } = useToast();

  useEffect(() => {
    fetchWorkers();
    fetchStats();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const data = await ashaService.getAllASHAWorkers();
      setWorkers(data);
    } catch (error) {
      console.error("Error fetching ASHA workers:", error);
      toast({
        title: "Error",
        description: "Failed to load ASHA workers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await ashaService.getASHAWorkerStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (selectedWorker) {
        // Update existing worker
        await ashaService.updateASHAWorker(selectedWorker.id, {
          ...formData,
          user_id: selectedWorker.user_id
        });
        toast({
          title: "Success",
          description: "ASHA worker updated successfully",
        });
      } else {
        // Create new worker
        await ashaService.createASHAWorker(formData);
        toast({
          title: "Success",
          description: "ASHA worker added successfully",
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      await fetchWorkers();
      await fetchStats();
    } catch (error) {
      console.error("Error saving ASHA worker:", error);
      toast({
        title: "Error",
        description: "Failed to save ASHA worker",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (worker: ASHAWorker) => {
    setSelectedWorker(worker);
    setFormData({
      full_name: worker.full_name || "",
      email: worker.email || "",
      phone: worker.phone || "",
      sector: worker.sector || "",
      village: worker.village || "",
      district: worker.district || "",
      state: worker.state || "",
      pincode: worker.pincode || "",
      qualification: worker.qualification || "",
      experience_years: worker.experience_years || "",
      joining_date: worker.joining_date || new Date().toISOString().split('T')[0],
      status: worker.status || "active",
      emergency_contact: worker.emergency_contact || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!workerToDelete) return;

    try {
      await ashaService.deleteASHAWorker(workerToDelete);
      await fetchWorkers();
      await fetchStats();
      toast({
        title: "Success",
        description: "ASHA worker deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete ASHA worker",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setWorkerToDelete(null);
    }
  };

  const resetForm = () => {
    setSelectedWorker(null);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      password: "asha123",
      sector: "",
      village: "",
      district: "",
      state: "",
      pincode: "",
      qualification: "",
      experience_years: "",
      joining_date: new Date().toISOString().split('T')[0],
      status: "active",
      emergency_contact: ""
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'on-leave': return 'warning';
      default: return 'default';
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const filteredWorkers = workers.filter(worker =>
    worker.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.phone?.includes(searchTerm) ||
    worker.sector?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.village?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold">ASHA Workers Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage all ASHA workers and their assignments
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add New ASHA Worker
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedWorker ? "Edit ASHA Worker" : "Add New ASHA Worker"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact">Emergency Contact</Label>
                    <Input
                      id="emergency_contact"
                      name="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {!selectedWorker && (
                  <div className="mt-4">
                    <Label htmlFor="password">Default Password</Label>
                    <Input
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Default password for new ASHA worker
                    </p>
                  </div>
                )}
              </div>

              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-2">Work Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sector">Sector *</Label>
                    <Input
                      id="sector"
                      name="sector"
                      value={formData.sector}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qualification">Qualification</Label>
                    <Input
                      id="qualification"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience_years">Experience (Years)</Label>
                    <Input
                      id="experience_years"
                      name="experience_years"
                      type="number"
                      value={formData.experience_years}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joining_date">Joining Date</Label>
                    <Input
                      id="joining_date"
                      name="joining_date"
                      type="date"
                      value={formData.joining_date}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on-leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-2">Address Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="village">Village</Label>
                    <Input
                      id="village"
                      name="village"
                      value={formData.village}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
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
                    selectedWorker ? "Update Worker" : "Add Worker"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ASHA workers by name, email, phone, sector..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={fetchWorkers}>
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total ASHA Workers</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Briefcase className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">On Leave</p>
              <p className="text-2xl font-bold">{stats.onLeave}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ASHA Workers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ASHA Worker</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Assigned Women</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No ASHA workers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredWorkers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{getInitials(worker.full_name || "")}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{worker.full_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {worker.qualification || "No qualification"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {worker.email && (
                          <div className="flex items-center text-xs">
                            <Mail className="h-3 w-3 mr-1" />
                            <span className="truncate max-w-[150px]">{worker.email}</span>
                          </div>
                        )}
                        {worker.phone && (
                          <div className="flex items-center text-xs">
                            <Phone className="h-3 w-3 mr-1" />
                            {worker.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{worker.sector}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-xs">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate max-w-[120px]">
                          {worker.village || worker.district || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Award className="h-3 w-3 mr-1" />
                        {worker.experience_years || 0} years
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {worker.assigned_women_count || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(worker.status)}>
                        {worker.status?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(worker)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setWorkerToDelete(worker.id);
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
              This action cannot be undone. This will permanently delete the ASHA worker
              and all associated data from the database.
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