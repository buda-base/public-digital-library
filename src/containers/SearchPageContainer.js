// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';
import * as ui from '../state/ui/actions';
import store from '../index';
import { i18nextChangeLanguage } from 'i18next-redux-saga';

import {auth} from '../routes';

import SearchPage from '../lib/searchkit/pages/Search';


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

   let langPreset = state.ui.langPreset
   let langIndex = state.ui.langIndex
   let langExt = state.ui.langExt

   let dictionary = state.data.dictionary ;

   let props = { config, locale, profileName, portraitPopupClosed, isNewUser, feedbucket, 
      langPreset,langIndex,langExt,
      dictionary
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
         localStorage.setItem('lang', langs);
         dispatch(ui.langPreset(langs,i))
      },
      onUserProfile:(url:{}) => {
         dispatch(ui.userProfile(url));
      },
      onFeedbucketClick(cls:string) {
         dispatch(ui.feedbucket(cls))
      }
   }
}

const SearchPageContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(SearchPage);

export default SearchPageContainer;
