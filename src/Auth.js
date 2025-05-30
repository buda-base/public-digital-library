import auth0 from 'auth0-js';
//import history from "./history"
import store from "./index"
import * as data  from "./state/data/actions"
import * as ui from "./state/ui/actions"
import {auth} from "./routes"
import React, { Component } from 'react';
import Panel from 'react-bootstrap/lib/Panel';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import { Link } from 'react-router-dom';
import {top_right_menu, isAdmin} from './components/App';
import ResourceViewerContainer,{ UserViewerContainer } from './containers/ResourceViewerContainer'
import { updateConfigFromProfile } from './state/sagas/index.js' 

import bdrcApi, {logError} from './lib/api';

import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';


import I18n from 'i18next';

import IconButton from '@material-ui/core/IconButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLanguage,faUserCircle,faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

import logdown from 'logdown'

const loggergen = new logdown('gen', { markdown: false });

var tokenRenewalTimeout;

function scheduleRenewal() {
  var token = localStorage.getItem('expires_at')
  if(!token) return
  var expiresAt = JSON.parse(token) - 5*60*1000 ;
  var delay = expiresAt - Date.now();
  loggergen.log("delay:",delay)
  if (delay > 0) {
    tokenRenewalTimeout = setTimeout(function() {
      renewToken();
    }, delay);
  }
}

function renewToken() {
  if(auth && auth.auth1) auth.auth1.checkSession({},
    function(err, result) {
      if (err) {
        loggergen.log("renew token error",err);
      } else {
      loggergen.log("renew token ok!",result)
        setSession(result);
      }
    }
  );
}

function setSession(authResult) {
  // Set the time that the Access Token will expire at
  var expiresAt = JSON.stringify(
    authResult.expiresIn * 1000 + new Date().getTime()
  );
  localStorage.setItem('access_token', authResult.accessToken);
  localStorage.setItem('id_token', authResult.idToken);
  localStorage.setItem('expires_at', expiresAt);
  scheduleRenewal();
}

window.addEventListener('load', function() {
  // ...
  scheduleRenewal();
});


export default class Auth {

   auth1 : WebAuth ;
   iiif:{};
   api:{};
   config:{}

  async checkNewUser(profile = this.userProfile, token = localStorage.getItem('access_token')) {
    let response = await (await fetch( 'https://bdrc-io.auth0.com/api/v2/users/'+encodeURI(profile.sub)+"?fields=last_login,logins_count",  {
      method: 'GET',
      headers:new Headers({ 'authorization': "Bearer " + token, 'content-type': 'application/json'})
    })).json()         

    loggergen.log("info:",response)

    if(response.logins_count === 1) {
      loggergen.log("new user!")
      store.dispatch(ui.newUser(true))
    } else {
      store.dispatch(ui.newUser(false))
    }
  }

  getProfile(cb) {
    let tO = setInterval( () => {
      loggergen.log("getP:",this.auth1)
      if(this.auth1)  {
        clearInterval(tO);
        var token = localStorage.getItem('access_token')
        if(token) this.auth1.client.userInfo(token, async (err, profile) => {
          if (profile) {
            this.userProfile = profile;       
            let val = "profile", groups
            if((groups = profile["https://auth.bdrc.io/groups"]) && groups.includes("admin")) val = "admin"     
            if(store.getState().ui.logged !== val) store.dispatch(ui.logEvent(val))
            updateConfigFromProfile()

            this.checkNewUser()
          }
          cb(err, profile);
        });
      }
    }, 100);
  }


  async setConfig(config,iiif,api)
  {
     this.auth1 = new auth0.WebAuth(config)
     loggergen.log("auth1",this.isAuthenticated())
     this.iiif = iiif
     this.api = api         
     this.config = config
     
      if(iiif && api && this.isAuthenticated()) {
          try{
            let cookie = await api.getURLContents(iiif.endpoints[iiif.index]+"/setcookie",false)
            loggergen.log("cookie",cookie)
          }
          catch(e)
          {
            logError(e)
            console.error("ERROR with cookie",e)
          }      
      }
  }

