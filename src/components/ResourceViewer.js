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
const owl  = "http://www.w3.org/2002/07/owl#";
const rdf  = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const rdfs = "http://www.w3.org/2000/01/rdf-schema#";
const skos = "http://www.w3.org/2004/02/skos/core#";

const prefixes = {adm, bdo, bdr, owl, rdf, rdfs, skos}

let propOrder = {
   "Corporation":[],
   "Etext":[],
   "Item":[],
   "Lineage":[
      "skos:altLabel",
      "bdo:lineageObject",
      "bdo:lineageType",
      "bdo:workLocation",
   ],
   "Person" : [
      "bdo:personName",
      "bdo:personGender",
      "bdo:kinWith",
      "bdo:personEvent",
      // "bdo:incarnationActivities",
      "bdo:isIncarnation",
      "bdo:hasIncarnation",
      // "bdo:incarnationGeneral",
      "bdo:personTeacherOf",
      "bdo:personStudentOf",
      "bdo:note",
      "rdfs:seeAlso",
    ],
   "Place":[
      "skos:altLabel",
      "bdo:placeLocatedIn",
      "bdo:placeContains",
      "bdo:placeIsNear",
      "bdo:placeType",
      "bdo:placeEvent",
      "bdo:placeLong",
      "bdo:placeLat",
   ],
   "Role":[],
   "Topic":[],
   "Work":[
      "bdo:workTitle",
      "bdo:workExpressionOf",
      "bdo:workHasExpression",
      "bdo:workIsAbout",
      "bdo:workGenre",
      // "bdo:creatorMainAuthor",
      // "bdo:creatorContributingAuthor",
      "bdo:workCreator",
      "bdo:workLangScript",
      "bdo:workObjectType",
      "bdo:workEvent",
      "bdo:workHasItem",
      // "bdo:workHasItemImageAsset",
      "bdo:workLocation",
      "bdo:workPartOf",
      "bdo:workHasPart",
      "bdo:note",
      "bdo:workHasSourcePrintery",
   ],
   "Taxonomy":[],
   "Volume":[],
}

