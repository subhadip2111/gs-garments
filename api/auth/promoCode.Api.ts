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


export const addNewPromocode = async (payload: any) => {
    const response = await apiClient.post("promocodes", payload)
    return response.data
}

export const getAllPromocodes = async (debouncedSearch:string,page:number,limit:number) => {
    const response = await apiClient.get(`/promocodes/all?search=${debouncedSearch}&page=${page}&limit=${limit}`)
    return response.data
}




export const getPromocodeStats = async () => {
    const response = await apiClient.get("promocodes/analytics")
    return response.data
}

export const updatePromocode = async (payload: any,id:string) => {
    console.log("payload", payload)
    const response = await apiClient.patch(`/promocodes/${id}`, payload)
    return response.data
}

export const deletePromocode = async (payload: any) => {
    const response = await apiClient.delete(`/promocodes/${payload.id}`)
    return response.data
}

export const getPromocodeById = async (payload: any) => {
    const response = await apiClient.get(`/promocodes/${payload.id}`)
    return response.data
}




export const getMyPromocodes=async(userId:any)=>{
    const response = await apiClient.get(`/promocodes/user/${userId}`)
    return response.data
}   
export const getPromocodeByCode = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByDiscountType = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByDiscountValue = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByMinOrderAmount = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByMaxDiscountAmount = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByStartDate = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByEndDate = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByUsageLimit = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByUsedCount = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByIsActive = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByIsExpired = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByIsDeleted = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByIsActiveAndIsExpiredAndIsDeleted = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByIsActiveAndIsExpiredAndIsDeletedAndIsUsedCount = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByIsActiveAndIsExpiredAndIsDeletedAndIsUsedCountAndIsMinOrderAmount = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByIsActiveAndIsExpiredAndIsDeletedAndIsUsedCountAndIsMinOrderAmountAndIsMaxDiscountAmount = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByIsActiveAndIsExpiredAndIsDeletedAndIsUsedCountAndIsMinOrderAmountAndIsMaxDiscountAmountAndIsStartDate = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByIsActiveAndIsExpiredAndIsDeletedAndIsUsedCountAndIsMinOrderAmountAndIsMaxDiscountAmountAndIsStartDateAndIsEndDate = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByIsActiveAndIsExpiredAndIsDeletedAndIsUsedCountAndIsMinOrderAmountAndIsMaxDiscountAmountAndIsStartDateAndIsEndDateAndIsDiscountType = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByIsActiveAndIsExpiredAndIsDeletedAndIsUsedCountAndIsMinOrderAmountAndIsMaxDiscountAmountAndIsStartDateAndIsEndDateAndIsDiscountTypeAndIsDiscountValue = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByIsActiveAndIsExpiredAndIsDeletedAndIsUsedCountAndIsMinOrderAmountAndIsMaxDiscountAmountAndIsStartDateAndIsEndDateAndIsDiscountTypeAndIsDiscountValueAndIsCode = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByIsActiveAndIsExpiredAndIsDeletedAndIsUsedCountAndIsMinOrderAmountAndIsMaxDiscountAmountAndIsStartDateAndIsEndDateAndIsDiscountTypeAndIsDiscountValueAndIsCodeAndIsId = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByIsActiveAndIsExpiredAndIsDeletedAndIsUsedCountAndIsMinOrderAmountAndIsMaxDiscountAmountAndIsStartDateAndIsEndDateAndIsDiscountTypeAndIsDiscountValueAndIsCodeAndIsIdAndIsUsageLimit = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByIsActiveAndIsExpiredAndIsDeletedAndIsUsedCountAndIsMinOrderAmountAndIsMaxDiscountAmountAndIsStartDateAndIsEndDateAndIsDiscountTypeAndIsDiscountValueAndIsCodeAndIsIdAndIsUsageLimitAndIsUsedCount = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByIsActiveAndIsExpiredAndIsDeletedAndIsUsedCountAndIsMinOrderAmountAndIsMaxDiscountAmountAndIsStartDateAndIsEndDateAndIsDiscountTypeAndIsDiscountValueAndIsCodeAndIsIdAndIsUsageLimitAndIsUsedCountAndIsMinOrderAmount = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByIsActiveAndIsExpiredAndIsDeletedAndIsUsedCountAndIsMinOrderAmountAndIsMaxDiscountAmountAndIsStartDateAndIsEndDateAndIsDiscountTypeAndIsDiscountValueAndIsCodeAndIsIdAndIsUsageLimitAndIsUsedCountAndIsMinOrderAmountAndIsMaxDiscountAmount = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByIsActiveAndIsExpiredAndIsDeletedAndIsUsedCountAndIsMinOrderAmountAndIsMaxDiscountAmountAndIsStartDateAndIsEndDateAndIsDiscountTypeAndIsDiscountValueAndIsCodeAndIsIdAndIsUsageLimitAndIsUsedCountAndIsMinOrderAmountAndIsMaxDiscountAmountAndIsStartDate = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}

export const getPromocodeByIsActiveAndIsExpiredAndIsDeletedAndIsUsedCountAndIsMinOrderAmountAndIsMaxDiscountAmountAndIsStartDateAndIsEndDateAndIsDiscountTypeAndIsDiscountValueAndIsCodeAndIsIdAndIsUsageLimitAndIsUsedCountAndIsMinOrderAmountAndIsMaxDiscountAmountAndIsStartDateAndIsEndDate = async (payload: any) => {
    const response = await apiClient.get("/promo-code/get", payload)
    return response.data
}
export const getPromocodeByCodeName = async (codeName: string) => {
    const response = await apiClient.get(`/promocodes/code/${codeName}`);
    return response.data;
};
