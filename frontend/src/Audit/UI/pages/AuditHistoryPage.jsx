import React, { useState, useEffect } from 'react';
import { useReports } from '../../../Report/Application/useReports.js';
import { useProductActions } from '../../../Product/Application/useProductActions.js';
import { CustomSelect } from '../../../CommonLayer/components/ui/CustomSelect.jsx';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import * as PhosphorIcons from '@phosphor-icons/react';

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

    const inputClasses = "w-full px-4 py-3 bg-white text-[var(--color-tertiary)] rounded-2xl border border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all shadow-sm font-medium placeholder-gray-400";
    const labelClasses = "block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider text-xs flex items-center gap-1.5";

    return (
        <div className="animate-fade-in w-full max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="p-3 md:p-4 bg-[var(--color-primary)]/10 rounded-2xl relative border border-[var(--color-primary)]/20 shadow-sm">
                    <PhosphorIcons.ClockCounterClockwise size={32} weight="fill" className="text-[var(--color-primary)]" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-tertiary)] tracking-tight">
                        Historial de <span className="text-[var(--color-primary)]">Movimientos</span>
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium text-sm md:text-base">Consulta y analiza todos los movimientos con filtros avanzados</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 w-full">
                <h2 className="text-xl font-bold text-[var(--color-tertiary)] flex items-center gap-2 mb-6">
                    <PhosphorIcons.Faders size={24} weight="fill" className="text-[var(--color-primary)]" />
                    Filtros de Búsqueda
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {/* Date Range */}
                    <div>
                        <label className={labelClasses}>
                            <PhosphorIcons.Calendar size={16} />
                            Fecha Inicio
                        </label>
                        <input
                            type="date"
                            value={filters.start_date}
                            onChange={(e) => handleFilterChange('start_date', e.target.value)}
                            className={inputClasses}
                        />
                    </div>

                    <div>
                        <label className={labelClasses}>
                            <PhosphorIcons.Calendar size={16} />
                            Fecha Fin
                        </label>
                        <input
                            type="date"
                            value={filters.end_date}
                            onChange={(e) => handleFilterChange('end_date', e.target.value)}
                            className={inputClasses}
                        />
                    </div>

                    {/* Product Filter */}
                    <div>
                        <label className={labelClasses}>
                            <PhosphorIcons.Package size={16} />
                            Producto
                        </label>
                        <CustomSelect
                            options={productOptions}
                            value={filters.product_id}
                            onChange={(e) => handleFilterChange('product_id', e.target.value)}
                            placeholder="Todos los productos"
                        />
                    </div>

                    {/* Movement Type Filter */}
                    <div>
                        <label className={labelClasses}>
                            <PhosphorIcons.ArrowsLeftRight size={16} />
                            Tipo de Movimiento
                        </label>
                        <CustomSelect
                            options={movementTypeOptions}
                            value={filters.movement_type}
                            onChange={(e) => handleFilterChange('movement_type', e.target.value)}
                            placeholder="Todos los tipos"
                        />
                    </div>

                    {/* User Filter */}
                    <div>
                        <label className={labelClasses}>
                            <PhosphorIcons.User size={16} />
                            Usuario (ID)
                        </label>
                        <input
                            type="text"
                            placeholder="ID del usuario"
                            value={filters.user_id}
                            onChange={(e) => handleFilterChange('user_id', e.target.value)}
                            className={inputClasses}
                        />
                    </div>

                    {/* Search Button */}
                    <div className="flex items-end">
                        <Button
                            onClick={handleSearch}
                            disabled={reportsLoading}
                            className="w-full py-3 shadow-sm flex items-center justify-center gap-2">
                            {reportsLoading ? (
                                <>
                                    <PhosphorIcons.Spinner size={20} className="animate-spin" />
                                    <span>Buscando...</span>
                                </>
                            ) : (
                                <>
                                    <PhosphorIcons.MagnifyingGlass size={20} weight="bold" />
                                    <span>Buscar Movimientos</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {reportsError && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl shadow-sm flex items-center gap-3 font-medium">
                    <PhosphorIcons.WarningCircle size={24} weight="fill" className="shrink-0 text-red-500" />
                    <p>{reportsError}</p>
                </div>
            )}

            {movements.length > 0 && (
                <div className="animate-slide-up space-y-6">
                    {/* Results Info */}
                    <div className="flex justify-between items-center px-4">
                        <p className="text-gray-500 font-bold text-sm bg-gray-100/50 px-4 py-2 rounded-xl border border-gray-100">
                            Mostrando <span className="text-[var(--color-primary)]">{pagination.skip + 1}</span> - <span className="text-[var(--color-primary)]">{Math.min(pagination.skip + pagination.limit, totalCount)}</span> de <span className="text-[var(--color-tertiary)]">{totalCount}</span> registros
                        </p>
                    </div>

                    {/* Movements Table */}
                    <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full">
                        <div className="overflow-x-auto w-full custom-scrollbar">
                            <table className="w-full text-left min-w-[1000px]">
                                <thead>
                                    <tr className="bg-[var(--color-quaternary)]/50 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                                        <th className="px-6 py-4">Fecha</th>
                                        <th className="px-6 py-4">Producto</th>
                                        <th className="px-6 py-4">SKU</th>
                                        <th className="px-6 py-4 text-center">Tipo</th>
                                        <th className="px-6 py-4 text-center">Cantidad</th>
                                        <th className="px-6 py-4 text-right">Precio/Costo</th>
                                        <th className="px-6 py-4 text-right">Total</th>
                                        <th className="px-6 py-4">Notas</th>
                                        <th className="px-6 py-4">Usuario</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    {movements.map(m => (
                                        <tr key={m.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap font-medium text-xs tracking-wide">
                                                {new Date(m.created_at).toLocaleString('es-ES')}
                                            </td>
                                            <td className="px-6 py-4 text-[var(--color-tertiary)] font-bold">{m.product_name}</td>
                                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">{m.product_sku}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm ${m.type === 'ENTRY'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : (m.type === 'EXIT'
                                                        ? 'bg-red-50 text-red-600 border-red-100'
                                                        : 'bg-amber-50 text-amber-600 border-amber-100')
                                                    }`}>
                                                    {m.type === 'ENTRY' ? <PhosphorIcons.ArrowDownLeft weight="bold" /> :
                                                        m.type === 'EXIT' ? <PhosphorIcons.ArrowUpRight weight="bold" /> :
                                                            <PhosphorIcons.ArrowsLeftRight weight="bold" />}
                                                    {m.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-black text-[var(--color-tertiary)]">{m.quantity}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-600 font-mono">
                                                {m.unit_price?.toFixed(2) || '0.00'} Bs
                                            </td>
                                            <td className="px-6 py-4 text-right text-[var(--color-primary)] font-black">
                                                {m.total_price?.toFixed(2) || '0.00'} Bs
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-xs max-w-xs truncate font-medium">{m.notes || '-'}</td>
                                            <td className="px-6 py-4 text-gray-600 font-bold text-xs">{m.created_by || 'Sistema'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <Button
                            onClick={handlePrevPage}
                            disabled={pagination.skip === 0}
                            variant="secondary"
                            className="px-5 py-2 flex items-center gap-2">
                            <PhosphorIcons.CaretLeft weight="bold" />
                            Anterior
                        </Button>
                        <span className="text-gray-600 font-bold text-sm bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                            Página {Math.floor(pagination.skip / pagination.limit) + 1}
                        </span>
                        <Button
                            onClick={handleNextPage}
                            disabled={pagination.skip + pagination.limit >= totalCount}
                            variant="secondary"
                            className="px-5 py-2 flex items-center gap-2">
                            Siguiente
                            <PhosphorIcons.CaretRight weight="bold" />
                        </Button>
                    </div>
                </div>
            )}

            {movements.length === 0 && !reportsLoading && (
                <div className="bg-[var(--color-quinary)] rounded-3xl border border-dashed border-gray-200 p-16 text-center flex flex-col items-center justify-center">
                    <div className="bg-gray-50 p-6 rounded-full border border-gray-100 mb-6 shadow-sm">
                        <PhosphorIcons.MagnifyingGlass size={64} weight="light" className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-600 mb-2">Sin Resultados</h3>
                    <p className="text-gray-500 font-medium">Configura los filtros y busca movimientos para ver el historial.</p>
                </div>
            )}
        </div>
    );
};
