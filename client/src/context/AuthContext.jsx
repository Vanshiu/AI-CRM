import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize session state from localStorage
  const initAuth = async () => {
    const storedToken = localStorage.getItem('crm_token');
    const storedUser = localStorage.getItem('crm_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);

        // Fetch fresh profile state to verify validity
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
          localStorage.setItem('crm_user', JSON.stringify(response.data.user));
        }
      } catch (err) {
        console.error('[Auth Context Error] Verification profile reload failed:', err.message);
        // Let api response interceptor handle 401 token clearing if applicable
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    initAuth();

    // Catch 401 unauthorized alerts globally to log out the user synchronously
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth-unauthorized', handleUnauthorized);
    };
  }, []);

  // Signup action handler
  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      
      const { token: receivedToken, user: receivedUser } = response.data;
      
      localStorage.setItem('crm_token', receivedToken);
      localStorage.setItem('crm_user', JSON.stringify(receivedUser));
      
      setToken(receivedToken);
      setUser(receivedUser);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('[Auth Context] Signup failed:', error);
      const msg = error.response?.data?.message || 'Failed to sign up. Please try again.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Login action handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { token: receivedToken, user: receivedUser } = response.data;
      
      localStorage.setItem('crm_token', receivedToken);
      localStorage.setItem('crm_user', JSON.stringify(receivedUser));
      
      setToken(receivedToken);
      setUser(receivedUser);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      console.error('[Auth Context] Login failed:', error);
      const msg = error.response?.data?.message || 'Invalid email or password.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Logout action handler
  const logout = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_user');
    
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      loading,
      login,
      signup,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
