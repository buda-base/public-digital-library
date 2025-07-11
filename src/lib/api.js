//@flow
import store from '../index';
import {auth} from '../routes'
import qs from 'query-string'
//import history from '../history';
import {shortUri,isAdmin} from '../components/App';
import { fetchLabels } from "../lib/searchkit/api/LabelAPI";


import * as rdflib from "rdflib"

import logdown from 'logdown'

const loggergen = new logdown('gen', { markdown: false });

const urlParams = qs.parse(window.location.search)

const onKhmerUrl = (
      window.location.host.startsWith("khmer-manuscripts")
   || window.location.search.includes("forceCambodia=true")
   //|| window.location.host.startsWith("library-dev")
   //|| window.location.host.startsWith("localhost")
)

require('formdata-polyfill')

const CONFIG_PATH = onKhmerUrl?'/config-khmer_v2.json':'/config_v2.json'
const TRADI_PATH = '/traditions.json'
const CONFIGDEFAULTS_PATH = '/config-defaults.json'
const ONTOLOGY_PATH = '/ontology/core.json'
const DICTIONARY_PATH = '/ontology/data/json' //  '/graph/ontologySchema.json'
const USER_PATH = '/me/focusgraph' //'/resource-nc/user/me'
const USER_EDIT_POLICIES_PATH = '/userEditPolicies'


const bdo  = "http://purl.bdrc.io/ontology/core/";
const bdou  = "http://purl.bdrc.io/ontology/ext/user/" ;
const bdu   = "http://purl.bdrc.io/resource-nc/user/";
const bdr  = "http://purl.bdrc.io/resource/";
const skos = "http://www.w3.org/2004/02/skos/core#";
const tmp = "http://purl.bdrc.io/ontology/tmp/" ;

export const dPrefix = {
   "bda": {
      "CP" : "Corporation",
      "PR": "Product",
   },
   "bdr": {
      "C" : "Corporation",
      "E" : "Etext",
      "IE" : "Etext",
      "VE": "Volume",
      "VL": "Volume",
      "I" : "Volume", // = image group
      "L" : "Lineage",
      "G" : "Place",
      "P" : "Person",    
      "R" : "Role",
      "PR": "Product",
      "T" : "Topic",
      "WE" : "Images", // EAP bug
      "W" : "Images",
      "WA" : "Work",
      "MW": "Instance",
      "O" : "Taxonomy",
      "UT": "Etext", // ?
   },
   "bdu": {
      "U" : "User",
   },
   "dila" : {
      "PL": "Place", 
      "A" : "Person"
   },
   "wd" : {
      "Q" : "Person"
   },
   "mbbt" : {
      "text": "Work"
   },
   "eftr" : {
      "W": "Work",
      "WA": "Work",
   },
   "src": {
      "sources": "Instance",
      "persons": "Person",
      "places": "Place",
      "topics": "Topic",
      "deities": "Topic",
      "literary_forms": "Topic"
   },
   "tol": {
      "TOLP": "Person"
   }
};


export const staticQueries = { 
   "all-collections": [ "allCollections", "Product" ],                         // ok
   //"female-authors": ["femaleAuthorsGraph", "Person" ],                      // returns 0 results
   //"works-by-female-authors": ["worksByFemaleAuthors", "Work"],              // returns 500
   //"instances-by-female-authors": ["instancesByFemaleAuthor", "Instance"]    // returns 500
}

export async function logError(error, json) {
   
   
   if(!json) json = {}
   
   json.message = error.message
   json.stack = error.stack
   json.location = window.location.href
   json.version = localStorage.getItem('APP_VERSION')
   json.userAgent = window.navigator.userAgent

   const lang = localStorage.getItem('langs');
   const uilang = localStorage.getItem('uilang');
   const langpreset = localStorage.getItem('langpreset');
   const customlangpreset = localStorage.getItem('customlangpreset');
   
   if(!json.payload) json.localStorage = { lang, uilang, langpreset, customlangpreset }

   const state = store?.getState()

   if(state && !json.payload) {
      const locale = state.i18next?.lang
      const langIndex = state.ui?.langIndex
      const langPreset = state.ui?.langPreset   
      const userID = state.ui?.userID
      let profile 
      if(state.data?.resources) profile = state.data.resources[userID]
      
      json.user = { locale, langIndex, langPreset, userID, profile }
   }

   //const user = store.getState().ui

   const url = "https://editserv.bdrc.io/logClientException"

   const id_token = localStorage.getItem('id_token');

   //const { isAuthenticated } = auth;

   const queryString = window.location.search;
   const urlParams = new URLSearchParams(queryString);
   
   if(window.location.hostname != "localhost" && urlParams.get("prerender") != "true") {
      
      let response = await fetch( url, {
         method: 'POST',
         headers: new Headers({
            "Content-Type": "application/json",
            //...( isAuthenticated() && {"Authorization":"Bearer "+id_token } )
         }),
         body: JSON.stringify(json),
         keepalive:true // #864 executed even after closing the tab (see navigator.sendBeacon)
      })
   } else {
      loggergen.log("(localhost/not sending)")
   }

   console.error("sent:",json)
}
window.logError = logError

//logError({test: "ok?"})

export function getEntiType(t:string):string {
   let uri = shortUri(t)
   let p = uri.replace(/^([^:]+):.*$/,"$1")
   //if(p === "src" && t.includes("sources")) return "Instance" ;
   //else if(p === "src" && t.includes("persons")) return "Person" ;   
   if(p === "ola") return "Person" ;
   else if(p == "mbbt" ) return "Work" ; // [TODO]
   let v ;
   if(p === "src") v = uri.replace(/^[^:]+:([a-z]+)\/[0-9]+/,"$1")
   else if(p === "tol") v = uri.replace(/^[^:]+:([a-zA-Z]+)[0-9]+/,"$1")
   else v = uri.replace(/^([^:]+:)?([ACEILGPQMRTWOVU][AERTLWP]?).*$/,"$2")
   //loggergen.log("gEt?",v,p)
   if(!dPrefix[p] || !dPrefix[p][v]) return "" ;
   else return dPrefix[p][v]; }


export interface APIResponse {
    text(): Promise<string>
}

type APIOptions = {
    server?: string,
    fetch?: (req: string, args?:{}) => Promise<*>
}

export class ResourceNotFound extends Error {
   constructor(txt:string,nb:integer) {
      super(txt);
      this.code = nb ;
   }
};

export class InvalidResource extends Error {};

export default class API {
    _server: string;
    _fetch: (req: string, args?:{}) => Promise<APIResponse>

