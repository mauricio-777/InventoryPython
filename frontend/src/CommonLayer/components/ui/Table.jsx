import React, { useState, useMemo } from 'react';

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
        <div className="flex flex-col gap-4">
            {/* Search bar */}
            {searchable && (
                <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                    </svg>
                    <input
                        type="text"
                        value={query}
                        onChange={handleSearch}
                        placeholder={searchPlaceholder}
                        className="w-full bg-black/30 border border-gray-700/50 hover:border-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/30 text-gray-200 placeholder-gray-600 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-all"
                    />
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            {columns.map(col => (
                                <th key={col.key} className="px-4 py-3 font-semibold text-gray-400 uppercase tracking-wider text-xs whitespace-nowrap">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                                <tr key={i} className="border-b border-white/5">
                                    {columns.map(col => (
                                        <td key={col.key} className="px-4 py-3">
                                            <div className="h-4 bg-white/5 rounded animate-pulse" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : paginated.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-10 text-center text-gray-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginated.map((row, rowIdx) => (
                                <tr
                                    key={row.id ?? rowIdx}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors duration-150"
                                >
                                    {columns.map(col => (
                                        <td key={col.key} className="px-4 py-3 text-gray-300">
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
                <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>
                        {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
                        {query && ` para "${query}"`}
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            ‹
                        </button>
                        <span className="px-2">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            ›
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
