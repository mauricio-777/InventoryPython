import React, { useState } from 'react';
import { useAuthLogin } from '../../Application/useAuth.js';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import * as PhosphorIcons from '@phosphor-icons/react';

/**
 * LoginForm — Formulario de autenticación real
 * Se conecta al backend para verificar credenciales y obtener el rol.
 */
export const LoginForm = ({ onLoginSuccess, onForgotPassword }) => {
    const { login, loading, error } = useAuthLogin();
    const [form, setForm] = useState({ username: '', password: '' });
    const [validationError, setValidationError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setValidationError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError('');

        if (!form.username.trim() || !form.password) {
            setValidationError('Usuario y contraseña son requeridos.');
            return;
        }

        try {
            const user = await login(form.username, form.password);
            if (onLoginSuccess) {
                onLoginSuccess(user);
            }
        } catch (err) {
            // El error ya es manejado y mostrado por el hook useAuthLogin, 
            // pero podemos hacer catch aquí si necesitamos lógica adicional
        }
    };

    const displayError = validationError || error;

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
                        <PhosphorIcons.Package size={32} weight="fill" className="text-white" />
                    </div>
                    <h1 className="text-4xl font-bold mb-2 text-[var(--color-tertiary)] tracking-tight">
                        Inventory<span className="font-light text-[var(--color-primary)]">App</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-sm">Sistema de Gestión de Inventario</p>
                </div>

                {/* Formulario */}
                <div className="bg-[var(--color-quinary)] border border-gray-100 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">
                                Usuario
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <PhosphorIcons.User size={20} weight="fill" />
                                </span>
                                <input
                                    type="text"
                                    name="username"
                                    value={form.username}
                                    onChange={handleChange}
                                    placeholder="ej. admin"
                                    className="w-full bg-[var(--color-quaternary)]/50 border border-gray-200 text-[var(--color-tertiary)] rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)]/50 transition-all placeholder-gray-400 text-sm font-medium"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">
                                Contraseña
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <PhosphorIcons.LockKey size={20} weight="fill" />
                                </span>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="w-full bg-[var(--color-quaternary)]/50 border border-gray-200 text-[var(--color-tertiary)] rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)]/50 transition-all placeholder-gray-400 text-sm font-medium"
                                />
                            </div>
                        </div>

                        {/* Error message */}
                        {displayError && (
                            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm flex items-center gap-3">
                                <PhosphorIcons.WarningCircle size={20} weight="fill" className="shrink-0 text-red-500" />
                                <span className="font-medium">{displayError}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                            className="w-full py-3.5 mt-2 rounded-2xl text-sm font-bold shadow-md shadow-[var(--color-primary)]/20"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <PhosphorIcons.Spinner size={20} className="animate-spin" />
                                    Autenticando...
                                </span>
                            ) : (
                                'Iniciar sesión'
                            )}
                        </Button>
                        <div className="text-center mt-6">
                            <button
                                type="button"
                                onClick={onForgotPassword}
                                className="text-gray-500 hover:text-[var(--color-primary)] text-sm font-medium transition-colors cursor-pointer"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
