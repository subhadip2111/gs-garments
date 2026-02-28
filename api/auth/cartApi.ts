import { getApiClient } from "./authApi";

const apiClient = getApiClient();

export const getCart = async () => {
    const response = await apiClient.get('/cart');
    return response.data;
};

export const addToCartApi = async (payload: { productId: string; quantity: number; color: string; size: string }) => {
    const response = await apiClient.post('/cart', payload);
    return response.data;
};

export const updateCartQuantityApi = async (itemId: string, quantity: number) => {
    const response = await apiClient.patch(`/cart/${itemId}`, { quantity });
    return response.data;
};

export const removeFromCartApi = async (itemId: string) => {
    const response = await apiClient.delete(`/cart/${itemId}`);
    return response.data;
};

export const clearCartApi = async () => {
    const response = await apiClient.delete('/cart');
    return response.data;
};
