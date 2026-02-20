// src/services/deliveriesService.ts
import { supabase, Delivery } from './supabase';

export const deliveriesService = {
  // Get all deliveries
  async getAllDeliveries() {
    const { data, error } = await supabase
      .from('deliveries')
      .select('*')
      .order('scheduled_date');
    
    if (error) throw error;
    return data as Delivery[];
  },

  // Get deliveries by status
  async getDeliveriesByStatus(status: Delivery['status']) {
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

  // Update delivery status
  async updateDeliveryStatus(id: string, status: Delivery['status']) {
    const { data, error } = await supabase
      .from('deliveries')
      .update({ status })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  }
};