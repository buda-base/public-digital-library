// @flow
import React from 'react';
import { connect } from 'react-redux';
import {initiateApp} from '../state/actions';
import * as data from '../state/data/actions';
import * as ui from '../state/ui/actions';
import store from '../index';

//import { setLocale } from 'react-redux-i18n';
import { i18nextChangeLanguage } from 'i18next-redux-saga';

// import selectors from 'state/selectors';

import {TestProxy} from '../components/TestProxy';


import {auth} from '../routes';

import logdown from 'logdown'

const loggergen = new logdown('gen', { markdown: false });

const mapStateToProps = (state,ownProps) => {


   let config = state.data.config ;

   let subscribedCollections = state.data.subscribedCollections


   let newState = { 
      config,
      subscribedCollections
   }

   return newState ;

};

const mapDispatchToProps = (dispatch, ownProps) => {
   return {
   }
}

const TestProxyContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(TestProxy);

export default TestProxyContainer;
