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
   resetLink?:boolean,
   userEditPolicies?:{},
   instances?:{},
   isInstance?:boolean,
   outlines?:{},
}

const DEFAULT_STATE: DataState = {
   searches:{},
   failures:{},
   loading:{}
}

export const loadedConfig = (state: DataState, action: Action) => {
    return {
        ...state,
        config: action.payload
    }
}
reducers[actions.TYPES.loadedConfig] = loadedConfig;

export const loadedOntology = (state: DataState, action: Action) => {

   let ontology = action.payload

   ontology["http://purl.bdrc.io/ontology/core/workHasTranslation"]["http://purl.bdrc.io/ontology/core/inferSubTree"] = [{type: "literal", value: "true", datatype: "http://www.w3.org/2001/XMLSchema#boolean"}]
  
   ontology["http://purl.bdrc.io/ontology/tmp/workHasTranslationInCanonicalLanguage"] = {
      //"http://www.w3.org/2000/01/rdf-schema#label": [{type: "literal", value: "canonical translation", lang: "en"}],
      "http://www.w3.org/2000/01/rdf-schema#subPropertyOf": [{type: "uri", value: "http://purl.bdrc.io/ontology/core/workHasTranslation"}]
   }
   
   ontology["http://purl.bdrc.io/ontology/tmp/workHasTranslationInNonCanonicalLanguage"] = {
      //"http://www.w3.org/2000/01/rdf-schema#label": [{type: "literal", value: "other translation", lang: "en"}],
      "http://www.w3.org/2000/01/rdf-schema#subPropertyOf": [{type: "uri", value: "http://purl.bdrc.io/ontology/core/workHasTranslation"}]
   }

   return {
      ...state,
      ontology
   }
}
reducers[actions.TYPES.loadedOntology] = loadedOntology;

export const loadedDictionary = (state: DataState, action: Action) => {
   let dictionary = state.dictionary
   if(dictionary) dictionary = { ...dictionary, ...action.payload }
   else dictionary = action.payload

   dictionary["http://purl.bdrc.io/ontology/core/workHasTranslation"]["http://purl.bdrc.io/ontology/core/inferSubTree"] = [{type: "literal", value: "true", datatype: "http://www.w3.org/2001/XMLSchema#boolean"}]
  
   dictionary["http://purl.bdrc.io/ontology/tmp/workHasTranslationInCanonicalLanguage"] = {
      //"http://www.w3.org/2000/01/rdf-schema#label": [{type: "literal", value: "canonical translation", lang: "en"}],
      "http://www.w3.org/2000/01/rdf-schema#subPropertyOf": [{type: "uri", value: "http://purl.bdrc.io/ontology/core/workHasTranslation"}]
   }
   
   dictionary["http://purl.bdrc.io/ontology/tmp/workHasTranslationInNonCanonicalLanguage"] = {
      //"http://www.w3.org/2000/01/rdf-schema#label": [{type: "literal", value: "other translation", lang: "en"}],
      "http://www.w3.org/2000/01/rdf-schema#subPropertyOf": [{type: "uri", value: "http://purl.bdrc.io/ontology/core/workHasTranslation"}]
   }

    return {
        ...state,
        dictionary
    }
}
reducers[actions.TYPES.loadedDictionary] = loadedDictionary;

