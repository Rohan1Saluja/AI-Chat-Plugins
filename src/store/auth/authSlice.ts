import { supabase } from "@/lib/supabaseClient";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Session,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
  User,
} from "@supabase/supabase-js";

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

const initialState: AuthState = {
  session: null,
  user: null,
  isLoading: false,
  error: null,
  isInitialized: false,
};

export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { dispatch }) => {
    try {
      console.log("Init started...");
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;

      console.log("Initial session fetched: ", session);

      dispatch(
        setAuthState({
          session,
          user: session?.user ?? null,
          isLoading: false,
          isInitialized: true,
        })
      );

      const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, currentSession) => {
          console.log("onAuthStateChange triggered: ", _event, currentSession);
          dispatch(
            setAuthState({
              session,
              user: currentSession?.user ?? null,
              isLoading: false,
              isInitialized: true,
            })
          );
        }
      );

      // After this, we need to store the unsubscribe function somewhere accessible if we want to call it later,
      // e.g., when the app unmounts or the user logs out explicitly.
      // returning it in the action payload is problematic.
      return { initialSessionChecked: true, listenerAttached: true };
      // or
      // return session;
    } catch (error) {
      dispatch(
        setAuthState({
          session: null,
          user: null,
          isLoading: false,
          isInitialized: true,
          error: (error as Error).message,
        })
      );
      throw error;
    }
  }
);

export const signInWithCredentials = createAsyncThunk(
  "auth/signInWithCredentials",
  async (credentials: SignInWithPasswordCredentials, { rejectWithValue }) => {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) return rejectWithValue(error.message);

    return data.session;
  }
);

export const SignUpwithCredentials = createAsyncThunk(
  "auth/signUpWithCredentials",
  async (credentials: SignUpWithPasswordCredentials, { rejectWithValue }) => {
    const { data, error } = await supabase.auth.signUp(credentials);
    if (error) return rejectWithValue(error.message);

    return { user: data.user, session: data.session };
  }
);

export const signOutUser = createAsyncThunk(
  "auth/signOut",
  async (_, { rejectWithValue }) => {
    const { error } = await supabase.auth.signOut();
    if (error) return rejectWithValue(error.message);
  }
);

// -------------------------------------------------

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthState: (
      state,
      action: PayloadAction<{
        session: Session | null;
        user: User | null;
        isLoading: boolean;
        isInitialized?: boolean;
        error?: string | null;
      }>
    ) => {
      state.session = action.payload.session;
      state.user = action.payload.user;
      state.isLoading = action.payload.isLoading;
      if (action.payload.isInitialized !== undefined) {
        state.isInitialized = action.payload.isInitialized;
      }
      if (action.payload.error !== undefined) {
        state.error = action.payload.error;
      } else state.error = null; //clear error on successful auth state change
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.error = action.error.message || "Initialiazation failed";
      })
      //   signIn
      .addCase(signInWithCredentials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithCredentials.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(signInWithCredentials.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Sign in failed";
      })
      // signUp
      .addCase(SignUpwithCredentials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(SignUpwithCredentials.fulfilled, (state, action) => {
        state.isLoading = false;
        // If email confirmation is required, user might not be immediately set by onAuthStateChange.
        // Action.payload contains user object which can be used to give feedback.
        console.log("Sign up fulfilled payload:", action.payload);
      })
      .addCase(SignUpwithCredentials.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || "Sign up failed";
      })
      // signOut
      .addCase(signOutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signOutUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(signOutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Sign out failed";
      });
  },
});

export const { setAuthState, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
