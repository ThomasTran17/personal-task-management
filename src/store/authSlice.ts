/**
 * Auth Redux Slice
 * Manages authentication state with automatic sync from authApi matchers
 *
 * State Flow:
 * - Login/Register/Refresh → onQueryStarted (token saved) → matchFulfilled (sync state)
 * - getProfile → matchFulfilled (sync user)
 * - Logout/RefreshFailed → matchFulfilled/matchRejected (reset state)
 */

import { createSlice } from '@reduxjs/toolkit';
import type { UserWithAttributes } from '@/api';
import { authApi } from '@/api/services/authApi';

export interface AuthState {
  user: UserWithAttributes | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
};

/**
 * Auth Slice
 * Manages local authentication state synchronized with authApi mutations/queries
 *
 * Matchers:
 * - login/register/refreshToken.matchFulfilled → Sync user + token
 * - getProfile.matchFulfilled → Sync user
 * - logout.matchFulfilled → Reset state
 * - refreshToken.matchRejected → Reset state (token invalid)
 */
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Manual logout action
     * Clears auth state without API call
     * (Usually logout is handled via logout mutation)
     */
    clearAuth: () => initialState,
  },
  extraReducers: (builder) => {
    /**
     * Handle login mutation fulfillment
     * Sets user, token, and authenticated flag
     */
    builder.addMatcher(authApi.endpoints.login.matchFulfilled, (state, { payload }) => {
      state.user = payload.user;
      state.accessToken = payload.accessToken;
      state.isAuthenticated = true;
    });

    /**
     * Handle register mutation fulfillment
     * Sets user, token, and authenticated flag
     */
    builder.addMatcher(authApi.endpoints.register.matchFulfilled, (state, { payload }) => {
      state.user = payload.user;
      state.accessToken = payload.accessToken;
      state.isAuthenticated = true;
    });

    /**
     * Handle refreshToken mutation fulfillment
     * Updates token and user on successful refresh
     */
    builder.addMatcher(authApi.endpoints.refreshToken.matchFulfilled, (state, { payload }) => {
      state.user = payload.user;
      state.accessToken = payload.accessToken;
      state.isAuthenticated = true;
    });

    /**
     * Handle getProfile query fulfillment
     * Syncs user profile data (no token update)
     */
    builder.addMatcher(authApi.endpoints.getProfile.matchFulfilled, (state, { payload }) => {
      state.user = payload;
      state.isAuthenticated = true;
    });

    /**
     * Handle logout mutation fulfillment
     * Clears all auth state
     */
    builder.addMatcher(authApi.endpoints.logout.matchFulfilled, () => initialState);

    /**
     * Handle refreshToken mutation rejection
     * If token refresh fails, clear auth state
     * (Token is likely invalid or expired)
     */
    builder.addMatcher(authApi.endpoints.refreshToken.matchRejected, () => initialState);
  },
});

// Export actions
export const { clearAuth } = authSlice.actions;

// Export reducer
export default authSlice.reducer;
