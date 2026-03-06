import React, { useEffect } from 'react';
import * as PhosphorIcons from '@phosphor-icons/react';

/**
 * Reusable confirmation modal.
 *
 * Props
 * ─────
 * isOpen       boolean   – controls visibility
 * onClose      () => void – called when user clicks Cancel or overlay
 * onConfirm    () => void – called when user clicks the confirm button
 * title        string    – modal heading
 * message      string|node – body text / content
 * confirmText  string    – label for confirm button  (default: "Confirmar")
 * cancelText   string    – label for cancel button   (default: "Cancelar")
 * variant      'danger'|'primary' – colour of confirm button (default: 'primary')
 * loading      boolean   – disables buttons and shows spinner (default: false)
 */
export const Modal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirmar acción',
    message = '¿Estás seguro de esta acción?',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'primary',
    loading = false,
}) => {
    // Lock body scroll while open
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape' && isOpen) onClose?.(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const confirmStyles = variant === 'danger'
        ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
        : 'bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-[var(--color-quinary)] shadow-[var(--color-primary)]/20 shadow-md border-transparent';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:pl-56 bg-[var(--color-tertiary)]/30 backdrop-blur-sm animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className="relative bg-[var(--color-quinary)] border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] w-full max-w-md p-8 transform transition-all duration-300 scale-100">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <h3 id="modal-title" className="text-xl font-bold text-[var(--color-tertiary)]">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors -mr-2 shrink-0"
                        aria-label="Cerrar"
                    >
                        <PhosphorIcons.X size={20} weight="bold" />
                    </button>
                </div>

                {/* Body */}
                <div className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
                    {message}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-[var(--color-tertiary)] bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border ${confirmStyles}`}
                    >
                        {loading && (
                            <PhosphorIcons.Spinner size={18} className="animate-spin" />
                        )}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
