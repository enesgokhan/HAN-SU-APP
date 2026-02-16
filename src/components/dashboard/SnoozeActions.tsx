import { useState } from 'react';
import { Clock } from 'lucide-react';
import { TR } from '../../constants/tr';
import { snoozeOneMonth, snoozeTwoMonths, snoozeToDate } from '../../utils/reminders';
import { showToast } from '../shared/Toast';
import { todayISO } from '../../utils/dates';

interface SnoozeActionsProps {
  customerId: string;
  originalDueDate: string;
}

export default function SnoozeActions({ customerId, originalDueDate }: SnoozeActionsProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSnooze = async (action: () => Promise<void>, label: string) => {
    if (loading) return;
    setLoading(true);
    try {
      await action();
      showToast(TR.snoozedUntil(label));
    } catch {
      showToast(TR.snoozeFailed, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSnooze = async () => {
    if (!customDate || loading) return;
    setLoading(true);
    try {
      await snoozeToDate(customerId, originalDueDate, customDate);
      setShowDatePicker(false);
      setCustomDate('');
      showToast(TR.snoozedUntil(customDate));
    } catch {
      showToast(TR.snoozeFailed, 'error');
    } finally {
      setLoading(false);
    }
  };

  const btnClass = `flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-xl bg-gray-100 text-gray-700 active:bg-gray-200 min-h-[44px] ${loading ? 'opacity-50' : ''}`;

  return (
    <div className="mt-3">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleSnooze(() => snoozeOneMonth(customerId, originalDueDate), '+1 ay')}
          disabled={loading}
          className={btnClass}
        >
          <Clock size={14} />
          {TR.snoozeOneMonth}
        </button>
        <button
          onClick={() => handleSnooze(() => snoozeTwoMonths(customerId, originalDueDate), '+2 ay')}
          disabled={loading}
          className={btnClass}
        >
          <Clock size={14} />
          {TR.snoozeTwoMonths}
        </button>
        <button
          onClick={() => setShowDatePicker(!showDatePicker)}
          disabled={loading}
          className={btnClass}
        >
          <Clock size={14} />
          {TR.snoozeCustom}
        </button>
      </div>
      {showDatePicker && (
        <div className="mt-2 flex gap-2 items-center">
          <input
            type="date"
            value={customDate}
            onChange={e => setCustomDate(e.target.value)}
            min={todayISO()}
            className="flex-1 px-3 py-2.5 text-base rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-water-500 min-h-[44px]"
          />
          <button
            onClick={handleCustomSnooze}
            disabled={!customDate || loading}
            className="px-4 py-2.5 text-sm font-medium rounded-xl bg-water-600 text-white active:bg-water-700 disabled:opacity-50 min-h-[44px]"
          >
            {TR.confirm}
          </button>
        </div>
      )}
    </div>
  );
}