    constructor(options: ?APIOptions) {
        if (options) {
            if (options.server) this._server = options.server;
            if(process.env.NODE_ENV === 'test'){
               let {fetch} = require('whatwg-fetch')
               this._fetch = fetch
            }
            else if(options.fetch) this._fetch = options.fetch
            else if (window.fetch) this._fetch = window.fetch.bind(window)

        } else {
           if(process.env.NODE_ENV === 'test'){
              let fetch = require('whatwg-fetch')
              this._fetch = fetch
           }
           else this._fetch = window.fetch.bind(window);
        }

        //loggergen.log("api options",options,this,process.env.NODE_ENV)
      }

     async getURLContents(url: string, minSize : boolean = true,acc?:string,lang?:string[],binary:boolean=false,cookie:string,etag = false): Promise<string> {

         const { isAuthenticated } = auth;

         const access_token = localStorage.getItem('access_token');
         const id_token = localStorage.getItem('id_token');
         //const expires_at = localStorage.getItem('expires_at');


         let head = {}
         if(acc) head = { ...head, "Accept":acc }

         if(lang) head = { ...head, "Accept-Language":lang.join(",") }

         // CORS issue - to be continued
         let xhrArgs
         if(isAuthenticated() && (url.match(/bdrc[.]io/) && !url.match(/bdr:[WI]0?(SAT|EAP|CDL|IA|SBB|LOC|LULDC)/) || url.match(/localhost/))) {
            if(url.match(/setcookie/)) xhrArgs = { credentials: 'include' } //, 'mode':'no-cors'}
            if(!cookie) head = { ...head, "Authorization":"Bearer "+id_token }
         }

         //loggergen.log("access:",{id_token,access_token,isAuth:isAuthenticated(),url,minSize,acc,cookie,xhrArgs,head});

         // force refresh if ?v=... in url
         if(urlParams.v) url += (url.includes("?")?"&":"?")+"v="+urlParams.v

         let response = await this._fetch( url, { method:"GET",headers:new Headers(head), ...xhrArgs } )
         //loggergen.log("response:",response,etag)
         
         if (!response.ok) {
            if (response.status === 404) {
               throw new ResourceNotFound('The resource does not exist.',404);
            }
            else if (response.status === 401) {
               throw new ResourceNotFound('Restricted access',401);
            }
            else if (response.status === 403) {
               throw new ResourceNotFound('Forbidden access',403);
            }
            else {
               console.error("FETCH pb",response)
               throw new ResourceNotFound('Problem fetching the resource (code:'+response.status+')',500);
            }
         }
            
         loggergen.log("FETCH ok",url,response )
         /*
         for(let c of response.headers.keys()) {
            loggergen.log(c,response.headers.get(c))
         }
         */
         /*
         let cookie = response.headers.get("Set-Cookie")
         if(cookie) {
            loggergen.log("cookie!",cookie)
         }
         */
         if(etag) {
            etag = response.headers.get("etag")
            let text = await response.text()
            return { text, etag }
         } else if(!binary) {
            let text = await response.text()
            //loggergen.log("RESPONSE text",text)
            if(minSize && text.length <= 553) { throw new ResourceNotFound('The resource does not exist.'); }
            return text ;
         }
         else {
            let buffer = await response.arrayBuffer() ;
            //loggergen.log("buffer",buffer,response)
            return buffer
         }
      }

/*
         return new Promise((resolve, reject) => {

             this._fetch( url ).then((response) => {

                 if (!response.ok) {
                     if (response.status === '404') {
                         throw new ResourceNotFound('The resource does not exist.');
                     }
                     else {
                        loggergen.log("FETCH pb",response)
                         throw new ResourceNotFound('Problem fetching the resource');
                     }
                 }
                 loggergen.log("FETCH ok",url,response)
                 response.text().then((reqText) => {
                     text = reqText;

                     //loggergen.log("RESPONSE text",reqText)

                     if(minSize && reqText.length <= 553) { throw new ResourceNotFound('The resource does not exist.'); }

                     resolve(text);
                 }).catch((e) => {
                    reject(e);
                });
             }).catch((e) => {
                 reject(e);
             });
         });
     }
     */

    async loadConfig(): {}
    {
      try {
         let config =  JSON.parse(await this.getURLContents(this._configPath,false));
         let tradiObj =  JSON.parse(await this.getURLContents(this._tradiPath,false));
         config.tradition = tradiObj.tradition
         loggergen.log("config",config)
         return config ;
      }
      catch(e) {
         logError(e)

         console.error("fetching config.json",e);

         let config =  JSON.parse(await this.getURLContents(this._configDefaultsPath,false));
         loggergen.log("config-defaults",config)
         return config ;
      }
   }

       async loadManifest(url:string): Promise<string>
       {

            let manif =  JSON.parse(await this.getURLContents(url,false,null,["bo-Tibt"]));
            //loggergen.log("manif",manif)
            return manif ;
      }

   async loadUserEditPolicies()
   {
         let userEditPolicies =  JSON.parse(await this.getURLContents(this._userEditPoliciesPath,false));
         return userEditPolicies ;
   }


    async loadUser(mime) {
       if(!mime) {
          let { text, etag } =  await this.getURLContents(this._userPath,false,"application/json", undefined, undefined, undefined, true);
          loggergen.log("user:etag",etag)
          let user = JSON.parse(text)
          return { user, etag }
       } else {
         let user =  await this.getURLContents(this._userPath,false,mime);
         return user ;
       }
   }

    async loadOntology(): Promise<string>
    {
         let onto =  JSON.parse(await this.getURLContents(this._ontologyPath,false));
         //loggergen.log("onto",onto)
         return onto ;
   }

    async loadDictionary(): Promise<string>
    {
         let dico =  JSON.parse(await this.getURLContents(this._dictionaryPath,false));
         loggergen.log("dico",dico)
         return dico ;
   }


   async loadMonlamResults(params): Promise<string>
   {
      let res =  JSON.parse(await this.getURLContents(this._monlamPath()+"?"+qs.stringify(params),false,"application/json"));
      loggergen.log("monlam:",res)
      return res;
  }

