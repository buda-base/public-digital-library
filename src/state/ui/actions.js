// @flow
import { createAction } from 'redux-actions';
import type { Action } from '../actions';
import { extendedPresets } from '../../lib/transliterators';

export const TYPES = {};

TYPES.helloWorld = 'HELLO_WORLD';
export const helloWorld = createAction(TYPES.helloWorld);

TYPES.toggleLanguagePanel = 'TOGGLE_LANGUAGE_PANEL';
export const toggleLanguagePanel = createAction(TYPES.toggleLanguagePanel);

TYPES.toggleCollapse = 'TOGGLE_COLLAPSE';
export const toggleCollapse = (txt:string,target?:{},value?:string): Action => {
   return {
      type: TYPES.toggleCollapse,
      payload: txt,
      meta:{target,value}
   }
}

TYPES.showResults = 'SHOW_RESULTS';
export const showResults = (key: string,lang:string): Action => {
   return {
      type: TYPES.showResults,
      payload: { key, lang }
   }
}

TYPES.selectType = 'SELECT_TYPE';
export const selectType = (datatype: string): Action => {
   return {
      type: TYPES.selectType,
      payload: datatype
   }
}

TYPES.useDLD = 'USE_DLD';
export const useDLD = (): Action => {
   return {
      type: TYPES.useDLD,
      payload: true
   }
}

TYPES.feedbucket = 'FEEDBUCKET';
export const feedbucket = (cls: string): Action => {
   return {
      type: TYPES.feedbucket,
      payload: cls
   }
}

TYPES.langPreset = 'LANG_PRESET';
export const langPreset = (lang: string[],i?:number): Action => {
   let ext = extendedPresets(lang)
   let meta = {i,ext}
   return {
      type: TYPES.langPreset,
      payload: lang,
      meta
   }
}

TYPES.advancedSearch = 'ADVANCED_SEARCH';
export const advancedSearch = (s: boolean): Action => {
   return {
      type: TYPES.advancedSearch,
      payload: s
   }
}


TYPES.logEvent = 'LOG_EVENT';
export const logEvent = (login: boolean): Action => {
   return {
      type: TYPES.logEvent,
      payload: login
   }
}

TYPES.setType = 'SET_TYPE';
export const setType = (t: string): Action => {
   return {
      type: TYPES.setType,
      payload: t
   }
}

TYPES.closePortraitPopup = 'CLOSE_PORTRAIT_POPUP';
export const closePortraitPopup = (): Action => {
   return {
      type: TYPES.closePortraitPopup,
   }
}

TYPES.newUser = 'NEW_USER';
export const newUser = (isNew): Action => {
   return {
      type: TYPES.newUser,
      payload: isNew,
   }
}


TYPES.setPrefLang = 'SET_PREFLANG';
export const setPrefLang = (lang: string): Action => {
   return {
      type: TYPES.setPrefLang,
      payload: lang
   }
}

TYPES.setEtextLang = 'SET_ETEXTLANG';
export const setEtextLang = (lang: string): Action => {
   return {
      type: TYPES.setEtextLang,
      payload: lang
   }
}

TYPES.loadingGallery = 'LOADING_GALLERY';
export const loadingGallery = (manifest: string): Action => {
   return {
      type: TYPES.loadingGallery,
      payload: manifest
   }
}


TYPES.updateFacets = 'UPDATE_FACETS';
export const updateFacets = (key:string,datatype:string,facets: {[string]:string []}, exclude: {[string]:string []}, meta:{[string]:{}}, cfg:{[string]:string}): Action => {
   return {
      type: TYPES.updateFacets,
      payload: facets,
      meta:{facets:meta,config:cfg,key,datatype,exclude}
   }
}


TYPES.userProfile = 'USER_PROFILE';
export const userProfile = (url: {}): Action => {
   return {
      type: TYPES.userProfile,
      payload: url
   }
}


TYPES.gotUserID = 'GOT_USER_ID';
export const gotUserID = (userID: url, etag: string): Action => {
   return {
      type: TYPES.gotUserID,
      payload: userID,
      meta: etag
   }
}

TYPES.gotHighlight = 'GOT_HIGHLIGHT';
export const gotHighlight = (uri:uri,key:string,lang:string): Action => {
   return {
      type: TYPES.gotHighlight,
      payload: uri,
      meta: {key,lang}
   }
}

TYPES.updateSortBy = 'UPDATE_SORT_BY';
export const updateSortBy = (i: string, t:string): Action => {
   return {
      type: TYPES.updateSortBy,
      payload: i,
      meta: t
   }
}

export type LoadingAction = {
    type: string,
    payload: {
        keyword: string,
        isLoading: boolean
    }
}


TYPES.loading = 'LOADING';
export const loading = (key: string, isLoading: boolean): LoadingAction => {
    return {
        type: TYPES.loading,
        payload: {
            keyword: key,
            isLoading
        }
    }
}



TYPES.browse = 'BROWSE';
export const browse = (param:string,value?:string,checked?:boolean,next?:string): Action => {
   return {
      type: TYPES.browse,
      payload:  param,
      meta: { value, checked, next }
   }
}