import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { ProtectedRoute } from './router/ProtectedRoute'
import { MainLayout } from './layouts/MainLayout'
import { MundosPage } from './pages/MundosPage'
import { GamifiedPlaylistsPage } from './pages/GamifiedPlaylistsPage'
import { Toaster } from 'sonner'
import { checkUsers } from './services/checkUsers'
import { useEffect, useRef, useState } from 'react'
import { supabase } from './services/supabaseClient'
import { useAuthStore } from './store/authStore'

const theme = createTheme({
  palette: {
    mode: 'light',
  },
})

const queryClient = new QueryClient()

function App() {
  const setUser = useAuthStore(state => state.setUser)
  const setSession = useAuthStore(state => state.setSession)
  const [isAuthInitialized, setIsAuthInitialized] = useState(false)
  const checkUsersPromise = useRef<Promise<void> | null>(null)
  const authListenerRef = useRef<{ subscription: { unsubscribe: () => void } } | null>(null)
  
  useEffect(() => {
    console.log('[App] Setting up auth listeners...')
    
    // Si ya hay un listener, no crear uno nuevo
    if (authListenerRef.current) {
      console.log('[App] Auth listener already exists, skipping...')
      return
    }
    
    // Suscribirse a cambios en la sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[App] Auth state changed:', event, 'Session:', session?.user?.id)
        
        // Actualizar estado global
        setSession(session)
        setUser(session?.user || null)
        
        // Solo ejecutar checkUsers si hay una sesión y no está ya en proceso
        if (session && !checkUsersPromise.current) {
          console.log('[App] Starting checkUsers for session:', session.user.id)
          try {
            // Guardar la promesa para evitar ejecuciones concurrentes
            checkUsersPromise.current = checkUsers()
            await checkUsersPromise.current
            console.log('[App] checkUsers completed successfully')
          } catch (error) {
            console.error('[App] Error in checkUsers:', error)
          } finally {
            checkUsersPromise.current = null
            setIsAuthInitialized(true)
          }
        }
      }
    )
    
    // Guardar la referencia del listener
    authListenerRef.current = { subscription }
    
    // Limpiar suscripción
    return () => {
      console.log('[App] Cleaning up auth listeners...')
      if (authListenerRef.current) {
        authListenerRef.current.subscription.unsubscribe()
        authListenerRef.current = null
      }
    }
  }, [setUser, setSession])

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/mundos" element={<MundosPage />} />
                <Route path="/services/uplay/playlists" element={<GamifiedPlaylistsPage />} />
                <Route path="/settings" element={<div>Página de Configuración (Placeholder)</div>} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </BrowserRouter>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
