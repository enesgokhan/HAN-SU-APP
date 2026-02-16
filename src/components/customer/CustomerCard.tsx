import { useNavigate } from 'react-router-dom';
import { ChevronRight, Phone } from 'lucide-react';
import type { CustomerMaintenanceView } from '../../types';
import { formatDateShort } from '../../utils/dates';
import { STATUS_CONFIG } from '../../utils/status';
import { TR } from '../../constants/tr';

interface CustomerCardProps {
  view: CustomerMaintenanceView;
}

export default function CustomerCard({ view }: CustomerCardProps) {
  const navigate = useNavigate();
  const { customer, status, daysUntilDue, effectiveDueDate } = view;
  const config = STATUS_CONFIG[status];

  const daysText =
    daysUntilDue === 0
      ? TR.dueToday
      : daysUntilDue < 0
        ? TR.daysOverdue(daysUntilDue)
        : TR.daysUntilDue(daysUntilDue);

  return (
    <div
      onClick={() => navigate(`/customers/${customer.id}`)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer interactive-press flex"
    >
      <div className={`w-1 ${config.dot} shrink-0`} />
      <div className="flex-1 p-3.5 flex items-center gap-3 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{customer.name}</h3>
            {status === 'overdue' && (
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse-dot shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Phone size={12} />
            <span>{customer.phone}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">{formatDateShort(effectiveDueDate)}</span>
            <span className={`text-xs font-semibold ${config.text}`}>{daysText}</span>
          </div>
        </div>
        <ChevronRight size={16} className="text-gray-300 shrink-0" />
      </div>
    </div>
  );
}
