
import { createSlice, PayloadAction } from '@reduxjs/toolkit';




const initialState = {
subcategories :[],
subcategory:null,
};

const subcategorySlice = createSlice({
  name: 'subcategory',
  initialState,
  reducers: {
    setSubCategoriesList: (state, action: PayloadAction<any | null>) => {
      state.subcategories = action.payload;
    },
    setSubCategory: (state, action: PayloadAction<any | null>) => {
      state.subcategory = action.payload;
    },
  },
});

export const { setSubCategoriesList, setSubCategory } = subcategorySlice.actions;
export default subcategorySlice.reducer;
