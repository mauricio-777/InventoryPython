import React, { useEffect } from 'react';

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
        ? 'bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 hover:text-red-300'
        : 'bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-400 hover:to-emerald-300 text-gray-900';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div className="relative bg-gray-900/95 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all duration-200 scale-100">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <h3 id="modal-title" className="text-lg font-semibold text-gray-100">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-300 transition-colors ml-4 shrink-0"
                        aria-label="Cerrar"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="text-gray-400 text-sm leading-relaxed mb-6">
                    {message}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-gray-200 border border-white/10 hover:border-white/20 rounded-xl transition-all duration-200 disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${confirmStyles}`}
                    >
                        {loading && (
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        )}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
