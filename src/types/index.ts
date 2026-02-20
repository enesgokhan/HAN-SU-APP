export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  installationDate: string;
  notes: string;
  deviceModel?: string;
  deviceSerial?: string;
  maintenanceCycleMonths?: number;
  maintenanceCycles?: Partial<Record<MaintenanceType, number>>;
  active?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceRecord {
  id: string;
  customerId: string;
  date: string;
  type: MaintenanceType;
  notes: string;
  cost?: number;
  createdAt: string;
}

export type MaintenanceType =
  | 'filter_replacement'
  | 'membrane_replacement'
  | 'general_maintenance'
  | 'repair'
  | 'other';

export interface ReminderOverride {
  id: string;
  customerId: string;
  originalDueDate: string;
  snoozedUntil: string;
  reason: string;
  createdAt: string;
}

export type PlanStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Plan {
  id: string;
  customerId: string;
  date: string;
  notes: string;
  status: PlanStatus;
  maintenanceRecordId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackupData {
  version: 1 | 2 | 3;
  exportedAt: string;
  customers: Customer[];
  maintenanceRecords: MaintenanceRecord[];
  reminderOverrides: ReminderOverride[];
  plans?: Plan[];
}

export type MaintenanceStatus = 'overdue' | 'due_soon' | 'upcoming' | 'ok';

export interface CustomerMaintenanceView {
  customer: Customer;
  lastMaintenanceDate: string | null;
  nextDueDate: string;
  effectiveDueDate: string;
  status: MaintenanceStatus;
  daysUntilDue: number;
  activeSnooze: ReminderOverride | null;
}
