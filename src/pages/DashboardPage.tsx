import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Upload, Settings } from 'lucide-react';
import { TR } from '../constants/tr';
import { useDashboard } from '../hooks/useDashboard';
import StatusSummaryCards from '../components/dashboard/StatusSummaryCards';
import MonthPreview from '../components/dashboard/MonthPreview';
import EmptyState from '../components/shared/EmptyState';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import { showToast } from '../components/shared/Toast';
import { exportBackup, importBackup } from '../utils/backup';

export default function DashboardPage() {
  const [showSettings, setShowSettings] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFileRef = useRef<File | null>(null);
  const navigate = useNavigate();
  const views = useDashboard('');

  if (!views) return null;

  const handleExport = async () => {
    await exportBackup();
    showToast(TR.backupSuccess);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    pendingFileRef.current = file;
    setShowRestoreConfirm(true);
    e.target.value = '';
  };

  const handleRestore = async () => {
    setShowRestoreConfirm(false);
    const file = pendingFileRef.current;
    if (!file) return;
    const result = await importBackup(file);
    if (result.success) {
      showToast(TR.restoreSuccess);
    } else {
      showToast(result.error ?? TR.restoreError, 'error');
    }
    pendingFileRef.current = null;
  };

  return (
    <div className="pb-4">
      {/* Gradient Header */}
      <header className="bg-gradient-to-br from-water-700 via-water-600 to-water-500 px-4 pt-5 pb-12 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">{TR.appName}</h1>
            <p className="text-water-100 text-sm mt-0.5">{TR.greeting}</p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-11 h-11 flex items-center justify-center rounded-xl active:bg-white/20"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Settings dropdown */}
      {showSettings && (
        <div className="mx-4 -mt-4 mb-2 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden relative z-20">
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-gray-700 active:bg-gray-50 min-h-[48px]"
          >
            <Download size={18} className="text-gray-500" />
            {TR.backup}
          </button>
          <button
            onClick={() => { fileInputRef.current?.click(); setShowSettings(false); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm text-gray-700 active:bg-gray-50 border-t border-gray-100 min-h-[48px]"
          >
            <Upload size={18} className="text-gray-500" />
            {TR.restore}
          </button>
        </div>
      )}
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileSelect} />

      {/* Floating Stats */}
      {views.length > 0 && <StatusSummaryCards views={views} />}

      {/* Content */}
      <div className="px-4 space-y-5 mt-5">
        {views.length > 0 ? (
          <MonthPreview views={views} />
        ) : (
          <EmptyState
            title={TR.noCustomers}
            description={TR.noCustomersDesc}
            action={
              <button
                onClick={() => navigate('/customers/new')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-water-600 text-white text-sm font-medium active:bg-water-700 min-h-[48px]"
              >
                <Plus size={16} />
                {TR.addCustomer}
              </button>
            }
          />
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/customers/new')}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-gradient-to-br from-water-500 to-water-700 text-white shadow-lg shadow-water-500/30 flex items-center justify-center active:scale-95 transition-transform z-30"
      >
        <Plus size={24} />
      </button>

      <ConfirmDialog
        open={showRestoreConfirm}
        title={TR.restore}
        message={TR.restoreConfirm}
        confirmLabel={TR.restore}
        onConfirm={handleRestore}
        onCancel={() => { setShowRestoreConfirm(false); pendingFileRef.current = null; }}
      />
    </div>
  );
}
