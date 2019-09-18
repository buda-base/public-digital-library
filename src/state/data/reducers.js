// @flow
import type { Action } from '../actions';
import type {SearchAction,SearchFailedAction} from './actions';
import createReducer from '../../lib/createReducer';
import * as actions from './actions';
import _ from 'lodash';
import {fullUri} from '../../components/App'
import qs from 'query-string'
import history from '../../history';

let reducers = {};

export type DataState = {
   iri?:string,
   resources?:{[string]:{}},
   assocResources?:{[string]:{}},
   facets?:{[string]:boolean|{}},
   keyword?:string,
   language?:string,
   ontology?:{},
   dictionary?:{},
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
         firstImage?:string,
         canvasID?:string,
         collecManif?:string,
         manifests?:[],
         imgData?:string,
         resourceManifest?:{},
         imageVolumeManifests?:{}
      }
   },
   nextChunk?:number,
   nextPage?:number,
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

export const loadedDictionary = (state: DataState, action: Action) => {
    return {
        ...state,
        dictionary: action.payload
    }
}
reducers[actions.TYPES.loadedDictionary] = loadedDictionary;

export const resetSearch = (state: DataState, action: Action) => {
    return {
        ...state,
        datatypes:null,
        keyword: null,
        language:"bo-x-ewts"
    }
}
reducers[actions.TYPES.resetSearch] = resetSearch;

export const ontoSearch = (state: DataState, action: Action) => {
    if(state.datatypes) delete state.datatypes
    return {
        ...state,
        keyword: action.payload,
        ontoSearch:action.payload,
        language:""
    }
}
reducers[actions.TYPES.ontoSearch] = ontoSearch;

export const getResource = (state: DataState, action: Action) => {
    return {
        ...state,
        "resources": {
           ...state.resources,
           [action.payload]:true
       }
    }
}
reducers[actions.TYPES.getResource] = getResource;

export const getChunks = (state: DataState, action: Action) => {
   return {
       ...state,
       "nextChunk": action.meta
   }
}
reducers[actions.TYPES.getChunks] = getChunks;


export const getPages = (state: DataState, action: Action) => {
   return {
       ...state,
       "nextPage": action.meta
   }
}
reducers[actions.TYPES.getPages] = getPages;


