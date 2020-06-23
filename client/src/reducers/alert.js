import { SET_ALERT, REMOVE_ALERT } from '../actions/types';

const initialState = []; //state must be either array or object

export default function (state = initialState, action) {
  const { type, payload } = action; //action=coming from action/dispatch

  switch (type) {
    case SET_ALERT:
      return [...state, payload];
    case REMOVE_ALERT:
      return state.filter((alert) => alert.id !== payload);

    default:
      return state;
  }
}
