import React from 'react';
import { db } from '../../services/db';
import { 
  Wrench, 
  Phone, 
  Mail, 
  CheckCircle, 
  Clock, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';

export const StaffTeam: React.FC = () => {
  const staff = db.getStaffMembers();
  const allRequests = db.getRequests();

  const specialties: Record<string, string> = {
    'Mark Gallagher': 'Facilities Director · Dispatch & Major Capital Works',
    'David Nkosi': 'Senior Electrician · Wiring, Breakers & High Voltage',
    'Samir Patel': 'Plumbing Specialist · Pipework, Geysers & Drainage',
    'Elena Rostova': 'Locks & Security Specialist · Doors, Glazing & Joinery',
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Maintenance Staff & Technician Directory
        </h1>
        <p className="text-xs text-slate-500">
          Corridor Hill Student Residence on-site engineering and operations team.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staff.map((member) => {
          const activeTasks = allRequests.filter(
            (r) => r.assigned_to === member.id && r.status !== 'Resolved' && r.status !== 'Closed'
          );
          const completedTasks = allRequests.filter(
            (r) => r.assigned_to === member.id && (r.status === 'Resolved' || r.status === 'Closed')
          );

          return (
            <div
              key={member.id}
              className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4 hover:border-sky-300 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.full_name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-600">
                      {member.full_name[0]}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900">{member.full_name}</h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      Authorized Staff
                    </span>
                  </div>
                  <p className="text-xs text-sky-800 font-medium mt-0.5">
                    {specialties[member.full_name] || 'General Maintenance Technician'}
                  </p>
                </div>
              </div>

              {/* Contact info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
                {member.phone_number && (
                  <div className="flex items-center gap-1.5 font-mono text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{member.phone_number}</span>
                  </div>
                )}
              </div>

              {/* Active assignments summary */}
              <div className="bg-slate-50 p-3 rounded-md flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block">Active Assigned Tasks</span>
                  <span className="font-bold text-amber-700 tabular-nums">
                    {activeTasks.length} in progress
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Historical Fixes</span>
                  <span className="font-bold text-emerald-700 tabular-nums">
                    {completedTasks.length} resolved
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Status</span>
                  <span className="font-medium text-slate-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-700" />
                    Active Duty
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
