// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';
import store from '../index';

// import selectors from 'state/selectors';

import ResourceViewer from '../components/ResourceViewer';

const mapStateToProps = (state,ownProps) => {

   console.log("state",state)

   let resources = state.data.resources
   let ontology = state.data.ontology ;
   let keyword = state.data.keyword
   let language = state.data.language
   let datatype = state.ui.datatype
   let assocResources = state.data.assocResources
   if(assocResources) assocResources = assocResources[ownProps.IRI]
   let prefLang = state.ui.prefLang

   let props = { resources, ontology, keyword, language, datatype, assocResources, prefLang }

   return props

};

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
   }
}

const ResourceViewerContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(ResourceViewer);

export default ResourceViewerContainer;
