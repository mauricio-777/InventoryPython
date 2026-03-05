import React, { useEffect, useState } from 'react';
import { useProductActions } from '../../Application/useProductActions.js';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import { ProductFormPage } from './ProductFormPage.jsx';
import { useUserRole } from '../../../CommonLayer/hooks/useUserRole.js';
import * as PhosphorIcons from '@phosphor-icons/react';

export const ProductListPage = () => {
    const { products, fetchProducts, loading, error } = useProductActions();
    const { hasRole } = useUserRole();
    const [isFormVisible, setFormVisible] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <div className="animate-fade-in w-full max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 md:p-4 bg-[var(--color-primary)]/10 rounded-2xl relative border border-[var(--color-primary)]/20 shadow-sm">
                        <PhosphorIcons.Package size={32} weight="fill" className="text-[var(--color-primary)]" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-tertiary)] tracking-tight">
                            Catálogo de Productos
                        </h1>
                        <p className="text-gray-500 text-sm md:text-base mt-1 font-medium">Gestiona el inventario maestro de todo tu negocio.</p>
                    </div>
                </div>
                {hasRole(['admin', 'gestor']) && (
                    <Button onClick={() => setFormVisible(true)} variant="primary" className="w-full md:w-auto shadow-sm text-base py-3 px-6">
                        <span className="flex items-center justify-center gap-2">
                            <PhosphorIcons.Plus size={20} weight="bold" />
                            Nuevo Producto
                        </span>
                    </Button>
                )}
            </div>

            {loading && (
                <div className="flex justify-center flex-col items-center py-12 gap-4 h-[50vh]">
                    <PhosphorIcons.Spinner size={40} className="animate-spin text-[var(--color-primary)]" />
                    <span className="text-gray-500 font-medium">Cargando catálogo...</span>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl flex items-center gap-3 shadow-sm">
                    <PhosphorIcons.WarningCircle size={24} weight="fill" className="text-red-500 shrink-0" />
                    <p className="font-medium">{error}</p>
                </div>
            )}

            <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full">
                <div className="overflow-x-auto custom-scrollbar w-full">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                                <th className="px-6 py-4">SKU</th>
                                <th className="px-6 py-4">Nombre</th>
                                <th className="px-6 py-4">Categoría</th>
                                <th className="px-6 py-4">Unidad</th>
                                <th className="px-6 py-4">Perecedero</th>
                                <th className="px-6 py-4 text-right">Precio Sugerido</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {products.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors duration-200 group">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-mono font-medium tracking-wide">{p.sku}</td>
                                    <td className="px-6 py-4 text-[var(--color-tertiary)] font-bold">{p.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold border border-gray-200">
                                            {p.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 font-medium">
                                        {p.unit_value} {p.unit_measure}
                                    </td>
                                    <td className="px-6 py-4">
                                        {p.is_perishable ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold">
                                                <PhosphorIcons.Fire size={14} weight="bold" />
                                                Sí
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 font-medium">No</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right text-[var(--color-tertiary)] font-bold tracking-wide">
                                        Bs {p.suggested_price?.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {products.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <PhosphorIcons.Package size={64} weight="duotone" className="mb-4 opacity-50 text-gray-300" />
                        <p className="text-lg font-bold text-[var(--color-tertiary)]">No se encontraron productos.</p>
                        <p className="text-sm mt-1 font-medium">Ingresa el primer producto de tu negocio.</p>
                    </div>
                )}
            </div>

            {/* Modal Overlay para ProductFormPage */}
            {isFormVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
                    <div
                        className="absolute inset-0 bg-[var(--color-tertiary)]/30 backdrop-blur-sm"
                        onClick={() => setFormVisible(false)}
                    ></div>
                    <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl animate-slide-up shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
                        <ProductFormPage
                            onCancel={() => setFormVisible(false)}
                            onSuccess={() => { setFormVisible(false); fetchProducts(); }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
