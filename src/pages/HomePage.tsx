import { Button } from '@mui/material'
import { useAuth } from '../hooks/useAuth'

export const HomePage = () => {
  const { logout } = useAuth()

  return (
    <div>
      <h1>Welcome to Gamifier Admin</h1>
      <Button variant="contained" color="primary" onClick={logout}>
        Logout
      </Button>
    </div>
  )
} 