
//import download from "downloadjs";
//import fileDownload from "js-file-download" ;
import _ from "lodash";
import jQuery from 'jquery' ;
import { call, put, takeLatest, select, all } from 'redux-saga/effects';
import { INITIATE_APP } from '../actions';
import * as dataActions from '../data/actions';
import * as uiActions from '../ui/actions';
import selectors from '../selectors';
import store from '../../index';
import bdrcApi, { getEntiType, ResourceNotFound, logError, staticQueries } from '../../lib/api';
import {sortLangScriptLabels, extendedPresets, getMainLabel} from '../../lib/transliterators';
import {auth} from '../../routes';
import {shortUri,fullUri,isGroup,sublabels,subtime,isProxied} from '../../components/App'
import {getQueryParam, GUIDED_LIMIT} from '../../components/GuidedSearch'
import qs from 'query-string'
import history from '../../history.js'
import {locales} from '../../components/ResourceViewer';


import logdown from 'logdown'
import edtf, { parse } from "edtf"

//import { setHandleMissingTranslation } from 'react-i18nify';
//import { I18n } from 'react-redux-i18n';
import { i18nextChangeLanguage } from 'i18next-redux-saga';

//import Spellchecker from 'hunspell-spellchecker';
import Typo from "typo-js"
import boAff from 'hunspell-bo/bo.aff'
import boDic from 'hunspell-bo/bo.dic'

import jsEWTS from "jsewts"

// to enable tests
const api = new bdrcApi({...process.env.NODE_ENV === 'test' ? {server:"http://localhost:5555/test"}:{}});

// for full debug, type this in the console:
// window.localStorage.debug = 'gen'

const loggergen = new logdown('gen', { markdown: false });

const adm  = "http://purl.bdrc.io/ontology/admin/" ;
const bda  = "http://purl.bdrc.io/admindata/"
const bdo  = "http://purl.bdrc.io/ontology/core/";
const bdou  = "http://purl.bdrc.io/ontology/ext/user/" ;
const bdu   = "http://purl.bdrc.io/resource-nc/user/";
const bdr  = "http://purl.bdrc.io/resource/";
const foaf  = "http://xmlns.com/foaf/0.1/" ;
const owl   = "http://www.w3.org/2002/07/owl#" ;
const rdf   = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const rdfs  = "http://www.w3.org/2000/01/rdf-schema#"; 
const skos = "http://www.w3.org/2004/02/skos/core#";
const tmp = "http://purl.bdrc.io/ontology/tmp/" ;
const _tmp = tmp ;

let IIIFurl = "//iiif.bdrc.io" ;

const handleAuthentication = (nextState, isAuthCallback) => {
   if (nextState && /access_token|id_token|error/.test(nextState.location.hash)) {
      auth.handleAuthentication();      
   } else if(auth && !isAuthCallback && !auth.isAuthenticated()) { 
      auth.handleAuthentication(true)
   } else if(auth && auth.isAuthenticated()) {
      auth.getProfile(() => {})
   }
}

let sameAsR = {}

const initHunspellBo = async () => {
   const dic = await (await fetch(boDic)).text()
   const aff = await (await fetch(boAff)).text()
   
   //const sp = new Spellchecker()
   //const dictionary =  sp.parse({ aff, dic });
   //sp.use(dictionary);

	const sp = new Typo("bo", aff, dic);
   
  // console.log("sp:", sp, sp.check("བླ"), sp.check("དལཻ"), sp.suggest("དལཻ").map(s => jsEWTS.toWylie(s))); // pass/fail+suggest!
   store.dispatch(dataActions.initSpellcheckerBo(sp))
}

