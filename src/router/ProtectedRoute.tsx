import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = () => {
  const { isAuthenticated, session } = useAuth();

  console.log('[ProtectedRoute] Renderizando. isAuthenticated:', isAuthenticated, 'Session:', session ? session.user.id : null);

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] No autenticado, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  console.log('[ProtectedRoute] Autenticado, renderizando Outlet.');
  return <Outlet />;
}; 