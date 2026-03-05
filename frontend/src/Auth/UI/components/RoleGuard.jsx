import React from 'react';
import { useUserRole } from '../../../CommonLayer/hooks/useUserRole.js';
import * as PhosphorIcons from '@phosphor-icons/react';

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
                <div className="text-center bg-[var(--color-quinary)] rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-12 max-w-md w-full">
                    <div className="mb-6 flex justify-center">
                        <div className="p-4 bg-red-50 rounded-full border border-red-100 shadow-sm text-red-500">
                            <PhosphorIcons.LockKey size={40} weight="fill" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--color-tertiary)] mb-3">Acceso Denegado</h2>
                    <p className="text-gray-600 font-medium mb-4">
                        Tu rol actual (<span className="font-bold">{userRole}</span>) no tiene permiso para acceder a esta sección.
                    </p>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                            <PhosphorIcons.ShieldStar size={18} />
                            Roles requeridos
                        </p>
                        <p className="text-[var(--color-tertiary)] font-medium mt-1">
                            {allowedRoles.join(', ')}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return children;
};
