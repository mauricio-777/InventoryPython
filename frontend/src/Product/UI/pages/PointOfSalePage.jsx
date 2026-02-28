import React, { useState, useEffect } from 'react';
import { useInventoryActions } from '../../Application/useInventoryActions.js';
import { useProductActions } from '../../Application/useProductActions.js';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import { CustomSelect } from '../../../CommonLayer/components/ui/CustomSelect.jsx';

export const PointOfSalePage = () => {
    const { registerSale, loading, error } = useInventoryActions();
    const { products, fetchProducts } = useProductActions();

    const [selectedProduct, setSelectedProduct] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [unitPrice, setUnitPrice] = useState('');
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

    const inputClasses = "w-full bg-black/40 border border-gray-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all placeholder-gray-600 shadow-inner";
    const labelClasses = "block text-sm font-medium text-gray-400 mb-2";

    return (
        <div className="animate-fade-in w-full max-w-5xl mx-auto">
            <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="p-3 md:p-4 bg-green-500/10 rounded-2xl relative border border-green-500/20 shadow-inner">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-light text-white tracking-wide">
                        Punto de <span className="font-bold text-green-400">Venta</span>
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base mt-2">Salida rápida de Stock (Cajero) con descuento FIFO automatizado.</p>
                </div>
            </div>

            <div className="bg-gray-900/60 backdrop-blur-2xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden shadow-black/50">
                <form onSubmit={handleSubmit} className="p-6 md:p-10">

                    <div className="space-y-8">
                        <div>
                            <label className={`${labelClasses} text-base`}>Escanear o Seleccionar Producto</label>
                            <CustomSelect
                                options={productOptions}
                                value={selectedProduct}
                                onChange={handleProductChange}
                                placeholder="-- Buscar Producto --"
                                required={true}
                                className="text-lg"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className={labelClasses}>Cant. (Unidades Físicas)</label>
                                <input type="number" min="1" required className={`${inputClasses} text-lg md:text-xl font-bold font-mono`} value={quantity} onChange={e => setQuantity(e.target.value)} />
                            </div>

                            <div>
                                <label className={labelClasses}>Precio Unit. (Modificable)</label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                        <span className="text-gray-500 font-medium">Bs</span>
                                    </div>
                                    <input type="number" step="0.50" min="0" required className={`${inputClasses} text-lg md:text-xl pl-12 text-green-400 font-bold font-mono`} value={unitPrice} onChange={e => setUnitPrice(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 bg-black/40 border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center text-xl shadow-inner gap-4 md:gap-0">
                        <span className="text-gray-400 font-medium uppercase tracking-wider text-sm md:text-base">Subtotal a cobrar:</span>
                        <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent truncate max-w-full">
                            {subtotal.toFixed(2)} Bs
                        </span>
                    </div>

                    {error && (
                        <div className="mt-8 bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl flex items-center gap-3 shadow-lg">
                            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="text-base">{error}</p>
                        </div>
                    )}

                    <div className="mt-10">
                        <Button type="submit" disabled={loading} className="w-full text-lg md:text-xl py-4 md:py-5 shadow-green-500/30">
                            {loading ? (
                                <span className="flex items-center justify-center gap-3">
                                    <div className="animate-spin h-6 w-6 border-2 border-gray-900 border-t-transparent rounded-full"></div>
                                    Procesando Transacción Segura...
                                </span>
                            ) : 'Confirmar Venta / Cobrar'}
                        </Button>
                    </div>
                </form>
            </div>

            {lastSale && (
                <div className="mt-8 p-6 md:p-8 bg-green-500/10 border border-green-500/20 rounded-3xl animate-slide-up relative overflow-hidden shadow-2xl">
                    <div className="absolute -top-10 -right-10 p-4 opacity-5">
                        <svg className="w-48 h-48 text-green-500 transform rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-xl md:text-2xl font-light text-green-400 mb-4 block flex items-center gap-2">
                            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            ¡Transacción <span className="font-bold">Exitosa</span>!
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm md:text-base bg-black/20 p-4 rounded-2xl border border-white/5">
                            <div>
                                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Cód. Operación</span>
                                <span className="text-gray-300 font-mono text-sm max-w-[150px] truncate block">{lastSale.movement_id}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block text-xs uppercase tracking-wider mb-1">Total Ingreso</span>
                                <span className="font-bold text-white text-lg">{lastSale.total_price.toFixed(2)} Bs</span>
                            </div>
                            <div>
                                <span className="text-green-500/50 block text-xs uppercase tracking-wider mb-1">Costo Interno (FIFO)</span>
                                <span className="text-green-400">{lastSale.total_cost.toFixed(2)} Bs</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
