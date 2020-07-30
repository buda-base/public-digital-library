// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';
import * as ui from '../state/ui/actions';
import store from '../index';
import { i18nextChangeLanguage } from 'i18next-redux-saga';

// import selectors from 'state/selectors';

import Profile from '../components/ProfileStatic';

const tmp   = "http://purl.bdrc.io/ontology/tmp/" ;

const mapStateToProps = (state,ownProps) => {

   let config = state.data.config

   let userID = state.ui.userID
   
   let profile = state.data.resources
   if(profile && userID) profile = profile[userID]
   if(profile) profile = profile[userID]
   else profile = null

   let dictionary = state.data.dictionary ;

   let rightPanel = state.ui.rightPanel

   let resetLink = state.data.resetLink

   let locale = state.i18next.lang
   
   if(profile && resetLink && !profile[tmp+"passwordResetLink"]) resetLink = false

   let props = { userID, profile, dictionary, rightPanel, resetLink, config, locale }

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
         dispatch(ui.langPreset(langs,i))
      },
   }
}

const ProfileContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Profile);

export default ProfileContainer;
