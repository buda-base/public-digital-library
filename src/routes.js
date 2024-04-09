// @flow
import Script from 'react-load-script';
import AppContainer from './containers/AppContainer';
import React, { Component, useContext, useEffect } from 'react';
import { Switch, Route, Router } from 'react-router-dom';
import history from './history';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import indigo from '@material-ui/core/colors/indigo';
import Loader from 'react-loader';
import { Provider } from 'react-redux';
import ResourceViewerContainer from './containers/ResourceViewerContainer'
import IIIFViewerContainer from './containers/IIIFViewerContainer'
import IIIFCookieLogin from './lib/IIIFCookieLogin';
import {miradorSetUI, miradorConfig, miradorInitView} from './lib/miradorSetup';
import { initiateApp } from './state/actions';
import { logError, staticQueries } from './lib/api'


import store from './index';
import * as ui from './state/ui/actions'

import qs from 'query-string'

import Auth,{TestToken} from './Auth.js';
import UserViewerContainer from './containers/UserViewerContainer';
import ProfileContainer from './containers/ProfileContainer';
import StaticRouteContainer from './containers/StaticRouteContainer';
import GuidedSearchContainer from './containers/GuidedSearchContainer'
import BrowseContainer from './containers/BrowseContainer'
import { top_right_menu, RIDregexp } from './components/App'

import Profile from './components/ProfileStatic';
import { ClearCacheProvider, useClearCacheCtx } from "react-clear-cache";
import WarnIcon from '@material-ui/icons/Warning';
import InfoIcon from '@material-ui/icons/InfoOutlined';

import I18n from 'i18next';

import {UAContext, UserAgentProvider} from '@quentin-sommer/react-useragent'

import logdown from 'logdown'

import analytics from './components/Analytics'

const loggergen = new logdown('gen', { markdown: false });

export const auth = new Auth();


// ignore hash changes made by UV
// (see https://stackoverflow.com/questions/45799823/react-router-ignore-hashchange)
let previousLocation, newLocation;
const routerSetState = Router.prototype.setState;
Router.prototype.setState = function(...args) {

   loggergen.log("router args:",args)

    const loc = this.props.history.location;

    //loggergen.log("hash",JSON.stringify(previousLocation,null,3),JSON.stringify(loc,null,3),JSON.stringify(args,null,3))

    /* 
    if (loc.pathname === previousLocation.pathname &&
        loc.search   === previousLocation.search   &&
        loc.hash    !== previousLocation.hash // || loc.hash === previousLocation.hash )
    ) {
        previousLocation = {...loc};
        return;
    }
    */

   previousLocation = newLocation
   newLocation = loc.pathname + loc.search + loc.hash

   analytics.track('new location', {previousLocation, newLocation})

   return routerSetState.apply(this, args);
};
const routerDidMount = Router.prototype.componentDidMount;
Router.prototype.componentDidMount = function(...args) {
   
   let loc = this.props.history.location   
   newLocation = loc.pathname + loc.search + loc.hash

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

    loggergen.log("script",this.props,fic,this._text)
  }

  render()
  {
    if(!this._text) this.getText();
    return this._text ;
  }
}
*/

// see https://fr.reactjs.org/docs/error-boundaries.html
class LogErrorBoundary extends React.Component {

   constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
  
    static getDerivedStateFromError(error) {
      // Mettez à jour l'état, de façon à montrer l'UI de repli au prochain rendu.
      return { hasError: true };
    }
  
    componentDidCatch(error, errorInfo) {
      // Vous pouvez aussi enregistrer l'erreur au sein d'un service de rapport.
      loggergen.log("catch:",error,errorInfo,previousLocation)
      logError(error, { previousLocation });
    }
  
    render() {
      if (this.state.hasError) {
        // Vous pouvez afficher n'importe quelle UI de repli.
        return <h1>We're sorry but the website encountered an unexpected error.<br/>Go to <a href="/">homepage</a></h1>
      }
  
      return this.props.children;
    }

}


