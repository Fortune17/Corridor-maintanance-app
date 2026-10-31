import React, { useState, useEffect } from 'react';
import { Profile } from '../../types/database';
import { db } from '../../services/db';
import { authService } from '../../services/authService';
import { supabaseService } from '../../services/supabase';
import { 
  Building2, 
  Bell, 
  LogOut, 
  Database, 
  User, 
  ShieldCheck, 
  GraduationCap,
  Menu,
  X
} from 'lucide-react';
import { NotificationModal } from './NotificationModal';

interface HeaderProps {
  currentUser: Profile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewRequestModal?: () => void;
  onOpenSupabaseModal: () => void;
  onSelectRequest: (requestId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenNewRequestModal,
  onOpenSupabaseModal,
  onSelectRequest,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(db.getNotifications());
  const [isSupabaseLive, setIsSupabaseLive] = useState(supabaseService.getStatus().isConnected);

  useEffect(() => {
    const unsubDb = db.subscribe(() => {
      setNotifications(db.getNotifications());
    });
    const unsubSupabase = supabaseService.subscribe(() => {
      setIsSupabaseLive(supabaseService.getStatus().isConnected);
    });
    return () => {
      unsubDb();
      unsubSupabase();
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const handleLogout = () => {
    authService.signOut();
  };

  const isStaff = currentUser.role === 'staff' || currentUser.role === 'admin';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
          
          {/* Zone 1: Single element brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab(isStaff ? 'staff_requests' : 'student_requests')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-md bg-sky-900 flex items-center justify-center text-white shadow-xs group-hover:bg-sky-800 transition-colors">
                <Building2 className="w-5 h-5 text-sky-200" />
              </div>
              <div>
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap block leading-tight">
                  Corridor Hill Maintenance
                </span>
                <span className="text-xs text-slate-500 hidden sm:block">
                  Student Residence Management
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {isStaff ? (
              <>
                <button
                  onClick={() => setActiveTab('staff_requests')}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                    activeTab === 'staff_requests'
                      ? 'border-sky-800 text-sky-900 font-semibold'
                      : 'border-transparent text-slate-600'
                  }`}
                >
                  All Requests
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                    activeTab === 'analytics'
                      ? 'border-sky-800 text-sky-900 font-semibold'
                      : 'border-transparent text-slate-600'
                  }`}
                >
                  Analytics & Reports
                </button>
                <button
                  onClick={() => setActiveTab('staff_team')}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                    activeTab === 'staff_team'
                      ? 'border-sky-800 text-sky-900 font-semibold'
                      : 'border-transparent text-slate-600'
                  }`}
                >
                  Staff Team
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('student_requests')}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                    activeTab === 'student_requests'
                      ? 'border-sky-800 text-sky-900 font-semibold'
                      : 'border-transparent text-slate-600'
                  }`}
                >
                  My Requests
                </button>
                {onOpenNewRequestModal && (
                  <button
                    onClick={onOpenNewRequestModal}
                    className="hover:text-sky-800 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 border-transparent text-slate-600"
                  >
                    Submit Request
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('residence_info')}
                  className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                    activeTab === 'residence_info'
                      ? 'border-sky-800 text-sky-900 font-semibold'
                      : 'border-transparent text-slate-600'
                  }`}
                >
                  Residence Guide
                </button>
              </>
            )}

            <button
              onClick={onOpenSupabaseModal}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                isSupabaseLive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title={isSupabaseLive ? 'Connected to live Supabase PostgreSQL project' : 'Open Supabase Database & Schema panel'}
            >
              <Database className={`w-3.5 h-3.5 ${isSupabaseLive ? 'text-emerald-600' : 'text-slate-500'}`} />
              <span className="whitespace-nowrap">{isSupabaseLive ? 'Supabase Live' : 'Supabase DB'}</span>
              <span className={`w-2 h-2 rounded-full shrink-0 ${isSupabaseLive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            </button>
          </nav>

          {/* Zone 3: Actions, Notifications & Account */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(true)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white tabular-nums">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Profile Pill / Identity */}
            <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-medium text-xs overflow-hidden shrink-0">
                {currentUser.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <div className="text-left leading-tight hidden lg:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-900 truncate max-w-[130px]">
                    {currentUser.full_name}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded ${
                    isStaff ? 'bg-amber-100 text-amber-900' : 'bg-sky-100 text-sky-900'
                  }`}>
                    {isStaff ? 'Staff' : 'Student'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block truncate max-w-[140px]">
                  {currentUser.room_number || currentUser.email}
                </span>
              </div>
            </div>

            {/* Logout / Switch */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
            <div className="py-2 border-b border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">
                {currentUser.full_name[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{currentUser.full_name}</p>
                <p className="text-xs text-slate-500">
                  {currentUser.role === 'staff' ? 'Authorized Maintenance Staff' : `${currentUser.student_number || 'Student'} · ${currentUser.room_number || ''}`}
                </p>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              {isStaff ? (
                <>
                  <button
                    onClick={() => {
                      setActiveTab('staff_requests');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'staff_requests' ? 'bg-sky-50 text-sky-900' : 'text-slate-700'
                    }`}
                  >
                    All Maintenance Requests
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('analytics');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'analytics' ? 'bg-sky-50 text-sky-900' : 'text-slate-700'
                    }`}
                  >
                    Analytics & Workload
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('staff_team');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'staff_team' ? 'bg-sky-50 text-sky-900' : 'text-slate-700'
                    }`}
                  >
                    Staff Directory
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setActiveTab('student_requests');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'student_requests' ? 'bg-sky-50 text-sky-900' : 'text-slate-700'
                    }`}
                  >
                    My Requests
                  </button>
                  {onOpenNewRequestModal && (
                    <button
                      onClick={() => {
                        onOpenNewRequestModal();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm font-medium text-sky-800 bg-sky-50 rounded-md"
                    >
                      + Report a Maintenance Issue
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setActiveTab('residence_info');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === 'residence_info' ? 'bg-sky-50 text-sky-900' : 'text-slate-700'
                    }`}
                  >
                    Residence Policy & Guide
                  </button>
                </>
              )}

              <button
                onClick={() => {
                  onOpenSupabaseModal();
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md flex items-center justify-between border ${
                  isSupabaseLive
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Database className={`w-4 h-4 ${isSupabaseLive ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <span>Supabase Database & Tables</span>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isSupabaseLive ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {isSupabaseLive ? 'Connected' : 'Local'}
                </span>
              </button>
            </div>
          </div>
        )}
      </header>

      <NotificationModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onSelectRequest={onSelectRequest}
      />
    </>
  );
};
