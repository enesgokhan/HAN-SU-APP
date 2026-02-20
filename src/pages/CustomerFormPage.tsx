import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TR, MAINTENANCE_TYPE_LABELS } from '../constants/tr';
import { useCustomer, addCustomer, updateCustomer } from '../hooks/useCustomers';
import type { MaintenanceType } from '../types';
import PageHeader from '../components/layout/PageHeader';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import { showToast } from '../components/shared/Toast';
import { todayISO } from '../utils/dates';
import { db } from '../db/database';

/** Strip everything except digits from a string */
function digitsOnly(s: string): string {
  return s.replace(/\D/g, '');
}

/** Format 10 digits as "555 555 55 55" (partial input supported) */
function formatTurkishLocal(digits: string): string {
  const d = digits.slice(0, 10);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  if (d.length <= 8) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8)}`;
}

/** Extract the 10-digit local part from any stored phone value */
function extractLocalDigits(stored: string): string {
  const d = digitsOnly(stored);
  // If starts with 90 and has 12 digits (90 + 10), strip the country code
  if (d.startsWith('90') && d.length === 12) return d.slice(2);
  // If 10 digits already, use as-is
  if (d.length === 10) return d;
  // Fallback: return last 10 digits or whatever we have
  return d.length > 10 ? d.slice(-10) : d;
}

export default function CustomerFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const existing = useCustomer(id);
  const initialized = useRef(false);

  const [name, setName] = useState('');
  const [phoneLocal, setPhoneLocal] = useState('');
  const [address, setAddress] = useState('');
  const [installationDate, setInstallationDate] = useState(todayISO());
  const [notes, setNotes] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [deviceSerial, setDeviceSerial] = useState('');
  const [maintenanceCycleMonths, setMaintenanceCycleMonths] = useState(6);
  const [maintenanceCycles, setMaintenanceCycles] = useState<Partial<Record<MaintenanceType, number>>>({
    filter_replacement: 6,
    membrane_replacement: 24,
  });
  const [showCycles, setShowCycles] = useState(false);
  const [saving, setSaving] = useState(false);
  const [duplicateName, setDuplicateName] = useState<string | null>(null);
  const pendingData = useRef<Parameters<typeof addCustomer>[0] | null>(null);

  useEffect(() => {
    if (existing && !initialized.current) {
      setName(existing.name);
      setPhoneLocal(formatTurkishLocal(extractLocalDigits(existing.phone)));
      setAddress(existing.address);
      setInstallationDate(existing.installationDate);
      setNotes(existing.notes);
      setDeviceModel(existing.deviceModel ?? '');
      setDeviceSerial(existing.deviceSerial ?? '');
      setMaintenanceCycleMonths(existing.maintenanceCycleMonths ?? 6);
      if (existing.maintenanceCycles && Object.keys(existing.maintenanceCycles).length > 0) {
        setMaintenanceCycles(existing.maintenanceCycles);
        setShowCycles(true);
      }
      initialized.current = true;
    }
  }, [existing]);

  const saveCustomer = async (data: Parameters<typeof addCustomer>[0]) => {
    setSaving(true);
    try {
      if (isEdit && id) {
        await updateCustomer(id, data);
      } else {
        await addCustomer(data);
      }
      showToast(TR.customerSaved);
      navigate(-1);
    } catch {
      showToast(TR.customerSaveFailed, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const trimmedName = name.trim();
    const localDigits = digitsOnly(phoneLocal);

    if (!trimmedName) {
      showToast(TR.nameRequired, 'error');
      return;
    }

    if (localDigits.length !== 10) {
      showToast(TR.invalidPhone, 'error');
      return;
    }

    // Build per-type cycles: only include types with a value > 0
    const activeCycles: Partial<Record<MaintenanceType, number>> = {};
    if (showCycles) {
      for (const [t, m] of Object.entries(maintenanceCycles)) {
        if (m && m > 0) activeCycles[t as MaintenanceType] = m;
      }
    }

    const data = {
      name: trimmedName,
      phone: `+90 ${formatTurkishLocal(localDigits)}`,
      address: address.trim(),
      installationDate,
      notes: notes.trim(),
      deviceModel: deviceModel.trim() || undefined,
      deviceSerial: deviceSerial.trim() || undefined,
      maintenanceCycleMonths,
      maintenanceCycles: showCycles && Object.keys(activeCycles).length > 0 ? activeCycles : undefined,
    };

    // Check for duplicate phone number
    const fullPhone = data.phone;
    const existing_customers = await db.customers
      .filter(c => c.phone === fullPhone && c.id !== id)
      .toArray();

    if (existing_customers.length > 0) {
      pendingData.current = data;
      setDuplicateName(existing_customers[0].name);
      return;
    }

    await saveCustomer(data);
  };

  const handleDuplicateConfirm = async () => {
    setDuplicateName(null);
    if (pendingData.current) {
      await saveCustomer(pendingData.current);
      pendingData.current = null;
    }
  };

  const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-water-500 min-h-[44px]';

  return (
    <div className="pb-20">
      <PageHeader title={isEdit ? TR.editCustomer : TR.addCustomer} showBack />
      <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{TR.customerName} *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            maxLength={200}
            autoComplete="name"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{TR.customerPhone} *</label>
          <div className="flex gap-2">
            <div className="flex items-center px-3 rounded-xl border border-gray-300 bg-gray-50 text-base text-gray-500 min-h-[44px] select-none">
              +90
            </div>
            <input
              type="tel"
              value={phoneLocal}
              onChange={e => {
                const digits = digitsOnly(e.target.value).slice(0, 10);
                setPhoneLocal(formatTurkishLocal(digits));
              }}
              placeholder="555 555 55 55"
              required
              maxLength={13}
              autoComplete="tel-national"
              inputMode="tel"
              className={`${inputClass} flex-1`}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{TR.customerAddress}</label>
          <textarea
            value={address}
            onChange={e => setAddress(e.target.value)}
            rows={2}
            maxLength={500}
            autoComplete="street-address"
            className={`${inputClass} resize-none`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{TR.installationDate} *</label>
          <input
            type="date"
            value={installationDate}
            onChange={e => setInstallationDate(e.target.value)}
            min="2000-01-01"
            max={todayISO()}
            required
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{TR.deviceModel}</label>
            <input
              type="text"
              value={deviceModel}
              onChange={e => setDeviceModel(e.target.value)}
              maxLength={100}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{TR.deviceSerial}</label>
            <input
              type="text"
              value={deviceSerial}
              onChange={e => setDeviceSerial(e.target.value)}
              maxLength={100}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{TR.maintenanceCycle}</label>
          <select
            value={maintenanceCycleMonths}
            onChange={e => setMaintenanceCycleMonths(Number(e.target.value))}
            className={`${inputClass} bg-white`}
          >
            <option value={3}>{TR.months3}</option>
            <option value={6}>{TR.months6}</option>
            <option value={12}>{TR.months12}</option>
          </select>
          <button
            type="button"
            onClick={() => setShowCycles(!showCycles)}
            className="mt-2 text-xs font-medium text-water-600 active:text-water-700"
          >
            {showCycles ? `▲ ${TR.maintenanceCycles}` : `▼ ${TR.maintenanceCycles}`}
          </button>
          {showCycles && (
            <div className="mt-2 space-y-2 bg-gray-50 rounded-xl p-3">
              {(Object.entries(MAINTENANCE_TYPE_LABELS) as [MaintenanceType, string][]).map(([type, label]) => (
                <div key={type} className="flex items-center justify-between gap-3">
                  <span className="text-xs text-gray-700 flex-1">{label}</span>
                  <select
                    value={maintenanceCycles[type] ?? 0}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setMaintenanceCycles(prev => {
                        const next = { ...prev };
                        if (val > 0) next[type] = val;
                        else delete next[type];
                        return next;
                      });
                    }}
                    className="px-2 py-1.5 rounded-lg border border-gray-300 text-sm bg-white min-h-[36px]"
                  >
                    <option value={0}>—</option>
                    <option value={3}>{TR.months3}</option>
                    <option value={6}>{TR.months6}</option>
                    <option value={12}>{TR.months12}</option>
                    <option value={24}>{TR.months24}</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{TR.notes}</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            maxLength={1000}
            className={`${inputClass} resize-none`}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl bg-water-600 text-white font-medium text-sm active:bg-water-700 disabled:opacity-50 min-h-[48px]"
        >
          {saving ? TR.saving : TR.save}
        </button>
      </form>

      <ConfirmDialog
        open={duplicateName !== null}
        title={TR.duplicatePhoneTitle}
        message={duplicateName ? TR.duplicatePhoneMessage(duplicateName) : ''}
        confirmLabel={TR.duplicatePhoneSave}
        onConfirm={handleDuplicateConfirm}
        onCancel={() => { setDuplicateName(null); pendingData.current = null; }}
      />
    </div>
  );
}
