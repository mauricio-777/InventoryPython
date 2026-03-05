import React, { useState, useEffect } from 'react';
import { useInventoryActions } from '../../Application/useInventoryActions.js';
import { useProductActions } from '../../Application/useProductActions.js';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import { CustomSelect } from '../../../CommonLayer/components/ui/CustomSelect.jsx';
import { StakeholderSearchBar } from '../../../Stakeholder/UI/components/StakeholderSearchBar.jsx';
import * as PhosphorIcons from '@phosphor-icons/react';

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

    const inputClasses = "w-full bg-[var(--color-quinary)] border border-gray-200 text-[var(--color-tertiary)] rounded-2xl px-4 py-3 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/10 focus:border-[var(--color-primary)] transition-all shadow-sm";
    const labelClasses = "block text-sm font-bold text-gray-600 mb-2";

    return (
        <div className="animate-fade-in w-full max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="p-3 md:p-4 bg-[var(--color-primary)]/10 rounded-2xl relative border border-[var(--color-primary)]/20 shadow-sm">
                    <PhosphorIcons.DownloadSimple size={32} weight="fill" className="text-[var(--color-primary)]" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-tertiary)] tracking-tight">
                        Recibir Compra de Lote
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm md:text-base font-medium">Registra una entrada de inventario. Este sistema utiliza lógica FIFO automática.</p>
                </div>
            </div>

            <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 w-full">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                                <p className="mt-2 text-xs font-bold text-amber-500 flex items-center gap-1.5">
                                    <PhosphorIcons.Info size={14} weight="bold" />
                                    Dejar en blanco si el producto no es perecedero.
                                </p>
                            </div>
                        </div>

                        {/* Derecha */}
                        <div className="space-y-6">
                            <div>
                                <label className={labelClasses}>Costo Unitario (Bs)</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                        <span className="text-gray-400 font-bold">Bs</span>
                                    </div>
                                    <input type="number" step="0.50" min="0" required className={`${inputClasses} pl-12 text-[var(--color-primary)] font-bold text-lg`} value={formData.unit_cost} onChange={e => setFormData({ ...formData, unit_cost: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className={labelClasses}>Proveedor (Opcional)</label>
                                <StakeholderSearchBar
                                    type="supplier"
                                    placeholder="Buscar proveedor..."
                                    onSelect={(id) => setFormData({ ...formData, supplier_id: id || '' })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm flex items-center gap-3 shadow-sm font-medium">
                                <PhosphorIcons.WarningCircle size={20} weight="fill" className="shrink-0 text-red-500" />
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-6 py-4 rounded-2xl text-sm flex items-center gap-3 shadow-sm font-medium animate-fade-in">
                                <PhosphorIcons.CheckCircle size={20} weight="fill" className="shrink-0 text-emerald-500" />
                                {message}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-8 mt-8 border-t border-gray-100">
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto px-10 py-4 lg:text-lg shadow-sm">
                            {loading ? (
                                <span className="flex items-center justify-center gap-3 min-w-[180px]">
                                    <PhosphorIcons.Spinner size={24} className="animate-spin" />
                                    Procesando Lote...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-3 min-w-[180px]">
                                    <PhosphorIcons.Check size={24} weight="bold" />
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
