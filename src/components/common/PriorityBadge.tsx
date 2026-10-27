import React from 'react';
import { RequestPriority } from '../../types/database';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

interface PriorityBadgeProps {
  priority: RequestPriority;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'md' }) => {
  const config: Record<
    RequestPriority,
    { label: string; textClass: string; bgClass: string; borderClass: string; icon: React.ReactNode }
  > = {
    Low: {
      label: 'Low',
      textClass: 'text-slate-600',
      bgClass: 'bg-slate-50',
      borderClass: 'border-slate-200',
      icon: <ArrowDown className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
    Normal: {
      label: 'Normal',
      textClass: 'text-sky-700',
      bgClass: 'bg-sky-50',
      borderClass: 'border-sky-200',
      icon: <ArrowUp className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
    High: {
      label: 'High Priority',
      textClass: 'text-amber-700',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-300',
      icon: <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
    Urgent: {
      label: 'Urgent',
      textClass: 'text-red-700 font-semibold',
      bgClass: 'bg-red-50',
      borderClass: 'border-red-300',
      icon: <AlertCircle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
    },
  };

  const item = config[priority] || config.Normal;

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
