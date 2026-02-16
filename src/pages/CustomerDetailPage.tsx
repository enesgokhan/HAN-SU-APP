import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, Trash2, Phone, MapPin, Calendar, FileText } from 'lucide-react';
import { TR } from '../constants/tr';
import { useCustomer, deleteCustomer } from '../hooks/useCustomers';
import { useMaintenanceRecords } from '../hooks/useMaintenance';
import { useDashboard } from '../hooks/useDashboard';
import PageHeader from '../components/layout/PageHeader';
import MaintenanceHistory from '../components/maintenance/MaintenanceHistory';
import AddMaintenanceForm from '../components/maintenance/AddMaintenanceForm';
import SnoozeActions from '../components/dashboard/SnoozeActions';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import { showToast } from '../components/shared/Toast';
import { formatDateTr } from '../utils/dates';
import { STATUS_CONFIG } from '../utils/status';

const STATUS_LABELS = {
  overdue: TR.overdue,
  due_soon: TR.dueSoon,
  upcoming: TR.upcoming,
  ok: TR.ok,
};

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const customer = useCustomer(id);
  const records = useMaintenanceRecords(id);
  const allViews = useDashboard('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!customer || !records || !allViews) return null;

  const view = allViews.find(v => v.customer.id === id);

  const handleDelete = async () => {
    await deleteCustomer(customer.id);
    showToast(TR.customerDeleted);
    navigate('/customers', { replace: true });
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
              className="w-11 h-11 flex items-center justify-center rounded-xl active:bg-gray-100"
            >
              <Edit size={20} className="text-gray-600" />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-11 h-11 flex items-center justify-center rounded-xl active:bg-red-50"
            >
              <Trash2 size={20} className="text-red-500" />
            </button>
          </div>
        }
      />

      <div className="px-4 py-4 space-y-4">
        {/* Customer info */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Phone size={16} className="text-gray-400" />
            <a href={`tel:${customer.phone.replace(/[^\d+]/g, '')}`} className="underline">{customer.phone}</a>
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
