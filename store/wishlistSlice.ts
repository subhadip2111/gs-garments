import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as wishlistApi from '../api/auth/wishlistApi';

// --- Types ---
interface WishlistState {
    items: string[];  // Array of Product IDs
    loading: boolean;
    error: string | null;
}

// --- Helpers ---
export const normalizeWishlistItems = (items: any[]): string[] => {
    if (!items || !Array.isArray(items)) return [];
    const ids = items
        .filter(item => item !== null && item !== undefined && item !== '')
        .map((item: any) => {
            const id =
                item.productId?._id || item.productId?.id || item.productId ||
                item.product?._id || item.product?.id ||
                item._id || item.id ||
                (typeof item === 'string' ? item : null);
            if (!id) return null;
            return typeof id === 'object' ? (id?._id || id?.id || null) : String(id);
        })
        .filter((id): id is string =>
            typeof id === 'string' &&
            id.trim() !== '' &&
            id !== 'undefined' &&
            id !== 'null' &&
            id !== '[object Object]'
        );
    return Array.from(new Set(ids));
};

const saveToStorage = (items: string[]) => {
    localStorage.setItem('gs_wishlist', JSON.stringify(items));
};

// --- Thunks ---
export const fetchWishlist = createAsyncThunk('wishlist/fetchWishlist', async () => {
    const response = await wishlistApi.getWishlist();
    return response.data || response;
});

export const toggleWishlistServer = createAsyncThunk(
    'wishlist/toggleWishlistServer',
    async (productId: string) => {
        const response = await wishlistApi.toggleWishlistApi(productId);
        return { productId, data: response.data || response };
    }
);

// --- Slice ---
const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: {
        items: [],  // Always start empty — server is the source of truth
        loading: false,
        error: null,
    } as WishlistState,
    reducers: {
        // Seed from user object on login (avoids a second API call)
        setWishlistFromUser: (state, action: PayloadAction<any[]>) => {
            state.items = normalizeWishlistItems(action.payload || []);
            saveToStorage(state.items);
        },
        // Clear on logout
        clearWishlist: (state) => {
            state.items = [];
            state.loading = false;
            state.error = null;
            localStorage.removeItem('gs_wishlist');
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Wishlist
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;
                const payload = action.payload;
                let raw: any[] = [];
                if (Array.isArray(payload)) raw = payload;
                else if (payload?.wishlist && Array.isArray(payload.wishlist)) raw = payload.wishlist;
                else if (payload?.data && Array.isArray(payload.data)) raw = payload.data;
                else if (payload?.results && Array.isArray(payload.results)) raw = payload.results;

                const normalized = normalizeWishlistItems(raw);

                // Only update state if the server returned meaningful data.
                // This prevents a bad/empty response from wiping valid local state.
                if (normalized.length > 0 || state.items.length === 0) {
                    state.items = normalized;
                    saveToStorage(state.items);
                }
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch wishlist';
            })

            // Toggle Wishlist
            .addCase(toggleWishlistServer.fulfilled, (state, action) => {
                const { productId, data } = action.payload;
                const serverWishlist = data?.wishlist || (Array.isArray(data) ? data : null);

                if (Array.isArray(serverWishlist) && serverWishlist.length >= 0) {
                    // Server returned the full updated list — use it
                    state.items = normalizeWishlistItems(serverWishlist);
                } else {
                    // Optimistic toggle fallback
                    if (state.items.includes(productId)) {
                        state.items = state.items.filter(id => id !== productId);
                    } else {
                        state.items = Array.from(new Set([...state.items, productId]));
                    }
                }
                saveToStorage(state.items);
            });
    },
});

export const { setWishlistFromUser, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
