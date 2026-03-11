import React, { useState, useEffect, useCallback } from 'react';
import { useAuditLogs } from '../../Application/useAuditLogs.js';
import { useUserManager } from '../../../Auth/Application/useAuth.js';
import { CustomSelect } from '../../../CommonLayer/components/ui/CustomSelect.jsx';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import * as PhosphorIcons from '@phosphor-icons/react';

const ACCION_LABEL = {
    'CREATE': 'Crear',
    'UPDATE': 'Actualizar',
    'DELETE': 'Eliminar',
};

const ACCION_STYLE = {
    'CREATE': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'UPDATE': 'bg-blue-50 text-blue-600 border-blue-100',
    'DELETE': 'bg-red-50 text-red-600 border-red-100',
};

export const AuditLogPage = () => {
    const {
        loading,
        error,
        fetchAuditLogs,
        fetchAuditLogDetails,
        fetchAuditSummary
    } = useAuditLogs();

    const { users, fetchUsers } = useUserManager();

    const [auditLogs, setAuditLogs] = useState([]);
    const [summary, setSummary] = useState(null);
    const [filters, setFilters] = useState({
        user_id: '',
        table_name: '',
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
    });
    const [selectedLogId, setSelectedLogId] = useState(null);
    const [selectedLogDetails, setSelectedLogDetails] = useState(null);
    const [pagination, setPagination] = useState({ skip: 0, limit: 50 });
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        fetchUsers();
        loadInitialData();
        // eslint-disable-next-line
    }, []);

    const loadInitialData = async () => {
        try {
            const summaryData = await fetchAuditSummary();
            setSummary(summaryData);
            // Pass the current filters directly (avoids stale closure)
            const initialFilters = {
                user_id: '',
                table_name: '',
                start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                end_date: new Date().toISOString().split('T')[0]
            };
            const data = await fetchAuditLogs(initialFilters, 0, 50);
            setAuditLogs(data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = useCallback(async () => {
        try {
            const data = await fetchAuditLogs(filters, pagination.skip, pagination.limit);
            setAuditLogs(data || []);
        } catch (err) {
            console.error(err);
        }
    }, [filters, pagination, fetchAuditLogs]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setPagination({ skip: 0, limit: 50 });
    };

    const handleViewDetails = async (logId) => {
        try {
            const details = await fetchAuditLogDetails(logId);
            setSelectedLogDetails(details);
            setSelectedLogId(logId);
            setShowDetails(true);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCloseDetails = () => {
        setShowDetails(false);
        setSelectedLogDetails(null);
        setSelectedLogId(null);
    };

    const handlePrevPage = () => {
        if (pagination.skip > 0) {
            setPagination(prev => ({
                ...prev,
                skip: prev.skip - prev.limit
            }));
        }
    };

    const handleNextPage = () => {
        setPagination(prev => ({
            ...prev,
            skip: prev.skip + prev.limit
        }));
    };

    const tableNames = summary?.by_table ? Object.keys(summary.by_table) : [];
    const tableOptions = tableNames.map(table => ({
        value: table,
        label: `${table} (${summary.by_table[table]})`
    }));

    const userNames = summary?.by_user ? Object.keys(summary.by_user) : [];
    const userOptions = userNames.map(user => ({
        value: user,
        label: `${user} (${summary.by_user[user]})`
    }));

    const inputClasses = "w-full px-4 py-3 bg-white text-[var(--color-tertiary)] rounded-2xl border border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 outline-none transition-all shadow-sm font-medium";
    const labelClasses = "block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider text-xs flex items-center gap-1.5";

    return (
        <div className="animate-fade-in w-full max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="p-3 md:p-4 bg-[var(--color-primary)]/10 rounded-2xl relative border border-[var(--color-primary)]/20 shadow-sm">
                    <PhosphorIcons.ShieldCheck size={32} weight="fill" className="text-[var(--color-primary)]" />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-tertiary)] tracking-tight">
                        Pista de <span className="text-[var(--color-primary)]">Auditoría</span>
                    </h1>
                    <p className="text-gray-500 mt-1 font-medium text-sm md:text-base">Supervisar quién cambió qué y cuándo - Integridad de datos</p>
                </div>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--color-primary)]/5 rounded-full blur-xl group-hover:bg-[var(--color-primary)]/10 transition-colors"></div>
                        <div className="w-12 h-12 bg-[var(--color-primary)]/10 rounded-2xl flex items-center justify-center mb-4 text-[var(--color-primary)] shadow-sm">
                            <PhosphorIcons.Database size={24} weight="fill" />
                        </div>
                        <h3 className="text-4xl font-black text-[var(--color-tertiary)] tracking-tight mb-1">{summary.total_logs}</h3>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total de Registros</p>
                    </div>
                    <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10 transition-colors"></div>
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 text-purple-600 border border-purple-100 shadow-sm">
                            <PhosphorIcons.Table size={24} weight="fill" />
                        </div>
                        <h3 className="text-4xl font-black text-[var(--color-tertiary)] tracking-tight mb-1">{tableNames.length}</h3>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Tablas Auditadas</p>
                    </div>
                    <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-colors"></div>
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 text-amber-600 border border-amber-100 shadow-sm">
                            <PhosphorIcons.Users size={24} weight="fill" />
                        </div>
                        <h3 className="text-4xl font-black text-[var(--color-tertiary)] tracking-tight mb-1">{userNames.length}</h3>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Usuarios Activos</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8 w-full">
                <h2 className="text-xl font-bold text-[var(--color-tertiary)] flex items-center gap-2 mb-6">
                    <PhosphorIcons.Faders size={24} weight="fill" className="text-[var(--color-primary)]" />
                    Filtros de Búsqueda
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {/* Date Range */}
                    <div>
                        <label className={labelClasses}>
                            <PhosphorIcons.Calendar size={16} />
                            Fecha Inicio
                        </label>
                        <input
                            type="date"
                            value={filters.start_date}
                            onChange={(e) => handleFilterChange('start_date', e.target.value)}
                            className={inputClasses}
                        />
                    </div>

                    <div>
                        <label className={labelClasses}>
                            <PhosphorIcons.Calendar size={16} />
                            Fecha Fin
                        </label>
                        <input
                            type="date"
                            value={filters.end_date}
                            onChange={(e) => handleFilterChange('end_date', e.target.value)}
                            className={inputClasses}
                        />
                    </div>

                    {/* Table Filter */}
                    <div>
                        <label className={labelClasses}>
                            <PhosphorIcons.Table size={16} />
                            Tabla
                        </label>
                        <CustomSelect
                            options={tableOptions}
                            value={filters.table_name}
                            onChange={(e) => handleFilterChange('table_name', e.target.value)}
                            placeholder="Todas las tablas"
                        />
                    </div>

                    {/* User Filter */}
                    <div>
                        <label className={labelClasses}>
                            <PhosphorIcons.User size={16} />
                            Usuario
                        </label>
                        <CustomSelect
                            options={userOptions}
                            value={filters.user_id}
                            onChange={(e) => handleFilterChange('user_id', e.target.value)}
                            placeholder="Todos los usuarios"
                        />
                    </div>

                    {/* Search Button */}
                    <div className="flex items-end">
                        <Button
                            onClick={handleSearch}
                            disabled={loading}
                            className="w-full py-3 shadow-sm flex items-center justify-center gap-2">
                            {loading ? (
                                <>
                                    <PhosphorIcons.Spinner size={20} className="animate-spin" />
                                    <span>Buscando...</span>
                                </>
                            ) : (
                                <>
                                    <PhosphorIcons.MagnifyingGlass size={20} weight="bold" />
                                    <span>Buscar</span>
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

            {auditLogs.length > 0 && (
                <div className="animate-slide-up space-y-6">
                    {/* Audit Logs Table */}
                    <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden w-full">
                        <div className="overflow-x-auto w-full custom-scrollbar">
                            <table className="w-full text-left min-w-[1000px]">
                                <thead>
                                    <tr className="bg-[var(--color-quaternary)]/50 text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-100">
                                        <th className="px-6 py-4">Fecha / Hora</th>
                                        <th className="px-6 py-4">Usuario</th>
                                        <th className="px-6 py-4">Tabla</th>
                                        <th className="px-6 py-4 text-center">Acción</th>
                                        <th className="px-6 py-4">ID Registro</th>
                                        <th className="px-6 py-4">Descripción</th>
                                        <th className="px-6 py-4 text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    {auditLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap font-medium text-xs tracking-wide">
                                                {new Date(log.timestamp).toLocaleString('es-ES')}
                                            </td>
                                            <td className="px-6 py-4 text-[var(--color-tertiary)] font-bold">{log.user_name || log.user_id}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100 shadow-sm flex items-center gap-1.5 w-max">
                                                    <PhosphorIcons.Table size={14} weight="bold" />
                                                    {log.table_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm w-max ${ACCION_STYLE[log.action] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                                    {log.action === 'CREATE' ? <PhosphorIcons.PlusCircle weight="bold" /> :
                                                        log.action === 'UPDATE' ? <PhosphorIcons.PencilSimple weight="bold" /> :
                                                            log.action === 'DELETE' ? <PhosphorIcons.Trash weight="bold" /> :
                                                                <PhosphorIcons.Info weight="bold" />}
                                                    {ACCION_LABEL[log.action] || log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">{log.record_id}</td>
                                            <td className="px-6 py-4 text-gray-500 max-w-xs truncate font-medium">{log.description || '-'}</td>
                                            <td className="px-6 py-4 text-center">
                                                <Button
                                                    onClick={() => handleViewDetails(log.id)}
                                                    variant="secondary"
                                                    className="px-3 py-1.5 text-xs flex items-center justify-center gap-1 mx-auto">
                                                    <PhosphorIcons.Eye weight="bold" />
                                                    Ver
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                        <Button
                            onClick={handlePrevPage}
                            disabled={pagination.skip === 0}
                            variant="secondary"
                            className="px-5 py-2 flex items-center gap-2">
                            <PhosphorIcons.CaretLeft weight="bold" />
                            Anterior
                        </Button>
                        <span className="text-gray-600 font-bold text-sm bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                            Página {Math.floor(pagination.skip / pagination.limit) + 1}
                        </span>
                        <Button
                            onClick={handleNextPage}
                            disabled={auditLogs.length < pagination.limit}
                            variant="secondary"
                            className="px-5 py-2 flex items-center gap-2">
                            Siguiente
                            <PhosphorIcons.CaretRight weight="bold" />
                        </Button>
                    </div>
                </div>
            )}

            {auditLogs.length === 0 && !loading && !error && (
                <div className="bg-[var(--color-quinary)] rounded-3xl border border-dashed border-gray-200 p-16 text-center flex flex-col items-center justify-center">
                    <div className="bg-gray-50 p-6 rounded-full border border-gray-100 mb-6 shadow-sm">
                        <PhosphorIcons.ShieldCheck size={64} weight="light" className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-600 mb-2">Sin Registros de Auditoría</h3>
                    <p className="text-gray-500 font-medium">No hay registros de auditoría en el período seleccionado.</p>
                </div>
            )}

            {/* Details Modal */}
            {showDetails && selectedLogDetails && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:pl-56 animate-fade-in">
                    <div className="bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                <h2 className="text-2xl font-bold text-[var(--color-tertiary)] flex items-center gap-3">
                                    <div className="p-2 bg-[var(--color-primary)]/10 rounded-xl text-[var(--color-primary)]">
                                        <PhosphorIcons.ListMagnifyingGlass size={24} weight="fill" />
                                    </div>
                                    Detalles del Cambio
                                </h2>
                                <button
                                    onClick={handleCloseDetails}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                                    <PhosphorIcons.X size={24} weight="bold" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="bg-[var(--color-quaternary)]/50 rounded-2xl p-6 border border-gray-100">
                                    <h3 className="text-sm font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2">
                                        <PhosphorIcons.Info size={18} weight="fill" />
                                        Información General
                                    </h3>
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                                        <div>
                                            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">Acción</p>
                                            <p className="font-medium text-[var(--color-tertiary)] flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${selectedLogDetails.action === 'CREATE' ? 'bg-emerald-500' :
                                                    selectedLogDetails.action === 'UPDATE' ? 'bg-amber-500' :
                                                        selectedLogDetails.action === 'DELETE' ? 'bg-red-500' : 'bg-gray-500'
                                                    }`}></span>
                                                {selectedLogDetails.action}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">Usuario</p>
                                            <p className="font-medium text-[var(--color-tertiary)] flex items-center gap-1.5">
                                                <PhosphorIcons.User size={16} className="text-gray-400" />
                                                {selectedLogDetails.user_name || selectedLogDetails.user_id}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">Tabla</p>
                                            <p className="font-medium text-[var(--color-tertiary)] flex items-center gap-1.5">
                                                <PhosphorIcons.Table size={16} className="text-gray-400" />
                                                {selectedLogDetails.table_name}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">ID Registro</p>
                                            <p className="font-mono text-gray-600 font-medium bg-white px-2 py-0.5 rounded border border-gray-200 w-max">{selectedLogDetails.record_id}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">Timestamp</p>
                                            <p className="text-gray-600 font-medium flex items-center gap-1.5">
                                                <PhosphorIcons.Clock size={16} className="text-gray-400" />
                                                {new Date(selectedLogDetails.timestamp).toLocaleString('es-ES')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Old Values */}
                                    {selectedLogDetails.old_values && (
                                        <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100 flex flex-col h-full">
                                            <h3 className="text-sm font-bold text-red-600 mb-3 flex items-center gap-2">
                                                <PhosphorIcons.MinusCircle size={18} weight="fill" />
                                                Valores Anteriores
                                            </h3>
                                            <pre className="bg-white p-4 rounded-xl border border-red-100 text-xs text-gray-700 overflow-x-auto flex-1 shadow-inner font-mono">
                                                {JSON.stringify(selectedLogDetails.old_values, null, 2)}
                                            </pre>
                                        </div>
                                    )}

                                    {/* New Values */}
                                    {selectedLogDetails.new_values && (
                                        <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100 flex flex-col h-full">
                                            <h3 className="text-sm font-bold text-emerald-600 mb-3 flex items-center gap-2">
                                                <PhosphorIcons.PlusCircle size={18} weight="fill" />
                                                Valores Nuevos
                                            </h3>
                                            <pre className="bg-white p-4 rounded-xl border border-emerald-100 text-xs text-gray-700 overflow-x-auto flex-1 shadow-inner font-mono">
                                                {JSON.stringify(selectedLogDetails.new_values, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                {selectedLogDetails.description && (
                                    <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                                        <h3 className="text-sm font-bold text-blue-600 mb-2 flex items-center gap-2">
                                            <PhosphorIcons.TextAa size={18} weight="fill" />
                                            Descripción
                                        </h3>
                                        <p className="text-gray-700 font-medium text-sm leading-relaxed">{selectedLogDetails.description}</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-100">
                                <Button
                                    onClick={handleCloseDetails}
                                    variant="secondary"
                                    className="w-full py-3 justify-center">
                                    Cerrar Detalles
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
