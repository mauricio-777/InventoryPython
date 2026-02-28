import React, { useState, useEffect } from 'react';
import { useAuditLogs } from '../../Application/useAuditLogs.js';
import { useProductActions } from '../../../Product/Application/useProductActions.js';
import { CustomSelect } from '../../../CommonLayer/components/ui/CustomSelect.jsx';

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
        <div className="animate-fade-in w-full max-w-6xl mx-auto">
            <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="p-3 md:p-4 bg-green-500/10 rounded-2xl relative border border-green-500/20 shadow-inner">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-light text-white tracking-wide">
                        Pista de <span className="font-bold text-green-400">Auditoría</span>
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">Monitorea y revisa todo incremento o salida de inventario y sus costos históricos.</p>
                </div>
            </div>

            <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 md:p-8 mb-8 w-full max-w-2xl">
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-400 mb-3">Seleccionar Producto para ver historial de movimientos</label>
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
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-400"></div>
                    <span className="text-gray-400">Consultando registros históricos...</span>
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 shadow-lg">
                    <p>{error}</p>
                </div>
            )}

            {selectedProduct && !loading && (
                <div className="bg-gray-900/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl overflow-hidden w-full animate-slide-up">
                    {movements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                            <p className="text-lg">No hay movimientos registrados.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full custom-scrollbar">
                            <table className="w-full text-left min-w-[800px]">
                                <thead>
                                    <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4 font-medium">Fecha</th>
                                        <th className="px-6 py-4 font-medium">Tipo</th>
                                        <th className="px-6 py-4 font-medium">Cantidad</th>
                                        <th className="px-6 py-4 font-medium text-right">Precio/Costo(Bs)</th>
                                        <th className="px-6 py-4 font-medium">Notas</th>
                                        <th className="px-6 py-4 font-medium">Usuario</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {movements.map(m => (
                                        <tr key={m.id} className="hover:bg-white/5 transition-colors duration-200">
                                            <td className="px-6 py-4 text-gray-400 whitespace-nowrap font-mono tracking-wide">
                                                {new Date(m.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${m.type === 'ENTRY'
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20 shadow-inner'
                                                    : (m.type === 'EXIT'
                                                        ? 'bg-red-500/10 text-red-400 border-red-500/20 shadow-inner'
                                                        : 'bg-gray-500/10 text-gray-300 border-gray-500/20 shadow-inner')
                                                    }`}>
                                                    {m.type === 'ENTRY' && <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>}
                                                    {m.type === 'EXIT' && <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>}
                                                    {m.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-bold text-gray-200 text-base">
                                                {m.quantity}
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-300 font-mono tracking-wide">
                                                {m.unit_price ? `${m.unit_price.toFixed(2)}` : (m.total_cost ? `${(m.total_cost / m.quantity).toFixed(2)}` : '-')}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 max-w-xs truncate" title={m.notes}>
                                                {m.notes}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {m.created_by || 'System'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
