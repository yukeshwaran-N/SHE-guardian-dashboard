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
import { Progress } from "@/components/ui/progress";
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
  Shield,
  Heart,
  Target,
  TrendingUp,
  Gift,
  Medal,
  Crown,
  Camera,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const profileData = {
    name: "Rajesh Kumar",
    email: "rajesh.kumar@sakhi.gov.in",
    phone: "+91 98765 43210",
    address: "Sector 62, Noida",
    joinedDate: "15 Jan 2023",
    employeeId: "DEL001",
    vehicle: "Honda Activa - DL5S AB1234",
    emergencyContact: "+91 98765 43211"
  };

  const stats = {
    totalDeliveries: 1248,
    completedToday: 8,
    rating: 4.8,
    experience: "2 years 3 months",
    onTimeRate: 98,
    distanceCovered: 5842,
    earnings: 45600,
    badges: 12
  };

  const achievements = [
    { name: "1000 Deliveries", icon: Award, earned: true, date: "Jan 2024" },
    { name: "Perfect Month", icon: Crown, earned: true, date: "Dec 2023" },
    { name: "Star Performer", icon: Star, earned: true, date: "Nov 2023" },
    { name: "Safety First", icon: Shield, earned: false },
    { name: "Century Club", icon: Target, earned: true, date: "Oct 2023" },
    { name: "Helping Hands", icon: Heart, earned: false },
  ];

  const recentActivity = [
    { date: "2024-02-20", action: "Completed 8 deliveries", earnings: 450, rating: 5 },
    { date: "2024-02-19", action: "Completed 6 deliveries", earnings: 380, rating: 4.8 },
    { date: "2024-02-18", action: "Completed 7 deliveries", earnings: 420, rating: 4.9 },
    { date: "2024-02-17", action: "Completed 5 deliveries", earnings: 300, rating: 4.7 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cover Photo with Gradient */}
      <div className="relative h-48 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="absolute -bottom-12 left-8">
          <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.id}`} />
            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-3xl">
              {user?.id?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Camera className="h-4 w-4 mr-2" />
          Change Photo
        </Button>
      </div>

      {/* Profile Header */}
      <div className="pt-16 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{profileData.name}</h1>
            <Badge variant="success" className="bg-green-100">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </Badge>
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              <Crown className="h-3 w-3 mr-1" />
              Gold Status
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">Delivery Partner • Employee ID: {profileData.employeeId}</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{profileData.address}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Joined {profileData.joinedDate}</span>
            </div>
          </div>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"}>
          <Edit2 className="h-4 w-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Truck className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Deliveries</p>
                <p className="text-2xl font-bold">{stats.totalDeliveries}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Star className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-2xl font-bold">{stats.rating}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">On-Time Rate</p>
                <p className="text-2xl font-bold">{stats.onTimeRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Medal className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Badges</p>
                <p className="text-2xl font-bold">{stats.badges}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>On-Time Delivery</span>
                      <span className="font-medium">{stats.onTimeRate}%</span>
                    </div>
                    <Progress value={stats.onTimeRate} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Customer Satisfaction</span>
                      <span className="font-medium">96%</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Weekly Goal</span>
                      <span className="font-medium">{stats.completedToday}/40</span>
                    </div>
                    <Progress value={(stats.completedToday/40)*100} className="h-2" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm">Distance Covered</span>
                    <span className="font-bold">{stats.distanceCovered} km</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm">Monthly Earnings</span>
                    <span className="font-bold">₹{stats.earnings}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm">Experience</span>
                    <span className="font-bold">{stats.experience}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{profileData.name}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{profileData.email}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="font-medium">{profileData.phone}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Vehicle</Label>
                  <p className="font-medium">{profileData.vehicle}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Emergency Contact</Label>
                  <p className="font-medium">{profileData.emergencyContact}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <Card>
            <CardHeader>
              <CardTitle>Badges & Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {achievements.map((achievement, idx) => {
                  const Icon = achievement.icon;
                  return (
                    <Card key={idx} className={`relative ${!achievement.earned && 'opacity-50'}`}>
                      <CardContent className="p-4 text-center">
                        <div className={`h-16 w-16 rounded-full mx-auto mb-3 flex items-center justify-center ${
                          achievement.earned ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : 'bg-gray-200'
                        }`}>
                          <Icon className={`h-8 w-8 ${achievement.earned ? 'text-white' : 'text-gray-400'}`} />
                        </div>
                        <h3 className="font-semibold">{achievement.name}</h3>
                        {achievement.earned && (
                          <>
                            <Badge variant="outline" className="mt-2 bg-green-100">
                              Earned
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">{achievement.date}</p>
                          </>
                        )}
                        {!achievement.earned && (
                          <Badge variant="outline" className="mt-2">
                            Locked
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
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
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+₹{activity.earnings}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm">{activity.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={profileData.name} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={profileData.email} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" defaultValue={profileData.phone} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" defaultValue={profileData.address} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle">Vehicle</Label>
                  <Input id="vehicle" defaultValue={profileData.vehicle} disabled={!isEditing} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency">Emergency Contact</Label>
                  <Input id="emergency" defaultValue={profileData.emergencyContact} disabled={!isEditing} />
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
      </Tabs>
    </div>
  );
}