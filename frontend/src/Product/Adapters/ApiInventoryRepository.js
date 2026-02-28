import { axiosInstance } from '../../CommonLayer/config/axios-instance.js';

export const ApiInventoryRepository = {
    receiveBatch: async (data) => {
        const response = await axiosInstance.post('/batches/receive', data);
        return response.data;
    },
    getBatchesByProduct: async (productId) => {
        const response = await axiosInstance.get(`/batches/product/${productId}`);
        return response.data;
    },
    registerSale: async (data) => {
        const response = await axiosInstance.post('/movements/sale', data);
        return response.data;
    }
};
