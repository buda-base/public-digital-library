import { call, put, takeLatest, select, all } from 'redux-saga/effects';
import { INITIATE_APP } from '../actions';
import * as dataActions from '../data/actions';
import * as uiActions from '../ui/actions';
import selectors from '../selectors';
import store from '../../index';
import bdrcApi, { getEntiType } from '../../lib/api';

const api = new bdrcApi();

async function initiateApp(params,iri) {
   try {
      const config = await api.loadConfig();
      store.dispatch(dataActions.loadedConfig(config));
      store.dispatch(dataActions.choosingHost(config.ldspdi.endpoints[config.ldspdi.index]));

      const onto = await api.loadOntology();
      store.dispatch(dataActions.loadedOntology(onto));
      // console.log("params",params)

      let state = !store.getState()

      if(iri && (!state.resources || !state.resources.IRI))
      {
         let res ;

         try {
            res = await api.loadResource(iri)
         }
         catch(e){
            store.dispatch(dataActions.noResource(iri,e));
            return
         }
         store.dispatch(dataActions.gotResource(iri,res));

         let assocRes = await api.loadAssocResources(iri)
         store.dispatch(dataActions.gotAssocResources(iri,assocRes));

         let t = getEntiType(iri)
         if(t && ["Person","Place","Topic"].indexOf(t) !== -1) {
            store.dispatch(dataActions.startSearch("bdr:"+iri,"",["Any"],t)); //,params.t.split(",")));
         }
      }
      else if(!iri && params && params.q) {
         if(params.t && ["Person","Work"].indexOf(params.t) !== -1)
         {
            store.dispatch(dataActions.startSearch(params.q,params.lg,[params.t])); //,params.t.split(",")));
            store.dispatch(uiActions.selectType(params.t));
         }
         else
         {
            store.dispatch(dataActions.startSearch(params.q,params.lg));
         }
      }
      else if(!iri && params && params.r) {
         let t = getEntiType(params.r)

         // console.log("t",t)

         let s = ["Any"]
         //if(params.t && params.t != "Any") { s = [ params.t ] }

         if(t && ["Person","Place","Topic"].indexOf(t) !== -1) {
            store.dispatch(dataActions.startSearch(params.r,"",s,t)); //,params.t.split(",")));
         }
      }

   } catch(e) {
      console.log('initiateApp error: %o', e);
      // TODO: add action for initiation failure
   }
}

function* watchInitiateApp() {
      yield takeLatest(
         INITIATE_APP,
         (action) => initiateApp(action.payload,action.meta)
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

async function getManifest(url) {
   try {
      let manif = await api.loadManifest(url);
      let image ;
      //collection ?
      if(!manif.sequences && manif.manifests ) {
         manif = await api.loadManifest(manif.manifests[0]["@id"]);
      }

      if(manif.sequences && manif.sequences[0] && manif.sequences[0].canvases) {
         for(let s of manif.sequences[0].canvases){
            if(s.label === "p. 1" && s.images && s.images[0]) {

               image = s.images[0].resource["@id"]
               console.log("image",image)

               store.dispatch(dataActions.firstImage(image))

               break ;
            }
         }
      }
   }
   catch(e){
      console.log("ERRROR with manifest",e)

      store.dispatch(dataActions.manifestError(url))
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

      let metadata = result.metadata;

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
            if(t != "metadata" && Object.keys(result[k]).length > 0) {
               data = { ...data, [t+"s"]:result[k] }
               metadata = { ...metadata, [t]:Object.keys(result[k]).length }
            }
         }
         // console.log("data",data,result)
         data = getData(data);
         store.dispatch(dataActions.foundResults(keyword, language, data, datatype));
         store.dispatch(dataActions.foundDatatypes(keyword,{ metadata, hash:true}));

         let newMeta = {}
         if(data["results"] &&  data["results"]["bindings"] && data["results"]["bindings"]["persons"]){
            // console.log("FOUND",data);
            let stat = getStats("Person",data);
            console.log("stat",stat)
            store.dispatch(dataActions.foundResults(keyword, language, data, ["Person"]));
            store.dispatch(dataActions.foundFacetInfo(keyword,language,datatype,stat))
         }
         if(data["results"] &&  data["results"]["bindings"] && data["results"]["bindings"]["works"]){
            // console.log("FOUND",data);
            let stat = getStats("Work",data);
            console.log("stat",stat)
            store.dispatch(dataActions.foundResults(keyword, language, data, ["Work"]));
            store.dispatch(dataActions.foundFacetInfo(keyword,language,datatype,stat))
         }

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
            else if(datatype.indexOf("Work") !== -1) {
               store.dispatch(dataActions.foundFacetInfo(keyword,language,datatype,metadata))
            }


            if(!store.getState().data.searches[keyword+"@"+language]){
               store.dispatch(dataActions.getDatatypes());
               result = await api.getStartResults(keyword,language);
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

      console.log(e);

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
      (action) => getManifest(action.payload)
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
      watchChoosingHost(),
      //watchGetDatatypes(),
      watchGetFacetInfo(),
      watchGetOneDatatype(),
      watchGetOneFacet(),
      watchGetManifest(),
      watchSearchingKeyword(),
      watchStartSearch()
   ])
}
