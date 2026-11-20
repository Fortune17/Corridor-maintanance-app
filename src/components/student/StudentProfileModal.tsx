import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { BUILDING_BLOCKS, BuildingBlock, Profile } from '../../types/database';
import { X, CheckCircle2, User, Home, Phone, Building2, BookOpen, Plus } from 'lucide-react';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Profile;
}

const BUILDINGS: BuildingBlock[] = BUILDING_BLOCKS;

const SUGGESTED_INTERESTS = [
  'Study Groups',
  'Football',
  'Basketball',
  'Gaming',
  'Running Club',
  'Music & Arts',
  'Cooking',
  'Tech & Coding',
];

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [fullName, setFullName] = useState(currentUser.full_name || '');
  const [building, setBuilding] = useState<BuildingBlock>(
    currentUser.building || 'Block B (Pine Hall)'
  );
  const [roomNumber, setRoomNumber] = useState(currentUser.room_number || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phone_number || '');
  const [course, setCourse] = useState(currentUser.course || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [interests, setInterests] = useState<string[]>(currentUser.interests || []);
  const [customInterest, setCustomInterest] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFullName(currentUser.full_name || '');
      setBuilding(currentUser.building || 'Block B (Pine Hall)');
      setRoomNumber(currentUser.room_number || '');
      setPhoneNumber(currentUser.phone_number || '');
      setCourse(currentUser.course || '');
      setBio(currentUser.bio || '');
      setInterests(currentUser.interests || []);
      setCustomInterest('');
      setSavedNotice(false);
      setError(null);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const toggleInterest = (tag: string) => {
    setInterests((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag].slice(0, 8)
    );
  };

  const handleAddCustomInterest = () => {
    const clean = customInterest.trim();
    if (!clean) return;
    if (!interests.includes(clean)) {
      setInterests((prev) => [...prev, clean].slice(0, 8));
    }
    setCustomInterest('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Full name cannot be empty.');
      return;
    }

    if (currentUser.role === 'student' && !roomNumber.trim()) {
      setError('Please enter your current room number.');
      return;
    }

    try {
      db.updateCurrentUserProfile({
        full_name: fullName,
        building,
        room_number: roomNumber,
        phone_number: phoneNumber,
        course,
        bio,
        interests,
      });
      setSavedNotice(true);
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Could not save profile changes.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
        role="dialog"
        aria-label="Update Residence Profile"
      >
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900">Residence & Community Profile</h2>
            <p className="text-xs text-slate-500">
              {currentUser.email}
              {currentUser.student_number ? ` · ${currentUser.student_number}` : ''}
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-2.5 text-xs text-red-800 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {savedNotice && (
            <div className="p-2.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Your residence & community profile has been updated.</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Building Block
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <select
                  value={building}
                  onChange={(e) => setBuilding(e.target.value as BuildingBlock)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-hidden focus:ring-2 focus:ring-sky-600"
                >
                  {BUILDINGS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Room Number
              </label>
              <div className="relative">
                <Home className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. Room 204"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile / WhatsApp Contact
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+27 82 000 0000"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Course / Department
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. BCom Accounting · 2nd Year"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Short Bio (Shown on Your Residence Profile)
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={240}
              placeholder="Introduce yourself to floor mates and friends at Corridor Hill..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Interests & Societies (up to 8)
              </label>
              <span className="text-[11px] text-slate-400 tabular-nums">{interests.length}/8</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {SUGGESTED_INTERESTS.map((tag) => {
                const active = interests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                      active
                        ? 'bg-sky-900 text-white border-sky-900 font-medium'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-sky-400'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
              {interests
                .filter((i) => !SUGGESTED_INTERESTS.includes(i))
                .map((custom) => (
                  <button
                    key={custom}
                    type="button"
                    onClick={() => toggleInterest(custom)}
                    className="text-xs px-2.5 py-1 rounded-md border bg-sky-900 text-white border-sky-900 font-medium"
                  >
                    {custom} &times;
                  </button>
                ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomInterest();
                  }
                }}
                placeholder="Add another interest..."
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-sky-600"
              />
              <button
                type="button"
                onClick={handleAddCustomInterest}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md inline-flex items-center gap-1 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-900 hover:bg-sky-800 rounded-md transition-colors whitespace-nowrap"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
