import React from 'react';
import { 
  Building2, 
  PhoneCall, 
  ShieldAlert, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileCheck,
  Key
} from 'lucide-react';

export const ResidenceInfo: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Corridor Hill Residence Maintenance Policy & Guide
        </h1>
        <p className="text-xs text-slate-500">
          Official standard operating procedures for student room repairs, access, and emergency triage.
        </p>
      </div>

      {/* Emergency Contacts Banner */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-5 space-y-3">
        <div className="flex items-center gap-2 text-red-900">
          <ShieldAlert className="w-5 h-5 text-red-700 shrink-0" />
          <h2 className="text-base font-bold">24/7 Emergency Response Protocols</h2>
        </div>
        <p className="text-xs text-red-800 leading-relaxed">
          Do not rely solely on online maintenance tickets for emergency situations posing immediate danger to life or residence integrity (active water flooding, sparking fuse boards, gas leak, building structural issues, or urgent personal lockout).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="bg-white p-3 rounded border border-red-200">
            <span className="font-semibold text-slate-900 block">24/7 Residence Security</span>
            <span className="font-mono text-red-700 font-bold block mt-1">+27 (0)11 555-0199</span>
            <span className="text-[11px] text-slate-500">Block B Main Reception</span>
          </div>
          <div className="bg-white p-3 rounded border border-red-200">
            <span className="font-semibold text-slate-900 block">Campus Paramedic / Fire</span>
            <span className="font-mono text-red-700 font-bold block mt-1">+27 (0)11 555-0112</span>
            <span className="text-[11px] text-slate-500">Emergency Dispatch Unit</span>
          </div>
          <div className="bg-white p-3 rounded border border-red-200">
            <span className="font-semibold text-slate-900 block">Residence Manager Office</span>
            <span className="font-mono text-red-700 font-bold block mt-1">+27 (0)11 555-0120</span>
            <span className="text-[11px] text-slate-500">Mon - Fri 08:00 - 16:30</span>
          </div>
        </div>
      </div>

      {/* SLA Tiers */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-700" />
          <span>Priority Tiers & Response Time Standards (SLAs)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg border border-red-200 bg-red-50/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-red-800">Urgent Priority</span>
              <span className="font-mono font-bold text-red-700">Target &lt; 2 Hours</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Sparking electrical outlets, severe burst plumbing, complete loss of power in room, main entrance lock failure.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-800">High Priority</span>
              <span className="font-mono font-bold text-amber-700">Target &lt; 24 Hours</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Broken window latches, persistent tap drips, hot water geyser failure, room heater inoperative during winter.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-sky-200 bg-sky-50/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-800">Normal Priority</span>
              <span className="font-mono font-bold text-sky-700">Target &lt; 48-72 Hours</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Study desk lighting replacement, slow bathroom drainage, wardrobe hinge adjustments, Wi-Fi connectivity degradation.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Low Priority</span>
              <span className="font-mono font-bold text-slate-600">Target 3-5 Working Days</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Minor cosmetic scuffs, pinboard replacement, non-essential drawer adjustments, scheduled communal painting.
            </p>
          </div>
        </div>
      </div>

      {/* Access and Security Guidelines */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3 text-xs leading-relaxed">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Key className="w-4 h-4 text-sky-700" />
          <span>Room Access & Student Privacy Guidelines</span>
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-700">
          <li>
            <strong>Authorized Personnel:</strong> All maintenance personnel carry official Corridor Hill Staff Photo Badges. Never admit any person claiming to be a repair technician who cannot present official university identification.
          </li>
          <li>
            <strong>Access Windows:</strong> Maintenance staff will aim to visit during your specified preferred access times. In urgent cases or where no access window is given, staff may enter accompanied by Residence Security.
          </li>
          <li>
            <strong>Completion Evidence:</strong> Technicians take photographic evidence of repaired fixtures strictly focusing on the mechanical repair (pipes, locks, sockets) without photographing personal student belongings.
          </li>
          <li>
            <strong>Closure Policy:</strong> Once a request is marked "Resolved", students have <strong>5 calendar days</strong> to inspect their room and confirm the resolution. If the problem recurs, students can click "Reopen Request" to immediately send it back to the active queue.
          </li>
        </ul>
      </div>
    </div>
  );
};
