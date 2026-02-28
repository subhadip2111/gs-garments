import { getApiClient } from "./authApi";

const apiClient = getApiClient();

export const getWishlist = async () => {
    const response = await apiClient.get('/wishlist');
    return response.data;
};

export const toggleWishlistApi = async (productId: string) => {
    const response = await apiClient.post('/wishlist/toggle', { productId });
    return response.data;
};
