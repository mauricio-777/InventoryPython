import React, { useState, useEffect } from 'react';
import { useReports } from '../../Application/useReports.js';
import { useProductActions } from '../../../Product/Application/useProductActions.js';
import { CustomSelect } from '../../../CommonLayer/components/ui/CustomSelect.jsx';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import * as PhosphorIcons from '@phosphor-icons/react';

export const RotationReportPage = () => {
    const {
        loading,
        error,
        fetchRotationReport
    } = useReports();

    const { products, fetchProducts } = useProductActions();

    const [selectedDays, setSelectedDays] = useState(30);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [rotationData, setRotationData] = useState(null);
    const [sortBy, setSortBy] = useState('rotation_index');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleFetchReport = async () => {
        try {
            const data = await fetchRotationReport(
                selectedDays,
                selectedProductId || null,
                selectedCategory || null
            );
            setRotationData(data);
        } catch (err) {
            console.error(err);
        }
    };

    const productOptions = products.map(p => ({
        value: p.id,
        label: `${p.name} (${p.sku})`
    }));

    const categories = [...new Set(products.map(p => p.category))];
    const categoryOptions = categories.map(cat => ({
        value: cat,
        label: cat
    }));

    const sortedData = rotationData ? [...rotationData].sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];

        if (typeof aVal === 'string') {
            return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }) : [];

    const inputClasses = "w-full px-4 py-3 bg-white text-[var(--color-tertiary)] rounded-2xl border border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all shadow-sm font-medium";
    const labelClasses = "block text-sm font-bold text-[var(--color-tertiary)] mb-3 flex items-center gap-1.5";

    return (
        <div className="animate-fade-in w-full max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="p-3 md:p-4 bg-[var(--color-primary)]/10 rounded-2xl relative border border-[var(--color-primary)]/20 shadow-sm">
                    <PhosphorIcons.ArrowClockwise size={32} weight="fill" className="text-[var(--color-primary)]" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-tertiary)] tracking-tight">
                        Reporte de <span className="text-[var(--color-primary)]">Rotación</span> de Inventario
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium text-sm md:text-base">Identifica productos de lento y rápido movimiento en tu catálogo</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <label className={labelClasses}>
                            <PhosphorIcons.CalendarBlank size={18} className="text-gray-500" />
                            Período (días)
                        </label>
                        <select
                            value={selectedDays}
                            onChange={(e) => setSelectedDays(parseInt(e.target.value))}
                            className={inputClasses}>
                            <option value={7}>Últimos 7 días</option>
                            <option value={30}>Últimos 30 días</option>
                            <option value={60}>Últimos 60 días</option>
                            <option value={90}>Últimos 90 días</option>
                        </select>
                    </div>

                    <div>
                        <label className={labelClasses}>
                            <PhosphorIcons.Package size={18} className="text-gray-500" />
                            Producto (Opcional)
                        </label>
                        <CustomSelect
                            options={productOptions}
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            placeholder="Todos los productos"
                        />
                    </div>

                    <div>
                        <label className={labelClasses}>
                            <PhosphorIcons.Tag size={18} className="text-gray-500" />
                            Categoría (Opcional)
                        </label>
                        <CustomSelect
                            options={categoryOptions}
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            placeholder="Todas las categorías"
                        />
                    </div>

                    <div className="flex items-end">
                        <Button
                            onClick={handleFetchReport}
                            disabled={loading}
                            className="w-full py-3 shadow-sm flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <PhosphorIcons.Spinner size={20} className="animate-spin" />
                                    <span>Cargando...</span>
                                </>
                            ) : (
                                <>
                                    <PhosphorIcons.MagnifyingGlass size={20} weight="bold" />
                                    <span>Consultar</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl shadow-sm flex items-center gap-3 font-medium">
                    <PhosphorIcons.WarningCircle size={24} weight="fill" className="shrink-0 text-red-500" />
                    <p>{error}</p>
                </div>
            )}

            {rotationData && rotationData.length > 0 && (
                <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full animate-slide-up">
                    <div className="p-6 md:p-8 flex justify-between items-center border-b border-gray-100 bg-[var(--color-quaternary)]/50">
                        <h2 className="text-xl font-bold text-[var(--color-tertiary)] flex items-center gap-2">
                            <PhosphorIcons.ListDashes size={24} weight="fill" className="text-[var(--color-primary)]" />
                            Resultados: {rotationData.length} productos
                        </h2>
                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-[var(--color-tertiary)] font-bold text-sm rounded-xl transition-all shadow-sm flex items-center gap-2">
                            {sortOrder === 'asc' ? <PhosphorIcons.SortAscending size={18} weight="bold" /> : <PhosphorIcons.SortDescending size={18} weight="bold" />}
                            {sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
                        </button>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left min-w-[900px]">
                            <thead>
                                <tr className="bg-white text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                                    <th className="px-6 py-4 cursor-pointer hover:text-[var(--color-primary)] transition-colors group" onClick={() => setSortBy('product_name')}>
                                        <div className="flex items-center gap-1">Producto <PhosphorIcons.CaretUpDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:text-[var(--color-primary)] transition-colors group" onClick={() => setSortBy('product_sku')}>
                                        <div className="flex items-center gap-1">SKU <PhosphorIcons.CaretUpDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                                    </th>
                                    <th className="px-6 py-4 cursor-pointer hover:text-[var(--color-primary)] transition-colors group" onClick={() => setSortBy('category')}>
                                        <div className="flex items-center gap-1">Categoría <PhosphorIcons.CaretUpDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-center cursor-pointer hover:text-[var(--color-primary)] transition-colors group" onClick={() => setSortBy('quantity_sold')}>
                                        <div className="flex items-center justify-center gap-1">Vendido <PhosphorIcons.CaretUpDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-center cursor-pointer hover:text-[var(--color-primary)] transition-colors group" onClick={() => setSortBy('stock_promedio')}>
                                        <div className="flex items-center justify-center gap-1">Stock Promedio <PhosphorIcons.CaretUpDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                                    </th>
                                    <th className="px-6 py-4 text-right cursor-pointer hover:text-[var(--color-primary)] transition-colors group" onClick={() => setSortBy('rotation_index')}>
                                        <div className="flex items-center justify-end gap-1">Índice Rotación <PhosphorIcons.CaretUpDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" /></div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 text-sm">
                                {sortedData.map(product => {
                                    const rotationStatus = product.rotation_index > 2 ? 'high' :
                                        product.rotation_index > 1 ? 'medium' : 'low';

                                    const styles = {
                                        high: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: <PhosphorIcons.TrendUp size={16} weight="bold" /> },
                                        medium: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: <PhosphorIcons.Minus size={16} weight="bold" /> },
                                        low: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', icon: <PhosphorIcons.TrendDown size={16} weight="bold" /> }
                                    };

                                    const currentStyle = styles[rotationStatus];

                                    return (
                                        <tr key={product.product_id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-[var(--color-tertiary)] font-bold">{product.product_name}</td>
                                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">{product.product_sku}</td>
                                            <td className="px-6 py-4 text-gray-600 font-medium">
                                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold border border-gray-200">
                                                    {product.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-[var(--color-tertiary)] font-bold">{product.quantity_sold}</td>
                                            <td className="px-6 py-4 text-center text-gray-500 font-medium">
                                                {product.stock_promedio?.toFixed(1)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl ${currentStyle.bg} ${currentStyle.color} ${currentStyle.border} border font-black shadow-sm`}>
                                                    {currentStyle.icon}
                                                    {product.rotation_index?.toFixed(2)}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Legend */}
                    <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600">
                                <PhosphorIcons.TrendUp size={14} weight="bold" />
                            </span>
                            <span className="font-bold text-gray-700">Alta &gt; 2.0</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-600">
                                <PhosphorIcons.Minus size={14} weight="bold" />
                            </span>
                            <span className="font-bold text-gray-700">Media 1.0 - 2.0</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600">
                                <PhosphorIcons.TrendDown size={14} weight="bold" />
                            </span>
                            <span className="font-bold text-gray-700">Baja &lt; 1.0</span>
                        </div>
                    </div>
                </div>
            )}

            {!rotationData && !loading && !error && (
                <div className="bg-[var(--color-quinary)] rounded-3xl border border-dashed border-gray-200 p-16 text-center flex flex-col items-center justify-center">
                    <div className="bg-gray-50 p-6 rounded-full border border-gray-100 mb-6 shadow-sm">
                        <PhosphorIcons.ArrowClockwise size={64} weight="light" className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-600 mb-2">Ningún Reporte Generado</h3>
                    <p className="text-gray-500 font-medium">Configura los filtros y consulta para ver el reporte de rotación de inventario</p>
                </div>
            )}
        </div>
    );
};
