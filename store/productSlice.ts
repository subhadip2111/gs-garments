
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../types';

interface ProductState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  items: [],
  isLoading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setLoadingProducts: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setProductsError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setProducts, setLoadingProducts, setProductsError } = productSlice.actions;
export default productSlice.reducer;
