// @flow
import React from 'react';
import { connect } from 'react-redux';
import * as data from '../state/data/actions';
import * as ui from '../state/ui/actions';
import store from '../index';

// import selectors from 'state/selectors';

import Profile from '../components/Profile';

const mapStateToProps = (state,ownProps) => {

   let userID = state.ui.userID

   let props = { userID }

   return props

};


const ProfileContainer = connect(
    mapStateToProps
)(Profile);

export default ProfileContainer;
