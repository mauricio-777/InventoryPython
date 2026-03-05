import React, { useState, useEffect } from 'react';
import { useInventoryActions } from '../../Application/useInventoryActions.js';
import { useProductActions } from '../../Application/useProductActions.js';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import { CustomSelect } from '../../../CommonLayer/components/ui/CustomSelect.jsx';
import { StakeholderSearchBar } from '../../../Stakeholder/UI/components/StakeholderSearchBar.jsx';
import * as PhosphorIcons from '@phosphor-icons/react';

export const PointOfSalePage = () => {
    const { registerSale, loading, error } = useInventoryActions();
    const { products, fetchProducts } = useProductActions();

    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [unitPrice, setUnitPrice] = useState('');
    const [customerId, setCustomerId] = useState('');
    const [lastSale, setLastSale] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const productOptions = products.map(p => ({
        value: p.id,
        label: `${p.name} (${p.sku})`
    }));

    const handleProductChange = (e) => {
        const prodId = e.target.value;
        setSelectedProduct(prodId);
        const prod = products.find(p => p.id === prodId);
        if (prod) {
            setUnitPrice(prod.suggested_price);
        } else {
            setUnitPrice('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLastSale(null);
        try {
            const dataToSubmit = {
                product_id: selectedProduct,
                customer_id: customerId || null,
                quantity: parseInt(quantity, 10),
                unit_price: parseFloat(unitPrice),
                notes: 'POS Sale'
            };
            const result = await registerSale(dataToSubmit);
            setLastSale(result);
            setSelectedProduct('');
            setQuantity(1);
            setUnitPrice('');
        } catch (err) {
            // error handled by hook
        }
    };

    const subtotal = (quantity * unitPrice) || 0;

    const inputClasses = "w-full bg-[var(--color-quinary)] border border-gray-200 text-[var(--color-tertiary)] rounded-2xl px-4 py-3 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/10 focus:border-[var(--color-primary)] transition-all shadow-sm";
    const labelClasses = "block text-sm font-bold text-gray-600 mb-2";

    return (
        <div className="animate-fade-in w-full max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="p-3 md:p-4 bg-[var(--color-primary)]/10 rounded-2xl relative border border-[var(--color-primary)]/20 shadow-sm">
                    <PhosphorIcons.ShoppingCart size={32} weight="fill" className="text-[var(--color-primary)]" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-tertiary)] tracking-tight">
                        Punto de Venta
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base mt-1 font-medium">Salida rápida de Stock (Cajero) con descuento FIFO automatizado.</p>
                </div>
            </div>

            <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <form onSubmit={handleSubmit} className="p-6 md:p-10">

                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={`${labelClasses} text-base flex items-center gap-1.5`}>
                                    Escanear o Seleccionar Producto <span className="text-red-500">*</span>
                                </label>
                                <CustomSelect
                                    options={productOptions}
                                    value={selectedProduct}
                                    onChange={handleProductChange}
                                    placeholder="-- Buscar Producto --"
                                    required={true}
                                />
                            </div>

                            <div>
                                <label className={`${labelClasses} text-base flex items-center gap-1.5`}>
                                    Cliente (Opcional)
                                </label>
                                <StakeholderSearchBar
                                    type="customer"
                                    placeholder="Buscar cliente..."
                                    onSelect={(id) => setCustomerId(id || '')}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelClasses}>Cant. (Unidades Físicas)</label>
                                <input type="number" min="1" required className={`${inputClasses} text-xl md:text-2xl font-bold text-center`} value={quantity} onChange={e => setQuantity(e.target.value)} />
                            </div>

                            <div>
                                <label className={labelClasses}>Precio Unit. (Modificable)</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                        <span className="text-gray-400 font-bold">Bs</span>
                                    </div>
                                    <input type="number" step="0.50" min="0" required className={`${inputClasses} text-xl md:text-2xl pl-12 text-[var(--color-primary)] font-bold`} value={unitPrice} onChange={e => setUnitPrice(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 bg-[var(--color-quaternary)] border border-gray-100 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center text-xl shadow-sm gap-4 md:gap-0">
                        <span className="text-gray-500 font-bold uppercase tracking-wider text-sm md:text-base flex items-center gap-2">
                            <PhosphorIcons.Receipt size={24} weight="duotone" className="text-[var(--color-primary)]" />
                            Subtotal a cobrar:
                        </span>
                        <span className="text-4xl md:text-5xl font-black text-[var(--color-tertiary)] tracking-tight">
                            {subtotal.toFixed(2)} <span className="text-2xl md:text-3xl text-gray-400 font-bold">Bs</span>
                        </span>
                    </div>

                    {error && (
                        <div className="mt-8 bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm font-medium">
                            <PhosphorIcons.WarningCircle size={24} weight="fill" className="text-red-500 shrink-0" />
                            <p className="text-base">{error}</p>
                        </div>
                    )}

                    <div className="mt-10">
                        <Button type="submit" disabled={loading} className="w-full text-lg md:text-xl py-4 md:py-5 shadow-sm">
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <PhosphorIcons.Spinner size={24} className="animate-spin" />
                                    Procesando Transacción Segura...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-3">
                                    <PhosphorIcons.CheckCircle size={24} weight="bold" />
                                    Confirmar Venta / Cobrar
                                </span>
                            )}
                        </Button>
                    </div>
                </form>
            </div>

            {lastSale && (
                <div className="mt-8 p-6 md:p-8 bg-emerald-50 border border-emerald-100 rounded-3xl animate-slide-up relative overflow-hidden shadow-sm">
                    <div className="absolute -top-10 -right-10 p-4 opacity-10">
                        <PhosphorIcons.CheckCircle size={200} weight="fill" className="text-emerald-500 transform rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-xl md:text-2xl font-bold text-emerald-600 mb-6 flex items-center gap-2 tracking-tight">
                            <PhosphorIcons.CheckCircle size={28} weight="fill" />
                            ¡Transacción Exitosa!
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm md:text-base bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm">
                            <div>
                                <span className="text-gray-500 block text-xs font-bold uppercase tracking-wider mb-1">Cód. Operación</span>
                                <span className="text-[var(--color-tertiary)] font-mono font-medium text-sm max-w-[150px] truncate block">{lastSale.movement_id}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs font-bold uppercase tracking-wider mb-1">Total Ingreso</span>
                                <span className="font-black text-[var(--color-tertiary)] text-xl">{lastSale.total_price.toFixed(2)} <span className="text-base text-gray-500 font-bold">Bs</span></span>
                            </div>
                            <div>
                                <span className="text-gray-400 block text-xs font-bold uppercase tracking-wider mb-1">Costo Interno (FIFO)</span>
                                <span className="text-emerald-500 font-bold text-lg">{lastSale.total_cost.toFixed(2)} Bs</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
