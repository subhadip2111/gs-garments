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

export const getALlBanners = async (page: number = 1, limit: number = 10) => {
    const response = await apiClient.get(`/banners`, { params: { page, limit } });
    return response.data;
}

export const addBanner = async (banner: any) => {
    console.log("objform frotedn", banner)
    const response = await apiClient.post(`/banners`, banner);
    return response.data;
}
export const updateBanner = async (bannerId: string, payload: any) => {
    const response = await apiClient.patch(`/banners/${bannerId}`, payload);
    return response.data;
}

export const deleteBanner = async (id: string) => {
    const response = await apiClient.delete(`/banners/${id}`);
    return response.data;
}


export const getBannerById = async (id: string) => {
    const response = await apiClient.get(`/banners/${id}`);
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
