// @flow
import type { Action } from '../actions';
import type {SearchAction,SearchFailedAction} from './actions';
import createReducer from '../../lib/createReducer';
import * as actions from './actions';

let reducers = {};

export type DataState = {
   iri?:string,
   resources?:{[string]:{}},
   assocResources?:{[string]:{}},
   facets?:{[string]:boolean|{}},
   keyword?:string,
   language?:string,
   searches:{[keyword:string]:{}|null},
   failures: {[string]: string},
   config?: { //[string]: {}},
      ldspdi:{
         endpoints:string[],
         index:number
      }
   },
   datatypes?:boolean|{},
   IIIFinfo:{
      [string]:{
         imageAsset?:{},
         firstImage?:string
      }
   }
}

const DEFAULT_STATE: DataState = {
   searches:{},
   failures:{},
   loading:{}
   //firstImage:"http://iiif.bdrc.io/image/v2/bdr:V22084_I0886::08860003.tif/full/full/0/default.jpg"
   //firstImage:"http://iiif.bdrc.io/image/v2/bdr:V1KG2788_I1KG3143::I1KG31430003.tif/full/full/0/default.jpg"
}

export const loadedConfig = (state: DataState, action: Action) => {
    return {
        ...state,
        config: action.payload
    }
}
reducers[actions.TYPES.loadedConfig] = loadedConfig;

export const loadedOntology = (state: DataState, action: Action) => {
    return {
        ...state,
        ontology: action.payload
    }
}
reducers[actions.TYPES.loadedOntology] = loadedOntology;


export const gotResource = (state: DataState, action: Action) => {
    return {
        ...state,
        "resources": {
           ...state.resources,
           [action.payload]:action.meta
       }
    }
}
reducers[actions.TYPES.gotResource] = gotResource;

export const noResource = (state: DataState, action: Action) => {
    return {
        ...state,
        failures:{...state.failures, [action.payload]:action.meta }
    }
}
reducers[actions.TYPES.noResource] = noResource;

