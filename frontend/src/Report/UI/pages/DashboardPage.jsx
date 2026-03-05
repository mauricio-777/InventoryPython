import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../Application/useDashboard.js';
import * as PhosphorIcons from '@phosphor-icons/react';

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
            <div className="flex justify-center flex-col items-center py-12 gap-4 w-full h-[60vh]">
                <PhosphorIcons.Spinner size={40} className="animate-spin text-[var(--color-primary)]" />
                <span className="text-gray-500 font-medium">Cargando dashboard...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl w-full flex items-center gap-3 shadow-sm">
                <PhosphorIcons.WarningCircle size={24} weight="fill" className="text-red-500" />
                <p className="font-medium">{error}</p>
            </div>
        );
    }

    const inventoryValue = dashboard?.total_inventory_value || 0;
    const lowStockProducts = dashboard?.low_stock_products || [];
    const recentMovements = dashboard?.recent_movements || [];
    const rotationData = dashboard?.rotation_summary || {};

    return (
        <div className="animate-fade-in w-full max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-tertiary)] tracking-tight">
                    Real-time<br />inventory
                </h1>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Inventory Value */}
                <div className="bg-[var(--color-primary)] rounded-[2.5rem] p-8 shadow-[0_20px_40px_rgba(8,60,181,0.2)] text-[var(--color-quinary)] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
                    <div className="flex flex-col h-full justify-between gap-6 relative z-10">
                        <div className="flex justify-between items-start">
                            <p className="text-blue-100 font-medium">Valor Total Inventario</p>
                            <div className="w-10 h-10 bg-[var(--color-quinary)] rounded-full flex items-center justify-center -mr-2 -mt-2 shadow-sm">
                                <PhosphorIcons.ArrowUpRight size={20} weight="bold" className="text-[var(--color-tertiary)]" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1 opacity-90">
                                <PhosphorIcons.TrendUp size={16} weight="bold" />
                                <span className="text-sm font-bold">+12%</span>
                            </div>
                            <h3 className="text-4xl font-bold tracking-tight">
                                Bs {inventoryValue.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Low Stock Products Count */}
                <div className="bg-[var(--color-quinary)] rounded-[2.5rem] border border-gray-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-[var(--color-tertiary)] group hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex flex-col h-full justify-between gap-6">
                        <div className="flex justify-between items-start">
                            <p className="text-gray-500 font-medium">Stock Bajo</p>
                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center -mr-2 -mt-2">
                                <PhosphorIcons.ArrowUpRight size={20} weight="bold" className="text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1 text-red-500">
                                <PhosphorIcons.Warning size={16} weight="bold" />
                                <span className="text-sm font-bold">Atención</span>
                            </div>
                            <h3 className="text-4xl font-bold tracking-tight">
                                {lowStockProducts.length}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Recent Movements Count */}
                <div className="bg-gray-400 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-[var(--color-quinary)] group hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex flex-col h-full justify-between gap-6">
                        <div className="flex justify-between items-start">
                            <p className="text-gray-100 font-medium">Últimos Mov. (24h)</p>
                            <div className="w-10 h-10 bg-[var(--color-quinary)] rounded-full flex items-center justify-center -mr-2 -mt-2 shadow-sm">
                                <PhosphorIcons.ArrowUpRight size={20} weight="bold" className="text-[var(--color-tertiary)]" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1 text-green-300">
                                <PhosphorIcons.TrendUp size={16} weight="bold" />
                                <span className="text-sm font-bold">Activo</span>
                            </div>
                            <h3 className="text-4xl font-bold tracking-tight">
                                {recentMovements.length}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Rotation Index Count */}
                <div className="bg-[var(--color-quinary)] rounded-[2.5rem] border border-gray-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-[var(--color-tertiary)] group hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex flex-col h-full justify-between gap-6">
                        <div className="flex justify-between items-start">
                            <p className="text-gray-500 font-medium">Rotación (30d)</p>
                            <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center -mr-2 -mt-2">
                                <PhosphorIcons.ArrowUpRight size={20} weight="bold" className="text-gray-400" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1 text-[var(--color-primary)]">
                                <PhosphorIcons.ArrowsClockwise size={16} weight="bold" />
                                <span className="text-sm font-bold">Salidas</span>
                            </div>
                            <h3 className="text-4xl font-bold tracking-tight">
                                {rotationData.total_exits || 0}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Threshold Control */}
            <div className="flex gap-4 items-center bg-[var(--color-quinary)] w-max px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
                <label className="text-gray-500 font-medium text-sm">Umbral Stock Bajo:</label>
                <input
                    type="number"
                    min="1"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(parseInt(e.target.value))}
                    className="px-3 py-1.5 bg-gray-50 text-[var(--color-tertiary)] font-bold rounded-xl border border-gray-200 w-20 outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
                <span className="text-gray-400 text-sm font-medium">unidades</span>
            </div>

            {/* Content Display */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Low Stock Products */}
                {lowStockProducts.length > 0 && (
                    <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-[var(--color-tertiary)]">
                                Stock Crítico
                            </h2>
                            <button className="w-10 h-10 bg-[var(--color-tertiary)] text-[var(--color-quinary)] rounded-full flex items-center justify-center shadow-lg">
                                <PhosphorIcons.ArrowUpRight size={20} weight="bold" />
                            </button>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                                        <th className="pb-4">Producto</th>
                                        <th className="pb-4">Stock</th>
                                        <th className="pb-4 text-right">Diferencia</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-50">
                                    {lowStockProducts.slice(0, 5).map(product => (
                                        <tr key={product.product_id} className="group">
                                            <td className="py-4 text-[var(--color-tertiary)] font-bold">
                                                {product.name}
                                                <div className="text-xs text-gray-400 font-medium">{product.sku}</div>
                                            </td>
                                            <td className="py-4">
                                                <span className="px-3 py-1 rounded-xl text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                                                    {product.current_stock}
                                                </span>
                                            </td>
                                            <td className="py-4 text-red-500 font-bold text-right">
                                                -{product.threshold - product.current_stock}
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
                    <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold text-[var(--color-tertiary)]">
                                Historial de Movimientos
                            </h2>
                            <button className="w-10 h-10 bg-[var(--color-tertiary)] text-[var(--color-quinary)] rounded-full flex items-center justify-center shadow-lg">
                                <PhosphorIcons.ArrowUpRight size={20} weight="bold" />
                            </button>
                        </div>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                                        <th className="pb-4">Producto</th>
                                        <th className="pb-4">Tipo</th>
                                        <th className="pb-4 text-right">Cant.</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-gray-50">
                                    {recentMovements.slice(0, 5).map(movement => (
                                        <tr key={movement.id} className="group">
                                            <td className="py-4 text-[var(--color-tertiary)] font-bold">
                                                {movement.product_name}
                                                <div className="text-xs text-gray-400 font-medium">
                                                    {new Date(movement.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${movement.type === 'ENTRY'
                                                        ? 'bg-green-50 text-green-600 border-green-100'
                                                        : 'bg-red-50 text-red-600 border-red-100'
                                                    }`}>
                                                    {movement.type === 'ENTRY' ? <PhosphorIcons.ArrowDownLeft weight="bold" /> : <PhosphorIcons.ArrowUpRight weight="bold" />}
                                                    {movement.type}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right text-[var(--color-tertiary)] font-bold">
                                                {movement.quantity}
                                            </td>
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
