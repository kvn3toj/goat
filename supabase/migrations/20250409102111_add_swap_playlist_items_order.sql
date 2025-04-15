-- Función para intercambiar el orden de dos items en una playlist de manera atómica
-- Usar SECURITY DEFINER con precaución y asegurarse de que la lógica interna sea segura.
CREATE OR REPLACE FUNCTION public.swap_playlist_items_order(
    p_item1_id UUID,
    p_item2_id UUID,
    p_playlist_id UUID
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Ejecuta con los permisos del creador (normalmente superusuario)
-- SET search_path = public -- Opcional: asegura el esquema
AS $$
DECLARE
    v_order1 INT;
    v_order2 INT;
BEGIN
    -- Verificar que ambos items existen y pertenecen a la misma playlist
    -- Esta verificación se hace ANTES de obtener los índices para evitar errores
    IF NOT EXISTS (
        SELECT 1 FROM public.playlist_items pi
        WHERE pi.id = p_item1_id AND pi.playlist_id = p_playlist_id
    ) THEN
        RAISE EXCEPTION 'Item 1 (ID: %) no encontrado en la playlist (ID: %)', p_item1_id, p_playlist_id;
    END IF;

     IF NOT EXISTS (
        SELECT 1 FROM public.playlist_items pi
        WHERE pi.id = p_item2_id AND pi.playlist_id = p_playlist_id
    ) THEN
        RAISE EXCEPTION 'Item 2 (ID: %) no encontrado en la playlist (ID: %)', p_item2_id, p_playlist_id;
    END IF;

    -- Obtener los índices actuales DENTRO de la transacción implícita de la función
    SELECT order_index INTO v_order1 FROM public.playlist_items WHERE id = p_item1_id;
    SELECT order_index INTO v_order2 FROM public.playlist_items WHERE id = p_item2_id;

    -- Realizar el intercambio
    UPDATE public.playlist_items
    SET order_index = v_order2, updated_at = now() -- Actualizar timestamp
    WHERE id = p_item1_id;

    UPDATE public.playlist_items
    SET order_index = v_order1, updated_at = now() -- Actualizar timestamp
    WHERE id = p_item2_id;

END;
$$;

COMMENT ON FUNCTION public.swap_playlist_items_order(UUID, UUID, UUID)
  IS 'Atomically swaps the order_index of two specified playlist items within the same playlist.';

GRANT EXECUTE ON FUNCTION public.swap_playlist_items_order(UUID, UUID, UUID) TO authenticated; 