import { db } from '../db/database';
import type { BackupData, MaintenanceType, PlanStatus } from '../types';

const VALID_PLAN_STATUSES: PlanStatus[] = ['scheduled', 'completed', 'cancelled'];

const MAX_BACKUP_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_RECORDS = 10000;
const VALID_MAINTENANCE_TYPES: MaintenanceType[] = ['filter_replacement', 'membrane_replacement', 'general_maintenance', 'repair', 'other'];

const isString = (v: unknown): v is string => typeof v === 'string';
const isValidDate = (v: string) => /^\d{4}-\d{2}-\d{2}/.test(v);

export async function exportBackup(): Promise<void> {
  const data: BackupData = {
    version: 2,
    exportedAt: new Date().toISOString(),
    customers: await db.customers.toArray(),
    maintenanceRecords: await db.maintenanceRecords.toArray(),
    reminderOverrides: await db.reminderOverrides.toArray(),
    plans: await db.plans.toArray(),
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const fileName = `han-aritma-yedek-${new Date().toISOString().split('T')[0]}.json`;
  const file = new File([blob], fileName, { type: 'application/json' });

  // Use Web Share API on mobile (works in iOS standalone PWA)
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: 'HAN Arıtma Yedek' });
    return;
  }

  // Fallback: standard download link
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importBackup(file: File): Promise<{ success: boolean; error?: string }> {
  try {
    // File size check
    if (file.size > MAX_BACKUP_SIZE) {
      return { success: false, error: 'Yedek dosyası çok büyük' };
    }

    const text = await file.text();
    const raw = JSON.parse(text);

    // Validate top-level structure
    if (!raw || typeof raw !== 'object' || !raw.version || !Array.isArray(raw.customers) || !Array.isArray(raw.maintenanceRecords)) {
      return { success: false, error: 'Geçersiz yedek dosyası formatı' };
    }

    if (raw.version !== 1 && raw.version !== 2) {
      return { success: false, error: `Desteklenmeyen versiyon: ${raw.version}` };
    }

    // Record count limits
    if (raw.customers.length > MAX_RECORDS || raw.maintenanceRecords.length > MAX_RECORDS) {
      return { success: false, error: 'Yedek dosyası çok fazla kayıt içeriyor' };
    }

    // Validate and sanitize customers
    if (raw.customers.some((c: Record<string, unknown>) =>
      !isString(c.id) || !isString(c.name) || !isString(c.phone) ||
      !isString(c.installationDate) || !isValidDate(c.installationDate as string)
    )) {
      return { success: false, error: 'Yedek dosyasında bozuk müşteri verisi var' };
    }

    const customers = raw.customers.map((c: Record<string, unknown>) => ({
      id: c.id as string,
      name: c.name as string,
      phone: c.phone as string,
      address: (isString(c.address) ? c.address : '') as string,
      installationDate: c.installationDate as string,
      notes: (isString(c.notes) ? c.notes : '') as string,
      maintenanceCycleMonths: typeof c.maintenanceCycleMonths === 'number' ? c.maintenanceCycleMonths : undefined,
      active: typeof c.active === 'boolean' ? c.active : undefined,
      createdAt: isString(c.createdAt) ? c.createdAt : new Date().toISOString(),
      updatedAt: isString(c.updatedAt) ? c.updatedAt : new Date().toISOString(),
    }));

    // Validate and sanitize maintenance records
    if (raw.maintenanceRecords.some((r: Record<string, unknown>) =>
      !isString(r.id) || !isString(r.customerId) || !isString(r.date) || !isString(r.type)
    )) {
      return { success: false, error: 'Yedek dosyasında bozuk bakım verisi var' };
    }

    if (raw.maintenanceRecords.some((r: Record<string, unknown>) =>
      !VALID_MAINTENANCE_TYPES.includes(r.type as MaintenanceType)
    )) {
      return { success: false, error: 'Yedek dosyasında geçersiz bakım türü var' };
    }

    // Validate referential integrity
    const customerIds = new Set(customers.map((c: { id: string }) => c.id));
    if (raw.maintenanceRecords.some((r: Record<string, unknown>) => !customerIds.has(r.customerId as string))) {
      return { success: false, error: 'Bakım kayıtlarında bilinmeyen müşteri referansı var' };
    }

    const maintenanceRecords = raw.maintenanceRecords.map((r: Record<string, unknown>) => ({
      id: r.id as string,
      customerId: r.customerId as string,
      date: r.date as string,
      type: r.type as MaintenanceType,
      notes: isString(r.notes) ? r.notes : '',
      createdAt: isString(r.createdAt) ? r.createdAt : new Date().toISOString(),
    }));

    // Validate reminder overrides if present
    const rawOverrides = Array.isArray(raw.reminderOverrides) ? raw.reminderOverrides : [];
    if (rawOverrides.length > MAX_RECORDS) {
      return { success: false, error: 'Yedek dosyası çok fazla kayıt içeriyor' };
    }

    if (rawOverrides.some((r: Record<string, unknown>) => !isString(r.id) || !isString(r.customerId) || !isString(r.snoozedUntil))) {
      return { success: false, error: 'Yedek dosyasında bozuk hatırlatma verisi var' };
    }

    if (rawOverrides.some((r: Record<string, unknown>) => !customerIds.has(r.customerId as string))) {
      return { success: false, error: 'Hatırlatma kayıtlarında bilinmeyen müşteri referansı var' };
    }

    const overrides = rawOverrides.map((r: Record<string, unknown>) => ({
      id: r.id as string,
      customerId: r.customerId as string,
      originalDueDate: isString(r.originalDueDate) ? r.originalDueDate : '',
      snoozedUntil: r.snoozedUntil as string,
      reason: isString(r.reason) ? r.reason : '',
      createdAt: isString(r.createdAt) ? r.createdAt : new Date().toISOString(),
    }));

    // Validate plans if present (version 2)
    const rawPlans = Array.isArray(raw.plans) ? raw.plans : [];
    if (rawPlans.length > MAX_RECORDS) {
      return { success: false, error: 'Yedek dosyası çok fazla kayıt içeriyor' };
    }

    const plans = rawPlans
      .filter((p: Record<string, unknown>) =>
        isString(p.id) && isString(p.customerId) && isString(p.date) &&
        isString(p.status) && VALID_PLAN_STATUSES.includes(p.status as PlanStatus) &&
        customerIds.has(p.customerId as string)
      )
      .map((p: Record<string, unknown>) => ({
        id: p.id as string,
        customerId: p.customerId as string,
        date: p.date as string,
        notes: isString(p.notes) ? p.notes : '',
        status: p.status as PlanStatus,
        maintenanceRecordId: isString(p.maintenanceRecordId) ? p.maintenanceRecordId : undefined,
        createdAt: isString(p.createdAt) ? p.createdAt : new Date().toISOString(),
        updatedAt: isString(p.updatedAt) ? p.updatedAt : new Date().toISOString(),
      }));

    await db.transaction('rw', db.customers, db.maintenanceRecords, db.reminderOverrides, db.plans, async () => {
      await db.customers.clear();
      await db.maintenanceRecords.clear();
      await db.reminderOverrides.clear();
      await db.plans.clear();

      await db.customers.bulkAdd(customers);
      await db.maintenanceRecords.bulkAdd(maintenanceRecords);
      await db.reminderOverrides.bulkAdd(overrides);
      await db.plans.bulkAdd(plans);
    });

    return { success: true };
  } catch {
    return { success: false, error: 'Dosya okunamadı veya geçersiz JSON formatı' };
  }
}
