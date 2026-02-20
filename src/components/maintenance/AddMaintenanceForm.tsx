import { useState } from 'react';
import { Plus } from 'lucide-react';
import { TR, MAINTENANCE_TYPE_LABELS } from '../../constants/tr';
import { addMaintenanceRecord } from '../../hooks/useMaintenance';
import { todayISO } from '../../utils/dates';
import { showToast } from '../shared/Toast';
import type { MaintenanceType } from '../../types';

interface AddMaintenanceFormProps {
  customerId: string;
}

export default function AddMaintenanceForm({ customerId }: AddMaintenanceFormProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [type, setType] = useState<MaintenanceType>('filter_replacement');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await addMaintenanceRecord({ customerId, date, type, notes: notes.trim(), cost: cost ? Number(cost) : undefined });
      showToast(TR.maintenanceAdded);
      setDate(todayISO());
      setType('filter_replacement');
      setNotes('');
      setCost('');
      setOpen(false);
    } catch (err) {
      console.error('Failed to add maintenance:', err);
      showToast(TR.maintenanceSaveFailed, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-gray-300 text-sm font-medium text-gray-600 active:bg-gray-50 min-h-[48px]"
      >
        <Plus size={16} />
        {TR.addMaintenance}
      </button>
    );
  }

  const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-water-500 min-h-[44px]';

  return (
    <form onSubmit={handleSubmit} className="bg-water-50 rounded-xl p-4 space-y-3 border border-water-200">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">{TR.maintenanceDate}</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          max={todayISO()}
          required
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">{TR.maintenanceType}</label>
        <select
          value={type}
          onChange={e => setType(e.target.value as MaintenanceType)}
          className={`${inputClass} bg-white`}
        >
          {Object.entries(MAINTENANCE_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">{TR.cost}</label>
        <div className="flex gap-2">
          <div className="flex items-center px-3 rounded-xl border border-gray-300 bg-gray-50 text-base text-gray-500 min-h-[44px] select-none">
            {TR.currencySymbol}
          </div>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={cost}
            onChange={e => setCost(e.target.value)}
            placeholder={TR.costPlaceholder}
            className={`${inputClass} flex-1`}
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">{TR.notes}</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 active:bg-gray-200 min-h-[44px]"
        >
          {TR.cancel}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-water-600 text-white active:bg-water-700 disabled:opacity-50 min-h-[44px]"
        >
          {saving ? TR.saving : TR.save}
        </button>
      </div>
    </form>
  );
}
