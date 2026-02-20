// src/services/inventoryService.ts
import { supabase, InventoryItem } from './supabase';

export const inventoryService = {
  // Get all inventory items
  async getAllInventory() {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as InventoryItem[];
  },

  // Get low stock items
  async getLowStockItems() {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .where('quantity <= threshold');
    
    if (error) throw error;
    return data as InventoryItem[];
  },

  // Update inventory quantity
  async updateQuantity(id: string, quantity: number) {
    const { data, error } = await supabase
      .from('inventory')
      .update({ quantity })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  }
};