// @flow
import AppContainer from './containers/AppContainer';
import React, { Component } from 'react';
import { Switch, Route, Router } from 'react-router-dom';
import history from './history';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import indigo from 'material-ui/colors/indigo';
import { Provider } from 'react-redux';
import ResourceViewerContainer from './containers/ResourceViewerContainer'
import IIIFViewerContainer from './containers/IIIFViewerContainer'
import { initiateApp } from './state/actions';

import store from './index';
import * as ui from './state/ui/actions'

import qs from 'query-string'

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


const makeMainRoutes = () => {

   let get = qs.parse(history.location.search)
   console.log('qs',get)

   return (
     <Provider store={store}>
        <MuiThemeProvider theme={theme}>
           <Router history={history}>
             <Switch>
                  <Route exact path="/" render={(props) => {
                     store.dispatch(initiateApp());
                     return ( <AppContainer history={history}/> ) } } />
                  <Route path="/search" render={(props) => {
                     store.dispatch(initiateApp(qs.parse(history.location.search)));
                     return ( <AppContainer history={history}/> ) } } />
                  <Route path="/gallery" render={(props) =>
                     <IIIFViewerContainer location={history.location} history={history}/> }/>
                  <Route path="/resource" render={(props) => {
                     store.dispatch(initiateApp(qs.parse(history.location.search),get.IRI));
                     return ( <ResourceViewerContainer history={history} IRI={get.IRI}/> ) } }/>
                  <Route render={(props) =>
                     <Redirect404  history={history}/>}/>
               </Switch>
            </Router>
         </MuiThemeProvider>
      </Provider>
  );
}
export default makeMainRoutes ;
