// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';

// import selectors from 'state/selectors';

import App from '../components/App';

const mapStateToProps = (state) => {

   let hostFailure = state.data.failures.host ;
   let config = state.data.config ;
   let searches = state.data.searches ;
   let keyword = state.data.searches.keyword
   let loading ;
   if(keyword) loading = state.data.loading[keyword] ;

   return { config, hostFailure, searches, keyword, loading }

};

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
      onSearchingKeyword:(k:string) => {
         dispatch(data.searchingKeyword(k))
      }
   }
}

const AppContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(App);

export default AppContainer;
