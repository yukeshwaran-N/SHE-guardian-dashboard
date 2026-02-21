// src/services/notificationService.ts
import { supabase } from './supabase';

export interface Notification {
  id: string;
  type: 'user_registered' | 'alert_created' | 'alert_resolved' | 'delivery_assigned' | 'delivery_completed' | 'stock_low' | 'system_alert';
  title: string;
  message: string;
  user_id?: string;
  user_name?: string;
  timestamp: Date;
  read: boolean;
  data?: any;
  priority: 'low' | 'medium' | 'high';
  icon?: string;
  action_url?: string;
}

class NotificationService {
  public listeners: ((notification: Notification) => void)[] = [];
  private unreadCount: number = 0;
  private initialized = false;

  constructor() {
    console.log('📋 NotificationService constructor called');
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem('notificationUnreadCount');
      this.unreadCount = saved ? parseInt(saved) : 0;
      console.log('📋 Loaded from storage - unread count:', this.unreadCount);
      
      const notifications = localStorage.getItem('notifications');
      console.log('📋 Notifications in storage:', notifications ? JSON.parse(notifications).length : 0);
    } catch (e) {
      console.error('❌ Error loading from storage:', e);
    }
  }

  init() {
    console.log('🚀 NotificationService.init() called');
    
    if (this.initialized) {
      console.log('⚠️ Already initialized');
      return;
    }
    
    this.initialized = true;
    console.log('✅ Notification service initialized successfully');

    // Check if supabase is available
    if (!supabase) {
      console.error('❌ Supabase client not available');
      return;
    }

    // Users subscription
    console.log('📡 Setting up users subscription...');
    const usersChannel = supabase
      .channel('users-notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'users' },
        (payload) => {
          console.log('👤👤👤 NEW USER DETECTED!', payload);
          console.log('Payload new:', payload.new);
          
          const notification: Notification = {
            id: `user-${Date.now()}`,
            type: 'user_registered',
            title: '👤 New User Registered',
            message: `${payload.new.full_name || 'A new user'} just joined the platform`,
            user_id: payload.new.id,
            user_name: payload.new.full_name,
            timestamp: new Date(),
            read: false,
            priority: 'medium',
            action_url: '/admin/app-users'
          };
          
          console.log('📨 Created notification:', notification);
          this.notify(notification);
        }
      )
      .subscribe((status) => {
        console.log('📡 Users subscription status:', status);
      });

    // Alerts subscription
    console.log('📡 Setting up alerts subscription...');
    const alertsChannel = supabase
      .channel('alerts-notifications')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          console.log('⚠️⚠️⚠️ NEW ALERT DETECTED!', payload);
          const severity = payload.new.severity;
          const notification: Notification = {
            id: `alert-${Date.now()}`,
            type: 'alert_created',
            title: severity === 'high' ? '🚨 High Priority Alert!' : '⚠️ New Alert',
            message: `${payload.new.woman_name}: ${payload.new.type}`,
            user_name: payload.new.woman_name,
            timestamp: new Date(),
            read: false,
            priority: severity === 'high' ? 'high' : severity === 'medium' ? 'medium' : 'low',
            action_url: '/admin/alerts'
          };
          this.notify(notification);
        }
      )
      .subscribe((status) => {
        console.log('📡 Alerts subscription status:', status);
      });

    // Deliveries subscription
    console.log('📡 Setting up deliveries subscription...');
    const deliveriesChannel = supabase
      .channel('deliveries-notifications')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'deliveries' },
        (payload) => {
          console.log('📦📦📦 NEW DELIVERY DETECTED!', payload);
          const notification: Notification = {
            id: `delivery-${Date.now()}`,
            type: 'delivery_assigned',
            title: '📦 New Delivery Assigned',
            message: `Delivery for ${payload.new.woman_name} has been created`,
            user_name: payload.new.woman_name,
            timestamp: new Date(),
            read: false,
            priority: 'medium',
            action_url: '/admin/deliveries'
          };
          this.notify(notification);
        }
      )
      .subscribe((status) => {
        console.log('📡 Deliveries subscription status:', status);
      });

    console.log('✅ All subscriptions setup complete');
  }

  private notify(notification: Notification) {
    console.log('🔔🔔🔔 NOTIFY CALLED!', notification);
    console.log('Current listeners:', this.listeners.length);
    
    this.unreadCount++;
    localStorage.setItem('notificationUnreadCount', this.unreadCount.toString());
    console.log('Updated unread count:', this.unreadCount);
    
    // Save to notifications list
    const existing = localStorage.getItem('notifications');
    const notifications = existing ? JSON.parse(existing) : [];
    notifications.unshift({
      ...notification,
      timestamp: notification.timestamp.toISOString()
    });
    
    // Keep only last 50 notifications
    const trimmed = notifications.slice(0, 50);
    localStorage.setItem('notifications', JSON.stringify(trimmed));
    console.log('Saved to localStorage, total notifications:', trimmed.length);
    
    // Notify all listeners
    console.log('Notifying', this.listeners.length, 'listeners');
    this.listeners.forEach((listener, index) => {
      console.log('Calling listener', index);
      try {
        listener(notification);
      } catch (e) {
        console.error('Error in listener', index, e);
      }
    });
  }

  subscribe(callback: (notification: Notification) => void) {
    console.log('📡 New subscriber added');
    this.listeners.push(callback);
    console.log('Total listeners:', this.listeners.length);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
      console.log('Listener removed, remaining:', this.listeners.length);
    };
  }

  markAsRead(notificationId: string) {
    console.log('✅ Marking as read:', notificationId);
    this.unreadCount = Math.max(0, this.unreadCount - 1);
    localStorage.setItem('notificationUnreadCount', this.unreadCount.toString());
    
    // Update in localStorage
    const existing = localStorage.getItem('notifications');
    if (existing) {
      const notifications = JSON.parse(existing).map((n: any) => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }

  markAllAsRead() {
    console.log('✅ Marking all as read');
    this.unreadCount = 0;
    localStorage.setItem('notificationUnreadCount', '0');
    
    // Update in localStorage
    const existing = localStorage.getItem('notifications');
    if (existing) {
      const notifications = JSON.parse(existing).map((n: any) => ({ ...n, read: true }));
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }

  getUnreadCount(): number {
    return this.unreadCount;
  }

  clearAll() {
    console.log('🗑️ Clearing all notifications');
    localStorage.removeItem('notifications');
    localStorage.setItem('notificationUnreadCount', '0');
    this.unreadCount = 0;
  }
}

export const notificationService = new NotificationService();

// Make it globally available for testing
(window as any).notificationService = notificationService;