/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { Profile } from './types/database';
import { Header } from './components/common/Header';
import { LoginForm } from './components/auth/LoginForm';
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentRequestDetail } from './components/student/StudentRequestDetail';
import { NewRequestModal } from './components/student/NewRequestModal';
import { ResidenceInfo } from './components/student/ResidenceInfo';
import { StaffRequestTable } from './components/staff/StaffRequestTable';
import { StaffRequestDetail } from './components/staff/StaffRequestDetail';
import { StaffAnalytics } from './components/staff/StaffAnalytics';
import { StaffTeam } from './components/staff/StaffTeam';
import { SupabaseModal } from './components/database/SupabaseModal';
import { NotificationToast } from './components/common/NotificationToast';

export default function App() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(db.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('student_requests');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [, setTick] = useState(0);

  // Subscribe to DB changes
  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setCurrentUser(db.getCurrentUser());
      setTick((t) => t + 1);
    });
    return () => unsubscribe();
  }, []);

  // Sync default tab when user changes
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'staff' || currentUser.role === 'admin') {
        setActiveTab('staff_requests');
      } else {
        setActiveTab('student_requests');
      }
      setSelectedRequestId(null);
    }
  }, [currentUser?.id, currentUser?.role]);

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
  };

  const handleBackToList = () => {
    setSelectedRequestId(null);
  };

  // If not logged in, show login page
  if (!currentUser) {
    return (
      <>
        <LoginForm
          onLoginSuccess={() => {
            const user = db.getCurrentUser();
            setCurrentUser(user);
          }}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        />
        <SupabaseModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
        />
      </>
    );
  }

  const isStaff = currentUser.role === 'staff' || currentUser.role === 'admin';
  const selectedRequest = selectedRequestId ? db.getRequestById(selectedRequestId) : null;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Navigation Header */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedRequestId(null);
        }}
        onOpenNewRequestModal={() => setIsNewRequestModalOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onSelectRequest={handleSelectRequest}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* If a specific request is open */}
        {selectedRequest ? (
          isStaff ? (
            <StaffRequestDetail
              request={selectedRequest}
              onBack={handleBackToList}
              onRefresh={() => setTick((t) => t + 1)}
            />
          ) : (
            <StudentRequestDetail
              request={selectedRequest}
              onBack={handleBackToList}
              onRefresh={() => setTick((t) => t + 1)}
            />
          )
        ) : (
          /* Tab Views */
          <>
            {/* Student Views */}
            {!isStaff && (
              <>
                {activeTab === 'student_requests' && (
                  <StudentDashboard
                    onOpenNewRequestModal={() => setIsNewRequestModalOpen(true)}
                    onSelectRequest={handleSelectRequest}
                  />
                )}
                {activeTab === 'residence_info' && <ResidenceInfo />}
              </>
            )}

            {/* Staff Views */}
            {isStaff && (
              <>
                {activeTab === 'staff_requests' && (
                  <StaffRequestTable
                    onSelectRequest={handleSelectRequest}
                    onOpenNewRequestModal={() => setIsNewRequestModalOpen(true)}
                  />
                )}
                {activeTab === 'analytics' && (
                  <StaffAnalytics onSelectRequest={handleSelectRequest} />
                )}
                {activeTab === 'staff_team' && <StaffTeam />}
              </>
            )}
          </>
        )}
      </main>

      {/* Guided Request Modal */}
      <NewRequestModal
        isOpen={isNewRequestModalOpen}
        onClose={() => setIsNewRequestModalOpen(false)}
        onRequestCreated={(newId) => {
          setSelectedRequestId(newId);
        }}
      />

      {/* Real-time In-App Notification Toast */}
      <NotificationToast onSelectRequest={handleSelectRequest} />

      {/* Supabase Schema & RLS Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* Supabase Schema & RLS Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      {/* Institutional Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Corridor Hill Student Residence</span>
            <span>·</span>
            <span>Facilities & Maintenance Portal</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSupabaseModalOpen(true)}
              className="hover:text-slate-900 transition-colors underline"
            >
              PostgreSQL / Supabase Schema
            </button>
            <span>·</span>
            <span>24/7 Security: +27 (0)11 555-0199</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
