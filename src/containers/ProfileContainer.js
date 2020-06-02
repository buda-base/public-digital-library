// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';
import * as ui from '../state/ui/actions';
import store from '../index';

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

   if(profile && resetLink && !profile[tmp+"passwordResetLink"]) resetLink = false

   let props = { userID, profile, dictionary, rightPanel, resetLink, config }

   return props

};

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
      onToggleLanguagePanel:() => {
         dispatch(ui.toggleLanguagePanel());
      },
      onUserProfile:(url:{}) => {
         dispatch(ui.userProfile(url));
      },
   }
}

const ProfileContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Profile);

export default ProfileContainer;
