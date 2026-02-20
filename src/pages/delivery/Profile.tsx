// src/pages/delivery/Profile.tsx
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Star,
  Truck,
  Clock,
  Edit2,
  Save,
  Shield
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const stats = {
    totalDeliveries: 156,
    completedToday: 8,
    rating: 4.8,
    experience: "2 years",
    onTimeRate: "98%"
  };

  const recentActivity = [
    { date: "2024-02-20", action: "Completed delivery to Priya Sharma", status: "success" },
    { date: "2024-02-20", action: "Assigned new delivery - Sector 12", status: "info" },
    { date: "2024-02-19", action: "Completed 5 deliveries", status: "success" },
    { date: "2024-02-19", action: "Received 5-star rating", status: "success" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cover Photo with Gradient */}
      <div className="h-48 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute -bottom-12 left-8">
          <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.id}`} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {user?.id?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Profile Header */}
      <div className="pt-12 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {user?.id}
            <Badge variant="success" className="ml-2">Active</Badge>
          </h1>
          <p className="text-muted-foreground">Delivery Partner • Gold Status</p>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"}>
          <Edit2 className="h-4 w-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="hover-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{stats.totalDeliveries}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Today</p>
                <p className="text-lg font-bold">{stats.completedToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-xs text-muted-foreground">Rating</p>
                <p className="text-lg font-bold">{stats.rating}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs text-muted-foreground">On Time</p>
                <p className="text-lg font-bold">{stats.onTimeRate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-xs text-muted-foreground">Experience</p>
                <p className="text-lg font-bold">{stats.experience}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="work">Work History</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Input id="name" defaultValue="Delivery Partner" disabled={!isEditing} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input id="email" defaultValue="partner@sakhi.gov.in" disabled={!isEditing} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input id="phone" defaultValue="+91 98765 43210" disabled={!isEditing} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Input id="address" defaultValue="Sector 12, Noida" disabled={!isEditing} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="joined">Joined Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Input id="joined" defaultValue="2023-01-15" disabled />
                  </div>
                </div>
              </div>
              {isEditing && (
                <Button className="mt-4">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work">
          <Card>
            <CardHeader>
              <CardTitle>Work History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">February 2024</p>
                    <p className="text-sm text-muted-foreground">45 deliveries completed</p>
                  </div>
                  <Badge variant="success">98% on time</Badge>
                </div>
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">January 2024</p>
                    <p className="text-sm text-muted-foreground">52 deliveries completed</p>
                  </div>
                  <Badge variant="success">96% on time</Badge>
                </div>
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">December 2023</p>
                    <p className="text-sm text-muted-foreground">48 deliveries completed</p>
                  </div>
                  <Badge variant="success">97% on time</Badge>
                </div>
                <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">November 2023</p>
                    <p className="text-sm text-muted-foreground">38 deliveries completed</p>
                  </div>
                  <Badge variant="secondary">94% on time</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50">
                    <div className={`h-2 w-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}