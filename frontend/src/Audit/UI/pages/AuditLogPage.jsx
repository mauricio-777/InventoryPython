import React, { useState, useEffect } from 'react';
import { useAuditLogs } from '../../Application/useAuditLogs.js';
import { CustomSelect } from '../../../CommonLayer/components/ui/CustomSelect.jsx';

export const AuditLogPage = () => {
    const {
        loading,
        error,
        fetchAuditLogs,
        fetchAuditLogDetails,
        fetchAuditSummary
    } = useAuditLogs();

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
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const summaryData = await fetchAuditSummary();
            setSummary(summaryData);
            await handleSearch();
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = async () => {
        try {
            const data = await fetchAuditLogs(filters, pagination.skip, pagination.limit);
            setAuditLogs(data || []);
        } catch (err) {
            console.error(err);
        }
    };

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

    return (
        <div className="animate-fade-in w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 border-b border-white/10 pb-6 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="p-3 md:p-4 bg-orange-500/10 rounded-2xl relative border border-orange-500/20 shadow-inner">
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-light text-white tracking-wide">
                        Pista de <span className="font-bold text-orange-400">Auditoría</span>
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">Supervisar quién cambió qué y cuándo - Integridad de datos</p>
                </div>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6">
                        <p className="text-gray-400 text-sm mb-2">Total de Registros</p>
                        <h3 className="text-3xl font-bold text-blue-400">{summary.total_logs}</h3>
                    </div>
                    <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6">
                        <p className="text-gray-400 text-sm mb-2">Tablas Auditadas</p>
                        <h3 className="text-3xl font-bold text-purple-400">{tableNames.length}</h3>
                    </div>
                    <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6">
                        <p className="text-gray-400 text-sm mb-2">Usuarios Activos</p>
                        <h3 className="text-3xl font-bold text-orange-400">{userNames.length}</h3>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-xl p-6 md:p-8 mb-8">
                <h2 className="text-lg font-bold text-white mb-6">Filtros de Búsqueda</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-3">Fecha Inicio</label>
                        <input
                            type="date"
                            value={filters.start_date}
                            onChange={(e) => handleFilterChange('start_date', e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-3">Fecha Fin</label>
                        <input
                            type="date"
                            value={filters.end_date}
                            onChange={(e) => handleFilterChange('end_date', e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 outline-none"
                        />
                    </div>

                    {/* Table Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-3">Tabla</label>
                        <CustomSelect
                            options={tableOptions}
                            value={filters.table_name}
                            onChange={(e) => handleFilterChange('table_name', e.target.value)}
                            placeholder="Todas las tablas"
                        />
                    </div>

                    {/* User Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-3">Usuario</label>
                        <CustomSelect
                            options={userOptions}
                            value={filters.user_id}
                            onChange={(e) => handleFilterChange('user_id', e.target.value)}
                            placeholder="Todos los usuarios"
                        />
                    </div>

                    {/* Search Button */}
                    <div className="flex items-end">
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="w-full px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded font-medium transition-colors disabled:opacity-50">
                            {loading ? 'Buscando...' : 'Buscar'}
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 w-full">
                    <p>{error}</p>
                </div>
            )}

            {auditLogs.length > 0 && (
                <>
                    {/* Audit Logs Table */}
                    <div className="bg-gray-900/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl overflow-hidden w-full mb-6">
                        <div className="overflow-x-auto w-full custom-scrollbar">
                            <table className="w-full text-left min-w-[1000px]">
                                <thead>
                                    <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-wider">
                                        <th className="px-6 py-4 font-medium">Timestamp</th>
                                        <th className="px-6 py-4 font-medium">Usuario</th>
                                        <th className="px-6 py-4 font-medium">Tabla</th>
                                        <th className="px-6 py-4 font-medium">Acción</th>
                                        <th className="px-6 py-4 font-medium">ID Registro</th>
                                        <th className="px-6 py-4 font-medium">Descripción</th>
                                        <th className="px-6 py-4 font-medium">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {auditLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-white/5 transition-colors duration-200">
                                            <td className="px-6 py-4 text-gray-400 whitespace-nowrap font-mono text-xs">
                                                {new Date(log.timestamp).toLocaleString('es-ES')}
                                            </td>
                                            <td className="px-6 py-4 text-white font-medium">{log.user_name || log.user_id}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                    {log.table_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${
                                                    log.action === 'CREATE' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                    log.action === 'UPDATE' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                    log.action === 'DELETE' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                }`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400 font-mono text-xs">{log.record_id}</td>
                                            <td className="px-6 py-4 text-gray-400 max-w-xs truncate">{log.description || '-'}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleViewDetails(log.id)}
                                                    className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-colors">
                                                    Ver Detalles
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mb-8">
                        <button
                            onClick={handlePrevPage}
                            disabled={pagination.skip === 0}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors disabled:opacity-50">
                            ← Anterior
                        </button>
                        <span className="text-gray-400 text-sm">
                            Página {Math.floor(pagination.skip / pagination.limit) + 1}
                        </span>
                        <button
                            onClick={handleNextPage}
                            disabled={auditLogs.length < pagination.limit}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors disabled:opacity-50">
                            Siguiente →
                        </button>
                    </div>
                </>
            )}

            {auditLogs.length === 0 && !loading && (
                <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-dashed border-white/10 p-12 text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500">No hay registros de auditoría en el período seleccionado</p>
                </div>
            )}

            {/* Details Modal */}
            {showDetails && selectedLogDetails && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <h2 className="text-2xl font-bold text-white">Detalles del Cambio</h2>
                                <button
                                    onClick={handleCloseDetails}
                                    className="text-gray-400 hover:text-white transition-colors">
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="bg-gray-800/40 rounded-lg p-4">
                                    <h3 className="text-sm font-bold text-orange-400 mb-3">Información General</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-400">Acción</p>
                                            <p className="text-white font-medium">{selectedLogDetails.action}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Usuario</p>
                                            <p className="text-white font-medium">{selectedLogDetails.user_name || selectedLogDetails.user_id}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Tabla</p>
                                            <p className="text-white font-medium">{selectedLogDetails.table_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">ID Registro</p>
                                            <p className="text-white font-mono text-xs">{selectedLogDetails.record_id}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-gray-400">Timestamp</p>
                                            <p className="text-white font-mono text-xs">{new Date(selectedLogDetails.timestamp).toLocaleString('es-ES')}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Old Values */}
                                {selectedLogDetails.old_values && (
                                    <div className="bg-gray-800/40 rounded-lg p-4">
                                        <h3 className="text-sm font-bold text-red-400 mb-3">Valores Anteriores</h3>
                                        <pre className="bg-gray-900 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                                            {JSON.stringify(selectedLogDetails.old_values, null, 2)}
                                        </pre>
                                    </div>
                                )}

                                {/* New Values */}
                                {selectedLogDetails.new_values && (
                                    <div className="bg-gray-800/40 rounded-lg p-4">
                                        <h3 className="text-sm font-bold text-green-400 mb-3">Valores Nuevos</h3>
                                        <pre className="bg-gray-900 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                                            {JSON.stringify(selectedLogDetails.new_values, null, 2)}
                                        </pre>
                                    </div>
                                )}

                                {/* Description */}
                                {selectedLogDetails.description && (
                                    <div className="bg-gray-800/40 rounded-lg p-4">
                                        <h3 className="text-sm font-bold text-blue-400 mb-3">Descripción</h3>
                                        <p className="text-gray-300 text-sm">{selectedLogDetails.description}</p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleCloseDetails}
                                className="mt-8 w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded font-medium transition-colors">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
