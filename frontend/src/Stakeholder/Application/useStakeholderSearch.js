import { useState, useCallback } from 'react';
import { ApiStakeholderRepository } from '../Adapters/ApiStakeholderRepository.js';

export const useCustomerActions = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCustomers = useCallback(async (query = '') => {
        setLoading(true);
        try {
            const data = await ApiStakeholderRepository.getCustomers(0, 100, query);
            setCustomers(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const createCustomer = async (data) => {
        setLoading(true);
        try {
            const newCustomer = await ApiStakeholderRepository.createCustomer(data);
            setCustomers(prev => [...prev, newCustomer]);
            setError(null);
            return newCustomer;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateCustomer = async (id, data) => {
        setLoading(true);
        try {
            const updated = await ApiStakeholderRepository.updateCustomer(id, data);
            setCustomers(prev => prev.map(c => c.id === id ? updated : c));
            setError(null);
            return updated;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteCustomer = async (id) => {
        setLoading(true);
        try {
            await ApiStakeholderRepository.deleteCustomer(id);
            setCustomers(prev => prev.filter(c => c.id !== id));
            setError(null);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { customers, loading, error, fetchCustomers, createCustomer, updateCustomer, deleteCustomer };
};

export const useSupplierActions = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSuppliers = useCallback(async (query = '') => {
        setLoading(true);
        try {
            const data = await ApiStakeholderRepository.getSuppliers(0, 100, query);
            setSuppliers(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const createSupplier = async (data) => {
        setLoading(true);
        try {
            const newSupplier = await ApiStakeholderRepository.createSupplier(data);
            setSuppliers(prev => [...prev, newSupplier]);
            setError(null);
            return newSupplier;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateSupplier = async (id, data) => {
        setLoading(true);
        try {
            const updated = await ApiStakeholderRepository.updateSupplier(id, data);
            setSuppliers(prev => prev.map(s => s.id === id ? updated : s));
            setError(null);
            return updated;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteSupplier = async (id) => {
        setLoading(true);
        try {
            await ApiStakeholderRepository.deleteSupplier(id);
            setSuppliers(prev => prev.filter(s => s.id !== id));
            setError(null);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { suppliers, loading, error, fetchSuppliers, createSupplier, updateSupplier, deleteSupplier };
};

export const useStakeholderSearch = () => {
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState(null);

    const searchStakeholders = useCallback(async (query, type = 'all', limit = 10) => {
        if (!query.trim() && type === 'all') {
            setResults([]);
            return [];
        }

        setIsSearching(true);
        try {
            const data = await ApiStakeholderRepository.searchStakeholders(query, type, limit);
            setResults(data);
            setSearchError(null);
            return data;
        } catch (err) {
            setSearchError(err.message);
            setResults([]);
            return [];
        } finally {
            setIsSearching(false);
        }
    }, []);

    const clearSearch = useCallback(() => {
        setResults([]);
        setSearchError(null);
    }, []);

    return { results, isSearching, searchError, searchStakeholders, clearSearch };
};
