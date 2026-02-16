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
