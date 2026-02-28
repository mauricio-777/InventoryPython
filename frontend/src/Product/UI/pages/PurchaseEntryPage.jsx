import React, { useState, useEffect } from 'react';
import { useInventoryActions } from '../../Application/useInventoryActions.js';
import { useProductActions } from '../../Application/useProductActions.js';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import { CustomSelect } from '../../../CommonLayer/components/ui/CustomSelect.jsx';

export const PurchaseEntryPage = () => {
    const { receivePurchase, loading, error } = useInventoryActions();
    const { products, fetchProducts } = useProductActions();

    const [formData, setFormData] = useState({
        product_id: '', quantity: 0, unit_cost: 0, supplier_id: '', expiration_date: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const productOptions = products.map(p => ({
        value: p.id,
        label: `${p.name} (${p.sku})`
    }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const dataToSubmit = {
                ...formData,
                quantity: parseInt(formData.quantity, 10),
                unit_cost: parseFloat(formData.unit_cost),
                expiration_date: formData.expiration_date ? new Date(formData.expiration_date).toISOString() : null
            };
            await receivePurchase(dataToSubmit);
            setMessage('¡Lote de inventario registrado exitosamente!');
            setFormData({ product_id: '', quantity: 0, unit_cost: 0, supplier_id: '', expiration_date: '' });
        } catch (err) {
            // error handled by hook
        }
    };

    const inputClasses = "w-full bg-black/40 border border-gray-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all placeholder-gray-600 shadow-inner";
    const labelClasses = "block text-sm font-medium text-gray-400 mb-2";

    return (
        <div className="animate-fade-in w-full max-w-6xl mx-auto">
            <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="p-3 md:p-4 bg-green-500/10 rounded-2xl relative border border-green-500/20 shadow-inner">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-light text-white tracking-wide">
                        Recibir <span className="font-bold text-green-400">Compra de Lote</span>
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">Registra una entrada de inventario. Este sistema utiliza lógica FIFO automática.</p>
                </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl p-6 md:p-8 w-full">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Izquierda */}
                        <div className="space-y-6">
                            <div>
                                <label className={labelClasses}>Producto a Ingresar</label>
                                <CustomSelect
                                    options={productOptions}
                                    value={formData.product_id}
                                    onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                                    placeholder="-- Buscar Producto --"
                                    required={true}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Cantidad Comprada</label>
                                <input type="number" min="1" required className={inputClasses} value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} />
                            </div>

                            <div>
                                <label className={labelClasses}>Fecha de Vencimiento de Lote (Perecederos)</label>
                                <input type="date" className={`${inputClasses} appearance-none`} value={formData.expiration_date} onChange={e => setFormData({ ...formData, expiration_date: e.target.value })} />
                                <p className="mt-1 text-xs text-amber-500/80">Dejar en blanco si el producto no es perecedero.</p>
                            </div>
                        </div>

                        {/* Derecha */}
                        <div className="space-y-6">
                            <div>
                                <label className={labelClasses}>Costo Unitario (Bs)</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                        <span className="text-gray-500 font-medium">Bs</span>
                                    </div>
                                    <input type="number" step="0.50" min="0" required className={`${inputClasses} pl-12 text-green-400 font-bold`} value={formData.unit_cost} onChange={e => setFormData({ ...formData, unit_cost: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>RUC / ID Proveedor (Opcional)</label>
                                <input type="text" className={inputClasses} placeholder="Ej. PRV-2900" value={formData.supplier_id} onChange={e => setFormData({ ...formData, supplier_id: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="my-6">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg">
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 shadow-lg animate-fade-in">
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                {message}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-6 border-t border-white/5">
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto px-8 py-3 lg:py-4 lg:text-lg shadow-green-500/20">
                            {loading ? (
                                <span className="flex items-center justify-center gap-2 relative">
                                    <div className="animate-spin h-5 w-5 border-2 border-gray-900 border-t-transparent rounded-full"></div>
                                    Procesando Lote...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Registrar Compra
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
