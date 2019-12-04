// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';
import * as ui from '../state/ui/actions';
import store from '../index';

// import selectors from 'state/selectors';

import ResourceViewer from '../components/ResourceViewer';
import UserViewer from '../components/UserViewer';

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
         for(let k of Object.keys(assocResources[id])) {
            let val = flatAssocResources[k]
            flatAssocResources[k] = [ ...(val?val:[]), ...assocResources[id][k] ]
         }
      }
      assocResources = flatAssocResources
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
   let imageVolumeManifests
   let IIIFinfo = state.data.IIIFinfo

   if(IIIFinfo) {
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

         //console.log("IIIF",pdfVolumes,IIIFinfo)
      }
   }

   let userEditPolicies = state.data.userEditPolicies

   let createPdf = state.data.createPdf
   let pdfUrl = state.data.pdfUrl

   let locale = state.i18n.locale
   let langPreset = state.ui.langPreset

   let props = { logged,config,resources, ontology, dictionary, keyword, language, datatype, assocResources, prefLang, failures,
      imageAsset,firstImage,canvasID,collecManif,manifests,manifestError,pdfVolumes,createPdf,pdfUrl,
      annoCollec,rightPanel,locale,langPreset,imgData, nextChunk, nextPage, resourceManifest, imageVolumeManifests, userEditPolicies }

   console.log("mS2p",state,props)

   return props

};

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
      onResetSearch:() => {
         dispatch(data.resetSearch())
      },
      onRequestPdf:(iri:string,url:string) => {
         dispatch(data.requestPdf(iri,url));
         dispatch(data.requestPdf(iri,url.replace(/pdf/,"zip")))
      },
      onInitPdf:(url:string,iri:string) => {
         dispatch(data.initPdf(url,iri));
      },
      onCreatePdf:(url:string,iri:string) => {
         dispatch(data.createPdf(url,iri));
      },
      onHasImageAsset:(url:string,IRI:string) => {
         dispatch(data.getManifest(url,IRI));
      },
      onImageVolumeManifest:(url:string,IRI:string) => {
         dispatch(data.getImageVolumeManifest(url,IRI));
      },
      onGetAnnotations:(IRI:string) => {
         dispatch(data.getAnnotations(IRI));
      },
      onGetChunks:(IRI:string,next:number=0) => {
         dispatch(data.getChunks(IRI,next));
      },
      onGetPages:(IRI:string,next:number=0) => {
         dispatch(data.getPages(IRI,next));
      },
      onGetResource:(IRI:string) => {
         dispatch(data.getResource(IRI));
      },
      onUserProfile:(url:{}) => {
         dispatch(ui.userProfile(url));
      },
      onToggleLanguagePanel:() => {
         dispatch(ui.toggleLanguagePanel());
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
