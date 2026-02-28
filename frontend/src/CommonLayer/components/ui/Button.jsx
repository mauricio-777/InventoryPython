import React from 'react';

export const Button = ({ children, onClick, type = "button", variant = "primary", className = "", disabled = false }) => {
    const baseStyle = "flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:-translate-y-0.5 shadow-lg";

    const variants = {
        primary: "bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-gray-900 shadow-green-500/25 hover:shadow-green-500/40 focus:ring-green-400",
        danger: "bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 hover:text-red-300 shadow-transparent focus:ring-red-500"
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
