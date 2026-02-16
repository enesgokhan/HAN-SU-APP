import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { TR } from '../../constants/tr';
import { useCustomers } from '../../hooks/useCustomers';
import { addPlan } from '../../hooks/usePlans';
import { todayISO } from '../../utils/dates';
import { showToast } from '../shared/Toast';

interface AddPlanFormProps {
  open: boolean;
  onClose: () => void;
  preselectedCustomerId?: string;
}

export default function AddPlanForm({ open, onClose, preselectedCustomerId }: AddPlanFormProps) {
  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(preselectedCustomerId ?? null);
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const customers = useCustomers();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open && preselectedCustomerId) {
      setSelectedCustomerId(preselectedCustomerId);
    }
  }, [open, preselectedCustomerId]);

  if (!open) return null;

  const activeCustomers = customers?.filter(c => c.active !== false) ?? [];
  const filtered = search
    ? activeCustomers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
      )
    : activeCustomers;

  const selectedCustomer = activeCustomers.find(c => c.id === selectedCustomerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !date || saving) return;
    setSaving(true);
    try {
      await addPlan({ customerId: selectedCustomerId, date, notes: notes.trim() });
      showToast(TR.planSaved);
      setSearch('');
      setSelectedCustomerId(null);
      setDate('');
      setNotes('');
      onClose();
    } catch {
      showToast(TR.planSaveFailed, 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2.5 rounded-xl border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-water-500 min-h-[44px]';

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 animate-fade-in" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={TR.addPlan}
        className="bg-white rounded-t-2xl w-full max-w-lg p-5 shadow-xl animate-modal-in max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-4">{TR.addPlan}</h3>

        <form onSubmit={handleSubmit} className="space-y-3 flex-1 overflow-hidden flex flex-col">
          {/* Customer Picker */}
          <div className="flex-1 min-h-0 flex flex-col">
            <label className="block text-xs font-medium text-gray-700 mb-1">{TR.selectCustomer} *</label>
            {selectedCustomer ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-water-300 bg-water-50 min-h-[44px]">
                <span className="flex-1 text-sm font-medium text-gray-900">{selectedCustomer.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCustomerId(null)}
                  className="text-gray-400 active:text-gray-600"
                >
                  &times;
                </button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={TR.searchPlaceholder}
                    className={`${inputClass} pl-9`}
                  />
                </div>
                <div className="mt-1 max-h-36 overflow-y-auto rounded-xl border border-gray-200">
                  {filtered.length > 0 ? (
                    filtered.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setSelectedCustomerId(c.id); setSearch(''); }}
                        className="w-full text-left px-3 py-2.5 text-sm text-gray-900 active:bg-gray-100 border-b border-gray-100 last:border-b-0 min-h-[44px]"
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="text-gray-400 ml-2 text-xs">{c.phone}</span>
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-3 text-sm text-gray-400 text-center">{TR.searchNotFound}</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{TR.planDate} *</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={todayISO()}
              required
              className={inputClass}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">{TR.planNotes}</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              maxLength={1000}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 active:bg-gray-200 min-h-[44px]"
            >
              {TR.cancel}
            </button>
            <button
              type="submit"
              disabled={!selectedCustomerId || !date || saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-water-600 text-white active:bg-water-700 disabled:opacity-50 min-h-[44px]"
            >
              {saving ? TR.saving : TR.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
