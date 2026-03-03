import { axiosInstance } from '../../CommonLayer/config/axios-instance.js';

const buildQueryString = (params) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            query.append(key, value);
        }
    });
    const qs = query.toString();
    return qs ? `?${qs}` : '';
};

export const ApiReportRepository = {
    // Dashboard endpoints
    getDashboard: async (lowStockThreshold = 10) => {
        const response = await axiosInstance.get(`/reports/dashboard${buildQueryString({ low_stock_threshold: lowStockThreshold })}`);
        return response.data;
    },

    getInventoryValue: async () => {
        const response = await axiosInstance.get('/reports/dashboard/inventory-value');
        return response.data;
    },

    getLowStock: async (threshold = 10) => {
        const response = await axiosInstance.get(`/reports/dashboard/low-stock${buildQueryString({ threshold })}`);
        return response.data;
    },

    getRecentMovements: async (limit = 10) => {
        const response = await axiosInstance.get(`/reports/dashboard/recent-movements${buildQueryString({ limit })}`);
        return response.data;
    },

    getRotationSummary: async (days = 30) => {
        const response = await axiosInstance.get(`/reports/dashboard/rotation${buildQueryString({ days })}`);
        return response.data;
    },

    // Valorization report
    getValorizationReport: async (date) => {
        const response = await axiosInstance.get(`/reports/valorization${buildQueryString({ date })}`);
        return response.data;
    },

    exportValorizationReport: async (date, format = 'csv') => {
        const response = await axiosInstance.get(`/reports/valorization/export${buildQueryString({ date, format })}`);
        return response.data;
    },

    // Rotation report
    getRotationReport: async (days = 30, productId = null, category = null) => {
        const params = { days };
        if (productId) params.product_id = productId;
        if (category) params.category = category;
        const response = await axiosInstance.get(`/reports/rotation${buildQueryString(params)}`);
        return response.data;
    },

    // Search movements
    searchMovements: async (filters = {}, skip = 0, limit = 100) => {
        const params = { ...filters, skip, limit };
        const response = await axiosInstance.get(`/reports/movements/search${buildQueryString(params)}`);
        return response.data;
    }
};