  login(redirect,signup = false) {
     // loggergen.log("auth1",this.auth1,auth0)
    loggergen.log("redirect",redirect)
    if(redirect) localStorage.setItem('auth0_redirect', JSON.stringify(redirect));
    else localStorage.setItem('auth0_redirect', '/');

    let locale = "en"
    let uilang = localStorage.getItem('uilang')
    if(!uilang) {
      uilang = window.navigator.language.slice(0, 2)
      if(['bo','en','zh','km','fr'].includes(uilang)) locale = uilang
    }
    if(uilang) {
      if(["en","zh"].includes(uilang)) locale = uilang
      else if(uilang === "bo") locale = "zh"
    }

    if(signup === true) this.auth1.authorize({'bdrc_showsignup':1, locale }); //, "prompt":"none"}); 
    else this.auth1.authorize({"warn": I18n.t("home.subsubmessage_auth" /*,{ lng: locale } // no need */ ), locale }); //, "prompt":"none"});
  }

  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.setConfig.bind(this)
    this.getProfile = this.getProfile.bind(this);
  }


  handleAuthentication(silent = false) {
    if(silent) { 
      /* // popup is blocked...
      this.auth1.popup.authorize({"prompt":"none"}, (error, response) => { 
        console.warn("popup:",error,response)
        if(this.isAuthenticated()) store.dispatch(ui.logEvent(true))
      }); 
      */
      // cf https://github.com/auth0/auth0.js/issues/406#issuecomment-312738290 (https://giters.com/ksgy/auth0.js?amp=1)
      this.auth1.renewAuth({ ...this.config, 
          usePostMessage: true, 
          postMessageDataType: 'my-custom-data-type', 
          redirectUri: window.location.origin+"/scripts/silent_callback.html" 
        }, (error, authResult) => {         
        loggergen.log("renewAuth:",error,authResult,this.isAuthenticated())
        if(authResult) {
          this.setSession(authResult);
          this.getProfile(() => { 
            this.checkNewUser()
          })
          store.dispatch(ui.logEvent(true))
        } else {
          store.dispatch(ui.logEvent(false))
        }
      }); 
    }
    else { 
      this.auth1.parseHash(async (err, authResult) => {        
        if (authResult && authResult.accessToken && authResult.idToken) {
          this.setSession(authResult);
          this.getProfile(() => {
            this.checkNewUser()
          })
          let redirect = JSON.parse(localStorage.getItem('auth0_redirect'))
          if(!redirect) redirect = '/'
          store.dispatch(ui.logEvent(true))
          console.log("redirect?",redirect,window.location)
          if(redirect && redirect.startsWith && redirect.startsWith("http")) window.location.href = redirect
          else window.location.href = (redirect.pathname ?? "/") + (redirect.search ?? "")
          //store.dispatch(ui.loggedIn())
        } else { 
          store.dispatch(ui.logEvent(false))
          if (err) {
            window.history.replaceState({},"",'/');
            loggergen.log(err);
          }
        }
      });
    }
  }

  async setSession(authResult) {
    // Set the time that the Access Token will expire at
    let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
    scheduleRenewal();

    loggergen.log("session",authResult)

    /* popup is blocked...
    if(this.isAuthenticated() && window.opener) { 
      setTimeout(() => window.close(), 350);
    } 
    */

    if(this.isAuthenticated() && this.iiif && this.api) {
      try {
         let cookie = await this.api.getURLContents(this.iiif.endpoints[this.iiif.index]+"/setcookie",false)
         loggergen.log("cookie",cookie)
      }
      catch(e)
      {
        logError(e)
        console.error("ERROR with cookie",e)
      }
    }

  }

  logout(redirect:{}|string=window.location.origin , delay:number=1000) {
     setTimeout(((iiif,api) => async () => {
         try {
            if(this.isAuthenticated()) {
              let token = localStorage.getItem('id_token');
              let cookie = await api.getURLContents(iiif.endpoints[iiif.index]+"/setcookie",false,null,null,false,"bdrc-auth-token="+token)
              loggergen.log("unset cookie",cookie)
            }
         }
         catch(e)
         {
            logError(e)
            console.error("ERROR with cookie",e,localStorage.getItem('id_token'))
         }

         // #812
         store.dispatch(ui.newUser(false))
         localStorage.removeItem('msg-popup-closed-register');

         // Clear Access Token and ID Token from local storage
         localStorage.removeItem('access_token');
         localStorage.removeItem('id_token');
         localStorage.removeItem('expires_at');
         // navigate to previous route if any

         // window.history.replace(redirect); // must be after auth0 logout call
         store.dispatch(ui.logEvent(false))

        clearTimeout(tokenRenewalTimeout);

        localStorage.setItem('auth0_redirect_logout', JSON.stringify(redirect));
        this.auth1.logout({ returnTo: window.location.origin })
     })(this.iiif,this.api),delay)
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // Access Token's expiry time
    let item = localStorage.getItem('expires_at')
    if(!item) return false;
    let expiresAt = JSON.parse(item);
    return new Date().getTime() < expiresAt;
  }



}