export const gotAssocResources = (state: DataState, action: Action) => {

   const adm  = "http://purl.bdrc.io/ontology/admin/";
   const rdf  = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
   const oa = "http://www.w3.org/ns/oa#" ;
   const bdr  = "http://purl.bdrc.io/resource/";
   const bdo  = "http://purl.bdrc.io/ontology/core/";
   const rdfs = "http://www.w3.org/2000/01/rdf-schema#" ;

   let res = state.resources
   if(res) res = res[action.payload]
   if(res) {
      console.log("res",res)

      let asso = action.meta.data
      for(let k of Object.keys(asso))
      {
         let anno = asso[k].filter(e => e.type && e.type == rdf+"type" && e.value == oa+"Annotation")
         if(anno && anno.length > 0)
         {
            console.log("anno",asso[k])

            let targ = asso[k].filter(e => e.type && e.type == oa+"hasTarget")
            let body = asso[k].filter(e => e.type && e.type == oa+"hasBody")
            if(targ && targ.length > 0 && targ[0] && targ[0].value && body && body.length > 0)
            {
               let sta = asso[targ[0].value]
               if(sta)
               {
                  console.log("sta",sta)

                  let pred = sta.filter(e => e.type && e.type == rdf+"predicate")
                  let obj = sta.filter(e => e.type && e.type == rdf+"object")
                  if(pred && pred.length > 0 && obj && obj.length > 0)
                  {
                     console.log("pred obj",pred,obj)
                     if(pred[0] && pred[0].value && obj[0] && obj[0].value)
                     {
                        let prop = res[bdr+action.payload][pred[0].value] ;
                        if(prop)
                        {
                           console.log("prop",prop)

                           let newP = []

                           for(let o of prop)
                           {
                              newP.push(o);

                              if(o.value && o.value == obj[0].value)
                              {
                                 if(body && body[0] && body[0].value && asso[body[0].value])
                                 {
                                    console.log("body",body)
                                    let bnode = { type: "bnode",value: body[0].value }
                                    newP.push(bnode);

                                    let support = asso[body[0].value].filter(e => e.type && e.type === adm+"supportedBy") ;
                                    console.log("support",support)

                                    if(support && support[0] && support[0].value)
                                    {
                                       res[body[0].value] =
                                       //[ {type:"uri",value:bdr+o.value} ]
                                       {
                                          [adm+"supportedBy"] : [ { type:"bnode",value:support[0].value} ]
                                       }

                                       let score = asso[body[0].value].filter(e => e.type && e.type === adm+"statementScore") ;
                                       if(score && score[0] && score[0].value)
                                       {
                                          res[body[0].value] = { ...res[body[0].value], [adm+"statementScore"]:[{type:"integer",value:score[0].value }]}
                                          o["score"] = score[0]["value"] ;
                                       }

                                       let assert = asso[support[0].value] ;

                                       if(assert)
                                       {
                                          let t = assert.filter(e => e.type == rdf+"type") ;
                                          let c = assert.filter(e => e.type == rdfs+"comment") ;
                                          let w = assert.filter(e => e.type.match(/[Ww]orkLocation(Work)?$/)) ;
                                          console.log("assert",assert,t,c,w) //,c[0])
                                          if(t && t[0] && t[0].value) // && c && c[0])
                                          {

                                             if(c && c[0]) {
                                                res[support[0].value] = {
                                                   [t[0].value] : [ { type:"literal",value:c[0]["value"],lang:c[0]["xml:lang"] } ],
                                                }

                                                if(w && w[0]){
                                                   let work = asso[w[0]["value"]].filter(e => e.type === bdo+"workLocationWork")

                                                   if(work && work[0])
                                                   {
                                                      res[support[0].value] = {
                                                         ...res[support[0].value],
                                                         [w[0].type] : [ { type:"uri",value:work[0]["value"] } ]
                                                      }

                                                      o["hasAnno"] = work[0]["value"] ;
                                                      o["collapseId"] = body[0].value
                                                      bnode["inCollapse"] = true
                                                   }
                                                }
                                             }
                                             else if(w && w[0]){

                                                res[support[0].value] = { [t[0].value.replace(/[/]W/,"/w")] : [ { type:"uri",value:w[0].value } ] }

                                                o["hasAnno"] = w[0]["value"] ;
                                                o["collapseId"] = body[0].value
                                                bnode["inCollapse"] = true
                                             }

                                          }
                                       }
                                    }
                                 }
                              }
                           }

                           res[bdr+action.payload][pred[0].value] = newP
                        }
                     }
                  }
               }
            }
         }

      }
      // 3 -
   }

    state = {
        ...state,
        "resources": {
           ...state.resources,
           [action.payload] : res
        },
        "assocResources": {
           ...state.assocResources,
           [action.payload]:action.meta.data
       }
    }

    console.log("assocR",res,state,action)

    return state ;
}
reducers[actions.TYPES.gotAssocResources] = gotAssocResources;


export const gotNextChunks = (state: DataState, action: Action) => {

   let res ;
   if(state && state.resources && state.resources[action.payload]
      && state.resources[action.payload]["http://purl.bdrc.io/resource/"+action.payload])
      {
         res = state.resources[action.payload]["http://purl.bdrc.io/resource/"+action.payload]
         if(!res["http://purl.bdrc.io/ontology/core/eTextHasChunk"]) res["http://purl.bdrc.io/ontology/core/eTextHasChunk"] = []
         res["http://purl.bdrc.io/ontology/core/eTextHasChunk"] = res["http://purl.bdrc.io/ontology/core/eTextHasChunk"].concat(action.meta)

         //res["http://purl.bdrc.io/ontology/core/eTextHasChunk"] = [ { value:"machin",lang:"" } ]
      }


    state = {
        ...state,
        "resources": {
            ...state.resources,
            [action.payload]:{
               ["http://purl.bdrc.io/resource/"+action.payload]: res
            }
         }
      }


    console.log("nextC",state,action)

    return state ;
}
reducers[actions.TYPES.gotNextChunks] = gotNextChunks;


export const hostError = (state: DataState, action: actions.SearchFailedAction) => {
    return {
        ...state,
        failures: {
            ...state.failures,
            host: action.payload.error
        }
    }
}
reducers[actions.TYPES.hostError] = hostError;



