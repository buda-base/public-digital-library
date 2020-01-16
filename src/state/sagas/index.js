
//import download from "downloadjs";
//import fileDownload from "js-file-download" ;
import _ from "lodash";
import { call, put, takeLatest, select, all } from 'redux-saga/effects';
import { INITIATE_APP } from '../actions';
import * as dataActions from '../data/actions';
import * as uiActions from '../ui/actions';
import selectors from '../selectors';
import store from '../../index';
import bdrcApi, { getEntiType } from '../../lib/api';
import {sortLangScriptLabels, extendedPresets} from '../../lib/transliterators';
import {auth} from '../../routes';
import {shortUri,fullUri} from '../../components/App'
import qs from 'query-string'

// to enable tests
const api = new bdrcApi({...process.env.NODE_ENV === 'test' ? {server:"http://localhost:5555/test"}:{}});


const adm  = "http://purl.bdrc.io/ontology/admin/" ;
const bda  = "http://purl.bdrc.io/admindata/"
const bdo  = "http://purl.bdrc.io/ontology/core/";
const bdr  = "http://purl.bdrc.io/resource/";
const owl   = "http://www.w3.org/2002/07/owl#" ; 
const skos = "http://www.w3.org/2004/02/skos/core#";
const tmp = "http://purl.bdrc.io/ontology/tmp/" ;
const _tmp = tmp ;

let IIIFurl = "http://iiif.bdrc.io" ;

const handleAuthentication = (nextState, replace) => {
   if (/access_token|id_token|error/.test(nextState.location.hash)) {
      auth.handleAuthentication();
   }
}

let sameAsR = {}

