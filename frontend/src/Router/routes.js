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
 *
 * roles: [] → visible to ALL roles (no restriction).
 * roles: ['admin', 'gestor'] → admin + gestor only.
 * roles: ['admin'] → admin only.
 *
 * These match the backend @require_role decorators in each controller.
 */
export const NAV_ITEMS = [
    {
        id: ROUTES.PRODUCTS,
        name: 'Catálogo',
        icon: 'Package',
        roles: ['admin', 'gestor', 'consultor'],  // GET: todos | POST/PUT/DELETE: admin, gestor
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
        roles: ['admin', 'gestor', 'consultor'],
    },
    {
        id: ROUTES.CUSTOMERS,
        name: 'Clientes',
        icon: 'Users',
        roles: ['admin', 'gestor', 'consultor'],
    },
    {
        id: ROUTES.SUPPLIERS,
        name: 'Proveedores',
        icon: 'Truck',
        roles: ['admin', 'gestor', 'consultor'],
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
        roles: ['admin', 'gestor', 'consultor'],
    },
    {
        id: ROUTES.REPORTS_VALUATION,
        name: 'Reporte Valorización',
        icon: 'ChartLineUp',
        roles: ['admin', 'gestor', 'consultor'],
    },
    {
        id: ROUTES.REPORTS_ROTATION,
        name: 'Reporte Rotación',
        icon: 'ArrowClockwise',
        roles: ['admin', 'gestor', 'consultor'],
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
