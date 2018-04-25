//@flow

import React, { Component } from 'react';
import qs from 'query-string'
import Button from 'material-ui/Button';
import { Link } from 'react-router-dom';
import { Redirect404 } from "../routes.js"
import Loader from "react-loader"
//import {MapComponent} from './Map';
import {getEntiType} from '../lib/api';

type Props = {
   history:{},
   IRI:string,
   resources?:{},
   assocResources?:{},
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

      if(!this.state.ready && this.props.IRI && this.props.resources && this.props.resources[this.props.IRI] )
      {
         this.setState({...this.state,ready:true})
      }
      else if (this.state.ready && !(this.props.IRI && this.props.resources && this.props.resources[this.props.IRI]))
      {
         this.setState({...this.state,ready:false})

      }
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

      str = str.split("\n").map((i) => ([i,<br/>]))
      str = [].concat.apply([],str);
      str.pop();

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
                  let info ;
                  if(this.props.assocResources) {
                     let infoBase = this.props.assocResources[elem.value]
                     if(infoBase) {
                        info = infoBase.filter((e)=>(e.type==prop && e["xml:lang"]==this.props.prefLang))
                        if(info[0]) info = info[0].value
                        else {
                           info = infoBase.filter((e) => e["xml:lang"]==this.props.prefLang)
                           if(info[0]) info = info[0].value
                           else {
                              info = infoBase.filter((e) => e["xml:lang"]=="bo-x-ewts")
                              if(info[0]) info = info[0].value
                              else info = infoBase[0].value
                           }
                        }
                     }
                  }

                  console.log("s",prop,s,info)

                  // we can return Link
                  let pretty = this.pretty(elem.value);
                  let ret = []
                  if(info) ret.push(<Link className="urilink prefLabel" to={"/show/bdr:"+pretty}>{info}</Link>)
                  else ret.push(<Link className="urilink" to={"/show/bdr:"+pretty}>{pretty}</Link>)
                  return ret
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

   getResourceBNode(prop:string)
   {
      if(!this.props.IRI || !this.props.resources || !this.props.resources[this.props.IRI]
         || !this.props.resources[this.props.IRI][prop]) return ;

      let elem = this.props.resources[this.props.IRI][prop]

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
         else {
            elem = this.getResourceBNode(e.value)
            console.log("bnode",e.value,elem)

            let sub = []

            let val = elem[rdf+"type"]
            let lab = elem[rdfs+"label"]

            console.log("val",val);
            console.log("lab",lab);

            if(val && val[0] && val[0].value) { sub.push(<Tag className='first type'>{this.fullname(val[0].value)+": "}</Tag>) }
            if(lab && lab[0] && lab[0].value) for(let l of lab) {
               sub.push(<Tag className='label'>{this.fullname(l.value)}</Tag>)
            }
            else {
               for(let f of Object.keys(elem)) {
                  let subsub = []
                  if(f === rdf+"type") continue;
                  else {
                     subsub.push(<Tag className='first prop'//{...(val ? {className:'first prop'}:{className:'first type'}) }
                     >{this.fullname(f)+": "}</Tag>)

                     val = elem[f]
                     for(let v of val)
                     {
                        let txt = v.value;
                        if(v.type == 'uri') txt = this.uriformat(f,v)
                        else txt = this.fullname(v.value)
                        subsub.push(<Tag>{txt}</Tag>)
                     }
                  }
                  sub.push(<div className="subsub">{subsub}</div>)
               }

            }

            ret.push(<div className="sub">{sub}</div>)
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

      //let get = qs.parse(this.props.history.location.search)
      //console.log('qs',get)

      //<Link to="/gallery?manifest=https://eroux.fr/manifest.json" style={{textDecoration:"none"}}><Button>Preview IIIF Gallery</Button></Link>
      //<div style={{height:"50px",fontSize:"26px",display:"flex",justifyContent:"center",alignItems:"center"}}>resource {get.IRI}</div>


      // add nother route to UViewer Gallery page
      return (
         <div style={{overflow:"hidden",textAlign:"center"}}>
            { !this.state.ready && <Loader loaded={false} /> }
            <div className="resource">

               <Link className="goBack" to={this.props.keyword&&!this.props.keyword.match(/^bdr:/)?"/search?q="+this.props.keyword+"&lg="+this.props.language+(this.props.datatype?"&t="+this.props.datatype:""):"/"}>
                  <Button style={{paddingLeft:"0"}}>&lt; Go back to search page</Button>
               </Link>
               {
                  this.props.IRI[0].match(/[PGT]/) &&
                  <Link className="goBack" to={"/search?r=bdr:"+this.props.IRI}>
                     <Button style={{paddingLeft:"50px"}}>Browse associated resources &gt;</Button>
                  </Link>
               }
               {this.format("h1",rdf+"type",this.props.IRI)}
               {this.format("h2",skos+"prefLabel")}
               { /*<MapComponent tmp={this.props}/ */}
               <div className="data">
                  <div>
                     <h3><span>Resource File</span>:&nbsp;</h3>
                     <h4><a href={"http://purl.bdrc.io/resource/"+this.props.IRI+".json"}>{this.props.IRI}.json</a></h4>
                     <h4><a href={"http://purl.bdrc.io/resource/"+this.props.IRI+".ttl"}>{this.props.IRI}.ttl</a></h4>
                  </div>
                  { Object.keys(this.properties()).map((k) => {

                     let elem = this.getResourceElem(k);

                     // if(!k.match(new RegExp(adm+"|prefLabel|"+rdf+"|toberemoved"))) {
                     if(!k.match(new RegExp("Revision|Entry|prefLabel|"+rdf+"|toberemoved"))) {
                        let tags = this.format("h4",k)
                        //console.log("tags",tags);
                        return (
                           <div>
                              <h3><span>{this.fullname(k)}</span>:&nbsp;</h3>
                              {tags.map((e)=> [e," "] )}
                           </div>
                           )
                        }
                     }
                  ) }
               </div>
            </div>
            {/* <iframe style={{width:"calc(100% - 100px)",margin:"50px",height:"calc(100vh - 160px)",border:"none"}} src={"http://purl.bdrc.io/resource/"+get.IRI}/> */}
         </div>

      ) ;


   }
}

export default ResourceViewer ;
