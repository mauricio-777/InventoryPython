import React, { useState, useEffect, useRef } from 'react';
import { useStakeholderSearch } from '../../Application/useStakeholderSearch.js';

export const StakeholderSearchBar = ({
    type = 'all', // 'all', 'customer', 'supplier'
    onSelect,
    placeholder = "Buscar por nombre o documento...",
    className = "",
    required = false
}) => {
    const { results, isSearching, searchStakeholders, clearSearch } = useStakeholderSearch();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const wrapperRef = useRef(null);
    const debounceTimer = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        setSelectedItem(null); // Clear selection when typing
        onSelect(null);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (val.trim()) {
            setIsOpen(true);
            debounceTimer.current = setTimeout(() => {
                searchStakeholders(val, type, 5);
            }, 300);
        } else {
            clearSearch();
            setIsOpen(false);
        }
    };

    const handleSelect = (item) => {
        setQuery(`${item.nombre} - ${item.numero_documento}`);
        setSelectedItem(item);
        setIsOpen(false);
        onSelect(item.id);
    };

    const clearSelection = () => {
        setQuery('');
        setSelectedItem(null);
        onSelect(null);
        clearSearch();
    };

    const Badge = ({ t }) => {
        if (t === 'customer') {
            return <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">CLIENTE</span>;
        }
        return <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/20 text-green-400 border border-green-500/30">PROVEEDOR</span>;
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <div className="relative flex items-center">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>

                <input
                    type="text"
                    className="w-full bg-black/40 border border-gray-700/50 text-white rounded-xl pl-11 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all placeholder-gray-600 shadow-inner"
                    placeholder={placeholder}
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => { if (query.trim() && !selectedItem) setIsOpen(true); }}
                    required={required && !selectedItem}
                />

                {query && (
                    <button
                        type="button"
                        onClick={clearSelection}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                )}
            </div>

            {/* Dropdown Results */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                    {isSearching ? (
                        <div className="p-4 flex items-center justify-center text-gray-400 text-sm gap-2">
                            <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                            Buscando...
                        </div>
                    ) : results.length > 0 ? (
                        <ul className="divide-y divide-white/5">
                            {results.map(item => (
                                <li
                                    key={item.id}
                                    className="p-3 hover:bg-white/5 cursor-pointer transition-colors"
                                    onClick={() => handleSelect(item)}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-200">{item.nombre}</span>
                                            {(type === 'all') && <Badge t={item.type} />}
                                        </div>
                                        <span className="text-sm font-mono text-gray-500">{item.tipo_documento}: {item.numero_documento}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-4 text-center text-sm text-gray-500">
                            No se encontraron resultados
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
