import { supabase } from './supabaseClient';
import { Mundo } from '../types/mundo.types';
import { useAuthStore } from '../store/authStore';

export const fetchMundos = async (): Promise<Mundo[]> => {
  const { data, error } = await supabase
    .from('mundos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return [];
  }

  return data as Mundo[];
};

type CreateMundoData = Pick<Mundo, 'name' | 'description' | 'is_active'>;
type UpdateMundoData = CreateMundoData;

export const createMundo = async (mundoData: CreateMundoData, userId: string): Promise<Mundo> => {
  console.log('Creando mundo con user ID:', userId);

  const { data, error } = await supabase
    .from('mundos')
    .insert([{ ...mundoData, created_by: userId }])
    .select()
    .single();

  if (error) {
    console.error('Supabase error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }

  if (!data) {
    throw new Error('No se pudo crear el mundo');
  }

  return data as Mundo;
};

export const updateMundo = async (id: string, mundoData: UpdateMundoData): Promise<Mundo> => {
  console.log('Updating mundo with data:', { id, ...mundoData });

  const { data, error } = await supabase
    .from('mundos')
    .update(mundoData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Supabase error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }

  if (!data) {
    throw new Error('No se pudo actualizar el mundo');
  }

  return data as Mundo;
};

export const deleteMundo = async (id: string): Promise<void> => {
  console.log('Deleting mundo:', id);

  const { error } = await supabase
    .from('mundos')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }
}; 