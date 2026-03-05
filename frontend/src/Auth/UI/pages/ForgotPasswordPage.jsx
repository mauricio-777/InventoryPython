import React, { useState } from 'react';
import { usePasswordReset } from '../../Application/usePasswordReset.js';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';

export const ForgotPasswordPage = ({ onBackToLogin }) => {
    const [username, setUsername] = useState('');
    const { requestReset, loading, error, successMessage } = usePasswordReset();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await requestReset(username);
            // On success, we don't naturally redirect yet, maybe wait for user to read message
        } catch (err) {
            // Error managed by hook
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-quaternary)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Fondo decorativo */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 -left-1/2 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 -right-1/2 w-96 h-96 bg-[var(--color-secondary)]/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo y título */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[var(--color-primary)] mb-6 shadow-lg shadow-[var(--color-primary)]/20">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold mb-2 text-[var(--color-tertiary)] tracking-tight">Recuperar <span className="font-light text-[var(--color-primary)]">Contraseña</span></h1>
                    <p className="text-gray-500 font-medium text-sm">Ingresa tu usuario para recibir un enlace temporal.</p>
                </div>

                {/* Formulario */}
                <div className="bg-[var(--color-quinary)] border border-gray-100 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm flex items-center gap-3">
                                <span className="font-medium">{error}</span>
                            </div>
                        )}
                        {successMessage && (
                            <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-4 py-3 rounded-2xl text-sm text-center">
                                <p className="font-bold mb-1">Enlace generado en consola.</p>
                                <span className="font-medium">{successMessage}</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">
                                Nombre de Usuario
                            </label>
                            <input
                                type="text"
                                className="w-full bg-[var(--color-quaternary)]/50 border border-gray-200 text-[var(--color-tertiary)] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)]/50 transition-all placeholder-gray-400 text-sm font-medium"
                                placeholder="tuusuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-3.5 mt-2 rounded-2xl text-sm font-bold shadow-md shadow-[var(--color-primary)]/20"
                            disabled={loading || !username}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    Procesando...
                                </span>
                            ) : (
                                "Solicitar Restablecimiento"
                            )}
                        </Button>

                        <div className="text-center mt-6">
                            <button
                                type="button"
                                onClick={onBackToLogin}
                                className="text-gray-500 hover:text-[var(--color-primary)] text-sm font-medium transition-colors cursor-pointer"
                            >
                                Volver al inicio de sesión
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
