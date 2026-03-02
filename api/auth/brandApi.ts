import { store } from "@/store";
import axios from "axios";
import { getApiClient } from "./authApi";
import { logout, setToken } from "@/store/authSlice";

const apiClient = getApiClient();

apiClient.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = store.getState().auth.refreshToken;
            if (refreshToken) {
                try {
                    const response = await axios.post(`${process.env.VITE_BACKEND_URL}/auth/refresh-tokens`, { refreshToken });
                    const { accessToken, refreshToken: newRefreshToken } = response.data;
                    store.dispatch(setToken({ accessToken, refreshToken: newRefreshToken }));
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return apiClient(originalRequest);
                } catch (refreshError) {
                    store.dispatch(logout());
                    return Promise.reject(refreshError);
                }
            }
        }
        return Promise.reject(error);
    }
);

export const getAllBrands = async (page: number = 1, limit: number = 10) => {
    const response = await apiClient.get(`/brands`, { params: { page, limit } });
    return response.data;
};

export const createBrand = async (brandData: { name: string; link?: string }) => {
    const response = await apiClient.post(`/brands`, brandData);
    return response.data;
};

export const updateBrand = async (brandId: string, name: string, link?: string) => {
    const response = await apiClient.patch(`/brands/${brandId}`, { name, link });
    return response.data;
};

export const deleteBrand = async (brandId: string) => {
    const response = await apiClient.delete(`/brands/${brandId}`);
    return response.data;
};

export const getBrandById = async (brandId: string) => {
    const response = await apiClient.get(`/brands/${brandId}`);
    return response.data;
};
