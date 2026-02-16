import { Users, AlertTriangle, Clock } from 'lucide-react';
import type { CustomerMaintenanceView } from '../../types';
import { TR } from '../../constants/tr';

interface StatusSummaryCardsProps {
  views: CustomerMaintenanceView[];
}

export default function StatusSummaryCards({ views }: StatusSummaryCardsProps) {
  const total = views.length;
  const overdue = views.filter(v => v.status === 'overdue').length;
  const dueSoon = views.filter(v => v.status === 'due_soon').length;

  const cards = [
    {
      label: TR.totalCustomers,
      count: total,
      icon: Users,
      iconBg: 'bg-water-100',
      iconColor: 'text-water-600',
      countColor: 'text-gray-900',
    },
    {
      label: TR.overdue,
      count: overdue,
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      countColor: overdue > 0 ? 'text-red-600' : 'text-gray-900',
    },
    {
      label: TR.dueSoon,
      count: dueSoon,
      icon: Clock,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      countColor: dueSoon > 0 ? 'text-amber-600' : 'text-gray-900',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 -mt-8 relative z-10 px-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`bg-white rounded-2xl p-3 text-center shadow-md border border-gray-100 animate-scale-in stagger-${i + 1}`}
        >
          <div className={`w-9 h-9 rounded-full ${card.iconBg} flex items-center justify-center mx-auto mb-2`}>
            <card.icon size={18} className={card.iconColor} />
          </div>
          <div className={`text-2xl font-extrabold ${card.countColor}`}>{card.count}</div>
          <div className="text-xs font-medium text-gray-500 mt-0.5">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
