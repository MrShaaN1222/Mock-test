import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiClient } from "../../api/client";

const TOKEN_KEY = "ssc_cbt_access_token";
const USER_KEY = "ssc_cbt_user";

function loadUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function persistAuth(accessToken, user) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export const loginThunk = createAsyncThunk("auth/login", async (payload) => {
  return apiClient.post("/auth/login", payload);
});

export const registerThunk = createAsyncThunk("auth/register", async (payload) => {
  return apiClient.post("/auth/register", payload);
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    accessToken: localStorage.getItem(TOKEN_KEY) || "",
    user: loadUser(),
    status: "idle",
    error: null
  },
  reducers: {
    logout(state) {
      state.accessToken = "";
      state.user = null;
      state.error = null;
      clearAuthStorage();
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.accessToken = action.payload.tokens.accessToken;
        state.user = action.payload.user;
        persistAuth(action.payload.tokens.accessToken, action.payload.user);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Login failed";
      })
      .addCase(registerThunk.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.accessToken = action.payload.tokens.accessToken;
        state.user = action.payload.user;
        persistAuth(action.payload.tokens.accessToken, action.payload.user);
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Registration failed";
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
