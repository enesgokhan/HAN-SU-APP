import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TR } from '../constants/tr';
import { useCustomer, addCustomer, updateCustomer } from '../hooks/useCustomers';
import PageHeader from '../components/layout/PageHeader';
import { showToast } from '../components/shared/Toast';
import { todayISO } from '../utils/dates';

const PHONE_REGEX = /^[\d\s\-()+]+$/;
const MIN_PHONE_DIGITS = 7;

export default function CustomerFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const existing = useCustomer(id);
  const initialized = useRef(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [installationDate, setInstallationDate] = useState(todayISO());
  const [notes, setNotes] = useState('');
  const [maintenanceCycleMonths, setMaintenanceCycleMonths] = useState(6);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing && !initialized.current) {
      setName(existing.name);
      setPhone(existing.phone);
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
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      showToast(TR.nameRequired, 'error');
      return;
    }

    if (!trimmedPhone || !PHONE_REGEX.test(trimmedPhone) || trimmedPhone.replace(/\D/g, '').length < MIN_PHONE_DIGITS) {
      showToast(TR.invalidPhone, 'error');
      return;
    }

    const data = {
      name: trimmedName,
      phone: trimmedPhone,
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
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            maxLength={30}
            autoComplete="tel"
            inputMode="tel"
            className={inputClass}
          />
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
