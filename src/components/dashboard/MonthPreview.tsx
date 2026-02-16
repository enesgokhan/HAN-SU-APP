import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { CustomerMaintenanceView } from '../../types';
import { TR } from '../../constants/tr';
import { STATUS_CONFIG } from '../../utils/status';
import { formatDateShort } from '../../utils/dates';

interface MonthPreviewProps {
  views: CustomerMaintenanceView[];
}

export default function MonthPreview({ views }: MonthPreviewProps) {
  const navigate = useNavigate();
  const urgent = views.filter(v => v.status !== 'ok').slice(0, 4);

  if (urgent.length === 0) return null;

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-gray-900">{TR.thisMonth}</h2>
        <button
          onClick={() => navigate('/notifications')}
          className="text-sm text-water-600 font-medium flex items-center gap-0.5 active:text-water-700"
        >
          {TR.viewAll}
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="space-y-2">
        {urgent.map((view, i) => {
          const config = STATUS_CONFIG[view.status];
          const daysText =
            view.daysUntilDue === 0
              ? TR.dueToday
              : view.daysUntilDue < 0
                ? TR.daysOverdue(view.daysUntilDue)
                : TR.daysUntilDue(view.daysUntilDue);

          return (
            <div
              key={view.customer.id}
              onClick={() => navigate(`/customers/${view.customer.id}`)}
              className={`flex items-center gap-3 bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 cursor-pointer interactive-press animate-fade-in-up stagger-${i + 1}`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${config.dot} shrink-0 ${view.status === 'overdue' ? 'animate-pulse-dot' : ''}`} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{view.customer.name}</p>
                <p className={`text-xs ${config.text} font-medium`}>
                  {formatDateShort(view.effectiveDueDate)} · {daysText}
                </p>
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
