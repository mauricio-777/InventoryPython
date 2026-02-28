import { axiosInstance } from '../../CommonLayer/config/axios-instance.js';

export const ApiAuditRepository = {
    getMovementsByProduct: async (productId) => {
        const response = await axiosInstance.get(`/movements/product/${productId}`);
        return response.data;
    }
};
