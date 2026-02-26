// src/pages/admin/WomenRegistry.tsx
import { useState, useEffect } from "react";
import { womenService, Woman } from "@/services/womenService";
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
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2,
  MapPin,
  Phone,
  Calendar,
  AlertTriangle,
  User,
  Heart,
  Activity
} from "lucide-react";

interface AshaWorker {
  id: string;
  full_name: string;
}

export default function WomenRegistry() {
  const { user } = useAuth();
  const [women, setWomen] = useState<Woman[]>([]);
  const [ashaWorkers, setAshaWorkers] = useState<AshaWorker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWoman, setSelectedWoman] = useState<Woman | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [womanToDelete, setWomanToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    full_name: "",
    email: "",
    phone: "",
    password: "welcome123",
    date_of_birth: "",
    age: "",
    address: "",
    village: "",
    district: "",
    state: "",
    pincode: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    asha_worker_id: "",
    risk_level: "low",
    last_visit_date: "",
    next_visit_date: "",
    notes: ""
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWomen();
    fetchAshaWorkers();
  }, []);

  const fetchWomen = async () => {
    try {
      setLoading(true);
      const data = await womenService.getAllWomen();
      setWomen(data);
    } catch (error) {
      console.error("Error fetching women:", error);
      toast({
        title: "Error",
        description: "Failed to load women registry",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAshaWorkers = async () => {
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
      if (selectedWoman) {
        // Update existing woman
        await womenService.updateWoman(selectedWoman.id, formData);
        toast({
          title: "Success",
          description: "Woman updated successfully",
        });
      } else {
        // Create new woman
        await womenService.createWoman(formData);
        toast({
          title: "Success",
          description: "Woman added successfully",
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      await fetchWomen();
    } catch (error) {
      console.error("Error saving woman:", error);
      toast({
        title: "Error",
        description: "Failed to save woman",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (woman: Woman) => {
    setSelectedWoman(woman);
    setFormData({
      ...woman,
      full_name: woman.full_name || "",
      email: woman.email || "",
      phone: woman.phone || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!womanToDelete) return;

    try {
      await womenService.deleteWoman(womanToDelete);
      await fetchWomen();
      toast({
        title: "Success",
        description: "Woman deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete woman",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setWomanToDelete(null);
    }
  };

  const resetForm = () => {
    setSelectedWoman(null);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      password: "welcome123",
      date_of_birth: "",
      age: "",
      address: "",
      village: "",
      district: "",
      state: "",
      pincode: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
      asha_worker_id: "",
      risk_level: "low",
      last_visit_date: "",
      next_visit_date: "",
      notes: ""
    });
  };

  const getRiskBadgeVariant = (risk: string | null) => {
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

  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const filteredWomen = women.filter(woman =>
    woman.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    woman.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    woman.phone?.includes(searchTerm) ||
    woman.village?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold">Women Registry</h1>
          <p className="text-muted-foreground mt-2">
            Manage all registered women and their health profiles
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Register New Woman
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedWoman ? "Edit Woman" : "Register New Woman"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
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
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {!selectedWoman && (
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
                      Default password for new user (will be prompted to change on first login)
                    </p>
                  </div>
                )}
              </div>

              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-2">Address Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
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

              <div className="border-b pb-4">
                <h3 className="text-lg font-semibold mb-2">Emergency Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_name">Contact Name</Label>
                    <Input
                      id="emergency_contact_name"
                      name="emergency_contact_name"
                      value={formData.emergency_contact_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                    <Input
                      id="emergency_contact_phone"
                      name="emergency_contact_phone"
                      value={formData.emergency_contact_phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Health & Care Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="asha_worker_id">Assigned ASHA Worker</Label>
                    <Select
                      value={formData.asha_worker_id}
                      onValueChange={(value) => handleSelectChange('asha_worker_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ASHA worker" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {ashaWorkers.map((worker) => (
                          <SelectItem key={worker.id} value={worker.id}>
                            {worker.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="risk_level">Risk Level</Label>
                    <Select
                      value={formData.risk_level}
                      onValueChange={(value) => handleSelectChange('risk_level', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select risk level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="last_visit_date">Last Visit Date</Label>
                    <Input
                      id="last_visit_date"
                      name="last_visit_date"
                      type="date"
                      value={formData.last_visit_date}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="next_visit_date">Next Visit Date</Label>
                    <Input
                      id="next_visit_date"
                      name="next_visit_date"
                      type="date"
                      value={formData.next_visit_date}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Any additional notes about this woman..."
                  />
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
                    selectedWoman ? "Update Woman" : "Register Woman"
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
            placeholder="Search women by name, email, phone, or village..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={fetchWomen}>
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Women</p>
              <p className="text-2xl font-bold">{women.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">High Risk</p>
              <p className="text-2xl font-bold">
                {women.filter(w => w.risk_level === 'high').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Heart className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">With ASHA Worker</p>
              <p className="text-2xl font-bold">
                {women.filter(w => w.asha_worker_id).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Women Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Woman</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>ASHA Worker</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Next Visit</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWomen.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No women found
                  </TableCell>
                </TableRow>
              ) : (
                filteredWomen.map((woman) => (
                  <TableRow key={woman.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>{getInitials(woman.full_name || "")}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{woman.full_name}</div>
                          <div className="text-xs text-muted-foreground">
                            Age: {calculateAge(woman.date_of_birth) || woman.age || "N/A"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {woman.email && (
                          <div className="flex items-center text-xs">
                            <span className="truncate max-w-[150px]">{woman.email}</span>
                          </div>
                        )}
                        {woman.phone && (
                          <div className="flex items-center text-xs">
                            <Phone className="h-3 w-3 mr-1" />
                            {woman.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-xs">
                        <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                        <span className="truncate max-w-[150px]">
                          {woman.village || woman.district || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {woman.asha_worker_name || (
                        <span className="text-muted-foreground text-sm">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRiskBadgeVariant(woman.risk_level)}>
                        {woman.risk_level?.toUpperCase() || "UNKNOWN"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {woman.last_visit_date || "Never"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {woman.next_visit_date || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(woman)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setWomanToDelete(woman.id);
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
              This action cannot be undone. This will permanently delete the woman
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