// @flow
import { createAction } from 'redux-actions';
import type { Action } from '../actions';

export const TYPES = {};

TYPES.helloWorld = 'HELLO_WORLD';
export const helloWorld = createAction(TYPES.helloWorld);


TYPES.showResults = 'SHOW_RESULTS';
export const showResults = (key: string): Action => {
   return {
      type: TYPES.showResults,
      payload: key
   }
}
