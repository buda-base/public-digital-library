import React from 'react';
import { connect } from 'react-redux';

import AnnotatedEtext from '../components/AnnotatedEtext';

//import store from "../index.js";

const mapStateToProps = (state, ownProps) => {

    let props = { ...ownProps }
    return props ;
}

const mapDispatchToProps = (dispatch) => {
    return {
    }
};

const AnnotatedEtextContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(AnnotatedEtext);

export default AnnotatedEtextContainer;
