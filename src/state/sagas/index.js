
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
import history from '../../history.js'

import logdown from 'logdown'

//import { setHandleMissingTranslation } from 'react-i18nify';
//import { I18n } from 'react-redux-i18n';
import { i18nextChangeLanguage } from 'i18next-redux-saga';

// to enable tests
const api = new bdrcApi({...process.env.NODE_ENV === 'test' ? {server:"http://localhost:5555/test"}:{}});

// for full debug, type this in the console:
// window.localStorage.debug = 'gen'

const loggergen = new logdown('gen', { markdown: false });

const adm  = "http://purl.bdrc.io/ontology/admin/" ;
const bda  = "http://purl.bdrc.io/admindata/"
const bdo  = "http://purl.bdrc.io/ontology/core/";
const bdr  = "http://purl.bdrc.io/resource/";
const owl   = "http://www.w3.org/2002/07/owl#" ;
const rdf   = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const rdfs  = "http://www.w3.org/2000/01/rdf-schema#"; 
const skos = "http://www.w3.org/2004/02/skos/core#";
const tmp = "http://purl.bdrc.io/ontology/tmp/" ;
const _tmp = tmp ;

let IIIFurl = "//iiif.bdrc.io" ;

const handleAuthentication = (nextState, replace) => {
   if (/access_token|id_token|error/.test(nextState.location.hash)) {
      auth.handleAuthentication();
   }
}

let sameAsR = {}

async function initiateApp(params,iri,myprops,route) {
   try {
      loggergen.log("params=",params)
      loggergen.log("iri=",iri)
      let state = store.getState()

      //      loggergen.log("youpla?",prefix)

      if(!state.data.config)
      {
         const config = await api.loadConfig();

         if(config.auth) auth.setConfig(config.auth,config.iiif,api)

         //I18n.setHandleMissingTranslation((key, replacements) => key);

         if(myprops) {
            if(config.auth) handleAuthentication(myprops);
         }
         store.dispatch(dataActions.loadedConfig(config));
         
         loggergen.log("config?",config,params)
         
         // DONE UI language
         let locale = "en", val
         if(config && config.chineseMirror) locale = "zh"

         // 1-url param
         if(params && params.uilang && ['bo','en','zh'].includes(params.uilang)) locale = params.uilang
         // 2-saved preference
         else if(val = localStorage.getItem('uilang')) locale = val
         // 3-browser default
         else if(['bo','en','zh'].includes(val = window.navigator.language.slice(0, 2))) locale = val
         // 4-config file
         else locale = config.language.data.index

         // TODO fix html lang tag (always "en" before switching language)

         // set i18n locale
         store.dispatch(i18nextChangeLanguage(locale));
         
         // set data language preferences
         // 1-saved preference
         if((val = localStorage.getItem('langpreset')) && config.language.data.presets[val]) store.dispatch(uiActions.langPreset(config.language.data.presets[val], val))
         // 2- locale
         else if(config.language.data.presets[locale]) store.dispatch(uiActions.langPreset(config.language.data.presets[locale], locale))
         else store.dispatch(uiActions.langPreset(["bo-x-ewts,sa-x-iast"]))

         //loggergen.log("preset",config.language.data.presets[config.language.data.index])
         //store.dispatch(dataActions.choosingHost(config.ldspdi.endpoints[config.ldspdi.index]));


      }

      if(route === "static") return ;

   /*
      if(!state.data.ontology)
      {
         const onto = await api.loadOntology();
         store.dispatch(dataActions.loadedOntology(onto));
         // loggergen.log("params",params)
      }
   */
      if(!state.data.dictionary)
      {
         const dico = await api.loadDictionary()
         store.dispatch(dataActions.loadedDictionary(dico));         
         
      }

      // [TODO] load only missing info when needed (see click on "got to annotation" for WCBC2237)
      if(iri) // || (params && params.r)) // && (!state.data.resources || !state.data.resources[iri]))
      {
         let res,Etext ;
         if(!iri) iri = params.r

         Etext = iri.match(/^([^:]+:)?UT/)

         try {

            // TODO do not load resource again

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

            loggergen.log("adminRes",adminRes,res)
         }
         catch(e) {
            console.error("no admin data for "+iri,e)
         }
         */


         if(!Etext)
         {
            let {assocRes, _res } = extractAssoRes(iri,res) //= await api.loadAssocResources(iri)
            store.dispatch(dataActions.gotResource(iri,_res))
            store.dispatch(dataActions.gotAssocResources(iri,{ data: assocRes }))
            sameAsR[iri] = true ;

            /* //deprecated
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
            */


            // TODO enable annotations

            //store.dispatch(dataActions.getAnnotations(iri))

         }
         else {
            /*
            let res0 = { [ bdr+iri] : {...res["@graph"].reduce(
            (acc,e) => {
            let obj = {}, q
            loggergen.log("e",e)
            Object.keys(e).map(k => {
            if(!k.match(/[:@]/)) q = bdr+k
            else q = k
            loggergen.log("k",k,q,e[k],e[k].length)
            if(!e[k].length && e[k]["@id"]) obj[q] = { value:e[k]["@id"].replace(/bdr:/,bdr), type:"uri"}
            else if(!e[k].length || Array.isArray(e[k]) || !e[k].match(/^bdr:[A-Z][A-Z0-9_]+$/)) obj[q] = e[k]
            else obj[q] = { value:e[k].replace(/bdr:/,bdr), type:"uri"}
         })
         return ({...acc,...obj})
      },{}) } }
      delete res0[bdr+iri]["@id"]
      let lab = res0[bdr+iri][bdr+"eTextTitle"]
      if(!lab["@value"]) lab = { "@value":lab, "@language":""}
      loggergen.log("lab",lab)
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

      //loggergen.log("gotAR",JSON.stringify(assoRes,null,3));

      store.dispatch(dataActions.gotAssocResources(iri,assoRes));

      res = { [bdrIRI] : Object.keys(res).reduce((acc,e) => {

         //if(Object.keys(res[e]).indexOf(skos+"prefLabel") === -1)
         return ({...acc, ...Object.keys(res[e]).filter(k => k !== bdo+"itemHasVolume").reduce(
            (acc,f) => ({...acc,[f]:res[e][f]}),
            {}) })
            //else
            //   return acc
            /*Object.keys(res[bdr+iri][e]).reduce((ac,f) => {
            loggergen.log("e,ac,f",e,ac,f)
            return ( { ...ac, ...res[bdr+iri][e][f] })
         },{})})*/
      },{}) }



      if(res[bdrIRI]) {
         
         let next = 0
         if(params.startChar) next = Number(params.startChar)

         if(params.keyword) {
            let key = params.keyword.split("@"), lang
            if(key.length > 1) {
               lang = key[1]
               key = key[0]
               store.dispatch(uiActions.gotHighlight(iri,key,lang));
            }
         }

         if(!res[bdrIRI][bdo+"eTextHasPage"]) store.dispatch(dataActions.getChunks(iri,next));
         else {
            res[bdrIRI][bdo+"eTextHasPage"] = []
            store.dispatch(dataActions.getPages(iri,next)); 
         }

      }         
   
      store.dispatch(dataActions.gotResource(iri,res));

   }

   //let t = getEntiType(iri)
   //if(t && ["Person","Place","Topic"].indexOf(t) !== -1) {
   //   store.dispatch(dataActions.startSearch("bdr:"+iri,"",["Any"],t)); //,params.t.split(",")));
   //}
}


if(params && params.osearch) {
   let p = params.osearch.split("@")
   let r = iri
   if(params.root) r = params.root

   // TODO add search in part of outline
   //if(params.part) r = params.part
   
   store.dispatch(dataActions.outlineSearch(r,p[0],p[1]))
}


if(params && params.t /*&& !params.i */) {
   store.dispatch(uiActions.updateSortBy(params.s?params.s.toLowerCase():(params.i?"year of publication reverse":(params.t==="Etext"?"closest matches":(params.t==="Scan"?(route ==="latest"?"release date":"popularity"):"popularity"))),params.t))
}

