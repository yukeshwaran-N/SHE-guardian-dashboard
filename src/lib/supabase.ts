// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://prehnmkmjyqmfqchminm.supabase.co";
const supabaseAnonKey = "sb_publishable_XghgLuqgG7OUkqnrBT3tDg_7kAsMkYd";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);