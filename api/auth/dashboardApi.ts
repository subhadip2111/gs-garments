import { getApiClient } from "./authApi";

const apiClient = getApiClient();

// ── Dashboard Stats ──
export const getAdminStats = async () => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
};

// ── Monthly Sales (12-month breakdown) ──
export const getMonthlySales = async (year?: number) => {
    const params = year ? { year } : {};
    const response = await apiClient.get('/admin/dashboard/monthly-sales', { params });
    return response.data;
};

// ── Top Selling Categories ──
export const getTopCategories = async () => {
    const response = await apiClient.get('/admin/dashboard/top-categories');
    return response.data;
};

// ── Daily Sales Performance (last 30 days) ──
export const getSalesPerformance = async () => {
    const response = await apiClient.get('/admin/dashboard/sales-performance');
    return response.data;
};
