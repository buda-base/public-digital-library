//@flow

import Script from 'react-load-script';
import $ from 'jquery' ;
import React, { Component } from 'react';
import qs from 'query-string'
import Button from 'material-ui/Button';
import { Link } from 'react-router-dom';
import store from '../index';

type Props = {
   location:string,
   history:{},
   loadingGallery?:string,
   onLoadingGallery:(string)=>void
}

class IIIFViewer extends Component<Props>
{
   manifest:string ;

   componentWillMount()
   {

      let get = qs.parse(this.props.history.location.search)
      this.manifest = get.manifest
      if(this.manifest && !this.props.loadingGallery)
      {
         this.props.onLoadingGallery(this.manifest)
         if(!get.active) {
            this.props.history.replace(this.props.location.pathname+this.props.location.search+"&active=true")
            window.location.reload()
         }
      }


   }
   render()
   {
      // console.log("IIIF.render",this.props,this.manifest)

      // add reload ?
      return ( [
         // embed UniversalViewer
           <div
           className="uv"
           data-locale="en-GB:English (GB),cy-GB:Cymraeg"
           //data-config="/config.json"
           //data-uri="https://eap.bl.uk/archive-file/EAP676-12-4/manifest"
           data-uri={this.props.manifest?this.props.manifest:this.manifest}
           data-collectionindex="0"
           data-manifestindex="0"
           data-sequenceindex="0"
           data-fullscreen="false"
           data-canvasindex="0"
           data-zoom="-1.0064,0,3.0128,1.3791"
           data-rotation="0"
           style={{width:"800px",height:"480px",backgroundColor: "#000"}}/>,
           <Script url="http://universalviewer.io/uv/lib/embed.js"/>]

      );
   }

}

export default IIIFViewer ;
