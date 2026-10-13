import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  PhoneCall, 
  CheckCircle2
} from 'lucide-react';
import { getStoredSupabaseConfig, getSupabaseClient } from '../services/supabaseClient';

interface LoginPageProps {
  onLogin: () => void;
}

const DEFAULT_EMAIL = 'shaonp75@gmail.com';
const DEFAULT_PASSWORD = 'admin@123';

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    const inputEmail = email.trim().toLowerCase();
    const inputPass = password.trim();

    try {
      const config = getStoredSupabaseConfig();
      const client = getSupabaseClient(config);

      // 1. Try querying Supabase admin_users table
      if (client) {
        try {
          const { data, error: dbError } = await client
            .from('admin_users')
            .select('email, password, role')
            .ilike('email', inputEmail)
            .limit(1);

          if (!dbError && data && data.length > 0) {
            const userRow = data[0];
            if (userRow.password === inputPass) {
              localStorage.setItem('call_log_auth_token', 'shaonp75_authenticated_session');
              localStorage.setItem('call_log_user_email', userRow.email || inputEmail);
              localStorage.setItem('call_log_auth_source', 'supabase_database');
              onLogin();
              return;
            } else {
              setError('Invalid password. Please check your password.');
              setIsLoading(false);
              return;
            }
          }
        } catch {
          // Fall through to default check if table doesn't exist yet
        }
      }

      // 2. Fallback to default verified admin credentials
      if (inputEmail === DEFAULT_EMAIL.toLowerCase() && inputPass === DEFAULT_PASSWORD) {
        localStorage.setItem('call_log_auth_token', 'shaonp75_authenticated_session');
        localStorage.setItem('call_log_user_email', DEFAULT_EMAIL);
        localStorage.setItem('call_log_auth_source', 'verified_credentials');
        onLogin();
      } else {
        setError('Invalid email or password. Please verify your credentials.');
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Authentication failed. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4 sm:p-6 font-sans antialiased text-[#0f172a]">
      {/* Container Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden">
        {/* Top Header Banner */}
        <div className="p-8 pb-6 text-center space-y-3 bg-gradient-to-b from-slate-50/80 to-white border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-[#047857] text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-700/20">
            <PhoneCall className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">
              Call Log Portal
            </h1>
            <p className="text-xs text-slate-500">
              Review AI Confirmation Calls &amp; Tele-Sales Orders
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 pt-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Email input */}
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Email Address</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 font-medium transition-colors"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Password</span>
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 font-mono transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button with only 'Log In' text */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#047857] hover:bg-[#065f46] text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-700/20 active:scale-[0.99] transition-all flex items-center justify-center disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Log In</span>
            )}
          </button>
        </form>
      </div>

      {/* Footer Info */}
      <p className="text-xs text-slate-400 mt-6 text-center">
        Call Log &amp; Confirmation Review Portal · Protected Database Session
      </p>
    </div>
  );
};
