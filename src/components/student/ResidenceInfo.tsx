import React, { useState } from 'react';
import {
  PhoneCall,
  ShieldAlert,
  Clock,
  Key,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  SlidersHorizontal,
  Plus,
} from 'lucide-react';
import {
  ISSUE_PRESETS,
  IssuePreset,
  RESIDENCE_FAQS,
  TRIAGE_ADVISOR_OPTIONS,
  TriageOption,
} from '../../data/studentHelpers';
import { PriorityBadge } from '../common/PriorityBadge';

interface ResidenceInfoProps {
  onOpenNewRequestModal?: (preset?: IssuePreset) => void;
}

const EMERGENCY_CONTACTS = [
  {
    id: 'security',
    name: '24/7 Residence Security',
    phone: '+27 (0)11 555-0199',
    tel: '+27115550199',
    location: 'Block B Main Reception',
  },
  {
    id: 'paramedic',
    name: 'Campus Paramedic / Fire',
    phone: '+27 (0)11 555-0112',
    tel: '+27115550112',
    location: 'Emergency Dispatch Unit',
  },
  {
    id: 'manager',
    name: 'Residence Manager Office',
    phone: '+27 (0)11 555-0120',
    tel: '+27115550120',
    location: 'Mon - Fri 08:00 - 16:30',
  },
];

export const ResidenceInfo: React.FC<ResidenceInfoProps> = ({ onOpenNewRequestModal }) => {
  const [selectedTriageId, setSelectedTriageId] = useState<string>(TRIAGE_ADVISOR_OPTIONS[0].id);
  const [copiedContactId, setCopiedContactId] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>(RESIDENCE_FAQS[0].id);

  const selectedTriage: TriageOption =
    TRIAGE_ADVISOR_OPTIONS.find((item) => item.id === selectedTriageId) || TRIAGE_ADVISOR_OPTIONS[0];

  const handleCopyNumber = (id: string, phone: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(phone).catch(() => {});
    }
    setCopiedContactId(id);
    setTimeout(() => {
      setCopiedContactId((curr) => (curr === id ? null : curr));
    }, 2000);
  };

  const handleLaunchFromAdvisor = (triage: TriageOption) => {
    if (!onOpenNewRequestModal) return;
    const matchedPreset = ISSUE_PRESETS.find((p) => p.category === triage.presetCategory);
    if (matchedPreset) {
      onOpenNewRequestModal({
        ...matchedPreset,
        priority: triage.recommendedPriority,
      });
      return;
    }

    onOpenNewRequestModal({
      id: triage.id,
      label: triage.presetCategory,
      shortDesc: triage.symptom,
      title: `${triage.presetCategory} Repair Needed`,
      category: triage.presetCategory,
      priority: triage.recommendedPriority,
      descriptionHint: triage.guidance,
      selfChecks: [triage.guidance],
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Corridor Hill Residence Maintenance Policy & Guide
        </h1>
        <p className="text-xs text-slate-500">
          Interactive urgency advisor, 24/7 emergency contacts, SLA targets, and residence access procedures.
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
          {EMERGENCY_CONTACTS.map((contact) => {
            const isCopied = copiedContactId === contact.id;
            return (
              <div
                key={contact.id}
                className="bg-white p-3.5 rounded-md border border-red-200 flex flex-col justify-between gap-2.5"
              >
                <div>
                  <span className="font-semibold text-slate-900 block">{contact.name}</span>
                  <span className="font-mono text-red-700 font-bold block mt-1 tabular-nums">
                    {contact.phone}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">{contact.location}</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-red-100">
                  <a
                    href={`tel:${contact.tel}`}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-white bg-red-700 hover:bg-red-800 rounded transition-colors whitespace-nowrap"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Call</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyNumber(contact.id, contact.phone)}
                    className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Urgency & SLA Advisor */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-sky-700" />
              <span>Interactive Urgency & SLA Advisor</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select the situation that best matches your room issue to check the priority tier and next step.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-7 space-y-2">
            {TRIAGE_ADVISOR_OPTIONS.map((option) => {
              const isSelected = option.id === selectedTriage.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedTriageId(option.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-sky-50 border-sky-400 text-slate-900'
                      : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-medium leading-snug">{option.symptom}</span>
                  <PriorityBadge priority={option.recommendedPriority} size="sm" />
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Recommended Action
              </span>
              <PriorityBadge priority={selectedTriage.recommendedPriority} size="sm" />
            </div>

            <div>
              <span className="text-[11px] text-slate-500 block">Expected SLA Target</span>
              <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                {selectedTriage.slaTarget}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed">{selectedTriage.guidance}</p>

            <div className="pt-1 flex flex-wrap gap-2">
              {selectedTriage.actionType === 'emergency_call' && (
                <a
                  href="tel:+27115550199"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-md transition-colors whitespace-nowrap"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call 24/7 Security</span>
                </a>
              )}
              {onOpenNewRequestModal && (
                <button
                  type="button"
                  onClick={() => handleLaunchFromAdvisor(selectedTriage)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-sky-900 hover:bg-sky-800 rounded-md transition-colors whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log {selectedTriage.recommendedPriority} Ticket</span>
                </button>
              )}
            </div>
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
              <span className="font-mono font-bold text-red-700 tabular-nums">Target &lt; 2 Hours</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Sparking electrical outlets, severe burst plumbing, complete loss of power in room, main entrance lock failure.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-800">High Priority</span>
              <span className="font-mono font-bold text-amber-700 tabular-nums">Target &lt; 24 Hours</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Broken window latches, persistent tap drips, hot water geyser failure, room heater inoperative during winter.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-sky-200 bg-sky-50/30 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-800">Normal Priority</span>
              <span className="font-mono font-bold text-sky-700 tabular-nums">Target &lt; 48-72 Hours</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Study desk lighting replacement, slow bathroom drainage, wardrobe hinge adjustments, Wi-Fi connectivity degradation.
            </p>
          </div>

          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700">Low Priority</span>
              <span className="font-mono font-bold text-slate-600 tabular-nums">Target 3-5 Working Days</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Minor cosmetic scuffs, pinboard replacement, non-essential drawer adjustments, scheduled communal painting.
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-sky-700" />
          <span>Student Maintenance FAQs</span>
        </h2>

        <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden">
          {RESIDENCE_FAQS.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div key={faq.id} className="bg-white">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-semibold text-slate-900">
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-3.5 text-xs text-slate-600 leading-relaxed bg-slate-50/50 border-t border-slate-100 pt-2.5">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
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
