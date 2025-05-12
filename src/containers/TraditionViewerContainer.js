// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';
import * as ui from '../state/ui/actions';
import store from '../index';
import { i18nextChangeLanguage } from 'i18next-redux-saga';

import {auth} from '../routes';

import TraditionViewer from '../components/TraditionViewer';


const mapStateToProps = (state,ownProps) => {

   let config = state.data.config
   let locale = state.i18next.lang   

   let profileName
   if(auth && auth.userProfile) {
      if(auth.userProfile.name) profileName = auth.userProfile.name
   }

   let portraitPopupClosed = state.ui.portraitPopupClosed
   
   let isNewUser = state.ui.isNewUser

   let feedbucket = state.ui.feedbucket

   let latestSyncs = state.data.latestSyncs
   let latestSyncsNb = state.data.latestSyncsNb
   let latestSyncsMeta = state.data.latestSyncsMeta      

   let langPreset = state.ui.langPreset
   let langIndex = state.ui.langIndex
   let langExt = state.ui.langExt

   let dictionary = state.data.dictionary ;

   let advancedSearch = state.ui.advancedSearch ?? ownProps.advancedSearch
   let advKeyword = state.ui.advKeyword

   let props = { config, locale, profileName, portraitPopupClosed, isNewUser, feedbucket,
      latestSyncs,latestSyncsNb,latestSyncsMeta,
      langPreset,langIndex,langExt,
      dictionary,
      advancedSearch, advKeyword,
   }

   return props

};

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
      onInitiateApp:(params,iri,auth,route)=>{
        dispatch(params,iri,auth,route)
      },
      onSetLocale:(lg:string) => {
         dispatch(i18nextChangeLanguage(lg));
      },
      onSetLangPreset:(langs:string[],i?:number) => {
         localStorage.setItem('langs', langs);
         dispatch(ui.langPreset(langs,i))
      },
      onUserProfile:(url:{}) => {
         dispatch(ui.userProfile(url));
      },
      onFeedbucketClick(cls:string) {
         dispatch(ui.feedbucket(cls))
      },
      onGetLatestSyncs(meta) {
         dispatch(data.getLatestSyncs(meta))
      },
      onAdvancedSearch(s:boolean) {
         dispatch(ui.advancedSearch(s))
      },

   }
}

const TraditionViewerContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(TraditionViewer);

export default TraditionViewerContainer;
