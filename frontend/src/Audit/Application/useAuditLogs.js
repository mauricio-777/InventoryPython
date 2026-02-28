import { useState } from 'react';
import { ApiAuditRepository } from '../Adapters/ApiAuditRepository.js';

export const useAuditLogs = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchMovements = async (productId) => {
        setLoading(true);
        try {
            const data = await ApiAuditRepository.getMovementsByProduct(productId);
            setError(null);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, fetchMovements };
};
