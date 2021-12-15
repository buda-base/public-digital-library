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

import Browse from '../components/Browse';


const mapStateToProps = (state,ownProps) => {

   let config = state.data.config
   let locale = state.i18next.lang   
   let langPreset = state.ui.langPreset

   let profileName
   if(auth && auth.userProfile) {
      if(auth.userProfile.name) profileName = auth.userProfile.name
   }

   let browse = state.ui.browse, path, checked
   if(browse) {
      path = browse.path
      checked = browse.checked
   }

   const time = Date.now()

   let props = { config, locale, profileName, path, checked, time, langPreset }
   console.log("props:",props)
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
      onSetLangPreset:(langs:string[],i?:number) => {
         localStorage.setItem('lang', langs);
         dispatch(ui.langPreset(langs,i))
      },
      onUserProfile:(url:{}) => {
         dispatch(ui.userProfile(url));
      },
      onBrowse:(param:string,value?:string,checked?:boolean) => {
         dispatch(ui.browse(param,value,checked));
      }
   }
}

const BrowseContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Browse);

export default BrowseContainer;
