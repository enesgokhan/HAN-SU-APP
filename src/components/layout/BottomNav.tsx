import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bell, CalendarCheck, Users } from 'lucide-react';
import { TR } from '../../constants/tr';
import { useOverdueCount } from '../../hooks/useDashboard';
import { useTodayPlanCount } from '../../hooks/usePlans';

export default function BottomNav() {
  const overdueCount = useOverdueCount() ?? 0;
  const todayPlans = useTodayPlanCount() ?? 0;

  useEffect(() => {
    if (!('setAppBadge' in navigator)) return;
    if (overdueCount > 0) {
      navigator.setAppBadge(overdueCount).catch(() => {});
    } else {
      navigator.clearAppBadge?.().catch(() => {});
    }
  }, [overdueCount]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative flex flex-col items-center justify-center gap-0.5 py-2 flex-1 text-xs font-medium transition-colors duration-200 min-h-[56px] ${
      isActive ? 'text-water-600' : 'text-gray-400'
    }`;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 backdrop-blur-sm border-t border-gray-200/80 flex items-center z-50 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'max(0.25rem, env(safe-area-inset-bottom))' }}
    >
      <NavLink to="/" className={linkClass} end>
        {({ isActive }) => (
          <>
            {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-water-500 rounded-full" />}
            <Home size={20} />
            <span>{TR.navDashboard}</span>
          </>
        )}
      </NavLink>
      <NavLink
        to="/notifications"
        className={linkClass}
        aria-label={overdueCount > 0 ? `${TR.navNotifications} (${overdueCount} ${TR.overdue.toLowerCase()})` : TR.navNotifications}
      >
        {({ isActive }) => (
          <>
            {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-water-500 rounded-full" />}
            <div className="relative">
              <Bell size={20} />
              {overdueCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-pulse-dot">
                  {overdueCount > 9 ? '9+' : overdueCount}
                </span>
              )}
            </div>
            <span>{TR.navNotifications}</span>
          </>
        )}
      </NavLink>
      <NavLink to="/plans" className={linkClass}>
        {({ isActive }) => (
          <>
            {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-water-500 rounded-full" />}
            <div className="relative">
              <CalendarCheck size={20} />
              {todayPlans > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-water-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {todayPlans > 9 ? '9+' : todayPlans}
                </span>
              )}
            </div>
            <span>{TR.navPlans}</span>
          </>
        )}
      </NavLink>
      <NavLink to="/customers" className={linkClass}>
        {({ isActive }) => (
          <>
            {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-water-500 rounded-full" />}
            <Users size={20} />
            <span>{TR.navCustomers}</span>
          </>
        )}
      </NavLink>
    </nav>
  );
}
