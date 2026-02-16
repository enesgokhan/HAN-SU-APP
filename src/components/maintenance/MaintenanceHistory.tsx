import { useState } from 'react';
import type { MaintenanceRecord } from '../../types';
import { TR, MAINTENANCE_TYPE_LABELS } from '../../constants/tr';
import { formatDateShort } from '../../utils/dates';
import { Wrench, Trash2 } from 'lucide-react';
import { deleteMaintenanceRecord } from '../../hooks/useMaintenance';
import ConfirmDialog from '../shared/ConfirmDialog';

interface MaintenanceHistoryProps {
  records: MaintenanceRecord[];
}

export default function MaintenanceHistory({ records }: MaintenanceHistoryProps) {
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
                <span className="text-xs text-gray-500">{formatDateShort(record.date)}</span>
              </div>
              {record.notes && (
                <p className="text-xs text-gray-500 mt-0.5">{record.notes}</p>
              )}
            </div>
            <button
              onClick={() => setDeleteId(record.id)}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 active:text-red-500 active:bg-red-50"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={deleteId !== null}
        title={TR.delete}
        message="Bu bakım kaydını silmek istediğinize emin misiniz?"
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
