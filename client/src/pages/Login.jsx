import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowRight, Layers } from 'lucide-react';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { email, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic Validations
    if (!email || !password) {
      setError('Please provide all credentials.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-[#111625] rounded-2xl border border-slate-800 shadow-2xl p-8 transition-all duration-300">
        
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/10 mb-4">
            <Layers className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Sign in to your portal</h2>
          <p className="text-sm text-slate-400 mt-1">Welcome back to AI CRM Enterprise</p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="font-medium">{error}</div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 bg-[#181e30] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-200"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
              <a href="#forgot" className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-[#181e30] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all duration-200"
              />
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Redirect section */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold underline decoration-2 underline-offset-4">
            Sign up for free
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;
