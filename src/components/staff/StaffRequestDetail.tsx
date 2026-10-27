import React, { useState } from 'react';
import { MaintenanceRequest, RequestStatus, RequestPriority, CommentVisibility } from '../../types/database';
import { db } from '../../services/db';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { 
  ArrowLeft, 
  MapPin, 
  User, 
  Wrench, 
  Clock, 
  Calendar, 
  Send, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Eye, 
  History, 
  MessageSquare, 
  PauseCircle,
  FileText
} from 'lucide-react';

interface StaffRequestDetailProps {
  request: MaintenanceRequest;
  onBack: () => void;
  onRefresh: () => void;
}

export const StaffRequestDetail: React.FC<StaffRequestDetailProps> = ({
  request,
  onBack,
  onRefresh,
}) => {
  const staffMembers = db.getStaffMembers();
  const student = db.getStudentProfile(request.student_id);

  // Local state for actions
  const [selectedTech, setSelectedTech] = useState(request.assigned_to || '');
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus>(request.status);
  const [selectedPriority, setSelectedPriority] = useState<RequestPriority>(request.priority);
  const [statusNote, setStatusNote] = useState('');
  const [delayReason, setDelayReason] = useState(request.delay_reason || '');
  const [workPerformed, setWorkPerformed] = useState(request.work_performed || '');
  const [estimatedCompletion, setEstimatedCompletion] = useState(
    request.estimated_completion ? request.estimated_completion.slice(0, 16) : ''
  );

  // Comments state
  const [commentText, setCommentText] = useState('');
  const [commentVisibility, setCommentVisibility] = useState<CommentVisibility>('student_visible');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Completion photo upload
  const [uploadProofModalOpen, setUploadProofModalOpen] = useState(false);
  const [proofFileName, setProofFileName] = useState('');
  const [proofFileData, setProofFileData] = useState('');

  const comments = db.getComments(request.id);
  const attachments = db.getAttachments(request.id);
  const history = db.getHistory(request.id);

  const handleAssignTech = () => {
    if (!selectedTech) return;
    try {
      db.assignTechnician(request.id, selectedTech);
      alert('Technician assigned successfully.');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to assign technician');
    }
  };

  const handleUpdateStatus = () => {
    try {
      db.updateRequestStatus(request.id, selectedStatus, {
        notes: statusNote,
        delay_reason: delayReason,
        work_performed: workPerformed,
        estimated_completion: estimatedCompletion ? new Date(estimatedCompletion).toISOString() : undefined,
      });
      alert(`Request status updated to ${selectedStatus}.`);
      setStatusNote('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleUpdatePriority = () => {
    try {
      db.updatePriority(request.id, selectedPriority);
      alert(`Priority updated to ${selectedPriority}`);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update priority');
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    setTimeout(() => {
      try {
        db.addComment(request.id, commentText, commentVisibility);
        setCommentText('');
        setIsSubmittingComment(false);
        onRefresh();
      } catch (err: any) {
        setIsSubmittingComment(false);
        alert(err.message || 'Failed to add comment');
      }
    }, 150);
  };

  const handleUploadProof = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setProofFileData(event.target.result as string);
        setProofFileName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const submitProofPhoto = () => {
    if (!proofFileData) return;
    try {
      db.addAttachment(request.id, {
        storage_path: proofFileData,
        file_name: proofFileName || 'completion_evidence.jpg',
        file_type: 'image/jpeg',
        is_completion_proof: true,
      });
      setProofFileData('');
      setProofFileName('');
      setUploadProofModalOpen(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
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

        <div className="flex items-center gap-2">
          <button
            onClick={() => setUploadProofModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Upload Work Proof Photo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Main Details, Workflow Controls & Conversation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Summary */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Student Description & Details
            </h2>
            <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50/70 p-3.5 rounded-md border border-slate-200">
              {request.description}
            </p>

            {/* Photos attached */}
            <div className="pt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Attached Images ({attachments.length})
              </h3>
              {attachments.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No attachments submitted.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className="border border-slate-200 rounded-md overflow-hidden bg-slate-50 relative group"
                    >
                      <div className="h-32 bg-slate-100 overflow-hidden">
                        <img
                          src={att.storage_path}
                          alt={att.file_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      {att.is_completion_proof && (
                        <span className="absolute top-1.5 left-1.5 bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                          Completion Proof
                        </span>
                      )}
                      <div className="p-1.5 text-[11px] truncate text-slate-700 font-medium">
                        {att.file_name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Workflow & Status Update Panel */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-sky-700" />
                <span>Workflow & Status Controls</span>
              </h2>
              <span className="text-xs text-slate-500">Authorized Maintenance Actions</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Update Ticket Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as RequestStatus)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-600 bg-white"
                >
                  <option value="Submitted">Submitted (New queue)</option>
                  <option value="Under Review">Under Review (Assessing fault)</option>
                  <option value="Assigned">Assigned (Ready for work)</option>
                  <option value="In Progress">In Progress (Work started)</option>
                  <option value="Awaiting Parts">Awaiting Parts (Delayed for stock)</option>
                  <option value="Resolved">Resolved (Repairs completed)</option>
                  <option value="Closed">Closed (Confirmed fixed)</option>
                </select>
              </div>

              {/* Target Estimated Completion */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Completion Date/Time
                </label>
                <input
                  type="datetime-local"
                  value={estimatedCompletion}
                  onChange={(e) => setEstimatedCompletion(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-600"
                />
              </div>
            </div>

            {/* Delay Reason if Awaiting Parts */}
            {selectedStatus === 'Awaiting Parts' && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                <label className="block text-xs font-semibold text-orange-950 mb-1">
                  Reason for Delay / Parts on Order <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={2}
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  placeholder="e.g. Geyser heating element model 240V-3kW ordered from Central Depot. ETA Monday."
                  className="w-full p-2 text-xs border border-orange-300 rounded-md bg-white focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}

            {/* Work Performed description if Resolved */}
            {(selectedStatus === 'Resolved' || selectedStatus === 'Closed') && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                <label className="block text-xs font-semibold text-emerald-950 mb-1">
                  Work Performed / Resolution Summary <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={2}
                  value={workPerformed}
                  onChange={(e) => setWorkPerformed(e.target.value)}
                  placeholder="e.g. Cleared blockage with power snake, replaced rubber compression O-ring, tested pressure."
                  className="w-full p-2 text-xs border border-emerald-300 rounded-md bg-white focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            )}

            {/* Notes on this status change */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Change Note / Audit Memo <span className="text-slate-400 font-normal">(Recorded in History)</span>
              </label>
              <input
                type="text"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Brief reason for updating status..."
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleUpdateStatus}
                className="px-4 py-2 bg-sky-900 hover:bg-sky-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors"
              >
                Apply Status & Workflow Changes
              </button>
            </div>
          </div>

          {/* Comments & Communication (Student Visible vs Staff Internal Notes) */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Ticket Comments & Staff Internal Notes
                </h3>
                <p className="text-xs text-slate-500">
                  RLS ensures internal notes are strictly hidden from students.
                </p>
              </div>
            </div>

            {/* Comment Stream */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No comments yet.</p>
              ) : (
                comments.map((comm) => {
                  const isStaffOnly = comm.visibility === 'staff_only';
                  return (
                    <div
                      key={comm.id}
                      className={`p-3 rounded-lg border text-xs sm:text-sm ${
                        isStaffOnly
                          ? 'bg-amber-50/70 border-amber-200'
                          : comm.author_role === 'student'
                          ? 'bg-sky-50/60 border-sky-100'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{comm.author_name}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-500">
                            ({comm.author_role})
                          </span>
                          {isStaffOnly ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-200/80 px-1.5 py-0.2 rounded">
                              <Lock className="w-3 h-3" />
                              Internal Note (Staff Only)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-800 bg-sky-100 px-1.5 py-0.2 rounded">
                              <Eye className="w-3 h-3" />
                              Visible to Student
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(comm.created_at).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short',
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

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="pt-3 border-t border-slate-200 space-y-2">
              <div className="flex items-center gap-4 text-xs">
                <span className="font-semibold text-slate-700">Visibility:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="visibility"
                    checked={commentVisibility === 'student_visible'}
                    onChange={() => setCommentVisibility('student_visible')}
                    className="text-sky-600"
                  />
                  <span>Student Visible (Public update)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-amber-900 font-medium">
                  <input
                    type="radio"
                    name="visibility"
                    checked={commentVisibility === 'staff_only'}
                    onChange={() => setCommentVisibility('staff_only')}
                    className="text-amber-600"
                  />
                  <span>Staff Internal Note (Hidden from student)</span>
                </label>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    commentVisibility === 'staff_only'
                      ? 'Type internal note for maintenance crew...'
                      : 'Post progress comment for student...'
                  }
                  className="flex-1 px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-600"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !commentText.trim()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-md flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Post</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Sidebar: Assignment, Student Info & Audit Trail */}
        <div className="space-y-4">
          {/* Assignment Box */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3.5 text-xs">
            <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Technician Assignment</span>
              <Wrench className="w-4 h-4 text-slate-400" />
            </h3>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Assigned Staff Member:
              </label>
              <select
                value={selectedTech}
                onChange={(e) => setSelectedTech(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-sky-600 bg-white"
              >
                <option value="">-- Unassigned --</option>
                {staffMembers.map((sm) => (
                  <option key={sm.id} value={sm.id}>
                    {sm.full_name} ({sm.email.split('@')[0]})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleAssignTech}
              disabled={!selectedTech || selectedTech === request.assigned_to}
              className="w-full py-1.5 text-xs font-semibold text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md transition-colors disabled:opacity-50"
            >
              Update Technician Assignment
            </button>
          </div>

          {/* Priority Box */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3.5 text-xs">
            <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">
              Priority Adjustment
            </h3>

            <div className="flex gap-2">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value as RequestPriority)}
                className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-md bg-white"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
              <button
                type="button"
                onClick={handleUpdatePriority}
                disabled={selectedPriority === request.priority}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-md text-xs font-medium hover:bg-slate-700 disabled:opacity-40"
              >
                Set
              </button>
            </div>
          </div>

          {/* Student Profile Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-2.5 text-xs">
            <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Student Details</span>
              <User className="w-4 h-4 text-slate-400" />
            </h3>

            <div>
              <span className="text-slate-500 block">Full Name:</span>
              <span className="font-semibold text-slate-900">{student?.full_name || 'Resident Student'}</span>
            </div>

            <div>
              <span className="text-slate-500 block">Student Number:</span>
              <span className="font-mono text-slate-800">{student?.student_number || 'N/A'}</span>
            </div>

            <div>
              <span className="text-slate-500 block">Location:</span>
              <span className="font-medium text-slate-800">{request.building} · {request.room_number}</span>
            </div>

            <div>
              <span className="text-slate-500 block">Contact Email / Phone:</span>
              <span className="text-slate-800">{student?.email}</span>
              {student?.phone_number && (
                <span className="text-slate-600 block">{student.phone_number}</span>
              )}
            </div>

            {request.preferred_access_time && (
              <div>
                <span className="text-slate-500 block">Student Access Window:</span>
                <span className="text-sky-900 font-medium bg-sky-50 p-1.5 rounded block">
                  {request.preferred_access_time}
                </span>
              </div>
            )}
          </div>

          {/* Compact Audit History */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-3 text-xs">
            <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Timestamped Audit History</span>
              <History className="w-4 h-4 text-slate-400" />
            </h3>

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {history.map((h) => (
                <div key={h.id} className="pb-2.5 border-b border-slate-100 last:border-none">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{h.action}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {new Date(h.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    By {h.actor_name}
                  </p>
                  {h.notes && (
                    <p className="text-[11px] text-slate-600 italic mt-0.5">"{h.notes}"</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Proof Photo Modal */}
      {uploadProofModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Upload Work Completion Proof
            </h3>
            <p className="text-xs text-slate-600">
              Attach photographic evidence demonstrating that repairs have been successfully completed.
            </p>

            <label className="cursor-pointer block border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-sky-500 transition-colors bg-slate-50">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <span className="text-xs font-semibold text-sky-800 block">
                {proofFileName ? proofFileName : 'Click to select photo from device'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">JPG, PNG up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadProof}
                className="hidden"
              />
            </label>

            {proofFileData && (
              <div className="h-36 bg-slate-100 rounded overflow-hidden">
                <img
                  src={proofFileData}
                  alt="Proof preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUploadProofModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!proofFileData}
                onClick={submitProofPhoto}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-md disabled:opacity-40"
              >
                Save Proof Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
