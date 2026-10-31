import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { BuildingBlock, UserRole } from '../../types/database';
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
  User,
  Eye,
  EyeOff,
  KeyRound,
  Home,
  Phone,
  FileBadge
} from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

type AuthMode = 'sign_in' | 'register' | 'forgot_password';

// Helper to detect if a value contains Supabase URLs, anon keys, or JWT tokens
const isSupabaseOrKeyString = (str: string): boolean => {
  if (!str) return false;
  const lower = str.toLowerCase();
  return (
    lower.includes('supabase') ||
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.includes('.co') ||
    str.startsWith('eyJ')
  );
};

export const LoginForm: React.FC<LoginFormProps> = ({
  onLoginSuccess,
}) => {
  const [roleTab, setRoleTab] = useState<'student' | 'staff'>('student');
  const [authMode, setAuthMode] = useState<AuthMode>('sign_in');

  // Sign In inputs - strictly initialized empty
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration inputs
  const [fullName, setFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [building, setBuilding] = useState<BuildingBlock>('Block B (Pine Hall)');
  const [roomNumber, setRoomNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [staffKey, setStaffKey] = useState('');

  // Password reset inputs
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Status
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Aggressive cleanser to prevent browser autofill from inserting saved Supabase keys
  useEffect(() => {
    try {
      localStorage.removeItem('chm_supabase_config_v1');
      localStorage.removeItem('supabase.auth.token');
    } catch (_) {}

    const sanitizeInputs = () => {
      setEmail((prev) => (isSupabaseOrKeyString(prev) ? '' : prev));
      setPassword((prev) => (isSupabaseOrKeyString(prev) ? '' : prev));
      setRegEmail((prev) => (isSupabaseOrKeyString(prev) ? '' : prev));
      setRegPassword((prev) => (isSupabaseOrKeyString(prev) ? '' : prev));
    };

    sanitizeInputs();
    const timers = [25, 75, 150, 300, 600, 1000, 1500].map((t) =>
      setTimeout(sanitizeInputs, t)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Handle Real Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.signIn(email, password, roleTab);
      setIsLoading(false);
      onLoginSuccess();
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Invalid email or password.');
    }
  };

  // Handle Real Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please verify your password entry.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await authService.signUp({
        full_name: fullName,
        email: regEmail,
        password: regPassword,
        role: roleTab as UserRole,
        student_number: roleTab === 'student' ? studentNumber : undefined,
        building: roleTab === 'student' ? building : undefined,
        room_number: roleTab === 'student' ? roomNumber : undefined,
        phone_number: phoneNumber,
        staffSecurityKey: roleTab === 'staff' ? staffKey : undefined,
      });

      setIsLoading(false);
      onLoginSuccess();
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Registration failed.');
    }
  };

  // Handle Real Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authService.resetPassword(resetEmail, newPassword);
      setIsLoading(false);
      setResetSuccess(true);
      setSuccessMessage('Your password has been successfully updated. You may now sign in with your new password.');
      setTimeout(() => {
        setEmail(resetEmail);
        setPassword(newPassword);
        setAuthMode('sign_in');
        setResetSuccess(false);
      }, 2000);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Password reset failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-between relative overflow-hidden">
      {/* Background Subtle Geometric Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Top Banner with Trust Marker */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 flex items-center justify-between">
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

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-sky-200 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Residence Security Active</span>
          </span>
        </div>
      </header>

      {/* Main Login Card Area */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-2">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
          
          {/* Card Header */}
          <div className="p-6 bg-slate-50 border-b border-slate-200 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full inline-block">
                Corridor Hill Residence Portal
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {authMode === 'sign_in' && 'Secure Maintenance Login'}
              {authMode === 'register' && `Register New ${roleTab === 'student' ? 'Student' : 'Staff'} Account`}
              {authMode === 'forgot_password' && 'Reset Account Password'}
            </h2>

            <p className="text-xs text-slate-600 mt-1">
              {authMode === 'sign_in' && 'Enter your verified university credentials to manage room repairs and maintenance tickets.'}
              {authMode === 'register' && 'Complete your account details to access residence maintenance services.'}
              {authMode === 'forgot_password' && 'Enter your email address and new password to reset your credentials.'}
            </p>

            {/* Segmented Student vs Staff Role Selector (Only in sign_in and register) */}
            {authMode !== 'forgot_password' && (
              <div className="mt-5 grid grid-cols-2 p-1 bg-slate-200/80 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setRoleTab('student');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                    roleTab === 'student'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-sky-700" />
                  <span>Student Portal</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRoleTab('staff');
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                    roleTab === 'staff'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Wrench className="w-4 h-4 text-amber-700" />
                  <span>Maintenance Staff</span>
                </button>
              </div>
            )}
          </div>

          {/* Form Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Authentication Error</p>
                  <p className="leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3 rounded-md bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in duration-150">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{successMessage}</p>
              </div>
            )}

            {/* --- 1. SIGN IN MODE --- */}
            {authMode === 'sign_in' && (
              <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
                {/* Decoy fields to capture aggressive browser credential autofill */}
                <input
                  type="text"
                  name="fake_user_capture"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="sr-only opacity-0 absolute -top-[9999px] -left-[9999px] w-0 h-0 pointer-events-none"
                  autoComplete="off"
                />
                <input
                  type="password"
                  name="fake_secret_capture"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="sr-only opacity-0 absolute -top-[9999px] -left-[9999px] w-0 h-0 pointer-events-none"
                  autoComplete="off"
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    {roleTab === 'student' ? 'Student University Email' : 'Authorized Staff Email'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      inputMode="email"
                      name="chm_residence_account_email_id"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      value={isSupabaseOrKeyString(email) ? '' : email}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEmail(isSupabaseOrKeyString(val) ? '' : val);
                      }}
                      placeholder={
                        roleTab === 'student'
                          ? 'student.number@student.corridorhill.ac.za'
                          : 'staff.name@corridorhill.ac.za'
                      }
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Account Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(isSupabaseOrKeyString(email) ? '' : email);
                        setAuthMode('forgot_password');
                        setError(null);
                      }}
                      className="text-xs text-sky-700 hover:text-sky-900 font-medium hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="chm_residence_account_access_key"
                      autoComplete="new-password"
                      value={isSupabaseOrKeyString(password) ? '' : password}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPassword(isSupabaseOrKeyString(val) ? '' : val);
                      }}
                      placeholder="Enter your password"
                      className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600 focus:border-transparent transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2.5 px-4 bg-sky-900 hover:bg-sky-800 text-white text-sm font-semibold rounded-md shadow-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Verifying Credentials...</span>
                  ) : (
                    <>
                      <span>Sign In to {roleTab === 'student' ? 'Student' : 'Staff'} Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Switch to Register */}
                <div className="text-center pt-2 text-xs text-slate-600">
                  <span>Don't have an account yet? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="font-bold text-sky-800 hover:underline ml-1"
                  >
                    Register here &rarr;
                  </button>
                </div>
              </form>
            )}

            {/* --- 2. REGISTRATION MODE --- */}
            {authMode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sibusiso Dlamini"
                      className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    University Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      inputMode="email"
                      name="new_student_or_staff_email"
                      autoComplete="off"
                      value={isSupabaseOrKeyString(regEmail) ? '' : regEmail}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRegEmail(isSupabaseOrKeyString(val) ? '' : val);
                      }}
                      placeholder={
                        roleTab === 'student'
                          ? 's.dlamini@student.corridorhill.ac.za'
                          : 's.dlamini@corridorhill.ac.za'
                      }
                      className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-600"
                      required
                    />
                  </div>
                </div>

                {/* Student specific fields */}
                {roleTab === 'student' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Student Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={studentNumber}
                          onChange={(e) => setStudentNumber(e.target.value)}
                          placeholder="CH-2026-9102"
                          className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-600"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          Room Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={roomNumber}
                          onChange={(e) => setRoomNumber(e.target.value)}
                          placeholder="Room 204"
                          className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-600"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Residence Building Block <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={building}
                        onChange={(e) => setBuilding(e.target.value as BuildingBlock)}
                        className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-600 bg-white"
                      >
                        <option value="Block A (Oak Hall)">Block A (Oak Hall)</option>
                        <option value="Block B (Pine Hall)">Block B (Pine Hall)</option>
                        <option value="Block C (Maple Hall)">Block C (Maple Hall)</option>
                        <option value="Block D (Cedar Hall)">Block D (Cedar Hall)</option>
                        <option value="Block E (Willow Annex)">Block E (Willow Annex)</option>
                        <option value="Communal Facilities">Communal Facilities</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Staff specific authorization security key */}
                {roleTab === 'staff' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider">
                      Staff Security Passcode <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        value={staffKey}
                        onChange={(e) => setStaffKey(e.target.value)}
                        placeholder="••••••••••••••••••••"
                        className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-600 font-mono tracking-wider"
                        required
                        autoComplete="new-password"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Confidential authorization code issued exclusively to verified personnel by Residence Administration.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Password (min 6) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="new_student_account_password"
                      autoComplete="new-password"
                      value={isSupabaseOrKeyString(regPassword) ? '' : regPassword}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRegPassword(isSupabaseOrKeyString(val) ? '' : val);
                      }}
                      placeholder="••••••••"
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="new_student_account_password_confirm"
                      autoComplete="new-password"
                      value={isSupabaseOrKeyString(regConfirmPassword) ? '' : regConfirmPassword}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRegConfirmPassword(isSupabaseOrKeyString(val) ? '' : val);
                      }}
                      placeholder="••••••••"
                      className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-600"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-2 px-4 bg-sky-900 hover:bg-sky-800 text-white text-xs sm:text-sm font-semibold rounded-md shadow-xs transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Creating Account...' : 'Complete Registration & Sign In'}
                </button>

                <div className="text-center pt-2 text-xs text-slate-600">
                  <span>Already have an account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('sign_in');
                      setError(null);
                    }}
                    className="font-bold text-sky-800 hover:underline ml-1"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* --- 3. FORGOT PASSWORD MODE --- */}
            {authMode === 'forgot_password' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Your Registered University Email
                  </label>
                  <input
                    type="text"
                    inputMode="email"
                    name="pwd_reset_user_email"
                    autoComplete="off"
                    value={isSupabaseOrKeyString(resetEmail) ? '' : resetEmail}
                    onChange={(e) => {
                      const val = e.target.value;
                      setResetEmail(isSupabaseOrKeyString(val) ? '' : val);
                    }}
                    placeholder="e.g. yourname@student.corridorhill.ac.za"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Enter New Password (min 6 characters)
                  </label>
                  <input
                    type="password"
                    name="pwd_reset_new_secret"
                    autoComplete="new-password"
                    value={isSupabaseOrKeyString(newPassword) ? '' : newPassword}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewPassword(isSupabaseOrKeyString(val) ? '' : val);
                    }}
                    placeholder="New secure password"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-600"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('sign_in');
                      setError(null);
                    }}
                    className="w-1/2 py-2 text-xs text-slate-700 hover:bg-slate-100 rounded-md border border-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-1/2 py-2 bg-sky-900 hover:bg-sky-800 text-white text-xs font-semibold rounded-md transition-colors"
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 border-t border-slate-800 gap-2">
        <p>© 2026 Corridor Hill Student Residence · Facilities & Estates Department</p>
        <p className="flex items-center gap-2">
          <span>Emergency 24/7 Security: +27 (0)11 555-0199</span>
          <span>·</span>
          <span>Residence Desk B01</span>
        </p>
      </footer>
    </div>
  );
};
