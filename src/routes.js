// @flow
import AppContainer from './containers/AppContainer';
import React, { Component } from 'react';
import { Switch, Route, Router } from 'react-router-dom';
import history from './history';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import indigo from '@material-ui/core/colors/indigo';
import { Provider } from 'react-redux';
import ResourceViewerContainer from './containers/ResourceViewerContainer'
import IIIFViewerContainer from './containers/IIIFViewerContainer'
import { initiateApp } from './state/actions';

import store from './index';
import * as ui from './state/ui/actions'

import qs from 'query-string'

import Auth from './Auth.js';

export const auth = new Auth();

// Auth test: ok
//auth.login();

const theme = createMuiTheme({
    palette: {
        primary: indigo,
        secondary: indigo
    }
});


type Props = { history:{} }

export class Redirect404 extends Component<Props>
{
   constructor(props)
   {
      super(props);

      // console.log("props404",props)

      setTimeout((function(that) { return function() { that.props.history.push("/") } })(this), 3000) ;
   }

   render()
   {
      let message = this.props.message ;
      if(!message) message = "Page not found: "+this.props.history.location.pathname ;


      return (<div style={{textAlign:"center",marginTop:"100px",fontSize:"22px"}}>
         { message }
         <br/>
         Redirecting to homepage
      </div>)

   }
}

const handleAuthentication = (nextState, replace) => {
  if (/access_token|id_token|error/.test(nextState.location.hash)) {
    auth.handleAuthentication();
  }
}

const makeMainRoutes = () => {

   return (
     <Provider store={store}>
        <MuiThemeProvider theme={theme}>
           <Router history={history}>
             <Switch>
                  <Route path="/auth/callback" render={(props) => {
                     store.dispatch(initiateApp(null,null,props));
                     store.dispatch(ui.logEvent(true));
                     return (
                        <div style={{textAlign:"center",marginTop:"100px",fontSize:"22px"}}>
                           Redirecting to homepage
                        </div>
                     )
                  }}/>
                  <Route exact path="/" render={(props) => {
                     store.dispatch(initiateApp());
                     return ( <AppContainer history={history} auth={auth}/> ) } } />
                  <Route path="/search" render={(props) => {
                     let get = qs.parse(history.location.search)
                     //if(!store.getState().data.ontology)
                     {
                        //console.log("new route",props,store.getState())
                        store.dispatch(initiateApp(qs.parse(history.location.search)))
                     }
                     return ( <AppContainer history={history}  auth={auth}/> ) } } />
                  <Route path="/gallery" render={(props) =>
                     <IIIFViewerContainer location={history.location} history={history}  auth={auth}/> }/>
                  <Route path="/show/:IRI" render={(props) => {
                     if(!store.getState().data.resources || !store.getState().data.resources[props.match.params.IRI]
                        || !store.getState().data.assocResources || !store.getState().data.assocResources[props.match.params.IRI])
                     {
                        store.dispatch(initiateApp(qs.parse(history.location.search),props.match.params.IRI));
                     }
                     return ( <ResourceViewerContainer  auth={auth} history={history} IRI={props.match.params.IRI}/> ) } }/>
                  <Route render={(props) =>
                     <Redirect404  history={history}  auth={auth}/>}/>
               </Switch>
            </Router>
         </MuiThemeProvider>
      </Provider>
  );
}

export default makeMainRoutes ;
