import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { MaintenanceType, PlanStatus } from '../types';
import { todayISO } from '../utils/dates';

export interface PlanView {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  notes: string;
  status: PlanStatus;
  createdAt: string;
}

export function usePlans(statusFilter?: PlanStatus) {
  return useLiveQuery(async () => {
    let plans = statusFilter
      ? await db.plans.where('status').equals(statusFilter).toArray()
      : await db.plans.toArray();

    plans.sort((a, b) => a.date.localeCompare(b.date));

    const customers = await db.customers.toArray();
    const customerMap = new Map(customers.map(c => [c.id, c]));

    return plans.map(p => {
      const c = customerMap.get(p.customerId);
      return {
        id: p.id,
        customerId: p.customerId,
        customerName: c?.name ?? '?',
        customerPhone: c?.phone ?? '',
        date: p.date,
        notes: p.notes,
        status: p.status,
        createdAt: p.createdAt,
      } satisfies PlanView;
    });
  }, [statusFilter]);
}

export function useTodayPlanCount() {
  return useLiveQuery(async () => {
    const today = todayISO();
    return db.plans
      .where('date')
      .equals(today)
      .and(p => p.status === 'scheduled')
      .count();
  }, []);
}

export function useTodayPlans() {
  return useLiveQuery(async () => {
    const today = todayISO();
    const plans = await db.plans
      .where('date')
      .equals(today)
      .and(p => p.status === 'scheduled')
      .toArray();

    const customers = await db.customers.toArray();
    const customerMap = new Map(customers.map(c => [c.id, c]));

    return plans.map(p => {
      const c = customerMap.get(p.customerId);
      return {
        id: p.id,
        customerId: p.customerId,
        customerName: c?.name ?? '?',
        customerPhone: c?.phone ?? '',
        date: p.date,
        notes: p.notes,
        status: p.status,
        createdAt: p.createdAt,
      } satisfies PlanView;
    });
  }, []);
}

export function useCustomerPlans(customerId: string | undefined) {
  return useLiveQuery(async () => {
    if (!customerId) return [];
    const plans = await db.plans
      .where('customerId')
      .equals(customerId)
      .toArray();
    plans.sort((a, b) => b.date.localeCompare(a.date));
    return plans;
  }, [customerId]);
}

export async function addPlan(data: { customerId: string; date: string; notes: string }) {
  const now = new Date().toISOString();
  await db.plans.add({
    ...data,
    id: crypto.randomUUID(),
    status: 'scheduled',
    createdAt: now,
    updatedAt: now,
  });
}

export async function postponePlan(id: string, newDate: string) {
  await db.plans.update(id, {
    date: newDate,
    updatedAt: new Date().toISOString(),
  });
}

export async function cancelPlan(id: string) {
  await db.plans.update(id, {
    status: 'cancelled' as const,
    updatedAt: new Date().toISOString(),
  });
}

export async function completePlan(
  planId: string,
  maintenanceData: { customerId: string; date: string; type: MaintenanceType; notes: string }
) {
  const recordId = crypto.randomUUID();
  await db.transaction('rw', db.plans, db.maintenanceRecords, async () => {
    await db.maintenanceRecords.add({
      id: recordId,
      ...maintenanceData,
      createdAt: new Date().toISOString(),
    });
    await db.plans.update(planId, {
      status: 'completed' as const,
      maintenanceRecordId: recordId,
      updatedAt: new Date().toISOString(),
    });
  });
}
