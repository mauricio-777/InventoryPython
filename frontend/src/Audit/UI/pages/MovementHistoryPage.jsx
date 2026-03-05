import React, { useState, useEffect } from 'react';
import { useAuditLogs } from '../../Application/useAuditLogs.js';
import { useProductActions } from '../../../Product/Application/useProductActions.js';
import { CustomSelect } from '../../../CommonLayer/components/ui/CustomSelect.jsx';
import * as PhosphorIcons from '@phosphor-icons/react';

export const MovementHistoryPage = () => {
    const { fetchMovements, loading, error } = useAuditLogs();
    const { products, fetchProducts } = useProductActions();

    const [selectedProduct, setSelectedProduct] = useState('');
    const [movements, setMovements] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        if (selectedProduct) {
            fetchMovements(selectedProduct).then(data => setMovements(data || []));
        } else {
            setMovements([]);
        }
        // eslint-disable-next-line
    }, [selectedProduct]);

    const productOptions = products.map(p => ({
        value: p.id,
        label: `${p.name} (${p.sku})`
    }));

    return (
        <div className="animate-fade-in w-full max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="p-3 md:p-4 bg-[var(--color-primary)]/10 rounded-2xl relative border border-[var(--color-primary)]/20 shadow-sm">
                    <PhosphorIcons.ClockCounterClockwise size={32} weight="fill" className="text-[var(--color-primary)]" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-tertiary)] tracking-tight">
                        Historial de Movimientos de <span className="text-[var(--color-primary)]">Producto</span>
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium text-sm md:text-base">Monitorea y revisa todo incremento o salida de inventario y sus costos históricos por producto.</p>
                </div>
            </div>

            <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 mb-8 w-full max-w-2xl">
                <div className="w-full">
                    <label className="block text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                        <PhosphorIcons.Package size={18} />
                        Seleccionar Producto para ver historial de movimientos
                    </label>
                    <CustomSelect
                        options={productOptions}
                        value={selectedProduct}
                        onChange={e => setSelectedProduct(e.target.value)}
                        placeholder="-- Buscar Producto --"
                    />
                </div>
            </div>

            {loading && (
                <div className="flex justify-center flex-col items-center py-12 gap-4">
                    <PhosphorIcons.Spinner size={40} className="animate-spin text-[var(--color-primary)]" />
                    <span className="text-gray-500 font-medium">Consultando registros históricos...</span>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl shadow-sm flex items-center gap-3 font-medium mb-6">
                    <PhosphorIcons.WarningCircle size={24} weight="fill" className="shrink-0 text-red-500" />
                    <p>{error}</p>
                </div>
            )}

            {selectedProduct && !loading && !error && (
                <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full animate-slide-up">
                    {movements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <div className="bg-gray-50 p-6 rounded-full border border-gray-100 mb-6 shadow-sm">
                                <PhosphorIcons.ClockCounterClockwise size={48} weight="light" className="text-gray-400" />
                            </div>
                            <p className="text-lg font-bold text-gray-600">No hay movimientos registrados para este producto.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full custom-scrollbar">
                            <table className="w-full text-left min-w-[800px]">
                                <thead>
                                    <tr className="bg-[var(--color-quaternary)]/50 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                                        <th className="px-6 py-4">Fecha</th>
                                        <th className="px-6 py-4 text-center">Tipo</th>
                                        <th className="px-6 py-4 text-center">Cantidad</th>
                                        <th className="px-6 py-4 text-right">Precio/Costo(Bs)</th>
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
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm ${m.type === 'ENTRY'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : (m.type === 'EXIT'
                                                        ? 'bg-red-50 text-red-600 border-red-100'
                                                        : 'bg-amber-50 text-amber-600 border-amber-100')
                                                    }`}>
                                                    {m.type === 'ENTRY' && <PhosphorIcons.ArrowDownLeft weight="bold" />}
                                                    {m.type === 'EXIT' && <PhosphorIcons.ArrowUpRight weight="bold" />}
                                                    {m.type !== 'ENTRY' && m.type !== 'EXIT' && <PhosphorIcons.ArrowsLeftRight weight="bold" />}
                                                    {m.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-black text-[var(--color-tertiary)]">{m.quantity}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-600 font-mono font-medium">
                                                {m.unit_price ? `${m.unit_price.toFixed(2)}` : (m.total_cost ? `${(m.total_cost / m.quantity).toFixed(2)}` : '-')}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 max-w-xs truncate font-medium" title={m.notes}>
                                                {m.notes || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-bold text-xs">
                                                {m.created_by || 'Sistema'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
            {!selectedProduct && !loading && (
                <div className="bg-[var(--color-quinary)] rounded-3xl border border-dashed border-gray-200 p-16 text-center flex flex-col items-center justify-center">
                    <div className="bg-gray-50 p-6 rounded-full border border-gray-100 mb-6 shadow-sm">
                        <PhosphorIcons.Package size={64} weight="light" className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-600 mb-2">Selecciona un producto</h3>
                    <p className="text-gray-500 font-medium">Busca y selecciona un producto para visualizar su historial de movimientos.</p>
                </div>
            )}
        </div>
    );
};
