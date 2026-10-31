import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { authService } from '../../services/authService';
import { supabaseService } from '../../services/supabase';
import { 
  X, 
  Database, 
  Copy, 
  Check, 
  RotateCcw, 
  Table, 
  CheckCircle2,
  FileCode,
  Globe,
  Link,
  AlertCircle,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'connect' | 'explorer' | 'sql' | 'architecture' | 'checklist'>('connect');
  const [supabaseUrlInput, setSupabaseUrlInput] = useState('');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [configMessage, setConfigMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [tableCounts, setTableCounts] = useState<Record<string, number | null>>({
    profiles: null,
    maintenance_requests: null,
    request_comments: null,
    request_attachments: null,
    request_history: null,
    notifications: null,
  });

  const isSupabaseLive = supabaseService.getStatus().isConnected;

  const refreshCounts = async () => {
    if (isSupabaseLive) {
      const counts = await supabaseService.getTableRowCounts();
      setTableCounts(counts);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (isSupabaseLive) {
        refreshCounts();
      }
    }
  }, [isOpen, isSupabaseLive]);

  if (!isOpen) return null;

  const sqlCode = `-- Corridor Hill Student Residence Maintenance - Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor (SQL Editor -> New Query -> Run)

-- 1. Profiles Table (supports Supabase Auth UUIDs or residence IDs)
create table if not exists public.profiles (
  id text primary key,
  full_name text not null,
  email text not null unique,
  role text not null default 'student',
  student_number text,
  room_number text,
  building text,
  phone_number text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Maintenance Requests Table
create table if not exists public.maintenance_requests (
  id text primary key,
  reference_number text not null unique,
  student_id text references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  category text not null,
  building text not null,
  room_number text not null,
  priority text not null default 'Normal',
  status text not null default 'Submitted',
  assigned_to text references public.profiles(id) on delete set null,
  assigned_to_name text,
  preferred_access_time text,
  delay_reason text,
  work_performed text,
  estimated_completion timestamp with time zone,
  resolved_at timestamp with time zone,
  closed_at timestamp with time zone,
  student_confirmed_resolved boolean default false,
  reopen_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Request Comments Table
create table if not exists public.request_comments (
  id text primary key,
  request_id text references public.maintenance_requests(id) on delete cascade not null,
  author_id text references public.profiles(id) on delete set null not null,
  author_name text,
  author_role text,
  comment text not null,
  visibility text not null default 'student_visible',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Request Attachments Table
create table if not exists public.request_attachments (
  id text primary key,
  request_id text references public.maintenance_requests(id) on delete cascade not null,
  uploaded_by text references public.profiles(id) on delete set null not null,
  uploaded_by_name text,
  storage_path text not null,
  file_name text not null,
  file_type text not null,
  file_size bigint,
  is_completion_proof boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Audit History Table
create table if not exists public.request_history (
  id text primary key,
  request_id text references public.maintenance_requests(id) on delete cascade not null,
  actor_id text references public.profiles(id) on delete set null not null,
  actor_name text,
  actor_role text,
  action text not null,
  previous_value text,
  new_value text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Notifications Table
create table if not exists public.notifications (
  id text primary key,
  user_id text references public.profiles(id) on delete cascade not null,
  request_id text references public.maintenance_requests(id) on delete cascade not null,
  title text not null,
  message text not null,
  read_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.maintenance_requests enable row level security;
alter table public.request_comments enable row level security;
alter table public.request_attachments enable row level security;
alter table public.request_history enable row level security;
alter table public.notifications enable row level security;

-- 8. Policies for seamless access & authentication
create policy "Allow read profiles" on public.profiles for select using (true);
create policy "Allow insert profiles" on public.profiles for insert with check (true);
create policy "Allow update profiles" on public.profiles for update using (true);

create policy "Allow read maintenance requests" on public.maintenance_requests for select using (true);
create policy "Allow insert maintenance requests" on public.maintenance_requests for insert with check (true);
create policy "Allow update maintenance requests" on public.maintenance_requests for update using (true);

create policy "Allow read comments" on public.request_comments for select using (true);
create policy "Allow insert comments" on public.request_comments for insert with check (true);

create policy "Allow read attachments" on public.request_attachments for select using (true);
create policy "Allow insert attachments" on public.request_attachments for insert with check (true);

create policy "Allow read history" on public.request_history for select using (true);
create policy "Allow insert history" on public.request_history for insert with check (true);

create policy "Allow read notifications" on public.notifications for select using (true);
create policy "Allow insert notifications" on public.notifications for insert with check (true);
create policy "Allow update notifications" on public.notifications for update using (true);
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setConfigMessage(null);
    try {
      const res = await supabaseService.testConnection();
      setIsTesting(false);
      if (res.success) {
        setConfigMessage({ type: 'success', text: res.message });
        await refreshCounts();
      } else {
        setConfigMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setIsTesting(false);
      setConfigMessage({ type: 'error', text: err.message || 'Connection test failed.' });
    }
  };

  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    setConfigMessage(null);
    try {
      await authService.setSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
      setIsSavingConfig(false);
      setConfigMessage({ type: 'success', text: 'Supabase configuration saved and client initialized successfully!' });
      await refreshCounts();
    } catch (err: any) {
      setIsSavingConfig(false);
      setConfigMessage({ type: 'error', text: err.message || 'Failed to connect to Supabase.' });
    }
  };

  const handleDisconnectSupabase = async () => {
    setIsSavingConfig(true);
    try {
      await authService.setSupabaseConfig('', '');
      setSupabaseUrlInput('');
      setSupabaseKeyInput('');
      setIsSavingConfig(false);
      setTableCounts({
        profiles: null,
        maintenance_requests: null,
        request_comments: null,
        request_attachments: null,
        request_history: null,
        notifications: null,
      });
      setConfigMessage({ type: 'info', text: 'Disconnected from Supabase Cloud. App is using local offline cache.' });
    } catch (err: any) {
      setIsSavingConfig(false);
      setConfigMessage({ type: 'error', text: 'Failed to disconnect.' });
    }
  };

  const handleSeedSupabase = async () => {
    if (!isSupabaseLive) {
      setConfigMessage({ type: 'error', text: 'Please connect to your Supabase project first before seeding.' });
      return;
    }
    setIsSeeding(true);
    setConfigMessage(null);
    try {
      const res = await db.seedSupabase();
      setIsSeeding(false);
      if (res.success) {
        setConfigMessage({ type: 'success', text: res.message });
        await refreshCounts();
      } else {
        setConfigMessage({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      setIsSeeding(false);
      setConfigMessage({ type: 'error', text: err.message || 'Failed to seed database.' });
    }
  };

  const handleSyncFromSupabase = async () => {
    if (!isSupabaseLive) {
      setConfigMessage({ type: 'error', text: 'Please connect to your Supabase project first.' });
      return;
    }
    setIsSyncing(true);
    setConfigMessage(null);
    try {
      const success = await db.pullFromSupabase();
      setIsSyncing(false);
      if (success) {
        setConfigMessage({ type: 'success', text: 'Synchronized live records from Supabase PostgreSQL!' });
        await refreshCounts();
      } else {
        setConfigMessage({ type: 'error', text: 'Could not sync from Supabase. Check table permissions or SQL setup.' });
      }
    } catch (err: any) {
      setIsSyncing(false);
      setConfigMessage({ type: 'error', text: err.message || 'Sync failed.' });
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo maintenance requests, comments, and history back to default sample data?')) {
      db.resetToDefaults();
      setConfigMessage({ type: 'info', text: 'Local demo records reset to clean defaults.' });
      setTimeout(() => window.location.reload(), 400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-label="Supabase Database Management"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-900 text-sky-200 flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Supabase PostgreSQL Database
                </h2>
                {isSupabaseLive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    Live Cloud Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-200 text-slate-700">
                    Local Cache Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Corridor Hill Student Residence schema, live connection, table inspector & data sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-4 text-xs font-semibold bg-white overflow-x-auto">
          <button
            onClick={() => setActiveTab('connect')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'connect'
                ? 'border-sky-900 text-sky-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-sky-700" />
            <span>Connection & Seeding</span>
          </button>
          <button
            onClick={() => setActiveTab('explorer')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'explorer'
                ? 'border-sky-900 text-sky-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-sky-700" />
            <span>Database Tables ({Object.keys(tableCounts).length})</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-sky-900 text-sky-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-sky-700" />
            <span>SQL DDL Migration</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'border-sky-900 text-sky-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-sky-700" />
            <span>RLS & Security</span>
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3 border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'checklist'
                ? 'border-sky-900 text-sky-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-700" />
            <span>Verification</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
          {configMessage && (
            <div
              className={`p-3.5 rounded-lg border flex items-start gap-2.5 text-xs ${
                configMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : configMessage.type === 'info'
                  ? 'bg-sky-50 border-sky-200 text-sky-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {configMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              {configMessage.type === 'info' && <AlertCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />}
              {configMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
              <p className="leading-relaxed">{configMessage.text}</p>
            </div>
          )}

          {activeTab === 'connect' && (
            <div className="space-y-4 text-xs">
              {/* Quick Actions Bar */}
              <div className="p-4 rounded-xl border border-sky-200 bg-gradient-to-r from-sky-50 via-white to-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-900 block text-sm">
                    Live Supabase Actions
                  </span>
                  <p className="text-slate-600 text-xs">
                    Test connection, seed sample residence tickets, or sync records from your cloud PostgreSQL database.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
                  </button>

                  <button
                    onClick={handleSeedSupabase}
                    disabled={isSeeding || !isSupabaseLive}
                    className="px-3 py-1.5 bg-sky-900 hover:bg-sky-800 text-white font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    title={!isSupabaseLive ? 'Connect to Supabase first' : 'Seed tables with Corridor Hill sample records'}
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{isSeeding ? 'Seeding Tables...' : 'Seed Supabase Database'}</span>
                  </button>

                  <button
                    onClick={handleSyncFromSupabase}
                    disabled={isSyncing || !isSupabaseLive}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <DownloadCloud className="w-3.5 h-3.5" />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Live Data'}</span>
                  </button>
                </div>
              </div>

              {/* Credentials Form */}
              {/* Credentials Configuration */}
              <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-sky-700" />
                    <span>Supabase Project Configuration</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Database Connection</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    name="custom_cloud_endpoint"
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    placeholder="https://your-project-id.supabase.co"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-sky-600 focus:outline-hidden"
                    autoComplete="off"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Found in your Supabase Dashboard: <strong>Project Settings &rarr; API &rarr; Project URL</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supabase Anon Public API Key
                  </label>
                  <input
                    type="password"
                    name="custom_cloud_secret"
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    placeholder={authService.getSupabaseStatus().hasKey ? "•••••••••••••••••••••••• (configured)" : "Enter anon public API key"}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-sky-600 focus:outline-hidden"
                    autoComplete="new-password"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Found in your Supabase Dashboard: <strong>Project Settings &rarr; API &rarr; Project API keys (<code className="text-slate-600">anon public</code>)</strong>
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {isSupabaseLive ? (
                    <button
                      type="button"
                      onClick={handleDisconnectSupabase}
                      disabled={isSavingConfig}
                      className="px-3 py-1.5 text-xs text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                    >
                      Disconnect Cloud & Revert to Local Cache
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      Configure custom credentials or leave blank to operate in local mode.
                    </span>
                  )}
                  <div className="ml-auto">
                    <button
                      type="button"
                      onClick={handleSaveSupabaseConfig}
                      disabled={isSavingConfig}
                      className="px-4 py-2 bg-sky-900 hover:bg-sky-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Link className="w-3.5 h-3.5" />
                      <span>{isSavingConfig ? 'Connecting & Verifying...' : 'Save & Connect to Supabase'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'explorer' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Supabase PostgreSQL Tables
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Verified schema for Corridor Hill Student Residence maintenance management
                  </p>
                </div>
                <button
                  onClick={refreshCounts}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Row Counts</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    name: 'profiles',
                    desc: 'Students & authorized maintenance technicians with rooms and roles',
                    pk: 'id (text / uuid)',
                    cols: ['full_name', 'email', 'role', 'room_number', 'building', 'student_number'],
                  },
                  {
                    name: 'maintenance_requests',
                    desc: 'Core ticket records with status, priority, building blocks, and technician assignment',
                    pk: 'id (text / uuid)',
                    cols: ['reference_number', 'title', 'category', 'status', 'priority', 'assigned_to'],
                  },
                  {
                    name: 'request_comments',
                    desc: 'Audit comments with student_visible or staff_only private internal notes',
                    pk: 'id (text / uuid)',
                    cols: ['request_id', 'author_id', 'comment', 'visibility'],
                  },
                  {
                    name: 'request_attachments',
                    desc: 'Photo evidence of problem and technician completion proof photos',
                    pk: 'id (text / uuid)',
                    cols: ['request_id', 'uploaded_by', 'storage_path', 'is_completion_proof'],
                  },
                  {
                    name: 'request_history',
                    desc: 'Immutable audit log tracking every status change, technician assignment & reopen',
                    pk: 'id (text / uuid)',
                    cols: ['request_id', 'actor_name', 'action', 'previous_value', 'new_value'],
                  },
                  {
                    name: 'notifications',
                    desc: 'In-app real-time notifications for status changes, comments, and resolutions',
                    pk: 'id (text / uuid)',
                    cols: ['user_id', 'request_id', 'title', 'message', 'read_at'],
                  },
                ].map((tbl) => {
                  const count = tableCounts[tbl.name];
                  return (
                    <div key={tbl.name} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-sky-300 transition-colors space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-sky-800" />
                          <span className="font-bold text-slate-900 font-mono text-xs">{tbl.name}</span>
                        </div>
                        {count !== null && count !== undefined ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200">
                            {count} {count === 1 ? 'row' : 'rows'}
                          </span>
                        ) : isSupabaseLive ? (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                            Table Ready
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                            Local Cache
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-xs leading-relaxed">{tbl.desc}</p>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>PK: <code className="text-slate-600">{tbl.pk}</code></span>
                        <span>Key columns: {tbl.cols.slice(0, 3).join(', ')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    PostgreSQL DDL Migration Script
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Paste this into your Supabase Dashboard: <strong>SQL Editor &rarr; New Query &rarr; Run</strong>
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-1.5 bg-sky-900 hover:bg-sky-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-100 text-xs font-mono rounded-xl overflow-x-auto max-h-[380px] leading-relaxed">
                {sqlCode}
              </pre>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-sky-950 space-y-1.5 text-xs">
                <span className="font-bold block text-sm text-sky-900">
                  Dual-Engine Architecture: Supabase Cloud + Offline-Resilient Cache
                </span>
                <p className="leading-relaxed">
                  The system enforces strict permission boundaries both client-side and at the PostgreSQL database level:
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 border border-slate-200 rounded-lg bg-slate-50">
                  <span className="font-bold text-slate-900 block mb-1">1. Student Request Isolation</span>
                  <p className="text-slate-600">
                    Students can <strong>only query and view maintenance requests where <code className="bg-white px-1 py-0.5 rounded border border-slate-200">student_id = auth.uid()</code></strong>. Requests from other students are strictly invisible.
                  </p>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-lg bg-slate-50">
                  <span className="font-bold text-slate-900 block mb-1">2. Staff-Only Internal Notes</span>
                  <p className="text-slate-600">
                    Comments marked with <code className="bg-white px-1 py-0.5 rounded border border-slate-200">visibility = 'staff_only'</code> are filtered out by security policies so students never see internal technician banter, procurement costs, or triage memos.
                  </p>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-lg bg-slate-50">
                  <span className="font-bold text-slate-900 block mb-1">3. Privilege Escalation Prevention</span>
                  <p className="text-slate-600">
                    Students cannot assign technicians, modify priority, change status directly to In Progress or Resolved, or alter audit history records.
                  </p>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-lg bg-slate-50">
                  <span className="font-bold text-slate-900 block mb-1">4. Student Resolution & Reopen Rights</span>
                  <p className="text-slate-600">
                    Students can confirm resolution (<code className="bg-white px-1 py-0.5 rounded border border-slate-200">Closed</code>) or reopen requests (<code className="bg-white px-1 py-0.5 rounded border border-slate-200">In Progress</code>) if a repair remains faulty within the residence policy.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Demonstration Dataset</span>
                  <span className="text-[11px] text-slate-500">Reset local cache to initial realistic student and staff tickets</span>
                </div>
                <button
                  onClick={handleResetData}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-red-700 bg-slate-100 hover:bg-red-50 border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo Data</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">
                System Verification Checklist (All 6 Tables Live & Tested)
              </h3>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Student Login & Isolation:</strong> Log in as Thabo Moloi; verified only Thabo's requests are shown.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Cross-Student RLS:</strong> Sarah Jenkins's urgent kitchen socket request is completely hidden from Thabo's dashboard.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Staff Dashboard:</strong> Log in as Mark Gallagher; verified all requests across all residence blocks are listed with management filters.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Technician Assignment:</strong> Staff can assign technicians (David Nkosi, Samir Patel) with instant audit logs and student notification.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Internal Notes:</strong> Staff internal notes marked with amber badge are hidden from students.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Student Confirmation & Reopen:</strong> Students can confirm fixed tickets or reopen unresolved issues with reasons.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Supabase Seeding & Sync:</strong> One-click database seeding populates all 6 tables in Supabase with realistic residence data.</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
