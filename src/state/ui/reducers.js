// @flow
import _ from "lodash";
import store from '../../index';
import type { Action } from '../actions';
import createReducer from '../../lib/createReducer';
import * as actions from './actions';
import {auth} from '../../routes';
import {isGroup} from '../../components/App';

let reducers = {};

export type UIState = {
   etag?:string,
   userID?:url,
   anchor?:{},
   keyword?:string,
   loading?: boolean,
   prefLang:string,
   logged?:boolean,
   rightPanel?:boolean,
   langPreset?:string[],
   langExt?:string[],
   langIndex?:number,
   collapse:{[string]:boolean},
   metadata:{[string]:{}},
   profileFromUrl?:{},
   sortBy?:string,
   topicParents?:{},
   highlight?:{
       uri:string,
       key:lang,
       lang:string 
    },
    type?:string,
    browse?:{},
    feedbucket:string
}

const DEFAULT_STATE: UIState = {
   prefLang:"bo-x-ewts",
   collapse:{"locale":true,"priority":true},
   type:"work",
   feedbucket:""
   //rightPanel:true
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
   if(action.meta) {
        if(action.meta.i != undefined) state.langIndex = action.meta.i 
        if(action.meta.ext) state.langExt = action.meta.ext 
   }
   return state
};
reducers[actions.TYPES.langPreset] = langPreset


export const logEvent = (state: UIState, action: Action): UIState => {
    return {...state, logged:action.payload }
};
reducers[actions.TYPES.logEvent] = logEvent


export const closePortraitPopup = (state: UIState, action: Action): UIState => {
    return {...state, portraitPopupClosed: true }
};
reducers[actions.TYPES.closePortraitPopup] = closePortraitPopup


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



export const setType = (state: UIState, action: Action) => {

      return {
      ...state,
      type:action.payload
   }
}
reducers[actions.TYPES.setType] = setType;



export const useDLD = (state: UIState, action: Action) => {

    return {
    ...state,
    useDLD:true
 }
}
reducers[actions.TYPES.useDLD] = useDLD;


export const feedbucket = (state: UIState, action: Action) => {

    return {
    ...state,
    feedbucket:action.payload
 }
}
reducers[actions.TYPES.feedbucket] = feedbucket;


export const setEtextLang = (state: UIState, action: Action) => {

      return {
      ...state,
      etextLang:action.payload
   }
}
reducers[actions.TYPES.setEtextLang] = setEtextLang;


export const showResults = (state: UIState, action: Action) => {

      return {
      ...state,
      keyword:action.payload
   }
}
reducers[actions.TYPES.showResults] = showResults;

export const gotUserID = (state: UIState, action: Action) => {

      return {
      ...state,
      userID:action.payload,
      etag:action.meta
   }
}
reducers[actions.TYPES.gotUserID] = gotUserID ;


export const gotHighlight = (state: UIState, action: Action) => {

    return {
      ...state,
      highlight:{uri:action.payload,key:action.meta.key,lang:action.meta.lang}
   }
}
reducers[actions.TYPES.gotHighlight] = gotHighlight ;


export const loading = (state: UIState, action: actions.LoadingAction) => {
    if(state.metadata) delete state.metadata 
    return {
        ...state,
        loading: action.payload.isLoading
    }
}
reducers[actions.TYPES.loading] = loading;


export const browse = (state: UIState, action: actions.Action) => {
    let browse = state.browse
    if(!browse) browse = {}
    if(!browse.path) browse.path = []
    if(!browse.path.includes(action.payload)) browse.path.push(action.payload)    

    let j = browse.path.indexOf(action.payload)    
    if(action.meta?.checked === false || j < browse.path.length - 1 && j > 0) {
        
        for(let i = j+1 ; i < browse.path.length ; i ++) {
            if(browse.checked[browse.path[i]]) delete browse.checked[browse.path[i]]
            if(i > 0) delete browse.path[i]
        }
        browse.path = browse.path.filter(p => p)

    }
    
    if(action.meta.next && !browse.path.includes(action.meta.next)) browse.path.push(action.meta.next)

    if(action.meta?.checked !== undefined) {
        if(!browse.checked) browse.checked = {}
        if(action.meta.checked) browse.checked[action.payload] = action.meta.value
        else if(browse.checked[action.payload]) delete browse.checked[action.payload]
    }

    browse.time = Date.now()


    console.log("redu:",browse.path,state.browse?.path)

    return {
        ...state,
        browse
    }
}
reducers[actions.TYPES.browse] = browse;



export const updateSortBy = (state: UIState, action: Action) => {

    return {
        ...state,
        sortBy:action.payload
   }
}
reducers[actions.TYPES.updateSortBy] = updateSortBy;

export const newUser = (state: UIState, action: Action) => {

    return {
        ...state,
        isNewUser:action.payload
   }
}
reducers[actions.TYPES.newUser] = newUser;

