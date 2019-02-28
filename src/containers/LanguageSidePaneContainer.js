// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';
import * as ui from '../state/ui/actions';
import store from '../index';
import LanguageSidePane from '../components/LanguageSidePane';

const mapStateToProps = (state,ownProps) => {

      let rightPanel = state.ui.rightPanel

      let props = { ...ownProps, open:rightPanel }

      console.log("mS2p",state,props)

      return props

   };

   const mapDispatchToProps = (dispatch, ownProps) => {
      return {
         onToggleLanguagePanel:() => {
            dispatch(ui.toggleLanguagePanel());
         }
      }
   }

   const LanguageSidePaneContainer = connect(
       mapStateToProps,
       mapDispatchToProps
   )(LanguageSidePane);

   export default LanguageSidePaneContainer;
