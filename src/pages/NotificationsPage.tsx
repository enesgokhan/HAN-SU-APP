import { useState } from 'react';
import { TR } from '../constants/tr';
import { useDashboard } from '../hooks/useDashboard';
import FilterPills from '../components/shared/FilterPills';
import SortMenu from '../components/shared/SortMenu';
import NotificationCard from '../components/notifications/NotificationCard';
import QuickMaintenanceForm from '../components/notifications/QuickMaintenanceForm';
import EmptyState from '../components/shared/EmptyState';

export default function NotificationsPage() {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('urgency');
  const [maintenanceTarget, setMaintenanceTarget] = useState<string | null>(null);

  const views = useDashboard('');

  if (!views) return null;

  const filtered = views.filter(v => {
    switch (filter) {
      case 'overdue': return v.status === 'overdue';
      case 'due_soon': return v.status === 'due_soon';
      case 'upcoming': return v.status === 'upcoming';
      default: return true;
    }
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'name': return a.customer.name.localeCompare(b.customer.name, 'tr');
      case 'date': return a.daysUntilDue - b.daysUntilDue;
      default: return a.daysUntilDue - b.daysUntilDue;
    }
  });

  const filterOptions = [
    { key: 'all', label: TR.allFilter, count: views.length },
    { key: 'overdue', label: TR.overdueFilter, count: views.filter(v => v.status === 'overdue').length },
    { key: 'due_soon', label: TR.dueSoonFilter, count: views.filter(v => v.status === 'due_soon').length },
    { key: 'upcoming', label: TR.upcomingFilter, count: views.filter(v => v.status === 'upcoming').length },
  ];

  const sortOptions = [
    { key: 'urgency', label: TR.sortByUrgency },
    { key: 'name', label: TR.sortByName },
    { key: 'date', label: TR.sortByDate },
  ];

  const targetView = maintenanceTarget ? views.find(v => v.customer.id === maintenanceTarget) : null;

  return (
    <div className="pb-20">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 pt-4 pb-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h1 className="text-xl font-bold text-gray-900 mb-3">{TR.navNotifications}</h1>
        <div className="flex items-center gap-2">
          <div className="flex-1 overflow-hidden">
            <FilterPills options={filterOptions} activeKey={filter} onChange={setFilter} />
          </div>
          <SortMenu options={sortOptions} activeKey={sort} onChange={setSort} />
        </div>
      </header>

      <div className="px-4 py-3 space-y-3">
        {sorted.length > 0 ? (
          sorted.map((view, i) => (
            <div key={view.customer.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
              <NotificationCard
                view={view}
                onMaintenanceDone={id => setMaintenanceTarget(id)}
              />
            </div>
          ))
        ) : (
          <EmptyState
            title={filter !== 'all' ? TR.searchNotFound : TR.noNotifications}
            description={filter !== 'all' ? undefined : TR.noNotificationsDesc}
          />
        )}
      </div>

      {targetView && (
        <QuickMaintenanceForm
          customerId={targetView.customer.id}
          customerName={targetView.customer.name}
          open={!!maintenanceTarget}
          onClose={() => setMaintenanceTarget(null)}
        />
      )}
    </div>
  );
}
