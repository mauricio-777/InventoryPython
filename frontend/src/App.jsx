import { useState, useEffect } from 'react';
import './App.css';
import { MainLayout } from './CommonLayer/components/layouts/MainLayout.jsx';
import { LoginForm } from './Auth/UI/components/LoginForm.jsx';
import { ForgotPasswordPage } from './Auth/UI/pages/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from './Auth/UI/pages/ResetPasswordPage.jsx';
import { RoleGuard } from './Auth/UI/components/RoleGuard.jsx';
import { useUserRole } from './CommonLayer/hooks/useUserRole.js';
import { ProductListPage } from './Product/UI/pages/ProductListPage.jsx';
import { PurchaseEntryPage } from './Product/UI/pages/PurchaseEntryPage.jsx';
import { PointOfSalePage } from './Product/UI/pages/PointOfSalePage.jsx';
import { BatchDetailsPage } from './Product/UI/pages/BatchDetailsPage.jsx';
import { MovementHistoryPage } from './Audit/UI/pages/MovementHistoryPage.jsx';
import { AuditHistoryPage } from './Audit/UI/pages/AuditHistoryPage.jsx';
import { AuditLogPage } from './Audit/UI/pages/AuditLogPage.jsx';
import { DashboardPage } from './Report/UI/pages/DashboardPage.jsx';
import { ValuationReportPage } from './Report/UI/pages/ValuationReportPage.jsx';
import { RotationReportPage } from './Report/UI/pages/RotationReportPage.jsx';
import { CustomersPage } from './Stakeholder/UI/pages/CustomersPage.jsx';
import { SuppliersPage } from './Stakeholder/UI/pages/SuppliersPage.jsx';
import { UsersPage } from './Auth/UI/pages/UsersPage.jsx';

function App() {
  const [currentView, setView] = useState('products');
  const { userRole } = useUserRole();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userRole') ? true : false;
    }
    return false;
  });

  const [authView, setAuthView] = useState('login'); // 'login', 'forgot', 'reset'
  const [resetToken, setResetToken] = useState(null);

  useEffect(() => {
    // Check if the URL has a token parameter
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setResetToken(token);
      setAuthView('reset');

      // Clean up the URL visually without reloading
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    // useUserRole ya maneja el localStorage, pero al setear state aquí, 
    // forzamos el re-render para mostrar LoginForm.
  };

  // Si no está autenticado, mostrar vistas públicas
  if (!isLoggedIn) {
    if (authView === 'forgot') {
      return <ForgotPasswordPage onBackToLogin={() => setAuthView('login')} />;
    }
    if (authView === 'reset' && resetToken) {
      return <ResetPasswordPage token={resetToken} onBackToLogin={() => setAuthView('login')} />;
    }
    return <LoginForm onLoginSuccess={handleLoginSuccess} onForgotPassword={() => setAuthView('forgot')} />;
  }

  return (
    <MainLayout currentView={currentView} setView={setView} onLogout={handleLogout}>
      {currentView === 'products' && <ProductListPage />}
      {currentView === 'purchases' && (
        <RoleGuard allowedRoles={['admin', 'gestor']}>
          <PurchaseEntryPage />
        </RoleGuard>
      )}
      {currentView === 'pos' && (
        <RoleGuard allowedRoles={['admin', 'gestor']}>
          <PointOfSalePage />
        </RoleGuard>
      )}
      {currentView === 'batches' && <BatchDetailsPage />}
      {currentView === 'customers' && <CustomersPage />}
      {currentView === 'suppliers' && <SuppliersPage />}
      {currentView === 'users' && (
        <RoleGuard allowedRoles={['admin']}>
          <UsersPage />
        </RoleGuard>
      )}
      {currentView === 'audit' && (
        <RoleGuard allowedRoles={['admin']}>
          <MovementHistoryPage />
        </RoleGuard>
      )}
      {currentView === 'audit-history' && (
        <RoleGuard allowedRoles={['admin']}>
          <AuditHistoryPage />
        </RoleGuard>
      )}
      {currentView === 'audit-logs' && (
        <RoleGuard allowedRoles={['admin']}>
          <AuditLogPage />
        </RoleGuard>
      )}
      {currentView === 'dashboard' && <DashboardPage />}
      {currentView === 'reports-valuation' && <ValuationReportPage />}
      {currentView === 'reports-rotation' && <RotationReportPage />}
    </MainLayout>
  );
}

export default App;

