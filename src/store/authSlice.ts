/**
 * Auth Redux Slice
 * Manages authentication state with automatic sync from authApi matchers
 *
 * State Flow:
 * - Login/Register/Refresh → onQueryStarted (token saved) → matchFulfilled (sync state)
 * - getProfile → matchFulfilled (sync user)
 * - Logout/RefreshFailed → matchFulfilled/matchRejected (reset state)
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { UserWithAttributes, AuthResponse } from '@/api';
import { tokenManager } from '@/api';
import { authApi } from '@/api/services/authApi';

export interface AuthState {
  user: UserWithAttributes | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

/**
 * Initialize auth state from tokenManager (LocalStorage)
 * Preserves user session across page reloads
 */
const initializeAuthState = (): AuthState => {
  const token = tokenManager.getToken();
  return {
    user: null, // User will be populated by getProfile query
    accessToken: token,
    isAuthenticated: !!token, // Authenticated if token exists
  };
};

const initialState: AuthState = initializeAuthState();

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
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, action: PayloadAction<AuthResponse>) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      }
    );

    /**
     * Handle register mutation fulfillment
     * Sets user, token, and authenticated flag
     */
    builder.addMatcher(
      authApi.endpoints.register.matchFulfilled,
      (state, action: PayloadAction<AuthResponse>) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      }
    );

    /**
     * Handle refreshToken mutation fulfillment
     * Updates token and user on successful refresh
     */
    builder.addMatcher(
      authApi.endpoints.refreshToken.matchFulfilled,
      (state, action: PayloadAction<AuthResponse>) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      }
    );

    /**
     * Handle getProfile query fulfillment
     * Syncs user profile data (no token update)
     */
    builder.addMatcher(
      authApi.endpoints.getProfile.matchFulfilled,
      (state, action: PayloadAction<UserWithAttributes>) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      }
    );

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
