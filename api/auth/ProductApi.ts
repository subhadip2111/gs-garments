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

export const getAllProducts = async (params?: {
    page?: number; limit?: number;
    category?: string; subcategory?: string;
    sortBy?: string; search?: string;
}) => {
    const response = await apiClient.get(`/products`, { params: { page: 1, limit: 50, ...params } });
    return response.data;
}

export const getProductById = async (id: string) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
}

export const getTrendingProducts = async () => {
    const response = await apiClient.get(`/products/trending`);
    return response.data;
}

export const getNewArrivals = async () => {
    const response = await apiClient.get(`/products/new-arrivals`);
    return response.data;
}

export const addProduct = async (product: any) => {
    const response = await apiClient.post(`/products`, product);
    return response.data;
}
export const updateProduct = async (productId: string, payload: any) => {
    const response = await apiClient.patch(`/products/${productId}`, payload);
    return response.data;
}

export const deleteProduct = async (id: string) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
}

export const getSimilarProducts = async (productId: string) => {
    const response = await apiClient.get(`/products/${productId}/similar`);
    return response.data;
}

export const getAllBannerList = async () => {
    const response = await apiClient.get(`/banners`);
    return response.data
}

/// make is as form data not a normal data 
export const uploadBannerImage = async (image: File) => {
    const formData = new FormData();
    formData.append('image', image);
    const response = await apiClient.post(`/upload/single`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data
}

export const uploadsBulkImages = async (images: File[]) => {
    const formData = new FormData();
    images.forEach((image) => {
        formData.append('images', image);
    });
    const response = await apiClient.post(`/upload/bulk`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data
}

export const submitProductReview = async (productId: string, formData: FormData) => {
    const response = await apiClient.post(`/products/${productId}/reviews`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

export const getProductReviews = async (productId: string, params?: { page?: number; limit?: number; sortBy?: string }) => {
    const response = await apiClient.get(`/products/${productId}/reviews`, { params });
    return response.data;
}
