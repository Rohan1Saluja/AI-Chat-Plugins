import { Dispatch } from "redux";

import {
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";
import { AuthActionTypes } from "./types";
import { supabase } from "@/lib/supabase/client";

export const initializeAuth = () => async (dispatch: Dispatch) => {
  dispatch({ type: AuthActionTypes.INIT_AUTH });

  try {
    const response = await fetch("/api/auth/user", { method: "GET" });
    const data = await response.json();
    if (response.ok && data.user) {
      dispatch({
        type: AuthActionTypes.INIT_AUTH_SUCCESS,
        payload: { session: null, user: data.user }, // Session object is now managed server-side via cookies
      });
    } else {
      dispatch({
        type: AuthActionTypes.INIT_AUTH_FAILURE,
        payload: data.error || "No active session",
      });
    }
  } catch (error: any) {
    dispatch({
      type: AuthActionTypes.INIT_AUTH_FAILURE,
      payload: error.message,
    });
  }
};

// --------------------------------------------------------

export const signInWithCredentials =
  (credentials: SignInWithPasswordCredentials) =>
  async (dispatch: Dispatch) => {
    dispatch({ type: AuthActionTypes.SIGN_IN_REQUEST });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      if (!response.ok) {
        dispatch({
          type: AuthActionTypes.SIGN_IN_FAILURE,
          payload: data.error,
        });
        return { success: false, error: data.error };
      }

      dispatch({
        type: AuthActionTypes.SIGN_IN_SUCCESS,
        payload: { session: null, user: data.user },
      });
      return { success: true, user: data.user, error: null };
    } catch (err: any) {
      dispatch({
        type: AuthActionTypes.SIGN_IN_FAILURE,
        payload: err.message ?? "Unexpected error during sign-in",
      });
      return { success: false, user: null, error: err.message };
    }
  };

// --------------------------------------------------------

export const signUpWithCredentials =
  (credentials: SignUpWithPasswordCredentials) =>
  async (dispatch: Dispatch) => {
    dispatch({ type: AuthActionTypes.SIGN_UP_REQUEST });

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();

      if (!response.ok) {
        dispatch({
          type: AuthActionTypes.SIGN_UP_FAILURE,
          payload: data.error || "Signup failed",
        });
        return { success: false, error: data.error, message: data.message };
      }

      // If signup auto-logs in (email confirm OFF), server sets cookies.
      // If email confirm ON, data.user is present, data.message indicates confirmation needed.
      // Client Redux store reflects the user if provided.
      dispatch({
        type: AuthActionTypes.SIGN_UP_SUCCESS,
        payload: { session: null, user: data.user },
      });
      return {
        success: true,
        user: data.user,
        error: null,
        message: data.message,
      };
    } catch (err: any) {
      dispatch({
        type: AuthActionTypes.SIGN_UP_FAILURE,
        payload: err.message ?? "Unexpected error during sign-up",
      });
      return { success: false, user: null, error: err.message };
    }
  };

// --------------------------------------------------------

export const signOutUser = () => async (dispatch: Dispatch) => {
  dispatch({ type: AuthActionTypes.SIGN_OUT_REQUEST });

  try {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (!response.ok) {
      /* ... error handling ... */
    }
    // Server clears HttpOnly cookies.
    dispatch({ type: AuthActionTypes.SIGN_OUT_SUCCESS });
  } catch (error: any) {
    dispatch({
      type: AuthActionTypes.SIGN_OUT_FAILURE,
      payload: "Failed to sign out",
    });
  } finally {
    dispatch({ type: AuthActionTypes.SIGN_OUT_SUCCESS });
  }
};

// --------------------------------------------------------

export const clearAuthError = () => ({
  type: AuthActionTypes.CLEAR_AUTH_ERROR,
});
