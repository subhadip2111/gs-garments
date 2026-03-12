
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const storedUser = localStorage.getItem('gs_user');

interface TokenPayload {
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: any | null;
  accessToken: string;
  refreshToken: string;
}

const initialState: AuthState = {
  user: null,
  accessToken: "",
  refreshToken: "",
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any | null>) => {
      // Only overwrite if it's a real change (distinct from basic session loading)
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = "";
      state.refreshToken = "";
    },
    setToken: (state, action: PayloadAction<TokenPayload | null>) => {
      if (action.payload) {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
      } else {
        state.accessToken = "";
        state.refreshToken = "";
      }
    },
    setCurrentUser: (state, action: PayloadAction<any | null>) => {
      state.user = action.payload;
    }
  },
});

export const { setUser, logout, setToken, setCurrentUser } = authSlice.actions;
export default authSlice.reducer;
