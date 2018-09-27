// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';
import store from '../index';

// import selectors from 'state/selectors';

import ResourceViewer from '../components/ResourceViewer';

const mapStateToProps = (state,ownProps) => {

   let config = state.data.config ;
   let failures = state.data.failures
   let resources = state.data.resources
   let ontology = state.data.ontology ;
   let keyword = state.data.keyword
   let language = state.data.language
   let datatype = state.ui.datatype
   let assocResources = state.data.assocResources
   if(assocResources) assocResources = assocResources[ownProps.IRI]

   let searches = state.data.searches
   if(searches && resources && searches["bdr:"+ownProps.IRI+"@"])
      resources[ownProps.IRI+"@"] = searches["bdr:"+ownProps.IRI+"@"].results.bindings

   let prefLang = state.ui.prefLang


   let firstImage
   let imageAsset
   let manifestError
   let pdfVolumes
   let IIIFinfo = state.data.IIIFinfo

   if(IIIFinfo) {
      IIIFinfo = IIIFinfo[ownProps.IRI]
      if(IIIFinfo) {
         firstImage = IIIFinfo.firstImage
         imageAsset = IIIFinfo.imageAsset
         manifestError = IIIFinfo.manifestError
         pdfVolumes = IIIFinfo.pdfVolumes

         //console.log("IIIF",pdfVolumes,IIIFinfo)
      }
   }

   let createPdf = state.data.createPdf
   let pdfUrl = state.data.pdfUrl


   let props = { config,resources, ontology, keyword, language, datatype, assocResources, prefLang, failures,imageAsset,firstImage,manifestError,pdfVolumes,createPdf,pdfUrl }

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
      }
   }
}

const ResourceViewerContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(ResourceViewer);

export default ResourceViewerContainer;
