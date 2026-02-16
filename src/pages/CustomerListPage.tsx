import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { TR } from '../constants/tr';
import { useDashboard } from '../hooks/useDashboard';
import PageHeader from '../components/layout/PageHeader';
import SearchBar from '../components/shared/SearchBar';
import FilterPills from '../components/shared/FilterPills';
import SortMenu from '../components/shared/SortMenu';
import CustomerCard from '../components/customer/CustomerCard';
import EmptyState from '../components/shared/EmptyState';

export default function CustomerListPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('name');
  const navigate = useNavigate();
  const includeInactive = filter === 'inactive';
  const views = useDashboard(search, includeInactive);

  const filterOptions = useMemo(() => {
    if (!views) return [];
    const active = views.filter(v => v.customer.active !== false);
    const inactive = views.filter(v => v.customer.active === false);
    return [
      { key: 'all', label: TR.allFilter, count: includeInactive ? active.length : views.length },
      { key: 'overdue', label: TR.overdueFilter, count: active.filter(v => v.status === 'overdue').length },
      { key: 'due_soon', label: TR.dueSoonFilter, count: active.filter(v => v.status === 'due_soon').length },
      { key: 'ok', label: TR.normalFilter, count: active.filter(v => v.status === 'ok' || v.status === 'upcoming').length },
      { key: 'inactive', label: TR.inactiveFilter, count: includeInactive ? inactive.length : 0 },
    ];
  }, [views, includeInactive]);

  const sortOptions = [
    { key: 'name', label: TR.sortByName },
    { key: 'installation', label: TR.sortByInstallation },
    { key: 'maintenance', label: TR.sortByLastMaintenance },
  ];

  const filtered = useMemo(() => {
    if (!views) return [];
    let result = views.filter(v => {
      switch (filter) {
        case 'overdue': return v.status === 'overdue' && v.customer.active !== false;
        case 'due_soon': return v.status === 'due_soon' && v.customer.active !== false;
        case 'ok': return (v.status === 'ok' || v.status === 'upcoming') && v.customer.active !== false;
        case 'inactive': return v.customer.active === false;
        default: return v.customer.active !== false;
      }
    });

    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.customer.name.localeCompare(b.customer.name, 'tr');
        case 'installation':
          return b.customer.installationDate.localeCompare(a.customer.installationDate);
        case 'maintenance':
          return (b.lastMaintenanceDate ?? '').localeCompare(a.lastMaintenanceDate ?? '');
        default:
          return 0;
      }
    });

    return result;
  }, [views, filter, sort]);

  // Loading skeleton
  if (!views) return (
    <div className="pb-20">
      <PageHeader
        title={TR.navCustomers}
        right={
          <button className="w-11 h-11 flex items-center justify-center rounded-xl">
            <Plus size={22} className="text-water-600" />
          </button>
        }
      />
      <div className="px-4 pt-4 space-y-3">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    </div>
  );

  return (
    <div className="pb-20">
      <PageHeader
        title={TR.navCustomers}
        right={
          <button
            onClick={() => navigate('/customers/new')}
            className="w-11 h-11 flex items-center justify-center rounded-xl active:bg-gray-100"
          >
            <Plus size={22} className="text-water-600" />
          </button>
        }
      />
      <div className="px-4 pt-3 pb-2 space-y-3">
        <SearchBar value={search} onChange={setSearch} />
        <div className="flex items-center gap-2">
          <div className="flex-1 overflow-hidden">
            <FilterPills options={filterOptions} activeKey={filter} onChange={setFilter} />
          </div>
          <SortMenu options={sortOptions} activeKey={sort} onChange={setSort} />
        </div>
        {views && views.length > 0 && (
          <p className="text-xs text-gray-400 font-medium">{TR.customerCount(filtered.length)}</p>
        )}
      </div>
      <div className="px-4 space-y-2">
        {filtered.length > 0 ? (
          filtered.map((view, i) => (
            <div key={view.customer.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 8)}`}>
              <CustomerCard view={view} />
            </div>
          ))
        ) : views ? (
          <EmptyState
            title={search ? TR.searchNotFound : TR.noCustomers}
            description={search ? TR.searchNoResults(search) : TR.noCustomersDesc}
            action={
              !search && filter === 'all' ? (
                <button
                  onClick={() => navigate('/customers/new')}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-water-600 text-white text-sm font-medium active:bg-water-700 min-h-[48px]"
                >
                  <Plus size={16} />
                  {TR.addCustomer}
                </button>
              ) : undefined
            }
          />
        ) : null}
      </div>
    </div>
  );
}
