import React, { useState, useRef, useEffect } from 'react';
import * as PhosphorIcons from '@phosphor-icons/react';

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

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div
                tabIndex={0}
                onKeyDown={handleKeyDown}
                className={`w-full bg-[var(--color-quinary)] border ${isOpen ? 'border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20' : 'border-gray-200 hover:border-gray-300'} text-[var(--color-tertiary)] rounded-2xl px-4 py-3 cursor-pointer transition-all flex items-center justify-between focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/10 focus:border-[var(--color-primary)] ${!selectedOption ? 'text-gray-400 font-medium' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="truncate">{displayValue}</span>
                <PhosphorIcons.CaretDown weight="bold" className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[var(--color-primary)]' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-[var(--color-quinary)] border border-gray-100 rounded-2xl shadow-lg overflow-hidden max-h-60 overflow-y-auto custom-scrollbar animate-fade-in">
                    <ul className="py-1">
                        {(!required || !value) && (
                            <li
                                className="px-4 py-3 text-gray-400 font-medium hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => handleSelect('')}
                            >
                                {placeholder}
                            </li>
                        )}
                        {options.map((opt) => (
                            <li
                                key={opt.value}
                                className={`px-4 py-3 cursor-pointer transition-colors flex justify-between items-center ${value === opt.value
                                    ? 'bg-[var(--color-primary)]/5 text-[var(--color-primary)] font-bold'
                                    : 'text-[var(--color-tertiary)] hover:bg-gray-50'
                                    }`}
                                onClick={() => handleSelect(opt.value)}
                            >
                                <span className="truncate">{opt.label}</span>
                                {value === opt.value && (
                                    <PhosphorIcons.CheckCircle weight="fill" className="w-5 h-5 shrink-0 text-[var(--color-primary)]" />
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
