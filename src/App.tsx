/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { db } from './services/db';
import { Profile } from './types/database';
import { IssuePreset } from './data/studentHelpers';
import { Header } from './components/common/Header';
import { LoginForm } from './components/auth/LoginForm';
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentRequestDetail } from './components/student/StudentRequestDetail';
import { NewRequestModal } from './components/student/NewRequestModal';
import { StudentProfileModal } from './components/student/StudentProfileModal';
import { ResidenceInfo } from './components/student/ResidenceInfo';
import { ResidenceForum } from './components/social/ResidenceForum';
import { PeopleDirectory } from './components/social/PeopleDirectory';
import { StaffRequestTable } from './components/staff/StaffRequestTable';
import { StaffRequestDetail } from './components/staff/StaffRequestDetail';
import { StaffAnalytics } from './components/staff/StaffAnalytics';
import { StaffTeam } from './components/staff/StaffTeam';
import { NotificationToast } from './components/common/NotificationToast';
import { PitchDeckModal } from './components/presentation/PitchDeckModal';
import { VoiceConversationModal } from './components/common/VoiceConversationModal';
import { OfflineIndicator } from './components/common/OfflineIndicator';

// Helper to determine initial tab based on role and stored preference
const getInitialTab = (user: Profile | null): string => {
  const saved = localStorage.getItem('chm_active_tab_v2');
  if (!user) return saved || 'student_requests';
  const isStaff = user.role === 'staff' || user.role === 'admin';
  if (isStaff) {
    const validStaffTabs = ['staff_requests', 'forum', 'people', 'analytics', 'staff_team'];
    return saved && validStaffTabs.includes(saved) ? saved : 'staff_requests';
  } else {
    const validStudentTabs = ['student_requests', 'forum', 'people', 'residence_info'];
    return saved && validStudentTabs.includes(saved) ? saved : 'student_requests';
  }
};

const getInitialRequestId = (): string | null => {
  const savedReqId = localStorage.getItem('chm_selected_req_v2');
  if (savedReqId && db.getRequestById(savedReqId)) {
    return savedReqId;
  }
  return null;
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<Profile | null>(() => db.getCurrentUser());
  const [activeTab, setActiveTabState] = useState<string>(() => getInitialTab(db.getCurrentUser()));
  const [selectedRequestId, setSelectedRequestIdState] = useState<string | null>(() => getInitialRequestId());
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [newRequestPreset, setNewRequestPreset] = useState<IssuePreset | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isPitchDeckOpen, setIsPitchDeckOpen] = useState(false);
  const [, setTick] = useState(0);

  // Subscribe to DB changes
  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      const u = db.getCurrentUser();
      setCurrentUser(u);
      setTick((t) => t + 1);
    });
    return () => unsubscribe();
  }, []);

  // Update tab and preserve in localStorage
  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    localStorage.setItem('chm_active_tab_v2', tab);
    // When switching top-level tabs, reset selected request
    setSelectedRequestIdState(null);
    localStorage.removeItem('chm_selected_req_v2');
  };

  // Select request and preserve in localStorage so reloads keep the user on the same request
  const handleSelectRequest = (requestId: string | null) => {
    setSelectedRequestIdState(requestId);
    if (requestId) {
      localStorage.setItem('chm_selected_req_v2', requestId);
    } else {
      localStorage.removeItem('chm_selected_req_v2');
    }
  };

  const handleBackToList = () => {
    handleSelectRequest(null);
  };

  const openNewRequestModal = (preset?: IssuePreset) => {
    setNewRequestPreset(preset || null);
    setIsNewRequestModalOpen(true);
  };

  // If not logged in, show login page
  if (!currentUser) {
    return (
      <>
        <LoginForm
          onLoginSuccess={() => {
            const user = db.getCurrentUser();
            setCurrentUser(user);
            const initTab = getInitialTab(user);
            setActiveTabState(initTab);
            localStorage.setItem('chm_active_tab_v2', initTab);
          }}
        />
        <OfflineIndicator />
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
        setActiveTab={setActiveTab}
        onOpenNewRequestModal={() => openNewRequestModal()}
        onSelectRequest={handleSelectRequest}
        onOpenPitchDeck={!isStaff ? () => setIsPitchDeckOpen(true) : undefined}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
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
            {/* Shared Social & Announcements Views */}
            {activeTab === 'forum' && (
              <ResidenceForum onOpenOwnProfileModal={() => setIsProfileModalOpen(true)} />
            )}
            {activeTab === 'people' && (
              <PeopleDirectory onOpenOwnProfileModal={() => setIsProfileModalOpen(true)} />
            )}

            {/* Student Views */}
            {!isStaff && (
              <>
                {activeTab === 'student_requests' && (
                  <StudentDashboard
                    onOpenNewRequestModal={openNewRequestModal}
                    onSelectRequest={handleSelectRequest}
                    onOpenProfileModal={() => setIsProfileModalOpen(true)}
                    onOpenResidenceGuide={() => setActiveTab('residence_info')}
                    onOpenForum={() => setActiveTab('forum')}
                    onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
                  />
                )}
                {activeTab === 'residence_info' && (
                  <ResidenceInfo onOpenNewRequestModal={openNewRequestModal} />
                )}
              </>
            )}

            {/* Staff & Manager Views */}
            {isStaff && (
              <>
                {activeTab === 'staff_requests' && (
                  <StaffRequestTable
                    onSelectRequest={handleSelectRequest}
                    onOpenNewRequestModal={() => openNewRequestModal()}
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
        onClose={() => {
          setIsNewRequestModalOpen(false);
          setNewRequestPreset(null);
        }}
        initialTemplate={newRequestPreset}
        onRequestCreated={(newId) => {
          handleSelectRequest(newId);
        }}
      />

      {/* Profile & Room Editor Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
      />

      {/* Real-Time Gemini Live Voice Conversation Modal */}
      <VoiceConversationModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />

      {/* Real-time In-App Notification Toast */}
      <NotificationToast onSelectRequest={handleSelectRequest} />

      {/* Residence Owner Pitch Deck & Commercial Proposal Modal (Only for non-staff) */}
      {!isStaff && (
        <PitchDeckModal
          isOpen={isPitchDeckOpen}
          onClose={() => setIsPitchDeckOpen(false)}
        />
      )}

      {/* Offline Status Toast */}
      <OfflineIndicator />

      {/* Institutional Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Corridor Hill Student Residence</span>
            <span>·</span>
            <span>Facilities & Maintenance Portal</span>
          </div>

          <div className="flex items-center gap-4">
            {!isStaff && (
              <>
                <button
                  onClick={() => setIsPitchDeckOpen(true)}
                  className="hover:text-amber-600 font-medium transition-colors"
                >
                  Owner Pitch Deck (R500k)
                </button>
                <span>·</span>
              </>
            )}
            <span>24/7 Security: +27 (0)11 555-0199</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
