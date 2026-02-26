// src/services/usersService.ts
import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'delivery' | 'asha' | 'woman';
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export const usersService = {
  // Login user with email and password
  async login(email: string, password: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, full_name, phone, avatar_url, is_active')
      .eq('email', email)
      .eq('password', password)
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    return data as User;
  },

  // Get all users
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as User[];
  },

  // Get user by ID
  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as User;
  },

  // Update last login
  async updateLastLogin(id: string) {
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  },

  // Create new user (for registration)
  async createUser(userData: Partial<User> & { password: string }) {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: userData.email,
        password: userData.password,
        role: userData.role || 'woman',
        full_name: userData.full_name,
        phone: userData.phone,
        is_active: true
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  },

  // Update user
  async updateUser(id: string, userData: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update({
        full_name: userData.full_name,
        phone: userData.phone,
        avatar_url: userData.avatar_url,
        is_active: userData.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  },

  // Change password
  async changePassword(id: string, newPassword: string) {
    const { error } = await supabase
      .from('users')
      .update({ 
        password: newPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Deactivate user (soft delete)
  async deactivateUser(id: string) {
    const { error } = await supabase
      .from('users')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Activate user
  async activateUser(id: string) {
    const { error } = await supabase
      .from('users')
      .update({ 
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Get users by role
  async getUsersByRole(role: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .eq('is_active', true)
      .order('full_name');
    
    if (error) throw error;
    return data as User[];
  },

  // Search users
  async searchUsers(searchTerm: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      .order('full_name');
    
    if (error) throw error;
    return data as User[];
  }
};