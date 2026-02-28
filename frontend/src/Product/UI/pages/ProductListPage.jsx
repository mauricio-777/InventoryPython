import React, { useEffect, useState } from 'react';
import { useProductActions } from '../../Application/useProductActions.js';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import { ProductFormPage } from './ProductFormPage.jsx';

export const ProductListPage = () => {
    const { products, fetchProducts, loading, error } = useProductActions();
    const [isFormVisible, setFormVisible] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <div className="animate-fade-in w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/10 pb-6 gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 md:p-4 bg-green-500/10 rounded-2xl relative border border-green-500/20 shadow-inner">
                        <svg className="w-8 h-8 md:w-10 md:h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-light text-white tracking-wide">
                            Catálogo de <span className="font-bold text-green-400">Productos</span>
                        </h1>
                        <p className="text-gray-500 text-sm md:text-base mt-2">Gestiona el inventario maestro de todo tu negocio.</p>
                    </div>
                </div>
                <Button onClick={() => setFormVisible(true)} variant="primary" className="w-full md:w-auto shadow-green-500/30 text-base py-3 md:py-3 px-6">
                    <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Nuevo Producto
                    </span>
                </Button>
            </div>

            {loading && (
                <div className="flex justify-center flex-col items-center py-12 gap-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-400"></div>
                    <span className="text-gray-400">Cargando catálogo...</span>
                </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg">
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p>{error}</p>
                </div>
            )}

            <div className="bg-gray-900/60 backdrop-blur-xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden w-full">
                <div className="overflow-x-auto custom-scrollbar w-full">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-medium">SKU</th>
                                <th className="px-6 py-4 font-medium">Nombre</th>
                                <th className="px-6 py-4 font-medium">Categoría</th>
                                <th className="px-6 py-4 font-medium">Unidad</th>
                                <th className="px-6 py-4 font-medium">Perecedero</th>
                                <th className="px-6 py-4 font-medium text-right">Precio Sugerido</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {products.map(p => (
                                <tr key={p.id} className="hover:bg-white/5 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 font-mono tracking-wide">{p.sku}</td>
                                    <td className="px-6 py-4 text-gray-200 font-medium">{p.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-xs border border-gray-700 shadow-inner">
                                            {p.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 font-medium">
                                        {p.unit_value} {p.unit_measure}
                                    </td>
                                    <td className="px-6 py-4">
                                        {p.is_perishable ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                Sí
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">No</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right text-green-400 font-bold tracking-wide">
                                        {p.suggested_price?.toFixed(2)} Bs
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {products.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        <p className="text-lg">No se encontraron productos en el catálogo.</p>
                        <p className="text-sm mt-1">Ingresa el primer producto de tu negocio.</p>
                    </div>
                )}
            </div>

            {/* Modal Overlay para ProductFormPage */}
            {isFormVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={() => setFormVisible(false)}
                    ></div>
                    <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-3xl animate-slide-up shadow-2xl shadow-green-500/10">
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
