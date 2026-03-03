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

export const ApiAuditRepository = {
    // Para compatibilidad con existente
    getMovementsByProduct: async (productId) => {
        const response = await axiosInstance.get(`/movements/product/${productId}`);
        return response.data;
    },

    // New audit endpoints
    getAuditLogs: async (filters = {}, skip = 0, limit = 100) => {
        const params = { ...filters, skip, limit };
        const response = await axiosInstance.get(`/audit/logs${buildQueryString(params)}`);
        return response.data;
    },

    getAuditLogDetails: async (logId) => {
        const response = await axiosInstance.get(`/audit/logs/${logId}`);
        return response.data;
    },

    getAuditSummary: async () => {
        const response = await axiosInstance.get('/audit/summary');
        return response.data;
    },

    createAuditLog: async (logData) => {
        const response = await axiosInstance.post('/audit/logs', logData);
        return response.data;
    }
};
