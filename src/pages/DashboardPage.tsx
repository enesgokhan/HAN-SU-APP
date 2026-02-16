import { useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Upload, Settings, AlertTriangle, Users, CheckCircle2, ChevronRight, Calendar } from 'lucide-react';
import { TR, MAINTENANCE_TYPE_LABELS } from '../constants/tr';
import { useDashboard } from '../hooks/useDashboard';
import { useRecentMaintenance, useMonthlyMaintenanceCount } from '../hooks/useMaintenance';
import EmptyState from '../components/shared/EmptyState';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import { showToast } from '../components/shared/Toast';
import { exportBackup, importBackup } from '../utils/backup';
import { getGreeting, formatTodayFull, formatDateWithDay, formatDateShort } from '../utils/dates';
import { STATUS_CONFIG } from '../utils/status';

export default function DashboardPage() {
  const [showSettings, setShowSettings] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFileRef = useRef<File | null>(null);
  const navigate = useNavigate();
  const views = useDashboard('');
  const recentRecords = useRecentMaintenance(5);
  const monthlyCount = useMonthlyMaintenanceCount();

  const overdueCount = useMemo(() =>
    views?.filter(v => v.status === 'overdue').length ?? 0,
    [views]
  );

  const thisWeekItems = useMemo(() => {
    if (!views) return [];
    return views
      .filter(v => v.daysUntilDue >= 0 && v.daysUntilDue <= 7)
      .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }, [views]);

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

  const getDayLabel = (daysUntilDue: number, dateStr: string): string => {
    if (daysUntilDue === 0) return TR.today;
    if (daysUntilDue === 1) return TR.tomorrow;
    return formatDateWithDay(dateStr);
  };

  const stats = [
    {
      label: TR.activeCustomers,
      count: views.length,
      icon: Users,
      iconBg: 'bg-water-100',
      iconColor: 'text-water-600',
      countColor: 'text-gray-900',
    },
    {
      label: TR.overdue,
      count: overdueCount,
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      countColor: overdueCount > 0 ? 'text-red-600' : 'text-gray-900',
    },
    {
      label: TR.doneThisMonth,
      count: monthlyCount ?? 0,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      countColor: (monthlyCount ?? 0) > 0 ? 'text-emerald-600' : 'text-gray-900',
    },
  ];

  return (
    <div className="pb-20">
      {/* Gradient Header */}
      <header className="bg-gradient-to-br from-water-700 via-water-600 to-water-500 px-4 pt-5 pb-12 text-white">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold">{TR.appName}</h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Ayarlar"
            className="w-11 h-11 flex items-center justify-center rounded-xl active:bg-white/20"
          >
            <Settings size={20} />
          </button>
        </div>
        <p className="text-water-100 text-base font-medium">{getGreeting()}</p>
        <p className="text-water-200 text-sm mt-0.5">{formatTodayFull()}</p>
      </header>

      {/* Settings dropdown */}
      {showSettings && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowSettings(false)} />
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
        </>
      )}
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileSelect} />

      {/* Floating Stats */}
      {views.length > 0 && (
        <div className="grid grid-cols-3 gap-3 -mt-8 relative z-10 px-4">
          {stats.map((card, i) => (
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
      )}

      {/* Content */}
      <div className="px-4 space-y-5 mt-5">
        {views.length > 0 ? (
          <>
            {/* Alert Banner */}
            {overdueCount > 0 && (
              <div
                onClick={() => navigate('/notifications')}
                className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 cursor-pointer interactive-press animate-fade-in-up"
              >
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-800">{TR.overdueAlert(overdueCount)}</p>
                  <p className="text-xs text-red-600 mt-0.5">{TR.viewNow} →</p>
                </div>
              </div>
            )}

            {/* This Week */}
            <section className="animate-fade-in-up stagger-2">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={18} className="text-water-600" />
                <h2 className="text-base font-bold text-gray-900">{TR.thisWeek}</h2>
              </div>
              {thisWeekItems.length > 0 ? (
                <div className="space-y-2">
                  {thisWeekItems.map((view, i) => {
                    const config = STATUS_CONFIG[view.status];
                    return (
                      <div
                        key={view.customer.id}
                        onClick={() => navigate(`/customers/${view.customer.id}`)}
                        className={`flex items-center gap-3 bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 cursor-pointer interactive-press animate-fade-in-up stagger-${Math.min(i + 3, 8)}`}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${config.dot} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{view.customer.name}</p>
                          <p className="text-xs text-gray-500">
                            {getDayLabel(view.daysUntilDue, view.effectiveDueDate)}
                            {view.daysUntilDue > 0 && ` · ${TR.daysUntilDue(view.daysUntilDue)}`}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-gray-300 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                  <p className="text-sm text-gray-400">{TR.noUpcomingThisWeek}</p>
                </div>
              )}
            </section>

            {/* Recent Activity */}
            {recentRecords && recentRecords.length > 0 && (
              <section className="animate-fade-in-up stagger-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <h2 className="text-base font-bold text-gray-900">{TR.recentActivity}</h2>
                </div>
                <div className="space-y-2">
                  {recentRecords.map((record, i) => (
                    <div
                      key={record.id}
                      onClick={() => navigate(`/customers/${record.customerId}`)}
                      className={`flex items-center gap-3 bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100 cursor-pointer interactive-press animate-fade-in-up stagger-${Math.min(i + 5, 8)}`}
                    >
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{record.customerName}</p>
                        <p className="text-xs text-gray-500">
                          {MAINTENANCE_TYPE_LABELS[record.type]} · {formatDateShort(record.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
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
        aria-label="Yeni müşteri ekle"
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
