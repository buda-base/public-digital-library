// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';
import * as ui from '../state/ui/actions';
import {initiateApp} from '../state/actions';
import store from '../index';
import { i18nextChangeLanguage } from 'i18next-redux-saga';

import {auth} from '../routes';

// import selectors from 'state/selectors';

import GuidedSearch from '../components/GuidedSearch';


const mapStateToProps = (state,ownProps) => {

   let config = state.data.config
   let locale = state.i18next.lang   
   let type = state.ui.type
   let langPreset = state.ui.langPreset
   let checkResults = state.data.checkResults

   let profileName
   if(auth && auth.userProfile) {
      if(auth.userProfile.name) profileName = auth.userProfile.name
   }
   
   // not needed
   //let dictionary = state.data.dictionary ;

   let portraitPopupClosed = state.ui.portraitPopupClosed

   let props = { config, locale, profileName, type, checkResults, langPreset, portraitPopupClosed }  //dictionary }

   return props

};

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
      onInitiateApp:(params,iri,auth,route)=>{
        dispatch(initiateApp(params,iri,auth,route))
      },
      onSetLocale:(lg:string) => {
         dispatch(i18nextChangeLanguage(lg));
      },
      onSetType:(t:string) => {
         dispatch(ui.setType(t));
      },
      onSetLangPreset:(langs:string[],i?:number) => {
         localStorage.setItem('langs', langs);
         dispatch(ui.langPreset(langs,i))
      },
      onUserProfile:(url:{}) => {
         dispatch(ui.userProfile(url));
      },
      onCheckResults:(params:"", route:"") => {
         dispatch(data.checkResults(params,route));
      }
   }
}

const GuidedSearchContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(GuidedSearch);

export default GuidedSearchContainer;
