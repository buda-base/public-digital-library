// @flow
import AppContainer from './containers/AppContainer';
import React, { Component } from 'react';
import { Switch, Route, Router } from 'react-router-dom';
import history from './history';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import indigo from 'material-ui/colors/indigo';
import { Provider } from 'react-redux';
import ResourceViewerContainer from './containers/ResourceViewerContainer'

import store from './index';

import qs from 'query-string'

const theme = createMuiTheme({
    palette: {
        primary: indigo,
        secondary: indigo
    }
});


type Props = { history:{} }

class Redirect404 extends Component<Props>
{
   constructor(props)
   {
      super(props);

      // console.log("props404",props)

      setTimeout((function(that) { return function() { that.props.history.push("/") } })(this), 3000) ;
   }

   render()
   {
      return (<div style={{textAlign:"center",marginTop:"100px",fontSize:"22px"}}>
         Page not found: {this.props.history.location.pathname}
         <br/>
         Redirecting to homepage
      </div>)
   }
}

type State = { reloaded : boolean }

class IIIFViewer extends Component<{},State>
{
   constructor(props)
   {
      super(props);

      this.state = { reloaded : false}

   }

   render()
   {
      // add reload ?
      return (
         // embed UniversalViewer
           <div
           className="uv"
           data-locale="en-GB:English (GB),cy-GB:Cymraeg"
           data-config="/config.json"
           data-uri="https://eap.bl.uk/archive-file/EAP676-12-4/manifest"
           //data-uri="https://eroux.fr/manifest.json"
           data-collectionindex="0"
           data-manifestindex="0"
           data-sequenceindex="0"
           data-canvasindex="0"
           data-zoom="-1.0064,0,3.0128,1.3791"
           data-rotation="0"
           style={{width:"100%",height:"calc(100vh)",backgroundColor: "#000"}}/>
      );
   }

}

const makeMainRoutes = () => {


  return (
     <Provider store={store}>
        <MuiThemeProvider theme={theme}>
           <Router history={history}>
             <Switch>
                  <Route exact path="/" render={(props) => <AppContainer history={history}/> } />
                  <Route path="/search" render={(props) => <AppContainer history={history}/> } />
                  <Route path="/gallery" render={(props) => <IIIFViewer /> }/>
                  <Route path="/resource" render={(props) => <ResourceViewerContainer history={history}/> } />
                  <Route render={(props) => <Redirect404  history={history}/>}/>
               </Switch>
            </Router>
         </MuiThemeProvider>
      </Provider>
  );
}
export default makeMainRoutes ;
