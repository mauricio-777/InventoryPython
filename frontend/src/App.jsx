import { useState } from 'react';
import './App.css';
import { MainLayout } from './CommonLayer/components/layouts/MainLayout.jsx';
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

function App() {
  const [currentView, setView] = useState('products');

  return (
    <MainLayout currentView={currentView} setView={setView}>
      {currentView === 'products' && <ProductListPage />}
      {currentView === 'purchases' && <PurchaseEntryPage />}
      {currentView === 'pos' && <PointOfSalePage />}
      {currentView === 'batches' && <BatchDetailsPage />}
      {currentView === 'customers' && <CustomersPage />}
      {currentView === 'suppliers' && <SuppliersPage />}
      {currentView === 'audit' && <MovementHistoryPage />}
      {currentView === 'audit-history' && <AuditHistoryPage />}
      {currentView === 'audit-logs' && <AuditLogPage />}
      {currentView === 'dashboard' && <DashboardPage />}
      {currentView === 'reports-valuation' && <ValuationReportPage />}
      {currentView === 'reports-rotation' && <RotationReportPage />}
    </MainLayout>
  );
}

export default App;