async function initiateApp(params,iri,myprops,route,isAuthCallback) {
   try {
      loggergen.log("params=",params)
      loggergen.log("iri=",iri)
      let state = store.getState()

      //      loggergen.log("youpla?",prefix)

      let redirect = JSON.parse(localStorage.getItem('auth0_redirect_logout'))
      localStorage.removeItem('auth0_redirect_logout')
      if(redirect && redirect.startsWith && redirect.startsWith("http")) window.location.href = redirect
      
      let useDLD = state.ui.useDLD
      if(params && params.useDLD && !useDLD) {
         store.dispatch(uiActions.useDLD());
         useDLD = true
      } 

      if(useDLD) {
         window.top.postMessage(JSON.stringify({"url":{"path":history.location.pathname,"search":history.location.search}}),"*")
         
         new MutationObserver(function() {
            //loggergen.log("newT:",document.title);
            window.top.postMessage(JSON.stringify({"title": document.title }),"*")
         }).observe(document.querySelector('title'),{ childList: true });
      }

      if(!state.data.hunspellBo) initHunspellBo()

      if(!state.data.config)
      {

         if(params && params.feedbucketRecording == "true") {
            loggergen.log("recording")
            jQuery("#root").addClass("recording")
         }

         const config = await api.loadConfig();

         var timer       
         if(config.feedbucketID) { 
            window.initFeedbucket = function() {        
               // #804 DONE: configure feedback scope
               if(timer) clearInterval(timer)
               timer = setInterval(function(){
                  if(window.feedbucketConfig) {
                     jQuery("#feedbucket.off").removeClass("off")
                     clearInterval(timer)
                     timer = 0
                     if(document.querySelector('[data-feedbucket="'+config.feedbucketID+'"]')) return ;
                     var head = document.getElementsByTagName('head')[0];
                     var js = document.createElement("script");
                     js.type = "text/javascript";  
                     js.src = "https://cdn.feedbucket.app/assets/feedbucket.js" 
                     js.setAttribute("data-feedbucket", config.feedbucketID)            
                     head.appendChild(js);
                     store.dispatch(uiActions.feedbucket("on"))           
                     window.useFeedbucket = true
                     if(window.initFeedbucketInMirador) window.initFeedbucketInMirador();
                  } else {
                     jQuery("#feedback:not(.off)").addClass("off")
                     loggergen.log("trying...")
                     if(window.useFeedbucket) delete window.useFeedbucket;
                     if(window.initFeedbucketInMirador) delete window.initFeedbucketInMirador;
                  }
               }, 650);
               return
            }
         }

         //loggergen.log("is khmer server ?",config.khmerServer)

         //I18n.setHandleMissingTranslation((key, replacements) => key);

         if(config.auth && (!params || params.prerender != "true")) {
            auth.setConfig(config.auth,config.iiif,api)

            if(myprops) handleAuthentication(myprops, isAuthCallback);
            else handleAuthentication(null, isAuthCallback)
         }
         store.dispatch(dataActions.loadedConfig(config));

         window.isProxied = isProxied({props:{config}})
         if(window.isProxied && !state.data.subscribedCollections) {
            store.dispatch(dataActions.getSubscribedCollections());  
         }
         
         loggergen.log("config?",auth.isAuthenticated(),config,params)
         
         // DONE UI language
         let locale = "en", val
         if(config && config.chineseMirror) locale = "zh"

         // 1-url param
         if(params && params.uilang && ['bo','en','zh','km'].concat(config.khmerServer?['fr']:[]).includes(params.uilang)) locale = params.uilang
         // 2-saved preference
         else if(val = localStorage.getItem('uilang')) locale = val
         // 3-browser default
         else if(['bo','en','zh','km'].concat(config.khmerServer?['fr']:[]).includes(val = window.navigator.language.slice(0, 2))) locale = val
         // 4-config file
         else locale = config.language.data.index

         // TODO fix html lang tag (always "en" before switching language)

         // set i18n locale
         store.dispatch(i18nextChangeLanguage(locale));
         
         // set data language preferences
         // 1-saved preference
         let list 
         if((val = localStorage.getItem('langpreset')) && ((list = localStorage.getItem('lang')) || (list = [ ...config.language.data.presets[val] ]))) {
            if(list[locale]) list = list[locale]            
            else if(!Array.isArray(list)) list = list.split(/ *, */)
            store.dispatch(uiActions.langPreset(list, val))
         }
         // 2- locale
         else if(config.language.data.presets[locale]) store.dispatch(uiActions.langPreset(config.language.data.presets[locale], locale))
         else store.dispatch(uiActions.langPreset(["bo-x-ewts,inc-x-iast"]))
         

         //loggergen.log("preset",config.language.data.presets[config.language.data.index])
         //store.dispatch(dataActions.choosingHost(config.ldspdi.endpoints[config.ldspdi.index]));


         if(val = localStorage.getItem('etextlang')) {
            store.dispatch(uiActions.setEtextLang(val.split(",")))
         }

      }

      if( ["static", "mirador", "guidedsearch", "browse", "tradition" ].includes(route)) {
         
         if(route === "mirador" && params.backToViewer) {
            if(!auth.isAuthenticated()) auth.login(decodeURIComponent(params.backToViewer))
         }

         if(["guidedsearch","tradition"].includes(route)) {
            if(!state.data.dictionary) {
               const dico = await api.loadDictionary()
               store.dispatch(dataActions.loadedDictionary(dico));                       
            }
         }
         
         return ;
      }

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

      // #765
      if(params && params.p && params.p.includes("purl.bdrc.io/resource")) {     
         let iri = shortUri(params.p.replace(/"/g,""))
         if(iri.startsWith("bdr:")) {
            history.replace({ pathname: "/show/"+iri })
            return
         }
      }

      // #757
      if(params && params.s && Array.isArray(params.s)) {
         let { pathname, search } = { ...history.location }
         let s = params.s.filter(p => p.includes("%"))
         if(!s.length) s = params.s
         search = search.replace(/([&?])s=[^&]+/g, "") + "s=" + encodeURIComponent(s[0])
         history.replace({ pathname, search })
         return
      }

      // #756
      if(params && params.t === "Version") {
         let { pathname, search } = { ...history.location }
         search = search.replace(/t=Version/, "t=Instance") 
         history.replace({ pathname, search })
         return
      }

      // #756
      if(params && params.q && params.q.match(/^(["(]+[^"]*)"([^"]*[")]+[~0-9]*)$/)) {
         let { pathname, search } = { ...history.location }
         search = search.replace(/q=[^&]+/, "q="+params.q.replace(/^(["(]+[^"]*)"([^"]*[")~0-9]+)$/g,(m,g1,g2) => g1+(g2.includes('"')?g2:'"'+g2)))
         if(search != history.location.search) {
            history.replace({ pathname, search })
            return
         }
      }

      //loggergen.log("mid:init", params, iri)

      // [TODO] load only missing info when needed (see click on "got to annotation" for WCBC2237)
      if(iri) // || (params && params.r)) // && (!state.data.resources || !state.data.resources[iri]))
      {
         store.dispatch(uiActions.loading(null, true));

         let res,Etext ;
         if(!iri) iri = params.r

         Etext = iri.match(/^([^:]+:)?UT/)

         if(Etext) {
            let get = qs.parse(history.location.search), currentText
            if(params.backToEtext && !get.openEtext) {
               const loc = history.location;
               loc.search = loc.search?.replace(/(openEtext|backToEtext)=[^&]+/g,"") ?? ""
               console.log("loc:",loc)
               history.replace({ ...loc,
                  pathname:"/show/"+params.backToEtext, 
                  search: (loc.search!="?"?loc.search+"&":"?")+"openEtext="+loc.pathname.replace(/\/show\//,"")
               })
               return
            }
         }

         try {

            // TODO do not load resource again

            if(!Etext) res = await api.loadResource(iri, params.preview)
            else res = await api.loadEtextInfo(iri)      
         
            store.dispatch(uiActions.loading(null, false));
         }
         catch(e){
            logError(e)
            store.dispatch(dataActions.noResource(iri,e));

            store.dispatch(uiActions.loading(null, false));
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
                  else 
                  return acc ;
                  },
               [])
            loggergen.log("val:",val)
            if(!val.length) return acc ;
            else return ({...acc, [e]:val })
         },{})}

      //loggergen.log("gotAR",JSON.stringify(assoRes,null,3));

      // no need anymore with "standalone" etext viewer (#859)
      // store.dispatch(dataActions.gotAssocResources(iri,assoRes));

      res = { [bdrIRI] : _.sortBy(Object.keys(res)).reduce((acc,e) => {

         //if(Object.keys(res[e]).indexOf(skos+"prefLabel") === -1)
         return ({...acc, ...Object.keys(res[e]).filter(k => k !== bdo+"itemHasVolume").reduce(
            (acc,f) => ({...acc,[f]:res[e][f].map(g => ({ ...g, ...e!=bdrIRI ? {fromIRI:shortUri(e)}:{} })) }),
            {}) })
            //else
            //   return acc
            /*Object.keys(res[bdr+iri][e]).reduce((ac,f) => {
            loggergen.log("e,ac,f",e,ac,f)
            return ( { ...ac, ...res[bdr+iri][e][f] })
         },{})})*/
      },{}) }

      //loggergen.log("res:etext",res,bdrIRI,iri,params)

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

         let useIri = iri
         if(iri.startsWith("bdr:IE") && params.openEtext?.startsWith("bdr:UT")) useIri = params.openEtext
         
         if(!res[bdrIRI][bdo+"eTextHasPage"]) store.dispatch(dataActions.getChunks(useIri,next));
         else {
            res[bdrIRI][bdo+"eTextHasPage"] = []
            store.dispatch(dataActions.getPages(useIri,next,true)); 
         }
         

      }         

      //loggergen.log("res::",iri,JSON.stringify(res[Object.keys(res)[0]][skos+"prefLabel"],null,3))

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
   //loggergen.log("uSb:",params)
   store.dispatch(uiActions.updateSortBy(params.s?params.s.toLowerCase():(params.i?"year of publication reverse":(params.t==="Etext"?(!params.lg?"title":"closest matches"):(params.t==="Scan"?(route ==="latest"?"release date":"popularity"):"popularity"))),params.t))
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

   
   if(params.q == "-" && !state.data.searches["-@-"]) {
      let url = "?format=json&R_COLLECTION=bdr:PR1KDPP00", facets = {}
      if(params.f && !Array.isArray(params.f)) params.f = [ params.f ]
      if(params.f) {
         params.f.map(p => {
            let args = p.split(",")
            if(!facets[args[0]]) facets[args[0]] = []
            facets[args[0]].push(args[2])
         })
         for(let k of Object.keys(facets)) {
            let p = getQueryParam(k)
            if(p) url += "&"+p+"="+facets[k].join(",")
         }
         loggergen.log("facets:",url,params.f, facets)
         store.dispatch(dataActions.checkResults({init:true,url,route:history.location.pathname+history.location.search}))
         return
      } else {
         history.push("/guidedsearch")
         return
      }
   }
   

   if(!params.lg) params.lg = "bo-x-ewts"
   
   loggergen.log("state q",state.data,params,iri)

   let dontGetDT = false
   let pt = params.t
   if(pt && !pt.match(/,/) && ["Place", "Person","SerialWork","Work","Etext", "Topic","Role","Corporation","Lineage","Instance","Product", "Scan"].indexOf(pt) !== -1)  {

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
   let t = params.u ?? getEntiType(params.r)
   if(["Instance", "Images", "Volume", "Scan"].includes(t) || ["bdo:SerialWork"].includes(params.r) ) t = "Work"
   if(params.r === "tmp:subscriptions") t = "Product"

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
      if(state.data.searches[params.t] && state.data.searches[params.t][params.r+"@"]) { 
         store.dispatch(dataActions.foundResults(params.r,"", state.data.searches[params.t][params.r+"@"], params.t));
         if(state.data.searches[params.t][params.r+"@"].metadata) store.dispatch(dataActions.foundFacetInfo(params.r,"", [params.t],state.data.searches[params.t][params.r+"@"].metadata ));
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
   store.dispatch(dataActions.getLatestSyncsAsResults(params?.tf ? { timeframe: params?.tf } : undefined));
}
else if(staticQueries[route]?.length === 2) {   
   
   let sortBy = "popularity" 
   if(params && params.s) sortBy = params.s
   if(!params.t) {
      let {pathname,search} = history.location         
      history.replace({pathname,search:(search?"&":"")+"t="+staticQueries[route][1]})
      return
   }
   store.dispatch(uiActions.updateSortBy(sortBy,params.t))
   
   store.dispatch(dataActions.getStaticQueryAsResults(route,params.t));
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

   logError(e)
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
                  tmp+"nbTranslations", tmp+"provider", rdfs+"comment", rdf+"type", bdo+"note", bdo+"script", bdo+"partOf", bdo+"partType", bdo+"isComplete", bdo+"instanceOf", bdo+"instanceEvent", bdo+"instanceHasItem",
                  bdo+"material", bdo+"biblioNote", bdo+"sponsoshipStatement", bdo+"sponsorshipStatement", bdo+"ownershipStatement", rdfs+"seeAlso",
                  bdo+"creator", 
                  // #562 there must be something weird in the data here... but can't apply same fix as usual because it removes data (from ToL)
                  //bdo+"personGender", bdo+"personName", bdo+"personStudentOf", bdo+"personTeacherOf", tmp+"hasAdminData", owl+"sameAs"
                   ]
   let allowR = [ skos+"prefLabel", bdo+"partIndex", bdo+"volumeNumber",  tmp+"thumbnailIIIFService" ]

   for(let k of Object.keys(res)) {                  
      _res[k] = { ...res[k], ..._res[k] }
      if(_res[k][bdo+"instanceEvent"]) {
         _res[k][bdo+"instanceEvent"] = _res[k][bdo+"instanceEvent"].reduce( (acc,e) => {             
            if(res[e.value] && res[e.value][bdo+"eventWho"]?.length) {
               // DONE: must also check what's in eventWho (ok for bdr:MW23703_4150 but not bdr:MW3KG19)
               let who = res[res[e.value][bdo+"eventWho"][0].value]
               //loggergen.log("who:",who)
               if(who[rdf+"type"]?.some(t => t.value === bdo+"AgentAsCreator")) {
                  return ([...acc,...res[e.value][bdo+"eventWho"].map(f => ({fromEvent:e.value,type:'uri',value:f.value}) ) ])
               }
            }
            return ([...acc, e])
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
      logError(e)
      console.error("password link",e)
   }

}
function* watchGetResetLink() {
   yield takeLatest(
      dataActions.TYPES.getResetLink,
      (action) => getResetLink(action.payload,action.meta.user,action.meta.profile)
   );
}
/*
function turtle2jsonld( turtleString, rdfStore, uri ){
   return new Promise(resolve=>{
      rdflib.parse( turtleString, rdfStore, uri, "text/turtle", e => {
         if(e) { loggergen.log("Parse Error! "); return resolve(e) }
         rdflib.serialize(null,rdfStore, uri,'application/ld+json',(e,s)=>{
            if(e) { loggergen.log("Serialize Error! "); return resolve(e) }
            return resolve(s)
         })
      })
   })
}

function jsonld2turtle( jsonldString, rdfStore, uri ){
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
*/


  
export async function updateConfigFromProfile() {
   if(/*history.location.pathname === "/user" ||*/ store.getState().data.profile) return 
   const { userProfile, getProfile } = auth;

   const toArray = (allNodes, node) => {
      if(!node?.length) return []
      let head = allNodes[node[0]?.value], rest = []
      if(head[rdf+"rest"] && head[rdf+"rest"][0].value !== rdf + "nil") rest = toArray(allNodes, head[rdf+"rest"])
      if(head[rdf+"first"]) head = head[rdf+"first"][0].value
      //loggergen.log("n:",head, rest, head[rdf+"rest"], node[0]?.value,allNodes[node[0]?.value],allNodes)
      return [ head ].concat(rest)
   }

   const handleUser = () => {
      const state = store.getState()
      const id = state.ui.userID
      const res = state.data.resources[id][id]
      let locale = "en"
      
      if(res[bdou+"preferredUiLang"]?.length) 
         locale = res[bdou+"preferredUiLang"][0]?.value

      if(locale) locale = locale.replace(/^zh.*$/,"zh")      
      if(!state.data.config.language.menu?.includes(locale)) locale = "en" 
      const litLangs = toArray(state.data.resources[id], res[bdou+"preferredUiLiteralLangs"])
      let preset = locale, allPresets = Object.keys(state.data.config.language.data.presets).reduce( (acc,k) => { 
         let ret = k != "custom" ? state.data.config.language.data.presets[k]?.toString() : ""
         if(ret) return acc.concat(ret)
         else return acc
      }, [])      
      const litLangsStr = litLangs.toString(), isCustom = litLangsStr && litLangsStr != state.data.config.language.data.presets.custom[locale]?.toString() // longest object path ever :-)
         && !allPresets.includes(litLangsStr)
      if(litLangsStr && isCustom) { 
         preset = "custom"
         localStorage.setItem('customlangpreset', litLangs)
      } else {         
         Object.keys(state.data.config.language.data.presets).map( (k,i) => {
            if(allPresets[i] === litLangsStr) preset = k
         })
      }
      
      // keep language selector value 
      //localStorage.setItem('uilang', locale);
      //store.dispatch(i18nextChangeLanguage(locale));

      localStorage.setItem('lang', litLangs);
      
      localStorage.setItem('langpreset', preset);
      store.dispatch(uiActions.langPreset(litLangs, preset));


      loggergen.log("state:", state, res, litLangs, locale, isCustom,litLangs.toString(),state.data.config.language.data.presets[locale])
   }

   try {
      if (!userProfile) {
         getProfile(async (err, profile) => {
            await getUser(profile) 
            handleUser()        
         });
      } else {
         await getUser(userProfile)
         handleUser()        
      }
   } catch(e) {
      console.error(JSON.stringify(e))

      logError(e)
   }
}
  


async function getUser(profile)
{
   let props = store.getState()

   let userEditPolicies = props.data.userEditPolicies 
   if(!userEditPolicies) {
      userEditPolicies = await api.loadUserEditPolicies()
      store.dispatch(dataActions.gotUserEditPolicies(userEditPolicies))
   }

   let { user, etag } = await api.loadUser()
   
   loggergen.log("user:",etag, user) //,JSON.stringify(json,null,3),JSON.stringify(user,null,3), JSON.stringify(myjsonld,null,3))

   if(user) {
      
      let id = user["@id"] ;
      if(!id) id = Object.keys(user).filter(k => k.includes("user/U"))[0]
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

      store.dispatch(uiActions.gotUserID(id, etag));
      store.dispatch(dataActions.gotResource(id, user));
      loggergen.log("user!",id,profile,user)

      try {

         const name = user[id][skos+"prefLabel"] && user[id][skos+"prefLabel"][0].value || user[id][foaf+"mbox"] && user[id][foaf+"mbox"][0].value
         const email = user[id][skos+"prefLabel"] && user[id][skos+"prefLabel"][0].value || user[id][foaf+"mbox"] && user[id][foaf+"mbox"][0].value
         const token = id

         if(name && email && token) {
            window.feedbucketConfig = {
               reporter: {
                  name,
                  email,
                  token
               }
            }         
         } else {
            throw new Error("unknown:"+[name,email,token])
         }
      } catch(e){
         console.warn("could find user info for feedbucket",e)
      }
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
      logError(e)
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
      {...acc,[fullUri(e["id"])]: [ ...(Array.isArray(e["skos:prefLabel"])?e["skos:prefLabel"]:[e["skos:prefLabel"]]).map(p => ({value:p["@value"],"xml:lang":p["@language"],type:skos+"prefLabel"} )) ] }  
   ),{})

   let state = store.getState()

   let results, t = "Etext", uri = fullUri(iri), chunk
   if(state.data.searches[t] && state.data.searches[t][state.data.keyword+"@"+state.data.language]) results = state.data.searches[t][state.data.keyword+"@"+state.data.language]

   if(results) store.dispatch(dataActions.gotAssocResources(state.data.keyword, { data: dict }))

   if(results && results.results && results.results.bindings && results.results.bindings['etexts'] && results.results.bindings['etexts'][uri]) { 
      
      results.results.bindings['etexts'][uri] = results.results.bindings['etexts'][uri].concat(inInst.filter(e => results.results.bindings['etexts'][uri].filter(f => f.type === tmp+"inInstance" && f.value === fullUri(e["id"])).length === 0).map(e => ({value:fullUri(e["id"]),type:tmp+"inInstance"})))      

      chunk = results.results.bindings['etexts'][uri].filter(e => e.startChar == start && e.endChar == end)
      //loggergen.log("iIP:",inInstP,sav)
      if(chunk.length && inInstP.length) chunk[0].inPart = [...new Set(inInstP.map(e => fullUri(e["id"])))].sort()

   }

   //loggergen.log("ctx",chunk,results.results.bindings['etexts'][uri],results,inInst,inInstP,data)
   
   if(results) { 
      store.dispatch(dataActions.foundResults(state.data.keyword, state.data.language, results,["Etext"]))
   } else {
      const inP = sav.filter(e => e.seqNum !== undefined)
      const labels = sav.filter(e => inP.some(f => f["tmp:inInstancePart"] && (Array.isArray(f["tmp:inInstancePart"])?f["tmp:inInstancePart"]:[f["tmp:inInstancePart"]]).some(g => g.id === e.id)))
      loggergen.log("inPart:", iri, inP, labels)
      let data = {} 
      inP.map(e => {
         let iIp = e["tmp:inInstancePart"]
         if(iIp) {
            if(!Array.isArray(iIp)) iIp = [ iIp ] 
            data[fullUri(e.id)] = [
               ...iIp.map(i => ({ type: _tmp+"inInstancePart", value: i.id }))
            ]
         } else data[fullUri(e.id)] = []
      })
      labels.map( e => {
         let label = e["skos:prefLabel"]
         if(!Array.isArray(label)) label = [ label]
         data[fullUri(e.id)] = label.map(l =>({ 
            type:skos+"prefLabel",
            value:l["@value"],
            lang:l["@language"]
         }))
      })      
      
      store.dispatch(dataActions.gotAssocResources(iri, { data }))
      
   }
   if(state.data.keyword) store.dispatch(dataActions.gotContext(state.data.keyword+"@"+state.data.language,iri,start,end,data))
   store.dispatch(uiActions.loading(null, false));

}

export function* watchGetContext() {

   yield takeLatest(
      dataActions.TYPES.getContext,
      (action) => { 
         store.dispatch(uiActions.loading(null, true));
         getContext(action.payload,action.meta.start,action.meta.end,action.meta.nb)
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

         return ({ value:cval, lang:clang, start:e.sliceStartChar, end:e.sliceEndChar, id:fullUri(e.id)}) 
      }); //+ " ("+e.seqNum+")" }))

      //loggergen.log("dataC",iri,next,data)

      if(!useContext) store.dispatch(dataActions.gotNextChunks(iri,data,next < 0))
      else { 
         return {sav, data}
      }
      
   }
   catch(e){
      logError(e)
      console.error("ERRROR with chunks",iri,next,e)

      //store.dispatch(dataActions.chunkError(url,e,iri);
   }

}

async function getPages(iri,next) {
   
   store.dispatch(uiActions.loading("etext pages", true));

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
         let chunks = []
         
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
               acc += content["@value"].substring(start,end+1) ;
               chunks.push({"@value":content["@value"].substring(start,end+1),"@language":c.chunkContents["@language"]})
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
               end:e.sliceEndChar,
               id: fullUri(e.id),
               chunks
            }
         
      }).filter(e => e); //+ " ("+e.seqNum+")" }))

      loggergen.log("dataP",iri,next,data)

      store.dispatch(dataActions.gotNextPages(iri,data,next < 0))

   }
   catch(e){

      if(e.code == 401 || e.code == 403) {
         console.warn("etext request error",e.code)
         store.dispatch(dataActions.etextError(e.code,iri))
      } else {      
         console.error("ERRROR with pages",iri,next,e)
         logError(e)
      }
   }

   store.dispatch(uiActions.loading("etext pages", false));
}


async function createPdf(url,iri) {
   try
   {

      let nUrl = url.replace(/(pdf|zip)/,iri.file)
      //loggergen.log("creaP",url,nUrl,iri,iri.file)
      url = nUrl

      let config = store.getState()
      if(config) config = config.data
      if(config) config = config.config
      if(config) config = config.iiif
      if(config) IIIFurl = config.endpoints[config.index]
      //loggergen.log("IIIFu",IIIFurl,config)
      let checkPdf = async () => {
         let link = iri.link, data
         //loggergen.log("iri?",IIIFurl,url,iri,data)         
         if(!link) {
            try { 
               // how is pdf being downloading when polling for perdentdone???
               data = JSON.parse(await api.getURLContents((url.startsWith("/")?IIIFurl:"")+url,false,"application/json"))
               //loggergen.log("pdf:",data)
               link = data.link
            } catch(e) {
               logError(e)
               console.warn("PDF code",e.code,e)
               clearInterval(pdfCheck)
               store.dispatch(dataActions.pdfError(e.code?e.code:502,{url,iri:iri.iri}))
               return
            }
         }
         if(link && !link.match(/^(https?:)?\/\//)) link = IIIFurl+link

         //loggergen.log("link:",link)
         if(link) {
            clearInterval(pdfCheck)
            store.dispatch(dataActions.pdfReady(link,{url,iri:iri.iri}))
         } else {
            if(data && data.percentdone !== undefined) store.dispatch(dataActions.pdfNotReady("",{url,iri:iri.iri,percent:data.percentdone}))
         }

      }
      checkPdf()
      let pdfCheck = setInterval(checkPdf, 3000);

      store.dispatch(dataActions.pdfNotReady("",{url,iri:iri.iri,percent:0}))



      //window.open(IIIFurl+data.links,"pdf");

      //let fic = await api.getURLContents("//iiif.bdrc.io"+data.links);
      //loggergen.log("pdf here")
      //fileDownload("//iiif.bdrc.io"+data.links,"name.pdf") ;
      //download("//iiif.bdrc.io"+data.links);

   }
   catch(e){
      logError(e)
      console.error("ERRROR with pdf",e)

      //store.dispatch(dataActions.manifestError(url,e,iri))
   }
}

async function requestPdf(url,iri) {
   try {

      loggergen.log("reqP",url,iri)

      let data = JSON.parse(await api.getURLContents(url,false,"application/json"))
      loggergen.log("reqPdf:",url,iri,data) //,_data)

      /* // deprecated - better use original "monoVol" code

      if(data.links && typeof data.links === "string") { // download is ready
               
         let file = url.replace(/^.*?[/](zip|pdf)[/].*$/g,"$1")
         store.dispatch(dataActions.pdfVolumes(iri,[{iri,volume:0,link:url}]))
         setTimeout(() => store.dispatch(dataActions.createPdf(url.replace(/^(https?:)?[/]+[^/]+/,""),{iri,file,links:data.links})), 150)
      }
      else {
         */
         
         // volume number starting at 0 (#496)
         if(data && data.percentdone !== undefined) { // #575
            data = [ { id: iri, volume:1, link:url } ]         
         } else { 
            if(data && data.link) data = [ { id: iri, volume:1, link:url } ]         
            else data = _.sortBy(Object.keys(data).map(e => ({...data[e],volume:Number(data[e].volnum) /* +1 */,id:e})),["volume"])
         }
         store.dispatch(dataActions.pdfVolumes(iri,data))

         /*
      }
         */

   }
   catch(e){

      if(e.code == 401 || e.code == 403) {
         console.warn("PDF request error",e.code)
         store.dispatch(dataActions.pdfError(e.code,{url,iri}))
      } else {     
         logError(e) 
         console.error("ERRROR with pdf",e)
      }

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
      logError(e)
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
      logError(e)
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

async function getManifest(url,iri,thumb) {
   try {

      loggergen.log("getM:",url,iri,thumb)

      let collecManif
      let manif = await api.loadManifest(url);

      let manifests, noVol1 = false
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
            if(!collecManif) { 
               collecManif = manif.manifests[0]["@id"]
               console.log("collec?",collecManif,manif,isSingle)
               store.dispatch(dataActions.gotManifest(manif,iri,collecManif,manif.manifests.length === 1))
            }
            if(!isSingle) collecManif = null  //manif.manifests[0]["@id"]

            // missing 1st volume (#370)
            try {
               manif = await api.loadManifest(manif.manifests[0]["@id"]);
            } catch(e) {
               // only volume in collection (#383)
               if(manif.manifests.length === 1) throw e 

               // no volume 1 + no thumbnail (#525)
               if(!thumb) throw e 
            }
         }
         else { 
            //throw new Error("collection without manifest list")
            throw new ResourceNotFound('The resource does not exist.',444);
         }
      } else {
         store.dispatch(dataActions.gotManifest(manif,iri))
      }

      if(manif && manif.sequences && manif.sequences[0] && manif.sequences[0].canvases) {
         if(manif.sequences[0].canvases[0] && manif.sequences[0].canvases[0].images && manif.sequences[0].canvases[0].images[0] &&
            manif.sequences[0].canvases[0].images[0].resource && manif.sequences[0].canvases[0].images[0].resource["@id"])
         {
            let imageres = manif.sequences[0].canvases[0].images[0].resource
            
            //loggergen.log("image",imageres )

            let imageIndex = 0
            if (imageres && imageres["@id"] && imageres["@id"].match(/archivelab[.]org.*rashodgson13[$]0[/]full/)) {
               imageIndex = 1
               imageres = manif.sequences[0].canvases[imageIndex].images[0].resource
            }

            let canvasID = manif.sequences[0].canvases[imageIndex]["@id"]

            
            let image = getiiifthumbnailurl(imageres), test
            
            // #869 catch error when fetching thumbnail
            try {
               //throw new ResourceNotFound('Problem fetching the resource (code:'+500+')',500); 
               test = await api.getURLContents(image+(image.includes("bdrc.io")?"?t="+Date.now():""),null,null,null,true)
            } catch(e) {
               console.error("server error fetching thumbnail", e, image)
            }

            
            //loggergen.log("img",test)
            
            //let imgData = btoa(String.fromCharCode(...new Uint8Array(test)));
            store.dispatch(dataActions.firstImage(image,iri,canvasID,collecManif,manifests,null,manif)) //,imgData))
         }
      }
   }
   catch(e){
      logError(e)

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


function getStats(cat:string,data:{},tree:{},genres:{})
{
   let stat={}
   let config = store.getState().data.config

   let keys = []
   if(config.facets[cat])
      keys = Object.keys(config.facets[cat])

   loggergen.log("stat/keys",keys,tree,genres)
   
   if(auth && !auth.isAuthenticated()) {
      let hide = config["facets-hide-unlogged"][cat]
      //loggergen.log("hide",hide)
      if(hide && hide.length) {
         keys = keys.reduce( (acc,k) => (hide.indexOf(k)===-1?[...acc,k]:acc),[])
      }
   }
   // hide status if not admin, step 1 (#522)
   let groups
   if(auth && !auth.isAuthenticated() || auth && auth.userProfile && (groups = auth.userProfile["https://auth.bdrc.io/groups"])) {    
      let hide = config["facets-hide-notadmin"]
      //loggergen.log("hide admin",hide,groups)
      if(!groups || !groups.includes("editors")) {
         if(hide && hide.length) {
            keys = keys.reduce( (acc,k) => (hide.indexOf(k)===-1?[...acc,k]:acc),[])
         }
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
         if( /*!parents[node]["taxHasSubClass"] &&*/ parents[node].ancestor){
            treeParents[node] = []
            let root = parents[node].ancestor
            do {
               treeParents[node].push(root)
               root = parents[root]
               if(root) root = root.ancestor
            } while(root)
         }
      }

      loggergen.log("Tparents",parents,treeParents)

      if(treeParents) tree["parents"] = treeParents
   }

   let genresParents = {}
   if(genres && genres["@graph"] && genres["@graph"].length > 1) {
      parents = {}
      for(let node of genres["@graph"]) parents[node["@id"]] = node

      for(let node of Object.keys(parents)) { 
         if(parents[node]["taxHasSubClass"] && parents[node]["taxHasSubClass"].length) {
            for(let sub of parents[node]["taxHasSubClass"]) { 
               if(!parents[sub]) parents[sub] = {}
               parents[sub].ancestor = node
            }
         }
      }

      for(let node of Object.keys(parents)) { 
         if( /*!parents[node]["taxHasSubClass"] &&*/  parents[node].ancestor){
            genresParents[node] = []
            let root = parents[node].ancestor
            do {
               genresParents[node].push(root)
               root = parents[root]
               if(root) root = root.ancestor
            } while(root)
         }
      }

      //loggergen.log("Gparents",parents,genresParents)

      if(genresParents) genres["parents"] = genresParents
   }
   
   let unspecTag = "unspecified"

   for(let _p of Object.keys(data["results"]["bindings"][cat.toLowerCase()+"s"]))   
   {
      let p = data["results"]["bindings"][cat.toLowerCase()+"s"][_p]
      //loggergen.log("p",p);
      for(let f of keys)
      {
         
         //loggergen.log("f:",f);

         let genre = [bdo+"workGenre", bdo + "workIsAbout", _tmp + "etextAbout" ]
         let tmp ;
         
         if(f === "tree" || f == "genres") tmp = p.filter((e) => (genre.indexOf(e.type) !== -1))
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

            if(f === "genres" && genresParents && genresParents[t.value]) {
               for(let node of genresParents[t.value]) { 
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

function addMeta(keyword:string,language:string,data:{},t:string,tree:{},found:boolean=true,facets:boolean=true,inEtext,genres:{})
{
   loggergen.log("aM:",data,data["results"],t,inEtext)

   if(data["results"] &&  data["results"]["bindings"] && data["results"]["bindings"][t.toLowerCase()+"s"]){
      loggergen.log("FOUND",data);
      let stat = getStats(t,data,tree,genres);

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

      if(genres)
      {
         if(stat["genres"] && stat["genres"]["unspecified"]) {

            let elem = data["results"]["bindings"][t.toLowerCase()+"s"]

            //loggergen.log("elem genres",genres["@graph"][0]) ; //elem,stat)

            if(!genres["@graph"].length) genres["@graph"] = []
            //if(!genres["@graph"][0].length) genres["@graph"][0] = {}
            if(!genres["@graph"][0]["taxHasSubClass"]) genres["@graph"][0]["taxHasSubClass"] = []
            else if(!Array.isArray(genres["@graph"][0]["taxHasSubClass"])) genres["@graph"][0]["taxHasSubClass"] = [ genres["@graph"][0]["taxHasSubClass"] ]
            genres["@graph"][0]["taxHasSubClass"].push("unspecified")
            genres["@graph"].push({"@id":"unspecified","taxHasSubClass":[],"tmp:count":stat["genres"]["unspecified"].n})
         
         }
         genres["@metadata"] = stat.genres
         stat = { ...stat, genres }
      }

      loggergen.log("stat:",stat)
      if(found) store.dispatch(dataActions.foundResults(keyword, language, data, [t]));
      if(facets) store.dispatch(dataActions.foundFacetInfo(keyword,language,[t],stat))
      else return stat
   }
}

function mergeSameAs(result,withSameAs,init = true,rootRes = result, force = false, keyword, assoR = {})
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
            // #828
            if(!k.includes("purl.bdrc.io")) { 
               let same = result[t][k].filter(s => (s.type && s.type === owl+"sameAs" && s.value !== k && s.value.includes("purl.bdrc.io")) || (s.type === tmp+"relationType" && s.value === owl+"sameAs"))
               if(same.length || force) withSameAs[k] = { t, fullT, props:[ ...result[t][k] ], same:same.map(s=>s.type!==tmp+"relationType"?s.value:(sameBDRC?sameBDRC:(keyword?fullKW:"?"))) }
            }
         }
         
      }
   }

   loggergen.log("wSa",withSameAs)
   

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
            if(assoR[s]) result[r.t][s] = [ ...assoR[s] ]
            noK = true
         }
         let hasSameK 
         if(result[r.t] && result[r.t][k] && (result[r.t][s] || isRid)) {
            
            //loggergen.log("same?",isRid,k,r.t,s,result[r.t][k],result[r.t][s],assoR)

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
                  
                  
                 
                  if(!found) result[r.t][s].push({ ...v_, "fromSameAs":[ ...(v_.fromSameAs?v_.fromSameAs:[]), k ] }) //(v_.fromSameAs?v_.fromSameAs:[]).push(k) })
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
         let n = 0, score, p = results[k].length, ctx = 1
         for(let i in results[k]) {
            let v = results[k][i]
            if(v.type === bdo+"eTextIsVolume") {
               n = Number(v.value)
            } else if(v.type === bdo+"eTextInVolume") {
               n = Number(v.value)
            } else if(v.type === tmp+"matchContext" && (v.value === tmp+"nameContext" || v.value === tmp+"titleContext")) {
               ctx = 1
            }
         }
         return ({k, n, p, ctx})
      },{})
      keys = _.orderBy(keys,['ctx','n','p'],[(reverse?'asc':'desc'), (reverse?'desc':'asc'), (reverse?'asc':'desc')])

      //loggergen.log("sortK",keys)

      let sortRes = {}
      for(let k of keys) sortRes[k.k] = results[k.k]

      //loggergen.log("sortResP",reverse,sortRes)

      return sortRes
   }
   return results
}

export function sortResultsByTitle(results, userLangs, reverse) {

   if(!results) return 

   let keys = Object.keys(results)
   let langs = extendedPresets(userLangs)
   let state = store.getState(), assoR
   if(keys && keys.length) {
      let keysTitle = [], keysOther = []
      keys.map(k => {
         for(let v of results[k]) {
            if(v.type === tmp+"matchContext" && (v.value === tmp+"nameContext" || v.value === tmp+"titleContext")) {
               keysTitle.push(k)
               return
            }
         }
         keysOther.push(k)
      })
      const partSort = (partKeys) => {
         partKeys = partKeys.map(k => {
            let lang,value,labels = results[k].filter(e => e.type && e.type.endsWith("abelMatch") && results[k].some(f => f.type === skos + "prefLabel" && e.value.replace(/[↦↤]/g,"") === f.value)).map(e => ({ ...e, value:e.value.replace(/[↦↤]/g,"")})) 
            if(!labels.length) labels = results[k].filter(r => r.type && r.type === skos+"prefLabel") //r.value && r.value.match(/↦/))
            if(!labels.length && state.data.assocResources && (assoR = state.data.assocResources[state.data.keyword]) && assoR[k]) labels = assoR[k].filter(r => r.type && r.type === skos+"prefLabel") 
            //loggergen.log("labels?",labels,assoR,k,assoR[k],results[k])
            if(labels.length) { 
               labels = sortLangScriptLabels(labels,langs.flat,langs.translit, langs.flat.includes("km-x-iast"), true)
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
         let sortKeys = sortLangScriptLabels(partKeys,langs.flat,langs.translit, langs.flat.includes("km-x-iast"), true)
         if(reverse) sortKeys = sortKeys.reverse()
         //loggergen.log("keys2", sortKeys)
         return sortKeys
      }
      keysTitle = partSort(keysTitle)
      keysOther = partSort(keysOther)
      keys = [ ...keysTitle, ...keysOther ]
      let sortRes = {}
      for(let k of keys) sortRes[k.k] = results[k.k]

      //loggergen.log("sortResT",keys,sortRes)

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
         let n = 0, score, p = results[k].length, scoreDel = [],last, max = 0, ctx = 0
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
            } else if(v.type === tmp+"matchContext" && (v.value === tmp+"nameContext" || v.value === tmp+"titleContext")) {
               ctx = 1
            }
         }
         // TODO no need to keep all scores (needs to be elsewhere more generic)
         if(scoreDel.length) { 
            for(let i of scoreDel) delete results[k][i]
            results[k] = results[k].filter(e=>e)
         }
         return ({k, max, n, p, ctx})
      },{})
      keys = _.orderBy(keys,[ 'ctx', 'max', 'n','p'],[(reverse?'asc':'desc'), (reverse?'asc':'desc'), (reverse?'asc':'desc'), (reverse?'asc':'desc')])
      
      //loggergen.log("sortK:",JSON.stringify(keys,null,3))

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
         let n = 0, score, p = results[k].length, ctx = 0
         for(let i in results[k]) {
            let v = results[k][i]
            if(v.type === tmp+"entityScore") {
               n = Number(v.value)
            } else if(v.type === tmp+"matchContext" && (v.value === tmp+"nameContext" || v.value === tmp+"titleContext")) {
               ctx = 1
            }
         }
         return ({k, n, p, ctx})
      },{})
      keys = _.orderBy(keys,['ctx','n','p'],[(reverse?'asc':'desc'), (reverse?'asc':'desc'), (reverse?'asc':'desc')])
      //loggergen.log("sortK:",keys)

      let sortRes = {}
      for(let k of keys) sortRes[k.k] = results[k.k]

      //loggergen.log("sortResP",reverse,sortRes)

      return sortRes
   }
   return results
}


