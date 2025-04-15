import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, Box, CircularProgress } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { ProtectedRoute } from './router/ProtectedRoute'
import { MainLayout } from './layouts/MainLayout'
import { MundosPage } from './pages/MundosPage'
import { MundoContentPage } from './pages/MundoContentPage'
import { PlaylistDetailPage } from './pages/PlaylistDetailPage'
import { VideoConfigPage } from './pages/VideoConfigPage'
import { GamifiedPlaylistsPage } from './pages/GamifiedPlaylistsPage'
import { Toaster } from 'react-hot-toast'
import { useAuthInitializer } from './hooks/useAuthInitializer'
import { theme } from './theme'

const queryClient = new QueryClient()

function App() {
  const authInitialized = useAuthInitializer()

  // Si aún no se ha inicializado la autenticación, mostrar un loader
  if (!authInitialized) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

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
                <Route path="/mundos/:mundoId/contenido" element={<MundoContentPage />} />
                <Route path="/playlists" element={<GamifiedPlaylistsPage />} />
                <Route path="/playlists/:playlistId" element={<Navigate to="details" replace />} />
                <Route path="/playlists/:playlistId/details" element={<PlaylistDetailPage />} />
                <Route path="/playlists/:playlistId/videos" element={<PlaylistDetailPage />} />
                <Route path="/items/:itemId/config" element={<VideoConfigPage />} />
                <Route path="/settings" element={<div>Página de Configuración (Placeholder)</div>} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
