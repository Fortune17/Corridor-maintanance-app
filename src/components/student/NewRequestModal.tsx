import React, { useState } from 'react';
import { db } from '../../services/db';
import { 
  BuildingBlock, 
  RequestCategory, 
  RequestPriority 
} from '../../types/database';
import { 
  X, 
  AlertTriangle, 
  Upload, 
  CheckCircle, 
  PhoneCall, 
  Image as ImageIcon,
  Clock,
  Sparkles
} from 'lucide-react';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestCreated: (requestId: string) => void;
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

const BUILDINGS: BuildingBlock[] = [
  'Block A (Oak Hall)',
  'Block B (Pine Hall)',
  'Block C (Maple Hall)',
  'Block D (Cedar Hall)',
  'Block E (Willow Annex)',
  'Communal Facilities',
];

export const NewRequestModal: React.FC<NewRequestModalProps> = ({
  isOpen,
  onClose,
  onRequestCreated,
}) => {
  const currentUser = db.getCurrentUser();

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate size (< 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is larger than 5MB. Please upload a smaller image.`);
        continue;
      }

      // Convert to Data URL for instant resilient preview and persistence
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
        }, 1200);
      } catch (err: any) {
        setIsSubmitting(false);
        alert(err.message || 'Submission failed');
      }
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden my-8"
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
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Emergency Callout (Per Specification) */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-start gap-3 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block text-amber-950">
              Urgent Safety Guidance:
            </span>
            Submitting this online ticket is not an immediate emergency dispatch service. For life-safety emergencies (active burst pipes/flooding, sparking wires, fire hazards, or security lockouts), immediately call Corridor Hill 24/7 Emergency Desk at{' '}
            <strong className="underline decoration-amber-400">+27 (0)11 555-0199</strong> or visit Block B Security Reception.
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
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1">
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
                <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1">
                  Category <span className="text-red-600">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as RequestCategory)}
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
                <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1">
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
                <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1">
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
                <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1">
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
              <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1">
                Description of the Problem <span className="text-red-600">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe what happened, when it started, and specific details that will help our technician bring the right replacement tools."
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600 ${
                  errors.description ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                }`}
              />
              {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
            </div>

            {/* Preferred Access Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1">
                Preferred Access Time <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={preferredAccessTime}
                onChange={(e) => setPreferredAccessTime(e.target.value)}
                placeholder="e.g. Weekdays after 14:00, or anytime with security master key escort"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600"
              />
            </div>

            {/* Photo Attachments */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1">
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

              {/* Uploaded Thumbnails Preview */}
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
                        <p className="text-[10px] text-slate-400">
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
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-sky-900 hover:bg-sky-800 rounded-md transition-colors shadow-xs disabled:opacity-50"
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
