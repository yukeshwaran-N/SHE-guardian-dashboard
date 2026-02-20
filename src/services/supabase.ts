// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://prehnmkmjyqmfqchminm.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_XghgLuqgG7OUkqnrBT3tDg_7kAsMkYd";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Alert {
  id: string;
  woman_name: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  location: string;
  status: 'active' | 'resolved';
}

export interface Woman {
  id: string;
  name: string;
  age: number;
  phone: string;
  address: string;
  asha_worker: string;
  last_visit: string;
  status: 'active' | 'inactive' | 'high-risk';
}

export interface Delivery {
  id: string;
  order_id: string;
  woman_name: string;
  address: string;
  items: string[];
  status: 'pending' | 'assigned' | 'in-transit' | 'delivered' | 'cancelled';
  scheduled_date: string;
  delivery_partner?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  threshold: number;
  last_restocked: string;
}