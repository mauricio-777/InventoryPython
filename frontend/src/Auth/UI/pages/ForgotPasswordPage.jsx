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
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Effects matching LoginForm */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-900/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-4 bg-green-500/10 rounded-2xl mb-6 shadow-[0_0_30px_rgba(34,197,94,0.15)] border border-green-500/20">
                        <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-light text-white mb-2 tracking-tight">Recuperar <span className="font-bold">Contraseña</span></h1>
                    <p className="text-gray-400 text-sm">Ingresa tu usuario para recibir un enlace seguro temporal.</p>
                </div>

                <div className="bg-gray-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-xl text-center">
                                {error}
                            </div>
                        )}
                        {successMessage && (
                            <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm p-3 rounded-xl text-center">
                                <p className="font-bold mb-1">Enlace generado en consola.</p>
                                {successMessage}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">Nombre de Usuario</label>
                            <input
                                type="text"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-sm"
                                placeholder="tuusuario"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full py-3.5 text-base font-medium shadow-green-500/20"
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
                                className="text-gray-400 hover:text-green-400 text-sm transition-colors cursor-pointer"
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
