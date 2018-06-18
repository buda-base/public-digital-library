//@flow
import _ from "lodash";
import Tooltip from 'material-ui/Tooltip';
import {CopyToClipboard} from 'react-copy-to-clipboard' ;
import $ from 'jquery' ;
import Fullscreen from 'material-ui-icons/Fullscreen';
import IconButton from 'material-ui/IconButton';
import ShareIcon from 'material-ui-icons/Share';
import HomeIcon from 'material-ui-icons/Home';
import Script from 'react-load-script'
import React, { Component } from 'react';
import qs from 'query-string'
import Button from 'material-ui/Button';
import {Translate} from 'react-redux-i18n';
import { Link } from 'react-router-dom';
import IIIFViewerContainer from '../containers/IIIFViewerContainer';
import { Redirect404 } from "../routes.js"
import Loader from "react-loader"
//import {MapComponent} from './Map';
import {getEntiType} from '../lib/api';
import {languages} from './App';

type Props = {
   history:{},
   IRI:string,
   resources?:{},
   assocResources?:{},
   imageAsset?:string,
   firstImage?:string,
   onGetResource: (s:string) => void,
   onHasImageAsset:(s:string) => void
}
type State = {
   uviewer : boolean,
   ready? : boolean,
   imageLoaded:boolean,
   openUV?:boolean,
   hideUV?:boolean,
   toggleUV?:boolean
 }



const adm  = "http://purl.bdrc.io/ontology/admin/" ;
const bdo  = "http://purl.bdrc.io/ontology/core/";
const bdr  = "http://purl.bdrc.io/resource/";
const owl  = "http://www.w3.org/2002/07/owl#";
const rdf  = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const rdfs = "http://www.w3.org/2000/01/rdf-schema#";
const skos = "http://www.w3.org/2004/02/skos/core#";
const tmp  = "http://purl.bdrc.io/ontology/tmp/" ;
const _tmp  = "http://purl.bdrc.io/ontology/tmp/" ;

const prefixes = { adm, bdo, bdr, owl, rdf, rdfs, skos, tmp }

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
      "bdo:workType",
      "bdo:workHasExpression",
      "bdo:workIsAbout",
      "bdo:workGenre",
      // "bdo:creatorMainAuthor",
      // "bdo:creatorContributingAuthor",
      "bdo:workCreator",
      "bdo:workLangScript",
      "bdo:workObjectType",
      "bdo:workMaterial",
      "tmp:dimensions",
      "bdo:workDimWidth",
      "bdo:workDimHeight",
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

let reload = false ;

