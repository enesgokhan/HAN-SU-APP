import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import type { CustomerMaintenanceView } from '../../types';
import { TR } from '../../constants/tr';
import { formatDateShort } from '../../utils/dates';
import { STATUS_CONFIG } from '../../utils/status';
import SnoozeActions from './SnoozeActions';

const STATUS_LABELS = {
  overdue: TR.overdue,
  due_soon: TR.dueSoon,
  upcoming: TR.upcoming,
  ok: TR.ok,
};

interface ReminderCardProps {
  view: CustomerMaintenanceView;
}

export default function ReminderCard({ view }: ReminderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { customer, status, daysUntilDue, effectiveDueDate, activeSnooze, nextDueDate } = view;
  const config = STATUS_CONFIG[status];

  const daysText =
    daysUntilDue === 0
      ? TR.dueToday
      : daysUntilDue < 0
        ? TR.daysOverdue(daysUntilDue)
        : TR.daysUntilDue(daysUntilDue);

  return (
    <div className={`rounded-xl border p-4 ${config.bg} ${config.border}`}>
      <div className="flex items-start justify-between">
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => navigate(`/customers/${customer.id}`)}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badge}`}>
              {STATUS_LABELS[status]}
            </span>
            {activeSnooze && (
              <span className="text-xs text-gray-500">(ertelendi)</span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 truncate">{customer.name}</h3>
          <p className={`text-sm font-medium ${config.text}`}>{daysText}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {TR.nextMaintenance}: {formatDateShort(effectiveDueDate)}
          </p>
        </div>
        <div className="flex items-center gap-0.5 ml-2 shrink-0">
          <a
            href={`tel:${customer.phone.replace(/[^\d+]/g, '')}`}
            className="w-11 h-11 flex items-center justify-center rounded-xl active:bg-black/5"
            onClick={e => e.stopPropagation()}
          >
            <Phone size={20} className="text-gray-600" />
          </a>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-11 h-11 flex items-center justify-center rounded-xl active:bg-black/5"
          >
            {expanded ? <ChevronUp size={20} className="text-gray-600" /> : <ChevronDown size={20} className="text-gray-600" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-black/10">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Phone size={14} />
            <a href={`tel:${customer.phone.replace(/[^\d+]/g, '')}`} className="underline">{customer.phone}</a>
          </div>
          {customer.address && (
            <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
              <MapPin size={14} className="mt-0.5 shrink-0" />
              <span>{customer.address}</span>
            </div>
          )}
          {(status === 'overdue' || status === 'due_soon') && (
            <SnoozeActions customerId={customer.id} originalDueDate={nextDueDate} />
          )}
        </div>
      )}
    </div>
  );
}