export const gotResource = (state: DataState, action: Action) => {
 
   const owl   = "http://www.w3.org/2002/07/owl#" ; 
   let data = action.meta
   let uri = fullUri(action.payload)
   let sameR = {}, sameP = {}
   if(data[uri]) {

      let get = qs.parse(history.location.search)            

      // preventing from displaying sameAs resource as subproperties
      for(let k of Object.keys(data[uri])) {                  
         if(k.match(/[/#]sameAs/)) {
            data[uri][k] = data[uri][k].map(e => { 
               sameR[e.value] = data[e.value]
               sameP[k] = data[uri][k]
               return ( { ...e, type:"uri"})
            })
         }                   
      }

      // merging data into resource
      if(get["cw"] !== "none") for(let k of Object.keys(sameR)) {
         if(sameR[k]) for(let p of Object.keys(sameR[k])) {
            if(p.match(/purl\.bdrc\.io/)) {
               if(!data[uri][p]) data[uri][p] = []
               data[uri][p] = data[uri][p].concat(sameR[k][p].filter(e => !e.value || e.value !== uri).map(e => ({...e,"fromSameAs":k})))
               if(!data[uri][p].length) delete data[uri][p]
            }
         }
      }

      // remove sameAsXyz when already in sameAs
      for(let k of Object.keys(sameP)) {
         if(k.match(/[/#]sameAs[^/]+$/)) {             
            data[uri][k] = data[uri][k].filter(e => !sameP[owl+"sameAs"] || !sameP[owl+"sameAs"].filter(s => s.value === e.value).length) 
            if(!data[uri][k].length) delete data[uri][k]
         }
      }
   }

   console.log("sameAs data", sameP, sameR, data)


    return {
        ...state,
        "resources": {
           ...state.resources,
           [action.payload]:Object.keys(data).reduce((acc1,k1) => {
             const bdo  = "http://purl.bdrc.io/ontology/core/";
             const bdr  = "http://purl.bdrc.io/resource/";
             let k = action.payload.replace(/bdr:/,bdr)
             //console.log("k",k,k1)
             if(k1 != k) return { ...acc1,[k1]:Object.keys(data[k1]).reduce( (acc2,k2) => {
                if(k2 != bdo+"volumeHasEtext") return { ...acc2, [k2]:data[k1][k2] }
                else {
                  let tab = data[k1][k2].map(e => {
                    let index = data[e.value]
                    if(index) index = index[bdo+"seqNum"]
                    if(index) index = index[0]
                    if(index) index = Number(index.value)
                    return ({...e, index})
                  })
                  tab = _.orderBy(tab,['index'],['ASC'])
                  return {...acc2, [k2]:tab }
                }
             },{})}
             else return {...acc1,[k1]:Object.keys(data[k1]).reduce( (acc2,k2) => {
                if(k2 != bdo+"itemHasVolume") return { ...acc2, [k2]:data[k1][k2] }
                else {
                  let tab = data[k1][k2].map(e => {
                    let index = data[e.value]
                    if(index) index = index[bdo+"volumeNumber"]
                    if(index) index = index[0]
                    if(index) index = Number(index.value)
                    return ({...e, index})
                  })
                  tab = _.orderBy(tab,['index'],['ASC'])
                  return {...acc2, [k2]:tab }
                }
             },{})}
           },{})
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

   let res = state.resources
   if(res) res = res[action.payload]

   let assoR = state.assocResources
   if(assoR) assoR = assoR[action.payload]

       state = {
           ...state,
           "resources": {
              ...state.resources,
              [action.payload] : res
           },
           "assocResources": {
              ...state.assocResources,
              [action.payload]:{ ...assoR, ...action.meta.data, ...(res?Object.keys(res).reduce((acc,k) => {
                     return { ...acc,[k]:Object.keys(res[k]).reduce( (accR,kR) => {
                        return [ ...accR, ...res[k][kR].map(e => ({ ...e, "fromKey":kR }) ) ]
                     },[]) }
                  },{}):{})  
              }
          }
       }

       console.log("assocR",res,state,action)

       return state ;
}
reducers[actions.TYPES.gotAssocResources] = gotAssocResources;


export const getAnnotations = (state: DataState, action: Action) => {

    state = {
        ...state,
        "annoCollec":{
           ...state.annoCollec,
           [action.payload]:true
         }
      }


    console.log("gAnno",state,action)

    return state ;
}
reducers[actions.TYPES.getAnnotations] = getAnnotations;


export const gotAnnoResource = (state: DataState, action: Action) => {

   const adm  = "http://purl.bdrc.io/ontology/admin/";
   const rdf  = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
   const oa = "http://www.w3.org/ns/oa#" ;
   const bdr  = "http://purl.bdrc.io/resource/";
   const bdo  = "http://purl.bdrc.io/ontology/core/";
   const bdac = "http://purl.bdrc.io/anncollection/" ;
   const rdfs = "http://www.w3.org/2000/01/rdf-schema#" ;

   let res = state.resources
   if(res) res = res[action.payload]


   if(res) {
      console.log("res",res,action)
      let colId = action.meta.collecId //.replace(new RegExp("^"+bdac),"bdac")

      let asso = action.meta.data
      for(let k of Object.keys(asso))
      {
         let assoK = asso[k]

         if(assoK) assoK = assoK[rdf+"type"]
         if(!assoK) continue ;

         let anno = assoK.filter(e => e.type && /*e.type == rdf+"type" &&*/ e.value == oa+"Annotation")
         if(anno && anno.length > 0)
         {
            console.log("anno",anno,assoK)

            let targ = asso[k][oa+"hasTarget"]
            let body = asso[k][oa+"hasBody"]

            if(targ && targ.length > 0 && targ[0] && targ[0].value && body && body.length > 0)
            {
               let sta = action.meta.data[targ[0].value]
               if(sta)
               {
                  console.log("sta",sta)

                  // + (AN_001)  target [ statement  WCBC2237 :translator PCBC7  ] / motiv [ assessing ] / body [ supportedBy Assertion [ comment workLocation ] score ]
                  // + (AN_002)     "         "        "          "       PCBC47 ] /   "          "           "          "           x          "          "

                  // + (NER001_001) target [ workLocation WUTDEMO @ 58-69   ] / motiv [ identifying ] / body [ Work  [ "..."@ ] ]
                  // + (NER001_002) target [ workLocation WUTDEMO @ 581-591 ] / motiv [ identifying ] / body [ Place [ "kaushambi"@sa-x-iast ] ]
                  // + (NER001_003) target NER001_002 / motiv [ questioning ] / body [ comment ]
                  // + (NER001_004) target NER001_003 / motiv [ replying    ] / body [ TextualBody comment ] ]

                  // + (HIG001_001) target [ workLocation WUTDEMO @ 328-347 ] / motiv [ highlighting ]

                  // (V01_001_0001) target [ workLocation WUTDEMO @ 1-26     ] / motiv [ PageMapping ] / body [ WorkLocation vol.1p.3@W22084+W4CZ5369+W30532 = vol.1p.1="1a"@WUTDEMO ]
                  // (V01_001_0002) target [ workLocation WUTDEMO @ 27-675   ] / motiv [ PageMapping ] / body [ WorkLocation vol.1p.4@W22084+W4CZ5369+W30532 = vol.1p.2="1b"@WUTDEMO ]
                  // (V01_001_0003) target [ workLocation WUTDEMO @ 676-1847 ] / motiv [ PageMapping ] / body [ WorkLocation vol.1p.5@W22084+W4CZ5369+W30532 = vol.1p.3="2a"@WUTDEMO ]

                  // (V01_002_0001) target [ workLocation WUTDEMO @ 1-26    ] / motiv [ LineMapping ] / body  [ WorkLocation vol.1p.1l.1@WUTDEMO ] ]
                  // (V01_002_0002) target [ workLocation WUTDEMO @ 27-93   ] / motiv [ LineMapping ] / body  [ WorkLocation vol.1p.2l.1@WUTDEMO ] ]
                  // (V01_002_0003) target [ workLocation WUTDEMO @ 94-269  ] / motiv [ LineMapping ] / body  [ WorkLocation vol.1p.2l.2@WUTDEMO ] ]
                  // (V01_002_0004) target [ workLocation WUTDEMO @ 270-405 ] / motiv [ LineMapping ] / body  [ WorkLocation vol.1p.2l.3@WUTDEMO ] ]
                  // (V01_002_0005) target [ workLocation WUTDEMO @ 406-541 ] / motiv [ LineMapping ] / body  [ WorkLocation vol.1p.2l.4@WUTDEMO ] ]
                  // (V01_002_0006) target [ workLocation WUTDEMO @ 542-675 ] / motiv [ LineMapping ] / body  [ WorkLocation vol.1p.2l.5@WUTDEMO ] ]
                  // ...
                  // (V01_002_0012) target [ workLocation WUTDEMO @ 1652-1847 ] / motiv [ LineMapping ] / body  [ WorkLocation vol.1p.3l.6@WUTDEMO ] ]

                  let pred = sta[rdf+"predicate"]
                  let obj = sta[rdf+"object"]
                  if(pred && pred.length > 0 && obj && obj.length > 0)
                  {
                     console.log("pred obj",pred,obj)
                     if(pred[0] && pred[0].value && obj[0] && obj[0].value)
                     {
                        let prop = res[action.payload.replace(/bdr:/,bdr)][pred[0].value] ;
                        if(prop)
                        {
                           console.log("prop",prop)

                           let newP = []

                           for(let o of prop)
                           {
                              newP.push(o);

                              if(o.value && o.value == obj[0].value)
                              {
                                 if(body && body[0] && body[0].value && action.meta.data[body[0].value])
                                 {
                                    console.log("body",body)
                                    let bnode = { type: "bnode",value: body[0].value }
                                    newP.push(bnode);

                                    let support = action.meta.data[body[0].value]
                                    if(support) support = support[adm+"supportedBy"] ;
                                    console.log("support",support)

                                    if(support && support[0] && support[0].value)
                                    {
                                       res[body[0].value] =
                                       //[ {type:"uri",value:bdr+o.value} ]
                                       {
                                          [adm+"supportedBy"] : [ { type:"bnode",value:support[0].value} ]
                                       }

                                       let score = action.meta.data[body[0].value]
                                       if(score) score = score[adm+"statementScore"] ;
                                       if(score && score[0] && score[0].value)
                                       {
                                          res[body[0].value] = { ...res[body[0].value], [adm+"statementScore"]:[{type:"integer",value:score[0].value }]}
                                          o["score"] = score[0]["value"] ;
                                       }

                                       let assert = action.meta.data[support[0].value]

                                       if(assert)
                                       {
                                          let t = assert[rdf+"type"] ;
                                          let c = assert[rdfs+"comment"] ;
                                          let w = Object.keys(assert)
                                                   .filter(e => e.match(/[Ww]orkLocation(Work)?$/))
                                                   .reduce((acc,e) => ([...acc,...assert[e].map(f => ({...f,type:e}))]),[])

                                          console.log("assert",assert,t,c,w) //,c[0])
                                          if(t && t[0] && t[0].value) // && c && c[0])
                                          {

                                             o["collecId"] = colId
                                             o["collapseId"] = body[0].value
                                             o["predicate"] = pred[0].value
                                             bnode["inCollapse"] = true

                                             if(c && c[0]) {
                                                res[support[0].value] = {
                                                   [t[0].value] : [ { type:"literal",value:c[0]["value"],lang:c[0]["xml:lang"] } ],
                                                }

                                                if(w && w[0]){
                                                   let work = action.meta.data[w[0]["value"]]

                                                   console.log("work",work,w[0],w[0].value)
                                                   w.map(e => console.log(e))

                                                   if(work) work = work[bdo+"workLocationWork"]
                                                   if(work && work[0])
                                                   {
                                                      res[support[0].value] = {
                                                         ...res[support[0].value],
                                                         [w[0].type] : [ { type:"uri",value:work[0]["value"] } ]
                                                      }

                                                      o["hasAnno"] = work[0]["value"] ;
                                                   }
                                                }

                                                console.log("o1",o,res)
                                             }
                                             else if(w && w[0]){

                                                res[support[0].value] = { [t[0].value.replace(/[/]W/,"/w")] : [ { type:"uri",value:w[0].value } ] }

                                                o["hasAnno"] = w[0]["value"] ;

                                                console.log("o2",o,res)
                                             }


                                          }
                                       }
                                    }
                                 }
                              }
                           }

                           res[action.payload.replace(/bdr:/,bdr)][pred[0].value] = newP
                           console.log("newP",newP)
                           //newP.map(e => console.log(e))
                        }
                     }
                  }
               }
            }
         }

      }
      // 3 -
   }

      let assoRes = state.assocResources
      if(assoRes) assoRes = assoRes[action.payload]
      else assoRes = {}


      assoRes = {...assoRes, ...Object.keys(action.meta.data).reduce((acc,e) => (
            {...acc,
               [e]:Object.keys(action.meta.data[e]).reduce((ac,f) =>(
                     [...ac,
                        ...action.meta.data[e][f].map(g => ({...g,type:f}))
                     ]),[])
            }),{}) }

            console.log("assoRes",action.meta,state.assocResources,assoRes)

      state = {
        ...state,
        "resources": {
           ...state.resources,
           [action.payload] : res
        },
        "assocResources": {
           ...state.assocResources,
           [action.payload]:assoRes
        },
        "annoCollec":{
           ...state.annoCollec,
           [action.payload]:{
             //...action.meta.data,
             ...Object.keys(action.meta.data).reduce((acc,e) => {
               if(action.meta.data[e][rdf+"type"] && action.meta.data[e][rdf+"type"].map(e => e.value).filter(e => e === bdo+"AnnotationLayer").length > 0)
                  return {...acc,[e]:action.meta.data[e]}
               else return acc ;
             },
                {}),
             ...(state.annoCollec?state.annoCollec[action.payload]:{})}
         }
      }


    console.log("annoR",res,state,action)

    return state ;
}
reducers[actions.TYPES.gotAnnoResource] = gotAnnoResource;


export const gotNextChunks = (state: DataState, action: Action) => {

   let res ;
   if(state && state.resources && state.resources[action.payload]
      && state.resources[action.payload]["http://purl.bdrc.io/resource/"+action.payload.replace(/bdr:/,"")])
      {
         res = state.resources[action.payload]["http://purl.bdrc.io/resource/"+action.payload.replace(/bdr:/,"")]

         //console.log("av",JSON.stringify(res,null,3))

         if(!res["http://purl.bdrc.io/ontology/core/eTextHasChunk"]) res["http://purl.bdrc.io/ontology/core/eTextHasChunk"] = []
         res["http://purl.bdrc.io/ontology/core/eTextHasChunk"] = res["http://purl.bdrc.io/ontology/core/eTextHasChunk"].filter(e => e.start !== undefined).concat(action.meta)

         //res["http://purl.bdrc.io/ontology/core/eTextHasChunk"] = [ { value:"machin",lang:"" } ]
      }


    state = {
        ...state,
        "resources": {
            ...state.resources,
            [action.payload]:{
               ["http://purl.bdrc.io/resource/"+action.payload.replace(/bdr:/,"")]: res
            }
         }
      }

    console.log("nextC",state,action)

    //console.log("ap",JSON.stringify(res,null,3))

    return state ;
}
reducers[actions.TYPES.gotNextChunks] = gotNextChunks;


export const gotNextPages = (state: DataState, action: Action) => {

   let res ;
   if(state && state.resources && state.resources[action.payload]
      && state.resources[action.payload]["http://purl.bdrc.io/resource/"+action.payload.replace(/bdr:/,"")])
      {
         res = state.resources[action.payload]["http://purl.bdrc.io/resource/"+action.payload.replace(/bdr:/,"")]

         if(!res["http://purl.bdrc.io/ontology/core/eTextHasPage"]) res["http://purl.bdrc.io/ontology/core/eTextHasPage"] = []
         res["http://purl.bdrc.io/ontology/core/eTextHasPage"] = res["http://purl.bdrc.io/ontology/core/eTextHasPage"].concat(action.meta)

      }


    state = {
        ...state,
        "resources": {
            ...state.resources,
            [action.payload]:{
               ["http://purl.bdrc.io/resource/"+action.payload.replace(/bdr:/,"")]: res
            }
         }
      }

    console.log("nextP",state,action)

    return state ;
}
reducers[actions.TYPES.gotNextPages] = gotNextPages;



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
      datatypes : {
         ...state.datatypes,
         [action.payload.keyword+"@"+action.payload.language]: true
      }
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

   if(Array.isArray(action.payload.datatype)) action.payload.datatype = action.payload.datatype[0]

   if(!action.payload.datatype || action.payload.datatype.indexOf("Any") !== -1)
   {
      let time = Date.now()
      if(state.searches && state.searches[action.payload.keyword + "@" + action.payload.language]) 
         time = state.searches[action.payload.keyword + "@" + action.payload.language].time

      searches = {
            ...state.searches,
            [action.payload.keyword + "@" + action.payload.language]: { ...action.payload.results, time }
            }
   }
   else { // what ? only time in Person results after switching from Work (keyword "bdr:P1583")

      let time = Date.now()
      if(state.searches && state.searches[action.payload.datatype] && state.searches[action.payload.datatype][action.payload.keyword + "@" + action.payload.language]) 
         time = state.searches[action.payload.datatype][action.payload.keyword + "@" + action.payload.language].time

      searches = {
            ...state.searches,
            [action.payload.datatype] : {
               ...state.searches[action.payload.datatype],
               [action.payload.keyword + "@" + action.payload.language]: { ...action.payload.results, time }
            }
      }
   }

      return {
      ...state,

      keyword:action.payload.keyword,
      language:action.payload.language,
      searches: searches,
   }
}
reducers[actions.TYPES.foundResults] = foundResults;

export const foundDatatypes = (state: DataState, action: actions.FoundResultsAction) => {

   let DT = state.datatypes;
   if(DT) DT = DT[action.payload.keyword+"@"+action.payload.language]

   return {
      ...state,
      datatypes : {
         ...state.datatypes,
         [action.payload.keyword+"@"+action.payload.language]: {
            ...DT,
            ...action.payload.results,
            metadata:{ ...(DT && DT.metadata?DT.metadata:{}), ...action.payload.results.metadata }
         }
      }
   }
}

reducers[actions.TYPES.foundDatatypes] = foundDatatypes;


export const pdfReady = (state: DataState, action: Action) => {

      let id = new RegExp(action.meta.url.replace(/[/](zip|pdf)[/]/,"/.../"))
      //let fileT = action.payload.replace(/^.*[.](...)$/,"$1File")
      let fileT = action.payload.replace(/^.*[/]file[/](...)[/].*$/,"$1File")
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


export const getImageVolumeManifest = (state: DataState, action: Action) => {

   let imageVolumeManifests ;
   let iiif = state.IIIFinfo   
   if(iiif) iiif = iiif[action.meta]
   if(iiif) imageVolumeManifests = iiif.imageVolumeManifests ;
   if(!imageVolumeManifests) imageVolumeManifests = true

    state = {
        ...state,
        IIIFinfo:{ ...state.IIIFinfo,
           [action.meta]:{ ...state.IIIFinfo?state.IIIFinfo[action.meta]:{},
               imageVolumeManifests
            }
         }
    }
    return state ;
}
reducers[actions.TYPES.getImageVolumeManifest] = getImageVolumeManifest;

export const gotImageVolumeManifest = (state: DataState, action: Action) => {


   let imageVolumeManifests ;
   let iiif = state.IIIFinfo   
   if(iiif) iiif = iiif[action.meta]
   if(iiif) imageVolumeManifests = iiif.imageVolumeManifests ;
   if(!imageVolumeManifests) imageVolumeManifests = true
   else { 
      let manif = action.payload ;
      let id = manif["@id"].replace(/^.*(bdr:[^/]+).*$/,"$1");
      imageVolumeManifests = { ...imageVolumeManifests, [id]:manif }
   }

    state = {
        ...state,
        IIIFinfo:{ ...state.IIIFinfo,
           [action.meta]:{ ...state.IIIFinfo?state.IIIFinfo[action.meta]:{},
               imageVolumeManifests
            }
         }
    }
    return state ;
}
reducers[actions.TYPES.gotImageVolumeManifest] = gotImageVolumeManifest;


export const gotManifest = (state: DataState, action: Action) => {

   //console.log("gotMa",action)

    state = {
        ...state,
        IIIFinfo:{ ...state.IIIFinfo,
           [action.meta]:{ ...state.IIIFinfo?state.IIIFinfo[action.meta]:{},
               resourceManifest:action.payload
            }
         }
    }
    return state ;
}
reducers[actions.TYPES.gotManifest] = gotManifest;

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
           [action.meta.iri]:{ ...state.IIIFinfo?state.IIIFinfo[action.meta.iri]:{},
             firstImage:action.payload,
             canvasID:action.meta.canvasID,
             collecManif:action.meta.collecManif,
             manifests:action.meta.manifests,
             imgData:action.meta.imgData
            }
         }
    }
    return state ;
}
reducers[actions.TYPES.firstImage] = firstImage;



// Data Reducer
const reducer = createReducer(DEFAULT_STATE, reducers);
export default reducer;
