// @flow
import Script from 'react-load-script';
import AppContainer from './containers/AppContainer';
import React, { Component } from 'react';
import { Switch, Route, Router } from 'react-router-dom';
import history from './history';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import indigo from '@material-ui/core/colors/indigo';
import { Provider } from 'react-redux';
import ResourceViewerContainer from './containers/ResourceViewerContainer'
import IIIFViewerContainer from './containers/IIIFViewerContainer'
import IIIFCookieLogin from './lib/IIIFCookieLogin';
import {miradorSetUI, miradorConfig, miradorInitView} from './lib/miradorSetup';
import { initiateApp } from './state/actions';

import store from './index';
import * as ui from './state/ui/actions'

import qs from 'query-string'


import Auth from './Auth.js';
export const auth = new Auth();

// ignore hash changes made by UV
// (see https://stackoverflow.com/questions/45799823/react-router-ignore-hashchange)
let previousLocation;
const routerSetState = Router.prototype.setState;
Router.prototype.setState = function(...args) {
    const loc = this.props.history.location;
    if (loc.pathname === previousLocation.pathname &&
        loc.search   === previousLocation.search   &&
        loc.hash     !== previousLocation.hash
    ) {
        previousLocation = {...loc};
        return;
    }

    previousLocation = {...loc};
    return routerSetState.apply(this, args);
};
const routerDidMount = Router.prototype.componentDidMount;
Router.prototype.componentDidMount = function(...args) {
    previousLocation = {
        ...this.props.history.location,
    };
    if (typeof routerDidMount === 'function') {
        return routerDidMount.apply(this, args);
    }
};


// Auth test: ok
//auth.login();

const theme = createMuiTheme({
    palette: {
        primary: indigo,
        secondary: indigo
    }
});

/* // something missing here...
export class ScriptLoader extends Component
{
  _text : string = null ;

  async getText()
  {
    let fic = await fetch("/"+this.props.url)
    this._text = await fic.text()

    console.log("script",this.props,fic,this._text)
  }

  render()
  {
    if(!this._text) this.getText();
    return this._text ;
  }
}
*/

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
         Redirecting...
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
                              Redirecting...
                           </div>
                        )
                     }}/>
                     {/*
                     <Route exact path="/scripts/:URL" render={(props) => {
                        return (<ScriptLoader url={props.match.params.URL}/>)
                     } } />
                     */}
                     <Route exact path="/iiifcookielogin" render={(props) => {
                        return (<IIIFCookieLogin auth={auth} history={history} get={qs.parse(history.location.search)}/>)
                     } } />
                     <Route exact path="/iiiftoken" render={(props) => {
                        let get = qs.parse(history.location.search), messageId = get["messageId"], origin = get["origin"],
                           isAuth = auth.isAuthenticated()

                        if(isAuth && messageId && origin)
                        {
                           window.parent.postMessage(
                           {
                             messageId,
                             "accessToken": localStorage.getItem('id_token'),
                             "expiresIn": 3600
                           },
                              origin
                           );
                        }
                        else {
                           //console.error(window.location.href)
                           let error, description
                           if(!origin || !messageId) {
                              error = "invalidRequest"
                              description = "argument missing:"
                              if(!origin) description += "origin"
                              if(!messageId) description += (description.match(/:$/)?'':', ')+"messageId"
                              if(!origin) origin = window.location.href
                           }
                           else if(!isAuth) {
                              error = "unavailable"
                              description = "no valid token available"
                           }
                           window.parent.postMessage( { error, description }, origin );
                        }
                        return (<div/>)
                     }}/>
                     <Route exact path="/logout" render={(props) => {
                        auth.logout(this.props.history.location,1000);
                        return (
                           <div style={{textAlign:"center",marginTop:"100px",fontSize:"22px"}}>
                              You have been logged out <br/>
                              Redirecting...
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
                           //if(!store.getState().ui.loading)
                           store.dispatch(initiateApp(qs.parse(history.location.search)))
                        }
                        return ( <AppContainer history={history}  auth={auth}/> ) } } />
                     <Route path="/view/:IRI" render={(props) =>
                        {

                           console.log("props",props)

                           miradorInitView(props);

                           return [
                                    <div id="viewer" class="view"></div>,
                                    <link rel="stylesheet" type="text/css" href="../scripts/mirador/css/mirador-combined.css"/>,
                                    <link rel="stylesheet" type="text/css" href="../scripts/src/lib/mirador.css"/>,
                                    <Script url={"../scripts/mirador/mirador.js"} />
                                 ]
                        }
                     }/>
                     <Route path="/show/:IRI" render={(props) => {
                        //if(!store.getState().data.resources || !store.getState().data.resources[props.match.params.IRI]
                        //   || !store.getState().data.assocResources || !store.getState().data.assocResources[props.match.params.IRI])
                        {
                           store.dispatch(initiateApp(qs.parse(history.location.search),props.match.params.IRI));
                        }
                        return ( <ResourceViewerContainer  auth={auth} history={history} IRI={props.match.params.IRI}/> ) } }/>
                     <Route render={(props) =>
                        <Redirect404  history={history}  auth={auth}/>}/>
                     <Route path="/scripts/" onEnter={() => window.location.reload()} />
                  </Switch>
               </Router>
            </MuiThemeProvider>
         </Provider>
  );
}



export default makeMainRoutes ;
