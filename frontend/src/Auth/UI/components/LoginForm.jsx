import React, { useState } from 'react';
import { useAuthLogin } from '../../Application/useAuth.js';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';

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
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Fondo decorativo */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 -left-1/2 w-96 h-96 bg-green-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 -right-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo y título */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 mb-6 shadow-lg shadow-green-500/30">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        Inventory<span className="font-light">App</span>
                    </h1>
                    <p className="text-gray-500 text-sm">Sistema de Gestión de Inventario</p>
                </div>

                {/* Formulario */}
                <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">
                                Usuario
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                placeholder="ej. admin"
                                className="w-full bg-black/40 border border-gray-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all placeholder-gray-600 text-sm"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                className="w-full bg-black/40 border border-gray-700/50 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all placeholder-gray-600 text-sm"
                            />
                        </div>

                        {/* Error message */}
                        {displayError && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl text-sm flex items-center gap-3">
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span>{displayError}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                            className="w-full py-3 mt-4"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Autenticando...
                                </span>
                            ) : (
                                'Iniciar sesión'
                            )}
                        </Button>
                        <div className="text-center mt-4">
                            <button
                                type="button"
                                onClick={onForgotPassword}
                                className="text-gray-400 hover:text-green-400 text-sm transition-colors cursor-pointer"
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
