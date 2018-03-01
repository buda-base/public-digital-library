//@flow

import React, { Component } from 'react';
import qs from 'query-string'
import Button from 'material-ui/Button';
import { Link } from 'react-router-dom';

type Props = { history:{} }
type State = { uviewer : boolean }

class ResourceViewer extends Component<Props,State>
{
   constructor(props:Props)
   {
      super(props);

      this.state = { uviewer : false }
   }

   render()
    {
      console.log("render",this.props,this.state)
//
      let get = qs.parse(this.props.history.location.search)
      console.log('qs',get)

      // add another route to UViewer Gallery page
      return (
         <div style={{overflow:"hidden",textAlign:"center"}}>
            <div style={{height:"50px",fontSize:"26px",display:"flex",justifyContent:"center",alignItems:"center"}}>resource {get.IRI}</div>
            <Link to="/gallery?manifest=https://eroux.fr/manifest.json" style={{textDecoration:"none"}}><Button>Preview IIIF Gallery</Button></Link>
            <iframe style={{width:"calc(100% - 100px)",margin:"50px",height:"calc(100vh - 160px)",border:"none"}} src={"http://purl.bdrc.io/resource/"+get.IRI}/>
         </div>

      ) ;


   }
}

export default ResourceViewer ;
