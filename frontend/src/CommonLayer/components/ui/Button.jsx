import React from 'react';

export const Button = ({ children, onClick, type = "button", variant = "primary", className = "", disabled = false }) => {
    const baseStyle = "flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:-translate-y-0.5 shadow-sm";

    const variants = {
        primary: "bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-[var(--color-quinary)] shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/30 focus:ring-[var(--color-primary)]",
        secondary: "bg-[var(--color-quaternary)] hover:bg-gray-200 text-[var(--color-tertiary)] border border-gray-200 focus:ring-gray-300",
        danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 focus:ring-red-500"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`}
        >
            {children}
        </button>
    );
};

