// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';
import store from '../index';

// import selectors from 'state/selectors';

import ResourceViewer from '../components/ResourceViewer';

const mapStateToProps = (state) => {

   return { youpi:true}

};

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
      onGetResource(s:string){
         dispatch(data.getResource(s))
      }
   }
}

const ResourceViewerContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(ResourceViewer);

export default ResourceViewerContainer;
