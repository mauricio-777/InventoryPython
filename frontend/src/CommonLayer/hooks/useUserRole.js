import { useState, useEffect, useCallback } from 'react';

/**
 * Hook para gestionar el rol del usuario en la aplicación.
 * Mantiene el rol en localStorage para que persista entre sesiones.
 */
export const useUserRole = () => {
    const [userRole, setUserRoleState] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('userRole') || 'consultor';
        }
        return 'consultor';
    });

    const [userName, setUserNameState] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('userName') || 'Usuario';
        }
        return 'Usuario';
    });

    const setUserRole = useCallback((role) => {
        setUserRoleState(role);
        localStorage.setItem('userRole', role);
    }, []);

    const setUserName = useCallback((name) => {
        setUserNameState(name);
        localStorage.setItem('userName', name);
    }, []);

    const clearUserData = useCallback(() => {
        setUserRoleState('consultor');
        setUserNameState('Usuario');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');
    }, []);

    const hasRole = useCallback((role) => {
        if (typeof role === 'string') {
            return userRole.toLowerCase() === role.toLowerCase();
        }
        if (Array.isArray(role)) {
            return role.some(r => userRole.toLowerCase() === r.toLowerCase());
        }
        return false;
    }, [userRole]);

    const canAccess = useCallback((allowedRoles) => {
        if (!allowedRoles || allowedRoles.length === 0) return true;
        return hasRole(allowedRoles);
    }, [hasRole]);

    return {
        userRole,
        userName,
        setUserRole,
        setUserName,
        clearUserData,
        hasRole,
        canAccess,
    };
};
