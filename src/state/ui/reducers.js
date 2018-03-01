// @flow
import store from '../../index';
import type { Action } from '../actions';
import createReducer from '../../lib/createReducer';
import * as actions from './actions';

let reducers = {};

export type UIState = {
   keyword?:string
}

const DEFAULT_STATE: UIState = {}


export const helloWorld = (state: UIState, action: Action): UIState => {
    return {...state}
};
reducers[actions.TYPES.helloWorld] = helloWorld

export const loadingGallery = (state: UIState, action: Action): UIState => {
    return {...state, loadingGallery:action.payload }
};
reducers[actions.TYPES.loadingGallery] = loadingGallery


export const showResults = (state: UIState, action: Action) => {

      return {
      ...state,
      keyword:action.payload
   }
}
reducers[actions.TYPES.showResults] = showResults;


// UI Reducer
const reducer = createReducer(DEFAULT_STATE, reducers);
export default reducer;
