import React, { useState } from 'react';
import { useUserRole } from '../../../CommonLayer/hooks/useUserRole.js';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';

/**
 * LoginForm — Formulario de autenticación simplificado
 * Para esta POC, permite seleccionar rol directamente.
 * En producción, esto se basaría en credenciales y JWT.
 */
export const LoginForm = ({ onLoginSuccess, loading = false }) => {
    const { setUserRole, setUserName } = useUserRole();
    const [form, setForm] = useState({ username: '', role: 'consultor' });
    const [error, setError] = useState('');

    const ROLES = [
        { id: 'admin', label: 'Administrador', color: 'from-purple-500 to-purple-600' },
        { id: 'gestor', label: 'Gestor de Inventario', color: 'from-green-500 to-emerald-600' },
        { id: 'consultor', label: 'Consultor', color: 'from-blue-500 to-cyan-600' },
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!form.username.trim()) {
            setError('El nombre de usuario es requerido.');
            return;
        }

        // Simular autenticación y establecer rol
        setUserName(form.username);
        setUserRole(form.role);
        
        // Notificar al padre del login exitoso
        if (onLoginSuccess) {
            onLoginSuccess({ username: form.username, role: form.role });
        }
    };

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

                        {/* Rol Selection */}
                        <div>
                            <label className="block text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">
                                Selecciona tu rol
                            </label>
                            <div className="space-y-2">
                                {ROLES.map(roleOption => (
                                    <button
                                        key={roleOption.id}
                                        type="button"
                                        onClick={() => handleChange({ target: { name: 'role', value: roleOption.id } })}
                                        className={`w-full p-4 rounded-xl border-2 transition-all text-left font-medium ${
                                            form.role === roleOption.id
                                                ? `border-green-500 bg-gradient-to-r ${roleOption.color} text-white shadow-lg shadow-green-500/30`
                                                : 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>{roleOption.label}</span>
                                            {form.role === roleOption.id && (
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading}
                            className="w-full py-3"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Autenticando...
                                </span>
                            ) : (
                                'Iniciar sesión'
                            )}
                        </Button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-xs text-gray-500 text-center">
                            Para esta POC, selecciona un rol para acceder con permisos específicos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
