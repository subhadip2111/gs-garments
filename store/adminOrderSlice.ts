import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Order } from '../types';
import * as orderApi from '../api/auth/orderApi';

interface AdminOrderState {
    orders: Order[];
    stats: any | null;
    isLoading: boolean;
    error: string | null;
    totalPages: number;
    totalResults: number;
    currentPage: number;
}

const initialState: AdminOrderState = {
    orders: [],
    stats: null,
    isLoading: false,
    error: null,
    totalPages: 1,
    totalResults: 0,
    currentPage: 1,
};

// --- Async Thunks ---

export const fetchAllOrders = createAsyncThunk(
    'adminOrders/fetchAllOrders',
    async (params: { status?: string; user?: string; page?: number; limit?: number } | undefined, { rejectWithValue }) => {
        try {
            const response = await orderApi.getAllOrders(params);
            // Handle different potential response structures
            return response.data || response;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || 'Failed to fetch all orders');
        }
    }
);

export const fetchOrderStats = createAsyncThunk(
    'adminOrders/fetchOrderStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await orderApi.getOrderStats();
            return response.data || response;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || 'Failed to fetch order stats');
        }
    }
);

export const updateAdminOrderStatus = createAsyncThunk(
    'adminOrders/updateStatus',
    async ({ orderId, status, deliveryDate }: { orderId: string; status: string; deliveryDate?: string }, { rejectWithValue }) => {
        try {
            const response = await orderApi.updateOrderStatus(orderId, { status, deliveryDate });
            return response.data || response;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message || 'Failed to update order status');
        }
    }
);

const adminOrderSlice = createSlice({
    name: 'adminOrders',
    initialState,
    reducers: {
        clearAdminOrderError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Orders
            .addCase(fetchAllOrders.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.isLoading = false;
                const payload = action.payload;

                // Map the orders array regardless of structure
                const ordersRaw = payload.results || payload.orders || payload.data || (Array.isArray(payload) ? payload : []);
                state.orders = Array.isArray(ordersRaw) ? ordersRaw : [];

                // Extract pagination if present
                state.totalPages = payload.totalPages || state.totalPages;
                state.totalResults = payload.totalResults || ordersRaw.length || state.totalResults;
                state.currentPage = payload.page || state.currentPage;
            })
            .addCase(fetchAllOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Fetch Stats
            .addCase(fetchOrderStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            })
            // Update Status
            .addCase(updateAdminOrderStatus.fulfilled, (state, action) => {
                const updatedOrder = action.payload?.order || action.payload;
                if (updatedOrder) {
                    const idx = state.orders.findIndex(o => (o.id || o._id) === (updatedOrder.id || updatedOrder._id));
                    if (idx !== -1) {
                        state.orders[idx] = updatedOrder;
                    }
                }
            });
    },
});

export const { clearAdminOrderError } = adminOrderSlice.actions;
export default adminOrderSlice.reducer;
