import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BottomNav from './components/layout/BottomNav';
import ToastContainer from './components/shared/Toast';
import ErrorBoundary from './components/shared/ErrorBoundary';
import DashboardPage from './pages/DashboardPage';
import NotificationsPage from './pages/NotificationsPage';
import CustomerListPage from './pages/CustomerListPage';
import CustomerFormPage from './pages/CustomerFormPage';
import CustomerDetailPage from './pages/CustomerDetailPage';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-full pb-16 max-w-lg mx-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/customers" element={<CustomerListPage />} />
            <Route path="/customers/new" element={<CustomerFormPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/customers/:id/edit" element={<CustomerFormPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <BottomNav />
          <ToastContainer />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
