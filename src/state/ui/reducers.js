// @flow
import _ from "lodash";
import store from '../../index';
import type { Action } from '../actions';
import createReducer from '../../lib/createReducer';
import * as actions from './actions';

let reducers = {};

export type UIState = {
   anchor?:{},
   keyword?:string,
   loading?: boolean,
   prefLang:string,
   logged?:boolean,
   rightPanel?:boolean,
   langPreset?:string[],
   langIndex?:number,
   collapse:{[string]:boolean},
   metadata:{[string]:{}},
   profileFromUrl?:{}
}

const DEFAULT_STATE: UIState = {
   prefLang:"bo-x-ewts",
   collapse:{"locale":true,"priority":true},
   rightPanel:true
}


export const helloWorld = (state: UIState, action: Action): UIState => {
    return {...state}
};
reducers[actions.TYPES.helloWorld] = helloWorld

export const userProfile = (state: UIState, action: Action): UIState => {
    return { ...state, profileFromUrl:action.payload }
};
reducers[actions.TYPES.userProfile] = userProfile

export const toggleLanguagePanel = (state: UIState, action: Action): UIState => {
    return {...state, rightPanel:!state.rightPanel}
};
reducers[actions.TYPES.toggleLanguagePanel] = toggleLanguagePanel

export const toggleCollapse = (state: UIState, action: Action): UIState => {
    let anchor = action.meta.target
    return {...state, collapse:{...state.collapse, [action.payload]:!state.collapse[action.payload]}, anchor}
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
    if(state.metadata) delete state.metadata 
    return {
        ...state,
        loading: action.payload.isLoading
    }
}
reducers[actions.TYPES.loading] = loading;

export const updateFacets = (state: UIState, action: actions.LoadingAction) => {

    let t = action.meta.datatype
    let key = action.meta.key
    let update = {}
    let facets = Object.keys(action.meta.facets).map(k => {
        let prop = action.meta.config[k]
        let keys = Object.keys(action.payload)
        if(keys.length > 0 && (!action.payload[prop] || keys.length > 1)) {
            update[k] = {}
            //console.log("k",k)

            let meta = action.meta.facets[k]
            let props = Object.keys(meta)
            if(k === "tree") { 
                props = meta["@graph"].map(i => i["@id"].replace(/bdr:/,"http://purl.bdrc.io/resource/"))
                meta = meta["@metadata"]
            }

            let total_i = {}

            for(let q of props) {
                if(q !== "Any") {
                    update[k][q] = { i:0 } 
                    //console.log("q",q,meta[q])

                    if(meta[q] && meta[q].dict) for(let _e of Object.keys(meta[q].dict)) {
                        let e = meta[q].dict[_e]
                        let flat = {}
                        for(let f of e)  {
                            let val = flat[f.type]
                            if(!val) val = []
                            val.push(f.value)
                            flat[f.type] = val 
                        }
                        //console.log("f",flat)
                        let hasAllProp = true
                        for(let p of Object.keys(action.payload)) {
                            let val = action.payload[p]
                            if(val.val) val = val.val 
                            val = _.orderBy(val, (elem) => elem === "unspecified"?1:0) 
                            if(prop !== p && val.indexOf("Any") === -1) {
                                if(!action.payload[p].alt)  { 
                                    let hasAnyVal = false ;
                                    for(let v of val) {
                                        if(v === "unspecified") {
                                            if(flat[p]) { hasAllProp = false ; break ; }
                                            else { hasAnyVal = true ; break; }
                                        }
                                        else {
                                            if(flat[p] && flat[p].indexOf(v) !== -1) {  hasAnyVal = true ; break ;  }
                                        }
                                    }
                                    if(!hasAnyVal) { hasAllProp = false ; break ; }
                                }
                                else {
                                    let alt = action.payload[p].alt
                                    let hasAnyVal = false ;
                                    for(let v of val) {
                                        if(v === "unspecified") {
                                            let hasAlt = false 
                                            for(let a of alt) if(flat[a]) { hasAlt = true ; break ;  }
                                            if(hasAlt) { hasAllProp = false ;  break ; }
                                            else { hasAnyVal = true ; break; }
                                        }
                                        else {
                                            let hasAlt = false 
                                            for(let a of alt) if(flat[a] && flat[a].indexOf(v) !== -1) { hasAlt = true ; break }
                                            if(hasAlt) { hasAnyVal = true; break; } 
                                        }
                                    }
                                    if(!hasAnyVal) { hasAllProp = false; break;  }
                                }
                                if(!hasAllProp) break ;
                            }
                        }
                        if(hasAllProp) { 
                            update[k][q].i ++ ;
                            total_i[_e] = e
                        }
                    }                    
                }
            }
            
            //update[k]["Any"] = { i:0 } //Object.keys(update[k]).reduce((acc,v)=>acc+Number(update[k][v].i),0)  }            
            update[k]["Any"] = { i:Object.keys(total_i).length  }

            console.log("uF",update[k])
        }
    })

    return {
        ...state,
        metadata:{ ... update }
    }
}
reducers[actions.TYPES.updateFacets] = updateFacets;


// UI Reducer
const reducer = createReducer(DEFAULT_STATE, reducers);
export default reducer;
