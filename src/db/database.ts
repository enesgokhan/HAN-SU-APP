import Dexie, { type EntityTable } from 'dexie';
import type { Customer, MaintenanceRecord, ReminderOverride } from '../types';

const db = new Dexie('HanAritma') as Dexie & {
  customers: EntityTable<Customer, 'id'>;
  maintenanceRecords: EntityTable<MaintenanceRecord, 'id'>;
  reminderOverrides: EntityTable<ReminderOverride, 'id'>;
};

db.version(1).stores({
  customers: 'id, name, phone, installationDate, createdAt',
  maintenanceRecords: 'id, customerId, date, type, createdAt',
  reminderOverrides: 'id, customerId, snoozedUntil',
});

export { db };
