import { combineReducers } from 'redux';
import alert from './alert';
import auth from './auth';
import profile from './profile';
import post from './post';


//add reducers at the same path
export default combineReducers({ alert, auth, profile,post });
