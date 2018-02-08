// @flow
import type { Action } from '../actions';
import createReducer from '../../lib/createReducer';
import * as actions from './actions';

let reducers = {};

export type DataState = {
   searches:{[keyword:string]:{}|null},
   failures: {[string]: string},
   config: {[string]: {}},
   loading: {[string]: boolean}
}

const DEFAULT_STATE: DataState = {
   searches:{},
   failures:{},
   config:{},
   loading:{}
}

export const loadedConfig = (state: DataState, action: Action) => {
    return {
        ...state,
        config: action.payload
    }
}
reducers[actions.TYPES.loadedConfig] = loadedConfig;

export const hostError = (state: DataState, action: actions.SearchFailedAction) => {
    return {
        ...state,
        failures: {
            ...state.failures,
            host: action.payload.error
        }
    }
}
reducers[actions.TYPES.hostError] = hostError;



export const chosenHost = (state: DataState, action: Action) => {

console.log(state);

    state = {
        ...state,
        config:
        {
           ...state.config,
           ldspdi:
           {
             ...state.config.ldspdi,
             index:state.config.ldspdi.endpoints.indexOf(action.payload)
           }
        },
        /*
        failures: {
            ...state.failures,
            host: null
        }
        */
    }
    return state ;
}
reducers[actions.TYPES.chosenHost] = chosenHost;



export const searchingKeyword = (state: DataState, action: Action) => {
    return {
        ...state,
        searches:{
           ...state.searches,
           ... action.payload ? {[action.payload]:null}:{}
        }
    }
}
reducers[actions.TYPES.searchingKeyword] = searchingKeyword;


export const loading = (state: DataState, action: actions.LoadingAction) => {
    return {
        ...state,
        loading: {
            ...state.loading,
            [action.payload.keyword]: action.payload.isLoading
        }
    }
}
reducers[actions.TYPES.loading] = loading;


export const foundResults = (state: DataState, action: actions.FoundResultsAction) => {

      return {
      ...state,

      searches: {
            ...state.searches,
            [action.payload.key]: action.payload.results
            }
   }
}
reducers[actions.TYPES.foundResults] = foundResults;


// Data Reducer
const reducer = createReducer(DEFAULT_STATE, reducers);
export default reducer;
