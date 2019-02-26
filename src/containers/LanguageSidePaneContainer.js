// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';
import * as ui from '../state/ui/actions';
import store from '../index';
import LanguageSidePane from '../components/LanguageSidePane';

const mapStateToProps = (state,ownProps) => {

      let props = { ...ownProps }

      console.log("mS2p",state,props)

      return props

   };

   const mapDispatchToProps = (dispatch, ownProps) => {
      return {
         /*
         onRequestPdf:(iri:string,url:string) => {
            dispatch(data.requestPdf(iri,url));
            dispatch(data.requestPdf(iri,url.replace(/pdf/,"zip")))
         },
         */
      }
   }

   const LanguageSidePaneContainer = connect(
       mapStateToProps,
       mapDispatchToProps
   )(LanguageSidePane);

   export default LanguageSidePaneContainer;
