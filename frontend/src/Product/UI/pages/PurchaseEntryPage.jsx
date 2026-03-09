import React, { useState, useEffect } from 'react';
import { useInventoryActions } from '../../Application/useInventoryActions.js';
import { useProductActions } from '../../Application/useProductActions.js';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import { CustomSelect } from '../../../CommonLayer/components/ui/CustomSelect.jsx';
import { useSupplierActions } from '../../../Stakeholder/Application/useStakeholderSearch.js';
import { ProductFormPage } from './ProductFormPage.jsx';
import { StakeholderForm } from '../../../Stakeholder/UI/components/StakeholderForm.jsx';
import { LocationForm } from '../../../Warehouse/UI/components/LocationForm.jsx';
import { useLocationActions } from '../../../Warehouse/Application/useLocationActions.js';
import { useToast } from '../../../CommonLayer/context/ToastContext.jsx';
import * as PhosphorIcons from '@phosphor-icons/react';

export const PurchaseEntryPage = () => {
    const { receivePurchase, loading, error } = useInventoryActions();
    const { products, fetchProducts } = useProductActions();

    const { showToast } = useToast();
    const { suppliers, fetchSuppliers, createSupplier, loading: loadingSuppliers } = useSupplierActions();
    const { locations, fetchLocations, createLocation } = useLocationActions();

    const [formData, setFormData] = useState({
        product_id: '', quantity: 0, unit_cost: 0, supplier_id: '', location_id: '', expiration_date: ''
    });
    const [message, setMessage] = useState('');
    const [validationError, setValidationError] = useState('');

    const [isProductFormVisible, setProductFormVisible] = useState(false);
    const [isSupplierFormVisible, setSupplierFormVisible] = useState(false);
    const [isLocationFormVisible, setLocationFormVisible] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchSuppliers();
        fetchLocations();
    }, [fetchProducts, fetchSuppliers, fetchLocations]);

    const productOptions = products.map(p => ({
        value: p.id,
        label: `${p.name} (${p.sku})`
    }));

    const supplierOptions = suppliers.map(s => ({
        value: s.id,
        label: `${s.nombre} (${s.tipo_documento}: ${s.numero_documento})`
    }));

    const locationOptions = locations.map(l => ({
        value: l.id,
        label: l.composite_code
    }));

    const handleSaveSupplier = async (data) => {
        try {
            const newSupplier = await createSupplier(data);
            showToast('Proveedor creado exitosamente.', 'success');
            setFormData({ ...formData, supplier_id: newSupplier.id });
            setSupplierFormVisible(false);
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleSaveLocation = async (data) => {
        const result = await createLocation(data);
        if (result.success) {
            showToast('Ubicación creada exitosamente.', 'success');
            setFormData({ ...formData, location_id: result.data.id });
            setLocationFormVisible(false);
        } else {
            showToast(result.error || 'Error al crear ubicación', 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setValidationError('');

        if (!formData.supplier_id) {
            setValidationError('Debe seleccionar un proveedor para registrar la compra.');
            return;
        }

        if (!formData.location_id) {
            setValidationError('Debe asignar una ubicación física en el almacén para este lote.');
            return;
        }

        try {
            const dataToSubmit = {
                ...formData,
                quantity: parseInt(formData.quantity, 10),
                unit_cost: parseFloat(formData.unit_cost),
                expiration_date: formData.expiration_date ? new Date(formData.expiration_date).toISOString() : null
            };
            await receivePurchase(dataToSubmit);
            setMessage('¡Lote de inventario registrado exitosamente!');
            setFormData({ product_id: '', quantity: 0, unit_cost: 0, supplier_id: '', location_id: '', expiration_date: '' });
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
                                <div className="flex gap-2 items-start">
                                    <div className="flex-1">
                                        <CustomSelect
                                            options={productOptions}
                                            value={formData.product_id}
                                            onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                                            placeholder="-- Buscar Producto --"
                                            required={true}
                                        />
                                    </div>
                                    <Button type="button" onClick={() => setProductFormVisible(true)} variant="secondary" className="px-3 py-3 rounded-2xl shrink-0 h-[46px]" title="Añadir Producto Nuevo">
                                        <PhosphorIcons.Plus size={20} weight="bold" />
                                    </Button>
                                </div>
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
                                <label className={labelClasses}>Proveedor <span className="text-red-500">*</span></label>
                                <div className="flex gap-2 items-start">
                                    <div className="flex-1">
                                        <CustomSelect
                                            options={supplierOptions}
                                            value={formData.supplier_id}
                                            onChange={e => setFormData({ ...formData, supplier_id: e.target.value })}
                                            placeholder="-- Seleccionar Proveedor --"
                                            required={true}
                                        />
                                    </div>
                                    <Button type="button" onClick={() => setSupplierFormVisible(true)} variant="secondary" className="px-3 py-3 rounded-2xl shrink-0 h-[46px]" title="Añadir Proveedor Nuevo">
                                        <PhosphorIcons.Plus size={20} weight="bold" />
                                    </Button>
                                </div>
                                <p className="mt-2 text-xs font-bold text-gray-500 flex items-center gap-1.5">
                                    <PhosphorIcons.Info size={14} weight="bold" />
                                    Si no existe el proveedor, regístrelo en la sección "Proveedores".
                                </p>
                            </div>

                            <div>
                                <label className={labelClasses}>Ubicación en Almacén <span className="text-red-500">*</span></label>
                                <div className="flex gap-2 items-start">
                                    <div className="flex-1">
                                        <CustomSelect
                                            options={locationOptions}
                                            value={formData.location_id}
                                            onChange={e => setFormData({ ...formData, location_id: e.target.value })}
                                            placeholder="-- Seleccionar Ubicación --"
                                            required={true}
                                        />
                                    </div>
                                    <Button type="button" onClick={() => setLocationFormVisible(true)} variant="secondary" className="px-3 py-3 rounded-2xl shrink-0 h-[46px]" title="Añadir Ubicación Nueva">
                                        <PhosphorIcons.Plus size={20} weight="bold" />
                                    </Button>
                                </div>
                                <p className="mt-2 text-xs font-bold text-gray-500 flex items-center gap-1.5">
                                    <PhosphorIcons.Info size={14} weight="bold" />
                                    Lugar físico donde se almacenará este lote.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        {(error || validationError) && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl text-sm flex items-center gap-3 shadow-sm font-medium">
                                <PhosphorIcons.WarningCircle size={20} weight="fill" className="shrink-0 text-red-500" />
                                {error || validationError}
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

            {
                isProductFormVisible && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:pl-56 animate-fade-in">
                        <div className="absolute inset-0 bg-[var(--color-tertiary)]/30 backdrop-blur-sm" onClick={() => setProductFormVisible(false)}></div>
                        <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl animate-slide-up shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
                            <ProductFormPage
                                onCancel={() => setProductFormVisible(false)}
                                onSuccess={() => {
                                    setProductFormVisible(false);
                                    fetchProducts();
                                    showToast('Producto añadido exitosamente.', 'success');
                                }}
                            />
                        </div>
                    </div>
                )
            }

            {
                isSupplierFormVisible && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:pl-56 animate-fade-in">
                        <div className="absolute inset-0 bg-[var(--color-tertiary)]/30 backdrop-blur-sm" onClick={() => setSupplierFormVisible(false)}></div>
                        <div className="relative z-10 w-full max-w-2xl animate-slide-up shadow-[0_20px_40px_rgba(0,0,0,0.1)] rounded-3xl">
                            <StakeholderForm
                                type="supplier"
                                initialData={null}
                                onSave={handleSaveSupplier}
                                onCancel={() => setSupplierFormVisible(false)}
                                loading={loadingSuppliers}
                            />
                        </div>
                    </div>
                )
            }

            {
                isLocationFormVisible && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:pl-56 animate-fade-in">
                        <div className="absolute inset-0 bg-[var(--color-tertiary)]/30 backdrop-blur-sm" onClick={() => setLocationFormVisible(false)}></div>
                        <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl border border-gray-100 relative animate-slide-up z-20">
                            <LocationForm
                                item={null}
                                onClose={() => setLocationFormVisible(false)}
                                onSave={handleSaveLocation}
                            />
                        </div>
                    </div>
                )
            }
        </div >
    );
};