export const updateFacets = (state: UIState, action: actions.LoadingAction) => {

    let t = action.meta.datatype
    let key = action.meta.key
    let update = {}
    let topicParents, genresParents

    // #548
    const _tmp = "http://purl.bdrc.io/ontology/tmp/"
    const removeUnreleased = !isGroup(auth, "editors")  // || !action.payload[_tmp+"nonReleasedItems"]
    console.log("removeU:",removeUnreleased)

    let facets = Object.keys(action.meta.facets)
    facets.map(k => {
        let prop = action.meta.config[k]
        let keys = Object.keys(action.payload)        
        if(keys.length > 0 && (!action.payload[prop] || keys.length >= 1)) {

            let meta = action.meta.facets[k]
            let props = Object.keys(meta)
            
            //console.log("k:",k,prop,meta,props)

            if(k === "tree" && meta["@graph"]) { 
                topicParents = meta["parents"]
                props = meta["@graph"].map(i => i["@id"].replace(/bdr:/,"http://purl.bdrc.io/resource/"))
                meta = meta["@metadata"]
            }
            if(k === "genres" && meta["@graph"]) { 
                genresParents = meta["parents"]
                props = meta["@graph"].map(i => i["@id"].replace(/bdr:/,"http://purl.bdrc.io/resource/"))
                meta = meta["@metadata"]
            }

            if(action.payload[prop] && keys.length == 1) return

            update[k] = {}
            let total_i = {}

            for(let q of props) {
                if(q !== "Any") {
                    update[k][q] = { i:0 } 

                    //console.log("q",q,meta[q].dict)

                    if(meta && meta[q] && meta[q].dict) for(let _e of Object.keys(meta[q].dict)) {
                        let e = meta[q].dict[_e]
                        let flat = {}
                        
                        //console.log("_e:",_e, e);

                        for(let f of e)  {
                            
                            if(!f) continue ; 

                            let val = flat[f.type]
                            if(!val) val = []
                            val.push(f.value)
                            flat[f.type] = val 
                        }
                        //console.log("f",flat)

                        // #548
                        let hasAllProp = true 
                        if(removeUnreleased && e.some( a => a.type === _tmp+"status" &&  a.value && !a.value.endsWith("Released")))  hasAllProp = false

                        if(hasAllProp) for(let p of Object.keys(action.payload)) {

                            //console.log("p",p)

                            let val = action.payload[p]
                            if(val.val) val = val.val 
                            val = _.orderBy(val, (elem) => elem === "unspecified"?1:0) 
                            if(prop !== p && val.indexOf("Any") === -1) {

                                let exclude
                                if(action.meta.exclude) exclude = action.meta.exclude[p]

                                //console.log("excl",p,exclude)

                                if(exclude && exclude.length)
                                {
                                     if(!action.payload[p].alt)  {
                                        let hasAnyVal = true ;
                                        for(let v of exclude) {
                                            if(v === "unspecified") { 
                                                if(!flat[p]) { hasAnyVal = false;  break ;  }
                                            }
                                            else if(flat[p] && flat[p].indexOf(v) !== -1) { hasAnyVal = false;  break ;  }
                                        }
                                        if(!hasAnyVal) { hasAllProp = false ; break ; }
                                     }
                                     else {
                                        let alt = action.payload[p].alt
                                        let hasAnyVal = true ;
                                        for(let v of exclude) {
                                            if(v === "unspecified") {
                                                let hasAlt = false 
                                                for(let a of alt) if(flat[a]) { hasAlt = true ; break ;  }
                                                if(!hasAlt) { hasAllProp = false ;  break ; }
                                            }
                                            else {
                                                let hasAlt = false 
                                                for(let a of alt) if(flat[a] && flat[a].indexOf(v) !== -1) { hasAlt = true ; break }
                                                if(hasAlt) { hasAnyVal = false; break; }
                                            }
                                        }
                                        if(!hasAnyVal) { hasAllProp = false ; break ; }
                                     }
                                }
                                else if(!action.payload[p].alt)  {
                                    let hasAnyVal = false ;
                                    for(let v of val) {
                                        if(v === "unspecified")  { 
                                            if(flat[p]) { hasAllProp = false ; break ; }
                                            else { hasAnyVal = true ; break; }                                            
                                        }
                                        else if(flat[p] && flat[p].indexOf(v) !== -1) { hasAnyVal = true;  break ;  }
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
                            //console.log("hasAll")
                            update[k][q].i ++ ;
                            total_i[_e] = e
                        }
                        else {

                            //console.log("hasNot")
                        }
                    }    
                }
            }
            
            //update[k]["Any"] = { i:0 } //Object.keys(update[k]).reduce((acc,v)=>acc+Number(update[k][v].i),0)  }            
            update[k]["Any"] = { i:Object.keys(total_i).length  }

            //console.log("uF",update[k])
        }
    })

    return {
        ...state,
        metadata:{ ... update },
        topicParents,
        genresParents
    }
}
reducers[actions.TYPES.updateFacets] = updateFacets;


// UI Reducer
const reducer = createReducer(DEFAULT_STATE, reducers);
export default reducer;
