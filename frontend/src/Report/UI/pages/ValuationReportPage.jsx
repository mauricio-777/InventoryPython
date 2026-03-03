import React, { useState } from 'react';
import { useReports } from '../../Application/useReports.js';

export const ValuationReportPage = () => {
    const {
        loading,
        error,
        fetchValorizationReport,
        exportValorizationReport
    } = useReports();

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [report, setReport] = useState(null);
    const [exporting, setExporting] = useState(false);

    const handleFetchReport = async () => {
        try {
            const data = await fetchValorizationReport(selectedDate);
            setReport(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleExport = async (format) => {
        try {
            setExporting(true);
            const data = await exportValorizationReport(selectedDate, format);
            
            if (format === 'json') {
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `valorization_${selectedDate}.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            } else if (format === 'csv') {
                const url = window.URL.createObjectURL(data);
                const a = document.createElement('a');
                a.href = url;
                a.download = `valorization_${selectedDate}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="animate-fade-in w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="p-3 md:p-4 bg-purple-500/10 rounded-2xl relative border border-purple-500/20 shadow-inner">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-light text-white tracking-wide">
                        Reporte de <span className="font-bold text-purple-400">Valorización</span>
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">FIFO - Costo del inventario a una fecha específica</p>
                </div>
            </div>

            {/* Date Selector */}
            <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 md:p-8 mb-8 w-full max-w-md">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3">Seleccionar Fecha</label>
                    <div className="flex gap-3 items-end">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="flex-1 px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-purple-500 outline-none"
                        />
                        <button
                            onClick={handleFetchReport}
                            disabled={loading}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium transition-colors disabled:opacity-50">
                            {loading ? 'Cargando...' : 'Consultar'}
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 w-full">
                    <p>{error}</p>
                </div>
            )}

            {report && (
                <>
                    {/* Export Buttons */}
                    <div className="flex gap-3 mb-8">
                        <button
                            onClick={() => handleExport('csv')}
                            disabled={exporting}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Descargar CSV
                        </button>
                        <button
                            onClick={() => handleExport('json')}
                            disabled={exporting}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Descargar JSON
                        </button>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 md:p-8 mb-8 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-gray-400 text-sm mb-2">Fecha del Reporte</p>
                                <h3 className="text-2xl font-bold text-purple-400">
                                    {new Date(report.date).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit'
                                    })}
                                </h3>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-2">Valor Total del Inventario</p>
                                <h3 className="text-2xl font-bold text-green-400">
                                    Bs {report.total_value?.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Resumen por Producto */}
                    {report.details_by_product && report.details_by_product.length > 0 && (
                        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 md:p-8 mb-8 w-full">
                            <h2 className="text-xl font-bold text-white mb-4">Resumen por Producto (FIFO)</h2>
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left min-w-[1000px]">
                                    <thead>
                                        <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                            <th className="px-6 py-4 font-medium">Producto</th>
                                            <th className="px-6 py-4 font-medium">SKU</th>
                                            <th className="px-6 py-4 font-medium">Cantidad</th>
                                            <th className="px-6 py-4 font-medium">Costo Unit. Promedio</th>
                                            <th className="px-6 py-4 font-medium text-right">Costo Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {report.details_by_product.map(product => (
                                            <tr key={product.product_id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-white font-medium">{product.product_name}</td>
                                                <td className="px-6 py-4 text-gray-400">{product.product_sku}</td>
                                                <td className="px-6 py-4 text-gray-400">{product.total_quantity}</td>
                                                <td className="px-6 py-4 text-gray-400">
                                                    Bs {product.average_unit_cost?.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-right text-purple-400 font-semibold">
                                                    Bs {product.total_cost?.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Detalle por Lote */}
                    {report.details_by_batch && report.details_by_batch.length > 0 && (
                        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 md:p-8 w-full">
                            <h2 className="text-xl font-bold text-white mb-4">Detalle por Lote</h2>
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left min-w-[1000px]">
                                    <thead>
                                        <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                            <th className="px-6 py-4 font-medium">Producto</th>
                                            <th className="px-6 py-4 font-medium">Lote ID</th>
                                            <th className="px-6 py-4 font-medium">Cantidad</th>
                                            <th className="px-6 py-4 font-medium">Costo Unit.</th>
                                            <th className="px-6 py-4 font-medium text-right">Costo Total</th>
                                            <th className="px-6 py-4 font-medium">Fecha Compra</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm">
                                        {report.details_by_batch.map(batch => (
                                            <tr key={batch.batch_id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-white font-medium">{batch.product_name}</td>
                                                <td className="px-6 py-4 text-gray-400 font-mono text-xs">{batch.batch_id}</td>
                                                <td className="px-6 py-4 text-gray-400">{batch.quantity_available}</td>
                                                <td className="px-6 py-4 text-gray-400">
                                                    Bs {batch.unit_cost?.toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 text-right text-green-400 font-semibold">
                                                    Bs {batch.total_cost?.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                                                    {batch.purchase_date ? new Date(batch.purchase_date).toLocaleDateString('es-ES') : 'N/A'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {!report && !loading && !error && (
                <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-dashed border-white/10 p-12 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500">Selecciona una fecha y consulta para ver el reporte</p>
                </div>
            )}
        </div>
    );
};
