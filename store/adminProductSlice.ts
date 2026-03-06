import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AdminProduct {
    id: string;
    _id?: string;
    sku: string;
    name: string;
    brand: string;
    category: any;
    subcategory: any;
    price?: number;
    originalPrice?: number;
    description: string;
    images: string[];
    variants: { color: { name: string; hex: string; images: string[] }; sizes: { size: string; quantity: number; price: number; originalPrice?: number }[] }[];
    fabric?: string;
    specifications: string[];
    materialAndCare?: string[];
    sizeAndFit?: string[];
    rating: number;
    reviewsCount: number;
    isTrending: boolean;
    isNewArrival: boolean;
    isBestSeller?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

interface AdminProductState {
    products: AdminProduct[];
    selectedProduct: AdminProduct | null;
    isLoading: boolean;
    totalPages: number;
    totalResults: number;
    currentPage: number;
}

const initialState: AdminProductState = {
    products: [],
    selectedProduct: null,
    isLoading: false,
    totalPages: 1,
    totalResults: 0,
    currentPage: 1,
};

const adminProductSlice = createSlice({
    name: 'adminProducts',
    initialState,
    reducers: {
        setAdminProducts: (state, action: PayloadAction<AdminProduct[]>) => {
            state.products = action.payload;
        },
        setSelectedProduct: (state, action: PayloadAction<AdminProduct | null>) => {
            state.selectedProduct = action.payload;
        },
        setAdminProductsLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setAdminProductsPagination: (state, action: PayloadAction<{ totalPages: number; totalResults: number; currentPage: number }>) => {
            state.totalPages = action.payload.totalPages;
            state.totalResults = action.payload.totalResults;
            state.currentPage = action.payload.currentPage;
        },
        addAdminProduct: (state, action: PayloadAction<AdminProduct>) => {
            state.products.unshift(action.payload);
            state.totalResults += 1;
        },
        updateAdminProduct: (state, action: PayloadAction<AdminProduct>) => {
            const idx = state.products.findIndex(p => (p.id || p._id) === (action.payload.id || action.payload._id));
            if (idx !== -1) state.products[idx] = action.payload;
        },
        removeAdminProduct: (state, action: PayloadAction<string>) => {
            state.products = state.products.filter(p => (p.id || p._id) !== action.payload);
            state.totalResults = Math.max(0, state.totalResults - 1);
        },
    },
});

export const {
    setAdminProducts,
    setSelectedProduct,
    setAdminProductsLoading,
    setAdminProductsPagination,
    addAdminProduct,
    updateAdminProduct,
    removeAdminProduct,
} = adminProductSlice.actions;

export type { AdminProduct };
export default adminProductSlice.reducer;
