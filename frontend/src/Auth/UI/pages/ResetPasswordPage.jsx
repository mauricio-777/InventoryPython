import React, { useState } from 'react';
import { usePasswordReset } from '../../Application/usePasswordReset.js';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';

export const ResetPasswordPage = ({ token, onBackToLogin }) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { confirmReset, loading, error, successMessage } = usePasswordReset();
    const [validationError, setValidationError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setValidationError('');

        if (newPassword !== confirmPassword) {
            setValidationError('Las contraseñas no coinciden.');
            return;
        }

        if (newPassword.length < 6) {
            setValidationError('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        try {
            await confirmReset(token, newPassword);
        } catch (err) {
            // Error managed by hook
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden font-sans">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-green-900/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3"></div>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-4 bg-green-500/10 rounded-2xl mb-6 shadow-[0_0_30px_rgba(34,197,94,0.15)] border border-green-500/20">
                        <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-light text-white mb-2 tracking-tight">Nueva <span className="font-bold">Contraseña</span></h1>
                    <p className="text-gray-400 text-sm">El token es válido. Escribe tu nueva contraseña.</p>
                </div>

                <div className="bg-gray-900/40 backdrop-blur-xl p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {(error || validationError) && (
                            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-xl text-center">
                                {validationError || error}
                            </div>
                        )}
                        {successMessage && (
                            <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm p-3 rounded-xl text-center">
                                <p className="font-bold mb-2">{successMessage}</p>
                            </div>
                        )}

                        {!successMessage && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-sm"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">Confirmar Contraseña</label>
                                    <input
                                        type="password"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-sm"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </>
                        )}

                        {successMessage ? (
                            <Button
                                type="button"
                                onClick={onBackToLogin}
                                variant="primary"
                                className="w-full py-3.5 text-base font-medium shadow-green-500/20"
                            >
                                Volver al inicio de sesión
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full py-3.5 text-base font-medium shadow-green-500/20"
                                disabled={loading || !newPassword || !confirmPassword}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        Actualizando...
                                    </span>
                                ) : (
                                    "Guardar Contraseña"
                                )}
                            </Button>
                        )}

                        {!successMessage && (
                            <div className="text-center mt-6">
                                <button
                                    type="button"
                                    onClick={onBackToLogin}
                                    className="text-gray-500 hover:text-white text-xs transition-colors cursor-pointer"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};
