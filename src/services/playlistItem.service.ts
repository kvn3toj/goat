import { supabase } from './supabaseClient';
import { PlaylistItem } from '../types/playlistItem.types';

export const fetchPlaylistItems = async (playlistId: string): Promise<PlaylistItem[]> => {
  const { data, error } = await supabase
    .from('playlist_items')
    .select('*')
    .eq('playlist_id', playlistId)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching playlist items:', error);
    throw error;
  }

  return data || [];
};

export const createPlaylistItem = async (
  itemData: {
    playlist_id: string;
    content: string;
    item_type?: string;
    order_index?: number;
    created_by: string;
    title?: string;
    description?: string;
  }
): Promise<PlaylistItem> => {
  console.log('[createPlaylistItem] Iniciando creación:', itemData);

  // Obtener el máximo order_index usando agregación SQL
  const { data: maxOrderResult, error: maxOrderError } = await supabase
    .from('playlist_items')
    .select('max_order:order_index')
    .eq('playlist_id', itemData.playlist_id)
    .then(result => {
      // Transformar el resultado para manejar el caso de playlist vacía
      return {
        data: result.data?.[0]?.max_order ?? -1,
        error: result.error
      };
    });

  if (maxOrderError) {
    console.error('[createPlaylistItem] Error getting max order_index:', maxOrderError);
    throw maxOrderError;
  }

  // El nuevo order_index será el máximo actual + 1
  const nextOrderIndex = (maxOrderResult as number) + 1;
  console.log('[createPlaylistItem] Siguiente order_index:', nextOrderIndex);

  const { data, error } = await supabase
    .from('playlist_items')
    .insert([
      {
        playlist_id: itemData.playlist_id,
        content: itemData.content,
        item_type: itemData.item_type || 'video_embed',
        order_index: nextOrderIndex,
        created_by: itemData.created_by,
        title: itemData.title || 'Video sin título',
        description: itemData.description || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('[createPlaylistItem] Error creating playlist item:', error);
    throw error;
  }

  console.log('[createPlaylistItem] Item creado exitosamente:', data);
  return data;
};

export const fetchPlaylistItemById = async (itemId: string): Promise<PlaylistItem> => {
  const { data, error } = await supabase
    .from('playlist_items')
    .select('*')
    .eq('id', itemId)
    .single();

  if (error) {
    console.error('Error fetching playlist item:', error);
    throw error;
  }

  return data;
};

export const deletePlaylistItem = async (id: string): Promise<void> => {
  console.log('Deleting playlist item:', id);
  const { error } = await supabase
    .from('playlist_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting playlist item:', error);
    throw error;
  }
};

export interface UpdateItemDetailsData {
  title?: string;
  description?: string;
}

export const updatePlaylistItemDetails = async (id: string, itemData: UpdateItemDetailsData): Promise<PlaylistItem> => {
  console.log('[playlistItem.service] updatePlaylistItemDetails: Iniciando actualización:', {
    id,
    itemData,
    timestamp: new Date().toISOString()
  });

  const dataToUpdate = { 
    ...itemData, 
    updated_at: new Date().toISOString() 
  };

  console.log('[playlistItem.service] updatePlaylistItemDetails: Datos a actualizar:', dataToUpdate);

  try {
    const { data, error } = await supabase
      .from('playlist_items')
      .update(dataToUpdate)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[playlistItem.service] updatePlaylistItemDetails: Error de Supabase:', {
        error,
        errorMessage: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log('[playlistItem.service] updatePlaylistItemDetails: Actualización exitosa:', {
      data,
      timestamp: new Date().toISOString()
    });

    return data;
  } catch (error) {
    console.error('[playlistItem.service] updatePlaylistItemDetails: Error inesperado:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

export const updatePlaylistItemOrder = async (itemId: string, direction: 'up' | 'down'): Promise<{ message?: string }> => {
  console.log(`[updateOrder] Iniciando para item ${itemId}, dirección ${direction}`);

  // 1. Obtener item actual
  const { data: currentItem, error: fetchCurrentError } = await supabase
    .from('playlist_items')
    .select('id, order_index, playlist_id')
    .eq('id', itemId)
    .single();

  if (fetchCurrentError || !currentItem) {
    console.error('[updateOrder] Error obteniendo item actual o no encontrado:', fetchCurrentError);
    throw new Error('Item actual no encontrado');
  }
  console.log('[updateOrder] Item actual:', currentItem);

  // 2. Encontrar vecino
  let neighborQuery;
  if (direction === 'up') {
    console.log('[updateOrder] Buscando vecino hacia ARRIBA...');
    neighborQuery = supabase
      .from('playlist_items')
      .select('id, order_index')
      .eq('playlist_id', currentItem.playlist_id)
      .lt('order_index', currentItem.order_index) // Menor que el índice actual
      .order('order_index', { ascending: false }) // El más cercano hacia arriba
      .limit(1);
  } else { // direction === 'down'
    console.log('[updateOrder] Buscando vecino hacia ABAJO...');
    neighborQuery = supabase
      .from('playlist_items')
      .select('id, order_index')
      .eq('playlist_id', currentItem.playlist_id)
      .gt('order_index', currentItem.order_index) // Mayor que el índice actual
      .order('order_index', { ascending: true }) // El más cercano hacia abajo
      .limit(1);
  }

  const { data: neighborData, error: fetchNeighborError } = await neighborQuery.maybeSingle();

  if (fetchNeighborError) {
     console.error('[updateOrder] Error buscando vecino:', fetchNeighborError);
     throw new Error('Error buscando vecino');
  }

  if (!neighborData) {
    console.log('[updateOrder] No se encontró vecino en la dirección:', direction);
    return { message: 'El ítem ya está al principio/final' };
  }
  
  const neighbor = neighborData as { id: string; order_index: number };
  console.log('[updateOrder] Vecino encontrado:', neighbor);

  // --- NUEVO LOG DETALLADO ---
  console.log(`[updateOrder] Preparando RPC: swap_playlist_items_order con p_item1_id=${currentItem.id} (index ${currentItem.order_index}), p_item2_id=${neighbor.id} (index ${neighbor.order_index}), p_playlist_id=${currentItem.playlist_id}`);
  // --- FIN NUEVO LOG ---

  // 3. Intercambiar índices usando una transacción
  const { error: transactionError } = await supabase.rpc('swap_playlist_items_order', {
    p_item1_id: currentItem.id,
    p_item2_id: neighbor.id,
    p_playlist_id: currentItem.playlist_id
  });

  if (transactionError) {
    console.error('[updateOrder] Error en la transacción:', transactionError);
    throw new Error('Error al intercambiar posiciones');
  }

  console.log('[updateOrder] Intercambio completado exitosamente');
  return {};
}; 