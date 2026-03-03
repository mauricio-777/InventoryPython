import { useState, useEffect, useCallback } from 'react';
import { axiosInstance } from '../config/axios-instance.js';

/**
 * Generic data-fetching hook built on top of axiosInstance.
 *
 * @param {string} url   - API path (e.g. "/api/products")
 * @param {object} [options]
 * @param {boolean} [options.immediate=true] - fetch immediately on mount
 * @param {*}       [options.initialData=null] - initial value for `data`
 *
 * @returns {{ data, loading, error, refetch, reset }}
 *
 * Usage
 * ─────
 * const { data, loading, error, refetch } = useFetch('/api/products');
 */
export const useFetch = (url, { immediate = true, initialData = null } = {}) => {
    const [data, setData] = useState(initialData);
    const [loading, setLoading] = useState(immediate);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!url) return;
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInstance.get(url);
            setData(response.data);
        } catch (err) {
            setError(err?.message || 'Error al obtener los datos.');
        } finally {
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        if (immediate) fetchData();
    }, [fetchData, immediate]);

    const reset = () => {
        setData(initialData);
        setError(null);
        setLoading(false);
    };

    return { data, loading, error, refetch: fetchData, reset };
};
