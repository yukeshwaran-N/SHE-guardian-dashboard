// src/pages/admin/Doctors.tsx
import { useState, useEffect } from "react";
import { doctorsService, Doctor } from "@/services/doctorsService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Star, 
  Loader2,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Languages,
  GraduationCap,
  MapPin,
  Video,
  PhoneCall,
  MessageCircle
} from "lucide-react";

export default function Doctors() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Doctor>>({
    name: "",
    specialty: "",
    experience: "",
    rating: 0,
    reviews_count: 0,
    available: true,
    image_url: "",
    fee: 0,
    languages: ["English"],
    education: "",
    about: "",
    next_available: "",
    email: "",
    phone: "",
    address: "",
    consultation_types: ["video", "voice"]
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await doctorsService.getAllDoctors();
      setDoctors(data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const handleLanguagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const languages = e.target.value.split(',').map(lang => lang.trim());
    setFormData(prev => ({ ...prev, languages }));
  };

  const handleConsultationTypesChange = (type: 'video' | 'voice' | 'chat') => {
    const current = formData.consultation_types || [];
    const newTypes = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    setFormData(prev => ({ ...prev, consultation_types: newTypes }));
  };

  const handleAvailabilityToggle = async (id: string, currentAvailable: boolean | null) => {
    try {
      await doctorsService.toggleAvailability(id, !currentAvailable);
      await fetchDoctors();
      toast({
        title: "Success",
        description: "Doctor availability updated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update availability",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (selectedDoctor) {
        // Update existing doctor
        await doctorsService.updateDoctor(selectedDoctor.id, formData);
        toast({
          title: "Success",
          description: "Doctor updated successfully",
        });
      } else {
        // Create new doctor
        await doctorsService.createDoctor(formData as any);
        toast({
          title: "Success",
          description: "Doctor added successfully",
        });
      }
      
      setIsDialogOpen(false);
      resetForm();
      await fetchDoctors();
    } catch (error) {
      console.error("Error saving doctor:", error);
      toast({
        title: "Error",
        description: "Failed to save doctor",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setFormData(doctor);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!doctorToDelete) return;

    try {
      await doctorsService.deleteDoctor(doctorToDelete);
      await fetchDoctors();
      toast({
        title: "Success",
        description: "Doctor deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete doctor",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDoctorToDelete(null);
    }
  };

  const resetForm = () => {
    setSelectedDoctor(null);
    setFormData({
      name: "",
      specialty: "",
      experience: "",
      rating: 0,
      reviews_count: 0,
      available: true,
      image_url: "",
      fee: 0,
      languages: ["English"],
      education: "",
      about: "",
      next_available: "",
      email: "",
      phone: "",
      address: "",
      consultation_types: ["video", "voice"]
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getConsultationTypeIcon = (type: string) => {
    switch(type) {
      case 'video': return <Video className="h-3 w-3" />;
      case 'voice': return <PhoneCall className="h-3 w-3" />;
      case 'chat': return <MessageCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.phone?.includes(searchTerm)
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
          <h1 className="text-3xl font-bold">Doctors Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage all doctors and their availability
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedDoctor ? "Edit Doctor" : "Add New Doctor"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty *</Label>
                  <Input
                    id="specialty"
                    name="specialty"
                    value={formData.specialty}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience</Label>
                  <Input
                    id="experience"
                    name="experience"
                    placeholder="e.g., 10 years"
                    value={formData.experience || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input
                    id="education"
                    name="education"
                    placeholder="e.g., MBBS, MD"
                    value={formData.education || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fee">Consultation Fee (₹)</Label>
                  <Input
                    id="fee"
                    name="fee"
                    type="number"
                    value={formData.fee || 0}
                    onChange={handleNumberChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="next_available">Next Available Date</Label>
                  <Input
                    id="next_available"
                    name="next_available"
                    type="date"
                    value={formData.next_available || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input
                    id="rating"
                    name="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating || 0}
                    onChange={handleNumberChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviews_count">Reviews Count</Label>
                  <Input
                    id="reviews_count"
                    name="reviews_count"
                    type="number"
                    value={formData.reviews_count || 0}
                    onChange={handleNumberChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="languages">Languages (comma-separated)</Label>
                <Input
                  id="languages"
                  name="languages"
                  placeholder="English, Hindi, Tamil"
                  value={formData.languages?.join(', ') || ""}
                  onChange={handleLanguagesChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Consultation Types</Label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="video"
                      checked={formData.consultation_types?.includes('video')}
                      onChange={() => handleConsultationTypesChange('video')}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="video">Video</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="voice"
                      checked={formData.consultation_types?.includes('voice')}
                      onChange={() => handleConsultationTypesChange('voice')}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="voice">Voice</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="chat"
                      checked={formData.consultation_types?.includes('chat')}
                      onChange={() => handleConsultationTypesChange('chat')}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="chat">Chat</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Profile Image URL</Label>
                <Input
                  id="image_url"
                  name="image_url"
                  placeholder="https://example.com/doctor.jpg"
                  value={formData.image_url || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="about">About / Bio</Label>
                <Textarea
                  id="about"
                  name="about"
                  rows={4}
                  value={formData.about || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={formData.available || false}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, available: checked }))
                  }
                />
                <Label htmlFor="available">Available for consultations</Label>
              </div>

              <div className="flex justify-end space-x-2">
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
                    selectedDoctor ? "Update Doctor" : "Add Doctor"
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
            placeholder="Search doctors by name, specialty, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={fetchDoctors}>
          Refresh
        </Button>
      </div>

      {/* Doctors Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor</TableHead>
                <TableHead>Specialty</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Fee</TableHead>
                <TableHead>Consultation</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    No doctors found
                  </TableCell>
                </TableRow>
              ) : (
                filteredDoctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={doctor.image_url || ""} />
                          <AvatarFallback>{getInitials(doctor.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{doctor.name}</div>
                          <div className="text-xs text-muted-foreground">{doctor.education}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{doctor.specialty}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {doctor.email && (
                          <div className="flex items-center text-xs">
                            <Mail className="h-3 w-3 mr-1" />
                            {doctor.email}
                          </div>
                        )}
                        {doctor.phone && (
                          <div className="flex items-center text-xs">
                            <Phone className="h-3 w-3 mr-1" />
                            {doctor.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{doctor.experience || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="ml-1">{doctor.rating?.toFixed(1) || "0.0"}</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({doctor.reviews_count || 0})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>₹{doctor.fee || 0}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {doctor.consultation_types?.map((type) => (
                          <Badge key={type} variant="secondary" className="text-xs">
                            {getConsultationTypeIcon(type)}
                            <span className="ml-1 capitalize">{type}</span>
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={doctor.available || false}
                          onCheckedChange={() => 
                            handleAvailabilityToggle(doctor.id, doctor.available)
                          }
                        />
                        <Badge variant={doctor.available ? "default" : "secondary"}>
                          {doctor.available ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(doctor)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setDoctorToDelete(doctor.id);
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
              This action cannot be undone. This will permanently delete the doctor
              from the database.
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