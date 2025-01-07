// @flow
import React from 'react';
import { connect } from 'react-redux';
import { initiateApp } from '../state/actions';
import * as data from '../state/data/actions';
import * as ui from '../state/ui/actions';
import store from '../index';
import keywordtolucenequery from '../components/App';

//import { setLocale } from 'react-redux-i18n';
import { i18nextChangeLanguage } from 'i18next-redux-saga';

import qs from 'query-string'

// import selectors from 'state/selectors';

import ResourceViewer from '../components/ResourceViewer';
import UserViewer from '../components/UserViewer';
import { shortUri, fullUri } from "../components/App"

import {auth} from '../routes';

import logdown from 'logdown'

const loggergen = new logdown('gen', { markdown: false });

const mapStateToProps = (state,ownProps) => {

  let logged = state.ui.logged ;
   let config = state.data.config ;
   let failures = state.data.failures
   let resources = state.data.resources
   let ontology = state.data.ontology ;
   let dictionary = state.data.dictionary ;
   let keyword = state.data.keyword
   let language = state.data.language
   let datatype = state.ui.datatype

   let annoCollec = state.data.annoCollec
   if(annoCollec) annoCollec = annoCollec[ownProps.IRI]

   let searches = state.data.searches
   if(searches && resources && searches["bdr:"+ownProps.IRI+"@"])
      resources[ownProps.IRI+"@"] = searches["bdr:"+ownProps.IRI+"@"].results.bindings

   let assocResources = state.data.assocResources
   //if(assocResources) assocResources = Object.keys(assocResources).reduce( (acc,k) => ({...acc, ...assocResources[k]}),{})
   if(assocResources) { 
      let flatAssocResources = {}
      for(let id of Object.keys(assocResources)) {
         if(!id.startsWith('"')) { 
            //loggergen.log("id?",id)
            for(let k of Object.keys(assocResources[id])) {
               let val = flatAssocResources[k]
               flatAssocResources[k] = [ ...(val?val:[]).filter(v => !assocResources[id][k].some(w => v.value === w.value && v.lang === w.lang)), ...assocResources[id][k] ]
            }
         }
      }
      assocResources = flatAssocResources
   }

   // add data from work in instance
   const uri = fullUri(ownProps.IRI)
   const bdo = "http://purl.bdrc.io/ontology/core/" 
   const bdr   = "http://purl.bdrc.io/resource/"
   const rdf   = "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
   const tmp   = "http://purl.bdrc.io/ontology/tmp/" ;
   if(resources && resources[ownProps.IRI] && resources[ownProps.IRI][uri] && resources[ownProps.IRI][uri][bdo+"instanceOf"]?.length 
         && ! resources[ownProps.IRI][uri][rdf+"type"]?.some(t => t.value === bdo+"ImageInstance")) {      
      const workUri = resources[ownProps.IRI][uri][bdo+"instanceOf"][0].value
      const workRid = shortUri(workUri)
      const work = resources[workRid] ?? {}
      resources[ownProps.IRI] = { ...work, ...resources[ownProps.IRI] }

      if(work && work[workUri] && work[workUri][bdo+"creator"]) { 
         const merge = {}
         for(const k of work[workUri][bdo+"creator"]) merge[k.value] = k
         for(const k of resources[ownProps.IRI][uri][bdo+"creator"] ?? []) merge[k.value] = k
         resources[ownProps.IRI][uri][bdo+"creator"] = Object.values(merge)
      }

      if(work && work[workUri] && work[workUri][bdo+"workHasInstance"]) { 
         const inst = work[workUri][bdo+"workHasInstance"].filter(t => t.value != uri && t.value.startsWith(bdr+"MW"))
         if(inst?.length) resources[ownProps.IRI][uri][bdo+"workHasInstance"] = inst
      }

      if(work && work[workUri]) for(const prop of [bdo+"catalogInfo", bdo+"workIsAbout", bdo+"workGenre", bdo+"workHasParallelsIn"]) {
         const val = work[workUri][prop]
         if(val?.length) resources[ownProps.IRI][uri][prop] = val
      }
   }

   if(resources && resources[ownProps.IRI] && resources[ownProps.IRI][uri] && resources[ownProps.IRI][uri][bdo+"inRootInstance"]) {
      resources[ownProps.IRI][uri][tmp+"containingOutline"] = [...resources[ownProps.IRI][uri][bdo+"inRootInstance"]]
   }

   /* not the pb...
   let same
   if(resources && resources[ownProps.IRI] && (same = Object.keys(resources[ownProps.IRI]).filter(k => k.match(/[#/]sameAs[^/]*$/))).length) for(let s of same)
   {
      assocResources = { ...assocResources,  ...state.data.assocResources[s.value] }
   } 
   */

   let prefLang = state.ui.prefLang
   let rightPanel = state.ui.rightPanel

   let nextChunk = state.data.nextChunk
   let nextPage = state.data.nextPage

   let firstImage
   let canvasID
   let collecManif
   let manifests
   let imgData
   let imageAsset
   let manifestError
   let pdfVolumes
   let resourceManifest
   let imageVolumeManifests, imageLists
   let IIIFinfo = state.data.IIIFinfo
   let manifestWpdf
   let IIIFerrors
   let monovolume

   if(IIIFinfo) {

      IIIFerrors = Object.keys(IIIFinfo).reduce( (acc,k) => ({...acc,[k]:IIIFinfo[k].manifestError}), {}) 

      IIIFinfo = IIIFinfo[ownProps.IRI]
      if(IIIFinfo) {
         firstImage = IIIFinfo.firstImage
         canvasID = IIIFinfo.canvasID
         imageAsset = IIIFinfo.imageAsset
         collecManif = IIIFinfo.collecManif
         manifests = IIIFinfo.manifests
         manifestError = IIIFinfo.manifestError
         pdfVolumes = IIIFinfo.pdfVolumes
         imgData = IIIFinfo.imgData
         resourceManifest = IIIFinfo.resourceManifest
         imageVolumeManifests = IIIFinfo.imageVolumeManifests
         imageLists = IIIFinfo.imageLists
         manifestWpdf = IIIFinfo.manifestWpdf
         monovolume = IIIFinfo.single

         //loggergen.log("IIIF",pdfVolumes,IIIFinfo)
      }
   }

   let userEditPolicies = state.data.userEditPolicies

   let createPdf = state.data.createPdf
   let pdfUrl = state.data.pdfUrl

   let locale = state.i18next.lang
   let langPreset = state.ui.langPreset
   let langIndex = state.ui.langIndex
   let langExt = state.ui.langExt

   let highlight = state.ui.highlight
   if(highlight && highlight.uri !== ownProps.IRI) highlight = null 

   let outline = state.data.outlines
   if(outline && outline[ownProps.IRI] !== undefined) { 
      outline = outline[ownProps.IRI]
      if(ownProps.IRI.match(/^bdr:MW[^_]+(_[^_]+)?$/)) {
         let root = ownProps.IRI.replace(/^((bdr:MW[^_]+)(_[^_]+)?)$/,"$2") // doesn't work in Taisho 
         let outL = state.data.outlines[root]
         if(!outL) outline = true
         else if(outL["@graph"] && ! outL["@graph"].filter(o => /*o["@id"] === root && */ o.hasPart).length ) outline = true 
         else if(!outL["@graph"]) outline = true
         //else outline = outline[ownProps.IRI]
      }
   }
   else outline = false

   let eTextRefs = state.data.eTextRefs, allETrefs
   if(eTextRefs) { 
      eTextRefs = eTextRefs[ownProps.IRI]     
      /* // to fetch outline from a UT record as well
      if(!eTextRefs && resources && resources[ownProps.IRI]) {
         let inst = resources[ownProps.IRI]
         if(inst) inst = resources[ownProps.IRI][fullUri(ownProps.IRI)]
         const bdo   = "http://purl.bdrc.io/ontology/core/"
         if(inst) inst = inst[bdo+"eTextInInstance"]
         if(inst?.length) inst = shortUri(inst[0].value)
         if(inst) eTextRefs = eTextRefs = state.data.eTextRefs[inst]
      } 
      */  
      if(!eTextRefs) allETrefs = state.data.eTextRefs   
   }

   let loading = state.ui.loading  ;

   let outlines = state.data.outlines
   let outlineKW = state.data.outlineKW

   let assocTypes
   let datatypes = state.data.assocTypes ;
   if(datatypes && datatypes[ownProps.IRI+"@"]) assocTypes = datatypes

   let citationData = state.data.citationData
      
   let profileName
   if(auth && auth.userProfile) {
      if(auth.userProfile.name) profileName = auth.userProfile.name
   }

   let etextLang = state.ui.etextLang


   let etextErrors = state.data.etextErrors

   let snippets = state.data.snippets

   let portraitPopupClosed = state.ui.portraitPopupClosed

   let useDLD = state.ui.useDLD

   let feedbucket = state.ui.feedbucket

   let isNewUser = state.ui.isNewUser

   let advancedSearch = state.ui.advancedSearch ?? ownProps.advancedSearch
   let advKeyword = state.ui.advKeyword

   let monlamResults = state.data.monlamResults
   let monlamKeyword = state.data.monlamKeyword

   let props = { logged,config,resources, ontology, dictionary, keyword, language, datatype, assocResources, prefLang, failures, loading,
      imageAsset,firstImage,canvasID,collecManif,manifests,manifestError,pdfVolumes,createPdf,pdfUrl, manifestWpdf, monovolume,
      annoCollec,rightPanel,locale,langPreset,langIndex,langExt,imgData, nextChunk, nextPage, resourceManifest, imageVolumeManifests, imageLists, userEditPolicies, highlight,
      outline,outlines,outlineKW,      
      eTextRefs, allETrefs,
      assocTypes,
      IIIFerrors,
      citationData,
      profileName,
      etextLang,
      etextErrors,
      portraitPopupClosed,
      useDLD,
      feedbucket,
      monlamResults, monlamKeyword,
      isNewUser, 
      advancedSearch, advKeyword,
      snippets
   }

   if(config && !config.auth) props.auth = false

   loggergen.log("mS2p:",ownProps.IRI,ownProps.pdfDownloadOnly,state,props,ownProps)

   return props

};

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
      onResetSearch:() => {
         dispatch(data.resetSearch())
      },
      onGetAssocTypes:(rid:string, tag?:string) => {
         dispatch(data.getAssocTypes(rid,tag))
      },
      onRequestPdf:(iri:string,url:string) => {
         dispatch(data.requestPdf(iri,url.replace(/zip/,"pdf")));
         dispatch(data.requestPdf(iri,url.replace(/pdf/,"zip")))
      },
      onInitPdf:(url:string,iri:string) => {
         dispatch(data.initPdf(url,iri));
      },
      onCreatePdf:(url:string,iri:string) => {
         dispatch(data.createPdf(url,iri));
      },
      onResetPdf:(e:{},t:string) => {
         dispatch(data.pdfReady(!e[t+"File"]||e[t+"File"]===true?e.link.replace(/zip/,"file/"+t):e[t+"File"],{url:e.link,iri:ownProps.IRI,reset:true}));
      },
      onErrorPdf:(code:number,url:string,iri:string) => {
         dispatch(data.pdfError(code,{url,iri}));
      },
      onHasImageAsset:(url:string,IRI:string,thumb:string) => {
         dispatch(data.getManifest(url,IRI,thumb));
      },
      onImageVolumeManifest:(url:string,IRI:string) => {
         dispatch(data.getImageVolumeManifest(url,IRI));
      },
      onGetAnnotations:(IRI:string) => {
         dispatch(data.getAnnotations(IRI));
      },
      onGetSnippet:(IRI:string) => {
         dispatch(data.getSnippet(IRI));
      },
      onGetChunks:(IRI:string,next:number=0) => {
         dispatch(data.getChunks(IRI,next));
      },
      onGetPages:(IRI:string,next:number=0,reset?:boolean, meta?:{}) => {
         dispatch(data.getPages(IRI,next,reset,meta));
      },
      onGetContext:(iri:string,start:integer,end:integer,nb:integer) => {
         dispatch(data.getContext(iri,start,end,nb));
      },
      onGetOutline:(IRI:string,node?:{},volFromUri?:string) => {
         dispatch(data.getOutline(IRI,node,volFromUri));
      },
      onGetETextRefs:(IRI:string) => {
         dispatch(data.getETextRefs(IRI));
      },
      onGetResource:(IRI:string) => {
         dispatch(data.getResource(IRI));
      },
      onUserProfile:(url:{}) => {
         dispatch(ui.userProfile(url));
      },
      onToggleLanguagePanel:() => {
         dispatch(ui.toggleLanguagePanel());
      },
      onSetLocale:(lg:string) => {
         //dispatch(setLocale(lg));
         dispatch(i18nextChangeLanguage(lg));
      },
      onSetLangPreset:(langs:string[],i?:number) => {
         localStorage.setItem('lang', langs);
         dispatch(ui.langPreset(langs,i))
      },
      onSetEtextLang:(lang:string) => {
         dispatch(ui.setEtextLang(lang))
      },
      onOutlineSearch:(iri:string,keyword:string,language:string) => {
         dispatch(data.outlineSearch(iri, keywordtolucenequery(keyword.trim(), language), language));
      },
      onResetOutlineKW:() => {
         dispatch(data.resetOutlineSearch());
      },
      onLoading:(kw:string,load:boolean) => {
         dispatch(ui.loading(kw,load))
      },
      onGetCitationLocale:(lang:string) => {
         dispatch(data.getCitationLocale(lang))
      },
      onGetCitationStyle:(s:string) => {
         dispatch(data.getCitationStyle(s))
      },
      onGetCitationData:(id:string) => {
         dispatch(data.getCitationData(id))
      },
      onCallMonlamAPI:(obj:{}, keyword: {}) => {
         dispatch(data.getMonlamResults(obj, keyword))
      },
      onCloseMonlam:() => {
         dispatch(data.closeMonlamResults())
      },
      onFeedbucketClick(cls:string) {
         dispatch(ui.feedbucket(cls))
      },
      onAdvancedSearch(s:boolean) {
         dispatch(ui.advancedSearch(s))
      },
      // onResetEtext(id:string) {
      //    store.dispatch(data.gotNextPages(id,{ reset: true}));
      // },
      onReinitEtext(id:string, params?:{}, preview) {
         const nav = document.querySelector("#etext-scroll > div:first-child")//(".over-nav")
         setTimeout(() => {             
            let get = qs.parse(ownProps.location.search)                  
            
            if(get.part && get.part !== id) {
               get.root = id   
            }
            if(params) get = { ...get, ...params }
            if(!preview) {
               store.dispatch(initiateApp(get,id)) 
            } else { 
               // TODO: handle unpaginated etexts
               store.dispatch(data.getPages(id,params?.startChar ?? 0,true));  
            }
         
            setTimeout(() => {             
               if(nav && !get.part && document.querySelector(".etext-nav-parent.someClass")) nav.scrollIntoView()
            }, 1000)

         }, 150);         
      }
   }
}

const ResourceViewerContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(ResourceViewer);

export default ResourceViewerContainer;


export const UserViewerContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(UserViewer);