export const chosenHost = (state: DataState, action: Action) => {

    state = {
        ...state,
        config:
        {
           ...state.config,
           ldspdi:
           {
             ...state.config.ldspdi,
             index:state.config.ldspdi.endpoints.indexOf(action.payload)
           }
        },
        /*
        failures: {
            ...state.failures,
            host: null
        }
        */
    }
    return state ;
}
reducers[actions.TYPES.chosenHost] = chosenHost;



export const searchingKeyword = (state: DataState, action: SearchAction) => {
    return {
        ...state,
        //datatypes:null,
        facets:null,
        //keyword:action.payload.keyword,
        //language:action.payload.language,
        searches:{
           ...state.searches,
           ... action.payload ? {[action.payload.keyword+"@"+action.payload.language]:null}:{}
        }
    }
}
reducers[actions.TYPES.searchingKeyword] = searchingKeyword;


export const getOneDatatype = (state: DataState, action: Action) => {

console.log("get1DT")

    return {
        ...state,
    }
}
reducers[actions.TYPES.getOneDatatype] = getOneDatatype;


export const getDatatypes = (state: DataState, action: Action) => {

   console.log("getDTs")

    return {
        ...state,
        datatypes:true
    }
}
reducers[actions.TYPES.getDatatypes] = getDatatypes;

export const getFacetInfo = (state: DataState, action: actions.SearchAction) => {
    return {
        ...state,
        facets:{ ...state.facets, [action.payload.property]:true }
    }
}
reducers[actions.TYPES.getFacetInfo] = getFacetInfo;

export const notGettingDatatypes = (state: DataState, action: Action) => {
    return {
        ...state,
        datatypes:null
    }
}
reducers[actions.TYPES.notGettingDatatypes] = notGettingDatatypes;


export const foundResults = (state: DataState, action: actions.FoundResultsAction) => {

   let searches

   if(!action.payload.datatype || action.payload.datatype.indexOf("Any") !== -1)
   {
      searches = {
            ...state.searches,
            [action.payload.keyword + "@" + action.payload.language]: action.payload.results
            }
   }
   else {
      searches = {
            ...state.searches,
            [action.payload.datatype[0]] : {
               ...state.searches[action.payload.datatype[0]],
               [action.payload.keyword + "@" + action.payload.language]: action.payload.results
            }
      }
   }

      return {
      ...state,

      keyword:action.payload.keyword,
      language:action.payload.language,
      searches: searches
   }
}
reducers[actions.TYPES.foundResults] = foundResults;

export const foundDatatypes = (state: DataState, action: actions.FoundResultsAction) => {

      return {
      ...state,
      datatypes : action.payload.results
   }
}
reducers[actions.TYPES.foundDatatypes] = foundDatatypes;


export const pdfReady = (state: DataState, action: Action) => {

      let id = new RegExp(action.meta.url.replace(/[/](zip|pdf)[/]/,"/.../"))
      let fileT = action.payload.replace(/^.*[.](...)$/,"$1File")
      let pdfVolumes = state.IIIFinfo
      if(pdfVolumes) pdfVolumes = pdfVolumes[action.meta.iri]
      if(pdfVolumes) pdfVolumes = pdfVolumes.pdfVolumes
      if(pdfVolumes) pdfVolumes = pdfVolumes.map(e => {
         if(e.link.match(id)) return { ...e, [fileT]:action.payload }
         return e ;
      })
      console.log("pdfV",pdfVolumes,action,id)

      return {
      ...state,
      IIIFinfo : {
         ...state.IIIFinfo,
         [action.meta.iri]:{ ...state.IIIFinfo?state.IIIFinfo[action.meta.iri]:{},
            pdfVolumes
         }
      }
      /*
      createPdf:null,
      pdfUrl:action.payload
      */
   }
}
reducers[actions.TYPES.pdfReady] = pdfReady;

