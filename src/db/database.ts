import Dexie, { type EntityTable } from 'dexie';
import type { Customer, MaintenanceRecord, ReminderOverride, Plan } from '../types';

const db = new Dexie('HanAritma') as Dexie & {
  customers: EntityTable<Customer, 'id'>;
  maintenanceRecords: EntityTable<MaintenanceRecord, 'id'>;
  reminderOverrides: EntityTable<ReminderOverride, 'id'>;
  plans: EntityTable<Plan, 'id'>;
};

db.version(1).stores({
  customers: 'id, name, phone, installationDate, createdAt',
  maintenanceRecords: 'id, customerId, date, type, createdAt',
  reminderOverrides: 'id, customerId, snoozedUntil',
});

db.version(2).stores({
  customers: 'id, name, phone, installationDate, createdAt',
  maintenanceRecords: 'id, customerId, date, type, createdAt',
  reminderOverrides: 'id, customerId, snoozedUntil',
  plans: 'id, customerId, date, status, createdAt',
});

export { db };
