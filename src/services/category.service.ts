import { supabase } from './supabaseClient';
import { Category } from '../types/category.types';

// Obtener todas las categorías
export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, created_at')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return data || [];
};

// Crear una nueva categoría
export const createCategory = async (name: string): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert([{ name }])
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    throw error;
  }

  return data;
};

// Obtener los IDs de categorías asignadas a un item específico
export const fetchItemCategoryIds = async (itemId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from('playlist_item_categories')
    .select('category_id')
    .eq('item_id', itemId);

  if (error) {
    console.error('Error fetching item categories:', error);
    throw error;
  }

  // Transformar el array de objetos a un array de IDs
  return (data || []).map(item => item.category_id);
};

// Asignar múltiples categorías a un item (reemplazando las existentes)
export const setItemCategories = async (itemId: string, categoryIds: string[]): Promise<void> => {
  // 1. Borrar asociaciones antiguas
  const { error: deleteError } = await supabase
    .from('playlist_item_categories')
    .delete()
    .eq('item_id', itemId);

  if (deleteError) {
    console.error('Error deleting item categories:', deleteError);
    throw deleteError;
  }

  // 2. Insertar nuevas asociaciones (si hay alguna)
  if (categoryIds.length > 0) {
    const newLinks = categoryIds.map(catId => ({ 
      item_id: itemId, 
      category_id: catId 
    }));
    
    const { error: insertError } = await supabase
      .from('playlist_item_categories')
      .insert(newLinks);
    
    if (insertError) {
      console.error('Error inserting item categories:', insertError);
      throw insertError;
    }
  }
}; 