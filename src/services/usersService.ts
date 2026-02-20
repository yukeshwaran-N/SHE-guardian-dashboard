// src/services/usersService.ts
import { supabase, AppUser } from './supabase';

export const usersService = {
  // Get all registered users from the app
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')  // Using 'users' (plural) as per your SQL
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
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
    try {
      // First, try to get counts
      const { count: total, error: totalError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (totalError) throw totalError;

      // Get all data for other stats since count with filters might not work
      const { data, error } = await supabase
        .from('users')
        .select('has_completed_questionnaire, is_onboarding_complete, last_active');
      
      if (error) throw error;

      const activeToday = data?.filter(u => {
        if (!u.last_active) return false;
        const lastActive = new Date(u.last_active).toDateString();
        const today = new Date().toDateString();
        return lastActive === today;
      }).length || 0;

      return {
        total: total || 0,
        completedQuestionnaire: data?.filter(u => u.has_completed_questionnaire).length || 0,
        completedOnboarding: data?.filter(u => u.is_onboarding_complete).length || 0,
        activeToday: activeToday
      };
    } catch (error) {
      console.error("Error in getUserStats:", error);
      // Fallback: get all data and calculate manually
      const { data } = await supabase
        .from('users')
        .select('*');
      
      if (data) {
        return {
          total: data.length,
          completedQuestionnaire: data.filter(u => u.has_completed_questionnaire).length,
          completedOnboarding: data.filter(u => u.is_onboarding_complete).length,
          activeToday: data.filter(u => {
            if (!u.last_active) return false;
            const lastActive = new Date(u.last_active).toDateString();
            const today = new Date().toDateString();
            return lastActive === today;
          }).length
        };
      }
      
      return {
        total: 0,
        completedQuestionnaire: 0,
        completedOnboarding: 0,
        activeToday: 0
      };
    }
  },

  // Search users
  async searchUsers(searchTerm: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as AppUser[];
  }
};