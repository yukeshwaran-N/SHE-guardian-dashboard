// src/services/womenService.ts
import { supabase, Woman } from './supabase';

export const womenService = {
  // Get all women
  async getAllWomen() {
    const { data, error } = await supabase
      .from('women')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    // Transform data to match UI expectations
    const transformedData = data.map(woman => ({
      ...woman,
      // Add computed fields if needed
      village: woman.address ? extractVillage(woman.address) : 'N/A',
      risk: getRiskFromStatus(woman.status),
      last_report: woman.last_visit
    }));
    
    return transformedData as Woman[];
  },

  // Get woman by ID
  async getWomanById(id: string) {
    const { data, error } = await supabase
      .from('women')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Woman;
  },

  // Get high-risk women
  async getHighRiskWomen() {
    const { data, error } = await supabase
      .from('women')
      .select('*')
      .eq('status', 'high-risk');
    
    if (error) throw error;
    return data as Woman[];
  },

  // Update woman status
  async updateWomanStatus(id: string, status: Woman['status']) {
    const { data, error } = await supabase
      .from('women')
      .update({ status })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Search women
  async searchWomen(searchTerm: string) {
    const { data, error } = await supabase
      .from('women')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      .order('name');
    
    if (error) throw error;
    return data as Woman[];
  }
};

// Helper functions
function extractVillage(address: string): string {
  if (!address) return 'N/A';
  
  const sectorMatch = address.match(/Sector\s+(\d+)/i);
  if (sectorMatch) return `Sector ${sectorMatch[1]}`;
  
  const blockMatch = address.match(/Block\s+([A-Z])/i);
  if (blockMatch) return `Block ${blockMatch[1]}`;
  
  const villageMatch = address.match(/Village\s+([^,]+)/i);
  if (villageMatch) return villageMatch[1].trim();
  
  // Return last part of address
  const parts = address.split(',');
  return parts[parts.length - 1]?.trim() || 'N/A';
}

function getRiskFromStatus(status: string): string {
  switch(status) {
    case 'high-risk': return 'High';
    case 'active': return 'Low';
    case 'inactive': return 'None';
    default: return 'Unknown';
  }
}