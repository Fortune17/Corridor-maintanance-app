import React, { useState } from 'react';
import { db } from '../../services/db';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { ISSUE_PRESETS, IssuePreset } from '../../data/studentHelpers';
import {
  Plus,
  Search,
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Inbox,
  Home,
  ArrowUpRight,
  BookOpen,
  Megaphone,
  Mic,
  MessageSquare,
} from 'lucide-react';

interface StudentDashboardProps {
  onOpenNewRequestModal: (preset?: IssuePreset) => void;
  onSelectRequest: (requestId: string) => void;
  onOpenProfileModal: () => void;
  onOpenResidenceGuide: () => void;
  onOpenForum: () => void;
  onOpenVoiceModal: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onOpenNewRequestModal,
  onSelectRequest,
  onOpenProfileModal,
  onOpenResidenceGuide,
  onOpenForum,
  onOpenVoiceModal,
}) => {
  const currentUser = db.getCurrentUser();
  const requests = db.getRequests();
  const announcements = db.getPinnedAnnouncements();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  // Compute metrics
  const totalSubmitted = requests.length;
  const pendingCount = requests.filter(
    (r) => r.status === 'Submitted' || r.status === 'Under Review'
  ).length;
  const inProgressCount = requests.filter(
    (r) => r.status === 'Assigned' || r.status === 'In Progress' || r.status === 'Awaiting Parts'
  ).length;
  const completedCount = requests.filter(
    (r) => r.status === 'Resolved' || r.status === 'Closed'
  ).length;
  const awaitingConfirmation = requests.filter((r) => r.status === 'Resolved');

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reference_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.room_number.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'pending') {
      return r.status === 'Submitted' || r.status === 'Under Review';
    }
    if (filterTab === 'in_progress') {
      return r.status === 'Assigned' || r.status === 'In Progress' || r.status === 'Awaiting Parts';
    }
    if (filterTab === 'completed') {
      return r.status === 'Resolved' || r.status === 'Closed';
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Student Welcome & Primary CTA Strip */}
      <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white rounded-xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex flex-wrap items-center gap-2 text-xs text-sky-200">
            <span>Student Maintenance Portal</span>
            <span aria-hidden="true">·</span>
            <span>{currentUser?.building || 'Corridor Hill Residence'}</span>
            {currentUser?.room_number && (
              <>
                <span aria-hidden="true">·</span>
                <span>{currentUser.room_number}</span>
              </>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Welcome back, {currentUser?.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Report faults with your dorm room, fixtures, lighting, or communal areas. Track repair progress and message your technician directly.
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onOpenProfileModal}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-200 hover:text-white underline underline-offset-4 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Update Profile & Room</span>
            </button>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <button
              type="button"
              onClick={onOpenForum}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-200 hover:text-white underline underline-offset-4 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Community Forum</span>
            </button>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <button
              type="button"
              onClick={onOpenResidenceGuide}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-200 hover:text-white underline underline-offset-4 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Urgency & SLA Advisor</span>
            </button>
            <span className="text-slate-600" aria-hidden="true">·</span>
            <button
              type="button"
              onClick={onOpenVoiceModal}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-200 hover:text-white underline underline-offset-4 transition-colors"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Live Voice Help</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenNewRequestModal()}
          className="px-5 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap shrink-0 group"
        >
          <Plus className="w-5 h-5 text-slate-950 group-hover:rotate-90 transition-transform" />
          <span>Report a Maintenance Issue</span>
        </button>
      </div>

      {/* Latest Official Announcement Banner */}
      {announcements.length > 0 && (
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <Megaphone className="w-5 h-5 text-sky-800 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-sky-800">
                <span className="font-bold">Official Residence Announcement</span>
                <span aria-hidden="true">·</span>
                <span>{announcements[0].author_name}</span>
                <span aria-hidden="true">·</span>
                <span className="tabular-nums">
                  {new Date(announcements[0].created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">
                {announcements[0].title || announcements[0].category}
              </p>
              <p className="text-xs text-slate-700 line-clamp-2 mt-0.5">
                {announcements[0].content}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenForum}
            className="px-3.5 py-2 bg-sky-900 hover:bg-sky-800 text-white text-xs font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors"
          >
            View Forum ({announcements.length})
          </button>
        </div>
      )}

      {/* Actionable Prompt if any tickets await student confirmation */}
      {awaitingConfirmation.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-sm font-bold text-emerald-950">
                {awaitingConfirmation.length === 1
                  ? '1 repair has been marked Resolved — please verify'
                  : `${awaitingConfirmation.length} repairs have been marked Resolved — please verify`}
              </h2>
              <p className="text-xs text-emerald-800 mt-0.5">
                Inspect the completed repair in your room and confirm it is fixed, or reopen the ticket if the problem persists.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onSelectRequest(awaitingConfirmation[0].id)}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-md whitespace-nowrap shrink-0 transition-colors"
          >
            Review {awaitingConfirmation[0].reference_number}
          </button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Submitted</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
              {totalSubmitted}
            </span>
            <span className="text-xs text-slate-400">tickets</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-600 tabular-nums">
              {pendingCount}
            </span>
            <span className="text-xs text-slate-400">queued</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>In Progress</span>
            <Wrench className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-sky-700 tabular-nums">
              {inProgressCount}
            </span>
            <span className="text-xs text-slate-400">active</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-600 tabular-nums">
              {completedCount}
            </span>
            <span className="text-xs text-slate-400">fixed</span>
          </div>
        </div>
      </div>

      {/* Quick Report Common Issues Section */}
      <section className="space-y-3" aria-label="Quick report common faults">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Quick-Report Common Issues</h2>
            <p className="text-xs text-slate-500">
              Select a common room issue to pre-fill a ticket with 30-second self-check tips.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {ISSUE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onOpenNewRequestModal(preset)}
              className="text-left bg-white border border-slate-200 hover:border-sky-400 hover:bg-sky-50/40 rounded-lg p-3.5 transition-colors flex items-start justify-between gap-3 group"
            >
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-900 group-hover:text-sky-900 block">
                  {preset.label}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5 truncate">
                  {preset.shortDesc}
                </span>
                <span className="text-[11px] text-slate-400 block mt-1.5">
                  {preset.priority} priority · {preset.category}
                </span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-sky-700 shrink-0 mt-0.5" />
            </button>
          ))}
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              filterTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({totalSubmitted})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              filterTab === 'pending'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('in_progress')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              filterTab === 'in_progress'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
              filterTab === 'completed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ticket #, title, category..."
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600"
          />
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-xs">
            <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">
              {searchQuery ? 'No matching requests found' : 'No maintenance requests yet'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? 'Try adjusting your search keywords or clear your active filter.'
                : 'Have an issue with your bedroom lights, heating, water, door, or furniture? Click below to report it.'}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={() => onOpenNewRequestModal()}
                className="mt-4 px-4 py-2 bg-sky-900 hover:bg-sky-800 text-white text-xs sm:text-sm font-semibold rounded-md shadow-xs transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Report a Maintenance Issue</span>
              </button>
            )}
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              onClick={() => onSelectRequest(req.id)}
              className="bg-white border border-slate-200 hover:border-sky-300 rounded-lg p-4 sm:p-5 shadow-xs hover:shadow-sm transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono font-bold text-sky-900">
                    {req.reference_number}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-slate-700">{req.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{req.building} ({req.room_number})</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    {new Date(req.created_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-sky-900 transition-colors">
                    {req.title}
                  </h2>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                    {req.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                  {req.assigned_to_name ? (
                    <span className="flex items-center gap-1 text-slate-700">
                      <Wrench className="w-3.5 h-3.5 text-slate-400" />
                      Assigned: <strong>{req.assigned_to_name}</strong>
                    </span>
                  ) : (
                    <span className="italic text-slate-400">Awaiting staff allocation</span>
                  )}
                  {req.estimated_completion && (
                    <span className="flex items-center gap-1 text-slate-600 tabular-nums">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Target: {new Date(req.estimated_completion).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={req.priority} size="sm" />
                  <StatusBadge status={req.status} />
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-sky-800 group-hover:text-sky-950 pl-2 whitespace-nowrap">
                  <span>{req.status === 'Resolved' ? 'Verify Fix' : 'View Details'}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
