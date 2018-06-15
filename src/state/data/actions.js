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

TYPES.getManifest = 'GET_MANIFEST';
export const getManifest = (url: string,IRI:string): Action => {
    return {
        type: TYPES.getManifest,
        payload: url,
        meta:IRI
    }
}

TYPES.firstImage = 'FIRST_IMAGE';
export const firstImage = (url: string,iri:string): Action => {
    return {
        type: TYPES.firstImage,
        payload: url,
        meta:iri
    }
}

TYPES.chosenHost = 'CHOSEN_HOST';
export const chosenHost = (host: string): Action => {
    return {
        type: TYPES.chosenHost,
        payload: host
    }
}

TYPES.noResource = 'NO_RESOURCE';
export const noResource = (iri: string, error:string): Action => {
    return {
        type: TYPES.noResource,
        payload: iri,
        meta:error
    }
}


TYPES.gotResource = 'GOT_RESOURCE';
export const gotResource = (iri: string,res:{}): Action => {
    return {
        type: TYPES.gotResource,
        payload: iri,
        meta:res
    }
}

TYPES.gotAssocResources = 'GOT_ASSOCIATED_RESOURCES';
export const gotAssocResources = (iri: string,res:{}): Action => {

   console.log("assocE",iri,res)

    return {
        type: TYPES.gotAssocResources,
        payload: iri,
        meta:res
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

TYPES.manifestError = 'MANIFEST_ERROR';
export const manifestError = (url: string, error: string,iri:string): SearchFailedAction => {
    return {
        type: TYPES.manifestError,
        payload: {
            keyword:url,
            error
        },
        meta:iri
    }
}

/*
TYPES.searchingKeyword = 'SEARCHING_KEYWORD';
export const searchingKeyword = createAction(TYPES.searchingKeyword);
*/


export type SearchAction = {
    type: TYPES.SearchAction,
    payload: {
        sourcetype?:string,
        property?:string,
        datatype?:string[],
        keyword: string,
        language: string,
        facet?: {[string]:string}
    }
};

TYPES.startSearch = 'START_SEARCH';
export const startSearch = (keyword: string, language: string,datatype?:string[],sourcetype?:string): SearchAction => {
    return {
        type: TYPES.startSearch,
        payload: {
            keyword,
            language,
            datatype,
            sourcetype
        }
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

TYPES.getOneFacet = 'GET_ONE_FACET';
export const getOneFacet = (keyword: string, language: string, facet:{[string]:string}): Action => {
    return {
        type: TYPES.getOneFacet,
        payload: {
            facet,
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
        keyword: string,
        language: string,
        //property?:string,
        datatype?:string[],
        results: []
    }
}

TYPES.foundResults = 'FOUND_RESULTS';
export const foundResults = (keyword: string, language:string, results: [], datatype?:string[]): FoundResultsAction => {
    return {
        type: TYPES.foundResults,
        payload: {
            keyword,
            language,
            results,
            datatype
        }
    }
}

TYPES.foundDatatypes = 'FOUND_DATATYPES';
export const foundDatatypes = (keyword: string, results: []): FoundResultsAction => {
    return {
        type: TYPES.foundDatatypes,
        payload: {
            keyword,
            results
        }
    }
}

TYPES.foundFacetInfo = 'FOUND_FACET_INFO';
export const foundFacetInfo = (keyword: string,language:string,datatype:string[], results: []): FoundResultsAction => {
    return {
        type: TYPES.foundFacetInfo,
        payload: {
            keyword,
            language,
            datatype,
            //property,
            results
        }
    }
}
