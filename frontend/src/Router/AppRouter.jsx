import React from 'react';
import { NAV_ITEMS, ROUTES } from './routes.js';

/**
 * AppRouter — central routing logic for the application.
 *
 * Currently uses a simple view-state pattern (matching App.jsx).
 * When React Router is integrated in a future epic, this component
 * will become the <BrowserRouter>/<Routes> wrapper.
 *
 * Props
 * ─────
 * currentView  string   – active view key (matches ROUTES constants)
 * setView      function – state setter to change the active view
 * children     node     – page components resolved by App.jsx
 * userRole     string   – current user role (for role-based nav filtering)
 *
 * Usage
 * ─────
 * <AppRouter currentView={currentView} setView={setView} userRole="admin">
 *   {resolvedPage}
 * </AppRouter>
 */
export const AppRouter = ({ currentView, setView, userRole = '', children }) => {
    // Filter nav items by role (empty roles = visible to all)
    const visibleRoutes = NAV_ITEMS
        .filter(item => item.roles.length === 0 || item.roles.includes(userRole))
        .map(item => item.id);

    // Guard: if current view is not accessible for this role, redirect to dashboard
    React.useEffect(() => {
        if (currentView && !visibleRoutes.includes(currentView)) {
            setView(ROUTES.DASHBOARD);
        }
    }, [currentView, userRole]);

    return <>{children}</>;
};
