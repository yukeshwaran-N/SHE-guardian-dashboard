// src/services/ashaDashboardService.ts
import { supabase } from './supabase';

export interface ASHADashboardData {
  profile: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    sector: string;
    village: string;
    district: string;
    qualification: string;
    experience_years: number;
    joining_date: string;
    status: string;
    performance_rating: number;
  };
  stats: {
    assignedWomen: number;
    totalVisits: number;
    successfulVisits: number;
    pendingVisits: number;
    highRiskWomen: number;
    completedToday: number;
  };
  assignedWomen: any[];
  upcomingVisits: any[];
  recentAlerts: any[];
  recentDeliveries: any[];
  performance: {
    monthlyVisits: { month: string; count: number }[];
    riskDistribution: { level: string; count: number }[];
  };
}

export const ashaDashboardService = {
  // Get ASHA worker dashboard data
  async getASHADashboard(ashaUserId: string) {
    try {
      // Get ASHA worker profile
      const { data: asha, error: ashaError } = await supabase
        .from('asha_workers')
        .select(`
          *,
          users!asha_workers_user_id_fkey (
            full_name,
            email,
            phone
          )
        `)
        .eq('user_id', ashaUserId)
        .single();
      
      if (ashaError) throw ashaError;

      // Get assigned women
      const { data: women, error: womenError } = await supabase
        .from('women')
        .select(`
          *,
          users!women_user_id_fkey (
            full_name,
            phone
          )
        `)
        .eq('asha_worker_id', asha.user_id)
        .order('risk_level', { ascending: false });
      
      if (womenError) throw womenError;

      // Get visits
      const { data: visits, error: visitsError } = await supabase
        .from('visits')
        .select('*')
        .eq('asha_worker_id', asha.user_id)
        .order('visit_date', { ascending: false });
      
      if (visitsError) throw visitsError;

      // Get upcoming visits (next 7 days)
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const { data: upcoming, error: upcomingError } = await supabase
        .from('visits')
        .select(`
          *,
          women!visits_woman_id_fkey (
            users!women_user_id_fkey (
              full_name,
              phone
            ),
            address,
            village,
            risk_level
          )
        `)
        .eq('asha_worker_id', asha.user_id)
        .gte('visit_date', today)
        .lte('visit_date', nextWeek.toISOString().split('T')[0])
        .order('visit_date', { ascending: true });
      
      if (upcomingError) throw upcomingError;

      // Get alerts for assigned women
      const womanIds = women.map(w => w.id);
      const { data: alerts, error: alertsError } = await supabase
        .from('alerts')
        .select(`
          *,
          women!alerts_woman_id_fkey (
            users!women_user_id_fkey (
              full_name
            )
          )
        `)
        .in('woman_id', womanIds)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (alertsError) throw alertsError;

      // Get deliveries for assigned women
      const { data: deliveries, error: deliveriesError } = await supabase
        .from('deliveries')
        .select(`
          *,
          women!deliveries_woman_id_fkey (
            users!women_user_id_fkey (
              full_name
            )
          )
        `)
        .in('woman_id', womanIds)
        .order('scheduled_date', { ascending: true })
        .limit(5);
      
      if (deliveriesError) throw deliveriesError;

      // Calculate stats
      const stats = {
        assignedWomen: women.length,
        totalVisits: visits.length,
        successfulVisits: visits.filter(v => v.status === 'completed').length,
        pendingVisits: visits.filter(v => v.status === 'scheduled').length,
        highRiskWomen: women.filter(w => w.risk_level === 'high').length,
        completedToday: visits.filter(v => 
          v.visit_date === today && v.status === 'completed'
        ).length
      };

      // Monthly visits for chart
      const monthlyVisits = this.getMonthlyVisits(visits);

      // Risk distribution
      const riskDistribution = [
        { level: 'High', count: women.filter(w => w.risk_level === 'high').length },
        { level: 'Medium', count: women.filter(w => w.risk_level === 'medium').length },
        { level: 'Low', count: women.filter(w => w.risk_level === 'low').length }
      ];

      return {
        profile: {
          id: asha.id,
          full_name: asha.users?.full_name,
          email: asha.users?.email,
          phone: asha.users?.phone,
          sector: asha.sector,
          village: asha.village,
          district: asha.district,
          qualification: asha.qualification,
          experience_years: asha.experience_years,
          joining_date: asha.joining_date,
          status: asha.status,
          performance_rating: asha.performance_rating
        },
        stats,
        assignedWomen: women,
        upcomingVisits: upcoming || [],
        recentAlerts: alerts || [],
        recentDeliveries: deliveries || [],
        performance: {
          monthlyVisits,
          riskDistribution
        }
      };
    } catch (error) {
      console.error("Error fetching ASHA dashboard:", error);
      throw error;
    }
  },

  // Get monthly visits for chart
  getMonthlyVisits(visits: any[]) {
    const months: { [key: string]: number } = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    visits.forEach(visit => {
      const date = new Date(visit.visit_date);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      months[monthKey] = (months[monthKey] || 0) + 1;
    });

    return Object.entries(months).map(([month, count]) => ({
      month,
      count
    })).slice(-6); // Last 6 months
  },

  // Schedule a new visit
  async scheduleVisit(visitData: any) {
    const { data, error } = await supabase
      .from('visits')
      .insert([{
        asha_worker_id: visitData.asha_worker_id,
        woman_id: visitData.woman_id,
        visit_date: visitData.visit_date,
        visit_time: visitData.visit_time,
        visit_type: visitData.visit_type || 'scheduled',
        notes: visitData.notes,
        status: 'scheduled'
      }])
      .select();
    
    if (error) throw error;
    return data;
  },

  // Complete a visit
  async completeVisit(visitId: string, notes: string, healthObservations: string, nextVisitDate?: string) {
    const { data, error } = await supabase
      .from('visits')
      .update({
        status: 'completed',
        notes,
        health_observations: healthObservations,
        next_visit_date: nextVisitDate,
        completed_at: new Date().toISOString()
      })
      .eq('id', visitId)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Update woman's health record
  async updateHealthRecord(womanId: string, healthData: any) {
    const { data, error } = await supabase
      .from('health_profiles')
      .upsert({
        woman_id: womanId,
        ...healthData,
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) throw error;
    return data;
  },

  // Get woman details
  async getWomanDetails(womanId: string) {
    const { data, error } = await supabase
      .from('women')
      .select(`
        *,
        users!women_user_id_fkey (
          full_name,
          email,
          phone
        ),
        health_profiles(*),
        visits(
          *,
          asha_worker:users!visits_asha_worker_id_fkey (
            full_name
          )
        )
      `)
      .eq('id', womanId)
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      full_name: data.users?.full_name,
      email: data.users?.email,
      phone: data.users?.phone
    };
  }
};