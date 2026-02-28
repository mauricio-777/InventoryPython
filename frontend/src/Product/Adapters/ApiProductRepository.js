import { axiosInstance } from '../../CommonLayer/config/axios-instance.js';

export const ApiProductRepository = {
    getAll: async () => {
        const response = await axiosInstance.get('/products/');
        return response.data;
    },
    getById: async (id) => {
        const response = await axiosInstance.get(`/products/${id}`);
        return response.data;
    },
    create: async (productData) => {
        const response = await axiosInstance.post('/products/', productData);
        return response.data;
    }
};
