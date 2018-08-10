// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';
import * as ui from '../state/ui/actions';
import store from '../index';
import { setLocale } from 'react-redux-i18n';

// import selectors from 'state/selectors';

import App from '../components/App';

const mapStateToProps = (state) => {

   let logged = state.ui.logged ;
   let hostFailure = state.data.failures.host ;
   let config = state.data.config ;
   let searches = state.data.searches ;
   let keyword = state.data.keyword
   let language = state.data.language
   let datatypes = state.data.datatypes ;
   let ontology = state.data.ontology ;
   let facets = state.data.facets ;

   let loading = state.ui.loading  ;
   let prefLang = state.ui.prefLang  ;

   let locale = state.i18n.locale

   let newState = { logged,config, hostFailure, searches, keyword, language,loading,datatypes,ontology,facets,
      locale,prefLang }

   if(!global.inTest) console.log("mS2p",newState)

   return newState ;

};

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
      onStartSearch:(k:string,lg:string,t?:string[],s?:string) => {
         dispatch(data.startSearch(k,lg,t,s));
         if(t && t.length > 0) dispatch(ui.selectType(t[0]));
      },
      onSearchingKeyword:(k:string,lg:string,t:string[]) => {
         dispatch(data.searchingKeyword(k,lg,t))
      },
      onGetDatatypes:(k:string,lg:string) => {
         dispatch(data.getDatatypes(k,lg))
      },
      onGetFacetInfo:(k:string,lg:string,f:string) => {
         dispatch(data.getFacetInfo(k,lg,f))
      },
      onCheckDatatype:(t:string,k:string,lg:string) => {
         dispatch(data.getOneDatatype([t],k,lg));
      },
      onCheckFacet:(k:string,lg:string,f:{[string]:string}) => {
         dispatch(data.getOneFacet(k,lg,f));
      },
      onSetLocale:(lg:string) => {
         dispatch(setLocale(lg));
         //dispatch(ui.setLocale(lg))
      },
      onSetPrefLang:(lg:string) => {
         dispatch(ui.setPrefLang(lg));
      }
   }
}

const AppContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(App);

export default AppContainer;
