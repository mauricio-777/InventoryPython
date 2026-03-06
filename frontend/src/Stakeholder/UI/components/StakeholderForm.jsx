import React, { useState, useEffect } from 'react';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import { CustomSelect } from '../../../CommonLayer/components/ui/CustomSelect.jsx';
import * as PhosphorIcons from '@phosphor-icons/react';

export const StakeholderForm = ({ type = 'customer', initialData = null, onSave, onCancel, loading }) => {
    const isCustomer = type === 'customer';
    const title = isCustomer ? 'Cliente' : 'Proveedor';

    const defaultCustomerData = {
        nombre: '',
        tipo_documento: 'DNI',
        numero_documento: '',
        direccion: '',
        telefono: '',
        email: '',
        condicion_pago: 'CONTADO',
        canal_pedido: '',
        canal_entrega: ''
    };

    const defaultSupplierData = {
        nombre: '',
        tipo_documento: 'RUC',
        numero_documento: '',
        direccion: '',
        telefono: '',
        email: '',
        plazo_entrega_dias: '',
        condiciones_compra: ''
    };

    const [formData, setFormData] = useState(
        initialData || (isCustomer ? defaultCustomerData : defaultSupplierData)
    );

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const docTypeOptions = [
        { value: 'DNI', label: 'DNI' },
        { value: 'RUC', label: 'RUC' },
        { value: 'OTRO', label: 'Otro' }
    ];

    const paymentOptions = [
        { value: 'CONTADO', label: 'Contado' },
        { value: 'CREDITO', label: 'Crédito' }
    ];

    const canalPedidoOptions = [
        { value: '', label: '— Sin especificar —' },
        { value: 'PRESENCIAL', label: 'Presencial' },
        { value: 'WHATSAPP', label: 'WhatsApp' },
        { value: 'TELEFONO', label: 'Teléfono' },
        { value: 'ONLINE', label: 'Online / Web' },
        { value: 'OTRO', label: 'Otro' },
    ];

    const canalEntregaOptions = [
        { value: '', label: '— Sin especificar —' },
        { value: 'RECOGE_TIENDA', label: 'Recoge en tienda' },
        { value: 'DELIVERY_DOMICILIO', label: 'Delivery a domicilio' },
        { value: 'COURIER', label: 'Courier / Envío' },
        { value: 'OTRO', label: 'Otro' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        let processedData = { ...formData };
        if (!isCustomer) {
            processedData.plazo_entrega_dias = processedData.plazo_entrega_dias
                ? parseInt(processedData.plazo_entrega_dias, 10)
                : null;
        }
        onSave(processedData);
    };

    const inputClasses = "w-full bg-[var(--color-quaternary)]/50 border border-gray-200 text-[var(--color-tertiary)] rounded-2xl px-4 py-2.5 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]/60 transition-all text-sm font-medium";
    const labelClasses = "block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider";

    return (
        <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.08)] p-6 w-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[var(--color-primary)]/10 rounded-2xl border border-[var(--color-primary)]/20 text-[var(--color-primary)]">
                        {isCustomer
                            ? <PhosphorIcons.Users size={20} weight="fill" />
                            : <PhosphorIcons.Truck size={20} weight="fill" />
                        }
                    </div>
                    <h2 className="text-xl font-bold text-[var(--color-tertiary)]">
                        {initialData ? 'Editar' : 'Nuevo'}{' '}
                        <span className="font-light text-[var(--color-primary)]">{title}</span>
                    </h2>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-gray-400 hover:text-[var(--color-tertiary)] transition-colors bg-gray-100 hover:bg-gray-200 p-2 rounded-xl"
                >
                    <PhosphorIcons.X size={18} weight="bold" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre + Tipo + N° Documento en una fila */}
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
                    <div>
                        <label className={labelClasses}>Nombre / Razón Social <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            className={inputClasses}
                            placeholder="Ej. Empresa SA"
                            value={formData.nombre}
                            onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>
                    <div className="min-w-[90px]">
                        <label className={labelClasses}>Tipo</label>
                        <CustomSelect
                            options={docTypeOptions}
                            value={formData.tipo_documento}
                            onChange={e => setFormData({ ...formData, tipo_documento: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>N° Documento <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            className={inputClasses}
                            placeholder="Documento único"
                            value={formData.numero_documento}
                            onChange={e => setFormData({ ...formData, numero_documento: e.target.value })}
                        />
                    </div>
                </div>

                {/* Dirección */}
                <div>
                    <label className={labelClasses}>Dirección</label>
                    <input
                        type="text"
                        className={inputClasses}
                        placeholder="Dirección física"
                        value={formData.direccion}
                        onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                    />
                </div>

                {/* Teléfono + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className={labelClasses}>Teléfono</label>
                        <input
                            type="text"
                            className={inputClasses}
                            placeholder="+591 70000000"
                            value={formData.telefono}
                            onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>Correo Electrónico</label>
                        <input
                            type="email"
                            className={inputClasses}
                            placeholder="contacto@empresa.com"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                </div>

                {/* Campos específicos según tipo */}
                {isCustomer && (
                    <div className="space-y-3">
                        {/* Condición de pago — fila propia */}
                        <div className="max-w-xs">
                            <label className={labelClasses}>Condición de Pago Habitual</label>
                            <CustomSelect
                                options={paymentOptions}
                                value={formData.condicion_pago}
                                onChange={e => setFormData({ ...formData, condicion_pago: e.target.value })}
                            />
                        </div>
                        {/* ¿Cómo se hace el pedido? / ¿Cómo se hace la entrega? */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className={labelClasses}>
                                    <span className="inline-flex items-center gap-1.5">
                                        ¿Cómo se hace el pedido?
                                    </span>
                                </label>
                                <CustomSelect
                                    options={canalPedidoOptions}
                                    value={formData.canal_pedido || ''}
                                    onChange={e => setFormData({ ...formData, canal_pedido: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className={labelClasses}>
                                    <span className="inline-flex items-center gap-1.5">
                                        ¿Cómo se hace la entrega?
                                    </span>
                                </label>
                                <CustomSelect
                                    options={canalEntregaOptions}
                                    value={formData.canal_entrega || ''}
                                    onChange={e => setFormData({ ...formData, canal_entrega: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {!isCustomer && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className={labelClasses}>Plazo de Entrega (Días)</label>
                            <input
                                type="number"
                                min="0"
                                className={inputClasses}
                                placeholder="Ej. 15"
                                value={formData.plazo_entrega_dias}
                                onChange={e => setFormData({ ...formData, plazo_entrega_dias: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className={labelClasses}>Condiciones de Compra</label>
                            <input
                                type="text"
                                className={inputClasses}
                                placeholder="Acuerdos, mínimos, etc."
                                value={formData.condiciones_compra}
                                onChange={e => setFormData({ ...formData, condiciones_compra: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onCancel}
                        disabled={loading}
                        className="px-5 font-bold text-gray-600"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        className="px-7 font-bold shadow-sm"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <PhosphorIcons.Spinner size={16} className="animate-spin" />
                                Guardando...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <PhosphorIcons.FloppyDisk size={16} weight="bold" />
                                Guardar {title}
                            </span>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};
