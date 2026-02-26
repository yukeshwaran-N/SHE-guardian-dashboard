// src/services/settingsService.ts
import { supabase } from './supabase';

export interface SystemSettings {
  id: string;
  site_name: string;
  site_logo: string;
  primary_color: string;
  support_email: string;
  support_phone: string;
  emergency_number: string;
  enable_notifications: boolean;
  enable_email_alerts: boolean;
  enable_sms_alerts: boolean;
  auto_assign_asha: boolean;
  auto_assign_delivery: boolean;
  max_delivery_distance: number;
  consultation_buffer_minutes: number;
  alert_escalation_minutes: number;
  working_hours_start: string;
  working_hours_end: string;
  working_days: string[];
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackupRecord {
  id: string;
  filename: string;
  size: number;
  tables: string[];
  created_at: string;
  created_by: string;
  status: 'success' | 'failed';
}

export const settingsService = {
  // Get system settings
  async getSystemSettings() {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    // Return default settings if none exist
    return data || {
      site_name: 'SAKHI',
      site_logo: '/logo.png',
      primary_color: '#4f46e5',
      support_email: 'support@sakhi.gov.in',
      support_phone: '+91 1800-123-4567',
      emergency_number: '108',
      enable_notifications: true,
      enable_email_alerts: true,
      enable_sms_alerts: true,
      auto_assign_asha: true,
      auto_assign_delivery: true,
      max_delivery_distance: 50,
      consultation_buffer_minutes: 30,
      alert_escalation_minutes: 60,
      working_hours_start: '09:00',
      working_hours_end: '18:00',
      working_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    };
  },

  // Update system settings
  async updateSystemSettings(settings: Partial<SystemSettings>) {
    const { data, error } = await supabase
      .from('system_settings')
      .upsert({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) throw error;
    return data;
  },

  // Get user settings
  async getUserSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    // Return default settings if none exist
    return data || {
      user_id: userId,
      theme: 'system',
      language: 'en',
      notifications_enabled: true,
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false
    };
  },

  // Update user settings
  async updateUserSettings(userId: string, settings: Partial<UserSettings>) {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) throw error;
    return data;
  },

  // Get all users for management
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        role,
        phone,
        is_active,
        created_at,
        last_login
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Update user role
  async updateUserRole(userId: string, role: string) {
    const { error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  },

  // Toggle user active status
  async toggleUserStatus(userId: string, isActive: boolean) {
    const { error } = await supabase
      .from('users')
      .update({ is_active: isActive })
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  },

  // Create backup
  async createBackup(tables: string[]) {
    const backupData: any = {};
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*');
      
      if (error) throw error;
      backupData[table] = data;
    }

    const filename = `backup-${new Date().toISOString()}.json`;
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);

    // Log backup record
    const { error: logError } = await supabase
      .from('backup_logs')
      .insert({
        filename,
        tables,
        status: 'success'
      });
    
    if (logError) console.error('Error logging backup:', logError);
    
    return filename;
  },

  // Get backup history
  async getBackupHistory() {
    const { data, error } = await supabase
      .from('backup_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    return data as BackupRecord[];
  },

  // Restore from backup
  async restoreFromBackup(file: File) {
    const reader = new FileReader();
    
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        try {
          const backupData = JSON.parse(e.target?.result as string);
          
          for (const [table, data] of Object.entries(backupData)) {
            // Clear existing data
            await supabase.from(table).delete().neq('id', '');
            
            // Insert backup data
            if (Array.isArray(data) && data.length > 0) {
              const { error } = await supabase.from(table).insert(data);
              if (error) throw error;
            }
          }
          
          resolve(true);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.readAsText(file);
    });
  },

  // Get system logs
  async getSystemLogs(limit: number = 100) {
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Clear system logs
  async clearLogs(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const { error } = await supabase
      .from('system_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString());
    
    if (error) throw error;
    return true;
  }
};