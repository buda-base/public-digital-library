// @flow
import { createAction } from 'redux-actions';
import type { Action } from '../actions';

import logdown from 'logdown'

const loggergen = new logdown('gen', { markdown: false });

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
export const getManifest = (url: string,IRI:string,thumb:string): Action => {
    return {
        type: TYPES.getManifest,
        payload: url,
        meta:{ rid:IRI, thumb }
    }
}

TYPES.gotManifest = 'GOT_MANIFEST';
export const gotManifest = (manifest: {},IRI:string,collecManif?: {}, single?:boolean): Action => {
    return {
        type: TYPES.gotManifest,
        payload: manifest,
        meta:{IRI, collecManif, single}
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
export const gotImageVolumeManifest = (manifest:{},IRI:string,imageList:[]): Action => {
    return {
        type: TYPES.gotImageVolumeManifest,
        payload: manifest,
        meta:{iri:IRI,imageList}
    }
}

TYPES.firstImage = 'FIRST_IMAGE';
export const firstImage = (url: string,iri:string,canvasID:string,collecManif:string,manifests:[],imgData:string,manifestWpdf:{}): Action => {
    return {
        type: TYPES.firstImage,
        payload: url,
        meta:{iri,canvasID,collecManif,manifests,imgData,manifestWpdf}
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


TYPES.getAssocTypes = 'GET_ASSOC_TYPES';
export const getAssocTypes = (rid: string, tag?:string): Action => {
    return {
        type: TYPES.getAssocTypes,
        payload: rid,
        meta:tag
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

TYPES.pdfError = 'PDF_ERROR';
export const pdfError = (code: string, iri:string): Action => {
    return {
        type: TYPES.pdfError,
        payload: code,
        meta:iri
    }
}

TYPES.pdfNotReady = 'PDF_NOT_READY';
export const pdfNotReady = (url: string, iri:string): Action => {
    return {
        type: TYPES.pdfNotReady,
        payload: url,
        meta:iri
    }
}

TYPES.getMonlamResults = 'GET_MONLAM_RESULTS';
export const getMonlamResults = (obj:{}, keyword:string): Action => {
    return {
        type: TYPES.getMonlamResults,
        payload: obj,
        meta: keyword
    }
}

TYPES.gotMonlamResults = 'GOT_MONLAM_RESULTS';
export const gotMonlamResults = (obj:{}): Action => {
    return {
        type: TYPES.gotMonlamResults,
        payload: obj
    }
}

TYPES.closeMonlamResults = 'CLOSE_MONLAM_RESULTS';
export const closeMonlamResults = (): Action => {
    return {
        type: TYPES.closeMonlamResults,
    }
}

TYPES.getSubscribedCollections = 'GET_SUBSCRIBED_COLLECTIONS';
export const getSubscribedCollections = (): Action => {
    return {
        type: TYPES.getSubscribedCollections,
    }
}

TYPES.gotSubscribedCollections = 'GOT_SUBSCRIBED_COLLECTIONS';
export const gotSubscribedCollections = (obj:{}): Action => {
    return {
        type: TYPES.gotSubscribedCollections,
        payload: obj
    }
}

TYPES.etextError = 'ETEXT_ERROR';
export const etextError = (code: string, iri:string): Action => {
    return {
        type: TYPES.etextError,
        payload: code,
        meta:iri
    }
}


TYPES.getCitationLocale = 'GET_CITATION_LOCALE';
export const getCitationLocale = (lg: string): Action => {
    return {
        type: TYPES.getCitationLocale,
        payload:lg
    }
}

TYPES.gotCitationLocale = 'GOT_CITATION_LOCALE';
export const gotCitationLocale = (lg: string, res:string): Action => {
    return {
        type: TYPES.gotCitationLocale,
        payload:lg,
        meta:res
    }
}

TYPES.getCitationStyle = 'GET_CITATION_STYLE';
export const getCitationStyle = (s: string): Action => {
    return {
        type: TYPES.getCitationStyle,
        payload:s
    }
}

TYPES.gotCitationStyle = 'GOT_CITATION_STYLE';
export const gotCitationStyle = (s: string, res:string): Action => {
    return {
        type: TYPES.gotCitationStyle,
        payload:s,
        meta:res
    }
}

TYPES.getCitationData = 'GET_CITATION_DATA';
export const getCitationData = (s: string): Action => {
    return {
        type: TYPES.getCitationData,
        payload:s
    }
}

TYPES.gotCitationData = 'GOT_CITATION_DATA';
export const gotCitationData = (s: string, res:string): Action => {
    return {
        type: TYPES.gotCitationData,
        payload:s,
        meta:res
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


TYPES.getResultsByDate = 'GET_RESULTS_BY_DATE';
export const getResultsByDate = (date:string,t:string): Action => {
    return {
        type: TYPES.getResultsByDate,
        payload:date,
        meta:t
    }
}

TYPES.getResultsById = 'GET_RESULTS_BY_ID';
export const getResultsById = (date:string,t:string): Action => {
    return {
        type: TYPES.getResultsById,
        payload:date,
        meta:t
    }
}

TYPES.getLatestSyncsAsResults = 'GET_LATEST_SYNCS_AS_RESULTS';
export const getLatestSyncsAsResults = (): Action => {
    return {
        type: TYPES.getLatestSyncsAsResults
    }
}

TYPES.getStaticQueryAsResults = 'GET_STATIC_QUERY_AS_RESULTS';
export const getStaticQueryAsResults = (route:string, datatype:string): Action => {
    return {
        type: TYPES.getStaticQueryAsResults,
        payload:route,
        meta:datatype
    }
}


TYPES.getLatestSyncs = 'GET_LATEST_SYNCS';
export const getLatestSyncs = (): Action => {
    return {
        type: TYPES.getLatestSyncs
    }
}

TYPES.gotLatestSyncs = 'GOT_LATEST_SYNCS';
export const gotLatestSyncs = (res,nb): Action => {
    return {
        type: TYPES.gotLatestSyncs,
        payload:res,
        meta:nb
    }
}

TYPES.getOutline = 'GET_OUTLINE';
export const getOutline = (iri: string,node?:{},volFromUri?:string): Action => {
    return {
        type: TYPES.getOutline,
        payload: iri,
        meta:{node, volFromUri}
    }
}

TYPES.gotOutline = 'GOT_OUTLINE';
export const gotOutline = (iri:string, obj: {}): Action => {
    return {
        type: TYPES.gotOutline,
        payload: iri,
        meta:obj
    }
}

TYPES.getETextRefs = 'GET_ETEXTREFS';
export const getETextRefs = (iri: string): Action => {
    return {
        type: TYPES.getETextRefs,
        payload: iri
    }
}

TYPES.gotETextRefs = 'GOT_ETEXTREFS';
export const gotETextRefs = (iri:string, obj: {}): Action => {
    return {
        type: TYPES.gotETextRefs,
        payload: iri,
        meta:obj
    }
}

TYPES.outlineSearch = 'OUTLINE_SEARCH';
export const outlineSearch = (iri:string, kw:string, lg: string): Action => {
    return {
        type: TYPES.outlineSearch,
        payload: kw,
        meta:{lang:lg, iri}
    }
}


TYPES.resetOutlineSearch = 'RESET_OUTLINE_SEARCH';
export const resetOutlineSearch = (): Action => {
    return {
        type: TYPES.resetOutlineSearch
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


TYPES.checkResults = 'CHECK_RESULTS';
export const checkResults = (params: string, route: string): Action => {
    return {
        type: TYPES.checkResults,
        payload: params,
        meta: { route }
    }
}


TYPES.getReproductions = 'GET_REPRODUCTIONS';
export const getReproductions = (uri: string,init?:boolean): Action => {
    return {
        type: TYPES.getReproductions,
        payload: uri,
        meta:init
    }
}

TYPES.gotReproductions = 'GOT_REPRODUCTIONS';
export const gotReproductions = (uri: string, data: {}): Action => {
    return {
        type: TYPES.gotReproductions,
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

   loggergen.log("assocE",iri,res)

    return {
        type: TYPES.gotAssocResources,
        payload: iri,
        meta:res
    }
}


TYPES.getContext = 'GET_CONTEXT';
export const getContext = (iri: string,start:integer,end:integer,nb:integer): Action => {

   loggergen.log("getCtx",iri,start,end)

    return {
        type: TYPES.getContext,
        payload: iri,
        meta: { start, end, nb, }
    }
}

TYPES.gotContext = 'GOT_CONTEXT';
export const gotContext = (search:string, iri: string,start:integer,end:integer,data:{}): Action => {

    return {
        type: TYPES.gotContext,
        payload: search,
        meta: { iri, start, end, data }
    }
}

TYPES.getChunks = 'GET_CHUNKS';
export const getChunks = (iri: string,next:number=0): Action => {

   loggergen.log("getC",iri,next)

    return {
        type: TYPES.getChunks,
        payload: iri,
        meta: next
    }
}

TYPES.getPages = 'GET_PAGES';
export const getPages = (iri: string,next:number=0): Action => {

   loggergen.log("getP",iri,next)

    return {
        type: TYPES.getPages,
        payload: iri,
        meta: next
    }
}


TYPES.gotNextChunks = 'GOT_NEXT_CHUNKS';
export const gotNextChunks = (iri: string,data:{},prev:boolean=false): Action => {

   //loggergen.log("nextC",iri,next,data)

    return {
        type: TYPES.gotNextChunks,
        payload: iri,
        meta: { data, prev }
    }
}

TYPES.gotNextPages = 'GOT_NEXT_PAGES';
export const gotNextPages = (iri: string,data:{},prev:boolean=false): Action => {

   //loggergen.log("nextP",iri,next,data)

    return {
        type: TYPES.gotNextPages,
        payload: iri,
        meta: { data, prev }
    }
}



export type SearchFailedAction = {
    type: string,
    payload: {
        keyword: string,
        error: string,
        language: string,
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
export const searchFailed = (keyword: string, error: string, language:string): SearchFailedAction => {
    return {
        type: TYPES.searchFailed,
        payload: {
            keyword,
            error,
            language
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
export const startSearch = (keyword: string, language: string,datatype?:string[],sourcetype?:string,dontGetDT?:boolean,inEtext?:string): SearchAction => {
    return {
        type: TYPES.startSearch,
        payload: {
            keyword,
            language,
            datatype,
            sourcetype,
            dontGetDT,
            inEtext
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
export const foundDatatypes = (keyword: string, language:"",results: [], tag?:string): FoundResultsAction => {
    return {
        type: TYPES.foundDatatypes,
        payload: {
            keyword,
            language,
            results,
            tag
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
