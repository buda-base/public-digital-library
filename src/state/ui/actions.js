// @flow
import { createAction } from 'redux-actions';
import type { Action } from '../actions';

export const TYPES = {};

TYPES.helloWorld = 'HELLO_WORLD';
export const helloWorld = createAction(TYPES.helloWorld);

TYPES.toggleLanguagePanel = 'TOGGLE_LANGUAGE_PANEL';
export const toggleLanguagePanel = createAction(TYPES.toggleLanguagePanel);

TYPES.toggleCollapse = 'TOGGLE_COLLAPSE';
export const toggleCollapse = (txt:string): Action => {
   return {
      type: TYPES.toggleCollapse,
      payload: txt
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


TYPES.logEvent = 'LOG_EVENT';
export const logEvent = (login: boolean): Action => {
   return {
      type: TYPES.logEvent,
      payload: login
   }
}


TYPES.setPrefLang = 'SET_PREFLANG';
export const setPrefLang = (lang: string): Action => {
   return {
      type: TYPES.setPrefLang,
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
