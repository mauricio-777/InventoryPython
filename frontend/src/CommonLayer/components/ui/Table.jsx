import React, { useState, useMemo } from 'react';
import * as PhosphorIcons from '@phosphor-icons/react';

/**
 * Generic data table with built-in search filter and pagination.
 *
 * Props
 * ─────
 * columns       Array<{ key, label, render? }>  – column definitions
 * data          Array<object>                   – raw data rows
 * pageSize      number                          – rows per page (default 10)
 * loading       boolean                         – show skeleton rows
 * emptyMessage  string                          – shown when data is empty
 * searchable    boolean                         – show search input (default true)
 * searchPlaceholder string
 *
 * Column definition
 * ─────────────────
 * { key: 'name', label: 'Nombre' }
 * { key: 'price', label: 'Precio', render: (val, row) => `S/ ${val}` }
 */
export const Table = ({
    columns = [],
    data = [],
    pageSize = 10,
    loading = false,
    emptyMessage = 'No hay datos para mostrar.',
    searchable = true,
    searchPlaceholder = 'Buscar...',
}) => {
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);

    // Client-side filter across all string-like values
    const filtered = useMemo(() => {
        if (!query.trim()) return data;
        const q = query.toLowerCase();
        return data.filter(row =>
            columns.some(col => {
                const val = row[col.key];
                return val != null && String(val).toLowerCase().includes(q);
            })
        );
    }, [data, columns, query]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const currentPage = Math.min(page, totalPages);
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handleSearch = (e) => {
        setQuery(e.target.value);
        setPage(1); // reset to first page on new search
    };

    const SKELETON_ROWS = pageSize > 5 ? 5 : pageSize;

    return (
        <div className="flex flex-col gap-6">
            {/* Search bar */}
            {searchable && (
                <div className="relative max-w-md">
                    <PhosphorIcons.MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" weight="bold" />
                    <input
                        type="text"
                        value={query}
                        onChange={handleSearch}
                        placeholder={searchPlaceholder}
                        className="w-full bg-[var(--color-quinary)] border border-gray-200 hover:border-gray-300 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10 text-[var(--color-tertiary)] placeholder-gray-400 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium outline-none transition-all shadow-sm"
                    />
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-3xl border border-gray-100 bg-[var(--color-quinary)] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100 uppercase">
                            {columns.map(col => (
                                <th key={col.key} className="px-6 py-4 font-bold text-gray-400 tracking-wider text-xs whitespace-nowrap">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                                <tr key={i} className="border-b border-gray-50">
                                    {columns.map(col => (
                                        <td key={col.key} className="px-6 py-4">
                                            <div className="h-4 bg-gray-100 rounded animate-pulse" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : paginated.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 font-medium">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <PhosphorIcons.FolderOpen size={48} weight="duotone" className="text-gray-300" />
                                        {emptyMessage}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginated.map((row, rowIdx) => (
                                <tr
                                    key={row.id ?? rowIdx}
                                    className="border-b last:border-0 border-gray-50 hover:bg-gray-50/50 transition-colors duration-150 group"
                                >
                                    {columns.map(col => (
                                        <td key={col.key} className="px-6 py-4 text-[var(--color-tertiary)] font-medium">
                                            {col.render
                                                ? col.render(row[col.key], row)
                                                : (row[col.key] ?? '—')}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
                    <span>
                        Mostrando {paginated.length} de {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
                        {query && ` para "${query}"`}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl border border-gray-200 bg-[var(--color-quinary)] hover:bg-gray-50 hover:text-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <PhosphorIcons.CaretLeft size={18} weight="bold" />
                        </button>
                        <span className="px-3 py-1 font-bold text-[var(--color-tertiary)]">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-xl border border-gray-200 bg-[var(--color-quinary)] hover:bg-gray-50 hover:text-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            <PhosphorIcons.CaretRight size={18} weight="bold" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