function sortResultsByYear(results,reverse,aux) {

   if(!results) return 

   
   if(!aux) {
      let state = store.getState()
      aux = state.data.assocResources
      if(aux) aux = aux[state.data.keyword]
   }


   let keys = Object.keys(results)
   if(keys && keys.length) {
      keys = keys.map(k => {
         let n = 1000000, score, p = results[k].length, ctx = 0
         if(reverse) n = -1000000
         let multi_n = []
         for(let i in results[k]) {
            let v = results[k][i]

            /* // not useful
            let obj
            if(v.type === bdo+"personEvent" && aux && (obj = aux[v.value]) && obj.some(o => o.type === rdf+"type" && o.value === bdo+"PersonBirth")) {
               obj = _.orderBy(obj.filter(o => o.type === bdo+"notBefore" || o.type === bdo+"notAfter" || o.type === bdo+"onYear").map(o => Number(o.value)))
               //loggergen.log("birth:",obj)
               if(obj.length) n = obj[0]
            } else  
            */
            
            if(v.type?.endsWith("BirthEvent")) {
               let ev = aux[v.value]
               if(ev?.length) ev = ev.filter(w => w.type === bdo+"eventWhen")
               if(ev?.length) {
                  let value = ev[0].value, edtfObj
                  if(value?.includes("XX?")) value = value.replace(/XX\?/,"?") // #771
                  try {
                     edtfObj = edtf(value)
                     //loggergen.log("edtfObj:",edtfObj)
                     multi_n.push(Number(edtf(edtfObj.min)?.values[0]))

                  } catch(e) {
                     console.warn("EDTF error:",e,value,edtfObj)
                  }
               }
            } else if(v.type === tmp+"yearStart") {
               multi_n.push(Number(v.value))
            } else if(v.type === tmp+"matchContext" && (v.value === tmp+"nameContext" || v.value === tmp+"titleContext")) {
               ctx = 1
            }
         }
         if(multi_n.length) { 
            multi_n = _.orderBy(multi_n, [reverse?'desc':'asc'])
            n = multi_n[0]
         }
         return ({k, n, p, ctx})
      },{})
      keys = _.orderBy(keys,['ctx','n','p'],[(reverse?'desc':'desc'), (reverse?'desc':'asc'), (reverse?'asc':'desc')])
      
      loggergen.log("keysY:",keys)

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
         let n = "9999-99-99T99:99:99.999Z", score, p = results[k].length, ctx = 0
         if(reverse) n = "0000-00-00T00:00:00.000Z"
         for(let i in results[k]) {
            let v = results[k][i]
            if(v.type === tmp+"lastSync") {
               n = v.value
            } else if(v.type === tmp+"matchContext" && (v.value === tmp+"nameContext" || v.value === tmp+"titleContext")) {
               ctx = 1
            }
         }
         return ({k, n, p, ctx})
      },{})
      keys = _.orderBy(keys,['ctx','n','p'],[(reverse?'asc':'desc'), (reverse?'asc':'desc'), (reverse?'desc':'asc')])
      
      //loggergen.log("keysY:",keys)

      let sortRes = {}
      for(let k of keys) sortRes[k.k] = results[k.k]

      //loggergen.log("sortResY",sortRes)

      return sortRes
   }
   return results
}


