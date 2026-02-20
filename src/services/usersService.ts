// src/services/usersService.ts
import { supabase } from './supabase';

export interface AppUser {
  id: string;
  auth_id: string;
  phone: string;
  email: string;
  full_name: string;
  date_of_birth: string;
  gender: 'female' | 'male' | 'other' | 'prefer_not_to_say';
  preferred_language: string;
  avatar_url: string;
  is_onboarding_complete: boolean;
  has_completed_questionnaire: boolean;
  last_active: string;
  created_at: string;
  updated_at: string;
}

export const usersService = {
  // Get all registered users from the app
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as AppUser[];
  },

  // Get user by ID
  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as AppUser;
  },

  // Get new users (last 7 days)
  async getNewUsers() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as AppUser[];
  },

  // Get users who completed questionnaire
  async getUsersWithCompletedQuestionnaire() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('has_completed_questionnaire', true);
    
    if (error) throw error;
    return data as AppUser[];
  },

  // Get users by language preference
  async getUsersByLanguage(language: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('preferred_language', language);
    
    if (error) throw error;
    return data as AppUser[];
  },

  // Get user statistics
  async getUserStats() {
    const { data: total, error: totalError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    const { data: completed, error: completedError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('has_completed_questionnaire', true);
    
    const { data: onboarding, error: onboardingError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_onboarding_complete', true);
    
    const { data: activeToday, error: activeError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_active', new Date().toISOString().split('T')[0]);
    
    if (totalError || completedError || onboardingError || activeError) {
      throw new Error('Error fetching user stats');
    }

    return {
      total: total?.length || 0,
      completedQuestionnaire: completed?.length || 0,
      completedOnboarding: onboarding?.length || 0,
      activeToday: activeToday?.length || 0
    };
  }
};