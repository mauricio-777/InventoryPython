/**
 * Centralised route constants.
 *
 * Import this instead of hard-coding path strings in components.
 *
 * Usage
 * ─────
 * import { ROUTES } from '../Router/routes.js';
 * navigate(ROUTES.PRODUCTS);
 * setView(ROUTES.DASHBOARD);
 */

export const ROUTES = {
    // Products & inventory
    PRODUCTS: 'products',
    PURCHASES: 'purchases',
    POS: 'pos',
    BATCHES: 'batches',

    // Stakeholders
    CUSTOMERS: 'customers',
    SUPPLIERS: 'suppliers',

    // Reports & dashboard
    DASHBOARD: 'dashboard',
    REPORTS_VALUATION: 'reports-valuation',
    REPORTS_ROTATION: 'reports-rotation',

    // Audit
    AUDIT: 'audit',
    AUDIT_HISTORY: 'audit-history',
    AUDIT_LOGS: 'audit-logs',

    // Users (admin only)
    USERS: 'users',

    // Auth (for future Epic 3 integration)
    LOGIN: 'login',
    REGISTER: 'register',
};

/**
 * Navigation items definition, shared between MainLayout and any future drawer/menu.
 * The `roles` array defines which user roles can see the item (empty = all roles).
 */
export const NAV_ITEMS = [
    {
        id: ROUTES.PRODUCTS,
        name: 'Catálogo',
        icon: 'Package',
        roles: [],
    },
    {
        id: ROUTES.PURCHASES,
        name: 'Comprar Lote',
        icon: 'ShoppingCart',
        roles: ['admin', 'gestor'],
    },
    {
        id: ROUTES.POS,
        name: 'Punto de Venta',
        icon: 'Monitor',
        roles: ['admin', 'gestor'],
    },
    {
        id: ROUTES.BATCHES,
        name: 'Stock Activo',
        icon: 'Archive',
        roles: [],
    },
    {
        id: ROUTES.CUSTOMERS,
        name: 'Clientes',
        icon: 'Users',
        roles: [],
    },
    {
        id: ROUTES.SUPPLIERS,
        name: 'Proveedores',
        icon: 'Truck',
        roles: [],
    },
    {
        id: ROUTES.USERS,
        name: 'Usuarios',
        icon: 'UsersThree',
        roles: ['admin'],
    },
    {
        id: ROUTES.DASHBOARD,
        name: 'Dashboard',
        icon: 'ChartBar',
        roles: [],
    },
    {
        id: ROUTES.REPORTS_VALUATION,
        name: 'Reporte Valorización',
        icon: 'ChartLineUp',
        roles: [],
    },
    {
        id: ROUTES.REPORTS_ROTATION,
        name: 'Reporte Rotación',
        icon: 'ArrowClockwise',
        roles: [],
    },
    {
        id: ROUTES.AUDIT,
        name: 'Audit. Movimientos',
        icon: 'ListDashes',
        roles: ['admin'],
    },
    {
        id: ROUTES.AUDIT_HISTORY,
        name: 'Historial Filtrado',
        icon: 'ClockCounterClockwise',
        roles: ['admin'],
    },
    {
        id: ROUTES.AUDIT_LOGS,
        name: 'Pista Auditoría',
        icon: 'Files',
        roles: ['admin'],
    },
];
