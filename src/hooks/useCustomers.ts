import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import type { Customer } from '../types';

export function useCustomers(searchQuery?: string) {
  return useLiveQuery(async () => {
    let customers = await db.customers.orderBy('name').toArray();
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      customers = customers.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.address.toLowerCase().includes(q)
      );
    }
    return customers;
  }, [searchQuery]);
}

export function useCustomer(id: string | undefined) {
  return useLiveQuery(
    () => (id ? db.customers.get(id) : undefined),
    [id]
  );
}

export async function addCustomer(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString();
  await db.customers.add({
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  });
}

export async function updateCustomer(id: string, data: Partial<Customer>) {
  await db.customers.update(id, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteCustomer(id: string) {
  await db.transaction('rw', db.customers, db.maintenanceRecords, db.reminderOverrides, async () => {
    await db.maintenanceRecords.where('customerId').equals(id).delete();
    await db.reminderOverrides.where('customerId').equals(id).delete();
    await db.customers.delete(id);
  });
}
