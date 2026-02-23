import axios from "axios";
import { store } from "../../store";
import { setToken, logout } from "../../store/authSlice";

const apiClient = axios.create({
    baseURL: process.env.VITE_BACKEND_URL,
});

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

export const saveSocialLoginUserData = async (user: any) => {
    const response = await apiClient.post(`/auth/social-login`, user);
    return response.data;
}

export const updateProfileDetails = async (user: any) => {
    const response = await apiClient.patch(`/auth/profile/${user.id}`, user);
    return response.data;
}

export const getProfileDetails = async () => {
    const response = await apiClient.get(`/auth/profile`);
    return response.data;
}

export const generateNewAccessAndRefreshToken = async (refreshToken: string) => {
    const response = await axios.post(`${process.env.VITE_BACKEND_URL}/auth/refresh-tokens`, { refreshToken });
    return response.data;
}