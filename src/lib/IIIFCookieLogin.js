import React,{ Component } from 'react';
import { Route } from 'react-router-dom';
import bdrcApi from './api';

import logdown from 'logdown'

const loggergen = new logdown('gen', { markdown: false });

class IIIFCookieLogin extends Component
{
   async componentWillMount()
   {

       const api = new bdrcApi({...global.inTest ? {server:"http://localhost:5555"}:{}});
       const config = await api.loadConfig();
       this.props.auth.setConfig(config.auth)

       let isAuth = isAuth = this.props.auth.isAuthenticated()
       let origin = this.props.get["origin"], messageId = this.props.get["messageId"]
       loggergen.log("cookies",document.cookie,isAuth,origin,messageId)
       let error, description
       if(!origin || !messageId) {
          error = "invalidRequest"
          description = "argument missing:"
          if(!origin) description += "origin"
          if(!messageId) description += (description.match(/:$/)?'':', ')+"messageId"
          if(!origin) origin = window.location.href
       }
       else if(isAuth)
       {
          error = false ;
          //document.cookie = 'auth0token='+localStorage.getItem("access_token")+";path=*.bdrc.io;";
          //loggergen.log("cookies",document.cookie)
       }
       else
       {
          error = false
          this.props.auth.login(this.props.history.location)
       }
       if(error != false) {
          window.parent.postMessage( { error, description }, origin );
          console.error(document.cookie)
       }
       setTimeout(function() { window.close() }, 1000)


   }

   render()
   {
     loggergen.log("render IIIF")
      return (<div>Cookie store<br/>Closing window</div>)

   }
}


export default IIIFCookieLogin
