import React, { useState, useRef, useEffect } from 'react';

export const CustomSelect = ({ options, value, onChange, placeholder = "Seleccionar...", className = "", required = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Find current selected option label
    const selectedOption = options.find(opt => opt.value === value);
    const displayValue = selectedOption ? selectedOption.label : placeholder;

    // Handle outside click to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange({ target: { value: optionValue } }); // Mock event object for compatibility with onChange handlers
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Si es requerido, añadir input invisible de validación si en HTML5 (simplificado) */}
            <div
                className={`w-full bg-black/40 border ${isOpen ? 'border-green-500 ring-2 ring-green-500/50' : 'border-gray-700/50 hover:border-gray-500'} text-white rounded-xl px-4 py-3 cursor-pointer transition-all flex items-center justify-between ${!selectedOption && 'text-gray-500'}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="truncate">{displayValue}</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-gray-900 border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar animate-fade-in">
                    <ul className="py-1">
                        {(!required || !value) && (
                            <li
                                className="px-4 py-3 text-gray-500 hover:bg-gray-800 cursor-pointer transition-colors"
                                onClick={() => handleSelect('')}
                            >
                                {placeholder}
                            </li>
                        )}
                        {options.map((opt) => (
                            <li
                                key={opt.value}
                                className={`px-4 py-3 cursor-pointer transition-colors flex justify-between items-center ${value === opt.value
                                        ? 'bg-green-500/10 text-green-400 font-medium'
                                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                    }`}
                                onClick={() => handleSelect(opt.value)}
                            >
                                <span className="truncate">{opt.label}</span>
                                {value === opt.value && (
                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
