import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TR } from '../constants/tr';
import { useCustomer, addCustomer, updateCustomer } from '../hooks/useCustomers';
import PageHeader from '../components/layout/PageHeader';
import { showToast } from '../components/shared/Toast';
import { todayISO } from '../utils/dates';

const PHONE_REGEX = /^[\d\s\-()+ ]+$/;

export default function CustomerFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const existing = useCustomer(id);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [installationDate, setInstallationDate] = useState(todayISO());
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setPhone(existing.phone);
      setAddress(existing.address);
      setInstallationDate(existing.installationDate);
      setNotes(existing.notes);
    }
  }, [existing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      showToast('Ad soyad boş bırakılamaz', 'error');
      return;
    }

    if (!trimmedPhone || !PHONE_REGEX.test(trimmedPhone)) {
      showToast('Geçerli bir telefon numarası girin', 'error');
      return;
    }

    const data = {
      name: trimmedName,
      phone: trimmedPhone,
      address: address.trim(),
      installationDate,
      notes: notes.trim(),
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
    } catch (err) {
      console.error('Failed to save customer:', err);
      showToast('Müşteri kaydedilemedi', 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-water-500 min-h-[44px]';

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
            max={todayISO()}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{TR.notes}</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 rounded-xl bg-water-600 text-white font-medium text-sm active:bg-water-700 disabled:opacity-50 min-h-[48px]"
        >
          {saving ? 'Kaydediliyor...' : TR.save}
        </button>
      </form>
    </div>
  );
}
