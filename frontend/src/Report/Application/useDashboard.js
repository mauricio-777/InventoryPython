import { useState } from 'react';
import { ApiReportRepository } from '../Adapters/ApiReportRepository.js';

export const useDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dashboard, setDashboard] = useState(null);

    const fetchDashboard = async (lowStockThreshold = 10) => {
        setLoading(true);
        try {
            const data = await ApiReportRepository.getDashboard(lowStockThreshold);
            setDashboard(data?.data);
            setError(null);
            return data?.data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchInventoryValue = async () => {
        setLoading(true);
        try {
            const data = await ApiReportRepository.getInventoryValue();
            setError(null);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchLowStock = async (threshold = 10) => {
        setLoading(true);
        try {
            const data = await ApiReportRepository.getLowStock(threshold);
            setError(null);
            return data?.products;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentMovements = async (limit = 10) => {
        setLoading(true);
        try {
            const data = await ApiReportRepository.getRecentMovements(limit);
            setError(null);
            return data?.movements;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchRotationSummary = async (days = 30) => {
        setLoading(true);
        try {
            const data = await ApiReportRepository.getRotationSummary(days);
            setError(null);
            return data?.rotation;
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
        dashboard,
        fetchDashboard,
        fetchInventoryValue,
        fetchLowStock,
        fetchRecentMovements,
        fetchRotationSummary
    };
};