type Props = { history:{} }

export class Redirect404 extends Component<Props>
{
   constructor(props)
   {
      super(props);

      loggergen.log("props404",props,to)

      let to = "/"
      if(props.to) to = props.to

      let delay = 3000
      if(props.delay) delay = props.delay

      setTimeout((function(that) { return function() { 
         if(that.props.simple && that.props.from  && that.props.propid) {
            const msg = {
               "@id":that.props.from,
               "tmp:propid":that.props.propid,
               "tmp:notFound":true
            }
            window.top.postMessage(JSON.stringify(msg), "*")
         } else {            
            that.props.history.push(to)             
         }
      } })(this), delay) ;
   }

   render()
   {
      let message = this.props.message ;
      if(!message) message = "Page not found: "+this.props.history.location.pathname ;

      let redirecting = this.props.redirecting ;
      if(!redirecting) redirecting = I18n.t("resource.redirecting")

      return (<div style={{textAlign:"center",marginTop:"100px",fontSize:"22px"}}>
         { message }
         <br/>
         { redirecting }
      </div>)

   }
}


const handleAuthentication = (nextState, replace) => {
  if (/access_token|id_token|error/.test(nextState.location.hash)) {
    auth.handleAuthentication();
  }
}

const UAContextHook = () => {
  const {parser} = useContext(UAContext)
  useEffect( () => {
     const browser = parser.getBrowser()
     if(browser?.name) document.documentElement.setAttribute('data-browser', browser.name);
     //loggergen.log("parser:",parser.getBrowser(),parser)
  }, [parser])
  return []
}

// #767
const VersionChecker = () => {
   const { latestVersion, isLatestVersion, emptyCacheStorage } = useClearCacheCtx();
   return (
     <div {...!isLatestVersion?{style:{height:"60px"}}:{}}>
       { !isLatestVersion && (
         <div class="infoPanel version">
            <p>
               <a
                  href="#"
                  onClick={e => {
                     e.preventDefault();
                     emptyCacheStorage();
                  }}
                  //title={"New version id: "+latestVersion}
               >
                  <InfoIcon className="info"/><span>{I18n.t("topbar.update")}</span>
               </a>
            </p>
         </div>
       )}
     </div>
   );
 };



 
