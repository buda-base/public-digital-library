
import _ from "lodash";
import { call, put, takeLatest, select, all } from 'redux-saga/effects';
import { INITIATE_APP } from '../actions';
import * as dataActions from '../data/actions';
import * as uiActions from '../ui/actions';
import selectors from '../selectors';
import store from '../../index';
import bdrcApi, { getEntiType } from '../../lib/api';

const api = new bdrcApi();

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

async function initiateApp(params,iri) {
   try {
      let state = store.getState()



      if(!state.data.config)
      {
         const config = await api.loadConfig();
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
      console.log("ERRROR with chunks",iri,next,e)

      //store.dispatch(dataActions.chunkError(url,e,iri);
   }

}


async function createPdf(url,iri) {
   try
   {

      console.log("creaP",url)

      let data = await api.getURLContents("http://iiif.bdrc.io"+url,false,"application/json")

      console.log("pdf",data)

      store.dispatch(dataActions.pdfReady(data.links,iri))

   }
   catch(e){
      console.error("ERRROR with pdf",e)

         //store.dispatch(dataActions.manifestError(url,e,iri))
   }
}

async function requestPdf(url,iri) {
   try {

      console.log("reqP",url,iri)
      let data = await api.getURLContents(url,false,"application/json") // pb CORS
      /*
      {
        "bdr:V22704_I3366" : "/download/file/pdf/v:bdr:V22704_I3366::1-642",
        "bdr:V22704_I3365" : "/download/file/pdf/v:bdr:V22704_I3365::1-800",
        "bdr:V22704_I3368" : "/download/file/pdf/v:bdr:V22704_I3368::1-886",
        "bdr:V22704_I3367" : "/download/file/pdf/v:bdr:V22704_I3367::1-650",
        "bdr:V22704_I3369" : "/download/file/pdf/v:bdr:V22704_I3369::1-842",
        "bdr:V22704_I3360" : "/download/file/pdf/v:bdr:V22704_I3360::1-784",
        "bdr:V22704_I3362" : "/download/file/pdf/v:bdr:V22704_I3362::1-835",
        "bdr:V22704_I3361" : "/download/file/pdf/v:bdr:V22704_I3361::1-816",
        "bdr:V22704_I3364" : "/download/file/pdf/v:bdr:V22704_I3364::1-852",
        "bdr:V22704_I3363" : "/download/file/pdf/v:bdr:V22704_I3363::1-848",
        "bdr:V22704_I3256" : "/download/file/pdf/v:bdr:V22704_I3256::1-756",
        "bdr:V22704_I3377" : "/download/file/pdf/v:bdr:V22704_I3377::1-628",
        "bdr:V22704_I3255" : "/download/file/pdf/v:bdr:V22704_I3255::1-678",
        "bdr:V22704_I3376" : "/download/file/pdf/v:bdr:V22704_I3376::1-686",
        "bdr:V22704_I3258" : "/download/file/pdf/v:bdr:V22704_I3258::1-696",
        "bdr:V22704_I3379" : "/download/file/pdf/v:bdr:V22704_I3379::1-638",
        "bdr:V22704_I3257" : "/download/file/pdf/v:bdr:V22704_I3257::1-698",
        "bdr:V22704_I3378" : "/download/file/pdf/v:bdr:V22704_I3378::1-636",
        "bdr:V22704_I3259" : "/download/file/pdf/v:bdr:V22704_I3259::1-1010",
        "bdr:V22704_I3371" : "/download/file/pdf/v:bdr:V22704_I3371::1-590",
        "bdr:V22704_I3370" : "/download/file/pdf/v:bdr:V22704_I3370::1-726",
        "bdr:V22704_I3252" : "/download/file/pdf/v:bdr:V22704_I3252::1-562",
        "bdr:V22704_I3373" : "/download/file/pdf/v:bdr:V22704_I3373::1-652",
        "bdr:V22704_I3372" : "/download/file/pdf/v:bdr:V22704_I3372::1-476",
        "bdr:V22704_I3254" : "/download/file/pdf/v:bdr:V22704_I3254::1-612",
        "bdr:V22704_I3375" : "/download/file/pdf/v:bdr:V22704_I3375::1-686",
        "bdr:V22704_I3253" : "/download/file/pdf/v:bdr:V22704_I3253::1-448",
        "bdr:V22704_I3374" : "/download/file/pdf/v:bdr:V22704_I3374::1-622",
        "bdr:V22704_I3267" : "/download/file/pdf/v:bdr:V22704_I3267::1-622",
        "bdr:V22704_I3388" : "/download/file/pdf/v:bdr:V22704_I3388::1-620",
        "bdr:V22704_I3266" : "/download/file/pdf/v:bdr:V22704_I3266::1-814",
        "bdr:V22704_I3387" : "/download/file/pdf/v:bdr:V22704_I3387::1-398",
        "bdr:V22704_I3269" : "/download/file/pdf/v:bdr:V22704_I3269::1-852",
        "bdr:V22704_I3268" : "/download/file/pdf/v:bdr:V22704_I3268::1-694",
        "bdr:V22704_I3389" : "/download/file/pdf/v:bdr:V22704_I3389::1-422",
        "bdr:V22704_I3380" : "/download/file/pdf/v:bdr:V22704_I3380::1-662",
        "bdr:V22704_I3261" : "/download/file/pdf/v:bdr:V22704_I3261::1-630",
        "bdr:V22704_I3382" : "/download/file/pdf/v:bdr:V22704_I3382::1-726",
        "bdr:V22704_I3260" : "/download/file/pdf/v:bdr:V22704_I3260::1-1010",
        "bdr:V22704_I3381" : "/download/file/pdf/v:bdr:V22704_I3381::1-588",
        "bdr:V22704_I3263" : "/download/file/pdf/v:bdr:V22704_I3263::1-700",
        "bdr:V22704_I3384" : "/download/file/pdf/v:bdr:V22704_I3384::1-392",
        "bdr:V22704_I3262" : "/download/file/pdf/v:bdr:V22704_I3262::1-464",
        "bdr:V22704_I3383" : "/download/file/pdf/v:bdr:V22704_I3383::1-562",
        "bdr:V22704_I3265" : "/download/file/pdf/v:bdr:V22704_I3265::1-864",
        "bdr:V22704_I3386" : "/download/file/pdf/v:bdr:V22704_I3386::1-600",
        "bdr:V22704_I3264" : "/download/file/pdf/v:bdr:V22704_I3264::1-766",
        "bdr:V22704_I3385" : "/download/file/pdf/v:bdr:V22704_I3385::1-640",
        "bdr:V22704_I3278" : "/download/file/pdf/v:bdr:V22704_I3278::1-700",
        "bdr:V22704_I3399" : "/download/file/pdf/v:bdr:V22704_I3399::1-388",
        "bdr:V22704_I3277" : "/download/file/pdf/v:bdr:V22704_I3277::1-990",
        "bdr:V22704_I3398" : "/download/file/pdf/v:bdr:V22704_I3398::1-446",
        "bdr:V22704_I3279" : "/download/file/pdf/v:bdr:V22704_I3279::1-570",
        "bdr:V22704_I3270" : "/download/file/pdf/v:bdr:V22704_I3270::1-548",
        "bdr:V22704_I3391" : "/download/file/pdf/v:bdr:V22704_I3391::1-638",
        "bdr:V22704_I3390" : "/download/file/pdf/v:bdr:V22704_I3390::1-484",
        "bdr:V22704_I3272" : "/download/file/pdf/v:bdr:V22704_I3272::1-708",
        "bdr:V22704_I3393" : "/download/file/pdf/v:bdr:V22704_I3393::1-514",
        "bdr:V22704_I3271" : "/download/file/pdf/v:bdr:V22704_I3271::1-760",
        "bdr:V22704_I3392" : "/download/file/pdf/v:bdr:V22704_I3392::1-714",
        "bdr:V22704_I3274" : "/download/file/pdf/v:bdr:V22704_I3274::1-1050",
        "bdr:V22704_I3395" : "/download/file/pdf/v:bdr:V22704_I3395::1-862",
        "bdr:V22704_I3273" : "/download/file/pdf/v:bdr:V22704_I3273::1-736",
        "bdr:V22704_I3394" : "/download/file/pdf/v:bdr:V22704_I3394::1-802",
        "bdr:V22704_I3276" : "/download/file/pdf/v:bdr:V22704_I3276::1-718",
        "bdr:V22704_I3397" : "/download/file/pdf/v:bdr:V22704_I3397::1-446",
        "bdr:V22704_I3275" : "/download/file/pdf/v:bdr:V22704_I3275::1-800",
        "bdr:V22704_I3396" : "/download/file/pdf/v:bdr:V22704_I3396::1-702",
        "bdr:V22704_I3322" : "/download/file/pdf/v:bdr:V22704_I3322::1-702",
        "bdr:V22704_I3443" : "/download/file/pdf/v:bdr:V22704_I3443::1-688",
        "bdr:V22704_I3321" : "/download/file/pdf/v:bdr:V22704_I3321::1-854",
        "bdr:V22704_I3442" : "/download/file/pdf/v:bdr:V22704_I3442::1-712",
        "bdr:V22704_I3324" : "/download/file/pdf/v:bdr:V22704_I3324::1-806",
        "bdr:V22704_I3445" : "/download/file/pdf/v:bdr:V22704_I3445::1-804",
        "bdr:V22704_I3323" : "/download/file/pdf/v:bdr:V22704_I3323::1-646",
        "bdr:V22704_I3444" : "/download/file/pdf/v:bdr:V22704_I3444::1-610",
        "bdr:V22704_I3326" : "/download/file/pdf/v:bdr:V22704_I3326::1-564",
        "bdr:V22704_I3447" : "/download/file/pdf/v:bdr:V22704_I3447::1-504",
        "bdr:V22704_I3325" : "/download/file/pdf/v:bdr:V22704_I3325::1-892",
        "bdr:V22704_I3446" : "/download/file/pdf/v:bdr:V22704_I3446::1-626",
        "bdr:V22704_I3328" : "/download/file/pdf/v:bdr:V22704_I3328::1-1202",
        "bdr:V22704_I3449" : "/download/file/pdf/v:bdr:V22704_I3449::1-650",
        "bdr:V22704_I3327" : "/download/file/pdf/v:bdr:V22704_I3327::1-436",
        "bdr:V22704_I3448" : "/download/file/pdf/v:bdr:V22704_I3448::1-696",
        "bdr:V22704_I3320" : "/download/file/pdf/v:bdr:V22704_I3320::1-758",
        "bdr:V22704_I3441" : "/download/file/pdf/v:bdr:V22704_I3441::1-740",
        "bdr:V22704_I3440" : "/download/file/pdf/v:bdr:V22704_I3440::1-834",
        "bdr:V22704_I3319" : "/download/file/pdf/v:bdr:V22704_I3319::1-704",
        "bdr:V22704_I3318" : "/download/file/pdf/v:bdr:V22704_I3318::1-802",
        "bdr:V22704_I3439" : "/download/file/pdf/v:bdr:V22704_I3439::1-660",
        "bdr:V22704_I3333" : "/download/file/pdf/v:bdr:V22704_I3333::1-710",
        "bdr:V22704_I3454" : "/download/file/pdf/v:bdr:V22704_I3454::1-722",
        "bdr:V22704_I3332" : "/download/file/pdf/v:bdr:V22704_I3332::1-806",
        "bdr:V22704_I3453" : "/download/file/pdf/v:bdr:V22704_I3453::1-774",
        "bdr:V22704_I3335" : "/download/file/pdf/v:bdr:V22704_I3335::1-594",
        "bdr:V22704_I3456" : "/download/file/pdf/v:bdr:V22704_I3456::1-644",
        "bdr:V22704_I3334" : "/download/file/pdf/v:bdr:V22704_I3334::1-424",
        "bdr:V22704_I3455" : "/download/file/pdf/v:bdr:V22704_I3455::1-616",
        "bdr:V22704_I3337" : "/download/file/pdf/v:bdr:V22704_I3337::1-534",
        "bdr:V22704_I3458" : "/download/file/pdf/v:bdr:V22704_I3458::1-888",
        "bdr:V22704_I3336" : "/download/file/pdf/v:bdr:V22704_I3336::1-740",
        "bdr:V22704_I3457" : "/download/file/pdf/v:bdr:V22704_I3457::1-850",
        "bdr:V22704_I3339" : "/download/file/pdf/v:bdr:V22704_I3339::1-454",
        "bdr:V22704_I3338" : "/download/file/pdf/v:bdr:V22704_I3338::1-290",
        "bdr:V22704_I3459" : "/download/file/pdf/v:bdr:V22704_I3459::1-650",
        "bdr:V22704_I3450" : "/download/file/pdf/v:bdr:V22704_I3450::1-754",
        "bdr:V22704_I3331" : "/download/file/pdf/v:bdr:V22704_I3331::1-664",
        "bdr:V22704_I3452" : "/download/file/pdf/v:bdr:V22704_I3452::1-804",
        "bdr:V22704_I3330" : "/download/file/pdf/v:bdr:V22704_I3330::1-706",
        "bdr:V22704_I3451" : "/download/file/pdf/v:bdr:V22704_I3451::1-840",
        "bdr:V22704_I3329" : "/download/file/pdf/v:bdr:V22704_I3329::1-532",
        "bdr:V22704_I3344" : "/download/file/pdf/v:bdr:V22704_I3344::1-780",
        "bdr:V22704_I3465" : "/download/file/pdf/v:bdr:V22704_I3465::1-718",
        "bdr:V22704_I3343" : "/download/file/pdf/v:bdr:V22704_I3343::1-740",
        "bdr:V22704_I3464" : "/download/file/pdf/v:bdr:V22704_I3464::1-718",
        "bdr:V22704_I3346" : "/download/file/pdf/v:bdr:V22704_I3346::1-602",
        "bdr:V22704_I3467" : "/download/file/pdf/v:bdr:V22704_I3467::1-900",
        "bdr:V22704_I3345" : "/download/file/pdf/v:bdr:V22704_I3345::1-818",
        "bdr:V22704_I3466" : "/download/file/pdf/v:bdr:V22704_I3466::1-682",
        "bdr:V22704_I3348" : "/download/file/pdf/v:bdr:V22704_I3348::1-458",
        "bdr:V22704_I3469" : "/download/file/pdf/v:bdr:V22704_I3469::1-1094",
        "bdr:V22704_I3347" : "/download/file/pdf/v:bdr:V22704_I3347::1-588",
        "bdr:V22704_I3468" : "/download/file/pdf/v:bdr:V22704_I3468::1-768",
        "bdr:V22704_I3349" : "/download/file/pdf/v:bdr:V22704_I3349::1-548",
        "bdr:V22704_I3340" : "/download/file/pdf/v:bdr:V22704_I3340::1-466",
        "bdr:V22704_I3461" : "/download/file/pdf/v:bdr:V22704_I3461::1-728",
        "bdr:V22704_I3460" : "/download/file/pdf/v:bdr:V22704_I3460::1-768",
        "bdr:V22704_I3342" : "/download/file/pdf/v:bdr:V22704_I3342::1-698",
        "bdr:V22704_I3463" : "/download/file/pdf/v:bdr:V22704_I3463::1-590",
        "bdr:V22704_I3341" : "/download/file/pdf/v:bdr:V22704_I3341::1-546",
        "bdr:V22704_I3462" : "/download/file/pdf/v:bdr:V22704_I3462::1-792",
        "bdr:V22704_I3355" : "/download/file/pdf/v:bdr:V22704_I3355::1-726",
        "bdr:V22704_I3476" : "/download/file/pdf/v:bdr:V22704_I3476::1-678",
        "bdr:V22704_I3354" : "/download/file/pdf/v:bdr:V22704_I3354::1-724",
        "bdr:V22704_I3475" : "/download/file/pdf/v:bdr:V22704_I3475::1-680",
        "bdr:V22704_I3357" : "/download/file/pdf/v:bdr:V22704_I3357::1-672",
        "bdr:V22704_I3356" : "/download/file/pdf/v:bdr:V22704_I3356::1-634",
        "bdr:V22704_I3359" : "/download/file/pdf/v:bdr:V22704_I3359::1-688",
        "bdr:V22704_I3358" : "/download/file/pdf/v:bdr:V22704_I3358::1-726",
        "bdr:V22704_I3470" : "/download/file/pdf/v:bdr:V22704_I3470::1-660",
        "bdr:V22704_I3351" : "/download/file/pdf/v:bdr:V22704_I3351::1-756",
        "bdr:V22704_I3472" : "/download/file/pdf/v:bdr:V22704_I3472::1-700",
        "bdr:V22704_I3350" : "/download/file/pdf/v:bdr:V22704_I3350::1-702",
        "bdr:V22704_I3471" : "/download/file/pdf/v:bdr:V22704_I3471::1-996",
        "bdr:V22704_I3353" : "/download/file/pdf/v:bdr:V22704_I3353::1-728",
        "bdr:V22704_I3474" : "/download/file/pdf/v:bdr:V22704_I3474::1-568",
        "bdr:V22704_I3352" : "/download/file/pdf/v:bdr:V22704_I3352::1-570",
        "bdr:V22704_I3473" : "/download/file/pdf/v:bdr:V22704_I3473::1-674",
        "bdr:V22704_I3401" : "/download/file/pdf/v:bdr:V22704_I3401::1-506",
        "bdr:V22704_I3400" : "/download/file/pdf/v:bdr:V22704_I3400::1-542",
        "bdr:V22704_I3403" : "/download/file/pdf/v:bdr:V22704_I3403::1-620",
        "bdr:V22704_I3402" : "/download/file/pdf/v:bdr:V22704_I3402::1-566",
        "bdr:V22704_I3405" : "/download/file/pdf/v:bdr:V22704_I3405::1-778",
        "bdr:V22704_I3404" : "/download/file/pdf/v:bdr:V22704_I3404::1-730",
        "bdr:V22704_I3410" : "/download/file/pdf/v:bdr:V22704_I3410::1-532",
        "bdr:V22704_I3412" : "/download/file/pdf/v:bdr:V22704_I3412::1-540",
        "bdr:V22704_I3411" : "/download/file/pdf/v:bdr:V22704_I3411::1-586",
        "bdr:V22704_I3414" : "/download/file/pdf/v:bdr:V22704_I3414::1-684",
        "bdr:V22704_I3413" : "/download/file/pdf/v:bdr:V22704_I3413::1-638",
        "bdr:V22704_I3416" : "/download/file/pdf/v:bdr:V22704_I3416::1-536",
        "bdr:V22704_I3415" : "/download/file/pdf/v:bdr:V22704_I3415::1-662",
        "bdr:V22704_I3407" : "/download/file/pdf/v:bdr:V22704_I3407::1-756",
        "bdr:V22704_I3406" : "/download/file/pdf/v:bdr:V22704_I3406::1-806",
        "bdr:V22704_I3409" : "/download/file/pdf/v:bdr:V22704_I3409::1-862",
        "bdr:V22704_I3408" : "/download/file/pdf/v:bdr:V22704_I3408::1-576",
        "bdr:V22704_I3300" : "/download/file/pdf/v:bdr:V22704_I3300::1-556",
        "bdr:V22704_I3421" : "/download/file/pdf/v:bdr:V22704_I3421::1-578",
        "bdr:V22704_I3420" : "/download/file/pdf/v:bdr:V22704_I3420::1-736",
        "bdr:V22704_I3302" : "/download/file/pdf/v:bdr:V22704_I3302::1-796",
        "bdr:V22704_I3423" : "/download/file/pdf/v:bdr:V22704_I3423::1-632",
        "bdr:V22704_I3301" : "/download/file/pdf/v:bdr:V22704_I3301::1-570",
        "bdr:V22704_I3422" : "/download/file/pdf/v:bdr:V22704_I3422::1-644",
        "bdr:V22704_I3304" : "/download/file/pdf/v:bdr:V22704_I3304::1-644",
        "bdr:V22704_I3425" : "/download/file/pdf/v:bdr:V22704_I3425::1-914",
        "bdr:V22704_I3303" : "/download/file/pdf/v:bdr:V22704_I3303::1-570",
        "bdr:V22704_I3424" : "/download/file/pdf/v:bdr:V22704_I3424::1-920",
        "bdr:V22704_I3306" : "/download/file/pdf/v:bdr:V22704_I3306::1-750",
        "bdr:V22704_I3427" : "/download/file/pdf/v:bdr:V22704_I3427::1-776",
        "bdr:V22704_I3305" : "/download/file/pdf/v:bdr:V22704_I3305::1-788",
        "bdr:V22704_I3426" : "/download/file/pdf/v:bdr:V22704_I3426::1-608",
        "bdr:V22704_I3418" : "/download/file/pdf/v:bdr:V22704_I3418::1-720",
        "bdr:V22704_I3417" : "/download/file/pdf/v:bdr:V22704_I3417::1-588",
        "bdr:V22704_I3419" : "/download/file/pdf/v:bdr:V22704_I3419::1-472",
        "bdr:V22704_I3311" : "/download/file/pdf/v:bdr:V22704_I3311::1-708",
        "bdr:V22704_I3432" : "/download/file/pdf/v:bdr:V22704_I3432::1-660",
        "bdr:V22704_I3310" : "/download/file/pdf/v:bdr:V22704_I3310::1-774",
        "bdr:V22704_I3431" : "/download/file/pdf/v:bdr:V22704_I3431::1-598",
        "bdr:V22704_I3313" : "/download/file/pdf/v:bdr:V22704_I3313::1-608",
        "bdr:V22704_I3434" : "/download/file/pdf/v:bdr:V22704_I3434::1-1074",
        "bdr:V22704_I3312" : "/download/file/pdf/v:bdr:V22704_I3312::1-574",
        "bdr:V22704_I3433" : "/download/file/pdf/v:bdr:V22704_I3433::1-892",
        "bdr:V22704_I3315" : "/download/file/pdf/v:bdr:V22704_I3315::1-616",
        "bdr:V22704_I3436" : "/download/file/pdf/v:bdr:V22704_I3436::1-774",
        "bdr:V22704_I3314" : "/download/file/pdf/v:bdr:V22704_I3314::1-752",
        "bdr:V22704_I3435" : "/download/file/pdf/v:bdr:V22704_I3435::1-764",
        "bdr:V22704_I3317" : "/download/file/pdf/v:bdr:V22704_I3317::1-660",
        "bdr:V22704_I3438" : "/download/file/pdf/v:bdr:V22704_I3438::1-708",
        "bdr:V22704_I3316" : "/download/file/pdf/v:bdr:V22704_I3316::1-730",
        "bdr:V22704_I3437" : "/download/file/pdf/v:bdr:V22704_I3437::1-696",
        "bdr:V22704_I3430" : "/download/file/pdf/v:bdr:V22704_I3430::1-754",
        "bdr:V22704_I3308" : "/download/file/pdf/v:bdr:V22704_I3308::1-748",
        "bdr:V22704_I3429" : "/download/file/pdf/v:bdr:V22704_I3429::1-584",
        "bdr:V22704_I3307" : "/download/file/pdf/v:bdr:V22704_I3307::1-576",
        "bdr:V22704_I3428" : "/download/file/pdf/v:bdr:V22704_I3428::1-616",
        "bdr:V22704_I3309" : "/download/file/pdf/v:bdr:V22704_I3309::1-820",
        "bdr:V22704_I3289" : "/download/file/pdf/v:bdr:V22704_I3289::1-710",
        "bdr:V22704_I3288" : "/download/file/pdf/v:bdr:V22704_I3288::1-548",
        "bdr:V22704_I3281" : "/download/file/pdf/v:bdr:V22704_I3281::1-532",
        "bdr:V22704_I3280" : "/download/file/pdf/v:bdr:V22704_I3280::1-740",
        "bdr:V22704_I3283" : "/download/file/pdf/v:bdr:V22704_I3283::1-680",
        "bdr:V22704_I3282" : "/download/file/pdf/v:bdr:V22704_I3282::1-496",
        "bdr:V22704_I3285" : "/download/file/pdf/v:bdr:V22704_I3285::1-500",
        "bdr:V22704_I3284" : "/download/file/pdf/v:bdr:V22704_I3284::1-458",
        "bdr:V22704_I3287" : "/download/file/pdf/v:bdr:V22704_I3287::1-928",
        "bdr:V22704_I3286" : "/download/file/pdf/v:bdr:V22704_I3286::1-962",
        "bdr:V22704_I3299" : "/download/file/pdf/v:bdr:V22704_I3299::1-722",
        "bdr:V22704_I3292" : "/download/file/pdf/v:bdr:V22704_I3292::1-1030",
        "bdr:V22704_I3291" : "/download/file/pdf/v:bdr:V22704_I3291::1-744",
        "bdr:V22704_I3294" : "/download/file/pdf/v:bdr:V22704_I3294::1-576",
        "bdr:V22704_I3293" : "/download/file/pdf/v:bdr:V22704_I3293::1-670",
        "bdr:V22704_I3296" : "/download/file/pdf/v:bdr:V22704_I3296::1-884",
        "bdr:V22704_I3295" : "/download/file/pdf/v:bdr:V22704_I3295::1-796",
        "bdr:V22704_I3298" : "/download/file/pdf/v:bdr:V22704_I3298::1-550",
        "bdr:V22704_I3297" : "/download/file/pdf/v:bdr:V22704_I3297::1-776",
        "bdr:V22704_I3290" : "/download/file/pdf/v:bdr:V22704_I3290::1-744"
     }*/

      console.log("pdf",data)

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
                  store.dispatch(dataActions.firstImage(image,iri))
               }
         }
      }
   }
   catch(e){
      console.log("ERRROR with manifest",e)

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
