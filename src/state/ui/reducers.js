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
   langPreset?:string[],
   langIndex?:number,
   collapse:{[string]:boolean},
   metadata:{[string]:{}},
}

const DEFAULT_STATE: UIState = {
   prefLang:"bo-x-ewts",
   collapse:{"locale":true,"priority":true},
   rightPanel:false
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

export const langPreset = (state: UIState, action: Action): UIState => {
   state =  {...state, langPreset:action.payload }
   if(action.meta != undefined) state = { ...state, langIndex:action.meta }  
   return state
};
reducers[actions.TYPES.langPreset] = langPreset



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

export const updateFacets = (state: UIState, action: actions.LoadingAction) => {

    let update = {}
    let facets = Object.keys(action.meta.facets).map(k => {
        let prop = action.meta.config[k]
        if(k != "tree") {
            update[k] = {}
            console.log("k",k)
            let meta = action.meta.facets[k]
            for(let q of Object.keys(meta)) {
                if(q !== "Any") {
                    update[k][q] = { n:action.meta.facets[k][q].n, elem:action.meta.facets[k][q].elem, i:0}
                    console.log("q",q,meta[q])
                    if(meta[q].elem) for(let e of meta[q].elem) {
                        let flat = {}
                        for(let f of e)  {
                            let val = flat[f.type]
                            if(!val) val = []
                            val.push(f.value)
                            flat[f.type] = val 
                        }
                        //console.log("f",flat)
                        let hasAll = true
                        for(let p of Object.keys(action.payload)) {
                            if(prop !== p) {
                                if(!flat[p] || flat[p].length !== 1 || action.payload.length !== 1 || action.payload[0] !== flat[p][0])
                                {
                                    //console.log("p",p,flat[p])
                                    hasAll = false ;
                                    break ;
                                }
                            }
                        }
                        if(hasAll) update[k][q].i ++ ;
                    }
                }
            }
            console.log("uF",update[k])
        }
    })

    return {
        ...state,
        //loading: action.payload
    }
}
reducers[actions.TYPES.updateFacets] = updateFacets;


// UI Reducer
const reducer = createReducer(DEFAULT_STATE, reducers);
export default reducer;
