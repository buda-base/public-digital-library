// @flow
import { createAction } from 'redux-actions';
import type { Action } from '../actions';

export const TYPES = {};

TYPES.helloWorld = 'HELLO_WORLD';
export const helloWorld = createAction(TYPES.helloWorld);


TYPES.showResults = 'SHOW_RESULTS';
export const showResults = (key: string,lang:string): Action => {
   return {
      type: TYPES.showResults,
      payload: { key, lang }
   }
}

TYPES.loadingGallery = 'LOADING_GALLERY';
export const loadingGallery = (manifest: string): Action => {
   return {
      type: TYPES.loadingGallery,
      payload: manifest
   }
}
