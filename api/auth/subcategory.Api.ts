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

export const getAllSubCategories = async (page: number = 1, limit: number = 10) => {
    const response = await apiClient.get(`/subcategories`, { params: { page, limit } });
    // Return the full paginated payload so callers can access results, totalPages, totalResults
    return response.data;
}

export const addSubCategory = async (category: any) => {
    const response = await apiClient.post(`/subcategories`, category);
    return response.data;
}
export const updateSubCategory = async (subcategoryId: string, name: string, category: string) => {
    const response = await apiClient.patch(`/subcategories/${subcategoryId}`, { name, category });
    return response.data;
}

export const deleteSubCategory = async (id: string) => {
    const response = await apiClient.delete(`/subcategories/${id}`);
    return response.data;
}


export const getSubCategoryById = async (id: string) => {
    const response = await apiClient.get(`/subcategories/${id}`);
    return response.data;
}

export const getAllSubCategoryList = async () => {
    const response = await apiClient.get(`/categories`);
    return response.data
}