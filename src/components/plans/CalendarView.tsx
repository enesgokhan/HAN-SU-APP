import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TR } from '../../constants/tr';
import { useMonthPlans } from '../../hooks/usePlans';
import type { PlanView } from '../../hooks/usePlans';
import { todayISO, formatDateShort } from '../../utils/dates';

interface CalendarViewProps {
  onSelectPlan: (plan: PlanView) => void;
}

export default function CalendarView({ onSelectPlan }: CalendarViewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const plans = useMonthPlans(year, month);

  const plansByDay = useMemo(() => {
    const map = new Map<string, PlanView[]>();
    if (!plans) return map;
    for (const p of plans) {
      const day = p.date;
      const list = map.get(day);
      if (list) list.push(p);
      else map.set(day, [p]);
    }
    return map;
  }, [plans]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const daysInMonth = lastDay.getDate();

    // getDay() returns 0=Sun, we want 0=Mon
    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const days: Array<{ date: string; day: number; inMonth: boolean }> = [];

    // Previous month padding
    const prevMonthLast = new Date(year, month - 1, 0).getDate();
    for (let i = startDow - 1; i >= 0; i--) {
      const d = prevMonthLast - i;
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const m = String(prevMonth).padStart(2, '0');
      days.push({ date: `${prevYear}-${m}-${String(d).padStart(2, '0')}`, day: d, inMonth: false });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const m = String(month).padStart(2, '0');
      days.push({ date: `${year}-${m}-${String(d).padStart(2, '0')}`, day: d, inMonth: true });
    }

    // Next month padding to fill to 6 rows max (42 cells) or at least complete the week
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        const nextMonth = month === 12 ? 1 : month + 1;
        const nextYear = month === 12 ? year + 1 : year;
        const m = String(nextMonth).padStart(2, '0');
        days.push({ date: `${nextYear}-${m}-${String(d).padStart(2, '0')}`, day: d, inMonth: false });
      }
    }

    return days;
  }, [year, month]);

  const navigate = (dir: -1 | 1) => {
    let newMonth = month + dir;
    let newYear = year;
    if (newMonth < 1) { newMonth = 12; newYear--; }
    if (newMonth > 12) { newMonth = 1; newYear++; }
    setMonth(newMonth);
    setYear(newYear);
    setSelectedDay(null);
  };

  const todayStr = todayISO();
  const selectedPlans = selectedDay ? (plansByDay.get(selectedDay) ?? []) : [];

  return (
    <div className="space-y-3">
      {/* Month navigation */}
      <div className="flex items-center justify-between px-1">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl active:bg-gray-100">
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <h2 className="text-base font-bold text-gray-900">
          {TR.monthNames[month - 1]} {year}
        </h2>
        <button onClick={() => navigate(1)} className="w-10 h-10 flex items-center justify-center rounded-xl active:bg-gray-100">
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center">
        {TR.dayNamesShort.map(d => (
          <div key={d} className="text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map(({ date, day, inMonth }) => {
          const dayPlans = plansByDay.get(date) ?? [];
          const isToday = date === todayStr;
          const isSelected = date === selectedDay;
          const hasScheduled = dayPlans.some(p => p.status === 'scheduled');
          const hasCompleted = dayPlans.some(p => p.status === 'completed');
          const hasOverdue = dayPlans.some(p => p.status === 'scheduled' && p.date < todayStr);

          return (
            <button
              key={date}
              onClick={() => inMonth && setSelectedDay(isSelected ? null : date)}
              className={`relative flex flex-col items-center py-2 min-h-[44px] rounded-xl transition-colors ${
                !inMonth ? 'text-gray-300' :
                isSelected ? 'bg-water-100 text-water-700' :
                isToday ? 'bg-water-50 font-bold text-water-600' :
                'text-gray-700 active:bg-gray-50'
              }`}
            >
              <span className="text-sm">{day}</span>
              {dayPlans.length > 0 && inMonth && (
                <div className="flex gap-0.5 mt-0.5">
                  {hasOverdue && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                  {hasScheduled && !hasOverdue && <div className="w-1.5 h-1.5 rounded-full bg-water-500" />}
                  {hasCompleted && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day's plans */}
      {selectedDay && (
        <div className="space-y-2 pt-1">
          <h3 className="text-sm font-semibold text-gray-700">{formatDateShort(selectedDay)}</h3>
          {selectedPlans.length > 0 ? (
            selectedPlans.map(plan => (
              <button
                key={plan.id}
                onClick={() => onSelectPlan(plan)}
                className={`w-full text-left flex items-center gap-3 rounded-xl p-3 border ${
                  plan.status === 'cancelled' ? 'bg-gray-50 border-gray-200 opacity-60' :
                  plan.date < todayStr && plan.status === 'scheduled' ? 'bg-red-50 border-red-200' :
                  'bg-water-50 border-water-200'
                }`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  plan.status === 'completed' ? 'bg-emerald-500' :
                  plan.status === 'cancelled' ? 'bg-gray-300' :
                  plan.date < todayStr ? 'bg-red-500' :
                  'bg-water-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{plan.customerName}</p>
                  {plan.notes && <p className="text-xs text-gray-500 truncate">{plan.notes}</p>}
                </div>
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-400 text-center py-2">{TR.noPlans}</p>
          )}
        </div>
      )}
    </div>
  );
}
