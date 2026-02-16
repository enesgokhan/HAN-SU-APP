import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Calendar, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import type { CustomerMaintenanceView } from '../../types';
import { TR } from '../../constants/tr';
import { formatDateShort } from '../../utils/dates';
import { STATUS_CONFIG, STATUS_LABELS, formatDaysText } from '../../utils/status';
import SnoozeActions from '../dashboard/SnoozeActions';

interface NotificationCardProps {
  view: CustomerMaintenanceView;
  onMaintenanceDone: (customerId: string) => void;
}

export default function NotificationCard({ view, onMaintenanceDone }: NotificationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { customer, status, daysUntilDue, effectiveDueDate, nextDueDate } = view;
  const config = STATUS_CONFIG[status];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden interactive-press" role="article" aria-label={`${customer.name} - ${STATUS_LABELS[status]}`}>
      <div className="flex">
        <div className={`w-1 ${config.dot} shrink-0`} />
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-1.5">
            <h3
              className="font-semibold text-gray-900 truncate flex-1 cursor-pointer"
              role="button"
              onClick={() => navigate(`/customers/${customer.id}`)}
            >
              {customer.name}
            </h3>
            <span className={`shrink-0 ml-2 inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badge}`}>
              {STATUS_LABELS[status]}
            </span>
          </div>

          <a
            href={`tel:${customer.phone.replace(/[^\d+]/g, '')}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 active:text-water-600 mb-1"
            aria-label={`${customer.name} ara`}
          >
            <Phone size={13} />
            {customer.phone}
          </a>

          <div className="flex items-center gap-2 mt-1">
            <Calendar size={13} className="text-gray-400" />
            <span className="text-xs text-gray-500">{formatDateShort(effectiveDueDate)}</span>
            <span className={`text-xs font-semibold ${config.text}`}>{formatDaysText(daysUntilDue)}</span>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onMaintenanceDone(customer.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-medium active:bg-green-100 transition-colors min-h-[44px]"
            >
              <CheckCircle size={14} />
              {TR.maintenanceDone}
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium active:bg-gray-200 transition-colors min-h-[44px]"
            >
              <Clock size={14} />
              {TR.postpone}
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>

          <div className="expand-collapse" style={{ maxHeight: expanded ? '200px' : '0', opacity: expanded ? 1 : 0 }}>
            <div className="pt-3">
              <SnoozeActions customerId={customer.id} originalDueDate={nextDueDate} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
