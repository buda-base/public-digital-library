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

TYPES.loadedOntology = 'LOADED_ONTOLOGY';
export const loadedOntology = (onto: {}): Action => {
    return {
        type: TYPES.loadedOntology,
        payload: onto
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

/*
TYPES.searchingKeyword = 'SEARCHING_KEYWORD';
export const searchingKeyword = createAction(TYPES.searchingKeyword);
*/


export type SearchAction = {
    type: TYPES.SearchAction,
    payload: {
        property?:string,
        datatype?:string[],
        keyword: string,
        language: string
    }
}

TYPES.searchingKeyword = 'SEARCHING_KEYWORD';
export const searchingKeyword = (keyword: string, language: string, datatype:string[]): SearchAction => {
    return {
        type: TYPES.searchingKeyword,
        payload: {
            datatype,
            keyword,
            language
        }
    }
}

TYPES.getDatatypes = 'GET_DATATYPES';
export const getDatatypes = (keyword: string, language: string): SearchAction => {
    return {
        type: TYPES.getDatatypes,
        payload: {
            keyword,
            language
        }
    }
}

TYPES.getFacetInfo = 'GET_FACET_INFO';
export const getFacetInfo = (keyword: string, language: string, property:string): SearchAction => {
    return {
        type: TYPES.getFacetInfo,
        payload: {
            property,
            keyword,
            language
        }
    }
}

TYPES.getOneDatatype = 'GET_ONE_DATATYPE';
export const getOneDatatype = (datatype: string[],keyword: string, language: string): Action => {
    return {
        type: TYPES.getOneDatatype,
        payload: {
            datatype,
            keyword,
            language
        }
    }
}

TYPES.notGettingDatatypes = 'NOT_GETTING_DATATYPES';
export const notGettingDatatypes = createAction(TYPES.notGettingDatatypes);


export type FoundResultsAction = {
    type: TYPES.FoundResultsAction,
    payload: {
        key: string,
        lang: string,
        property?:string,
        results: []
    }
}

TYPES.foundResults = 'FOUND_RESULTS';
export const foundResults = (key: string, lang:string, results: []): FoundResultsAction => {
    return {
        type: TYPES.foundResults,
        payload: {
            key,
            lang,
            results
        }
    }
}

TYPES.foundDatatypes = 'FOUND_DATATYPES';
export const foundDatatypes = (key: string, results: []): FoundResultsAction => {
    return {
        type: TYPES.foundDatatypes,
        payload: {
            key,
            results
        }
    }
}

TYPES.foundFacetInfo = 'FOUND_FACET_INFO';
export const foundFacetInfo = (key: string,lang:string,property:string, results: []): FoundResultsAction => {
    return {
        type: TYPES.foundFacetInfo,
        payload: {
            key,
            lang,
            property,
            results
        }
    }
}
