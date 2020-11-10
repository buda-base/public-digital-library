// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';
import * as ui from '../state/ui/actions';
import store from '../index';
import { i18nextChangeLanguage } from 'i18next-redux-saga';

// import selectors from 'state/selectors';

import StaticRouteNoExt from '../components/StaticRouteNoExt';


const mapStateToProps = (state,ownProps) => {

   let config = state.data.config
   let locale = state.i18next.lang   

   let props = { config, locale }

   return props

};

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
      onSetLocale:(lg:string) => {
         dispatch(i18nextChangeLanguage(lg));
      },
      onSetLangPreset:(langs:string[],i?:number) => {
         localStorage.setItem('lang', langs);
         dispatch(ui.langPreset(langs,i))
      },
   }
}

const StaticRouteContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(StaticRouteNoExt);

export default StaticRouteContainer;
