import React, { useState, useMemo } from 'react';
import { MaintenanceRequest, RequestStatus, RequestPriority, RequestCategory, BuildingBlock } from '../../types/database';
import { db } from '../../services/db';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Download, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  FileSpreadsheet,
  Building,
  User,
  Plus
} from 'lucide-react';

interface StaffRequestTableProps {
  onSelectRequest: (requestId: string) => void;
  onOpenNewRequestModal: () => void;
}

export const StaffRequestTable: React.FC<StaffRequestTableProps> = ({
  onSelectRequest,
  onOpenNewRequestModal,
}) => {
  const allRequests = db.getRequests();
  const staffMembers = db.getStaffMembers();
  const analytics = db.getAnalytics();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [buildingFilter, setBuildingFilter] = useState<string>('all');
  const [techFilter, setTechFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'priority' | 'status'>('date_desc');

  // Filtered and sorted data
  const filteredRequests = useMemo(() => {
    return allRequests
      .filter((r) => {
        // Search query
        const student = db.getStudentProfile(r.student_id);
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          r.reference_number.toLowerCase().includes(query) ||
          r.title.toLowerCase().includes(query) ||
          r.room_number.toLowerCase().includes(query) ||
          (student?.full_name.toLowerCase().includes(query) ?? false) ||
          (student?.student_number?.toLowerCase().includes(query) ?? false);

        if (!matchesQuery) return false;

        // Status
        if (statusFilter !== 'all' && r.status !== statusFilter) return false;

        // Priority
        if (priorityFilter !== 'all' && r.priority !== priorityFilter) return false;

        // Category
        if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;

        // Building
        if (buildingFilter !== 'all' && r.building !== buildingFilter) return false;

        // Technician
        if (techFilter !== 'all') {
          if (techFilter === 'unassigned' && r.assigned_to) return false;
          if (techFilter !== 'unassigned' && r.assigned_to !== techFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortBy === 'date_asc') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortBy === 'priority') {
          const weights: Record<RequestPriority, number> = { Urgent: 4, High: 3, Normal: 2, Low: 1 };
          return weights[b.priority] - weights[a.priority];
        }
        if (sortBy === 'status') {
          return a.status.localeCompare(b.status);
        }
        return 0;
      });
  }, [allRequests, searchQuery, statusFilter, priorityFilter, categoryFilter, buildingFilter, techFilter, sortBy]);

  const handleExportCSV = () => {
    const csvContent = db.exportRequestsCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `corridor_hill_maintenance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
    setBuildingFilter('all');
    setTechFilter('all');
  };

  const hasActiveFilters =
    searchQuery ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    categoryFilter !== 'all' ||
    buildingFilter !== 'all' ||
    techFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* 6 Key Management Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Requests */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            Total Requests
          </span>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {analytics.total}
          </p>
        </div>

        {/* Awaiting Review */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 block">
            Awaiting Review
          </span>
          <p className="text-xl sm:text-2xl font-bold text-amber-700 mt-1 tabular-nums">
            {analytics.awaitingReview}
          </p>
        </div>

        {/* In Progress */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-sky-700 block">
            In Progress
          </span>
          <p className="text-xl sm:text-2xl font-bold text-sky-700 mt-1 tabular-nums">
            {analytics.inProgress}
          </p>
        </div>

        {/* Overdue */}
        <div className={`border rounded-lg p-3 sm:p-4 shadow-xs ${
          analytics.overdueCount > 0 ? 'bg-red-50/60 border-red-200' : 'bg-white border-slate-200'
        }`}>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-red-700 block">
            Overdue Requests
          </span>
          <p className="text-xl sm:text-2xl font-bold text-red-700 mt-1 tabular-nums">
            {analytics.overdueCount}
          </p>
        </div>

        {/* Resolved */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 block">
            Resolved
          </span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-1 tabular-nums">
            {analytics.resolved}
          </p>
        </div>

        {/* Avg Response Time */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
            Avg Response
          </span>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {analytics.avgResponseTimeHours} <span className="text-xs font-normal text-slate-500">hrs</span>
          </p>
        </div>
      </div>

      {/* Action Header & CSV Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Maintenance Request Queue
          </h1>
          <p className="text-xs text-slate-500">
            Dispatch, prioritize, and supervise residence repairs across all buildings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewRequestModal}
            className="px-3.5 py-2 text-xs font-semibold bg-sky-900 hover:bg-sky-800 text-white rounded-md shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Request</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-md shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Multi-Field Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs space-y-3">
        {/* Row 1: Search & Sort */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference #, student name, student ID, location, or problem keywords..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-600 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 shrink-0 font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-sky-600"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="priority">Highest Priority</option>
              <option value="status">Status Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Row 2: Category, Status, Priority, Building, Tech Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Status Filter */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-1.5 border border-slate-300 rounded-md bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Awaiting Parts">Awaiting Parts</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full p-1.5 border border-slate-300 rounded-md bg-white"
            >
              <option value="all">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-1.5 border border-slate-300 rounded-md bg-white truncate"
            >
              <option value="all">All Categories</option>
              <option value="Plumbing and water leaks">Plumbing</option>
              <option value="Electricity and lighting">Electricity & Lights</option>
              <option value="Doors, locks and security">Doors & Locks</option>
              <option value="Furniture and fixtures">Furniture</option>
              <option value="Internet and connectivity">Internet & Wi-Fi</option>
              <option value="Cleaning and sanitation">Cleaning</option>
              <option value="Windows and structural damage">Windows & Structural</option>
              <option value="Appliances">Appliances</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Building Filter */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">Building</label>
            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              className="w-full p-1.5 border border-slate-300 rounded-md bg-white truncate"
            >
              <option value="all">All Buildings</option>
              <option value="Block A (Oak Hall)">Block A (Oak)</option>
              <option value="Block B (Pine Hall)">Block B (Pine)</option>
              <option value="Block C (Maple Hall)">Block C (Maple)</option>
              <option value="Block D (Cedar Hall)">Block D (Cedar)</option>
              <option value="Block E (Willow Annex)">Block E (Willow)</option>
              <option value="Communal Facilities">Communal</option>
            </select>
          </div>

          {/* Technician Filter */}
          <div>
            <label className="block text-slate-500 font-medium mb-1">Technician</label>
            <select
              value={techFilter}
              onChange={(e) => setTechFilter(e.target.value)}
              className="w-full p-1.5 border border-slate-300 rounded-md bg-white truncate"
            >
              <option value="all">All Technicians</option>
              <option value="unassigned">-- Unassigned --</option>
              {staffMembers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
            <span>
              Showing <strong>{filteredRequests.length}</strong> of {allRequests.length} requests
            </span>
            <button
              onClick={clearAllFilters}
              className="text-sky-700 hover:text-sky-900 font-medium"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Main High-Density Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-3.5">Ref #</th>
                <th className="py-3 px-3.5">Student</th>
                <th className="py-3 px-3.5">Issue & Category</th>
                <th className="py-3 px-3.5">Location</th>
                <th className="py-3 px-3.5">Priority</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Assigned To</th>
                <th className="py-3 px-3.5">Submitted</th>
                <th className="py-3 px-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No requests match your current filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const student = db.getStudentProfile(req.student_id);
                  const isOverdue =
                    req.status !== 'Resolved' &&
                    req.status !== 'Closed' &&
                    (Date.now() - new Date(req.created_at).getTime()) / (1000 * 60 * 60) > 48;

                  return (
                    <tr
                      key={req.id}
                      onClick={() => onSelectRequest(req.id)}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer group ${
                        isOverdue ? 'bg-red-50/20' : ''
                      }`}
                    >
                      {/* Ref Number */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono font-bold text-sky-900 group-hover:text-sky-700">
                        {req.reference_number}
                      </td>

                      {/* Student */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="font-medium text-slate-900">
                          {student?.full_name || 'Resident'}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {student?.student_number || 'N/A'}
                        </div>
                      </td>

                      {/* Title & Category */}
                      <td className="py-3 px-3.5 max-w-[260px]">
                        <div className="font-semibold text-slate-900 truncate" title={req.title}>
                          {req.title}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {req.category}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-700">
                        <div>{req.building}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{req.room_number}</div>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <PriorityBadge priority={req.priority} size="sm" />
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <StatusBadge status={req.status} size="sm" />
                      </td>

                      {/* Assigned Tech */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {req.assigned_to_name ? (
                          <span className="font-medium text-slate-800">
                            {req.assigned_to_name}
                          </span>
                        ) : (
                          <span className="italic text-slate-400">Unassigned</span>
                        )}
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono text-slate-500 tabular-nums">
                        {new Date(req.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 group-hover:text-sky-900">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
