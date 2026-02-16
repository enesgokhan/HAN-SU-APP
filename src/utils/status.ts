import type { MaintenanceStatus } from '../types';
import { DUE_SOON_DAYS, UPCOMING_DAYS } from '../constants/config';
import { TR } from '../constants/tr';

export function computeStatus(daysUntilDue: number): MaintenanceStatus {
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= DUE_SOON_DAYS) return 'due_soon';
  if (daysUntilDue <= UPCOMING_DAYS) return 'upcoming';
  return 'ok';
}

export const STATUS_CONFIG = {
  overdue: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-800',
    dot: 'bg-red-500',
  },
  due_soon: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800',
    dot: 'bg-amber-500',
  },
  upcoming: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800',
    dot: 'bg-blue-500',
  },
  ok: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-800',
    dot: 'bg-green-500',
  },
} as const;

export const STATUS_LABELS: Record<MaintenanceStatus, string> = {
  overdue: TR.overdue,
  due_soon: TR.dueSoon,
  upcoming: TR.upcoming,
  ok: TR.ok,
};
