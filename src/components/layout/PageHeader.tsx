import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
}

export default function PageHeader({ title, showBack, right }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-2 flex items-center gap-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 flex items-center justify-center -ml-2 rounded-xl active:bg-gray-100"
        >
          <ArrowLeft size={22} className="text-gray-700" />
        </button>
      )}
      <h1 className="text-lg font-bold text-gray-900 flex-1 truncate">{title}</h1>
      {right && <div>{right}</div>}
    </header>
  );
}
