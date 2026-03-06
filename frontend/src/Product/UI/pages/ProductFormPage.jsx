import React, { useState } from 'react';
import { useProductActions } from '../../Application/useProductActions.js';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import { CustomSelect } from '../../../CommonLayer/components/ui/CustomSelect.jsx';
import * as PhosphorIcons from '@phosphor-icons/react';

export const ProductFormPage = ({ onCancel, onSuccess }) => {
    const { createProduct } = useProductActions();

    // Categorias y medidas mapeadas
    const categoryMeasures = {
        'Alimentos': ['Kilogramos', 'Gramos', 'Litros', 'Mililitros', 'Unidades'],
        'Electrónica': ['Unidades'],
        'Limpieza': ['Litros', 'Mililitros', 'Unidades'],
        'Otros': ['Unidades', 'Litros', 'Kilogramos', 'Gramos']
    };

    const categories = Object.keys(categoryMeasures).map(c => ({ value: c, label: c }));

    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        description: '',
        category: categories[0].value,
        unit_measure: categoryMeasures[categories[0].value][0],
        unit_value: 1.0,
        is_perishable: false,
        expiration_date: '',
        suggested_price: 0
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const currentMeasuresOptions = categoryMeasures[formData.category].map(m => ({ value: m, label: m }));

    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;
        setFormData({
            ...formData,
            category: newCategory,
            unit_measure: categoryMeasures[newCategory][0]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            await createProduct({
                ...formData,
                unit_value: parseFloat(formData.unit_value) || 1.0,
                suggested_price: parseFloat(formData.suggested_price) || 0,
                expiration_date: formData.is_perishable && formData.expiration_date ? new Date(formData.expiration_date).toISOString() : null
            });
            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const inputClasses = "w-full bg-[var(--color-quaternary)]/50 border border-gray-200 text-[var(--color-tertiary)] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all placeholder-gray-400";
    const labelClasses = "block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider";

    return (
        <div className="bg-[var(--color-quinary)] shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-gray-100 rounded-3xl overflow-hidden w-full max-w-4xl mx-auto">
            <div className="px-6 py-4 border-b border-gray-100 bg-[var(--color-quinary)] flex justify-between items-center rounded-t-3xl">
                <h2 className="text-xl font-bold text-[var(--color-tertiary)] flex items-center gap-3 tracking-tight">
                    <div className="p-2.5 bg-[var(--color-primary)]/10 rounded-xl shadow-sm border border-[var(--color-primary)]/20">
                        <PhosphorIcons.Package size={20} weight="fill" className="text-[var(--color-primary)]" />
                    </div>
                    Registrar Producto
                </h2>
                <button type="button" onClick={onCancel} className="text-gray-400 hover:text-[var(--color-tertiary)] transition-colors bg-gray-100 hover:bg-gray-200 p-2 rounded-xl border border-gray-200">
                    <PhosphorIcons.X size={18} weight="bold" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 bg-gray-50/30">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Columna Izquierda */}
                    <div className="space-y-4">
                        <div>
                            <label className={labelClasses}>SKU (Código Único)</label>
                            <input type="text" required placeholder="Ej. PRD-001" className={inputClasses} value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                        </div>

                        <div>
                            <label className={labelClasses}>Nombre del Producto</label>
                            <input type="text" required placeholder="Ej. Gaseosa Cola 2.5L" className={inputClasses} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>

                        <div>
                            <label className={labelClasses}>Descripción</label>
                            <textarea rows="3" className={`${inputClasses} resize-none`} placeholder="Opcional..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                    </div>

                    {/* Columna Derecha */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Categoría</label>
                                <CustomSelect
                                    options={categories}
                                    value={formData.category}
                                    onChange={handleCategoryChange}
                                    required={true}
                                />
                            </div>

                            <div>
                                <label className={labelClasses}>Unidad Físic.</label>
                                <CustomSelect
                                    options={currentMeasuresOptions}
                                    value={formData.unit_measure}
                                    onChange={e => setFormData({ ...formData, unit_measure: e.target.value })}
                                    required={true}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClasses}>
                                Valor Unitario
                            </label>
                            <div className="flex flex-row items-stretch">
                                <input
                                    type="number" step="0.01" min="0.1" required
                                    placeholder="Ej. 2.5"
                                    className={`${inputClasses} rounded-r-none border-r-0`}
                                    value={formData.unit_value}
                                    onChange={e => setFormData({ ...formData, unit_value: e.target.value })}
                                    style={{ flex: 1 }}
                                />
                                <span className="inline-flex items-center justify-center px-4 rounded-r-2xl border border-l-0 border-gray-200 bg-gray-100 text-[var(--color-primary)] font-bold min-w-[5rem] shadow-sm">
                                    {formData.unit_measure}
                                </span>
                            </div>
                        </div>

                        <div className="p-5 bg-[var(--color-quaternary)]/40 border border-gray-200 rounded-2xl shadow-sm">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-gray-700 cursor-pointer select-none flex-1 flex items-center gap-2" htmlFor="perishable">
                                    ¿Es producto Perecedero?
                                </label>
                                <div
                                    className="relative flex items-center cursor-pointer"
                                    onClick={() => setFormData({ ...formData, is_perishable: !formData.is_perishable })}
                                >
                                    <input type="checkbox" id="perishable" className="sr-only" checked={formData.is_perishable} readOnly />
                                    <div className={`block w-12 h-6 rounded-full transition-colors ${formData.is_perishable ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`} />
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${formData.is_perishable ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </div>

                            {formData.is_perishable && (
                                <div className="mt-4 animate-slide-up bg-orange-50 p-4 rounded-xl border border-orange-100">
                                    <label className="block text-sm font-bold text-orange-800 mb-2 flex items-center gap-1.5"><PhosphorIcons.Calendar size={16} /> Fecha Mínima Recomendada de Venta</label>
                                    <input type="date" className="w-full bg-white border border-orange-200 text-orange-900 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all sm:text-sm appearance-none" value={formData.expiration_date} onChange={e => setFormData({ ...formData, expiration_date: e.target.value })} />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className={labelClasses}>Precio Sugerido de Venta (Bs)</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <span className="text-gray-400 font-bold">Bs</span>
                                </div>
                                <input type="number" step="0.50" min="0" required className={`${inputClasses} pl-12 text-[var(--color-primary)] font-black text-lg cursor-text`} value={formData.suggested_price} onChange={e => setFormData({ ...formData, suggested_price: e.target.value })} />
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 font-medium">
                        <PhosphorIcons.WarningCircle size={20} weight="fill" className="shrink-0 text-red-500" />
                        {error}
                    </div>
                )}

                <div className="flex flex-row items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
                    <Button type="button" variant="secondary" onClick={onCancel} className="shadow-sm px-6">
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting} className="py-3 px-8 shadow-sm">
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <PhosphorIcons.Spinner size={20} className="animate-spin" />
                                Guardando...
                            </span>
                        ) : (
                            <span className="flex items-center justify-center gap-2">
                                <PhosphorIcons.FloppyDisk size={20} weight="bold" />
                                Guardar Producto
                            </span>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};
