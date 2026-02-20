// src/services/alertsService.ts
import { supabase, Alert } from './supabase';

export const alertsService = {
  // Get all active alerts
  async getActiveAlerts() {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('status', 'active')
      .order('timestamp', { ascending: false });
    
    if (error) throw error;
    return data as Alert[];
  },

  // Get alert by ID
  async getAlertById(id: string) {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Alert;
  },

  // Resolve alert
  async resolveAlert(id: string) {
    const { data, error } = await supabase
      .from('alerts')
      .update({ status: 'resolved' })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Create new alert
  async createAlert(alert: Omit<Alert, 'id'>) {
    const { data, error } = await supabase
      .from('alerts')
      .insert([alert])
      .select();
    
    if (error) throw error;
    return data;
  }
};