    async loadCheckResults(params): Promise<string>
    {
         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index] + "/query/table/countInstancesInCollectionWithProperties" + params
         let count=  JSON.parse(await this.getURLContents(url,false));
         loggergen.log("count:",count)
         return count ;
   }

    async loadResultsWithFacets(params): Promise<string>
    {
         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index] + "/lib/instancesInCollectionWithProperties" + params
         let results =  JSON.parse(await this.getURLContents(url,false));
         loggergen.log("results:",results)
         return results ;
   }


    async loadResultsByDateOrId(date,t, dateOrId): Promise<string>
    {
         try {
            
            let config = store.getState().data.config.ldspdi
            let url = config.endpoints[config.index] + "/lib" ;            
            let param = {"searchType": dateOrId+t+"s","L_NAME":"","LG_NAME":"", "I_LIM":"700", [ dateOrId==="date"?"GY_RES":"L_ID"]:date.replace(/"/g,"") }
            let data = await this.getQueryResults(url, "", param,"GET","application/json");         

            return data
         }
         catch(e)
         {
            logError(e)         
            //throw(e)
            console.error("ERROR byDateOrId",e)
            return true
         }

   }

    async loadLatestSyncsAsResults(meta): Promise<string>
    {
         try {
            
            let days = 7
            if(meta?.timeframe) days = Number(meta?.timeframe.replace(/[^0-9]/g,"")) * (meta?.timeframe.endsWith("m") ? 30 : 1)
            const dateA = new Date(Date.now() - 1000 * 3600 * 24 * days)
            const dateB = new Date(Date.now() + 1000 * 3600 * 24 * 2)

            let config = store.getState().data.config.ldspdi
            let url = config.endpoints[config.index] + "/lib" ;            
            let param = {"searchType":"iinstanceSyncedIn","L_NAME":"","LG_NAME":"", "I_LIM":"", "D_START":dateA.toISOString().replace(/T.*$/,"T00:00:00"), "D_END":dateB.toISOString().replace(/T.*$/,"T00:00:00") }
            let data = await this.getQueryResults(url, "", param,"GET","application/json");         

            return data
         }
         catch(e)
         {
            logError(e)         
            //throw(e)
            console.error("ERROR latest syncs",e)
            return true
         }

   }

   async loadStaticQueryAsResults(route): Promise<string>
   {
      let query = staticQueries[route]
      if(query?.length) query = query[0]
      let config = store.getState().data.config.ldspdi
      let url = config.endpoints[config.index] + "/lib" ;            
      let param = {"searchType":query,"L_NAME":"","LG_NAME":"", "I_LIM":"" }
      let data = await this.getQueryResults(url, "", param,"GET","application/json");         

      return data
   
  }

    async loadLatestSyncs(meta): Promise<string>
    {
         try {
            
            let days = 7
            if(meta?.timeframe) days = Number(meta?.timeframe.replace(/[^0-9]/g,"")) * (meta?.timeframe.endsWith("m") ? 30 : 1)
            const date = new Date(Date.now() - 1000 * 3600 * 24 * days)

            let config = store.getState().data.config.ldspdi
            // DONE remove ldspdi-dev --> ldspdi 
            let url = config.endpoints[config.index] /*.replace(/-dev/,"")*/ + "/query/graph" ;            
            let param = {"searchType":"latestsyncssince","L_NAME":"","LG_NAME":"", "I_LIM":"", "D_SINCE":date.toISOString().replace(/T.*$/,"T00:00:00") }
            let data = await this.getQueryResults(url, "", param,"GET","application/json");         

            return data ;
         }
         catch(e)
         {
            logError(e)         
            //throw(e)
            console.error("ERROR latest syncs",e)
            return true
         }

   }

    async loadOutline(IRI:string,node?:{},volFromUri?:string): Promise<string>
    {

         const pathToRoot = (id, outline) => {
            if(id === "bdr:PR1ER12") return []
            else {
               const parent = outline.find(n => n.hasPart?.includes(id))
               if(parent) return [parent].concat(pathToRoot(parent["@id"]??parent.id, outline))
               return []
            }
         }

         try {
            
            if(!IRI.indexOf(':') === -1 ) IRI = "bdr:"+IRI
            let state = store.getState()
            let config = state.data.config.ldspdi
            let url = config.endpoints[config.index]+"/query/graph" ;            
            let searchType = "Outline_root", extraParam, isTaishoNode
            const initParams = { IRI, searchType } 
            //if(IRI.match(/bdr:MW0T[ST]0/)) isTaishoNode = true; // quickfix for Taisho to keep working
            //loggergen.log("loadO:",IRI,searchType,node,volFromUri)
            if(node && !isTaishoNode) {
               if(node["tmp:hasNonVolumeParts"] == true) { 
                  if(node.volumeNumber !== undefined && node.partType === "bdr:PartTypeVolume") { 
                     searchType += "_pervolume"
                     extraParam = { I_VNUM: node.volumeNumber }
                     IRI = volFromUri                     
                  }
                  else if(node["partType"] !== "bdr:PartTypeVolume" && node["partType"] !== "bdr:PartTypeText" && node["partType"] !== "bdr:PartTypeChapter") searchType += "_volumes"
               }
            }
            //loggergen.log("loadO?",initParams,IRI,searchType)
            let param = {searchType,"R_RES":IRI,"L_NAME":"","LG_NAME":"", "I_LIM":"" }
            if(extraParam) param = { ...param, ...extraParam }
            let data 
            // #730 fallback for case when hasNonVolumePart is true but Outline_root_volumes returns 404
            try { 
               if(IRI === "bdr:PR1ER12" || volFromUri === "bdr:PR1ER12" || node?.rid === "bdr:PR1ER12" || node?.useRid === "bdr:PR1ER12") {
                  const nodes = (state.data.outlines?.["bdr:PR1ER12"]?.["@nodes"]) ?? (await(await this._fetch("/sungbum_ALL.json")).json()??{}) ?? []
                  await new Promise(r => setTimeout(r, 1));
                  const top = nodes.find(n => (n["@id"] ?? n.id) === IRI)
                  let graph = [top].concat(nodes.filter(m => top.hasPart?.includes(m["@id"] ?? m.id)))
                  graph = graph.concat(nodes.filter(m => graph.some(g => g["bf:identifiedBy"]?.some(idb => (idb["@id"] ?? idb.id) === (m["@id"] ?? m.id)))))
                  graph = graph.concat(pathToRoot(top["@id"]??top.id, nodes))
                  let more = [], extra = graph.map(g => { 
                     for(const p of ["tmp:author", "tmp:topic"]) if(g[p]) {
                        if(!Array.isArray(g[p])) g[p] = [ g[p] ]
                        for(const v of g[p]) {
                           more.push(v["@id"]??v.id)
                        }                     
                     }
                     if(g["instanceOf"]) more.push(g["instanceOf"])
                     return more
                  }).flat().filter(n => n).map(n => n.split(":")[1]??n)
                  //console.log("nodes:",nodes,JSON.stringify(top,null,3),IRI,JSON.stringify(graph,null,3), extra, more)
                  if(extra?.length) {
                     const attribute = "outline-bdr:PR1ER12"
                     if (!sessionStorage.getItem(attribute)) {
                        sessionStorage.setItem(attribute, JSON.stringify({}));
                     }      
                     let storage = JSON.parse(sessionStorage.getItem(attribute));
                     let fetching = extra.filter(i => i && !storage[i])
                     if(fetching.length) {
                        const fetchedItems = await fetchLabels(fetching, attribute)
                        const newStorage = { ...storage, ...fetchedItems }
                        sessionStorage.setItem(attribute, JSON.stringify(newStorage));   
                        storage = newStorage      
                     }
                     const labels = extra.reduce((acc,k) => ({...acc, [k]:storage[k]}),{})
                     //console.log("extra:",extra,labels,fetching,storage)
                     extra = Object.keys(labels).map(k => ({"id":"bdr:"+k, "skos:prefLabel":(labels[k]?.label??[]).map(l => ({"@language":l.lang,"@value":l.value}))}))
                     graph = graph.concat(extra)
                  }
                  data = { 
                     "@context": "http://purl.bdrc.io/context.jsonld",
                     "@graph": graph,
                     ...IRI === "bdr:PR1ER12"?{"@nodes": nodes}:{}
                    };
               } else if(IRI === "tmp:uri") {
                  console.warn("tmp:uri?outline",IRI,node,volFromUri)
                  data = {"@graph":[]}
               } else {
                  data = await this.getQueryResults(url, IRI, param,"GET","application/jsonld");         
               }
            } catch(e) {               
               if(e.code == 404 && node && node["tmp:hasNonVolumeParts"] == true) {
                  IRI = initParams.IRI
                  searchType = initParams.searchType
                  param = {searchType,"R_RES":IRI,"L_NAME":"","LG_NAME":"", "I_LIM":"" }
                  data = await this.getQueryResults(url, IRI, param,"GET","application/jsonld");         
               } else {
                  throw e
               }
            }
            // use "local" node id for volume
            if(searchType.endsWith("_volumes") && data["@graph"]  && data["@graph"].length) {
               let volumes = []
               data["@graph"] = data["@graph"].map(e => {
                  if(e.id === IRI && e.hasPart) {
                     if(!Array.isArray(e.hasPart)) e.hasPart = [ e.hasPart ]
                     e.hasPart = e.hasPart.map(n => { 
                        volumes.push(n)
                        return n+";"+IRI 
                     })                     
                  }                  
                  return e
               })
               if(volumes.length) {
                  data["@graph"] = data["@graph"].map(e => {
                     if(e.id && volumes.includes(e.id) && !e.id.includes(";")) e.id += ";"+IRI
                     return e
                  })
               }
               loggergen.log("graph?",data["@graph"])
            }

            return data ;
         }
         catch(e)
         {
            logError(e)
         
            //throw(e)
            console.error("ERROR outline",e)
            return true
         }

   }

    async outlineSearch(IRI:string,kw:string,lg:string): Promise<string>
    {
         try {
            
            let config = store.getState().data.config.ldspdi
            let url = config.endpoints[config.index]+"/query/graph" ;            
            let param = {"searchType":"Outline_search","R_RES":IRI, "LG_NAME":lg, "I_LIM":"" }
            let data = await this.getQueryResults(url, kw, param,"GET","application/jsonld");         

            return data ;
         }
         catch(e)
         {
            logError(e)
            //throw(e)
            console.error(e)
            return true
         }

   }

    async loadResource(IRI:string, preview = false): Promise<string>
    {
         //let resource =  JSON.parse(await this.getURLContents(this._resourcePath(IRI),false));try {
         try {
            
            let query = preview ? "ResInfo-preview":(IRI.startsWith("bdr:MW")?"ResInfo-SameAs_MW":"ResInfo-SameAs")
            //let get = qs.parse(history.location.search)
            //if(get["cw"] === "none") query = "ResInfo"

            if(!IRI.indexOf(':') === -1 ) IRI = "bdr:"+IRI
            let config = store.getState().data.config.ldspdi
            let url = config.endpoints[config.index]+"/query/graph" ;            
            let param = {"searchType":query,"R_RES":IRI,"L_NAME":"","LG_NAME":"", "I_LIM":"" }
            let data = await this.getQueryResults(url, IRI, param,"GET");
            
            loggergen.log("r e source",param,data)
            

            /*
            const bdr  = "http://purl.bdrc.io/resource/";
            IRI = IRI.replace(new RegExp("(bdr:)|("+bdr+")"),"")
            let config = store.getState().data.config.ldspdi
            let url = config.endpoints[config.index]+"/resource/"+IRI+".json" ;
            let data = await JSON.parse(await  this.getURLContents(url))

            loggergen.log("resource",data)
            */


            return data ;
         }
         catch(e)
         {
            throw(e)
         }

   }


   async loadAnnoList(IRI:string): Promise<string>
   {
         if(!IRI.indexOf(':') === -1 ) IRI = "bdr:"+IRI
         //let resource =  JSON.parse(await this.getURLContents(this._resourcePath(IRI),false));try {
         try {
            let config = store.getState().data.config.ldspdi
            let url = config.endpoints[config.index]+"/query/graph" ;
            let param = {"searchType":"AnnCollection-forResource","R_RES":IRI,"L_NAME":"","LG_NAME":"" }
            let data = await this.getQueryResults(url, IRI, param,"GET") //,"application/ld+json");
            loggergen.log("r e source",data)
            return data ;
         }
         catch(e)
         {
            throw(e)
         }

   }

   async loadEtextInfo(IRI:string): Promise<string>
   {
      //let resource =  JSON.parse(await this.getURLContents(this._etextPath(IRI),false));

      if(!IRI.indexOf(':') === -1 ) IRI = "bdr:"+IRI

      //loggergen.log("etext",resource)
      try {
         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index]+"/query/graph" ;
         let param = {"searchType":"Etext_base","R_RES":IRI,"L_NAME":"","LG_NAME":"" }
         let data = await this.getQueryResults(url, IRI, param,"GET") //,"application/json");

         //loggergen.log("etextinfo",JSON.stringify(data,null,3))

         return data ;
      }
      catch(e){
         throw(e)
      }

   }

   async loadEtextSnippet(IRI:string): Promise<string>
   {
      try {
         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index]+ "/osearch" 
         let param = {"searchType": "snippet", "id": IRI, osearch: true }
         
         let data = await this.getQueryResults(url, IRI, param,"GET","application/ld+json");

         loggergen.log("etextsnippet",JSON.stringify(data,null,3))

         return data ;
      }
      catch(e){
         throw(e)
      }

   }



   async loadEtextChunks(IRI:string,next:number=0,nb:number=10000,useContext:boolean=false): Promise<string>
   {
      //let resource =  JSON.parse(await this.getURLContents(this._etextPath(IRI),false));

      if(!IRI.indexOf(':') === -1) IRI = "bdr:"+IRI

      if(next < 0) next = (-next) - nb

      loggergen.log("etext",IRI,next,nb)

      try {
         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index]+ "/osearch" //(!useContext?"/lib":"/query/graph") ;
         //let param = {"searchType":useContext?"chunkContext":Chunks",...(useContext?{"R_UT":IRI}:{"R_RES":IRI}),"I_START":next,"I_END":next+nb*1,"L_NAME":"","LG_NAME":"", "I_LIM":"" }
         let param = {"searchType": "etextchunks","cstart": next,"cend": next+nb*1, "id": IRI, osearch: true }
         
         let data = await this.getQueryResults(url, IRI, param,"GET","application/ld+json");

         //loggergen.log("etextchunks",JSON.stringify(data,null,3))

         return data ;
      }
      catch(e){
         throw(e)
      }

   }


   async loadEtextPages(IRI:string,next:number=0): Promise<string>
   {
      //let resource =  JSON.parse(await this.getURLContents(this._etextPath(IRI),false));

      if(!IRI.indexOf(':') === -1) IRI = "bdr:"+IRI

      //loggergen.log("etext",resource)
      try {
         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index]+"/lib" // "/query/graph" ;
         let param = {"searchType":"ChunksByPage","R_RES":IRI,"I_START":next,"I_END":next+10,"L_NAME":"","LG_NAME":"" }
         let data = await this.getQueryResults(url, IRI, param,"GET","application/ld+json");

         //loggergen.log("etextchunks",JSON.stringify(data,null,3))

         return data ;
      }
      catch(e){
         throw(e)
      }

   }



    async loadETextRefs(IRI:string): Promise<string>
    {
         try {
            
            if(!IRI.indexOf(':') === -1 ) IRI = "bdr:"+IRI
            let config = store.getState().data.config.ldspdi
            let url = config.endpoints[config.index]+"/query/graph" ;            
            let param = {"searchType":"etextrefs","R_RES":IRI,"L_NAME":"","LG_NAME":"", "I_LIM":"" }
            let data = await this.getQueryResults(url, IRI, param,"GET","application/jsonld");         

            return data ;
         }
         catch(e)
         {
            logError(e)
            //throw(e)
            console.error("ERROR etextrefs",e)            
            return false
         }

   }

   async loadSubscribedCollections(): Promise<string>
   {
      
      let config = store.getState().data.config.ldspdi
      let url = config.endpoints[config.index] + "/lib" ;            
      let param = {"searchType":"subscribedCollectionsGraph","L_NAME":"","LG_NAME":"", "I_LIM":"" }
      let data = await this.getQueryResults(url, "", param,"GET","application/json");               

      return data ;
   }

   async loadCitationData(id:string): Promise<string>
   {
      let resource =  await this.getURLContents(this._citationDataPath(id),false);
      return resource ;
   }

   async loadCitationStyle(s:string): Promise<string>
   {
      let resource =  await this.getURLContents(this._citationStylePath(s),false);
      return resource ;
   }

   async loadCitationLocale(lg:string): Promise<string>
   {
      let resource =  await this.getURLContents(this._citationLocalePath(lg),false);
      return resource ;
   }


   
   async loadAssocResources(IRI:string): Promise<string>
   {
      let resource =  JSON.parse(await this.getURLContents(this._assocResourcesPath(IRI),false));
      loggergen.log("assocResources",resource)
      return resource ;
   }

    testHost(host : string): Promise<boolean>
    {
      return new Promise((resolve, reject) =>
      {
         this._fetch(host+"").then((response) =>
         {
            if (response.ok)
            {
               loggergen.log("response ok",host,response)
               resolve(true);
            }
            else
            {
               throw new Error("Connection to " +host+ " failed")
            }

         }).catch((e) =>
         {
            reject(e)
         })
      })
    }


   async getQueryResults(url: string, key:string, param:{}={}, method:string = "POST", accept:string="application/json",other?:{}): Promise<{}>
   {

      //loggergen.log("key",key, param)

      let res = {}

      if(!param.osearch) {

         param = { "searchType":"Res_withType","LG_NAME":"bo-x-ewts","I_LIM":500, ...param }
         
         if(key.indexOf("\"") === -1 && !param["NO_QUOTES"]) key = "\""+key+"\""
         if(param["L_NAME"] != "") param["L_NAME"] = key ;
         else { delete param["L_NAME"] ; delete param["LG_NAME"] ;  }

         if(param["I_LIM"] === "") delete param["I_LIM"]
         
         if(param["searchType"] != "") url += "/"+param["searchType"];
         else delete param["I_LIM"] ;
         
         if(param["I_LIM"] === "") delete param["I_LIM"]
         
         if(param["NO_QUOTES"]) delete param["NO_QUOTES"]
         
         if(param["GY_RES"] || param["L_ID"]) {
            delete param["LG_NAME"]
            delete param["L_NAME"]
            //delete param["I_LIM"]
         }
         
      } else {
         url += "/"+param["searchType"];
         delete param.osearch
      }

      delete param["searchType"]



      if(accept === "application/json") param["format"] = "json"

      //loggergen.log("query",url,key,param,method,accept,other);

      // let body = Object.keys(param).map( (k) => k+"="+param[k] ).join('&') +"&L_NAME="+key
      //searchType=Res_withFacet&"+param+"L_NAME=\""+key+"\"",

      // force refresh if ?v=... in url
      if(urlParams.v) param["v"] = urlParams.v

      var formData = new FormData();
      for (var k in param) {
          formData.append(k, param[k]);
      }

      // (using formData directly as body doesn't seem to work...)
      let body = [ ...formData.entries() ]
                     .map(e => encodeURIComponent(e[0]) + "=" + encodeURIComponent(e[1]))
                     .join('&')

      loggergen.log("body",body,param);

      const access_token = localStorage.getItem('access_token');
      const id_token = localStorage.getItem('id_token');

      const { isAuthenticated } = auth;

      let response = await this._fetch( url + (method == "GET" && body != "" ? "?" + body : ""),
      {// header pour accéder aux résultat en JSON !
         method: method,
         ...( method == "POST" && {body:body} ),//body:body,
         headers: new Headers({
            "Accept": accept || "*",
            ...other,
            // CORS issue - to be continued
            ...( isAuthenticated() && {"Authorization":"Bearer "+id_token } ),
         ...( method == "POST" && {"Content-Type": "application/x-www-form-urlencoded"})
         })
      })

      //loggergen.log("apres fetch",response)

      /*
      if (!response.ok) {
         if (response.status === '404') {
             throw new ResourceNotFound('The search server '+url+' seem to have moved...');
         }
         else {
            loggergen.log("FETCH pb",response)
             throw new ResourceNotFound('Problem fetching the results ['+response.message+']');
         }
      }
      */


      if (!response.ok) {
         if (response.status === 404) {
            throw new ResourceNotFound('The resource does not exist.',404);
         }
         else if (response.status === 401) {
            throw new ResourceNotFound('Restricted access',401);
         }
         else if (response.status === 403) {
            throw new ResourceNotFound('Forbidden access',403);
         }
         else {
            console.error("FETCH pb",response)
            throw new ResourceNotFound('Problem fetching the resource (code:'+response.status+')',500);
         }
      }

     //loggergen.log("FETCH ok",url,response)

     let txt = await response.text()

     //loggergen.log("txt",txt)

     res = JSON.parse(txt)

     //loggergen.log("res",res)


      //loggergen.log("resolving",res)

      return res ;
   }

      /*
      return new Promise((resolve, reject) => {


          this._fetch( url,
          {// header pour accéder aux résultat en JSON !
            method: 'POST',
            body:body,
            headers:new Headers({
               "Content-Type": "application/x-www-form-urlencoded",
               "Accept": "application/json"
            })
         }).then((response) => {


              if (!response.ok) {
                  if (response.status === '404') {
                      throw new ResourceNotFound('The search server '+url+' seem to have moved...');
                  }
                  else {
                     loggergen.log("FETCH pb",response)
                      throw new ResourceNotFound('Problem fetching the results ['+response.message+']');
                  }
              }
              loggergen.log("FETCH ok",url,response)

              response.text().then((req) => {


                  res = JSON.parse(req) //.results.bindings ;

                  loggergen.log("resolving",res)

                  resolve(res);
              }).catch((e) => {
                 reject(e);
              });
          }).catch((e) => {
              reject(e);
          });
       });
      }
      */

   async _getResultsData(key: string,lang: string): Promise<{} | null> {
      try {
           let config = store.getState().data.config.ldspdi
           let url = config.endpoints[config.index]+"/query/table" ;
           let data = this.getQueryResults(url, key, {"LG_NAME":lang});
           // let data = this.getSearchContents(url, key);

           return data ;
      } catch(e) {
           throw e;
      }
  }

     async _getStartResultsData(key: string,lang: string,typ:string[],inEtext?:string): Promise<{} | null> {
        try {
             let config = store.getState().data.config.ldspdi
             let url = config.endpoints[config.index]+"/lib" ;
             let param = {"searchType":"rootSearchGraph","LG_NAME":lang,"I_LIM":""}

             let searchType = "typeSimple" 
             let R_TYPE 
             if(typ[0] === "Scan") searchType = "iinstanceFacet" 
             else if(typ[0] === "Etext") { 
                if(inEtext) { 
                   searchType = "etextContentFacetGraphInInstance"
                   param.R_EINST = inEtext
                   param.LI_NAME = 4000
                }
                else searchType = "etextContentFacet" //chunksFacet"
             }
             else if(["SerialWork","Work","Person","Place","Instance"].includes(typ[0]))  searchType = typ[0].toLowerCase().replace(/serialwork/,"serialWork")
               +(["SerialWork","Work","Instance"].includes(typ[0])?"Facet":"")              
             else if(["Product"].includes(typ[0])) R_TYPE = "bdo:Collection"
             else R_TYPE = "bdo:"+typ[0]
             if(!inEtext) searchType+="Graph"
             // successfull attempt at #439
             // if(typ[0]==="Person") searchType += "-sameAs"

             if(typ && typ.length >= 1 && typ[0] !== "Any") { param = { ...param, searchType, ...(R_TYPE?{R_TYPE}:{}) } }
             else url = url.replace(/-dev/,"") // fix while -dev/rootSearch returns nothing

             // #756
             if(key.includes(" AND ")) {
               key = key.replace(/(^\()|(\))$/g,'_PAREN_').replace(/[\{\}\[\]()_|]/g," ").replace(/^ PAREN (.*) PAREN $/,"($1)").replace(/^" +/,'"')
             } else {
               key = key.replace(/[\{\}\[\]()_|]/g," ").replace(/^" +/,'"')
             }
             let data = this.getQueryResults(url, key, param,"GET","");
             
             // let data = this.getSearchContents(url, key);

             return data ;
        } catch(e) {
             throw e;
        }
    }

      async _getAssocResultsData(key: string,styp:string,dtyp:string): Promise<{} | null> {
         try {
            let config = store.getState().data.config
            let url = config.ldspdi.endpoints[config.ldspdi.index]+"/lib" ;
            let simple = !["Work","Person","Place","Instance"].includes(dtyp)              
            
            // case of proxied site
            let subscrip = key == "tmp:subscriptions" && styp == "Product"
            if(subscrip) url = "https://ldspdi.bdrc.io/lib"
            
            let param = {
               "R_RES":key,
               ...(
                  config.khmerServer && styp === "Product" && dtyp === "Work"
                  ?{"searchType":"worksInCollection","R_RES":"bdr:PR1KDPP00"}
                  : subscrip
                     ? {"searchType":"subscribedCollectionsGraph"}
                     : {"searchType": "associated"+
                           (!simple
                              ? dtyp
                              : (styp=="Product" && dtyp=="Scan"
                                 ? "IInstance"
                                 : (styp=="Product" && dtyp=="Etext" 
                                    ? "EInstance"
                                    : "SimpleType"
                                 )
                              )
                           )+"s"
                        } 
               ),
               ...(simple?{R_TYPE:(["Product"].includes(dtyp)?"bdo:Collection":"bdo:"+dtyp)}:{}),
               "L_NAME":"","LG_NAME":"", "I_LIM":"" }
         
            if(subscrip) { 
               delete param["R_RES"]
               delete param["R_TYPE"] 
            }

            loggergen.log("param:",param, key, styp, dtyp)
            let data = this.getQueryResults(url, key, param,"GET");
            // let data = this.getSearchContents(url, key);

            return data ;
         } catch(e) {
            throw e;
         }
     }

     async getResultsSimpleFacet(key: string,lang: string,property:string): Promise<{} | null> {
        try {
            //loggergen.log("simpleFacet start",key,lang,property)

             let config = store.getState().data.config.ldspdi
             let url = config.endpoints[config.index]+"/query/table" ;
             let data = this.getQueryResults(url, key, {"LG_NAME":lang,"searchType":"Res_simpleFacet","R_PROP":property});

             //loggergen.log("simpleFacet end",data)

             return data ;
        } catch(e) {
             throw e;
        }
    }

   async getResultsDatatypes(key: string,lang: string): Promise<{} | null> {
      try {
           let config = store.getState().data.config.ldspdi
           let url = config.endpoints[config.index]+"/query/table" ;
           let data = this.getQueryResults(url, key, {"LG_NAME":lang,"searchType":"Res_allTypes_withCount"});

           loggergen.log("datatypes",data)



           return data ;
      } catch(e) {
           throw e;
      }
  }




   async updateProfile(user, RID) {

      const jsonld2turtle = ( jsonldString, rdfStore, uri ) => {
         return new Promise(resolve=>{
            rdflib.parse( jsonldString, rdfStore, uri, "application/ld+json", e => {
                  if(e) { loggergen.log("Parse Error! "); return resolve(e) }
                  rdflib.serialize(null,rdfStore, uri,'text/turtle',(e,s)=>{
                     if(e) { loggergen.log("Serialize Error! "); return resolve(e) }
                     return resolve(s)
                  })
            })
         })
      }

      let ttl, myjsonld, rdfStore
      const prefixes = { bdo, bdou, bdr, bdu, skos, tmp }
      let props = store.getState()
   
      try {
         var uri = "http://";
   
         //let ttl0 = await this.loadUser("text/turtle")

         /*
         rdfStore = rdflib.graph();
         json = JSON.parse(await turtle2jsonld(user, rdfStore, uri))
         
         user = await api.loadUser()
         rdfStore = rdflib.graph();
         for(const k of Object.keys(prefixes)) rdfStore.setPrefixForURI(k, prefixes[k])
         ttl = await jsonld2turtle(JSON.stringify(json), rdfStore, uri) 
         */
        
         myjsonld = Object.keys(user).map(k => {
            return ({ "@id": k, ...Object.keys(user[k]).reduce( (acc,p) => {
               return { ...acc, [p]: user[k][p].map(o => {
                  if(o.type === "uri") return { "@id" : o.value }
                  if(o.type === "bnode") return { "@id" : o.value }
                  else return { "@value" : o.value, ...o.language?{"@language":o.language}:{} }
               })}
            }, {}) })
         })
   
         rdfStore = rdflib.graph();
         for(const k of Object.keys(prefixes)) rdfStore.setPrefixForURI(k, prefixes[k])
         ttl = await jsonld2turtle(JSON.stringify(myjsonld), rdfStore, uri) 
         // fast hack for easy rdf list handling + not working, have to create a list and use it as bnode
         // => smarter hack 
         for(const p of ["bdou:preferredUiLiteralLangs"]) {
            //ttl = ttl.replace(new RegExp(p+" *(.*?) *; *\n","m"),(m,g1) => p+" ( "+g1.replace(/,/g," ")+" ); \n")
            ttl = ttl.replace(new RegExp(p+" *([^;]+) *;","m"),(m,g1) => p+" ( "+user[RID.replace(/bdu:/,bdu)][bdou+"preferredUiLiteralLangs"].map(v => '"'+v.value+'"').join(" ") +" );")                     
         } 
         loggergen.log("upload:",RID,ttl,user) //,ttl0)

      } catch(e) {
         logError(e)
         console.warn("RDF parse error:",e)
      }
   

      let config = props.data.config.editserv
      let url = "https:" + config.endpoints[config.index] + "/" + RID + "/focusgraph";
            

      let response,  etag = props.ui.etag
      try {
         let token = localStorage.getItem('id_token')
         response = await this._fetch(url,  {
            method: 'POST',
            body: ttl,
            headers:new Headers({ 
               'content-type': 'text/turtle', 
               'authorization': "Bearer " + token,  
               "x-change-message": '"user profile page in library"@en', 
               "if-match": etag
            })
         })

      } catch(e) {
         logError(e)
         loggergen.log("patch",e)
      }

      return response
   }


   async submitPatch(id,patch) {
      let response
      try {
         let token = localStorage.getItem('id_token')
         response = await (await this._fetch( '//editserv.bdrc.io/resource-nc/user/patch/'+id.replace(/^.*[/]([^/]+)$/, "$1"),  {
            method: 'PATCH',
            body: patch,
            headers:new Headers({ 'content-type': 'text/plain', 'authorization': "Bearer " + token})
         })).text()

      } catch(e) {
         logError(e)
         loggergen.log("patch",e)
      }

      return response
   }
  
  async updateEmail(user_id, email) {

      let props = store.getState()
      let passwordData = props.data.config["password-reset"]

      let authData = await (await this._fetch( 'https://bdrc-io.auth0.com/oauth/token',  {
         method: 'POST',
         body: JSON.stringify(passwordData),
         headers:new Headers({ 'content-type': 'application/json'})
      })).json()

      //loggergen.log("aD", authData);

      try {
         let response = await (await this._fetch( 'https://bdrc-io.auth0.com/api/v2/users/'+encodeURI(user_id),  {
            method: 'PATCH',
            body: JSON.stringify({"email":email}),
            headers:new Headers({ 'authorization': "Bearer " + authData.access_token, 'content-type': 'application/json'})
         })).json()         

         await this._fetch( 'https://bdrc-io.auth0.com/api/v2/jobs/verification-email',  {
            method: 'POST',
            body: JSON.stringify({user_id, client_id: authData.client_id}),
            headers:new Headers({ 'authorization': "Bearer " + authData.access_token, 'content-type': 'application/json'})
         })

         return response
      }
      catch(e) {
         logError(e)
         console.error("auth0 email update failed",e)
         return { statusCode:-1, error:"auth0 email update failed", message:e  }
      }

      //loggergen.log("rL", resetLink);

  }


  async getPasswordResetLink(user_id, passwordData) {

      let authData = await (await this._fetch( 'https://bdrc-io.auth0.com/oauth/token',  {
         method: 'POST',
         body: JSON.stringify(passwordData),
         headers:new Headers({ 'content-type': 'application/json'})
      })).json()

      loggergen.log("aD", authData);

      let resetLink = await (await this._fetch( passwordData.audience + "tickets/password-change",  {
         method: 'POST',
         body: JSON.stringify({ user_id, result_url: window.location.href }),
         headers:new Headers({ 'authorization': "Bearer " + authData.access_token, 'content-type': 'application/json'})
      })).json()

      loggergen.log("rL", resetLink);

      if(resetLink.statusCode === 400) throw new Error(resetLink.message)
      else if(resetLink.ticket) return resetLink.ticket
      else throw new Error("unknown error")
  }



   // TODO prevent UI from freezing 

   async getDatatypesOnly(key: string,lang: string,dateOrId:string) {

      const bdo  = "http://purl.bdrc.io/ontology/core/";

      try {
           let config = store.getState().data.config.ldspdi
           let url = config.endpoints[config.index]+"/query/table" ;
           let data ;
           if(dateOrId) data = await this.getQueryResults(url, key, {"NO_QUOTES":true, "searchType":"count"+dateOrId+"Types",[dateOrId==="Date"?"GY_RES":"L_ID"]:key.replace(/"/g,"")}, "GET", "application/json");
           else if(lang) data = await this.getQueryResults(url, key, {"NO_QUOTES":true, "LG_NAME":lang,"searchType":"count"+(dateOrId?dateOrId:"")+"Types","LI_NAME":700}, "GET", "application/json");
           else data = await this.getQueryResults(url, key, {"L_NAME":"","R_RES":key,"searchType":"countAssociatedTypes","LI_NAME":700}, "GET", "application/json");

            if(data && data.results && data.results.bindings) {
               return data.results.bindings.reduce( (acc,t) => {
                  if(t.type && t.count && [bdo+"Work",bdo+"Instance",bdo+"Person",bdo+"Topic",bdo+"Role",bdo+"Corporation",bdo+"Place",bdo+"Lineage",bdo+"Chunk", bdo+"EtextInstance"].indexOf(t.type.value) !== -1) 
                     return { ...acc, [t.type.value.endsWith("Chunk")||t.type.value.endsWith("EtextInstance")?bdo+"Etext":t.type.value]:t.count.value}
                  return acc
               },{})
            }

           loggergen.log("datatypes",data)

           return data ;
      } catch(e) {
           throw e;
      }

      return { }
   }

     async getResultsOneDatatype(datatype:string,key: string,lang: string): Promise<{} | null> {
        try {
             let config = store.getState().data.config.ldspdi
             let url = config.endpoints[config.index]+"/query/table" ;
             let data = this.getQueryResults(url, key, {"LG_NAME":lang,"searchType":"Res_oneType","R_RES":":"+datatype});

             loggergen.log("oneDatatype",data)

             return data ;
        } catch(e) {
             throw e;
        }
    }

         async getResultsOneFacet(key: string,lang: string,facet:{[string]:string}): Promise<{} | null> {
            try {


                 let config = store.getState().data.config.ldspdi
                 let url = config.endpoints[config.index]+"/query/table" ;
                 let params = {"LG_NAME":lang,"searchType":"Res_simpleFacet_1value"}

                 let i = 1
                 for(let k of Object.keys(facet))
                 {
                    params = { ...params, ["R_PROP"+i] : k, ["R_VAL"+i] : facet[k] };
                    i ++
                 }

                  let data = this.getQueryResults(url, key, params )

                 loggergen.log("oneFacet",data)

                 return data ;
            } catch(e) {
                 throw e;
            }
        }

   async getResults(key: string,lang:string): Promise<{} | null> {
     let data = [];

     try {
         data = await this._getResultsData(key,lang)

         return data ;
      } catch(e) {
         throw e;
      }
  }


     async getInstances(IRI: string): Promise<{} | null> {

       let data = [];

       try {
             let config = store.getState().data.config.ldspdi
             let url = config.endpoints[config.index]+"/lib" ;
             let param = {"searchType":"workInstancesGraph","R_RES":IRI, "L_NAME":"", "I_LIM":""}

             let data = this.getQueryResults(url, IRI, param,"GET");


            return data ;
        } catch(e) {
           throw e;
        }
    }

     async getReproductions(IRI: string): Promise<{} | null> {

       let data = [];

       try {
             let config = store.getState().data.config.ldspdi
             let url = config.endpoints[config.index]+"/lib" ;
             let param = {"searchType":"instanceReproductionsGraph","R_RES":IRI, "L_NAME":"", "I_LIM":""}

             let data = this.getQueryResults(url, IRI, param,"GET");


            return data ;
        } catch(e) {
           throw e;
        }
    }
     async getStartResults(key: string,lang:string,types:string[],inEtext?:string): Promise<{} | null> {
       let data = [];

       try {
           data = await this._getStartResultsData(key,lang,types,inEtext)

           return data ;
        } catch(e) {
           throw e;
        }
    }

         async getAssocResults(key: string,stypes:string[],dtypes:string[]): Promise<{} | null> {
           let data = [];

           try {
               data = await this._getAssocResultsData(key,stypes,dtypes)

               return data ;
            } catch(e) {
               throw e;
            }
        }

      _citationStylePath(s:string): string {

          let path = "//" + window.location.host +  "/scripts/citation-js/styles/" + s + ".csl"

          return path;
      }

      _citationLocalePath(s:string): string {

          let path = "//" + window.location.host +  "/scripts/citation-js/locales/" + s + ".xml"

          return path;
      }


      _citationDataPath(IRI:string): string {

         if(!IRI.indexOf(':') === -1) IRI = "bdr:"+IRI

         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index] ;

          let path = url +  "/CSLObj/" + IRI;

          return path;
      }

      _resourcePath(IRI:string): string {

         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index] ;

          let path = url +  "/resource/" + IRI + ".json";

          return path;
      }

      _monlamPath(IRI:string): string {

         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index] ;

          let path = url +  "/lexicography/entriesForChunk"

          return path;
      }

      _assocResourcesPath(IRI:string): string {

         if(!IRI.indexOf(':') === -1) IRI = "bdr:"+IRI

         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index] ;

          let path = url +  "/lib/allAssocResource?R_RES=" + IRI;

          return path;   
      }

      get _userEditPoliciesPath(): string {
         let path = USER_EDIT_POLICIES_PATH;

         let config = store.getState().data.config.editserv
         let url = config.endpoints[config.index] ;

         path = url + USER_EDIT_POLICIES_PATH;
         
         // to use with ldspdi running locally
         //path = "//editserv.bdrc.io" + USER_EDIT_POLICIES_PATH;

         return path;
      }

     get _userPath(): string {
        let path = USER_PATH;

       let config = store.getState().data.config.editserv
       let url = config.endpoints[config.index] ;

         path = url +  USER_PATH;

         // to use with ldspdi running locally
         //path = "//editserv-dev.bdrc.io" + USER_PATH
         
        return path;
    }

    
     get _ontologyPath(): string {
        let path = ONTOLOGY_PATH;

       let config = store.getState().data.config
       let url = config.ldspdi.endpoints[config.index] ;

         path = url +  ONTOLOGY_PATH;
         
         // to use with ldspdi running locally
         path = "//purl.bdrc.io" +  ONTOLOGY_PATH;

         if(config && config.chineseMirror) path = "/ldspdi" + ONTOLOGY_PATH;

        return path;
    }

     get _dictionaryPath(): string {
        let path = DICTIONARY_PATH

       let config = store.getState().data.config
       let url = config.ldspdi.endpoints[config.ldspdi.index] ;

         path = url +  DICTIONARY_PATH;

         // to use with ldspdi running locally
         //path = "//purl.bdrc.io" +  DICTIONARY_PATH;         

         if(!window.location.href.startsWith("http://localhost") && !window.location.href.startsWith("http://library-dev.") 
            && config && config.chineseMirror) path = "/ldspdi" + DICTIONARY_PATH;

         // to use with ldspdi-dev
         //path = "//ldspdi-dev.bdrc.io" +  DICTIONARY_PATH;

        return path;
    }


   get _configPath(): string {
      let path = CONFIG_PATH;
      if (this._server) {
          path = this._server + CONFIG_PATH;
      }

      loggergen.log("path",path)

      return path;
  }

  get _tradiPath(): string {
   let path = TRADI_PATH;
   if (this._server) {
       path = this._server + TRADI_PATH;
   }
   return path;
  }

  get _configDefaultsPath(): string {
      let path = CONFIGDEFAULTS_PATH;
      if (this._server) {
          path = this._server + '/' + CONFIGDEFAULTS_PATH;
      }

      return path;
  }
}

export const RISexportPath = (RID:string, locale:string): string => {
   let config = store.getState().data.config
   let url = config.ldspdi.endpoints[config.index] ;
   let path = "//purl.bdrc.io" 
   if(config && config.chineseMirror) path = "/ldspdi" 
   path += "/RIS/" + RID + "/" + locale
   return path;
}
    