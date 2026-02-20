// src/pages/Notifications.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Info,
  Truck,
  User,
  Calendar,
  Clock,
  Filter,
  CheckCheck,
  Trash2
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Notification {
  id: string;
  type: 'alert' | 'delivery' | 'info' | 'success';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionable?: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "alert",
    title: "High Priority Alert",
    message: "New high-risk case detected in Sector 12. Immediate attention required.",
    time: "5 minutes ago",
    read: false,
    actionable: true
  },
  {
    id: "2",
    type: "delivery",
    title: "Delivery Completed",
    message: "Delivery #DEL001 to Priya Sharma has been completed successfully.",
    time: "15 minutes ago",
    read: false
  },
  {
    id: "3",
    type: "info",
    title: "New ASHA Worker Assigned",
    message: "ASHA Worker Meena Devi has been assigned to Sector 15.",
    time: "1 hour ago",
    read: false
  },
  {
    id: "4",
    type: "success",
    title: "Inventory Restocked",
    message: "Sanitary kits have been restocked. Current inventory: 500 units.",
    time: "2 hours ago",
    read: true
  },
  {
    id: "5",
    type: "alert",
    title: "Missed Checkup",
    message: "5 women have missed their scheduled checkups this week.",
    time: "3 hours ago",
    read: true
  },
  {
    id: "6",
    type: "delivery",
    title: "New Delivery Assigned",
    message: "You have been assigned a new delivery to Sector 14.",
    time: "5 hours ago",
    read: true,
    actionable: true
  },
  {
    id: "7",
    type: "info",
    title: "System Update",
    message: "System maintenance scheduled for tonight at 2 AM.",
    time: "1 day ago",
    read: true
  }
];

const getIcon = (type: string) => {
  switch(type) {
    case 'alert': return <AlertTriangle className="h-5 w-5 text-destructive" />;
    case 'delivery': return <Truck className="h-5 w-5 text-blue-500" />;
    case 'info': return <Info className="h-5 w-5 text-yellow-500" />;
    case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
    default: return <Bell className="h-5 w-5 text-muted-foreground" />;
  }
};

const getBgColor = (type: string, read: boolean) => {
  if (read) return 'bg-muted/30';
  switch(type) {
    case 'alert': return 'bg-destructive/10';
    case 'delivery': return 'bg-blue-500/10';
    case 'info': return 'bg-yellow-500/10';
    case 'success': return 'bg-green-500/10';
    default: return 'bg-muted/30';
  }
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'alerts') return n.type === 'alert';
    if (filter === 'deliveries') return n.type === 'delivery';
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with the latest activities and alerts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-destructive">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Delivery</p>
                <p className="text-2xl font-bold">{notifications.filter(n => n.type === 'delivery').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Alerts</p>
                <p className="text-2xl font-bold">{notifications.filter(n => n.type === 'alert').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Notifications List */}
        <div className="md:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Recent Notifications</CardTitle>
                <Tabs value={filter} onValueChange={setFilter} className="w-[300px]">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="unread">Unread</TabsTrigger>
                    <TabsTrigger value="alerts">Alerts</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No notifications</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-muted/50 transition-colors ${getBgColor(notification.type, notification.read)}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold flex items-center gap-2">
                                {notification.title}
                                {!notification.read && (
                                  <Badge variant="destructive" className="text-xs">New</Badge>
                                )}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{notification.time}</span>
                            {notification.actionable && (
                              <>
                                <span className="text-xs text-muted-foreground">•</span>
                                <Button variant="link" className="h-auto p-0 text-xs">
                                  Take action
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                </div>
                <Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive email updates</p>
                </div>
                <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                View all notifications
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule preferences
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Filter className="h-4 w-4 mr-2" />
                Customize filters
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>This week</span>
                  <span className="font-medium">24 notifications</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Avg. response time</span>
                  <span className="font-medium">15 minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Most active hour</span>
                  <span className="font-medium">10:00 AM</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}