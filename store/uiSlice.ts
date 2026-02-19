
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../types';

interface UIState {
  quickViewProduct: Product | null;
  sharedProduct: Product | null;
  userLocation: { lat: number, lng: number } | null;
}

const initialState: UIState = {
  quickViewProduct: null,
  sharedProduct: null,
  userLocation: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setQuickViewProduct: (state, action: PayloadAction<Product | null>) => {
      state.quickViewProduct = action.payload;
    },
    setSharedProduct: (state, action: PayloadAction<Product | null>) => {
      state.sharedProduct = action.payload;
    },
    setUserLocation: (state, action: PayloadAction<{ lat: number; lng: number } | null>) => {
      state.userLocation = action.payload;
    },
  },
});

export const {
  setQuickViewProduct,
  setSharedProduct,
  setUserLocation
} = uiSlice.actions;
export default uiSlice.reducer;
