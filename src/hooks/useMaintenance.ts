import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { MaintenanceType } from '../types';

export function useMaintenanceRecords(customerId: string | undefined) {
  return useLiveQuery(
    async () => {
      if (!customerId) return [];
      const records = await db.maintenanceRecords
        .where('customerId')
        .equals(customerId)
        .sortBy('date');
      return records.reverse();
    },
    [customerId]
  );
}

export async function addMaintenanceRecord(data: {
  customerId: string;
  date: string;
  type: MaintenanceType;
  notes: string;
}) {
  await db.maintenanceRecords.add({
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
}

export async function deleteMaintenanceRecord(id: string) {
  await db.maintenanceRecords.delete(id);
}

export function useRecentMaintenance(limit = 5) {
  return useLiveQuery(async () => {
    const records = await db.maintenanceRecords
      .orderBy('createdAt')
      .reverse()
      .limit(limit)
      .toArray();

    const enriched = await Promise.all(
      records.map(async (r) => {
        const customer = await db.customers.get(r.customerId);
        return { ...r, customerName: customer?.name ?? '?' };
      })
    );

    return enriched;
  }, [limit]);
}

export function useMonthlyMaintenanceCount() {
  return useLiveQuery(async () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const start = `${y}-${m}-01`;
    const end = `${y}-${m}-32`;
    return db.maintenanceRecords
      .where('date')
      .between(start, end, true, false)
      .count();
  }, []);
}
