
import { createSlice, PayloadAction } from '@reduxjs/toolkit';




const initialState = {
categories:[],
category:null,
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setCategoriesList: (state, action: PayloadAction<any | null>) => {
      state.categories = action.payload;
    },
    setCategory: (state, action: PayloadAction<any | null>) => {
      state.category = action.payload;
    },
  },
});

export const { setCategoriesList, setCategory } = categorySlice.actions;
export default categorySlice.reducer;
