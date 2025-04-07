import { supabase } from './supabaseClient';
import { Playlist } from '../types/playlist.types';

export type CreatePlaylistData = Pick<Playlist, 'name' | 'mundo_id'>;

export const fetchPlaylists = async (): Promise<Playlist[]> => {
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .order('mundo_id', { ascending: true })
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching playlists:', error);
    throw error;
  }

  return data || [];
};

export const createPlaylist = async (playlistData: CreatePlaylistData, userId: string): Promise<Playlist> => {
  console.log('Creando playlist con user ID:', userId);

  const { data, error } = await supabase
    .from('playlists')
    .insert([{
      name: playlistData.name,
      mundo_id: playlistData.mundo_id,
      description: '', // Valor por defecto
      order_index: 0,  // Valor por defecto
      is_active: true, // Valor por defecto
      created_by: userId
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating playlist:', error);
    throw error;
  }

  return data;
};

export const updatePlaylistStatus = async (id: string, isActive: boolean): Promise<Playlist> => {
  const { data, error } = await supabase
    .from('playlists')
    .update({ 
      is_active: isActive, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating playlist status:', error);
    throw error;
  }

  return data;
};

export const deletePlaylist = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting playlist:', error);
    throw error;
  }
}; 