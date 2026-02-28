import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Category {
  id: string;
  _id?: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CategoryState {
  categories: Category[];
  category: Category | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  category: null,
  isLoading: false,
  error: null,
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setCategoriesList: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setCategory: (state, action: PayloadAction<Category | null>) => {
      state.category = action.payload;
    },
    setCategoriesLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCategoriesError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setCategoriesList, setCategory, setCategoriesLoading, setCategoriesError } = categorySlice.actions;
export default categorySlice.reducer;
