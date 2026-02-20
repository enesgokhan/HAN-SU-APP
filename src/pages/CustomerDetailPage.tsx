import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, Trash2, Phone, MapPin, Calendar, FileText, UserX, UserCheck, CalendarCheck, Plus, MessageCircle, Monitor } from 'lucide-react';
import { TR, MAINTENANCE_TYPE_LABELS } from '../constants/tr';
import { useCustomer, deleteCustomer, updateCustomer } from '../hooks/useCustomers';
import { useMaintenanceRecords } from '../hooks/useMaintenance';
import { useCustomerView } from '../hooks/useDashboard';
import PageHeader from '../components/layout/PageHeader';
import MaintenanceHistory from '../components/maintenance/MaintenanceHistory';
import AddMaintenanceForm from '../components/maintenance/AddMaintenanceForm';
import SnoozeActions from '../components/dashboard/SnoozeActions';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import EmptyState from '../components/shared/EmptyState';
import { showToast } from '../components/shared/Toast';
import { formatDateTr, formatDateShort, todayISO, getPerTypeDueDates } from '../utils/dates';
import { STATUS_CONFIG, STATUS_LABELS } from '../utils/status';
import { useCustomerPlans } from '../hooks/usePlans';
import AddPlanForm from '../components/plans/AddPlanForm';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const customer = useCustomer(id);
  const records = useMaintenanceRecords(id);
  const view = useCustomerView(id);
  const plans = useCustomerPlans(id);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddPlan, setShowAddPlan] = useState(false);

  // Loading skeleton
  if (customer === undefined || records === undefined || view === undefined) {
    return (
      <div className="pb-20">
        <PageHeader title="" showBack />
        <div className="px-4 py-4 space-y-4">
          <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Not found
  if (customer === null || !customer) {
    return (
      <div className="pb-20">
        <PageHeader title="" showBack />
        <EmptyState title={TR.searchNotFound} />
      </div>
    );
  }

  const isActive = customer.active !== false;

  const handleDelete = async () => {
    await deleteCustomer(customer.id);
    showToast(TR.customerDeleted);
    navigate('/customers', { replace: true });
  };

  const handleToggleActive = async () => {
    await updateCustomer(customer.id, { active: !isActive });
    showToast(isActive ? TR.customerDeactivated : TR.customerActivated);
  };

  return (
    <div className="pb-20">
      <PageHeader
        title={customer.name}
        showBack
        right={
          <div className="flex gap-0.5">
            <button
              onClick={() => navigate(`/customers/${id}/edit`)}
              aria-label="Düzenle"
              className="w-11 h-11 flex items-center justify-center rounded-xl active:bg-gray-100"
            >
              <Edit size={20} className="text-gray-600" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              aria-label="Sil"
              className="w-11 h-11 flex items-center justify-center rounded-xl active:bg-red-50"
            >
              <Trash2 size={20} className="text-red-500" />
            </button>
          </div>
        }
      />

      <div className="px-4 py-4 space-y-4">
        {/* Inactive banner */}
        {!isActive && (
          <div className="flex items-center justify-between bg-gray-100 rounded-xl px-4 py-3">
            <span className="text-sm font-medium text-gray-500">{TR.inactiveFilter}</span>
            <button
              onClick={handleToggleActive}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-water-600 text-white active:bg-water-700 min-h-[36px]"
            >
              <UserCheck size={14} />
              {TR.markActive}
            </button>
          </div>
        )}

        {/* Customer info */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Phone size={16} className="text-gray-400" />
            <a href={`tel:${customer.phone.replace(/[^\d+]/g, '')}`} className="underline" aria-label={`${customer.name} ara`}>{customer.phone}</a>
            <a
              href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-600 active:bg-green-100"
              aria-label={`${customer.name} WhatsApp`}
            >
              <MessageCircle size={16} />
            </a>
          </div>
          {customer.address && (
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <MapPin size={16} className="text-gray-400 mt-0.5" />
              <span>{customer.address}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar size={16} className="text-gray-400" />
            <span>{TR.installationDate}: {formatDateTr(customer.installationDate)}</span>
          </div>
          {(customer.deviceModel || customer.deviceSerial) && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Monitor size={16} className="text-gray-400" />
              <span>
                {customer.deviceModel && customer.deviceModel}
                {customer.deviceModel && customer.deviceSerial && ' · '}
                {customer.deviceSerial && <span className="text-gray-500">{customer.deviceSerial}</span>}
              </span>
            </div>
          )}
          {customer.notes && (
            <div className="flex items-start gap-2 text-sm text-gray-700">
              <FileText size={16} className="text-gray-400 mt-0.5" />
              <span>{customer.notes}</span>
            </div>
          )}
        </div>

        {/* Active/Inactive toggle */}
        {isActive && (
          <button
            onClick={handleToggleActive}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 active:bg-gray-200 min-h-[44px]"
          >
            <UserX size={16} />
            {TR.markInactive}
          </button>
        )}

        {/* Maintenance status */}
        {view && (
          <div className={`rounded-xl border p-4 ${STATUS_CONFIG[view.status].bg} ${STATUS_CONFIG[view.status].border}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{TR.nextMaintenance}</span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[view.status].badge}`}>
                {STATUS_LABELS[view.status]}
              </span>
            </div>
            <p className={`text-lg font-bold ${STATUS_CONFIG[view.status].text}`}>
              {formatDateTr(view.effectiveDueDate)}
            </p>
            {view.lastMaintenanceDate && (
              <p className="text-xs text-gray-500 mt-1">
                {TR.lastMaintenance}: {formatDateTr(view.lastMaintenanceDate)}
              </p>
            )}
            {(view.status === 'overdue' || view.status === 'due_soon') && (
              <SnoozeActions customerId={customer.id} originalDueDate={view.nextDueDate} />
            )}
          </div>
        )}

        {/* Per-type due dates */}
        {customer.maintenanceCycles && Object.keys(customer.maintenanceCycles).length > 0 && records && (() => {
          const perType = getPerTypeDueDates(customer, records);
          if (perType.length === 0) return null;
          const today = todayISO();
          return (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{TR.perTypeDueDates}</h3>
              <div className="space-y-1.5">
                {perType.map(({ type, nextDueDate }) => (
                  <div key={type} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-xs text-gray-700">{MAINTENANCE_TYPE_LABELS[type]}</span>
                    <span className={`text-xs font-medium ${nextDueDate < today ? 'text-red-600' : 'text-gray-600'}`}>
                      {formatDateShort(nextDueDate)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Scheduled Plans */}
        {(() => {
          const scheduled = plans?.filter(p => p.status === 'scheduled') ?? [];
          return (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">{TR.navPlans}</h3>
                <button
                  onClick={() => setShowAddPlan(true)}
                  className="flex items-center gap-1 text-xs font-medium text-water-600 active:text-water-700 min-h-[36px]"
                >
                  <Plus size={14} />
                  {TR.addPlan}
                </button>
              </div>
              {scheduled.length > 0 ? (
                <div className="space-y-2">
                  {scheduled.map(plan => (
                    <div key={plan.id} className="flex items-center gap-3 bg-water-50 rounded-xl p-3 border border-water-200">
                      <CalendarCheck size={16} className="text-water-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{formatDateShort(plan.date)}</p>
                        {plan.notes && <p className="text-xs text-gray-500 truncate">{plan.notes}</p>}
                      </div>
                      <span className={`text-xs font-medium ${plan.date < todayISO() ? 'text-red-500' : 'text-water-600'}`}>
                        {plan.date < todayISO() ? TR.overdueAppointment : plan.date === todayISO() ? TR.today : formatDateShort(plan.date)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-3">{TR.noPlans}</p>
              )}
            </div>
          );
        })()}

        {/* Add maintenance */}
        <AddMaintenanceForm customerId={customer.id} />

        {/* History */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{TR.maintenanceHistory}</h3>
          <MaintenanceHistory records={records} customer={customer} />
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title={TR.delete}
        message={TR.confirmDelete}
        confirmLabel={TR.delete}
        confirmDestructive
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <AddPlanForm
        open={showAddPlan}
        onClose={() => setShowAddPlan(false)}
        preselectedCustomerId={customer.id}
      />
    </div>
  );
}
