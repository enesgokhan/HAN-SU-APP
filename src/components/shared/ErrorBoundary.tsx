import { Component, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { TR } from '../../constants/tr';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 mb-2">{TR.errorTitle}</h1>
          <p className="text-sm text-gray-500 mb-6 text-center">{TR.errorDescription}</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
            className="px-6 py-3 rounded-xl bg-water-600 text-white font-medium text-sm active:bg-water-700 min-h-[48px]"
          >
            {TR.errorReload}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
