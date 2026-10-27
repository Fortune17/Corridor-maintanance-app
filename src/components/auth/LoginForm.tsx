import React, { useState } from 'react';
import { db } from '../../services/db';
import { 
  Building2, 
  GraduationCap, 
  Wrench, 
  ShieldCheck, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  Lock,
  Mail,
  User
} from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess: () => void;
  onOpenSupabaseModal: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
  onOpenSupabaseModal,
}) => {
  const [roleTab, setRoleTab] = useState<'student' | 'staff'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please provide your email address.');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      try {
        db.login(email, roleTab);
        setIsLoading(false);
        onLoginSuccess();
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || 'Login failed. Please check your credentials.');
      }
    }, 250);
  };

  const handleQuickDemoLogin = (userEmail: string, role: 'student' | 'staff') => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      try {
        setRoleTab(role);
        db.login(userEmail, role);
        setIsLoading(false);
        onLoginSuccess();
      } catch (err: any) {
        setIsLoading(false);
        setError(err.message || 'Quick login failed');
      }
    }, 150);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between relative overflow-hidden">
      {/* Background Subtle Geometric Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Top Banner with Trust Marker */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-tight">
              Corridor Hill
            </h1>
            <p className="text-xs text-sky-200">Student Residence Facilities & Maintenance</p>
          </div>
        </div>

        <button
          onClick={onOpenSupabaseModal}
          className="text-xs text-sky-300 hover:text-white flex items-center gap-1.5 transition-colors bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700"
        >
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span className="hidden sm:inline">Supabase & RLS Architecture</span>
          <span className="sm:hidden">RLS Specs</span>
        </button>
      </div>

      {/* Main Login Card Area */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
          
          {/* Header */}
          <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-200 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-800 bg-sky-100 px-3 py-1 rounded-full inline-block mb-3">
              Corridor Hill Residence Portal
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Maintenance Management
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
              Report room issues, track repairs, and manage facility operations.
            </p>

            {/* Segmented Role Selector */}
            <div className="mt-6 grid grid-cols-2 p-1 bg-slate-200/80 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setRoleTab('student');
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  roleTab === 'student'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-sky-700" />
                <span>Student Login</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRoleTab('staff');
                  setError(null);
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  roleTab === 'staff'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-4 h-4 text-amber-700" />
                <span>Staff Login</span>
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-5 p-3 rounded-md bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Authentication Error</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  {roleTab === 'student' ? 'Student University Email' : 'Authorized Staff Email'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      roleTab === 'student'
                        ? 'thabo.moloi@student.corridorhill.ac.za'
                        : 'mark.g@corridorhill.ac.za'
                    }
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password
                  </label>
                  <span className="text-[11px] text-slate-500">
                    (Demo: any password accepted)
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2.5 px-4 bg-sky-900 hover:bg-sky-800 text-white text-sm font-semibold rounded-md shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Enter {roleTab === 'student' ? 'Student' : 'Staff'} Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Switcher */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center justify-between">
                <span>Fast Demo Accounts (1-Click)</span>
                <span className="text-[10px] text-slate-400 font-normal">Pre-seeded realistic data</span>
              </p>

              {roleTab === 'student' ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('thabo.moloi@student.corridorhill.ac.za', 'student')}
                    className="w-full text-left p-2.5 rounded-md border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-sky-900">
                        Thabo Moloi <span className="text-slate-500 font-normal">· Block B Rm 204</span>
                      </p>
                      <p className="text-[11px] text-slate-500">Student #CH-2024-8841 (4 Active/History Requests)</p>
                    </div>
                    <span className="text-xs text-sky-700 font-medium group-hover:translate-x-0.5 transition-transform">
                      Sign in &rarr;
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('sarah.j@student.corridorhill.ac.za', 'student')}
                    className="w-full text-left p-2.5 rounded-md border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-sky-900">
                        Sarah Jenkins <span className="text-slate-500 font-normal">· Block A Rm 112</span>
                      </p>
                      <p className="text-[11px] text-slate-500">Student #CH-2025-1029 (Urgent electrical ticket)</p>
                    </div>
                    <span className="text-xs text-sky-700 font-medium group-hover:translate-x-0.5 transition-transform">
                      Sign in &rarr;
                    </span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('mark.g@corridorhill.ac.za', 'staff')}
                    className="w-full text-left p-2.5 rounded-md border border-amber-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-amber-900">
                        Mark Gallagher <span className="text-amber-700 font-medium text-[11px]">· Facilities Manager</span>
                      </p>
                      <p className="text-[11px] text-slate-500">Full residence maintenance overview & dispatch</p>
                    </div>
                    <span className="text-xs text-amber-800 font-medium group-hover:translate-x-0.5 transition-transform">
                      Sign in &rarr;
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('david.n@corridorhill.ac.za', 'staff')}
                    className="w-full text-left p-2.5 rounded-md border border-amber-200 hover:border-amber-400 hover:bg-amber-50/40 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-amber-900">
                        David Nkosi <span className="text-amber-700 font-medium text-[11px]">· Senior Electrician</span>
                      </p>
                      <p className="text-[11px] text-slate-500">Technician workflow & job completion view</p>
                    </div>
                    <span className="text-xs text-amber-800 font-medium group-hover:translate-x-0.5 transition-transform">
                      Sign in &rarr;
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 border-t border-slate-800 gap-2">
        <p>© 2026 Corridor Hill Student Residence · Facilities Department</p>
        <p className="flex items-center gap-2">
          <span>Emergency 24/7 Security: +27 (0)11 555-0199</span>
          <span>·</span>
          <span>Residence Desk B01</span>
        </p>
      </div>
    </div>
  );
};
