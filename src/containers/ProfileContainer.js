// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';
import * as ui from '../state/ui/actions';
import store from '../index';
import { i18nextChangeLanguage } from 'i18next-redux-saga';

// import selectors from 'state/selectors';

import Profile from '../components/ProfileStatic';

import {auth} from '../routes';

const tmp   = "http://purl.bdrc.io/ontology/tmp/" ;

const mapStateToProps = (state,ownProps) => {

   let config = state.data.config

   let userID = state.ui.userID
   
   let profile = state.data.resources
   if(profile && userID) profile = profile[userID]
   if(profile) { 
      profile = profile[userID]
   }
   else profile = null

   let dictionary = state.data.dictionary ;

   let rightPanel = state.ui.rightPanel

   let resetLink = state.data.resetLink

   let locale = state.i18next.lang
   
   if(profile && resetLink && !profile[tmp+"passwordResetLink"]) resetLink = false
   
   let profileName
   if(auth && auth.userProfile) {
      if(auth.userProfile.name) profileName = auth.userProfile.name
   }

   let langPreset = state.ui.langPreset
   let langIndex = state.ui.langIndex

   let portraitPopupClosed = state.ui.portraitPopupClosed

   let isNewUser = state.ui.isNewUser

   let advancedSearch = state.ui.advancedSearch ?? ownProps.advancedSearch
   let advKeyword = state.ui.advKeyword
   
   let feedbucket = state.ui.feedbucket

   let props = { userID, profile, dictionary, rightPanel, resetLink, config, locale, profileName, langPreset, langIndex, 
      portraitPopupClosed, isNewUser, feedbucket,

      advancedSearch, advKeyword,
   }

   return props

};

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
      onToggleLanguagePanel:() => {
         dispatch(ui.toggleLanguagePanel());
      },
      onSetLocale:(lg:string) => {
         dispatch(i18nextChangeLanguage(lg));
      },
      onUserProfile:(url:{}) => {
         dispatch(ui.userProfile(url));
      },
      onSetLangPreset:(langs:string[],i?:number) => {
         localStorage.setItem('langs', langs);
         dispatch(ui.langPreset(langs,i))
      },
      onFeedbucketClick(cls:string) {
         dispatch(ui.feedbucket(cls))
      },
      onAdvancedSearch(s:boolean) {
         dispatch(ui.advancedSearch(s))
      },
   }
}

const ProfileContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Profile);

export default ProfileContainer;
