// src/services/appUsersService.ts
import { supabase } from './supabase';

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: 'woman' | 'asha' | 'delivery' | 'admin';
  is_active: boolean;
  last_active: string | null;
  created_at: string;
  device_info?: {
    platform: string;
    version: string;
    model: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    last_updated: string;
  };
  stats: {
    total_logins: number;
    total_sessions: number;
    avg_session_duration: number;
    last_app_version: string;
  };
}

export interface AppSession {
  id: string;
  user_id: string;
  user_name?: string;
  started_at: string;
  ended_at: string | null;
  duration: number | null;
  device_info: any;
  ip_address: string;
  location: any;
}

export interface AppFeedback {
  id: string;
  user_id: string;
  user_name?: string;
  rating: number;
  feedback: string;
  category: string;
  created_at: string;
  status: 'new' | 'reviewed' | 'resolved';
}

export const appUsersService = {
  // Get all app users
  async getAllAppUsers() {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        phone,
        role,
        is_active,
        last_login as last_active,
        created_at,
        device_info:user_devices(*),
        location:user_locations(*),
        stats:user_stats(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map((user: any) => ({
      ...user,
      device_info: user.device_info?.[0],
      location: user.location?.[0],
      stats: user.stats?.[0] || {
        total_logins: 0,
        total_sessions: 0,
        avg_session_duration: 0,
        last_app_version: '1.0.0'
      }
    })) as AppUser[];
  },

  // Get user sessions
  async getUserSessions(userId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('user_sessions')
      .select(`
        *,
        users!user_sessions_user_id_fkey (
          full_name
        )
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    return data.map((session: any) => ({
      ...session,
      user_name: session.users?.full_name
    })) as AppSession[];
  },

  // Get user feedback
  async getUserFeedback(status?: string) {
    let query = supabase
      .from('user_feedback')
      .select(`
        *,
        users!user_feedback_user_id_fkey (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    return data.map((feedback: any) => ({
      ...feedback,
      user_name: feedback.users?.full_name,
      user_email: feedback.users?.email
    })) as AppFeedback[];
  },

  // Update feedback status
  async updateFeedbackStatus(feedbackId: string, status: string) {
    const { error } = await supabase
      .from('user_feedback')
      .update({ status })
      .eq('id', feedbackId);
    
    if (error) throw error;
    return true;
  },

  // Get active users count (last 24 hours)
  async getActiveUsersCount() {
    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);
    
    const { count, error } = await supabase
      .from('user_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('started_at', last24h.toISOString());
    
    if (error) throw error;
    return count || 0;
  },

  // Get user statistics
  async getUserStats() {
    const { data: total, error: totalError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .in('role', ['woman', 'asha']);
    
    const { data: active, error: activeError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .in('role', ['woman', 'asha'])
      .eq('is_active', true);
    
    const activeToday = await this.getActiveUsersCount();
    
    const { data: feedback, error: feedbackError } = await supabase
      .from('user_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');
    
    if (totalError || activeError || feedbackError) {
      throw totalError || activeError || feedbackError;
    }
    
    return {
      totalUsers: total?.length || 0,
      activeUsers: active?.length || 0,
      activeToday,
      pendingFeedback: feedback?.length || 0
    };
  },

  // Block/unblock user
  async toggleUserBlock(userId: string, block: boolean) {
    const { error } = await supabase
      .from('users')
      .update({ 
        is_active: !block,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  },

  // Send notification to user
  async sendPushNotification(userId: string, title: string, body: string, data?: any) {
    // This would integrate with FCM/OneSignal
    console.log('Sending notification to:', userId, { title, body, data });
    
    // Log notification
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message: body,
        data,
        type: 'push'
      });
    
    if (error) throw error;
    return true;
  },

  // Get app crash reports
  async getCrashReports(limit: number = 50) {
    const { data, error } = await supabase
      .from('crash_reports')
      .select(`
        *,
        users!crash_reports_user_id_fkey (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Get app version distribution
  async getVersionDistribution() {
    const { data, error } = await supabase
      .from('user_stats')
      .select('last_app_version');
    
    if (error) throw error;
    
    const distribution: Record<string, number> = {};
    data.forEach((stat: any) => {
      const version = stat.last_app_version || 'unknown';
      distribution[version] = (distribution[version] || 0) + 1;
    });
    
    return Object.entries(distribution).map(([version, count]) => ({
      version,
      count
    }));
  }
};