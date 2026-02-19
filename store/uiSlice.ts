
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, StyleProfile } from '../types';

interface UIState {
  quickViewProduct: Product | null;
  sharedProduct: Product | null;
  isStyleAssistantOpen: boolean;
  userStyleProfile: StyleProfile;
  userLocation: { lat: number, lng: number } | null;
}

const initialState: UIState = {
  quickViewProduct: null,
  sharedProduct: null,
  isStyleAssistantOpen: false,
  userStyleProfile: {
    aesthetic: 'Minimalist',
    preferredColors: ['Monochrome', 'Earth Tones'],
    sizePreference: 'Regular'
  },
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
    setIsStyleAssistantOpen: (state, action: PayloadAction<boolean>) => {
      state.isStyleAssistantOpen = action.payload;
    },
    setUserStyleProfile: (state, action: PayloadAction<StyleProfile>) => {
      state.userStyleProfile = action.payload;
    },
    setUserLocation: (state, action: PayloadAction<{ lat: number; lng: number } | null>) => {
      state.userLocation = action.payload;
    },
  },
});

export const { 
  setQuickViewProduct, 
  setSharedProduct, 
  setIsStyleAssistantOpen, 
  setUserStyleProfile, 
  setUserLocation 
} = uiSlice.actions;
export default uiSlice.reducer;
