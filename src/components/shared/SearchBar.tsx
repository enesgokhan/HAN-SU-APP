import { Search, X } from 'lucide-react';
import { TR } from '../../constants/tr';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  variant?: 'light' | 'dark';
}

export default function SearchBar({ value, onChange, variant = 'light' }: SearchBarProps) {
  const isDark = variant === 'dark';

  return (
    <div className="relative">
      <Search
        size={18}
        className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/50' : 'text-gray-400'}`}
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={TR.searchPlaceholder}
        className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-base border-0 focus:outline-none focus:ring-2 ${
          isDark
            ? 'bg-white/15 text-white placeholder-white/50 focus:ring-white/30'
            : 'bg-gray-100 text-gray-900 placeholder-gray-400 focus:ring-water-500'
        }`}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Aramayı temizle"
          className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-lg ${
            isDark ? 'text-white/50 active:text-white' : 'text-gray-400 active:text-gray-600'
          }`}
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
