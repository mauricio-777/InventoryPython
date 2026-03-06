import React, { createContext, useContext, useState, useCallback } from 'react';
import * as PhosphorIcons from '@phosphor-icons/react';

const ToastContext = createContext(null);

/**
 * Hook para mostrar notificaciones toast desde cualquier componente.
 * Uso: const { showToast } = useToast();
 *      showToast('Guardado exitosamente', 'success');
 */
export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
    return ctx;
};

/** Ícono y colores según tipo */
const TOAST_CONFIG = {
    success: {
        icon: PhosphorIcons.CheckCircle,
        bg: 'bg-emerald-50 border-emerald-200',
        icon_color: 'text-emerald-500',
        text: 'text-emerald-800',
    },
    error: {
        icon: PhosphorIcons.XCircle,
        bg: 'bg-red-50 border-red-200',
        icon_color: 'text-red-500',
        text: 'text-red-800',
    },
    warning: {
        icon: PhosphorIcons.Warning,
        bg: 'bg-amber-50 border-amber-200',
        icon_color: 'text-amber-500',
        text: 'text-amber-800',
    },
    info: {
        icon: PhosphorIcons.Info,
        bg: 'bg-blue-50 border-blue-200',
        icon_color: 'text-blue-500',
        text: 'text-blue-800',
    },
};

/** Componente individual de toast */
const ToastItem = ({ id, message, type, onClose }) => {
    const config = TOAST_CONFIG[type] || TOAST_CONFIG.info;
    const Icon = config.icon;

    return (
        <div
            className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-lg ${config.bg} animate-slide-up max-w-sm w-full`}
            role="alert"
        >
            <Icon size={20} weight="fill" className={`${config.icon_color} shrink-0 mt-0.5`} />
            <p className={`text-sm font-medium flex-1 leading-snug ${config.text}`}>{message}</p>
            <button
                onClick={() => onClose(id)}
                className="text-gray-400 hover:text-gray-600 transition-colors ml-1 shrink-0"
            >
                <PhosphorIcons.X size={16} weight="bold" />
            </button>
        </div>
    );
};

/** Proveedor que envuelve la app y renderiza los toasts en un portal fijo */
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Portal de toasts — esquina inferior derecha */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem
                            id={t.id}
                            message={t.message}
                            type={t.type}
                            onClose={removeToast}
                        />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