const makeMainRoutes = () => {

   // #767
   return (<ClearCacheProvider duration={ 10 * 60 * 1000 } auto={true} >
      <UserAgentProvider ua={window.navigator.userAgent}>
         <Provider store={store}>
           <MuiThemeProvider theme={theme}>
              <UAContextHook/>
              <VersionChecker /> 
              <LogErrorBoundary>              
               <Router history={history}>
                  <Switch>
                        <Route exact path="/static/:DIR1/:DIR2/:DIR3/:PAGE" render={(props) => {
                           return <StaticRouteContainer dir={props.match.params.DIR1+"/"+props.match.params.DIR2+"/"+props.match.params.DIR3} page={props.match.params.PAGE} history={history} auth={auth}/>
                        }}/>
                        <Route exact path="/static/:DIR1/:DIR2/:PAGE" render={(props) => {
                           return <StaticRouteContainer dir={props.match.params.DIR1+"/"+props.match.params.DIR2} page={props.match.params.PAGE} history={history} auth={auth}/>                        
                        }}/>
                        <Route exact path="/static/:DIR/:PAGE" render={(props) => {
                           return <StaticRouteContainer dir={props.match.params.DIR} page={props.match.params.PAGE} history={history} auth={auth}/>
                        }}/>
                        <Route exact path="/buda-user-guide" render={(props) => {
                           return <StaticRouteContainer dir={"user-guide"} page={"index"} history={history} auth={auth} observer={true}/>
                        }}/>
                        <Route exact path="/static/:PAGE" render={(props) => {
                           return <StaticRouteContainer dir={""} page={props.match.params.PAGE} history={history}  auth={auth}/>
                        }}/>                                                
                        <Route path="/testToken" render={(props) => {
                           store.dispatch(initiateApp());
                           return (<TestToken auth={auth} history={history} />)
                        } }/>
                        <Route path="/auth/callback" render={(props) => {
                           store.dispatch(initiateApp(null,null,props,null,true));
                           store.dispatch(ui.logEvent(true));
                           return (
                              <div style={{textAlign:"center",marginTop:"100px",fontSize:"22px"}}>
                                 Successfully logged, redirecting...
                              </div>
                           )
                        }}/>
                        { 
                           <Route exact path="/user" render={(props) => {
                              store.dispatch(initiateApp(qs.parse(history.location.search)));
                              return (<ProfileContainer auth={auth} history={history} />)
                           } } />
                        }
                        { 
                           <Route exact path="/testUser" render={(props) => {
                              store.dispatch(initiateApp(qs.parse(history.location.search)));
                              return (<UserViewerContainer auth={auth} history={history} />)
                           } } />
                        }
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
                        }}/>>
                        <Route exact path="/login" render={(props) => {
                           const get = qs.parse(history.location.search)
                           store.dispatch(initiateApp(get, undefined, undefined, get.backToViewer?"mirador":"static"));
                           return (
                              <div style={{textAlign:"center",marginTop:"100px",fontSize:"22px"}}>                              
                                 Redirecting...
                              </div>
                           )
                        }}/>
                        <Route exact path="/" render={(props) => {
                           loggergen.log("refresh?")
                           store.dispatch(initiateApp(qs.parse(history.location.search)));                           
                           return (<AppContainer history={history} auth={auth}/> )
                           }}/>
                        <Route exact path="/guidedsearch" render={(props) => {                        
                           return (<GuidedSearchContainer history={history} auth={auth}/> )
                        }} />
                        <Route exact path="/browse" render={(props) => {
                           return (<BrowseContainer history={history} auth={auth}/> )
                        }} />
                        <Route path="/search" render={(props) => {
                           let get = qs.parse(history.location.search)
                           //if(!store.getState().data.ontology)
                           {
                              loggergen.log("new route",props,store.getState())
                              //if(!store.getState().ui.loading)
                              store.dispatch(initiateApp(qs.parse(history.location.search)))
                           }
                           return (<AppContainer history={history} auth={auth}/> ) }}/>
                        <Route path="/simplesearch" render={(props) => {
                           let get = qs.parse(history.location.search)
                           store.dispatch(initiateApp(qs.parse(history.location.search)))
                           return (<AppContainer simple={true} history={history} auth={auth} propid={get.for}/> )}}/>
                        <Route path="/latest" render={(props) => {
                           let get = qs.parse(history.location.search)
                           //if(!store.getState().data.ontology)
                           {
                              loggergen.log("new route",props,store.getState())
                              //if(!store.getState().ui.loading)
                              store.dispatch(initiateApp(qs.parse(history.location.search), null, null, "latest"))
                           }
                           return (<AppContainer history={history} auth={auth} latest={true}/> )
                        }}/>  
                        { Object.keys(staticQueries).map(q => (
                           <Route path={"/"+q} render={(props) => {
                              let get = qs.parse(history.location.search), path = props.location.pathname.split("/")[1]
                              loggergen.log("new route",props,store.getState())                           
                              store.dispatch(initiateApp(qs.parse(history.location.search), null, null, path))
                              return (<AppContainer history={history} auth={auth} static={path}/> )
                           }}/>
                        )) }
                        <Route path="/view/:IRI" render={(props) =>
                           {
                              store.dispatch(initiateApp())

                              let get = qs.parse(history.location.search)
                              loggergen.log("props",props,get)
                              let lang = get["lang"] || localStorage.getItem('lang')  || "bo-x-ewts,sa-x-ewts"
                              let uilang = get["uilang"] || localStorage.getItem('uilang') || "en"
                              if(lang) lang = lang.split(",")
                              let callerURI = get["callerURI"]

                              miradorInitView(props.match.params.IRI,lang,callerURI,uilang,get.manifest);

                              return [
                                       <div id="viewer" class={"view " + (callerURI?" hasCallerURI":"")}></div>,
                                       <link rel="stylesheet" type="text/css" href="../scripts/mirador/css/mirador-combined.css"/>,
                                       <link rel="stylesheet" type="text/css" href="../scripts/src/lib/mirador.css"/>,
                                       <Script url={"../scripts/mirador/mirador.js"} onLoad={(e)=>{ require("@dbmdz/mirador-keyboardnavigation");  }} />,
                                    ]
                           }
                        }/>
                        <Route path="/show/:IRI" render={(props) => {
                           //if(!store.getState().data.resources || !store.getState().data.resources[props.match.params.IRI]
                           //   || !store.getState().data.assocResources || !store.getState().data.assocResources[props.match.params.IRI])
                           
                           let IRI = props.match.params.IRI
                           
                           // #766
                           if(IRI?.includes(":")) {
                              if(IRI.match(RIDregexp)) {
                                 IRI = IRI.split(":")
                                 if(IRI[1] != IRI[1].toUpperCase()) {
                                    IRI = IRI[0]+":"+IRI[1].toUpperCase()
                                    return <Redirect404 history={history} redirecting={" "} message={" "} delay={150} to={"/show/"+IRI+history.location.search+history.location.hash} />
                                 } else {
                                    IRI = props.match.params.IRI
                                 }
                              }
                           }

                           let get = qs.parse(history.location.search)
                           if(get.part && get.part !== IRI) {
                              get.root = IRI
                              //IRI = get.part
                           }
                           store.dispatch(initiateApp(get,IRI));
                        
                           return (<ResourceViewerContainer  auth={auth} history={history} IRI={IRI}/> )
                        }}/>

                        <Route path="/preview/:IRI" render={(props) => {
                           let IRI = props.match.params.IRI
                           
                           // #766
                           if(IRI?.includes(":")) {
                              if(IRI.match(RIDregexp)) {
                                 IRI = IRI.split(":")
                                 if(IRI[1] != IRI[1].toUpperCase()) {
                                    IRI = IRI[0]+":"+IRI[1].toUpperCase()
                                    return <Redirect404 history={history} redirecting={" "} message={" "} delay={150} to={"/show/"+IRI+history.location.search+history.location.hash} />
                                 } else {
                                    IRI = props.match.params.IRI
                                 }
                              }
                           }

                           let get = qs.parse(history.location.search)
                           if(get.part && get.part !== IRI) get.root = IRI
                           
                           store.dispatch(initiateApp({...get, preview: true},IRI));
                        
                           return (<ResourceViewerContainer  auth={auth} history={history} IRI={IRI} preview={true} />)
                        }}/>
                        <Route path="/simple/:IRI" render={(props) => {
                           let IRI = props.match.params.IRI
                           let get = qs.parse(history.location.search)
                           if(get.part && get.part !== IRI) get.root = IRI
                           store.dispatch(initiateApp(get,IRI));                     
                           return (<ResourceViewerContainer  auth={auth} history={history} IRI={IRI} preview={true} simple={true} propid={get.for}  onlyView={get.view}/> )
                           }}/>
                        <Route render={(props) => { return <Redirect404  history={history}  auth={auth}/> }}/>
                        <Route path="/scripts/" onEnter={() => window.location.reload(true)} />
                     </Switch>
                  </Router>
               </LogErrorBoundary>
            </MuiThemeProvider>
         </Provider>
      </UserAgentProvider>
   </ClearCacheProvider>
  );
}



export default makeMainRoutes ;
