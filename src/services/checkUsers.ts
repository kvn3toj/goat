import { supabase } from './supabaseClient'
// Quitar import de useAuthStore si ya no se usa
import { toast } from 'sonner'

export const checkUsers = async () => {
  console.log('[checkUsers] Iniciando verificación...');
  try {
    // Obtener la sesión actual directamente del cliente
    const session = supabase.auth.getSession();
    console.log('[checkUsers] Sesión obtenida del cliente');
    
    if (!session) {
      console.log('[checkUsers] No hay sesión activa.');
      return;
    }

    const userId = (await session).data.session?.user?.id;
    console.log('[checkUsers] User ID obtenido:', userId);
    
    if (!userId) {
      console.log('[checkUsers] Sesión existe pero no hay ID de usuario.');
      return;
    }

    console.log(`[checkUsers] Usuario autenticado: ${userId}. Verificando perfil...`);

    // --- INICIO: CÓDIGO COMENTADO PARA DEBUG ---
    /*
    console.log('[checkUsers] Intentando SELECT en admin_profiles...');
    const { data: existingProfile, error: fetchError } = await supabase
      .from('admin_profiles')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[checkUsers] Error al leer admin_profiles:', fetchError);
      return;
    }

    console.log('[checkUsers] Resultado del SELECT:', existingProfile ? 'Perfil encontrado' : 'Perfil no encontrado');

    if (!existingProfile) {
      console.log(`[checkUsers] Perfil NO encontrado para ${userId}. Intentando crear...`);
      const { data: newProfile, error: insertError } = await supabase
        .from('admin_profiles')
        .insert([
          {
            id: userId,
            role: 'admin',
            email: session.user.email // Usar email de la sesión
          }
        ])
        .select('id, role')
        .single();

      if (insertError) {
        console.error('[checkUsers] Error al insertar en admin_profiles:', insertError);
        toast.error('Error al asignar permisos de administrador');
        return;
      }
      console.log(`[checkUsers] Perfil creado exitosamente para ${userId}. Rol: ${newProfile?.role}`);
      toast.success('Permisos de administrador asignados correctamente');
    } else {
      console.log(`[checkUsers] Perfil encontrado para ${userId}. Rol: ${existingProfile.role}`);
    }
    */
    // --- FIN: CÓDIGO COMENTADO PARA DEBUG ---

    console.log('[checkUsers] Verificación SIMULADA completada (lógica de perfil comentada).');

  } catch (error) {
    console.error('[checkUsers] Error inesperado en la función:', error);
    throw error; // Re-lanzamos el error para que App.tsx lo capture
  }
} 