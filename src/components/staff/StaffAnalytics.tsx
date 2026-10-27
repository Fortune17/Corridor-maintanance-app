import React from 'react';
import { db } from '../../services/db';
import { 
  BarChart3, 
  Download, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Building, 
  PieChart, 
  Users,
  Calendar,
  Layers
} from 'lucide-react';

interface StaffAnalyticsProps {
  onSelectRequest: (requestId: string) => void;
}

export const StaffAnalytics: React.FC<StaffAnalyticsProps> = ({ onSelectRequest }) => {
  const analytics = db.getAnalytics();
  const allRequests = db.getRequests();

  const handleExportCSV = () => {
    const csv = db.exportRequestsCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `corridor_hill_maintenance_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const total = analytics.total || 1;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Maintenance Analytics & Performance Reporting
          </h1>
          <p className="text-xs text-slate-500">
            Real-time quantitative performance metrics aggregated from Corridor Hill database records.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-sky-900 hover:bg-sky-800 text-white rounded-md shadow-xs transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Full CSV Dataset</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Avg Response Time</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {analytics.avgResponseTimeHours}
            </span>
            <span className="text-xs text-slate-500 font-medium">hours to triage</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Target: &lt; 4 hours</p>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Avg Resolution Time</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-700 tabular-nums">
              {analytics.avgResolutionTimeHours}
            </span>
            <span className="text-xs text-slate-500 font-medium">hours to fix</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">From submission to resolved</p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span>Resolution Rate</span>
            <Layers className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {Math.round((analytics.resolved / total) * 100)}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({analytics.resolved} of {analytics.total})
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Resolved or Closed</p>
        </div>

        {/* KPI 4 */}
        <div className={`border rounded-lg p-4 shadow-xs ${
          analytics.overdueCount > 0 ? 'bg-red-50/50 border-red-200' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
            <span className={analytics.overdueCount > 0 ? 'text-red-700' : ''}>Overdue Tickets</span>
            <AlertTriangle className={`w-4 h-4 ${analytics.overdueCount > 0 ? 'text-red-600' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-bold tabular-nums ${analytics.overdueCount > 0 ? 'text-red-700' : 'text-slate-900'}`}>
              {analytics.overdueCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">&gt; 48h active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Requires urgent escalation</p>
        </div>
      </div>

      {/* Grid: Category Breakdown & Residence Block Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-sky-700" />
              <span>Fault Distribution by Category</span>
            </h2>
            <span className="text-xs text-slate-400">{Object.keys(analytics.byCategory).length} categories</span>
          </div>

          <div className="space-y-3">
            {Object.entries(analytics.byCategory)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => {
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-700">
                      <span className="font-medium truncate max-w-[260px]">{cat}</span>
                      <span className="font-mono text-slate-500 tabular-nums">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-700 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Building Distribution */}
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-sky-700" />
              <span>Requests by Residence Block</span>
            </h2>
            <span className="text-xs text-slate-400">{Object.keys(analytics.byBuilding).length} locations</span>
          </div>

          <div className="space-y-3">
            {Object.entries(analytics.byBuilding)
              .sort(([, a], [, b]) => b - a)
              .map(([bld, count]) => {
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={bld} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-700">
                      <span className="font-medium truncate max-w-[260px]">{bld}</span>
                      <span className="font-mono text-slate-500 tabular-nums">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-slate-700 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Technician Workload Distribution */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-sky-700" />
            <span>Technician Workload & Task Allocation</span>
          </h2>
          <span className="text-xs text-slate-400">Staff Dispatch Balance</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-3">Technician / Assignee</th>
                <th className="py-2.5 px-3">Active Tickets</th>
                <th className="py-2.5 px-3">Resolved Tickets</th>
                <th className="py-2.5 px-3">Total Assigned</th>
                <th className="py-2.5 px-3">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.entries(analytics.technicianWorkload).map(([name, data]) => {
                const rate = data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0;
                return (
                  <tr key={name} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      {name}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-amber-700 tabular-nums">
                      {data.active}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-medium text-emerald-700 tabular-nums">
                      {data.resolved}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900 tabular-nums">
                      {data.total}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="font-mono text-slate-600 tabular-nums">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overdue Tickets Table (If Any) */}
      {analytics.overdueCount > 0 && (
        <div className="bg-red-50/40 border border-red-200 rounded-lg p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-red-900">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <div>
              <h2 className="text-sm font-bold">Overdue Tickets Escalation Notice</h2>
              <p className="text-xs text-red-700">
                These requests have been open for over 48 hours without resolution. Immediate follow-up required.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-md border border-red-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-red-50/80 text-red-900 font-semibold border-b border-red-200">
                <tr>
                  <th className="p-2.5">Ref #</th>
                  <th className="p-2.5">Title</th>
                  <th className="p-2.5">Building</th>
                  <th className="p-2.5">Priority</th>
                  <th className="p-2.5">Submitted</th>
                  <th className="p-2.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {analytics.overdueRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-red-50/40 cursor-pointer" onClick={() => onSelectRequest(req.id)}>
                    <td className="p-2.5 font-mono font-bold text-sky-900">{req.reference_number}</td>
                    <td className="p-2.5 font-medium text-slate-900">{req.title}</td>
                    <td className="p-2.5 text-slate-700">{req.building} ({req.room_number})</td>
                    <td className="p-2.5 font-semibold text-red-700">{req.priority}</td>
                    <td className="p-2.5 font-mono text-slate-500 tabular-nums">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-2.5 text-sky-800 font-semibold">Triage &rarr;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
