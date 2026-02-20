// src/services/deliveriesService.ts
import { supabase, Delivery } from './supabase';

export const deliveriesService = {
  // Get all deliveries
  async getAllDeliveries() {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*');
    
    if (error) {
      console.error("Error fetching deliveries:", error);
      throw error;
    }
    return data as Delivery[];
  },

  // Get delivery by ID
  async getDeliveryById(id: string) {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Delivery;
  },

  // Get deliveries by status
  async getDeliveriesByStatus(status: string) {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('status', status);
    
    if (error) throw error;
    return data as Delivery[];
  },

  // Get deliveries for specific partner
  async getDeliveriesByPartner(partnerId: string) {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .eq('delivery_partner', partnerId);
    
    if (error) throw error;
    return data as Delivery[];
  },

  // Create new delivery
  async createDelivery(delivery: Partial<Delivery>) {
    // Generate a new ID if not provided
    const newDelivery = {
      id: delivery.id || `DEL${Date.now()}`,
      order_id: delivery.order_id || null,
      woman_name: delivery.woman_name || null,
      address: delivery.address || null,
      items: delivery.items || null,
      status: delivery.status || 'pending',
      scheduled_date: delivery.scheduled_date || null,
      delivery_partner: delivery.delivery_partner || null,
      ...delivery
    };

    const { data, error } = await supabase
      .from('deliveries')
      .insert([newDelivery])
      .select();
    
    if (error) throw error;
    return data?.[0] as Delivery;
  },

  // Update delivery
  async updateDelivery(id: string, updates: Partial<Delivery>) {
    const { data, error } = await supabase
      .from('deliveries')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data?.[0] as Delivery;
  },

  // Update delivery status
  async updateDeliveryStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('deliveries')
      .update({ status })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data?.[0] as Delivery;
  },

  // Assign delivery to partner
  async assignDelivery(id: string, partnerId: string) {
    const { data, error } = await supabase
      .from('deliveries')
      .update({ 
        delivery_partner: partnerId,
        status: 'assigned'
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data?.[0] as Delivery;
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

  // Get delivery statistics
  async getDeliveryStats() {
    const { data: allDeliveries, error } = await supabase
      .from('deliveries')
      .select('status');
    
    if (error) throw error;
    
    const stats = {
      total: allDeliveries.length,
      delivered: allDeliveries.filter(d => d.status === 'delivered').length,
      inTransit: allDeliveries.filter(d => d.status === 'in-transit').length,
      pending: allDeliveries.filter(d => d.status === 'pending' || d.status === 'assigned').length,
      // Note: priority doesn't exist in your schema, so we'll set to 0
      highPriority: 0
    };
    
    return stats;
  },

  // Search deliveries
  async searchDeliveries(searchTerm: string) {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .or(`woman_name.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%,order_id.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
    
    if (error) throw error;
    return data as Delivery[];
  }
};