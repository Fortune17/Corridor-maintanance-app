import React, { useState } from 'react';
import { MaintenanceRequest, RequestStatus } from '../../types/database';
import { db } from '../../services/db';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  User, 
  Send, 
  CheckCircle2, 
  RotateCcw, 
  Image as ImageIcon,
  History,
  MessageSquare,
  AlertCircle,
  FileCheck2
} from 'lucide-react';

interface StudentRequestDetailProps {
  request: MaintenanceRequest;
  onBack: () => void;
  onRefresh: () => void;
}

const WORKFLOW_STEPS: RequestStatus[] = [
  'Submitted',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
];

export const StudentRequestDetail: React.FC<StudentRequestDetailProps> = ({
  request,
  onBack,
  onRefresh,
}) => {
  const [commentText, setCommentText] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details');

  const comments = db.getComments(request.id);
  const attachments = db.getAttachments(request.id);
  const history = db.getHistory(request.id);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSendingComment(true);
    setTimeout(() => {
      try {
        db.addComment(request.id, commentText, 'student_visible');
        setCommentText('');
        setIsSendingComment(false);
        onRefresh();
      } catch (err: any) {
        setIsSendingComment(false);
        alert(err.message || 'Failed to post comment');
      }
    }, 200);
  };

  const handleConfirmResolved = () => {
    if (window.confirm('Are you satisfied that this maintenance issue has been completely fixed in your room?')) {
      try {
        db.confirmResolved(request.id);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Could not confirm resolution');
      }
    }
  };

  const handleReopenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reopenReason.trim()) {
      alert('Please explain why the issue is still unresolved.');
      return;
    }

    try {
      db.reopenRequest(request.id, reopenReason);
      setShowReopenModal(false);
      setReopenReason('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Could not reopen request');
    }
  };

  // Determine active workflow step index
  const currentStepIndex = WORKFLOW_STEPS.indexOf(
    request.status === 'Awaiting Parts' ? 'In Progress' : request.status
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Bar with back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            aria-label="Back to request list"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs sm:text-sm font-bold text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                {request.reference_number}
              </span>
              <StatusBadge status={request.status} />
              <PriorityBadge priority={request.priority} size="sm" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
              {request.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons for Student */}
        <div className="flex items-center gap-2 shrink-0">
          {request.status === 'Resolved' && (
            <>
              <button
                onClick={handleConfirmResolved}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-md transition-colors shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Fixed & Close</span>
              </button>
              <button
                onClick={() => setShowReopenModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-md transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                <span>Still Unresolved?</span>
              </button>
            </>
          )}

          {request.status === 'Closed' && (
            <button
              onClick={() => setShowReopenModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reopen Request</span>
            </button>
          )}
        </div>
      </div>

      {/* Resolution Banner if Resolved or Closed */}
      {request.status === 'Resolved' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-900">
          <div className="flex items-start gap-3">
            <FileCheck2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-950">
                Work Completed by Technician
              </p>
              <p className="text-xs text-emerald-800 mt-0.5">
                {request.work_performed || 'Technician indicated the repairs have been performed.'} Please test and confirm resolution.
              </p>
            </div>
          </div>
          <button
            onClick={handleConfirmResolved}
            className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-md whitespace-nowrap shadow-xs"
          >
            Confirm Issue Fixed
          </button>
        </div>
      )}

      {/* Visual Workflow Progress Stepper */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-6 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
          Request Progress Timeline
        </h2>

        <div className="relative">
          {/* Track line */}
          <div className="absolute top-4 left-3 right-3 sm:left-6 sm:right-6 h-0.5 bg-slate-200 hidden sm:block" />

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 sm:gap-2 relative z-10">
            {WORKFLOW_STEPS.map((step, idx) => {
              const isPastOrCurrent = currentStepIndex >= idx;
              const isCurrent = WORKFLOW_STEPS[currentStepIndex] === step;
              const isAwaitingParts = request.status === 'Awaiting Parts' && step === 'In Progress';

              return (
                <div key={step} className="flex flex-col sm:items-center text-left sm:text-center">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isAwaitingParts
                        ? 'bg-orange-500 text-white ring-4 ring-orange-100'
                        : isCurrent
                        ? 'bg-sky-900 text-white ring-4 ring-sky-100'
                        : isPastOrCurrent
                        ? 'bg-sky-700 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium ${
                      isCurrent ? 'text-sky-950 font-bold' : isPastOrCurrent ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {isAwaitingParts ? 'Awaiting Parts' : step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {request.status === 'Awaiting Parts' && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md text-xs text-orange-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Notice - Awaiting Replacement Components: </span>
              {request.delay_reason || 'Parts ordered from supplier. Work will resume immediately once received.'}
            </div>
          </div>
        )}
      </div>

      {/* Tabs: Details / Comments / History */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'details'
              ? 'border-sky-900 text-sky-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Ticket Information & Photos
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'comments'
              ? 'border-sky-900 text-sky-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Messages & Notes</span>
          <span className="bg-slate-100 text-slate-700 text-[11px] px-1.5 py-0.2 rounded font-mono">
            {comments.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'border-sky-900 text-sky-900 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Log</span>
          <span className="bg-slate-100 text-slate-700 text-[11px] px-1.5 py-0.2 rounded font-mono">
            {history.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Details */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Problem Description
                </h3>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {request.description}
                </p>
              </div>

              {request.work_performed && (
                <div className="pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-800 mb-1">
                    Work Performed by Staff
                  </h3>
                  <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-200">
                    {request.work_performed}
                  </p>
                </div>
              )}

              {/* Photos & Attachments */}
              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center justify-between">
                  <span>Attached Photos & Evidence</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {attachments.length} attachment(s)
                  </span>
                </h3>

                {attachments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No photos attached to this ticket.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {attachments.map((att) => (
                      <div
                        key={att.id}
                        className="border border-slate-200 rounded-md overflow-hidden bg-slate-50 group hover:border-sky-300 transition-colors"
                      >
                        <div className="h-44 bg-slate-100 overflow-hidden relative">
                          <img
                            src={att.storage_path}
                            alt={att.file_name}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                            referrerPolicy="no-referrer"
                          />
                          {att.is_completion_proof && (
                            <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                              Completion Proof
                            </span>
                          )}
                        </div>
                        <div className="p-2.5 flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-800 truncate" title={att.file_name}>
                            {att.file_name}
                          </span>
                          <span className="text-slate-400 text-[11px] shrink-0 ml-2">
                            {att.uploaded_by_name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Metadata */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3.5 text-xs">
              <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">
                Location & Schedule
              </h3>

              <div>
                <span className="text-slate-500 block mb-0.5">Residence Location</span>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-700" />
                  {request.building} · {request.room_number}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Category</span>
                <span className="font-medium text-slate-800">{request.category}</span>
              </div>

              <div>
                <span className="text-slate-500 block mb-0.5">Submitted Date</span>
                <span className="font-mono text-slate-800">
                  {new Date(request.created_at).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>

              {request.preferred_access_time && (
                <div>
                  <span className="text-slate-500 block mb-0.5">Preferred Access Window</span>
                  <span className="font-medium text-slate-800 bg-sky-50 p-1.5 rounded block">
                    {request.preferred_access_time}
                  </span>
                </div>
              )}

              {request.estimated_completion && (
                <div>
                  <span className="text-slate-500 block mb-0.5">Target Completion</span>
                  <span className="font-mono text-slate-800 font-semibold">
                    {new Date(request.estimated_completion).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 block mb-1">Assigned Maintenance Staff</span>
                {request.assigned_to_name ? (
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-200">
                    <div className="w-7 h-7 rounded-full bg-sky-800 text-white font-bold text-xs flex items-center justify-center">
                      {request.assigned_to_name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{request.assigned_to_name}</p>
                      <p className="text-[11px] text-slate-500">Residence Technician</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-500 italic">Pending staff allocation</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Comments & Communication */}
      {activeTab === 'comments' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Staff & Student Messages
              </h3>
              <p className="text-xs text-slate-500">
                Direct updates regarding your maintenance ticket.
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No comments on this request yet. Use the form below to message the maintenance desk.
              </div>
            ) : (
              comments.map((comm) => {
                const isStudent = comm.author_role === 'student';
                return (
                  <div
                    key={comm.id}
                    className={`p-3.5 rounded-lg border text-xs sm:text-sm ${
                      isStudent
                        ? 'bg-sky-50/50 border-sky-100 ml-0 sm:ml-8'
                        : 'bg-slate-50 border-slate-200 mr-0 sm:mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {comm.author_name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                            isStudent
                              ? 'bg-sky-200 text-sky-900'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {comm.author_role}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(comm.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-800 whitespace-pre-line leading-relaxed">
                      {comm.comment}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Add Comment Input */}
          <form onSubmit={handleSendComment} className="pt-3 border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add more information or reply to technician..."
              className="flex-1 px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600"
            />
            <button
              type="submit"
              disabled={isSendingComment || !commentText.trim()}
              className="px-4 py-2 bg-sky-900 hover:bg-sky-800 text-white text-xs sm:text-sm font-semibold rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: History Audit Trail */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
            Timestamped Audit Trail
          </h3>

          <div className="space-y-4">
            {history.map((h, i) => (
              <div key={h.id} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-sky-700 mt-1.5 shrink-0" />
                <div className="flex-1 pb-3 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{h.action}</span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {new Date(h.created_at).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5">
                    Updated by <strong className="font-medium text-slate-800">{h.actor_name}</strong> ({h.actor_role})
                  </p>
                  {h.notes && (
                    <p className="text-slate-500 italic mt-1 bg-slate-50 p-1.5 rounded">
                      "{h.notes}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reopen Request Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Reopen Maintenance Request
            </h3>
            <p className="text-xs text-slate-600">
              Corridor Hill policy allows students to reopen unresolved requests within 5 days of completion. Please describe what is still faulty.
            </p>

            <form onSubmit={handleReopenSubmit} className="space-y-4">
              <textarea
                rows={3}
                value={reopenReason}
                onChange={(e) => setReopenReason(e.target.value)}
                placeholder="e.g. Tap still leaks when turned cold, door still sticks on upper frame..."
                className="w-full p-2.5 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-600 focus:outline-hidden"
                required
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReopenModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white rounded-md transition-colors"
                >
                  Submit Reopen Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
