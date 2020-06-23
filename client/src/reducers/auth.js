import {
  REGISTER_FAIL,
  REGISTER_SUCCESS,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_FAIL,
  LOGIN_SUCCESS,
  LOGOUT,
  ACCOUNT_DELETED,
} from '../actions/types';

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  loading: true,
  user: null,
};

export default function (state = initialState, action) {
  const { type, payload } = action; //action is dispatch

  switch (type) {
    case REGISTER_SUCCESS:
    case LOGIN_SUCCESS:
      localStorage.setItem('token', payload.token);
      return {
        ...state,
        ...payload,
        isAuthenticated: true,
        loading: false,
      };
    case REGISTER_FAIL:
    case LOGIN_FAIL:
    case LOGOUT:
    case ACCOUNT_DELETED:
      localStorage.token &&
        localStorage.removeItem('token', localStorage.token);
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    case AUTH_ERROR:
      return {
        ...state,
        isAuthenticated: false,
        loading: false,
      };
    case USER_LOADED:
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: payload,
      };

    default:
      return state;
  }
}
