import { addMonths, parseISO, format, differenceInDays, startOfDay } from 'date-fns';
import { tr } from 'date-fns/locale/tr';
import { MAINTENANCE_CYCLE_MONTHS } from '../constants/config';
import type { Customer, MaintenanceRecord, MaintenanceType, ReminderOverride } from '../types';

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
    const snoozedDate = startOfDay(parseISO(activeSnooze.snoozedUntil));
    if (snoozedDate >= startOfDay(new Date())) {
      return activeSnooze.snoozedUntil;
    }
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

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Günaydın';
  if (hour < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

export function formatTodayFull(): string {
  return format(new Date(), 'd MMMM yyyy, EEEE', { locale: tr });
}

export function formatDateWithDay(dateStr: string): string {
  return format(parseISO(dateStr), 'd MMM, EEEE', { locale: tr });
}

export interface TypeDueDate {
  type: MaintenanceType;
  nextDueDate: string;
  lastDate: string | null;
  cycleMonths: number;
}

/**
 * For customers with per-type cycles, compute the next due date for each enabled type.
 * Returns the earliest due date as overall, plus the per-type breakdown.
 */
export function getPerTypeDueDates(
  customer: Customer,
  records: MaintenanceRecord[],
): TypeDueDate[] {
  const cycles = customer.maintenanceCycles;
  if (!cycles || Object.keys(cycles).length === 0) return [];

  const results: TypeDueDate[] = [];
  for (const [typeStr, months] of Object.entries(cycles)) {
    if (!months || months <= 0) continue;
    const type = typeStr as MaintenanceType;
    const typeRecords = records.filter(r => r.type === type);
    const lastDate = typeRecords.length > 0
      ? typeRecords.reduce((latest, r) => r.date > latest ? r.date : latest, typeRecords[0].date)
      : null;
    const nextDueDate = getNextDueDate(customer.installationDate, lastDate, months);
    results.push({ type, nextDueDate, lastDate, cycleMonths: months });
  }

  results.sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate));
  return results;
}

/**
 * Get the earliest due date for a customer, considering per-type cycles if configured.
 * Falls back to the global cycle if no per-type cycles are set.
 */
export function getEarliestDueDate(
  customer: Customer,
  records: MaintenanceRecord[],
): string {
  const perType = getPerTypeDueDates(customer, records);
  if (perType.length > 0) {
    return perType[0].nextDueDate;
  }
  const lastDate = records.length > 0
    ? records.reduce((latest, r) => r.date > latest ? r.date : latest, records[0].date)
    : null;
  return getNextDueDate(customer.installationDate, lastDate, customer.maintenanceCycleMonths);
}