function sortResultsByQuality(results,reverse) {

   if(!results) return 

   let keys = Object.keys(results)
   if(keys && keys.length) {
      keys = keys.map(k => {
         let n = 0, score, p = results[k].length
         if(reverse) n = 1
         for(let i in results[k]) {
            let v = results[k][i]
            if(v.type === tmp+"OCRscore") {               
               n = Number(v.value)
            } 
            loggergen.log(k,n,v)
         }
         return ({k, n})
      },{})
      keys = _.orderBy(keys,['n','p'],[(reverse?'asc':'desc'), (reverse?'asc':'desc')])
      
      loggergen.log("keysY:",keys)

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
         let n = 0, score, p = results[k].length, max = 0, ctx = 0
         for(let i in results[k]) {
            let v = results[k][i]
            if(v.type === tmp+"nbChunks") {
               n = Number(v.value)
            }
            else if(v.type === tmp+"maxScore") {
               max = Number(v.value)
            } else if(v.type === tmp+"matchContext" && (v.value === tmp+"nameContext" || v.value === tmp+"titleContext")) {
               ctx = 1
            }
         }
         return ({k, n, max, p, ctx})
      },{})
      keys = _.orderBy(keys,['ctx','n','max','p'],[(reverse?'asc':'desc'), (reverse?'asc':'desc'), (reverse?'asc':'desc'), (reverse?'asc':'desc')])
      
      //loggergen.log("sortK:",JSON.stringify(keys,null,3))

      let sortRes = {}
      for(let k of keys) sortRes[k.k] = results[k.k]

      loggergen.log("sortResNb",reverse,sortRes)

      return sortRes
   }
   return results
}

