// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';
import * as ui from '../state/ui/actions';
import store from '../index';

// import selectors from 'state/selectors';

import ResourceViewer from '../components/ResourceViewer';

const mapStateToProps = (state,ownProps) => {

  let logged = state.ui.logged ;
   let config = state.data.config ;
   let failures = state.data.failures
   let resources = state.data.resources
   let ontology = state.data.ontology ;
   let keyword = state.data.keyword
   let language = state.data.language
   let datatype = state.ui.datatype
   let assocResources = state.data.assocResources
   if(assocResources) assocResources = assocResources[ownProps.IRI]
   let annoCollec = state.data.annoCollec
   if(annoCollec) annoCollec = annoCollec[ownProps.IRI]

   let searches = state.data.searches
   if(searches && resources && searches["bdr:"+ownProps.IRI+"@"])
      resources[ownProps.IRI+"@"] = searches["bdr:"+ownProps.IRI+"@"].results.bindings

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

         //console.log("IIIF",pdfVolumes,IIIFinfo)
      }
   }

   let createPdf = state.data.createPdf
   let pdfUrl = state.data.pdfUrl

   let locale = state.i18n.locale
   let langPreset = state.ui.langPreset

   let props = { logged,config,resources, ontology, keyword, language, datatype, assocResources, prefLang, failures,
      imageAsset,firstImage,canvasID,collecManif,manifests,manifestError,pdfVolumes,createPdf,pdfUrl,
      annoCollec,rightPanel,locale,langPreset,imgData, nextChunk, nextPage }

   console.log("mS2p",state,props)

   return props

};

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
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
      onGetAnnotations:(IRI:string) => {
         dispatch(data.getAnnotations(IRI));
      },
      onGetChunks:(IRI:string,next:number=0) => {
         dispatch(data.getChunks(IRI,next));
      },
      onGetPages:(IRI:string,next:number=0) => {
         dispatch(data.getPages(IRI,next));
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
