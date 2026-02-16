import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { TR } from '../constants/tr';
import { usePlans } from '../hooks/usePlans';
import type { PlanView } from '../hooks/usePlans';
import type { PlanStatus } from '../types';
import FilterPills from '../components/shared/FilterPills';
import PlanCard from '../components/plans/PlanCard';
import AddPlanForm from '../components/plans/AddPlanForm';
import CompletePlanForm from '../components/plans/CompletePlanForm';
import EmptyState from '../components/shared/EmptyState';
import { todayISO } from '../utils/dates';

export default function PlansPage() {
  const [filter, setFilter] = useState<PlanStatus | 'all'>('scheduled');
  const [showAddForm, setShowAddForm] = useState(false);
  const [completingPlan, setCompletingPlan] = useState<PlanView | null>(null);

  const allPlans = usePlans();

  const filterOptions = useMemo(() => {
    if (!allPlans) return [];
    return [
      { key: 'scheduled', label: TR.scheduledFilter, count: allPlans.filter(p => p.status === 'scheduled').length },
      { key: 'completed', label: TR.completedFilter, count: allPlans.filter(p => p.status === 'completed').length },
      { key: 'cancelled', label: TR.cancelledFilter, count: allPlans.filter(p => p.status === 'cancelled').length },
    ];
  }, [allPlans]);

  const filtered = useMemo(() => {
    if (!allPlans) return [];
    let result = allPlans.filter(p => filter === 'all' ? true : p.status === filter);

    // For scheduled: overdue first, then by date ascending
    if (filter === 'scheduled') {
      const today = todayISO();
      result.sort((a, b) => {
        const aOverdue = a.date < today;
        const bOverdue = b.date < today;
        if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
        return a.date.localeCompare(b.date);
      });
    } else {
      // Completed/cancelled: most recent first
      result.sort((a, b) => b.date.localeCompare(a.date));
    }

    return result;
  }, [allPlans, filter]);

  // Loading skeleton
  if (!allPlans) return (
    <div className="pb-20">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 pt-4 pb-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <h1 className="text-xl font-bold text-gray-900">{TR.navPlans}</h1>
      </header>
      <div className="px-4 pt-4 space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="pb-20">
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 pt-4 pb-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">{TR.navPlans}</h1>
          <button
            onClick={() => setShowAddForm(true)}
            aria-label={TR.addPlan}
            className="w-11 h-11 flex items-center justify-center rounded-xl active:bg-gray-100"
          >
            <Plus size={22} className="text-water-600" />
          </button>
        </div>
        <FilterPills
          options={filterOptions}
          activeKey={filter}
          onChange={key => setFilter(key as PlanStatus | 'all')}
        />
      </header>

      <div className="px-4 py-3 space-y-3">
        {filtered.length > 0 ? (
          filtered.map((plan, i) => (
            <div key={plan.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
              <PlanCard plan={plan} onComplete={setCompletingPlan} />
            </div>
          ))
        ) : (
          <EmptyState
            title={filter === 'scheduled' ? TR.noPlans : TR.searchNotFound}
            description={filter === 'scheduled' ? TR.noPlansDesc : undefined}
            action={filter === 'scheduled' ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-water-600 text-white text-sm font-medium active:bg-water-700 min-h-[48px]"
              >
                <Plus size={16} />
                {TR.addPlan}
              </button>
            ) : undefined}
          />
        )}
      </div>

      <AddPlanForm open={showAddForm} onClose={() => setShowAddForm(false)} />
      <CompletePlanForm
        plan={completingPlan}
        open={completingPlan !== null}
        onClose={() => setCompletingPlan(null)}
      />
    </div>
  );
}
