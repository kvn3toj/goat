import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuthStore } from '../store/authStore';
// import { checkUsers } from '../services/checkUsers';

export const useAuthInitializer = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const { setSession, setUser } = useAuthStore();

  useEffect(() => {
    console.log('[AuthInitializer] useEffect ejecutado.');

    const initialize = async () => {
      setIsInitialized(false); // Asegurar estado inicial
      console.log('[AuthInitializer] Iniciando initialize()...');
      try {
        console.log('[AuthInitializer] Llamando a supabase.auth.getSession()...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('[AuthInitializer] getSession() completado.'); // Log *después* del await

        if (sessionError) {
            console.error('[AuthInitializer] Error en getSession():', sessionError);
        } else {
            console.log('[AuthInitializer] Sesión inicial:', session ? session.user.id : 'ninguna');
            setSession(session); // Actualizar store
            setUser(session?.user ?? null); // Actualizar store
            if (session) {
                console.log('[AuthInitializer] Llamando a checkUsers para sesión inicial...');
                // await checkUsers();
                console.log('[AuthInitializer] checkUsers para sesión inicial completado.');
            }
        }
      } catch (e) {
         console.error('[AuthInitializer] Error CATCH en getSession/checkUsers:', e);
      }

      // Suscribirse a cambios DESPUÉS de obtener la sesión inicial
      console.log('[AuthInitializer] Suscribiéndose a onAuthStateChange...');
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
            console.log('[AuthInitializer] onAuthStateChange - Evento:', _event, 'Sesión:', session ? session.user.id : 'ninguna');
            setSession(session); // Actualizar store
            setUser(session?.user ?? null); // Actualizar store
            // Ejecutar checkUsers solo en SIGNED_IN explícito para evitar duplicados post-login
            if (_event === 'SIGNED_IN' && session) {
               console.log('[AuthInitializer] Llamando a checkUsers para SIGNED_IN...');
               // await checkUsers();
               console.log('[AuthInitializer] checkUsers para SIGNED_IN completado.');
            }
        }
      );

      setIsInitialized(true);
      return () => {
        subscription.unsubscribe();
      };
    };

    initialize();
  }, []);

  return isInitialized;
}; 