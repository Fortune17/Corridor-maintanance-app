import React, { useState, useEffect } from 'react';
import { AppNotification } from '../../types/database';
import { db } from '../../services/db';
import { Bell, X, ExternalLink } from 'lucide-react';

interface NotificationToastProps {
  onSelectRequest: (requestId: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ onSelectRequest }) => {
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  useEffect(() => {
    const unsubscribe = db.subscribeNotification((notif) => {
      setActiveToast(notif);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  if (!activeToast) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-200">
      <div className="bg-slate-900 text-white p-4 rounded-lg shadow-2xl border border-sky-500/30 flex items-start gap-3">
        <div className="w-8 h-8 rounded-md bg-sky-600 flex items-center justify-center shrink-0 text-white mt-0.5">
          <Bell className="w-4 h-4 animate-bounce" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-sky-300 truncate">
              {activeToast.title}
            </h4>
            <button
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed line-clamp-2">
            {activeToast.message}
          </p>
          <div className="pt-1 flex items-center gap-3">
            <button
              onClick={() => {
                db.markNotificationAsRead(activeToast.id);
                onSelectRequest(activeToast.request_id);
                setActiveToast(null);
              }}
              className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
            >
              <span>Open Request</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-slate-400">Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
};
