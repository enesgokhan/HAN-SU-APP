import { db } from '../db/database';
import type { BackupData } from '../types';

export async function exportBackup(): Promise<void> {
  const data: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    customers: await db.customers.toArray(),
    maintenanceRecords: await db.maintenanceRecords.toArray(),
    reminderOverrides: await db.reminderOverrides.toArray(),
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `han-aritma-yedek-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importBackup(file: File): Promise<{ success: boolean; error?: string }> {
  try {
    const text = await file.text();
    const data = JSON.parse(text) as BackupData;

    // Validate top-level structure
    if (!data.version || !Array.isArray(data.customers) || !Array.isArray(data.maintenanceRecords)) {
      return { success: false, error: 'Geçersiz yedek dosyası formatı' };
    }

    if (data.version !== 1) {
      return { success: false, error: `Desteklenmeyen versiyon: ${data.version}` };
    }

    // Validate customers
    if (data.customers.some(c => !c.id || !c.name || !c.phone || !c.installationDate)) {
      return { success: false, error: 'Yedek dosyasında bozuk müşteri verisi var' };
    }

    // Validate maintenance records
    if (data.maintenanceRecords.some(r => !r.id || !r.customerId || !r.date || !r.type)) {
      return { success: false, error: 'Yedek dosyasında bozuk bakım verisi var' };
    }

    // Validate referential integrity
    const customerIds = new Set(data.customers.map(c => c.id));
    if (data.maintenanceRecords.some(r => !customerIds.has(r.customerId))) {
      return { success: false, error: 'Bakım kayıtlarında bilinmeyen müşteri referansı var' };
    }

    // Validate reminder overrides if present
    const overrides = data.reminderOverrides ?? [];
    if (overrides.some(r => !r.id || !r.customerId || !r.snoozedUntil)) {
      return { success: false, error: 'Yedek dosyasında bozuk hatırlatma verisi var' };
    }

    await db.transaction('rw', db.customers, db.maintenanceRecords, db.reminderOverrides, async () => {
      await db.customers.clear();
      await db.maintenanceRecords.clear();
      await db.reminderOverrides.clear();

      await db.customers.bulkAdd(data.customers);
      await db.maintenanceRecords.bulkAdd(data.maintenanceRecords);
      await db.reminderOverrides.bulkAdd(overrides);
    });

    return { success: true };
  } catch (err) {
    console.error('Backup import failed:', err);
    return { success: false, error: 'Dosya okunamadı veya geçersiz JSON formatı' };
  }
}
