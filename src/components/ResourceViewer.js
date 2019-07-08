//@flow
//import {Mirador, m3core} from 'mirador'
import diva from "diva.js" // v5.1.3
//import diva from "diva.js" //v6.0, not working
import Portal from 'react-leaflet-portal';
import bbox from "@turf/bbox"
import {Map,TileLayer,LayersControl,Marker,Popup,GeoJSON,Tooltip as ToolT} from 'react-leaflet' ;
import 'leaflet/dist/leaflet.css';
import { GoogleLayer } from "react-leaflet-google" ;
//import { GoogleMutant, GoogleApiLoader } from 'react-leaflet-googlemutant';
// import {GoogleLayer} from 'react-leaflet-google'
// const { BaseLayer} = LayersControl;
import Settings from '@material-ui/icons/SettingsSharp';
import SettingsApp from '@material-ui/icons/SettingsApplications';
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
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import SpeakerNotes from '@material-ui/icons/SpeakerNotes';
import SpeakerNotesOff from '@material-ui/icons/SpeakerNotesOff';
import Feedback from '@material-ui/icons/QuestionAnswer';
//import NewWindow from 'react-new-window'
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import CheckCircle from '@material-ui/icons/CheckCircle';
import PanoramaFishEye from '@material-ui/icons/PanoramaFishEye';
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
import PhotoIcon from '@material-ui/icons/PhotoSizeSelectActual';
import Script from 'react-load-script'
import React, { Component } from 'react';
import qs from 'query-string'
import Button from '@material-ui/core/Button';
import {Translate, I18n} from 'react-redux-i18n';
import { Link } from 'react-router-dom';
//import AnnotatedEtextContainer from 'annotated-etext-react';
import IIIFViewerContainer from '../containers/IIIFViewerContainer';
import LanguageSidePaneContainer from '../containers/LanguageSidePaneContainer';
import {miradorConfig, miradorSetUI} from '../lib/miradorSetup';
import { Redirect404 } from "../routes.js"
import Loader from "react-loader"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLanguage } from '@fortawesome/free-solid-svg-icons'
//import {MapComponent} from './Map';
import {getEntiType} from '../lib/api';
import {languages,getLangLabel,top_right_menu} from './App';
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
   collecManif?:string,
   locale?:string,
   langPreset:string[],
   manifests?:[],
   firstImage?:string,
   canvasID?:string,
   pdfVolumes?:[],
   rightPanel?:boolean,
   logged?:boolean,
   nextChunk?:number,
   resourceManifest?:{},
   imageVolumeManifests?:{},
   onInitPdf: (u:string,s:string) => void,
   onRequestPdf: (u:string,s:string) => void,
   onCreatePdf: (s:string,u:string) => void,
   onGetResource: (s:string) => void,
   onGetAnnotations: (s:string) => void,
   onHasImageAsset:(u:string,s:string) => void,
   onGetChunks: (s:string,b:number) => void,
   onGetPages: (s:string,b:number) => void,
   onToggleLanguagePanel:()=>void
}
type State = {
   uviewer : boolean,
   ready? : boolean,
   imageLoaded:boolean,
   openMirador?:boolean,
   openUV?:boolean,
   UVcanLoad?:boolean,
   openDiva?:boolean,
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
   anchorElemImaVol?:any,
   largeMap?:boolean,
   rightPane?:boolean,
   nextChunk?:number,
   imageLinks?:{}
 }



const adm  = "http://purl.bdrc.io/ontology/admin/" ;
const bdac = "http://purl.bdrc.io/anncollection/" ;
const bdan = "http://purl.bdrc.io/annotation/" ;
const bda  = "http://purl.bdrc.io/admindata/";
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

const prefixes = { adm, bdac, bdan, bda, bdo, bdr, foaf, oa, owl, rdf, rdfs, skos, tmp }

let propOrder = {
   "Corporation":[],
   "Etext":[
      "bdo:eTextTitle",
      "bdo:eTextIsVolume",
      "bdo:eTextInVolume",
      "tmp:imageVolumeId",
      "bdo:eTextVolumeIndex",
      "bdo:eTextInItem",
      "bdo:itemForWork",
      "bdo:isRoot",
      "bdo:eTextHasPage",
      "bdo:eTextHasChunk",
   ],
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
      "bdo:creator",
      //"bdo:workCreator",
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
      "bdo:workCatalogInfo",
      "bdo:workHasSourcePrintery",
   ],
   "Taxonomy":[],
   "Volume":[],
}

let reload = false ;

