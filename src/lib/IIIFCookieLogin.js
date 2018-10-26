import React,{ Component } from 'react';
import { Route } from 'react-router-dom';
import { withCookies } from 'react-cookie';
import {auth} from '../routes'

class IIIFCookieLogin extends Component
{
   componentWillMount()
   {

         console.log("cookies",this.props.cookies,auth.isAuthenticated())

         let origin = this.props.get["origin"], messageId = this.props.get["messageId"]
         let error, description
         if(!origin || !messageId) {
            error = "invalidRequest"
            description = "argument missing:"
            if(!origin) description += "origin"
            if(!messageId) description += (description.match(/:$/)?'':', ')+"messageId"
            if(!origin) origin = window.location.href
         }
         else if(auth.isAuthenticated())
         {
            error = false ;
            this.props.cookies.set('auth0token', localStorage.getItem("access_token") );
            console.log("cookies",this.props.cookies)
         }
         else
         {
            error = "unavailable"
            description = "no valid token available"
         }
         if(error != false) {
            window.parent.postMessage( { error, description }, origin );
            console.error(this.props.cookies)
         }
         setTimeout(function() { window.close() }, 1000)

   }

   render()
   {
      return (<div>Cookie store<br/>Closing window</div>)

   }
}


export default withCookies(IIIFCookieLogin)
