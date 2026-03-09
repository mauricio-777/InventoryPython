import React, { useState, useEffect } from 'react';
import * as PhosphorIcons from '@phosphor-icons/react';
import { Title } from '../../../CommonLayer/components/ui/Title.jsx';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import { CustomSelect } from '../../../CommonLayer/components/ui/CustomSelect.jsx';
import { useCustomerActions } from '../../../Stakeholder/Application/useStakeholderSearch.js';
import { useProductActions } from '../../../Product/Application/useProductActions.js';
import { useOrderActions } from '../../Application/useOrderActions.js';
import { useToast } from '../../../CommonLayer/context/ToastContext.jsx';

export function OrderFormPage({ onSuccess, onCancel }) {
    const { showToast } = useToast();
    const { customers, fetchCustomers } = useCustomerActions();
    const { products, fetchProducts } = useProductActions();
    const { createOrder, loading } = useOrderActions();

    const [customerId, setCustomerId] = useState('');
    const [shippingAddress, setShippingAddress] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState([]);

    // Line item state
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchCustomers();
        fetchProducts();
    }, [fetchCustomers, fetchProducts]);

    const customerOptions = customers.map(c => ({
        value: c.id,
        label: `${c.nombre} (${c.tipo_documento}: ${c.numero_documento})`
    }));

    const productOptions = products.map(p => ({
        value: p.id,
        label: `${p.name} (Bs ${Number(p.suggested_price || 0).toFixed(2)})`
    }));

    const handleAddItem = () => {
        if (!selectedProductId || quantity <= 0) return;

        const product = products.find(p => p.id === selectedProductId);
        if (!product) return;

        // Check if already in list
        const existingIndex = items.findIndex(i => i.product_id === selectedProductId);
        if (existingIndex >= 0) {
            const newItems = [...items];
            newItems[existingIndex].quantity += parseInt(quantity, 10);
            setItems(newItems);
        } else {
            setItems([...items, {
                product_id: product.id,
                product_name: product.name,
                unit_price: Number(product.suggested_price || 0),
                quantity: parseInt(quantity, 10)
            }]);
        }

        setSelectedProductId('');
        setQuantity(1);
    };

    const handleRemoveItem = (index) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!customerId) {
            showToast('Seleccione un cliente', 'error');
            return;
        }
        if (items.length === 0) {
            showToast('Agregue al menos un producto al pedido', 'error');
            return;
        }

        const data = {
            customer_id: customerId,
            shipping_address: shippingAddress,
            notes: notes,
            items: items.map(i => ({
                product_id: i.product_id,
                quantity: i.quantity,
                unit_price: i.unit_price
            }))
        };

        const result = await createOrder(data);
        if (result.success) {
            showToast('Pedido creado exitosamente', 'success');
            onSuccess && onSuccess(result.data);
        } else {
            showToast(result.error || 'Error al crear pedido', 'error');
        }
    };

    const totalOrder = items.reduce((sum, item) => sum + (item.quantity * Number(item.unit_price)), 0);
    const inputClasses = "w-full bg-[var(--color-quinary)] border border-gray-200 text-[var(--color-tertiary)] rounded-2xl px-4 py-3 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/10 focus:border-[var(--color-primary)] transition-all shadow-sm";
    const labelClasses = "block text-sm font-bold text-gray-600 mb-2";

    return (
        <div className="bg-white p-6 md:p-8 rounded-3xl w-full max-w-4xl mx-auto shadow-xl">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                <Title icon={<PhosphorIcons.FileText size={28} weight="fill" className="text-[var(--color-primary)]" />}>
                    Nuevo Pedido
                </Title>
                {onCancel && (
                    <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                        <PhosphorIcons.X size={24} weight="bold" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Cabecera del pedido */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                        <label className={labelClasses}>Cliente <span className="text-red-500">*</span></label>
                        <CustomSelect
                            options={customerOptions}
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            placeholder="-- Seleccionar Cliente --"
                            required
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>Dirección de Entrega</label>
                        <input
                            type="text"
                            className={inputClasses}
                            value={shippingAddress}
                            onChange={(e) => setShippingAddress(e.target.value)}
                            placeholder="Opcional: Si es distinto al registrado"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className={labelClasses}>Notas Adicionales</label>
                        <textarea
                            className={inputClasses}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Instrucciones para el almacén o chofer..."
                            rows={2}
                        />
                    </div>
                </div>

                {/* Líneas de detalle */}
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <PhosphorIcons.ShoppingCart size={24} className="text-[var(--color-primary)]" />
                        Productos del Pedido
                    </h3>

                    <div className="flex flex-col md:flex-row gap-4 items-end bg-white p-4 rounded-2xl border border-gray-200 mb-4 shadow-sm">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Producto</label>
                            <CustomSelect
                                options={productOptions}
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                                placeholder="Buscar en catálogo..."
                            />
                        </div>
                        <div className="w-32">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cantidad</label>
                            <input
                                type="number"
                                min="1"
                                className={inputClasses}
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                            />
                        </div>
                        <Button
                            type="button"
                            variant="primary"
                            onClick={handleAddItem}
                            disabled={!selectedProductId || quantity < 1}
                            className="h-[50px] px-6"
                        >
                            Añadir
                        </Button>
                    </div>

                    {/* Tabla de Items */}
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-gray-700 uppercase font-semibold text-xs tracking-wider border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3">Producto</th>
                                    <th className="px-4 py-3 text-right">Cantidad</th>
                                    <th className="px-4 py-3 text-right">Precio Unit.</th>
                                    <th className="px-4 py-3 text-right">Subtotal</th>
                                    <th className="px-4 py-3 text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                                            No hay productos en el pedido.
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{item.product_name}</td>
                                            <td className="px-4 py-3 text-right">{item.quantity}</td>
                                            <td className="px-4 py-3 text-right">Bs {Number(item.unit_price).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-right font-bold text-[var(--color-primary)]">
                                                Bs {(item.quantity * Number(item.unit_price)).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveItem(index)}
                                                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                                >
                                                    <PhosphorIcons.Trash size={18} weight="bold" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {items.length > 0 && (
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan="3" className="px-4 py-4 text-right font-bold text-gray-900 border-t border-gray-200">
                                            Total Pedido:
                                        </td>
                                        <td className="px-4 py-4 text-right font-black text-[var(--color-primary)] text-lg border-t border-gray-200">
                                            Bs {totalOrder.toFixed(2)}
                                        </td>
                                        <td className="border-t border-gray-200"></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                    {onCancel && (
                        <Button type="button" variant="secondary" onClick={onCancel}>
                            Cancelar
                        </Button>
                    )}
                    <Button type="submit" variant="primary" disabled={loading || items.length === 0} className="flex items-center gap-2">
                        {loading ? <PhosphorIcons.Spinner className="animate-spin" size={20} /> : <PhosphorIcons.FloppyDisk size={20} weight="bold" />}
                        Generar Pedido
                    </Button>
                </div>
            </form>
        </div>
    );
}
