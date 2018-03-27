// @flow
import type { Action } from '../actions';
import createReducer from '../../lib/createReducer';
import * as actions from './actions';

let reducers = {};

export type DataState = {
   searches:{keyword?:string,[keyword:string]:{}|null},
   failures: {[string]: string},
   config: { //[string]: {}},
      ldspdi:{
         endpoints:string[],
         index:number
      }
   },
   loading: {[string]: boolean},
   gettingDatatypes: boolean,
   datatypes?:boolean|{}
}

const DEFAULT_STATE: DataState = {
   searches:{},
   failures:{},
   loading:{},
   gettingDatatypes:false,
   config: {
      ldspdi:{
         endpoints:["http://buda1.bdrc.io:13280"],
         index:0
      }
   },
}

export const loadedConfig = (state: DataState, action: Action) => {
    return {
        ...state,
        config: action.payload
    }
}
reducers[actions.TYPES.loadedConfig] = loadedConfig;

export const loadedOntology = (state: DataState, action: Action) => {
    return {
        ...state,
        ontology: action.payload
    }
}
reducers[actions.TYPES.loadedOntology] = loadedOntology;

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
        gettingDatatypes:false,
        datatypes:null,
        searches:{
           ...state.searches,
           ... action.payload ? {[action.payload.keyword+"@"+action.payload.language]:null,keyword:action.payload.keyword}:{}

        }
    }
}
reducers[actions.TYPES.searchingKeyword] = searchingKeyword;

export const getDatatypes = (state: DataState, action: Action) => {
    return {
        ...state,
        gettingDatatypes:true,
        datatypes:true
    }
}
reducers[actions.TYPES.getDatatypes] = getDatatypes;

export const notGettingDatatypes = (state: DataState, action: Action) => {
    return {
        ...state,
        gettingDatatypes:false
    }
}
reducers[actions.TYPES.notGettingDatatypes] = notGettingDatatypes;


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
            [action.payload.key + "@" + action.payload.lang]: action.payload.results
            }
   }
}
reducers[actions.TYPES.foundResults] = foundResults;

export const foundDatatypes = (state: DataState, action: actions.FoundResultsAction) => {

      return {
      ...state,
      datatypes : action.payload.results
   }
}
reducers[actions.TYPES.foundDatatypes] = foundDatatypes;

// Data Reducer
const reducer = createReducer(DEFAULT_STATE, reducers);
export default reducer;
