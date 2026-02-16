import { useState, useEffect, useRef } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { TR } from '../../constants/tr';

interface SortOption {
  key: string;
  label: string;
}

interface SortMenuProps {
  options: SortOption[];
  activeKey: string;
  onChange: (key: string) => void;
}

export default function SortMenu({ options, activeKey, onChange }: SortMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        aria-label={TR.sortLabel}
        className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 active:bg-gray-200 transition-colors min-h-[44px]"
      >
        <ArrowUpDown size={14} />
        {TR.sortLabel}
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-20 min-w-[160px] animate-fade-in-up">
          {options.map(opt => (
            <button
              key={opt.key}
              onClick={() => { onChange(opt.key); setOpen(false); }}
              className={`w-full text-left px-4 py-3 text-sm transition-colors min-h-[44px] ${
                opt.key === activeKey
                  ? 'bg-water-50 text-water-700 font-medium'
                  : 'text-gray-700 active:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
