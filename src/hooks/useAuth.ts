import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const { user, session, logout } = useAuthStore()

  return {
    user,
    session,
    logout,
    isAuthenticated: !!session,
  }
} 