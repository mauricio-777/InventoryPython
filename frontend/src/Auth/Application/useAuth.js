import { useState, useCallback } from 'react';
import { userApi } from '../Adapters/ApiAuthRepository.js';
import { useUserRole } from '../../CommonLayer/hooks/useUserRole.js';

/**
 * Hook para gestión de usuarios (listado, creación, edición, desactivación).
 * Expone: users, roles, loading, error + acciones CRUD.
 */
export const useUserManager = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { setUserRole, setUserName } = useUserRole();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await userApi.getUsers();
            setUsers(data.users ?? []);
        } catch (err) {
            setError('Error al cargar usuarios: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRoles = useCallback(async () => {
        try {
            const data = await userApi.getRoles();
            setRoles(data.roles ?? []);
        } catch (err) {
            setError('Error al cargar roles: ' + err.message);
        }
    }, []);

    const createUser = useCallback(async (userData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await userApi.createUser(userData);
            await fetchUsers();
            return data;
        } catch (err) {
            const msg = 'Error al crear usuario: ' + err.message;
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    }, [fetchUsers, setUserRole, setUserName]);

    const updateUser = useCallback(async (id, userData) => {
        setLoading(true);
        setError(null);
        try {
            const data = await userApi.updateUser(id, userData);
            await fetchUsers();
            return data;
        } catch (err) {
            const msg = 'Error al actualizar usuario: ' + err.message;
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    }, [fetchUsers]);

    const deactivateUser = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await userApi.deactivateUser(id);
            await fetchUsers();
            return data;
        } catch (err) {
            const msg = 'Error al desactivar usuario: ' + err.message;
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    }, [fetchUsers]);

    const unlockUser = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const data = await userApi.unlockUser(id);
            await fetchUsers();
            return data;
        } catch (err) {
            const msg = 'Error al desbloquear usuario: ' + err.message;
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    }, [fetchUsers]);

    return {
        users,
        roles,
        loading,
        error,
        fetchUsers,
        fetchRoles,
        createUser,
        updateUser,
        deactivateUser,
        unlockUser,
    };
};

/**
 * Hook para manejar el inicio de sesión.
 */
export const useAuthLogin = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { setUserRole, setUserName } = useUserRole();

    const login = useCallback(async (username, password) => {
        setLoading(true);
        setError(null);
        try {
            const data = await userApi.login(username, password);
            if (data.status === 'success' && data.user) {
                setUserName(data.user.username);
                // Asegurarse de usar role_name recibido del backend
                setUserRole(data.user.role_name);
                return data.user;
            }
            throw new Error(data.message || 'Error en login');
        } catch (err) {
            // Priorizar el mensaje del backend (err.response.data.message) sobre
            // el mensaje genérico de Axios (err.message = "Request failed with status..")
            const msg = err.response?.data?.message ?? err.message ?? 'Error de conexión';
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    }, [setUserRole, setUserName]);

    return {
        login,
        loading,
        error
    };
};

/**
 * Hook para gestionar la configuración de límites de intentos de login.
 */
export const useLoginConfig = () => {
    const [limits, setLimits] = useState({ gestor: 5, consultor: 5 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchLimits = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await userApi.getLoginLimits();
            if (data.limits) setLimits(data.limits);
        } catch (err) {
            setError('Error al cargar configuración: ' + err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const saveLimits = useCallback(async (newLimits) => {
        setLoading(true);
        setError(null);
        try {
            const data = await userApi.updateLoginLimits(newLimits);
            if (data.limits) setLimits(prev => ({ ...prev, ...data.limits }));
            return data;
        } catch (err) {
            const msg = 'Error al guardar configuración: ' + err.message;
            setError(msg);
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    return { limits, loading, error, fetchLimits, saveLimits };
};