async function initiateApp(params,iri,myprops) {
   try {
      let state = store.getState()

      //      console.log("youpla?",prefix)

      if(!state.data.config)
      {
         const config = await api.loadConfig();
         auth.setConfig(config.auth,config.iiif,api)

         if(myprops) {
            handleAuthentication(myprops);
         }
         store.dispatch(dataActions.loadedConfig(config));
         //console.log("config",config)
         store.dispatch(uiActions.langPreset(config.language.data.presets[config.language.data.index]))
         //console.log("preset",config.language.data.presets[config.language.data.index])
         //store.dispatch(dataActions.choosingHost(config.ldspdi.endpoints[config.ldspdi.index]));
      }


      if(!state.data.ontology)
      {
         const onto = await api.loadOntology();
         store.dispatch(dataActions.loadedOntology(onto));
         // console.log("params",params)
      }

      if(!state.data.dictionary)
      {
         const dico = await api.loadDictionary()
         store.dispatch(dataActions.loadedDictionary(dico));         
         
      }

      // [TODO] load only missing info when needed (see click on "got to annotation" for WCBC2237)
      if(iri || (params && params.r)) // && (!state.data.resources || !state.data.resources[iri]))
      {
         let res,Etext ;
         if(!iri) iri = params.r

         Etext = iri.match(/^([^:]+:)?UT/)

         try {
            if(!Etext) res = await api.loadResource(iri)
            else res = await api.loadEtextInfo(iri)
         }
         catch(e){
            store.dispatch(dataActions.noResource(iri,e));
            return
         }

         /*
         if(iri.match(/([.]bdrc[.])|(bdr:)/)) try {    
            let adminRes = await api.loadResource(iri.replace(/bdr:/,"bda:"));

            //store.dispatch(dataActions.gotAdminResource(iri, res));
            
            let prop = [ "originalRecord", "metadataLegal", "contentProvider" ]
            for(let p of prop) 
               if(adminRes[iri.replace(/bdr:/,bda)][adm+p]) res[iri.replace(/bdr:/,bdr)][adm+p] = adminRes[iri.replace(/bdr:/,bda)][adm+p]

            console.log("adminRes",adminRes,res)
         }
         catch(e) {
            console.error("no admin data for "+iri,e)
         }
         */


         if(!Etext)
         {
            store.dispatch(dataActions.gotResource(iri,res));
            
            let assocRes = await api.loadAssocResources(iri)
            store.dispatch(dataActions.gotAssocResources(iri,assocRes))
            sameAsR[iri] = true ;

            let url = fullUri(iri)

            if(res[url]) for(let k of Object.keys(res[url])) {
               if(k.match(/[#/]sameAs/)) {
                  for(let a of res[url][k]) {
                     let shortU = shortUri(a.value)
                     if(!sameAsR[shortU])
                     {
                        sameAsR[shortU] = true ;
                        if(shortU !== a.value) {
                           assocRes = await api.loadAssocResources(a.value)
                           if(!sameAsR[iri]) store.dispatch(dataActions.gotAssocResources(iri,assocRes))
                           store.dispatch(dataActions.gotAssocResources(shortU,assocRes))
                        }
                     }
                  }
               }
            }

            store.dispatch(dataActions.getAnnotations(iri))
         }
         else {
            /*
            let res0 = { [ bdr+iri] : {...res["@graph"].reduce(
            (acc,e) => {
            let obj = {}, q
            console.log("e",e)
            Object.keys(e).map(k => {
            if(!k.match(/[:@]/)) q = bdr+k
            else q = k
            console.log("k",k,q,e[k],e[k].length)
            if(!e[k].length && e[k]["@id"]) obj[q] = { value:e[k]["@id"].replace(/bdr:/,bdr), type:"uri"}
            else if(!e[k].length || Array.isArray(e[k]) || !e[k].match(/^bdr:[A-Z][A-Z0-9_]+$/)) obj[q] = e[k]
            else obj[q] = { value:e[k].replace(/bdr:/,bdr), type:"uri"}
         })
         return ({...acc,...obj})
      },{}) } }
      delete res0[bdr+iri]["@id"]
      let lab = res0[bdr+iri][bdr+"eTextTitle"]
      if(!lab["@value"]) lab = { "@value":lab, "@language":""}
      console.log("lab",lab)
      res0[bdr+iri][skos+"prefLabel"] = { "lang" : lab["@language"], value : lab["@value"] } //{ value:res0[bdr+iri]["eTextTitle"], lang:"" }
      */


      let bdrIRI = fullUri(iri) 

      
      let assoRes = {"data":Object.keys(res).reduce((acc,e)=>{
         //return ({...acc,[e]:Object.keys(res[e]).map(f => ( { type:f, ...res[e][f] } ) ) } )
            let val = Object.keys(res[e]).reduce(
               (acc,f) => { 
                  if(f.match(/[Ll]abel/))
                     return ([...acc, ...res[e][f] ]) 
                  else return acc ;
                  },
               [])
            if(!val.length) return acc ;
            else return ({...acc, [e]:val })
         },{})}

      //console.log("gotAR",JSON.stringify(assoRes,null,3));

      store.dispatch(dataActions.gotAssocResources(iri,assoRes));

      res = { [bdrIRI] : Object.keys(res).reduce((acc,e) => {

         //if(Object.keys(res[e]).indexOf(skos+"prefLabel") === -1)
         return ({...acc, ...Object.keys(res[e]).filter(k => k !== bdo+"itemHasVolume").reduce(
            (acc,f) => ({...acc,[f]:res[e][f]}),
            {}) })
            //else
            //   return acc
            /*Object.keys(res[bdr+iri][e]).reduce((ac,f) => {
            console.log("e,ac,f",e,ac,f)
            return ( { ...ac, ...res[bdr+iri][e][f] })
         },{})})*/
      },{}) }



      if(res[bdrIRI]) {
         if(!res[bdrIRI][bdo+"eTextHasPage"]) store.dispatch(dataActions.getChunks(iri));
         else {
            res[bdrIRI][bdo+"eTextHasPage"] = []
            store.dispatch(dataActions.getPages(iri)); 
         }
      }         
   
      store.dispatch(dataActions.gotResource(iri,res));

   }

   //let t = getEntiType(iri)
   //if(t && ["Person","Place","Topic"].indexOf(t) !== -1) {
   //   store.dispatch(dataActions.startSearch("bdr:"+iri,"",["Any"],t)); //,params.t.split(",")));
   //}
}

if(params && params.p) {

   store.dispatch(dataActions.ontoSearch(params.p));
}
else if(params && params.q) {

   if(!params.lg) params.lg = "bo-x-ewts"
   
   console.log("state q",state.data,params,iri)

   let dontGetDT = false
   let pt = params.t
   if(pt && !pt.match(/,/) && ["Person","Work","Etext"].indexOf(pt) !== -1)  {

      if(!state.data.searches || !state.data.searches[pt] || !state.data.searches[pt][params.q+"@"+params.lg]) {
         store.dispatch(dataActions.startSearch(params.q,params.lg,[pt],null,dontGetDT)); 
         dontGetDT = true
      }
      else {
         store.dispatch(uiActions.loading(params.q, false));         
         store.dispatch(dataActions.foundResults(params.q,params.lg,state.data.searches[pt][params.q+"@"+params.lg],pt))  

         if(state.data.datatypes && state.data.datatypes[params.q+"@"+params.lg])
            store.dispatch(dataActions.foundDatatypes(params.q,params.lg,state.data.datatypes[params.q+"@"+params.lg]))
      }
   
      //store.dispatch(uiActions.selectType(pt));
   }
   else //if(params.t) { //} && ["Any"].indexOf(params.t) !== -1)   
   {
      if(!state.data.searches || !state.data.searches[params.q+"@"+params.lg])
         store.dispatch(dataActions.startSearch(params.q,params.lg)); //,params.t.split(",")));
      else {
         store.dispatch(uiActions.loading(params.q, false));
         store.dispatch(dataActions.foundResults(params.q,params.lg,state.data.searches[params.q+"@"+params.lg]))
      }
      //store.dispatch(uiActions.selectType(params.t?params.t:"Any"));
   }
   /*
   else if(params.t && ["Any"].indexOf(params.t) === -1)   
   {
      if(!state.data.searches || !state.data.searches[params.q+"@"+params.lg])
         store.dispatch(dataActions.startSearch(params.q,params.lg)); //,params.t.split(",")));
      else
         store.dispatch(dataActions.foundResults(params.q,params.lg,state.data.searches[params.q+"@"+params.lg]))

      store.dispatch(uiActions.selectType(params.t));
   }
   else //if(!state.data.searches || !state.data.searches[params.q+"@"+params.lg])
   {
      store.dispatch(dataActions.startSearch(params.q,params.lg));
   }
   */
}
else if(params && params.i) {
   let t = getEntiType(params.i)

   if(["Work"].indexOf(t) !== -1
   && (!state.data.searches || !state.data.searches[params.r+"@"]))
   {
      store.dispatch(dataActions.getInstances(params.i,true));
   }
}
else if(params && params.r) {
   let t = getEntiType(params.r)

   console.log("state r",t,state.data.searches,params,iri)

   let s = ["Any"]
   //if(params.t && params.t != "Any") { s = [ params.t ] }
   
   if(t && ["Person","Place","Topic","Work","Role"].indexOf(t) !== -1
   && (!state.data.searches || !state.data.searches[params.r+"@"]))
   {
      store.dispatch(dataActions.startSearch(params.r,"",s,t)); //,params.t.split(",")));
   }
   else {
      store.dispatch(uiActions.loading(params.r, false));
      store.dispatch(dataActions.foundResults(params.r,"", state.data.searches[params.r+"@"], params.t));
      if(state.data.searches[params.t] && state.data.searches[params.t][params.r+"@"] && state.data.searches[params.t][params.r+"@"].metadata)
         store.dispatch(dataActions.foundFacetInfo(params.r,"", [params.t],state.data.searches[params.t][params.r+"@"].metadata ));
   }
}

} catch(e) {
   console.error('initiateApp error: %o', e);
   // TODO: add action for initiation failure
}
}

function* watchInitiateApp() {
   yield takeLatest(
      INITIATE_APP,
      (action) => initiateApp(action.payload,action.meta.iri,action.meta.auth)
   );
}

async function getResetLink(id,user,profile)
{
   if(profile && profile.sub && !profile.sub.match(/^auth0[|]/)) return

   let props = store.getState()

   try {         
      let passwordData = props.data.config["password-reset"]
      let resetLink = await api.getPasswordResetLink(profile.sub, passwordData)
      
      user[tmp+"passwordResetLink"] =  [ { type:'uri', value: resetLink } ]
      store.dispatch(dataActions.gotResource(id, { [id]: user }));
   }
   catch(e)
   {
      console.error("password link",e)
   }

}
function* watchGetResetLink() {
   yield takeLatest(
      dataActions.TYPES.getResetLink,
      (action) => getResetLink(action.payload,action.meta.user,action.meta.profile)
   );
}

async function getUser(profile)
{
   let props = store.getState()

   let userEditPolicies = props.data.userEditPolicies 
   if(!userEditPolicies) {
      userEditPolicies = await api.loadUserEditPolicies()
      store.dispatch(dataActions.gotUserEditPolicies(userEditPolicies))
   }

   let user = await api.loadUser()

   if(user) {
      
      let id = user["@id"] ;
      if(!id) id = Object.keys(user)[0]
      else user = { [id] : Object.keys(user).reduce( (acc,k) => {

         let val = user[k]
         if(k === "type") k = "rdfs:type"

         //console.log("acc",k,val)

         let toJson = (o) => {

            //console.log("o",o)

            if(o.match) {
               if(o.match(/:/)) 
                  return { type:'uri', value:fullUri(o)}
               else              
                  return { type:'literal', value:fullUri(o)}             
            }
            else if(o["@id"]) {
               o.value = fullUri(o["@id"])
               delete o["@id"]
               return o
            }
            else return o


         }

         if(!Array.isArray(val)) {
            val = [ toJson(val) ];
         } else {
            val = val.map(e => toJson(e))
         }
            
         if(!k.match(/^@/)) return ({ ...acc, [fullUri(k,true)]:val})
         else return acc ;
      },{}) }

      user[id].profile = profile

      store.dispatch(uiActions.gotUserID(id));
      store.dispatch(dataActions.gotResource(id, user));
      console.log("user",id,profile,user)
   }

}

function* watchGetUser() {
   yield takeLatest(
      dataActions.TYPES.getUser,
      (action) => getUser(action.payload)
   );
}

export function* chooseHost(host:string) {
   try
   {
      yield call([api, api.testHost], host);
      yield put(dataActions.chosenHost(host));
   }
   catch(e)
   {
      // yield put(dataActions.chosenHost(host));
      yield put(dataActions.hostError(host,e.message));
   }
}

export function* watchChoosingHost() {

   yield takeLatest(
      dataActions.TYPES.choosingHost,
      (action) => chooseHost(action.payload)
   );
}


async function getChunks(iri,next) {
   try {

      let data = await api.loadEtextChunks(iri,next);

      data = _.sortBy(data["@graph"],'seqNum')
      .filter(e => e.chunkContents)
      .map(e => ({
        value:e.chunkContents["@value"],
        seq:e.seqNum,
        start:e.sliceStartChar,
        end:e.sliceEndChar
       })); //+ " ("+e.seqNum+")" }))

      console.log("dataC",iri,next,data)

      store.dispatch(dataActions.gotNextChunks(iri,data))
   }
   catch(e){
      console.error("ERRROR with chunks",iri,next,e)

      //store.dispatch(dataActions.chunkError(url,e,iri);
   }

}

async function getPages(iri,next) {
   try {
      let data, chunk, pages ;
      /*
      if(next == 0) {
         data = await api.loadEtextChunks(iri,next,1000);  
         chunk = _.sortBy(data["@graph"].filter(e => e.type === "EtextPage"),'sliceStartChar')    
         next = Number(chunk[0].seqNum)
      }
      data = await api.loadEtextPages(iri,next);
      chunk = _.sortBy(data["@graph"].filter(e => e.chunkContents),'sliceStartChar')                  
      */


      data = await api.loadEtextChunks(iri,next);
      chunk = _.sortBy(data["@graph"].filter(e => e.chunkContents),'sliceStartChar')                  
      pages = _.sortBy(data["@graph"].filter(e => e.type && e.type === "EtextPage"),'seqNum')

      let lang = chunk[0].chunkContents["@language"]

      //let start = chunk[0].sliceStartChar
      //chunk = chunk.map(e => e.chunkContents["@value"]).join() //.replace(/..$/,"--")).join()      
      //console.log("chunk@"+start,chunk)


      console.log("pages",pages)

      data = pages.map(e => {
         //console.log("page?",e,e.sliceStartChar,e.sliceEndChar,start)
         if(e.sliceEndChar <= chunk[chunk.length - 1].sliceEndChar) 
            return {
               //value:(chunk.substring(e.sliceStartChar - start,e.sliceEndChar - start - 1)).replace(/[\n\r]+/,"\n").replace(/(^\n)|(\n$)/,""),
               value:chunk.reduce( (acc,c) => { 
                  let content = c["chunkContents"], start = -1, end = -1
                        
                  if( e.sliceStartChar >= c.sliceStartChar && e.sliceStartChar <= c.sliceEndChar 
                  || e.sliceEndChar >= c.sliceStartChar   && e.sliceEndChar <= c.sliceEndChar  ) {

                     if(e.sliceStartChar < c.sliceStartChar) start = 0
                     else start = e.sliceStartChar - c.sliceStartChar

                     if(e.sliceEndChar > c.sliceEndChar) end = c.sliceEndChar - c.sliceStartChar
                     else end = e.sliceEndChar - c.sliceStartChar
                  }
                  else if( e.sliceStartChar <= c.sliceStartChar && e.sliceEndChar >= c.sliceEndChar )
                  {
                     start = 0
                     end = c.sliceEndChar - c.sliceStartChar
                  }

                  if(start >= 0 && end >= 0) {
                     acc += content["@value"].substring(start,end) ;
                  }

                  return acc ; 
               },"").replace(/[\n\r]+/,"\n").replace(/(^\n)|(\n$)/,""),
               language:lang,
               seq:e.seqNum,
               start:e.sliceStartChar,
               end:e.sliceEndChar        
            }
         
      }).filter(e => e); //+ " ("+e.seqNum+")" }))

      console.log("dataP",iri,next,data)

      store.dispatch(dataActions.gotNextPages(iri,data))
   }
   catch(e){
      console.error("ERRROR with pages",iri,next,e)
   }

}


async function createPdf(url,iri) {
   try
   {

      let nUrl = url.replace(/(pdf|zip)/,iri.file)
      console.log("creaP",url,nUrl,iri,iri.file)
      url = nUrl

      let config = store.getState()
      if(config) config = config.data
      if(config) config = config.config
      if(config) config = config.iiif
      if(config) IIIFurl = config.endpoints[config.index]
      //console.log("IIIF",IIIFurl)
      let data = JSON.parse(await api.getURLContents(IIIFurl+url,false,"application/json"))

      console.log("pdf",data)

      store.dispatch(dataActions.pdfReady(IIIFurl+data.links,{url,iri:iri.iri}))

      //window.open(IIIFurl+data.links,"pdf");

      //let fic = await api.getURLContents("http://iiif.bdrc.io"+data.links);
      //console.log("pdf here")
      //fileDownload("http://iiif.bdrc.io"+data.links,"name.pdf") ;
      //download("http://iiif.bdrc.io"+data.links);

   }
   catch(e){
      console.error("ERRROR with pdf",e)

      //store.dispatch(dataActions.manifestError(url,e,iri))
   }
}

async function requestPdf(url,iri) {
   try {

      console.log("reqP",url,iri)


      let data = JSON.parse(await api.getURLContents(url,false,"application/json"))

      data = _.sortBy(Object.keys(data).map(e => ({...data[e],volume:Number(data[e].volume),id:e})),["volume"])

      //console.log("pdf",url,iri,data,data[0])

      store.dispatch(dataActions.pdfVolumes(iri,data))



   }
   catch(e){
      console.error("ERRROR with pdf",e)

      //store.dispatch(dataActions.manifestError(url,e,iri))
   }
}
async function getAnnotations(iri) {
   try {
      console.log("getA",iri)

      let listA = await api.loadAnnoList(iri)
      console.log("listA",listA)

      for(let k of Object.keys(listA))
      {
         console.log("k",k,listA[k])

         let collec = await api.getQueryResults(k, "", {searchType:"",L_NAME:""}, "GET","application/json"
         ,{"Prefer": "return=representation;include=\"http://www.w3.org/ns/oa#PreferContainedDescriptions\""})

         console.log(collec);

         store.dispatch(dataActions.gotAnnoResource(iri,collec,k))
      }
   }
   catch(e){
      //console.error("ERRROR with Annotations",e)
      store.dispatch(dataActions.gotAnnoResource(iri,{}))

   }
}

async function getImageVolumeManifest(url,iri) {
   try {

      console.log("getIVM",url,iri)

      let manif = await api.loadManifest(url);
      store.dispatch(dataActions.gotImageVolumeManifest(manif,iri))

   }
   catch(e){
      console.error("ERRROR with manifest",e)

      store.dispatch(dataActions.manifestError(url,e,iri))
   }
}

// changes the dimension of a iiif url to the specified dimension string
function changedims(imgurl, newdimstr) {
   let fragments = imgurl.split('/')
   fragments[fragments.length-3] = newdimstr
   return fragments.join('/')
}

// gets a reasonable thumbnail url from a iiif image resource
function getiiifthumbnailurl(imgres) {
   let origurl = imgres["@id"]
   // for odd CUDL manifests
   if (origurl.match(/cudl[.]lib.*jp2/)) origurl += "/full/max/0/default.jpg"
   let h = imgres["height"]
   let w = imgres["width"]
   let maxh = 1000
   let maxw = 4000
   let resulth = 600
   let resultw = 2000
   if (h < maxh && w < maxw)
      return origurl
   if (!h || h >= maxh)
      return changedims(origurl, ","+resulth)
   return changedims(origurl, resultw+",")
}

async function getManifest(url,iri) {
   try {

      console.log("getM",url,iri)

      let collecManif
      let manif = await api.loadManifest(url);
      store.dispatch(dataActions.gotManifest(manif,iri))
      let manifests
      //collection ?
      if(!manif.sequences ) {
         while (!manif.manifests && manif.collections) {
            if(!collecManif) collecManif = manif.collections[0]["@id"]
            manif = await api.loadManifest(manif.collections[0]["@id"]);
         }
         if (manif.manifests) {
            let isSingle ;
            if(!collecManif && manif.manifests.length === 1) isSingle = true ;
            else manifests = manif.manifests
            if(!collecManif) collecManif = manif.manifests[0]["@id"]
            manif = await api.loadManifest(manif.manifests[0]["@id"]);
            if(!isSingle) collecManif = null  //manif.manifests[0]["@id"]
         }
         else throw new Error("collection without manifest list")
      }      

      if(manif.sequences && manif.sequences[0] && manif.sequences[0].canvases) {
         if(manif.sequences[0].canvases[0] && manif.sequences[0].canvases[0].images[0] &&
            manif.sequences[0].canvases[0].images[0].resource["@id"])
         {
            let imageres = manif.sequences[0].canvases[0].images[0].resource
            //console.log("image",imageres )

            let imageIndex = 0
            if (imageres && imageres["@id"] && imageres["@id"].match(/archivelab[.]org.*rashodgson13[$]0[/]full/)) {
               imageIndex = 1
               imageres = manif.sequences[0].canvases[imageIndex].images[0].resource
            }

            let canvasID = manif.sequences[0].canvases[imageIndex]["@id"]

            let image = getiiifthumbnailurl(imageres)

            let test = await api.getURLContents(image,null,null,null,true)
            //console.log("img",test)
            //let imgData = btoa(String.fromCharCode(...new Uint8Array(test)));
            store.dispatch(dataActions.firstImage(image,iri,canvasID,collecManif,manifests)) //,imgData))
         }
      }
   }
   catch(e){
      console.error("ERRROR with manifest",e)

      store.dispatch(dataActions.manifestError(url,e,iri))
   }
}
/*
export function* getDatatypes(key,lang) {

   try {

      const datatypes = yield call([api, api.getResultsDatatypes], key,lang);

      yield put(dataActions.foundDatatypes(key,datatypes));

   } catch(e) {
      yield put(dataActions.searchFailed(key, e.message));
      yield put(dataActions.notGettingDatatypes());
   }
}
*/

function getData(result,inMeta,outMeta)  {

   console.log("kz",JSON.stringify(Object.keys(result)))

   let data = result, numR = -1
   if(!result.metadata && inMeta) result.metadata = { ...inMeta } 
   let metadata = result.metadata ;
   if(data && data.people) {
      data.persons = data.people
      delete data.people
   }
   if(data && data.data) {
      data.works = data.data
      delete data.data
   }

   /* // deprecated

   if(data && data.publishedworks)
   {
      data.works = { ...data.publishedworks, ...data.works }
      delete data.publishedworks
      if(metadata[bdo+"PublishedWork"]) {
         if(!metadata[bdo+"Work"]) metadata[bdo+"Work"] = 0
         metadata[bdo+"Work"] += metadata[bdo+"PublishedWork"]
      }
      else if(metadata["publishedwork"]) {
         if(!metadata["work"]) metadata["work"] = 0 
         metadata["work"] += metadata["publishedwork"]
      }
      delete metadata[bdo+"PublishedWork"]
      delete metadata["publishedwork"]

      //console.log("data?W",data,metadata)
   }

   if(data && data.abstractworks)
   {
      data.works = { ...Object.keys(data.abstractworks).reduce( (acc,k)=>{
         return { ...acc, [k]:[ ...data.abstractworks[k], { "type":bdo+"WorkType","value":bdo+"AbstractWork" } ] }
      },{}), ...data.works }
      delete data.abstractworks
      if(metadata[bdo+"AbstractWork"]) {
         if(!metadata[bdo+"Work"]) metadata[bdo+"Work"] = 0
         metadata[bdo+"Work"] += metadata[bdo+"AbstractWork"]
      }
      else if(metadata["abstractwork"]) {
         if(!metadata["work"]) metadata["work"] = 0
         metadata["work"] += metadata["abstractwork"]
      }
      delete metadata[bdo+"AbstractWork"]
      delete metadata["abstractwork"]
   }

   if(data && data.unicodeworks)
   {
      data.etexts = { ...Object.keys(data.unicodeworks).reduce( (acc,k)=>{
         return { ...acc, [k]:[ ...data.unicodeworks[k] ] }
      },{}), ...data.etexts }
      delete data.unicodeworks
      if(metadata[bdo+"Etext"] && metadata[bdo+"UnicodeWork"]) {
         metadata[bdo+"Etext"] += metadata[bdo+"UnicodeWork"]
      }
      else if(metadata["etext"] && metadata["unicodework"]) {
         metadata["etext"] += metadata["unicodework"]
      }
      else {
         metadata["etext"] = metadata["unicodework"]
      }
      delete metadata[bdo+"UnicodeWork"]
      delete metadata["unicodework"]
   }  

   */

   if(data && data.chunks) {

      data.etexts = Object.keys(data.chunks).map(e => ({ [e]:_.orderBy(data.chunks[e],"type") })).reduce((acc,e)=>({...acc,...e}),{})

      /*
      // sorting chunks by etext & seqnum ? might break fuseki match score order
      let pre = []
      for(let c of Object.keys(data.chunks))
      {
      let k = data.chunks[c].filter(e => e.type.match(/forEtext$/))
      if(k && k.length > 0) k = k[0].value
      else k = null ;
      let n = data.chunks[c].filter(e => e.type.match(/seqNum$/))
      if(n && n.length > 0) n = n[0].value
      else n = null ;
      pre.push({ e:_.sortBy(data.chunks[c],"type"), k, c, n })
   }
   data.etexts = _.sortBy(pre,["k","n"]).reduce((acc,e) => ({...acc, [e.c]:e.e}),{})
   //console.log("pre",pre,data.etexts)
   */

     delete data.chunks
  }

   
   console.log("data?W",data,metadata)


  //console.log("resultR",result)
  //&& Object.values(result).map(o => o?Object.keys(o):null).filter(k => (""+k).match(new RegExp(bdr))).length == 0)))

  if(Object.keys(result).length == 0 || (Object.keys(result).length == 1 && result["metadata"] )) { numR = 0 }
  else
  {
     numR = Object.keys(result).reduce((acc,e) => {
        //console.log("res",result[e])
        if(result[e]!=null) return ( acc + (e=="metadata"?0:Object.keys(result[e]).length))
        else return acc
     },0)

     console.log("numRa",numR,metadata)

     if(metadata)
     {
        let kZ = Object.keys(metadata)
        if(kZ.reduce((acc,k) => (acc || k.match(/^http:/) ),false))
        numR = kZ.reduce((acc,k) => ( acc+Number(metadata[k])),0)

        if(outMeta) Object.keys(data.metadata).map(k => outMeta[k] = data.metadata[k])  

        delete data.metadata
     }

     //console.log("numRb",numR)
  }

  console.log("getData#result",result,numR)

  data = {  numResults:numR, results : { bindings: {...data } } }

  return data
}


function getStats(cat:string,data:{},tree:{})
{
   let stat={}
   let config = store.getState().data.config

   let keys = Object.keys(config.facets[cat])

   console.log("stat/keys",keys,tree)
   
   if(auth && !auth.isAuthenticated()) {
      let hide = config["facets-hide-unlogged"][cat]
      console.log("hide",hide)
      if(hide && hide.length) {
         keys = keys.reduce( (acc,k) => (hide.indexOf(k)===-1?[...acc,k]:acc),[])
      }
   }

   let parents, treeParents = {}
   if(tree && tree["@graph"] && tree["@graph"].length > 1) {
      parents = {}
      for(let node of tree["@graph"]) parents[node["@id"]] = node

      for(let node of Object.keys(parents)) { 
         if(parents[node]["taxHasSubClass"] && parents[node]["taxHasSubClass"].length) {
            for(let sub of parents[node]["taxHasSubClass"]) { 
               if(!parents[sub]) parents[sub] = {}
               parents[sub].ancestor = node
            }
         }
      }

      for(let node of Object.keys(parents)) { 
         if(!parents[node]["taxHasSubClass"] && parents[node].ancestor){
            treeParents[node] = []
            let root = parents[node].ancestor
            do {
               treeParents[node].push(root)
               root = parents[root]
               if(root) root = root.ancestor
            } while(root)
         }
      }

      console.log("parents",parents,treeParents)

      if(treeParents) tree["parents"] = treeParents
   }
   
   let unspecTag = "unspecified"

   for(let _p of Object.keys(data["results"]["bindings"][cat.toLowerCase()+"s"]))   
   {
      let p = data["results"]["bindings"][cat.toLowerCase()+"s"][_p]
      //console.log("p",p);
      for(let f of keys)
      {
         
         //console.log("f",f);
         let genre = [bdo+"workGenre", bdo + "workIsAbout", _tmp + "etextAbout" ]
         let tmp ;
         
         if(f === "tree") tmp = p.filter((e) => (genre.indexOf(e.type) !== -1))
         else tmp = p.filter((e) => (e.type == config.facets[cat][f] && (f !== "about" || !e.value.match(/resource[/]T/) )))

         if(tmp.length > 0) for(let t of tmp) 
         {
            if(!stat[f]) stat[f] = {}
            if(!stat[f][t.value]) stat[f][t.value] = { n:0, dict:{} }
            let pre = stat[f][t.value].n
            if(!pre) pre = 1
            else pre ++ ;
            stat[f][t.value].n = pre ;
            stat[f][t.value].dict[_p] = p
                        
            if(f === "tree" && treeParents && treeParents[t.value]) {
               for(let node of treeParents[t.value]) { 
                  if(!stat[f][node]) stat[f][node] = { n:0, dict:{} }
                  stat[f][node].n ++
                  if(!stat[f][node].dict[_p]) stat[f][node].dict[_p] = []
                  stat[f][node].dict[_p] = stat[f][node].dict[_p].concat(p)
               }
            }

            //console.log("f+1",f,tmp,pre)
         }
         else {
            if(!stat[f]) stat[f] = {}
            if(!stat[f][unspecTag]) stat[f][unspecTag] = { n:0, dict:{} }
            let pre = stat[f][unspecTag].n
            if(!pre) pre = 1
            else pre ++ ;
            stat[f][unspecTag].n = pre ;
            stat[f][unspecTag].dict[_p] = p
            //if(f==="tree") console.log("unspec+1",_p,p,f,tmp,pre)
         }      
         
      }
   }
  
   //console.log("f unspec",stat["tree"][unspecTag]); 

   let state = store.getState()
   let langs = extendedPresets(state.ui.langPreset)
   let assoRes = state.data.assocResources
   if(assoRes) assoRes = assoRes[state.data.keyword]
   let dic = state.data.dictionary
   for(let f of keys)
   {
      if(stat[f] && Object.keys(stat[f]).length === 1 && stat[f][unspecTag]) delete stat[f] ;
      if(stat[f]) { 
         let tmpStat = {}
         for(let k of Object.keys(stat[f])) {
            let kz = Object.keys(stat[f][k])       
            let label,labels
            if(assoRes && assoRes[k]) labels = assoRes[k]
            if(!labels && dic && dic[k]) labels = dic[k][skos+"prefLabel"]
            if(labels) label = sortLangScriptLabels(labels,langs.flat,langs.translit)
            if(!label || !label.length) label = [{ type:"literal", value:"", lang:"" }]
            let n = ""+stat[f][k].n
            if(!tmpStat[n]) tmpStat[n] = []
            tmpStat[n].push({...label[0], k })
         }
         let sortStat = []
         //console.log("tmpStat",tmpStat,sortStat)         
         let kz = _.orderBy(Object.keys(tmpStat).map(n => ({n:Number(n)})), [ "n" ], [ "desc" ]).map(k => k.n)
         for(let n of kz) {
            sortStat = sortStat.concat(sortLangScriptLabels(tmpStat[n],langs.flat,langs.translit))
         }         
         
         stat[f] = sortStat.reduce( (acc,k) => ({...acc, [k.k]:stat[f][k.k]}),{})
      }
   }

   return stat
}

function addMeta(keyword:string,language:string,data:{},t:string,tree:{},found:boolean=true,facets:boolean=true)
{
   console.log("aM",data,data["results"])

   if(data["results"] &&  data["results"]["bindings"] && data["results"]["bindings"][t.toLowerCase()+"s"]){
      console.log("FOUND",data);
      let stat = getStats(t,data,tree);

      if(tree)
      {
         if(stat["tree"]["unspecified"]) {

            let elem = data["results"]["bindings"][t.toLowerCase()+"s"]

            //console.log("elem tree",tree["@graph"][0]) ; //elem,stat)

            if(!tree["@graph"].length) tree["@graph"] = []
            //if(!tree["@graph"][0].length) tree["@graph"][0] = {}
            if(!tree["@graph"][0]["taxHasSubClass"]) tree["@graph"][0]["taxHasSubClass"] = []
            else if(!Array.isArray(tree["@graph"][0]["taxHasSubClass"])) tree["@graph"][0]["taxHasSubClass"] = [ tree["@graph"][0]["taxHasSubClass"] ]
            tree["@graph"][0]["taxHasSubClass"].push("unspecified")
            tree["@graph"].push({"@id":"unspecified","taxHasSubClass":[],"tmp:count":stat["tree"]["unspecified"].n})
         
         }
         tree["@metadata"] = stat.tree
         stat = { ...stat, tree }
      }

      console.log("stat",stat)
      if(found) store.dispatch(dataActions.foundResults(keyword, language, data, [t]));
      if(facets) store.dispatch(dataActions.foundFacetInfo(keyword,language,[t],stat))
      else return stat
   }
}

function mergeSameAs(result,withSameAs,init = true,rootRes = result, force = false, keyword)
{
   //console.log("mSa",result,rootRes,keyword,init,force)

   if(!result) return

   let fullKW
   if(keyword) fullKW = fullUri(keyword)

   let rData, sameBDRC
   if(keyword) { 
      rData = store.getState().data.resources
      if(rData) rData = rData[keyword]
      if(rData) rData = rData[fullKW]
      if(rData) rData = rData[owl+"sameAs"]
      if(rData) rData = rData.filter(r => r.value.match(new RegExp(bdr)))
      if(rData && rData.length) sameBDRC = rData[0].value
      //console.log("rData",rData)
   } 
 
   if(init) for(let t of Object.keys(result)) {
      if(t !== "metadata" && t !== "tree") {
         let fullT = bdo+t[0].toUpperCase()+t.substring(1,t.length - 1)
         let keys = Object.keys(result[t])
         if(keys) for(let k of keys) {
            if(!k.match(/purl[.]bdrc/)) { 
               let same = result[t][k].filter(s => (s.type && s.type === owl+"sameAs" && s.value !== k && s.value.match(/purl[.]bdrc/)) || (s.type === tmp+"relationType" && s.value === owl+"sameAs"))
               if(same.length || force) withSameAs[k] = { t, fullT, props:[ ...result[t][k] ], same:same.map(s=>s.type!==tmp+"relationType"?s.value:(sameBDRC?sameBDRC:(keyword?fullKW:"?"))) }
            }
         }
         
      }
   }

   //console.log("wSa",withSameAs)

   let keys = Object.keys(withSameAs)
   if(keys) for(let i in keys) {
      let k = keys[i]
      let r = withSameAs[k]
      //console.log("k r",k,r)
      if(force && !rootRes[r.t][k]) {
         delete result[r.t][k]
      }
      else for(let s of r.same) {
         let noK 
         let isRid = (fullKW && s === fullKW)
         if(result[r.t] && !result[r.t][s] && !isRid) { 
            result[r.t][s] = []
            noK = true
         }
         let hasSameK 
         if(result[r.t] && result[r.t][k] && (result[r.t][s] || isRid)) {
            //console.log("same?",isRid,k,r.t,s,result[r.t][k],result[r.t][s])
            if(!isRid) { 
               hasSameK = false
               
               result[r.t][k].push({type:owl+"sameAs",value:k})

               for(let v of result[r.t][k])
               {
                  if(v.type === owl+"sameAs" && v.value === k) hasSameK = true
                  let found = false ;
                  for(let w of result[r.t][s])
                  {
                     if( (v.type.match(/sameAs[^/]*$/) && s === v.value) || (v.type === w.type && v.value === w.value && v["xml:lang"] === w["xml:lang"])) {
                        found = true
                        break;
                     }
                  }
                  let v_ = { ...v }
                  if(v.type && v.type === skos+"prefLabel") v_.type = k
                  if(v.type && v.type === s) v_.type = skos+"prefLabel"
                  if(!found) result[r.t][s].push(v_)
               }
               if(noK && !hasSameK && init) result[r.t][s].push({type:owl+"sameAs",value:k})
            }
         }
         let erase = [ k , ...(init||isRid?[]:r.props.filter(p => p.type === owl+"sameAs").map(p => p.value)) ]
         //console.log("erase",erase,noK,hasSameK)
         for(let e of erase) {
            if(result[r.t] && result[r.t][e]) {
               delete result[r.t][e]
               if(isRid && result[r.t][s]) delete result[r.t][s]
               if(!noK && result.metadata && result.metadata[r.fullT]) {
                  result.metadata[r.fullT] --
                  //console.log("meta",result.metadata[r.fullT]) 
               }
            }
         }
      }
   }
   

   return result
}

function sortResultsByTitle(results, userLangs) {
   let keys = Object.keys(results)
   let langs = extendedPresets(userLangs)
   let state = store.getState(), assoR
   if(keys && keys.length) {
      keys = keys.map(k => {
         let lang,value,labels = results[k].filter(e => e.type && e.type.endsWith("abelMatch") ).map(e => ({ ...e, value:e.value.replace(/[↦]/g,"")})) 
         if(!labels.length) labels = results[k].filter(r => r.type && r.type === skos+"prefLabel") //r.value && r.value.match(/↦/))
         if(!labels.length && (assoR = state.data.assocResources[state.data.keyword]) && assoR[k]) labels = assoR[k].filter(r => r.type && r.type === skos+"prefLabel") 
         //console.log("labels?",labels,assoR,k,assoR[k],results[k])
         if(labels.length) { 
            labels = sortLangScriptLabels(labels,langs.flat,langs.translit)
            labels = labels[0]
            if(labels)  { 
               lang = labels.lang
               if(!lang) lang = labels["xml:lang"]
               value  = labels.value
            }
         }
         return { k, lang, value }
      },{})
      //console.log("keys1", keys)
      let sortKeys = sortLangScriptLabels(keys,langs.flat,langs.translit)
      //console.log("keys2", sortKeys)
      let sortRes = {}
      for(let k of sortKeys) sortRes[k.k] = results[k.k]

      console.log("sortResT",sortRes)

      return sortRes
   }
   return results
}

function sortResultsByRelevance(results) {
   let keys = Object.keys(results)
   if(keys && keys.length) {
      keys = keys.map(k => {
         let n = 0, score, p = results[k].length, scoreDel = [],last
         for(let i in results[k]) {
            let v = results[k][i]
            if(v.type === tmp+"matchScore") {
               if(!n) n = Number(v.value)
               else { 
                  let m = Number(v.value)
                  if(m > n) { 
                     console.log("push",v,i,last,n,m)
                     n = m
                     scoreDel.push(Number(last))
                     p--
                  }
               }
               last = i
            }
         }
         // TODO no need to keep all scores (needs to be elsewhere more generic)
         if(scoreDel.length) { 
            for(let i of scoreDel) delete results[k][i]
            results[k] = results[k].filter(e=>e)
         }
         return ({k, n, p})
      },{})
      keys = _.orderBy(keys,['n','p'],['desc', 'desc'])
      //console.log("sortK",keys)

      let sortRes = {}
      for(let k of keys) sortRes[k.k] = results[k.k]

      console.log("sortResR",sortRes)

      return sortRes
   }
   return results
}


function sortResultsByPopularity(results) {
   let keys = Object.keys(results)
   if(keys && keys.length) {
      keys = keys.map(k => {
         let n = 0, score, p = results[k].length
         for(let i in results[k]) {
            let v = results[k][i]
            if(v.type === tmp+"entityScore") {
               n = Number(v.value)
            }
         }
         return ({k, n, p})
      },{})
      keys = _.orderBy(keys,['n','p'],['desc', 'desc'])
      //console.log("sortK",keys)

      let sortRes = {}
      for(let k of keys) sortRes[k.k] = results[k.k]

      console.log("sortResP",sortRes)

      return sortRes
   }
   return results
}


function sortResultsByYear(results) {
   let keys = Object.keys(results)
   if(keys && keys.length) {
      keys = keys.map(k => {
         let n = 9999, score, p = results[k].length
         for(let i in results[k]) {
            let v = results[k][i]
            if(v.type === tmp+"yearStart") {
               n = Number(v.value)
            }
         }
         return ({k, n, p})
      },{})
      keys = _.orderBy(keys,['n','p'],['asc', 'desc'])
      
      console.log("sortK",keys)

      let sortRes = {}
      for(let k of keys) sortRes[k.k] = results[k.k]

      console.log("sortResY",sortRes)

      return sortRes
   }
   return results
}

function rewriteAuxMain(result,keyword,datatype,sortBy)
{
   let asset = [_tmp+"hasOpen", _tmp+"hasEtext", _tmp+"hasImage"]
   let state = store.getState()
   let langPreset = state.ui.langPreset
   if(!sortBy) sortBy = state.ui.sortBy
   result = Object.keys(result).reduce((acc,e)=>{
      if(e === "main") {
         let keys = Object.keys(result[e])
         if(keys) {
            store.dispatch(dataActions.gotAssocResources(keyword,{ data: keys.reduce( (acc,k) => ({...acc, [k]: result[e][k].filter(e => e.type === skos+"altLabel" || e.type === skos+"prefLabel") }),{})  }))
         }
         let t = datatype[0].toLowerCase()+"s"                 
         let dataWithAsset = keys.reduce( (acc,k) => ({...acc, [k]:result[e][k].map(e => (!asset.includes(e.type)||e.value === "false"?e:{type:_tmp+"assetAvailability",value:e.type}))}),{})
         console.log("dWa",dataWithAsset,sortBy)
         if(!sortBy || sortBy === "popularity") return { ...acc, [t]: sortResultsByPopularity(dataWithAsset) }
         else if(sortBy === "closest matches") return { ...acc, [t]: sortResultsByRelevance(dataWithAsset) }
         else if(sortBy === "work title" || sortBy === "instance title") return { ...acc, [t]: sortResultsByTitle(dataWithAsset, langPreset) }
         else if(sortBy.startsWith("year of")) return { ...acc, [t]: sortResultsByYear(dataWithAsset) }
      }
      else if(e === "aux") {                  
         store.dispatch(dataActions.gotAssocResources(keyword,{ data: result[e] } ) )
      }
      else if(e === "facets") {
         let cat = "http://purl.bdrc.io/resource/O9TAXTBRC201605"
         let root = result[e].topics[cat]
         let tree = [ { "@id": cat, taxHasSubClass: root.subclasses }, ...Object.keys(result[e].topics).reduce( (acc,k) =>  { 
            let elem = result[e].topics[k] 
            return ([ ...acc, { "@id":k, taxHasSubClass: elem.subclasses, "skos:prefLabel": elem["skos:prefLabel"], "tmp:count":elem["count"] } ])
         }, []) ]


         return { ...acc, ["tree"]: { "@graph" : tree  } }
      }
      else return acc
   }, {})

   return result
}


async function startSearch(keyword,language,datatype,sourcetype,dontGetDT) {

   console.log("sSsearch",keyword,language,datatype,sourcetype);

   // why is this action dispatched twice ???
   store.dispatch(uiActions.loading(keyword, true));
   if(!datatype || datatype.indexOf("Any") !== -1) {
      store.dispatch(dataActions.getDatatypes());
   }
   try {
      let result ;

      if(!sourcetype)
      result = await api.getStartResults(keyword,language,datatype);
      else
      result = await api.getAssocResults(keyword,sourcetype);

      // adapt to new new JSON format
      if(result) {
         console.log("res",result)
         if(result && (datatype && datatype.indexOf("Any") === -1) ) 
            result = rewriteAuxMain(result,keyword,datatype)
         else 
            result = Object.keys(result).reduce((acc,e)=>({ ...acc, [e.replace(/^.*[/](Etext)?([^/]+)$/,"$2s").toLowerCase()] : result[e] }),{})
      }
         
      let rootRes
      if(datatype) rootRes = store.getState().data.searches[keyword+"@"+language]
      if(rootRes) rootRes = rootRes.results.bindings  
      result = mergeSameAs(result,{},true,rootRes,true,!language?keyword:null)

      console.log("newRes1",result)


      if(result.metadata && result.metadata[bdo+"Etext"] == 0)
      {
         delete result.metadata[bdo+"Etext"]
         //console.log("deleted")
      }

      if(sourcetype == 'Role' && result.data)
      {
         result["people"] = { ...result.data }
         delete result.data ;
      }

      let metadata = result.metadata;
      //console.log("meta",metadata)

      /*
      if(datatype && datatype.indexOf("Any") === -1) {
      result = { [datatype[0].toLowerCase()+"s"] : result.data }
   }
   */


   if(sourcetype)
   {
      let metaSav = result.metadata
      metadata = {}
      let data = {}
      for(let k of Object.keys(result)) {
         let t = k.replace(/^associated|s$/g,"").toLowerCase().replace(/people/,"person")
         if(t != "metadata" && t != "tree"  && Object.keys(result[k]).length > 0) {
            data = { ...data, [t+"s"]:result[k] }
            metadata = { ...metadata, [t]:Object.keys(result[k]).length }
         }
      }

      console.log("data",data,result)

      let metaD = {}
      data = getData(data,metadata,metaD);
      store.dispatch(dataActions.foundResults(keyword, language, data, datatype));
      store.dispatch(dataActions.foundDatatypes(keyword,language,{ metadata:metaD, hash:true}));

      let newMeta = {}

      addMeta(keyword,language,data,"Person");
      addMeta(keyword,language,data,"Work",result.tree);
      addMeta(keyword,language,data,"Lineage");
      addMeta(keyword,language,data,"Place");

      console.log("sourcetype",data)

      /*
      if(metaSav) {
      if(metaSav.total) delete metaSav.total

      if(metaSav["http://purl.bdrc.io/resource/GenderMale"] || metaSav["http://purl.bdrc.io/resource/GenderFemale"]) {
      store.dispatch(dataActions.foundResults(keyword, language, data, ["Person"]));
      store.dispatch(dataActions.foundFacetInfo(keyword,language,datatype,{"gender":metaSav }))
   }
   else if(metaSav["license"]) {
   store.dispatch(dataActions.foundResults(keyword, language, data, ["Work"]));
   store.dispatch(dataActions.foundFacetInfo(keyword,language,datatype,metaSav))
}
}
*/
}
else {

   let data = getData(result);

   console.log("kz1",JSON.stringify(Object.keys(data.results.bindings)))

   store.dispatch(dataActions.foundResults(keyword, language, data, datatype));

   if(!datatype || datatype.indexOf("Any") !== -1) {
      store.dispatch(dataActions.foundDatatypes(keyword,language,{ metadata:metadata, hash:true}));
   }
   else {

      if(datatype.indexOf("Person") !== -1) {

         addMeta(keyword,language,data,"Person",null,false);
         //store.dispatch(dataActions.foundFacetInfo(keyword,language,datatype,{"gender":metadata }))
         //store.dispatch(dataActions.foundDatatypes(keyword,language,{ metadata:{ [bdo+"Person"]:data.numResults } } ));
      }
      else if(datatype.indexOf("Work") !== -1 || datatype.indexOf("Etext") !== -1) {

         metadata = { ...metadata, tree:result.tree}

         let dt = "Etext" ;
         if(datatype.indexOf("Work") !== -1 ) { dt="Work" ; addMeta(keyword,language,data,"Work",result.tree,false); }
         else store.dispatch(dataActions.foundFacetInfo(keyword,language,datatype,metadata))

         //store.dispatch(dataActions.foundDatatypes(keyword,language,{ metadata:{ [bdo+dt]:data.numResults } } ));
      }

      
      if(!dontGetDT && !store.getState().data.searches[keyword+"@"+language]){

         /* // deprecated
         store.dispatch(dataActions.getDatatypes(keyword,language));

         result = await api.getStartResults(keyword,language);
         result = Object.keys(result).reduce((acc,e)=>({ ...acc, [e.replace(/^.*[/](Etext)?([^/]+)$/,"$2s").toLowerCase()] : result[e] }),{})
         
         let withSameAs = {}
         result = mergeSameAs(result,withSameAs)

         let keys = Object.keys(withSameAs)

         console.log("newRes2",result,data,keys)

         if(keys.length) {
            data.results.bindings = mergeSameAs(data.results.bindings,withSameAs,false)
            store.dispatch(dataActions.foundResults(keyword, language, data, datatype));
         }

         if(result.metadata && result.metadata[bdo+"Etext"] == 0)
         delete result.metadata[bdo+"Etext"]

         metadata = result.metadata;
         data = getData(result);
         */
         //console.log("kz2",JSON.stringify(Object.keys(data.results.bindings)))

         metadata = await api.getDatatypesOnly(keyword, language);

         store.dispatch(dataActions.foundResults(keyword, language, { results: { bindings: { } } } ) ) //data));
         store.dispatch(dataActions.foundDatatypes(keyword,language,{ metadata, hash:true}));
      }
   }
}

store.dispatch(uiActions.loading(keyword, false));

// store.dispatch(dataActions.foundDatatypes(keyword, JSON.parse(result.metadata).results));
//store.dispatch(dataActions.foundResults(keyword, language,result));
//yield put(uiActions.showResults(keyword, language));

} catch(e) {

   console.error("startSearch failed",e);

   store.dispatch(dataActions.searchFailed(keyword, e.message));
   store.dispatch(uiActions.loading(keyword, false));
}
}


async function updateSortBy(i,t)
{   

   let state = store.getState()
   
   let data ;
   if(state.data.searches[t] && state.data.searches[t][state.data.keyword+"@"+state.data.language]) data = state.data.searches[t][state.data.keyword+"@"+state.data.language]
   else if(state.data.searches[state.data.keyword+"@"+state.data.language]) data = state.data.searches[state.data.keyword+"@"+state.data.language]

   console.log("uSb",i,t,state.data.searches[t],state,data,state.ui.sortBy)

   if(!data) return

   // TODO clean a bit 
   if(i === "popularity") data.results.bindings[t.toLowerCase()+"s"] = sortResultsByPopularity(data.results.bindings[t.toLowerCase()+"s"]) 
   else if(i === "closest matches") data.results.bindings[t.toLowerCase()+"s"] = sortResultsByRelevance(data.results.bindings[t.toLowerCase()+"s"]) 
   else if(i.startsWith("year of")) data.results.bindings[t.toLowerCase()+"s"] = sortResultsByYear(data.results.bindings[t.toLowerCase()+"s"]) 
   else if(i === "work title" || i === "instance title") { 
      let langPreset = state.ui.langPreset
      data.results.bindings[t.toLowerCase()+"s"] = sortResultsByTitle(data.results.bindings[t.toLowerCase()+"s"], langPreset)
   }
   data.time = Date.now()

   store.dispatch(dataActions.foundResults(state.data.keyword,state.data.language, data, t))     
}

export function* watchUpdateSortBy() {

   yield takeLatest(
      uiActions.TYPES.updateSortBy,
      (action) => updateSortBy(action.payload, action.meta)
   );
}


async function getInstances(uri,init=false)
{

   store.dispatch(uiActions.loading(uri, true));
   let state = store.getState()

   let keyword = store.getState().data.keyword
   
   let results = await api.getInstances(uri);

   let data = getData(results), dataSav = data
   data = data.results.bindings

   let fullU = fullUri(uri)

   let assoR 
   if(data.main) assoR = Object.keys(data.main).reduce( (acc,k) => ([...acc, { type:tmp+"hasInstance",value:k }]),[])

   console.log("gI",keyword,uri,init,data)


   if(init || keyword === uri+"@") {
      
      let numResults = Object.keys(results.main)
      if(numResults.length) numResults = numResults.length

      let sortBy = state.ui.sortBy
      if(!sortBy) sortBy = "year of publication" 

      console.log("sortBy?2",sortBy,state.ui.sortBy)

      results = rewriteAuxMain(results,uri,["Work"],sortBy)

      let metadata = addMeta(uri,"",{results:{bindings:results} }, "Work", null, false, false )
       
      store.dispatch(dataActions.foundResults(uri,"", { metadata, numResults, isInstance:true, results:{bindings:results}},["Work"]))
      
      store.dispatch(dataActions.foundResults(uri,"", { isInstance:true, results: { bindings: { } } } ) ) //data));

   }
   else { 

      let langPreset = state.ui.langPreset

      let sortBy = "year of publication" 

      console.log("sortBy?1",sortBy)

      results = rewriteAuxMain(results,keyword,["Work"],sortBy)

      store.dispatch(dataActions.gotInstances(uri,results.works)) //sortResultsByTitle(results.main, langPreset)))

   }
   //store.dispatch(dataActions.gotInstances(uri,data))

   store.dispatch(uiActions.loading(uri, false));
}

export function* watchGetInstances() {

   yield takeLatest(
      dataActions.TYPES.getInstances,
      (action) => getInstances(action.payload,action.meta)
   );
}


async function searchKeyword(keyword,language,datatype) {

   console.log("searchK",keyword,language,datatype);

   // why is this action dispatched twice ???
   store.dispatch(uiActions.loading(keyword, true));
   try {
      let result ;

      if(!datatype || datatype.indexOf("Any") !== -1)
      result = await api.getResults(keyword,language);
      else
      result = await api.getResultsOneDatatype(datatype,keyword,language);

      store.dispatch(uiActions.loading(keyword, false));
      store.dispatch(dataActions.foundResults(keyword, language,result));
      //yield put(uiActions.showResults(keyword, language));

   } catch(e) {
      store.dispatch(dataActions.searchFailed(keyword, e.message));
      store.dispatch(uiActions.loading(keyword, false));
   }
}


async function getOneDatatype(datatype,keyword,language:string) {

   console.log("searchK1DT",datatype,keyword,language);

   store.dispatch(uiActions.loading(keyword, true));
   try {
      const result = await api.getResultsOneDatatype(datatype,keyword,language);

      store.dispatch(uiActions.loading(keyword, false));
      store.dispatch(dataActions.foundResults(keyword, language, result));

   } catch(e) {
      store.dispatch(dataActions.searchFailed(keyword, e.message));
      store.dispatch(uiActions.loading(keyword, false));
   }
}

async function getOneFacet(keyword,language:string,facet:{[string]:string}) {

   console.log("searchK1F",keyword,language,facet);

   store.dispatch(uiActions.loading(keyword, true));
   try {
      const result = await api.getResultsOneFacet(keyword,language,facet);

      store.dispatch(uiActions.loading(keyword, false));
      store.dispatch(dataActions.foundResults(keyword, language, result));

   } catch(e) {
      store.dispatch(dataActions.searchFailed(keyword, e.message));
      store.dispatch(uiActions.loading(keyword, false));
   }
}

async function getResource(iri:string) {
   try {
      let res = await api.loadResource(iri) //.replace(/bdr:/,""));

      store.dispatch(dataActions.gotResource(iri, res));
   }
   catch(e) {
      console.error("ERRROR with resource "+iri,e)
      store.dispatch(dataActions.noResource(iri,e));
   }

}

async function getFacetInfo(keyword,language:string,property:string) {

   console.log("searchFacet",keyword,language,property);

   try {
      const result = await api.getResultsSimpleFacet(keyword,language,property);

      //console.log("back from call",property,result);

      store.dispatch(dataActions.foundFacetInfo(keyword, language, property, result));

   } catch(e) {
      store.dispatch(dataActions.searchFailed(keyword, e.message));
   }

}

export function* watchSearchingKeyword() {

   yield takeLatest(
      dataActions.TYPES.searchingKeyword,
      (action) => searchKeyword(action.payload.keyword,action.payload.language,action.payload.datatype)
   );
}

export function* watchStartSearch() {

   yield takeLatest(
      dataActions.TYPES.startSearch,
      (action) => startSearch(action.payload.keyword,action.payload.language,action.payload.datatype,action.payload.sourcetype,action.payload.dontGetDT)
   );
}

/*
export function* watchGetDatatypes() {

   yield takeLatest(
      dataActions.TYPES.getDatatypes,
      (action) => getDatatypes(action.payload.keyword,action.payload.language)
   );
}
*/

export function* watchGetManifest() {

   yield takeLatest(
      dataActions.TYPES.getManifest,
      (action) => getManifest(action.payload,action.meta)
   );
}

export function* watchGetImageVolumeManifest() {

   yield takeLatest(
      dataActions.TYPES.getImageVolumeManifest,
      (action) => getImageVolumeManifest(action.payload,action.meta)
   );
}

export function* watchRequestPdf() {

   yield takeLatest(
      dataActions.TYPES.requestPdf,
      (action) => requestPdf(action.payload,action.meta)
   );
}

export function* watchCreatePdf() {

   yield takeLatest(
      dataActions.TYPES.createPdf,
      (action) => createPdf(action.payload,action.meta)
   );
}

export function* watchGetResource() {

   yield takeLatest(
      dataActions.TYPES.getResource,
      (action) => getResource(action.payload)
   );
}

export function* watchGetChunks() {

   yield takeLatest(
      dataActions.TYPES.getChunks,
      (action) => getChunks(action.payload,action.meta)
   );
}

export function* watchGetPages() {

   yield takeLatest(
      dataActions.TYPES.getPages,
      (action) => getPages(action.payload,action.meta)
   );
}

export function* watchGetOneDatatype() {

   yield takeLatest(
      dataActions.TYPES.getOneDatatype,
      (action) => getOneDatatype(action.payload.datatype,action.payload.keyword,action.payload.language)
   );
}

export function* watchGetOneFacet() {

   yield takeLatest(
      dataActions.TYPES.getOneFacet,
      (action) => getOneFacet(action.payload.keyword,action.payload.language,action.payload.facet)
   );
}

export function* watchGetFacetInfo() {

   yield takeLatest(
      dataActions.TYPES.getFacetInfo,
      (action) => getFacetInfo(action.payload.keyword,action.payload.language,action.payload.property)
   );
}

export function* watchGetAnnotations() {

   yield takeLatest(
      dataActions.TYPES.getAnnotations,
      (action) => getAnnotations(action.payload)
   );
}

/** Root **/

export default function* rootSaga() {
   yield all([
      watchInitiateApp(),
      watchGetUser(),
      watchGetResetLink(),
      watchUpdateSortBy(),
      watchGetInstances(),
      //watchChoosingHost(),
      //watchGetDatatypes(),
      watchGetChunks(),
      watchGetPages(),
      watchGetFacetInfo(),
      watchGetOneDatatype(),
      watchGetOneFacet(),
      watchGetManifest(),
      watchGetImageVolumeManifest(),
      watchGetAnnotations(),
      watchRequestPdf(),
      watchCreatePdf(),
      watchGetResource(),
      watchSearchingKeyword(),
      watchStartSearch()
   ])
}
