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
  const { userRole, clearUserData } = useUserRole();
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userRole') ? true : false;
    }
    return false;
  });

  const [isSynced, setIsSynced] = useState(true); // Controla si el estado está sincronizado

  // El módulo activo — se inicializa con el rol que haya en localStorage
  const [currentView, setView] = useState(() =>
    getDefaultView(localStorage.getItem('userRole') || '')
  );

  // Sincronizar currentView cuando el rol cambia
  useEffect(() => {
    if (isLoggedIn && userRole && userRole !== 'consultor') {
      const defaultView = getDefaultView(userRole);
      setView(defaultView);
    }
  }, [userRole, isLoggedIn]);

  // Verificar que el rol en estado coincida con localStorage
  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    const storedStatus = !!storedRole;
    
    // Si hay mismatch entre estado y localStorage, ajustar
    if (storedStatus !== isLoggedIn) {
      // localStorage indica que estamos logueados pero App.jsx dice lo contrario
      // O viceversa. Sincronizar.
      setIsSynced(false);
      const timer = setTimeout(() => {
        setIsSynced(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, userRole]);

  const handleLoginSuccess = () => {
    // Delay para asegurar que localStorage esté completamente actualizado desde useAuthLogin
    setTimeout(() => {
      setIsLoggedIn(true);
      setIsSynced(true);
    }, 100);
  };

  const handleLogout = () => {
    setIsSynced(false);
    // Limpiar localStorage explícitamente
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    // Limpiar hook state
    clearUserData();
    // Después, actualizar App state
    setTimeout(() => {
      setIsLoggedIn(false);
      setView('products');
      setIsSynced(true);
    }, 100);
  };

  // Si no está autenticado, mostrar la vista pública
  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  // Esperar a que el estado esté sincronizado antes de renderizar
  if (!isSynced) {
    return null; // No renderizar nada durante la sincronización
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
        <RoleGuard allowedRoles={['admin', 'gestor', 'almacenero']}>
          <PickingPage />
        </RoleGuard>
      )}
      {currentView === 'dispatch' && (
        <RoleGuard allowedRoles={['admin', 'gestor', 'repartidor']}>
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

