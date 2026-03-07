import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { User, AuthResponse } from "../types";
import { authApi } from "../api/auth.api";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}

const parseUser = (raw: string | null): User | null => {
  if (!raw || raw === "undefined") return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

const storedUser = localStorage.getItem("user");
const storedToken = localStorage.getItem("accessToken");

const initialState: AuthState = {
  user: parseUser(storedUser),
  accessToken: storedToken ?? null,
  isLoading: false,
  error: null,
};

export const login = createAsyncThunk<
  AuthResponse,
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    return await authApi.login(credentials);
  } catch {
    return rejectWithValue("Invalid email or password");
  }
});

export const register = createAsyncThunk<
  AuthResponse,
  { email: string; password: string; firstName: string; lastName: string },
  { rejectValue: string }
>("auth/register", async (payload, { rejectWithValue }) => {
  try {
    return await authApi.register(payload);
  } catch {
    return rejectWithValue("Registration failed. Email may already be in use");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.error = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.isLoading = false;
          const { accessToken, ...userData } = action.payload;
          state.user = userData;
          state.accessToken = accessToken;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("user", JSON.stringify(userData));
        },
      )
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Unknown error";
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        register.fulfilled,
        (state, action: PayloadAction<AuthResponse>) => {
          state.isLoading = false;
          const { accessToken, ...userData } = action.payload;
          state.user = userData;
          state.accessToken = accessToken;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("user", JSON.stringify(userData));
        },
      )
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Unknown error";
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
