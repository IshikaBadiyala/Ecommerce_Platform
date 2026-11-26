/**
 * ProtectedRoute Component
 * ------------------------
 * Guard component that allows access only to authenticated users.
 * 
 * Viva Concepts:
 * - Route Guards: Inspects application state before rendering child routes.
 * - Redirect with Location: Uses state={{ from: location }} so login page can redirect
 *   the user back to the exact page they were trying to access.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner text="Checking authentication session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
