// @flow
import React, { Component } from 'react';
import { isProxied } from './App';

export class TestProxy extends Component {

   render() {
      console.log("this:", this)
      return (<div style={{padding:"24px", background:"white"}}><h1>Test Proxy</h1>
         <pre>
            <ul>
               <li>window.location.host: {window.location.host}</li>
               <li>window.location.hostname: {window.location.hostname}</li>
               <li>window.location.port: {window.location.port}</li>
               <li>window.location.protocol: {window.location.protocol}</li>
               <li>window.location.search: {window.location.search}</li>
               <li>window.location.hash: {window.location.hash}</li>
            </ul>
            <ul>
               <li>config.primaryUrl: {this.props?.config?.primaryUrl}</li>
               <li>isProxied: {isProxied(this) ? "true" : "false"}</li>
               <li>props.subscribedCollections: 
                    {JSON.stringify(this.props?.subscribedCollections, null,3)}
                </li>
            </ul>
         </pre>
      </div>)
   }
}