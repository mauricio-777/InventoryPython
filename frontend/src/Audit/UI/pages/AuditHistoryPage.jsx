import React, { useState, useEffect } from 'react';
import { useReports } from '../../../Report/Application/useReports.js';
import { useProductActions } from '../../../Product/Application/useProductActions.js';
import { CustomSelect } from '../../../CommonLayer/components/ui/CustomSelect.jsx';

export const AuditHistoryPage = () => {
    const {
        loading: reportsLoading,
        error: reportsError,
        searchMovements
    } = useReports();

    const { products, fetchProducts } = useProductActions();

    const [movements, setMovements] = useState([]);
    const [filters, setFilters] = useState({
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        product_id: '',
        movement_type: '',
        user_id: ''
    });
    const [pagination, setPagination] = useState({ skip: 0, limit: 50 });
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSearch = async () => {
        try {
            const data = await searchMovements(filters, pagination.skip, pagination.limit);
            setMovements(data || []);
            setTotalCount(data?.length || 0);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setPagination({ skip: 0, limit: 50 }); // Reset pagination on filter change
    };

    const handlePrevPage = () => {
        if (pagination.skip > 0) {
            setPagination(prev => ({
                ...prev,
                skip: prev.skip - prev.limit
            }));
        }
    };

    const handleNextPage = () => {
        setPagination(prev => ({
            ...prev,
            skip: prev.skip + prev.limit
        }));
    };

    const productOptions = products.map(p => ({
        value: p.id,
        label: `${p.name} (${p.sku})`
    }));

    const movementTypeOptions = [
        { value: 'ENTRY', label: 'Entrada' },
        { value: 'EXIT', label: 'Salida' },
        { value: 'ADJUSTMENT', label: 'Ajuste' }
    ];

    return (
        <div className="animate-fade-in w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="p-3 md:p-4 bg-cyan-500/10 rounded-2xl relative border border-cyan-500/20 shadow-inner">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-light text-white tracking-wide">
                        Historial de <span className="font-bold text-cyan-400">Movimientos</span>
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">Consulta y analiza todos los movimientos con filtros avanzados</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 md:p-8 mb-8">
                <h2 className="text-lg font-bold text-white mb-6">Filtros de Búsqueda</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-3">Fecha Inicio</label>
                        <input
                            type="date"
                            value={filters.start_date}
                            onChange={(e) => handleFilterChange('start_date', e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-cyan-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-3">Fecha Fin</label>
                        <input
                            type="date"
                            value={filters.end_date}
                            onChange={(e) => handleFilterChange('end_date', e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-cyan-500 outline-none"
                        />
                    </div>

                    {/* Product Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-3">Producto</label>
                        <CustomSelect
                            options={productOptions}
                            value={filters.product_id}
                            onChange={(e) => handleFilterChange('product_id', e.target.value)}
                            placeholder="Todos los productos"
                        />
                    </div>

                    {/* Movement Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-3">Tipo de Movimiento</label>
                        <CustomSelect
                            options={movementTypeOptions}
                            value={filters.movement_type}
                            onChange={(e) => handleFilterChange('movement_type', e.target.value)}
                            placeholder="Todos los tipos"
                        />
                    </div>

                    {/* User Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-3">Usuario (ID)</label>
                        <input
                            type="text"
                            placeholder="ID del usuario"
                            value={filters.user_id}
                            onChange={(e) => handleFilterChange('user_id', e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-cyan-500 outline-none placeholder-gray-600"
                        />
                    </div>

                    {/* Search Button */}
                    <div className="flex items-end">
                        <button
                            onClick={handleSearch}
                            disabled={reportsLoading}
                            className="w-full px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-medium transition-colors disabled:opacity-50">
                            {reportsLoading ? 'Buscando...' : 'Buscar'}
                        </button>
                    </div>
                </div>
            </div>

            {reportsError && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 w-full">
                    <p>{reportsError}</p>
                </div>
            )}

            {movements.length > 0 && (
                <>
                    {/* Results Info */}
                    <div className="mb-4 flex justify-between items-center">
                        <p className="text-gray-400">
                            Mostrando {pagination.skip + 1} - {Math.min(pagination.skip + pagination.limit, totalCount)} de {totalCount} registros
                        </p>
                    </div>

                    {/* Movements Table */}
                    <div className="bg-gray-900/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl overflow-hidden w-full mb-6">
                        <div className="overflow-x-auto w-full custom-scrollbar">
                            <table className="w-full text-left min-w-[1000px]">
                                <thead>
                                    <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4 font-medium">Fecha</th>
                                        <th className="px-6 py-4 font-medium">Producto</th>
                                        <th className="px-6 py-4 font-medium">SKU</th>
                                        <th className="px-6 py-4 font-medium">Tipo</th>
                                        <th className="px-6 py-4 font-medium text-right">Cantidad</th>
                                        <th className="px-6 py-4 font-medium text-right">Precio/Costo</th>
                                        <th className="px-6 py-4 font-medium text-right">Total</th>
                                        <th className="px-6 py-4 font-medium">Notas</th>
                                        <th className="px-6 py-4 font-medium">Usuario</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {movements.map(m => (
                                        <tr key={m.id} className="hover:bg-white/5 transition-colors duration-200">
                                            <td className="px-6 py-4 text-gray-400 whitespace-nowrap font-mono tracking-wide">
                                                {new Date(m.created_at).toLocaleString('es-ES')}
                                            </td>
                                            <td className="px-6 py-4 text-white font-medium">{m.product_name}</td>
                                            <td className="px-6 py-4 text-gray-400 font-mono text-xs">{m.product_sku}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${m.type === 'ENTRY'
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-inner'
                                                    : (m.type === 'EXIT'
                                                        ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-inner'
                                                        : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-inner')
                                                }`}>
                                                    {m.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-400">{m.quantity}</td>
                                            <td className="px-6 py-4 text-right text-gray-400">
                                                Bs {m.unit_price?.toFixed(2) || '0.00'}
                                            </td>
                                            <td className="px-6 py-4 text-right text-white font-semibold">
                                                Bs {m.total_price?.toFixed(2) || '0.00'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs max-w-xs truncate">{m.notes || '-'}</td>
                                            <td className="px-6 py-4 text-gray-400">{m.created_by || 'Sistema'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center">
                        <button
                            onClick={handlePrevPage}
                            disabled={pagination.skip === 0}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors disabled:opacity-50">
                            ← Anterior
                        </button>
                        <span className="text-gray-400 text-sm">
                            Página {Math.floor(pagination.skip / pagination.limit) + 1}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={pagination.skip + pagination.limit >= totalCount}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors disabled:opacity-50">
                            Siguiente →
                        </button>
                    </div>
                </>
            )}

            {movements.length === 0 && !reportsLoading && (
                <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-dashed border-white/10 p-12 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <p className="text-gray-500">Configura los filtros y busca movimientos</p>
                </div>
            )}
        </div>
    );
};