class ResourceViewer extends Component<Props,State>
{
   constructor(props:Props)
   {
      super(props);

      this.state = { uviewer:false, imageLoaded:false }

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

      window.onpopstate = function(event) {
         if(reload) { window.location.reload(); }
      };

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

      if(!str.match(/ /)) str = str.replace(/([a-z])([A-Z])/g,"$1 $2")

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
      let w = prop[bdo+"workDimWidth"]
      let h = prop[bdo+"workDimHeight"]

      if(w && h && w[0] && h[0] && !w[0].value.match(/cm/) && !h[0].value.match(/cm/)) {
         prop[tmp+"dimensions"] = [ {type: "literal", value: w[0].value+"×"+h[0].value+"cm" } ]
         delete prop[bdo+"workDimWidth"]
         delete prop[bdo+"workDimHeight"]
      }
      else if(w && w[0] && !w[0].value.match(/cm/)) {
         prop[bdo+"workDimWidth"] = [ { ...w[0], value:w[0].value+"cm" } ]
      }
      else if(h && h[0] && !h[0].value.match(/cm/)) {
         prop[bdo+"workDimHeight"] = [ { ...h[0], value:h[0].value+"cm" } ]
      }

      //console.log("w h",w,h,prop)

      //prop["bdr:workDimensions"] =
      if(sorted)
      {


         let parts = prop[bdo+"workHasPart"]

         if(parts) {

            let assoR = this.props.assocResources
            if (assoR) {
               //console.log("AV parts",parts[0],parts)

               parts = parts.map((e) => {

                  let index = assoR[e.value]

                  //console.log("index",index,e)

                  if(index) index = index.filter(e => e.type == bdo+"workPartIndex")
                  if(index && index[0] && index[0].value) index = Number(index[0].value)
                  else index = null

                  //console.log("?",index)

                  return ({ ...e, index })
               })


               /* // weird bug, sort all but leave 79 at @0 and 2 at @78 ...
               parts = parts.sort((a,b) => {
                  if( a.index && b.index) return a.index - b.index
                  return 0 ;
               })
               */

               prop[bdo+"workHasPart"] = _.orderBy(parts,['index'],['asc'])

               //console.log("AP parts",prop[bdo+"workHasPart"][0])
            }
         }

         let t = getEntiType(this.props.IRI);
         if(t && propOrder[t])
         {
            let that = this ;

            //console.log("sort",prop)

            let sortProp = Object.keys(prop).sort((a,b)=> {
               let ia = propOrder[t].indexOf(a)
               let ib = propOrder[t].indexOf(b)
               //console.log(t,a,ia,b,ib)
               if ((ia != -1 && ib != -1 && ia < ib) || (ia != -1 && ib == -1)) return -1
               else return 1 ;
            }).reduce((acc,e) => {

               //console.log("sorting",e,prop[e])
               if(e == bdo+"workHasPart") {
                  //console.log("skip sort parts",prop[e][0],prop[e])
                  return { ...acc, [e]:prop[e] }
               }

               return ({ ...acc, [e]:prop[e].sort(function(A,B){

                  let a = A
                  let b = B
                  if(a.type == "bnode" && a.value) a = that.getResourceBNode(a.value)
                  if(b.type == "bnode" && b.value) b = that.getResourceBNode(b.value)

                  //console.log(a,b)

                  if(!a["value"] && a[rdfs+"label"] && a[rdfs+"label"][0]) a = a[rdfs+"label"][0]
                  if(a["lang"]) a = a["lang"]
                  else if(a["xml:lang"] && a["xml:lang"] != "") a = a["xml:lang"]
                  //else if(a["type"] == "uri") a = a["value"]
                  else a = null

                  if(!b["value"] && b[rdfs+"label"] && b[rdfs+"label"][0]) b = b[rdfs+"label"][0]
                  if(b["lang"]) b = b["lang"]
                  else if(b["xml:lang"] && b["xml:lang"] != "") b = b["xml:lang"]
                  //else if(b["type"] == "uri") b = b["value"]
                  else b = null

                  //console.log(a,b)

                  if( a && b ) {
                     if(a < b ) return -1 ;
                     else if(a > b) return 1 ;
                     else return 0 ;
                  }
                  else return 0 ;
               }) })},{})


         // console.log("propSort",prop,sortProp)

            return sortProp
         }
      }
      return prop ;
   }



