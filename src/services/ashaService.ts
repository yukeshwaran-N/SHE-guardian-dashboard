// src/services/ashaService.ts
import { supabase } from './supabase';

export interface ASHAWorker {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  sector: string;
  village: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  qualification: string | null;
  experience_years: number | null;
  joining_date: string | null;
  assigned_women_count: number;
  status: 'active' | 'inactive' | 'on-leave';
  performance_rating: number | null;
  total_visits: number | null;
  successful_visits: number | null;
  emergency_contact: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ASHAWorkerWithDetails extends ASHAWorker {
  user: {
    full_name: string;
    email: string;
    phone: string;
  };
}

export const ashaService = {
  // Get all ASHA workers with user details
  async getAllASHAWorkers() {
    const { data, error } = await supabase
      .from('asha_workers')
      .select(`
        *,
        users!asha_workers_user_id_fkey (
          full_name,
          email,
          phone
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Transform the data to a flat structure
    return data.map((item: any) => ({
      ...item,
      full_name: item.users?.full_name,
      email: item.users?.email,
      phone: item.users?.phone
    })) as ASHAWorker[];
  },

  // Get ASHA worker by ID
  async getASHAWorkerById(id: string) {
    const { data, error } = await supabase
      .from('asha_workers')
      .select(`
        *,
        users!asha_workers_user_id_fkey (
          full_name,
          email,
          phone
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      full_name: data.users?.full_name,
      email: data.users?.email,
      phone: data.users?.phone
    } as ASHAWorker;
  },

  // Create new ASHA worker
  async createASHAWorker(workerData: any) {
    // First create user entry
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{
        email: workerData.email,
        password: workerData.password || 'asha123',
        role: 'asha',
        full_name: workerData.full_name,
        phone: workerData.phone,
        is_active: true
      }])
      .select()
      .single();
    
    if (userError) throw userError;

    // Then create ASHA worker profile
    const { data, error } = await supabase
      .from('asha_workers')
      .insert([{
        user_id: userData.id,
        sector: workerData.sector,
        village: workerData.village,
        district: workerData.district,
        state: workerData.state,
        pincode: workerData.pincode,
        qualification: workerData.qualification,
        experience_years: workerData.experience_years,
        joining_date: workerData.joining_date || new Date().toISOString().split('T')[0],
        status: workerData.status || 'active',
        emergency_contact: workerData.emergency_contact
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update ASHA worker
  async updateASHAWorker(id: string, workerData: any) {
    // Update users table if needed
    if (workerData.full_name || workerData.email || workerData.phone) {
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: workerData.full_name,
          email: workerData.email,
          phone: workerData.phone
        })
        .eq('id', workerData.user_id);
      
      if (userError) throw userError;
    }

    // Update asha_workers table
    const { data, error } = await supabase
      .from('asha_workers')
      .update({
        sector: workerData.sector,
        village: workerData.village,
        district: workerData.district,
        state: workerData.state,
        pincode: workerData.pincode,
        qualification: workerData.qualification,
        experience_years: workerData.experience_years,
        joining_date: workerData.joining_date,
        status: workerData.status,
        emergency_contact: workerData.emergency_contact,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Delete ASHA worker
  async deleteASHAWorker(id: string) {
    const { error } = await supabase
      .from('asha_workers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Get ASHA workers by sector
  async getASHAWorkersBySector(sector: string) {
    const { data, error } = await supabase
      .from('asha_workers')
      .select(`
        *,
        users!asha_workers_user_id_fkey (
          full_name,
          email,
          phone
        )
      `)
      .eq('sector', sector)
      .order('full_name');
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      ...item,
      full_name: item.users?.full_name,
      email: item.users?.email,
      phone: item.users?.phone
    })) as ASHAWorker[];
  },

  // Get ASHA workers by status
  async getASHAWorkersByStatus(status: string) {
    const { data, error } = await supabase
      .from('asha_workers')
      .select(`
        *,
        users!asha_workers_user_id_fkey (
          full_name,
          email,
          phone
        )
      `)
      .eq('status', status)
      .order('full_name');
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      ...item,
      full_name: item.users?.full_name,
      email: item.users?.email,
      phone: item.users?.phone
    })) as ASHAWorker[];
  },

  // Update assigned women count
  async updateAssignedCount(id: string) {
    // First get count of women assigned to this ASHA worker
    const { count, error: countError } = await supabase
      .from('women')
      .select('*', { count: 'exact', head: true })
      .eq('asha_worker_id', id);
    
    if (countError) throw countError;

    // Update the count
    const { data, error } = await supabase
      .from('asha_workers')
      .update({ assigned_women_count: count })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Get ASHA worker statistics
  async getASHAWorkerStats() {
    const { data: total, error: totalError } = await supabase
      .from('asha_workers')
      .select('*', { count: 'exact', head: true });
    
    const { data: active, error: activeError } = await supabase
      .from('asha_workers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');
    
    const { data: onLeave, error: leaveError } = await supabase
      .from('asha_workers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'on-leave');
    
    if (totalError || activeError || leaveError) throw totalError || activeError || leaveError;
    
    return {
      total: total?.length || 0,
      active: active?.length || 0,
      onLeave: onLeave?.length || 0
    };
  }
};