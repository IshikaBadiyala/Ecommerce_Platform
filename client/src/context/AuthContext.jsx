/**
 * AuthContext — Global Authentication State
 * -----------------------------------------
 * Manages user authentication across the entire React component tree.
 * 
 * Viva Concepts:
 * - React Context API: Solves "prop drilling" by sharing state (user, login, logout)
 *   globally without having to pass props down through every intermediate component.
 * - useEffect: Runs side-effects (like checking if the user has an active session cookie)
 *   when the application first mounts ([] dependency array).
 * - useState: Manages local component state for loading, user, and error notifications.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check if user has an existing session on initial application load
  useEffect(() => {
    const verifyUserSession = async () => {
      try {
        const response = await authAPI.getMe();
        if (response.data && response.data.user) {
          setUser(response.data.user);
        }
      } catch (err) {
        // No active session or token expired; user remains logged out
        setUser(null);
        localStorage.removeItem('buynest_token');
        localStorage.removeItem('nexora_token');
      } finally {
        setLoading(false);
      }
    };

    verifyUserSession();
  }, []);

  // Standard Email/Password Login
  const login = async (email, password) => {
    setAuthError(null);
    try {
      const response = await authAPI.login({ email, password });
      const { user: userData, token } = response.data;
      if (token) {
        localStorage.setItem('buynest_token', token);
        localStorage.setItem('nexora_token', token);
      }
      setUser(userData);
      return { success: true };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Standard Registration
  const signup = async (name, email, password, confirmPassword) => {
    setAuthError(null);
    try {
      const response = await authAPI.signup({ name, email, password, confirmPassword });
      const { user: userData, token } = response.data;
      if (token) {
        localStorage.setItem('buynest_token', token);
        localStorage.setItem('nexora_token', token);
      }
      setUser(userData);
      return { success: true };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Google OAuth Login
  const googleLogin = async (credential) => {
    setAuthError(null);
    try {
      const response = await authAPI.googleLogin(credential);
      const { user: userData, token } = response.data;
      if (token) {
        localStorage.setItem('buynest_token', token);
        localStorage.setItem('nexora_token', token);
      }
      setUser(userData);
      return { success: true };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, message: err.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.warn('Logout API error:', err.message);
    } finally {
      localStorage.removeItem('buynest_token');
      localStorage.removeItem('nexora_token');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    authError,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    signup,
    googleLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom Hook to consume AuthContext cleanly in functional components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
