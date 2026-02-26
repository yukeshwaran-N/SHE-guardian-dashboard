// src/services/doctorsService.ts
import { supabase } from './supabase';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: string | null;
  rating: number | null;
  reviews_count: number | null;
  available: boolean | null;
  image_url: string | null;
  fee: number | null;
  languages: string[] | null;
  education: string | null;
  about: string | null;
  next_available: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  consultation_types: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}

export const doctorsService = {
  // Get all doctors
  async getAllDoctors() {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as Doctor[];
  },

  // Get doctor by ID
  async getDoctorById(id: string) {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Doctor;
  },

  // Create new doctor
  async createDoctor(doctor: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('doctors')
      .insert([doctor])
      .select();
    
    if (error) throw error;
    return data;
  },

  // Update doctor
  async updateDoctor(id: string, doctor: Partial<Doctor>) {
    const { data, error } = await supabase
      .from('doctors')
      .update(doctor)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Delete doctor
  async deleteDoctor(id: string) {
    const { error } = await supabase
      .from('doctors')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },

  // Toggle doctor availability
  async toggleAvailability(id: string, available: boolean) {
    const { data, error } = await supabase
      .from('doctors')
      .update({ available })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Get doctors by specialty
  async getDoctorsBySpecialty(specialty: string) {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('specialty', specialty)
      .order('name');
    
    if (error) throw error;
    return data as Doctor[];
  },

  // Get available doctors
  async getAvailableDoctors() {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('available', true)
      .order('name');
    
    if (error) throw error;
    return data as Doctor[];
  }
};