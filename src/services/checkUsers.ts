import { supabase } from './supabaseClient'
// Quitar import de useAuthStore si ya no se usa
import { toast } from 'sonner'

export const checkUsers = async () => {
  console.log('[checkUsers] Iniciando verificación...')
  try {
    // Obtener la sesión actual
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error('[checkUsers] Error al obtener sesión:', sessionError)
      return
    }

    if (!session) {
      console.log('[checkUsers] No hay sesión activa.')
      return
    }

    const userId = session.user.id
    const userEmail = session.user.email
    console.log('[checkUsers] User ID obtenido:', userId)

    // Verificar si el perfil existe
    const { data: existingProfile, error: fetchError } = await supabase
      .from('admin_profiles')
      .select('id, role')
      .eq('id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[checkUsers] Error al leer admin_profiles:', fetchError)
      toast.error('Error al verificar permisos de administrador')
      return
    }

    // Si no existe el perfil, intentar crearlo
    if (!existingProfile) {
      console.log(`[checkUsers] Perfil NO encontrado para ${userId}. Intentando crear con ON CONFLICT...`)

      const { error: insertError } = await supabase
        .from('admin_profiles')
        .insert([
          {
            id: userId,
            role: 'admin',
            email: userEmail
          }
        ])

      if (insertError) {
        if (insertError.code === '23505') { // unique_violation
          console.log(`[checkUsers] Conflicto (23505) al insertar perfil para ${userId}. Probablemente ya existe.`)
          // El perfil ya existe, no es un error fatal
          toast.success('Permisos de administrador confirmados')
        } else {
          console.error('[checkUsers] Error REAL al insertar en admin_profiles:', insertError)
          toast.error('Error al configurar permisos iniciales')
          return
        }
      } else {
        console.log(`[checkUsers] Perfil creado exitosamente para ${userId}`)
        toast.success('Permisos de administrador asignados correctamente')
      }
    } else {
      console.log(`[checkUsers] Perfil encontrado para ${userId}. Rol: ${existingProfile.role}`)
    }

    console.log('[checkUsers] Verificación completada.')
  } catch (error) {
    console.error('[checkUsers] Error inesperado en la función:', error)
    toast.error('Error inesperado al verificar permisos')
  }
} 