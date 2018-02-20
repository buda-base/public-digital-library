// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';
import store from '../index';

// import selectors from 'state/selectors';

import App from '../components/App';

const mapStateToProps = (state) => {

   let hostFailure = state.data.failures.host ;
   let config = state.data.config ;
   let searches = state.data.searches ;
   let keyword = state.data.searches.keyword
   let gettingDatatypes = state.data.gettingDatatypes ;
   let datatypes = state.data.datatypes ;

   let loading ;
   if(keyword) {
         loading = state.data.loading[keyword] ;


   }

   return { config, hostFailure, searches, keyword, loading,gettingDatatypes,datatypes }

};

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
      onSearchingKeyword:(k:string) => {
         dispatch(data.searchingKeyword(k))
      },
      onGetDatatypes:(k:string) => {
         dispatch(data.getDatatypes(k))
      }
   }
}

const AppContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(App);

export default AppContainer;
