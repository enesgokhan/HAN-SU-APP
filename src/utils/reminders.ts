import { addMonths } from 'date-fns';
import { db } from '../db/database';
import { toISODate } from '../utils/dates';

export async function snoozeReminder(
  customerId: string,
  originalDueDate: string,
  snoozedUntil: string,
  reason?: string
) {
  await db.transaction('rw', db.reminderOverrides, async () => {
    await db.reminderOverrides.where('customerId').equals(customerId).delete();
    await db.reminderOverrides.add({
      id: crypto.randomUUID(),
      customerId,
      originalDueDate,
      snoozedUntil,
      reason: reason ?? '',
      createdAt: new Date().toISOString(),
    });
  });
}

export async function snoozeOneMonth(customerId: string, originalDueDate: string) {
  const newDate = toISODate(addMonths(new Date(), 1));
  return snoozeReminder(customerId, originalDueDate, newDate);
}

export async function snoozeTwoMonths(customerId: string, originalDueDate: string) {
  const newDate = toISODate(addMonths(new Date(), 2));
  return snoozeReminder(customerId, originalDueDate, newDate);
}

export async function snoozeToDate(customerId: string, originalDueDate: string, date: string) {
  return snoozeReminder(customerId, originalDueDate, date);
}
