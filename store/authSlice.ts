
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const storedUser = localStorage.getItem('gs_user');

interface AuthState {
  user: any | null;
}

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any | null>) => {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem('gs_user', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('gs_user');
      }
    },
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
