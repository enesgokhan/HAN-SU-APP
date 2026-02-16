interface FilterOption {
  key: string;
  label: string;
  count?: number;
}

interface FilterPillsProps {
  options: FilterOption[];
  activeKey: string;
  onChange: (key: string) => void;
}

export default function FilterPills({ options, activeKey, onChange }: FilterPillsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
      {options.map(opt => {
        const isActive = opt.key === activeKey;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 min-h-[36px] ${
              isActive
                ? 'bg-water-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 active:bg-gray-200'
            }`}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className={`ml-1 ${isActive ? 'text-water-200' : 'text-gray-400'}`}>
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
