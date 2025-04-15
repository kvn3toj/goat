import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'sonner'

export const LoginPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      console.log('[LoginPage] Usuario autenticado, redirigiendo a /')
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      console.log('[LoginPage] Intentando iniciar sesión con:', { email })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('[LoginPage] Error de inicio de sesión:', error)
        let errorMessage = 'Error al iniciar sesión'
        
        // Personalizar mensajes de error comunes
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Credenciales inválidas. Por favor verifica tu email y contraseña.'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email no confirmado. Por favor verifica tu bandeja de entrada.'
        }
        
        setError(errorMessage)
        toast.error(errorMessage)
        return
      }

      console.log('[LoginPage] Inicio de sesión exitoso:', data.user?.id)
      toast.success('Inicio de sesión exitoso')
      
    } catch (error) {
      console.error('[LoginPage] Error inesperado:', error)
      const errorMessage = 'Ocurrió un error inesperado al iniciar sesión'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Iniciar Sesión
        </Typography>

        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo electrónico"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            error={!!error}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            error={!!error}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
          </Button>
        </Box>
      </Box>
    </Container>
  )
} 