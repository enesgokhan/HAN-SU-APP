import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TR } from '../constants/tr';
import { useCustomer, addCustomer, updateCustomer } from '../hooks/useCustomers';
import PageHeader from '../components/layout/PageHeader';
import { showToast } from '../components/shared/Toast';
import { todayISO } from '../utils/dates';

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
  const [maintenanceCycleMonths, setMaintenanceCycleMonths] = useState(6);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing && !initialized.current) {
      setName(existing.name);
      setPhoneLocal(formatTurkishLocal(extractLocalDigits(existing.phone)));
      setAddress(existing.address);
      setInstallationDate(existing.installationDate);
      setNotes(existing.notes);
      setMaintenanceCycleMonths(existing.maintenanceCycleMonths ?? 6);
      initialized.current = true;
    }
  }, [existing]);

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

    const data = {
      name: trimmedName,
      phone: `+90 ${formatTurkishLocal(localDigits)}`,
      address: address.trim(),
      installationDate,
      notes: notes.trim(),
      maintenanceCycleMonths,
    };

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
    </div>
  );
}
