import React, { useState, useEffect } from 'react';
import { useInventoryActions } from '../../Application/useInventoryActions.js';
import { useProductActions } from '../../Application/useProductActions.js';
import { CustomSelect } from '../../../CommonLayer/components/ui/CustomSelect.jsx';
import * as PhosphorIcons from '@phosphor-icons/react';

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
        <div className="animate-fade-in w-full max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="p-3 md:p-4 bg-[var(--color-primary)]/10 rounded-2xl relative border border-[var(--color-primary)]/20 shadow-sm">
                    <PhosphorIcons.Archive size={32} weight="fill" className="text-[var(--color-primary)]" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-tertiary)] tracking-tight">
                        Detalle y <span className="text-[var(--color-primary)]">Stock por Lotes</span>
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium text-sm md:text-base">Visualiza la disponibilidad activa por lote de compra aplicando el modelo FIFO.</p>
                </div>
            </div>

            <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 w-full max-w-2xl">
                <div className="w-full">
                    <label className="block text-sm font-bold text-gray-600 mb-3 flex items-center gap-1.5">
                        <PhosphorIcons.MagnifyingGlass size={18} weight="bold" className="text-gray-400" />
                        Seleccionar Producto para ver stock activo
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
                    <span className="text-gray-500 font-medium">Revisando base de datos de lotes...</span>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl shadow-sm font-medium flex items-center gap-3">
                    <PhosphorIcons.WarningCircle size={24} weight="fill" className="shrink-0 text-red-500" />
                    <p>{error}</p>
                </div>
            )}

            {selectedProduct && !loading && (
                <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full animate-slide-up">
                    {batches.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <PhosphorIcons.Empty size={64} weight="light" className="mb-4 opacity-50" />
                            <p className="text-lg font-bold text-gray-600">No hay stock o lotes activos para este producto.</p>
                            <p className="text-sm mt-1 font-medium">Este producto se ha quedado en 0.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full custom-scrollbar">
                            <table className="w-full text-left min-w-[600px]">
                                <thead>
                                    <tr className="bg-[var(--color-quaternary)] text-gray-500 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                                        <th className="px-6 py-5">ID Lote</th>
                                        <th className="px-6 py-5">Comprado</th>
                                        <th className="px-6 py-5">Vence</th>
                                        <th className="px-6 py-5 text-center">Cant. Disponible</th>
                                        <th className="px-6 py-5 text-right">Costo Unitario</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    {batches.map(b => (
                                        <tr key={b.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                                            <td className="px-6 py-4 font-mono text-[var(--color-tertiary)] font-medium text-xs tracking-wider" title={b.id}>
                                                {String(b.id).substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <PhosphorIcons.Calendar size={16} className="text-gray-400" />
                                                    {new Date(b.purchase_date).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {b.expiration_date ? (
                                                    <span className="text-orange-600 font-bold bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100 flex inline-flex items-center gap-1.5">
                                                        <PhosphorIcons.Warning size={14} weight="bold" />
                                                        {new Date(b.expiration_date).toLocaleDateString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 font-medium">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1.5 justify-center px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-black border border-[var(--color-primary)]/20 text-lg shadow-sm">
                                                    <PhosphorIcons.Package size={18} weight="bold" />
                                                    {b.available_quantity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-[var(--color-tertiary)] font-mono font-bold tracking-wide">
                                                {b.unit_cost.toFixed(2)} <span className="text-xs text-gray-400 font-bold">Bs</span>
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