if(params && params.i) {
   let t = getEntiType(params.i)

   if(["Work"].indexOf(t) !== -1
   && (!state.data.searches || !state.data.searches[params.r+"@"]))
   {
      store.dispatch(dataActions.getInstances(params.i,true));
   }
}
else if(params && params.p) {

   store.dispatch(dataActions.ontoSearch(params.p));
}
else if(params && params.q) {

   if(!params.lg) params.lg = "bo-x-ewts"
   
   loggergen.log("state q",state.data,params,iri)

   let dontGetDT = false
   let pt = params.t
   if(pt && !pt.match(/,/) && ["Place", "Person","Work","Etext", "Topic","Role","Corporation","Lineage","Instance","Product", "Scan"].indexOf(pt) !== -1)  {

      let inEtext
      if(params.r && pt === "Etext") inEtext = params.r

      if(!state.data.searches || !state.data.searches[pt] || !state.data.searches[pt][params.q+"@"+params.lg] || state.data.searches[pt][params.q+"@"+params.lg].inEtext !== inEtext) {
         store.dispatch(dataActions.startSearch(params.q,params.lg,[pt],null,dontGetDT,inEtext)); 
         dontGetDT = true
      }
      else {

         // TODO check if popularity is available if already searched terms

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
else if(params && params.r) {
   let t = getEntiType(params.r)
   if(["Instance", "Images", "Volume", "Scan"].includes(t) || ["bdo:SerialWork"].includes(params.r) ) t = "Work"

   loggergen.log("state r",t,state.data.searches,params,iri)

   let s = ["Any"]
   if(params.t && params.t != "Any") { s = [ params.t ] }
   
   if(t && ["Person","Place","Topic","Work","Role","Corporation","Lineage","Etext","Product", "Scan"].indexOf(t) !== -1
   && (!state.data.searches[params.t] || !state.data.searches[params.t][params.r+"@"]))
   {
      store.dispatch(dataActions.startSearch(params.r,"",s,t)); //,params.t.split(",")));
   }
   else {
      store.dispatch(uiActions.loading(params.r, false));
      if(state.data.searches[params.t] && state.data.searches[params.t][params.r+"@"] && state.data.searches[params.t][params.r+"@"].metadata) {
         store.dispatch(dataActions.foundResults(params.r,"", state.data.searches[params.t][params.r+"@"], params.t));
         store.dispatch(dataActions.foundFacetInfo(params.r,"", [params.t],state.data.searches[params.t][params.r+"@"].metadata ));
      }
   }
}
else if(params && params.date && params.t) {

   store.dispatch(dataActions.getResultsByDate(params.date, params.t));

}
else if(params && params.id && params.t) {

   store.dispatch(dataActions.getResultsById(params.id, params.t));

}
else if(route === "latest") {
   let sortBy = "release date"
   if(params && params.s) sortBy = params.s
   store.dispatch(uiActions.updateSortBy(sortBy,"Scan"))
   store.dispatch(dataActions.getLatestSyncsAsResults());
}
else if(!iri) {

   let state = store.getState()
   
   if(!state.data.latestSyncs) {
      store.dispatch(dataActions.getLatestSyncs())
   }

   if(state.data.keyword) {
      store.dispatch(dataActions.resetSearch())
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
      (action) => initiateApp(action.payload,action.meta.iri,action.meta.auth,action.meta.route)
   );
}


function extractAssoRes(iri,res) {

   let longIri = fullUri(iri);

   let assocRes = {}, _res = {}
   let allowK = [ skos+"prefLabel", skos+"altLabel", tmp+"withSameAs", bdo+"inRootInstance", bdo+"language", adm+"canonicalHtml", bdo+"partIndex", bdo+"volumeNumber", tmp+"thumbnailIIIFService", bdo+"instanceHasReproduction",
                  tmp+"nbTranslations", tmp+"provider", rdfs+"comment", rdf+"type" ]
   let allowR = [ skos+"prefLabel", bdo+"partIndex", bdo+"volumeNumber",  tmp+"thumbnailIIIFService" ]

   for(let k of Object.keys(res)) {                  
      _res[k] = { ...res[k], ..._res[k] }
      if(_res[k][bdo+"instanceEvent"]) {
         _res[k][bdo+"instanceEvent"] = _res[k][bdo+"instanceEvent"].reduce( (acc,e) => { 
            if(res[e.value] && res[e.value][bdo+"eventWho"]) {
               return ([...acc,...res[e.value][bdo+"eventWho"].map(f => ({fromEvent:e.value,type:'uri',value:f.value}) ) ])
            }
            else return ([...acc, e])
         },[])
         /*
         _res[k][bdo+"instanceEvent"] = _res[k][bdo+"instanceEvent"].map(e => {
            if(res[e.value] && res[e.value][bdo+"eventWho"]) {
               if(!_res[e.value]) _res[e.value] = {}
               _res[e.value][bdo+"eventWho"] = res[e.value][bdo+"eventWho"].map(f => ({...f,type:"literal"}))
            }
            loggergen.log("preformat",e,JSON.stringify(_res[e.value],null,3))
         })
         */
         loggergen.log("preformat",_res[k][bdo+"instanceEvent"])
      }
      if(k !== longIri) {
         let resK = Object.keys(res[k])
         if(allowR.filter(e => resK.includes(e)).length) assocRes[k] = Object.keys(res[k]).reduce( (acc,f) => ([ ...acc, ...res[k][f].map(e => ({...e,type:f}))]), [])
         if(!resK.filter(k => !allowK.includes(k)).length) delete _res[k]
         if(res[k][tmp+"withSameAs"]) { 
            if(!_res[k]) _res[k] = {}
            _res[k][tmp+"withSameAs"] = [ ...res[k][tmp+"withSameAs"] ] 
         }
      }
   }

   return { assocRes, _res} ;
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

         //loggergen.log("acc",k,val)

         let toJson = (o) => {

            //loggergen.log("o",o)

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
      loggergen.log("user",id,profile,user)
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


async function getContext(iri,start,end,nb:integer = 1000) {   

   let {sav, data} = await getChunks(iri, start - nb, end - start + nb * 2, true)

   let inInst  = sav.filter(e => e["tmp:inInstance"])
                    .map(e => Array.isArray(e["tmp:inInstance"]) ? e["tmp:inInstance"] : [ e["tmp:inInstance"]  ])
                    .reduce( (acc,e) => ([ ...acc, ...(Array.isArray(e)?e:[e]) ]),[]) 
   let inInstP = sav.filter(e => e["tmp:inInstancePart"])
                    .map(e => Array.isArray(e["tmp:inInstancePart"]) ? e["tmp:inInstancePart"] : [ e["tmp:inInstancePart"] ])
                    .reduce( (acc,e) => ([ ...acc, ...(Array.isArray(e)?e:[e]) ]),[]) 
   let dict = sav.filter(e => e["skos:prefLabel"]).reduce( (acc,e) => (
      {...acc,[fullUri(e["@id"])]: [ ...(Array.isArray(e["skos:prefLabel"])?e["skos:prefLabel"]:[e["skos:prefLabel"]]).map(p => ({value:p["@value"],"xml:lang":p["@language"],type:skos+"prefLabel"} )) ] }  
   ),{})

   let state = store.getState()

   store.dispatch(dataActions.gotAssocResources(state.data.keyword, { data: dict }))


   let results, t = "Etext", uri = fullUri(iri), chunk
   if(state.data.searches[t] && state.data.searches[t][state.data.keyword+"@"+state.data.language]) results = state.data.searches[t][state.data.keyword+"@"+state.data.language]
   if(results && results.results && results.results.bindings && results.results.bindings['etexts'] && results.results.bindings['etexts'][uri]) { 
      
      results.results.bindings['etexts'][uri] = results.results.bindings['etexts'][uri].concat(inInst.filter(e => results.results.bindings['etexts'][uri].filter(f => f.type === tmp+"inInstance" && f.value === fullUri(e["@id"])).length === 0).map(e => ({value:fullUri(e["@id"]),type:tmp+"inInstance"})))      

      chunk = results.results.bindings['etexts'][uri].filter(e => e.startChar == start && e.endChar == end)
      if(chunk.length) chunk[0].inPart = inInstP.map(e => fullUri(e["@id"]))

   }

   //loggergen.log("ctx",chunk,results.results.bindings['etexts'][uri],results,inInst,inInstP,data)
   
   store.dispatch(dataActions.foundResults(state.data.keyword, state.data.language, results,["Etext"]))
   store.dispatch(dataActions.gotContext(state.data.keyword+"@"+state.data.language,iri,start,end,data))
   store.dispatch(uiActions.loading(null, false));

}

export function* watchGetContext() {

   yield takeLatest(
      dataActions.TYPES.getContext,
      (action) => { 
         store.dispatch(uiActions.loading(null, true));
         getContext(action.payload,action.meta.start,action.meta.end)
      }
   );
}



async function getChunks(iri,next,nb = 10000,useContext = false) {

   let hilight //= { value:meta.key, lang:meta.lang }
   let state = store.getState()
   if(state.ui.highlight && state.ui.highlight.uri === iri) {
      hilight = { value:state.ui.highlight.key, lang:state.ui.highlight.lang }
   }
   else if(useContext && state.data.language) {
      hilight = { value:state.data.keyword.replace(/\"/g,""), lang:state.data.language }
   }

   try {     

      let data = await api.loadEtextChunks(iri,next,nb,useContext);

      let sav = data["@graph"]

      data = _.sortBy(data["@graph"],'sliceStartChar')
      .filter(e => e.chunkContents)
      .map(e => { 
         let cval = e.chunkContents["@value"]
         let clang = e.chunkContents["@language"]

         //loggergen.log("hi?",cval,clang,hilight,e)

         if(hilight && hilight.lang !== clang) { 
            let langs = extendedPresets([clang])
            hilight = sortLangScriptLabels([hilight],langs.flat,langs.translit)
            if(hilight && hilight[0]) hilight = hilight[0]
         }

         if(hilight && hilight.lang === clang && cval) cval = cval.replace(new RegExp("("+hilight.value+")","g"),"↦$1↤")

         return ({ value:cval, lang:clang, start:e.sliceStartChar, end:e.sliceEndChar}) 
      }); //+ " ("+e.seqNum+")" }))

      //loggergen.log("dataC",iri,next,data)

      if(!useContext) store.dispatch(dataActions.gotNextChunks(iri,data,next < 0))
      else { 
         return {sav, data}
      }
      
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

      let hilight //= { value:meta.key, lang:meta.lang }
      let state = store.getState()
      if(state.ui.highlight && state.ui.highlight.uri === iri) {
         hilight = { value:state.ui.highlight.key, lang:state.ui.highlight.lang }
      }


      data = await api.loadEtextChunks(iri,next);
      chunk = _.sortBy(data["@graph"].filter(e => e.chunkContents),'sliceStartChar')                  
      pages = _.sortBy(data["@graph"].filter(e => e.type && e.type === "EtextPage"),'sliceStartChar')

      let lang = chunk[0].chunkContents["@language"]

      //let start = chunk[0].sliceStartChar
      //chunk = chunk.map(e => e.chunkContents["@value"]).join() //.replace(/..$/,"--")).join()      
      //loggergen.log("chunk@"+start,chunk)


      loggergen.log("pages",pages)

      data = pages.map(e => {

         let cval
         let clang 
         
         let value = chunk.reduce( (acc,c) => { 
            
            if(!cval && c.chunkContents["@value"]) cval = c.chunkContents["@value"]
            if(!clang && c.chunkContents["@language"]) clang = c.chunkContents["@language"]
         
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

         },"").replace(/[\n\r]+/,"\n").replace(/(^\n)|(\n$)/,"")

         if(hilight && hilight.lang !== clang) { 
            let langs = extendedPresets([clang])
            hilight = sortLangScriptLabels([hilight],langs.flat,langs.translit)
            if(hilight && hilight[0]) hilight = hilight[0]
         }
         
         if(hilight && hilight.lang === clang && value) value = value.replace(new RegExp("("+hilight.value+")","g"),"↦$1↤")

         //loggergen.log("page?",e,e.sliceStartChar,e.sliceEndChar,start)
         if(e.sliceEndChar <= chunk[chunk.length - 1].sliceEndChar) 
            return {
               //value:(chunk.substring(e.sliceStartChar - start,e.sliceEndChar - start - 1)).replace(/[\n\r]+/,"\n").replace(/(^\n)|(\n$)/,""),
               value,
               language:lang,
               seq:e.seqNum,
               start:e.sliceStartChar,
               end:e.sliceEndChar        
            }
         
      }).filter(e => e); //+ " ("+e.seqNum+")" }))

      loggergen.log("dataP",iri,next,data)

      store.dispatch(dataActions.gotNextPages(iri,data,next < 0))
   }
   catch(e){
      console.error("ERRROR with pages",iri,next,e)
   }

}


async function createPdf(url,iri) {
   try
   {

      let nUrl = url.replace(/(pdf|zip)/,iri.file)
      loggergen.log("creaP",url,nUrl,iri,iri.file)
      url = nUrl

      let config = store.getState()
      if(config) config = config.data
      if(config) config = config.config
      if(config) config = config.iiif
      if(config) IIIFurl = config.endpoints[config.index]
      loggergen.log("IIIFu",IIIFurl,config)
      let pdfCheck = setInterval(async () => {

         let links = iri.links
         if(!links) {
            let data = JSON.parse(await api.getURLContents((url.startsWith("/")?IIIFurl:"")+url,false,"application/json"))
            loggergen.log("pdf:",data)
            links = data.link
         }
         if(links && !links.match(/^(https?:)?\/\//)) links = IIIFurl+links

         loggergen.log("links:",links)
         if(links) {
            clearInterval(pdfCheck)
            store.dispatch(dataActions.pdfReady(links,{url,iri:iri.iri}))
         } else {

         }

      }, 3000);



      //window.open(IIIFurl+data.links,"pdf");

      //let fic = await api.getURLContents("//iiif.bdrc.io"+data.links);
      //loggergen.log("pdf here")
      //fileDownload("//iiif.bdrc.io"+data.links,"name.pdf") ;
      //download("//iiif.bdrc.io"+data.links);

   }
   catch(e){
      console.error("ERRROR with pdf",e)

      //store.dispatch(dataActions.manifestError(url,e,iri))
   }
}

async function requestPdf(url,iri) {
   try {

      loggergen.log("reqP",url,iri)


      let data = JSON.parse(await api.getURLContents(url,false,"application/json"))

      loggergen.log("pdf",url,iri,data) //,_data)

      /* // deprecated - better use original "monoVol" code

      if(data.links && typeof data.links === "string") { // download is ready
               
         let file = url.replace(/^.*?[/](zip|pdf)[/].*$/g,"$1")
         store.dispatch(dataActions.pdfVolumes(iri,[{iri,volume:0,link:url}]))
         setTimeout(() => store.dispatch(dataActions.createPdf(url.replace(/^(https?:)?[/]+[^/]+/,""),{iri,file,links:data.links})), 150)
      }
      else {
         */
         
         data = _.sortBy(Object.keys(data).map(e => ({...data[e],volume:Number(data[e].volume)+1,id:e})),["volume"])
         store.dispatch(dataActions.pdfVolumes(iri,data))

         /*
      }
         */





   }
   catch(e){
      console.error("ERRROR with pdf",e)

      //store.dispatch(dataActions.manifestError(url,e,iri))
   }
}
async function getAnnotations(iri) {
   try {
      loggergen.log("getA",iri)

      let listA = await api.loadAnnoList(iri)
      loggergen.log("listA",listA)

      for(let k of Object.keys(listA))
      {
         loggergen.log("k",k,listA[k])

         let collec = await api.getQueryResults(k, "", {searchType:"",L_NAME:""}, "GET","application/json"
         ,{"Prefer": "return=representation;include=\"http://www.w3.org/ns/oa#PreferContainedDescriptions\""})

         loggergen.log(collec);

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

      loggergen.log("getIVM",url,iri)

      let manif = await api.loadManifest(url);
      
      let config = store.getState().data.config, iiifpres = "//iiifpres.bdrc.io"
      if(config.iiifpres) iiifpres = config.iiifpres.endpoints[config.iiifpres.index]
      let imL = await JSON.parse(await api.getURLContents(iiifpres+"/il/v:"+url.replace(/^.*?(bdr:[^/]+).*?$/,"$1"), false));      
      //loggergen.log("getIML:",imL)

      store.dispatch(dataActions.gotImageVolumeManifest(manif,iri,imL))

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
   if (origurl.match(/(cudl[.]lib)|(lib[.]cam).*jp2/)) origurl += "/full/max/0/default.jpg"
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

      loggergen.log("getM",url,iri)

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
            if(!isSingle) collecManif = null  //manif.manifests[0]["@id"]

            // missing 1st volume (#370)
            try {
               manif = await api.loadManifest(manif.manifests[0]["@id"]);
            } catch(e) {
               // only volume in collection (#383)
               if(manif.manifests.length === 1) throw e 
            }
         }
         else throw new Error("collection without manifest list")
      }      

      if(manif && manif.sequences && manif.sequences[0] && manif.sequences[0].canvases) {
         if(manif.sequences[0].canvases[0] && manif.sequences[0].canvases[0].images[0] &&
            manif.sequences[0].canvases[0].images[0].resource["@id"])
         {
            let imageres = manif.sequences[0].canvases[0].images[0].resource
            
            //loggergen.log("image",imageres )

            let imageIndex = 0
            if (imageres && imageres["@id"] && imageres["@id"].match(/archivelab[.]org.*rashodgson13[$]0[/]full/)) {
               imageIndex = 1
               imageres = manif.sequences[0].canvases[imageIndex].images[0].resource
            }

            let canvasID = manif.sequences[0].canvases[imageIndex]["@id"]

            let image = getiiifthumbnailurl(imageres)

            let test = await api.getURLContents(image,null,null,null,true)
            
            //loggergen.log("img",test)
            
            //let imgData = btoa(String.fromCharCode(...new Uint8Array(test)));
            store.dispatch(dataActions.firstImage(image,iri,canvasID,collecManif,manifests,null,manif)) //,imgData))
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

   loggergen.log("kz",JSON.stringify(Object.keys(result)))

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

      //loggergen.log("data?W",data,metadata)
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
   //loggergen.log("pre",pre,data.etexts)
   */

     delete data.chunks
  }

   
   loggergen.log("data?W",data,metadata)


  //loggergen.log("resultR",result)
  //&& Object.values(result).map(o => o?Object.keys(o):null).filter(k => (""+k).match(new RegExp(bdr))).length == 0)))

  if(Object.keys(result).length == 0 || (Object.keys(result).length == 1 && result["metadata"] )) { numR = 0 }
  else
  {
     numR = Object.keys(result).reduce((acc,e) => {
        //loggergen.log("res",result[e])
        if(e !== "tree" && result[e]!=null) return ( acc + (e=="metadata"?0:Object.keys(result[e]).length))
        else return acc
     },0)

     //loggergen.log("numRa",numR,metadata)

     if(metadata)
     {
        let kZ = Object.keys(metadata)
        if(kZ.reduce((acc,k) => (acc || k.match(/^http:/) ),false))
        numR = kZ.reduce((acc,k) => ( acc+Number(metadata[k])),0)

        if(outMeta) Object.keys(data.metadata).map(k => outMeta[k] = data.metadata[k])  

        delete data.metadata
     }

     //loggergen.log("numRb",numR)
  }

  //loggergen.log("getData#result",result,numR)

  data = {  numResults:numR, results : { bindings: {...data } } }

  return data
}


function getStats(cat:string,data:{},tree:{})
{
   let stat={}
   let config = store.getState().data.config

   let keys = []
   if(config.facets[cat])
      keys = Object.keys(config.facets[cat])

   loggergen.log("stat/keys",keys,tree)
   
   if(auth && !auth.isAuthenticated()) {
      let hide = config["facets-hide-unlogged"][cat]
      loggergen.log("hide",hide)
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

      loggergen.log("parents",parents,treeParents)

      if(treeParents) tree["parents"] = treeParents
   }
   
   let unspecTag = "unspecified"

   for(let _p of Object.keys(data["results"]["bindings"][cat.toLowerCase()+"s"]))   
   {
      let p = data["results"]["bindings"][cat.toLowerCase()+"s"][_p]
      //loggergen.log("p",p);
      for(let f of keys)
      {
         
         //loggergen.log("f",f);
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

            //loggergen.log("f+1",f,tmp,pre)
         }
         else {
            if(!stat[f]) stat[f] = {}
            if(!stat[f][unspecTag]) stat[f][unspecTag] = { n:0, dict:{} }
            let pre = stat[f][unspecTag].n
            if(!pre) pre = 1
            else pre ++ ;
            stat[f][unspecTag].n = pre ;
            stat[f][unspecTag].dict[_p] = p
            //if(f==="tree") loggergen.log("unspec+1",_p,p,f,tmp,pre)
         }      
         
      }
   }
  
   //loggergen.log("f unspec",stat["tree"][unspecTag]); 

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
            if(f === "century") { 
               if(k !== "unspecified") n = k
               else n = -10000
            }
            if(!tmpStat[n]) tmpStat[n] = []
            tmpStat[n].push({...label[0], k })
         }
         let sortStat = []
         
         let kz = _.orderBy(Object.keys(tmpStat).map(n => ({n:Number(n)})), [ "n" ], [ "desc" ]).map(k => k.n)
         for(let n of kz) {
            sortStat = sortStat.concat(sortLangScriptLabels(tmpStat[n],langs.flat,langs.translit))
         }         

         //loggergen.log("tmpStat",tmpStat,sortStat)         
         
         stat[f] = sortStat.reduce( (acc,k) => ({...acc, [(f==="century"?(k.k!==-10000?" "+k.k:" unspecified"):k.k)]:stat[f][k.k]}),{})
      }
   }

   return stat
}

function addMeta(keyword:string,language:string,data:{},t:string,tree:{},found:boolean=true,facets:boolean=true,inEtext)
{
   loggergen.log("aM:",data,data["results"],t,inEtext)

   if(data["results"] &&  data["results"]["bindings"] && data["results"]["bindings"][t.toLowerCase()+"s"]){
      loggergen.log("FOUND",data);
      let stat = getStats(t,data,tree);

      if(inEtext) data.inEtext = inEtext

      if(tree)
      {
         if(stat["tree"] && stat["tree"]["unspecified"]) {

            let elem = data["results"]["bindings"][t.toLowerCase()+"s"]

            //loggergen.log("elem tree",tree["@graph"][0]) ; //elem,stat)

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

      loggergen.log("stat",stat)
      if(found) store.dispatch(dataActions.foundResults(keyword, language, data, [t]));
      if(facets) store.dispatch(dataActions.foundFacetInfo(keyword,language,[t],stat))
      else return stat
   }
}

function mergeSameAs(result,withSameAs,init = true,rootRes = result, force = false, keyword)
{
   //loggergen.log("mSa:",result,rootRes,keyword,init,force)

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
      
      //loggergen.log("rData:",rData)
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

   //loggergen.log("wSa",withSameAs)

   let keys = Object.keys(withSameAs)
   if(keys) for(let i in keys) {
      let k = keys[i]
      let r = withSameAs[k]
      
      //loggergen.log("k r",k,r)

      if(force && rootRes[r.t] && !rootRes[r.t][k]) {
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
            
            //loggergen.log("same?",isRid,k,r.t,s,result[r.t][k],result[r.t][s])

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

                  //loggergen.log("v.type",v)

                  /* // deprecated
                  //if(v.type && v.type === skos+"prefLabel") v_.type = k 
                  //if(v.type && v.type === s) v_.type = skos+"prefLabel"
                  */
                  if(!found) result[r.t][s].push(v_)
               }
               if(noK && !hasSameK && init) result[r.t][s].push({type:owl+"sameAs",value:k})
            }
         }
         let erase = [ k , ...(init||isRid?[]:r.props.filter(p => p.type === owl+"sameAs").map(p => p.value)) ]
         //loggergen.log("erase",erase,noK,hasSameK)
         for(let e of erase) {
            if(result[r.t] && result[r.t][e]) {
               delete result[r.t][e]
               if(isRid && result[r.t][s]) delete result[r.t][s]
               if(!noK && result.metadata && result.metadata[r.fullT]) {
                  result.metadata[r.fullT] --
                  //loggergen.log("meta",result.metadata[r.fullT]) 
               }
            }
         }
      }
   }
   

   return result
}



function sortResultsByVolumeNb(results,reverse) {
   
   if(!results) return 

   let keys = Object.keys(results)
   if(keys && keys.length) {
      keys = keys.map(k => {
         let n = 0, score, p = results[k].length
         for(let i in results[k]) {
            let v = results[k][i]
            if(v.type === bdo+"eTextIsVolume") {
               n = Number(v.value)
            } else if(v.type === bdo+"eTextInVolume") {
               n = Number(v.value)
            }
         }
         return ({k, n, p})
      },{})
      keys = _.orderBy(keys,['n','p'],[(reverse?'desc':'asc'), (reverse?'asc':'desc')])

      //loggergen.log("sortK",keys)

      let sortRes = {}
      for(let k of keys) sortRes[k.k] = results[k.k]

      //loggergen.log("sortResP",reverse,sortRes)

      return sortRes
   }
   return results
}

function sortResultsByTitle(results, userLangs, reverse) {

   if(!results) return 

   let keys = Object.keys(results)
   let langs = extendedPresets(userLangs)
   let state = store.getState(), assoR
   if(keys && keys.length) {
      keys = keys.map(k => {
         let lang,value,labels = results[k].filter(e => e.type && e.type.endsWith("abelMatch") ).map(e => ({ ...e, value:e.value.replace(/[↦]/g,"")})) 
         if(!labels.length) labels = results[k].filter(r => r.type && r.type === skos+"prefLabel") //r.value && r.value.match(/↦/))
         if(!labels.length && (assoR = state.data.assocResources[state.data.keyword]) && assoR[k]) labels = assoR[k].filter(r => r.type && r.type === skos+"prefLabel") 
         //loggergen.log("labels?",labels,assoR,k,assoR[k],results[k])
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
      //loggergen.log("keys1", keys)
      let sortKeys = sortLangScriptLabels(keys,langs.flat,langs.translit)
      if(reverse) sortKeys = sortKeys.reverse()
      //loggergen.log("keys2", sortKeys)
      let sortRes = {}
      for(let k of sortKeys) sortRes[k.k] = results[k.k]

      //loggergen.log("sortResT",sortRes)

      return sortRes
   }
   return results
}

// TODO also sort by 'title' whene relevance/popularity/year is equal

function sortResultsByRelevance(results,reverse) {

   if(!results) return 

   let keys = Object.keys(results)
   if(keys && keys.length) {
      keys = keys.map(k => {
         let n = 0, score, p = results[k].length, scoreDel = [],last, max = 0
         for(let i in results[k]) {
            let v = results[k][i]
            if(v.type === tmp+"matchScore") {
               if(!max) max = Number(v.value)
               else { 
                  let m = Number(v.value)
                  if(m > max || (reverse && m < max)) { 
                     loggergen.log("push",v,i,last,n,m)
                     max = m
                     scoreDel.push(Number(last))
                     p--
                  }
               }
               last = i
            } else if(v.type === tmp+"maxScore") {
               max = Number(v.value)
            } else if(v.type === tmp+"nbChunks") {
               n = Number(v.value)
            }
         }
         // TODO no need to keep all scores (needs to be elsewhere more generic)
         if(scoreDel.length) { 
            for(let i of scoreDel) delete results[k][i]
            results[k] = results[k].filter(e=>e)
         }
         return ({k, max, n, p})
      },{})
      keys = _.orderBy(keys,[ 'max', 'n','p'],[(reverse?'asc':'desc'), (reverse?'asc':'desc')])
      
      //loggergen.log("sortK",JSON.stringify(keys,null,3))

      let sortRes = {}
      for(let k of keys) sortRes[k.k] = results[k.k]

      //loggergen.log("sortResR",sortRes)

      return sortRes
   }

   return results
}


function sortResultsByPopularity(results,reverse) {
   
   if(!results) return 

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
      keys = _.orderBy(keys,['n','p'],[(reverse?'asc':'desc'), (reverse?'asc':'desc')])
      //loggergen.log("sortK",keys)

      let sortRes = {}
      for(let k of keys) sortRes[k.k] = results[k.k]

      //loggergen.log("sortResP",reverse,sortRes)

      return sortRes
   }
   return results
}


function sortResultsByYear(results,reverse) {

   if(!results) return 

   let keys = Object.keys(results)
   if(keys && keys.length) {
      keys = keys.map(k => {
         let n = 1000000, score, p = results[k].length
         if(reverse) n = -1000000
         for(let i in results[k]) {
            let v = results[k][i]
            if(v.type === tmp+"yearStart") {
               n = Number(v.value)
            }
         }
         return ({k, n, p})
      },{})
      keys = _.orderBy(keys,['n','p'],[(reverse?'desc':'asc'), (reverse?'asc':'desc')])
      
      //loggergen.log("keysY",keys)

      let sortRes = {}
      for(let k of keys) sortRes[k.k] = results[k.k]

      //loggergen.log("sortResY",sortRes)

      return sortRes
   }
   return results
}

function sortResultsByLastSync(results,reverse) {

   if(!results) return 

   let keys = Object.keys(results)
   if(keys && keys.length) {
      keys = keys.map(k => {
         let n = "9999-99-99T99:99:99.999Z", score, p = results[k].length
         if(reverse) n = "0000-00-00T00:00:00.000Z"
         for(let i in results[k]) {
            let v = results[k][i]
            if(v.type === tmp+"lastSync") {
               n = v.value
            }
         }
         return ({k, n, p})
      },{})
      keys = _.orderBy(keys,['n','p'],[(reverse?'asc':'desc'), (reverse?'desc':'asc')])
      
      //loggergen.log("keysY",keys)

      let sortRes = {}
      for(let k of keys) sortRes[k.k] = results[k.k]

      //loggergen.log("sortResY",sortRes)

      return sortRes
   }
   return results
}


function sortResultsByNbChunks(results,reverse) {
   
   if(!results) return 

   let keys = Object.keys(results)
   if(keys && keys.length) {
      keys = keys.map(k => {
         let n = 0, score, p = results[k].length, max = 0
         for(let i in results[k]) {
            let v = results[k][i]
            if(v.type === tmp+"nbChunks") {
               n = Number(v.value)
            }
            else if(v.type === tmp+"maxScore") {
               max = Number(v.value)
            }
         }
         return ({k, n, max, p})
      },{})
      keys = _.orderBy(keys,['n','max','p'],[(reverse?'asc':'desc'), (reverse?'asc':'desc')])
      
      loggergen.log("sortK",JSON.stringify(keys,null,3))

      let sortRes = {}
      for(let k of keys) sortRes[k.k] = results[k.k]

      loggergen.log("sortResNb",reverse,sortRes)

      return sortRes
   }
   return results
}

function rewriteAuxMain(result,keyword,datatype,sortBy,language)
{
   let asset = [_tmp+"hasOpen", _tmp+"hasEtext", _tmp+"hasImage"]
   let state = store.getState()
   let langPreset = state.ui.langPreset
   if(!sortBy) sortBy = state.ui.sortBy
   let reverse = sortBy && sortBy.endsWith("reverse")
   let canPopuSort = false, isScan, isTypeScan = datatype.includes("Scan"), inRoot

   result = Object.keys(result).reduce((acc,e)=>{
      if(e === "main") {
         let keys = Object.keys(result[e])
         if(keys) {
            store.dispatch(dataActions.gotAssocResources(keyword,{ data: keys.reduce( (acc,k) => ({...acc, [k]: result[e][k].filter(e => e.type === skos+"altLabel" || e.type === skos+"prefLabel") }),{})  }))
         }
         let t = datatype[0].toLowerCase()+"s"

         canPopuSort = false 
         let dataWithAsset = keys.reduce( (acc,k) => { 

            isScan = false       
            inRoot = false

            if(auth && !auth.isAuthenticated()) {	
               let status = result[e][k].filter(k => k.type === adm+"status" || k.type === tmp+"status")	
               if(status && status.length) status = status[0].value	
               else status = null	

               if(status && !status.match(/Released/)) 	
                  return acc ;	

            }
            
            let res = result[e][k].map(e => { 
               if(asset.includes(e.type) && e.value == "true") {
                  if(isTypeScan && e.type === _tmp+"hasImage") isScan = true ; 
                  return ({type:_tmp+"assetAvailability",value:e.type})
               } else if(e.type === bdo+"inRootInstance") {
                  inRoot = true
               }
               return e
            } )

            if(t === "instances") {
               if(!inRoot) res.push({type:_tmp+"versionType", value:_tmp+"standalone"})
               else res.push({type:_tmp+"versionType", value:_tmp+"partOfVersion"})
            }



            canPopuSort = canPopuSort || (res.filter(e => e.type === tmp+"entityScore").length > 0)            
            let chunks = res.filter(e => e.type === bdo+"eTextHasChunk")
            if(chunks.length) {
               let getVal = (id,prop,onlyValue = true) => {
                  let k = result["aux"]
                  if(k) k = k[id]
                  if(k) k = k.filter(f => f.type === prop)
                  if(k) k = k[0]           
                  if(onlyValue) {       
                     if(k) k = k.value
                     else k = 0
                  }
                  return k
               }
               chunks = chunks.map(e => {
                  let n = getVal(e.value,tmp+"matchScore")
                  let m = getVal(e.value,bdo+"sliceStartChar")
                  let p = getVal(e.value,bdo+"sliceEndChar")
                  let content = getVal(e.value,bdo+"chunkContents",false)
                  let expand 
                  if(content) expand = { lang:content["xml:lang"], value: content.value
                              .replace(/(↤([་ ]*[^་ ↦↤]+[་ ]){5})[^↦↤]*(([་ ][^་ ↦↤]+[་ ]*){5}↦)/g,"$1 (…) $3")
                              .replace(/^[^↦↤]*(([་ ][^་ ↦↤]+[་ ]*){5}↦)/,"(…) $1")
                              .replace(/(↤([་ ]*[^་ ↦↤]+[་ ]){5})[^↦↤]*$/g,"$1 (…)") }
                  
                  //loggergen.log("full",content.value)
                  //loggergen.log("expand",expand.value)

                  return { e, n, m, p, content, expand }
               })
               chunks = _.orderBy(chunks, ['n','m'], ['desc','asc'])
               //loggergen.log("chunks",chunks)


               res = [ ...res.filter(e => e.type !== bdo+"eTextHasChunk"), { ...chunks[0].content, type:tmp+"bestMatch", startChar:chunks[0].m, endChar:chunks[0].p, 
                        ...(chunks[0].expand?{expand:chunks[0].expand}:{})} ]

               if(chunks.length > 1) res = res.concat(chunks.slice(1).map(e => ({...e.e, expand:e.expand, startChar:e.m, endChar:e.p})))
            }

            if(isTypeScan && !isScan) return ({...acc})
            else return ({...acc, [k]:res})
         },{})
        
         //loggergen.log("dWa:",language,t,dataWithAsset,sortBy,reverse,canPopuSort)

         if(!canPopuSort && sortBy.startsWith("popularity")) {            
            let {pathname,search} = history.location         
            history.push({pathname,search:search.replace(/(([&?])s=[^&]+)/g,"$2")+(!search.match(/[?&]s=/)?"&":"")+"s="+(sortBy=(language?"closest matches":"title")+" forced")})   
         }

         if(language !== undefined) { 
            dataWithAsset = mergeSameAs({[t]:dataWithAsset},{},true,{},true,!language?keyword:null)
            dataWithAsset = dataWithAsset[t]
         }

         if(!sortBy || sortBy.startsWith("popularity")) return { ...acc, [t]: sortResultsByPopularity(dataWithAsset,reverse) }
         else if(sortBy.startsWith("year of")) return { ...acc, [t]: sortResultsByYear(dataWithAsset,reverse) }
         else if(sortBy.startsWith("closest matches")) return { ...acc, [t]: sortResultsByRelevance(dataWithAsset,reverse) }
         else if(sortBy.startsWith("number of matching chunks")) return { ...acc, [t]: sortResultsByNbChunks(dataWithAsset,reverse) }
         else if(sortBy.startsWith("volume number")) return { ...acc, [t]: sortResultsByVolumeNb(dataWithAsset,reverse) }
         else if(sortBy.includes("title") ||  sortBy.includes("name") ) return { ...acc, [t]: sortResultsByTitle(dataWithAsset, langPreset, reverse) }
         else if(sortBy.includes("date")) return { ...acc, [t]: sortResultsByLastSync(dataWithAsset,reverse) }
      }
      else if(e === "aux") {                  
         store.dispatch(dataActions.gotAssocResources(keyword,{ data: result[e] } ) )
      }
      else if(e === "facets") {
         let cat = "http://purl.bdrc.io/resource/O9TAXTBRC201605"
         if(result[e].topics && result[e].topics[cat]) {
            let root = result[e].topics[cat]
            let tree = [ { "@id": cat, taxHasSubClass: root.subclasses }, ...Object.keys(result[e].topics).reduce( (acc,k) =>  { 
               let elem = result[e].topics[k] 
               return ([ ...acc, { "@id":k, taxHasSubClass: elem.subclasses, "skos:prefLabel": elem["skos:prefLabel"], "tmp:count":elem["count"] } ])
            }, []) ]
            return { ...acc, ["tree"]: { "@graph" : tree  } }
         }
         return acc
      }
      else return acc
   }, {})

   return result
}


async function startSearch(keyword,language,datatype,sourcetype,dontGetDT,inEtext) {

   loggergen.log("sSsearch",keyword,language,datatype,sourcetype,inEtext);

   // why is this action dispatched twice ???
   store.dispatch(uiActions.loading(keyword, true));
   if(!datatype || datatype.indexOf("Any") !== -1) {
      store.dispatch(dataActions.getDatatypes());
   }
   try {
      let result ;

      if(!sourcetype)
      result = await api.getStartResults(keyword,language,datatype,inEtext);
      else
      result = await api.getAssocResults(keyword,sourcetype,datatype[0]);

      // adapt to new new JSON format
      if(result) {
         loggergen.log("res",result)
         if(result && (datatype && datatype.indexOf("Any") === -1) ) 
            result = rewriteAuxMain(result,keyword,datatype,null,language)
         else 
            result = Object.keys(result).reduce((acc,e)=>({ ...acc, [e.replace(/^.*[/](Etext)?([^/]+)$/,"$2s").toLowerCase()] : result[e] }),{})
      }

      /*  //deprecated
      let rootRes
      if(datatype) rootRes = store.getState().data.searches[keyword+"@"+language]
      if(rootRes) rootRes = rootRes.results.bindings  
      result = mergeSameAs(result,{},true,rootRes,true,!language?keyword:null)

      loggergen.log("newRes1",Object.keys(result[datatype[0].toLowerCase()+"s"],null,3))
      */




      if(result.metadata && result.metadata[bdo+"Etext"] == 0)
      {
         delete result.metadata[bdo+"Etext"]
         //loggergen.log("deleted")
      }

      if(sourcetype == 'Role' && result.data)
      {
         result["people"] = { ...result.data }
         delete result.data ;
      }

      let metadata = result.metadata;
      //loggergen.log("meta",metadata)

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

      loggergen.log("data",data,result)

      let metaD = {}
      data = getData(data,metadata,metaD);
      store.dispatch(dataActions.foundResults(keyword, language, data, datatype));

      metadata = await api.getDatatypesOnly(keyword, language);
      let sorted = Object.keys(metadata).map(m => ({m,k:Number(metadata[m])}))
      metadata = _.orderBy(sorted,["k"],["desc"]).reduce( (acc,m) => ({...acc,[m.m]:metadata[m.m]}),{})
      store.dispatch(dataActions.foundDatatypes(keyword,language,{ metadata, hash:true}));

      let newMeta = {}

      if(["Work","Instance","Scan"].includes(datatype[0])) addMeta(keyword,language,data,datatype[0],result.tree);      
      else addMeta(keyword,language,data,datatype[0]);      

      /* // deprecated
      addMeta(keyword,language,data,"Person");      
      addMeta(keyword,language,data,"Work",result.tree);
      addMeta(keyword,language,data,"Lineage");
      addMeta(keyword,language,data,"Place");
      */

      loggergen.log("sourcetype",data,datatype)

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

   //loggergen.log("kz1",JSON.stringify(Object.keys(data.results.bindings)))

   if(inEtext) data.inEtext = inEtext

   store.dispatch(dataActions.foundResults(keyword, language, data, datatype));

   if(!datatype || datatype.indexOf("Any") !== -1) {
      store.dispatch(dataActions.foundDatatypes(keyword,language,{ metadata:metadata, hash:true}));
   }
   else {


      if(["Person","Place","Role","Corporation","Topic","Lineage","Etext","Product"].indexOf(datatype[0]) !== -1) {

         addMeta(keyword,language,data,datatype[0],null,false, true);
      }
      else if(["Instance","Work","Etext","Scan"].indexOf(datatype[0]) !== -1) {

         metadata = { ...metadata, tree:result.tree}

         let dt = "Etext" ;
         if(datatype.indexOf("Work") !== -1 ) { dt="Work" ; addMeta(keyword,language,data,"Work",result.tree,false); }
         else if(datatype.indexOf("Instance") !== -1 ) { dt="Instance" ; addMeta(keyword,language,data,"Instance",result.tree,false); }
         else if(datatype.indexOf("Scan") !== -1 ) { dt="Scan" ; addMeta(keyword,language,data,"Scan",result.tree,false); }
         else store.dispatch(dataActions.foundFacetInfo(keyword,language,datatype,metadata))

         //store.dispatch(dataActions.foundDatatypes(keyword,language,{ metadata:{ [bdo+dt]:data.numResults } } ));
      }

      let state = store.getState()
      if(!dontGetDT && (!state.data.searches[keyword+"@"+language] || state.data.searches[keyword+"@"+language].inEtext !== inEtext) ) {

         /* // deprecated
         store.dispatch(dataActions.getDatatypes(keyword,language));

         result = await api.getStartResults(keyword,language);
         result = Object.keys(result).reduce((acc,e)=>({ ...acc, [e.replace(/^.*[/](Etext)?([^/]+)$/,"$2s").toLowerCase()] : result[e] }),{})
         
         let withSameAs = {}
         result = mergeSameAs(result,withSameAs)

         let keys = Object.keys(withSameAs)

         loggergen.log("newRes2",result,data,keys)

         if(keys.length) {
            data.results.bindings = mergeSameAs(data.results.bindings,withSameAs,false)
            store.dispatch(dataActions.foundResults(keyword, language, data, datatype));
         }

         if(result.metadata && result.metadata[bdo+"Etext"] == 0)
         delete result.metadata[bdo+"Etext"]

         metadata = result.metadata;
         data = getData(result);
         */
         //loggergen.log("kz2",JSON.stringify(Object.keys(data.results.bindings)))

         if(!inEtext) metadata = await api.getDatatypesOnly(keyword, language);
         else  metadata = { [bdo+"Etext"]: data.numResults}

         data = { results: { bindings: { } } }
         if(inEtext) data.inEtext = inEtext

         store.dispatch(dataActions.foundResults(keyword, language, data ) ) //data));
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


export function* watchGetAssocTypes() {

   yield takeLatest(
      dataActions.TYPES.getAssocTypes,
      (action) => getAssocTypes(action.payload)
   );
}


async function getAssocTypes(rid) {

   store.dispatch(uiActions.loading("assocTypes", true));

   //store.dispatch(dataActions.getDatatypes(rid,""))
   let metadata = await api.getDatatypesOnly(rid, "");
   let sorted = Object.keys(metadata).map(m => ({m,k:Number(metadata[m])}))
   metadata = _.orderBy(sorted,["k"],["desc"]).reduce( (acc,m) => ({...acc,[m.m]:metadata[m.m]}),{})
   store.dispatch(dataActions.foundDatatypes(rid,"",{ metadata, hash:true}));

   store.dispatch(uiActions.loading("assocTypes", false));

}


async function updateSortBy(i,t)
{   

   let state = store.getState()
   
   let data ;
   if(state.data.searches[t] && state.data.searches[t][state.data.keyword+"@"+state.data.language]) data = state.data.searches[t][state.data.keyword+"@"+state.data.language]
   else if(state.data.searches[state.data.keyword+"@"+state.data.language]) data = state.data.searches[state.data.keyword+"@"+state.data.language]

   loggergen.log("uSb",i,t,state.data.searches[t],state,data,state.ui.sortBy)

   if(!data) return

   let reverse = i && i.endsWith("reverse")

   if(i.startsWith("popularity")) data.results.bindings[t.toLowerCase()+"s"] = sortResultsByPopularity(data.results.bindings[t.toLowerCase()+"s"], reverse) 
   else if(i.startsWith("closest matches")) data.results.bindings[t.toLowerCase()+"s"] = sortResultsByRelevance(data.results.bindings[t.toLowerCase()+"s"], reverse) 
   else if(i.startsWith("year of")) data.results.bindings[t.toLowerCase()+"s"] = sortResultsByYear(data.results.bindings[t.toLowerCase()+"s"], reverse) 
   else if(i.startsWith("volume number")) data.results.bindings[t.toLowerCase()+"s"] = sortResultsByVolumeNb(data.results.bindings[t.toLowerCase()+"s"], reverse) 
   else if(i.startsWith("number of matching chunks")) data.results.bindings[t.toLowerCase()+"s"] = sortResultsByNbChunks(data.results.bindings[t.toLowerCase()+"s"], reverse) 
   else if(i.includes("title") || i.includes("name")) { 
      let langPreset = state.ui.langPreset
      data.results.bindings[t.toLowerCase()+"s"] = sortResultsByTitle(data.results.bindings[t.toLowerCase()+"s"], langPreset, reverse)
   }
   else if(i.includes("date")) data.results.bindings[t.toLowerCase()+"s"] = sortResultsByLastSync(data.results.bindings[t.toLowerCase()+"s"], reverse)  
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

   loggergen.log("gI",keyword,uri,init,data)


   if(init || keyword === uri+"@") {
      
      let numResults = Object.keys(results.main)
      if(numResults.length) numResults = numResults.length

      let sortBy = state.ui.sortBy
      if(!sortBy || sortBy === "popularity") sortBy = "year of publication reverse" 

      loggergen.log("sortBy?2",sortBy,state.ui.sortBy,init,keyword)

      results = rewriteAuxMain(results,uri,["Work"],sortBy)

      let metadata = addMeta(uri,"",{results:{bindings:results} }, "Work", null, false, false )
       
      store.dispatch(dataActions.foundResults(uri,"", { metadata, numResults, isInstance:true, results:{bindings:results}},["Work"]))
      
      store.dispatch(dataActions.foundResults(uri,"", { isInstance:true, results: { bindings: { } } } ) ) //data));

      store.dispatch(dataActions.foundDatatypes(uri,"",{ metadata:{[bdo+"Work"]:numResults}, hash:true}));

      //if(sortBy != state.ui.sortBy) 
      //store.dispatch(uiActions.updateSortBy(sortBy,"Work"))

   }
   else { 

      let langPreset = state.ui.langPreset

      let sortBy = "year of publication reverse" 

      loggergen.log("sortBy?1",sortBy)

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




async function getResultsByDateOrId(date, t, dateOrId) {

   let state = store.getState(), res, data


   store.dispatch(uiActions.loading(null, true));

   // DONE fix using already loaded data
   if(state.data.searches && state.data.searches[t] && state.data.searches[t][date+"@"+ dateOrId] && state.data.searches[t][date+"@"+ dateOrId].numResults){

      //console.log("deja:",JSON.stringify(state.data.searches[t][date+"@date"], null, 3 ))

      // no need, already done
      //store.dispatch(dataActions.foundResults(date, "date", { results: {bindings: {} } } ) ); // needed to initialize ("Any" / legacy code)

      store.dispatch(dataActions.foundResults(date,  dateOrId, state.data.searches[t][date+"@"+ dateOrId], [t]));

   }
   else {

      res = await api.loadResultsByDateOrId(date,t,dateOrId)
         
      res = rewriteAuxMain(res,date,[t], null, dateOrId)

      data = getData(res)

      loggergen.log("byDateOrId:",  dateOrId, date, t, res, data)
      
      store.dispatch(dataActions.foundResults(date,  dateOrId, { results: {bindings: {} } } ) ); // needed to initialize ("Any" / legacy code)

      store.dispatch(dataActions.foundResults(date,  dateOrId, data, [t]));

      addMeta(date,  dateOrId, data, t, null,false); 
      
   
   }
   

   // DONE don't fetch datatypes counts if we already have them
   if(state.data.datatypes && state.data.datatypes[date+"@"+ dateOrId]){

      store.dispatch(dataActions.foundDatatypes(date,  dateOrId, state.data.datatypes[date+"@"+ dateOrId] ));

   } else {

      let metadata = await api.getDatatypesOnly(date,  dateOrId,  dateOrId==="date"?"Date":"Id" );
      let sorted = Object.keys(metadata).map(m => ({m,k:Number(metadata[m])}))
      metadata = _.orderBy(sorted,["k"],["desc"]).reduce( (acc,m) => ({...acc,[m.m]:metadata[m.m]}),{})
      store.dispatch(dataActions.foundDatatypes(date,  dateOrId,{ metadata, hash:true}));

      //store.dispatch(dataActions.foundDatatypes(date,"date",{ metadata:{[bdo+t]:data.numResults}, hash:true}));


   }

   store.dispatch(uiActions.loading(null, false));
}

export function* watchGetResultsByDate() {

   yield takeLatest(
      dataActions.TYPES.getResultsByDate,
      (action) => getResultsByDateOrId(action.payload, action.meta, "date")
   );
}

export function* watchGetResultsById() {

   yield takeLatest(
      dataActions.TYPES.getResultsById,
      (action) => getResultsByDateOrId(action.payload, action.meta, "id")
   );
}


async function getLatestSyncsAsResults() {

   let state = store.getState()
   let sortBy = state.ui.sortBy
   if(!sortBy) sortBy = "release date"

   store.dispatch(uiActions.loading(null, true));

   let res = await api.loadLatestSyncsAsResults()
      
   res = rewriteAuxMain(res,"(latest)",["Scan"],sortBy)

   let data = getData(res)

   loggergen.log("syncs",res,data)
   
   store.dispatch(dataActions.foundResults("(latest)", "en", { results: {bindings: {} } } ) ); // needed to initialize ("Any" / legacy code)

   store.dispatch(dataActions.foundResults("(latest)", "en", data, ["Scan"]));

   store.dispatch(dataActions.foundDatatypes("(latest)","en",{ metadata:{[bdo+"Scan"]:data.numResults}, hash:true}));

   addMeta("(latest)","en",data,"Scan",null,false); 

   store.dispatch(uiActions.loading(null, false));

}

export function* watchGetLatestSyncsAsResults() {

   yield takeLatest(
      dataActions.TYPES.getLatestSyncsAsResults,
      (action) => getLatestSyncsAsResults()
   );
}



async function getLatestSyncs() {

   let res = await api.loadLatestSyncs() 
   
   let nb = res[tmp+"totalRes"]
   if(nb) nb = nb[tmp+"totalSyncs"]
   if(nb && nb.length) nb = nb[0].value 

   let keys = _.orderBy(Object.keys(res).filter(k => k !== tmp+"totalRes").map(k => ({id:k,t:res[k][tmp+"datesync"][0].value})), "t", "desc")

   let sorted = {}
   keys.map(k => { sorted[k.id] = res[k.id]; })
      
   loggergen.log("syncs",res,sorted,nb)

   store.dispatch(dataActions.gotLatestSyncs(sorted,nb))

}


export function* watchGetLatestSyncs() {

   yield takeLatest(
      dataActions.TYPES.getLatestSyncs,
      (action) => getLatestSyncs()
   );
}

async function getOutline(iri) {

   store.dispatch(uiActions.loading(iri, "outline"));
   let res = await api.loadOutline(iri) 
   store.dispatch(uiActions.loading(iri, false));
   
   loggergen.log("outline",res)

   store.dispatch(dataActions.gotOutline(iri,res))

}


export function* watchGetETextRefs() {

   yield takeLatest(
      dataActions.TYPES.getETextRefs,
      (action) => getETextRefs(action.payload)
   );
}

async function getETextRefs(iri) {

   store.dispatch(uiActions.loading(iri, "ETextRefs"));
   let res = await api.loadETextRefs(iri) 
   store.dispatch(uiActions.loading(iri, false));
   
   loggergen.log("ETextRefs",res)

   store.dispatch(dataActions.gotETextRefs(iri,res))

}


export function* watchGetOutline() {

   yield takeLatest(
      dataActions.TYPES.getOutline,
      (action) => getOutline(action.payload)
   );
}


async function outlineSearch(iri,kw,lg) {

   store.dispatch(uiActions.loading(iri, "outline"));
   
   let res = await api.outlineSearch(iri,kw,lg)

   store.dispatch(uiActions.loading(iri, false));
   
   loggergen.log("outlineSearch",iri,kw,lg,res)

   store.dispatch(dataActions.gotOutline(iri+"/"+kw+"@"+lg,res))

}


export function* watchOutlineSearch() {

   yield takeLatest(
      dataActions.TYPES.outlineSearch,
      (action) => outlineSearch(action.meta.iri, action.payload, action.meta.lang)
   );
}

async function searchKeyword(keyword,language,datatype) {

   loggergen.log("searchK",keyword,language,datatype);

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

   loggergen.log("searchK1DT",datatype,keyword,language);

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

   loggergen.log("searchK1F",keyword,language,facet);

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

      let {assocRes, _res } = extractAssoRes(iri,res) //= await api.loadAssocResources(iri)
      store.dispatch(dataActions.gotResource(iri,_res))
      store.dispatch(dataActions.gotAssocResources(iri,{ data: assocRes }))

      //store.dispatch(dataActions.gotResource(iri, res));
   }
   catch(e) {
      console.error("ERRROR with resource "+iri,e)
      store.dispatch(dataActions.noResource(iri,e));
   }

}

async function getFacetInfo(keyword,language:string,property:string) {

   loggergen.log("searchFacet",keyword,language,property);

   try {
      const result = await api.getResultsSimpleFacet(keyword,language,property);

      //loggergen.log("back from call",property,result);

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
      (action) => startSearch(action.payload.keyword,action.payload.language,action.payload.datatype,action.payload.sourcetype,action.payload.dontGetDT,action.payload.inEtext)
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
      watchGetAssocTypes(),
      watchGetUser(),
      watchGetOutline(),
      watchGetETextRefs(),
      watchGetResultsByDate(),
      watchGetResultsById(),
      watchGetLatestSyncsAsResults(),
      watchGetLatestSyncs(),
      watchOutlineSearch(),
      watchGetResetLink(),
      watchUpdateSortBy(),
      watchGetInstances(),
      watchGetContext(),
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
