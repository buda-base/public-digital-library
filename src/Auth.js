import auth0 from 'auth0-js';
import history from "./history"
import store from "./index"
import * as ui from "./state/ui/actions"
import {auth} from "./routes"
import React, { Component } from 'react';
import Panel from 'react-bootstrap/lib/Panel';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import { Link } from 'react-router-dom';


var tokenRenewalTimeout;

function scheduleRenewal() {
  var token = localStorage.getItem('expires_at')
  if(!token) return
  var expiresAt = JSON.parse(token) - 5*60*1000 ;
  var delay = expiresAt - Date.now();
  console.log("delay",delay)
  if (delay > 0) {
    tokenRenewalTimeout = setTimeout(function() {
      renewToken();
    }, delay);
  }
}

function renewToken() {
  auth.auth1.checkSession({},
    function(err, result) {
      if (err) {
        console.log("renew token error",err);
      } else {
      console.log("renew token ok!",result)
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


  getProfile(cb) {
    let tO = setInterval( () => {
      console.log("getP",this.auth1)
      if(this.auth1)  {
        clearInterval(tO);
        var token = localStorage.getItem('access_token')
        if(token) this.auth1.client.userInfo(token, (err, profile) => {
          if (profile) {
            this.userProfile = profile;
          }
          cb(err, profile);
        });
      }
    }, 100);
  }


  async setConfig(config,iiif,api)
  {
     this.auth1 = new auth0.WebAuth(config)
     console.log("auth1",this.isAuthenticated())
     this.iiif = iiif
     this.api = api         
     

     if(this.isAuthenticated() && iiif && api) {
          
         try{
            let cookie = await api.getURLContents(iiif.endpoints[iiif.index]+"/setcookie",false)
            console.log("cookie",cookie)
         }
         catch(e)
         {
          console.error("ERROR with cookie",e)
         }
     }
  }

  login(redirect) {
     // console.log("auth1",this.auth1,auth0)
    console.log("redirect",redirect)
    if(redirect) localStorage.setItem('auth0_redirect', JSON.stringify(redirect));
    else localStorage.setItem('auth0_redirect', '/');
    this.auth1.authorize();
  }

  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.setConfig.bind(this)
    this.getProfile = this.getProfile.bind(this);
  }

  handleAuthentication() {
    this.auth1.parseHash(async (err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        let redirect = JSON.parse(localStorage.getItem('auth0_redirect'))
        if(!redirect) redirect = '/'
        history.replace(redirect);
        //store.dispatch(ui.loggedIn())
      } else if (err) {
        history.replace('/');
        console.log(err);
      }
    });
  }

  async setSession(authResult) {
    // Set the time that the Access Token will expire at
    let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);


    console.log("session")
    if(this.isAuthenticated() && this.iiif && this.api) {
      try {
         let cookie = await this.api.getURLContents(this.iiif.endpoints[this.iiif.index]+"/setcookie",false)
         console.log("cookie",cookie)
      }
      catch(e)
      {
         console.error("ERROR with cookie",e)
      }
    }

  }

  logout(redirect:{}|string='/', delay:number=1000) {
     setTimeout(((iiif,api) => async () => {
         try {
            if(this.isAuthenticated()) {
              let token = localStorage.getItem('id_token');
              let cookie = await api.getURLContents(iiif.endpoints[iiif.index]+"/setcookie",false,null,null,false,"bdrc-auth-token="+token)
              console.log("unset cookie",cookie)
            }
         }
         catch(e)
         {
            console.error("ERROR with cookie",e,localStorage.getItem('id_token'))
         }

         // Clear Access Token and ID Token from local storage
         localStorage.removeItem('access_token');
         localStorage.removeItem('id_token');
         localStorage.removeItem('expires_at');
         // navigate to previous route if any
         history.replace(redirect);
         store.dispatch(ui.logEvent(false))


        clearTimeout(tokenRenewalTimeout);
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
           console.log("authRes",authResult)
         this.setSession(authResult);
         history.replace('/');
        } else if (err) {
         history.replace('/');
         console.log(err);
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
     history.replace('/');
   }

   logout() {
     // Clear Access Token and ID Token from local storage
     localStorage.removeItem('access_token');
     localStorage.removeItem('id_token');
     localStorage.removeItem('expires_at');
     // navigate to the home route
     history.replace('/');
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

export class Profile extends Component {  

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
    console.log("profile",profile)
    let message = "Getting user info..."
    if(!profile || !Object.keys(profile).length) {
      if(!auth.isAuthenticated()) { 
        //message = <span>Please <a onclick={this.props.auth.login(this.props.history.location)}>log in</a></span>
        message = "Not logged in... Redirecting"
        this.tO = setTimeout(() => { 
          window.location.href = "/" 
        }, 1500)
        
      }
      return <div style={{margin:"50px"}}>{message}</div>
    }
    else {
        if(this.tO) clearTimeout(this.tO)
        return (
          <div className="container" style={{marginLeft:"50px"}}>
          <div className="profile-area">
            <h1>{profile.name}</h1>
            <Panel header="Profile picture: ">
              <img src={profile.picture} alt="profile" />
              <div>
                <ControlLabel><Glyphicon glyph="user" />Nickname: </ControlLabel>
                <h3 style={{display:"inline-block"}}>{profile.nickname}</h3>
              </div>
              <pre>{JSON.stringify(profile, null, 2)}</pre>
            </Panel>
          </div>
          <Link to='/'>Back to search</Link>
        </div>
      );
    }
  }
}


