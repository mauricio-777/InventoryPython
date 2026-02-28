import { useState } from 'react';
import './App.css';
import { MainLayout } from './CommonLayer/components/layouts/MainLayout.jsx';
import { ProductListPage } from './Product/UI/pages/ProductListPage.jsx';
import { PurchaseEntryPage } from './Product/UI/pages/PurchaseEntryPage.jsx';
import { PointOfSalePage } from './Product/UI/pages/PointOfSalePage.jsx';
import { BatchDetailsPage } from './Product/UI/pages/BatchDetailsPage.jsx';
import { MovementHistoryPage } from './Audit/UI/pages/MovementHistoryPage.jsx';

function App() {
  const [currentView, setView] = useState('products');

  return (
    <MainLayout currentView={currentView} setView={setView}>
      {currentView === 'products' && <ProductListPage />}
      {currentView === 'purchases' && <PurchaseEntryPage />}
      {currentView === 'pos' && <PointOfSalePage />}
      {currentView === 'batches' && <BatchDetailsPage />}
      {currentView === 'audit' && <MovementHistoryPage />}
    </MainLayout>
  );
}

export default App;
