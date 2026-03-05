import React, { useState } from 'react';
import { useReports } from '../../Application/useReports.js';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import * as PhosphorIcons from '@phosphor-icons/react';

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
        <div className="animate-fade-in w-full max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="p-3 md:p-4 bg-[var(--color-primary)]/10 rounded-2xl relative border border-[var(--color-primary)]/20 shadow-sm">
                    <PhosphorIcons.ChartLineUp size={32} weight="fill" className="text-[var(--color-primary)]" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-tertiary)] tracking-tight">
                        Reporte de Valorización
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium text-sm md:text-base">FIFO - Costo del inventario a una fecha específica</p>
                </div>
            </div>

            {/* Date Selector */}
            <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 w-full max-w-xl">
                <div>
                    <label className="block text-sm font-bold text-[var(--color-tertiary)] mb-3 flex items-center gap-1.5">
                        <PhosphorIcons.Calendar size={18} className="text-gray-500" />
                        Seleccionar Fecha para Consultar
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="flex-1 px-4 py-3 bg-white text-[var(--color-tertiary)] rounded-2xl border border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all shadow-sm font-medium"
                        />
                        <Button
                            onClick={handleFetchReport}
                            disabled={loading}
                            className="px-8 py-3 w-full sm:w-auto shrink-0 shadow-sm flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <PhosphorIcons.Spinner size={20} className="animate-spin" />
                                    <span>Cargando</span>
                                </>
                            ) : (
                                <>
                                    <PhosphorIcons.MagnifyingGlass size={20} weight="bold" />
                                    <span>Consultar</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-6 py-4 rounded-2xl shadow-sm flex items-center gap-3 font-medium">
                    <PhosphorIcons.WarningCircle size={24} weight="fill" className="shrink-0 text-red-500" />
                    <p>{error}</p>
                </div>
            )}

            {report && (
                <div className="animate-slide-up space-y-8">
                    {/* Export Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={() => handleExport('csv')}
                            disabled={exporting}
                            variant="secondary"
                            className="shrink-0 flex items-center gap-2 shadow-sm font-medium">
                            <PhosphorIcons.DownloadSimple size={20} weight="bold" />
                            Descargar CSV
                        </Button>
                        <Button
                            onClick={() => handleExport('json')}
                            disabled={exporting}
                            variant="secondary"
                            className="shrink-0 flex items-center gap-2 shadow-sm font-medium">
                            <PhosphorIcons.DownloadSimple size={20} weight="bold" />
                            Descargar JSON
                        </Button>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 w-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <PhosphorIcons.Coins size={120} weight="fill" className="text-[var(--color-primary)]" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div>
                                <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <PhosphorIcons.CalendarBlank size={16} />
                                    Fecha del Reporte
                                </p>
                                <h3 className="text-3xl font-black text-[var(--color-tertiary)] tracking-tight">
                                    {new Date(report.date).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </h3>
                            </div>
                            <div>
                                <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <PhosphorIcons.CurrencyCircleDollar size={16} />
                                    Valor Total del Inventario
                                </p>
                                <h3 className="text-4xl font-black text-[var(--color-primary)] tracking-tight">
                                    <span className="text-2xl text-[var(--color-primary)]/60 mr-1.5">Bs</span>
                                    {report.total_value?.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Resumen por Producto */}
                    {report.details_by_product && report.details_by_product.length > 0 && (
                        <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full">
                            <div className="p-6 md:p-8 border-b border-gray-100 bg-[var(--color-quaternary)]/50">
                                <h2 className="text-xl font-bold text-[var(--color-tertiary)] flex items-center gap-2">
                                    <PhosphorIcons.Package size={24} weight="fill" className="text-[var(--color-primary)]" />
                                    Resumen por Producto (FIFO)
                                </h2>
                            </div>
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left min-w-[1000px]">
                                    <thead>
                                        <tr className="bg-white text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                                            <th className="px-6 py-4">Producto</th>
                                            <th className="px-6 py-4">SKU</th>
                                            <th className="px-6 py-4 text-center">Cantidad</th>
                                            <th className="px-6 py-4 text-right">Costo Unit. Promedio</th>
                                            <th className="px-6 py-4 text-right">Costo Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 text-sm">
                                        {report.details_by_product.map(product => (
                                            <tr key={product.product_id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 text-[var(--color-tertiary)] font-bold">{product.product_name}</td>
                                                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{product.product_sku}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gray-100 text-[var(--color-tertiary)] font-bold">
                                                        {product.total_quantity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-600 font-mono">
                                                    {product.average_unit_cost?.toFixed(2)} Bs
                                                </td>
                                                <td className="px-6 py-4 text-right text-[var(--color-tertiary)] font-black text-base">
                                                    {product.total_cost?.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs
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
                        <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full">
                            <div className="p-6 md:p-8 border-b border-gray-100 bg-[var(--color-quaternary)]/50">
                                <h2 className="text-xl font-bold text-[var(--color-tertiary)] flex items-center gap-2">
                                    <PhosphorIcons.Archive size={24} weight="fill" className="text-[var(--color-primary)]" />
                                    Detalle por Lote Activo
                                </h2>
                            </div>
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left min-w-[1000px]">
                                    <thead>
                                        <tr className="bg-white text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                                            <th className="px-6 py-4">Producto</th>
                                            <th className="px-6 py-4">Lote ID</th>
                                            <th className="px-6 py-4">Fecha Compra</th>
                                            <th className="px-6 py-4 text-center">Cantidad</th>
                                            <th className="px-6 py-4 text-right">Costo Unit.</th>
                                            <th className="px-6 py-4 text-right">Costo Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 text-sm">
                                        {report.details_by_batch.map(batch => (
                                            <tr key={batch.batch_id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4 text-[var(--color-tertiary)] font-bold">{batch.product_name}</td>
                                                <td className="px-6 py-4 text-gray-500 font-mono text-xs">{batch.batch_id}</td>
                                                <td className="px-6 py-4 text-gray-500 font-medium whitespace-nowrap">
                                                    {batch.purchase_date ? new Date(batch.purchase_date).toLocaleDateString('es-ES') : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold">
                                                        {batch.quantity_available}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right text-gray-600 font-mono">
                                                    {batch.unit_cost?.toFixed(2)} Bs
                                                </td>
                                                <td className="px-6 py-4 text-right text-[var(--color-tertiary)] font-black">
                                                    {batch.total_cost?.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!report && !loading && !error && (
                <div className="bg-[var(--color-quinary)] rounded-3xl border border-dashed border-gray-200 p-16 text-center flex flex-col items-center justify-center">
                    <div className="bg-gray-50 p-6 rounded-full border border-gray-100 mb-6 shadow-sm">
                        <PhosphorIcons.ChartBar size={64} weight="light" className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-600 mb-2">Ningún Reporte Generado</h3>
                    <p className="text-gray-500 font-medium">Selecciona una fecha y consulta para ver la valorización del inventario.</p>
                </div>
            )}
        </div>
    );
};
