// @flow
import store from '../../index';
import type { Action } from '../actions';
import createReducer from '../../lib/createReducer';
import * as actions from './actions';

let reducers = {};

export type UIState = {
   keyword?:string,
   loading?: boolean,
   prefLang:string,
   logged?:boolean,
   rightPanel?:boolean,
   collapse:{[string]:boolean}
}

const DEFAULT_STATE: UIState = {
   prefLang:"bo-x-ewts",
   collapse:[]
}


export const helloWorld = (state: UIState, action: Action): UIState => {
    return {...state}
};
reducers[actions.TYPES.helloWorld] = helloWorld

export const toggleLanguagePanel = (state: UIState, action: Action): UIState => {
    return {...state, rightPanel:!state.rightPanel}
};
reducers[actions.TYPES.toggleLanguagePanel] = toggleLanguagePanel

export const toggleCollapse = (state: UIState, action: Action): UIState => {
    return {...state, collapse:{...state.collapse, [action.payload]:!state.collapse[action.payload]}}
};
reducers[actions.TYPES.toggleCollapse] = toggleCollapse

export const closeLanguagePanel = (state: UIState, action: Action): UIState => {
    return {...state, rightPanel:false}
};
reducers[actions.TYPES.closeLanguagePanel] = closeLanguagePanel


export const logEvent = (state: UIState, action: Action): UIState => {
    return {...state, logged:action.payload }
};
reducers[actions.TYPES.logEvent] = logEvent


export const loadingGallery = (state: UIState, action: Action): UIState => {
    return {...state, loadingGallery:action.payload }
};
reducers[actions.TYPES.loadingGallery] = loadingGallery


export const selectType = (state: UIState, action: Action) => {

      return {
      ...state,
      datatype:action.payload
   }
}
reducers[actions.TYPES.selectType] = selectType;

export const setPrefLang = (state: UIState, action: Action) => {

      return {
      ...state,
      prefLang:action.payload
   }
}
reducers[actions.TYPES.setPrefLang] = setPrefLang;


export const showResults = (state: UIState, action: Action) => {

      return {
      ...state,
      keyword:action.payload
   }
}
reducers[actions.TYPES.showResults] = showResults;

export const loading = (state: UIState, action: actions.LoadingAction) => {
    return {
        ...state,
        loading: action.payload.isLoading
    }
}
reducers[actions.TYPES.loading] = loading;


// UI Reducer
const reducer = createReducer(DEFAULT_STATE, reducers);
export default reducer;
