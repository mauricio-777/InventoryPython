import React, { useState, useEffect } from 'react';
import { useInventoryActions } from '../../Application/useInventoryActions.js';
import { useProductActions } from '../../Application/useProductActions.js';
import { CustomSelect } from '../../../CommonLayer/components/ui/CustomSelect.jsx';

export const BatchDetailsPage = () => {
    const { fetchBatches, loading, error } = useInventoryActions();
    const { products, fetchProducts } = useProductActions();

    const [selectedProduct, setSelectedProduct] = useState('');
    const [batches, setBatches] = useState([]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        if (selectedProduct) {
            fetchBatches(selectedProduct).then(data => setBatches(data || []));
        } else {
            setBatches([]);
        }
        // eslint-disable-next-line
    }, [selectedProduct]);

    const productOptions = products.map(p => ({
        value: p.id,
        label: p.name
    }));

    return (
        <div className="animate-fade-in w-full max-w-6xl mx-auto">
            <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="p-3 md:p-4 bg-green-500/10 rounded-2xl relative border border-green-500/20 shadow-inner">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-light text-white tracking-wide">
                        Detalle y <span className="font-bold text-green-400">Stock por Lotes</span>
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">Visualiza la disponibilidad activa por lote de compra aplicando el modelo FIFO.</p>
                </div>
            </div>

            <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 md:p-8 mb-8 w-full max-w-2xl">
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-400 mb-3">Seleccionar Producto para ver stock activo</label>
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
                    <span className="text-gray-400">Revisando base de datos de lotes...</span>
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 shadow-lg">
                    <p>{error}</p>
                </div>
            )}

            {selectedProduct && !loading && (
                <div className="bg-gray-900/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl overflow-hidden w-full animate-slide-up">
                    {batches.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            <p className="text-lg">No hay stock o lotes activos para este producto.</p>
                            <p className="text-sm mt-1">Este producto se ha quedado en 0.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full custom-scrollbar">
                            <table className="w-full text-left min-w-[600px]">
                                <thead>
                                    <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4 font-medium">ID Lote</th>
                                        <th className="px-6 py-4 font-medium">Comprado</th>
                                        <th className="px-6 py-4 font-medium">Vence</th>
                                        <th className="px-6 py-4 font-medium text-center">Cant. Disponible</th>
                                        <th className="px-6 py-4 font-medium text-right">Costo Unitario</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {batches.map(b => (
                                        <tr key={b.id} className="hover:bg-white/5 transition-colors duration-200">
                                            <td className="px-6 py-4 font-mono text-gray-400 text-xs tracking-wider" title={b.id}>
                                                {b.id.substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">
                                                {new Date(b.purchase_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {b.expiration_date ? (
                                                    <span className="text-amber-400 font-medium">
                                                        {new Date(b.expiration_date).toLocaleDateString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-600">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-green-500/20 text-green-400 font-bold border border-green-500/30 text-lg shadow-inner">
                                                    {b.available_quantity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-gray-300 font-mono tracking-wide">
                                                {b.unit_cost.toFixed(2)} Bs
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
