import { useState } from 'react';
import type { Customer, MaintenanceRecord } from '../../types';
import { TR, MAINTENANCE_TYPE_LABELS } from '../../constants/tr';
import { formatDateShort } from '../../utils/dates';
import { Wrench, Trash2, FileText } from 'lucide-react';
import { deleteMaintenanceRecord } from '../../hooks/useMaintenance';
import { generateServiceForm } from '../../utils/serviceForm';
import ConfirmDialog from '../shared/ConfirmDialog';

interface MaintenanceHistoryProps {
  records: MaintenanceRecord[];
  customer?: Customer;
}

export default function MaintenanceHistory({ records, customer }: MaintenanceHistoryProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (records.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">{TR.noMaintenanceYet}</p>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {records.map(record => (
          <div key={record.id} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
            <div className="p-2 bg-water-100 rounded-lg mt-0.5">
              <Wrench size={16} className="text-water-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {MAINTENANCE_TYPE_LABELS[record.type] ?? record.type}
                </span>
                <div className="flex items-center gap-2">
                  {record.cost != null && record.cost > 0 && (
                    <span className="text-xs font-medium text-green-600">₺{record.cost}</span>
                  )}
                  <span className="text-xs text-gray-500">{formatDateShort(record.date)}</span>
                </div>
              </div>
              {record.notes && (
                <p className="text-xs text-gray-500 mt-0.5">{record.notes}</p>
              )}
            </div>
            <div className="flex">
              {customer && (
                <button
                  onClick={() => generateServiceForm(customer, record)}
                  aria-label={TR.serviceForm}
                  className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 active:text-water-600 active:bg-water-50"
                >
                  <FileText size={15} />
                </button>
              )}
              <button
                onClick={() => setDeleteId(record.id)}
                aria-label="Bakımı sil"
                className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 active:text-red-500 active:bg-red-50"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={deleteId !== null}
        title={TR.delete}
        message={TR.confirmDeleteMaintenance}
        confirmLabel={TR.delete}
        confirmDestructive
        onConfirm={async () => {
          if (deleteId) await deleteMaintenanceRecord(deleteId);
          setDeleteId(null);
        }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
