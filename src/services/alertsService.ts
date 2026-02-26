// src/services/alertsService.ts
import { supabase } from './supabase';

export interface Alert {
  id: string;
  woman_id: string;
  woman_name?: string;
  woman_phone?: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  status: 'active' | 'resolved' | 'dismissed';
  assigned_to: string | null;
  assigned_to_name?: string;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
}

export const alertsService = {
  // Get all alerts
  async getAllAlerts() {
    const { data, error } = await supabase
      .from('alerts')
      .select(`
        *,
        women!alerts_woman_id_fkey (
          users!women_user_id_fkey (
            full_name,
            phone
          )
        ),
        assigned_worker:users!alerts_assigned_to_fkey (
          full_name
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data
    return data.map((item: any) => ({
      ...item,
      woman_name: item.women?.users?.full_name,
      woman_phone: item.women?.users?.phone,
      assigned_to_name: item.assigned_worker?.full_name
    })) as Alert[];
  },

  // Get active alerts
  async getActiveAlerts() {
    const { data, error } = await supabase
      .from('alerts')
      .select(`
        *,
        women!alerts_woman_id_fkey (
          users!women_user_id_fkey (
            full_name,
            phone
          )
        ),
        assigned_worker:users!alerts_assigned_to_fkey (
          full_name
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      ...item,
      woman_name: item.women?.users?.full_name,
      woman_phone: item.women?.users?.phone,
      assigned_to_name: item.assigned_worker?.full_name
    })) as Alert[];
  },

  // Get alert by ID
  async getAlertById(id: string) {
    const { data, error } = await supabase
      .from('alerts')
      .select(`
        *,
        women!alerts_woman_id_fkey (
          users!women_user_id_fkey (
            full_name,
            phone
          )
        ),
        assigned_worker:users!alerts_assigned_to_fkey (
          full_name
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      woman_name: data.women?.users?.full_name,
      woman_phone: data.women?.users?.phone,
      assigned_to_name: data.assigned_worker?.full_name
    } as Alert;
  },

  // Create new alert
  async createAlert(alertData: any) {
    const { data, error } = await supabase
      .from('alerts')
      .insert([{
        woman_id: alertData.woman_id,
        type: alertData.type,
        severity: alertData.severity,
        description: alertData.description,
        location: alertData.location,
        latitude: alertData.latitude,
        longitude: alertData.longitude,
        status: 'active',
        assigned_to: alertData.assigned_to
      }])
      .select();
    
    if (error) throw error;
    return data;
  },

  // Update alert
  async updateAlert(id: string, alertData: any) {
    const { data, error } = await supabase
      .from('alerts')
      .update({
        type: alertData.type,
        severity: alertData.severity,
        description: alertData.description,
        location: alertData.location,
        latitude: alertData.latitude,
        longitude: alertData.longitude,
        assigned_to: alertData.assigned_to,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Resolve alert
  async resolveAlert(id: string, resolvedBy: string) {
    const { data, error } = await supabase
      .from('alerts')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Dismiss alert
  async dismissAlert(id: string) {
    const { data, error } = await supabase
      .from('alerts')
      .update({
        status: 'dismissed',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Assign alert to worker
  async assignAlert(id: string, assignedTo: string) {
    const { data, error } = await supabase
      .from('alerts')
      .update({
        assigned_to: assignedTo,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Delete alert
  async deleteAlert(id: string) {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Get alerts by woman
  async getAlertsByWoman(womanId: string) {
    const { data, error } = await supabase
      .from('alerts')
      .select(`
        *,
        assigned_worker:users!alerts_assigned_to_fkey (
          full_name
        )
      `)
      .eq('woman_id', womanId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      ...item,
      assigned_to_name: item.assigned_worker?.full_name
    })) as Alert[];
  },

  // Get alerts by severity
  async getAlertsBySeverity(severity: string) {
    const { data, error } = await supabase
      .from('alerts')
      .select(`
        *,
        women!alerts_woman_id_fkey (
          users!women_user_id_fkey (
            full_name,
            phone
          )
        )
      `)
      .eq('severity', severity)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      ...item,
      woman_name: item.women?.users?.full_name,
      woman_phone: item.women?.users?.phone
    })) as Alert[];
  },

  // Get alert statistics
  async getAlertStats() {
    const { data: active, error: activeError } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    const { data: resolved, error: resolvedError } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'resolved');
    
    const { data: high, error: highError } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('severity', 'high')
      .eq('status', 'active');
    
    if (activeError || resolvedError || highError) throw activeError || resolvedError || highError;
    
    return {
      active: active?.length || 0,
      resolved: resolved?.length || 0,
      highPriority: high?.length || 0
    };
  }
};