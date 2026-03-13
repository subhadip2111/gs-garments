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

export const getUserAnalytics = async () => {
    const response = await apiClient.get(`/admin/dashboard/user-stats`);
    return response.data;
}

export const getCategoriesUser = async (filterParams: string, search: string,page?:number,limit?:number) => {
    const response = await apiClient.get(`/admin/customers/categorized?type=${filterParams}&keyword=${search}&page=${+page}&limit=${+limit}`);
    return response.data;
}

export const getUserOrders = async (userId: string,page?:number,limit?:number) => {
    const response = await apiClient.get(`/admin/dashboard/user-order-history/${userId}?page=${+page}&limit=${+limit}`);
    return response.data;
}