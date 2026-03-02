import React, { useState, useEffect } from 'react';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import { CustomSelect } from '../../../CommonLayer/components/ui/CustomSelect.jsx';

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
        condicion_pago: 'CONTADO'
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

    const docTypeOptions = [
        { value: 'DNI', label: 'DNI' },
        { value: 'RUC', label: 'RUC' },
        { value: 'OTRO', label: 'Otro' }
    ];

    const paymentOptions = [
        { value: 'CONTADO', label: 'Contado' },
        { value: 'CREDITO', label: 'Crédito' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();

        let processedData = { ...formData };
        if (!isCustomer) {
            processedData.plazo_entrega_dias = processedData.plazo_entrega_dias ? parseInt(processedData.plazo_entrega_dias, 10) : null;
        }

        onSave(processedData);
    };

    const inputClasses = "w-full bg-black/40 border border-gray-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all placeholder-gray-600 shadow-inner";
    const labelClasses = "block text-sm font-medium text-gray-400 mb-2";

    return (
        <div className="bg-gray-900 border border-white/10 p-6 md:p-8 rounded-3xl w-full">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                <h2 className="text-2xl md:text-3xl font-light text-white">
                    {initialData ? 'Editar' : 'Nuevo'} <span className="font-bold text-green-400">{title}</span>
                </h2>
                <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info - Shared */}
                    <div>
                        <label className={labelClasses}>Nombre / Razón Social <span className="text-green-500">*</span></label>
                        <input type="text" required className={inputClasses} placeholder="Ej. Empresa SA" value={formData.nombre} onChange={e => setFormData({ ...formData, nombre: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                            <label className={labelClasses}>Tipo</label>
                            <CustomSelect
                                options={docTypeOptions}
                                value={formData.tipo_documento}
                                onChange={e => setFormData({ ...formData, tipo_documento: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className={labelClasses}>N° Documento <span className="text-green-500">*</span></label>
                            <input type="text" required className={inputClasses} placeholder="Documento único" value={formData.numero_documento} onChange={e => setFormData({ ...formData, numero_documento: e.target.value })} />
                        </div>
                    </div>

                    {/* Contact Info - Shared */}
                    <div className="md:col-span-2">
                        <label className={labelClasses}>Dirección</label>
                        <input type="text" className={inputClasses} placeholder="Dirección física" value={formData.direccion} onChange={e => setFormData({ ...formData, direccion: e.target.value })} />
                    </div>

                    <div>
                        <label className={labelClasses}>Teléfono</label>
                        <input type="text" className={inputClasses} placeholder="+591 70000000" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} />
                    </div>

                    <div>
                        <label className={labelClasses}>Correo Electrónico</label>
                        <input type="email" className={inputClasses} placeholder="contacto@empresa.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    </div>

                    {/* Specific Fields */}
                    {isCustomer && (
                        <div>
                            <label className={labelClasses}>Condición de Pago Habitual</label>
                            <CustomSelect
                                options={paymentOptions}
                                value={formData.condicion_pago}
                                onChange={e => setFormData({ ...formData, condicion_pago: e.target.value })}
                            />
                        </div>
                    )}

                    {!isCustomer && (
                        <>
                            <div>
                                <label className={labelClasses}>Plazo de Entrega (Días)</label>
                                <input type="number" min="0" className={inputClasses} placeholder="Ej. 15" value={formData.plazo_entrega_dias} onChange={e => setFormData({ ...formData, plazo_entrega_dias: e.target.value })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClasses}>Condiciones de Compra (Notas)</label>
                                <textarea rows="2" className={`${inputClasses} resize-none`} placeholder="Acuerdos, mínimos de compra, etc." value={formData.condiciones_compra} onChange={e => setFormData({ ...formData, condiciones_compra: e.target.value })} />
                            </div>
                        </>
                    )}
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                    <Button type="button" variant="secondary" onClick={onCancel} disabled={loading} className="px-6">
                        Cancelar
                    </Button>
                    <Button type="submit" variant="primary" disabled={loading} className="px-8 shadow-green-500/20">
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <div className="animate-spin h-4 w-4 border-2 border-gray-900 border-t-transparent rounded-full"></div>
                                Guardando...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Guardar {title}
                            </span>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};
