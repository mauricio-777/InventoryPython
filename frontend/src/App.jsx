import { useState, useEffect } from 'react';
import './App.css';
import { MainLayout } from './CommonLayer/components/layouts/MainLayout.jsx';
import { LoginForm } from './Auth/UI/components/LoginForm.jsx';
import { RoleGuard } from './Auth/UI/components/RoleGuard.jsx';
import { useUserRole } from './CommonLayer/hooks/useUserRole.js';
import { NAV_ITEMS } from './Router/routes.js';
import { ProductListPage } from './Product/UI/pages/ProductListPage.jsx';
import { PurchaseEntryPage } from './Product/UI/pages/PurchaseEntryPage.jsx';
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
import { LocationsPage } from './Warehouse/UI/pages/LocationsPage.jsx';
import { OrdersPage } from './Order/UI/pages/OrdersPage.jsx';
import { PickingPage } from './Order/UI/pages/PickingPage.jsx';
import { DispatchPage } from './Order/UI/pages/DispatchPage.jsx';

/** Devuelve el primer módulo accesible para un rol dado. */
function getDefaultView(role) {
  const first = NAV_ITEMS.find(item =>
    !item.roles || item.roles.length === 0 || item.roles.includes(role)
  );
  return first?.id ?? 'products';
}

function App() {
  const { userRole } = useUserRole();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userRole') ? true : false;
    }
    return false;
  });

  // El módulo activo — se inicializa con el rol que haya en localStorage
  const [currentView, setView] = useState(() =>
    getDefaultView(localStorage.getItem('userRole') || '')
  );



  // Cuando cambia el rol (tras login), ir al módulo por defecto de ese rol
  useEffect(() => {
    if (userRole) {
      setView(getDefaultView(userRole));
    }
  }, [userRole]);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setView('products'); // Resetear vista para el próximo usuario
  };

  // Si no está autenticado, mostrar la vista pública
  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <MainLayout currentView={currentView} setView={setView} onLogout={handleLogout}>
      {currentView === 'products' && <ProductListPage />}
      {currentView === 'purchases' && (
        <RoleGuard allowedRoles={['admin', 'gestor']}>
          <PurchaseEntryPage />
        </RoleGuard>
      )}
      {currentView === 'orders' && (
        <RoleGuard allowedRoles={['admin', 'gestor']}>
          <OrdersPage />
        </RoleGuard>
      )}
      {currentView === 'picking' && (
        <RoleGuard allowedRoles={['admin', 'gestor', 'picker']}>
          <PickingPage />
        </RoleGuard>
      )}
      {currentView === 'dispatch' && (
        <RoleGuard allowedRoles={['admin', 'gestor', 'driver']}>
          <DispatchPage />
        </RoleGuard>
      )}
      {currentView === 'batches' && <BatchDetailsPage />}
      {currentView === 'locations' && (
        <RoleGuard allowedRoles={['admin', 'gestor']}>
          <LocationsPage />
        </RoleGuard>
      )}
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

