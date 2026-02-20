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
  order_id: string | null;
  woman_name: string | null;
  address: string | null;
  items: any | null;
  status: string | null;
  scheduled_date: string | null;
  delivery_partner: string | null;
  priority?: 'high' | 'medium' | 'low';
  contact?: string;
  requested_at?: string;
  delivered_at?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
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

// App User interface for mobile app users - matches your 'user' table
// In src/services/supabase.ts, make sure AppUser matches your table
export interface AppUser {
  id: string;
  auth_id: string | null;
  phone: string | null;
  email: string | null;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  preferred_language: string | null;
  avatar_url: string | null;
  is_onboarding_complete: boolean | null;
  has_completed_questionnaire: boolean | null;
  last_active: string | null;
  created_at: string | null;
  updated_at: string | null;
}