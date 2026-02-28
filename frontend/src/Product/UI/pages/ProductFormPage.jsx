import React, { useState } from 'react';
import { useProductActions } from '../../Application/useProductActions.js';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import { CustomSelect } from '../../../CommonLayer/components/ui/CustomSelect.jsx';

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

    const inputClasses = "w-full bg-black/40 border border-gray-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all placeholder-gray-600 shadow-inner";
    const labelClasses = "block text-sm font-medium text-gray-400 mb-2";

    return (
        <div className="bg-gray-900 shadow-2xl shadow-green-500/5 border border-white/10 rounded-3xl overflow-hidden w-full">
            <div className="px-8 py-6 border-b border-white/5 bg-gradient-to-r from-gray-800 to-gray-900 sticky top-0 z-20 flex justify-between items-center backdrop-blur-md">
                <h2 className="text-2xl font-light text-white flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-xl shadow-inner border border-green-500/20">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </div>
                    Registrar <span className="font-bold text-green-400">Producto</span>
                </h2>
                <button type="button" onClick={onCancel} className="text-gray-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 bg-gray-900/40 pb-28 sm:pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Columna Izquierda */}
                    <div className="space-y-6">
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
                            <textarea rows="4" className={`${inputClasses} resize-none`} placeholder="Opcional..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                    </div>

                    {/* Columna Derecha */}
                    <div className="space-y-6">
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
                            <div className="flex items-center">
                                <input
                                    type="number" step="0.01" min="0.1" required
                                    placeholder="Ej. 2.5"
                                    className={`${inputClasses} rounded-r-none border-r-0`}
                                    value={formData.unit_value}
                                    onChange={e => setFormData({ ...formData, unit_value: e.target.value })}
                                />
                                <span className="inline-flex items-center justify-center px-4 py-3 rounded-r-xl border border-l-0 border-gray-700/50 bg-gray-800 text-green-400 font-bold min-w-[5rem]">
                                    {formData.unit_measure}
                                </span>
                            </div>
                        </div>

                        <div className="p-5 bg-black/20 border border-white/5 rounded-2xl shadow-inner">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-300 cursor-pointer select-none flex-1" htmlFor="perishable">
                                    ¿Es producto Perecedero?
                                </label>
                                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in" onClick={() => setFormData({ ...formData, is_perishable: !formData.is_perishable })}>
                                    <input type="checkbox" id="perishable" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer border-gray-600/50 bg-gray-600 top-0 left-0 checked:right-0 checked:border-amber-500 checked:bg-amber-500" style={{ transform: formData.is_perishable ? 'translateX(100%)' : 'translateX(0)', transition: 'transform 0.2s', borderColor: formData.is_perishable ? '#F59E0B' : '#4B5563', zIndex: 1 }} checked={formData.is_perishable} readOnly />
                                    <div className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-800 border border-gray-700 cursor-pointer"></div>
                                </div>
                            </div>

                            {formData.is_perishable && (
                                <div className="mt-4 animate-slide-up">
                                    <label className={labelClasses}>Fecha Mínima Recomendada de Venta</label>
                                    <input type="date" className={`${inputClasses} sm:text-sm appearance-none`} value={formData.expiration_date} onChange={e => setFormData({ ...formData, expiration_date: e.target.value })} />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className={labelClasses}>Precio Sugerido de Venta (Bs)</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                    <span className="text-gray-500 font-medium">Bs</span>
                                </div>
                                <input type="number" step="0.50" min="0" required className={`${inputClasses} pl-12 text-green-400 font-bold text-lg`} value={formData.suggested_price} onChange={e => setFormData({ ...formData, suggested_price: e.target.value })} />
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mt-6 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {error}
                    </div>
                )}

                <div className="fixed sm:relative bottom-0 left-0 w-full sm:w-auto p-4 sm:p-0 bg-gray-900 border-t sm:border-0 border-white/10 sm:bg-transparent flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:mt-10 sm:pt-6 sm:border-t mt-0 pt-0">
                    <Button type="button" variant="danger" onClick={onCancel} className="w-full sm:w-auto shadow-none">
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={submitting} className="w-full sm:w-auto py-3">
                        {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="animate-spin h-5 w-5 border-2 border-gray-900 border-t-transparent rounded-full"></div>
                                Guardando...
                            </span>
                        ) : (
                            'Guardar Producto'
                        )}
                    </Button>
                </div>
            </form>
            <style>{`
                .toggle-checkbox:checked { right: 0; border-color: #f59e0b; }
                .toggle-checkbox:checked + .toggle-label { background-color: #d97706; }
            `}</style>
        </div>
    );
};
