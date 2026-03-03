import React from 'react';

/**
 * AuthLayout — centered card layout for authentication screens (login, register, etc.)
 *
 * Usage
 * ─────
 * <AuthLayout title="Iniciar sesión" subtitle="Accede a tu cuenta de inventario">
 *   <LoginForm />
 * </AuthLayout>
 */
export const AuthLayout = ({ children, title = 'InventoryApp', subtitle = '' }) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950"
            style={{
                backgroundImage:
                    'radial-gradient(circle at top right, rgba(74,222,128,0.07), transparent 45%), radial-gradient(circle at bottom left, rgba(74,222,128,0.04), transparent 45%)',
            }}
        >
            <div className="w-full max-w-md">
                {/* Branding */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        Inventory<span className="font-light">App</span>
                    </h1>
                    {subtitle && (
                        <p className="mt-2 text-gray-400 text-sm">{subtitle}</p>
                    )}
                </div>

                {/* Card */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
                    {title && title !== 'InventoryApp' && (
                        <h2 className="text-xl font-semibold text-gray-100 mb-6">{title}</h2>
                    )}
                    {children}
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-600 mt-6">
                    © {new Date().getFullYear()} InventoryApp — Sistema de Gestión de Inventario
                </p>
            </div>
        </div>
    );
};
