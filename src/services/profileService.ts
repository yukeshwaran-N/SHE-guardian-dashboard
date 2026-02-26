// src/services/profileService.ts
import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  stats: {
    total_logins: number;
    last_session: string | null;
    session_count: number;
  };
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  ip_address: string;
  device: string;
  created_at: string;
}

export const profileService = {
  // Get current user profile
  async getCurrentProfile(userId: string) {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        phone,
        role,
        avatar_url,
        is_active,
        created_at,
        last_login,
        user_settings (
          theme,
          language,
          notifications_enabled,
          email_notifications,
          push_notifications,
          sms_notifications
        ),
        user_stats (
          total_logins,
          last_session,
          session_count
        )
      `)
      .eq('id', userId)
      .single();
    
    if (userError) throw userError;

    // Get recent activity
    const { data: activity, error: activityError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (activityError) throw activityError;

    const settings = user.user_settings?.[0] || {};
    
    return {
      ...user,
      preferences: {
        theme: settings.theme || 'system',
        language: settings.language || 'en',
        notifications: {
          email: settings.email_notifications ?? true,
          push: settings.push_notifications ?? true,
          sms: settings.sms_notifications ?? false
        }
      },
      stats: user.user_stats?.[0] || {
        total_logins: 0,
        last_session: null,
        session_count: 0
      },
      recent_activity: activity || []
    };
  },

  // Update profile
  async updateProfile(userId: string, data: Partial<UserProfile>) {
    const { error } = await supabase
      .from('users')
      .update({
        full_name: data.full_name,
        phone: data.phone,
        avatar_url: data.avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  },

  // Update preferences
  async updatePreferences(userId: string, preferences: any) {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        theme: preferences.theme,
        language: preferences.language,
        email_notifications: preferences.notifications.email,
        push_notifications: preferences.notifications.push,
        sms_notifications: preferences.notifications.sms,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    return true;
  },

  // Change password
  async changePassword(userId: string, data: ChangePasswordData) {
    // First verify current password
    const { data: user, error: verifyError } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .eq('password', data.current_password)
      .single();

    if (verifyError || !user) {
      throw new Error('Current password is incorrect');
    }

    // Update to new password
    const { error } = await supabase
      .from('users')
      .update({ 
        password: data.new_password,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
    return true;
  },

  // Upload avatar
  async uploadAvatar(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) throw updateError;

    return publicUrl;
  },

  // Get activity logs
  async getActivityLogs(userId: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('user_sessions')
      .select(`
        id,
        started_at as created_at,
        ip_address,
        device_info as device,
        duration
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data.map((session: any) => ({
      id: session.id,
      action: 'session',
      details: `Session duration: ${session.duration || 0} minutes`,
      ip_address: session.ip_address,
      device: session.device?.platform || 'Unknown',
      created_at: session.created_at
    })) as ActivityLog[];
  },

  // Delete account
  async deleteAccount(userId: string, password: string) {
    // Verify password
    const { data: user, error: verifyError } = await supabase
      .from('users')
      .select('password')
      .eq('id', userId)
      .eq('password', password)
      .single();

    if (verifyError || !user) {
      throw new Error('Password is incorrect');
    }

    // Soft delete - deactivate account
    const { error } = await supabase
      .from('users')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
    return true;
  }
};