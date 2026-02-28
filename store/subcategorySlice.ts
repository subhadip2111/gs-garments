import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SubCategory {
  id: string;
  _id?: string;
  name: string;
  category: string | { _id: string; id?: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}

interface SubCategoryState {
  subcategories: SubCategory[];
  subcategory: SubCategory | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SubCategoryState = {
  subcategories: [],
  subcategory: null,
  isLoading: false,
  error: null,
};

const subcategorySlice = createSlice({
  name: 'subcategory',
  initialState,
  reducers: {
    setSubCategoriesList: (state, action: PayloadAction<SubCategory[]>) => {
      state.subcategories = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setSubCategory: (state, action: PayloadAction<SubCategory | null>) => {
      state.subcategory = action.payload;
    },
    setSubCategoriesLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSubCategoriesError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setSubCategoriesList, setSubCategory, setSubCategoriesLoading, setSubCategoriesError } = subcategorySlice.actions;
export default subcategorySlice.reducer;