class ResourceViewer extends Component<Props,State>
{
   constructor(props:Props)
   {
      super(props);

      this.state = { uviewer : false }

      console.log("props",props)

      let tmp = {}
      for(let k of Object.keys(propOrder)){ tmp[k] = propOrder[k].map((e) => this.expand(e)) }
      console.log("tmp",tmp)
      propOrder = tmp
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

   expand(str:string) //,stripuri:boolean=true)
   {
      for(let k of Object.keys(prefixes)) { str = str.replace(new RegExp(k+":"),prefixes[k]); }

      return str ;
   }

   pretty(str:string) //,stripuri:boolean=true)
   {

      for(let p of Object.values(prefixes)) { str = str.replace(new RegExp(p,"g"),"") }

      //if(stripuri) {

      str = str.replace(/([a-z])([A-Z])/g,"$1 $2")

      if(str.match(/^https?:\/\/[^ ]+$/)) { str = <a href={str} target="_blank">{str}</a> }
      else {
         str = str.split("\n").map((i) => ([i,<br/>]))
         str = [].concat.apply([],str);
         str.pop();
      }

      //}

      return str ;
   }

   properties(sorted : boolean = false)
   {
      if(!this.props.IRI || !this.props.resources || !this.props.resources[this.props.IRI]
         || !this.props.resources[this.props.IRI][bdr+this.props.IRI]) return {}

      let prop = this.props.resources[this.props.IRI][bdr+this.props.IRI] ;
      if(sorted) {
         let sortProp = Object.keys(prop).sort((a,b)=> {
            let t = getEntiType(this.props.IRI);
            let ia = propOrder[t].indexOf(a)
            let ib = propOrder[t].indexOf(b)
            //console.log(t,a,ia,b,ib)
            if ((ia != -1 && ib != -1 && ia < ib) || (ia != -1 && ib == -1)) return -1
            else return 1 ;
         }).reduce((acc,e) => ({ ...acc, [e]:prop[e] }),{})

         // console.log("propSort",prop,sortProp)

         return sortProp

      }
      return prop ;
   }



   fullname(prop:string)
   {
      for(let p of Object.keys(prefixes)) { prop = prop.replace(new RegExp(p+":","g"),prefixes[p]) }

      if(this.props.ontology[prop] && this.props.ontology[prop][rdfs+"label"] && this.props.ontology[prop][rdfs+"label"][0]
      && this.props.ontology[prop][rdfs+"label"][0].value) {
         //let comment = this.props.ontology[prop][rdfs+"comment"]
         //if(comment) comment = comment[0].value
         //return <a className="nolink" title={comment}>{this.props.ontology[prop][rdfs+"label"][0].value}</a>
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


   showAssocResources(e:string,k:string)
   {
     let enti = getEntiType(this.props.IRI)

     if(this.props.ontology[k] && this.props.ontology[k][bdo+"inferSubTree"]) return

      // console.log("e k",e,k);
      let vals = [], n=0;
      for(let v of Object.keys(this.props.resources[this.props.IRI+"@"][e]))
      {
        // console.log("v",v);

         let infoBase = this.props.resources[this.props.IRI+"@"][e][v]
         let info = infoBase.filter((e)=>(enti == "Topic" || e.type == k)) // || e.value == bdr+this.props.IRI))

         if(info.length > 0) {

           info = infoBase.filter((e)=>(e.type == skos+"prefLabel" && e["xml:lang"]==this.props.prefLang))
           // console.log("infoB",info)
           if(info[0] && n <= 10) vals.push(<h4><Link className="urilink prefLabel" to={"/show/bdr:"+this.pretty(v)}>{info[0].value}</Link></h4>)
           else if(n == 11) vals.push("...")
           n ++
         }
      }

      //).map((v,i) => {
      //  if(i < 10) return <h4>{this.uriformat(k /*skos+"prefLabel"*/,{value:v},this.props.resources[this.props.IRI+"@"][e],k)}</h4>
      //  else if(i == 10) return [<h4>{this.uriformat(k /*skos+"prefLabel"*/,{value:v},this.props.resources[this.props.IRI+"@"][e],k)}</h4>,"..."]


     return ([
       <h4 className="first prop">{this.fullname(k)}:</h4>
       ,
       <div>
       { vals }
       </div>])
   }

   hasSuper(k:string)
   {
      return (this.props.ontology[k] && this.props.ontology[k][rdfs+"subPropertyOf"])

   }

   hasSub(k:string)
   {
      return (this.props.ontology[k] && this.props.ontology[k][bdo+"inferSubTree"])

   }

   subProps(k:string,div:string="sub")
   {
      let ret = []
      if(this.props.IRI && this.props.resources[this.props.IRI] && this.props.resources[this.props.IRI][bdr+this.props.IRI]) {

         for(let p of Object.keys(this.props.resources[this.props.IRI][bdr+this.props.IRI])) {

            if(this.props.ontology[p] && this.props.ontology[p][rdfs+"subPropertyOf"]
               && this.props.ontology[p][rdfs+"subPropertyOf"].filter((e)=>(e.value == k)).length > 0)
            {

               let tmp = this.subProps(p,div+"sub")
               let vals

               if(tmp.length == 0) vals = this.format("h4",p).map((e)=>[e," "])
               else vals = tmp

               if(div == "sub")
                  ret.push(<div className='sub'><h4 className="first type">{this.fullname(p)}:</h4>{vals}</div>)
               else if(div == "subsub")
                  ret.push(<div className={'subsub'+(tmp.length>0?" full":"")}><h4 className="first prop">{this.fullname(p)}:</h4>{vals}</div>)
               else if(div == "subsubsub")
                  ret.push(<div className='subsubsub'><h4 className="first prop">{this.fullname(p)}:</h4>{vals}</div>)

            }
         }
      }
      return ret
   }

   uriformat(prop:string,elem:{},dico:{} = this.props.assocResources, withProp:string)
   {
      if(elem) {

         // test if ancestor/type of property has range subclassof entity
/*
         let q =[]
         q.push(prop)


         console.log("uriformat",prop,elem.value)

         while(q.length > 0)
         {
            console.log("q",q)

            let t = this.props.ontology[q.shift()]

            if(t && t[rdfs+"range"] && t[rdfs+"range"][0] && t[rdfs+"range"][0].value)
            {

               let s = this.props.ontology[t[rdfs+"range"][0].value]


               if(s && s[rdfs+"subClassOf"] && this.hasValue(s[rdfs+"subClassOf"],bdo+"Entity"))
               {
               */
                  // console.log("dico",prop,elem,dico)

                  let info ;
                  if(dico) {
                     let infoBase = dico[elem.value]

                     if(infoBase) {
                        info = infoBase.filter((e)=>(e.type==prop && e["xml:lang"]==this.props.prefLang))

                        //console.log("info0",info)
                        //if(info.value) info = "youpi"+info.value

                        if(info[0]) info = info[0].value
                        else if(!withProp){
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

                  //console.log("s",prop,info)

                  // we can return Link
                  let pretty = this.pretty(elem.value);
                  let ret = []
                  if(info) ret.push(<Link className="urilink prefLabel" to={"/show/bdr:"+pretty}>{info}</Link>)
                  else if(pretty.toString().match(/([A-Z]+[_0-9+])+/)) ret.push(<Link className="urilink" to={"/show/bdr:"+pretty}>{pretty}</Link>)
                  else ret.push(pretty)
                  return ret


                  /*
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
         */
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

   format(Tag,prop:string,txt:string="",bnode:boolean=false)
   {
      let elem ;
      if(bnode) {
         elem = this.getResourceBNode(prop)
         elem = Object.values(elem) //.map((e) => ({[e]:elem[e]}))
         elem = [].concat.apply([],elem);
      }
      else elem = this.getResourceElem(prop)

      // console.log("format",prop,elem,txt,bnode);

      let ret = []

      if(elem) for(let e of elem)
      {
         // console.log("e",e)
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
            // console.log("bnode",e.value,elem)

            let sub = []

            let val = elem[rdf+"type"]
            let lab = elem[rdfs+"label"]

            // console.log("val",val);
            // console.log("lab",lab);

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
                        if(v.type == 'bnode'){
                           subsub.push(this.format("h4",txt,"",true))
                        }
                        else {
                           if(v.type == 'uri') txt = this.uriformat(f,v)
                           else txt = this.fullname(v.value)
                           subsub.push(<Tag>{txt}</Tag>)
                        }
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

      let kZasso ;
      if (this.props.assocResources) kZasso = Object.keys(this.props.assocResources) ;

      // add nother route to UViewer Gallery page
      return (
         <div style={{overflow:"hidden",textAlign:"center"}}>
            { !this.state.ready && <Loader loaded={false} /> }
            <div className={"resource "+getEntiType(this.props.IRI).toLowerCase()}>

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
                  { Object.keys(this.properties(true)).map((k) => {

                     let elem = this.getResourceElem(k);

                     if(!k.match(new RegExp(adm+"|prefLabel|"+rdf+"|toberemoved"))) {
                     //if(!k.match(new RegExp("Revision|Entry|prefLabel|"+rdf+"|toberemoved"))) {

                        if(!this.hasSuper(k))
                        {
                           let tags = this.format("h4",k)
                           //console.log("tags",tags);
                           return (
                              <div>
                                 <h3><span>{this.fullname(k)}</span>:&nbsp;</h3>
                                 {this.hasSub(k)?this.subProps(k):tags.map((e)=> [e," "] )}
                              </div>
                              )
                        }


                     }

                  } ) }
                  <div>
                     <h3><span>Resource File</span>:&nbsp;</h3>
                     <h4><a target="_blank" href={"http://purl.bdrc.io/resource/"+this.props.IRI+".jsonld"}>{this.props.IRI}.jsonld</a></h4>
                     <h4><a target="_blank" href={"http://purl.bdrc.io/resource/"+this.props.IRI+".ttl"}>{this.props.IRI}.ttl</a></h4>
                  </div>
                  { ["Person","Place","Topic"].indexOf(getEntiType(this.props.IRI)) !== -1 &&
                     <div>
                        <h3><span>Associated Resources</span>:&nbsp;</h3>
                        {
                           this.props.resources && this.props.resources[this.props.IRI+"@"] &&
                              Object.keys(this.props.resources[this.props.IRI+"@"]).map((e) =>
                                 <div className="sub" id={e.replace(/s$/,"")}>
                                    <h4 className="first type">{e}:</h4>
                                    <h4 className="prop last">(<a href={"/search?r=bdr:"+this.props.IRI+"&t="+e.replace(/s$/,"")}>browse all</a>)</h4>
                                    {
                                       Object.keys(this.props.resources[this.props.IRI+"@"][e]).reduce((acc,k) => {
                                          //acc = acc.concat(Object.keys(this.props.resources[this.props.IRI+"@"][e][v])) ;
                                          this.props.resources[this.props.IRI+"@"][e][k].map((v) => {
                                             let t = getEntiType(this.props.IRI)
                                             //console.log("k",k,v,t)
                                             if(e == "lineages" && t == "Topic") {
                                                if(acc.indexOf("bdo:lineageObject") == -1) acc.push("bdo:lineageObject") ;
                                             }
                                             else if(e == "works" && t == "Topic") {
                                                if(acc.indexOf("bdo:workGenre") == -1) acc.push("bdo:workGenre") ;
                                             }
                                             else if(v.value == bdr+this.props.IRI && kZasso.indexOf(k) == -1)
                                             {
                                                //console.log("foundem")
                                                if(acc.indexOf(v.type) == -1) acc.push(v.type) ;
                                             }
                                          } )
                                          return acc ;
                                       },[]).map((k) =>
                                          <div className="subsub">
                                            { this.showAssocResources(e,k) }
                                          </div>
                                       )
                                    }
                                 </div>
                              )
                        }
                     </div>
                  }
               </div>
            </div>
            {/* <iframe style={{width:"calc(100% - 100px)",margin:"50px",height:"calc(100vh - 160px)",border:"none"}} src={"http://purl.bdrc.io/resource/"+get.IRI}/> */}
         </div>

      ) ;


   }
}

export default ResourceViewer ;
