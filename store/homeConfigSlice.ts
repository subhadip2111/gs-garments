import { createSlice, PayloadAction } from '@reduxjs/toolkit';



const initialState={
    banners:[]
}

const homeConfigSlice = createSlice({
  name: 'homeConfig',
  initialState,
  reducers: {
  fetchBanners: (state, action: PayloadAction<any>) => {
    state.banners = action.payload;
  },
  },
});

export const {fetchBanners } = homeConfigSlice.actions;
export default homeConfigSlice.reducer;
