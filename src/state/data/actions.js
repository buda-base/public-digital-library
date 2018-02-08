// @flow
import { createAction } from 'redux-actions';
import type { Action } from '../actions';

export const TYPES = {};

TYPES.loadedConfig = 'LOADED_CONFIG';
export const loadedConfig = (config: {}): Action => {
    return {
        type: TYPES.loadedConfig,
        payload: config
    }
}

TYPES.choosingHost = 'CHOOSING_HOST';
export const choosingHost = (host: string): Action => {
    return {
        type: TYPES.choosingHost,
        payload: host
    }
}

TYPES.chosenHost = 'CHOSEN_HOST';
export const chosenHost = (host: string): Action => {
    return {
        type: TYPES.chosenHost,
        payload: host
    }
}

export type SearchFailedAction = {
    type: string,
    payload: {
        keyword: string,
        error: string
    }
}

TYPES.hostError = 'HOST_ERROR';
export const hostError = (keyword: string, error: string): SearchFailedAction => {
    return {
        type: TYPES.hostError,
        payload: {
            keyword,
            error
        }
    }
}

TYPES.searchFailed = 'SEARCH_FAILED';
export const searchFailed = (keyword: string, error: string): SearchFailedAction => {
    return {
        type: TYPES.searchFailed,
        payload: {
            keyword,
            error
        }
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

TYPES.searchingKeyword = 'SEARCHING_KEYWORD';
export const searchingKeyword = createAction(TYPES.searchingKeyword);


export type FoundResultsAction = {
    type: string,
    payload: {
        key: string,
        results: []
    }
}
 
TYPES.foundResults = 'FOUND_RESULTS';
export const foundResults = (key: string, results: []): FoundResultsAction => {
    return {
        type: TYPES.foundResults,
        payload: {
            key,
            results
        }
    }
}