   fullname(prop:string)
   {
      for(let p of Object.keys(prefixes)) { prop = prop.replace(new RegExp(p+":","g"),prefixes[p]) }

      //console.log("full",prop)

      if(this.props.ontology[prop] && this.props.ontology[prop][rdfs+"label"])
      {
         let ret = this.props.ontology[prop][rdfs+"label"].filter((e) => (e.lang == "en"))
         if(ret.length == 0) ret = this.props.ontology[prop][rdfs+"label"].filter((e) => (e.lang == this.props.prefLang))
         if(ret.length == 0) ret = this.props.ontology[prop][rdfs+"label"]

         return ret[0].value

       //&& this.props.ontology[prop][rdfs+"label"][0] && this.props.ontology[prop][rdfs+"label"][0].value) {
         //let comment = this.props.ontology[prop][rdfs+"comment"]
         //if(comment) comment = comment[0].value
         //return <a className="nolink" title={comment}>{this.props.ontology[prop][rdfs+"label"][0].value}</a>
         //return this.props.ontology[prop][rdfs+"label"][0].value
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

     console.log("showAssoc e k",e,k);

     if(this.props.ontology[k] && this.props.ontology[k][bdo+"inferSubTree"]) return


      let vals = [], n=0;
      for(let v of Object.keys(this.props.resources[this.props.IRI+"@"][e]))
      {
        // console.log("v",v);

         let infoBase = this.props.resources[this.props.IRI+"@"][e][v]
         let info = infoBase.filter((e)=>(enti == "Topic" || e.type == k)) // || e.value == bdr+this.props.IRI))

         if(info.length > 0) {

           info = infoBase.filter((e)=>(e.type == skos+"prefLabel" && e["xml:lang"]==this.props.prefLang))
           //console.log("infoB",info)
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
      if(!this.props.ontology[k] || (!this.props.ontology[k][rdfs+"subPropertyOf"] && !this.props.ontology[k][rdfs+"subClassOf"]))
      {
         return false
      }
      else  {
         let tmp = this.props.ontology[k][rdfs+"subPropertyOf"].map(e => e)
         if(!tmp) tmp = this.props.ontology[k][rdfs+"subClassOf"].map(e => e)
         while(tmp && tmp.length > 0)
         {
            let e = tmp[0]

            //console.log("k e",k,e.value,e, this.props.ontology[k], this.props.ontology[e.value])

            if(this.props.ontology[e.value][rdfs+"subPropertyOf"])
               tmp = tmp.concat(this.props.ontology[e.value][rdfs+"subPropertyOf"].map(f => f))
            else if(this.props.ontology[e.value][rdfs+"subClassOf"])
               tmp = tmp.concat(this.props.ontology[e.value][rdfs+"subClassOf"].map(f => f))

            if(this.props.ontology[e.value] && this.props.ontology[e.value][bdo+"inferSubTree"]) return true ;

            delete tmp[0]
            tmp = tmp.filter(e => e != null)
         }
         return false ;
      }

   }

   hasSub(k:string)
   {
      if(!k.match(/^http:\/\/purl\.bdrc\.io/)) return false
      else return (this.props.ontology[k] && this.props.ontology[k][bdo+"inferSubTree"])

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

         //console.log("uriformat",prop,elem.value,dico)

         if(!elem.value.match(/^http:\/\/purl\.bdrc\.io/)) {
            return <a href={elem.value} target="_blank">{decodeURI(elem.value)}</a> ;
         }

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



                  let ret = []

                  let info,infoBase,lang ;
                  if(dico) {
                     infoBase = dico[elem.value]

                     if(infoBase) {
                        /*
                        if(prop == bdo+"workHasExpression") {
                           prop = bdo+"workPartOf" ;
                           ret.push("in ");
                           infoBase = infoBase.sort(function(a,b) {
                              if(a.type == prop && b.type == prop){
                                 if(a.value < b.value) return -1 ;
                                 else if(a.value > b.value) return 1 ;
                                 else return 0 ;
                              }
                              else
                                 return 0 ;

                           })
                        }
                        */
                        info = infoBase.filter((e)=>(e["xml:lang"] && e.type==prop && e["xml:lang"]==this.props.prefLang))
                        if(info.length == 0) info = infoBase.filter((e)=>(e["xml:lang"] && e.type==prop))

                        //console.log("info0",info)
                        //if(info.value) info = info.value

                        if(info[0]) {
                           lang = info[0]["xml:lang"]
                           info = info[0].value
                        }
                        else if(!withProp){
                           info = infoBase.filter((e) => e["xml:lang"]==this.props.prefLang)

                           if(info[0]) {
                              lang = info[0]["xml:lang"]
                              info = info[0].value
                           }
                           else {
                              info = infoBase.filter((e) => e["xml:lang"]=="bo-x-ewts")
                              if(info[0]) {
                                 lang = info[0]["xml:lang"]
                                 info = info[0].value
                              }
                              else {
                                 lang = infoBase[0]["xml:lang"]
                                 info = infoBase[0].value
                              }
                           }
                        }
                     }
                  }

                  //console.log("s",prop,info,infoBase)

                  // we can return Link
                  let pretty = this.fullname(elem.value);

                  if(info && infoBase && infoBase.filter(e=>e["xml:lang"]).length >= 0) {
                     ret.push([<Link className="urilink prefLabel" to={"/show/bdr:"+pretty}>{info}</Link>,lang?<Tooltip placement="bottom-end" title={
                        <div style={{margin:"10px"}}>
                           <Translate value={languages[lang]?languages[lang].replace(/search/,"tip"):lang}/>
                        </div>
                     }><span className="lang">{lang}</span></Tooltip>:null])
                  }
                  else if(pretty.toString().match(/^V[0-9A-Z]+_I[0-9A-Z]+$/)) { ret.push(<span>
                     <Link className="urilink" to={"/show/bdr:"+pretty}>{pretty}</Link>&nbsp;
                     {/* <Link className="goBack" target="_blank" to={"/gallery?manifest=http://iiifpres.bdrc.io/2.1.1/v:bdr:"+pretty+"/manifest"}>{"(view image gallery)"}</Link> */}
                  </span> ) }
                  else if(pretty.toString().match(/^([A-Z]+[_0-9-]*[A-Z]*)+$/)) ret.push(<Link className="urilink" to={"/show/bdr:"+pretty}>{pretty}</Link>)
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

   format(Tag,prop:string,txt:string="",bnode:boolean=false,div:string="sub")
   {
      //console.group("FORMAT")

      let elemN,elem;
      if(bnode) {

         elem = [{ "type":"bnode","value":prop}] //[ this.getResourceBNode(prop) ]

         //div = div +"sub"

         // console.log("?bnode",elem)

         //return this.format(Tag,prop,txt,false,div)

         //elem = Object.values(elem)
         //for(let i of Object.keys(elemN)) { if(!i === rdf+"type") { elem.push(elemN[i]); } }

         //elem = [].concat.apply([],elem);

      }
      else {
         elem = this.getResourceElem(prop)

         // console.log("?normal",elem)
      }

      /*
      if(elem) elem = elem.sort((a,b) => {
         if(a.type == "uri" && b.type == "uri") {
            if(a.value.match(new RegExp(bdr)) && b.value.match(new RegExp(bdo))) { return 1; }
            else return 0 ;
         }
         else return 0;
      })
      */

      //console.log("format",prop,elem,txt,bnode,div);

      let ret = []

      if(elem && !Array.isArray(elem)) elem = [ elem ]

      //console.log(elem)

      if(elem) for(let e of elem)
      {
         let value = ""+e
         if(e.value) value = e.value
         else if(e["@value"]) value = e["@value"]
         else if(e["@id"]) value = e["@id"]
         let pretty = this.fullname(value)

         //console.log("e",e,pretty)

         if(e.type != "bnode")
         {
            let tmp
            if(e.type == "uri") tmp = this.uriformat(prop,e)
            else {
               let lang = e["lang"]
               if(!lang) lang = e["xml:lang"]
               tmp = [pretty,lang?<Tooltip placement="bottom-end" title={
               <div style={{margin:"10px"}}>
                  <Translate value={languages[lang]?languages[lang].replace(/search/,"tip"):lang}/>
               </div>
            }><span className="lang">{lang}</span></Tooltip>:null];
            }

            if(this.props.assocResources && prop == bdo+"workHasExpression") {

               let root = this.props.assocResources[e.value] //this.uriformat(_tmp+"workRootWork",e)
               if(root) root = root.filter(e => e.type == bdo+"workHasRoot")
               if(root && root.length > 0) tmp = [tmp," in ",this.uriformat(bdo+"workHasRoot",root[0])]
            }

            if(this.props.assocResources && this.props.assocResources[e.value] && this.props.assocResources[e.value].filter(f => f.type == bdo+"originalRecord").length > 0)
            {

               let elem = this.props.assocResources[e.value] //this.uriformat(_tmp+"workRootWork",e)

               if(elem) {
                  let ori = elem.filter(e => e.type == bdo+"originalRecord")
                  let lab = elem.filter(e => e.type == bdo+"contentProvider")

                  //console.log("ori,lab",ori,lab)

                  if(ori.length > 0 && lab.length > 0) tmp = [tmp," at ",<a href={ori[0].value} target="_blank">{lab[0].value}</a>]
               }
            }

            // else  return ( <Link to={"/resource?IRI="+pretty}>{pretty}</Link> ) ;

            if(!txt) ret.push(<Tag>{tmp}</Tag>)
            else ret.push(<Tag>{tmp+" "+txt}</Tag>)

            //console.log("ret",ret)
         }
         else {

            elem = this.getResourceBNode(e.value)
            //console.log("bnode",e.value,elem)

            if(!elem) continue ;

            let sub = []

            let val = elem[rdf+"type"]
            let lab = elem[rdfs+"label"]

            //console.log("val",val);
            //console.log("lab",lab);

            let noVal = true ;

            // property name ?
            if(val && val[0] && val[0].value)
            {
               noVal = false ;
               sub.push(<Tag className={'first '+(div == "sub"?'type':'prop')}>{this.fullname(val[0].value)+": "}</Tag>)
            }

            // direct property value/label ?
            if(lab && lab[0] && lab[0].value)
            {
               for(let l of lab) {
                  let lang = l["lang"]
                  if(!lang) lang = l["xml:lang"]
                  sub.push(<Tag className='label'>{[this.fullname(l.value),lang?<Tooltip placement="bottom-end" title={
                     <div style={{margin:"10px"}}>
                        <Translate value={languages[lang]?languages[lang].replace(/search/,"tip"):lang}/>
                     </div>
                  }><span className="lang">{lang}</span></Tooltip>:null]}</Tag>)
               }

               ret.push(<div className={div}>{sub}</div>)
            }
            else
            {
               let first = " here" ;

               for(let f of Object.keys(elem))
               {
                  let subsub = []

                  if(!f.match(/[/]note/)) first="" ;

                  //console.log("f",f)

                  let hasBnode = false ;

                  if(f == rdf+"type") continue;
                  else
                  {
                     if(!noVal)
                        subsub.push(<Tag className={'first '+(div == ""?'type':'prop')}>{this.fullname(f)+": "}</Tag>)
                     //{...(val ? {className:'first prop'}:{className:'first type'}) }
                     else
                        sub.push(<Tag className={'first '+(!bnode?"type":"prop")}>{this.fullname(f)+": "}</Tag>)

                     val = elem[f]
                     for(let v of val)
                     {
                        let txt = v.value;
                        if(v.type == 'bnode')
                        {
                           hasBnode = true
                           subsub.push(this.format("h4",txt,"",true,div+"sub"))
                        }
                        else {
                           if(v.type == 'uri') txt = this.uriformat(f,v)
                           else txt = this.fullname(v.value)

                           if(v["lang"] || v["xml:lang"]) {
                              let lang = v["lang"]
                              if(!lang) lang = v["xml:lang"]
                              txt = [txt,lang?<Tooltip placement="bottom-end" title={
                                 <div style={{margin:"10px"}}>
                                    <Translate value={languages[lang]?languages[lang].replace(/search/,"tip"):lang}/>
                                 </div>
                              }><span className="lang">{lang}</span></Tooltip>:null]
                           }
                           if(!noVal) subsub.push(<Tag>{txt}</Tag>)
                           else sub.push(<Tag>{txt}</Tag>)
                        }
                     }
                  }
                  if(!noVal)sub.push(<div className={div+"sub "+(hasBnode?"full":"")}>{subsub}</div>)
                  else {
                     if(subsub.length > 0) sub.push(subsub) //<div className="sub">{subsub}</div>)
                     ret.push(<div className={div+ first}>{sub}</div>)
                     sub = []
                     first = ""
                  }
               }
               if(!noVal)ret.push(<div className={div+" "+(bnode?"full":"")}>{sub}</div>)

            }


         }
      }

      //console.groupEnd();

      return ret ;

   }

   showUV()
   {
      let state = { ...this.state, openUV:true, hideUV:false }
      this.setState(state);


      reload = true ;
/*
       //window.addEventListener('uvLoaded', function (e) {
           window.createUV('#uv', {
               iiifResourceUri: this.props.imageAsset,
               configUri: 'uv-config.json',
               embedded:true,
               isLightbox:true

           }, new window.UV.URLDataProvider());

           let remove = $.fn.remove
           console.log("UV",$("#uv .uv"));
       //}, false);

       */
   }

   render()
    {
      console.log("render",this.props,this.state)
//
      if(!this.props.IRI || (this.props.failures && this.props.failures[this.props.IRI]))
      {
         let msg = "IRI undefined" ;
         if(this.props.IRI) msg = "Resource "+this.props.IRI+" does not exist."
         return (
            <Redirect404  history={this.props.history} message={msg}/>
         )
      }

      //let get = qs.parse(this.props.history.location.search)
      //console.log('qs',get)

      //<Link to="/gallery?manifest=https://eroux.fr/manifest.json" style={{textDecoration:"none"}}><Button>Preview IIIF Gallery</Button></Link>
      //<div style={{height:"50px",fontSize:"26px",display:"flex",justifyContent:"center",alignItems:"center"}}>resource {get.IRI}</div>

      let kZprop = Object.keys(this.properties(true))
      let kZasso ;
      if (this.props.assocResources) {
         kZasso = Object.keys(this.props.assocResources) ;

         let elem = this.getResourceElem(bdo+"workHasItem")
         if(!this.props.manifestError && elem) for(let e of elem)
         {
            let assoc = this.props.assocResources[e.value]

            console.log("hImA",assoc,e.value)

            if(assoc && assoc.length > 0 && !this.props.imageAsset && !this.props.manifestError) {

               this.setState({...this.state, imageLoaded:false})

               if(assoc.length == 1) { this.props.onHasImageAsset("http://iiifpres.bdrc.io/2.1.1/v:bdr:"+this.pretty(assoc[0].value)+"/manifest",this.props.IRI); }
               else { this.props.onHasImageAsset("http://iiifpres.bdrc.io/2.1.1/collection/i:bdr:"+this.pretty(e.value),this.props.IRI);  }

            }
         }
      }


      if(!this.props.manifestError && this.props.imageAsset && this.state.openUV && !this.state.hideUV) {

         let itv = setInterval((function(that){ return function(){

            let iframe = $('.uv:not(.hide) iframe')

            //console.log("check");

            if(iframe.length > 0){

               //if(iframe.offset().top == 0) {

               iframe.get(0).style.position = "absolute" ;

               console.log("ready to stop");

               clearInterval(itv);

               itv = setInterval(function(){


                  iframe = $('.uv:not(.hide) iframe')

                  //console.log("quit?",that.state,iframe.get(0).style) //,iframe.length > 0?iframe.get(0).style.position:"null",that.state);

                  if(iframe.length > 0 && iframe.get(0).style.position === "static" )
                  {
                     clearInterval(itv);

                     that.setState({...that.state, hideUV:true, toggleUV:true})

                     console.log("quitted",that);

                  }
               }, 350);
               //}
            }


         }})(this), 350);


            //iframe.find("a.exitFullscreen").click(function(){
            //      alert("test");
            //   });

            //$("a.exitFullscreen").click(function(){ console.log("length",$("a.fullscreen").length)})

      }


      if(kZprop.indexOf(bdo+"imageList") !== -1)
      {
         if(!this.props.imageAsset && !this.props.manifestError) {
            this.setState({...this.state, imageLoaded:false})
            this.props.onHasImageAsset("http://iiifpres.bdrc.io/2.1.1/v:bdr:"+ this.props.IRI+ "/manifest",this.props.IRI);
         }
      }
      else if(kZprop.indexOf(bdo+"hasIIIFManifest") !== -1)
      {
         let elem = this.getResourceElem(bdo+"hasIIIFManifest")
         if(elem[0] && elem[0].value && !this.props.manifestError && !this.props.imageAsset) {
            this.setState({...this.state, imageLoaded:false})
            this.props.onHasImageAsset(elem[0].value,this.props.IRI);
         }
      }
      else if(kZprop.indexOf(bdo+"workLocation") !== -1)
      {
         if(!this.props.imageAsset && !this.props.manifestError) {
            this.setState({...this.state, imageLoaded:false})
            this.props.onHasImageAsset("http://presentation.bdrc.io/2.1.1/collection/wio:bdr:"+this.props.IRI,this.props.IRI)
         }
      }

      let titre ;

      if(kZprop.indexOf(skos+"prefLabel") !== -1)
         titre = this.format("h2",skos+"prefLabel")
      else if(kZprop.indexOf(bdo+"eTextTitle") !== -1)
         titre = this.format("h2",bdo+"eTextTitle")



      // add nother route to UViewer Gallery page
      return (
         <div style={{overflow:"hidden",textAlign:"center"}}>
            { !this.state.ready && <Loader loaded={false} /> }
            <div className={"resource "+getEntiType(this.props.IRI).toLowerCase()}>

               <Link style={{fontSize:"26px"}} className="goBack" to={this.props.keyword&&!this.props.keyword.match(/^bdr:/)?"/search?q="+this.props.keyword+"&lg="+this.props.language+(this.props.datatype?"&t="+this.props.datatype:""):"/"}>
                  {/* <Button style={{paddingLeft:"0"}}>&lt; Go back to search page</Button> */}
                  <IconButton style={{paddingLeft:0}} title="Go back to search page">
                     <HomeIcon style={{fontSize:"30px"}}/>
                  </IconButton>
               </Link>
               <a className="goBack" target="_blank" title="TTL version" rel="alternate" type="text/turtle" href={"http://purl.bdrc.io/resource/"+this.props.IRI+".ttl"}>
                  <Button style={{marginLeft:"50px",paddingRight:"0"}}>export to ttl</Button>
               </a>&nbsp;/&nbsp;
               <a className="goBack noML" target="_blank" title="JSON-LD version" rel="alternate" type="application/ld+json" href={"http://purl.bdrc.io/resource/"+this.props.IRI+".jsonld"}>
                  <Button style={{paddingLeft:0}}>json-ld</Button>
               </a>
               <CopyToClipboard text={"http://purl.bdrc.io/resource/"+this.props.IRI} onCopy={(e) =>
                        //alert("Resource url copied to clipboard\nCTRL+V to paste")
                        prompt("Resource url has been copied to clipboard.\nCTRL+V to paste","http://purl.bdrc.io/resource/"+this.props.IRI)
                  }>

                  {/* <Button className="goBack" style={{marginLeft:"30px"}}>Copy permalink</Button> */}
                  <IconButton style={{marginLeft:"35px"}} title="Copy URL to clipboard">
                     <ShareIcon />
                  </IconButton>
               </CopyToClipboard>
               {

                  !this.props.manifestError && this.props.imageAsset &&
                  [/* <Button className="goBack" onClick={this.showUV.bind(this)}
                     style={{paddingRight:"0",marginRight:"20px"}}>view image gallery</Button>, */

                     <CopyToClipboard text={this.props.imageAsset} onCopy={(e) =>
                              //alert("Resource url copied to clipboard\nCTRL+V to paste")
                              prompt("IIIF Manifest url has been copied to clipboard.\nCTRL+V to paste",this.props.imageAsset)
                        }>

                        <Button id="iiif" className="goBack" ><img src="/iiif.png"/></Button>
                     </CopyToClipboard>]

               }
               {
                  this.props.IRI[0].match(/[PGTW]/) &&
                  <Link className="goBack" to={"/search?r=bdr:"+this.props.IRI}>
                     <Button style={{marginLeft:"30px"}}>Browse associated resources &gt;</Button>
                  </Link>
               }
               {/* {this.format("h1",rdf+"type",this.props.IRI)} */}
               { titre }
               { /*<MapComponent tmp={this.props}/ */}
               {/*
                  hasImageAsset && //this.props.openUV &&
                  <IIIFViewerContainer
                     manifest={!multipleVolume ? "http://iiifpres.bdrc.io/2.1.1/v:bdr:"+hasImageAsset+"/manifest"
                                                :"http://iiifpres.bdrc.io/2.1.1/collection/i:bdr:"+hasImageAsset}
                     location={this.props.history.location}
                     history={this.props.history}/>
                     */
               }
               {
                  !this.props.manifestError && this.props.imageAsset && //!this.state.openUV &&
                  <div className={"uvDefault "+(this.state.imageLoaded?"loaded":"")} onClick={this.showUV.bind(this)}>
                     <Loader className="uvLoader" loaded={this.state.imageLoaded} color="#fff"/>
                     <img src={this.props.firstImage} onLoad={(e)=>this.setState({imageLoaded:true})}/>
                     {
                        this.props.firstImage && this.state.imageLoaded &&
                        <div id="title">
                           <span>View image gallery</span>
                           <Fullscreen style={{transform: "scale(1.4)",position:"absolute",right:"3px",top:"3px"}}/>
                        </div>
                     }
                  </div>
               }
               {

                  !this.props.manifestError && this.props.imageAsset && this.state.openUV &&
                  [<div id="fondUV" className={(this.state.hideUV?"hide":"")}>
                     <Loader loaded={false} color="#fff"/>
                  </div>,
                  <div
                  className={"uv "+(this.state.toggleUV?"toggled ":"")+(this.state.hideUV?"hide":"")}
                  data-locale="en-GB:English (GB),cy-GB:Cymraeg"
                  //data-config="/config.json"
                  //data-uri="https://eap.bl.uk/archive-file/EAP676-12-4/manifest"
                  data-uri={this.props.imageAsset}
                  data-collectionindex="0"
                  data-manifestindex="0"
                  data-sequenceindex="0"
                  data-fullscreen="true"
                  data-canvasindex="0"
                  data-zoom="-1.0064,0,3.0128,1.3791"
                  data-rotation="0"
                  style={{width:"0",height:"0",backgroundColor: "#000"}}
               />,
                  <Script url={"http://universalviewer.io/uv/lib/embed.js"} />]

               }
               { (!this.state.openUV || this.state.hideUV || !this.state.toggleUV) && <div className="data">
                  { kZprop.map((k) => {

                     let elem = this.getResourceElem(k);

                     //console.log("prop",k,elem);

                     //if(!k.match(new RegExp("Revision|Entry|prefLabel|"+rdf+"|toberemoved"))) {
                     if(!k.match(new RegExp(adm+"|adm:|TextTitle|SourcePath|prefLabel|"+rdf+"|toberemoved|workPartIndex|workPartTreeIndex")))
                     {

                        let sup = this.hasSuper(k)

                        if(!sup) // || sup.filter(e => e.value == bdo+"workRefs").length > 0) //
                        {
                           let tags = this.format("h4",k)

                           //console.log("tags",tags);


                           if(k == bdo+"workLocation")
                           {
                              elem = this.getResourceElem(k)
                              if(elem && Array.isArray(elem) && elem[0]) {
                                 elem = this.getResourceBNode(elem[0].value)
                                 let str = ""
                                 console.log("loca",elem)

                                 let loca = s => (elem[bdo+"workLocation"+s] && elem[bdo+"workLocation"+s][0]["value"] ? elem[bdo+"workLocation"+s][0]["value"]:null)

                                 let vol = loca("Volume")
                                 if(vol) str += "Vol."+vol+" " ;
                                 let p = loca("Page")
                                 if(p) str += "p."+p ;
                                 let l = loca("Line")
                                 if(l) str += "|"+l ;
                                 str += " - "
                                 let eV = loca("EndVolume")
                                 if(eV) str += "Vol."+eV+" " ;
                                 let eP = loca("EndPage")
                                 if(eP) str += "p."+eP ;
                                 let eL = loca("EndLine")
                                 if(eL) str += "|"+eL ;

                                 let w = loca("Work")
                                 if(w) w = elem[bdo+"workLocationWork"][0]

                                 tags = [<Tooltip placement="bottom-start" style={{marginLeft:"50px"}} title={
                                    <div style={{margin:"10px"}}>
                                       {vol && <div><span>Begin Volume:</span> {vol}</div>}
                                       {p && <div><span>Begin Page:</span> {p}</div>}
                                       {l && <div><span>Begin Line:</span> {l}</div>}
                                       {eV && <div><span>End Volume:</span> {eV}</div>}
                                       {eP && <div><span>End Page:</span> {eP}</div>}
                                       {eL && <div><span>End Line:</span> {eL}</div>}
                                    </div>
                                 }>
                                    <h4>{str}{w && " of "}{w && this.uriformat(bdo+"workLocationWork",w)}</h4>
                              </Tooltip>] ;
                              }
                           }
                           else if(k == bdo+"workHasExpression")
                           {
                           // 1-map avec le nom du children[2] si ==3chldren et children[1] = " in "
                              tags = tags.map(e => {

                                 console.log("e",e)

                                 if(e.props.children.length == 3 && e.props.children[1] === " in " && e.props.children[2][0][0].props)
                                 {
                                    //console.log("key",e.props.children[2][0][0].props.children)

                                    if(e.props.children[2][0][0].props.children)
                                       return { ...e , "exprKey" : e.props.children[2][0][0].props.children.replace(/[/]/,"") }
                                 }
                                 /*
                                 else if(e.props.children.length == 1)
                                 {
                                    return { ...e , "exprKey" : e.props.children[0][0].props.children }
                                 }
                                 */

                                 return { ...e, "exprKey": "" } ;
                              });


                           // 2-lodash sort
                              tags = _.sortBy(tags,'exprKey')

                              console.log("sorted tags",tags);

                           }

                           return (
                              <div>
                                 <h3><span>{this.fullname(k)}</span>:&nbsp;</h3>
                                 {this.hasSub(k)?this.subProps(k):tags.map((e)=> [e," "] )}
                              </div>
                              )
                        }


                     }

                  } ) }
                  {/*
                  <div>
                     <h3><span>Resource File</span>:&nbsp;</h3>
                     <h4><a target="_blank" href={"http://purl.bdrc.io/resource/"+this.props.IRI+".jsonld"}>{this.props.IRI}.jsonld</a></h4>
                     <h4><a target="_blank" href={"http://purl.bdrc.io/resource/"+this.props.IRI+".ttl"}>{this.props.IRI}.ttl</a></h4>
                  </div>
                  */}

                  { /* ["Person","Place","Topic"].indexOf(getEntiType(this.props.IRI)) !== -1 &&
                     <div>
                        <h3><span>Associated Resources</span>:&nbsp;</h3>
                        {
                           this.props.resources && this.props.resources[this.props.IRI+"@"] &&
                              Object.keys(this.props.resources[this.props.IRI+"@"]).map((e) =>
                                 <div className="sub" id={e.replace(/s$/,"")}>
                                    <h4 className="first type">{e}:</h4>
                                    <h4 className="prop last">(<a href={"/search?r=bdr:"+this.props.IRI+"&t="+(e[0].toUpperCase()+e.slice(1).replace(/s$/,""))}>browse all</a>)</h4>
                                    {
                                       Object.keys(this.props.resources[this.props.IRI+"@"][e]).reduce((acc,k) => {
                                          //acc = acc.concat(Object.keys(this.props.resources[this.props.IRI+"@"][e][v])) ;

                                          //console.log("redu",acc,k,this.props.resources[this.props.IRI+"@"][e][k]);

                                          this.props.resources[this.props.IRI+"@"][e][k].map((v) => {
                                             let t = getEntiType(this.props.IRI)

                                             //console.log("k v t",k,v,t,bdr+this.props.IRI,kZasso.indexOf(k),kZasso)

                                             if(e == "lineages" && t == "Topic") {
                                                if(acc.indexOf("bdo:lineageObject") == -1) acc.push("bdo:lineageObject") ;
                                             }
                                             else if(e == "works" && t == "Topic") {
                                                if(acc.indexOf("bdo:workGenre") == -1) acc.push("bdo:workGenre") ;
                                             }
                                             else if(v.value == bdr+this.props.IRI) // && kZasso.indexOf(k) == -1) // why ??
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
                  */ }
               </div>
            }
            </div>
            {/* <iframe style={{width:"calc(100% - 100px)",margin:"50px",height:"calc(100vh - 160px)",border:"none"}} src={"http://purl.bdrc.io/resource/"+get.IRI}/> */}
         </div>

      ) ;


   }
}

export default ResourceViewer ;
