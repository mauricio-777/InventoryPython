import { useState, useCallback } from 'react';
import { axiosInstance } from '../../CommonLayer/config/axios-instance.js';

export function useOrderActions() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchOrders = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const queryStrings = new URLSearchParams(params).toString();
            const response = await axiosInstance.get(`/orders/?${queryStrings}`);
            setOrders(response.data);
            return { success: true, data: response.data };
        } catch (err) {
            console.error('Error fetching orders:', err);
            const msg = err.response?.data?.message || 'Error al cargar pedidos';
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const createOrder = async (orderData) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post('/orders/', orderData);
            return { success: true, data: response.data };
        } catch (err) {
            console.error('Error creating order:', err);
            return { success: false, error: err.message || 'Error al crear pedido' };
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        setLoading(true);
        try {
            const response = await axiosInstance.put(`/orders/${orderId}/status`, { status: newStatus });
            setOrders(prev => prev.map(o => o.id === orderId ? response.data : o));
            return { success: true, data: response.data };
        } catch (err) {
            console.error('Error updating order status:', err);
            return { success: false, error: err.message || 'Error al actualizar estado del pedido' };
        } finally {
            setLoading(false);
        }
    };

    const assignOrder = async (orderId, assignmentData) => {
        // assignmentData = { picker_id: ..., driver_id: ... }
        setLoading(true);
        try {
            const response = await axiosInstance.put(`/orders/${orderId}/assign`, assignmentData);
            setOrders(prev => prev.map(o => o.id === orderId ? response.data : o));
            return { success: true, data: response.data };
        } catch (err) {
            console.error('Error assigning order:', err);
            return { success: false, error: err.message || 'Error al asignar operador al pedido' };
        } finally {
            setLoading(false);
        }
    };

    const pickItem = async (itemId, batchId, quantity) => {
        setLoading(true);
        try {
            const response = await axiosInstance.post(`/orders/items/${itemId}/pick`, {
                batch_id: batchId,
                quantity: quantity
            });
            return { success: true, data: response.data };
        } catch (err) {
            console.error('Error picking item:', err);
            return { success: false, error: err.message || 'Error al recolectar item' };
        } finally {
            setLoading(false);
        }
    };

    return {
        orders,
        loading,
        error,
        fetchOrders,
        createOrder,
        updateOrderStatus,
        assignOrder,
        pickItem
    };
}
