import {
  REGISTER_FAIL,
  LOGIN_FAIL,
  LOGIN_SUCCESS,
  REGISTER_SUCCESS,
  USER_LOADED,
  AUTH_ERROR,
  LOGOUT,
  CLEAR_PROFILE
} from './types';
import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';
import { setAlert } from './alert';

//load user

export const loadUser = () => async (dispatch) => {
  if (localStorage.token) {
    setAuthToken(localStorage.token); // req.headers[x-auth-token] will be set to token,backend middleware auth.js
  }
  
  try {
    const res = await axios.get('/api/auth');

    dispatch({
      type: USER_LOADED,
      payload: res.data,
    });
  } catch (error) {
    dispatch({
      type: AUTH_ERROR,
    });
  }
};

//Register User
//BACKEND @route POST /api/users, return saved user token
export const register = ({ name, email, password }) => async (dispatch) => {

  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const body = JSON.stringify({ name, email, password });

  try {
    const res = await axios.post('/api/users', body, config);

    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data,
    });
    dispatch(loadUser());
  } catch (err) {
    dispatch({
      type: REGISTER_FAIL,
    });
  }
};

//try login
//BACKEND @route POST /api/auth, return token

export const login = (email, password) => async (dispatch) => {

  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const body = JSON.stringify({ email, password });

  try {
    const res = await axios.post('/api/auth', body, config);

    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data,
    });
    dispatch(loadUser());
  } catch (err) {
    const error = err.response.data;
    if (error) {
      dispatch(setAlert(error.msg, 'danger'));
    }
    dispatch({
      type: LOGIN_FAIL,
    });
  }
};

//LOGOUT/CLEAR PROFILE

export const logout=()=>dispatch=>{
  dispatch({
    type:LOGOUT
  })
  dispatch({
    type:CLEAR_PROFILE
  })
}