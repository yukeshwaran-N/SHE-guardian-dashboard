// src/services/consultationsService.ts
import { supabase } from './supabase';

export interface Consultation {
  id: string;
  woman_id: string;
  woman_name?: string;
  woman_phone?: string;
  doctor_id: string;
  doctor_name?: string;
  doctor_specialty?: string;
  consultation_type: 'video' | 'voice' | 'chat';
  scheduled_date: string;
  scheduled_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  symptoms: string | null;
  meeting_url: string | null;
  duration_minutes: number | null;
  payment_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const consultationsService = {
  // Get all consultations
  async getAllConsultations() {
    const { data, error } = await supabase
      .from('consultations')
      .select(`
        *,
        women!consultations_woman_id_fkey (
          users!women_user_id_fkey (
            full_name,
            phone
          )
        ),
        doctors!consultations_doctor_id_fkey (
          name,
          specialty
        )
      `)
      .order('scheduled_date', { ascending: false });
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      ...item,
      woman_name: item.women?.users?.full_name,
      woman_phone: item.women?.users?.phone,
      doctor_name: item.doctors?.name,
      doctor_specialty: item.doctors?.specialty
    })) as Consultation[];
  },

  // Get consultations by woman
  async getConsultationsByWoman(womanId: string) {
    const { data, error } = await supabase
      .from('consultations')
      .select(`
        *,
        doctors!consultations_doctor_id_fkey (
          name,
          specialty,
          image_url,
          fee
        )
      `)
      .eq('woman_id', womanId)
      .order('scheduled_date', { ascending: false });
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      ...item,
      doctor_name: item.doctors?.name,
      doctor_specialty: item.doctors?.specialty,
      doctor_image: item.doctors?.image_url,
      doctor_fee: item.doctors?.fee
    })) as Consultation[];
  },

  // Get consultations by doctor
  async getConsultationsByDoctor(doctorId: string) {
    const { data, error } = await supabase
      .from('consultations')
      .select(`
        *,
        women!consultations_woman_id_fkey (
          users!women_user_id_fkey (
            full_name,
            phone
          )
        )
      `)
      .eq('doctor_id', doctorId)
      .order('scheduled_date', { ascending: true });
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      ...item,
      woman_name: item.women?.users?.full_name,
      woman_phone: item.women?.users?.phone
    })) as Consultation[];
  },

  // Get consultation by ID
  async getConsultationById(id: string) {
    const { data, error } = await supabase
      .from('consultations')
      .select(`
        *,
        women!consultations_woman_id_fkey (
          users!women_user_id_fkey (
            full_name,
            phone,
            email
          ),
          address,
          age
        ),
        doctors!consultations_doctor_id_fkey (
          name,
          specialty,
          image_url,
          fee,
          email,
          phone
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      woman_name: data.women?.users?.full_name,
      woman_phone: data.women?.users?.phone,
      woman_email: data.women?.users?.email,
      woman_address: data.women?.address,
      woman_age: data.women?.age,
      doctor_name: data.doctors?.name,
      doctor_specialty: data.doctors?.specialty,
      doctor_image: data.doctors?.image_url,
      doctor_fee: data.doctors?.fee,
      doctor_email: data.doctors?.email,
      doctor_phone: data.doctors?.phone
    } as any;
  },

  // Create new consultation
  async createConsultation(consultationData: any) {
    const { data, error } = await supabase
      .from('consultations')
      .insert([{
        woman_id: consultationData.woman_id,
        doctor_id: consultationData.doctor_id,
        consultation_type: consultationData.consultation_type || 'video',
        scheduled_date: consultationData.scheduled_date,
        scheduled_time: consultationData.scheduled_time,
        status: 'pending',
        symptoms: consultationData.symptoms,
        notes: consultationData.notes,
        payment_id: consultationData.payment_id
      }])
      .select();
    
    if (error) throw error;
    return data;
  },

  // Update consultation
  async updateConsultation(id: string, consultationData: any) {
    const { data, error } = await supabase
      .from('consultations')
      .update({
        consultation_type: consultationData.consultation_type,
        scheduled_date: consultationData.scheduled_date,
        scheduled_time: consultationData.scheduled_time,
        symptoms: consultationData.symptoms,
        notes: consultationData.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Update consultation status
  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('consultations')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Confirm consultation
  async confirmConsultation(id: string) {
    return this.updateStatus(id, 'confirmed');
  },

  // Complete consultation
  async completeConsultation(id: string, duration?: number) {
    const updateData: any = {
      status: 'completed',
      updated_at: new Date().toISOString()
    };
    if (duration) {
      updateData.duration_minutes = duration;
    }
    
    const { data, error } = await supabase
      .from('consultations')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Cancel consultation
  async cancelConsultation(id: string, reason?: string) {
    const { data, error } = await supabase
      .from('consultations')
      .update({
        status: 'cancelled',
        notes: reason ? `Cancelled: ${reason}` : 'Cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Delete consultation
  async deleteConsultation(id: string) {
    const { error } = await supabase
      .from('consultations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Get today's consultations
  async getTodaysConsultations() {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('consultations')
      .select(`
        *,
        women!consultations_woman_id_fkey (
          users!women_user_id_fkey (
            full_name,
            phone
          )
        ),
        doctors!consultations_doctor_id_fkey (
          name,
          specialty
        )
      `)
      .eq('scheduled_date', today)
      .order('scheduled_time', { ascending: true });
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      ...item,
      woman_name: item.women?.users?.full_name,
      woman_phone: item.women?.users?.phone,
      doctor_name: item.doctors?.name,
      doctor_specialty: item.doctors?.specialty
    })) as Consultation[];
  },

  // Get upcoming consultations
  async getUpcomingConsultations() {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('consultations')
      .select(`
        *,
        women!consultations_woman_id_fkey (
          users!women_user_id_fkey (
            full_name,
            phone
          )
        ),
        doctors!consultations_doctor_id_fkey (
          name,
          specialty
        )
      `)
      .gte('scheduled_date', today)
      .not('status', 'in', '("completed","cancelled")')
      .order('scheduled_date', { ascending: true })
      .order('scheduled_time', { ascending: true });
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      ...item,
      woman_name: item.women?.users?.full_name,
      woman_phone: item.women?.users?.phone,
      doctor_name: item.doctors?.name,
      doctor_specialty: item.doctors?.specialty
    })) as Consultation[];
  },

  // Get consultation statistics
  async getConsultationStats() {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: total, error: totalError } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true });
    
    const { data: pending, error: pendingError } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    const { data: confirmed, error: confirmedError } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed');
    
    const { data: completed, error: completedError } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');
    
    const { data: today_count, error: todayError } = await supabase
      .from('consultations')
      .select('*', { count: 'exact', head: true })
      .eq('scheduled_date', today);
    
    if (totalError || pendingError || confirmedError || completedError || todayError) {
      throw totalError || pendingError || confirmedError || completedError || todayError;
    }
    
    return {
      total: total?.length || 0,
      pending: pending?.length || 0,
      confirmed: confirmed?.length || 0,
      completed: completed?.length || 0,
      today: today_count?.length || 0
    };
  },

  // Generate video meeting URL (using Jitsi or Zoom)
  generateMeetingUrl(consultationId: string, doctorName: string, womanName: string) {
    // Using Jitsi Meet (free, open source)
    const roomName = `sakhi-${consultationId}-${Date.now()}`;
    const doctorEncoded = encodeURIComponent(doctorName);
    const womanEncoded = encodeURIComponent(womanName);
    
    return `https://meet.jit.si/${roomName}#userInfo.displayName="${doctorEncoded}"`;
  }
};