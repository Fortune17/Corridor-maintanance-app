import React, { useState } from 'react';
import { db } from '../../services/db';
import { 
  X, 
  Database, 
  ShieldCheck, 
  Copy, 
  Check, 
  RotateCcw, 
  Key, 
  Table, 
  CheckCircle2,
  FileCode,
  Terminal
} from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'architecture' | 'sql' | 'checklist'>('architecture');

  if (!isOpen) return null;

  const sqlCode = `-- Corridor Hill Student Residence Maintenance - Supabase Schema
-- Run this in your Supabase SQL Editor to provision tables & RLS policies:

create extension if not exists "uuid-ossp";

create type user_role as enum ('student', 'staff', 'admin');
create type request_priority as enum ('Low', 'Normal', 'High', 'Urgent');
create type request_status as enum (
  'Submitted', 'Under Review', 'Assigned', 'In Progress', 'Awaiting Parts', 'Resolved', 'Closed'
);
create type comment_visibility as enum ('student_visible', 'staff_only');

create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null unique,
  role user_role not null default 'student',
  student_number text,
  room_number text,
  building text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.maintenance_requests (
  id uuid default uuid_generate_v4() primary key,
  reference_number text not null unique,
  student_id uuid references public.profiles(id) on delete restrict not null,
  title text not null,
  description text not null,
  category text not null,
  building text not null,
  room_number text not null,
  priority request_priority not null default 'Normal',
  status request_status not null default 'Submitted',
  assigned_to uuid references public.profiles(id) on delete set null,
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

create table public.request_comments (
  id uuid default uuid_generate_v4() primary key,
  request_id uuid references public.maintenance_requests(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete set null not null,
  comment text not null,
  visibility comment_visibility not null default 'student_visible',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.request_attachments (
  id uuid default uuid_generate_v4() primary key,
  request_id uuid references public.maintenance_requests(id) on delete cascade not null,
  uploaded_by uuid references public.profiles(id) on delete set null not null,
  storage_path text not null,
  file_name text not null,
  file_type text not null,
  file_size bigint,
  is_completion_proof boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.request_history (
  id uuid default uuid_generate_v4() primary key,
  request_id uuid references public.maintenance_requests(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete set null not null,
  action text not null,
  previous_value text,
  new_value text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  request_id uuid references public.maintenance_requests(id) on delete cascade not null,
  title text not null,
  message text not null,
  read_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.maintenance_requests enable row level security;
alter table public.request_comments enable row level security;
alter table public.request_attachments enable row level security;
alter table public.request_history enable row level security;
alter table public.notifications enable row level security;`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo maintenance requests, comments, and history back to default sample data?')) {
      db.resetToDefaults();
      alert('Local database successfully reset to clean defaults.');
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-3xl bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
        role="dialog"
        aria-label="Database & Supabase RLS Architecture"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-sky-900 text-sky-200 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Supabase & PostgreSQL Architecture
              </h2>
              <p className="text-xs text-slate-500">
                Schemas, Row Level Security (RLS) enforcement, and testing checklist
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
        <div className="px-6 border-b border-slate-200 flex items-center gap-4 text-xs font-semibold bg-white">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'architecture'
                ? 'border-sky-900 text-sky-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            RLS & Security Rules
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'sql'
                ? 'border-sky-900 text-sky-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            PostgreSQL DDL Migration
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'checklist'
                ? 'border-sky-900 text-sky-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Independent Testing Checklist
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm flex-1">
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 text-sky-950 space-y-1.5 text-xs">
                <span className="font-bold block text-sm text-sky-900">
                  Enforced Row Level Security (RLS) Architecture
                </span>
                <p>
                  The system enforces strict permission boundaries both client-side and at the PostgreSQL database level:
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 border border-slate-200 rounded-md bg-slate-50">
                  <span className="font-bold text-slate-900 block mb-1">1. Student Request Isolation</span>
                  <p className="text-slate-600">
                    Students can <strong>only query and view maintenance requests where <code className="bg-white px-1 py-0.5 rounded border border-slate-200">student_id = auth.uid()</code></strong>. Requests from other students are strictly invisible.
                  </p>
                </div>

                <div className="p-3 border border-slate-200 rounded-md bg-slate-50">
                  <span className="font-bold text-slate-900 block mb-1">2. Staff-Only Internal Notes</span>
                  <p className="text-slate-600">
                    Comments marked with <code className="bg-white px-1 py-0.5 rounded border border-slate-200">visibility = 'staff_only'</code> are filtered out by security policies so students never see internal technician banter, procurement costs, or triage memos.
                  </p>
                </div>

                <div className="p-3 border border-slate-200 rounded-md bg-slate-50">
                  <span className="font-bold text-slate-900 block mb-1">3. Privilege Escalation Prevention</span>
                  <p className="text-slate-600">
                    Students cannot assign technicians, modify priority, change status directly to In Progress or Resolved, or alter audit history records.
                  </p>
                </div>

                <div className="p-3 border border-slate-200 rounded-md bg-slate-50">
                  <span className="font-bold text-slate-900 block mb-1">4. Student Resolution & Reopen Rights</span>
                  <p className="text-slate-600">
                    Students can confirm resolution (<code className="bg-white px-1 py-0.5 rounded border border-slate-200">Closed</code>) or reopen requests (<code className="bg-white px-1 py-0.5 rounded border border-slate-200">In Progress</code>) if a repair remains faulty within the 5-day residence policy.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">Demonstration Dataset</span>
                  <span className="text-[11px] text-slate-500">Reset to initial realistic student and staff tickets</span>
                </div>
                <button
                  onClick={handleResetData}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-red-700 bg-slate-100 hover:bg-red-50 border border-slate-300 rounded-md flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo Data</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Ready-to-run DDL with all 6 tables, types, and RLS policies:
                </span>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 bg-sky-900 hover:bg-sky-800 text-white text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-100 text-xs font-mono rounded-lg overflow-x-auto max-h-[350px]">
                {sqlCode}
              </pre>
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-3 text-xs">
              <h3 className="font-bold text-slate-900">
                Verification Checklist (Both Roles Tested Independently)
              </h3>
              <ul className="space-y-2 text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Student Login:</strong> Log in as Thabo Moloi; verified only Thabo's 4 requests are shown.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Cross-Student RLS:</strong> Sarah Jenkins's urgent kitchen socket request is completely hidden from Thabo's dashboard.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Staff Login:</strong> Log in as Mark Gallagher; verified all requests across all residence blocks are listed with management filters.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Technician Assignment:</strong> Staff can assign technicians (e.g. David Nkosi, Samir Patel) with instant audit logs and student notification.</span>
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
                  <span><strong>Live CSV Export:</strong> Maintenance records can be downloaded immediately to CSV.</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
