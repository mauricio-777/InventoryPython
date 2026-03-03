import React, { useState, useEffect } from 'react';
import { useReports } from '../../Application/useReports.js';
import { useProductActions } from '../../../Product/Application/useProductActions.js';
import { CustomSelect } from '../../../CommonLayer/components/ui/CustomSelect.jsx';

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

    return (
        <div className="animate-fade-in w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="p-3 md:p-4 bg-indigo-500/10 rounded-2xl relative border border-indigo-500/20 shadow-inner">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-light text-white tracking-wide">
                        Reporte de <span className="font-bold text-indigo-400">Rotación</span> de Inventario
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">Identifica productos de lento movimiento</p>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6">
                    <label className="block text-sm font-medium text-gray-400 mb-3">Período (días)</label>
                    <select
                        value={selectedDays}
                        onChange={(e) => setSelectedDays(parseInt(e.target.value))}
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-indigo-500 outline-none">
                        <option value={7}>Últimos 7 días</option>
                        <option value={30}>Últimos 30 días</option>
                        <option value={60}>Últimos 60 días</option>
                        <option value={90}>Últimos 90 días</option>
                    </select>
                </div>

                <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6">
                    <label className="block text-sm font-medium text-gray-400 mb-3">Producto (Opcional)</label>
                    <CustomSelect
                        options={productOptions}
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        placeholder="Todos los productos"
                    />
                </div>

                <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6">
                    <label className="block text-sm font-medium text-gray-400 mb-3">Categoría (Opcional)</label>
                    <CustomSelect
                        options={categoryOptions}
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        placeholder="Todas las categorías"
                    />
                </div>

                <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 flex items-end">
                    <button
                        onClick={handleFetchReport}
                        disabled={loading}
                        className="w-full px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition-colors disabled:opacity-50">
                        {loading ? 'Cargando...' : 'Consultar'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 w-full">
                    <p>{error}</p>
                </div>
            )}

            {rotationData && rotationData.length > 0 && (
                <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 md:p-8 w-full">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">
                            Resultados: {rotationData.length} productos
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded transition-colors">
                                {sortOrder === 'asc' ? '↑ Ascendente' : '↓ Descendente'}
                            </button>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left min-w-[900px]">
                            <thead>
                                <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-medium cursor-pointer hover:text-white" onClick={() => setSortBy('product_name')}>
                                        Producto
                                    </th>
                                    <th className="px-6 py-4 font-medium cursor-pointer hover:text-white" onClick={() => setSortBy('product_sku')}>
                                        SKU
                                    </th>
                                    <th className="px-6 py-4 font-medium cursor-pointer hover:text-white" onClick={() => setSortBy('category')}>
                                        Categoría
                                    </th>
                                    <th className="px-6 py-4 font-medium text-right cursor-pointer hover:text-white" onClick={() => setSortBy('quantity_sold')}>
                                        Vendido
                                    </th>
                                    <th className="px-6 py-4 font-medium text-right cursor-pointer hover:text-white" onClick={() => setSortBy('stock_promedio')}>
                                        Stock Promedio
                                    </th>
                                    <th className="px-6 py-4 font-medium text-right cursor-pointer hover:text-white" onClick={() => setSortBy('rotation_index')}>
                                        Índice Rotación
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {sortedData.map(product => {
                                    const rotationColor = product.rotation_index > 2 ? 'text-green-400' : 
                                                        product.rotation_index > 1 ? 'text-yellow-400' : 'text-red-400';
                                    
                                    return (
                                        <tr key={product.product_id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 text-white font-medium">{product.product_name}</td>
                                            <td className="px-6 py-4 text-gray-400 font-mono text-xs">{product.product_sku}</td>
                                            <td className="px-6 py-4 text-gray-400">{product.category}</td>
                                            <td className="px-6 py-4 text-right text-gray-400">{product.quantity_sold}</td>
                                            <td className="px-6 py-4 text-right text-gray-400">
                                                {product.stock_promedio?.toFixed(1)}
                                            </td>
                                            <td className={`px-6 py-4 text-right font-semibold ${rotationColor}`}>
                                                {product.rotation_index?.toFixed(2)}
                                                <span className="text-xs text-gray-500 ml-1">
                                                    {product.rotation_index > 2 ? '✓ Alta' : product.rotation_index > 1 ? '○ Media' : '✗ Baja'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Legend */}
                    <div className="mt-6 pt-6 border-t border-white/10 flex gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-green-400 font-bold">✓ Alta</span>
                            <span className="text-gray-400">Índice &gt; 2.0</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-yellow-400 font-bold">○ Media</span>
                            <span className="text-gray-400">1.0 - 2.0</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-red-400 font-bold">✗ Baja</span>
                            <span className="text-gray-400">Índice &lt; 1.0</span>
                        </div>
                    </div>
                </div>
            )}

            {!rotationData && !loading && !error && (
                <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-dashed border-white/10 p-12 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-gray-500">Configura los filtros y consulta para ver el reporte de rotación</p>
                </div>
            )}
        </div>
    );
};
