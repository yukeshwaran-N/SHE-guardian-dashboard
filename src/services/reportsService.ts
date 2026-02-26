// src/services/reportsService.ts
import { supabase } from './supabase';

export interface ReportFilters {
  startDate: string;
  endDate: string;
  type?: 'all' | 'women' | 'deliveries' | 'consultations' | 'payments' | 'alerts';
}

export interface ReportData {
  summary: {
    totalWomen: number;
    newWomen: number;
    totalDeliveries: number;
    completedDeliveries: number;
    totalConsultations: number;
    completedConsultations: number;
    totalPayments: number;
    totalRevenue: number;
    totalAlerts: number;
    resolvedAlerts: number;
  };
  charts: {
    womenGrowth: { month: string; count: number }[];
    deliveriesByStatus: { status: string; count: number }[];
    consultationsByType: { type: string; count: number }[];
    paymentsByStatus: { status: string; amount: number }[];
    alertsBySeverity: { severity: string; count: number }[];
  };
  tables: {
    recentWomen: any[];
    recentDeliveries: any[];
    recentConsultations: any[];
    recentPayments: any[];
  };
}

export const reportsService = {
  // Generate comprehensive report
  async generateReport(filters: ReportFilters): Promise<ReportData> {
    try {
      // Fetch data based on filters
      const [
        women,
        deliveries,
        consultations,
        payments,
        alerts
      ] = await Promise.all([
        this.getWomenData(filters),
        this.getDeliveriesData(filters),
        this.getConsultationsData(filters),
        this.getPaymentsData(filters),
        this.getAlertsData(filters)
      ]);

      // Calculate summary
      const summary = {
        totalWomen: women.length,
        newWomen: women.filter(w => new Date(w.created_at) >= new Date(filters.startDate)).length,
        totalDeliveries: deliveries.length,
        completedDeliveries: deliveries.filter(d => d.status === 'delivered').length,
        totalConsultations: consultations.length,
        completedConsultations: consultations.filter(c => c.status === 'completed').length,
        totalPayments: payments.length,
        totalRevenue: payments
          .filter(p => p.status === 'success')
          .reduce((sum, p) => sum + p.amount, 0),
        totalAlerts: alerts.length,
        resolvedAlerts: alerts.filter(a => a.status === 'resolved').length
      };

      // Generate chart data
      const charts = {
        womenGrowth: await this.getWomenGrowthData(filters),
        deliveriesByStatus: this.getDeliveriesByStatus(deliveries),
        consultationsByType: this.getConsultationsByType(consultations),
        paymentsByStatus: this.getPaymentsByStatus(payments),
        alertsBySeverity: this.getAlertsBySeverity(alerts)
      };

      // Get recent data for tables
      const tables = {
        recentWomen: women.slice(0, 10),
        recentDeliveries: deliveries.slice(0, 10),
        recentConsultations: consultations.slice(0, 10),
        recentPayments: payments.slice(0, 10)
      };

      return { summary, charts, tables };
    } catch (error) {
      console.error("Error generating report:", error);
      throw error;
    }
  },

  // Get women data
  async getWomenData(filters: ReportFilters) {
    let query = supabase
      .from('women')
      .select(`
        *,
        users!women_user_id_fkey (
          full_name,
          email,
          phone
        )
      `);

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Get deliveries data
  async getDeliveriesData(filters: ReportFilters) {
    let query = supabase
      .from('deliveries')
      .select(`
        *,
        women!deliveries_woman_id_fkey (
          users!women_user_id_fkey (
            full_name
          )
        )
      `);

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Get consultations data
  async getConsultationsData(filters: ReportFilters) {
    let query = supabase
      .from('consultations')
      .select(`
        *,
        women!consultations_woman_id_fkey (
          users!women_user_id_fkey (
            full_name
          )
        ),
        doctors!consultations_doctor_id_fkey (
          name,
          specialty
        )
      `);

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Get payments data
  async getPaymentsData(filters: ReportFilters) {
    let query = supabase
      .from('payments')
      .select(`
        *,
        users!payments_user_id_fkey (
          full_name,
          email
        )
      `);

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Get alerts data
  async getAlertsData(filters: ReportFilters) {
    let query = supabase
      .from('alerts')
      .select(`
        *,
        women!alerts_woman_id_fkey (
          users!women_user_id_fkey (
            full_name
          )
        )
      `);

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Get women growth data for charts
  async getWomenGrowthData(filters: ReportFilters) {
    const months = [];
    const currentDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);

    while (currentDate <= endDate) {
      const month = currentDate.toLocaleString('default', { month: 'short' });
      const year = currentDate.getFullYear();
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const { count, error } = await supabase
        .from('women')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      if (error) throw error;

      months.push({
        month: `${month} ${year}`,
        count: count || 0
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  },

  // Helper: Group deliveries by status
  getDeliveriesByStatus(deliveries: any[]) {
    const statuses = ['pending', 'assigned', 'in-transit', 'delivered', 'cancelled'];
    return statuses.map(status => ({
      status,
      count: deliveries.filter(d => d.status === status).length
    }));
  },

  // Helper: Group consultations by type
  getConsultationsByType(consultations: any[]) {
    const types = ['video', 'voice', 'chat'];
    return types.map(type => ({
      type,
      count: consultations.filter(c => c.consultation_type === type).length
    }));
  },

  // Helper: Group payments by status
  getPaymentsByStatus(payments: any[]) {
    const statuses = ['pending', 'success', 'failed', 'refunded'];
    return statuses.map(status => ({
      status,
      amount: payments
        .filter(p => p.status === status)
        .reduce((sum, p) => sum + p.amount, 0)
    }));
  },

  // Helper: Group alerts by severity
  getAlertsBySeverity(alerts: any[]) {
    const severities = ['low', 'medium', 'high'];
    return severities.map(severity => ({
      severity,
      count: alerts.filter(a => a.severity === severity).length
    }));
  },

  // Export report as CSV
  exportToCSV(data: any[], filename: string) {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    ).join('\n');

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
};