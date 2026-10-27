import React from 'react';
import { RequestStatus } from '../../types/database';
import { 
  Clock, 
  Search, 
  UserCheck, 
  Wrench, 
  PauseCircle, 
  CheckCircle2, 
  Archive 
} from 'lucide-react';

interface StatusBadgeProps {
  status: RequestStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config: Record<
    RequestStatus,
    { label: string; textClass: string; bgClass: string; borderClass: string; icon: React.ReactNode }
  > = {
    Submitted: {
      label: 'Submitted',
      textClass: 'text-slate-700',
      bgClass: 'bg-slate-100',
      borderClass: 'border-slate-200',
      icon: <Clock className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
    'Under Review': {
      label: 'Under Review',
      textClass: 'text-amber-800',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-200',
      icon: <Search className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
    Assigned: {
      label: 'Assigned',
      textClass: 'text-sky-800',
      bgClass: 'bg-sky-50',
      borderClass: 'border-sky-200',
      icon: <UserCheck className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
    'In Progress': {
      label: 'In Progress',
      textClass: 'text-blue-800',
      bgClass: 'bg-blue-50',
      borderClass: 'border-blue-200',
      icon: <Wrench className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
    'Awaiting Parts': {
      label: 'Awaiting Parts',
      textClass: 'text-orange-800',
      bgClass: 'bg-orange-50',
      borderClass: 'border-orange-200',
      icon: <PauseCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
    Resolved: {
      label: 'Resolved',
      textClass: 'text-emerald-800',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-200',
      icon: <CheckCircle2 className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
    Closed: {
      label: 'Closed',
      textClass: 'text-slate-600',
      bgClass: 'bg-slate-100',
      borderClass: 'border-slate-300',
      icon: <Archive className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
  };

  const item = config[status] || config.Submitted;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded px-2 py-0.5 ${
        size === 'sm' ? 'text-xs' : 'text-xs md:text-sm'
      } ${item.bgClass} ${item.textClass} ${item.borderClass}`}
    >
      <span className="shrink-0">{item.icon}</span>
      <span className="whitespace-nowrap">{item.label}</span>
    </span>
  );
};
