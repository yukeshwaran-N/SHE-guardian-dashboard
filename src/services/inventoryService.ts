// src/services/inventoryService.ts
import { supabase } from './supabase';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  quantity: number;
  unit: string | null;
  threshold: number | null;
  price: number | null;
  image_url: string | null;
  is_active: boolean;
  last_restocked: string | null;
  created_at: string;
  updated_at: string;
}

export const inventoryService = {
  // Get all inventory items
  async getAllItems() {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as InventoryItem[];
  },

  // Get active inventory items
  async getActiveItems() {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data as InventoryItem[];
  },

  // Get item by ID
  async getItemById(id: string) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as InventoryItem;
  },

  // Create new item
  async createItem(itemData: any) {
    const { data, error } = await supabase
      .from('inventory')
      .insert([{
        name: itemData.name,
        category: itemData.category,
        description: itemData.description,
        quantity: itemData.quantity || 0,
        unit: itemData.unit,
        threshold: itemData.threshold || 10,
        price: itemData.price,
        image_url: itemData.image_url,
        is_active: true,
        last_restocked: itemData.last_restocked || new Date().toISOString().split('T')[0]
      }])
      .select();
    
    if (error) throw error;
    return data;
  },

  // Update item
  async updateItem(id: string, itemData: any) {
    const { data, error } = await supabase
      .from('inventory')
      .update({
        name: itemData.name,
        category: itemData.category,
        description: itemData.description,
        quantity: itemData.quantity,
        unit: itemData.unit,
        threshold: itemData.threshold,
        price: itemData.price,
        image_url: itemData.image_url,
        is_active: itemData.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Update quantity (add or remove stock)
  async updateQuantity(id: string, newQuantity: number) {
    const { data, error } = await supabase
      .from('inventory')
      .update({
        quantity: newQuantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Restock item (add to quantity)
  async restockItem(id: string, additionalQuantity: number) {
    // First get current quantity
    const item = await this.getItemById(id);
    const newQuantity = (item.quantity || 0) + additionalQuantity;
    
    const { data, error } = await supabase
      .from('inventory')
      .update({
        quantity: newQuantity,
        last_restocked: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Delete item (soft delete by setting is_active to false)
  async deleteItem(id: string) {
    const { error } = await supabase
      .from('inventory')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Permanently delete item (hard delete)
  async permanentDelete(id: string) {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Get items by category
  async getItemsByCategory(category: string) {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('name');
    
    if (error) throw error;
    return data as InventoryItem[];
  },

  // Get low stock items (quantity <= threshold)
  async getLowStockItems() {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('is_active', true)
      .lte('quantity', 'threshold') // This requires a raw query or RPC
      .order('quantity');
    
    // Alternative: Fetch all and filter in code
    if (error) throw error;
    
    const allItems = data as InventoryItem[];
    return allItems.filter(item => 
      item.quantity <= (item.threshold || 10)
    );
  },

  // Get inventory statistics
  async getInventoryStats() {
    const { data: total, error: totalError } = await supabase
      .from('inventory')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    const { data: totalValue, error: valueError } = await supabase
      .from('inventory')
      .select('quantity, price')
      .eq('is_active', true);
    
    const { data: lowStock, error: lowStockError } = await supabase
      .from('inventory')
      .select('*')
      .eq('is_active', true);
    
    if (totalError || valueError || lowStockError) {
      throw totalError || valueError || lowStockError;
    }
    
    // Calculate total inventory value
    let totalInventoryValue = 0;
    if (totalValue) {
      totalInventoryValue = totalValue.reduce((sum, item) => 
        sum + ((item.quantity || 0) * (item.price || 0)), 0
      );
    }
    
    // Calculate low stock count
    const lowStockCount = lowStock 
      ? lowStock.filter(item => item.quantity <= (item.threshold || 10)).length
      : 0;
    
    // Get unique categories
    const categories = lowStock 
      ? [...new Set(lowStock.map(item => item.category))]
      : [];
    
    return {
      totalItems: total?.length || 0,
      totalValue: totalInventoryValue,
      lowStock: lowStockCount,
      categories: categories.length
    };
  },

  // Get all categories
  async getCategories() {
    const { data, error } = await supabase
      .from('inventory')
      .select('category')
      .eq('is_active', true);
    
    if (error) throw error;
    
    const categories = [...new Set(data.map(item => item.category))];
    return categories.sort();
  }
};