function top_left_menu(that,pdfLink,monoVol,fairUse)
{
  return (

    <div id="top-left">
       <Link style={{fontSize:"20px"}} className="goBack" to={that.props.keyword&&!that.props.keyword.match(/^bdr:/)?"/search?q="+that.props.keyword+"&lg="+that.props.language+(that.props.datatype?"&t="+that.props.datatype:""):"/"}>
          {/* <Button style={{paddingLeft:"0"}}>&lt; Go back to search page</Button> */}
          <IconButton style={{paddingLeft:0}} title={I18n.t("resource.back")}>
             <HomeIcon style={{fontSize:"30px"}}/>
          </IconButton>
       </Link>
       {
          that.props.IRI.match(/^bdr:/) &&
          [<a className="goBack" target="_blank" title="TTL version" rel="alternate" type="text/turtle" href={"http://purl.bdrc.io/resource/"+that.props.IRI.replace(/bdr:/,"")+".ttl"}>
             <Button style={{marginLeft:"0px",paddingLeft:"10px",paddingRight:0}}>{I18n.t("resource.export")} ttl</Button>
          </a>,<span>&nbsp;/&nbsp;</span>,
          <a className="goBack noML" target="_blank" title="JSON-LD version" rel="alternate" type="application/ld+json" href={"http://purl.bdrc.io/resource/"+that.props.IRI.replace(/bdr:/,"")+".jsonld"}>
             <Button style={{paddingLeft:0,paddingRight:"10px"}}>json-ld</Button>
          </a>]
       }
       { that.props.IRI && getEntiType(that.props.IRI) === "Etext" && <a target="_blank" style={{fontSize:"26px"}} download className="goBack pdfLoader" href={that.props.IRI?that.props.IRI.replace(/bdr:/,bdr)+".txt":""}>
                <IconButton title={I18n.t("resource.download")+" TXT"}>
                   <img src="/DL_icon.svg" height="24" />
                </IconButton>
               </a> }
       {
          that.props.IRI.match(/^bda[nc]:/) &&
          [<a className="goBack" target="_blank" title="TTL version" rel="alternate" type="text/turtle"
             href={"http://purl.bdrc.io/"+(that.props.IRI.match(/^bdan:/)?"annotation/":"anncollection/")+that.props.IRI.replace(/bda[nc]:/,"")+".ttl"}>
                <Button style={{marginLeft:"0px",paddingLeft:"10px",paddingRight:"0px"}}>{I18n.t("resource.export")} ttl</Button>
          </a>,<span>&nbsp;/&nbsp;</span>,
          <a className="goBack noML" target="_blank" title="JSON-LD version" rel="alternate" type="application/ld+json"
             href={"http://purl.bdrc.io/"+(that.props.IRI.match(/^bdan:/)?"annotation/":"anncollection/")+that.props.IRI.replace(/bda[nc]:/,"")+".jsonld"}>
                <Button style={{paddingLeft:0,paddingRight:"10px"}}>json-ld</Button>
          </a>]
       }
       { /*  TODO // external resources ==> /query/graph/ResInfo?R_RES=
          that.props.IRI.match(/^bda[cn]:/) &&
       */}
       { /*that.props.IRI && getEntiType(that.props.IRI) === "Etext" && <a target="_blank" style={{fontSize:"26px"}} download={that.props.IRI?that.props.IRI.replace(/bdr:/,"")+".txt":""} className="goBack pdfLoader" href={that.props.IRI?that.props.IRI.replace(/bdr:/,bdr)+".txt":""}>
                <IconButton title={I18n.t("resource.download")+" TXT"}>
                   <img src="/DL_icon.svg" height="24" />
                </IconButton>
               </a>*/ }
       {pdfLink && 
         ( (!(that.props.manifestError && that.props.manifestError.error.message.match(/Restricted access/)) && !fairUse) ||
         (that.props.auth && that.props.auth.isAuthenticated()))
         &&
          [<a style={{fontSize:"26px"}} className="goBack pdfLoader">
             <Loader loaded={(!that.props.pdfVolumes || that.props.pdfVolumes.length > 0)} options={{position:"relative",left:"24px",top:"-7px"}} />
                <IconButton title={I18n.t("resource.download")+" PDF/ZIP"} onClick={ev =>
                      {
                         //if(that.props.createPdf) return ;
                          if(monoVol > 0){
                            that.props.onInitPdf({iri:that.props.IRI,vol:monoVol},pdfLink)
                          }
                          else if(!that.props.pdfVolumes) {
                            that.props.onRequestPdf(that.props.IRI,pdfLink)
                         }
                         that.setState({...that.state, pdfOpen:true,anchorElPdf:ev.currentTarget})
                      }
                   }>
                   <img src="/DL_icon.svg" height="24" />
                </IconButton>
                { (that.props.pdfVolumes && that.props.pdfVolumes.length > 0) &&
                   <Popover
                      className="poPdf"
                      open={that.state.pdfOpen == true || that.props.pdfReady == true}
                      anchorEl={that.state.anchorElPdf}
                      onClose={that.handleRequestClosePdf.bind(this)}
                   >
                      <List>
                         {/*
                           that.props.pdfUrl &&
                          [<MenuItem onClick={e => that.setState({...that.state,pdfOpen:false})}><a href={that.props.pdfUrl} target="_blank">Download</a></MenuItem>
                          ,<hr/>]
                         */}
                         {
                            that.props.pdfVolumes.map(e => {

                               let Ploading = e.pdfFile && e.pdfFile == true
                               let Ploaded = e.pdfFile && e.pdfFile != true
                               let Zloading = e.zipFile && e.zipFile == true
                               let Zloaded = e.zipFile && e.zipFile != true

                               return (<ListItem className="pdfMenu">
                                     <b>{"Volume "+e.volume}:</b>
                                     &nbsp;&nbsp;
                                     <a onClick={ev => that.handlePdfClick(ev,e.link,e.pdfFile)}
                                        {...(Ploaded ?{href:e.pdfFile}:{})}
                                     >
                                        { Ploading && <Loader className="pdfSpinner" loaded={Ploaded} scale={0.35}/> }
                                        <span {... (Ploading?{className:"pdfLoading"}:{})}>PDF</span>
                                     </a>
                                     &nbsp;&nbsp;|&nbsp;&nbsp;
                                     <a onClick={ev => that.handlePdfClick(ev,e.link,e.zipFile,"zip")}
                                        {...(Zloaded ?{href:e.zipFile}:{})}
                                     >
                                        { Zloading && <Loader className="zipSpinner" loaded={Zloaded} scale={0.35}/> }
                                        <span {... (Zloading?{className:"zipLoading"}:{})}>ZIP</span>
                                       </a>
                                       { that.props.IRI && getEntiType(that.props.IRI) === "Etext" && <div>

                                             &nbsp;&nbsp;|&nbsp;&nbsp;

                                             <a target="_blank" download={that.props.IRI?that.props.IRI.replace(/bdr:/,"")+".txt":""} 
                                                   href={that.props.IRI?that.props.IRI.replace(/bdr:/,bdr)+".txt":""} >
                                                <span>TXT</span>
                                             </a>
                                          </div>
                                       }
                                  </ListItem>)
                            })
                         }
                      </List>
                   </Popover>
                }
          </a>
       ]
       }


       <CopyToClipboard text={"http://purl.bdrc.io/resource/"+that.props.IRI.replace(/^bdr:/,"")} onCopy={(e) =>
                //alert("Resource url copied to clipboard\nCTRL+V to paste")
                prompt("Resource url has been copied to clipboard.\nCTRL+V to paste","http://purl.bdrc.io/resource/"+that.props.IRI.replace(/^bdr:/,""))
          }>

          <IconButton style={{marginLeft:"0px"}} title="Permalink">
             <ShareIcon />
          </IconButton>
       </CopyToClipboard>

       {

          !that.props.manifestError && that.props.imageAsset &&
          [/* <Button className="goBack" onClick={that.showUV.bind(this)}
             style={{paddingRight:"0",marginRight:"20px"}}>view image gallery</Button>, */

             <CopyToClipboard text={that.props.imageAsset} onCopy={(e) =>
                      //alert("Resource url copied to clipboard\nCTRL+V to paste")
                      prompt("IIIF Manifest url has been copied to clipboard.\nCTRL+V to paste",that.props.imageAsset)
                }>

                <Button id="iiif" className="goBack" title="IIIF manifest"><img src="/iiif.png"/></Button>
             </CopyToClipboard>]

       }
       <IconButton style={{marginLeft:"0px"}} title={I18n.t("resource.toggle")} onClick={e => that.setState({...that.state,annoPane:!that.state.annoPane})}>
          <ChatIcon />
       </IconButton>
       {
          that.props.IRI.match(/^[^:]+:[RPGTW]/) &&
          <Link className="goBack" to={"/search?r="+that.props.IRI+"&t=Any"}>
             <Button style={{marginLeft:"0px",paddingLeft:"10px"}}>{I18n.t("resource.browse")} &gt;</Button>
          </Link>
       }
     </div>
   )
}

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

      window.closeViewer = () => { 
         this.setState({...this.state, openUV:false, openMirador:false, openDiva:false}); 
         if(window.MiradorUseEtext) delete window.MiradorUseEtext ;
      }
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

   componentDidMount()
   {
      if(window.location.hash === "#mirador" || window.location.hash === "#diva") {
         let timerViewer = setInterval(() => {
            if(this.props.imageAsset && this.props.firstImage) {
               clearInterval(timerViewer)
               if(window.location.hash === "#mirador") this.showMirador()
               else if(window.location.hash === "#diva") this.showDiva()
               window.location.hash = "";
            }
         }, 10)
      }
   }

   expand(str:string) //,stripuri:boolean=true)
   {
      for(let k of Object.keys(prefixes)) { str = str.replace(new RegExp(k+":"),prefixes[k]); }

      return str ;
   }

   pretty(str:string,isUrl:boolean=false,noNewline:boolean=false) //,stripuri:boolean=true)
   {

      for(let p of Object.values(prefixes)) { str = str.replace(new RegExp(p,"g"),"") }

      console.log('pretty',str)

      //if(stripuri) {

      if(!str.match(/ /) && !str.match(/^http[s]?:/)) str = str.replace(/([a-z])([A-Z])/g,"$1"+(isUrl?"":' ')+"$2")

      if(str.match(/^https?:\/\/[^ ]+$/)) { str = <a href={str} target="_blank">{str}</a> }
      else if(!noNewline) {
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
                     /*
                     label1 = assoR[e.value].filter(e => e.type === skos+"prefLabel" && (e.lang === this.props.prefLang || e["xml:lang"] === this.props.prefLang))
                     if(label1.length === 0) label1 = assoR[e.value].filter(e => e.type === skos+"prefLabel")
                     */
                     label1 = getLangLabel(this, assoR[e.value].filter(e => e.type === skos+"prefLabel"))
                     if(label1 && label1.value) label1 = label1.value

                     if(assoR[e.value].filter(e => e.type === bdo+"workHasRoot").length > 0)
                     {
                        /*
                        label2 = assoR[assoR[e.value].filter(e => e.type === bdo+"workHasRoot")[0].value].filter(e => e.type === skos+"prefLabel" && (e.lang === this.props.prefLang || e["xml:lang"] === this.props.prefLang))
                        if(label2.length === 0) label2 = assoR[assoR[e.value].filter(e => e.type === bdo+"workHasRoot")[0].value].filter(e => e.type === skos+"prefLabel")
                        */
                        label2 = getLangLabel(assoR[assoR[e.value].filter(e => e.type === bdo+"workHasRoot")[0].value].filter(e => e.type === skos+"prefLabel"))
                        if(label2 && label2.value > 0) label2 = label2.value
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

            //console.log("sort",prop,propOrder[t])

            let sortProp = Object.keys(prop).map(e => {
               let index = propOrder[t].indexOf(e)
               if(index === -1) index = 99999 ;
               return ({value:e,index})
            })
            sortProp = _.orderBy(sortProp,['index','value'],['asc','asc'])

            //console.log("sortProp",sortProp)

            /*Object.keys(prop).sort((a,b)=> {
               let ia = propOrder[t].indexOf(a)
               let ib = propOrder[t].indexOf(b)
               //console.log(t,a,ia,b,ib)
               if ((ia != -1 && ib != -1 && ia < ib) || (ia != -1 && ib == -1)) return -1
               else if(ia == -1 && ib == -1) return (a < b ? -1 : (a == b ? 0 : -1))
               else return 1 ;
            })*/

            sortProp = sortProp.reduce((acc,e) => {

               if(e.value === bdo+"eTextHasChunk") return { ...acc, [e.value]:prop[e.value]}

               //console.log("sorting",e,prop[e])

               if(e.value === bdo+"workHasPart" || e.value === bdo+"workHasExpression" ) {
                  //console.log("skip sort parts",prop[e][0],prop[e])
                  return { ...acc, [e.value]:prop[e.value] }
               }

               return ({ ...acc, [e.value]:prop[e.value].sort(function(A,B){

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


            //console.log("propSort",prop,sortProp)

            return sortProp
         }
      }
      return prop ;
   }



   fullname(prop:string,isUrl:boolean=false,noNewline:boolean=false)
   {
      for(let p of Object.keys(prefixes)) { prop = prop.replace(new RegExp(p+":","g"),prefixes[p]) }

      //console.log("full",prop)

      if(this.props.ontology[prop] && this.props.ontology[prop][rdfs+"label"])
      {
         /*
         let ret = this.props.ontology[prop][rdfs+"label"].filter((e) => (e.lang == "en"))
         if(ret.length == 0) ret = this.props.ontology[prop][rdfs+"label"].filter((e) => (e.lang == this.props.prefLang))
         if(ret.length == 0) ret = this.props.ontology[prop][rdfs+"label"]
         */
         let ret = getLangLabel(this, this.props.ontology[prop][rdfs+"label"])
         if(ret && ret.value && ret.value != "")
            return ret.value

       //&& this.props.ontology[prop][rdfs+"label"][0] && this.props.ontology[prop][rdfs+"label"][0].value) {
         //let comment = this.props.ontology[prop][rdfs+"comment"]
         //if(comment) comment = comment[0].value
         //return <a className="nolink" title={comment}>{this.props.ontology[prop][rdfs+"label"][0].value}</a>
         //return this.props.ontology[prop][rdfs+"label"][0].value
      }

      return this.pretty(prop,isUrl,noNewline)
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

            /*
           info = infoBase.filter((e)=>(e.type == skos+"prefLabel" && e["xml:lang"]==this.props.prefLang))
          */
           info = getLangLabel(this,  infoBase.filter((e)=>(e.type == skos+"prefLabel")))

           //console.log("infoB",info)
           if(info && info[0] && n <= 10) vals.push(<h4><Link className="urilink prefLabel" to={"/show/bdr:"+this.pretty(v,true)}>{info[0].value}</Link></h4>)
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

      //console.log("subP",k,div)

      let ret = []
      if(this.props.IRI && this.props.resources[this.props.IRI] && this.props.resources[this.props.IRI][this.expand(this.props.IRI)]) {


         for(let p of Object.keys(this.props.resources[this.props.IRI][this.expand(this.props.IRI)])) {


            if(this.props.ontology[p] && this.props.ontology[p][rdfs+"subPropertyOf"]
               && this.props.ontology[p][rdfs+"subPropertyOf"].filter((e)=>(e.value == k)).length > 0)
            {
               //console.log(p)

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

   uriformat(prop:string,elem:{},dico:{} = this.props.assocResources, withProp?:string,show?:string="show")
   {
      if(elem) {

         //console.log("uriformat",prop,elem.value,dico,withProp,show)

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

                     //console.log("base",JSON.stringify(infoBase,null,3))

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
                        /*
                        info = infoBase.filter((e)=>(e["xml:lang"] && e.type==prop && e["xml:lang"]==this.props.prefLang))
                        if(info.length == 0) info = infoBase.filter((e)=>(e["xml:lang"] && e.type==prop))
                        */
                        info = [ getLangLabel(this, infoBase.filter((e)=>((e["xml:lang"] || e["lang"])))) ]
                        if(!info) info = [ getLangLabel(this, infoBase.filter((e)=>((e["xml:lang"] || e["lang"]) && e.type==prop))) ]

                        //console.log("info",info)

                        //if(info.value) info = info.value

                        if(info && info[0]) {
                           lang = info[0]["xml:lang"]
                           if(!lang) lang = info[0]["lang"]
                           info = info[0].value
                        }
                        else if(!withProp){
                           //info = infoBase.filter((e) => e["xml:lang"]==this.props.prefLang)
                           info = getLangLabel(this, infoBase)

                           if(info && info[0]) {
                              lang = info[0]["xml:lang"]
                              if(!lang) lang = info[0]["lang"]
                              info = info[0].value
                           }
                           else {
                              //info = infoBase.filter((e) => e["xml:lang"]=="bo-x-ewts")
                              info = getLangLabel(this, infoBase)

                              if(info && info[0]) {
                                 lang = info[0]["xml:lang"]
                                 if(!lang) lang = info[0]["lang"]
                                 info = info[0].value
                              }
                              else {
                                 lang = infoBase[0]["xml:lang"]
                                 if(!lang) lang = infoBase[0]["lang"]
                                 info = infoBase[0].value
                                 if(infoBase[0].type && infoBase[0].type == bdo+"volumeNumber") info = "Volume "+info ;
                                 else if(info && info.match(/purl[.]bdrc/)) info = null
                                 //console.log("info0",info)
                              }
                           }
                        }
                     }
                  }

                  //console.log("s",prop,elem,info,infoBase)

                  // we can return Link
                  let pretty = this.fullname(elem.value,true);

                  if(info && infoBase && infoBase.filter(e=>e["xml:lang"]||e["lang"]).length >= 0) {
                     ret.push([<Link className="urilink prefLabel" to={"/"+show+"/bdr:"+pretty}>{info}</Link>,lang?<Tooltip placement="bottom-end" title={
                        <div style={{margin:"10px"}}>
                           <Translate value={languages[lang]?languages[lang].replace(/search/,"tip"):lang}/>
                        </div>
                     }><span className="lang">{lang}</span></Tooltip>:null])
                  }
                  else if(pretty.toString().match(/^V[0-9A-Z]+_I[0-9A-Z]+$/)) { ret.push(<span>
                     <Link className="urilink" to={"/"+show+"/bdr:"+pretty}>{pretty}</Link>&nbsp;
                     {/* <Link className="goBack" target="_blank" to={"/gallery?manifest=http://iiifpres.bdrc.io/2.1.1/v:bdr:"+pretty+"/manifest"}>{"(view image gallery)"}</Link> */}
                  </span> ) }
                  else if(pretty.toString().match(/^([A-Z]+[_0-9-]*[A-Z]*)+$/)) ret.push(<Link className="urilink" to={"/"+show+"/bdr:"+pretty}>{pretty}</Link>)
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

   getResourceElem(prop:string, IRI?:string)
   {
      if(!IRI) IRI = this.props.IRI

      if(!IRI || !this.props.resources || !this.props.resources[IRI]
         || !this.props.resources[IRI][this.expand(IRI)]
         || !this.props.resources[IRI][this.expand(IRI)][prop]) return ;

      let elem = this.props.resources[IRI][this.expand(IRI)][prop]

      return elem
   }

   getResourceBNode(prop:string)
   {

      if(!this.props.IRI)  return ;         

      let elem ; 
      if(this.props.resources && this.props.resources[this.props.IRI] && this.props.resources[this.props.IRI][prop])
         elem = this.props.resources[this.props.IRI][prop]
      //else if(this.props.assocResources && this.props.assocResources[prop])
      //   elem = this.props.assocResources[prop].reduce((acc,e) =>({...acc,[e.fromKey]:[e]}),{})

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

         //console.log("?bnode",elem)

         //return this.format(Tag,prop,txt,false,div)

         //elem = Object.values(elem)
         //for(let i of Object.keys(elemN)) { if(!i === rdf+"type") { elem.push(elemN[i]); } }

         //elem = [].concat.apply([],elem);

      }
      else {
         elem = this.getResourceElem(prop)

         //console.log("?normal",elem)
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

      console.log("format",prop,elem,txt,bnode,div);

      let ret = [],pre = []

      if(elem && !Array.isArray(elem)) elem = [ elem ]

      //console.log(elem)

      let viewAnno = false ;
      if(elem) for(let e of elem)
      {

         let value = ""+e
         if(e.value || e.value === "") value = e.value
         else if(e["@value"]) value = e["@value"]
         else if(e["@id"]) value = e["@id"]
         let pretty = this.fullname(value,null,prop === bdo+"eTextHasChunk") // || prop === bdo+"eTextHasPage")

         if(value === bdr+"LanguageTaxonomy") continue ;

         console.log("e",e,pretty,value)

         if(this.props.assocResources && this.props.assocResources[value] && this.props.assocResources[value][0] && this.props.assocResources[value][0].fromKey) 
         { 
            e.type = "bnode"
            //console.log("aRes",this.props.assocResources[value])
         }

         if(e.type != "bnode")
         {

            let tmp
            if(e.type == "uri") tmp = this.uriformat(prop,e)
            else {
               let lang = e["lang"]
               if(!lang) lang = e["xml:lang"]
               tmp = [pretty]

               if(lang) {

                  let tLab = getLangLabel(this,[e])
                  let lang = tLab["lang"]
                  if(!lang) lang = tLab["xml:lang"]
                  let tVal = tLab["value"]
                  if(!tVal) tVal = tLab["@value"]
                  tmp = [ this.fullname(tVal) ]

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


            console.log("ret",ret)
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

                  let tLab = getLangLabel(this, [ l ])
                  let lang = tLab["lang"]
                  if(!lang) lang = tLab["xml:lang"]
                  let tVal = tLab.value

                  let tip = [this.fullname(tVal),lang?<Tooltip placement="bottom-end" title={
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
                     console.log("noteData",noteData)
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
                  if(!noVal && !f.match(/[/]note[^F]/)) sub.push(<div className={div+"sub "+(hasBnode?"full":"")}>{subsub}</div>)
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
      if(!this.state.openUV) // || !$("#uv").hasClass("hidden"))
      {

         let timerUV = setInterval( () => {


            if(window.UV && window.createUV) {
               clearInterval(timerUV);

               window.$.ajaxSetup( { beforeSend: (xhr) => {

                    if (this.props.auth && this.props.auth.isAuthenticated()) {
                        let token = localStorage.getItem('id_token');
                        xhr.setRequestHeader("credentials", "include");
                        //xhr.setRequestHeader("Authorization", "Bearer " + token);
                        console.log("xhr",xhr)
                    }
                  }
                })

               console.log("uv",window.UV)
               console.log("createuv",window.createUV)

               $("#fond").addClass("hidden");
               $("#uv").addClass("open")

               var myUV = window.createUV('#uv', {
                  iiifResourceUri: this.props.imageAsset.replace(/[/]i:/,"/iv:"),
                  configUri: '../scripts/uv-config.json'
               }, new window.UV.URLDataProvider());

               timerUV = setInterval(() => {

                  if($('button.fullScreen').length)
                  {
                     let btn = $('button.fullScreen')
                     btn.parent().append('<button style="float:right;padding-right:0" class="toggleUV btn imageBtn" title="Toggle UV"><i class="uv-icon uv-icon-fullscreen" aria-hidden="true"></i></button>').click((e) =>
                     {
                        //$("#uv").addClass("hidden")
                        window.closeViewer()
                     })
                     btn.remove()
                     $(".minimiseButtons .spacer").remove()
                     //clearInterval(timerUV)
                  }

               }, 1000)
            }

         },100)

         let state = { ...this.state, openUV:true, openDiva:false, openMirador:false }
         this.setState(state);
      }
      else {
         //$('#uv').removeClass('hidden')
      }
      //reload = true ;
   }

   /* // use with embedded v2.0.2
   showUV()
   {
      let state = { ...this.state, openUV:true, hideUV:false, openMirador:false }
      this.setState(state);
      reload = true ;
   }
  */

   showDiva()
   {
      if(!this.state.openDiva) // || !$("#diva-wrapper").hasClass("hidden"))
      {
         if(this.state.UVcanLoad) { window.location.hash = "diva"; window.location.reload(); }

         let timerDiva = setInterval( () => {

            if($("#diva-wrapper").length > 0) { // && window.Diva) && window.Diva.DownloadPlugin && window.Diva.ManipulationPlugin && window.Diva.MetadataPlugin) {
               clearInterval(timerDiva);

               $("#fond").addClass("hidden");

               let manif = this.props.collecManif
               if(!manif && this.props.manifests) manif = this.props.manifests[0]["@id"]
               if(!manif) manif = this.props.imageAsset

               /*
               // v6.0 working from diva.js github demo site
               let dv = new window.Diva('diva-wrapper',{
                  "objectData": manif,
                  //"enableZoomControls":"slider", // not compatible with v6
                  "enableAutoTitle":false, // title not working by default (show first letter only, maybe because label is a list here ?)
                  "tileWidth":4000,
                  "tileHeight":4000,
                  "plugins": [window.Diva.DownloadPlugin, window.Diva.ManipulationPlugin, window.Diva.MetadataPlugin],
               });
               dv.disableScrollable()
               dv.enableScrollable()
               dv.disableDragScrollable()
               dv.enableDragScrollable()
               *

/*
               // v6.0 not working as a import
               let dv = new Diva('diva-wrapper',{
                  "objectData": manif,
                  "enableZoomControls":"slider",
                  "tileWidth":4000,
                  "tileHeight":4000,
                  //"plugins": [Diva.DownloadPlugin, Diva.ManipulationPlugin, Diva.MetadataPlugin],
                  //enableFullscreen:false
               });
*/
               // fully working v5.1.3 (but no plugin)

               let dv = diva.create('#diva-wrapper',{
                   objectData: manif,
                   enableZoomControls:"slider",
                   tileWidth:4000,
                   tileHeight:4000
                   //plugins: [DownloadPlugin, ManipulationPlugin, MetadataPlugin],
                   //enableFullscreen:false
               });


               let timerDiva2 = setInterval(() => {
                  if($(".diva-fullscreen-icon").length > 0) {
                     clearInterval(timerDiva2)

                      // diva 5.1
                       $(".diva-link-icon").remove()
                       $(".diva-fullscreen-icon").remove();
                       $(".diva-view-menu").append(`<button type="button" id="diva-1-fullscreen-icon" class="diva-fullscreen-icon diva-button" title="Close viewer"
                          onClick="javascript:eval('window.closeViewer()')"></button>`)


                      /*
                      //diva 6
                      let svg = $("#diva-1-fullscreen-icon svg").remove();
                      $("#diva-1-fullscreen-icon").remove();
                      $(".diva-view-menu").append(`<button type="button" id="diva-1-fullscreen-icon" class="diva-fullscreen-icon diva-button" title="Close viewer"
                         onClick="javascript:document.getElementById(\'diva-wrapper\').classList.add(\'hidden\')"></button>`)
                      $("#diva-1-fullscreen-icon").append(svg)
                      */

                     if(this.props.manifests) {
                        $(".diva-tools").append("<span>Browse collection</span><select id='volume'>"+this.props.manifests.map(
                           (v,i) => ("<option value='"+v["@id"]+"' "+(i===0?"selected":"")+">"+v["label"]+"</option>")
                        ) +"</select>")
                        $("#volume").change(
                           function(){
                              dv.changeObject($(this).val())
                              dv.gotoPageByIndex(0);
                           }
                        )

                     }
                  }
               }, 100)

            }
            else {
               this.forceUpdate();
            }
         }, 100)
      }
      else {
         //$('#diva-wrapper').removeClass('hidden')
      }
      let state = { ...this.state, openDiva:true, openUV:false, openMirador:false }
      this.setState(state);

   }


   showMirador(num?:number,useManifest?:{})
   {

      if(!this.state.openMirador) // || !$("#viewer").hasClass("hidden"))
      {
         $("#fond").removeClass("hidden");

         if(this.state.UVcanLoad) { window.location.hash = "mirador"; window.location.reload(); }

         console.log("num",num,useManifest)

         let tiMir = setInterval( async () => {

            if(window.Mirador && window.Mirador.Viewer.prototype.setupViewer.toString().match(/going to previous page/)) {

               clearInterval(tiMir);

               $("#fond").addClass("hidden");

               let data = [], manif, canvasID
               if(this.props.imageAsset) 
               {
                  if(this.props.imageAsset.match(/[/]collection[/]/) && !this.props.collecManif)
                  {
                     data.push({"collectionUri": this.props.imageAsset +"?continuous=true", location:"Test Collection Location" })
                     //if(this.props.manifests) data = data.concat(this.props.manifests.map(m => ({manifestUri:m["@id"],label:m["label"]})))
                  }
                  else
                  {
                     manif = this.props.collecManif
                     if(!manif) manif = this.props.imageAsset+"?continuous=true"
                     data.push({"manifestUri": manif, location:"Test Manifest Location" })
                     canvasID = this.props.canvasID
                  }
               }
               else if(useManifest)
               {
                  manif = useManifest
                  if(!manif) manif = this.props.imageAsset+"?continuous=true"
                  data.push({"manifestUri": manif, location:"Test Manifest Location" })
                  canvasID = this.props.canvasID
               }

               let withCredentials = false
               let elem = this.getResourceElem(adm+"access")
               if(elem && elem.filter(e => e.value.match(/(AccessFairUse)|(Restricted.*)$/)).length >= 1) withCredentials = true

               let config = await miradorConfig(data,manif,canvasID,withCredentials,this.props.langPreset);

               //console.log("mir ador",num,config,this.props)
               window.mirador = window.Mirador( config )

               miradorSetUI(true, num);
            }
         }, 10)
      }
      else
      {
         //$('#viewer').removeClass('hidden').show()
      }


      let state = { ...this.state, openMirador:true, openDiva:false, openUV:false }
      //if(state.hideUV)
      this.setState(state);
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
         //console.log("pdf",pdf,file)
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

      let tooltip
      if(this.props.ontology[k] && this.props.ontology[k][rdfs+"comment"]) tooltip = this.props.ontology[k][rdfs+"comment"].filter(comm => !comm.value.match(/^([Mm]igration|[Dd]eprecated)/))

      if(k === bdo+'note') txt = "Notes" ;

      let ret = (<a class="propref" {...(true || k.match(/purl[.]bdrc/) ? {"href":k}:{})} target="_blank">{txt?txt:this.fullname(k)}</a>)

      if(tooltip && tooltip.length > 0) ret = <Tooltip placement="bottom-start" classes={{tooltip:"commentT",popper:"commentP"}} style={{marginLeft:"50px"}} title={<div>{tooltip.map(tip => tip.value.split("\n").map(e => [e,<br/>]))}</div>}>{ret}</Tooltip>

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

      //console.log("kZprop",kZprop)

      let iiifpres = "http://iiifpres.bdrc.io" ;
      if(this.props.config && this.props.config.iiifpres) iiifpres = this.props.config.iiifpres.endpoints[this.props.config.iiifpres.index]


      let kZasso ;


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
            this.props.onHasImageAsset(iiifpres+"/2.1.1/v:"+ this.props.IRI+ "/manifest",this.props.IRI);
         }
      }/*
      else if(kZprop.indexOf(tmp+"imageVolumeId") !== -1)
      {
         let elem = this.getResourceElem(tmp+"imageVolumeId")
         if(!this.props.imageAsset && !this.props.manifestError) {
            this.setState({...this.state, imageLoaded:false})
            this.props.onHasImageAsset(iiifpres+"/2.1.1/v:"+ elem[0].value.replace(new RegExp(bdr), "bdr:") + "/manifest",this.props.IRI);
            this.props.onGetResource("bdr:"+this.pretty(elem[0].value));
         }
      }*/
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
      else if(kZprop.indexOf(bdo+"itemImageAssetForWork") !== -1)
      {
         let elem = this.getResourceElem(bdo+"itemImageAssetForWork")
         let nbVol = this.getResourceElem(bdo+"itemVolumes")
         let work = this.getResourceElem(bdo+"itemForWork")
         if(elem[0] && elem[0].value && !this.props.imageAsset && !this.props.manifestError) {
            this.setState({...this.state, imageLoaded:false})
            let manif = "http://presentation.bdrc.io/2.1.1/wv:"+elem[0].value.replace(new RegExp(bdr),"bdr:")+"/manifest"
            if(nbVol && nbVol[0] && nbVol[0].value && nbVol[0].value > 1 && work && work[0] && work[0].value)
              manif = "http://presentation.bdrc.io/2.1.1/collection/wio:"+work[0].value.replace(new RegExp(bdr),"bdr:")
            this.props.onHasImageAsset(manif,this.props.IRI)
         }
      }
      else {
         
         if (this.props.assocResources) {
            kZasso = Object.keys(this.props.assocResources) ;

            let elem = this.getResourceElem(bdo+"workHasItem")
            if(!this.props.manifestError && elem) for(let e of elem)
            {
               let assoc = this.props.assocResources[e.value]

               //console.log("hImA",assoc,e.value)

               if(assoc && assoc.length > 0 && !this.props.imageAsset && !this.props.manifestError && assoc.filter(e => e.type === tmp+"itemType" && e.value === bdo+"ItemImageAsset").length) {

                  this.setState({...this.state, imageLoaded:false})

                  if(assoc.length == 1) { this.props.onHasImageAsset(iiifpres+"/2.1.1/v:bdr:"+this.pretty(assoc[0].value,true)+"/manifest",this.props.IRI); }
                  else { this.props.onHasImageAsset(iiifpres+"/2.1.1/collection/wio:"+this.pretty(this.props.IRI,true),this.props.IRI);  }

               }
            }
         }
         
      }

      let title,titlElem ;

      if(kZprop.indexOf(skos+"prefLabel") !== -1)       {
         titlElem = this.getResourceElem(skos+"prefLabel");
      }
      else if(kZprop.indexOf(bdo+"eTextTitle") !== -1)     {
         titlElem = this.getResourceElem(bdo+"eTextTitle");
      }
      else if(kZprop.indexOf(rdfs+"label") !== -1)   {
         titlElem = this.getResourceElem(rdfs+"label");
      }
      else {
         title = <h2>{getEntiType(this.props.IRI) + " " +this.props.IRI}</h2>
      }
      
      if(!title && titlElem) {
         if(typeof titlElem !== 'object') titlElem =  { "value" : titlElem, "lang":""}
         title = getLangLabel(this,titlElem)
         if(title.value) title = <h2>{title.value}{this.tooltip(title.lang)}</h2>
      }

      console.log("ttlm",titlElem)


   /*
      if(kZprop.indexOf(skos+"prefLabel") !== -1)
         titre = this.format("h2",skos+"prefLabel")
      else if(kZprop.indexOf(bdo+"eTextTitle") !== -1)
         titre = this.format("h2",bdo+"eTextTitle")
      else if(kZprop.indexOf(rdfs+"label") !== -1)
         titre = this.format("h2",rdfs+"label")
      else
         titre = <h2>{getEntiType(this.props.IRI) + " " +this.props.IRI}</h2>
   */
      let fairUse = false
      if(kZprop.indexOf(adm+"access") !== -1) {
         let elem = this.getResourceElem(adm+"access")
         if(elem && elem.filter(e => e.value.match(/(AccessFairUse|AccessRestrictedInChina)$/)).length >= 1) fairUse = true
         //console.log("adm",elem,fairUse)
      }

      let pdfLink,monoVol = -1 ;
      if(this.props.imageAsset &&  !this.props.manifestError && this.props.imageAsset.match(/[.]bdrc[.]io/))
      {
         let iiif = "http://iiif.bdrc.io" ;
         if(this.props.config && this.props.config.iiif) iiif = this.props.config.iiif.endpoints[this.props.config.iiif.index]

         console.log("iiif",this.props.imageAsset,iiif,this.props.config)

         let id = this.props.IRI.replace(/^[^:]+:./,"")
         if(this.props.imageAsset.match(/[/]i:/) || (this.props.imageAsset.match(/[/]wio:/) && this.props.manifests)) {
            pdfLink = iiif+"/download/pdf/wi:bdr:W"+id+"::bdr:I"+id ;
         }
         else if(this.props.imageAsset.match(/[/]v:/)) {

            let elem = this.getResourceElem(tmp+"imageVolumeId")

            if(elem && elem.length > 0 && elem[0].value) {

               let iriV = elem[0].value.replace(new RegExp(bdr),"bdr:")

               elem = this.getResourceElem(bdo+"imageCount",iriV)
               if(!elem) elem = this.getResourceElem(bdo+"volumePagesTotal",iriV)                  
               if(elem && elem.length > 0 && elem[0].value)
                  pdfLink = iiif+"/download/zip/v:"+iriV+"::1-"+elem[0].value ;

               elem = this.getResourceElem(bdo+"volumeNumber",iriV)
               if(elem && elem.length > 0 && elem[0].value)
                  monoVol = Number(elem[0].value)

            } else {
               elem = this.getResourceElem(bdo+"volumeNumber")
               if(elem && elem.length > 0 && elem[0].value)
                  monoVol = Number(elem[0].value)

               elem = this.getResourceElem(bdo+"imageCount")
               if(!elem) elem = this.getResourceElem(bdo+"volumePagesTotal")            
               if(elem && elem.length > 0 && elem[0].value)
                  pdfLink = iiif+"/download/zip/v:bdr:V"+id+"::1-"+elem[0].value ;
               else {
                  elem = this.getResourceElem(bdo+"workHasItemImageAsset")
                  if(elem && elem.length > 0 && elem[0].value)
                     pdfLink = iiif+"/download/zip/wi:bdr:W"+id+"::bdr:"+ this.pretty(elem[0].value,true) ;
                  
               }
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

      let imageLabel = "images"
      if(!this.props.collecManif && this.props.imageAsset && this.props.imageAsset.match(/[/]collection[/]/)) imageLabel = "collection"


      let theData = <div className="data">
         { kZprop.map((k) => {

            let elem = this.getResourceElem(k);

            //console.log("prop",k,elem);
            //for(let e of elem) console.log(e.value,e.label1);

            //if(!k.match(new RegExp("Revision|Entry|prefLabel|"+rdf+"|toberemoved"))) {
            if((!k.match(new RegExp(adm+"|adm:|isRoot$|SourcePath|prefLabel|"+rdf+"|toberemoved|workPartIndex|workPartTreeIndex")) 
               ||k.match(/(originalRecord|metadataLegal)$/))
            && (k !== bdo+"eTextHasChunk" || kZprop.indexOf(bdo+"eTextHasPage") === -1) )
            {

               let sup = this.hasSuper(k)

               if(!sup) // || sup.filter(e => e.value == bdo+"workRefs").length > 0) //
               {
                  let tags = this.format("h4",k)

                  //console.log("tags",tags,k,elem)

                  if(k == bdo+"note")
                  {
                     //console.log("note",tags,k);//tags = [<h4>Note</h4>]
                  }
                  else if(k == bdo+"itemHasVolume" || k == bdo+"volumeHasEtext")
                  {

                     tags = tags.map(e => {

                        //console.log("e",e)
                        let key = "";
                        if(Array.isArray(e) && e.length > 0) {
                           key = e[0]
                           key = key.props
                           if(key) key = key.children

                           if(key && key[1] && key[1].props && key[1].props.children)
                           {
                              key = key[1].props.children
                              if(key && key[1] && key[1].props && key[1].props.children) {
                                 key = Number(key[1].props.children[0])
                                 //console.log("key",key)
                              }
                           }
                           else if(key && key[0] && key[0].props && key[0].props.children
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

                        let loca = s => (elem && elem[bdo+"workLocation"+s] && elem[bdo+"workLocation"+s][0] && elem[bdo+"workLocation"+s][0]["value"] ? elem[bdo+"workLocation"+s][0]["value"]:null)

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
                                           <ToolT direction="top">{title}</ToolT>
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
                  else if(k == bdo+"eTextHasPage") {
                     
                     let next = 0;
                     if(elem && elem.length) next = elem.filter(e => e.value && e.end)
                     if(next && next.length) next = next[next.length - 1].end + 1
                     else next = 0                  

                     /*
                     let next = 0;
                     if(elem && elem.length) next = elem.filter(e => e.value && e.end)
                     if(next && next.length) next = next[next.length - 1].seq + 1
                     else next = 0
                     
                     console.log("nextP?",next)     
                     */
                     
                     let imageLinks ;
                     if(this.state.imageLinks) imageLinks = this.state.imageLinks[this.props.IRI]
                     if(!imageLinks) imageLinks = {}
                     
                     if(!this.props.imageVolumeManifests) // && !this.props.manifestError)
                     {

                        if(kZprop.indexOf(tmp+"imageVolumeId") !== -1)
                        {
                           let elem = this.getResourceElem(tmp+"imageVolumeId")
                           //console.log("elem",elem)
                           for(let e of elem) {
                              this.props.onImageVolumeManifest(iiifpres+"/2.1.1/v:"+ e.value.replace(new RegExp(bdr), "bdr:") + "/manifest",this.props.IRI);
                           }
                        }
                     }
                     else if(this.props.imageVolumeManifests !== true) for(let id of Object.keys(this.props.imageVolumeManifests)) {
                        if(!imageLinks[id])
                        {
                           let manif = this.props.imageVolumeManifests[id]
                           console.log("k",id,manif)
                           if(manif && manif.sequences && manif.sequences[0] && manif.sequences[0].canvases) {
                              let nc = 0, np = 0                           
                              imageLinks[id] = manif.sequences[0].canvases.reduce( (acc,e) => {
                                 if(e.label) return ({
                                    ...acc, [Number(e.label[0]["@value"].replace(/[^0-9]/g,""))]:{id:e["@id"],image:e.images[0].resource["@id"]}
                              })},{})
                              console.log("imaL",imageLinks)
                              this.setState({ ...this.state,imageLinks:{...this.state.imageLinks, [this.props.IRI]: imageLinks } })
                           }
                        }
                     }
                     

                     /*
                     if(!this.props.resourceManifest && this.props.resourceManifest.sequences && this.props.resourceManifest.sequences[0] && this.props.resourceManifest.sequences[0].canvases) {
                        let nc = 0, np = 0
                        imageLinks = this.props.resourceManifest.sequences[0].canvases.reduce( (acc,e) => ({
                           ...acc, [Number(e.label[0]["@value"].replace(/[^0-9]/g,""))]:{id:e["@id"],image:e.images[0].resource["@id"]}
                        }),{})
                     }

                     */

                     let openMiradorAtPage = (num,manif) => {
                        //console.log("num?",num)
                        window.MiradorUseEtext = true ; 
                        this.showMirador(num,manif);
                     }

                     return (
                        
                        [<InfiniteScroll
                        id="etext-scroll"
                        hasMore={true}
                        pageStart={0}
                        loadMore={(e) => { 
                           
                              //console.log("next?",this.props.nextChunk,next,JSON.stringify(elem,null,3))

                              if(this.props.nextPage !== next) {                               
                                 this.props.onGetPages(this.props.IRI,next); 
                              } 
                           }
                        }
                        //loader={<Loader loaded={false} />}
                        >
                                 {/* {this.hasSub(k)?this.subProps(k):tags.map((e)=> [e," "] )} */}
                                 { elem.map( e => (
                                    <div class={"etextPage"+(this.props.manifestError&&!imageLinks?" manifest-error":"")+ (!e.value.match(/[\n\r]/)?" unformated":"")+(e.language === "bo"?" lang-bo":"")}>
                                       {/*                                          
                                          e.seq && this.state.collapse["image-"+this.props.IRI+"-"+e.seq] && imageLinks[e.seq] &&
                                          <img title="Open image+text view in Mirador" onClick={eve => { openMiradorAtPage(imageLinks[e.seq].id) }} style={{maxWidth:"100%"}} src={imageLinks[e.seq].image} />
                                       */}
                                       {
                                          e.seq && this.state.collapse["image-"+this.props.IRI+"-"+e.seq] && Object.keys(imageLinks).sort().map(id => {
                                             if(!this.state.collapse["imageVolume-"+id]) return <div class="imagePage">
                                                      <img class="page" title="Open image+text view in Mirador" src={imageLinks[id][e.seq].image} onClick={eve => { 
                                                         let manif = this.props.imageVolumeManifests[id]
                                                         openMiradorAtPage(imageLinks[id][e.seq].id,manif["@id"])
                                                      }}/>          
                                                      <div class="small"><a title="Open image+text view in Mirador" onClick={eve => { 
                                                         let manif = this.props.imageVolumeManifests[id]
                                                         openMiradorAtPage(imageLinks[id][e.seq].id,manif["@id"])
                                                      }}>p.{e.seq}</a> from {this.uriformat(null,{value:id.replace(/bdr:/,bdr).replace(/[/]V([^_]+)_I.+$/,"/W$1")})}                                                      
                                                      <IconButton className="hide" title={"Hide this image volume"} 
                                                         onClick={(eve) => {
                                                            this.setState({...this.state, collapse:{...this.state.collapse, ["imageVolume-"+id]:true}}) 
                                                         }}> 
                                                         <VisibilityOff/>
                                                      </IconButton> 
                                                      <br/>
                                                      {/* [<a class="toggle-volume">hide</a>]*/}
                                                      </div>        
                                                    </div>
                                          })
                                       }
                                       <div class="overpage">
                                          <h4 class="page">{e.value.split("\n").map(f => {
                                                //let label = getLangLabel(this,[{"@language":e.language,"@value":f}])
                                                //if(label) label = label["@value"]
                                                let label = f
                                                return ([label,<br/>])})}
                                          </h4>
                                       </div>
                                       { e.seq && <div> 
                                          <IconButton  title={(!this.state.collapse["image-"+this.props.IRI+"-"+e.seq]?"Show":"Hide")+" available scans for this page"} style={{marginLeft:"8px"}}
                                          onClick={(eve) => {
                                                let id = "image-"+this.props.IRI+"-"+e.seq
                                                this.setState({...this.state, collapse:{...this.state.collapse, [id]:!this.state.collapse[id]}}) 
                                             }}> 
                                             <img src="/scan_icon.svg"/>
                                          </IconButton> 
                                          {/* { <h5><a title="Open image+text view in Mirador" onClick={eve => { openMiradorAtPage(imageLinks[e.seq].id) }}>p.{e.seq}</a></h5> } */}
                                          {   [ <h5><a title={(!this.state.collapse["image-"+this.props.IRI+"-"+e.seq]?"Show":"Hide")+" available scans for this page"} onClick={(eve) => {
                                                let id = "image-"+this.props.IRI+"-"+e.seq
                                                this.setState({...this.state, collapse:{...this.state.collapse, [id]:!this.state.collapse[id]}}) 
                                             }}>p.{e.seq}</a>                                             
                                             </h5> ,
                                             <IconButton className="close" data-seq={"image-"+this.props.IRI+"-"+e.seq} title="Configure which image volumes to display" 
                                                onClick={e => { 
                                                   $(e.target).closest("button").addClass("show");
                                                   this.setState({...this.state,
                                                      collapse:{...this.state.collapse, imageVolumeDisplay:!this.state.collapse.imageVolumeDisplay},
                                                      anchorElemImaVol:e.target
                                                   })} }
                                                >
                                                <SettingsApp/>
                                             </IconButton>]
                                             }                  
                                          {/* -- available from { Object.keys(imageLinks).sort().map(id => <span>{this.uriformat(null,{value:id.replace(/bdr:/,bdr)})}</span>)} </h4> } */}
                                       </div> }
                                    </div>))  }
                              {/* // import make test fail...
                                 <div class="sub">
                                 <AnnotatedEtextContainer dontSelect={true} chunks={elem}/>
                                 </div>
                              */}
                        </InfiniteScroll>,
                        <Popover
                           className="imageVolumePopup"
                           open={this.state.collapse.imageVolumeDisplay}
                           anchorEl={this.state.anchorElemImaVol}
                           onClose={e => { 
                              if(!this.state.collapse.imageVolumeDisplay == false)
                              {
                                 setTimeout(() => {$(".close.show").removeClass("show");},500)
                                 this.setState({
                                    ...this.state,
                                    collapse:{ ...this.state.collapse, imageVolumeDisplay:false },
                                    anchorElemImaVol:null   
                                 });
                              }
                           }}
                           >
                              {/* <MenuItem onClick={(e) => {
                                 let collapse = { ...this.state.collapse, imageVolumeDisplay:false }             
                                 Object.keys(imageLinks).map(id => { if(collapse["imageVolume-"+id] !== undefined) { delete collapse["imageVolume-"+id]; } })
                                 this.setState({...this.state,collapse})
                              }}>Show all volumes</MenuItem>  */}
                              { imageLinks && Object.keys(imageLinks).sort().map(id => <MenuItem onClick={e => {
                                    this.setState({...this.state,collapse:{...this.state.collapse, /*imageVolumeDisplay:false,*/ ["imageVolume-"+id]:!this.state.collapse["imageVolume-"+id]}})
                                    //setTimeout(() => {$(".close.show").removeClass("show");},350)
                                 }}>{[
                                    (this.state.collapse["imageVolume-"+id]?<PanoramaFishEye style={{opacity:0.65}}/>:<CheckCircle style={{opacity:0.65}}/>),
                                    <span>&nbsp;&nbsp;</span>,
                                    this.uriformat(null,{value:id.replace(/bdr:/,bdr).replace(/[/]V([^_]+)_I.+$/,"/W$1")},undefined,undefined,"view")
                                 ]}
                              </MenuItem>) }                             
                        </Popover>]
                     )
                  }
                  else if(k == bdo+"eTextHasChunk" && kZprop.indexOf(bdo+"eTextHasPage") === -1) {
                     
                     let next = 0;
                     if(elem && elem.length) next = elem.filter(e => e.value && e.end)
                     if(next && next.length) next = next[next.length - 1].end + 1
                     else next = 0
                     
                     
                     return (
                        
                        <InfiniteScroll
                        id="etext-scroll"
                        hasMore={true}
                        pageStart={0}
                        loadMore={(e) => { 
                           
                              //console.log("next?",this.props.nextChunk,next,JSON.stringify(elem,null,3))

                              if(this.props.nextChunk !== next) {                               
                                 this.props.onGetChunks(this.props.IRI,next); 
                              } 
                           }
                        }
                        //loader={<Loader loaded={false} />}
                        >
                           <h3 class="chunk"><span>{this.proplink(k)}</span>:&nbsp;</h3>
                              {this.hasSub(k)?this.subProps(k):tags.map((e)=> [e," "] )}
                           {/* // import make test fail...
                              <div class="sub">
                              <AnnotatedEtextContainer dontSelect={true} chunks={elem}/>
                              </div>
                           */}
                        </InfiniteScroll>
                     )
                  }
                  else if(k !== bdo+"eTextHasChunk") {

                     let ret
                     if(this.hasSub(k)) ret = this.subProps(k)
                     if(!ret || ret.length === 0) ret = tags.map((e)=> [e," "] )

                     let expand
                     if(elem && elem.filter && elem.filter(t=>t.type === "uri" || t.type === "literal").length > 3) {
                       /*
                       return (
                         <div>
                            <h3><span>{this.proplink(k)}</span>:&nbsp;<span
                              onClick={(e) => this.setState({...this.state,collapse:{...this.state.collapse,[k]:!this.state.collapse[k]}})}
                              className="expand">{!this.state.collapse[k]?<ExpandMore/>:<ExpandLess/>}</span></h3>
                            <Collapse className={"propCollapse in-"+(this.state.collapse[k]===true)} in={this.state.collapse[k]}>{ret}</Collapse>
                         </div>
                       )
                       */
                         return (
                            <div>
                               <h3><span>{this.proplink(k)}</span>:&nbsp;</h3>
                               <div style={{width:"100%"}} className="propCollapseHeader">{ret.splice(0,3)}</div>
                                <Collapse className={"propCollapse in-"+(this.state.collapse[k]===true)} in={this.state.collapse[k]}>
                                   {ret}
                                </Collapse>
                               { <span
                                 onClick={(e) => this.setState({...this.state,collapse:{...this.state.collapse,[k]:!this.state.collapse[k]}})}
                                 className="expand">
                                  {"("+(this.state.collapse[k]?"hide":"...")+")"}
                                </span> }
                            </div>
                         )
                     }
                     else {
                       return (
                          <div>
                             <h3><span>{this.proplink(k)}</span>:&nbsp;</h3>
                             {ret}
                          </div>
                       )
                     }
                  }
               }


            }

         } ) }

         { ["Role"].indexOf(getEntiType(this.props.IRI)) !== -1 && this.props.assocResources && Object.keys(this.props.assocResources).length > 0 &&
            <div>
               <h3><span>Associated Persons</span>:&nbsp;</h3>
            {   this.props.assocResources &&
                  Object.keys(this.props.assocResources).map((e,i) =>
                        i<20?<h4>{this.uriformat(null,{value:e})}</h4>:(i==20?<h4>(<a href={'/search?r='+this.props.IRI}>browse all</a>)</h4>:null))
            }
            </div>
         }
      </div>

      //console.log("pdf",pdfLink,this._annoPane.length)

      // add nother route to UViewer Gallery page
      return (
         [<div style={{overflow:"hidden",textAlign:"center"}}>
            { !this.state.ready && <Loader loaded={false} /> }
            <div className={"resource "+getEntiType(this.props.IRI).toLowerCase()}>
                { top_right_menu(this) }
                { top_left_menu(this,pdfLink,monoVol,fairUse)  }
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
                              /*
                              l = labels.filter((e) => (e.value && (e["lang"] == this.props.prefLang || e["xml:lang"] == this.props.prefLang)))[0]
                              if(!l || l.length == 0) l = labels.filter((e) => (e.value))[0]
                              */
                              l = getLangLabel(this, labels.filter((e) => (e.value)))
                              //if(l&& l.length > 0) l = l[0]
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
               {/* {this.format("h1",rdf+"type",this.props.IRI)} */}
               { title }
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
                  fairUse && (!this.props.auth || !this.props.auth.isAuthenticated()) &&
                  <h3 style={{display:"block",marginBottom:"15px"}}><span style={{textTransform:"none"}}>Access limited to first &amp; last 20 pages.<br/>
                  Please <a class="login" onClick={this.props.auth.login.bind(this,this.props.history.location)}>login</a> if you have sufficient credentials to get access to all images from this work.</span></h3>
               }
               {
                  !this.props.manifestError &&  this.props.imageAsset  && //!this.state.openUV &&
                  <div className={"uvDefault "+(this.state.imageLoaded?"loaded":"")} {...(this.props.config.hideViewers?{"onClick":this.showMirador.bind(this),"style":{cursor:"pointer"}}:{})} >
                     <Loader className="uvLoader" loaded={this.state.imageLoaded} color="#fff"/>
                     { this.props.firstImage && <img src={this.props.firstImage} /*src={`data:image/${this.props.firstImage.match(/png$/)?'png':'jpeg'};base64,${this.props.imgData}`}*/  onLoad={(e)=>this.setState({...this.state,imageLoaded:true})}/> }
                     {
                        this.props.firstImage && this.state.imageLoaded &&
                        <div id="title">
                          { (!this.props.config || !this.props.config.hideViewers) &&
                            [<div onClick={this.showUV.bind(this)}>
                                <span>{I18n.t("resource.view")} {I18n.t("resource."+imageLabel)} {I18n.t("resource.in")} UV</span>
                                <Fullscreen style={{transform: "scale(1.4)",position:"absolute",right:"3px",top:"3px"}}/>
                             </div>,
                             <div onClick={this.showMirador.bind(this)}>
                                <span>{I18n.t("resource.view")} {I18n.t("resource."+imageLabel)} {I18n.t("resource.in")} Mirador</span>
                                <Fullscreen style={{transform: "scale(1.4)",position:"absolute",right:"3px",top:"3px"}}/>
                             </div>,
                             (imageLabel!=="collection" || this.props.manifests) &&
                                <div onClick={this.showDiva.bind(this)}>
                                   <span>{I18n.t("resource.view")} {I18n.t("resource."+imageLabel)} {I18n.t("resource.in")} Diva</span>
                                   <Fullscreen style={{transform: "scale(1.4)",position:"absolute",right:"3px",top:"3px"}}/>
                                </div>
                              ]
                           }
                           { /* this.props.config && this.props.config.hideViewers &&
                              <div onClick={this.showMirador.bind(this)}>
                                 <span>{I18n.t("resource.view")} {I18n.t("resource."+imageLabel)}</span>
                                 <Fullscreen style={{transform: "scale(1.4)",position:"absolute",right:"3px",top:"3px"}}/>
                              </div>
                            */ }
                        </div>
                     }
                  </div>
               }
               {
                  this.props.manifestError && this.props.manifestError.error.message.match(/Restricted access/) &&
                  <h3><span style={{textTransform:"none"}}>Please <a class="login" onClick={this.props.auth.login.bind(this,this.props.history.location)}>login</a> if you have sufficient credentials to get access to images from this work.</span></h3>
               }
               {
                 (pdfLink) &&
                 ( (!(this.props.manifestError && this.props.manifestError.error.message.match(/Restricted access/)) && !fairUse) ||
                  (this.props.auth && this.props.auth.isAuthenticated())) &&
                 [<br/>,<div style={{display:"inline-block"}}>
                    <br/>
                    <a onClick={ ev => {
                        //if(that.props.createPdf) return ;
                         if(monoVol > 0){
                           this.props.onInitPdf({iri:this.props.IRI,vol:monoVol},pdfLink)
                         }
                         else if(!this.props.pdfVolumes) {
                           this.props.onRequestPdf(this.props.IRI,pdfLink)
                        }
                        this.setState({...this.state, pdfOpen:true,anchorElPdf:ev.currentTarget})
                      }
                    } class="download login">Download images as PDF/ZIP</a>
                    <br/>
                    <Loader loaded={(!this.props.pdfVolumes || this.props.pdfVolumes.length > 0)} options={{position:"relative",left:"115%",top:"-11px"}} />
                  </div>]
               }
               {
                  (!this.props.manifestError || (this.props.imageVolumeManifests && Object.keys(this.props.imageVolumeManifests).length)) && (this.props.imageAsset || this.props.imageVolumeManifests) && this.state.openMirador  &&
                  [<div id="fond" >
                     <Loader loaded={false} color="#fff"/>
                  </div>,
                  <div id="viewer"></div>,
                  //<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/mirador@2.7.2/dist/css/mirador-combined.css"/>,
                  //<Script url={"https://cdn.jsdelivr.net/npm/mirador@2.7.2/dist/mirador.js"}/>]
                  <link rel="stylesheet" type="text/css" href="../scripts/mirador/css/mirador-combined.css"/>,
                  <link rel="stylesheet" type="text/css" href="../scripts/src/lib/mirador.css"/>,
                  <Script url={"../scripts/mirador/mirador.js"} onLoad={(e) => { require("@dbmdz/mirador-keyboardnavigation"); }} />,
                  ]
                  //<Script url={"http://library-dev.bdrc.io/scripts/mirador/mirador.js"} onLoad={()=>{$("#fond").addClass("hidden")}} />]
               }
               {
                  !this.props.manifestError && this.props.imageAsset && this.state.openDiva  &&
                  [
                     <div id="fond" >
                        <Loader loaded={false} color="#fff"/>
                     </div>,
                     <div id="diva-wrapper"></div>,
                      <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/diva.js/5.1.3/css/diva.css"/> ]
                      //(!this.state.openUV || this.state.hideUV) && <Script url={"https://cdnjs.cloudflare.com/ajax/libs/diva.js/5.1.3/js/diva.js"}/>]
                      /* // diva 6
                        <link rel="stylesheet" href="//ddmal.github.io/diva.js/try/css/diva.css" />,
                     (!this.state.openUV || this.state.hideUV) &&
                        [
                           <Script url="//ddmal.github.io/diva.js/try/js/diva.js"/>,
                           window.Diva && <Script url="//ddmal.github.io/diva.js/try/js/plugins/manipulation.js"/>,
                           window.Diva && <Script url="//ddmal.github.io/diva.js/try/js/plugins/download.js"/>,
                           window.Diva && <Script url="//ddmal.github.io/diva.js/try/js/plugins/metadata.js"/>
                        ] */

               }
               {/* // use with UV v2.0.2
                  !this.props.manifestError && this.props.imageAsset && this.state.openUV  &&
                  [<div id="fondUV" className={(this.state.hideUV?"hide":"")}>
                     <Loader loaded={false} color="#fff"/>
                  </div>,
                  <div
                  className={"uv "+(this.state.toggleUV?"toggled ":"")+(this.state.hideUV?"hide":"")}
                  data-locale="en-GB:English (GB),cy-GB:Cymraeg"
                  data-config="http://localhost:3000/config.json"
                  //data-uri="https://eap.bl.uk/archive-file/EAP676-12-4/manifest"
                  data-uri={this.props.imageAsset.replace(/[/]i:/,"/iv:")}
                  data-collectionindex="0"
                  data-manifestindex="0"
                  data-sequenceindex="0"
                  data-fullscreen="true"
                  data-canvasindex="0"
                  data-zoom="-1.0064,0,3.0128,1.3791"
                  data-rotation="0"
                  style={{width:"0",height:"0",backgroundColor: "#000"}}
               />,
                  <Script url={"http://universalviewer.io/uv/lib/embed.js"} />
               ]*/}
               {
                  !this.props.manifestError && this.props.imageAsset && this.state.openUV  &&
                  [<div id="fond">
                     <Loader loaded={false} color="#fff"/>
                  </div>,
                  <div id="uv" className={"uv"}
                  style={{backgroundColor: "#000"}}></div>,
                  <link rel="stylesheet" type="text/css" href="../scripts/uv/uv.css"/>,
                  <Script url={"../scripts/uv/lib/offline.js"} attributes={{async:false}} onLoad={()=>{this.setState({...this.state,UVcanLoad:true})}}/>,
                  this.state.UVcanLoad && <Script url={"../scripts/uv/uv.js"}  attributes={{async:false}}/>,
                  this.state.UVcanLoad && <Script url={"../scripts/uv/helpers.js"} attributes={{async:false}}/>
               ]}
               { theData }
            </div>
            {/* <iframe style={{width:"calc(100% - 100px)",margin:"50px",height:"calc(100vh - 160px)",border:"none"}} src={"http://purl.bdrc.io/resource/"+get.IRI}/> */}
         </div>,
         <LanguageSidePaneContainer />]

      ) ;


   }
}

export default ResourceViewer ;
