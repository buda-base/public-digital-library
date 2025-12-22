// @flow
import Script from 'react-load-script';
import AppContainer from './containers/AppContainer';
import React, { Component, useContext, useEffect } from 'react';
import { Route, BrowserRouter, Routes, useLocation, useNavigate, useParams } from 'react-router-dom';
//import history from './history';
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
import TraditionViewerContainer from './containers/TraditionViewerContainer'
import { top_right_menu, RIDregexp } from './components/App'

import Profile from './components/ProfileStatic';
import { ClearCacheProvider, useClearCacheCtx } from "react-clear-cache";
import WarnIcon from '@material-ui/icons/Warning';
import InfoIcon from '@material-ui/icons/InfoOutlined';

import I18n from 'i18next';

import {UAContext, UserAgentProvider} from '@quentin-sommer/react-useragent'

import logdown from 'logdown'

import analytics from './components/Analytics'

// TODO: new search 
import "./lib/searchkit/index.css";
import "./lib/searchkit/App.css";
import SearchPageContainer from "./containers/SearchPageContainer";

const loggergen = new logdown('gen', { markdown: false });

export const auth = new Auth();


/*
// ignore hash changes made by UV
// (see https://stackoverflow.com/questions/45799823/react-router-ignore-hashchange)
let previousLocation, newLocation;
const routerSetState = Router.prototype.setState;
Router.prototype.setState = function(...args) {

   loggergen.log("router args:",args)

    const loc = this.props.history.location;

    //loggergen.log("hash",JSON.stringify(previousLocation,null,3),JSON.stringify(loc,null,3),JSON.stringify(args,null,3))

    
   //  if (loc.pathname === previousLocation.pathname &&
   //      loc.search   === previousLocation.search   &&
   //      loc.hash    !== previousLocation.hash // || loc.hash === previousLocation.hash )
   //  ) {
   //      previousLocation = {...loc};
   //      return;
   //  }
    

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
*/


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
      loggergen.log("catch:",error,errorInfo) //,previousLocation)
      logError(error, { previousLocation: window.location.href });
    }
  
    render() {
      if (this.state.hasError) {
        // Vous pouvez afficher n'importe quelle UI de repli.
        return <h1>We're sorry but the website encountered an unexpected error.<br/>Go to <a href="/"><span className="visually-hidden">Go to homepage</span>homepage</a></h1>
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
            that.props.navigate(to)             
         }
      } })(this), delay) ;
   }

   render()
   {
      let message = this.props.message ;
      if(!message) message = "Page not found: "+this.props.location.pathname ;

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

// #767 test
const VersionChecker = () => {
   const { latestVersion, isLatestVersion, emptyCacheStorage } = useClearCacheCtx();
   return (
     <div title={latestVersion} data-v={latestVersion} //{...!isLatestVersion?{style:{height:"60px"}}:{}}
      >
       { (!isLatestVersion) && (
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


function Compo() {
   return <div>youpi</div>
}

function HomeCompo(props = {}) {
   const location = useLocation();
   const navigate = useNavigate();
 
   useEffect(() => {
     store.dispatch(initiateApp(qs.parse(location.search)));
   }, [location]); 

   return <AppContainer { ...{ ...props, location, navigate, auth } }/> 
}
 
function SimpleAdvancedSearchCompo() {
   
   const location = useLocation();
   const navigate = useNavigate();   
   const get = qs.parse(location.search)

   useEffect(() => {
     store.dispatch(initiateApp(get));
   }, [location]); 
      
   return (<AppContainer simple={true} auth={auth} propid={get.for} { ...{ location, navigate } }/>)

}

function SimpleResourceViewerCompo() {
   
   const location = useLocation();
   const navigate = useNavigate();   
   const { IRI } = useParams()
   const get = qs.parse(location.search)

   useEffect(() => {
      if(get.part && get.part !== IRI) get.root = IRI
      store.dispatch(initiateApp(get,IRI));      

   }, [location]); 
      
   return (<ResourceViewerContainer auth={auth} IRI={IRI} preview={true} simple={true} propid={get.for} onlyView={get.view} { ...{ location, navigate } } /> )

}


function BaseOSCompo() {
   const location = useLocation();
   const navigate = useNavigate();
   const { RID } = useParams()
 
   return <>      
      { RID 
         ? <SearchPageContainer { ...{ navigate, location, auth } } isOsearch={true} pageFilters={"associated_res:"+RID}/>         
         : <SearchPageContainer { ...{ navigate, location, auth } } isOsearch={true}/> }
   </>
}

function ResourceCompo() {
   const location = useLocation();
   const navigate = useNavigate();

   let { IRI } = useParams()

   //console.log("Rc:",location)

   useEffect(() => {
      // #766
      if(IRI?.includes(":")) {
         if(IRI.match(RIDregexp)) {
            let _IRI = IRI
            IRI = IRI.split(":")
            if(IRI[1] != IRI[1].toUpperCase()) {
               IRI = IRI[0]+":"+IRI[1].toUpperCase()
               return <Redirect404 {...{ navigate, location }} redirecting={" "} message={" "} delay={150} to={"/show/"+IRI+location.search+location.hash} />
            } else {
               IRI = _IRI
            }
         }
      }

      let get = qs.parse(location.search)
      if(get.part && get.part !== IRI) {
         get.root = IRI
         //IRI = get.part
      }
      store.dispatch(initiateApp(get,IRI));

   }, [IRI, location])

   return (<ResourceViewerContainer key={IRI+"_root"} { ...{ navigate, location, auth, IRI } } /> )
}

function TradiCompo(props) {
   const location = useLocation();
   const navigate = useNavigate();
   const {TRAD:tradition, TYPE:type, ID: id, ROOT: root, SCHOOL:school } = useParams()
   const key = "tradi:"+tradition+";"+type+";"+id+";"+root+";"+school

   useEffect(() => {
      console.log("trad/param/root:",props)
      store.dispatch(initiateApp(qs.parse(location.search), null, null, "tradition"))
   }, [location])

   if(tradition && type && id &&  root ) return (<TraditionViewerContainer {...{key, location, navigate, auth, tradition, type, id, root } }/> )    
   else if(tradition && type && id) return (<TraditionViewerContainer {...{key,location, navigate, auth, tradition, type, id} }/> ) 
   else if(tradition && school) return (<TraditionViewerContainer {...{key,location, navigate, auth, tradition, type:"selected", id: school} }/> ) 
   else if(tradition) return (<TraditionViewerContainer {...{key, location, navigate, auth, tradition } }/> ) 
      
}

function StaticCompo() {
   const location = useLocation();
   const navigate = useNavigate();
   
   useEffect(() => {
      store.dispatch(initiateApp(qs.parse(location.search),null,null,"static"))
    }, [location]);   

   return <StaticRouteContainer dir={"user-guide"} page={"index"} observer={true} {...{location, navigate, auth } } />
}

function AuthCompo(props) {
   const location = useLocation();

   useEffect(() => {
      if(location.pathname === "/logout") {
         auth.logout(location,1000);
      } else if(location.pathname === "/login") {
         const get = qs.parse(location.search)
         store.dispatch(initiateApp(get, undefined, undefined, get.backToViewer?"mirador":"static"));
      } else if(location.pathname === "/auth/callback") {
         store.dispatch(initiateApp(null,null,{...props, location},null,true));
         store.dispatch(ui.logEvent(true));
      }
   }, [location])


   if(location.pathname === "/logout") {
      return (
         <div style={{textAlign:"center",marginTop:"100px",fontSize:"22px"}}>
            You have been logged out <br/>
            Redirecting...
         </div>
      )
   } else if(location.pathname === "/login") {
      return ( 
         <div style={{textAlign:"center",marginTop:"100px",fontSize:"22px"}}>                              
            Redirecting...
         </div>
      )
   } else if(location.pathname === "/auth/callback") {
      return (
         <div style={{textAlign:"center",marginTop:"100px",fontSize:"22px"}}>
            Successfully logged, redirecting...
         </div>
      )
   }
}

function StaticQueryCompo({ path }) {

   const location = useLocation();
   const navigate = useNavigate();

   useEffect(() => {
      store.dispatch(initiateApp(qs.parse(location.search), null, null, path))
   }, [location])

   return (<AppContainer  {...{ location, navigate, auth }} static={path}/> )
}

function ProfileCompo() {   
   const location = useLocation();
   const navigate = useNavigate();

   useEffect(() => {
      store.dispatch(initiateApp(qs.parse(location.search)));
   }, [location])

   return (<ProfileContainer {...{ location, navigate, auth }} />)
}

function IIIFCookieCompo(){
   const location = useLocation();
   return (<IIIFCookieLogin  {...{ location, auth }} get={qs.parse(location.search)}/>)
}

function IIIFTokenCompo(){
   const location = useLocation();
   
   useEffect(() => {
      let get = qs.parse(location.search), messageId = get["messageId"], origin = get["origin"],
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
   },[location])

   return (<div/>)
}


function TestTokenComponent() {
   const location = useLocation();

   useEffect(() => {
      store.dispatch(initiateApp());
   }, [location])

   return (<TestToken auth={auth} location={location} />)
}

const makeMainRoutes = () => {

   // #767
   return (<ClearCacheProvider duration={ 10 * 60 * 1000 } auto={true} >
      <UserAgentProvider ua={window.navigator.userAgent}>
         <Provider store={store}>
           <MuiThemeProvider theme={theme}>
               <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/instantsearch.css@7/themes/satellite-min.css" />
              <UAContextHook/>
              <VersionChecker /> 
              <LogErrorBoundary>              
               <BrowserRouter /*navigation={history} location={history.location}*/ >
                  <Routes>
                     <Route path="/" element={<HomeCompo />} />
                     
                     <Route path="/show/:IRI" element={<ResourceCompo />} />
                     <Route path="/osearch/search" element={<BaseOSCompo /> } />

                     <Route path="/osearch/associated/:RID/search" element={<BaseOSCompo /> }/>                  

                     <Route path="/tradition/:TRAD/:TYPE/:ID/:ROOT/" element={<TradiCompo/>} />
                     <Route path="/tradition/:TRAD/:TYPE/:ID"  element={<TradiCompo/>} />                           
                     <Route path="/tradition/:TRAD/:SCHOOL" element={<TradiCompo/>} />                        
                     <Route path="/tradition/:TRAD" element={<TradiCompo/>} />

                     <Route path="/buda-user-guide" element={<StaticCompo />}/>

                     <Route path="/logout" element={<AuthCompo />} />
                     <Route path="/login" element={<AuthCompo />} />
                     <Route path="/auth/callback" element={<AuthCompo />} />

                     <Route path="/user" element={<ProfileCompo /> } />

                     <Route exact path="/iiifcookielogin" element={<IIIFCookieCompo />}/>
                     <Route exact path="/iiiftoken" element={<IIIFTokenCompo />}/>

                     <Route path="/search" element={<HomeCompo advancedSearch={true} />} />

                     <Route path="/simplesearch" element={<SimpleAdvancedSearchCompo />} />
                     <Route path="/simple/:IRI"  element={<SimpleResourceViewerCompo />} />

                     { 
                        Object.keys(staticQueries).map(q => (
                           <Route path={"/"+q} element={<StaticQueryCompo path={q}/>}/>
                        )) 
                     }
                        
                     <Route path="/testToken" element={<TestTokenComponent />} />

{/* 

                        <Route exact path="/static/:DIR1/:DIR2/:DIR3/:PAGE" render={(props) => {
                           return <StaticRouteContainer dir={props.match.params.DIR1+"/"+props.match.params.DIR2+"/"+props.match.params.DIR3} page={props.match.params.PAGE} history={history} auth={auth}/>
                        }}/>
                        <Route exact path="/static/:DIR1/:DIR2/:PAGE" render={(props) => {
                           return <StaticRouteContainer dir={props.match.params.DIR1+"/"+props.match.params.DIR2} page={props.match.params.PAGE} history={history} auth={auth}/>                        
                        }}/>
                        <Route exact path="/static/:DIR/:PAGE" render={(props) => {
                           return <StaticRouteContainer dir={props.match.params.DIR} page={props.match.params.PAGE} history={history} auth={auth}/>
                        }}/>
                        <Route exact path="/static/:PAGE" render={(props) => {
                           return <StaticRouteContainer dir={""} page={props.match.params.PAGE} history={history}  auth={auth}/>
                        }}/>                                                
                        
                        
                        { 
                           <Route exact path="/testUser" render={(props) => {
                              store.dispatch(initiateApp(qs.parse(history.location.search)));
                              return (<UserViewerContainer auth={auth} history={history} />)
                           } } />
                        }                        
                        
                        <Route exact path="/guidedsearch" render={(props) => {                        
                           return (<GuidedSearchContainer history={history} auth={auth}/> )
                        }} />
                        <Route exact path="/browse" render={(props) => {
                           return (<BrowseContainer history={history} auth={auth}/> )
                        }} />                     
                        <Route path="/latest" render={(props) => {
                           let get = qs.parse(history.location.search)
                           //if(!store.getState().data.ontology)
                           {
                              loggergen.log("new route",props,store.getState())
                              //if(!store.getState().ui.loading)
                              store.dispatch(initiateApp(qs.parse(history.location.search), null, null, "latest"))
                           }
                           return (<AppContainer history={history} auth={auth} latest={true} {...get.tf ? {latestSyncsMeta:{timeframe:"past"+get.tf}}:{}}/> )
                        }}/>  
                        <Route path="/view/:IRI" render={(props) =>
                           {
                              store.dispatch(initiateApp())

                              let get = qs.parse(history.location.search)
                              loggergen.log("props",props,get)
                              let lang = get["langs"] || localStorage.getItem('langs')  || "bo-x-ewts,sa-x-ewts"
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
                        <Route render={(props) => { return <Redirect404  history={history}  auth={auth}/> }}/>
                        <Route path="/scripts/" onEnter={() => window.location.reload(true)} /> 
                        */}
                     </Routes>
                  </BrowserRouter>
               </LogErrorBoundary>
            </MuiThemeProvider>
         </Provider>
      </UserAgentProvider>
   </ClearCacheProvider>
  );
}



export default makeMainRoutes ;
