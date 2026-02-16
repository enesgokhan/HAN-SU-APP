import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { CustomerMaintenanceView } from '../types';
import { getNextDueDate, getEffectiveDueDate, getDaysUntilDue } from '../utils/dates';
import { computeStatus } from '../utils/status';

const STATUS_PRIORITY = { overdue: 0, due_soon: 1, upcoming: 2, ok: 3 } as const;

export function useDashboard(searchQuery: string) {
  return useLiveQuery(async () => {
    let customers = await db.customers.toArray();

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      customers = customers.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.address.toLowerCase().includes(q)
      );
    }

    const views: CustomerMaintenanceView[] = await Promise.all(
      customers.map(async customer => {
        const records = await db.maintenanceRecords
          .where('customerId')
          .equals(customer.id)
          .sortBy('date');

        const lastRecord = records.length > 0 ? records[records.length - 1] : null;
        const lastMaintenanceDate = lastRecord?.date ?? null;
        const nextDueDate = getNextDueDate(customer.installationDate, lastMaintenanceDate);

        const overrides = await db.reminderOverrides
          .where('customerId')
          .equals(customer.id)
          .sortBy('createdAt');
        const activeSnooze = overrides.length > 0 ? overrides[overrides.length - 1] : null;

        const effectiveDueDate = getEffectiveDueDate(nextDueDate, activeSnooze);
        const daysUntilDue = getDaysUntilDue(effectiveDueDate);
        const status = computeStatus(daysUntilDue);

        return {
          customer,
          lastMaintenanceDate,
          nextDueDate,
          effectiveDueDate,
          status,
          daysUntilDue,
          activeSnooze,
        };
      })
    );

    views.sort((a, b) => {
      const pa = STATUS_PRIORITY[a.status];
      const pb = STATUS_PRIORITY[b.status];
      if (pa !== pb) return pa - pb;
      return a.daysUntilDue - b.daysUntilDue;
    });

    return views;
  }, [searchQuery]);
}
