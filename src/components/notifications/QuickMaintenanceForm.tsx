import { useState, useEffect, useRef } from 'react';
import { TR, MAINTENANCE_TYPE_LABELS } from '../../constants/tr';
import { addMaintenanceRecord } from '../../hooks/useMaintenance';
import { todayISO } from '../../utils/dates';
import { showToast } from '../shared/Toast';
import type { MaintenanceType } from '../../types';

interface QuickMaintenanceFormProps {
  customerId: string;
  customerName: string;
  open: boolean;
  onClose: () => void;
}

export default function QuickMaintenanceForm({ customerId, customerName, open, onClose }: QuickMaintenanceFormProps) {
  const [date, setDate] = useState(todayISO());
  const [type, setType] = useState<MaintenanceType>('filter_replacement');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

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
      onClose();
    } catch {
      showToast(TR.maintenanceSaveFailed, 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-water-500 min-h-[44px]';

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 animate-fade-in" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={TR.maintenanceDone}
        className="bg-white rounded-t-2xl w-full max-w-lg p-5 shadow-xl animate-modal-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-0.5">{TR.maintenanceDone}</h3>
        <p className="text-sm text-gray-500 mb-4">{customerName}</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{TR.maintenanceDate}</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} max={todayISO()} required className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{TR.maintenanceType}</label>
            <select value={type} onChange={e => setType(e.target.value as MaintenanceType)} className={`${inputClass} bg-white`}>
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
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} maxLength={1000} className={`${inputClass} resize-none`} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 active:bg-gray-200 min-h-[44px]">
              {TR.cancel}
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-green-600 text-white active:bg-green-700 disabled:opacity-50 min-h-[44px]">
              {saving ? TR.saving : TR.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
