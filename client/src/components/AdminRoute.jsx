/**
 * AdminRoute Component
 * --------------------
 * High-security guard component requiring both authentication AND the 'admin' role.
 * 
 * Viva Concepts:
 * - Role-Based Route Protection on Client: Prevents non-administrators from loading
 *   the admin UI components. Note that backend API routes are also protected independently.
 */

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner text="Verifying administrator credentials..." />;
  }

  // If not logged in at all, redirect to login
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md">
          <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Admin Sign-In Required</h2>
          <p className="text-sm text-slate-600 mb-6">
            You must be signed in with an administrator account to view the product management dashboard.
          </p>
          <Link
            to="/login"
            state={{ from: location }}
            className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // If logged in but role is not 'admin'
  if (!isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center max-w-md">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied (403)</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Your account does not possess administrator privileges. To test the admin panel, please log in with{' '}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-xs">admin@nexora.com</code> or promote your account using the provided script.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-5 py-2.5 rounded-xl text-sm transition"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Store
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
