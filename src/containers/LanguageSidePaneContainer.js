// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';
import * as ui from '../state/ui/actions';

//import { setLocale } from 'react-redux-i18n';
import { i18nextChangeLanguage } from 'i18next-redux-saga';

import store from '../index';
import LanguageSidePane,{LangPrefTree} from '../components/LanguageSidePane';

const mapStateToProps = (state,ownProps) => {

      let langIndex = state.ui.langIndex
      let langPriority = state.data.config ;
      if(langPriority) {
         langPriority = { ...langPriority.language.data }
         if(state.ui.langIndex) langPriority.index = state.ui.langIndex
         else langIndex = langPriority.index
         if(state.ui.langPreset && langIndex === "custom") langPriority.presets["custom"] = state.ui.langPreset
      }
      let collapse = state.ui.collapse
      let rightPanel = state.ui.rightPanel
      let locale = state.i18next.lang

      let anchor = state.ui.anchor

      let props = { ...ownProps, langIndex, langPriority, open:rightPanel, locale, collapse, anchor }

      console.log("mS2p LSP",state,props)

      return props

   };

   const mapDispatchToProps = (dispatch, ownProps) => {
      return {
         onSetLocale:(lg:string) => {
            //dispatch(setLocale(lg));
            dispatch(i18nextChangeLanguage(lg));
         },
         onSetLangPreset:(langs:string[],i?:number) => {
            localStorage.setItem('lang', langs);
            dispatch(ui.langPreset(langs,i))
         },
         onToggleLanguagePanel:() => {
            dispatch(ui.toggleLanguagePanel());
         },
         onToggleCollapse:(txt:string,target:{},arg?:string) => {
            dispatch(ui.toggleCollapse(txt,target,arg));
         }
      }
   }

   const LanguageSidePaneContainer = connect(
       mapStateToProps,
       mapDispatchToProps
   )(LanguageSidePane);

   export default LanguageSidePaneContainer;


   export const LangPrefTreeContainer = connect(
       mapStateToProps,
       mapDispatchToProps
   )(LangPrefTree);

   