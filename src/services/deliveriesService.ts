// src/services/deliveriesService.ts
import { supabase } from './supabase';

export interface Delivery {
  id: string;
  order_number: string;
  woman_id: string;
  woman_name?: string;
  woman_phone?: string;
  woman_address?: string;
  delivery_partner_id: string | null;
  delivery_partner_name?: string;
  items: any[];
  total_amount: number | null;
  status: 'pending' | 'assigned' | 'in-transit' | 'delivered' | 'cancelled';
  scheduled_date: string | null;
  delivered_date: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const deliveriesService = {
  // Get all deliveries
  async getAllDeliveries() {
    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        women!deliveries_woman_id_fkey (
          users!women_user_id_fkey (
            full_name,
            phone
          ),
          address,
          village,
          district
        ),
        partner:users!deliveries_delivery_partner_id_fkey (
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
      woman_address: item.women?.address || `${item.women?.village || ''}, ${item.women?.district || ''}`,
      delivery_partner_name: item.partner?.full_name
    })) as Delivery[];
  },

  // Get deliveries for a specific delivery partner
  async getDeliveriesByPartner(partnerId: string) {
    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        women!deliveries_woman_id_fkey (
          users!women_user_id_fkey (
            full_name,
            phone
          ),
          address,
          village,
          district,
          latitude,
          longitude
        )
      `)
      .eq('delivery_partner_id', partnerId)
      .order('scheduled_date', { ascending: true });
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      ...item,
      woman_name: item.women?.users?.full_name,
      woman_phone: item.women?.users?.phone,
      woman_address: item.women?.address || `${item.women?.village || ''}, ${item.women?.district || ''}`,
      latitude: item.women?.latitude,
      longitude: item.women?.longitude
    })) as Delivery[];
  },

  // Get delivery by ID
  async getDeliveryById(id: string) {
    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        women!deliveries_woman_id_fkey (
          users!women_user_id_fkey (
            full_name,
            phone
          ),
          address,
          village,
          district,
          latitude,
          longitude
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      ...data,
      woman_name: data.women?.users?.full_name,
      woman_phone: data.women?.users?.phone,
      woman_address: data.women?.address || `${data.women?.village || ''}, ${data.women?.district || ''}`,
      latitude: data.women?.latitude,
      longitude: data.women?.longitude
    } as Delivery;
  },

  // Create new delivery
  async createDelivery(deliveryData: any) {
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const { data, error } = await supabase
      .from('deliveries')
      .insert([{
        order_number: orderNumber,
        woman_id: deliveryData.woman_id,
        delivery_partner_id: deliveryData.delivery_partner_id,
        items: deliveryData.items || [],
        total_amount: deliveryData.total_amount,
        status: deliveryData.status || 'pending',
        scheduled_date: deliveryData.scheduled_date,
        address: deliveryData.address,
        notes: deliveryData.notes
      }])
      .select();
    
    if (error) throw error;
    return data;
  },

  // Update delivery
  async updateDelivery(id: string, deliveryData: any) {
    const { data, error } = await supabase
      .from('deliveries')
      .update({
        delivery_partner_id: deliveryData.delivery_partner_id,
        items: deliveryData.items,
        total_amount: deliveryData.total_amount,
        scheduled_date: deliveryData.scheduled_date,
        address: deliveryData.address,
        notes: deliveryData.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Update delivery status
  async updateStatus(id: string, status: string) {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    // If status is delivered, set delivered date
    if (status === 'delivered') {
      updateData.delivered_date = new Date().toISOString().split('T')[0];
    }

    const { data, error } = await supabase
      .from('deliveries')
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Assign delivery to partner
  async assignDelivery(id: string, partnerId: string) {
    const { data, error } = await supabase
      .from('deliveries')
      .update({
        delivery_partner_id: partnerId,
        status: 'assigned',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Delete delivery
  async deleteDelivery(id: string) {
    const { error } = await supabase
      .from('deliveries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Get deliveries by status
  async getDeliveriesByStatus(status: string) {
    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        women!deliveries_woman_id_fkey (
          users!women_user_id_fkey (
            full_name,
            phone
          ),
          address,
          village,
          district
        )
      `)
      .eq('status', status)
      .order('scheduled_date', { ascending: true });
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      ...item,
      woman_name: item.women?.users?.full_name,
      woman_phone: item.women?.users?.phone,
      woman_address: item.women?.address || `${item.women?.village || ''}, ${item.women?.district || ''}`
    })) as Delivery[];
  },

  // Get delivery statistics
  async getDeliveryStats() {
    const { data: pending, error: pendingError } = await supabase
      .from('deliveries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    
    const { data: assigned, error: assignedError } = await supabase
      .from('deliveries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'assigned');
    
    const { data: inTransit, error: transitError } = await supabase
      .from('deliveries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in-transit');
    
    const { data: delivered, error: deliveredError } = await supabase
      .from('deliveries')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'delivered');
    
    if (pendingError || assignedError || transitError || deliveredError) {
      throw pendingError || assignedError || transitError || deliveredError;
    }
    
    return {
      pending: pending?.length || 0,
      assigned: assigned?.length || 0,
      inTransit: inTransit?.length || 0,
      delivered: delivered?.length || 0,
      total: (pending?.length || 0) + (assigned?.length || 0) + 
             (inTransit?.length || 0) + (delivered?.length || 0)
    };
  },

  // Get today's deliveries
  async getTodaysDeliveries() {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        *,
        women!deliveries_woman_id_fkey (
          users!women_user_id_fkey (
            full_name,
            phone
          ),
          address,
          village,
          district
        )
      `)
      .eq('scheduled_date', today)
      .order('scheduled_date', { ascending: true });
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      ...item,
      woman_name: item.women?.users?.full_name,
      woman_phone: item.women?.users?.phone,
      woman_address: item.women?.address || `${item.women?.village || ''}, ${item.women?.district || ''}`
    })) as Delivery[];
  }
};