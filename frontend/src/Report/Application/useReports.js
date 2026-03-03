import { useState } from 'react';
import { ApiReportRepository } from '../Adapters/ApiReportRepository.js';

export const useReports = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchValorizationReport = async (date) => {
        setLoading(true);
        try {
            const data = await ApiReportRepository.getValorizationReport(date);
            setError(null);
            return data?.report;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const exportValorizationReport = async (date, format = 'csv') => {
        setLoading(true);
        try {
            const data = await ApiReportRepository.exportValorizationReport(date, format);
            setError(null);
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchRotationReport = async (days = 30, productId = null, category = null) => {
        setLoading(true);
        try {
            const data = await ApiReportRepository.getRotationReport(days, productId, category);
            setError(null);
            return data?.products;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const searchMovements = async (filters = {}, skip = 0, limit = 100) => {
        setLoading(true);
        try {
            const data = await ApiReportRepository.searchMovements(filters, skip, limit);
            setError(null);
            return data?.movements;
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
        fetchValorizationReport,
        exportValorizationReport,
        fetchRotationReport,
        searchMovements
    };
};
