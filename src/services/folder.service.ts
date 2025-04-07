import { supabase } from './supabaseClient';
import { PlaylistFolder } from '../types/folder.types';

export type CreateFolderData = {
  name: string;
  mundo_id: string;
};

export const fetchFolders = async (mundoId: string): Promise<PlaylistFolder[]> => {
  const { data, error } = await supabase
    .from('playlist_folders')
    .select('*')
    .eq('mundo_id', mundoId)
    .eq('is_deleted', false)
    .order('is_pinned', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching folders:', error);
    throw error;
  }

  return data || [];
};

export const createFolder = async (folderData: CreateFolderData, userId: string): Promise<PlaylistFolder> => {
  console.log('Creando carpeta con user ID:', userId);

  const { data, error } = await supabase
    .from('playlist_folders')
    .insert([{
      name: folderData.name,
      mundo_id: folderData.mundo_id,
      order_index: 0,
      is_pinned: false,
      is_deleted: false,
      created_by: userId
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating folder:', error);
    throw error;
  }

  return data;
};

export const updateFolderPinStatus = async (id: string, isPinned: boolean): Promise<PlaylistFolder> => {
  const { data, error } = await supabase
    .from('playlist_folders')
    .update({ 
      is_pinned: isPinned, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating folder pin status:', error);
    throw error;
  }

  return data;
};

export const softDeleteFolder = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('playlist_folders')
    .update({ 
      is_deleted: true, 
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error soft deleting folder:', error);
    throw error;
  }
};

export const updateFolderName = async (id: string, name: string): Promise<PlaylistFolder> => {
  const { data, error } = await supabase
    .from('playlist_folders')
    .update({ 
      name: name, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating folder name:', error);
    throw error;
  }

  return data;
}; 