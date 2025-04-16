import { supabase } from './supabaseClient';
import { Playlist } from '../types/playlist.types';

export type CreatePlaylistData = Pick<Playlist, 'name' | 'mundo_id'>;

export type UpdatePlaylistData = Pick<Playlist, 'name' | 'description' | 'is_active' | 'order_index'>;

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
  console.log('[createPlaylist] Servicio recibido:', { playlistData, userId });
  
  const insertData = {
    name: playlistData.name,
    mundo_id: playlistData.mundo_id,
    description: '', // Default
    order_index: 0,  // Default
    is_active: true, // Default
    created_by: userId
  };
  console.log('[createPlaylist] Intentando insertar:', insertData);

  const { data, error } = await supabase
    .from('playlists')
    .insert([insertData])
    .select()
    .single();

  if (error) {
    console.error('[createPlaylist] Error Supabase:', {
      error,
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw error;
  }

  console.log('[createPlaylist] Éxito Supabase:', data);
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

export const fetchPlaylistById = async (id: string): Promise<Playlist> => {
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching playlist by ID:', error);
    throw error;
  }

  return data;
};

export const updatePlaylist = async (id: string, playlistData: UpdatePlaylistData): Promise<Playlist> => {
  console.log('Updating playlist with data:', { id, ...playlistData });

  const { data, error } = await supabase
    .from('playlists')
    .update({
      ...playlistData,
      updated_at: new Date().toISOString()
    })
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
    throw new Error('No se pudo actualizar la playlist');
  }

  return data;
}; 