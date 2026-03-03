import { useState } from 'react';
import { ApiAuditRepository } from '../Adapters/ApiAuditRepository.js';

export const useAuditLogs = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Para compatibilidad con existente
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

    const fetchAuditLogs = async (filters = {}, skip = 0, limit = 100) => {
        setLoading(true);
        try {
            const data = await ApiAuditRepository.getAuditLogs(filters, skip, limit);
            setError(null);
            return data?.logs;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchAuditLogDetails = async (logId) => {
        setLoading(true);
        try {
            const data = await ApiAuditRepository.getAuditLogDetails(logId);
            setError(null);
            return data?.log;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchAuditSummary = async () => {
        setLoading(true);
        try {
            const data = await ApiAuditRepository.getAuditSummary();
            setError(null);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        fetchMovements,
        fetchAuditLogs,
        fetchAuditLogDetails,
        fetchAuditSummary
    };
};
