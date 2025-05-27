import { Session, User } from "@supabase/supabase-js";
export enum AuthActionTypes {
  INIT_AUTH = "INIT_AUTH",
  INIT_AUTH_SUCCESS = "INIT_AUTH_SUCCESS",
  INIT_AUTH_FAILURE = "INIT_AUTH_FAILURE",

  SIGN_IN_REQUEST = "SIGN_IN_REQUEST",
  SIGN_IN_SUCCESS = "SIGN_IN_SUCCESS",
  SIGN_IN_FAILURE = "SIGN_IN_FAILURE",

  SIGN_UP_REQUEST = "SIGN_UP_REQUEST",
  SIGN_UP_SUCCESS = "SIGN_UP_SUCCESS",
  SIGN_UP_FAILURE = "SIGN_UP_FAILURE",

  SIGN_OUT_REQUEST = "SIGN_OUT_REQUEST",
  SIGN_OUT_SUCCESS = "SIGN_OUT_SUCCESS",
  SIGN_OUT_FAILURE = "SIGN_OUT_FAILURE",

  CLEAR_AUTH_ERROR = "CLEAR_AUTH_ERROR",
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}
