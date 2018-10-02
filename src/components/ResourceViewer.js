//@flow
import Portal from 'react-leaflet-portal';
import bbox from "@turf/bbox"
import {Map,TileLayer,LayersControl,Marker,Popup,GeoJSON,Tooltip as ToolT} from 'react-leaflet' ;
import 'leaflet/dist/leaflet.css';
import { GoogleLayer } from "react-leaflet-google" ;
//import { GoogleMutant, GoogleApiLoader } from 'react-leaflet-googlemutant';
// import {GoogleLayer} from 'react-leaflet-google'
// const { BaseLayer} = LayersControl;
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import ScrollableAnchor,{goToAnchor,configureAnchors } from 'react-scrollable-anchor'
import Typography from '@material-ui/core/Typography';
import Close from '@material-ui/icons/Close';
import Layers from '@material-ui/icons/Layers';
import PlayArrow from '@material-ui/icons/PlayArrow';
import Visibility from '@material-ui/icons/Visibility';
import SpeakerNotes from '@material-ui/icons/SpeakerNotes';
import SpeakerNotesOff from '@material-ui/icons/SpeakerNotesOff';
import Feedback from '@material-ui/icons/QuestionAnswer';
//import NewWindow from 'react-new-window'
import Collapse from '@material-ui/core/Collapse';
import InfiniteScroll from 'react-infinite-scroller';
import _ from "lodash";
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import {CopyToClipboard} from 'react-copy-to-clipboard' ;
import $ from 'jquery' ;
import Fullscreen from '@material-ui/icons/Fullscreen';
import IconButton from '@material-ui/core/IconButton';
import ShareIcon from '@material-ui/icons/Share';
import HomeIcon from '@material-ui/icons/Home';
import ChatIcon from '@material-ui/icons/Chat';
import Script from 'react-load-script'
import React, { Component } from 'react';
import qs from 'query-string'
import Button from '@material-ui/core/Button';
import {Translate} from 'react-redux-i18n';
import { Link } from 'react-router-dom';
import IIIFViewerContainer from '../containers/IIIFViewerContainer';
import { Redirect404 } from "../routes.js"
import Loader from "react-loader"
//import {MapComponent} from './Map';
import {getEntiType} from '../lib/api';
import {languages} from './App';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import L from 'leaflet';


delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

configureAnchors({offset: -60, scrollDuration: 400})

type Props = {
   history:{},
   IRI:string,
   resources?:{},
   assocResources?:{},
   annoCollec?:{},
   imageAsset?:string,
   firstImage?:string,
   pdfVolumes?:[],
   onInitPdf: (u:string,s:string) => void,
   onRequestPdf: (u:string,s:string) => void,
   onCreatePdf: (s:string,u:string) => void,
   onGetResource: (s:string) => void,
   onGetAnnotations: (s:string) => void,
   onHasImageAsset:(u:string,s:string) => void,
   onGetChunks: (s:string,b:number) => void
}
type State = {
   uviewer : boolean,
   ready? : boolean,
   imageLoaded:boolean,
   openUV?:boolean,
   hideUV?:boolean,
   toggleUV?:boolean,
   collapse:{[string]:boolean},
   pdfOpen?:boolean,
   pdfReady?:boolean,
   anchorElPdf?:any,
   annoPane?:boolean,
   showAnno?:boolean|string,
   viewAnno?:number,
   newAnno?:boolean|{},
   annoCollecOpen?:boolean,
   anchorElAnno?:any,
   largeMap?:boolean
 }



const adm  = "http://purl.bdrc.io/ontology/admin/" ;
const bdac = "http://purl.bdrc.io/anncollection/" ;
const bdan = "http://purl.bdrc.io/annotation/" ;
const bdo  = "http://purl.bdrc.io/ontology/core/";
const bdr  = "http://purl.bdrc.io/resource/";
const foaf = "http://xmlns.com/foaf/0.1/" ;
const owl  = "http://www.w3.org/2002/07/owl#";
const oa = "http://www.w3.org/ns/oa#" ;
const rdf  = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const rdfs = "http://www.w3.org/2000/01/rdf-schema#";
const skos = "http://www.w3.org/2004/02/skos/core#";
const tmp  = "http://purl.bdrc.io/ontology/tmp/" ;
const _tmp  = "http://purl.bdrc.io/ontology/tmp/" ;

const prefixes = { adm, bdac, bdan, bdo, bdr, foaf, oa, owl, rdf, rdfs, skos, tmp }

