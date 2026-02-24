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

export const getAllCategories = async (page: number = 1, limit: number = 10) => {
    const response = await apiClient.get(`/categories`, { params: { page, limit } });
    console.log(response.data);
    // Return the full paginated payload so callers can access results, totalPages, totalResults
    return response.data;
}

export const addCategory = async (category: any) => {
    const response = await apiClient.post(`/categories`, category);
    return response.data;
}

export const updateCategory = async (category: { name: string, id: string }) => {
    const response = await apiClient.patch(`/categories/${category.id}`, { name: category.name });
    return response.data;
}

export const deleteCategory = async (id: string) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
}


export const getCategoryById = async (id: string) => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
}

export const getAllcategoryList = async () => {
    const response = await apiClient.get(`/categories`);
    return response.data
}