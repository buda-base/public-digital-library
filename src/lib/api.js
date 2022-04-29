//@flow
import store from '../index';
import {auth} from '../routes'
import qs from 'query-string'
import history from '../history';
import {shortUri} from '../components/App';

const onKhmerUrl = (
      window.location.host.startsWith("khmer-manuscripts")
   //|| window.location.host.startsWith("library-dev")
   //|| window.location.host.startsWith("localhost")
)

require('formdata-polyfill')

const CONFIG_PATH = onKhmerUrl?'/config-khmer.json':'/config.json'
const CONFIGDEFAULTS_PATH = '/config-defaults.json'
const ONTOLOGY_PATH = '/ontology/core.json'
const DICTIONARY_PATH = '/ontology/data/json' //  '/graph/ontologySchema.json'
const USER_PATH = '/resource-nc/user/me'
const USER_EDIT_POLICIES_PATH = '/userEditPolicies'

export const dPrefix = {
   "bda": {
      "CP" : "Corporation",
      "PR": "Product",
   },
   "bdr": {
      "C" : "Corporation",
      "E" : "Etext",
      "IE" : "Etext",
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
   //console.log("gEt?",v,p)
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

        //console.log("api options",options,this,process.env.NODE_ENV)
      }

     async getURLContents(url: string, minSize : boolean = true,acc?:string,lang?:string[],binary:boolean=false,cookie:string): Promise<string> {

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

         //console.log("access:",{id_token,access_token,isAuth:isAuthenticated(),url,minSize,acc,cookie,xhrArgs,head});

         let response = await this._fetch( url, { method:"GET",headers:new Headers(head), ...xhrArgs } )

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

         console.log("FETCH ok",url,response )
         /*
         for(let c of response.headers.keys()) {
            console.log(c,response.headers.get(c))
         }
         */
         /*
         let cookie = response.headers.get("Set-Cookie")
         if(cookie) {
            console.log("cookie!",cookie)
         }
         */

         if(!binary) {
            let text = await response.text()
            //console.log("RESPONSE text",text)
            if(minSize && text.length <= 553) { throw new ResourceNotFound('The resource does not exist.'); }
            return text ;
         }
         else {
            let buffer = await response.arrayBuffer() ;
            //console.log("buffer",buffer,response)
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
                        console.log("FETCH pb",response)
                         throw new ResourceNotFound('Problem fetching the resource');
                     }
                 }
                 console.log("FETCH ok",url,response)
                 response.text().then((reqText) => {
                     text = reqText;

                     //console.log("RESPONSE text",reqText)

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
         console.log("config",config)
         return config ;
      }
      catch(e) {

         console.error("fetching config.json",e);

         let config =  JSON.parse(await this.getURLContents(this._configDefaultsPath,false));
         console.log("config-defaults",config)
         return config ;
      }
   }

       async loadManifest(url:string): Promise<string>
       {

            let manif =  JSON.parse(await this.getURLContents(url,false,null,["bo-Tibt"]));
            //console.log("manif",manif)
            return manif ;
      }

   async loadUserEditPolicies()
   {
         let userEditPolicies =  JSON.parse(await this.getURLContents(this._userEditPoliciesPath,false));
         return userEditPolicies ;
   }


    async loadUser()
    {
         let user =  JSON.parse(await this.getURLContents(this._userPath,false,"application/json"));
         return user ;
   }

    async loadOntology(): Promise<string>
    {
         let onto =  JSON.parse(await this.getURLContents(this._ontologyPath,false));
         //console.log("onto",onto)
         return onto ;
   }

    async loadDictionary(): Promise<string>
    {
         let dico =  JSON.parse(await this.getURLContents(this._dictionaryPath,false));
         console.log("dico",dico)
         return dico ;
   }


    async loadCheckResults(params): Promise<string>
    {
         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index] + "/query/table/countInstancesInCollectionWithProperties" + params
         let count=  JSON.parse(await this.getURLContents(url,false));
         console.log("count:",count)
         return count ;
   }

    async loadResultsWithFacets(params): Promise<string>
    {
         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index] + "/lib/instancesInCollectionWithProperties" + params
         let results =  JSON.parse(await this.getURLContents(url,false));
         console.log("results:",results)
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
            //throw(e)
            console.error("ERROR byDateOrId",e)
            return true
         }

   }

    async loadLatestSyncsAsResults(): Promise<string>
    {
         try {
            
            const dateA = new Date(Date.now() - 1000 * 3600 * 24 * 7)
            const dateB = new Date(Date.now() + 1000 * 3600 * 24 * 2)

            let config = store.getState().data.config.ldspdi
            let url = config.endpoints[config.index] + "/lib" ;            
            let param = {"searchType":"iinstanceSyncedIn","L_NAME":"","LG_NAME":"", "I_LIM":"", "D_START":dateA.toISOString().replace(/T.*$/,"T00:00:00"), "D_END":dateB.toISOString().replace(/T.*$/,"T00:00:00") }
            let data = await this.getQueryResults(url, "", param,"GET","application/json");         

            return data
         }
         catch(e)
         {
            //throw(e)
            console.error("ERROR outline",e)
            return true
         }

   }

    async loadLatestSyncs(): Promise<string>
    {
         try {
            
            const date = new Date(Date.now() - 1000 * 3600 * 24 * 7)

            let config = store.getState().data.config.ldspdi
            // DONE remove ldspdi-dev --> ldspdi 
            let url = config.endpoints[config.index] /*.replace(/-dev/,"")*/ + "/query/graph" ;            
            let param = {"searchType":"latestsyncssince","L_NAME":"","LG_NAME":"", "I_LIM":"", "D_SINCE":date.toISOString().replace(/T.*$/,"T00:00:00") }
            let data = await this.getQueryResults(url, "", param,"GET","application/json");         

            return data ;
         }
         catch(e)
         {
            //throw(e)
            console.error("ERROR outline",e)
            return true
         }

   }


    async loadOutline(IRI:string,node?:{},volFromUri?:string): Promise<string>
    {
         try {
            
            if(!IRI.indexOf(':') === -1 ) IRI = "bdr:"+IRI
            let config = store.getState().data.config.ldspdi
            let url = config.endpoints[config.index]+"/query/graph" ;            
            let searchType = "Outline_root", extraParam, isTaishoNode
            console.log("loadO:",IRI,node,volFromUri)
            //if(IRI.match(/bdr:MW0T[ST]0/)) isTaishoNode = true; // quickfix for Taisho to keep working
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
            let param = {searchType,"R_RES":IRI,"L_NAME":"","LG_NAME":"", "I_LIM":"" }
            if(extraParam) param = { ...param, ...extraParam }
            let data = await this.getQueryResults(url, IRI, param,"GET","application/jsonld");         
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
               console.log("graph?",data["@graph"])
            }

            return data ;
         }
         catch(e)
         {
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
            //throw(e)
            console.error(e)
            return true
         }

   }

    async loadResource(IRI:string): Promise<string>
    {

         //let resource =  JSON.parse(await this.getURLContents(this._resourcePath(IRI),false));try {
         try {
            
            let query = "ResInfo-SameAs"
            //let get = qs.parse(history.location.search)
            //if(get["cw"] === "none") query = "ResInfo"

            if(!IRI.indexOf(':') === -1 ) IRI = "bdr:"+IRI
            let config = store.getState().data.config.ldspdi
            let url = config.endpoints[config.index]+"/query/graph" ;            
            let param = {"searchType":query,"R_RES":IRI,"L_NAME":"","LG_NAME":"", "I_LIM":"" }
            let data = await this.getQueryResults(url, IRI, param,"GET");
            
            console.log("r e source",param,data)
            

            /*
            const bdr  = "http://purl.bdrc.io/resource/";
            IRI = IRI.replace(new RegExp("(bdr:)|("+bdr+")"),"")
            let config = store.getState().data.config.ldspdi
            let url = config.endpoints[config.index]+"/resource/"+IRI+".json" ;
            let data = await JSON.parse(await  this.getURLContents(url))

            console.log("resource",data)
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
            console.log("r e source",data)
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

      //console.log("etext",resource)
      try {
         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index]+"/query/graph" ;
         let param = {"searchType":"Etext_base","R_RES":IRI,"L_NAME":"","LG_NAME":"" }
         let data = await this.getQueryResults(url, IRI, param,"GET") //,"application/json");

         console.log("etextinfo",data) //JSON.stringify(data,null,3))

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

      console.log("etext",IRI,next,nb)

      try {
         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index]+(!useContext?"/lib":"/query/graph") ;
         let param = {"searchType":useContext?"chunkContext":"Chunks",...(useContext?{"R_UT":IRI}:{"R_RES":IRI}),"I_START":next,"I_END":next+nb,"L_NAME":"","LG_NAME":"", "I_LIM":"" }
         let data = await this.getQueryResults(url, IRI, param,"GET","application/ld+json");

         //console.log("etextchunks",JSON.stringify(data,null,3))

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

      //console.log("etext",resource)
      try {
         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index]+"/lib" // "/query/graph" ;
         let param = {"searchType":"ChunksByPage","R_RES":IRI,"I_START":next,"I_END":next+10,"L_NAME":"","LG_NAME":"" }
         let data = await this.getQueryResults(url, IRI, param,"GET","application/ld+json");

         //console.log("etextchunks",JSON.stringify(data,null,3))

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
            //throw(e)
            console.error("ERROR etextrefs",e)
            return true
         }

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
      console.log("assocResources",resource)
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
               console.log("response ok",host,response)
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

      //console.log("key",key)

      let res = {}
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

      delete param["searchType"]

      if(accept === "application/json") param["format"] = "json"

      console.log("query",url,key,param,method,accept,other);

      // let body = Object.keys(param).map( (k) => k+"="+param[k] ).join('&') +"&L_NAME="+key
      //searchType=Res_withFacet&"+param+"L_NAME=\""+key+"\"",

      var formData = new FormData();
      for (var k in param) {
          formData.append(k, param[k]);
      }

      // (using formData directly as body doesn't seem to work...)
      let body = [ ...formData.entries() ]
                     .map(e => encodeURIComponent(e[0]) + "=" + encodeURIComponent(e[1]))
                     .join('&')

      console.log("body",body,param);

      const access_token = localStorage.getItem('access_token');
      const id_token = localStorage.getItem('id_token');

      const { isAuthenticated } = auth;

      let response = await this._fetch( url + (method == "GET" && body != "" ? "?" + body : ""),
      {// header pour accéder aux résultat en JSON !
         method: method,
         ...( method == "POST" && {body:body} ),//body:body,
         headers: new Headers({
            "Accept": accept,
            ...other,
            // CORS issue - to be continued
            ...( isAuthenticated() && {"Authorization":"Bearer "+id_token } ),
         ...( method == "POST" && {"Content-Type": "application/x-www-form-urlencoded"})
         })
      })

      //console.log("apres fetch",response)

      /*
      if (!response.ok) {
         if (response.status === '404') {
             throw new ResourceNotFound('The search server '+url+' seem to have moved...');
         }
         else {
            console.log("FETCH pb",response)
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

     //console.log("FETCH ok",url,response)

     let txt = await response.text()

     //console.log("txt",txt)

     res = JSON.parse(txt)

     //console.log("res",res)


      //console.log("resolving",res)

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
                     console.log("FETCH pb",response)
                      throw new ResourceNotFound('Problem fetching the results ['+response.message+']');
                  }
              }
              console.log("FETCH ok",url,response)

              response.text().then((req) => {


                  res = JSON.parse(req) //.results.bindings ;

                  console.log("resolving",res)

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
             else if(["Work","Person","Place","Instance"].includes(typ[0]))  searchType = typ[0].toLowerCase()+(["Work","Instance"].includes(typ[0])?"Facet":"")              
             else if(["Product"].includes(typ[0])) R_TYPE = "bdo:Collection"
             else R_TYPE = "bdo:"+typ[0]
             if(!inEtext) searchType+="Graph"
             // successfull attempt at #439
             // if(typ[0]==="Person") searchType += "-sameAs"

             if(typ && typ.length >= 1 && typ[0] !== "Any") { param = { ...param, searchType, ...(R_TYPE?{R_TYPE}:{}) } }
             else url = url.replace(/-dev/,"") // fix while -dev/rootSearch returns nothing

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
            
            let subscrip = key == "tmp:subscriptions" && styp == "Product"
            
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
                                 : "SimpleType"
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

            console.log("param:",param, key, styp, dtyp)
            let data = this.getQueryResults(url, key, param,"GET");
            // let data = this.getSearchContents(url, key);

            return data ;
         } catch(e) {
            throw e;
         }
     }

     async getResultsSimpleFacet(key: string,lang: string,property:string): Promise<{} | null> {
        try {
            //console.log("simpleFacet start",key,lang,property)

             let config = store.getState().data.config.ldspdi
             let url = config.endpoints[config.index]+"/query/table" ;
             let data = this.getQueryResults(url, key, {"LG_NAME":lang,"searchType":"Res_simpleFacet","R_PROP":property});

             //console.log("simpleFacet end",data)

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

           console.log("datatypes",data)



           return data ;
      } catch(e) {
           throw e;
      }
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
         console.log("patch",e)
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

      //console.log("aD", authData);

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
         console.error("auth0 email update failed",e)
         return { statusCode:-1, error:"auth0 email update failed", message:e  }
      }

      //console.log("rL", resetLink);

  }


  async getPasswordResetLink(user_id, passwordData) {

      let authData = await (await this._fetch( 'https://bdrc-io.auth0.com/oauth/token',  {
         method: 'POST',
         body: JSON.stringify(passwordData),
         headers:new Headers({ 'content-type': 'application/json'})
      })).json()

      console.log("aD", authData);

      let resetLink = await (await this._fetch( passwordData.audience + "tickets/password-change",  {
         method: 'POST',
         body: JSON.stringify({ user_id, result_url: window.location.href }),
         headers:new Headers({ 'authorization': "Bearer " + authData.access_token, 'content-type': 'application/json'})
      })).json()

      console.log("rL", resetLink);

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
                  if(t.type && t.count && [bdo+"Work",bdo+"Instance",bdo+"Person",bdo+"Topic",bdo+"Role",bdo+"Corporation",bdo+"Place",bdo+"Lineage",bdo+"Chunk"].indexOf(t.type.value) !== -1) 
                     return { ...acc, [t.type.value.endsWith("Chunk")?bdo+"Etext":t.type.value]:t.count.value}
                  return acc
               },{})
            }

           console.log("datatypes",data)

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

             console.log("oneDatatype",data)

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

                 console.log("oneFacet",data)

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

      _assocResourcesPath(IRI:string): string {

         if(!IRI.indexOf(':') === -1) IRI = "bdr:"+IRI

         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index] ;

          let path = url +  "/lib/allAssocResource?R_RES=" + IRI;

          return path;
      }

      get _userEditPoliciesPath(): string {
         let path = USER_EDIT_POLICIES_PATH;

         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index] ;

         path = url + USER_EDIT_POLICIES_PATH;
         
         // to use with ldspdi running locally
         path = "//editserv.bdrc.io" + USER_EDIT_POLICIES_PATH;

         return path;
      }

     get _userPath(): string {
        let path = USER_PATH;

       let config = store.getState().data.config.ldspdi
       let url = config.endpoints[config.index] ;

         path = url +  USER_PATH;

         // to use with ldspdi running locally
         path = "//editserv.bdrc.io" + USER_PATH
         
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

      console.log("path",path)

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
    