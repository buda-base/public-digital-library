//@flow
import store from '../index';

const CONFIG_PATH = '/config.json'
const CONFIGDEFAULTS_PATH = '/config-defaults.json'
const ONTOLOGY_PATH = '/ontology.json'

export interface APIResponse {
    text(): Promise<string>
}

type APIOptions = {
    server?: string,
    fetch?: (req: string, args?:{}) => Promise<*>
}

export class ResourceNotFound extends Error {};

export class InvalidResource extends Error {};

export default class API {
    _server: string;
    _fetch: (req: string, args?:{}) => Promise<APIResponse>

    constructor(options: ?APIOptions) {
        if (options) {
            if (options.server) this._server = options.server;
            this._fetch = (options.fetch) ? options.fetch : window.fetch.bind(window);
        } else {
            this._fetch = window.fetch.bind(window);
        }
    }


     async getURLContents(url: string, minSize : boolean = true): Promise<string> {

         let response = await this._fetch( url )

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

         let text = await response.text()

         //console.log("RESPONSE text",text)

         if(minSize && text.length <= 553) { throw new ResourceNotFound('The resource does not exist.'); }

         return text ;
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

    async loadConfig(): Promise<string>
    {
      try {
         let config =  JSON.parse(await this.getURLContents(this._configPath,false));
         console.log("config",config)
         return config ;
      }
      catch(e) {
         let config =  JSON.parse(await this.getURLContents(this._configDefaultsPath,false));
         console.log("config-defaults",config)
         return config ;
      }
   }

    async loadOntology(): Promise<string>
    {
         let onto =  JSON.parse(await this.getURLContents(this._ontologyPath,false));
         console.log("onto",onto)
         return onto ;
   }

    async loadResource(IRI:string): Promise<string>
    {
         let resource =  JSON.parse(await this.getURLContents(this._resourcePath(IRI),false));
         console.log("resource",resource)
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
         this._fetch(host+"/query/Person_details?R_RES=bdr:P1583").then((response) =>
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


   async getQueryResults(url: string, key:string, param:{}={}, method:string = "POST"): Promise<{}>
   {

      //console.log("key",key)

      let res = {}
      param = { "searchType":"Res_withType","LG_NAME":"bo-x-ewts","I_LIM":500, ...param }
      if(key.indexOf("\"") === -1) key = "\""+key+"\""
      param["L_NAME"] = key ;
      url += "/"+param["searchType"];
      delete param["searchType"]

      //console.log("query",key,url,param);

      // let body = Object.keys(param).map( (k) => k+"="+param[k] ).join('&') +"&L_NAME="+key
      //searchType=Res_withFacet&"+param+"L_NAME=\""+key+"\"",

      var formData = new FormData();
      for (var k in param) {
          formData.append(k, param[k]);
      }
      // (using formData directly as body doesn't seem to work...)
      let body = [...formData.entries()]
                     .map(e => encodeURIComponent(e[0]) + "=" + encodeURIComponent(e[1]))
                     .join('&')

      console.log("body",body);

      let response = await this._fetch( url + (method == "GET" ? "?" + body : ""),
      {// header pour accéder aux résultat en JSON !
         method: method,
         ...( method == "POST" && {body:body} ),//body:body,
         headers:new Headers({
            "Accept": "application/json",
         ...( method == "POST" && {"Content-Type": "application/x-www-form-urlencoded"})
        })
      })

      if (!response.ok) {
         if (response.status === '404') {
             throw new ResourceNotFound('The search server '+url+' seem to have moved...');
         }
         else {
            console.log("FETCH pb",response)
             throw new ResourceNotFound('Problem fetching the results ['+response.message+']');
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
           let url = config.endpoints[config.index]+"/query" ;
           let data = this.getQueryResults(url, key, {"LG_NAME":lang});
           // let data = this.getSearchContents(url, key);

           return data ;
      } catch(e) {
           throw e;
      }
  }

     async _getStartResultsData(key: string,lang: string,typ:string[]): Promise<{} | null> {
        try {
             let config = store.getState().data.config.ldspdi
             let url = config.endpoints[config.index]+"/lib" ;
             let param = {"searchType":"rootSearchGraph","LG_NAME":lang}
             if(typ && typ.length >= 1 && typ[0] !== "Any") { param = { ...param, "searchType":typ[0].toLowerCase()+"FacetGraph" } }
             let data = this.getQueryResults(url, key, param,"GET");
             // let data = this.getSearchContents(url, key);

             return data ;
        } catch(e) {
             throw e;
        }
    }

         async _getAssocResultsData(key: string,typ:string[]): Promise<{} | null> {
            try {
                 let config = store.getState().data.config.ldspdi
                 let url = config.endpoints[config.index]+"/lib" ;
                 let param = {"searchType":typ[0].toLowerCase()+"AllAssociations","R_RES":key,"L_NAME":"","LG_NAME":"" }
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
             let url = config.endpoints[config.index]+"/query" ;
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
           let url = config.endpoints[config.index]+"/query" ;
           let data = this.getQueryResults(url, key, {"LG_NAME":lang,"searchType":"Res_allTypes_withCount"});

           console.log("datatypes",data)



           return data ;
      } catch(e) {
           throw e;
      }
  }

     async getResultsOneDatatype(datatype:string,key: string,lang: string): Promise<{} | null> {
        try {
             let config = store.getState().data.config.ldspdi
             let url = config.endpoints[config.index]+"/query" ;
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
                 let url = config.endpoints[config.index]+"/query" ;
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

     async getStartResults(key: string,lang:string,types:string[]): Promise<{} | null> {
       let data = [];

       try {
           data = await this._getStartResultsData(key,lang,types)

           return data ;
        } catch(e) {
           throw e;
        }
    }

         async getAssocResults(key: string,types:string[]): Promise<{} | null> {
           let data = [];

           try {
               data = await this._getAssocResultsData(key,types)

               return data ;
            } catch(e) {
               throw e;
            }
        }

      _resourcePath(IRI:string): string {

         let config = store.getState().data.config.ldspdi
         let url = config.endpoints[config.index] ;

          let path = url +  "/resource/" + IRI + ".json";

          return path;
      }

            _assocResourcesPath(IRI:string): string {

               let config = store.getState().data.config.ldspdi
               let url = config.endpoints[config.index] ;

                let path = url +  "/lib/allAssocResource?R_RES=bdr:" + IRI;

                return path;
            }

     get _ontologyPath(): string {
        let path = ONTOLOGY_PATH;

       let config = store.getState().data.config.ldspdi
       let url = config.endpoints[config.index] ;

         path = url +  ONTOLOGY_PATH;

        return path;
    }
   get _configPath(): string {
      let path = CONFIG_PATH;
      if (this._server) {
          path = this._server + '/' + CONFIG_PATH;
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
