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
    BATCHES: 'batches',
    LOCATIONS: 'locations',
    ORDERS: 'orders',
    PICKING: 'picking',
    DISPATCH: 'dispatch',

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
    // --- DASHBOARD ---
    {
        id: ROUTES.DASHBOARD,
        category: 'General',
        name: 'Dashboard',
        icon: 'ChartBar',
        roles: ['admin', 'gestor', 'consultor'],
    },
    // --- INVENTARIO ---
    {
        id: ROUTES.PRODUCTS,
        category: 'Inventario',
        name: 'Catálogo Productos',
        icon: 'Package',
        roles: ['admin', 'gestor', 'consultor'],
    },
    {
        id: ROUTES.PURCHASES,
        category: 'Inventario',
        name: 'Comprar Lote',
        icon: 'ShoppingCart',
        roles: ['admin', 'gestor'],
    },
    {
        id: ROUTES.BATCHES,
        category: 'Inventario',
        name: 'Stock Activo',
        icon: 'Archive',
        roles: ['admin', 'gestor', 'consultor'],
    },
    {
        id: ROUTES.LOCATIONS,
        category: 'Inventario',
        name: 'Mapa Almacén',
        icon: 'MapPinLine',
        roles: ['admin', 'gestor'],
    },
    // --- LOGÍSTICA / PEDIDOS ---
    {
        id: ROUTES.ORDERS,
        category: 'Logística',
        name: 'Gestión Pedidos',
        icon: 'Receipt',
        roles: ['admin', 'gestor'],
    },
    {
        id: ROUTES.PICKING,
        category: 'Logística',
        name: 'Panel Recolección',
        icon: 'HandGrabbing',
        roles: ['admin', 'gestor', 'picker'],
    },
    {
        id: ROUTES.DISPATCH,
        category: 'Logística',
        name: 'Panel Repartidor',
        icon: 'Truck',
        roles: ['admin', 'gestor', 'driver'],
    },
    // --- CONTACTOS ---
    {
        id: ROUTES.CUSTOMERS,
        category: 'Contactos',
        name: 'Clientes',
        icon: 'Users',
        roles: ['admin', 'gestor', 'consultor'],
    },
    {
        id: ROUTES.SUPPLIERS,
        category: 'Contactos',
        name: 'Proveedores',
        icon: 'Truck',
        roles: ['admin', 'gestor', 'consultor'],
    },
    // --- REPORTES ---
    {
        id: ROUTES.REPORTS_VALUATION,
        category: 'Reportes',
        name: 'Reporte Valorización',
        icon: 'ChartLineUp',
        roles: ['admin', 'gestor', 'consultor'],
    },
    {
        id: ROUTES.REPORTS_ROTATION,
        category: 'Reportes',
        name: 'Reporte Rotación',
        icon: 'ArrowClockwise',
        roles: ['admin', 'gestor', 'consultor'],
    },
    // --- SISTEMA Y AUDITORÍA ---
    {
        id: ROUTES.USERS,
        category: 'Auditoría y Sistema',
        name: 'Usuarios',
        icon: 'UsersThree',
        roles: ['admin'],
    },
    {
        id: ROUTES.AUDIT,
        category: 'Auditoría y Sistema',
        name: 'Audit. Movimientos',
        icon: 'ListDashes',
        roles: ['admin'],
    },
    {
        id: ROUTES.AUDIT_HISTORY,
        category: 'Auditoría y Sistema',
        name: 'Historial Filtrado',
        icon: 'ClockCounterClockwise',
        roles: ['admin'],
    },
    {
        id: ROUTES.AUDIT_LOGS,
        category: 'Auditoría y Sistema',
        name: 'Pista Auditoría',
        icon: 'Files',
        roles: ['admin'],
    },
];