/*
export default class Auth {
  auth0 = new auth0.WebAuth( ... );

  login() {
    this.auth0.authorize();
  }

  constructor() {
      this.login = this.login.bind(this);
      this.logout = this.logout.bind(this);
      this.handleAuthentication = this.handleAuthentication.bind(this);
      this.isAuthenticated = this.isAuthenticated.bind(this);
   }

   handleAuthentication() {
     this.auth0.parseHash((err, authResult) => {
        if (authResult && authResult.accessToken && authResult.idToken) {
           loggergen.log("authRes",authResult)
         this.setSession(authResult);
         window.history.replace('/');
        } else if (err) {
         window.history.replace('/');
         loggergen.log(err);
        }
     });
   }

   setSession(authResult) {
     // Set the time that the Access Token will expire at
     let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
     localStorage.setItem('access_token', authResult.accessToken);
     localStorage.setItem('id_token', authResult.idToken);
     localStorage.setItem('expires_at', expiresAt);
     // navigate to the home route
     window.history.replace('/');
   }

   logout() {
     // Clear Access Token and ID Token from local storage
     localStorage.removeItem('access_token');
     localStorage.removeItem('id_token');
     localStorage.removeItem('expires_at');
     // navigate to the home route
     window.history.replace('/');
     store.dispatch(ui.logEvent(false))
   }

   isAuthenticated() {
     // Check whether the current time is past the
     // Access Token's expiry time
     let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
     return new Date().getTime() < expiresAt;
   }

}
*/








type TTState = {
  endpoint:string,
  profile?:{},
  error?:boolean,
  response?:string
}

export class TestToken extends Component<TTState> {  

  constructor(props) {
    super(props);
    this.state = { endpoint:"" }
  }
  
  componentWillMount() {
    this.setState({ profile: {} });
    const { userProfile, getProfile } = this.props.auth;
    if (!userProfile) {
      getProfile((err, profile) => {
        this.setState({ profile });
      });
    } else {
      this.setState({ profile: userProfile });
    }
  }
  render() {
    const { profile } = this.state;
    //loggergen.log("profile",profile)

    let isAuth = auth.isAuthenticated()

    let url
    if(this.state.response) {
      url = this.state.display
      if(!url.match(/^http[s]?:/)) url = url.replace(/^[/:]*/,"http://")
    }

    return  <div id="TestToken">
        {!isAuth && <IconButton onClick={(e) => { auth.login(window.history.location) }} title="Log in">
            <FontAwesomeIcon style={{fontSize:"28px"}} icon={faUserCircle} />
        </IconButton> }
        {isAuth && <IconButton onClick={(e) => { auth.logout(window.history.location) }} title="Log out">
            <FontAwesomeIcon style={{fontSize:"28px"}} icon={faSignOutAlt} />
        </IconButton>  }
        
        <FormControl className="FCTT">
            <TextField        
              helperText={!isAuth?"You are not logged in.":"Logged in" + (profile.name?" as "+profile.name+"":"")+ "."}
              id="standard-name"
              label="Endpoint"
              fullWidth
              value={this.state.endpoint}
              onChange={ (e) => {
                this.setState({...this.state,endpoint:e.target.value})
              }} 
              onKeyPress={ (e) => { if (e.key === 'Enter') {                  
                const api = new bdrcApi();
                let getContent = async () => {
                  let test,error
                  try {
                    let url = this.state.endpoint
                    if(!url.match(/^http[s]?:/)) url = url.replace(/^[/:]*/,"http://")
                    test = await api.getURLContents(url, false)                  
                  }
                  catch(e) {
                    logError(e)
                    console.error(e)
                    test = ""+e
                    error = true
                  }
                  this.setState({ ...this.state, response:test, error})
                }
                getContent();
                this.setState({...this.state, response:"", display:this.state.endpoint })
              }}}
            />                                    
        </FormControl>

        { this.state.response && <h2 {...(this.state.error?{style:{color:"red"}}:{})}><pre>{url}</pre></h2>}
        { this.state.response && this.state.response !== "" && <pre>{this.state.response}</pre> }
    </div> ;
  }
}









