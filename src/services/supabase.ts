// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://prehnmkmjyqmfqchminm.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_XghgLuqgG7OUkqnrBT3tDg_7kAsMkYd";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);