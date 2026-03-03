import { useState } from 'react';
import './App.css';
import { MainLayout } from './CommonLayer/components/layouts/MainLayout.jsx';
import { LoginForm } from './Auth/UI/components/LoginForm.jsx';
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

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // Si no está autenticado, mostrar LoginForm
  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <MainLayout currentView={currentView} setView={setView}>
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

