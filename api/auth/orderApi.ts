import { getApiClient } from "./authApi";

const apiClient = getApiClient();

// ----- User APIs -----

export const getMyOrders = async () => {
    const response = await apiClient.get('/orders/me');
    return response.data;
};

export const getOrderById = async (orderId: string) => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
};

export const createOrder = async (payload: {
    items: { product: string; quantity: number; selectedSize?: string; selectedColor?: string }[];
    addressId?: string;
    shippingAddress?: {
        fullName: string;
        mobile: string;
        altMobile?: string;
        street: string;
        city: string;
        pincode: string;
        village?: string;
        country?: string;
    };
    paymentMethod?: string;
}) => {
    const response = await apiClient.post('/orders', payload);
    return response.data;
};

export const cancelOrder = async (orderId: string) => {
    const response = await apiClient.patch(`/orders/${orderId}/cancel`);
    return response.data;
};

// ----- Admin APIs -----

export const getAllOrders = async (params?: { status?: string; user?: string }) => {
    const response = await apiClient.get('/orders', { params });
    return response.data;
};

export const getOrderStats = async () => {
    const response = await apiClient.get('/orders/stats');
    return response.data;
};

export const updateOrderStatus = async (orderId: string, payload: { status: string; deliveryDate?: string }) => {
    const response = await apiClient.patch(`/orders/${orderId}`, payload);
    return response.data;
};
