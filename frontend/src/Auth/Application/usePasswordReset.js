import { useState } from 'react';
import { userApi } from '../Adapters/ApiAuthRepository.js';

export const usePasswordReset = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const requestReset = async (username) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const data = await userApi.forgotPassword(username);
            setSuccessMessage(data.message || 'Se ha enviado un enlace si el usuario existe.');
            return data;
        } catch (err) {
            setError(err.response?.data?.message || 'Error al conectar con el servidor.');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const confirmReset = async (token, newPassword) => {
        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        try {
            const data = await userApi.resetPassword(token, newPassword);
            setSuccessMessage(data.message || 'Contraseña restablecida exitosamente.');
            return data;
        } catch (err) {
            setError(err.response?.data?.message || 'Error al restablecer la contraseña.');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        requestReset,
        confirmReset,
        loading,
        error,
        successMessage
    };
};
