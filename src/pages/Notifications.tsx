// src/pages/Notifications.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  Download,
  RefreshCw,
  UserPlus,
  AlertTriangle,
  Package,
  Truck,
  Heart,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  Crown,
  Medal,
  Star
} from 'lucide-react';
import { notificationService, Notification } from '@/services/notificationService';
import { format, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [filter, typeFilter, notifications]);

  const loadNotifications = () => {
    setLoading(true);
    const saved = localStorage.getItem('notifications');
    if (saved) {
      const loaded = JSON.parse(saved).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
      setNotifications(loaded);
      setFilteredNotifications(loaded);
    }
    setLoading(false);
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    if (filter !== 'all') {
      if (filter === 'unread') {
        filtered = filtered.filter(n => !n.read);
      } else if (filter === 'read') {
        filtered = filtered.filter(n => n.read);
      }
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    setFilteredNotifications(filtered);
  };

  const markAsRead = (id: string) => {
    notificationService.markAsRead(id);
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    // Update localStorage
    const updated = notifications.filter(n => n.id !== id);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    setFilteredNotifications([]);
    localStorage.removeItem('notifications');
    notificationService.markAllAsRead();
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'user_registered': return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'alert_created': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'alert_resolved': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'delivery_assigned': return <Package className="h-5 w-5 text-blue-500" />;
      case 'delivery_completed': return <Truck className="h-5 w-5 text-purple-500" />;
      case 'stock_low': return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'user_registered': return 'User Registration';
      case 'alert_created': return 'New Alert';
      case 'alert_resolved': return 'Alert Resolved';
      case 'delivery_assigned': return 'Delivery Assigned';
      case 'delivery_completed': return 'Delivery Completed';
      case 'stock_low': return 'Low Stock';
      default: return type;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
              >
                <Badge variant="destructive" className="px-3 py-1">
                  <Bell className="h-4 w-4 mr-2" />
                  {unreadCount} unread
                </Badge>
              </motion.div>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Stay updated with real-time system events
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadNotifications}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all read
          </Button>
          <Button variant="outline" size="sm" onClick={clearAll} disabled={notifications.length === 0}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear all
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" />
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
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">New Users</p>
                <p className="text-2xl font-bold">
                  {notifications.filter(n => n.type === 'user_registered').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Deliveries</p>
                <p className="text-2xl font-bold">
                  {notifications.filter(n => n.type.includes('delivery')).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                Status
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                Type
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="user_registered">User Registration</SelectItem>
                <SelectItem value="alert_created">New Alert</SelectItem>
                <SelectItem value="alert_resolved">Alert Resolved</SelectItem>
                <SelectItem value="delivery_assigned">Delivery Assigned</SelectItem>
                <SelectItem value="delivery_completed">Delivery Completed</SelectItem>
                <SelectItem value="stock_low">Low Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardContent className="p-0">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Bell className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                {filter !== 'all' || typeFilter !== 'all'
                  ? "Try adjusting your filters"
                  : "You're all caught up!"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              <AnimatePresence>
                {filteredNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-6 hover:bg-muted/50 transition-colors ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Icon with animation */}
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        className={`h-12 w-12 rounded-full bg-opacity-20 flex items-center justify-center shrink-0 ${
                          notification.type === 'user_registered' ? 'bg-green-500' :
                          notification.type === 'alert_created' ? 'bg-red-500' :
                          notification.type === 'delivery_completed' ? 'bg-purple-500' :
                          'bg-blue-500'
                        }`}
                      >
                        {getIcon(notification.type)}
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{notification.title}</h3>
                              <Badge className={getPriorityColor(notification.priority)}>
                                {notification.priority}
                              </Badge>
                              <Badge variant="outline">
                                {getTypeLabel(notification.type)}
                              </Badge>
                              {!notification.read && (
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                  className="h-2 w-2 bg-blue-500 rounded-full"
                                />
                              )}
                            </div>
                            <p className="text-muted-foreground">
                              {notification.message}
                            </p>
                            {notification.user_name && (
                              <p className="text-sm text-primary mt-1">
                                User: {notification.user_name}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {format(notification.timestamp, 'MMM d, yyyy')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <CheckCheck className="h-4 w-4 mr-2" />
                              Mark read
                            </Button>
                          )}
                          {notification.action_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => {
                                markAsRead(notification.id);
                                navigate(notification.action_url);
                              }}
                            >
                              View Details
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-red-600"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}