function rewriteAuxMain(result,keyword,datatype,sortBy,language)
{

   subtime("rewriteAuxMain",0)

   let asset = [  _tmp+"possibleAccess", _tmp+"hasOpen", _tmp+"hasEtext", _tmp+"hasImage", _tmp+"catalogOnly"]
   let state = store.getState()
   let langPreset = state.ui.langPreset
   if(!sortBy) sortBy = state.ui.sortBy
   let reverse = sortBy && sortBy.endsWith("reverse")
   let canPopuSort = false, isScan, isTypeScan = datatype.includes("Scan"), isTypeVersion = datatype.includes("Instance"), inRoot, partType, context, unreleased, hasExactM, isExactM, hasM, inDLD
   let _kw = keyword.replace(/^"|"(~1)?$/g,"").replace(/[“”]/g,'"').replace(/[`‘’]/g,"'") // normalize quotes in user input      
   let inCollec

   // DONE case of tibetan unicode vs wylie
   let flags = "iu"   
   // #741 first quickfix
   if(!keyword.includes(" AND ")){ 
      if(language === "bo") { 
         let translit = getMainLabel([ { lang: language, value: _kw } ], extendedPresets([ "bo-x-ewts" ]))
         _kw = "(("+_kw.replace(/([\{\}\[\]()|])/g,"\\$1")+")|("+translit?.value?.replace(/([\{\}|()\[\]])/g,"\\$1").replace(/[_ ]/g,"[_ ]").replace(/\[_ \]$/,"[_ ]?")+(translit?.value?.endsWith("/")?"?":"/?") +"))"  // #756
         flags = "u" // case sensitive in Tibetan/Wylie
      } else if(language === "bo-x-ewts") { 
         let translit = getMainLabel([ { lang: language, value: _kw } ], extendedPresets([ "bo" ]))
         _kw = "(("+_kw.replace(/([\{\}\[\]()|])/g,"\\$1").replace(/[_ ]/g,"[_ ]")+(_kw.endsWith("/")?"?":"/?")+")|("+translit?.value.replace(/([\{\}|()\[\]])/g,"\\$1")+"))"  // #756     
         flags = "u" // case sensitive in Tibetan/Wylie
      } else {
         _kw = _kw.replace(/([\{\}\[\]()|])/g,"\\$1") // #756
      }
   }
   
   //loggergen.log("_kw:",_kw,keyword,window.DLD)
   let _kwRegExpFullM = new RegExp("^↦.*?"+_kw+".*?↤/?$", flags), _kwRegExpM = new RegExp("↦.*?"+_kw+".*?↤", flags)

   let mergeLeporello = state.data.config.khmerServer
   
   let OCRquality

   result = Object.keys(result).reduce((acc,e)=>{
      if(e === "main") {

         let keys = Object.keys(result[e])
         if(keys) {
            //const dataVar = keys.reduce( (acc,k) => ({...acc, [k]: result[e][k].filter(e => e.type === skos+"altLabel" || e.type === skos+"prefLabel") }),{})  // > 4sec!
            let dataVar = {} 
            for(let k of keys) { 
              dataVar[k] = result[e][k].filter(e => [bdo+"inRootInstance",tmp+"provider",tmp+"thumbnailIIIFService",skos+"altLabel",skos+"prefLabel"].includes(e.type))  // < 0.05sec!
            }
            store.dispatch(dataActions.gotAssocResources(keyword,{ data: dataVar  }))
         }
         let t = datatype[0].toLowerCase()+"s"

         let subscribedCollec = state.data.subscribedCollections

         canPopuSort = false 
         //let dataWithAsset = keys.reduce( (acc,k) => { // > 4sec!
         let dataWithAsset = {}
         for(let k of keys) { // < 0.05sec!

            isScan = false       
            inRoot = false
            partType = ""
            context = []
            unreleased = false
            hasExactM = false
            isExactM = false
            hasM = false
            inDLD = false
            inCollec = false

            if(auth && !auth.isAuthenticated() || !isGroup(auth, "editors")) {	
               let status = result[e][k].filter(k => k.type === adm+"status" || k.type === tmp+"status")	
               if(status && status.length) status = status[0].value	
               else status = null	

               if(status && !status.match(/Released/)) 	
                  continue; //return acc ;	

            }            
               
            let toAdd = [],  res = result[e][k].map(e => { 
               if(subscribedCollec && e.type === bdo+"inCollection"){                  
                  if(subscribedCollec.includes(e.value)) inCollec = true
               } else if(e.type === _tmp+"OCRscore"){                  
                  if(e.value === "1.0") {
                     toAdd.push({type:_tmp+"quality", value: _tmp+"ComputerInputOCR"})
                  } else if(e.value === "0.99") {
                     toAdd.push({type:_tmp+"quality", value: _tmp+"CleanedOCR"})
                  } else {
                     toAdd.push({type:_tmp+"quality", value: _tmp+"RawOCR"})
                  }

               } else if(mergeLeporello && e.type === bdo+"binding") {
                  return({type:bdo+"format", value:e.value})
               } else if(e.type === bdo+"isComplete" && e.value=="true") {
                  return ({type:_tmp+"completion", value:_tmp+"complete"})
               } else if(asset.includes(e.type) && e.value == "true") {
                  if(isTypeScan && e.type === _tmp+"hasImage") isScan = true ; 
                  return ({type:_tmp+"assetAvailability",value:e.type})
               } else if(e.type === bdo+"inRootInstance") {
                  inRoot = true
                  if(window.DLD) {
                     let qn = e.value.replace(/.*?[/]M([^/]+)$/,"$1")
                     if(window.DLD && window.DLD[qn]) {
                        inDLD = true
                     }
                  }
               } else if(e.type === bdo+"instanceHasReproduction") {
                  let qn = e.value.replace(/.*?[/]([^/]+)$/,"$1")
                  if(window.DLD && window.DLD[qn]) {
                     inDLD = true
                  }
               } else if(e.type === bdo+"partType") {
                  partType = e.value
               } else if(e.value && e.value.match && e.value.match(/[↦↤]/)) {                  

                  e.value = e.value.replace(/↤\/_↦/g,"/_")

                  if([_tmp+"nameMatch",_tmp+"labelMatch"].includes(e.type)) {
                     if(["works","instances","scans","etexts"].includes(t)) {
                        if(!context.includes(_tmp+"titleContext")) context.push(_tmp+"titleContext")
                     } else {
                        if(!context.includes(_tmp+"nameContext")) context.push(_tmp+"nameContext")
                     }
                  } else {
                     if(!context.includes(e.type)) context.push(e.type)
                  } 

                  hasM = true

                  // #741 first quickfix
                  if(!keyword.includes(" AND ")){
                     // #718 check if match is full/exact
                     if(e.value.match(_kwRegExpM)) {                                          
                        //loggergen.log("exact:",e)
                        hasExactM = true
                        if(e.value.match(_kwRegExpFullM)) {
                           //loggergen.log("full exact")
                           isExactM = true
                        } 
                     } else {
                        //loggergen.log("exact?",e,_kw)
                     }
                  }

               } else if(e.type === _tmp+"status" && e.value) {
                  if(!e.value.match(/Released/)) { 
                     unreleased = true
                  }
               }

               return e
            } )

            res = res.concat(toAdd)

            if(isTypeScan && window.DLD) {
               let qn = k.replace(/.*?[/]([^/]+)$/,"$1")
               loggergen.log("qn:",isTypeScan,qn,window.DLD[qn])
               if(window.DLD && window.DLD[qn]) {
                  inDLD = true
               }
            } 

            if(t === "instances") {
               if(!inRoot) res.push({type:_tmp+"versionType", value:_tmp+"standalone"})
               else { 
                  res.push({type:_tmp+"versionType", value:_tmp+"partOfVersion"})
                  if(partType) res.push({type:_tmp+"versionType", value:partType})
               }
            }

            for(let ctx of context){
               res.push({ type:_tmp+"matchContext", value: ctx})
            }

            if(inCollec) {
               res.push({ type:bdo+"inCollection", value: _tmp + "subscribed"})
            }

            if(unreleased) {
               res.push({type:_tmp+"nonReleasedItems", value:_tmp+"show"})
            }

            if(inDLD) {
               res.push({type:_tmp+"inDLD", value:_tmp+"available"})
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
                              //.replace(/(↤([་ ]*[^་ ↦↤]+[་ ]){5})[^↦↤]*(([་ ][^་ ↦↤]+[་ ]*){5}↦)/g,"$1 (…) $3")
                              //.replace(/^[^↦↤]*(([་ ][^་ ↦↤]+[་ ]*){5}↦)/,"(…) $1")
                              //.replace(/(↤([་ ]*[^་ ↦↤]+[་ ]){5})[^↦↤]*$/g,"$1 (…)") 
                              }
                  
                  //loggergen.log("full",content.value)
                  //loggergen.log("expand",expand.value)

                  // #741 first quickfix
                  if(!keyword.includes(" AND ")){
                     // #718 check if match is exact
                     if(content?.value && content.value.match &&  content.value.match(/[↦↤]/)) {
                        hasM = true   
                        content.value = content.value.replace(/↤\/_↦/g,"/ ")
                        if(content.value.match(_kwRegExpM)) {                                          
                           //loggergen.log("exact:",e)
                           hasExactM = true
                        }
                     }
                  }

                  return { e, n, m, p, content, expand }
               })
               chunks = _.orderBy(chunks, ['n','m'], ['desc','asc'])
               //loggergen.log("chunks",chunks)


               res = [ ...res.filter(e => e.type !== bdo+"eTextHasChunk"), { ...chunks[0].content, type:tmp+"bestMatch", startChar:chunks[0].m, endChar:chunks[0].p, 
                        ...(chunks[0].expand?{expand:chunks[0].expand}:{})} ]

               if(chunks.length > 1) res = res.concat(chunks.slice(1).map(e => ({...e.e, expand:e.expand, startChar:e.m, endChar:e.p})))
            }

            if(hasM) {
               if(hasExactM) res.push({type:_tmp+"hasMatch", value:_tmp+"hasExactMatch"})
               if(isExactM) res.push({type:_tmp+"hasMatch", value:_tmp+"isExactMatch"})
            }



            
            //if(isTypeScan && !isScan) return ({...acc})
            //else 

            
            // return ({...acc, [k]:res})
            dataWithAsset[k] = res

         //},{})
         }
        
         //loggergen.log("dWa:",language,t,dataWithAsset,sortBy,reverse,canPopuSort)

         if(!canPopuSort && sortBy.startsWith("popularity")) {            
            let {pathname,search} = history.location         
            history.push({pathname,search:search.replace(/(([&?])s=[^&]+)/g,"$2")+(!search.match(/[?&]s=/)?"&":"")+"s="+(sortBy=(language?"closest matches":"title")+" forced")})   
         }

         if(language !== undefined) { 
            dataWithAsset = mergeSameAs({[t]:dataWithAsset},{},true,{},true,!language?keyword:null,result["aux"])
            dataWithAsset = dataWithAsset[t]
         }

         if(!sortBy || sortBy.startsWith("popularity")) return { ...acc, [t]: sortResultsByPopularity(dataWithAsset,reverse) }
         else if(sortBy.startsWith("year of")) return { ...acc, [t]: sortResultsByYear(dataWithAsset,reverse,result.aux) }
         else if(sortBy.startsWith("closest matches")) return { ...acc, [t]: sortResultsByRelevance(dataWithAsset,reverse) }
         else if(sortBy.startsWith("number of matching chunks")) return { ...acc, [t]: sortResultsByNbChunks(dataWithAsset,reverse) }
         else if(sortBy.startsWith("volume number")) return { ...acc, [t]: sortResultsByVolumeNb(dataWithAsset,reverse) }
         else if(sortBy.includes("title") ||  sortBy.includes("name") ) return { ...acc, [t]: sortResultsByTitle(dataWithAsset, langPreset, reverse) }
         else if(sortBy.includes("date")) return { ...acc, [t]: sortResultsByLastSync(dataWithAsset,reverse) }
         else if(sortBy.includes("accuracy")) return { ...acc, [t]: sortResultsByQuality(dataWithAsset,reverse) }
      }
      else if(e === "aux") {                  
         store.dispatch(dataActions.gotAssocResources(keyword,{ data: result[e] } ) )
      }
      else if(e === "facets") {
         let cat = "http://purl.bdrc.io/resource/O9TAXTBRC201605", root, tree, genres
         if(result[e].topics && !result[e].topics[cat]) cat = "http://purl.bdrc.io/resource/FEMCScheme"
         if(result[e].topics && result[e].topics[cat]) {
            root = result[e].topics[cat]
            tree = [ { "@id": cat, taxHasSubClass: root.subclasses }, ...Object.keys(result[e].topics).reduce( (acc,k) =>  { 
               let elem = result[e].topics[k] 
               return ([ ...acc, { "@id":k, taxHasSubClass: elem.subclasses, "skos:prefLabel": elem["skos:prefLabel"], "tmp:count":elem["count"] } ])
            }, []) ]            
         }
         cat = "http://purl.bdrc.io/resource/O3JW5309"
         if(result[e].genres && result[e].genres[cat]) {
            root = result[e].genres[cat]
            genres = [ { "@id": cat, taxHasSubClass: root.subclasses }, ...Object.keys(result[e].genres).reduce( (acc,k) =>  { 
               let elem = result[e].genres[k] 
               return ([ ...acc, { "@id":k, taxHasSubClass: elem.subclasses, "skos:prefLabel": elem["skos:prefLabel"], "tmp:count":elem["count"] } ])
            }, []) ]
            let aux 
            Object.keys(result[e].genres).map( k => {               
               let labels = result[e].genres[k]["skos:prefLabel"]
               if(labels){
                  if(!Array.isArray(labels)) labels = [ labels ]
                  if(!aux) aux = {}
                  aux[k] = labels.map(l => ({ type: skos+"prefLabel", value:l["@value"], "xml:lang":l["@language"]}))
               }
            })
            if(aux) store.dispatch(dataActions.gotAssocResources(keyword,{ data: aux }))
         }
         return { ...acc, ...(tree?{["tree"]: { "@graph" : tree  } }:{}), ...(genres?{["genres"]: { "@graph" : genres  } }:{}) }
      }
      else return acc
   }, {})

   subtime("rewriteAuxMain")

   return result
}


async function startSearch(keyword,language,datatype,sourcetype,dontGetDT,inEtext) {

   const time = Date.now()
   let last = Date.now(), subtimes = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]              
   const subT = (n) => {
      subtimes[n] += Date.now() - last
      loggergen.log("subT["+n+"]:",subtimes[n])
      last = Date.now()
   }
      
   subtime("startSearch",0)

   loggergen.log("sSsearch",keyword,language,datatype,sourcetype,inEtext);

   // why is this action dispatched twice ???
   store.dispatch(uiActions.loading(keyword, true));
   if(!datatype || datatype.indexOf("Any") !== -1) {
      store.dispatch(dataActions.getDatatypes());
   }
   try {
      let result ;

      subtime("getResults",0)

      if(!sourcetype)
      result = await api.getStartResults(keyword,language,datatype,inEtext);
      else
      result = await api.getAssocResults(keyword,sourcetype,datatype[0]);

      subtime("getResults")


      subT(0)

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

      subT(1)


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


   subT(2)


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


      subT(3)

      loggergen.log("data",data,result)

      let metaD = {}
      data = getData(data,metadata,metaD);
      store.dispatch(dataActions.foundResults(keyword, language, data, datatype));


      subT(4)


      subtime("getDatatypes",0)
      metadata = await api.getDatatypesOnly(keyword, language);
      subtime("getDatatypes")


      subT(5)

      let sorted = Object.keys(metadata).map(m => ({m,k:Number(metadata[m])}))
      metadata = _.orderBy(sorted,["k"],["desc"]).reduce( (acc,m) => ({...acc,[m.m]:metadata[m.m]}),{})
      store.dispatch(dataActions.foundDatatypes(keyword,language,{ metadata, hash:true}));


      subT(6)

      let newMeta = {}

      if(["Etext","Work","Instance","Scan"].includes(datatype[0]) && result.genres && result.tree) addMeta(keyword,language,data,datatype[0],result.tree,undefined,undefined,undefined,result.genres);      
      else addMeta(keyword,language,data,datatype[0]);      

      /* // deprecated
      addMeta(keyword,language,data,"Person");      
      addMeta(keyword,language,data,"Work",result.tree);
      addMeta(keyword,language,data,"Lineage");
      addMeta(keyword,language,data,"Place");
      */

      subT(7)

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

         metadata = { ...metadata, tree:result.tree, genres:result.genres}

         let dt = "Etext" ;
         if(datatype.indexOf("Work") !== -1 ) { dt="Work" ; addMeta(keyword,language,data,"Work",result.tree,false,undefined,undefined,result.genres); }
         else if(datatype.indexOf("Instance") !== -1 ) { dt="Instance" ; addMeta(keyword,language,data,"Instance",result.tree,false,undefined,undefined,result.genres); }
         else if(datatype.indexOf("Scan") !== -1 ) { dt="Scan" ; addMeta(keyword,language,data,"Scan",result.tree,false,undefined,undefined,result.genres); }
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


subT(8)

store.dispatch(uiActions.loading(keyword, false));

// store.dispatch(dataActions.foundDatatypes(keyword, JSON.parse(result.metadata).results));
//store.dispatch(dataActions.foundResults(keyword, language,result));
//yield put(uiActions.showResults(keyword, language));

} catch(e) {
   logError(e)

   console.error("startSearch failed",e);

   store.dispatch(dataActions.searchFailed(keyword, e.message, language));
   store.dispatch(uiActions.loading(keyword, false));
}

subT(9)
loggergen.log("subT:",subtimes)
subtime("startSearch")

}


export function* watchCheckResults() {
      yield takeLatest(
         dataActions.TYPES.checkResults,
         (action) => checkResults(action.payload, action.meta.route)
      );
}


async function checkResults(params, route) {
   
   loggergen.log("ckR params:",params,route)   

   if(!params || params.count || params.init && params.route && !params.url) return

   let count 
   if(!params.init) count = await api.loadCheckResults(params);
   if(params.init || count?.results?.bindings?.length && (count = count.results.bindings[0].c?.value) !== undefined) {      
      let loading = params.init || count != 0 && count < GUIDED_LIMIT
      
      // DONE check if cancelled

      if(!params.init) { 
         if(store.getState().data.checkResults !== false) {
            store.dispatch(dataActions.checkResults({count,loading}));
         }
      }

      if(loading) {
         store.dispatch(uiActions.loading("-@-", true))

         if(store.getState().data.checkResults !== false) {
            let results = await api.loadResultsWithFacets(params.url?params.url:params)

            let numResults = Object.keys(results.main)
            if(numResults.length) numResults = numResults.length

            let sortBy = "popularity"
            results = rewriteAuxMain(results,"-",["Instance"],sortBy)

            if(store.getState().data.checkResults !== false) {
               let metadata = addMeta("-","-",{results:{bindings:results} }, "Instance", results.tree, false, false)      
               store.dispatch(dataActions.foundResults("-","-", { metadata, numResults, results:{bindings:results}},["Instance"]))         
               store.dispatch(dataActions.foundResults("-","-", { results: { bindings: { } } } ) ) 
               store.dispatch(dataActions.foundDatatypes("-","-",{ metadata:{[bdo+"Instance"]:numResults}, hash:true}));
            }

            if(!params.init && store.getState().data.checkResults !== false) {
               store.dispatch(dataActions.checkResults({count, loading:false, route: route+"&q=-&lg=-"}));                     
               if(route) history.push(route+"&q=-&lg=-")
            } else {
               if(params.init) store.dispatch(dataActions.checkResults({init:true, route:params.route}));         
               else store.dispatch(dataActions.checkResults(false));         
            }
         }

         store.dispatch(uiActions.loading("-@-",false))
      }
   } else {
      store.dispatch(dataActions.checkResults(false));
   }
}



export function* watchGetAssocTypes() {

   yield takeLatest(
      dataActions.TYPES.getAssocTypes,
      (action) => getAssocTypes(action.payload, action.meta)
   );
}


async function getAssocTypes(rid, tag) {

   store.dispatch(uiActions.loading("assocTypes", true));

   //store.dispatch(dataActions.getDatatypes(rid,""))
   let metadata = await api.getDatatypesOnly(rid, "");
   let sorted = Object.keys(metadata).map(m => ({m,k:Number(metadata[m])}))
   metadata = _.orderBy(sorted,["k"],["desc"]).reduce( (acc,m) => ({...acc,[m.m]:metadata[m.m]}),{})
   store.dispatch(dataActions.foundDatatypes(rid,"",{ metadata, hash:true}, tag));

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
   else if(i.includes("accuracy")) data.results.bindings[t.toLowerCase()+"s"] = sortResultsByQuality(data.results.bindings[t.toLowerCase()+"s"], reverse) 
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

      store.dispatch(dataActions.foundDatatypes(uri,"",{ metadata:{[bdo+"Instance"]:numResults}, hash:true}));

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




async function getReproductions(uri,init=false) {

   store.dispatch(uiActions.loading(uri, true));
   let state = store.getState()

   let keyword = store.getState().data.keyword
   
   let results = await api.getReproductions(uri);
   loggergen.log("repro:",results)

   let sortBy = "year of publication reverse" 

   results = rewriteAuxMain(results,keyword,["Instance"],sortBy)

   store.dispatch(dataActions.gotReproductions(uri,results.instances))

   store.dispatch(uiActions.loading(uri, false));
}

export function* watchGetReproductions() {

   yield takeLatest(
      dataActions.TYPES.getReproductions,
      (action) => getReproductions(action.payload,action.meta)
   );
}



async function getResultsByDateOrId(date, t, dateOrId) {

   let state = store.getState(), res, data


   store.dispatch(uiActions.loading(null, true));

   // DONE fix using already loaded data
   if(state.data.searches && state.data.searches[t] && state.data.searches[t][date+"@"+ dateOrId] && state.data.searches[t][date+"@"+ dateOrId].numResults){

      //loggergen.log("deja:",JSON.stringify(state.data.searches[t][date+"@date"], null, 3 ))

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


async function getMonlamResults(params){
   //loggergen.log("go:",params)
   
   try {
      const res = await api.loadMonlamResults(params)
      store.dispatch(dataActions.gotMonlamResults(res))
      //loggergen.log("monlam?",res)
   } catch(e) {
      store.dispatch(dataActions.gotMonlamResults([]))
   }

}

export function* watchGetMonlamResults() {

   yield takeLatest(
      dataActions.TYPES.getMonlamResults,
      (action) => getMonlamResults(action.payload)
   );
}

export function* watchGetResultsById() {

   yield takeLatest(
      dataActions.TYPES.getResultsById,
      (action) => getResultsByDateOrId(action.payload, action.meta, "id")
   );
}

async function getStaticQueryAsResults(route, datatype) {

   store.dispatch(uiActions.loading(null, true));

   let res
   try {
      res = await api.loadStaticQueryAsResults(route)
   } catch(e) {
      logError(e)
      store.dispatch(dataActions.searchFailed(route, e.message, "en"));
      store.dispatch(uiActions.loading(null, false));   
      return
   }

   route = "("+route+")"
      
   res = rewriteAuxMain(res,route,[datatype])

   let data = getData(res)

   loggergen.log("static:"+route,datatype,res,data)
   
   store.dispatch(dataActions.foundResults(route, "-", { results: {bindings: {} } } ) ); // needed to initialize ("Any" / legacy code)

   store.dispatch(dataActions.foundResults(route, "-", data, [datatype]));

   store.dispatch(dataActions.foundDatatypes(route,"-",{ metadata:{[bdo+datatype]:data.numResults}, hash:true}));

   addMeta(route,"-",data,datatype,null,false); 

   store.dispatch(uiActions.loading(null, false));

   
}

export function* watchGetStaticQueryAsResults() {

   yield takeLatest(
      dataActions.TYPES.getStaticQueryAsResults,
      (action) => getStaticQueryAsResults(action.payload, action.meta)
   );
}



async function getLatestSyncsAsResults(meta) {

   let state = store.getState()
   let sortBy = state.ui.sortBy
   if(!sortBy) sortBy = "release date"

   store.dispatch(uiActions.loading(null, true));

   let res = await api.loadLatestSyncsAsResults(meta)
      
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
      (action) => getLatestSyncsAsResults(action.meta)
   );
}



async function getLatestSyncs(meta) {

   let res = await api.loadLatestSyncs(meta) 
   
   let nb = res[tmp+"totalRes"]
   if(nb) nb = nb[tmp+"totalSyncs"]
   if(nb && nb.length) nb = nb[0].value 

   let keys = _.orderBy(Object.keys(res).filter(k => k !== tmp+"totalRes").map(k => ({id:k,t:res[k][tmp+"datesync"][0].value})), "t", "desc")

   let sorted = {}
   keys.map(k => { sorted[k.id] = res[k.id]; })
      
   loggergen.log("syncs",res,sorted,nb,meta)

   store.dispatch(dataActions.gotLatestSyncs(sorted,{nb,...meta??{}}))

}


export function* watchGetLatestSyncs() {

   yield takeLatest(
      dataActions.TYPES.getLatestSyncs,
      (action) => getLatestSyncs(action.meta)
   );
}

async function getOutline(iri,node?,volFromUri?) {

   store.dispatch(uiActions.loading(iri, "outline"));
   let res = await api.loadOutline(iri,node,volFromUri) 

   //loggergen.log("gotO:",iri,JSON.stringify(res,null,3),node,volFromUri)
   
   if(res && res["@graph"] && Array.isArray(res["@graph"])) res["@graph"] = res["@graph"].map(r => { 
      if(r.hasPart) {
         if(!Array.isArray(r.hasPart)) r.hasPart = [ r.hasPart ]
         r.hasPart = r.hasPart.filter(h => !res["@graph"].some(n => n.id === h && n.partType == "bdr:PartTypeCodicologicalVolume" ))
         if(!r.hasPart?.length) delete r.hasPart
      }
      return r
   }).filter(n => n && !(n.partType === "bdr:PartTypeCodicologicalVolume"))

   if(res && res["@graph"] && volFromUri) res["@graph"].map(r => { 

      // patch main node
      if(r.id == volFromUri
         && r.hasPart && r.hasPart !== iri && !r.hasPart.includes(iri) // quickfix for loop/crash in bdr:MW12827
      ) { 

         // patching the patch :-)
         if(iri === "tmp:uri" && r["tmp:firstImageGroup"] && r["tmp:firstImageGroup"]["id"]) {
            iri = r["tmp:firstImageGroup"]["id"]+";"+volFromUri
         }

         // keep only parts that are in current volume data
         if(r.hasPart) {
            if(!Array.isArray(r.hasPart)) r.hasPart = [ r.hasPart ]
            r.hasPart = r.hasPart.filter(h => res["@graph"].some(n => n.id === h && !iri.endsWith(n.id))) // #759 prevent infinite loop
         }

         r.id = iri
         if(r["skos:prefLabel"]) delete r["skos:prefLabel"]
      }
      //loggergen.log("foundem?",r,volFromUri)
   })
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
      (action) => getOutline(action.payload, action.meta.node?action.meta.node:undefined,action.meta.volFromUri?action.meta.volFromUri:undefined)
   );
}



async function getCitationStyle(s) {

   store.dispatch(uiActions.loading(s, "citation"));
   let res = await api.loadCitationStyle(s) 
   store.dispatch(uiActions.loading(s, false));
   
   //loggergen.log("citaSty:",s,res)

   store.dispatch(dataActions.gotCitationStyle(s,res))

}

async function getCitationLocale(lg) {

   store.dispatch(uiActions.loading(lg, "citation"));
   let res = await api.loadCitationLocale(lg) 
   store.dispatch(uiActions.loading(lg, false));
   
   //loggergen.log("citaLg:",lg,res)

   store.dispatch(dataActions.gotCitationLocale(lg,res))

}

async function getCitationData(id) {

   store.dispatch(uiActions.loading(id, "citation"));
   try {
      let res = await api.loadCitationData(id) 
      store.dispatch(uiActions.loading(id, false));
      
      loggergen.log("citaData:",id,res)

      store.dispatch(dataActions.gotCitationData(id,JSON.parse(res)))
   } catch(e) {
      logError(e)
      store.dispatch(uiActions.loading(id, false));
   }

}

export function* watchGetCitationStyle() {

   yield takeLatest(
      dataActions.TYPES.getCitationStyle,
      (action) => getCitationStyle(action.payload)
   );
}

export function* watchGetCitationLocale() {

   yield takeLatest(
      dataActions.TYPES.getCitationLocale,
      (action) => getCitationLocale(action.payload)
   );
}

export function* watchGetCitationData() {

   yield takeLatest(
      dataActions.TYPES.getCitationData,
      (action) => getCitationData(action.payload)
   );
}

async function outlineSearch(iri,kw,lg) {

   store.dispatch(uiActions.loading(iri, "outline"));
   
   let res = await api.outlineSearch(iri,kw,lg)

   store.dispatch(uiActions.loading(iri, false));
   
   loggergen.log("oSearch:",iri,kw,lg,res)
      
   let matches = [], volid, volnum = 1, newVol = {}
   if(res && res["@graph"] && res["@graph"].length) for(let n of res["@graph"]) {
      if(n["tmp:titleMatch"] || n["tmp:labelMatch"]|| n["tmp:colophonMatch"]) matches.push(n)
   }
   
   //loggergen.log("matches:",JSON.stringify(matches,null,3))

   for(let m of matches) {
      let loca 
      if(m.contentLocation) {
         loca = res["@graph"].filter(r => r.id === m.contentLocation)
         if(loca.length && loca[0].contentLocationVolume) volnum = loca[0].contentLocationVolume
      }
      let p = m.partOf
      let p_node = res["@graph"].filter(r => r.id === p)
      while(p) {
         if(p_node[0]["tmp:hasNonVolumeParts"] && p_node[0]["partType"] === "bdr:PartTypeSection" || p_node[0].id === iri) {
            volid = "bdr:I0000"+volnum+";"+p_node[0].id
            //loggergen.log("gotcha:",p_node)

            if(!p_node[0].hasPartSav) { 
               p_node[0].hasPartSav = p_node[0].hasPart               
               p_node[0].hasPart = []
            }
            if(!p_node[0].hasPart.includes(volid)) p_node[0].hasPart.push(volid)

            if(!newVol[volid]) { 
               newVol[volid] = {id:volid, hasPart:m.id, volumeNumber:volnum, partType:"bdr:PartTypeVolume", "tmp:hasNonVolumeParts": true } //, contentLocation:"bdr:WL0000_"+volid}
               //loggergen.log("newV1:",volid,newVol[volid])
            } else {
               if(!Array.isArray(newVol[volid].hasPart)) newVol[volid].hasPart = [ newVol[volid].hasPart ]
               newVol[volid].hasPart.push(m.id)
               //loggergen.log("newV2:",volid,newVol[volid])
            }
         }
         p = p_node[0].partOf
         if(p) p_node = res["@graph"].filter(r => r.id === p)
      }
   }
   if(res["@graph"]) res["@graph"] = res["@graph"].concat(Object.values(newVol))

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
      logError(e)
      store.dispatch(dataActions.searchFailed(keyword, e.message, language));
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
      logError(e)
      store.dispatch(dataActions.searchFailed(keyword, e.message, language));
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
      logError(e)
      store.dispatch(dataActions.searchFailed(keyword, e.message, language));
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
      logError(e)
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
      logError(e)
      store.dispatch(dataActions.searchFailed(keyword, e.message, language));
   }

}

async function getSubscribedCollections() {

   //loggergen.log("go getSC")

   try {
      let res = await api.loadSubscribedCollections()      
      res = Object.keys(res.main) 

      /*
      // debug 
      if(!res?.length) {
         res = [
            "http://purl-1bdrc-1io-1e7aa8f3q09da.erf.sbb.spk-berlin.de/resource/PRHD03",
            "http://purl-1bdrc-1io-1e7aa8f3q09da.erf.sbb.spk-berlin.de/resource/PR01CTC09",
            "http://purl-1bdrc-1io-1e7aa8f3q09da.erf.sbb.spk-berlin.de/resource/PRHD02",
            "http://purl-1bdrc-1io-1e7aa8f3q09da.erf.sbb.spk-berlin.de/resource/PRHD01",
            "http://purl-1bdrc-1io-1e7aa8f3q09da.erf.sbb.spk-berlin.de/resource/PR01JW11672",
            "http://purl-1bdrc-1io-1e7aa8f3q09da.erf.sbb.spk-berlin.de/resource/PR00JW501092",
            "http://purl-1bdrc-1io-1e7aa8f3q09da.erf.sbb.spk-berlin.de/resource/PR60CTX96",
            "http://purl-1bdrc-1io-1e7aa8f3q09da.erf.sbb.spk-berlin.de/resource/PR1CTC10",
            "http://purl-1bdrc-1io-1e7aa8f3q09da.erf.sbb.spk-berlin.de/resource/PR1GS49488",
            "http://purl-1bdrc-1io-1e7aa8f3q09da.erf.sbb.spk-berlin.de/resource/PR1CTC11",
            "http://purl-1bdrc-1io-1e7aa8f3q09da.erf.sbb.spk-berlin.de/resource/PR1CTC12",
            "http://purl-1bdrc-1io-1e7aa8f3q09da.erf.sbb.spk-berlin.de/resource/PR1CTC13",
            "http://purl-1bdrc-1io-1e7aa8f3q09da.erf.sbb.spk-berlin.de/resource/PR1CTC14",
            "http://purl-1bdrc-1io-1e7aa8f3q09da.erf.sbb.spk-berlin.de/resource/PR1CTC15",
            "http://purl-1bdrc-1io-1e7aa8f3q09da.erf.sbb.spk-berlin.de/resource/PR3JW7543"
         ].map(p => p.replace(/http:\/\/purl-1bdrc-1io-1e7aa8f3q09da.erf.sbb.spk-berlin.de\/resource\//,bdr))
      }
      */

      store.dispatch(dataActions.gotSubscribedCollections(res));
   } catch(e) {
      let fallback = []
      store.dispatch(dataActions.gotSubscribedCollections(fallback))
   }
}

export function* watchGetSubscribedCollections() {

   yield takeLatest(
      dataActions.TYPES.getSubscribedCollections,
      (action) => getSubscribedCollections()
   );
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
      (action) => getManifest(action.payload,action.meta.rid,action.meta.thumb)
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
      (action) => getPages(action.payload,action.meta.next)
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
      watchGetReproductions(),
      watchGetContext(),
      watchGetCitationStyle(),
      watchGetCitationLocale(),
      watchGetCitationData(),
      //watchChoosingHost(),
      //watchGetDatatypes(),
      watchGetChunks(),
      watchGetPages(),
      watchGetFacetInfo(),
      watchGetOneDatatype(),
      watchGetOneFacet(),
      watchGetManifest(),
      watchCheckResults(),
      watchGetImageVolumeManifest(),
      watchGetAnnotations(),
      watchRequestPdf(),
      watchCreatePdf(),
      watchGetResource(),
      watchSearchingKeyword(),
      watchStartSearch(),
      watchGetStaticQueryAsResults(),
      watchGetMonlamResults(),
      watchGetSubscribedCollections()
   ])
}
