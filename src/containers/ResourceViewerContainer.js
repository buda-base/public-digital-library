// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';
import store from '../index';

// import selectors from 'state/selectors';

import ResourceViewer from '../components/ResourceViewer';

const mapStateToProps = (state,ownProps) => {

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
   let IIIFinfo = state.data.IIIFinfo

   if(IIIFinfo) {
      IIIFinfo = IIIFinfo[ownProps.IRI]
      if(IIIFinfo) {
         firstImage = IIIFinfo.firstImage
         imageAsset = IIIFinfo.imageAsset
         manifestError = IIIFinfo.manifestError
      }
   }

   let props = { resources, ontology, keyword, language, datatype, assocResources, prefLang, failures,imageAsset,firstImage,manifestError }

   console.log("mS2p",state,props)

   return props

};

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
      onHasImageAsset:(url:string,IRI:string) => {
         dispatch(data.getManifest(url,IRI));
      }
   }
}

const ResourceViewerContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(ResourceViewer);

export default ResourceViewerContainer;
