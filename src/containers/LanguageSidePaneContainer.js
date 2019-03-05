// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';
import * as ui from '../state/ui/actions';
import { setLocale } from 'react-redux-i18n';
import store from '../index';
import LanguageSidePane from '../components/LanguageSidePane';

const mapStateToProps = (state,ownProps) => {

      let langIndex = state.ui.langIndex
      let langPriority = state.data.config ;
      if(langPriority) {
         langPriority = langPriority.language.data
         if(state.ui.langIndex) langPriority.index = state.ui.langIndex
      }
      let collapse = state.ui.collapse
      let rightPanel = state.ui.rightPanel
      let locale = state.i18n.locale


      let props = { ...ownProps, langIndex, langPriority, open:rightPanel, locale, collapse }

      console.log("mS2p LSP",state,props)

      return props

   };

   const mapDispatchToProps = (dispatch, ownProps) => {
      return {
         onSetLocale:(lg:string) => {
            dispatch(setLocale(lg));
         },
         onSetLangPreset:(langs:string[],i?:number) => {
            dispatch(ui.langPreset(langs,i))
         },
         onToggleLanguagePanel:() => {
            dispatch(ui.toggleLanguagePanel());
         },
         onToggleCollapse:(txt:string) => {
            dispatch(ui.toggleCollapse(txt));
         }
      }
   }

   const LanguageSidePaneContainer = connect(
       mapStateToProps,
       mapDispatchToProps
   )(LanguageSidePane);

   export default LanguageSidePaneContainer;
