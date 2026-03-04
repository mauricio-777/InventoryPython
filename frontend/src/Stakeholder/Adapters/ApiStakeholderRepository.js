import { axiosInstance } from '../../CommonLayer/config/axios-instance.js';

export const ApiStakeholderRepository = {
    // Customers
    getCustomers: async (skip = 0, limit = 100, query = '') => {
        let url = `/customers/?skip=${skip}&limit=${limit}`;
        if (query) url += `&q=${encodeURIComponent(query)}`;

        const { data } = await axiosInstance.get(url);
        return data;
    },

    getCustomerById: async (id) => {
        const { data } = await axiosInstance.get(`/customers/${id}`);
        return data;
    },

    createCustomer: async (customerData) => {
        try {
            const { data } = await axiosInstance.post(`/customers/`, customerData);
            return data;
        } catch (error) {
            throw new Error(error.message || 'Error al crear cliente');
        }
    },

    updateCustomer: async (id, customerData) => {
        try {
            const { data } = await axiosInstance.put(`/customers/${id}`, customerData);
            return data;
        } catch (error) {
            throw new Error(error.message || 'Error al actualizar cliente');
        }
    },

    deleteCustomer: async (id) => {
        try {
            const { data } = await axiosInstance.delete(`/customers/${id}`);
            return data;
        } catch (error) {
            throw new Error(error.message || 'Error al eliminar cliente');
        }
    },

    // Suppliers
    getSuppliers: async (skip = 0, limit = 100, query = '') => {
        let url = `/suppliers/?skip=${skip}&limit=${limit}`;
        if (query) url += `&q=${encodeURIComponent(query)}`;

        const { data } = await axiosInstance.get(url);
        return data;
    },

    getSupplierById: async (id) => {
        const { data } = await axiosInstance.get(`/suppliers/${id}`);
        return data;
    },

    createSupplier: async (supplierData) => {
        try {
            const { data } = await axiosInstance.post(`/suppliers/`, supplierData);
            return data;
        } catch (error) {
            throw new Error(error.message || 'Error al crear proveedor');
        }
    },

    updateSupplier: async (id, supplierData) => {
        try {
            const { data } = await axiosInstance.put(`/suppliers/${id}`, supplierData);
            return data;
        } catch (error) {
            throw new Error(error.message || 'Error al actualizar proveedor');
        }
    },

    deleteSupplier: async (id) => {
        try {
            const { data } = await axiosInstance.delete(`/suppliers/${id}`);
            return data;
        } catch (error) {
            throw new Error(error.message || 'Error al eliminar proveedor');
        }
    },

    // Unified Search
    searchStakeholders: async (query, type = 'all', limit = 10) => {
        if (!query.trim() && type === 'all') return []; // Don't fetch all for global empty search

        const url = `/stakeholders/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`;
        try {
            const { data } = await axiosInstance.get(url);
            return data;
        } catch (error) {
            throw new Error('Error en búsqueda de stakeholders');
        }
    }
};
