import { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error';
}

let addToastFn: ((text: string, type: 'success' | 'error') => void) | null = null;

export function showToast(text: string, type: 'success' | 'error' = 'success') {
  addToastFn?.(text, type);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToastFn = (text, type) => {
      const id = crypto.randomUUID();
      setToasts(prev => [...prev, { id, text, type }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3500);
    };
    return () => { addToastFn = null; };
  }, []);

  const dismiss = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div role="alert" aria-live="assertive" className="fixed top-4 left-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          onClick={() => dismiss(toast.id)}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium pointer-events-auto cursor-pointer toast-enter ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
          {toast.text}
        </div>
      ))}
    </div>
  );
}
