//@flow
import store from '../index';

const CONFIG_PATH = '/config.json'
const CONFIGDEFAULTS_PATH = '/config-defaults.json'

export interface APIResponse {
    text(): Promise<string>
}

type APIOptions = {
    server?: string,
    fetch?: (req: string) => Promise<*>
}

export class ResourceNotFound extends Error {};

export class InvalidResource extends Error {};

export default class API {
    _server: string;
    _fetch: (req: string) => Promise<APIResponse>

    constructor(options: ?APIOptions) {
        if (options) {
            if (options.server) this._server = options.server;
            this._fetch = (options.fetch) ? options.fetch : window.fetch.bind(window);
        } else {
            this._fetch = window.fetch.bind(window);
        }
    }


     getURLContents(url: string, minSize : boolean = true): Promise<string> {
         let text;
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

    testHost(host : string): Promise<boolean>
    {
      return new Promise((resolve, reject) =>
      {
         this._fetch(host+"/resource/P1").then((response) =>
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

   getSearchContents(url: string, key:string, param:string="L_LANG=@bo-x-ewts&I_LIM=50&"): Promise<[]> {
      let text;
      return new Promise((resolve, reject) => {

          this._fetch( url,
          {// header pour accéder aux résultat en JSON !
            method: 'POST',
            body:"searchType=BLMP&"+param+"L_NAME=\""+key+"\"",
            headers:new Headers({"Content-Type": "application/x-www-form-urlencoded"})
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

                  text = JSON.parse(req) //.results.bindings ;

                  if(text.length === 0) {
                     throw new InvalidResource('No results found');
                  }

                  resolve(text);
              }).catch((e) => {
                 reject(e);
             });
          }).catch((e) => {
              reject(e);
          });
      });
   }

   async _getResultsData(key: string): Promise<[] | null> {
      try {
           let config = store.getState().data.config.ldspdi
           let url = config.endpoints[config.index]+"/resource/templates" ;
           let data = this.getSearchContents(url, key);

           return data ;
      } catch(e) {
           throw e;
      }
  }

   async getResults(key: string): Promise<[] | null> {
     let data = [];

     try {
         data = await this._getResultsData(key)

         return data ;
      } catch(e) {
         throw e;
      }
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
