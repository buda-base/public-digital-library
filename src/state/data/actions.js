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

TYPES.loadedDictionary = 'LOADED_DICTIONARY';
export const loadedDictionary = (dico: {}): Action => {
    return {
        type: TYPES.loadedDictionary,
        payload: dico
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

TYPES.gotManifest = 'GOT_MANIFEST';
export const gotManifest = (manifest: {},IRI:string): Action => {
    return {
        type: TYPES.gotManifest,
        payload: manifest,
        meta:IRI
    }
}

TYPES.getImageVolumeManifest = 'GET_IMAGE_VOLUME_MANIFEST';
export const getImageVolumeManifest = (url: string,IRI:string): Action => {
    return {
        type: TYPES.getImageVolumeManifest,
        payload: url,
        meta:IRI
    }
}

TYPES.gotImageVolumeManifest = 'GOT_IMAGE_VOLUME_MANIFEST';
export const gotImageVolumeManifest = (manifest:{},IRI:string): Action => {
    return {
        type: TYPES.gotImageVolumeManifest,
        payload: manifest,
        meta:IRI
    }
}

TYPES.firstImage = 'FIRST_IMAGE';
export const firstImage = (url: string,iri:string,canvasID:string,collecManif:string,manifests:[],imgData:string): Action => {
    return {
        type: TYPES.firstImage,
        payload: url,
        meta:{iri,canvasID,collecManif,manifests,imgData}
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

TYPES.initPdf = 'INIT_PDF';
export const initPdf = (iri: string,link:string): Action => {
    return {
        type: TYPES.initPdf,
        payload: link,
        meta:iri
    }
}

TYPES.requestPdf = 'REQUEST_PDF';
export const requestPdf = (iri: string,link:string): Action => {
    return {
        type: TYPES.requestPdf,
        payload: link,
        meta:iri
    }
}
TYPES.pdfVolumes = 'PDF_VOLUMES';
export const pdfVolumes = (iri: string,data:{}): Action => {
    return {
        type: TYPES.pdfVolumes,
        payload: data,
        meta:iri
    }
}


TYPES.createPdf = 'CREATE_PDF';
export const createPdf = (url: string, iri:string): Action => {
    return {
        type: TYPES.createPdf,
        payload: url,
        meta:iri
    }
}

TYPES.pdfReady = 'PDF_READY';
export const pdfReady = (url: string, iri:string): Action => {
    return {
        type: TYPES.pdfReady,
        payload: url,
        meta:iri
    }
}


TYPES.resetSearch = 'RESET_SEARCH';
export const resetSearch = (): Action => {
    return {
        type: TYPES.resetSearch
    }
}

TYPES.ontoSearch = 'ONTO_SEARCH';
export const ontoSearch = (k: string): Action => {
    return {
        type: TYPES.ontoSearch,
        payload: k
    }
}


TYPES.gotUserEditPolicies = 'GOT_USER_EDIT_POLICIES';
export const gotUserEditPolicies = (data: {}): Action => {
    return {
        type: TYPES.gotUserEditPolicies,
        payload: data
    }
}
    

TYPES.getUser = 'GET_USER';
export const getUser = (profile: string): Action => {
    return {
        type: TYPES.getUser,
        payload: profile
    }
}


TYPES.getInstances = 'GET_INSTANCES';
export const getInstances = (uri: string,init?:boolean): Action => {
    return {
        type: TYPES.getInstances,
        payload: uri,
        meta:init
    }
}

TYPES.gotInstances = 'GOT_INSTANCES';
export const gotInstances = (uri: string, data: {}): Action => {
    return {
        type: TYPES.gotInstances,
        payload: uri,
        meta: data
    }
}

TYPES.getResetLink = 'GET_RESET_LINK';
export const getResetLink = (userID: string, user:{}, profile: {}): Action => {
    return {
        type: TYPES.getResetLink,
        payload: userID,
        meta: { profile, user }
    }
}

TYPES.getResource = 'GET_RESOURCE';
export const getResource = (iri: string): Action => {
    return {
        type: TYPES.getResource,
        payload: iri
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

TYPES.getAnnotations = 'GET_ANNOTATIONS';
export const getAnnotations = (iri: string): Action => {
    return {
        type: TYPES.getAnnotations,
        payload: iri
    }
}

TYPES.gotAnnoResource = 'GOT_ANNO_RESOURCE';
export const gotAnnoResource = (iri: string,data:{},collecId:string): Action => {
    return {
        type: TYPES.gotAnnoResource,
        payload: iri,
        meta:{data,collecId}
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


TYPES.getChunks = 'GET_CHUNKS';
export const getChunks = (iri: string,next:number=0): Action => {

   console.log("getC",iri,next)

    return {
        type: TYPES.getChunks,
        payload: iri,
        meta: next
    }
}

TYPES.getPages = 'GET_PAGES';
export const getPages = (iri: string,next:number=0): Action => {

   console.log("getP",iri,next)

    return {
        type: TYPES.getPages,
        payload: iri,
        meta: next
    }
}


TYPES.gotNextChunks = 'GOT_NEXT_CHUNKS';
export const gotNextChunks = (iri: string,data:{},prev:boolean=false): Action => {

   //console.log("nextC",iri,next,data)

    return {
        type: TYPES.gotNextChunks,
        payload: iri,
        meta: { data, prev }
    }
}

TYPES.gotNextPages = 'GOT_NEXT_PAGES';
export const gotNextPages = (iri: string,data:{}): Action => {

   //console.log("nextP",iri,next,data)

    return {
        type: TYPES.gotNextPages,
        payload: iri,
        meta: data
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
export const startSearch = (keyword: string, language: string,datatype?:string[],sourcetype?:string,dontGetDT?:boolean): SearchAction => {
    return {
        type: TYPES.startSearch,
        payload: {
            keyword,
            language,
            datatype,
            sourcetype,
            dontGetDT
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
export const foundDatatypes = (keyword: string, language:"",results: []): FoundResultsAction => {
    return {
        type: TYPES.foundDatatypes,
        payload: {
            keyword,
            language,
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
