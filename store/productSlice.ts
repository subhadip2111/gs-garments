
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../types';
import { MOCK_PRODUCTS } from '../constants';

interface ProductState {
  items: Product[];
  isLoading: boolean;
}

const initialState: ProductState = {
  items: MOCK_PRODUCTS,
  isLoading: false,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
    },
    setLoadingProducts: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setProducts, setLoadingProducts } = productSlice.actions;
export default productSlice.reducer;