let propOrder = {
   "Corporation":[],
   "Etext":[],
   "Item":[
      "bdo:itemForWork",
      "bdo:itemVolumes"
   ],
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
      "bdo:placeLat",
      "bdo:placeLong",
      "bdo:placeRegionPoly",
      "bdo:placeType",
      "bdo:placeLocatedIn",
      "bdo:placeIsNear",
      "bdo:placeEvent",
      "bdo:placeContains",
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
   _annoPane = [] ;
   _leafletMap = null

   constructor(props:Props)
   {
      super(props);

      this.state = { uviewer:false, imageLoaded:false, collapse:{}, pdfOpen:false, showAnno:true }

      console.log("props",props)

      let tmp = {}
      for(let k of Object.keys(propOrder)){ tmp[k] = propOrder[k].map((e) => this.expand(e)) }
      //console.log("tmp",tmp)
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

   componentWillUpdate(newProps,newState)
   {
      console.log("stateU",this.state,newState,newProps)


      if(newState.annoPane && !newProps.annoCollec)
      {
         this.props.onGetAnnotations(this.props.IRI)
      }


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

      if(!str.match(/ /) && !str.match(/^http[s]?:/)) str = str.replace(/([a-z])([A-Z])/g,"$1 $2")

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
         || !this.props.resources[this.props.IRI][this.expand(this.props.IRI)]) return {}

      let prop = this.props.resources[this.props.IRI][this.expand(this.props.IRI)] ;
      let w = prop[bdo+"workDimWidth"]
      let h = prop[bdo+"workDimHeight"]

      //console.log("propZ",prop)

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


         let expr = prop[bdo+"workHasExpression"]
         if(expr) {

            let assoR = this.props.assocResources
            if (assoR) {

               expr = expr.map((e) => {

                  let label1,label2 ;

                  //console.log("index",e,assoR[e.value])
                  if(assoR[e.value])
                  {
                     label1 = assoR[e.value].filter(e => e.type === skos+"prefLabel" && (e.lang === this.props.prefLang || e["xml:lang"] === this.props.prefLang))
                     if(label1.length === 0) label1 = assoR[e.value].filter(e => e.type === skos+"prefLabel")
                     if(label1.length > 0) label1 = label1[0].value

                     if(assoR[e.value].filter(e => e.type === bdo+"workHasRoot").length > 0)
                     {
                        label2 = assoR[assoR[e.value].filter(e => e.type === bdo+"workHasRoot")[0].value].filter(e => e.type === skos+"prefLabel" && (e.lang === this.props.prefLang || e["xml:lang"] === this.props.prefLang))
                        if(label2.length === 0) label2 = assoR[assoR[e.value].filter(e => e.type === bdo+"workHasRoot")[0].value].filter(e => e.type === skos+"prefLabel")
                        if(label2.length > 0) label2 = label2[0].value
                        //console.log(label2)
                     }
                  }

                  return ({ ...e, label1, label2 })
               })

               prop[bdo+"workHasExpression"] = _.sortBy(expr,['label1','label2'])

               for(let o of prop[bdo+"workHasExpression"]) console.log(o.value,o.label1)

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
               if(e === bdo+"workHasPart" || e === bdo+"workHasExpression" ) {
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

         if(ret.length > 0 && ret[0].value && ret[0].value != "")
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
       <h4 className="first prop">{this.proplink(k)}:</h4>
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
      if(this.props.IRI && this.props.resources[this.props.IRI] && this.props.resources[this.props.IRI][this.expand(this.props.IRI)]) {

         for(let p of Object.keys(this.props.resources[this.props.IRI][this.expand(this.props.IRI)])) {

            if(this.props.ontology[p] && this.props.ontology[p][rdfs+"subPropertyOf"]
               && this.props.ontology[p][rdfs+"subPropertyOf"].filter((e)=>(e.value == k)).length > 0)
            {

               let tmp = this.subProps(p,div+"sub")
               let vals

               if(tmp.length == 0) vals = this.format("h4",p).map((e)=>[e," "])
               else vals = tmp

               if(div == "sub")
                  ret.push(<div className='sub'><h4 className="first type">{this.proplink(p)}:</h4>{vals}</div>)
               else if(div == "subsub")
                  ret.push(<div className={'subsub'+(tmp.length>0?" full":"")}><h4 className="first prop">{this.proplink(p)}:</h4>{vals}</div>)
               else if(div == "subsubsub")
                  ret.push(<div className='subsubsub'><h4 className="first prop">{this.proplink(p)}:</h4>{vals}</div>)

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
                                 if(infoBase[0].type && infoBase[0].type == bdo+"volumeNumber") info = "Volume "+info ;
                                 else if(info && info.match(/purl[.]bdrc/)) info = null
                                 //console.log("info0",info)
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

   tooltip(lang:string)
   {
      return lang?<Tooltip placement="bottom-end" title={
         <div style={{margin:"10px"}}>
            <Translate value={languages[lang]?languages[lang].replace(/search/,"tip"):lang}/>
         </div>
      }><span className="lang">{lang}</span></Tooltip>:null
   }

   getResourceElem(prop:string)
   {
      if(!this.props.IRI || !this.props.resources || !this.props.resources[this.props.IRI]
         || !this.props.resources[this.props.IRI][this.expand(this.props.IRI)]
         || !this.props.resources[this.props.IRI][this.expand(this.props.IRI)][prop]) return ;

      let elem = this.props.resources[this.props.IRI][this.expand(this.props.IRI)][prop]

      return elem
   }

   getResourceBNode(prop:string)
   {
      if(!this.props.IRI || !this.props.resources || !this.props.resources[this.props.IRI]
         || !this.props.resources[this.props.IRI][prop]) return ;

      let elem = this.props.resources[this.props.IRI][prop]

      return elem
   }

   setCollapse(node,extra:{})
   {
      this.setState(
         {...this.state,
            //collapse:{...this.state.collapse,[node.collapseId]:!this.state.collapse[node.collapseId]},
            ...extra
         }
      )

   }

   format(Tag,prop:string,txt:string="",bnode:boolean=false,div:string="sub")
   {
      //console.group("FORMAT")

      let inCollapse = false

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

      let ret = [],pre = []

      if(elem && !Array.isArray(elem)) elem = [ elem ]

      //console.log(elem)

      let viewAnno = false ;
      if(elem) for(let e of elem)
      {

         let value = ""+e
         if(e.value) value = e.value
         else if(e["@value"]) value = e["@value"]
         else if(e["@id"]) value = e["@id"]
         let pretty = this.fullname(value)

         if(value === bdr+"LanguageTaxonomy") continue ;


         //console.log("e",e,pretty)

         if(e.type != "bnode")
         {

            let tmp
            if(e.type == "uri") tmp = this.uriformat(prop,e)
            else {
               let lang = e["lang"]
               if(!lang) lang = e["xml:lang"]
               tmp = [pretty]

               if(lang) {
                  tmp.push(<Tooltip placement="bottom-end" title={
                        <div style={{margin:"10px"}}>
                           <Translate value={languages[lang]?languages[lang].replace(/search/,"tip"):lang}/>
                        </div>
                     }><span className="lang">{lang}</span></Tooltip>);
                  }
            }

            let tmpAnno ;
            if(e.hasAnno && e.collapseId && Array.isArray(tmp)) {
               let node = e
               let col = "score1";
               if(e.score && Number(e.score) < 0) col = "score0"

               console.log("hasAnno",e,this.state.showAnno);

               if(((!this.state.showAnno || this.state.showAnno == true || this.state.showAnno == e.collecId)) && (!this.state.viewAnno || this.state.viewAnno == e.collapseId)) {
                  viewAnno = true ;
                  let id = e.collapseId
                  this._annoPane.push(<div className="annoSepa"/>)
                  this._annoPane.push(
                     <span className={"anno"} data-id={e.collapseId} >
                        { <Feedback style={{right:"10px"}} onClick={
                           (function(val,prop,v,ev){
                              this.setState({...this.state,annoPane:true,newAnno:{prop:this.proplink(prop),val,replyTo:true},viewAnno:id})
                           }).bind(this,this.uriformat(e.predicate,e),"http://www.w3.org/ns/oa#Annotation","http://www.w3.org/ns/oa#Annotation")
                        } /> }
                        { <Visibility style={{right:"40px"}}
                                    onClick={(event) => { goToAnchor(id); this.setState({...this.state,viewAnno:id}); } }
                        /> }
                        {this.proplink(e.predicate)}: {this.uriformat(e.predicate,e)}<hr/>
                        {/* <span onClick={(event) => this.setCollapse(node)}>{this.pretty(e.hasAnno)}</span> */}
                     </span>
                  )
               }
               else {
                  viewAnno = false ;
               }

               if(this.state.showAnno)
               {
                  if(this.state.showAnno == true || this.state.showAnno == e.collecId)
                  {
                     // onClick={(event) => this.setCollapse(node)}>
                     let id = e.collapseId
                     tmpAnno = [
                           this.state.viewAnno == id && this.state.annoPane && !this.state.newAnno ? <PlayArrow style={{verticalAlign:"-8px",color:"rgba(0,0,0,0.5)"}}/>:null,
                        <ScrollableAnchor id={id}>
                              <div className={"faded "+col}
                                 onClick={ev => {this.setCollapse(node,{annoPane:true,viewAnno:id,newAnno:false}) }}>
                              {tmp}
                           </div>
                           </ScrollableAnchor>]
                  }
               }
            }

            if(this.props.assocResources && prop == bdo+"workHasExpression") {

               let root = this.props.assocResources[e.value] //this.uriformat(_tmp+"workRootWork",e)
               if(root) root = root.filter(e => e.type == bdo+"workHasRoot")
               if(root && root.length > 0) tmp = [tmp," in ",this.uriformat(bdo+"workHasRoot",root[0])]
            }

            if(this.props.assocResources && this.props.assocResources[e.value]
               && this.props.assocResources[e.value].filter(f => f.type == bdo+"originalRecord").length > 0)
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

            /*
            if(!Array.isArray(tmp)) tmp = [ tmp ]
            let node = e
            tmp.push(

               <span className={"anno"}>
                  <span onClick={(event) => this.setCollapse(node)}><ChatIcon/></span>
               </span>
            )
            */

            //console.log("newAnno?",tmp,this._plink)

            let annoB = <ChatIcon className="annoticon"  onClick={
               (function(val,prop,v,ev){
                  this.setState({...this.state,annoPane:true,newAnno:{prop:this.proplink(prop),val},viewAnno:prop+"@"+v})
               }).bind(this,tmp,prop,value)
            }/>
            if(!Array.isArray(tmp)) tmp = [ tmp ]
            if(tmpAnno) { tmpAnno.push(annoB); tmp = tmpAnno ;}
            else tmp.push(annoB);


               //(function(ev,prop,val){return function(){ console.log("new",ev,prop,val) }})(event,this._plink,tmp)
               /*
               (ev,prop,val) => {
               console.log("new")
               this.setState({...this.state,annoPane:true,newAnno:{prop:this._plink,val:tmp}})}
               */


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
               sub.push(<Tag className={'first '+(div == "sub"?'type':'prop')}>{[this.proplink(val[0].value),": "]}</Tag>)
            }

            // direct property value/label ?
            if(lab && lab[0] && lab[0].value)
            {
               for(let l of lab) {
                  let lang = l["lang"]
                  if(!lang) lang = l["xml:lang"]
                  let tip = [this.fullname(l.value),lang?<Tooltip placement="bottom-end" title={
                     <div style={{margin:"10px"}}>
                        <Translate value={languages[lang]?languages[lang].replace(/search/,"tip"):lang}/>
                     </div>
                  }><span className="lang">{lang}</span></Tooltip>:null]
                  sub.push(
                     <Tag className='label'>
                        {tip}
                        {/* <ChatIcon className="annoticon" onClick={e => this.setState({...this.state,annoPane:true,newAnno:true})}/> */}
                        <ChatIcon className="annoticon"  onClick={
                           (function(val,prop,v,ev){
                              this.setState({...this.state,annoPane:true,newAnno:{prop:this.proplink(prop),val},viewAnno:prop+"@"+v})
                           }).bind(this,tip,val[0].value,val[0].value)
                        }/>
                     </Tag>
                  )
               }

               ret.push(<div className={div}>{sub}</div>)

            }
            else
            {
               let first = "" //" here" ;

               // 1-sort keys of elem when prop == Note
               // 2-store Work & Location elems
               // 3-finalize the new NoteText element

               let keys = Object.keys(elem)
               let noteVol,noteLoc,noteData = {}
               if(prop == bdo+"note")
               {
                  keys.push(tmp+"noteFinal")
                  keys = _.orderBy(keys,function(elem) {
                     var rank = { [bdo+"noteText"]:3, [bdo+"noteLocationStatement"]:2, [bdo+"noteWork"]:1 }
                     if(rank[elem]) return rank[elem]
                     else return 4 ;
                  })

                  noteVol = true
                  noteLoc = true
                  //console.log("keys",keys)
               }

               for(let f of keys)
               {
                  let subsub = []

                  if(!f.match(/[/]note/)) first="" ;

                  //console.log("f",prop,f)

                  if(f === tmp+"noteFinal")
                  {
                     let note = []
                     //console.log("noteData",noteData)
                     if(noteData[bdo+"noteText"])
                     {
                        let workuri ;
                        if(noteData[bdo+"noteWork"])
                        {
                           let loca ;
                           if(noteData[bdo+"noteLocationStatement"])
                           {
                              loca = [" @ ",noteData[bdo+"noteLocationStatement"].value]
                           }
                           workuri = <div><Tag style={{fontSize:"14px"}}>(from {this.uriformat(bdo+"noteWork",noteData[bdo+"noteWork"])}{loca})</Tag></div>
                        }

                        note.push(
                           <div class="sub">
                              <Tag className="first type">{this.proplink(bdo+"noteText","Note")}:</Tag>
                              {workuri}
                              <div class="subsub">
                                 <Tag>
                                    {this.pretty(noteData[bdo+"noteText"].value)}
                                    {this.tooltip(noteData[bdo+"noteText"].lang)}
                                    <ChatIcon className="annoticon"  onClick={
                                       (function(val,prop,v,ev){
                                          this.setState({...this.state,annoPane:true,newAnno:{prop:this.proplink(prop),val},viewAnno:prop+"@"+v})
                                       }).bind(this,noteData[bdo+"noteText"].value,bdo+"noteText",noteData[bdo+"noteText"].value)
                                    }/>
                                 </Tag>
                              </div>
                           </div>)
                     }
                     else if(noteData[bdo+"noteWork"])
                     {
                        let loca
                        if(noteData[bdo+"noteLocationStatement"])
                        {
                           loca = [" @ ",noteData[bdo+"noteLocationStatement"].value]
                        }
                        let workuri = <div><Tag style={{fontSize:"14px"}}>(from {this.uriformat(bdo+"noteWork",noteData[bdo+"noteWork"])}{loca})</Tag></div>
                        note.push(
                           <div class="sub">
                              <Tag className="first type">{this.proplink(bdo+"noteWork","Note")}:</Tag>
                                 {workuri}
                                 <ChatIcon className="annoticon"  onClick={
                                    (function(val,prop,v,ev){
                                       this.setState({...this.state,annoPane:true,newAnno:{prop:this.proplink(prop),val},viewAnno:prop+"@"+v})
                                    }).bind(this,[workuri,loca],bdo+"noteWork",noteData[bdo+"noteWork"].value)
                                 }/>
                           </div>
                        )
                        /*
                        let workuri = this.uriformat(bdo+"noteWork",noteData[bdo+"noteWork"])
                        note.push(
                           <div class="sub">
                              { <Tag className="first type">{this.proplink(bdo+"noteWork","Note")}:</Tag>
                              <div class="subsub">
                                 <Tag>{workuri}{loca}
                                    <ChatIcon className="annoticon"  onClick={
                                       (function(val,prop,v,ev){
                                          this.setState({...this.state,annoPane:true,newAnno:{prop:this.proplink(prop),val},viewAnno:prop+"@"+v})
                                       }).bind(this,[workuri,loca],bdo+"noteWork",noteData[bdo+"noteWork"].value)
                                    }/>
                                 </Tag>
                              </div> }
                           </div>
                        )
                        */

                     }
                     else if(noteData[bdo+"noteLocationStatement"])
                     {
                     }
                     ret.push(note)
                     continue;
                  }

                  let hasBnode = false ;

                  if(f == rdf+"type") continue;
                  else
                  {
                     if(!noVal)
                        subsub.push(<Tag className={'first '+(div == ""?'type':'prop')}>{[this.proplink(f),": "]}</Tag>)
                     //{...(val ? {className:'first prop'}:{className:'first type'}) }
                     else
                        sub.push(<Tag className={'first '+(!bnode?"type":"prop")}>{[this.proplink(f),": "]}</Tag>)

                     val = elem[f]
                     for(let v of val)
                     {
                        //console.log("v",v);

                        if(f == bdo+"noteLocationStatement" || f == bdo+"noteWork" || f == bdo+"noteText") {
                           noteData[f] = v
                        }

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
                           if(!Array.isArray(txt)) txt = [txt]
                           txt.push(
                              <ChatIcon className="annoticon"  onClick={
                                 (function(val,prop,v,ev){
                                    this.setState({...this.state,annoPane:true,newAnno:{prop:this.proplink(prop),val},viewAnno:prop+"@"+v})
                                 }).bind(this,txt,f,value)
                              }/>
                           )
                           //<ChatIcon className="annoticon" onClick={e => this.setState({...this.state,annoPane:true,newAnno:true})}/>

                           if(!noVal) subsub.push(<Tag>{txt}</Tag>)
                           else sub.push(<Tag>{txt}</Tag>)
                        }
                     }
                  }
                  if(!noVal)sub.push(<div className={div+"sub "+(hasBnode?"full":"")}>{subsub}</div>)
                  else {

                     if(subsub.length > 0) sub.push(subsub) //<div className="sub">{subsub}</div>)
                     if(f == bdo+"noteLocationStatement" || f == bdo+"noteWork" || f == bdo+"noteText") {
                        // wait noteFinal
                        /*
                        if(f == bdo+"noteText") {

                           console.log("noteData",noteData)

                           if(noteVol && noteVol != true) sub.push(noteVol)
                           if(noteLoc && noteLoc != true) sub.push(noteLoc)
                           ret.push(<div className={div+ first}>{sub}</div>)
                        }
                        else if(f == bdo+"noteLocationStatement")
                        {
                           noteLoc = <div className={div+ first}>{sub}</div>
                        }
                        else if(f == bdo+"noteWork")
                        {
                           noteVol = <div className={div+ first}>{sub}</div>
                        }
                        */
                     }
                     else {
                        ret.push(<div className={div+ first}>{sub}</div>)
                     }

                     sub = []
                     first = ""
                  }
               }
               if(!noVal)ret.push(<div className={div+" "+(bnode?"full":"")}>{sub}</div>)

               //console.log("ret",ret)

               //ret = [ ret ]
            }

         }
         //ret.push(<div class="mark">xx{bnode?"bnode":""}{e.inCollapse?"collap":""}</div>)
         if(e.inCollapse && !bnode)
         {
            if(viewAnno) this._annoPane.push(ret)
            pre.push(<Collapse in={this.state.collapse[e.value]}>{ret}</Collapse>)
         }
         else pre.push(ret)
         ret = []


      }

      ret = pre


      //console.groupEnd();

      //if(inCollapse) { ret = [<Collapse in={true}>{ret}</Collapse>] }

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


   handlePdfClick = (event,pdf,askPdf,file = "pdf") => {
      // This prevents ghost click.

      // trick to prevent popup warning
      //let current = window.self
      //let win = window.open("","pdf");
      //window.focus(current)

      if(!askPdf)
      {
         event.preventDefault();
         console.log("pdf",pdf)
         this.props.onCreatePdf(pdf,{iri:this.props.IRI,file});
      }

      /*
      if(!this.state.pdfOpen == false)
         this.setState({
            ...this.state,
            pdfOpen: false,
            anchorEl: null,
            click:true,
         });
      */
   };


   handleRequestCloseAnno = () => {


      if(!this.state.annoCollecOpen == false)
         this.setState({
            ...this.state,
            annoCollecOpen: false,
            anchorElAnno:null
         });
   };

      handleAnnoCollec = (collec) =>
      {

         if(!this.state.annoCollecOpen == false)
            this.setState({
               ...this.state,
               annoCollecOpen: false,
               anchorElAnno:null,
               showAnno:collec
            });
      }

   handleRequestClosePdf = () => {


      if(!this.state.pdfOpen == false)
         this.setState({
            ...this.state,
            pdfOpen: false,
            anchorElPdf:null,
            close:true
         });
   };


   proplink = (k,txt) => {

      if(k === bdo+'note') txt = "Notes" ;

     let ret = (<a class="propref" {...(true || k.match(/purl[.]bdrc/) ? {"href":k}:{})} target="_blank">{txt?txt:this.fullname(k)}</a>)

     return ret;
   }


   render()
    {
      console.log("render",this.props,this.state)

      //const { GeoJson } = ReactLeaflet;
      const { BaseLayer} = LayersControl;

      this._annoPane = []
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

      console.log("kZprop",kZprop)

      let kZasso ;
      if (this.props.assocResources) {
         kZasso = Object.keys(this.props.assocResources) ;

         let elem = this.getResourceElem(bdo+"workHasItem")
         if(!this.props.manifestError && elem) for(let e of elem)
         {
            let assoc = this.props.assocResources[e.value]

            //console.log("hImA",assoc,e.value)

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

      let doMap = false, doRegion = false,regBox ;
      if(kZprop.indexOf(bdo+"placeLong") !== -1 && kZprop.indexOf(bdo+"placeLat") !== -1)
      {
         doMap = [].concat(this.fullname(this.getResourceElem(bdo+"placeLat")[0].value)).concat(this.fullname(this.getResourceElem(bdo+"placeLong")[0].value))
         console.log("map",doMap)
      }
      if(kZprop.indexOf(bdo+"placeRegionPoly") !== -1)
      {
         doRegion = JSON.parse(this.getResourceElem(bdo+"placeRegionPoly")[0].value)
         regBox = bbox(doRegion)
         regBox = [ [regBox[1],regBox[0]], [regBox[3],regBox[2]] ]
         console.log("reg",doRegion,regBox)
      }


      if(kZprop.indexOf(bdo+"imageList") !== -1)
      {
         if(!this.props.imageAsset && !this.props.manifestError) {
            this.setState({...this.state, imageLoaded:false})
            this.props.onHasImageAsset("http://iiifpres.bdrc.io/2.1.1/v:"+ this.props.IRI+ "/manifest",this.props.IRI);
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
            this.props.onHasImageAsset("http://presentation.bdrc.io/2.1.1/collection/wio:"+this.props.IRI,this.props.IRI)
         }
      }

      let titre = <br/>;

      if(kZprop.indexOf(skos+"prefLabel") !== -1)
         titre = this.format("h2",skos+"prefLabel")
      else if(kZprop.indexOf(bdo+"eTextTitle") !== -1)
         titre = this.format("h2",bdo+"eTextTitle")
      else if(kZprop.indexOf(rdfs+"label") !== -1)
         titre = this.format("h2",rdfs+"label")
      else
         titre = <h2>{getEntiType(this.props.IRI) + " " +this.props.IRI}</h2>

      let pdfLink,monoVol = -1 ;
      if(this.props.imageAsset &&  !this.props.manifestError && this.props.imageAsset.match(/[.]bdrc[.]io/))
      {
         let iiif = "http://iiif.bdrc.io" ;
         if(this.props.config && this.props.config.iiif) iiif = this.props.config.iiif.endpoints[this.props.config.iiif.index]

//         console.log("iiif",iiif,this.props.config)

         let id = this.props.IRI.replace(/^[^:]+:./,"")
         if(this.props.imageAsset.match(/[/]i:/)) {
            pdfLink = iiif+"/download/pdf/wi:bdr:W"+id+"::bdr:I"+id ;
         }
         else if(this.props.imageAsset.match(/[/]v:/)) {

            let elem = this.getResourceElem(bdo+"volumeNumber")
            if(elem && elem.length > 0 && elem[0].value)
               monoVol = Number(elem[0].value)

            elem = this.getResourceElem(bdo+"imageCount")
            if(!elem) elem = this.getResourceElem(bdo+"volumePagesTotal")
            if(elem && elem.length > 0 && elem[0].value)
               pdfLink = iiif+"/download/zip/v:bdr:V"+id+"::1-"+elem[0].value ;
            else {
               elem = this.getResourceElem(bdo+"workHasItemImageAsset")
               if(elem && elem.length > 0 && elem[0].value)
                  pdfLink = iiif+"/download/zip/wi:bdr:W"+id+"::bdr:"+ this.pretty(elem[0].value) ;
            }
         }
         /* // missing ImageItem
         else if(this.props.imageAsset.match(/[/]wio:/))
         {
            let elem = this.getResourceElem(bdo+"workLocation")
            if(elem && elem.length > 0 && elem[0].value)
            {
               elem = this.getResourceBNode(elem[0].value)
               let work = elem[bdo+"workLocationWork"]
               if(work && work.length > 0 && work[0].value) work = this.pretty(work[0].value)
               let vol = elem[bdo+"workLocationVolume"]
               if(vol && vol.length > 0 && vol[0].value) monoVol = Number(vol[0].value)
               let begin = elem[bdo+"workLocationPage"]
               if(begin && begin.length > 0 && begin[0].value) begin = Number(begin[0].value)
               let end = elem[bdo+"workLocationEndPage"]
               if(end && end.length > 0 && end[0].value) end = Number(end[0].value)
               if(work && vol && begin && end)
                  pdfLink = "http://iiif.bdrc.io/download/pdf/wv:bdr:"+work+"::bdr:V"+id+"::"+begin+"-"+end ;
               console.log("loca",vol,begin,end,pdfLink)
               // ex: http://iiif.bdrc.io/pdfdownload/wv:bdr:W29329::bdr:V29329_I1KG15043::1-10
            }

         }
         */

      }

      let theData = <div className="data">
         { kZprop.map((k) => {

            let elem = this.getResourceElem(k);

            //console.log("prop",k,elem);
            //for(let e of elem) console.log(e.value,e.label1);

            //if(!k.match(new RegExp("Revision|Entry|prefLabel|"+rdf+"|toberemoved"))) {
            if(!k.match(new RegExp(adm+"|adm:|TextTitle|SourcePath|prefLabel|"+rdf+"|toberemoved|workPartIndex|workPartTreeIndex")))
            {

               let sup = this.hasSuper(k)

               if(!sup) // || sup.filter(e => e.value == bdo+"workRefs").length > 0) //
               {
                  let tags = this.format("h4",k)

                  //console.log("tags",tags)

                  if(k == bdo+"note")
                  {
                     //console.log("note",tags,k);//tags = [<h4>Note</h4>]
                  }
                  else if(k == bdo+"itemHasVolume")
                  {

                     tags = tags.map(e => {

                        //console.log("e",e)
                        let key = "";
                        if(Array.isArray(e) && e.length > 0) {
                           key = e[0]
                           key = key.props
                           if(key) key = key.children

                           console.log("key",key)

                           if(key && key[0] && key[0].props && key[0].props.children
                              && (
                                    key[0].props.children == "Etext Volume: "
                                    ||
                                    (key[0].props.children[0] && key[0].props.children[0].props
                                       && key[0].props.children[0].props.children == "Etext Volume")
                                 )
                              )
                           {

                              // [0].props.children[0].props
                              if(key.length > 1) key = key[1]
                              if(key) key= key.props
                              if(key) key = key.children
                              if(key && key.length > 1) key = key[1]
                              if(key) key = key.props
                              if(key) key = key.children
                              if(key) key = Number(key)
                           }
                           else
                           {
                              // [0].props.children[0][0].props.children
                              if(key && key.length > 0) key = key[0]
                              if(key && key.length > 0) key = key[0]
                              key = key.props
                              if(key) key = key.children
                              if(key) key = Number((""+key).replace(/^Volume /,""))
                           }


                        }

                        return { elem:e, key}
                     })

                     //console.log("tagsK",tags);

                     tags = _.orderBy(tags,['key'])

                     tags = tags.map(e => e.elem)


                  }
                  else if(k == bdo+"workLocation")
                  {
                     elem = this.getResourceElem(k)
                     if(elem && Array.isArray(elem) && elem[0]) {
                        elem = this.getResourceBNode(elem[0].value)
                        let str = ""
                        //console.log("loca",elem)

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
                  else if(false) //k == bdo+"workHasExpression")
                  {
                  // 1-map avec le nom du children[2] si ==3chldren et children[1] = " in "
                     tags = tags.map(e => {

                        if(Array.isArray(e) && e.length > 0) e = e[0]

                        //console.log("e",e)
                        let exprKey1 = "", exprKey2 = "";

                        if(e.props)
                        {
                           if(!Array.isArray(e.props.children)) exprKey1 = e.props.children
                           else if(e.props.children.length > 0)
                           {
                              exprKey1 = e.props.children[0]
                              if(Array.isArray(exprKey1) && exprKey1.length > 0) exprKey1 = exprKey1[0]
                              if(exprKey1 && exprKey1.props && exprKey1.props.children) exprKey1 = exprKey1.props.children
                              if(Array.isArray(exprKey1)) exprKey1 = exprKey1[0]
                              if(Array.isArray(exprKey1) && exprKey1.length > 0) exprKey1 = exprKey1[0]
                              if(exprKey1 && exprKey1.props && exprKey1.props.children) exprKey1 = exprKey1.props.children
                              exprKey1 = exprKey1.replace(/[/]$/,"")
                           }

                           //console.log("eK1",exprKey1)

                           if(e.props.children.length == 3 && e.props.children[1] === " in ")
                           {
                              exprKey2 = e.props.children[2]
                              if(Array.isArray(exprKey2) && exprKey2.length > 0) exprKey2 = exprKey2[0]
                              if(exprKey2 && exprKey2.props && exprKey2.props.children) exprKey2 = exprKey2.props.children
                              if(Array.isArray(exprKey2)) exprKey2 = exprKey2[0]
                              if(Array.isArray(exprKey2) && exprKey2.length > 0) exprKey2 = exprKey2[0]
                              if(exprKey2 && exprKey2.props && exprKey2.props.children) exprKey2 = exprKey2.props.children
                              exprKey2 = exprKey2.replace(/[/]$/,"")
                           }
                        }
                        /*
                        if(e.props && e.props.children.length == 3 && e.props.children[1] === " in " && e.props.children[2][0][0] && e.props.children[2][0][0].props)
                        {
                           console.log("key",e.props.children[2][0][0].props.children)

                           if(e.props.children[2][0][0].props.children)
                              return { elem:e , "exprKey1":e.props.children[0][0][0].props.children, "exprKey2" : e.props.children[2][0][0].props.children.replace(/[/]/,"") }
                        }*/
                        /*
                        else if(e.props.children.length == 1)
                        {
                           return { ...e , "exprKey" : e.props.children[0][0].props.children }
                        }
                        */

                        return { elem:e, exprKey1, exprKey2 } ;
                     });


                  // 2-lodash sort
                     tags = _.sortBy(tags,['exprKey1','exprKey2'])

                     console.log("sorted tags",tags);

                     let cleantags = tags.map(e => e.elem )

                     //console.log("clean tags",cleantags);

                     tags = cleantags
                  }

                  if(k == bdo+"placeRegionPoly" || (k == bdo+"placeLong" && !doRegion))
                  {

                     return ( <div>
                                 <h3><span>{this.proplink(k)}</span>:&nbsp;</h3>
                                 { k == bdo+"placeLong" && tags }
                                 <div style={ {width:"100%",marginTop:"10px"} }>
                                    <Map ref={m => { this._leafletMap = m; }}
                                       className={"placeMap" + (this.state.largeMap?" large":"")}
                                       style={{boxShadow: "0 0 5px 0px rgba(0,0,0,0.5)"}}
                                       center={doMap} zoom={17} bounds={doRegion?regBox:null}
                                       //attributionControl={false}
                                       >
                                       <LayersControl position="topright">
                                          { this.props.config.googleAPIkey && [
                                             <BaseLayer checked name='Satellite+Roadmap'>

                                                <GoogleLayer googlekey={this.props.config.googleAPIkey} maptype='HYBRID'
                                                      //attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;></a> contributors"
                                                      attribution="&amp;copy 2018 Google"
                                                />
                                             </BaseLayer>,
                                             <BaseLayer name='Terrain'>
                                                <GoogleLayer googlekey={this.props.config.googleAPIkey} maptype='TERRAIN'/>
                                             </BaseLayer>,
                                             <BaseLayer name='Satellite'>
                                                <GoogleLayer googlekey={this.props.config.googleAPIkey} maptype='SATELLITE'/>
                                             </BaseLayer>,
                                             <BaseLayer name='Roadmap'>
                                                <GoogleLayer googlekey={this.props.config.googleAPIkey} maptype='ROADMAP'/>
                                             </BaseLayer>]
                                          }
                                          { !this.props.config.googleAPIkey && <BaseLayer checked name='OpenStreetMap'>
                                             <TileLayer
                                                //attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                                                //url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                url="https://{s}.tile.iosb.fraunhofer.de/tiles/osmde/{z}/{x}/{y}.png"
                                             />
                                          </BaseLayer> }
                                       </LayersControl>
                                       <Marker position={doMap} >
                                           <ToolT direction="top">{titre}</ToolT>
                                       </Marker>
                                       {doRegion && <GeoJSON data={doRegion} style={ {color: '#006699', weight: 5, opacity: 0.65} }/>}
                                       <Portal position="bottomleft">
                                          <div class="leaflet-control-attribution leaflet-control" >
                                             <a onClick={ e => { setTimeout(((map)=> () => {map.leafletElement.invalidateSize();})( this._leafletMap), 200); this.setState({...this.state,largeMap:!this.state.largeMap}); } }>
                                                {!this.state.largeMap?"Enlarge":"Shrink"} Map
                                             </a>
                                          </div>
                                       </Portal>
                                    </Map>
                                 </div>
                              </div> )
                  }
                  else if(k != bdo+"eTextHasChunk") {

                     let ret = this.hasSub(k)?this.subProps(k):tags.map((e)=> [e," "] )

                     //console.log("render", ret)

                     return (
                        <div>
                           <h3><span>{this.proplink(k)}</span>:&nbsp;</h3>
                           {ret}
                        </div>
                     )
                  }
                  else
                     return (
                        <InfiniteScroll
                           hasMore={true}
                           pageStart={0}
                           loadMore={(e) => this.props.onGetChunks(this.props.IRI,elem.length)}
                           //loader={<Loader loaded={false} />}
                           >
                           <h3 class="chunk"><span>{this.fullname(k)}</span>:&nbsp;</h3>
                           {this.hasSub(k)?this.subProps(k):tags.map((e)=> [e," "] )}
                        </InfiniteScroll>
                     )
               }


            }

         } ) }

         { ["Role"].indexOf(getEntiType(this.props.IRI)) !== -1 &&
            <div>
               <h3><span>Associated Persons</span>:&nbsp;</h3>
            {   this.props.assocResources &&
                  Object.keys(this.props.assocResources).map((e,i) =>
                        i<20?<h4>{this.uriformat(null,{value:e})}</h4>:(i==20?<h4>(<a href={'/search?r='+this.props.IRI}>browse all</a>)</h4>:null))
            }
            </div>
         }
      </div>


      console.log("pdf",pdfLink,this._annoPane.length)

      // add nother route to UViewer Gallery page
      return (
         <div style={{overflow:"hidden",textAlign:"center"}}>
            { !this.state.ready && <Loader loaded={false} /> }
            <div className={"resource "+getEntiType(this.props.IRI).toLowerCase()}>
               <div className={"SidePane right "  +(this.state.annoPane?"visible":"")} style={{top:"0",paddingTop:"50px"}}>
                     <IconButton className="hide" title="Toggle annotation markers" onClick={e => this.setState({...this.state,showAnno:!this.state.showAnno})}>
                        { this.state.showAnno && <SpeakerNotesOff/> }
                        { !this.state.showAnno && <ChatIcon/> }
                     </IconButton>
                     <IconButton id="annoCollec" title="Select displayed annotations collection" onClick={e => this.setState({...this.state,annoCollecOpen:true,anchorElAnno:e.currentTarget})}>
                        <Layers className={this.state.showAnno && this.state.showAnno != true ? this.state.showAnno:""}/>
                     </IconButton>
                     <Popover
                        open={this.state.annoCollecOpen == true}
                        anchorEl={this.state.anchorElAnno}
                        onClose={this.handleRequestCloseAnno.bind(this)}
                        >
                        <MenuItem onClick={this.handleAnnoCollec.bind(this,true)}>All Annotations</MenuItem>
                        { this.props.annoCollec && Object.keys(this.props.annoCollec).map((e) => {
                           let labels = this.props.annoCollec[e][rdfs+"label"]
                           //console.log("labs",labels,this.props.annoCollec[e])
                           let l = e
                           if(labels) {
                              l = labels.filter((e) => (e.value && (e["lang"] == this.props.prefLang || e["xml:lang"] == this.props.prefLang)))[0]
                              if(!l || l.length == 0) l = labels.filter((e) => (e.value))[0]
                           }
                           return (<MenuItem className={e === this.state.showAnno ? "current":""} onClick={this.handleAnnoCollec.bind(this,e)}>{l.value}</MenuItem>)
                        }) }
                        {/* <MenuItem onClick={this.handleAnnoCollec.bind(this,"score0")}>See Annotation Collection 0</MenuItem>
                        <MenuItem onClick={this.handleAnnoCollec.bind(this,"score1")}>See Annotation Collection 1</MenuItem> */}
                     </Popover>
                     <IconButton className="close"  onClick={e => this.setState({...this.state,annoPane:false,viewAnno:false})}>
                        <Close/>
                     </IconButton>
                  { //this.props.datatypes && (results ? results.numResults > 0:true) &&
                     <div className="data" style={{width:"333px",position:"relative"}}>
                        <Typography style={{fontSize:"30px",marginBottom:"20px",textAlign:"left"}}>
                           <Translate value="Asidebar.title" />
                        </Typography>
                        {this.props.annoCollec == true && <Loader loaded={false}/>}
                        { (!this.props.annoCollec || Object.keys(this.props.annoCollec).length === 0 || this._annoPane.length == 0) && !this.state.newAnno &&  "No annotation to show for this "+(typeof this.state.showAnno === 'string' ? "collection":"resource")+"."}
                        {this.state.viewAnno && !this.state.newAnno && <a className="viewAll" onClick={(event) => {
                           let s = this.state ;
                           if(s.viewAnno) {
                              delete(s.viewAnno);
                              this.setState({...s})
                           }
                        }}>View all</a>}
                        <div className="sub">
                           {(!this.state.newAnno || this.state.newAnno.replyTo) && this._annoPane}
                           {
                              this.state.newAnno && [<div class="anno new">
                                 {this.state.newAnno.prop}: {this.state.newAnno.val}
                                 <hr/>
                              </div> ,
                              <div class="sub">
                                 <h4 class="first type">{this.proplink("http://purl.bdrc.io/ontology/admin/supportedBy")}:</h4>
                                 <div class="subsub new">
                                    <TextField type="text" label="Assertion" multiline={true} fullWidth={true} rows={5} defaultValue={""} helperText="some short help text"/>
                                    <TextField type="text" label="Location" multiline={true} fullWidth={true} rows={3} defaultValue={""} helperText="some short help text"/>
                                    <TextField type="text" label="URL" multiline={true} fullWidth={true} rows={1} defaultValue={""} helperText="some short help text"/>
                                 </div>
                              </div> ,
                              <div class="sub">
                                 <h4 class="first type">{this.proplink("http://purl.bdrc.io/ontology/admin/statementScore")}:</h4>
                                 <div class="subsub new">
                                    <TextField type="text" label="Value" multiline={true} fullWidth={true} rows={1} defaultValue={""} helperText="some short help text"/>
                                 </div>
                              </div> ]
                           }
                        </div>
                     </div>
                  }
               </div>
               <Link style={{fontSize:"26px"}} className="goBack" to={this.props.keyword&&!this.props.keyword.match(/^bdr:/)?"/search?q="+this.props.keyword+"&lg="+this.props.language+(this.props.datatype?"&t="+this.props.datatype:""):"/"}>
                  {/* <Button style={{paddingLeft:"0"}}>&lt; Go back to search page</Button> */}
                  <IconButton style={{paddingLeft:0}} title="Go back to search page">
                     <HomeIcon style={{fontSize:"30px"}}/>
                  </IconButton>
               </Link>
               {
                  this.props.IRI.match(/^bdr:/) &&
                  [<a className="goBack" target="_blank" title="TTL version" rel="alternate" type="text/turtle" href={"http://purl.bdrc.io/resource/"+this.props.IRI.replace(/bdr:/,"")+".ttl"}>
                     <Button style={{marginLeft:"50px",paddingRight:"0"}}>export to ttl</Button>
                  </a>,<span>&nbsp;/&nbsp;</span>,
                  <a className="goBack noML" target="_blank" title="JSON-LD version" rel="alternate" type="application/ld+json" href={"http://purl.bdrc.io/resource/"+this.props.IRI.replace(/bdr:/,"")+".jsonld"}>
                     <Button style={{paddingLeft:0}}>json-ld</Button>
                  </a>]
               }
               {
                  this.props.IRI.match(/^bda[nc]:/) &&
                  [<a className="goBack" target="_blank" title="TTL version" rel="alternate" type="text/turtle"
                     href={"http://purl.bdrc.io/"+(this.props.IRI.match(/^bdan:/)?"annotation/":"anncollection/")+this.props.IRI.replace(/bda[nc]:/,"")+".ttl"}>
                        <Button style={{marginLeft:"50px",paddingRight:"0"}}>export to ttl</Button>
                  </a>,<span>&nbsp;/&nbsp;</span>,
                  <a className="goBack noML" target="_blank" title="JSON-LD version" rel="alternate" type="application/ld+json"
                     href={"http://purl.bdrc.io/"+(this.props.IRI.match(/^bdan:/)?"annotation/":"anncollection/")+this.props.IRI.replace(/bda[nc]:/,"")+".jsonld"}>
                        <Button style={{paddingLeft:0}}>json-ld</Button>
                  </a>]
               }
               { /*  TODO // external resources ==> /graph/Resgraph?R_RES=
                  this.props.IRI.match(/^bda[cn]:/) &&
               */}
               {pdfLink &&
                  [<a style={{fontSize:"26px"}} className="goBack pdfLoader">
                     <Loader loaded={(!this.props.pdfVolumes || this.props.pdfVolumes.length > 0)} options={{position:"relative",left:"24px",top:"-7px"}} />
                        <IconButton title="Download as PDF/ZIP" onClick={ev =>
                              {
                                 //if(this.props.createPdf) return ;
                                  if(monoVol > 0){
                                    this.props.onInitPdf({iri:this.props.IRI,vol:monoVol},pdfLink)
                                  }
                                  else if(!this.props.pdfVolumes) {
                                    this.props.onRequestPdf(this.props.IRI,pdfLink)
                                 }
                                 this.setState({...this.state, pdfOpen:true,anchorElPdf:ev.currentTarget})
                              }
                           }>
                           <img src="/DL_icon.svg" height="24" />
                        </IconButton>
                        { (this.props.pdfVolumes && this.props.pdfVolumes.length > 0) &&
                           <Popover
                              className="poPdf"
                              open={this.state.pdfOpen == true || this.props.pdfReady == true}
                              anchorEl={this.state.anchorElPdf}
                              onClose={this.handleRequestClosePdf.bind(this)}
                           >
                              <List>
                                 {/*
                                   this.props.pdfUrl &&
                                  [<MenuItem onClick={e => this.setState({...this.state,pdfOpen:false})}><a href={this.props.pdfUrl} target="_blank">Download</a></MenuItem>
                                  ,<hr/>]
                                 */}
                                 {
                                    this.props.pdfVolumes.map(e => {

                                       let Ploading = e.pdfFile && e.pdfFile == true
                                       let Ploaded = e.pdfFile && e.pdfFile != true
                                       let Zloading = e.zipFile && e.zipFile == true
                                       let Zloaded = e.zipFile && e.zipFile != true

                                       return (<ListItem className="pdfMenu">
                                             <b>{"Volume "+e.volume}:</b>
                                             &nbsp;&nbsp;
                                             <a onClick={ev => this.handlePdfClick(ev,e.link,e.pdfFile)}
                                                {...(Ploaded ?{href:e.pdfFile}:{})}
                                             >
                                                { Ploading && <Loader className="pdfSpinner" loaded={Ploaded} scale={0.35}/> }
                                                <span {... (Ploading?{className:"pdfLoading"}:{})}>PDF</span>
                                             </a>
                                             &nbsp;&nbsp;|&nbsp;&nbsp;
                                             <a onClick={ev => this.handlePdfClick(ev,e.link,e.zipFile,"zip")}
                                                {...(Zloaded ?{href:e.zipFile}:{})}
                                             >
                                                { Zloading && <Loader className="zipSpinner" loaded={Zloaded} scale={0.35}/> }
                                                <span {... (Zloading?{className:"zipLoading"}:{})}>ZIP</span>
                                          </a>
                                          </ListItem>)
                                    })
                                 }
                              </List>
                           </Popover>
                        }
                  </a>
               ]
               }
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
               <IconButton style={{marginLeft:"35px"}} title="Toggle annotations panel" onClick={e => this.setState({...this.state,annoPane:!this.state.annoPane})}>
                  <ChatIcon />
               </IconButton>
               {
                  this.props.IRI.match(/^[^:]+:[RPGTW]/) &&
                  <Link className="goBack" to={"/search?r="+this.props.IRI}>
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
                     <img src={this.props.firstImage} onLoad={(e)=>this.setState({...this.state,imageLoaded:true})}/>
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
               { (!this.state.openUV || this.state.hideUV || !this.state.toggleUV) && theData }
            </div>
            {/* <iframe style={{width:"calc(100% - 100px)",margin:"50px",height:"calc(100vh - 160px)",border:"none"}} src={"http://purl.bdrc.io/resource/"+get.IRI}/> */}
         </div>

      ) ;


   }
}

export default ResourceViewer ;
