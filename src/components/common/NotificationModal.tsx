import React, { useState, useEffect } from 'react';
import { AppNotification } from '../../types/database';
import { db } from '../../services/db';
import { Bell, CheckCheck, X, Clock, ExternalLink } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRequest: (requestId: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onSelectRequest,
}) => {
  if (!isOpen) return null;

  const [notifications, setNotifications] = useState(db.getNotifications());

  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setNotifications(db.getNotifications());
    });
    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const handleMarkAllRead = () => {
    db.markAllNotificationsAsRead();
  };

  const handleSelect = (notif: AppNotification) => {
    db.markNotificationAsRead(notif.id);
    onSelectRequest(notif.request_id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] mt-12 animate-in fade-in duration-150"
        role="dialog"
        aria-label="Notifications Panel"
      >
        <div className="px-4 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-sky-700" />
            <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="text-xs bg-sky-100 text-sky-800 font-medium px-2 py-0.5 rounded-full tabular-nums">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-sky-700 hover:text-sky-900 font-medium flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-slate-200/50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/50 transition-colors"
              aria-label="Close notifications"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto divide-y divide-slate-100 p-1 flex-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs text-slate-400 mt-1">Updates on your tickets will appear here.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const isUnread = !n.read_at;
              return (
                <div
                  key={n.id}
                  onClick={() => handleSelect(n)}
                  className={`p-3.5 cursor-pointer transition-colors hover:bg-slate-50 flex items-start justify-between gap-3 ${
                    isUnread ? 'bg-sky-50/50' : ''
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-xs md:text-sm font-medium truncate ${isUnread ? 'text-sky-950 font-semibold' : 'text-slate-800'}`}>
                        {n.title}
                      </p>
                      {isUnread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" aria-label="Unread indicator" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 pt-0.5">
                      <Clock className="w-3 h-3" />
                      <span className="tabular-nums">
                        {new Date(n.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="pt-1 text-slate-400 hover:text-slate-600 shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
