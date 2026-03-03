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
            // Si se crea el usuario actual, actualizar el contexto
            if (data.user) {
                setUserName(data.user.username);
                setUserRole(data.user.role_name);
            }
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
    };
};
