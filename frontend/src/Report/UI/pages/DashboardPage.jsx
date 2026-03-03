import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../Application/useDashboard.js';

export const DashboardPage = () => {
    const {
        loading,
        error,
        dashboard,
        fetchDashboard,
        fetchInventoryValue,
        fetchLowStock,
        fetchRecentMovements,
        fetchRotationSummary
    } = useDashboard();

    const [lowStockThreshold, setLowStockThreshold] = useState(10);
    const [selectedTab, setSelectedTab] = useState('overview');

    useEffect(() => {
        fetchDashboard(lowStockThreshold);
    }, [lowStockThreshold]);

    if (loading) {
        return (
            <div className="flex justify-center flex-col items-center py-12 gap-4 w-full">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-400"></div>
                <span className="text-gray-400">Cargando dashboard...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl w-full">
                <p>{error}</p>
            </div>
        );
    }

    const inventoryValue = dashboard?.total_inventory_value || 0;
    const lowStockProducts = dashboard?.low_stock_products || [];
    const recentMovements = dashboard?.recent_movements || [];
    const rotationData = dashboard?.rotation_summary || {};

    return (
        <div className="animate-fade-in w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="p-3 md:p-4 bg-blue-500/10 rounded-2xl relative border border-blue-500/20 shadow-inner">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-light text-white tracking-wide">
                        <span className="font-bold text-blue-400">Dashboard</span> de Inventario
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">Resumen ejecutivo del estado de tu inventario</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Inventory Value */}
                <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 hover:border-blue-500/20 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-sm mb-2">Valor Total Inventario</p>
                            <h3 className="text-2xl md:text-3xl font-bold text-blue-400">
                                Bs {inventoryValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </h3>
                        </div>
                        <div className="p-3 bg-blue-500/10 rounded-xl">
                            <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.16 2.75a.75.75 0 00-1.08.6v1.514h-.429A2.25 2.25 0 004.25 7v6a2.25 2.25 0 002.25 2.25h8.5A2.25 2.25 0 0017.25 13V7a2.25 2.25 0 00-2.25-2.25h-.429V3.346a.75.75 0 10-1.5 0v1.429h-3.5V3.346a.75.75 0 00-.75-.596zM9 6.5a.75.75 0 000 1.5h2a.75.75 0 000-1.5H9z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Low Stock Products Count */}
                <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 hover:border-yellow-500/20 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-sm mb-2">Productos con Stock Bajo</p>
                            <h3 className="text-2xl md:text-3xl font-bold text-yellow-400">
                                {lowStockProducts.length}
                            </h3>
                            <p className="text-xs text-gray-500 mt-2">Umbral: {lowStockThreshold} unidades</p>
                        </div>
                        <div className="p-3 bg-yellow-500/10 rounded-xl">
                            <svg className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Recent Movements Count */}
                <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 hover:border-green-500/20 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-sm mb-2">Últimos Movimientos</p>
                            <h3 className="text-2xl md:text-3xl font-bold text-green-400">
                                {recentMovements.length}
                            </h3>
                            <p className="text-xs text-gray-500 mt-2">Últimas 24 horas aprox</p>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-xl">
                            <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3.5 2A1.5 1.5 0 002 3.5v13A1.5 1.5 0 003.5 18h13a1.5 1.5 0 001.5-1.5V3.5A1.5 1.5 0 0016.5 2h-13zm0 2h13v13h-13v-13z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Rotation Index Count */}
                <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 hover:border-purple-500/20 transition-colors">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-400 text-sm mb-2">Rotación (30 días)</p>
                            <h3 className="text-2xl md:text-3xl font-bold text-purple-400">
                                {rotationData.total_exits || 0}
                            </h3>
                            <p className="text-xs text-gray-500 mt-2">Movimientos de salida</p>
                        </div>
                        <div className="p-3 bg-purple-500/10 rounded-xl">
                            <svg className="w-6 h-6 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.72 3.97a.75.75 0 011.06 0L10 8.94l4.22-4.97a.75.75 0 111.12 1.006l-5 5.5a.75.75 0 01-1.12 0l-5-5.5a.75.75 0 010-1.006zm0 6a.75.75 0 011.06 0L10 14.94l4.22-4.97a.75.75 0 111.12 1.006l-5 5.5a.75.75 0 01-1.12 0l-5-5.5a.75.75 0 010-1.006z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Threshold Control */}
            <div className="flex gap-4 mb-8 items-center">
                <label className="text-gray-400">Umbral de Stock Bajo:</label>
                <input
                    type="number"
                    min="1"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(parseInt(e.target.value))}
                    className="px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 w-20"
                />
                <span className="text-gray-500 text-sm">unidades</span>
            </div>

            {/* Content Tabs */}
            <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 md:p-8 w-full">
                {/* Low Stock Products */}
                {lowStockProducts.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Productos con Stock Bajo
                        </h2>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left min-w-[600px]">
                                <thead>
                                    <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4 font-medium">Producto</th>
                                        <th className="px-6 py-4 font-medium">SKU</th>
                                        <th className="px-6 py-4 font-medium">Stock Actual</th>
                                        <th className="px-6 py-4 font-medium">Umbral</th>
                                        <th className="px-6 py-4 font-medium">Diferencia</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {lowStockProducts.map(product => (
                                        <tr key={product.product_id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-white font-medium">{product.name}</td>
                                            <td className="px-6 py-4 text-gray-400">{product.sku}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                                                    {product.current_stock} {product.unit_measure}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">{product.threshold}</td>
                                            <td className="px-6 py-4 text-red-400 font-medium">
                                                {product.threshold - product.current_stock}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Recent Movements */}
                {recentMovements.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M3.5 2A1.5 1.5 0 002 3.5v13A1.5 1.5 0 003.5 18h13a1.5 1.5 0 001.5-1.5V3.5A1.5 1.5 0 0016.5 2h-13zm0 2h13v13h-13v-13z" />
                            </svg>
                            Últimos Movimientos
                        </h2>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left min-w-[800px]">
                                <thead>
                                    <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4 font-medium">Fecha</th>
                                        <th className="px-6 py-4 font-medium">Producto</th>
                                        <th className="px-6 py-4 font-medium">Tipo</th>
                                        <th className="px-6 py-4 font-medium">Cantidad</th>
                                        <th className="px-6 py-4 font-medium text-right">Total</th>
                                        <th className="px-6 py-4 font-medium">Usuario</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {recentMovements.map(movement => (
                                        <tr key={movement.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                                                {new Date(movement.created_at).toLocaleString('es-ES')}
                                            </td>
                                            <td className="px-6 py-4 text-white font-medium">{movement.product_name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                                                    movement.type === 'ENTRY'
                                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
                                                    {movement.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">{movement.quantity}</td>
                                            <td className="px-6 py-4 text-right text-white font-semibold">
                                                Bs {movement.total_price?.toFixed(2) || '0.00'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">{movement.created_by || 'Sistema'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