export const createPdf = (state: DataState, action: Action) => {

         let id = new RegExp(action.payload.replace(/[/](zip|pdf)[/]/,"/.../"))
         let fileT = action.meta.file + "File"
         let pdfVolumes = state.IIIFinfo
         if(pdfVolumes) pdfVolumes = pdfVolumes[action.meta.iri]
         if(pdfVolumes) pdfVolumes = pdfVolumes.pdfVolumes
         if(pdfVolumes) pdfVolumes = pdfVolumes.map(e => {
            if(e.link.match(id)) return { ...e, [fileT]:true }
            return e ;
         })

         return {
         ...state,
         IIIFinfo : {
            ...state.IIIFinfo,
            [action.meta.iri]:{ ...state.IIIFinfo?state.IIIFinfo[action.meta.iri]:{},
               pdfVolumes
            }
         }
   }
}
reducers[actions.TYPES.createPdf] = createPdf;

export const initPdf = (state: DataState, action: Action) => {
   return {
         ...state,
         IIIFinfo : {
            ...state.IIIFinfo,
            [action.meta.iri]:{ ...state.IIIFinfo?state.IIIFinfo[action.meta.iri]:{},
               pdfVolumes:[{volume:action.meta.vol,link:action.payload.replace(/https?:..[^/]+/,"")}]
            }
         }
   }
}
reducers[actions.TYPES.initPdf] = initPdf;


export const requestPdf = (state: DataState, action: Action) => {

   return {
      ...state,
      IIIFinfo : {
         ...state.IIIFinfo,
         [action.meta]:{ ...state.IIIFinfo?state.IIIFinfo[action.meta]:{},
            pdfVolumes : []
         }
      }
   }
}
reducers[actions.TYPES.requestPdf] = requestPdf;

export const pdfVolumes = (state: DataState, action: Action) => {

   return {
      ...state,
      IIIFinfo : {
         ...state.IIIFinfo,
         [action.meta]:{ ...state.IIIFinfo?state.IIIFinfo[action.meta]:{},
            pdfVolumes : action.payload
         }
      }
   }
}
reducers[actions.TYPES.pdfVolumes] = pdfVolumes;


export const foundFacetInfo = (state: DataState, action: actions.FoundResultsAction) => {

   let key = action.payload.keyword + "@" + action.payload.language ;
   let t = action.payload.datatype[0]
   if(t == "Any") {
      if(action.payload.results["gender"]) t = "Person" ;
      else if(action.payload.results["license"]) t = "Work" ;
   }
   let searches = {
         ...state.searches,
         [t] : {
            ...state.searches&&state.searches[t]?state.searches[t]:{},
            [key]: {
               ...state.searches&&state.searches[t]?state.searches[t][key]:{},
               metadata : action.payload.results
            }
         }
   }

   return {
      ...state,

      keyword:action.payload.keyword,
      language:action.payload.language,
      searches: searches
   }
}
reducers[actions.TYPES.foundFacetInfo] = foundFacetInfo;

export const getManifest = (state: DataState, action: Action) => {

   //console.log("getMa",action)

    state = {
        ...state,
        IIIFinfo:{ ...state.IIIFinfo,
           [action.meta]:{ ...state.IIIFinfo?state.IIIFinfo[action.meta]:{},
             imageAsset:action.payload
            }
         }
    }
    return state ;
}
reducers[actions.TYPES.getManifest] = getManifest;

export const manifestError = (state: DataState, action: SearchFailedAction) => {

    state = {
        ...state,
        IIIFinfo:{ ...state.IIIFinfo,
           [action.meta]:{ ...state.IIIFinfo?state.IIIFinfo[action.meta]:{},
             manifestError:{ url:action.payload.keyword, error:action.payload.error }
            }
         }
    }
    return state ;
}
reducers[actions.TYPES.manifestError] = manifestError;


export const firstImage = (state: DataState, action: Action) => {

   //console.log("1im",action)

    state = {
        ...state,
        IIIFinfo:{ ...state.IIIFinfo,
           [action.meta]:{ ...state.IIIFinfo?state.IIIFinfo[action.meta]:{},
             firstImage:action.payload.replace(/full[/]0/,",600/0")
            }
         }
    }
    return state ;
}
reducers[actions.TYPES.firstImage] = firstImage;



// Data Reducer
const reducer = createReducer(DEFAULT_STATE, reducers);
export default reducer;
