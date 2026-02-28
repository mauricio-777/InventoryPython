import { useState } from 'react';
import { ApiInventoryRepository } from '../Adapters/ApiInventoryRepository.js';

export const useInventoryActions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const receivePurchase = async (data) => {
        setLoading(true);
        try {
            const result = await ApiInventoryRepository.receiveBatch(data);
            setError(null);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const registerSale = async (data) => {
        setLoading(true);
        try {
            const result = await ApiInventoryRepository.registerSale(data);
            setError(null);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchBatches = async (productId) => {
        setLoading(true);
        try {
            const result = await ApiInventoryRepository.getBatchesByProduct(productId);
            setError(null);
            return result;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, receivePurchase, registerSale, fetchBatches };
};
