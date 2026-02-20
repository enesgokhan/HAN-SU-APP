import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, CheckCircle, Clock, X, ChevronDown, ChevronUp, MessageCircle } from 'lucide-react';
import type { PlanView } from '../../hooks/usePlans';
import { postponePlan, cancelPlan } from '../../hooks/usePlans';
import { TR } from '../../constants/tr';
import { formatDateShort, todayISO } from '../../utils/dates';
import { showToast } from '../shared/Toast';
import ConfirmDialog from '../shared/ConfirmDialog';

interface PlanCardProps {
  plan: PlanView;
  onComplete: (plan: PlanView) => void;
}

function getDateLabel(date: string): { label: string; color: string } {
  const today = todayISO();
  if (date < today) return { label: TR.overdueAppointment, color: 'text-red-600' };
  if (date === today) return { label: TR.today, color: 'text-water-600' };
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10);
  if (date === tomorrowStr) return { label: TR.tomorrow, color: 'text-amber-600' };
  return { label: formatDateShort(date), color: 'text-gray-500' };
}

export default function PlanCard({ plan, onComplete }: PlanCardProps) {
  const navigate = useNavigate();
  const [showPostpone, setShowPostpone] = useState(false);
  const [postponeDate, setPostponeDate] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const isScheduled = plan.status === 'scheduled';
  const isOverdue = plan.date < todayISO() && isScheduled;
  const dateInfo = getDateLabel(plan.date);

  const handlePostpone = async () => {
    if (!postponeDate || loading) return;
    setLoading(true);
    try {
      await postponePlan(plan.id, postponeDate);
      showToast(TR.planPostponed);
      setShowPostpone(false);
      setPostponeDate('');
    } catch {
      showToast(TR.planSaveFailed, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setShowCancelConfirm(false);
    setLoading(true);
    try {
      await cancelPlan(plan.id);
      showToast(TR.planCancelled);
    } catch {
      showToast(TR.planSaveFailed, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${isOverdue ? 'border-red-200' : 'border-gray-100'}`}>
        <div className="flex">
          <div className={`w-1 shrink-0 ${isOverdue ? 'bg-red-500' : plan.status === 'completed' ? 'bg-emerald-500' : plan.status === 'cancelled' ? 'bg-gray-300' : 'bg-water-500'}`} />
          <div className={`flex-1 p-4 ${plan.status !== 'scheduled' ? 'opacity-60' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <h3
                className="font-semibold text-gray-900 truncate flex-1 cursor-pointer"
                role="button"
                onClick={() => navigate(`/customers/${plan.customerId}`)}
              >
                {plan.customerName}
              </h3>
              <span className={`text-xs font-semibold ${dateInfo.color}`}>{dateInfo.label}</span>
            </div>

            {plan.customerPhone && (
              <div className="flex items-center gap-2 mb-1">
                <a
                  href={`tel:${plan.customerPhone.replace(/[^\d+]/g, '')}`}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-500 active:text-water-600"
                >
                  <Phone size={13} />
                  {plan.customerPhone}
                </a>
                <a
                  href={`https://wa.me/${plan.customerPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-50 text-green-600 active:bg-green-100"
                  aria-label={`${plan.customerName} WhatsApp`}
                >
                  <MessageCircle size={14} />
                </a>
              </div>
            )}

            <div className="text-xs text-gray-500 mt-0.5">
              {formatDateShort(plan.date)}
            </div>

            {plan.notes && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{plan.notes}</p>
            )}

            {isScheduled && (
              <>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => onComplete(plan)}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-medium active:bg-green-100 min-h-[44px]"
                  >
                    <CheckCircle size={14} />
                    {TR.markAsDone}
                  </button>
                  <button
                    onClick={() => setShowPostpone(!showPostpone)}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium active:bg-gray-200 min-h-[44px]"
                  >
                    <Clock size={14} />
                    {TR.postpone}
                    {showPostpone ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-medium active:bg-gray-200 min-h-[44px]"
                  >
                    <X size={14} />
                    {TR.cancelPlan}
                  </button>
                </div>

                <div className="expand-collapse" style={{ maxHeight: showPostpone ? '80px' : '0', opacity: showPostpone ? 1 : 0 }}>
                  <div className="flex gap-2 items-center mt-2">
                    <input
                      type="date"
                      value={postponeDate}
                      onChange={e => setPostponeDate(e.target.value)}
                      min={todayISO()}
                      className="flex-1 px-3 py-2.5 text-base rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-water-500 min-h-[44px]"
                    />
                    <button
                      onClick={handlePostpone}
                      disabled={!postponeDate || loading}
                      className="px-4 py-2.5 text-sm font-medium rounded-xl bg-water-600 text-white active:bg-water-700 disabled:opacity-50 min-h-[44px]"
                    >
                      {TR.confirm}
                    </button>
                  </div>
                </div>
              </>
            )}

            {plan.status === 'completed' && (
              <span className="inline-flex items-center gap-1 mt-2 text-xs text-emerald-600 font-medium">
                <CheckCircle size={12} />
                {TR.completedFilter}
              </span>
            )}

            {plan.status === 'cancelled' && (
              <span className="inline-flex items-center gap-1 mt-2 text-xs text-gray-400 font-medium">
                <X size={12} />
                {TR.cancelledFilter}
              </span>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showCancelConfirm}
        title={TR.cancelPlan}
        message={TR.confirmCancelPlan}
        confirmLabel={TR.cancelPlan}
        confirmDestructive
        onConfirm={handleCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </>
  );
}
