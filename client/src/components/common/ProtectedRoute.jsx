import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // If initial token session validation is active, display a clean SaaS loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <div className="absolute h-8 w-8 rounded-full bg-indigo-500/10"></div>
        </div>
        <p className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-widest animate-pulse">
          Securing Session...
        </p>
      </div>
    );
  }

  // Redirect users to log in if they are unauthenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
