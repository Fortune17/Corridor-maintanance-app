import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import {
  BUILDING_BLOCKS,
  BuildingBlock,
  RequestCategory,
  RequestPriority,
} from '../../types/database';
import {
  ISSUE_PRESETS,
  ACCESS_WINDOW_SUGGESTIONS,
  IssuePreset,
} from '../../data/studentHelpers';
import {
  X,
  AlertTriangle,
  Upload,
  CheckCircle,
  Wrench,
  Clock,
} from 'lucide-react';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestCreated: (requestId: string) => void;
  initialTemplate?: IssuePreset | null;
}

const CATEGORIES: RequestCategory[] = [
  'Plumbing and water leaks',
  'Electricity and lighting',
  'Doors, locks and security',
  'Furniture and fixtures',
  'Internet and connectivity',
  'Cleaning and sanitation',
  'Windows and structural damage',
  'Appliances',
  'Other',
];

const BUILDINGS: BuildingBlock[] = BUILDING_BLOCKS;

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  isOpen,
  onClose,
  onRequestCreated,
  initialTemplate,
}) => {
  const currentUser = db.getCurrentUser();

  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<RequestCategory>('Plumbing and water leaks');
  const [description, setDescription] = useState('');
  const [building, setBuilding] = useState<BuildingBlock>(
    currentUser?.building || 'Block B (Pine Hall)'
  );
  const [roomNumber, setRoomNumber] = useState(currentUser?.room_number || '');
  const [priority, setPriority] = useState<RequestPriority>('Normal');
  const [preferredAccessTime, setPreferredAccessTime] = useState('');
  const [attachments, setAttachments] = useState<
    Array<{ file_name: string; storage_path: string; file_type: string; file_size?: number }>
  >([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [dismissedSelfCheck, setDismissedSelfCheck] = useState(false);

  // Reset & apply initial template when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const freshUser = db.getCurrentUser();
    setBuilding(freshUser?.building || 'Block B (Pine Hall)');
    setRoomNumber(freshUser?.room_number || '');
    setAttachments([]);
    setErrors({});
    setSubmitError(null);
    setSuccessRef(null);
    setIsSubmitting(false);
    setDismissedSelfCheck(false);

    if (initialTemplate) {
      setSelectedPresetId(initialTemplate.id);
      setTitle(initialTemplate.title);
      setCategory(initialTemplate.category);
      setPriority(initialTemplate.priority);
      setDescription('');
    } else {
      setSelectedPresetId(null);
      setTitle('');
      setCategory('Plumbing and water leaks');
      setPriority('Normal');
      setDescription('');
    }
    setPreferredAccessTime('');
  }, [isOpen, initialTemplate]);

  if (!isOpen) return null;

  const activePreset =
    ISSUE_PRESETS.find((p) => p.id === selectedPresetId) ||
    ISSUE_PRESETS.find((p) => p.category === category);

  const handleApplyPreset = (preset: IssuePreset) => {
    if (selectedPresetId === preset.id) {
      setSelectedPresetId(null);
      return;
    }
    setSelectedPresetId(preset.id);
    setTitle(preset.title);
    setCategory(preset.category);
    setPriority(preset.priority);
    setDismissedSelfCheck(false);
    setErrors((prev) => ({ ...prev, title: '' }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          attachments: `File "${file.name}" is larger than 5MB. Please choose a smaller image.`,
        }));
        continue;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAttachments((prev) => [
            ...prev,
            {
              file_name: file.name,
              storage_path: event.target!.result as string,
              file_type: file.type || 'image/jpeg',
              file_size: file.size,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Please enter an issue title';
    if (!description.trim()) newErrors.description = 'Please describe the problem in detail';
    if (!building) newErrors.building = 'Please select your building or block';
    if (!roomNumber.trim()) newErrors.roomNumber = 'Please specify your room or communal location';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      try {
        const newReq = db.createRequest({
          title,
          category,
          description,
          building,
          room_number: roomNumber,
          priority,
          preferred_access_time: preferredAccessTime,
          attachments,
        });

        setIsSubmitting(false);
        setSuccessRef(newReq.reference_number);
        setTimeout(() => {
          onRequestCreated(newReq.id);
          onClose();
        }, 1100);
      } catch (err: any) {
        setIsSubmitting(false);
        setSubmitError(err.message || 'Submission failed. Please try again.');
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden my-6"
        role="dialog"
        aria-label="Report Maintenance Issue"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Report a Maintenance Issue
            </h2>
            <p className="text-xs text-slate-500">
              Corridor Hill Residence Maintenance Request Ticket
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency Callout */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-start gap-3 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-amber-950">
              Urgent Safety Guidance:
            </span>
            For active flooding, sparking electrical outlets, fire hazards, or security lockouts, immediately call 24/7 Emergency Desk at{' '}
            <a href="tel:+27115550199" className="font-semibold underline decoration-amber-500">
              +27 (0)11 555-0199
            </a>{' '}
            or visit Block B Security Reception.
          </div>
        </div>

        {successRef ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Request Successfully Submitted!</h3>
            <p className="text-sm text-slate-600">
              Your request reference number is{' '}
              <strong className="font-mono text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                {successRef}
              </strong>
            </p>
            <p className="text-xs text-slate-500">
              You will receive real-time notifications as our maintenance team reviews and schedules your repair.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {submitError && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-800">
                {submitError}
              </div>
            )}

            {/* Quick-Fill Common Issue Presets */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-700">
                Quick-Fill Common Issue
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ISSUE_PRESETS.map((preset) => {
                  const isActive = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap ${
                        isActive
                          ? 'bg-sky-900 text-white border-sky-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Self-Check Guidance Box */}
            {activePreset && !dismissedSelfCheck && activePreset.selfChecks.length > 0 && (
              <div className="p-3.5 rounded-lg bg-sky-50/70 border border-sky-200 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-semibold text-sky-950">
                    <Wrench className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                    <span>30-Second Quick Check ({activePreset.label})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDismissedSelfCheck(true)}
                    className="text-[11px] font-medium text-sky-700 hover:text-sky-950 underline whitespace-nowrap"
                  >
                    Already checked
                  </button>
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-700 leading-relaxed">
                  {activePreset.selfChecks.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
                <div className="pt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Still not working? Complete the form below.</span>
                  <button
                    type="button"
                    onClick={onClose}
                    className="font-semibold text-emerald-700 hover:text-emerald-900 whitespace-nowrap"
                  >
                    That fixed it! Cancel ticket
                  </button>
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Issue Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Shower drain overflowing, Desk lamp socket loose"
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600 ${
                  errors.title ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                }`}
              />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
            </div>

            {/* Category & Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Category <span className="text-red-600">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value as RequestCategory);
                    setDismissedSelfCheck(false);
                  }}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600 bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Priority Level <span className="text-red-600">*</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as RequestPriority)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600 bg-white"
                >
                  <option value="Low">Low - Cosmetic or non-urgent repair</option>
                  <option value="Normal">Normal - Standard room maintenance</option>
                  <option value="High">High - Significant inconvenience or security risk</option>
                  <option value="Urgent">Urgent - Threat of property damage / hazard</option>
                </select>
              </div>
            </div>

            {/* Building & Room Location Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Building Block <span className="text-red-600">*</span>
                </label>
                <select
                  value={building}
                  onChange={(e) => setBuilding(e.target.value as BuildingBlock)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600 bg-white"
                >
                  {BUILDINGS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Room / Location <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. Room 204 or Ground Floor Kitchen"
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600 ${
                    errors.roomNumber ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.roomNumber && <p className="text-xs text-red-600 mt-1">{errors.roomNumber}</p>}
              </div>
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Description of the Problem <span className="text-red-600">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  activePreset?.descriptionHint ||
                  'Please describe what happened, when it started, and specific details that will help our technician bring the right replacement tools.'
                }
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600 ${
                  errors.description ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                }`}
              />
              {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
            </div>

            {/* Preferred Access Time with 1-Tap Suggestions */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-800">
                Preferred Access Time <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={preferredAccessTime}
                onChange={(e) => setPreferredAccessTime(e.target.value)}
                placeholder="e.g. Weekdays after 14:00, or anytime with security escort"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600"
              />
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {ACCESS_WINDOW_SUGGESTIONS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setPreferredAccessTime(slot)}
                    className={`px-2 py-1 text-[11px] rounded border transition-colors whitespace-nowrap ${
                      preferredAccessTime === slot
                        ? 'bg-sky-50 border-sky-300 text-sky-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Attachments */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Attach Photos of the Problem <span className="text-slate-400 font-normal">(Optional, up to 5MB each)</span>
              </label>

              <div className="mt-1 flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors">
                  <Upload className="w-4 h-4 text-slate-500" />
                  <span>Choose Photo(s)</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-slate-500">JPG, PNG, WebP supported</span>
              </div>
              {errors.attachments && <p className="text-xs text-red-600 mt-1">{errors.attachments}</p>}

              {attachments.length > 0 && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="relative group border border-slate-200 rounded-md p-1.5 bg-slate-50 flex items-center gap-2"
                    >
                      <img
                        src={att.storage_path}
                        alt={att.file_name}
                        className="w-10 h-10 object-cover rounded"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-800 truncate">
                          {att.file_name}
                        </p>
                        <p className="text-[10px] text-slate-400 tabular-nums">
                          {att.file_size ? `${Math.round(att.file_size / 1024)} KB` : 'Image'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded"
                        aria-label="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-sky-900 hover:bg-sky-800 rounded-md transition-colors shadow-xs disabled:opacity-50 whitespace-nowrap"
              >
                {isSubmitting ? 'Registering Request...' : 'Submit Maintenance Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
