const API_BASE_URL = 'http://localhost:8000/api/v1';

export const ApiStakeholderRepository = {
    // Customers
    getCustomers: async (skip = 0, limit = 100, query = '') => {
        let url = `${API_BASE_URL}/customers/?skip=${skip}&limit=${limit}`;
        if (query) url += `&q=${encodeURIComponent(query)}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al obtener clientes');
        return await response.json();
    },

    getCustomerById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/customers/${id}`);
        if (!response.ok) throw new Error('Cliente no encontrado');
        return await response.json();
    },

    createCustomer: async (customerData) => {
        const response = await fetch(`${API_BASE_URL}/customers/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al crear cliente');
        return data;
    },

    updateCustomer: async (id, customerData) => {
        const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al actualizar cliente');
        return data;
    },

    deleteCustomer: async (id) => {
        const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al eliminar cliente');
        return data;
    },

    // Suppliers
    getSuppliers: async (skip = 0, limit = 100, query = '') => {
        let url = `${API_BASE_URL}/suppliers/?skip=${skip}&limit=${limit}`;
        if (query) url += `&q=${encodeURIComponent(query)}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al obtener proveedores');
        return await response.json();
    },

    getSupplierById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/suppliers/${id}`);
        if (!response.ok) throw new Error('Proveedor no encontrado');
        return await response.json();
    },

    createSupplier: async (supplierData) => {
        const response = await fetch(`${API_BASE_URL}/suppliers/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(supplierData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al crear proveedor');
        return data;
    },

    updateSupplier: async (id, supplierData) => {
        const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(supplierData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al actualizar proveedor');
        return data;
    },

    deleteSupplier: async (id) => {
        const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Error al eliminar proveedor');
        return data;
    },

    // Unified Search
    searchStakeholders: async (query, type = 'all', limit = 10) => {
        if (!query.trim() && type === 'all') return []; // Don't fetch all for global empty search

        const url = `${API_BASE_URL}/stakeholders/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error en búsqueda de stakeholders');
        return await response.json();
    }
};
