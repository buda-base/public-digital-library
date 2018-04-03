//@flow

import React, { Component } from 'react';
import qs from 'query-string'
import Button from 'material-ui/Button';
import { Link } from 'react-router-dom';
import { Redirect404 } from "../routes.js"

type Props = {
   history:{},
   IRI:string,
   resources?:{},
   onGetResource: (s:string) => void
}
type State = { uviewer : boolean }


const adm  = "http://purl.bdrc.io/ontology/admin/" ;
const bdo  = "http://purl.bdrc.io/ontology/core/";
const bdr  = "http://purl.bdrc.io/resource/";
const rdf  = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const rdfs = "http://www.w3.org/2000/01/rdf-schema#";
const skos = "http://www.w3.org/2004/02/skos/core#";

const prefixes = [adm, bdo,bdr,rdf,rdfs,skos]

class ResourceViewer extends Component<Props,State>
{
   constructor(props:Props)
   {
      super(props);

      this.state = { uviewer : false }

      console.log("props",props)
   }

   componentWillMount()
   {
   }

   pretty(str:string)
   {
      for(let p of prefixes) { str = str.replace(new RegExp(p,"g"),"") }

      return str ;
   }

   properties()
   {
      if(!this.props.IRI || !this.props.resources || !this.props.resources[this.props.IRI]
         || !this.props.resources[this.props.IRI][bdr+this.props.IRI]) return {}

      return this.props.resources[this.props.IRI][bdr+this.props.IRI] ;
   }



   fullname(prop:string)
   {
      if(this.props.ontology[prop] && this.props.ontology[prop][rdfs+"label"] && this.props.ontology[prop][rdfs+"label"][0]
      && this.props.ontology[prop][rdfs+"label"][0].value) {
         return this.props.ontology[prop][rdfs+"label"][0].value
      }

      return this.pretty(prop)
   }

   ontology(prop:string)
   {
      if(!this.props.IRI || !this.props.resources || !this.props.resources[this.props.IRI]
         || !this.props.resources[this.props.IRI][bdr+this.props.IRI]
         || !this.props.resources[this.props.IRI][bdr+this.props.IRI][prop]
         || !this.props.resources[this.props.IRI][bdr+this.props.IRI][prop][0]) return "" ;

      let elem = this.props.resources[this.props.IRI][bdr+this.props.IRI][prop][0]

      let pretty = this.pretty(elem.value)

      if(elem && elem.value)
         if(elem.type != "bnode")
            if(elem.type == "uri") return this.fullname(elem.value)
            else return pretty;
         else return "..." ;
            // else  return ( <Link to={"/resource?IRI="+pretty}>{pretty}</Link> ) ;
   }

   render()
    {
      console.log("render",this.props,this.state)
//
      if(!this.props.IRI)
      {
         return (
            <Redirect404  history={this.props.history} message="IRI undefined"/>
         )
      }

      let get = qs.parse(this.props.history.location.search)
      console.log('qs',get)

      //<Link to="/gallery?manifest=https://eroux.fr/manifest.json" style={{textDecoration:"none"}}><Button>Preview IIIF Gallery</Button></Link>
      //<div style={{height:"50px",fontSize:"26px",display:"flex",justifyContent:"center",alignItems:"center"}}>resource {get.IRI}</div>

      // add nother route to UViewer Gallery page
      return (
         <div style={{overflow:"hidden",textAlign:"center"}}>
            <div className="resource">
               <h1>{this.ontology(rdf+"type") + " " + get.IRI}</h1>
               <h2>{this.ontology(skos+"prefLabel")}</h2>
               <div className="data">
                  { Object.keys(this.properties()).map((k) =>
                     <div>
                        <h3><span>{this.fullname(k)}</span>:&nbsp;</h3><h4>{this.ontology(k)}</h4>
                     </div>
                  ) }
               </div>
            </div>
            <iframe style={{width:"calc(100% - 100px)",margin:"50px",height:"calc(100vh - 160px)",border:"none"}} src={"http://purl.bdrc.io/resource/"+get.IRI}/>
         </div>

      ) ;


   }
}

export default ResourceViewer ;
