import { useState, useCallback } from 'react';
import { ApiProductRepository } from '../Adapters/ApiProductRepository.js';

export const useProductActions = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await ApiProductRepository.getAll();
            setProducts(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const createProduct = async (productData) => {
        setLoading(true);
        try {
            const newProduct = await ApiProductRepository.create(productData);
            setProducts(prev => [...prev, newProduct]);
            setError(null);
            return newProduct;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { products, loading, error, fetchProducts, createProduct };
};
