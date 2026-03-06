import React, { useState } from 'react';
import { usePasswordReset } from '../../Application/usePasswordReset.js';
import { Button } from '../../../CommonLayer/components/ui/Button.jsx';
import * as PhosphorIcons from '@phosphor-icons/react';

/**
 * ResetPasswordPage — Página para establecer la nueva contraseña usando un token válido.
 * Sigue el mismo estilo visual que LoginForm y ForgotPasswordPage.
 */
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
            // El error es manejado por el hook
        }
    };

    const displayError = validationError || error;

    return (
        <div className="min-h-screen bg-[var(--color-quaternary)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Fondo decorativo — igual que Login y ForgotPassword */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 -left-1/2 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 -right-1/2 w-96 h-96 bg-[var(--color-secondary)]/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Ícono y título */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-[var(--color-primary)] mb-6 shadow-lg shadow-[var(--color-primary)]/20">
                        <PhosphorIcons.LockKeyOpen size={32} weight="fill" className="text-white" />
                    </div>
                    <h1 className="text-4xl font-bold mb-2 text-[var(--color-tertiary)] tracking-tight">
                        Nueva <span className="font-light text-[var(--color-primary)]">Contraseña</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-sm">
                        {successMessage ? '¡Contraseña actualizada exitosamente!' : 'Ingresa y confirma tu nueva contraseña.'}
                    </p>
                </div>

                {/* Tarjeta de formulario */}
                <div className="bg-[var(--color-quinary)] border border-gray-100 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    {successMessage ? (
                        /* Estado: éxito */
                        <div className="space-y-6">
                            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-4 rounded-2xl text-sm flex items-start gap-3">
                                <PhosphorIcons.CheckCircle size={20} weight="fill" className="shrink-0 text-emerald-500 mt-0.5" />
                                <div>
                                    <p className="font-bold mb-0.5">Contraseña restablecida</p>
                                    <p className="font-medium">{successMessage}</p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="primary"
                                onClick={onBackToLogin}
                                className="w-full py-3.5 rounded-2xl text-sm font-bold shadow-md shadow-[var(--color-primary)]/20"
                            >
                                Ir al inicio de sesión
                            </Button>
                        </div>
                    ) : (
                        /* Estado: formulario */
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Error */}
                            {displayError && (
                                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm flex items-center gap-3">
                                    <PhosphorIcons.WarningCircle size={20} weight="fill" className="shrink-0 text-red-500" />
                                    <span className="font-medium">{displayError}</span>
                                </div>
                            )}

                            {/* Nueva contraseña */}
                            <div>
                                <label className="block text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">
                                    Nueva Contraseña
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <PhosphorIcons.LockKey size={20} weight="fill" />
                                    </span>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="w-full bg-[var(--color-quaternary)]/50 border border-gray-200 text-[var(--color-tertiary)] rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)]/50 transition-all placeholder-gray-400 text-sm font-medium"
                                    />
                                </div>
                            </div>

                            {/* Confirmar contraseña */}
                            <div>
                                <label className="block text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">
                                    Confirmar Contraseña
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <PhosphorIcons.LockKey size={20} weight="fill" />
                                    </span>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full bg-[var(--color-quaternary)]/50 border border-gray-200 text-[var(--color-tertiary)] rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)]/50 transition-all placeholder-gray-400 text-sm font-medium"
                                    />
                                </div>
                            </div>

                            {/* Botón guardar */}
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={loading || !newPassword || !confirmPassword}
                                className="w-full py-3.5 mt-2 rounded-2xl text-sm font-bold shadow-md shadow-[var(--color-primary)]/20"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <PhosphorIcons.Spinner size={20} className="animate-spin" />
                                        Guardando...
                                    </span>
                                ) : (
                                    'Guardar Contraseña'
                                )}
                            </Button>

                            <div className="text-center mt-2">
                                <button
                                    type="button"
                                    onClick={onBackToLogin}
                                    disabled={loading}
                                    className="text-gray-500 hover:text-[var(--color-primary)] text-sm font-medium transition-colors cursor-pointer"
                                >
                                    Volver al inicio de sesión
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
