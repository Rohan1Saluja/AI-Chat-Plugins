import { AuthActionTypes, AuthState } from "./types";

const initialState: AuthState = {
  session: null,
  user: null,
  isLoading: false,
  error: null,
  isInitialized: false,
};

export const authReducer = (state = initialState, action: any): AuthState => {
  switch (action.type) {
    case AuthActionTypes.INIT_AUTH:
    case AuthActionTypes.SIGN_IN_REQUEST:
    case AuthActionTypes.SIGN_UP_REQUEST:
    case AuthActionTypes.SIGN_OUT_REQUEST:
      return { ...state, isLoading: true, error: null };

    case AuthActionTypes.INIT_AUTH_SUCCESS:
    case AuthActionTypes.SIGN_IN_SUCCESS:
      return {
        ...state,
        session: action.payload.session,
        user: action.payload.user,
        isLoading: false,
        isInitialized: true,
      };

    case AuthActionTypes.SIGN_UP_SUCCESS:
      return {
        ...state,
        isLoading: false,
        // session/user may be null if email confirmation is required
        session: action.payload.session,
        user: action.payload.user,
      };

    case AuthActionTypes.INIT_AUTH_FAILURE:
    case AuthActionTypes.SIGN_IN_FAILURE:
    case AuthActionTypes.SIGN_UP_FAILURE:
    case AuthActionTypes.SIGN_OUT_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        isInitialized: true,
      };

    case AuthActionTypes.SIGN_OUT_SUCCESS:
      return { ...initialState, isInitialized: true };

    case AuthActionTypes.CLEAR_AUTH_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};
