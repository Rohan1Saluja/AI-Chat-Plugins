import { Dispatch } from "redux";
import { supabase } from "@/lib/supabaseClient";

import {
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
} from "@supabase/supabase-js";
import { AuthActionTypes } from "./types";

export const initializeAuth = () => async (dispatch: Dispatch) => {
  dispatch({ type: AuthActionTypes.INIT_AUTH });

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    dispatch({
      type: AuthActionTypes.INIT_AUTH_SUCCESS,
      payload: { session, user: session?.user ?? null },
    });

    supabase.auth.onAuthStateChange((_event, currentSession) => {
      dispatch({
        type: AuthActionTypes.INIT_AUTH_SUCCESS,
        payload: {
          session: currentSession,
          user: currentSession?.user ?? null,
        },
      });
    });
  } catch (error: any) {
    dispatch({
      type: AuthActionTypes.INIT_AUTH_FAILURE,
      payload: error.message,
    });
  }
};

export const signInWithCredentials =
  (credentials: SignInWithPasswordCredentials) =>
  async (dispatch: Dispatch) => {
    dispatch({ type: AuthActionTypes.SIGN_IN_REQUEST });

    try {
      const { data, error } = await supabase.auth.signInWithPassword(
        credentials
      );
      if (error) {
        dispatch({
          type: AuthActionTypes.SIGN_IN_FAILURE,
          payload: error.message,
        });
        return {
          success: false,
          session: null,
          user: null,
          error: error.message,
        };
      }

      dispatch({
        type: AuthActionTypes.SIGN_IN_SUCCESS,
        payload: { session: data.session, user: data.session?.user ?? null },
      });
      return {
        success: true,
        session: data.session,
        user: data.session?.user ?? null,
        error: null,
      };
    } catch (err: any) {
      dispatch({
        type: AuthActionTypes.SIGN_IN_FAILURE,
        payload: err.message ?? "Unexpected error during sign-in",
      });
      return { success: false, session: null, user: null, error: err.message };
    }
  };

export const signUpWithCredentials =
  (credentials: SignUpWithPasswordCredentials) =>
  async (dispatch: Dispatch) => {
    dispatch({ type: AuthActionTypes.SIGN_UP_REQUEST });

    try {
      const { data, error } = await supabase.auth.signUp(credentials);
      if (error) {
        dispatch({
          type: AuthActionTypes.SIGN_UP_FAILURE,
          payload: error.message,
        });
        return {
          success: false,
          session: null,
          user: null,
          error: error.message,
        };
      }

      dispatch({
        type: AuthActionTypes.SIGN_UP_SUCCESS,
        payload: { session: data.session, user: data.user },
      });
      return {
        success: true,
        session: data.session,
        user: data.session?.user ?? null,
        error: null,
      };
    } catch (err: any) {
      dispatch({
        type: AuthActionTypes.SIGN_UP_FAILURE,
        payload: err.message ?? "Unexpected error during sign-up",
      });
      return { success: false, session: null, user: null, error: err.message };
    }
  };

export const signOutUser = () => async (dispatch: Dispatch) => {
  dispatch({ type: AuthActionTypes.SIGN_OUT_REQUEST });

  const { error } = await supabase.auth.signOut();
  if (error) {
    dispatch({
      type: AuthActionTypes.SIGN_OUT_FAILURE,
      payload: error.message,
    });
    return;
  }

  dispatch({ type: AuthActionTypes.SIGN_OUT_SUCCESS });
};

export const clearAuthError = () => ({
  type: AuthActionTypes.CLEAR_AUTH_ERROR,
});
