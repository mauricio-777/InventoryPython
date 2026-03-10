import { axiosInstance } from '../../CommonLayer/config/axios-instance.js';

const BASE = '/users';

export const userApi = {
    /** Inicia sesión */
    login: async (username, password) => {
        // As auth endpoints are under /auth not /users
        const { data } = await axiosInstance.post('/auth/login', { username, password });
        return data; // Returns the full payload { status, message, user }
    },

    /** Solicita enlace de restablecimiento de contraseña */
    forgotPassword: async (username) => {
        const { data } = await axiosInstance.post('/auth/forgot-password', { username });
        return data;
    },

    /** Restablece la contraseña con un token válido */
    resetPassword: async (token, newPassword) => {
        const { data } = await axiosInstance.post('/auth/reset-password', { token, new_password: newPassword });
        return data;
    },

    /** Lista todos los usuarios */
    getUsers: async () => {
        const { data } = await axiosInstance.get(`${BASE}/`);
        return data;
    },

    /** Lista los roles disponibles */
    getRoles: async () => {
        const { data } = await axiosInstance.get(`${BASE}/roles`);
        return data;
    },

    /** Crea un nuevo usuario */
    createUser: async (userData) => {
        const { data } = await axiosInstance.post(`${BASE}/`, userData);
        return data;
    },

    /** Actualiza un usuario por ID */
    updateUser: async (id, userData) => {
        const { data } = await axiosInstance.put(`${BASE}/${id}`, userData);
        return data;
    },

    /** Desactiva un usuario por ID */
    deactivateUser: async (id) => {
        const { data } = await axiosInstance.patch(`${BASE}/${id}/deactivate`);
        return data;
    },

    /** Desbloquea un usuario bloqueado por ID */
    unlockUser: async (id) => {
        const { data } = await axiosInstance.patch(`${BASE}/${id}/unlock`);
        return data;
    },

    /** Obtiene los límites de intentos de login por rol */
    getLoginLimits: async () => {
        const { data } = await axiosInstance.get('/config/login-limits');
        return data;
    },

    /** Actualiza los límites de intentos de login por rol */
    updateLoginLimits: async (limits) => {
        const { data } = await axiosInstance.put('/config/login-limits', limits);
        return data;
    },
};

