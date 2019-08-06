// @flow
import React from 'react';
import { connect } from 'react-redux';
import {initiateApp} from '../state/actions';
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
   if(datatypes && datatypes[keyword+"@"+language]) datatypes = datatypes[keyword+"@"+language]
   let ontology = state.data.ontology ;
   let dictionary = state.data.dictionary ;
   let facets = state.data.facets ;
   let resources = state.data.resources ;
   let ontoSearch = state.data.ontoSearch ;

   let loading = state.ui.loading  ;
   let prefLang = state.ui.prefLang  ;
   let rightPanel = state.ui.rightPanel

   let locale = state.i18n.locale
   let langPreset = state.ui.langPreset
   let langIndex = state.ui.langIndex

   let failures = state.data.failures ;

   let metadata = state.ui.metadata

   let newState = { logged,config, hostFailure, searches, keyword, language,loading,datatypes,ontology,facets,
      locale,prefLang,resources,ontoSearch,rightPanel,langPreset, langIndex, failures,dictionary,metadata }

   if(!global.inTest) console.log("mS2p",state,newState)

   return newState ;

};

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
      onResetSearch:() => {
         dispatch(data.resetSearch())
      },
      onOntoSearch:(k:string) => {
         dispatch(data.ontoSearch(k));
      },
      onStartSearch:(k:string,lg:string,t?:string[],s?:string) => {
         dispatch(data.startSearch(k,lg,t,s));
         //if(t && t.length > 0) dispatch(ui.selectType(t[0]));
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
      onGetResource:(iri:string) => {
         dispatch(data.getResource(iri));
      },
      onSetPrefLang:(lg:string) => {
         dispatch(ui.setPrefLang(lg));
      },
      onToggleLanguagePanel:() => {
         dispatch(ui.toggleLanguagePanel());
      },
      onUpdateFacets:(key:string,t:string,f:{[string]:string[]},m:{[string]:{}},cfg:{[string]:string})=> {
         dispatch(ui.updateFacets(key,t,f,m,cfg));
      }
   }
}

const AppContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(App);

export default AppContainer;
