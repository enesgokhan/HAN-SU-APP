import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { CustomerMaintenanceView, ReminderOverride } from '../types';
import { getNextDueDate, getEffectiveDueDate, getDaysUntilDue } from '../utils/dates';
import { computeStatus } from '../utils/status';

const STATUS_PRIORITY = { overdue: 0, due_soon: 1, upcoming: 2, ok: 3 } as const;

export function useDashboard(searchQuery: string, includeInactive = false) {
  return useLiveQuery(async () => {
    let customers = await db.customers.toArray();

    if (!includeInactive) {
      customers = customers.filter(c => c.active !== false);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      customers = customers.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.address.toLowerCase().includes(q)
      );
    }

    // Batch load all records and overrides (3 queries instead of 2N+1)
    const [allRecords, allOverrides] = await Promise.all([
      db.maintenanceRecords.toArray(),
      db.reminderOverrides.toArray(),
    ]);

    const lastRecordByCustomer = new Map<string, string>();
    for (const r of allRecords) {
      const existing = lastRecordByCustomer.get(r.customerId);
      if (!existing || r.date > existing) {
        lastRecordByCustomer.set(r.customerId, r.date);
      }
    }

    const latestOverrideByCustomer = new Map<string, ReminderOverride>();
    for (const o of allOverrides) {
      const existing = latestOverrideByCustomer.get(o.customerId);
      if (!existing || o.createdAt > existing.createdAt) {
        latestOverrideByCustomer.set(o.customerId, o);
      }
    }

    const views: CustomerMaintenanceView[] = customers.map(customer => {
      const lastMaintenanceDate = lastRecordByCustomer.get(customer.id) ?? null;
      const nextDueDate = getNextDueDate(customer.installationDate, lastMaintenanceDate, customer.maintenanceCycleMonths);
      const activeSnooze = latestOverrideByCustomer.get(customer.id) ?? null;
      const effectiveDueDate = getEffectiveDueDate(nextDueDate, activeSnooze);
      const daysUntilDue = getDaysUntilDue(effectiveDueDate);
      const status = computeStatus(daysUntilDue);

      return { customer, lastMaintenanceDate, nextDueDate, effectiveDueDate, status, daysUntilDue, activeSnooze };
    });

    views.sort((a, b) => {
      const pa = STATUS_PRIORITY[a.status];
      const pb = STATUS_PRIORITY[b.status];
      if (pa !== pb) return pa - pb;
      return a.daysUntilDue - b.daysUntilDue;
    });

    return views;
  }, [searchQuery, includeInactive]);
}

/** Lightweight hook for BottomNav — only returns overdue count */
export function useOverdueCount() {
  return useLiveQuery(async () => {
    const customers = await db.customers.filter(c => c.active !== false).toArray();
    const [allRecords, allOverrides] = await Promise.all([
      db.maintenanceRecords.toArray(),
      db.reminderOverrides.toArray(),
    ]);

    const lastRecordByCustomer = new Map<string, string>();
    for (const r of allRecords) {
      const existing = lastRecordByCustomer.get(r.customerId);
      if (!existing || r.date > existing) lastRecordByCustomer.set(r.customerId, r.date);
    }

    const latestOverrideByCustomer = new Map<string, ReminderOverride>();
    for (const o of allOverrides) {
      const existing = latestOverrideByCustomer.get(o.customerId);
      if (!existing || o.createdAt > existing.createdAt) latestOverrideByCustomer.set(o.customerId, o);
    }

    let count = 0;
    for (const c of customers) {
      const lastDate = lastRecordByCustomer.get(c.id) ?? null;
      const nextDue = getNextDueDate(c.installationDate, lastDate, c.maintenanceCycleMonths);
      const snooze = latestOverrideByCustomer.get(c.id) ?? null;
      const effective = getEffectiveDueDate(nextDue, snooze);
      if (getDaysUntilDue(effective) < 0) count++;
    }
    return count;
  }, []);
}

/** Single-customer view hook for CustomerDetailPage */
export function useCustomerView(id: string | undefined) {
  return useLiveQuery(async () => {
    if (!id) return undefined;
    const customer = await db.customers.get(id);
    if (!customer) return null;

    const records = await db.maintenanceRecords.where('customerId').equals(id).sortBy('date');
    const lastRecord = records.length > 0 ? records[records.length - 1] : null;
    const lastMaintenanceDate = lastRecord?.date ?? null;
    const nextDueDate = getNextDueDate(customer.installationDate, lastMaintenanceDate, customer.maintenanceCycleMonths);

    const overrides = await db.reminderOverrides.where('customerId').equals(id).sortBy('createdAt');
    const activeSnooze = overrides.length > 0 ? overrides[overrides.length - 1] : null;

    const effectiveDueDate = getEffectiveDueDate(nextDueDate, activeSnooze);
    const daysUntilDue = getDaysUntilDue(effectiveDueDate);
    const status = computeStatus(daysUntilDue);

    return { customer, lastMaintenanceDate, nextDueDate, effectiveDueDate, status, daysUntilDue, activeSnooze } as CustomerMaintenanceView;
  }, [id]);
}
