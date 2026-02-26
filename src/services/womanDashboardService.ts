// src/services/womanDashboardService.ts
import { supabase } from './supabase';

export interface WomanDashboardData {
  profile: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    date_of_birth: string;
    age: number;
    address: string;
    village: string;
    district: string;
    risk_level: string;
    asha_worker_name: string;
    asha_worker_phone: string;
  };
  healthProfile: any;
  recentConsultations: any[];
  recentDeliveries: any[];
  recentAlerts: any[];
  upcomingAppointments: any[];
  statistics: {
    totalConsultations: number;
    totalDeliveries: number;
    totalAlerts: number;
    lastCheckup: string;
  };
}

export const womanDashboardService = {
  // Get complete dashboard data for a woman
  async getWomanDashboard(womanId: string) {
    try {
      // Fetch woman profile with related data
      const { data: woman, error: womanError } = await supabase
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
        .eq('id', womanId)
        .single();
      
      if (womanError) throw womanError;

      // Fetch health profile
      const { data: healthProfile, error: healthError } = await supabase
        .from('health_profiles')
        .select('*')
        .eq('woman_id', womanId)
        .single();

      // Fetch consultations
      const { data: consultations, error: consError } = await supabase
        .from('consultations')
        .select(`
          *,
          doctors!consultations_doctor_id_fkey (
            name,
            specialty,
            image_url
          )
        `)
        .eq('woman_id', womanId)
        .order('scheduled_date', { ascending: false })
        .limit(5);

      // Fetch deliveries
      const { data: deliveries, error: delError } = await supabase
        .from('deliveries')
        .select('*')
        .eq('woman_id', womanId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch alerts
      const { data: alerts, error: alertError } = await supabase
        .from('alerts')
        .select('*')
        .eq('woman_id', womanId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get upcoming appointments
      const today = new Date().toISOString().split('T')[0];
      const { data: upcoming, error: upError } = await supabase
        .from('consultations')
        .select(`
          *,
          doctors!consultations_doctor_id_fkey (
            name,
            specialty
          )
        `)
        .eq('woman_id', womanId)
        .gte('scheduled_date', today)
        .in('status', ['pending', 'confirmed'])
        .order('scheduled_date', { ascending: true })
        .limit(3);

      // Calculate age from date of birth
      const calculateAge = (dob: string) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      };

      return {
        profile: {
          id: woman.id,
          full_name: woman.users?.full_name,
          email: woman.users?.email,
          phone: woman.users?.phone,
          date_of_birth: woman.date_of_birth,
          age: woman.date_of_birth ? calculateAge(woman.date_of_birth) : null,
          address: woman.address,
          village: woman.village,
          district: woman.district,
          risk_level: woman.risk_level,
          asha_worker_name: woman.asha_worker?.full_name,
          asha_worker_phone: woman.asha_worker?.phone
        },
        healthProfile: healthProfile || null,
        recentConsultations: consultations || [],
        recentDeliveries: deliveries || [],
        recentAlerts: alerts || [],
        upcomingAppointments: upcoming || [],
        statistics: {
          totalConsultations: consultations?.length || 0,
          totalDeliveries: deliveries?.length || 0,
          totalAlerts: alerts?.length || 0,
          lastCheckup: consultations?.[0]?.scheduled_date || 'Never'
        }
      };
    } catch (error) {
      console.error("Error fetching woman dashboard:", error);
      throw error;
    }
  },

  // Get list of all women (for admin to select)
  async getAllWomenList() {
    const { data, error } = await supabase
      .from('women')
      .select(`
        id,
        users!women_user_id_fkey (
          full_name,
          email,
          phone
        ),
        village,
        district,
        risk_level
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      id: item.id,
      full_name: item.users?.full_name,
      email: item.users?.email,
      phone: item.users?.phone,
      village: item.village,
      district: item.district,
      risk_level: item.risk_level
    }));
  }
};
