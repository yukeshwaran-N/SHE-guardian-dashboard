// src/components/notifications/NotificationBell.tsx
import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, X, AlertCircle, UserPlus, Package, Truck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService, Notification } from '@/services/notificationService';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔔 NotificationBell mounted');

    // Subscribe to notifications
    notificationService.subscribe((notification) => {
      console.log('📨 Received notification:', notification);
      setNotifications(prev => {
        const updated = [notification, ...prev].slice(0, 20);
        return updated;
      });
      setUnreadCount(prev => prev + 1);
    });

    // Load from localStorage
    const saved = localStorage.getItem('notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(parsed);
      } catch (e) {
        console.error('Error parsing notifications:', e);
      }
    }
    
    setUnreadCount(notificationService.getUnreadCount());

    // Click outside to close
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Save to localStorage when notifications change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const getIcon = (type: string) => {
    switch(type) {
      case 'user_registered': return <UserPlus className="h-5 w-5 text-green-500" />;
      case 'alert_created': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'alert_resolved': return <CheckCheck className="h-5 w-5 text-green-500" />;
      case 'delivery_assigned': return <Package className="h-5 w-5 text-blue-500" />;
      case 'delivery_completed': return <Truck className="h-5 w-5 text-purple-500" />;
      case 'stock_low': return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    notificationService.markAsRead(notification.id);
    setUnreadCount(prev => Math.max(0, prev - 1));
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
    );

    if (notification.action_url) {
      navigate(notification.action_url);
      setIsOpen(false);
    }
  };

  const markAllAsRead = () => {
    notificationService.markAllAsRead();
    setUnreadCount(0);
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5);

  return (
    <div className="relative" ref={bellRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1"
          >
            <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          </motion.div>
        )}
      </Button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 z-50"
          >
            <Card className="border shadow-xl">
              {/* Header */}
              <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-purple-600/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-2">
                        {unreadCount} new
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    {unreadCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={markAllAsRead}
                      >
                        <CheckCheck className="h-3 w-3 mr-1" />
                        Mark all read
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You'll see updates here when something happens
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {displayedNotifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                          !notification.read ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-3">
                          {/* Icon */}
                          <div className="relative">
                            <div className={`h-10 w-10 rounded-full bg-opacity-20 flex items-center justify-center ${
                              notification.type === 'user_registered' ? 'bg-green-500/20' :
                              notification.type === 'alert_created' ? 'bg-red-500/20' :
                              notification.type === 'delivery_completed' ? 'bg-purple-500/20' :
                              'bg-blue-500/20'
                            }`}>
                              {getIcon(notification.type)}
                            </div>
                            {!notification.read && (
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                                className={`absolute -top-1 -right-1 h-3 w-3 rounded-full ${getPriorityColor(notification.priority)}`}
                              />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-medium">{notification.title}</p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            
                            {/* Action hint */}
                            {notification.action_url && (
                              <p className="text-xs text-primary mt-1 flex items-center gap-1">
                                Click to view
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 5 && (
                <div className="p-3 border-t bg-muted/20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? 'Show less' : `View all ${notifications.length} notifications`}
                  </Button>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}