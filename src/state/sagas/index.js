
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
import {auth} from '../../routes';

// to enable tests
const api = new bdrcApi({...global.inTest ? {server:"http://localhost:5555"}:{}});

const adm  = "http://purl.bdrc.io/ontology/admin/" ;
const bdo  = "http://purl.bdrc.io/ontology/core/";
const bdr  = "http://purl.bdrc.io/resource/";
const owl  = "http://www.w3.org/2002/07/owl#";
const rdf  = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const rdfs = "http://www.w3.org/2000/01/rdf-schema#";
const skos = "http://www.w3.org/2004/02/skos/core#";
const tmp  = "http://purl.bdrc.io/ontology/tmp/" ;
const _tmp  = "http://purl.bdrc.io/ontology/tmp/" ;

const prefixes = { adm, bdo, bdr, owl, rdf, rdfs, skos, tmp }

let IIIFurl = "http://iiif.bdrc.io" ;

const handleAuthentication = (nextState, replace) => {
  if (/access_token|id_token|error/.test(nextState.location.hash)) {
    auth.handleAuthentication();
  }
}

async function initiateApp(params,iri,myprops) {
   try {
      let state = store.getState()

      //console.log("youpla?",myprops)

      if(!state.data.config)
      {
         const config = await api.loadConfig();
         auth.setConfig(config.auth)

         console.log("auth?",auth)

         if(myprops) {
            //console.log("youpi",myprops);
            handleAuthentication(myprops);
         }
         store.dispatch(dataActions.loadedConfig(config));
         //store.dispatch(dataActions.choosingHost(config.ldspdi.endpoints[config.ldspdi.index]));
      }


      if(!state.data.ontology)
      {
         const onto = await api.loadOntology();
         store.dispatch(dataActions.loadedOntology(onto));
      // console.log("params",params)
      }

      if(iri && (!state.data.resources || !state.data.resources.IRI))
      {
         let res,Etext ;

         Etext = iri.match(/^UT/)

         try {
            if(!Etext) res = await api.loadResource(iri)
            else res = await api.loadEtextInfo(iri)
         }
         catch(e){
            store.dispatch(dataActions.noResource(iri,e));
            return
         }

         if(!Etext)
         {
            store.dispatch(dataActions.gotResource(iri,res));
            let assocRes = await api.loadAssocResources(iri)
            store.dispatch(dataActions.gotAssocResources(iri,assocRes));
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

            store.dispatch(dataActions.getChunks(iri));

            store.dispatch(dataActions.gotAssocResources(iri,{"data":Object.keys(res).reduce((acc,e)=>{
               return ({...acc,[e]:Object.keys(res[e]).map(f => ( { type:f, ...res[e][f] } ) ) } )
            },{})}));


            store.dispatch(dataActions.gotResource(iri,{ [bdr+iri] : Object.keys(res).reduce((acc,e) => {

               if(Object.keys(res[e]).indexOf(skos+"prefLabel") === -1)
                  return ({...acc, ...res[e] })
               else
                  return acc
                  /*Object.keys(res[bdr+iri][e]).reduce((ac,f) => {
                  console.log("e,ac,f",e,ac,f)
                  return ( { ...ac, ...res[bdr+iri][e][f] })
               },{})})*/
            },{}) }));

            /*Object.keys(res).reduce((acc,e) => {
               return ({ ...acc, ...res[e] })
            },{})}));*/

            //store.dispatch(dataActions.getEtext(iri))
         }

         //let t = getEntiType(iri)
         //if(t && ["Person","Place","Topic"].indexOf(t) !== -1) {
         //   store.dispatch(dataActions.startSearch("bdr:"+iri,"",["Any"],t)); //,params.t.split(",")));
         //}
      }
      else if(!iri && params && params.q) {

         if(!params.lg) params.lg = "bo-x-ewts"
         //console.log("state q",state.data.searches,params,iri)

         if(params.t && ["Person","Work","Etext"].indexOf(params.t) !== -1
            && (!state.data.searches || !state.data.searches[params.t] || !state.data.searches[params.t][params.q+"@"+params.lg]))
         {
            store.dispatch(dataActions.startSearch(params.q,params.lg,[params.t])); //,params.t.split(",")));
            store.dispatch(uiActions.selectType(params.t));
         }
         else if(!state.data.searches || !state.data.searches[params.q+"@"+params.lg])
         {
            store.dispatch(dataActions.startSearch(params.q,params.lg));
         }
      }
      else if(!iri && params && params.r) {
         let t = getEntiType(params.r)

         //console.log("state r",state.data.searches,params,iri)

         let s = ["Any"]
         //if(params.t && params.t != "Any") { s = [ params.t ] }

         if(t && ["Person","Place","Topic","Work"].indexOf(t) !== -1
            && (!state.data.searches || !state.data.searches[params.r+"@"]))
         {
            store.dispatch(dataActions.startSearch(params.r,"",s,t)); //,params.t.split(",")));
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
      .map(e => ({ value:e.chunkContents["@value"] })); //+ " ("+e.seqNum+")" }))

      console.log("dataC",iri,next,data)

      store.dispatch(dataActions.gotNextChunks(iri,data))
   }
   catch(e){
      console.error("ERRROR with chunks",iri,next,e)

      //store.dispatch(dataActions.chunkError(url,e,iri);
   }

}


async function createPdf(url,iri) {
   try
   {

      url = url.replace(/zip/,iri.file)
      console.log("creaP",url,iri)

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

async function getManifest(url,iri) {
   try {

      console.log("getM",url,iri)

      let manif = await api.loadManifest(url);
      let image ;
      //collection ?
      if(!manif.sequences ) {
         if (manif.manifests) manif = await api.loadManifest(manif.manifests[0]["@id"]);
         else throw new Error("collection without manifest list")
      }

      if(manif.sequences && manif.sequences[0] && manif.sequences[0].canvases) {
         let found = false ;
         for(let i in manif.sequences[0].canvases){
            let s = manif.sequences[0].canvases[i]
            if(s.label === "tbrc-1") {
               s = manif.sequences[0].canvases[2]
               if(s && s.images && s.images[0])
               {
                  image = manif.sequences[0].canvases[2].images[0].resource["@id"]
                  console.log("image",image)

                  found = true ;

                  let test = await api.getURLContents(image)
                  store.dispatch(dataActions.firstImage(image,iri))

                  break ;

               }
            }
            /*
            if(s.label === "p. 1" && s.images && s.images[0]) {

               image = s.images[0].resource["@id"]
               console.log("image",image)

               found = true ;

               store.dispatch(dataActions.firstImage(image,iri))

               break ;
            }
            */
         }
         if(!found) {
            if(manif.sequences[0].canvases[0] && manif.sequences[0].canvases[0].images[0] &&
               (image = manif.sequences[0].canvases[0].images[0].resource["@id"]))
               {
                  let test = await api.getURLContents(image)
                  store.dispatch(dataActions.firstImage(image,iri))
               }
         }
      }
   }
   catch(e){
      console.error("ERRROR with manifest",e)

      store.dispatch(dataActions.manifestError(url,e,iri))
   }
}

export function* getDatatypes(key,lang) {

   try {

      const datatypes = yield call([api, api.getResultsDatatypes], key,lang);

      yield put(dataActions.foundDatatypes(key,datatypes));

   } catch(e) {
      yield put(dataActions.searchFailed(key, e.message));
      yield put(dataActions.notGettingDatatypes());
   }

}

function getData(result)  {

   let data = result, numR = -1,metadata = result.metadata ;
   if(data && data.people) {
      data.persons = data.people
      delete data.people
   }
   if(data && data.data) {
      data.works = data.data
      delete data.data
   }
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



   if(data.works) {

      let ordered = Object.keys(data.works).sort((a,b) => {
         let propAbsA = data.works[a].filter((e)=>(e.value.match(/AbstractWork/)))
         let propAbsB = data.works[b].filter((e)=>(e.value.match(/AbstractWork/)))
         let propExpA = data.works[a].filter((e)=>(e.type.match(/HasExpression/)))
         let propExpB = data.works[b].filter((e)=>(e.type.match(/HasExpression/)))
         let propExpOfA = data.works[a].filter((e)=>(e.type.match(/ExpressionOf/)))
         let propExpOfB = data.works[b].filter((e)=>(e.type.match(/ExpressionOf/)))

         if(propAbsA.length > 0) return -1 ;
         else if(propAbsB.length > 0) return 1 ;
         else if(propExpA.length > 0 && propExpB.length == 0) return -1 ;
         else if(propExpB.length > 0 && propExpA.length == 0) return 1 ;
         else if(propExpOfA.length > 0 && propExpOfB.length == 0) return -1 ;
         else if(propExpOfB.length > 0 && propExpOfA.length == 0) return 1 ;
         else return 0;
      })

      let tmp = {}
      for(let o of ordered) { tmp[o] = data.works[o]; }
      data.works = tmp
      // data.works = ordered.reduce((acc,k) => { acc[k]=data.works[k]; },{})
   }

   // console.log("getData#result",result)

   if(metadata)
   {
      let kZ = Object.keys(metadata)
      if(kZ.reduce((acc,k) => (acc || k.match(/^http:/) ),false))
         numR = kZ.reduce((acc,k) => ( acc+Number(metadata[k])),0)
      else
         if(kZ.length == 0)
            numR = 0
      delete data.metadata
   }
   else if(Object.keys(result) == 0) { numR = 0 }
   else
   {
      numR = 777; //Object.values(result)[0].length
   }
   data = {  numResults:numR, results : { bindings: {...data } } }

   return data
}


   function getStats(cat:string,data:{})
   {
      let stat={}
      let config = store.getState().data.config.facets

      for(let p of Object.values(data["results"]["bindings"][cat.toLowerCase()+"s"]))
      {
         // console.log("p",p);
         for(let f of Object.keys(config[cat]))
         {
            let tmp = p.filter((e) => (e.type == config[cat][f]))
            if(tmp.length > 0) for(let t of tmp)
            {
               if(!stat[f]) stat[f] = {}
               let pre = stat[f][t.value]
               if(!pre) pre = 1
               else pre ++ ;
               stat[f][t.value] = pre ;
               // console.log("f+1",f,tmp,pre)
            }
         }
      }
      return stat
   }

   function addMeta(keyword:string,language:string,data:{},t:string,tree:{})
   {
      if(data["results"] &&  data["results"]["bindings"] && data["results"]["bindings"][t.toLowerCase()+"s"]){
         console.log("FOUND",data);
         let stat = getStats(t,data);

         if(tree)
         {
            stat = { ...stat, tree }
         }

         console.log("stat",stat)
         store.dispatch(dataActions.foundResults(keyword, language, data, [t]));
         store.dispatch(dataActions.foundFacetInfo(keyword,language,[t],stat))
      }
   }

 async function startSearch(keyword,language,datatype,sourcetype) {

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

      store.dispatch(uiActions.loading(keyword, false));

      if(result.metadata && result.metadata[bdo+"Etext"] == 0)
      {
         delete result.metadata[bdo+"Etext"]
         //console.log("deleted")
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

         data = getData(data);
         store.dispatch(dataActions.foundResults(keyword, language, data, datatype));
         store.dispatch(dataActions.foundDatatypes(keyword,{ metadata, hash:true}));

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

         store.dispatch(dataActions.foundResults(keyword, language, data, datatype));

         if(!datatype || datatype.indexOf("Any") !== -1) {
            store.dispatch(dataActions.foundDatatypes(keyword,{ metadata:metadata, hash:true}));
         }
         else {

            if(datatype.indexOf("Person") !== -1) {
               store.dispatch(dataActions.foundFacetInfo(keyword,language,datatype,{"gender":metadata }))
            }
            else if(datatype.indexOf("Work") !== -1 || datatype.indexOf("Etext") !== -1) {

               metadata = { ...metadata, tree:result.tree}

               if(datatype.indexOf("Work") !== -1 ) addMeta(keyword,language,data,"Work",result.tree);
               else store.dispatch(dataActions.foundFacetInfo(keyword,language,datatype,metadata))
            }


            if(!store.getState().data.searches[keyword+"@"+language]){
               store.dispatch(dataActions.getDatatypes());
               result = await api.getStartResults(keyword,language);

               if(result.metadata && result.metadata[bdo+"Etext"] == 0)
                  delete result.metadata[bdo+"Etext"]

               metadata = result.metadata;
               data = getData(result);
               store.dispatch(dataActions.foundResults(keyword, language, data));
               store.dispatch(dataActions.foundDatatypes(keyword,{ metadata, hash:true}));
            }
         }
      }

      // store.dispatch(dataActions.foundDatatypes(keyword, JSON.parse(result.metadata).results));
      //store.dispatch(dataActions.foundResults(keyword, language,result));
      //yield put(uiActions.showResults(keyword, language));

   } catch(e) {

      console.error("startSearch failed",e);

      store.dispatch(dataActions.searchFailed(keyword, e.message));
      store.dispatch(uiActions.loading(keyword, false));
   }
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
      (action) => startSearch(action.payload.keyword,action.payload.language,action.payload.datatype,action.payload.sourcetype)
   );
}

export function* watchGetDatatypes() {

   yield takeLatest(
      dataActions.TYPES.getDatatypes,
      (action) => getDatatypes(action.payload.keyword,action.payload.language)
   );
}

export function* watchGetManifest() {

   yield takeLatest(
      dataActions.TYPES.getManifest,
      (action) => getManifest(action.payload,action.meta)
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

export function* watchGetChunks() {

   yield takeLatest(
      dataActions.TYPES.getChunks,
      (action) => getChunks(action.payload,action.meta)
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
/** Root **/

export default function* rootSaga() {
   yield all([
      watchInitiateApp(),
      //watchChoosingHost(),
      //watchGetDatatypes(),
      watchGetChunks(),
      watchGetFacetInfo(),
      watchGetOneDatatype(),
      watchGetOneFacet(),
      watchGetManifest(),
      watchRequestPdf(),
      watchCreatePdf(),
      watchSearchingKeyword(),
      watchStartSearch()
   ])
}
