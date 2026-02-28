import { getApiClient } from "./authApi";

const apiClient = getApiClient();

export const getAddresses = async () => {
    const response = await apiClient.get('/address');
    return response.data;
};

export const addAddress = async (payload: {
    fullName: string;
    mobile: string;
    street: string;
    city: string;
    pincode: string;
    label?: string;
    village?: string;
    country?: string;
    isDefault?: boolean;
}) => {
    const response = await apiClient.post('/address', payload);
    return response.data;
};

export const updateAddress = async (addressId: string, payload: Partial<{
    fullName: string;
    mobile: string;
    street: string;
    city: string;
    pincode: string;
    label: string;
    village: string;
    country: string;
    isDefault: boolean;
}>) => {
    const response = await apiClient.patch(`/address/${addressId}`, payload);
    return response.data;
};

export const deleteAddress = async (addressId: string) => {
    const response = await apiClient.delete(`/address/${addressId}`);
    return response.data;
};

export const setDefaultAddress = async (addressId: string) => {
    const response = await apiClient.patch(`/address/${addressId}/default`);
    return response.data;
};
