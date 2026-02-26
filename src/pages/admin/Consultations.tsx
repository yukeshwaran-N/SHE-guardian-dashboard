// src/pages/admin/Consultations.tsx
import { useState, useEffect } from "react";
import { consultationsService, Consultation } from "@/services/consultationsService";
import { womenService } from "@/services/womenService";
import { doctorsService } from "@/services/doctorsService";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2,
  Calendar,
  Clock,
  Video,
  Phone,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Stethoscope,
  ExternalLink
} from "lucide-react";

interface Woman {
  id: string;
  full_name: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

export default function Consultations() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [filteredConsultations, setFilteredConsultations] = useState<Consultation[]>([]);
  const [women, setWomen] = useState<Woman[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    woman_id: "",
    doctor_id: "",
    consultation_type: "video",
    scheduled_date: "",
    scheduled_time: "",
    symptoms: "",
    notes: ""
  });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    today: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterConsultations();
  }, [consultations, searchTerm, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [consultationsData, womenData, doctorsData, statsData] = await Promise.all([
        consultationsService.getAllConsultations(),
        womenService.getAllWomen(),
        doctorsService.getAllDoctors(),
        consultationsService.getConsultationStats()
      ]);
      
      setConsultations(consultationsData);
      setWomen(womenData.map(w => ({ id: w.id, full_name: w.full_name || "" })));
      setDoctors(doctorsData.map(d => ({ id: d.id, name: d.name, specialty: d.specialty })));
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to load consultations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterConsultations = () => {
    let filtered = [...consultations];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.woman_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.doctor_specialty?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    setFilteredConsultations(filtered);
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
      if (selectedConsultation) {
        // Update existing consultation
        await consultationsService.updateConsultation(selectedConsultation.id, formData);
        toast({
          title: "Success",
          description: "Consultation updated successfully",
        });
      } else {
        // Create new consultation
        await consultationsService.createConsultation(formData);
        toast({
          title: "Success",
          description: "Consultation scheduled successfully",
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      await fetchData();
    } catch (error) {
      console.error("Error saving consultation:", error);
      toast({
        title: "Error",
        description: "Failed to save consultation",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await consultationsService.updateStatus(id, status);
      await fetchData();
      toast({
        title: "Success",
        description: `Consultation ${status}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setFormData({
      woman_id: consultation.woman_id,
      doctor_id: consultation.doctor_id,
      consultation_type: consultation.consultation_type,
      scheduled_date: consultation.scheduled_date,
      scheduled_time: consultation.scheduled_time,
      symptoms: consultation.symptoms || "",
      notes: consultation.notes || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!consultationToDelete) return;

    try {
      await consultationsService.deleteConsultation(consultationToDelete);
      await fetchData();
      toast({
        title: "Success",
        description: "Consultation deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete consultation",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setConsultationToDelete(null);
    }
  };

  const resetForm = () => {
    setSelectedConsultation(null);
    setFormData({
      woman_id: "",
      doctor_id: "",
      consultation_type: "video",
      scheduled_date: "",
      scheduled_time: "",
      symptoms: "",
      notes: ""
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch(status) {
      case 'pending': return 'secondary';
      case 'confirmed': return 'default';
      case 'completed': return 'success';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'voice': return <Phone className="h-4 w-4" />;
      case 'chat': return <MessageCircle className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const d = new Date(`${date}T${time}`);
    return d.toLocaleString('en-IN', {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Consultations Management</h1>
          <p className="text-muted-foreground mt-2">
            Schedule and manage doctor consultations
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Consultation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedConsultation ? "Edit Consultation" : "Schedule New Consultation"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="doctor_id">Doctor *</Label>
                  <Select
                    value={formData.doctor_id}
                    onValueChange={(value) => handleSelectChange('doctor_id', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} ({doctor.specialty})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="consultation_type">Consultation Type *</Label>
                  <Select
                    value={formData.consultation_type}
                    onValueChange={(value) => handleSelectChange('consultation_type', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Call</SelectItem>
                      <SelectItem value="voice">Voice Call</SelectItem>
                      <SelectItem value="chat">Chat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduled_date">Date *</Label>
                  <Input
                    id="scheduled_date"
                    name="scheduled_date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={handleInputChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduled_time">Time *</Label>
                  <Input
                    id="scheduled_time"
                    name="scheduled_time"
                    type="time"
                    value={formData.scheduled_time}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms</Label>
                <Textarea
                  id="symptoms"
                  name="symptoms"
                  rows={3}
                  value={formData.symptoms}
                  onChange={handleInputChange}
                  placeholder="Describe symptoms or reason for consultation..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional information..."
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
                    selectedConsultation ? "Update" : "Schedule"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Today</p>
            <p className="text-2xl font-bold">{stats.today}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Confirmed</p>
            <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
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
                  placeholder="Search by woman or doctor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultations Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Woman</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Symptoms</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConsultations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No consultations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredConsultations.map((consultation) => (
                  <TableRow key={consultation.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{consultation.woman_name}</div>
                          {consultation.woman_phone && (
                            <div className="text-xs text-muted-foreground">{consultation.woman_phone}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div>{consultation.doctor_name}</div>
                          <div className="text-xs text-muted-foreground">{consultation.doctor_specialty}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {getTypeIcon(consultation.consultation_type)}
                        <span className="ml-1 capitalize">{consultation.consultation_type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDateTime(consultation.scheduled_date, consultation.scheduled_time)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(consultation.status)}>
                        {consultation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm truncate max-w-[150px] block">
                        {consultation.symptoms || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {consultation.status === 'confirmed' && consultation.consultation_type === 'video' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const url = consultationsService.generateMeetingUrl(
                              consultation.id,
                              consultation.doctor_name || 'Doctor',
                              consultation.woman_name || 'Patient'
                            );
                            window.open(url, '_blank');
                          }}
                          title="Start Video Call"
                        >
                          <Video className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      {consultation.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStatusUpdate(consultation.id, 'confirmed')}
                          title="Confirm"
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      {consultation.status === 'confirmed' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStatusUpdate(consultation.id, 'completed')}
                          title="Complete"
                        >
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}
                      {(consultation.status === 'pending' || consultation.status === 'confirmed') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStatusUpdate(consultation.id, 'cancelled')}
                          title="Cancel"
                        >
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(consultation)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setConsultationToDelete(consultation.id);
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
              This action cannot be undone. This will permanently delete the consultation.
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