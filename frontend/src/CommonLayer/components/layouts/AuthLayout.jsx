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
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-quaternary)] relative overflow-hidden"
        >
            {/* Decals background */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--color-secondary)]/10 rounded-full blur-[120px] pointer-events-none translate-y-1/3 -translate-x-1/4"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Branding */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-[var(--color-tertiary)] tracking-tight">
                        Inventory<span className="font-light text-[var(--color-primary)]">App</span>
                    </h1>
                    {subtitle && (
                        <p className="mt-2 text-gray-500 text-sm font-medium">{subtitle}</p>
                    )}
                </div>

                {/* Card */}
                <div className="bg-[var(--color-quinary)] border border-gray-100/50 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 md:p-10">
                    {title && title !== 'InventoryApp' && (
                        <h2 className="text-2xl font-bold text-[var(--color-tertiary)] mb-6 text-center">{title}</h2>
                    )}
                    {children}
                </div>

                {/* Footer */}
                <p className="text-center text-xs font-medium text-gray-400 mt-8">
                    © {new Date().getFullYear()} InventoryApp — Sistema de Gestión
                </p>
            </div>
        </div>
    );
};

