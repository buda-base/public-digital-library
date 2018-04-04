//@flow

import React, { Component } from 'react';
import qs from 'query-string'
import Button from 'material-ui/Button';
import { Link } from 'react-router-dom';
import { Redirect404 } from "../routes.js"
import Loader from "react-loader"

type Props = {
   history:{},
   IRI:string,
   resources?:{},
   onGetResource: (s:string) => void
}
type State = {
   uviewer : boolean,
   ready? : boolean
 }


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
      console.log("mount")
   }

   componentWillUpdate(newProps)
   {
      console.log("state",this.state)

      if(!this.state.ready && newProps.IRI && newProps.resources && newProps.resources[newProps.IRI] )
      {
         this.setState({...this.state,ready:true})
      }
      else if (this.state.ready && !(newProps.IRI && newProps.resources && newProps.resources[newProps.IRI]))
      {
         this.setState({...this.state,ready:false})

      }
   }

   pretty(str:string)
   {
      for(let p of prefixes) { str = str.replace(new RegExp(p,"g"),"") }

      str = str.replace(/([a-z])([A-Z])/g,"$1 $2")

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

   hasValue(val:[],k:string)
   {
      for(let v of val) {
         if(v.value == k) {
            return true;
         }
       }

       return false;
   }

   uriformat(prop:string,elem:{})
   {
      if(elem) {

         // test if ancestor/type of property has range subclassof entity

         let q =[]
         q.push(prop)


         // console.log("uriformat",prop,elem.value)

         while(q.length > 0)
         {
            // console.log("q",q)

            let t = this.props.ontology[q.shift()]

            if(t && t[rdfs+"range"] && t[rdfs+"range"][0] && t[rdfs+"range"][0].value)
            {

               let s = this.props.ontology[t[rdfs+"range"][0].value]


               if(s && s[rdfs+"subClassOf"] && this.hasValue(s[rdfs+"subClassOf"],bdo+"Entity"))
               {
                  // console.log("s",s)

                  // we can return Link
                  let pretty = this.pretty(elem.value);
                  return (<Link to={"/resource?IRI="+pretty}>{pretty}</Link>)
               }

            }
            else if(t)
            {
               // console.log("t",t,t[rdfs+"subPropertyOf"])

               t = t[rdfs+"subPropertyOf"]
               if(t) for(let i of t) { q.push(i.value) }
            }
         }

         return this.fullname(elem.value);
      }
   }

   getResourceElem(prop:string)
   {
      if(!this.props.IRI || !this.props.resources || !this.props.resources[this.props.IRI]
         || !this.props.resources[this.props.IRI][bdr+this.props.IRI]
         || !this.props.resources[this.props.IRI][bdr+this.props.IRI][prop]) return ;

      let elem = this.props.resources[this.props.IRI][bdr+this.props.IRI][prop]

      return elem
   }

   format(Tag,prop:string,txt:string="")
   {
      let elem = this.getResourceElem(prop)

      let ret = []

      if(elem) for(let e of elem)
      {
         let pretty = this.pretty(e.value)
         if(e.type != "bnode")
         {
            let tmp
            if(e.type == "uri") tmp = this.uriformat(prop,e)
            else tmp = pretty;
            // else  return ( <Link to={"/resource?IRI="+pretty}>{pretty}</Link> ) ;

            if(!txt) ret.push(<Tag>{tmp}</Tag>)
            else ret.push(<Tag>{tmp+" "+txt}</Tag>)
         }
      }

      return ret ;

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
            { !this.state.ready && <Loader loaded={false} /> }
            <div className="resource">
               {this.format("h1",rdf+"type",get.IRI)}
               {this.format("h2",skos+"prefLabel")}
               <div className="data">
                  { Object.keys(this.properties()).map((k) => {

                     let elem = this.getResourceElem(k);

                     if(!k.match(new RegExp(adm+"|prefLabel|"+rdf))) return (
                        <div>
                           <h3><span>{this.fullname(k)}</span>:&nbsp;</h3>
                           {this.format("h4",k).map((e)=> [e," "] )}
                        </div>
                     ) }
                  ) }
               </div>
            </div>
            <iframe style={{width:"calc(100% - 100px)",margin:"50px",height:"calc(100vh - 160px)",border:"none"}} src={"http://purl.bdrc.io/resource/"+get.IRI}/>
         </div>

      ) ;


   }
}

export default ResourceViewer ;
