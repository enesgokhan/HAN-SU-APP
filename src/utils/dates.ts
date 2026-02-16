import { addMonths, parseISO, format, differenceInDays, startOfDay } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import { MAINTENANCE_CYCLE_MONTHS } from '../constants/config';
import type { ReminderOverride } from '../types';

export function getNextDueDate(
  installationDate: string,
  lastMaintenanceDate: string | null,
  cycleMonths?: number
): string {
  const baseDate = lastMaintenanceDate ?? installationDate;
  return format(addMonths(parseISO(baseDate), cycleMonths ?? MAINTENANCE_CYCLE_MONTHS), 'yyyy-MM-dd');
}

export function getEffectiveDueDate(
  nextDueDate: string,
  activeSnooze: ReminderOverride | null
): string {
  if (activeSnooze) {
    return activeSnooze.snoozedUntil;
  }
  return nextDueDate;
}

export function getDaysUntilDue(effectiveDueDate: string): number {
  const today = startOfDay(new Date());
  const due = startOfDay(parseISO(effectiveDueDate));
  return differenceInDays(due, today);
}

export function formatDateTr(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMMM yyyy', { locale: tr });
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMM yyyy', { locale: tr });
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function todayISO(): string {
  return toISODate(new Date());
}
