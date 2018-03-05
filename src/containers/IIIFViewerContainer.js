// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';
import * as ui from '../state/ui/actions';
import store from '../index';

// import selectors from 'state/selectors';

import IIIFViewer from '../components/IIIFViewer';

const mapStateToProps = (state,ownProps) => {

   console.log("state?",state)

   let loadingGallery = state.ui.loadingGallery

   state = {
      ...ownProps,
      loadingGallery
   }

   console.log("IIIF.mS2P",state);

   return state ;

};

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
      onLoadingGallery : (manifest:string) => {
         console.log("loadinGa")
         dispatch(ui.loadingGallery(manifest))
      }
   }
}

const IIIFViewerContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(IIIFViewer);

export default IIIFViewerContainer;
