import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, Trash2, Phone, MapPin, Calendar, FileText, UserX, UserCheck } from 'lucide-react';
import { TR } from '../constants/tr';
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
import { formatDateTr } from '../utils/dates';
import { STATUS_CONFIG, STATUS_LABELS } from '../utils/status';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const customer = useCustomer(id);
  const records = useMaintenanceRecords(id);
  const view = useCustomerView(id);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

        {/* Add maintenance */}
        <AddMaintenanceForm customerId={customer.id} />

        {/* History */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">{TR.maintenanceHistory}</h3>
          <MaintenanceHistory records={records} />
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
    </div>
  );
}