export const resetSearch = (state: DataState, action: Action) => {
    return {
        ...state,
        //datatypes:null,
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

export const gotUserEditPolicies = (state: DataState, action: Action) => {
   return {
       ...state,
       "userEditPolicies": action.payload
   }
}
reducers[actions.TYPES.gotUserEditPolicies] = gotUserEditPolicies;


export const gotInstances = (state: DataState, action: Action) => {

   let instances = state.instances
   if(!instances) instances = {}
   instances[fullUri(action.payload)] = action.meta

   return {
       ...state,
       instances
   }
}
reducers[actions.TYPES.gotInstances] = gotInstances;


export const getResource = (state: DataState, action: Action) => {
   
   let res = state.resources[action.payload]
   if(!res) res = true

    return {
        ...state,
        "resources": {
           ...state.resources,
           [action.payload]:res
       }
    }
}
reducers[actions.TYPES.getResource] = getResource;

export const getChunks = (state: DataState, action: Action) => {
   if(action.meta > 0) return {
       ...state,
       "nextChunk": action.meta
   }
   else return state
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
   const tmp   = "http://purl.bdrc.io/ontology/tmp/" ;
   const adm   = "http://purl.bdrc.io/ontology/admin/"
   const bdo   = "http://purl.bdrc.io/ontology/core/"
   const bdr   = "http://purl.bdrc.io/resource/"
   let data = { ...action.meta }
   let uri = fullUri(action.payload)
   let sameR = {}, sameP = {}
   let admDs = [ "originalRecord", "metadataLegal", "contentProvider", "replaceWith", "status", "access", "contentLegal" ]
   if(data[uri]) {

      // getting/cleaning sameAs info
      let sameAsInfo = {}
      for(let k of Object.keys(data)) {                        
         let keys = Object.keys(data[k])
         if(keys.length === 1 && data[k][tmp+"withSameAs"]) { 
            if(!sameAsInfo[k]) sameAsInfo[k] = {}
            data[k][tmp+"withSameAs"].map(p => { sameAsInfo[k][p.value] = true; })
            delete data[k] ; 
         }
      }

      // handling admindata
      let mergeAdminData = (res) => {
         if(data[res] && data[res][tmp+"hasAdminData"]) {
            let admin = data[res][tmp+"hasAdminData"][0]
            if(admin) admin = admin.value
            for(let a of admDs) {
               if(data[admin] && data[admin][adm+a]) data[res][adm+a] = data[admin][adm+a]
            }
            delete data[res][tmp+"hasAdminData"]
         }
      }
      
      mergeAdminData(uri);

      let get = qs.parse(history.location.search)            

      // preventing from displaying sameAs resource as subproperties
      let keys 
      if(data[uri] && (keys = Object.keys(data[uri])) && keys.length) for(let k of keys) {                           
         if(k.match(/[/#]sameAs/)) {            
            data[uri][k] = data[uri][k].filter(e => e.value !== uri).map(e => { 
               mergeAdminData(e.value);
               sameR[e.value] = data[e.value]
               sameP[k] = data[uri][k]
               return ( { ...e, type:"uri"})
            })
         }                   
      }

      console.log("sameR",sameR,sameP,uri,data,sameAsInfo)

      // merging data into resource
      if(get["cw"] !== "none") for(let k of Object.keys(sameR)) {
         //console.log("same k",k)
         if(sameR[k]) for(let p of Object.keys(sameR[k])) {
            //console.log("p",p)
            if(p.match(/purl\.bdrc\.io/) || p.match(/(pref|alt)Label$/) ) { 
               if(!data[uri][p]) data[uri][p] = []
               
               let getVal = (o) => o["value"]?o["value"]:(o["@value"]?o["@value"]:null)
               let getLg  = (o) => o["lang"]?o["lang"]:(o["xml:lang"]?o["xml:lang"]:(o["@language"]?o["@language"]:null))

               let val = sameR[k][p].filter(e => !e.value || e.value !== uri) 
               for(let v of val) {
                  //console.log("check",v)
                  let found = false
                  let v_val = getVal(v), w_val
                  for(let w of data[uri][p]) {
                     w_val = getVal(w)
                     //console.log("check",v_val,w_val,v,w)
                     if(v_val === w_val && getLg(v) === getLg(w)) { 
                        found = w
                        break; 
                     }
                     else if((sameAsInfo[v_val]&&sameAsInfo[v_val][w_val])||(sameAsInfo[w_val]&&sameAsInfo[w_val][v_val])) { 
                        found = w
                        break; 
                     }
                  }
                  if(!found) {                     
                     v.allSameAs = [ k ]
                     v.fromSameAs = k
                     data[uri][p].push(v)
                     //console.log("new v",JSON.stringify(v))
                  } 
                  else {
                     if(!found.allSameAs) { found.allSameAs = [ uri ] ; }
                     if(!found.fromSameAs) found.fromSameAs = k

                     if(w_val.match(new RegExp(bdr))) { found.value = w_val ; }
                     else if(v_val.match(new RegExp(bdr))) { found.value = v_val ; }

                     if(found.allSameAs.indexOf(k) === -1) found.allSameAs.push(k) ;

                     //console.log("found v",JSON.stringify(found))
                  }
               }
                  


               if(!data[uri][p].length) delete data[uri][p]
            }
         }
      }

      // remove sameAsXyz when already in sameAs
      if(data[uri] && (keys = Object.keys(data[uri])) && keys.length) for(let k of keys) {
         if(k.match(/[/#]sameAs[^/]+$/)) {             
            data[uri][k] = data[uri][k].filter(e => !sameP[owl+"sameAs"] || !sameP[owl+"sameAs"].filter(s => s.value === e.value).length) 
            if(!data[uri][k].length) delete data[uri][k]
            console.log("filtered",k)
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

   let res = state.resources,oldRes
   if(res) res = res[action.payload]
   if(res) oldRes = { [action.payload] : res }


   const skos = "http://www.w3.org/2004/02/skos/core#"

   let assoR = state.assocResources
   if(assoR) assoR = assoR[action.payload]

       state = {
           ...state,
           "resources": {
              ...state.resources,
              ...oldRes
           },
           "assocResources": {
              ...state.assocResources,
              [action.payload]:{ ...assoR, ...action.meta.data, ...(res?Object.keys(res).reduce((acc,k) => {
                     return { ...acc,[k]:Object.keys(res[k]).reduce( (accR,kR) => {
                        if(!kR.match(/(description|comment)$/)) return [ ...accR, ...res[k][kR].map(e => ({ 
                           ...e, 
                           "fromKey":kR, 
                           ...(kR===skos+"prefLabel"&&!e.lang&&!e["@language"]&&!e["xml:lang"]?{"xml:lang":" "}:{}) 
                        }) ) ]
                        else return [ ...accR ]
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
         if(!action.meta.prev) res["http://purl.bdrc.io/ontology/core/eTextHasChunk"] = res["http://purl.bdrc.io/ontology/core/eTextHasChunk"].filter(e => e.start !== undefined).concat(action.meta.data)
         else res["http://purl.bdrc.io/ontology/core/eTextHasChunk"] = action.meta.data.concat(res["http://purl.bdrc.io/ontology/core/eTextHasChunk"].filter(e => e.start !== undefined))

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
          if(!action.meta.prev) res["http://purl.bdrc.io/ontology/core/eTextHasPage"] = res["http://purl.bdrc.io/ontology/core/eTextHasPage"].concat(action.meta.data)
          else  res["http://purl.bdrc.io/ontology/core/eTextHasPage"] = action.meta.data.concat(res["http://purl.bdrc.io/ontology/core/eTextHasPage"])

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

export const getLatestSyncs = (state: DataState, action: Action) => {

   return {
      ...state,
      latestSyncs:true
   }
}
reducers[actions.TYPES.getLatestSyncs] = getLatestSyncs;


export const gotLatestSyncs = (state: DataState, action: Action) => {

   return {
      ...state,
      latestSyncs:action.payload
   }
}
reducers[actions.TYPES.gotLatestSyncs] = gotLatestSyncs;



export const getOutline = (state: DataState, action: Action) => {

   let outlines = {}
   if(state.outlines) outlines = state.outlines
   return {
      ...state,
      outlines:{
         ...outlines,
         [action.payload]:true,
      }
   }
}
reducers[actions.TYPES.getOutline] = getOutline;

export const gotOutline = (state: DataState, action: Action) => {

   const skos  = "http://www.w3.org/2004/02/skos/core#";

   let outlines = {}
   if(state.outlines) outlines = state.outlines

   let assoR = {}
   if(state.assocResources) assoR = { ...state.assocResources }

   let elem = action.meta
   if(elem && elem["@graph"]) elem = elem["@graph"]
   if(elem && elem.length) for(let e of elem) {
      let uri = fullUri(e["@id"])
      if(e["skos:prefLabel"]) {
         if(!assoR[e["@id"]]) assoR[e["@id"]] = { [uri]:[] }
         if(!Array.isArray(e["skos:prefLabel"])) e["skos:prefLabel"] = [ e["skos:prefLabel"] ]
         assoR[e["@id"]][uri] = assoR[e["@id"]][uri].concat( e["skos:prefLabel"].map(p => ({ value:p["@value"], lang:p["@language"], type:skos+"prefLabel" })))
      }
      
      if(e.hasTitle && e["tmp:titleMatch"] ) {
         if(!Array.isArray(e["tmp:titleMatch"])) e["tmp:titleMatch"] = [ e["tmp:titleMatch"] ]
         if(!Array.isArray(e["hasTitle"])) e["hasTitle"] = [ e["hasTitle"] ]
         for(let t of e["hasTitle"]) {
            let bnode = elem.filter(f => f["@id"] === t)
            if(bnode.length) {
               bnode = bnode[0]
               if(bnode["rdfs:label"]) {
                  if(!Array.isArray(bnode["rdfs:label"])) bnode["rdfs:label"] = [ bnode["rdfs:label"] ]
                  for(let tm of e["tmp:titleMatch"]) {
                     if(!tm.comp) tm.comp = tm["@value"].replace(/[↦↤]/g,"")
                     for(let b of bnode["rdfs:label"]) {
                        if(b["@value"] === tm.comp) { b["@value"] = tm["@value"] }
                     }
                  }
               }
            }
         }
      }
      if(e.hasTitle) {
         if(!Array.isArray(e.hasTitle)) e.hasTitle = [ e.hasTitle ]
         let hT = e.hasTitle.map(t => { 
            let k = "z"
            let bnode = elem.filter(f => f["@id"] === t) ;
            if(bnode.length) k = bnode[0].type
            return ({id:t,k})
         })
         e.hasTitle = _.orderBy(hT, ["k"], ["asc"]).map(t => t.id);
      }

   }

   let outlineKW = state.outlineKW
   if(action.payload.includes("@")) outlineKW = action.payload
   else if(state.outlineKW) { // add siblings to given node
      let root = outlines[state.outlineKW]
      if(root) root = root["@graph"]
      elem.map(e => { e.notMatch = true ; root.push(e); })

      root = state.outlineKW.split("/")
      if(root.length > 0) {
         root = root[0] 
         if(action.payload === root) outlines[state.outlineKW].reloaded = true
      }
   }

   return {
         ...state,
         outlines:{
            ...outlines,
            [action.payload]:action.meta,
         },
         outlineKW,
         assocResources:assoR
    }
}
reducers[actions.TYPES.gotOutline] = gotOutline;


export const resetOutlineSearch = (state: DataState, action: Action) => {

   return {
      ...state,
      outlineKW:false
   }
}
reducers[actions.TYPES.resetOutlineSearch] = resetOutlineSearch;


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

   const bdo   = "http://purl.bdrc.io/ontology/core/"

   let searches,isInstance 

   if(action.payload.results) isInstance = action.payload.results.isInstance

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

   // + merge datatype counts
   // DONE 

   let datatypes ; 
   if(!isInstance && action.payload.datatype && action.payload.results && action.payload.results.numResults) {
      datatypes =  state.datatypes 
      if(datatypes) datatypes = datatypes[action.payload.keyword+"@"+action.payload.language]

      if(!datatypes) datatypes = {}

      if(datatypes && !datatypes[bdo+action.payload.datatype.toLowerCase()]) {

         if(!datatypes.metadata) datatypes = { metadata:{} }

         datatypes.metadata[bdo+action.payload.datatype] = action.payload.results.numResults

         datatypes = {
            ...state.datatypes,
            [action.payload.keyword+"@"+action.payload.language]: datatypes
         }
      }

      //console.log("DT1",JSON.stringify(datatypes),JSON.stringify(state.datatypes))

   }
   

      return {
      ...state,

      keyword:action.payload.keyword,
      language:action.payload.language,
      searches: searches,
      isInstance,
      ...(datatypes?{datatypes}:{})
   }
}
reducers[actions.TYPES.foundResults] = foundResults;


export const foundDatatypes = (state: DataState, action: actions.FoundResultsAction) => {

   let DT = state.datatypes;
   if(DT) DT = DT[action.payload.keyword+"@"+action.payload.language]


   //console.log("DT2",JSON.stringify(DT))

   // + keep if already present
   // DONE 

   return {
      ...state,
      datatypes : {
         ...state.datatypes,
         [action.payload.keyword+"@"+action.payload.language]: {
            ...DT,
            ...action.payload.results,
            metadata:{ ...action.payload.results.metadata, ...(DT && DT.metadata?DT.metadata:{})  }
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


export const gotContext = (state: DataState, action: Action) => {

   let time = Date.now()

   let results = { ...state.searches["Etext"][action.payload] }, etexts
   if(results.results && results.results.bindings && (etexts = results.results.bindings.etexts) )
   {
      let iri = fullUri(action.meta.iri)
      results.results.bindings.etexts = Object.keys(etexts).reduce( (acc,k) => ({...acc, [k]:etexts[k].map(e => {
         if(k !== iri || e.startChar != action.meta.start || e.endChar != action.meta.end ) return e
         else return { ...e, context: { ...action.meta.data.reduce( (all,c) => ({...all,...c,value:all.value+c.value}),{value:""}) } }
      } ) } ), {} ) 

      let searches = {
            ...state.searches,
            ["Etext"] : {
               ...state.searches["Etext"],
               [action.payload]: { ...results, time }
            }
      }

      console.log("searches",time,searches,results)

      return {
         ...state,
         searches
      }
   }
   return { ...state }
}
reducers[actions.TYPES.gotContext] = gotContext;


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
               ...state.   searches&&state.searches[t]?state.searches[t][key]:{},
               metadata : action.payload.results
            }
         }
   }

   let dictionary = state.dictionary      
   if(action.payload.results && action.payload.results.tree  && action.payload.results.tree["@graph"]) {
      const skos  = "http://www.w3.org/2004/02/skos/core#"; 
      let topics = action.payload.results.tree["@graph"].reduce( (acc,v) => { 
         let prefL = v["skos:prefLabel"]
         //console.log("preFL",prefL)
         if(prefL) { 
            if(v["@id"]) {
               if(!Array.isArray(prefL)) prefL = [ prefL ]
               prefL = { [skos+"prefLabel"]: prefL }
               return ({ ...acc, [fullUri(v["@id"])]: prefL }) 
            }
         }
         return acc
      },{})
      dictionary = { ...state.dictionary, ...topics }
      //console.log("dico",topics,dictionary)
   }

   return {
      ...state,

      dictionary,

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
             imgData:action.meta.imgData,
             manifestWpdf:action.meta.manifestWpdf
            }
         }
    }
    return state ;
}
reducers[actions.TYPES.firstImage] = firstImage;


export const getResetLink = (state: DataState, action: Action) => {
    return {
        ...state,
        resetLink: true
    }
}
reducers[actions.TYPES.getResetLink] = getResetLink;

/*
export const getUser = (state: DataState, action: Action) => {
    return {
        ...state,
        resetLink: false
    }
}
reducers[actions.TYPES.getUser] = getUser;
*/

// Data Reducer
const reducer = createReducer(DEFAULT_STATE, reducers);
export default reducer;
