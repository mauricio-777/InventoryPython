import React from 'react';
import { useUserRole } from '../../../CommonLayer/hooks/useUserRole.js';

/**
 * RoleGuard — Componente para proteger vistas según el rol del usuario
 *
 * Uso:
 * <RoleGuard allowedRoles={['admin']}>
 *     <AdminPanel />
 * </RoleGuard>
 *
 * Si el usuario no tiene permisos, mostrará un mensaje de acceso denegado.
 */
export const RoleGuard = ({ allowedRoles = [], children, fallback = null }) => {
    const { userRole } = useUserRole();

    // Si no hay restricciones de roles, mostrar contenido
    if (!allowedRoles || allowedRoles.length === 0) {
        return children;
    }

    // Verificar si el rol actual está en los roles permitidos
    const hasAccess = allowedRoles.some(role => 
        role.toLowerCase() === userRole.toLowerCase()
    );

    if (!hasAccess) {
        return fallback || (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="mb-4 flex justify-center">
                        <div className="p-4 bg-red-500/10 rounded-full border border-red-500/30">
                            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold text-white mb-2">Acceso Denegado</h2>
                    <p className="text-gray-400 text-sm">
                        Tu rol actual ({userRole}) no tiene permiso para acceder a esta sección.
                    </p>
                    <p className="text-gray-500 text-xs mt-3">
                        Se requieren los siguientes roles: {allowedRoles.join(', ')}
                    </p>
                </div>
            </div>
        );
    }

    return children;
};
