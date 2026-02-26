// src/services/womenService.ts
import { supabase } from './supabase';

export interface Woman {
  id: string;
  user_id: string;
  full_name?: string; // This will come from users table
  email?: string; // This will come from users table
  phone?: string; // This will come from users table
  date_of_birth: string | null;
  age: number | null;
  address: string | null;
  village: string | null;
  district: string | null;
  state: string | null;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  asha_worker_id: string | null;
  asha_worker_name?: string; // Joined from users table
  risk_level: 'low' | 'medium' | 'high' | null;
  last_visit_date: string | null;
  next_visit_date: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface WomanWithDetails extends Woman {
  user: {
    full_name: string;
    email: string;
    phone: string;
  };
  asha_worker?: {
    full_name: string;
    phone: string;
  };
}

export const womenService = {
  // Get all women with their user details
  async getAllWomen() {
    const { data, error } = await supabase
      .from('women')
      .select(`
        *,
        users!women_user_id_fkey (
          full_name,
          email,
          phone
        ),
        asha_worker:users!women_asha_worker_id_fkey (
          full_name,
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
      phone: item.users?.phone,
      asha_worker_name: item.asha_worker?.full_name
    })) as Woman[];
  },

  // Get woman by ID
  async getWomanById(id: string) {
    const { data, error } = await supabase
      .from('women')
      .select(`
        *,
        users!women_user_id_fkey (
          full_name,
          email,
          phone
        ),
        asha_worker:users!women_asha_worker_id_fkey (
          full_name,
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
      phone: data.users?.phone,
      asha_worker_name: data.asha_worker?.full_name
    } as Woman;
  },

  // Create new woman (creates both users and women records)
  async createWoman(womanData: any) {
    // First create user entry
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{
        email: womanData.email,
        password: womanData.password || 'welcome123', // Default password
        role: 'woman',
        full_name: womanData.full_name,
        phone: womanData.phone,
        is_active: true
      }])
      .select()
      .single();
    
    if (userError) throw userError;

    // Then create woman profile
    const { data, error } = await supabase
      .from('women')
      .insert([{
        user_id: userData.id,
        date_of_birth: womanData.date_of_birth,
        age: womanData.age,
        address: womanData.address,
        village: womanData.village,
        district: womanData.district,
        state: womanData.state,
        pincode: womanData.pincode,
        emergency_contact_name: womanData.emergency_contact_name,
        emergency_contact_phone: womanData.emergency_contact_phone,
        asha_worker_id: womanData.asha_worker_id,
        risk_level: womanData.risk_level || 'low',
        last_visit_date: womanData.last_visit_date,
        next_visit_date: womanData.next_visit_date,
        notes: womanData.notes
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update woman
  async updateWoman(id: string, womanData: any) {
    // Update women table
    const { data, error } = await supabase
      .from('women')
      .update({
        date_of_birth: womanData.date_of_birth,
        age: womanData.age,
        address: womanData.address,
        village: womanData.village,
        district: womanData.district,
        state: womanData.state,
        pincode: womanData.pincode,
        emergency_contact_name: womanData.emergency_contact_name,
        emergency_contact_phone: womanData.emergency_contact_phone,
        asha_worker_id: womanData.asha_worker_id,
        risk_level: womanData.risk_level,
        last_visit_date: womanData.last_visit_date,
        next_visit_date: womanData.next_visit_date,
        notes: womanData.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Delete woman (this will cascade to users table)
  async deleteWoman(id: string) {
    const { error } = await supabase
      .from('women')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Get women by ASHA worker
  async getWomenByAshaWorker(ashaWorkerId: string) {
    const { data, error } = await supabase
      .from('women')
      .select(`
        *,
        users!women_user_id_fkey (
          full_name,
          email,
          phone
        )
      `)
      .eq('asha_worker_id', ashaWorkerId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      ...item,
      full_name: item.users?.full_name,
      email: item.users?.email,
      phone: item.users?.phone
    })) as Woman[];
  },

  // Get women by risk level
  async getWomenByRiskLevel(riskLevel: string) {
    const { data, error } = await supabase
      .from('women')
      .select(`
        *,
        users!women_user_id_fkey (
          full_name,
          email,
          phone
        )
      `)
      .eq('risk_level', riskLevel)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      ...item,
      full_name: item.users?.full_name,
      email: item.users?.email,
      phone: item.users?.phone
    })) as Woman[];
  },

  // Update last visit date
  async updateLastVisit(id: string) {
    const { data, error } = await supabase
      .from('women')
      .update({
        last_visit_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Get women statistics
  async getWomenStats() {
    const { data: total, error: totalError } = await supabase
      .from('women')
      .select('*', { count: 'exact', head: true });
    
    const { data: highRisk, error: riskError } = await supabase
      .from('women')
      .select('*', { count: 'exact', head: true })
      .eq('risk_level', 'high');
    
    const { data: withAsha, error: ashaError } = await supabase
      .from('women')
      .select('*', { count: 'exact', head: true })
      .not('asha_worker_id', 'is', null);
    
    if (totalError || riskError || ashaError) throw totalError || riskError || ashaError;
    
    return {
      total: total?.length || 0,
      highRisk: highRisk?.length || 0,
      withAshaWorker: withAsha?.length || 0
    };
  }
};