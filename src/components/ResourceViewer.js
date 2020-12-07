//@flow
//import {Mirador, m3core} from 'mirador'
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
import Menu from '@material-ui/core/Menu';
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
import WarnIcon from '@material-ui/icons/Warning';
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
import Paper from '@material-ui/core/Paper';
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
import SearchIcon from '@material-ui/icons/Search';
import PhotoIcon from '@material-ui/icons/PhotoSizeSelectActual';
import Script from 'react-load-script'
import React, { Component } from 'react';
import qs from 'query-string'
import Button from '@material-ui/core/Button';
import Fade from '@material-ui/core/Fade';
import RefreshIcon from '@material-ui/icons/Refresh';

//import {Translate , I18n} from 'react-redux-i18n';
import I18n from 'i18next';
import { Trans } from 'react-i18next'

import { Link } from 'react-router-dom';
//import AnnotatedEtextContainer from 'annotated-etext-react';
import IIIFViewerContainer from '../containers/IIIFViewerContainer';
import LanguageSidePaneContainer from '../containers/LanguageSidePaneContainer';
import {miradorConfig, miradorSetUI} from '../lib/miradorSetup';
import { Redirect404 } from "../routes.js"
import Footer from "./Footer"

import Loader from "react-loader"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLanguage } from '@fortawesome/free-solid-svg-icons'
//import {MapComponent} from './Map';
import {getEntiType,dPrefix} from '../lib/api';
import {numtobo} from '../lib/language';
import {languages,getLangLabel,top_right_menu,prefixesMap as prefixes,sameAsMap,shortUri,fullUri,highlight,lang_selec,langSelect,searchLangSelec,report_GA,getGDPRconsent} from './App';
import {narrowWithString} from "../lib/langdetect"
import Popover from '@material-ui/core/Popover';
import Popper from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import L from 'leaflet';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import {svgEtextS,svgInstanceS,svgImageS} from "./icons"

import {keywordtolucenequery,lucenequerytokeyword} from './App';

import logdown from 'logdown'

// for full debug, type this in the console:
// window.localStorage.debug = 'rv'

const loggergen = new logdown('rv', { markdown: false });

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
   assocTypes?:{},
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
   imageLists?:{},
   ontology:{},
   dictionary:{},
   authUser?:{},
   highlight?:{
       uri:string,
       key:lang,
       lang:string 
    },
   outline?:{},
   IIIFerrors?:{},
   onGetAssocTypes: (s:string) => void,
   onInitPdf: (u:string,s:string) => void,
   onRequestPdf: (u:string,s:string) => void,
   onCreatePdf: (s:string,u:string) => void,
   onGetResource: (s:string) => void,
   onGetOutline: (s:string) => void,
   onGetAnnotations: (s:string) => void,
   onHasImageAsset:(u:string,s:string) => void,
   onGetChunks: (s:string,b:number) => void,
   onGetPages: (s:string,b:number) => void,
   onGetETextRefs: (s:string) => void,
   onToggleLanguagePanel:()=>void,
   onResetSearch:()=>void,
   onUserProfile:(url:{})=>void
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
   errors:{[string]:boolean},
   updates?:{},
   pdfOpen?:boolean,
   pdfReady?:boolean,
   anchorElPdf?:any,
   anchorElPopover?:any,
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
   imageLinks?:{},
   resource?:{},
   IRI?:url,
   publicProps?:{},
   emptyPopover?:boolean,
   title:{work:{},instance:{},images:{}},
   tabs:[],
   anchorEl:{},
   openEtext?:boolean
 }


const adm   = "http://purl.bdrc.io/ontology/admin/" ;
const bda   = "http://purl.bdrc.io/admindata/";
const bdac  = "http://purl.bdrc.io/anncollection/" ;
const bdan  = "http://purl.bdrc.io/annotation/" ;
const bdo   = "http://purl.bdrc.io/ontology/core/"
const bdou  = "http://purl.bdrc.io/ontology/ext/user/" ;
const bdr   = "http://purl.bdrc.io/resource/";
const bdu   = "http://purl.bdrc.io/resource-nc/user/" ; 
const bf    = "http://id.loc.gov/ontologies/bibframe/";
const dila  = "http://purl.dila.edu.tw/resource/";
const foaf  = "http://xmlns.com/foaf/0.1/" ;
const mbbt  = "http://mbingenheimer.net/tools/bibls/" ;
const oa    = "http://www.w3.org/ns/oa#" ;
const ola    = "https://openlibrary.org/authors/" 
const owl   = "http://www.w3.org/2002/07/owl#" ; 
const rdf   = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const rdfs  = "http://www.w3.org/2000/01/rdf-schema#";
const rkts  = "http://purl.rkts.eu/resource/";
const skos  = "http://www.w3.org/2004/02/skos/core#";
const tmp   = "http://purl.bdrc.io/ontology/tmp/" ;
const _tmp  = tmp ;
const viaf  = "http://viaf.org/viaf/"
const wd    = "http://www.wikidata.org/entity/"
const xsd   = "http://www.w3.org/2001/XMLSchema#" ;

//other
const cbeta = "http://cbetaonline.dila.edu.tw/"

//const prefixes = { adm, bdac, bdan, bda, bdo, bdr, foaf, oa, owl, rdf, rdfs, skos, xsd, tmp, dila }

export const providers = { 
   "bdr":"BDRC", //"Buddhist Digital Resource Center",
   "bn":"Buddhanexus",
   "bnf":"BNF (French National Library)",
   "cbcp":"CBC@",
   "cbct":"CBC@",
   "cbeta":"CBETA",
   "cudl":"CUDL",
   "dila":"DILA Authority Database",
   "eap":"British Library (EAP)",
   "eftr":"84000",
   "har":"Himalayan Art",
   "ia":"Internet Archives",        
   "idp":"International Dunhuang Project",         
   "gretil":"GRETIL",
   "loc":"Library of Congress",
   "lul":"Leiden University Libraries",
   "mbbt":"Marcus Bingenheimer's website",
   "ngmpp":"NGMPP",
   "rkts":"rKTs",
   "ola":"Open Library",
   "sat":"SAT Daizōkyō Text Database",
   "sbb":"Staatsbibliothek zu Berlin",
   "src":"Sakya Research Center",
   "tol":"Treasury of Lives",
   "viaf":"VIAF",
   "wc":"WorldCat",
   "wd":"Wikidata",
}
   

export const provImg = {
   "bdr":  "/logo.svg", 
   "bn":  "/BN.svg",
   "bnf":  "/BNF.svg",
   //"cbct": false,
   //"cbcp": false,
   "cbeta": "/CBETALogo.png", 
   "cudl": "/CUDL.svg", 
   "dila": "/DILA-favicon.ico", 
   "eap":  "/BL.gif",
   "eftr": "/84000.svg",
   "84000": "/84000.svg",
   "gretil": "/GRETIL.png",
   "har": "/HAR.png",
   "ia": "/IA.png",
   "idp":  "/IDP.jpg",
   "loc":"/LOC.svg",
   "lul":"/LULDC.png",
   "mbbt": "/MB-icon.jpg",
   "ngmpp":"/NGMPP.svg",
   "ola":  "/OL.png",  //"https://openlibrary.org/static/images/openlibrary-logo-tighter.svg" //"https://seeklogo.com/images/O/open-library-logo-0AB99DA900-seeklogo.com.png", 
   "rkts": "/RKTS.png",
   "sbb": "/SBB.png",
   "src": "/SRC.svg",   
   "tol": "/ToL.png",
   "viaf": "/VIAF.png",
   "wc":   "/WORLDCAT.png",
   "wd":   "/WD.svg",
}



let propOrder = {
   "Corporation":[
      "adm:metadataLegal"
   ],
   "Etext":[
      "adm:metadataLegal",
      "bdo:eTextTitle",
      //"bdo:eTextIsVolume",
      //"bdo:eTextInVolume",
      "bdo:eTextInInstance",
      //"bdo:eTextVolumeIndex",
      //"bdo:eTextHasPage",
      //"bdo:eTextHasChunk",
   ],
   /*
   "Volume":[
      "bdo:instanceOf",
      "bdo:instanceReproductionOf",
      "tmp:siblingInstances",
      "bdo:instanceHasReproduction",
      "bdo:hasReproduction",
      "bdo:workHasInstance",
      "bdo:hasInstance",
      "bdo:itemForWork",
      "bdo:itemHasVolume",
      "bdo:itemVolumes",
      "bdo:instanceHasVolume",
      "bdo:volumeOf",
      "bdo:volumeNumber",
      "bdo:volumeHasEtext"
   ],
   */
   "Lineage":[
      "adm:metadataLegal",
      "skos:prefLabel",
      "skos:altLabel",
      "bdo:lineageType",
      "bdo:lineageObject",
      
      
   ],
   "Person" : [
      "adm:metadataLegal",
      "bdo:personName",
      "skos:prefLabel",
      "skos:altLabel",
      "bdo:personGender",
      "bdo:personEvent",
      "bdo:kinWith",
      // "bdo:incarnationActivities",
      "bdo:isIncarnation",
      "bdo:hasIncarnation",
      // "bdo:incarnationGeneral",
      "bdo:personStudentOf",
      "bdo:personTeacherOf",
      "bdo:note",
      "rdfs:seeAlso",
    ],
   "Place":[
      "adm:metadataLegal",
      "skos:prefLabel",
      "skos:altLabel",
      "bdo:placeContains",
      "bdo:placeEvent",
      "bdo:placeLat",
      "bdo:placeLong",
      "bdo:placeRegionPoly",
      "bdo:placeType",
      "bdo:placeLocatedIn",
      "bdo:placeIsNear",
   ],
   "Role":[
      "adm:metadataLegal",
      "skos:prefLabel",
      "skos:altLabel",
      "rdfs:comment",
      "rdfs:seeAlso"
   ],
   "Topic":[
      "adm:metadataLegal",
      "skos:prefLabel",
      "skos:altLabel",
      "rdfs:comment",
      "rdfs:seeAlso"
   ],
   "Work":[
      "adm:metadataLegal",
      "bdo:hasTitle",
      "skos:prefLabel",
      "skos:altLabel",
      //"bdo:workType",
      "bdo:instanceHasReproduction",
      "bdo:instanceOf",
      //"bdo:instanceReproductionOf",
      "tmp:siblingExpressions",
      "bdo:workHasParallelsIn",
      "bdo:workDerivativeOf",
      "bdo:workTranslationOf",
      "bdo:workHasDerivative",
      "bdo:workHasTranslation",
      "tmp:workHasTranslationInCanonicalLanguage",
      "tmp:workHasTranslationInNonCanonicalLanguage",
      "bdo:workIsAbout",
      "bdo:workGenre",
      // "bdo:creatorMainAuthor",
      // "bdo:creatorContributingAuthor",
      "bdo:creator",
      "bdo:language",
      "bdo:script",
      "tmp:hasEtext",
      "bdo:hasReproduction",
      "bdo:workHasInstance",
      "bdo:hasInstance",
      "bdo:contentLocation",
      //"bdo:inRootInstance",
      "tmp:siblingInstances",      
      // "bdo:workHasItemImageAsset",
      "bdo:partOf",
      "bdo:partType",
      //"bdo:partIndex",
      //"bdo:partTreeIndex",
      "bdo:hasPart",
      "bdo:workHasPart",
      "bdo:instanceHasItem",
      "bf:identifiedBy",
      "rdfs:seeAlso",
      "bdo:incipit",
      "bdo:authorshipStatement",
      "bdo:explicit",
      "bdo:colophon",
      "bdo:instanceEvent",
      "bdo:workEvent",
      "bdo:publisherName",
      "bdo:publisherLocation",
      "bdo:hasSourcePrintery",
      "bdo:printMethod",
      "bdo:printType",
      "bdo:workDimWidth",
      "bdo:workDimHeight",
      "bdo:editionStatement",
      //"adm:contentProvider",
      "bdo:biblioNote", 
      "adm:originalRecord",
      "bdo:hasItem",
   ],
   "Taxonomy":[],
   "User" : [
      "skos:prefLabel",
      "skos:altLabel",
   ],
   "Product":[]
}

propOrder["Etext"] = propOrder["Work"]
propOrder["Volume"] = propOrder["Work"]
propOrder["Instance"] = propOrder["Work"]
propOrder["Images"] = propOrder["Work"]


const topProperties = {
   "Person": [ 
      bdo+"personName", 
      skos+"prefLabel", 
      skos+"altLabel",
      bdo+"personGender"
   ],
   "Place": [ 
      skos+"prefLabel", 
      skos+"altLabel",
      bdo+"placeType",
      bdo+"placeLocatedIn",
   ],
   "Work": [ 
      bdo+"hasTitle", 
      skos+"prefLabel", 
      skos+"altLabel",
      bdo+"language",
      bdo+"creator",
      bdo+"catalogInfo",
      bdo+"workTranslationOf",
      bdo+"workHasInstance",
   ],
   "Instance": [ 
      bdo+"instanceHasReproduction",
      tmp+"propHasScans",
      tmp+"propHasEtext",
      //bdo+"instanceOf",
      bdo+"catalogInfo",
      bdo+"creator",
      bdo+"hasTitle", 
      skos+"prefLabel", 
      skos+"altLabel", 
      //bdo+"contentLocation",
      bdo+"instanceEvent",
      bdo+"publisherName",
      bdo+"publisherLocation",
      bdo+"editionStatement",
   ],
   "Images": [ 
      bdo+"hasTitle", 
      skos+"prefLabel", 
      skos+"altLabel",
      bdo+"scanInfo",
      //bdo+"instanceReproductionOf",
      //bdo+"itemVolumes",
   ],
   "Volume": [ 
      bdo+"hasTitle", 
      skos+"prefLabel", 
      skos+"altLabel",
      bdo+"volumeNumber", 
      bdo+"volumeOf"
   ],
   "Etext": [
      bdo+"hasTitle", 
      skos+"prefLabel", 
      skos+"altLabel",
      //bdo+"instanceOf",
      //adm+"originalRecord",
      bdo+"eTextTitle",
      bdo+"eTextIsVolume",
      bdo+"eTextInVolume",
      bdo+"eTextInInstance",
      //tmp+"imageVolumeId", // TODO uncommenting this breaks image display 
      bdo+"eTextVolumeIndex",
      //bdo+"eTextInItem",
      //tmp+"workLabel",
      //bdo+"itemForWork",
      //bdo+"isRoot",
      
   ]
}
                       
let extProperties = {
   "Work": [
      bf+"identifiedBy",
      bdo+"contentMethod",
      bdo+"printMethod",
      bdo+"material",
      bdo+"binding",
      //bdo+"workPagination",
      bdo+"instanceExtentStatement",
      //tmp+"entityScore",
      //bdo+"authorshipStatement",
      bdo+"itemBDRCHoldingStatement",
      bdo+"numberOfVolumes",
      "tmp:dimensions",
      bdo+"bdo:dimensionsStatement",
      bdo+"bdo:instanceReproductionOf",
      bdo+"note",
      bdo+"instanceHasVolume",
   ],
   "Person": [,
      bf+"identifiedBy",
      //tmp+"entityScore"
      bdo+"note",
   ],
   "Place": [,
      bf+"identifiedBy",
      //tmp+"entityScore"
      bdo+"note",
      bdo+"placeGB2260-2013",
      bdo+"placeWB2000",
      bdo+"placeWB2010",
      bdo+"placeWBArea",
      bdo+"placeGonpaPerEcumen",
   ],
   "Lineage": [
      bdo+"workLocation",
      bdo+"note",
   ],
   "Corporation": [
      bdo+"note",
   ]
}
extProperties["Etext"] = extProperties["Work"]
extProperties["Volume"] = extProperties["Work"]
extProperties["Instance"] = extProperties["Work"]
extProperties["Images"] = extProperties["Work"]


const canoLang = ["Bo","Pi","Sa","Zh"]

let reload = false ;
let tiMir = 0

function getRealUrl(that,url) {

   if(that.props.assocResources && that.props.assocResources[url]) {
      let orec, canUrl ;
      orec = that.props.assocResources[url].filter(r => r.type === adm+"originalRecord" || r.fromKey === adm+"originalRecord")
      if(orec && orec.length) return orec[0].value
      canUrl = that.props.assocResources[url].filter(r => r.type === adm+"canonicalHtml" ||  r.fromKey === adm+"canonicalHtml")
      if(canUrl && canUrl.length) return canUrl[0].value
   }

   return url ;
}

export function getOntoLabel(dict,locale,lang,props = [skos+"prefLabel", rdfs+"label"]) {
   let _lang = lang
   if(dict[lang]) {
      if(!Array.isArray(props)) props = [ props ]
      for(let prop of props) {
         lang = dict[_lang][prop]
         if(lang && lang.length) {
            let uilang = lang.filter(l => l["lang"] === locale)
            if(uilang.length) lang = uilang[0].value 
            else {
               uilang = lang.filter(l => l["lang"] === "en")
               if(uilang.length) lang = uilang[0].value 
               else lang = lang[0].value
            }
            return lang
         }
      }
   }
   return _lang;
}

export function top_left_menu(that,pdfLink,monoVol,fairUse)
{
  return (

    <div id="top-left">

       { that.props.IRI && <CopyToClipboard text={"http://purl.bdrc.io/resource/"+that.props.IRI.replace(/^bdr:/,"")} onCopy={(e) =>
                //alert("Resource url copied to clipboard\nCTRL+V to paste")
                prompt(I18n.t("misc.clipboard"),fullUri(that.props.IRI))
          }>

          <a id="permalink" style={{marginLeft:"0px"}} title={I18n.t("misc.permalink")}>
             <img src="/icons/PLINK.png"/>{/* <ShareIcon /> */}
             <span>{I18n.t("misc.permalink")}</span>
          </a>
       </CopyToClipboard> }

      { that.props.IRI && <span id="rid">{shortUri(that.props.IRI)}</span> }

       {/* <Link style={{fontSize:"20px"}} className="goBack" to="/" onClick={(e) => that.props.onResetSearch()} //that.props.keyword&&!that.props.keyword.match(/^bdr:/)?"/search?q="+that.props.keyword+"&lg="+that.props.language+(that.props.datatype?"&t="+that.props.datatype:""):"/"
       >
          
          <IconButton style={{paddingLeft:0}} title={I18n.t("resource.back")}>
             <HomeIcon style={{fontSize:"30px"}}/>
          </IconButton>
       </Link> */}
       {
          that.props.IRI && that.props.IRI.match(/^(bd[ra])|(dila):/) &&
          <div>{[<a className="goBack" target="_blank" title="TTL version" rel="alternate" type="text/turtle" href={that.expand(that.props.IRI)+".ttl"}>
             <Button style={{marginLeft:"0px",paddingLeft:"10px",paddingRight:0}}>{I18n.t("resource.export")} ttl</Button>
          </a>,<span>&nbsp;/&nbsp;</span>,
          <a className="goBack noML" target="_blank" title="JSON-LD version" rel="alternate" type="application/ld+json" href={that.expand(that.props.IRI)+".jsonld"}>
             <Button style={{paddingLeft:0,paddingRight:"10px"}}>json-ld</Button>
          </a>]}</div>
       }
       { that.props.IRI && getEntiType(that.props.IRI) === "Etext" && <a target="_blank" style={{fontSize:"26px"}} download className="goBack pdfLoader" href={that.props.IRI?that.props.IRI.replace(/bdr:/,bdr)+".txt":""}>
                <IconButton title={I18n.t("resource.downloadAs")+" TXT"}>
                   <img src="/DL_icon.svg" height="24" />
                </IconButton>
               </a> }
       {
          that.props.IRI && that.props.IRI.match(/^bda[nc]:/) &&
          <div>{[<a className="goBack" target="_blank" title="TTL version" rel="alternate" type="text/turtle"
             href={"http://purl.bdrc.io/"+(that.props.IRI.match(/^bdan:/)?"annotation/":"anncollection/")+that.props.IRI.replace(/bda[nc]:/,"")+".ttl"}>
                <Button style={{marginLeft:"0px",paddingLeft:"10px",paddingRight:"0px"}}>{I18n.t("resource.export")} ttl</Button>
          </a>,<span>&nbsp;/&nbsp;</span>,
          <a className="goBack noML" target="_blank" title="JSON-LD version" rel="alternate" type="application/ld+json"
             href={"http://purl.bdrc.io/"+(that.props.IRI.match(/^bdan:/)?"annotation/":"anncollection/")+that.props.IRI.replace(/bda[nc]:/,"")+".jsonld"}>
                <Button style={{paddingLeft:0,paddingRight:"10px"}}>json-ld</Button>
          </a>]}</div>
       }
       { /*  TODO // external resources ==> /query/graph/ResInfo?R_RES=
          that.props.IRI.match(/^bda[cn]:/) &&
       */}
       { /*that.props.IRI && getEntiType(that.props.IRI) === "Etext" && <a target="_blank" style={{fontSize:"26px"}} download={that.props.IRI?that.props.IRI.replace(/bdr:/,"")+".txt":""} className="goBack pdfLoader" href={that.props.IRI?that.props.IRI.replace(/bdr:/,bdr)+".txt":""}>
                <IconButton title={I18n.t("resource.downloadAs")+" TXT"}>
                   <img src="/DL_icon.svg" height="24" />
                </IconButton>
               </a>*/ }
       {pdfLink && 
         ( (!(that.props.manifestError && that.props.manifestError.error.message.match(/Restricted access/)) && !fairUse) ||
         (that.props.auth && that.props.auth.isAuthenticated()))
         &&
          [<a style={{fontSize:"26px"}} className="goBack pdfLoader">
             <Loader loaded={(!that.props.pdfVolumes || that.props.pdfVolumes.length > 0)} options={{position:"relative",left:"24px",top:"-7px"}} />
                <IconButton title={I18n.t("resource.downloadAs")+" PDF/ZIP"} onClick={ev =>
                      {
                         //if(that.props.createPdf) return ;
                          if((monoVol && monoVol.match && monoVol.match(/[^0-9]/)) || monoVol > 0){
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
                                     <b>{(e.volume !== undefined?(!e.volume.match || e.volume.match(/^[0-9]+$/)?"Volume ":"")+(e.volume):monoVol)}{I18n.t("punc.colon")}</b>
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



       {

          !that.props.manifestError && that.props.imageAsset &&
          [/* <Button className="goBack" onClick={that.showUV.bind(this)}
             style={{paddingRight:"0",marginRight:"20px"}}>view image gallery</Button>, */

             <CopyToClipboard text={that.props.imageAsset} onCopy={(e) =>
                      //alert("Resource url copied to clipboard\nCTRL+V to paste")
                      prompt(I18n.t("misc.clipboard"),that.props.imageAsset)
                }>

                <Button id="iiif" className="goBack" title="IIIF manifest"><img src="/iiif.png"/></Button>
             </CopyToClipboard>]

       }

       { /*  // annotations not in release 1.0 
       <IconButton style={{marginLeft:"0px"}} title={I18n.t("resource.toggle")} onClick={e => that.setState({...that.state,annoPane:!that.state.annoPane})}>
          <ChatIcon />
       </IconButton>
        */ }

       { /*
          that.props.IRI && //that.props.IRI.match(/^[^:]+:[RPGTW]/) &&
          prefixes[that.props.IRI.replace(/^([^:]+):.*$/,"$1")] &&
          <Link className="goBack" to={"/search?r="+that.props.IRI+"&t=Work"}>
          <IconButton style={{paddingLeft:0}} title={I18n.t("resource.browse")}>
             <SearchIcon style={{fontSize:"30px"}}/>
          </IconButton>
          
          </Link>
       */}
     </div>
   )
}

class ResourceViewer extends Component<Props,State>
{
   _annoPane = [] ;
   _leafletMap = null ;
   _properties = {} ;
   _dontMatchProp = "" ;
   _mouseover = {}
   _refs = {}

   constructor(props:Props)
   {
      super(props);

      this.state = { uviewer:false, imageLoaded:false, collapse:{}, pdfOpen:false, showAnno:true, errors:{},updates:{},title:{}, anchorEl:{} }

      loggergen.log("props",props)

      let tmp = {}
      for(let k of Object.keys(propOrder)){ tmp[k] = propOrder[k].map((e) => this.expand(e)) }
      //loggergen.log("tmp",tmp)
      propOrder = tmp

      window.closeViewer = () => {
         //delete window.mirador

         loggergen.log("closeV",this.state.fromSearch,this.state,this.props)

         let fromSearch
         if(this.state.fromSearch && !this.state.fromClick) {
            let backTo = this.state.fromSearch

            let withW = backTo.replace(/^.*[?&]([sw]=[^&]+)&?.*$/,"$1")
            loggergen.log("fromS",this.state.fromSearch,backTo,withW)
            if(backTo === withW) backTo = decodeURIComponent(backTo)
            else backTo = (decodeURIComponent(backTo.replace(new RegExp("(([?])|&)"+withW),"$2"))+"&"+withW).replace(/\?&/,"?")

            if(backTo.startsWith("latest")) this.props.history.push({pathname:"/latest",search:backTo.replace(/^latest/,"")})
            else if(!backTo.startsWith("/show")) this.props.history.push({pathname:"/search",search:backTo})
            else {
               fromSearch = this.state.fromSearch
               let path = backTo.split("?")
               this.props.history.push({pathname:path[0],search:path[1]})
            }
         }

         if(window.mirador) delete window.mirador
         if(window.MiradorUseEtext) delete window.MiradorUseEtext ;
         if(window.currentZoom) delete window.currentZoom ;

         let loca = { ...this.props.history.location }
         if(loca.hash == "#open-viewer") { 
            loca.hash = ""
            window.closeMirador = true;
            this.props.history.push(loca);            
         }

         this.setState({...this.state, openUV:false, openMirador:false, openDiva:false, ...(fromSearch?{fromSearch}:{}) } ); 

      }
   }

   static setTitleFromTabs(props,state) {

      let s, tabs = [ ...state.tabs ]

      delete state.tabs
      if(!s) s = { ...state }

      let _T = getEntiType(props.IRI), work, instance, images

      if(_T === "Work") {
         work = [ { type:"uri", value:fullUri(props.IRI) } ]
         instance = [ { type:"uri", value:fullUri(tabs[0]) } ]
         if(tabs.length > 1) images = [ { type:"uri", value:fullUri(tabs[1]) } ]
         s.title = { work, instance, images }
      }
      else if(_T === "Instance") {
         instance = [ { type:"uri", value:fullUri(props.IRI) } ]
         images = [ { type:"uri", value:fullUri(tabs[0]) } ]
         s.title = { instance, images }
      }
      
      //loggergen.log("title:",_T,work,instance,images)
      return s
   
      
   }

   static getDerivedStateFromProps(props:Props,state:State)
   {

      let getElem = (prop,IRI,useAssoc,subIRI) => {         
         let longIRI = fullUri(IRI)
         if(subIRI) longIRI = subIRI
         if(useAssoc) {
            let elem = useAssoc[longIRI]
            if(elem) elem = elem.filter(e => e.type === prop || e.fromKey === prop)
            else elem = null
            return elem
         }
         else if(props.resources && props.resources[IRI] && props.resources[IRI][longIRI]){
            let elem = props.resources[IRI][longIRI][prop]
            return elem
         }
      }

      let s 


      // TODO fix reopening etext after being closed
      if(state.openEtext && state.closeEtext) s = { ...state, openEtext:false, closeEtext: false } 

      if(state.tabs && state.tabs.length) s = ResourceViewer.setTitleFromTabs(props,state) ;



      // update when language has changed
      let eq = true
      if(props.langPreset && state.langPreset) for(let i = 0 ; i < props.langPreset.length && eq; i ++ ) { eq = eq && props.langPreset[i] === state.langPreset[i] ; }
      else eq = false ;
      if(!eq) {
         if(!s) s = { ...state }
         let langDetect = [ "ewts", "iast", "pinyin" ]
         let langP = [], i
         if(props.langPreset) { 
            langP = props.langPreset.map(p => p.replace(/^.*?(ewts|iast|pinyin)?$/,"$1")).filter(e => e)
            langDetect = langDetect.map(d => ({d,i:(i=langP.indexOf(d))!==-1?i:99}))
            loggergen.log("langP",langDetect,langP,props.langPreset)         
            langDetect = _.orderBy(langDetect, ["i","d"],["asc","asc"]).map(v => v.d)
         }
         s = { ...s, langPreset:props.langPreset, repage:true, langDetect }
         if(props.langIndex !== undefined ) s = { ...s, language:props.langPreset[0] }

      }

      if(props.resources && props.resources[props.IRI]) {

         if(props.IRI && !props.outline && getEntiType(props.IRI) === "Instance" && props.config) props.onGetOutline(props.IRI)
         if(state.outlinePart && props.outlines && !props.outlines[state.outlinePart] && props.config) props.onGetOutline(state.outlinePart)

         let root = getElem(bdo+"inRootInstance",props.IRI)
         if(root && root.length) {
            let shR = shortUri(root[0].value)
            if(props.outlines && !props.outlines[shR] && props.config && state.outlinePart) props.onGetOutline(shR)
         }

         let 
            work = getElem(bdo+"instanceOf",props.IRI),
            instance = getElem(bdo+"instanceReproductionOf",props.IRI),
            images = getElem(bdo+"instanceHasReproduction",props.IRI)

         // TODO find a way to keep an existing Etext/Images tab
         //if(images) images = images.filter(e => getEntiType(e.value) === "Images")

         let _T = getEntiType(props.IRI)

         //loggergen.log("title!",_T,JSON.stringify(state.title,null,3),JSON.stringify(work,null,3),JSON.stringify(instance,null,3),JSON.stringify(images,null,3))

         
         if(_T === "Etext") {            
            if(!s) s = { ...state }
            if(instance) instance = instance.filter(e => getEntiType(e.value) !== "Images")
            if(!work && s.title.work && s.title.work.filter(e => getEntiType(e.value) === "Volume").length) delete s.title.work
            /*
            if(!work && s.title.work) work = s.title.work
            images = [ { type:"uri", value:fullUri(props.IRI) } ]
            s.title = { work, images }
            */
         } 
         
         if(_T === "Images" || _T === "Etext") {            
            if(!s) s = { ...state }
            if(!work && s.title.work) work = s.title.work
            else if( /* _T === "Etext" && */ instance) {
               work = getElem(bdo+"instanceOf",shortUri(instance[0].value));
            }
            if(!instance && s.title.instance && s.title.instance[0].value !== fullUri(props.IRI)) instance = s.title.instance
            images = [ { type:"uri", value:fullUri(props.IRI) } ]
            s.title = { work, images, instance }
         } 
         else if(_T === "Instance") {            
            if(!s) s = { ...state }

            // see #283
            //if(!work && s.title.work) work = s.title.work

            // DONE find a way to keep an existing Etext/Images tab
            if(s.title.images) {  
               let _in = getElem(bdo+"instanceReproductionOf",shortUri(s.title.images[0].value))
               if(_in && _in.length && shortUri(_in[0].value) === props.IRI) images = s.title.images
            }

            instance = [ { type:"uri", value:fullUri(props.IRI) } ]
            s.title = { work, instance, images }
         } 
         else if(_T === "Work") {            
            if(state.title.work && state.title.work.length && state.title.work[0].value === fullUri(props.IRI) ) {
               if(!s) s = { ...state }
               work = [ { type:"uri", value:fullUri(props.IRI) } ] 
               instance = state.title.instance
               images = state.title.images
               s.title = { work, instance, images }
            }
            else {
               if(!s) s = { ...state }
               s.title = { work:[ { type:"uri", value:fullUri(props.IRI) } ] }   
               let has = getElem(bdo+"workHasInstance",props.IRI)
               
               //loggergen.log("has!",has)

               // take a guess using ids [TODO add instance type to query]
               if(has && has.length <= 2) {
                  let inst = has.filter(h => h.value.match(new RegExp("^"+bdr+"MW[^/]+$")))
                  let ima = has.filter(h => h.value.match(new RegExp("^"+bdr+"W[^/]+$")))
                  let etx = has.filter(h => h.value.match(new RegExp("^"+bdr+"IE[^/]+$")))
                  if(has.length == 2 && inst.length === 1 && ima.length === 1) {
                     s.title.instance = [ { type: "uri", value: inst[0].value } ] 
                     if(!etx.length) s.title.images = [ { type: "uri", value: ima[0].value } ]
                  }
                  else if(has.length == 1 && inst.length === 1 && !etx.length) {
                     s.title.instance = [ { type: "uri", value: inst[0].value } ] 
                  }
               }
               

               /* //doesn't work because instances not loaded yet...
               if(has && !instance && (instance=has.filter(e => props.resources[shortUri(e.value)])).length) { 
                  s.title.instance = instance                            
                  images = getElem(bdo+"instanceHasReproduction",shortUri(instance[0].value))
                  loggergen.log("has!i",instance[0].value,images)
                  if(images) s.title.images = images.filter(e => getEntiType(e.value) === "Images")
               }
               */
            }
         }
         else {
            if(!s) s = { ...state }
            s.title = { work:[ { type:"uri", value:fullUri(props.IRI) } ] }
         }

         //loggergen.log("title?",JSON.stringify(state.title,null,3),JSON.stringify(s?s.title:state.title,null,3),props.IRI,_T)
      }

      if(props.IRI && props.resources && props.resources[props.IRI]) {
         if(!s) s = { ...state }
         s.ready = true
      }

      if(s) return s
      else return null
   }

/*
   componentWillMount()
   {
      loggergen.log("mount")

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
*/
   componentWillUpdate(newProps,newState)
   {
      //loggergen.log("stateU",this.state,newState,newProps)


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

   isEtext() {
      let etext = this.getResourceElem(rdf+"type")
      if(etext && etext.filter(e=> e.value.startsWith(bdo+"Etext")).length) etext = true
      else etext = false

      loggergen.log("isEt?",etext)

      return etext
   }

   scrollToHashID(history) {

      // TODO scroll to top when IRI changed (and not on collapse open/close)
      // window.scrollTo(0, 0)

      loggergen.log("histo?",JSON.stringify(history.location),this.state.openEtext)

      if(!history) return

      let loca = { ...history.location }
      const hash = loca.hash.substring(1)
      
      if (hash && hash.length) {
         if(hash === "open-viewer") {
            /*
            let timerViewer = setInterval(() => {
               
               let etext = this.isEtext()
               loggergen.log("etxt?",etext)

               if(!etext && this.props.imageAsset && this.props.firstImage && !this.state.openMirador) {
                  clearInterval(timerViewer)
                  this.showMirador()   
                  //delete loca.hash      
                  //history.replace(loca)
               }
               else if( etext && !this.state.openEtext ) {
                  clearInterval(timerViewer)
                  this.setState({...this.state,openEtext:true  })
               }               
            }, 100)
            */
         }
         else setTimeout( 
            window.requestAnimationFrame(function () {
               const el = document.getElementById(hash)
               if(el) { 
                  el.scrollIntoView()      
                  delete loca.hash      
                  history.replace(loca)
               }
            }), 
            3000 
         )
      }
      else if(this.state.openEtext) {         
         this.setState({openEtext:false })
      }
   }



   componentDidUpdate()  {

      report_GA(this.props.config,this.props.history.location);

      
      if(window.closeMirador) { 
         delete window.closeMirador
         if(this.state.openMirador && window.closeViewer) {
            window.closeViewer()         
         }
      }

      let get = qs.parse(this.props.history.location.search)
      if(!get.osearch && this.props.outlineKW) {          
         //this.setState({outlineKW:"",dataSource:[]})
         this.props.onResetOutlineKW()
         
         if(!s) s = { ...this.state } 
         clear = true
      }

      let s, clear
      
      if(get.part && this.state.outlinePart !== get.part) { 
         if(!s) s = { ...this.state } 
         if(!s.title) s.title = {}
         s.outlinePart = get.part
         clear = true
      }
      
      if(!get.part && (!s && this.state.outlinePart || s && s.outlinePart) ) {
         if(!s) s = { ...this.state } 
         s.outlinePart = false
         clear = true
      }
      loggergen.log("outlinePart: ", s?s.outlinePart:"no s")
      if(clear) {
         let collapse = { ...s.collapse }
         Object.keys(collapse).filter(k => k.startsWith("outline-")).map(k => { delete collapse[k]; })
         s.collapse = collapse
      }


      if(get.s && (!s && this.state.fromSearch !== get.s || s && s.fromSearch !== get.s ) ) { 
         if(!s) s = { ...this.state } 
         s.fromSearch = get.s
      }

      // DONE
      // + clean collapsed nodes when changing node/part
      // + change hilighted node
      // TODO
      // - expand '...' node already open by search

      loggergen.log("update!!",s)


      let loca = { ...this.props.history.location }
      const hash = loca.hash.substring(1)
      
      if (hash && hash.length && hash === "open-viewer") {

         let etext = this.isEtext()
         loggergen.log("etxt?",etext)

         if(!etext && this.props.imageAsset && this.props.firstImage && !this.state.openMirador) {
            this.showMirador()   
            //delete loca.hash      
            //history.replace(loca)
         }
         else if( etext && (!s && !this.state.openEtext || s && !s.openEtext ) ) {
            if(!s) s = { ...this.state } 
            s.openEtext = true 
         }         
      }      

      if(s) this.setState(s);
      
      this.scrollToHashID(this.props.history)
   }

   componentWillUnmount() {
      window.removeEventListener('popstate', this.onBackButtonEvent);
   }
   
   componentDidMount()
   {
      loggergen.log("mount!!")
      
      window.addEventListener('popstate', this.onBackButtonEvent);  

      let s, timerScr
      let get = qs.parse(this.props.history.location.search)
      if(get.tabs && get.tabs.length) {         
         s = ResourceViewer.setTitleFromTabs(this.props,{...this.state, tabs:get.tabs.split(",")})
      }


      if(get.osearch && !this.state.outlineKW) { 
         if(!s) s = { ...this.state } 
         s.outlineKW = get.osearch
         let keys = get.osearch.split("@")
         s.outlineKW = lucenequerytokeyword(keys[0])
         
         if(!timerScr) timerScr = setInterval( () => {
            const el = document.querySelector("#outline")
            loggergen.log("seTi?",el)
            if(el) { 
               el.scrollIntoView()      
               clearInterval(timerScr)
               timerScr = 0
            }
         }, 300)         
      }
      else if(!get.osearch && this.props.outlineKW) {          
         //this.setState({outlineKW:"",dataSource:[]})
         this.props.onResetOutlineKW()
      }

      if(s) this.setState(s);

      this.scrollToHashID(this.props.history)
   }

   onBackButtonEvent(event) {      
      // DONE fix back button to page with open mirador not working
      if(window.location.hash !== "#open-viewer") window.closeMirador = true ;
   }

   expand(str:string, useCfg:boolean = false) //,stripuri:boolean=true)
   {
      if(useCfg && this.props.config) {
         let ldspdi = this.props.config.ldspdi, base 
         if(ldspdi) base = ldspdi.endpoints[ldspdi.index]
         if(base) str = str.replace(/bdr:/, base+"/resource/")
      }

      for(let k of Object.keys(prefixes)) { str = str.replace(new RegExp(k+":"),prefixes[k]); }

      return str ;
   }

   pretty(str:string,isUrl:boolean=false,noNewline:boolean=false) //,stripuri:boolean=true)
   {

      for(let p of Object.values(prefixes)) { str = str.replace(new RegExp(p,"g"),"") }
      //str = shortUri(str);

      //loggergen.log("pretty",str)

      //if(stripuri) {

      if(!str.match(/ /) && !str.match(/^http[s]?:/)) str = str.replace(/([a-z])([A-Z])/g,"$1"+(isUrl?"":' ')+"$2")

      if(str.match(/^https?:\/\/[^ ]+$/)) { str = <a href={str} target="_blank" class="no-bdrc">{str}<img src="/icons/link-out.svg"/></a> }
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

      //let onto = this.props.ontology
      let dic = this.props.dictionary
      let prop = this.props.resources[this.props.IRI][this.expand(this.props.IRI)] ;
      if(this.state.resource) prop = this.state.resource
      let w = prop[bdo+"dimWidth"]
      let h = prop[bdo+"dimHeight"]

      //loggergen.log("propZ",prop,sorted)

      if(w && h && w[0] && h[0] && !w[0].value.match(/cm/) && !h[0].value.match(/cm/)) {
         prop[tmp+"dimensions"] = [ {type: "literal", value: w[0].value+"×"+h[0].value+"cm" } ]
         delete prop[bdo+"dimWidth"]
         delete prop[bdo+"dimHeight"]
      }
      else if(w && w[0] && !w[0].value.match(/cm/)) {
         prop[bdo+"dimWidth"] = [ { ...w[0], value:w[0].value+"cm" } ]
      }
      else if(h && h[0] && !h[0].value.match(/cm/)) {
         prop[bdo+"dimHeight"] = [ { ...h[0], value:h[0].value+"cm" } ]
      }

      //loggergen.log("w h",w,h,prop)

      //prop["bdr:workDimensions"] =

      if(prop[rdfs+"seeAlso"]) {
         if(!prop[adm+"seeOther"]) prop[adm+"seeOther"] = []

         prop[rdfs+"seeAlso"] = prop[rdfs+"seeAlso"].map(e => {
            let short = shortUri(e.value)
            if(short != e.value.replace(/[/]$/,"")) {
               if(!prop[adm+"seeOther"].filter(f => f.value === e.value).length) prop[adm+"seeOther"].push(e) 
               return null
            } 
            else {
               return e
            }
         }).filter(e => e)

         if(!prop[rdfs+"seeAlso"].length) delete prop[rdfs+"seeAlso"];
      }

      if(prop[bdo+"instanceHasReproduction"]) {
         let etexts = [ ...prop[bdo+"instanceHasReproduction"].filter(p => p.value && p.value.startsWith(bdr+"IE")) ] ;
         let images = [ ...prop[bdo+"instanceHasReproduction"].filter(p => p.value && p.value.startsWith(bdr+"W")) ] ;

         if(etexts.length) prop[tmp+"propHasEtext"] = etexts
         if(images.length) prop[tmp+"propHasScans"] = images

         //delete prop[bdo+"instanceHasReproduction"]
      }
         

      if(sorted)
      {

         let customSort = [ bdo+"hasPart", bdo+"instanceHasVolume", bdo+"workHasInstance", tmp+"siblingInstances", bdo+"hasTitle", bdo+"personName", bdo+"volumeHasEtext",
                            bdo+"personEvent", bdo+"placeEvent", bdo+"workEvent", bdo+"instanceEvent", bf+"identifiedBy" ]

         let sortByPropSubType = (tag:string) => {
            let parts = prop[tag]
            if(parts) {

               let assoR = this.props.assocResources
               if (assoR) {
                  parts = parts.map((e) => {

                     let index = assoR[e.value],value

                     if(index) value = index.filter(e => e.fromKey === rdf+"value")
                     if(index) index = index.filter(e => e.fromKey === rdf+"type")
                     
                     if(index && index[0] && index[0].value) index = index[0].value+";"
                     else index = ""

                     if(value && value[0] && value[0].value) index += value[0].value

                     return ({ ...e, k:index })
                  })
                  parts = _.orderBy(parts,['k'],['asc'])
               }
               return parts ;
            }
         }


         if(prop[bf+"identifiedBy"]) prop[bf+"identifiedBy"] = sortByPropSubType(bf+"identifiedBy");


         let sortBySubPropNumber = (tag:string,idx:string) => {
            let parts = prop[tag]
            if(parts) {

               let assoR = this.props.assocResources
               if (assoR) {
                  parts = parts.map((e) => {

                     let index = assoR[e.value]

                     if(index) index = index.filter(e => e.type === idx || e.fromKey === idx)
                     if(index && index[0] && index[0].value) index = Number(index[0].value)
                     else index = null

                     return ({ ...e, index })
                  })
                  parts = _.orderBy(parts,['index'],['asc'])
               }
               return parts ;
            }
         }

         if(prop[bdo+"workHasItem"]) {
            let elem = this.getResourceElem(bdo+"workHasItem")
            let items = []
            let txtItem = []
            if(this.props.assocResources && elem) for(let e of elem)
            {
               let assoc = this.props.assocResources[e.value]
               if(!assoc || !assoc.filter(e => e.type === tmp+"itemType" && e.value === bdo+"ItemEtext").length) items.push(e)
               else txtItem.push(e)
            }
            if(txtItem.length) {
               prop[tmp+"hasEtext"] = txtItem
               if(items.length) prop[bdo+"workHasItem"] = items
            }
         }

         if(prop[bdo+"volumeHasEtext"]) prop[bdo+"volumeHasEtext"] = sortBySubPropNumber(bdo+"volumeHasEtext",bdo+"seqNum");

         // TODO add partIndex in query
         if(prop[bdo+"hasPart"]) prop[bdo+"hasPart"] = sortBySubPropNumber(bdo+"hasPart",bdo+"partIndex");

         if(prop[bdo+"instanceHasVolume"]) prop[bdo+"instanceHasVolume"] = sortBySubPropNumber(bdo+"instanceHasVolume", bdo+"volumeNumber");

         let sortBySubPropURI = (tagEnd:string) => {
            let valSort = prop[bdo+tagEnd] 

            if(this.props.dictionary && this.props.resources) {
               let assoR = this.props.resources[this.props.IRI]
               if(assoR) { 
                  let lang
                  valSort = valSort.map(v => ({...v,type:'bnode'})).map(w => w.type!=='bnode'||!assoR[w.value]?w:{...w,'bnode':w.value,'k':!assoR[w.value]||!assoR[w.value][rdf+"type"]?"":assoR[w.value][rdf+"type"].reduce( (acc,e) => {
                     let p = this.props.dictionary[e.value]
                     //loggergen.log("p?",p)
                     if(p) p = p[rdfs+"subClassOf"]
                     if(p) p = p.filter(f => f.value === bdo+tagEnd[0].toUpperCase()+tagEnd.substring(1)).length
                     if(p) return e.value + ";" + acc  
                     else return acc+e.value+";"
                  },"") + ((lang = getLangLabel(this, "", assoR[w.value][rdfs+"label"]))&&lang.lang?lang.lang+";"+lang.value:"") })
                  //loggergen.log("valsort",assoR,valSort)
                  valSort = _.orderBy(valSort,['k'],['asc']).map(e => ({'type':'bnode','k':e.k,'value':e.bnode,'sorted':true, ...e.fromEvent?{fromEvent:e.fromEvent}:{}, ...e.fromSameAs?{fromSameAs:e.fromSameAs}:{}}))               
               }
            }
            return valSort ; //
         }

         if(prop[bdo+'hasTitle']) prop[bdo+'hasTitle'] = sortBySubPropURI("hasTitle") ;
         
         if(prop[bdo+'personName']) prop[bdo+'personName'] = sortBySubPropURI("personName") ;


         let sortByEventDate = (tagEnd:string) => {
            
            const rank = { [bdo+"PersonBirth"]:1, [bdo+"PersonDeath"]:999, [bdo+"PlaceFounded"]:1 }                                 

            let valSort = prop[bdo+tagEnd] 
            if(this.props.dictionary && this.props.resources) {
               let assoR = this.props.resources[this.props.IRI]
               if(assoR) { 
                  let lang
                  valSort = valSort.map(v => ({...v,type:'bnode'})).map(w => {                   
                     let n = 3
                     let k = ''
                     let d
                     if(assoR[w.value]) {
                        if(assoR[w.value][rdf+"type"]) {
                           for(let t of assoR[w.value][rdf+"type"]) { 
                              let p = this.props.dictionary[t.value]
                              if(p) p = p[rdfs+"subClassOf"]
                              if(p) p = p.filter(f => f.value === bdo+tagEnd[0].toUpperCase()+tagEnd.substring(1)).length
                              if(p) { 
                                 k = t.value
                                 if(rank[t.value])  { 
                                    n = rank[t.value] ; 
                                    break ; 
                                 }
                              }
                           }
                        }
                        if(assoR[w.value][bdo+"onYear"]) { 
                           d = assoR[w.value][bdo+"onYear"][0]
                           if(d) d = d.value
                        }                           
                        else if(assoR[w.value][bdo+"notBefore"]) {
                           d = assoR[w.value][bdo+"notBefore"][0]
                           if(d) d = d.value
                        }
                     }  
                     if(!d) d = 100000
                     if(w.type!=='bnode'||!assoR[w.value]) return w
                     else return { ...w, d, n, k, bnode:w.value }
                  })
                  //loggergen.log("valsort",assoR,valSort)
                  valSort = _.orderBy(valSort,['fromEvent','n', 'd', 'k'],['asc']).map(e => ({'type':'bnode','n':e.n,'k':e.k,'d':e.d,'value':e.bnode,'sorted':true, ...e.fromEvent?{fromEvent:e.fromEvent}:{}, ...e.fromSameAs?{fromSameAs:e.fromSameAs}:{}}))               
               }
            }
            return valSort ; //
         }

         if(prop[bdo+'personEvent']) prop[bdo+'personEvent'] = sortByEventDate("personEvent") ;
         if(prop[bdo+'placeEvent']) prop[bdo+'placeEvent'] = sortByEventDate("placeEvent") ;
         if(prop[bdo+'workEvent']) prop[bdo+'workEvent'] = sortByEventDate("workEvent") ;
         if(prop[bdo+'instanceEvent']) prop[bdo+'instanceEvent'] = sortByEventDate("instanceEvent") ;


         let expr 
         for(let xp of [ bdo+"workHasInstance", tmp+"siblingInstances" ]) 
         {
            expr = prop[xp]

            //loggergen.log("xp",xp,expr)

            if(expr) {

               let assoR = this.props.assocResources
               if (assoR) {

                  expr = expr.map((e) => {

                     //loggergen.log("index",e) //,assoR[e.value])
                     
                     // TODO use language dedicated sort ?
                     let label1 = "zzz" + shortUri(e.value), label2 = "", withThumb = 1 ;
                     if(e && assoR[e.value])
                     {
                        withThumb = 1 - assoR[e.value].filter(e => e.type === tmp+"thumbnailIIIFService").length 

                        label1 = getLangLabel(this, "", assoR[e.value].filter(e => e.type === skos+"prefLabel"))
                        if(label1 && label1.value) label1 = label1.value
                        if(!label1) label1 = "z" + shortUri(e.value)

                        //loggergen.log("index",e,assoR[e.value])
                        if(assoR[e.value])
                        {
                           let root = assoR[e.value].filter(e => e.type === bdo+"inRootInstance")
                           if(root.length > 0 && assoR[root[0].value])
                           {
                              label2 = getLangLabel(this, "", assoR[root[0].value].filter(e => e.type === skos+"prefLabel"))                        
                              label2 = label2.value
                           }
                        }
                     }  
                     return ({ ...e, withThumb, label1, label2 })
                  })

                  prop[xp] = _.orderBy(expr,['withThumb', 'label1','label2'])

                  //loggergen.log("expr",expr,prop[xp]);

                  //for(let o of prop[bdo+"workHasExpression"]) loggergen.log("xp",o.value,o.label1)

               }
            }
         }

         let sortByLang = (deriv) => { 
            deriv = deriv.map((e) => {
               let label1,label2 ;
               let assoR = this.props.assocResources
               if(assoR[e.value])                  {
                  label1 = getLangLabel(this, "", assoR[e.value].filter(e => e.type === skos+"prefLabel"))
                  if(label1 && label1.value) label1 = label1.value
                  let lang = assoR[e.value].filter(e => e.type === bdo+"workLangScript"|| e.type === tmp+"language"|| e.type === bdo+"language")
                  if(lang.length > 0) label2 = lang[0].value
               }
               return ({ ...e, label1, label2 })
            })
           
            return _.orderBy(deriv,['label2','label1'])
         }


         
         
         expr = prop[bdo+"workHasTranslation"]
         if(expr !== undefined) {

            //loggergen.log("hasDerivCa",expr)

            let assoR = this.props.assocResources
            if (assoR) {

               let cano = [], nonCano = [], subLangDeriv = {}
               expr.filter(e => {
                  let lang = assoR[e.value],langLab
                  if(lang) lang = lang.filter(l => l.type === bdo+"workLangScript" || l.type === tmp+"language"|| l.type === bdo+"language"|| l.fromKey === bdo+"language")

                  //loggergen.log("cano",lang,assoR[e.value],e.value)

                  if(lang && lang.length) { 
                     lang = lang[0].value.replace(/[/]Lang/,"/")                  
                     langLab = getOntoLabel(this.props.dictionary,this.props.locale,lang)
                  }
                  else lang = false ;
                  if(lang && canoLang.filter(v => lang.match(new RegExp("/"+v+"[^/]*$"))).length) {
                     let ontoProp = tmp+"workHasTranslationInCanonicalLanguage"+lang.replace(/^.*[/]([^/]+)$/,"$1")                     
                     let newLang = {
                        [rdfs+"label"]: [{type: "literal", value: langLab, lang: "en"}],
                        [rdfs+"subPropertyOf"]: [{type: "uri", value: tmp+"workHasTranslationInCanonicalLanguage"}],
                        [tmp+"langKey"]: [{type:"literal", value:lang}]
                     }
                     //onto[ontoProp] = newLang
                     dic[ontoProp] = newLang
                     if(!subLangDeriv[ontoProp]) subLangDeriv[ontoProp] = []
                     subLangDeriv[ontoProp].push(e)
                     cano.push(e);
                  }
                  else if(assoR[e.value]) { // DONE fix double display as "unknown" when opening eftr:WAITOH113 from results "white lotus"
                     let ontoProp
                     if(!lang) {
                        //console.error("U N K N O W N",e.value,JSON.stringify(assoR[e.value],null,3))
                        ontoProp = tmp+"workHasTranslationInNonCanonicalLanguageUnknown"
                        langLab = "Unknown"
                        lang = "tmp:LangUnknown"
                     }
                     else ontoProp = tmp+"workHasTranslationInNonCanonicalLanguage"+lang.replace(/.*[/]([^/]+)$/,"$1")
                     let newLang = {
                        [rdfs+"label"]: [{type: "literal", value: langLab, lang: "en"}],
                        [rdfs+"subPropertyOf"]: [{type: "uri", value: tmp+"workHasTranslationInNonCanonicalLanguage"}],
                        [tmp+"langKey"]: [{type:"literal", value:lang}]
                     }
                     //onto[ontoProp] = newLang
                     dic[ontoProp] = newLang
                     if(!subLangDeriv[ontoProp]) subLangDeriv[ontoProp] = []
                     subLangDeriv[ontoProp].push(e)
                     nonCano.push(e);
                  }
                  return true
               })
               let keys = Object.keys(subLangDeriv)
               if(keys.length >= 1) {
                  for(let k of keys) {
                     prop[k] = sortByLang(subLangDeriv[k])
                  }
                  if(cano.length) { prop[tmp+"workHasTranslationInCanonicalLanguage"] = sortByLang(cano) }
                  if(nonCano.length) { prop[tmp+"workHasTranslationInNonCanonicalLanguage"] = sortByLang(nonCano) }
                }
                else prop[bdo+"workHasTranslation"] = sortByLang(expr)
            }
         }
         let t = getEntiType(this.props.IRI);
         if(t && propOrder[t])
         {
            let that = this ;

            //loggergen.log("sort",prop,propOrder[t])

            let sortProp = Object.keys(prop).map(e => {
               let index = propOrder[t].indexOf(e)
               if(index === -1) index = 99999 ;
               return ({value:e,index})
            })
            sortProp = _.orderBy(sortProp,['index','value'],['asc','asc'])

            //loggergen.log("sortProp",sortProp)

            /*Object.keys(prop).sort((a,b)=> {
               let ia = propOrder[t].indexOf(a)
               let ib = propOrder[t].indexOf(b)
               //loggergen.log(t,a,ia,b,ib)
               if ((ia != -1 && ib != -1 && ia < ib) || (ia != -1 && ib == -1)) return -1
               else if(ia == -1 && ib == -1) return (a < b ? -1 : (a == b ? 0 : -1))
               else return 1 ;
            })*/

            sortProp = sortProp.filter(k => Array.isArray(prop[k.value])).reduce((acc,e) => {

               if(e.value === bdo+"eTextHasChunk") return { ...acc, [e.value]:prop[e.value]}

               //loggergen.log("sorting",e,prop[e])

               if(customSort.indexOf(e.value) !== -1) {
                  //loggergen.log("skip sort parts",prop[e][0],prop[e])
                  return { ...acc, [e.value]:prop[e.value] }
               }

               return ({ ...acc, [e.value]:prop[e.value].sort(function(A,B){

                  let a = A
                  let b = B
                  if(a.type == "bnode" && a.value) a = that.getResourceBNode(a.value)
                  if(b.type == "bnode" && b.value) b = that.getResourceBNode(b.value)

                  //loggergen.log("A,B",A,B,a,b)

                  
                  if(a && !a["value"] && a[rdfs+"label"] && a[rdfs+"label"][0]) a = a[rdfs+"label"][0]
                  if(a && a["lang"]) a = a["lang"]
                  else if(a && a["xml:lang"] && a["xml:lang"] != "") a = a["xml:lang"]
                  else if(a && a["type"] == "uri") a = a["value"]
                  else a = null

                  if(b && !b["value"] && b[rdfs+"label"] && b[rdfs+"label"][0]) b = b[rdfs+"label"][0]
                  if(b && b["lang"]) b = b["lang"]
                  else if(b && b["xml:lang"] && b["xml:lang"] != "") b = b["xml:lang"]
                  else if(b && b["type"] == "uri") b = b["value"]
                  else b = null

                  //loggergen.log("a,b",a,b)

                  if( a && b ) {
                     let _a = shortUri(a) ;
                     let _b = shortUri(b) ;
                     if( _a !== a && _b === b ) return -1 ; 
                     else if( _a === a && _b !== b ) return 1 ;
                     else if(a < b ) return -1 ;
                     else if(a > b) return 1 ;
                     else return 0 ;
                  }
                  else return 0 ;
               }) })},{})


            //loggergen.log("propSort",prop,sortProp)

            this._properties = prop ;
            return sortProp
         }
      }
      return prop ;
   }



   fullname(prop:string,isUrl:boolean=false,noNewline:boolean=false,useUIlang:boolean=false,canSpan = true,count?:integer=1)
   {
      if(prop && !prop.replace) {
         console.warn("prop:?:",prop)
         return prop
      }

      for(let p of Object.keys(prefixes)) { prop = prop.replace(new RegExp(p+":","g"),prefixes[p]) }


      let sTmp, trad ;
      if(prop && prop.match && prop.match(/[./]/) && (trad=I18n.t(sTmp="prop."+shortUri(prop),{count})) !== sTmp)  {
         if(canSpan) return <span lang="">{this.pretty(trad,isUrl,noNewline)}</span>
         else return this.pretty(trad,isUrl,noNewline)
      }

      //loggergen.log("full",prop)

      /*
      if(this.props.ontology[prop] && this.props.ontology[prop][rdfs+"label"])
      {
         let ret = getLangLabel(this, prop, this.props.ontology[prop][rdfs+"label"])
         if(ret && ret.value && ret.value != "")
            return ret.value
      }
      else 
      */
      if(this.props.dictionary && this.props.dictionary[prop])
      {
         /*
         let ret = this.props.ontology[prop][rdfs+"label"].filter((e) => (e.lang == "en"))
         if(ret.length == 0) ret = this.props.ontology[prop][rdfs+"label"].filter((e) => (e.lang == this.props.prefLang))
         if(ret.length == 0) ret = this.props.ontology[prop][rdfs+"label"]
         */
         let lab = this.props.dictionary[prop][rdfs+"label"]
         if(!lab) lab = this.props.dictionary[prop][skos+"prefLabel"]
         let ret = getLangLabel(this, prop, lab, useUIlang)
         if(ret && ret.value && ret.value != "")
            if(canSpan) return <span lang={ret.lang}>{ret.value}</span>
            else return ret.value

       //&& this.props.ontology[prop][rdfs+"label"][0] && this.props.ontology[prop][rdfs+"label"][0].value) {
         //let comment = this.props.ontology[prop][rdfs+"comment"]
         //if(comment) comment = comment[0].value
         //return <a className="nolink" title={comment}>{this.props.ontology[prop][rdfs+"label"][0].value}</a>
         //return this.props.ontology[prop][rdfs+"label"][0].value
      }

    
      if(canSpan) return <span lang="">{this.pretty(prop,isUrl,noNewline)}</span>
      else return this.pretty(prop,isUrl,noNewline)
    

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

     loggergen.log("showAssoc e k",e,k);

     if(this.props.dictionary[k] && this.props.dictionary[k][bdo+"inferSubTree"]) return


      let vals = [], n=0;
      for(let v of Object.keys(this.props.resources[this.props.IRI+"@"][e]))
      {
        // loggergen.log("v",v);

         let infoBase = this.props.resources[this.props.IRI+"@"][e][v]
         let info = infoBase.filter((e)=>(enti == "Topic" || e.type == k)) // || e.value == bdr+this.props.IRI))

         if(info.length > 0) {

            /*
           info = infoBase.filter((e)=>(e.type == skos+"prefLabel" && e["xml:lang"]==this.props.prefLang))
          */
           info = getLangLabel(this, "",  infoBase.filter((e)=>(e.type == skos+"prefLabel")))

           //loggergen.log("infoB",info)
           if(info && info[0] && n <= 10) vals.push(<h4><Link className="urilink prefLabel" to={"/show/bdr:"+this.pretty(v,true)}>{info[0].value}</Link></h4>)
           else if(n == 11) vals.push("...")
           n ++
         }
      }

      //).map((v,i) => {
      //  if(i < 10) return <h4>{this.uriformat(k /*skos+"prefLabel"*/,{value:v},this.props.resources[this.props.IRI+"@"][e],k)}</h4>
      //  else if(i == 10) return [<h4>{this.uriformat(k /*skos+"prefLabel"*/,{value:v},this.props.resources[this.props.IRI+"@"][e],k)}</h4>,"..."]


     return ([
       <h4 className="first prop">{this.proplink(k)}{I18n.t("punc.colon")}</h4>
       ,
       <div>
       { vals }
       </div>])
   }

   hasSuper(k:string)
   {
      //loggergen.log("sup",k)

      if(!this.props.dictionary || !this.props.dictionary[k] || (!this.props.dictionary[k][rdfs+"subPropertyOf"] && !this.props.dictionary[k][rdfs+"subClassOf"]))
      {
         return false
      }
      else  {
         let tmp = this.props.dictionary[k][rdfs+"subPropertyOf"].map(e => e)
         if(!tmp) tmp = this.props.dictionary[k][rdfs+"subClassOf"].map(e => e)
         while(tmp && tmp.length > 0)
         {
            let e = tmp[0]

            //loggergen.log("super e",e.value) //tmp,k,e.value,e, this.props.ontology[k], this.props.ontology[e.value])

            if(this.props.dictionary[e.value][rdfs+"subPropertyOf"])
               tmp = tmp.concat(this.props.dictionary[e.value][rdfs+"subPropertyOf"].map(f => f))
            else if(this.props.dictionary[e.value][rdfs+"subClassOf"])
               tmp = tmp.concat(this.props.dictionary[e.value][rdfs+"subClassOf"].map(f => f))

            if(this.props.dictionary[e.value] && this.props.dictionary[e.value][bdo+"inferSubTree"]) return true ;
            else if(e.value===bdo+"workTranslationOf") return false

            delete tmp[0]
            tmp = tmp.filter(e => e != null)
         }
         return false ;
      }

   }

   hasSub(k:string)
   {
      if(!k.match(/^http:\/\/purl\.bdrc\.io/)) return false
      else return (this.props.dictionary && this.props.dictionary[k] && this.props.dictionary[k][bdo+"inferSubTree"])

   }

   subProps(k:string,div:string="sub")
   {

      //loggergen.log("subP",div,k)

      let ret = []
      if(this.props.IRI && this.props.resources[this.props.IRI] && this.props.resources[this.props.IRI][this.expand(this.props.IRI)]) {

         let res = this.props.resources[this.props.IRI][this.expand(this.props.IRI)]
         let onto = this.props.dictionary
         let dict = this.props.dictionary
         let subKeys = Object.keys(res).map(q => {
            let key,alphaK="zz",numK=1000
            if(onto[q] && onto[q][tmp+"langKey"]) {
               key = onto[q][tmp+"langKey"]
               if(key && key.length) {
                  key = key[0].value
                  key = key.replace(/^.*[/]([^/][^/])[^/]*$/,"$1").toLowerCase()
                  alphaK = key
                  for(let i in this.props.langPreset) {
                     let l = this.props.langPreset[i]
                     if(l === key) numK = i
                     else if(l.match(new RegExp("^"+key))) numK = 100 + Number(i)
                  }
               }            
            }
            return {"val":q, numK,alphaK}
         })
         subKeys = _.orderBy(subKeys,['numK','alphaK','val'])
         //loggergen.log("subK",k,JSON.stringify(subKeys,null,3))
         subKeys = subKeys.map(q => q.val)
         

         for(let p of subKeys) {


            if(this.props.dictionary[p] && this.props.dictionary[p][rdfs+"subPropertyOf"]
               && this.props.dictionary[p][rdfs+"subPropertyOf"].filter((e)=>(e.value == k)).length > 0)
            {
               //loggergen.log("p",p)

               let tmp = this.subProps(p,div+"sub")
               let vals, grandPa = []

               if(tmp.length == 0) vals = this.format("h4",p /*,"",false,"sub",[],true,grandPa*/).map((e)=>[e," "])
               else vals = tmp

               if(div == "sub")
                  ret.push(<div className='sub hoy'><h4 className="first type">{this.proplink(p,null,vals.length)}{I18n.t("punc.colon")}</h4><div class="subgroup">{vals}</div></div>)
               else if(div == "subsub")
                  ret.push(<div className={'subsub hoyoh'+(tmp.length>0?" full":"")}><h4 className="first prop">{this.proplink(p,null,vals.length)}{I18n.t("punc.colon")}</h4><div class="subsubgroup">{vals}</div></div>)
               else if(div == "subsubsub")
                  ret.push(<div className='subsubsub hoyhoy'><h4 className="first prop">{this.proplink(p,null,vals.length)}{I18n.t("punc.colon")}</h4>{vals}</div>)

               //if(grandPa.length) grandPa[0].push(ret);
            }
         }
      }
      return ret
   }

   getInfo(prop,infoBase,withProp)
   {

      let lang, info = [ getLangLabel(this, prop, infoBase.filter((e)=>(e.type === skos+"prefLabel" || e.type === skos+"altLabel" || e.type === foaf+"name" 
                                                                       || e.fromKey === skos+"prefLabel" || e.fromKey === skos+"altLabel" || e.fromKey === foaf+"name" ) ) ) ]
      
      // TODO does this ever get called ??
      if(!info) info = [ getLangLabel(this, prop, infoBase.filter((e)=>((e["xml:lang"] || e["lang"] || e.fromKey && e.fromKey === foaf+"name")))) ]                        
      if(!info) info = [ getLangLabel(this, prop, infoBase.filter((e)=>((e["xml:lang"] || e["lang"]) && e.type==prop))) ]

      //loggergen.log("info?",prop,infoBase,info)

      //if(info.value) info = info.value

      if(info && info[0]) {
         lang = info[0]["xml:lang"]
         if(!lang) lang = info[0]["lang"]
         info = info[0].value 
      }
      else if(!withProp){
         //info = infoBase.filter((e) => e["xml:lang"]==this.props.prefLang)
         
         info = [ getLangLabel(this, prop, infoBase) ]

         //loggergen.log("info?",info)

         if(info && info[0] && (info[0]["xml:lang"] || info[0]["lang"]) && !info[0].datatype) {
            lang = info[0]["xml:lang"]
            if(!lang) lang = info[0]["lang"]
            info = info[0].value 
         }
         else {
            //info = infoBase.filter((e) => e["xml:lang"]=="bo-x-ewts")
            info = getLangLabel(this, prop, infoBase)

            if(info && info[0]) {
               lang = info[0]["xml:lang"]
               if(!lang) lang = info[0]["lang"]
               info = info[0].value
            }
            else if(infoBase.length) {
               
               lang = infoBase[0]["xml:lang"]
               if(!lang) lang = infoBase[0]["lang"]
               if(lang) info = infoBase[0].value 
               else info = null
               if(infoBase[0].type && (infoBase[0].type == bdo+"volumeNumber" || infoBase[0].fromKey == bdo+"volumeNumber")) info = I18n.t("types.volume_num",{num:infoBase[0].value}) ;
               else if(info && info.match(/purl[.]bdrc/)) info = null
               //loggergen.log("info0",info)
            }
         }
      }
      return {_info:info,_lang:lang}
   }

   setProvLab(elem, prefix, sameAsPrefix) {

      let isExtW,provLab                  
      if(this.props.assocResources && this.props.assocResources[elem.value] && (isExtW = this.props.assocResources[elem.value].filter(e => e.type === tmp+"provider")).length && !isExtW[0].value.match(/LegalData$/)) {

         provLab = this.props.dictionary[isExtW[0].value]
         if(provLab) provLab = provLab[skos+"prefLabel"]
         if(provLab && provLab.length) provLab = provLab[0].value 
         
         //loggergen.log("isExtW",isExtW,this.props.dictionary,provLab)

         if(provLab === "GRETIL") sameAsPrefix += "gretil provider hasIcon "
         else if(provLab === "EAP") sameAsPrefix += "eap provider hasIcon "
         else if(provLab === "IDP") sameAsPrefix += "idp provider hasIcon "
         else if(provLab === "BnF") sameAsPrefix += "bnf provider hasIcon "
         else if(provLab === "Internet Archives") sameAsPrefix += "ia provider hasIcon "
         else if(provLab === "Library of Congress") sameAsPrefix += "loc provider hasIcon "
         else if(provLab === "EFT") sameAsPrefix += "eftr provider hasIcon "
         else if(provLab === "CUDL") sameAsPrefix += "cudl provider hasIcon "
         else if(provLab === "SBB") sameAsPrefix += "sbb provider hasIcon "
         else if(provLab === "LUL") sameAsPrefix += "lul provider hasIcon "
         //else if(provLab === "rKTs") sameAsPrefix += "rkts provider hasIcon "
      }      

      if(prefix !== "bdr" && !provLab) {
         sameAsPrefix += "generic " + prefix + " provider hasIcon "
      }

      return sameAsPrefix
   }

   getProviderID(prov) {
      if(prov && prov.length) prov = prov[0].value
      if(prov && this.props.dictionary) prov = this.props.dictionary[prov]
      if(prov && prov[skos+"prefLabel"]) prov = prov[skos+"prefLabel"]
      else if(prov && prov[rdfs+"label"]) prov = prov[rdfs+"label"]
      if(prov && prov.length) prov = prov.filter(e => e.lang === "en" || !e.lang)
      if(prov && prov.length) prov = prov[0].value
      if(prov) prov = prov.replace(/(^\[ *)|( *\]$)/g,"") // CUDL
      if(prov) prov = prov.replace(/Internet Archives/g,"IA") 
      if(prov) prov = prov.replace(/Staatsbibliothek zu Berlin/g,"SBB")
      if(prov) prov = prov.replace(/Library of Congress/g,"LOC")
      if(prov) prov = prov.replace(/Leiden University Libraries/g,"LUL")      
      return prov
   } 

   uriformat(prop:string,elem:{},dic:{} = this.props.assocResources, withProp?:string,show?:string="show")
   {


      if(elem) {

         if(elem && elem.value && !elem.value.match) {
            console.warn("elem:?:",elem)
            return JSON.stringify(elem);
         }

         //loggergen.log("uriformat",prop,elem.value,elem,dic,withProp,show)
         
         if(!elem.value.match(/^http:\/\/purl\.bdrc\.io/) /* && !hasExtPref */ && ((!dic || !dic[elem.value]) && !prop.match(/[/#]sameAs/))) {
            let link = elem.value

            if(this.props.config && this.props.config.chineseMirror) link = link.replace(new RegExp(cbeta), "http://cbetaonline.cn/")
            
            if(link.indexOf(dila) !== -1) { 
               link = link.replace(/^.*?[/]([^/]+)$/,"$1")
               let dir = dPrefix["dila"][link.replace(/[0-9]+$/,"")]
               if(dir) dir = dir.toLowerCase()
               link = "http://authority.dila.edu.tw/"+dir+"/index.php?fromInner="+link
            }
            let prefix = shortUri(elem.value).split(":")[0]
            if(!providers[prefix]) return <a href={link} target="_blank" class="no-bdrc">{shortUri(decodeURI(elem.value))}<img src="/icons/link-out.svg"/></a>
            else return <Tooltip placement="bottom-end" title={<span>{I18n.t("misc.seeO")} <b>{providers[prefix]}</b></span>}><a href={link} target="_blank" class="no-bdrc">{shortUri(decodeURI(elem.value))}<img src="/icons/link-out.svg"/></a></Tooltip>
         }

         let dico = dic, ret = []

         let info,infoBase,lang ;
         
         if(dico) {
            infoBase = dico[elem.value]
            if(infoBase) infoBase = infoBase.filter(e => [bdo+"volumeNumber",skos+"prefLabel", /*skos+"altLabel",*/ foaf+"name" /*,"literal"*/].reduce( (acc,f) => ((acc || f === e.type || f === e.fromKey) && !e.fromSameAs), false))
         }

         let noLink = false
   
         // we need to know when info is from ontology (#360) 
         // + some properties are found both in query and ontology
         // + special case for copyright/metadata (link is not clickable so we can keep it as is)
         let ib ;
         if(this.props.dictionary) {
            ib = this.props.dictionary[elem.value]            
            if(ib && !elem.value.includes("LD_") && (ib[skos+"prefLabel"] || ib[rdfs+"label"] )) noLink = true
         }   

         if(!infoBase || !infoBase.length)  {
            if(this.props.dictionary) infoBase = this.props.dictionary[elem.value]
            
            //loggergen.log("ib",infoBase,dico)

            if(infoBase &&  infoBase[skos+"prefLabel"]) infoBase = infoBase[skos+"prefLabel"]
            else if(infoBase &&  infoBase[rdfs+"label"]) infoBase = infoBase[rdfs+"label"]

         }

         //loggergen.log("base:", noLink, JSON.stringify(infoBase,null,3))

         if(infoBase) {
            let { _info, _lang } = this.getInfo(prop,infoBase,withProp) 
            info = _info
            lang = _lang

            //loggergen.log("info!",info)

            if(!info) info = shortUri(elem.value)
         }

         // we can return Link
         let pretty = this.fullname(elem.value,true,false,false,false);
         let prefix = "bdr", sameAsPrefix = "";
         for(let p of Object.keys(prefixes)) { 
            if(elem.value.match(new RegExp(prefixes[p]))) { prefix = p; if(!p.match(/^bd[ar]$/) && !this.props.IRI.match(new RegExp("^"+p+":"))) { sameAsPrefix = p + " sameAs hasIcon "; } }
            if(elem.fromSameAs && elem.fromSameAs.match(new RegExp(prefixes[p]))) sameAsPrefix = p + " sameAs hasIcon "
         }
         
         sameAsPrefix = this.setProvLab(elem,prefix,sameAsPrefix)   
         
         //TODO lien legaldata / provider dans l'ontologie

         if(elem && elem.value && elem.value === bda+"LD_EAP_metadata") { prefix = "eap"; sameAsPrefix = "eap hasIcon provider" ; }
         else if(elem && elem.value && elem.value === bda+"LD_IDP_metadata") { prefix = "idp"; sameAsPrefix = "idp hasIcon provider" ; }
         else if(elem && elem.value && elem.value === bda+"LD_NGMPP_Metadata") { prefix = "ngmpp"; sameAsPrefix = "ngmpp hasIcon provider" ; }

         //loggergen.log("s?",prop,prefix,sameAsPrefix,pretty,elem,info,infoBase)         

         let thumb, thumbV, hasThumbV
         if(prop === bdo+"workHasInstance"  || prop === tmp+"propHasScans" || prop === tmp+"propHasEtext" ) {
            if(!info) info = [] 
            let enti = getEntiType(elem.value)
            let sUri = shortUri(elem.value)

            let prov = this.getResourceElem(tmp+"provider", sUri, this.props.assocResources)
            prov = this.getProviderID(prov);
            if(prov && prov !== "BDRC") { 
               prov = prov.toLowerCase()
               prov = <Link to={"/show/"+sUri}><Tooltip placement="top" title={<span>{I18n.t("prop.tmp:provider")}{I18n.t("punc.colon")} <b>{providers[prov]}</b></span>}><div class={"inst-prov "+(prov)}><img src={provImg[prov]} /></div></Tooltip></Link>
            }
            else prov = null

            //loggergen.log("enti:",prov,enti,elem.value)

            if(enti === "Etext") {
               //ret = [<span class="svg">{svgEtextS}</span>]
               
               ret = [  <Link to={"/show/"+sUri} class={"images-thumb no-thumb"} style={{"background-image":"url(/icons/etext.png)"}}></Link> ]
               if(prov) ret.push(prov)
            
            }
            else if(enti === "Instance") { 
               //ret = [<span class="svg">{svgInstanceS}</span>]
               
               
               thumbV =  this.getResourceElem(tmp+"thumbnailIIIFService", sUri, this.props.assocResources)
               if(!thumbV || !thumbV.length)  ret = [  <Link to={"/show/"+sUri} class={"images-thumb no-thumb"} style={{"background-image":"url(/icons/header/instance.svg)"}}></Link> ]
               else ret = [  <Link to={"/show/"+sUri} class={"images-thumb"} style={{"background-image":"url("+ thumbV[0].value+"/full/,145/0/default.jpg)"}}></Link> ]
            
               let inRoot =  this.getResourceElem(bdo+"inRootInstance", sUri, this.props.assocResources)
               if(inRoot && inRoot.length && info && lang && lang === "bo-x-ewts" && info.match(/^([^ ]+ ){11}/)) info = [ info.replace(/^(([^ ]+ ){10}).*?$/,"$1"), <span class="ellip">{info.replace(/^([^ ]+ ){10}[^ ]+(.*?)$/,"$2")}</span> ]

               if(prov) ret.push(prov)

               //loggergen.log("thumbV:",thumbV,elem.value)

               thumbV = null
            }
            else if(enti === "Images") { 
               ret = []
               thumb =  this.getResourceElem(tmp+"thumbnailIIIFService", sUri, this.props.assocResources)
               if(thumb && !thumb.length) thumb = null

               /* // deprecated (thumbnail is a property of instance)
               if(!this.props.resources || !this.props.resources[shortUri(elem.value)]) this.props.onGetResource(shortUri(elem.value));
               else {
                  let thumb =  this.props.resources[elem.value]
                  if(thumb)   {
                     loggergen.log("thumb?",elem,thumb)
                  }
               }
               */
               ret.push(<span class="svg">{svgImageS}</span>)
            }
         }
         
         if(elem.inOutline || ((!thumbV || !thumbV.length) && ((info && infoBase && infoBase.filter(e=>e["xml:lang"]||e["lang"]).length >= 0) || (prop && prop.match && prop.match(/[/#]sameAs/))))) {


            //loggergen.log("svg?",svgImageS)


            let link,orec,canUrl;
            if(this.props.assocResources && this.props.assocResources[elem.value]) {
               orec = this.props.assocResources[elem.value].filter(r => r.type === adm+"originalRecord" || r.fromKey === adm+"originalRecord")
               canUrl = this.props.assocResources[elem.value].filter(r => r.type === adm+"canonicalHtml" ||  r.fromKey === adm+"canonicalHtml")
               //loggergen.log("orec",prop,sameAsPrefix,orec,canUrl, this.props.assocResources[elem.value])
            }
            if(prefix !== "bdr" && (!canUrl || !canUrl.length)) canUrl = [ { value : elem.value } ]

            let srcProv = sameAsPrefix.replace(/^.*?([^ ]+) provider .*$/,"$1").toLowerCase()
            let srcSame = sameAsPrefix.replace(/^.*?([^ ]+) sameAs .*$/,"$1").toLowerCase()
            
            //loggergen.log("src:",src,srcProv,srcSame)
            
            //if(src.match(/bdr/)) src = "bdr"

            let bdrcData 
            bdrcData = <Link className={"hoverlink"} to={"/"+show+"/"+prefix+":"+pretty}></Link>

            let sameBDRC ;
            if(infoBase && infoBase.length) sameBDRC = infoBase.filter(e => e.type === tmp+"withSameAs" && e.value.indexOf("bdrc.io") !== -1)            
            if(sameBDRC && sameBDRC.length && sameBDRC[0].value) sameBDRC = sameBDRC[0].value
            else sameBDRC = null

            //loggergen.log("sameBDRC",sameBDRC)

            if(!elem.value.match(/[.]bdrc[.]/)) { 
               if(orec && orec.length) link = <a class="urilink prefLabel no-bdrc" href={orec[0].value} target="_blank">{info}<Tooltip placement="bottom-end" title={<span>See on <b>{providers[prefix]}</b></span>}><img src="/icons/link-out.svg"/></Tooltip></a>
               else if(sameBDRC) {
                  if(!info) info = shortUri(elem.value)
                  link = <a class="urilink prefLabel" href={"/show/"+shortUri(sameBDRC)} target="_blank">{info}</a>
               }
               else if(canUrl && canUrl.length) { 
                  if(!info) info = shortUri(elem.value)                  
                  link = <a class="urilink prefLabel no-bdrc" href={canUrl[0].value} target="_blank">{info}<Tooltip placement="bottom-end" title={<span>See on <b>{providers[prefix]}</b></span>}><img src="/icons/link-out.svg"/></Tooltip></a>
                  if(srcProv.indexOf(" ") !== -1) srcProv = srcSame
               }
               else {
                  if(!info) info = shortUri(elem.value)
                  link = <a class="urilink prefLabel no-bdrc" href={elem.value} target="_blank">{info}<Tooltip placement="bottom-end" title={<span>See on <b>{providers[prefix]}</b></span>}><img src="/icons/link-out.svg"/></Tooltip></a>
               } 
            }
            else {                
               let uri = shortUri(elem.value)
               if(!info) info = uri

               /* // deprecated
               let pI 
               if(dic && dic[elem.value]) pI = dic[elem.value] 
               //loggergen.log("pretty?",pretty,elem.value,infoBase,pI)
               if(uri.match(/^bdr:MW[^_]+_[^_]+$/) || pI && pI[bdo+"partIndex"] && pI[bdo+"partIndex"].length || pI && pI.filter && pI.filter(i => i.type === bdo+"partIndex").length) { 
               */

               if(elem.inOutline) {
                  
                  //if(pI) uri = this.props.IRI+"?part="+uri
                  //else uri = uri.replace(/^((bdr:MW[^_]+)_[^_]+)/,"$2?part=$1")


                  if(info === uri) {                      
                     if(elem.volume) {
                        infoBase = dico[elem.volume]
                        //console.log("iB:",infoBase)
                        if(infoBase) infoBase = infoBase.filter(e => [bdo+"volumeNumber",skos+"prefLabel", /*skos+"altLabel",*/ foaf+"name" /*,"literal"*/].reduce( (acc,f) => ((acc || f === e.type || f === e.fromKey) && !e.fromSameAs), false))
                        let { _info, _lang } = this.getInfo(prop,infoBase,withProp) 
                        if(_info) {
                           info = _info
                           lang = _lang
                        }
                     }
                     if(!info || info === uri) info = I18n.t("resource.noT")
                  }


                  link = <a class={"urilink prefLabel " } href={elem.url} onClick={(e) => { 

                     if(!elem.debug) {

                        if(elem.toggle) {
                           elem.toggle()

                           e.preventDefault();
                           e.stopPropagation();
                           return false;
                        }

                     }
                     else {
                        // "debug mode" if elem.url not set

                        let part = elem.url.replace(/.*\?part=/,"")
                        let root = elem.url.replace(/\?part=.*/,"")

                        loggergen.log("furi?",root,part)

                        let collapse = { ...this.state.collapse }
                        if(this.props.outlineKW) collapse[elem.inOutline] = (collapse[elem.inOutline] === undefined ? false : !collapse[elem.inOutline])
                        else collapse[elem.inOutline] = !collapse[elem.inOutline]
                        this.setState({ collapse }) // ,outlineKW:"" })
                        
                        let loca = {...this.props.history.location}

                        loca.search = loca.search.replace(/((&part|part)=[^&]+)/,"") //|(&*osearch=[^&]+))/g,"")  ;
                        loca.search += "&part="+part
                        loca.search = loca.search.replace(/[?]&/,"?")
                        
                        loca.pathname = root
                        this.props.history.push(loca)

                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                     }
                                                
                  } }>{info}</a>
               }
               else link = <Link className={"urilink prefLabel " } to={"/"+show+"/"+uri}>{info}</Link>

               if(noLink) link = info

               bdrcData = null
            }
            
            let befo = [],src
            if(providers[src = srcProv] && (!prop || !prop.match(/[/#]sameAs/))) { // || ( src !== "bdr" && providers[src = srcSame])) { 
               befo.push( 

                  [ //<span class="meta-before"></span>,
                  <Tooltip placement="bottom-start" title={
                     <div class={"uriTooltip "}>
                        <span class="title">External resource from:</span>
                        <span class={"logo "+src}></span>
                        <span class="text">{providers[src]}</span>
                     </div>}>
                        <span><span class="before">{link}</span></span>
                  </Tooltip> ]
               )

               bdrcData =  <Tooltip placement="top-end" title={<div class={"uriTooltip "}>View this resource on BUDA</div>}><span class="hover-anchor">{bdrcData}</span></Tooltip>
            }            
            else if(providers[src = srcSame] && !prop.match(/[/#]sameAs/)) { 

               let locaLink = link,srcPrefix,srcUri,srcList = []

               if(elem.fromSameAs) srcList = [ elem.fromSameAs ]
               if(elem.allSameAs)  srcList = elem.allSameAs 
               
               //loggergen.log("srcL",srcList)

               let uriPrefix 
               for(let p of Object.keys(prefixes)) if(this.props.keyword && this.props.keyword.match(new RegExp("^"+p))) { uriPrefix = p ; break ; }

               let srcPrefixList = []
               for(srcUri of srcList) {
                  
                  srcPrefix = src
                  for(let p of Object.keys(prefixes)) if(srcUri.match(new RegExp(prefixes[p]))) { srcPrefix = p ; break ; }
                  
                  //loggergen.log("srcP",srcPrefix,srcUri)

                  if(srcPrefix !== "bdr") locaLink = <a class="urilink" href={getRealUrl(this,srcUri)} target="_blank"></a>
                  else locaLink = <Link to={"/"+show+"/"+shortUri(srcUri)}></Link>


                  //bdrcData = <Link className="hoverlink" to={"/"+show+"/"+shortUri(srcUri)}></Link>
                  
                  if(!srcPrefixList.includes(srcPrefix)) befo.push(

                     [ //<span class="meta-before"></span>,
                        <Tooltip placement="bottom-start" title={
                        <div class={"uriTooltip "}>
                        { srcPrefix !== "bdr" && 
                           [
                              <span class="title">Data loaded from:</span>,
                              <span class={"logo "+srcPrefix}></span>,
                              <span class="text">{providers[srcPrefix]}</span> 
                           ]  }
                        { srcPrefix === "bdr" && <span>Data loaded from BDRC resource</span> }
                     </div>}>
                           <span class={srcPrefix+" sameAs hasIcon"}><span class="before">{}</span></span>
                        </Tooltip> 
                     ]
                  )

                  if(srcPrefix) srcPrefixList.push(srcPrefix);

               }

               if(srcPrefixList.indexOf("bdr") === -1) bdrcData =  <Tooltip placement="top-end" title={<div class={"uriTooltip "}>View this resource on BUDA</div>}><span class="hover-anchor">{bdrcData}</span></Tooltip>
               else bdrcData = null
            }
            else if(sameAsPrefix.indexOf("sameAs") !== -1) {
               //link = [ <span class="before"></span>,link ] 

               befo.push(  [ //<span class="meta-before"></span>,
                     <Tooltip placement="bottom-start" title={
                     <div class={"uriTooltip "}>
                     { src !== "bdr" && 
                        [
                           <span class="title">Same resource from:</span>,
                           <span class={"logo "+src}></span>,
                           <span class="text">{providers[src]}</span> 
                        ]  }
                     { src === "bdr" && <span>Same resource from BDRC</span> }
                  </div>}>
                        <span class={(sameAsPrefix?sameAsPrefix:'')}><span class="before">{link}</span></span>
                     </Tooltip> 
                  ])

               bdrcData =  <Tooltip placement="top-end" title={<div class={"uriTooltip "}>View this resource on BUDA</div>}><span class="hover-anchor">{bdrcData}</span></Tooltip>
            }
            else {
               bdrcData = null
            }
            
            ret.push([<span class={"ulink " + (sameAsPrefix?sameAsPrefix:'')  }>{befo}{link}</span>,lang?<Tooltip placement="bottom-end" title={
               <div style={{margin:"10px"}}>
                  {I18n.t(languages[lang]?languages[lang].replace(/search/,"tip"):lang)}
               </div>
            }><span className="lang">{lang}</span></Tooltip>:null,bdrcData])
         }
         else if(pretty.toString().match(/^V[0-9A-Z]+_I[0-9A-Z]+$/)) { ret.push(<span>
            <Link className={"urilink "+prefix} to={"/"+show+"/"+prefix+":"+pretty}>{pretty}</Link>&nbsp;
            {/* <Link className="goBack" target="_blank" to={"/gallery?manifest=//iiifpres.bdrc.io/v:bdr:"+pretty+"/manifest"}>{"(view image gallery)"}</Link> */}
         </span> ) }
         else if(pretty.toString().match(/^([A-Z]+[v_0-9-]*[A-Z]*)+$/)){ 

            if(!thumb && !thumbV) ret = (<Link className={"urilink "+ prefix} to={"/"+show+"/"+prefix+":"+pretty}><span lang="">{ret}{prefix+":"+pretty}</span></Link>)
            else if(thumb && thumb.length) {
               let vlink = "/"+show+"/"+prefix+":"+pretty+"?s="+encodeURIComponent(this.props.history.location.pathname+this.props.history.location.search)+"#open-viewer"                
               thumb = <div class="images-thumb" style={{"background-image":"url("+thumb[0].value+"/full/,145/0/default.jpg)"}}/>;               

               ret = [<Link className={"urilink "+ prefix} to={vlink}>{thumb}</Link>,
                     <div class="images-thumb-links">
                        <Link className={"urilink "+ prefix} to={vlink}>{I18n.t("index.openViewer")}</Link>
                        <Link className={"urilink "+ prefix} to={"/"+show+"/"+prefix+":"+pretty}>{I18n.t("resource.openR")}</Link>
                     </div>]
            } else if(thumbV && thumbV.length) {
               let repro = this.getResourceElem(bdo+"instanceHasReproduction", shortUri(elem.value), this.props.assocResources)
               if(repro && repro.length) repro = shortUri(repro[0].value)
               let img = thumbV[0].value, hasT = true
               if(img.startsWith("http")) img += "/full/,145/0/default.jpg"
               else hasT = false
               let vlink = "/"+show+"/"+repro+"?s="+encodeURIComponent(this.props.history.location.pathname+this.props.history.location.search)+"#open-viewer"                
               thumbV = <div class={"images-thumb"+(!hasT?" no-thumb":"")} style={{"background-image":"url("+img+")"}}/>;               

               ret = [<Link className={"urilink "+ prefix} to={hasT?vlink:"/"+show+"/"+prefix+":"+pretty}>{thumbV}</Link>,
                     <div class="images-thumb-links">
                        <Link className={"urilink "+ prefix + (!hasT?" disable":"")} to={vlink}>{I18n.t("index.openViewer")}</Link>
                        <Link className={"urilink "+ prefix} to={"/"+show+"/"+prefix+":"+pretty}>{I18n.t("resource.openR")}</Link>
                     </div>]
            }
         } 
         else ret.push(pretty)

         return ret


      }
   }

   tooltip(lang:string)
   {
      //loggergen.log("transL/",lang,languages[lang],languages)
      return lang?<Tooltip placement="bottom-end" title={
         <div style={{margin:"10px"}}>
            {I18n.t(languages[lang]?languages[lang].replace(/search/,"tip"):lang)}
         </div>
      }><span className="lang">{lang}</span></Tooltip>:null
   }

   getResourceElem(prop:string, IRI?:string, useAssoc?:{}, auxId?:string)
   {
      let elem ;

      if(!IRI) { 
         IRI = this.props.IRI
             
         let longIRI = fullUri(IRI)

         if(!IRI || !this.props.resources || !this.props.resources[IRI]
            || !this.props.resources[IRI][longIRI]
            || !this.props.resources[IRI][longIRI][prop]) 
               return ;

         if(this._properties) elem = this._properties[prop]

         if(!elem && this.props.resources && this.props.resources[IRI] && this.props.resources[IRI][longIRI]) 
            elem = this.props.resources[IRI][longIRI][prop]
      }
      else if(useAssoc) {

         if(auxId && useAssoc) {
            elem = useAssoc[IRI]
            if(elem) elem = elem[auxId]       
            if(elem) elem = elem[prop]
         }
         else if(useAssoc) { 

            let longIRI = fullUri(IRI)

            elem = useAssoc[longIRI]
            if(elem) elem = elem.filter(e => e.type === prop || e.fromKey === prop)
            else elem = null
         }

      }

      //loggergen.log("gR",prop,IRI,elem)

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

   getSameLink(e,sameAsPrefix,useLink = false) {
            
      let befo = [], bdrcData = null

      if(e.fromSameAs ) { 
         //loggergen.log("e.f",e.fromSameAs)

         bdrcData = <Link className="hoverlink" to={"/show/"+shortUri(e.fromSameAs)}></Link>               
         let src ;
         if(sameAsPrefix) src = sameAsPrefix.replace(/^([^ ]+) .*$/,"$1") 
         let link = <a href="urilink" target="_blank" href={getRealUrl(this,e.fromSameAs)}></a>
         if(src === "bdr") link =  <Link className="urilink" to={"/show/"+shortUri(e.fromSameAs)}></Link>               

         befo = 

            [ //<span class="meta-before"></span>,
               <Tooltip placement="bottom-start" title={
               <div class={"uriTooltip "}>
               { src !== "bdr" && 
                  [
                     <span class="title">Data loaded from:</span>,
                     <span class={"logo "+src}></span>,
                     <span class="text">{providers[src]}</span> 
                  ]  }
               { src === "bdr" && <span>Data loaded from BDRC resource</span> }
            </div>}>
                  <span class={(sameAsPrefix?sameAsPrefix:'')}><span class="before">{useLink?link:null}</span></span>
               </Tooltip> 
            ]
         

         //if(e.fromSameAs.indexOf(bdr) === -1) bdrcData =  <Tooltip placement="top-end" title={<div class={"uriTooltip "}>View BDRC data for original source of this property</div>}><span class="hover-anchor">{bdrcData}</span></Tooltip>
         //else 
         bdrcData = null
      }
      return { befo,bdrcData }
   }


   toggleHoverM(ID,noSame,wTip,dontClose) { 
      return (ev) => { 
         let elem = $(ev.target).closest(".propCollapseHeader,.propCollapse,[data-prop='bdo:workHasInstance']")
         let popperFix 
         if(elem.length > 0) {
            let i = $(ev.target).closest("h4").index() 
            let n = elem.find("h4").parent().children().length
            let x = elem.find(".expand")
            let p = elem.closest(".ext-props")
            let h = elem.closest("[data-prop='bdo:workHasInstance']")
            
            //console.log("i/n",i,n)
            
            if(/*!p.length &&*/ (elem.hasClass("propCollapse") || x.length || h.length) && (i < Math.floor(n/2) || (n%2 == 1 && i == Math.floor(n/2)) || i === 0 && n === 1)) popperFix = true
         }
         let target = $(ev.currentTarget).closest("h4")
         if(target.length) target = target.find(".hover-menu")[0]  
         else {
            target = $(ev.currentTarget).closest(".sub")
            if(target.length) target = target.find(".hover-menu")[0]
            else target = ev.currentTarget

            //console.log("tg:",target)
         }
         if(!dontClose || !this.state.collapse["hover"+ID]) if(!noSame || ev.target === ev.currentTarget) this.setState({...this.state,collapse:{...this.state.collapse,["hover"+ID]:!this.state.collapse["hover"+ID],popperFix}, anchorEl:{...this.state.anchorEl,["hover"+ID]:target} } ) 
         if(wTip !== undefined) (this.toggleHoverMtooltip(ID,wTip))(ev)
      }
   }

   toggleHoverMtooltip(ID,val) { 
      let that = this
      return (ev) => {          
         let prop = ID.replace(/^ID-([^-]+)-.*$/,"$1"), elem

         if(that.state.collapse[prop]) elem = $(".propCollapse [data-id=\""+ID.replace(/["]/g,"")+"\"]")
         else elem = $("[data-id=\""+ID.replace(/["]/g,"")+"\"]")
         
         //console.log("ID:",prop,ID,val,elem)

         if(elem.length) for(let e of elem) {
            if(val && (!that._mouseover[ID] || that._mouseover[ID] < 20)) {  // must be triggered twice ...              
               if(!that._mouseover[ID]) that._mouseover[ID] = 0
               that._mouseover[ID] ++
               const event = new MouseEvent('mouseover', {
                  view: window,
                  bubbles: true,
                  cancelable: true
               })
               e.dispatchEvent(event)
            }
            else if(!val && that._mouseover[ID] > 0) {                
               that._mouseover[ID] --
               if(!that._mouseover[ID]) delete that._mouseover[ID] 
               const event = new MouseEvent('mouseout', {
                  view: window,
                  bubbles: true,
                  cancelable: true
               })
               e.dispatchEvent(event)
            }
         }
      }
   }
   hoverMenu(prop,e,current,parent,grandPa)
   {
      let ID = "ID-"+prop+"-"+(e&&e.value?e.value:e)
      
      //loggergen.log("hover?",e,ID,prop)

      if(!e) return;

      if(e.noteData && e.noteData[bdo+"noteText"]) e = e.noteData[bdo+"noteText"]

      let hasTT = e && e.allSameAs && e.allSameAs.length

      let info = [], nb = 0;
      if(hasTT) 
         info = e.allSameAs.map(f => { 
            let pref = shortUri(f).split(":")[0]
            let logo = provImg[pref]
            let prov = providers[pref]
            if(!this.props.IRI.startsWith(pref+":") && pref !== "bdr") nb ++
            return (<span>{I18n.t("popover.source")}{I18n.t("punc.colon")} <img src={logo}/><b>{prov}</b></span>) 
         } ).filter(e => e)



      let fromSame = (e.allSameAs && e.allSameAs.length > 0)

      let lang, data, other = [], era, comment, ontolink ;
      if(e.type === "literal") { 
         lang = e.lang
         if(!lang) lang = e["xml:lang"]
         if(!lang) lang = e["@language"]
      }
      else if(e.type === "uri") {
         if(this.props.assocResources) data = this.props.assocResources[e.value]
         if(!data && this.props.dictionary && this.props.dictionary[e.value]) data = Object.keys(this.props.dictionary[e.value]).filter(k => [skos+"prefLabel",skos+"altLabel",rdfs+"label"].includes(k)).reduce( (acc,k)=>([...acc,...this.props.dictionary[e.value][k].map(d => ({...d,fromKey:k})) ]),[])
         if(data && data.length) data = getLangLabel(this,prop,data.filter(d => [skos+"prefLabel",skos+"altLabel",rdfs+"label"].includes(d.type) || [skos+"prefLabel",skos+"altLabel",rdfs+"label"].includes(d.fromKey)),false,false,other)
        // console.log("other:",other,data)
         if(data) {
            lang = data.lang
            if(!lang) lang = data["xml:lang"]
            if(!lang) lang = data["@language"]
         }
         else {
            if(this.props.assocResources) data = this.props.assocResources[e.value]
            if(data && data.filter(d => d.fromKey === bdo+"yearInEra")) era = data.filter(d => d.fromKey === bdo+"era")
         }
         if(this.props.dictionary[e.value]) {
            comment = this.props.dictionary[e.value]
            if(comment) {
               if(comment[rdfs+"comment"])  comment = getLangLabel(this,prop,comment[rdfs+"comment"],false,false,other)
               else comment = undefined            
            }
            ontolink = shortUri(e.value)

            //console.log("comm:",comment)
         }
      }

      //loggergen.log("data",lang,data,other)                  

      let loca = { ...this.props.history.location }
      if(e.start !== undefined) { 
         loca.search = loca.search.replace(/(^[?])|(&*startChar=[^&]+)/g,"")
         loca.search = "?startChar="+e.start+(loca.search?"&"+loca.search:"")
      }

      return (
         <div class="hover-menu">
            { /*
            <img src="/icons/info.svg" onMouseEnter={(e) => { 
               this.setState({...this.state,collapse:{...this.state.collapse,["hover"+ID]:!this.state.collapse["hover"+ID]}, anchorEl:{...this.state.anchorEl,["hover"+ID]:e.currentTarget} } ) 
            } } />
            */}

            { hasTT && <Tooltip placement="top-end" title={<span class="over" onMouseEnter={this.toggleHoverMtooltip(ID,false)}>{info}</span>} >
               <div style={{display:"inline-block" /*,pointerEvents:"none"*/ }} data-id={ID}>
                  <span id="anchor" onClick={this.toggleHoverM(ID)}>
                     <img src="/icons/info.svg"/>
                     {nb>0 && <span id="nb">{nb}</span> }
                  </span>
               </div>
            </Tooltip> }

            {! hasTT && 
               <div /*style={{pointerEvents:"none"}}*/ >
                  <span id="anchor">
                     { (e.start !== undefined) && <Link to={loca.pathname+loca.search+"#open-viewer"}><img style={{width:"16px"}} src="/icons/PLINK_small.svg"/></Link> }
                     <img src="/icons/info.svg" onClick={this.toggleHoverM(ID)} />
                  </span> 
               </div>
            }
            <Popper
               data-ID={ID}
               id="popHoverM"
               className={this.state.collapse.popperFix?"fixW":""}
               data-class={(e.start !== undefined?"in-etext":"")}
               marginThreshold={0}
               open={this.state.collapse["hover"+ID]}
               //anchorOrigin={{horizontal:"right",vertical:"top"}}
               //transformOrigin={{horizontal:"right",vertical:"top"}}
               placement={"bottom-end"}
               anchorEl={this.state.anchorEl["hover"+ID]}
               //onClose={() => this.setState({...this.state,collapse:{...this.state.collapse,["hover"+ID]:false} } ) }
               TransitionComponent={Fade}
               modifiers={{
                  flip: {
                     enabled: false
                  },
                  preventOverflow: {
                     enabled: true,
                     boundariesElement: "scrollParent",
                     escapeWithReference:true
                  }
               }}
               >
               { prop && 
                  <ClickAwayListener onClickAway={(ev) => {
                     //console.log("clickA",ID,ev,ev.target,ev.currentTarget)                     
                     if(!$(ev.target).closest(".popper").length) this.setState({collapse:{...this.state.collapse, ["hover"+ID]:false}})
                  }}>
               <div class="popper">                     
                  <div class={"resource"}>
                     <div class="data">
                        <span id="anchor" onClick={this.toggleHoverM(ID,null,false)}>     
                           <Close/>                    
                           {/* <img src="/icons/info.svg"/> */}
                        </span>
                        <div data-prop={shortUri(prop)}>
                           {!parent && [
                              <h3>{this.proplink(prop)}{I18n.t("punc.colon")}</h3>,
                              <div class="group"><h4>{current}</h4></div>
                           ]}
                           { grandPa && <h3>{this.proplink(grandPa)}{I18n.t("punc.colon")}</h3>}
                           { parent && <div class="sub">
                              {parent}
                              <div class="subgroup">
                                 <h4 class="first">{this.proplink(prop)}{I18n.t("punc.colon")}</h4>
                                 <div class="subsub"><h4>{current}</h4></div>
                              </div>
                           </div>}
                           <Tabs defaultIndex={fromSame?1:0}>
                              <TabList>
                                 <Tab>{I18n.t("popover.moreInfo")}</Tab>
                                 <Tab {... !fromSame?{disabled:"disabled"}:{}}>{I18n.t("popover.source",{count:(fromSame &&e.allSameAs.length?e.allSameAs.length:1)})} {fromSame && <b>&nbsp;({e.allSameAs.length})</b>}</Tab>
                                 <Tab disabled>{I18n.t("popover.notes")}</Tab>
                                 <Tab disabled>{I18n.t("popover.discussion")}</Tab>
                              </TabList>

                              <TabPanel>
                              { lang && <div><span class='first'>{I18n.t("popover.lang")}</span><span>{I18n.t("punc.colon")}&nbsp;</span><span>{I18n.t(languages[lang]?languages[lang].replace(/search/,"tip"):lang)}</span></div> }
                              { (other.length > 0) && <div><span class='first'>{I18n.t("popover.otherLang",{count:other.length})}</span><span>{I18n.t("punc.colon")}&nbsp;</span><div>{other.map(o => <span class="label">{o.value}{this.tooltip(o.lang)}</span>)}</div></div> }
                              { (e.datatype && e.datatype.endsWith("#gYear")) && <div><span class='first'>{I18n.t("popover.calendar")}</span><span>{I18n.t("punc.colon")}&nbsp;</span><span>{I18n.t("popover.gregorian")}</span></div>}
                              { (era && era.length > 0) &&  <div><span class='first'>{this.proplink(bdo+"yearInEra")}</span><span>{I18n.t("punc.colon")}&nbsp;</span><span>{this.proplink(era[0].value)}</span></div>  }
                              { (e.start !== undefined) &&  <div><span class='first'>{this.proplink(bdo+"startChar")}</span><span>{I18n.t("punc.colon")}&nbsp;</span><span>{e.start}</span></div>  }
                              { (e.end !== undefined) &&  <div><span class='first'>{this.proplink(bdo+"endChar")}</span><span>{I18n.t("punc.colon")}&nbsp;</span><span>{e.end}</span></div>  }
                              { (comment !== undefined) &&  <div><span class='first'>{this.proplink(rdfs+"comment")}</span><span>{I18n.t("punc.colon")}&nbsp;</span><span>{comment.value}</span></div>  }
                              { (ontolink !== undefined) &&  <div><span class='first'>{I18n.t("prop.tmp:ontologyProperty")}</span><span>{I18n.t("punc.colon")}&nbsp;</span><Link class="ontolink" to={"/show/"+ontolink}>{ontolink}</Link></div>  }
                              </TabPanel>
                              <TabPanel selected>
                              {fromSame && e.allSameAs.map(f => { 
                                 let a = shortUri(f)
                                 let pref = a.split(":")[0]
                                 let logo = provImg[pref]
                                 let prov = providers[pref]
                                 let link = f
                                 let asso,tab ;
                                 if(this.props.assocResources) asso = this.props.assocResources[f]                  
                                 if(asso && (tab=asso.filter(t => t.fromKey === adm+"canonicalHtml")).length) link = tab[0].value  
                                 return (<div><a class="urilink" href={link} target="_blank">{a}{pref!=="bdr"&&<img src="/icons/link-out.svg"/>}</a><span>{I18n.t("misc.from")}</span><img src={logo}/><b>{prov}</b></div>)
                              })}
                              </TabPanel>
                              <TabPanel>
                              </TabPanel>
                              <TabPanel>
                              </TabPanel>
                           </Tabs>
                        </div>
                     </div>
                  </div>
               </div>
               </ClickAwayListener >
            }
            </Popper>
            
         </div>

      )
   }

   format(Tag,prop:string,txt:string="",bnode:boolean=false,div:string="sub",otherElem:[],grandPa)
   {
      //console.group("FORMAT")

      let inCollapse = false

      let elemN,elem;
      if(bnode) {

         elem = [{ "type":"bnode","value":prop}] //[ this.getResourceBNode(prop) ]

         //div = div +"sub"

         //loggergen.log("?bnode",elem)

         //return this.format(Tag,prop,txt,false,div)

         //elem = Object.values(elem)
         //for(let i of Object.keys(elemN)) { if(!i === rdf+"type") { elem.push(elemN[i]); } }

         //elem = [].concat.apply([],elem);

      }
      else if(otherElem) {
         elem = otherElem
      }
      else {
         elem = this.getResourceElem(prop)

         //loggergen.log("?normal",elem)
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

      //loggergen.log("format",Tag, prop,JSON.stringify(elem,null,3),txt,bnode,div);

      let ret = [],pre = []
      let note = []

      if(elem && !Array.isArray(elem)) elem = [ elem ]

      //loggergen.log("elem", elem)

      let nbN = 1, T, lastT


      let viewAnno = false, iKeep = -1, _elem = elem ;
      if(elem) for(const _e of elem) 
      {
         iKeep++   
         let e = { ..._e } ;


         if(prop === bdo+"workHasInstance" && e.value && e.value.match(new RegExp(bdr+"W"))) continue ;

         //loggergen.log("iK",iKeep,e,elem,elem.length)

         let value = ""+e
         if(e.value || e.value === "") value = e.value
         else if(e["@value"]) value = e["@value"]
         else if(e["@id"]) value = e["@id"]
         let pretty = this.fullname(value,null,prop === bdo+"eTextHasChunk") // || prop === bdo+"eTextHasPage")

         if(value === bdr+"LanguageTaxonomy") continue ;

         //loggergen.log("e",e,pretty,value)

         //if(this.props.assocResources && this.props.assocResources[value] && this.props.assocResources[value][0] && this.props.assocResources[value][0].fromKey && !prop.match(/[/#]sameAs/) ) 
         if(this.props.resources && this.props.resources[this.props.IRI] && this.props.resources[this.props.IRI][value] && !prop.match(/[/#]sameAs/) ) 
         { 
            e.type = "bnode" 

            //loggergen.log("aRes",this.props.assocResources[value])
         }


         if(e.type != "bnode")
         {

            let tmp
            if(e.type == "uri" || (e.type === 'literal' && (e.datatype === xsd+'anyURI' || e.datatype === xsd+'AnyURI')) || e.type === 'xsd:anyURI'|| e.type === 'xsd:anyUri' ) { 
               tmp = this.uriformat(prop,e)
            }
            else {
               let lang = e["lang"]
               if(!lang) lang = e["xml:lang"]
               tmp = [pretty]

               if(lang) {

                  let tLab = getLangLabel(this,prop,[e])
                  let lang = tLab["lang"]
                  if(!lang) lang = tLab["xml:lang"]
                  let tVal = tLab["value"]
                  if(!tVal) tVal = tLab["@value"]

                  if(tLab.start !== undefined) tmp = [ <span class="startChar">
                     <span>[&nbsp;
                        <Link to={"/show/"+this.props.IRI+"?startChar="+tLab.start+(this.props.highlight?'&keyword="'+this.props.highlight.key+'"@'+this.props.highlight.lang:"")+"#open-viewer"}>@{tLab.start}</Link>
                     </span>&nbsp;]</span>,<br/> ]
                  else tmp = []
                  
                  if(tmp.length || tVal.match(/[↦↤]/)) tmp.push(highlight(tVal,null,null,false /*true*/))
                  else tmp.push(this.fullname(tVal))

                  if(lang) {
                     let size = this.state.etextSize
                     tmp = [ <span lang={lang} {...this.state.etextSize?{style:{ fontSize:size+"em", lineHeight:(Math.max(1.0, size + 0.75))+"em" }}:{}}>{tmp}</span> ]
                  }

                  if(tLab.start === undefined) tmp.push(<Tooltip placement="bottom-end" title={
                        <div style={{margin:"10px"}}>
                           {I18n.t(languages[lang]?languages[lang].replace(/search/,"tip"):lang)}
                        </div>
                     }><span className="lang">{lang}</span></Tooltip>);

               }
            }

            let tmpAnno ;
            if(e.hasAnno && e.collapseId && Array.isArray(tmp)) {
               let node = e
               let col = "score1";
               if(e.score && Number(e.score) < 0) col = "score0"

               loggergen.log("hasAnno",e,this.state.showAnno);

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
                        {this.proplink(e.predicate)}{I18n.t("punc.colon")} {this.uriformat(e.predicate,e)}<hr/>
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

            if(this.props.assocResources && (prop == bdo+"workHasInstance" || prop == _tmp+"siblingInstances") ) {

               let root = this.props.assocResources[e.value] //this.uriformat(_tmp+"inRootInstance",e)
               if(root) root = root.filter(e => e.type == bdo+"inRootInstance")
               if(root && root.length > 0) tmp = [<span style={{marginRight:"-30px",display:"inline"}}>{tmp}<span class="over-in"><span class="in">in</span>{this.uriformat(bdo+"inRootInstance",root[0])}</span></span>]

               //loggergen.log("root",root)
            }
            /*
            else if(this.props.assocResources && prop.match(/[/]workhasTranslation[^/]*$/))  {

               let script = this.props.assocResources[e.value] 
               if(script) script = script.filter(e => e.type == bdo+"workLangScript")
               if(script && script.length > 0) { 
                  let lang = getOntoLabel(this.props.dictionary,this.props.locale,script[0].value)
                  
                  //if(lang && script && script.length) tmp = [tmp,"(in ",<Link to={"/show/"+shortUri(script[0].value)}>{lang}</Link>,")"]
                  if(lang && script && script.length) tmp = [tmp,<span className="" style={{fontSize:"12px",color:"#333"}}> / {lang}</span>]
               }
            }
            */

            if(this.props.assocResources && this.props.assocResources[e.value]
               && this.props.assocResources[e.value].filter(f => f.type == bdo+"originalRecord").length > 0)
            {

               let elem = this.props.assocResources[e.value] //this.uriformat(_tmp+"workRootWork",e)

               if(elem) {
                  let ori = elem.filter(e => e.type == bdo+"originalRecord")
                  let lab = elem.filter(e => e.type == bdo+"contentProvider")

                  //loggergen.log("ori,lab",ori,lab)

                  if(ori.length > 0 && lab.length > 0) tmp = [tmp," at ",<a href={ori[0].value} target="_blank">{lab[0].value}</a>]
               }
            }


            let nbT
            if(this.props.assocResources && this.props.assocResources[e.value] 
               && (nbT=this.props.assocResources[e.value].filter(f => f.type === _tmp+"nbTranslations")).length > 0)
            {
               tmp = [tmp,<span class="nbTrans">{I18n.t("resource.nbTrans",{count:Number(nbT[0].value)})}</span>]
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

            //loggergen.log("newAnno?",tmp,this._plink)

            let annoB = <ChatIcon className="annoticon"  onClick={
               (function(val,prop,v,ev){
                  this.setState({...this.state,annoPane:true,newAnno:{prop:this.proplink(prop),val},viewAnno:prop+"@"+v})
               }).bind(this,tmp,prop,value)
            }/>
            if(!Array.isArray(tmp)) tmp = [ tmp ]
            if(tmpAnno) { tmpAnno.push(annoB); tmp = tmpAnno ;}
            else tmp.push(annoB);

            // TODO fix double
            let sav = this.hoverMenu(prop,e,[...tmp])
            tmp.push(sav)
            //if(grandPa !== undefined) grandPa.push(sav)


               //(function(ev,prop,val){return function(){ loggergen.log("new",ev,prop,val) }})(event,this._plink,tmp)
               /*
               (ev,prop,val) => {
               loggergen.log("new")
               this.setState({...this.state,annoPane:true,newAnno:{prop:this._plink,val:tmp}})}
               */

            let sameAsPrefix ;
            for(let p of Object.keys(prefixes)) { if(e.fromSameAs && e.fromSameAs.match(new RegExp(prefixes[p]))) { sameAsPrefix = p } }

            const {befo,bdrcData} = this.getSameLink(e,sameAsPrefix)            

            let ID = "ID-"+prop+"-"+(e&&e.value?e.value:e)      
            /*
            let toggleHoverM = (ev) => {
               //console.log("togHovM",ev,ev.currentTarget)
               if(ev.target === ev.currentTarget) this.setState({...this.state,collapse:{...this.state.collapse,["hover"+ID]:!this.state.collapse["hover"+ID]}, anchorEl:{...this.state.anchorEl,["hover"+ID]:ev.currentTarget} } ) 
            }
            */

            if(!txt) ret.push(<Tag onClick={this.toggleHoverM(ID,true)} onMouseEnter={this.toggleHoverMtooltip(ID,true)} onMouseLeave={this.toggleHoverMtooltip(ID,false)} className={(elem && elem.length > 1?"multiple ":"") + (sameAsPrefix?sameAsPrefix+" sameAs hasIcon":"") + " hasTogHovM"}>{befo}{tmp}{bdrcData}</Tag>)
            else ret.push(<Tag onClick={this.toggleHoverM(ID,true)} onMouseEnter={this.toggleHoverMtooltip(ID,true)} onMouseLeave={this.toggleHoverMtooltip(ID,false)} className={(elem && elem.length > 1?"multiple ":"") +  (sameAsPrefix?sameAsPrefix+" sameAs hasIcon":"")+ " hasTogHovM" }>{befo}{tmp+" "+txt}{bdrcData}</Tag>)


            //loggergen.log("ret",ret)
         }
         else {

            let keepT = false, willK = false

            if(e.k) {
               if(T) lastT = T ;
               T = e.k.split(";")
               if(T.length) T = T[0]
               if(T === lastT) keepT = true

               //loggergen.log("keep?",T,lastT,e,keepT)

               if(iKeep < _elem.length - 1) {
                  let nxT = _elem[iKeep+1]
                                    
                  if(nxT && nxT.k) {
                     nxT = nxT.k.split(";")
                     if(nxT.length) nxT = nxT[0]
                     if(T === nxT) willK = true
                  }
                  //loggergen.log("willK?",nxT,willK)
               }
            }

            elem = this.getResourceBNode(e.value)            

            if(prop === bdo+"lineageHolder" && elem && elem[bdo+"lineageReceived"]) {
               let received = elem[bdo+"lineageReceived"]
               if(received.length) received = received[0].value
               if(received) received = this.getResourceBNode(received)
               if(received && received[bdo+"lineageFrom"]) { 
                  delete elem[bdo+"lineageReceived"]
                  elem[bdo+"lineageFrom"] = [ ...received[bdo+"lineageFrom"]  ]
               }
            }

            //loggergen.log("bnode",prop,e.value,elem)

            if(!elem) continue ;

            let sub = []

            let val = elem[rdf+"type"]
            let lab = elem[rdfs+"label"]

            if(prop === bdo+"instanceEvent")  {
               let from = e.fromEvent
               loggergen.log("from",from,this.getResourceBNode(from)        )
               if(from) from = this.getResourceBNode(from)        
               if(from && from[rdf+"type"]) val = from[rdf+"type"]
            }

            //loggergen.log("val",val);
            //loggergen.log("lab",lab);

            let noVal = true ;
            
            let valSort ;
            if(prop === bdo+'hasTitle' && this.props.dictionary) {
               valSort = val.map(v => {
                  let p = this.props.dictionary[v.value]
                  if(p) p = p[rdfs+"subClassOf"]
                  if(p) return {v,k:p.filter(f => f.value === bdo+"Title").length}
                  else return {v,k:-1}
               })
               valSort = _.orderBy(valSort,['k'],['desc']).map(e => e.v)
               //loggergen.log("valSort!",valSort)               
            }

            let sameAsPrefix ;
            for(let p of Object.keys(prefixes)) { if(e.fromSameAs && e.fromSameAs.match(new RegExp(prefixes[p]))) { sameAsPrefix = p } }
            
            const {befo,bdrcData} = this.getSameLink(e,sameAsPrefix)

            // property name ?            
            let subProp = ""
            if(valSort) {
               //loggergen.log("valSort?",valSort)               
               if(valSort.length) subProp = valSort[0].value
               noVal = false ;
               sub.push(<Tag  data-prop={shortUri(prop)}  className={'first '+(div == "sub"?'type':'prop') +" "+ (sameAsPrefix?sameAsPrefix+" sameAs hasIcon":"")}>{befo}{[valSort.map((v,i) => i==0?[this.proplink(v.value)]:[" / ",this.proplink(v.value)]),I18n.t("punc.colon")+" "]}{bdrcData}</Tag>)
            }
            else if(val && val[0] && val[0].value)
            {
               subProp = val[0].value
               noVal = false ;
               sub.push(<Tag  data-prop={shortUri(prop)}  className={'first '+(div == "sub"?'type':'prop') +" "+ (sameAsPrefix?sameAsPrefix+" sameAs hasIcon":"")}>{befo}{[this.proplink(val[0].value),I18n.t("punc.colon")+" "]}{bdrcData}</Tag>)
            }

            //loggergen.log("lab",lab,subProp,prop)

            // direct property value/label ?
            if(prop !== bdo+"instanceEvent" && lab && lab[0] && lab[0].value)
            {
               let i_lab = 0
               for(let l of lab) {


                  let tLab = getLangLabel(this, subProp, [ l ])
                  let lang = tLab["lang"]
                  if(!lang) lang = tLab["xml:lang"]
                  let tVal = tLab.value

                  let tip = [this.fullname(tVal),lang?<Tooltip placement="bottom-end" title={
                     <div style={{margin:"10px"}}>
                        {I18n.t(languages[lang]?languages[lang].replace(/search/,"tip"):lang)}
                     </div>
                  }><span className="lang">{lang}</span></Tooltip>:null]


                  tip.push(this.hoverMenu(subProp,{type:"literal",value:tVal,lang,allSameAs:l.allSameAs},[...tip],[<h4 class="first">{this.proplink(prop)}{I18n.t("punc.colon")}</h4>]))

                  let ID = "ID-"+subProp+"-"+tVal

                  let sav = <Tag onClick={this.toggleHoverM(ID,true)} onMouseEnter={this.toggleHoverMtooltip(ID,true)} onMouseLeave={this.toggleHoverMtooltip(ID,false)} className={'label hasTogHovM'}>
                        {tip}
                     </Tag>
                  sub.push(sav)


                  /*
                  sub.push(
                     <Tag className={'label '}>
                        {tip}
                        <ChatIcon className="annoticon"  onClick={
                           (function(val,prop,v,ev){
                              this.setState({...this.state,annoPane:true,newAnno:{prop:this.proplink(prop),val},viewAnno:prop+"@"+v})
                           }).bind(this,tip,val[0].value,val[0].value)
                        }/>
                        {this.hoverMenu(prop,tip,[...sub])}
                     </Tag>
                  )
                  */
                  
               }

               ret.push(<div className={div + (keepT?" keep":"") +  (willK?" willK":"")}>{sub}</div>)

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
                     const rank = { [bdo+"noteText"]:3, [bdo+"contentLocationStatement"]:2, [bdo+"noteSource"]:1 }
                     if(rank[elem]) return rank[elem]
                     else return 4 ;
                  })

                  noteVol = true
                  noteLoc = true
               }
               else if(prop.match(/Event$/)) {
                  const rank = { [bdo+"onYear"]:1, [bdo+"notBefore"]:2, [bdo+"notAfter"]:3, [bdo+"dateIndication"]:4 }                     
                  keys = keys.map(elem => {
                     if(rank[elem]) return { k:rank[elem], tag:elem }
                     else return { k:5, tag:elem }
                  } )
                  keys = _.orderBy(keys,['k','tag'],[ "asc" ]).map(e => e.tag)
                  //loggergen.log("key5",keys)
               }


               let group = []

               for(let f of keys)
               {
                  let subsub = []

                  if(!f.match(/[/]note/)) first="" ;

                  //loggergen.log("f",prop,f)

                  if(f === tmp+"noteFinal")
                  {
                     //loggergen.log("noteData",noteData)
                     if(noteData[bdo+"noteText"])
                     {
                        let workuri ;
                        if(noteData[bdo+"noteSource"])
                        {
                           let loca ;
                           if(noteData[bdo+"contentLocationStatement"])
                           {
                              loca = [" @ ",noteData[bdo+"contentLocationStatement"].value]
                           }
                           workuri = <div><Tag style={{fontSize:"14px"}}>(from {this.uriformat(bdo+"noteSource",noteData[bdo+"noteSource"])}{loca})</Tag></div>
                        }

                        let text = getLangLabel(this,"",[ noteData[bdo+"noteText"] ])
                        //console.log("text:",text)
                        if(text) text = text.value
                        else text = this.pretty(noteData[bdo+"noteText"].value) 

                        let sav = [
                              <Tag className="first type">{I18n.t("punc.num",{num:nbN++}) /*this.proplink(bdo+"noteText","Note")*/}</Tag>,
                              workuri,
                              <div class="subsub">
                                 <Tag >
                                    { text }
                                    {this.tooltip(noteData[bdo+"noteText"].lang)}
                                    <ChatIcon className="annoticon"  onClick={
                                       (function(val,prop,v,ev){
                                          this.setState({...this.state,annoPane:true,newAnno:{prop:this.proplink(prop),val},viewAnno:prop+"@"+v})
                                       }).bind(this,noteData[bdo+"noteText"].value,bdo+"noteText",noteData[bdo+"noteText"].value)
                                    }/>
                                 </Tag>
                              </div>
                        ]

                        sav.push(this.hoverMenu(prop,{value:"note-i-"+nbN,noteData},<div class="sub">{[...sav]}</div>))

                        let ID = "ID-"+prop+"-"+"note-i-"+nbN
                        
                        note.push(
                            <div class="sub hasTogHovM"  onClick={this.toggleHoverM(ID,null,null,true)} onMouseEnter={this.toggleHoverMtooltip(ID,true)} onMouseLeave={this.toggleHoverMtooltip(ID,false)}>
                            {sav}
                           </div>
                        )
                     }
                     else if(noteData[bdo+"noteSource"])
                     {
                        let loca
                        if(noteData[bdo+"contentLocationStatement"])
                        {
                           loca = [" @ ",noteData[bdo+"contentLocationStatement"].value]
                        }
                        let workuri = <div><Tag style={{fontSize:"14px"}}>({I18n.t("misc.from")} {this.uriformat(bdo+"noteSource",noteData[bdo+"noteSource"])}{loca})</Tag></div>


                        let sav = [
                           <Tag  className="first type">{I18n.t("punc.num",{num:nbN++}) /*this.proplink(bdo+"noteSource","Note")*/}</Tag>,
                           workuri,
                           <ChatIcon className="annoticon"  onClick={
                              (function(val,prop,v,ev){
                                 this.setState({...this.state,annoPane:true,newAnno:{prop:this.proplink(prop),val},viewAnno:prop+"@"+v})
                              }).bind(this,[workuri,loca],bdo+"noteSource",noteData[bdo+"noteSource"].value)
                           }/>
                        ]
                        
                        sav.push(this.hoverMenu(prop,{value:"note-i-"+nbN,noteData},<div class="sub">{[...sav]}</div>))

                        let ID = "ID-"+prop+"-"+"note-i-"+nbN

                        note.push(
                           <div class="sub  hasTogHovM"  onClick={this.toggleHoverM(ID,null,null,true)} onMouseEnter={this.toggleHoverMtooltip(ID,true)} onMouseLeave={this.toggleHoverMtooltip(ID,false)}>
                              {sav}
                           </div>
                        )



                        /*
                        let workuri = this.uriformat(bdo+"noteSource",noteData[bdo+"noteSource"])
                        note.push(
                           <div class="sub">
                              { <Tag className="first type">{this.proplink(bdo+"noteSource","Note")}:</Tag>
                              <div class="subsub">
                                 <Tag>{workuri}{loca}
                                    <ChatIcon className="annoticon"  onClick={
                                       (function(val,prop,v,ev){
                                          this.setState({...this.state,annoPane:true,newAnno:{prop:this.proplink(prop),val},viewAnno:prop+"@"+v})
                                       }).bind(this,[workuri,loca],bdo+"noteSource",noteData[bdo+"noteSource"].value)
                                    }/>
                                 </Tag>
                              </div> }
                           </div>
                        )
                        */

                     }
                     else if(noteData[bdo+"contentLocationStatement"])
                     {
                     }

                     //ret.push(note)
                     continue;
                  }

                  let hasBnode = false ;

                  if(f == rdf+"type") continue;
                  else
                  {
                     let what = this.props.resources[this.props.IRI][elem[f][0].value]
                     //loggergen.log("what",what,elem[f])

                     if(!noVal)
                        subsub.push(<Tag data-prop={shortUri(f)} className={'first '+(div == ""?'type':'prop')}>{[this.proplink(f),I18n.t("punc.colon")+" "]}</Tag>)
                     //{...(val ? {className:'first prop'}:{className:'first type'}) }
                     else
                        sub.push(<Tag data-prop={shortUri(f)} className={'first '+(!bnode?"type":"prop")}>{[this.proplink(f),I18n.t("punc.colon")+" "]}</Tag>)

                     val = elem[f]
                     for(let v of val)
                     {
                        //loggergen.log("v",v,f,subProp);

                        if(f == bdo+"contentLocationStatement" || f == bdo+"noteSource" || f == bdo+"noteText") {
                           noteData[f] = v
                        }
                        else if(f.match(/([Ll]ineage)/) && elem[f][0] && elem[f][0].value && this.props.resources && this.props.resources[this.props.IRI] && this.props.resources[this.props.IRI][elem[f][0].value])
                        {
                           v.type = "bnode"
                        }

                        let txt = v.value;
                        if(v.value== e.value) {
                           continue ;
                        }
                        else if(v.type == 'bnode')
                        {
                           hasBnode = true
                           subsub.push(this.format("h4",txt,"",true,div+"sub"))
                        }
                        else {
                           let dic ;
                           
                           if(what && f === bdo+"dateIndication") { 
                              let era,year
                              if((year = what[bdo+"yearInEra"]) && year.length) year = year[0].value
                              if(year) txt = year ;
                              if((era = what[bdo+"era"]) && era.length) era = era[0].value
                              if(era) { 
                                 dic = this.props.dictionary[era]
                                 if(dic) {
                                    let tip = dic[adm+"userTooltip"]
                                    if(!tip) tip = dic[rdfs+"comment"]
                                    if(tip) tip = tip[0]
                                    if(tip) tip = tip.value

                                    let pit = dic[bdo+"uiAbbrFormat"]
                                    if(pit) pit = pit[0]
                                    if(pit) pit = pit.value
                                    if(pit) pit = pit.replace(/[ .]|%s/g,"")

                                    txt = [txt,<Tooltip placement="bottom-end" title={<div style={{margin:"10px"}}>{tip}</div>}><span className="lang">{pit}</span></Tooltip>]
                                 }
                              }
                           }
                           else if(v.type == 'uri') txt = this.uriformat(f,v)
                           else if(v.type === 'literal' && v.datatype === xsd+"gYear") {

                              txt = [txt.replace(/^(-?)0+/,"$1"),<Tooltip placement="bottom-end" title={<div style={{margin:"10px"}}>{"Gregorian Calendar"}</div>}><span className="lang">{"GC"}</span></Tooltip>]
                           }
                           else if(v.type === 'literal' && v.datatype === xsd+"date") { 
                              txt = [txt.replace(/^(-?)0+/,"$1")]
                           }
                           else if(v.type === 'literal' && v.datatype && this.props.dictionary && (dic = this.props.dictionary[v.datatype]) && dic[rdfs+"subClassOf"] 
                              && dic[rdfs+"subClassOf"].filter(s => s.value === bdo+"AnyDate").length) {

                              let dateC = dic[adm+"userTooltip"]
                              if(!dateC) dateC = dic[rdfs+"comment"]
                              if(dateC) dateC = dateC[0]
                              if(dateC) dateC = dateC.value

                              let dateL = dic[rdfs+"label"]
                              if(dateL) dateL = dateL[0]
                              if(dateL) dateL = dateL.value
                              if(dateL) dateL = dateL.replace(/ date$/,"")

                              txt = [txt,<Tooltip placement="bottom-end" title={<div style={{margin:"10px"}}>{dateC}</div>}><span className="lang">{dateL}</span></Tooltip>]
                           }
                           else { txt = this.fullname(v.value)

                              //loggergen.log("txt",txt)

                              if(v["lang"] || v["xml:lang"]) {
                                 let lang = v["lang"]
                                 if(!lang) lang = v["xml:lang"]
                                 txt = [txt,lang?<Tooltip placement="bottom-end" title={
                                    <div style={{margin:"10px"}}>
                                       {I18n.t(languages[lang]?languages[lang].replace(/search/,"tip"):lang)}
                                    </div>
                                 }><span className="lang">{lang}</span></Tooltip>:null]
                              }
                           }
                           if(!Array.isArray(txt)) txt = [txt]
                           txt.push(
                              <ChatIcon className="annoticon"  onClick={
                                 (function(val,prop,v,ev){
                                    this.setState({...this.state,annoPane:true,newAnno:{prop:this.proplink(prop),val},viewAnno:prop+"@"+v})
                                 }).bind(this,txt,f,value)
                              }/>
                           )
                           txt.push(this.hoverMenu(f,v,[...txt],[...(prop===bdo+"creator"?group:[]),...sub],prop));

                           //<ChatIcon className="annoticon" onClick={e => this.setState({...this.state,annoPane:true,newAnno:true})}/>

                           let ID = "ID-"+f+"-"+v.value

                           if(!noVal) subsub.push(<Tag class="hasTogHovM"  onClick={this.toggleHoverM(ID,true)} onMouseEnter={this.toggleHoverMtooltip(ID,true)} onMouseLeave={this.toggleHoverMtooltip(ID,false)}>{txt}</Tag>)
                           else sub.push(<Tag class="hasTogHovM"  onClick={this.toggleHoverM(ID,true)} onMouseEnter={this.toggleHoverMtooltip(ID,true)} onMouseLeave={this.toggleHoverMtooltip(ID,false)}>{txt}</Tag>)
                        }
                     }
                  }
                  if(!noVal && !f.match(/[/]note[^F]/) && f !== bdo+"contentLocationStatement") {
                     //loggergen.log("push?sub+",subsub)
                     group.push(<div className={div+"sub "+(hasBnode?"full":"")}>{subsub}</div>)
                  }
                  else {

                     if(subsub.length > 0) { 
                        //loggergen.log("push?subsub",subsub)
                        sub.push(subsub) //<div className="sub">{subsub}</div>)
                     }

                     if(f == bdo+"contentLocationStatement" || f == bdo+"noteSource" || f == bdo+"noteText") {
                        // wait noteFinal
                        /*
                        if(f == bdo+"noteText") {

                           loggergen.log("noteData",noteData)

                           if(noteVol && noteVol != true) sub.push(noteVol)
                           if(noteLoc && noteLoc != true) sub.push(noteLoc)
                           ret.push(<div className={div+ first}>{sub}</div>)
                        }
                        else if(f == bdo+"noteLocationStatement")
                        {
                           noteLoc = <div className={div+ first}>{sub}</div>
                        }
                        else if(f == bdo+"noteSource")
                        {
                           noteVol = <div className={div+ first}>{sub}</div>
                        }
                        */
                     }
                     else if(sub.length) {
                        //loggergen.log("push?sub",sub)
                        ret.push(<div className={div+ first}>{sub}</div>)
                     }

                     sub = []
                     first = ""
                  }
               }

               if(group.length) sub.push(<div class="subgroup">{group}</div>)

               if(!noVal && sub.length) ret.push(<div className={div+" "+(bnode?"full":"") + (keepT?" keep":"") +  (willK?" willK":"") }>{sub}</div>)
               //loggergen.log("ret",ret,ret.length)



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

      if(note.length) {

         // TODO collapse not if more than 3
         loggergen.log("note",note);

         if(note.length <= 3) pre.push(<div class="no-collapse">{note}</div>)
         else pre.push([<div>         
               {note.slice(0,3)}
               <Collapse timeout={{enter:0,exit:0}} className={"noteCollapse in-"+(this.state.collapse[prop]===true)} in={this.state.collapse[prop] /*!== false*/ }>
                  {note.slice(3)}
               </Collapse>          
               </div>,     
               <span
                  onClick={(e) => this.setState({...this.state,collapse:{...this.state.collapse,[prop]:!this.state.collapse[prop]}})}
                  className="expand">
                     {I18n.t("misc."+(this.state.collapse[prop]?"hide":"seeMore")).toLowerCase()}&nbsp;<span
                     className="toggle-expand">
                        { this.state.collapse[prop] && <ExpandLess/>}
                        { !this.state.collapse[prop] && <ExpandMore/>}
                  </span>
               </span> ]);

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
                        loggergen.log("xhr",xhr)
                    }
                  }
                })

               loggergen.log("uv",window.UV)
               loggergen.log("createuv",window.createUV)

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


   showMirador(num?:number,useManifest?:{},click)
   {
      let state = { ...this.state, openMirador:true, openDiva:false, openUV:false }

      if(!this.state.openMirador) // || !$("#viewer").hasClass("hidden"))
      {


         if(click && state.fromSearch && (state.fromSearch.startsWith("latest") || state.fromSearch.includes("t=Scan"))) {
            let loca = {... this.props.history.location}
            if(loca.search.match(/[?&]s=/)) loca.search = loca.search.replace(/[?&]s=[^&]+/,"")
            if(loca.search && !loca.search.endsWith("?")) loca.search += "&"            
            loca.search += "s="+encodeURIComponent(window.location.href.replace(/.*(\/show\/)/,"$1"))
            this.props.history.push(loca)
         } else if(click) {
            state.fromClick = true ;
         } else {
            state.fromClick = false ;
         }

         $("#fond").removeClass("hidden");

         if(this.state.UVcanLoad) { window.location.hash = "mirador"; window.location.reload(); }

         loggergen.log("num",num,useManifest)

         if(!tiMir) tiMir = setInterval( async () => {

            console.log("tiMir")

            if(window.Mirador && $("#viewer").length && window.Mirador.Viewer.prototype.setupViewer.toString().match(/going to previous page/) && !window.mirador) {

               clearInterval(tiMir);
               tiMir = 0

               $("#fond").addClass("hidden");

               let data = [], manif, canvasID
               if(useManifest)
               {
                  manif = useManifest
                  if(!manif) manif = this.props.imageAsset+"?continuous=true"
                  data.push({"manifestUri": manif, location:"Test Manifest Location" })
                  canvasID = this.props.canvasID
               }
               else if(this.props.imageAsset) 
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

               let withCredentials = false
               let elem = this.getResourceElem(adm+"access")
               if(elem && elem.filter(e => e.value.match(/(AccessFairUse)|(Restricted.*)$/)).length >= 1) withCredentials = true

               let config = await miradorConfig(data,manif,canvasID,withCredentials,this.props.langPreset,null,this.props.IRI,this.props.locale);

               loggergen.log("mir ador",num,config,this.props)

               if(window.mirador) delete window.mirador

               window.mirador = window.Mirador( config )

               miradorSetUI(true, num);
            }
         }, 1000)
      }
      else
      {
         //$('#viewer').removeClass('hidden').show()
      }


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
         //loggergen.log("pdf",pdf,file)
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

   proplink = (k,txt,count?:integer=1) => {


      if(txt) console.warn("use of txt in proplink",k,txt)

      let tooltip
      if(this.props.dictionary && this.props.dictionary[k]) {
         if(this.props.dictionary[k][skos+"definition"]) 
            tooltip = this.props.dictionary[k][skos+"definition"]
         else if(this.props.dictionary[k][adm+"userTooltip"]) 
            tooltip = this.props.dictionary[k][adm+"userTooltip"]
         else if(this.props.dictionary[k][rdfs+"comment"]) 
            tooltip = this.props.dictionary[k][rdfs+"comment"].filter(comm => !comm.value.match(/^([Mm]igration|[Dd]eprecated)/))
      }

      if(k === bdo+'note') txt = I18n.t("popover.notes") ;

      let ret = (<a class="propref" {...(k.match(/purl[.]bdrc[.]io/) && !k.match(/[/]tmp[/]/) ? {"href":k}:{})} target="_blank">{txt?txt:this.fullname(k,false,false,true,true,count)}</a>)

      if(tooltip && tooltip.length > 0) ret = <Tooltip placement="bottom-start" classes={{tooltip:"commentT",popper:"commentP"}} style={{marginLeft:"50px"}} title={<div>{tooltip.map(tip => tip.value.split("\n").map(e => [e,<br/>]))}</div>}>{ret}</Tooltip>

      return ret;
   }

   // to be redefined in subclass
   preprop = (k) => {} ;
   insertPreprop = (tag,n,ret) => ret ;

   getTabs(_T,other) {
      let tabs = []
      if(_T === "Work") {
         if(this.state.title && this.state.title.instance && this.state.title.instance.length) tabs.push(shortUri(this.state.title.instance[0].value))
         if(this.state.title && this.state.title.images && this.state.title.images.length) tabs.push(shortUri(this.state.title.images[0].value))
      }
      else if(_T === "Instance") {
         if(this.state.title && this.state.title.images && this.state.title.images.length) tabs.push(shortUri(this.state.title.images[0].value))
      }

      //loggergen.log("tabs?",_T,other,tabs)

      if(tabs.length) return "?tabs="+tabs.join(",")
      else return ""
   }

   getH2 = (title,_befo,_T,other,T_,rootC) => {

      //loggergen.log("H2?",rootC)

      if(other) return <h2 title={title.value} lang={this.props.locale}><Link  {... rootC?{onClick:rootC}:{}}  to={"/show/"+shortUri(other)+this.getTabs(T_,other)}>{_T}<span>{_befo}{title.value}</span>{this.tooltip(title.lang)}</Link></h2>
      else return <h2 title={title.value} lang={this.props.locale} class="on">{_T}<span>{_befo}{title.value}</span>{this.tooltip(title.lang)}</h2>
   }

   setTitle = (kZprop,_T,other,rootC) => {

      let title,titlElem,otherLabels = [], T_ = _T ;
      _T = [<span class={"T "+_T.toLowerCase()}>
         <span class="RID">{shortUri(other?other:this.props.IRI)}</span>
         {I18n.t("types."+_T.toLowerCase())}
      </span>]

      if(kZprop.indexOf(skos+"prefLabel") !== -1)       {
         titlElem = this.getResourceElem(skos+"prefLabel",other,this.props.assocResources);
      }
      else if(kZprop.indexOf(bdo+"eTextTitle") !== -1)     {
         titlElem = this.getResourceElem(bdo+"eTextTitle",other,this.props.assocResources);
      }
      else if(kZprop.indexOf(rdfs+"label") !== -1)   {
         titlElem = this.getResourceElem(rdfs+"label",other,this.props.assocResources);
      }
      else {
          let loaded = this.props.resources && this.props.resources[other?other:this.props.IRI] 
          if(other) title = <h2 lang={this.props.locale}><Link to={"/show/"+shortUri(other)+this.getTabs(T_,other)}>{_T}<span>{loaded && (T_ === "Work" || T_ === "Instance")?I18n.t("resource.noT"):shortUri(other?other:this.props.IRI)}</span></Link></h2>
          else  title = <h2 class="on" lang={this.props.locale}>{_T}<span>{loaded && (T_ === "Work" || T_ === "Instance")?I18n.t("resource.noT"):shortUri(other?other:this.props.IRI)}</span></h2>
      }
      
      if(!title) {
         if(titlElem) {
            if(typeof titlElem !== 'object') titlElem =  { "value" : titlElem, "lang":""}
            title = getLangLabel(this,"", titlElem, false, false, otherLabels)
         }
         
         //loggergen.log("titl",kZprop,titlElem,title,otherLabels,other)

         let _befo
         if(title && title.value) {
            if(!other && !document.title.includes(title.value) ) document.title = title.value + " - Public Digital Library"
            if(title.fromSameAs && !title.fromSameAs.match(new RegExp(bdr))) {
               const {befo,bdrcData} = this.getSameLink(title,shortUri(title.fromSameAs).split(":")[0]+" sameAs hasIcon")            
               _befo = befo
            }
         }
         if(!title) title = { value:"", lang:"" }
         title = this.getH2(title,_befo,_T,other,T_,rootC)         
      }

      //loggergen.log("sT",other,title,titlElem)

      return { title, titlElem, otherLabels }
   }

   setManifest = (kZprop,iiifpres, rid = this.props.IRI, fullRid = fullUri(this.props.IRI)) => {

      //console.log("kZprop:",kZprop,iiifpres,rid)

      if(kZprop.indexOf(bdo+"imageList") !== -1)
      {
         if(!this.props.imageAsset && !this.props.manifestError) {
            if(rid !== this.props.IRI) this.setState({...this.state, imageLoaded:false})
            this.props.onHasImageAsset(iiifpres+"/v:"+ rid+ "/manifest",rid);
         }
      }/*
      else if(kZprop.indexOf(tmp+"imageVolumeId") !== -1)
      {
         let elem = this.getResourceElem(tmp+"imageVolumeId")
         if(!this.props.imageAsset && !this.props.manifestError) {
            this.setState({...this.state, imageLoaded:false})
            this.props.onHasImageAsset(iiifpres+"/v:"+ elem[0].value.replace(new RegExp(bdr), "bdr:") + "/manifest",rid);
            this.props.onGetResource("bdr:"+this.pretty(elem[0].value));
         }
      }*/
      else if(kZprop.indexOf(bdo+"volumeOf") !== -1)
      {
         let elem = this.getResourceElem(bdo+"volumeHasEtext",rid,this.props.resources,fullRid)
         if(!elem && !this.props.imageAsset && !this.props.manifestError) {
            this.setState({...this.state, imageLoaded:false})
            this.props.onHasImageAsset(iiifpres+"/vo:"+ rid + "/manifest",rid);
         }
      }
      else if(kZprop.indexOf(bdo+"hasIIIFManifest") !== -1)
      {
         let elem = this.getResourceElem(bdo+"hasIIIFManifest",rid,this.props.resources,fullRid)
         if(elem[0] && elem[0].value && !this.props.manifestError && !this.props.imageAsset) {
            if(rid !== this.props.IRI) this.setState({...this.state, imageLoaded:false})
            this.props.onHasImageAsset(elem[0].value,rid);
         }
      }
      else if(kZprop.indexOf(bdo+"contentLocation") !== -1)
      {
         if(!this.props.imageAsset && !this.props.manifestError) {
            if(rid !== this.props.IRI) this.setState({...this.state, imageLoaded:false})
            this.props.onHasImageAsset(iiifpres+"/collection/wio:"+rid,rid)
         }
      }      
       else if(kZprop.indexOf(bdo+"instanceHasVolume") !== -1)
      {
         let elem = this.getResourceElem(bdo+"instanceHasVolume",rid,this.props.resources,fullRid)
         let nbVol = this.getResourceElem(bdo+"itemVolumes",rid,this.props.resources,fullRid)
         let work = this.getResourceElem(bdo+"instanceReproductionOf",rid,this.props.resources,fullRid)

         if(elem[0] && elem[0].value && !this.props.imageAsset && !this.props.manifestError) {
            
            //console.log("iHv:",elem,nbVol,work)

            if(rid !== this.props.IRI)this.setState({...this.state, imageLoaded:false})
            let manif = iiifpres + "/vo:"+elem[0].value.replace(new RegExp(bdr),"bdr:")+"/manifest"
            if(nbVol && nbVol[0] && nbVol[0].value && nbVol[0].value > 1 && work && work[0] && work[0].value)
              manif = iiifpres + "/collection/wio:"+work[0].value.replace(new RegExp(bdr),"bdr:")
            this.props.onHasImageAsset(manif,rid)
         }
      }
      else if(kZprop.indexOf(bdo+"instanceReproductionOf") !== -1)
      {
         let elem = [{value:rid}] 
         let nbVol = this.getResourceElem(bdo+"itemVolumes",rid,this.props.resources,fullRid)
         if(!nbVol) { 
            nbVol = this.getResourceElem(bdo+"instanceHasVolume",rid,this.props.resources,fullRid)
            if(nbVol && nbVol.length) nbVol = [{value:nbVol.length}]
         }
         let work = this.getResourceElem(bdo+"instanceReproductionOf",rid,this.props.resources,fullRid)

         loggergen.log("isReprOf?",elem,nbVol,work)

         if(elem[0] && elem[0].value && !this.props.imageAsset && !this.props.manifestError) {
            if(rid !== this.props.IRI)this.setState({...this.state, imageLoaded:false})
            let manif = iiifpres + "/wv:"+elem[0].value.replace(new RegExp(bdr),"bdr:")+"/manifest"
            if(nbVol && nbVol[0] && nbVol[0].value && nbVol[0].value >= 1 && work && work[0] && work[0].value)
              manif = iiifpres + "/collection/wio:"+work[0].value.replace(new RegExp(bdr),"bdr:")
            this.props.onHasImageAsset(manif,rid)
         }
      }
      else if(kZprop.indexOf(bdo+"itemHasVolume") !== -1)
      {
         let elem = this.getResourceElem(bdo+"instanceHasVolume",rid,this.props.resources,fullRid)
         let nbVol = this.getResourceElem(bdo+"instanceVolumes",rid,this.props.resources,fullRid)
         let work = this.getResourceElem(bdo+"instanceReproductionOf",rid,this.props.resources,fullRid)
         if(elem[0] && elem[0].value && !this.props.imageAsset && !this.props.manifestError) {
            if(rid !== this.props.IRI)this.setState({...this.state, imageLoaded:false})
            let manif = iiifpres + "/v:"+elem[0].value.replace(new RegExp(bdr),"bdr:")+"/manifest"
            if(nbVol && nbVol[0] && nbVol[0].value && nbVol[0].value > 1 && work && work[0] && work[0].value)
              manif = iiifpres + "/collection/wio:"+work[0].value.replace(new RegExp(bdr),"bdr:")
            this.props.onHasImageAsset(manif,rid)
         }
      }
      else {
         
         if (this.props.assocResources) {
            let kZasso = Object.keys(this.props.assocResources) ;

            let elem = this.getResourceElem(bdo+"instanceHasReproduction",rid,this.props.resources,fullRid)
            if(!this.props.manifestError && elem) for(let e of elem)
            {
               let assoc = this.props.assocResources[e.value]
               let imItem = assoc

               //loggergen.log("hImA",assoc,e.value)

               if(assoc && assoc.length > 0 && !this.props.imageAsset && !this.props.manifestError && (imItem = assoc.filter(e => e.type === tmp+"itemType" && e.value === bdo+"ImageInstance")).length) {

                  if(rid !== this.props.IRI) this.setState({...this.state, imageLoaded:false})

                  if(assoc.length == 1) { this.props.onHasImageAsset(iiifpres + "/v:bdr:"+this.pretty(imItem[0].value,true)+"/manifest",rid); }
                  else { this.props.onHasImageAsset(iiifpres + "/collection/wio:"+this.pretty(rid,true),rid);  }

               }
            }
         }
         
      }
   }


   getPdfLink = (data) =>  {

      let pdfLink,monoVol = -1 ;
      if(this.props.firstImage &&  !this.props.manifestError && this.props.firstImage.match(/[.]bdrc[.]io/))
      {
         let iiif = "//iiif.bdrc.io" ;
         if(this.props.config && this.props.config.iiif) iiif = this.props.config.iiif.endpoints[this.props.config.iiif.index]

         loggergen.log("iiif",this.props.imageAsset,iiif,this.props.config)

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
                  elem = this.getResourceElem(bdo+"instanceHasReproduction")
                  if(elem && elem.length > 0 && elem[0].value)
                     pdfLink = iiif+"/download/zip/wi:bdr:W"+id+"::bdr:"+ this.pretty(elem[0].value,true) ;
                  
               }
            }
         }
         else if(this.props.imageAsset.match(/[/]wio:/)) {

            let elem = this.getResourceElem(bdo+"itemVolumes")

            //loggergen.log("itVol?",elem)

            if(elem && elem.length > 0 && elem[0].value && elem[0].value == "1") {               
                  monoVol = Number(elem[0].value)
            }
         }
         else if(this.props.imageAsset.match(/[/]vo:/)) {
            monoVol = 1
            let elem = this.getResourceElem(bdo+"volumeNumber")
            if(elem && elem.length > 0 && elem[0].value)
               monoVol = Number(elem[0].value)
         }

         if(!pdfLink && this.props.manifestWpdf && this.props.manifestWpdf.rendering) {
            let link = this.props.manifestWpdf.rendering.filter(e => e.format === "application/zip")
            if(link.length) link = link[0]["@id"]
            if(link) { 
               pdfLink = link
               let mono  = this.getWorkLocation(this.getResourceElem(bdo+"contentLocation"), false)
               //loggergen.log("mono?",mono)
               if(mono && monoVol === -1) monoVol = mono
            }
         }


         //loggergen.log("monoV",monoVol)


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
                  pdfLink = "//iiif.bdrc.io/download/pdf/wv:bdr:"+work+"::bdr:V"+id+"::"+begin+"-"+end ;
               loggergen.log("loca",vol,begin,end,pdfLink)
               // ex: http://iiif.bdrc.io/pdfdownload/wv:bdr:W29329::bdr:V29329_I1KG15043::1-10
            }

         }
         */

      }
      return { pdfLink, monoVol}
   }


   getMapInfo = (kZprop) => {

      let doMap = false, doRegion = false,regBox ;
      if(kZprop.indexOf(bdo+"placeLong") !== -1 && kZprop.indexOf(bdo+"placeLat") !== -1)
      {
         doMap = [].concat(this.fullname(this.getResourceElem(bdo+"placeLat")[0].value,false,false,false,false)).concat(this.fullname(this.getResourceElem(bdo+"placeLong")[0].value,false,false,false,false))
         loggergen.log("doMap",doMap)
      }
      if(kZprop.indexOf(bdo+"placeRegionPoly") !== -1)
      {
         doRegion = JSON.parse(this.getResourceElem(bdo+"placeRegionPoly")[0].value)
         regBox = bbox(doRegion)
         regBox = [ [regBox[1],regBox[0]], [regBox[3],regBox[2]] ]
         //loggergen.log("reg",doRegion,regBox)
      }

      return { doMap, doRegion, regBox }
   }

   getWorkLocation = (elem, withTag = true, node) => {
      let _elem = elem
      if(elem && Array.isArray(elem) && elem[0]) {
         
         if(!node) elem = this.getResourceBNode(elem[0].value)
         else elem = node

         let str = ""

         let monoVol = this.getResourceElem(bdo+"numberOfVolumes")
         if(monoVol && monoVol.length && monoVol[0].value === "1") monoVol = true
         else monoVol = false

         //loggergen.log("loca:",elem,monoVol,withTag,node)

         if(!elem) return [<h4><Link to={"/show/"+shortUri(_elem[0].value)}>{shortUri(_elem[0].value)}</Link></h4>]

         let loca = s => (elem && elem[bdo+"contentLocation"+s] && elem[bdo+"contentLocation"+s][0] && elem[bdo+"contentLocation"+s][0]["value"] ? elem[bdo+"contentLocation"+s][0]["value"]:null)
               

         let stat = loca("Statement")

         let vol = loca("Volume")
         let p = loca("Page")
         let l = loca("Line")
         let eV = loca("EndVolume")
         let eP = loca("EndPage")
         let eL = loca("EndLine")

         let oneP = false
         if( (eV === vol || !vol ) && p === eP) oneP = true

         if(vol) str = I18n.t("resource.volume",{num:vol})+" " ;
         else monoVol = true
         if(p) str += I18n.t("resource.page",{num:p}) ;
         if(l) str += "|"+l ;
         if(!oneP) {
            if(str && p) str += " - "
            if(eV) str += I18n.t("resource.volume",{num:eV})+" " ;
            if(eP) str += I18n.t("resource.page",{num:eP}) ;
            if(eL) str += "|"+eL ;
         }

         let w = loca("Instance")

         if(withTag) { 
   
            if(stat) { 
               if(Array.isArray(stat)) str = stat.join(" / ")
               else str = stat
            }


            if(vol || monoVol) 
               
               return ( 
                  [<Tooltip placement="bottom-start" style={{marginLeft:"50px"}} title={
                           <div style={{margin:"10px"}}>
                              {vol && <div><span>{I18n.t("location.beginV",{num:vol})}</span></div>}
                              {p && <div><span>{I18n.t("location.beginP",{num:p})}</span></div>}
                              {l && <div><span>{I18n.t("location.beginL",{num:l})}</span></div>}
                              {eV && <div><span>{I18n.t("location.endV",{num:eV})}</span></div>}
                              {eP && <div><span>{I18n.t("location.endP",{num:eP})}</span></div>}
                              {eL && <div><span>{I18n.t("location.endL",{num:eL})}</span></div>}
                           </div>
                        }>
                           <h4>{str}{str && w && <span class="of"> {I18n.t("misc.of")}</span>} {w && this.uriformat(bdo+"contentLocationInstance",{value:w})}{this.hoverMenu()}</h4>
                     </Tooltip>]
               );
            else if(w)
               return [<h4>{this.uriformat(bdo+"contentLocationInstance",{value:w})}</h4>]
         }
         else return loca("Volume") //str.replace(/^Vol[.]/,"")
      }
   }

   renderMap = (elem, k, tags, kZprop, doMap, doRegion, regBox, title) => {

      const { BaseLayer} = LayersControl;

      //loggergen.log("map",elem, k, tags, kZprop, doMap, doRegion, regBox, title)

      return ( 
         <div data-prop={shortUri(k)}>
            <h3><span>{this.proplink(k)}{I18n.t("punc.colon")}</span>&nbsp;</h3>
            { k == bdo+"placeLong" && tags }
            <div class="map"> {/* style={ {width:"100%",marginTop:"10px"} }> */}
               {  <Map ref={m => { this._leafletMap = m; }}
                  className={"placeMap"} // + (this.state.largeMap?" large":"")}
                  // style={{boxShadow: "0 0 5px 0px rgba(0,0,0,0.5)"}}
                  center={doMap} zoom={5} bounds={doRegion?regBox:null}
                  //attributionControl={false}
                  >
                  <LayersControl position="topright">
                     { this.props.config.googleAPIkey && [
                        <BaseLayer name='Satellite+Roadmap'>

                           <GoogleLayer googlekey={this.props.config.googleAPIkey} maptype='HYBRID'
                                 //attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;></a> contributors"
                                 attribution="&amp;copy 2018 Google"
                           />
                        </BaseLayer>,
                        <BaseLayer checked name='Terrain'>
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
               </Map> }
            </div>
         </div> 
      )
   }


   renderGenericProp = (elem, k, tags, hasMaxDisplay) => {

      let ret,isSub
      if(this.hasSub(k)) { 
         isSub = true
         ret = this.subProps(k)
      }
      if(!ret || ret.length === 0) ret = tags.reduce((acc,e)=> [...acc, e /*," "*/], [] )

      let expand
      let maxDisplay = 9
      if(k === bdo+"workHasInstance") maxDisplay = 10 ;
      if(hasMaxDisplay) maxDisplay = hasMaxDisplay ;

      let n = 0
      if(elem && elem.filter) n = elem.filter(t=>t && ( (t.type === "uri" && (k !== bdo+"workHasInstance" || t.value.match(/[/]MW[^/]+$/))) || t.type === "literal")).length
      ret = this.insertPreprop(k, n, ret)

      //loggergen.log("genP",elem,k,maxDisplay,n)

      if(!isSub && n > maxDisplay) {      
         /* CSS columns won't balance evenly
         let nb = Math.ceil(maxDisplay / 2)
         let i0 = nb ;
         if(this.state.collapse[k]) i0 = Math.ceil(n / 2)
         let i1 = nb, nb1 = i0 - nb, i2 = i0 + nb
         */

         let show = this.state.collapse[k]
         if(hasMaxDisplay === -1 /*&& ![bf+"identifiedBy",bdo+"note"].includes(k)*/ && this.state.collapse[k] === undefined) show = true ; 

         return (
            <div data-prop={shortUri(k)} class={"has-collapse custom max-"+(maxDisplay)+" "+(n%2===0?"even":"odd") }>
               <h3><span>{this.proplink(k,null,n)}{I18n.t("punc.colon")}</span></h3>
               <div className={"propCollapseHeader in-"+(this.state.collapse[k]===true)}>
                  {ret.slice(0,maxDisplay)}
                  { (false || (!this.state.collapse[k] && hasMaxDisplay !== -1) ) && <span
                     onClick={(e) => this.setState({...this.state,collapse:{...this.state.collapse,[k]:!this.state.collapse[k]}})}
                     className="expand">
                        {I18n.t("misc."+(this.state.collapse[k]?"hide":"seeMore")).toLowerCase()}&nbsp;<span
                        className="toggle-expand">
                           { this.state.collapse[k] && <ExpandLess/>}
                           { !this.state.collapse[k] && <ExpandMore/>}
                     </span>
                  </span> }
               </div> 
               <Collapse timeout={{enter:0,exit:0}} className={"propCollapse in-"+(show===true)} in={show}>
                  {ret}
               </Collapse>
               {/* // failure with CSS columns
               <div className={"propCollapseHeader in-"+(this.state.collapse[k]===true)}>
                  {ret.slice(0,nb)}
                  {ret.slice(i0,i0+nb)}
               </div> 
               <Collapse className={"propCollapse in-"+(this.state.collapse[k]===true)} in={this.state.collapse[k]}>
                  {ret.slice(i1,i1+nb1)}
                  {ret.slice(i2,n)}
               </Collapse> */}
               { (this.state.collapse[k] || hasMaxDisplay === -1) && <span
               onClick={(e) => this.setState({...this.state,collapse:{...this.state.collapse,[k]:!show}})}
               className="expand">
                  {I18n.t("misc."+(show?"hide":"seeMore")).toLowerCase()}&nbsp;<span
                  className="toggle-expand">
                     { show && <ExpandLess/>}
                     { !show && <ExpandMore/>}
                  </span>
               </span> }
            </div>
         )
      }
      else {
         return (
            <div  data-prop={shortUri(k)} {...(k===bdo+"note"?{class:"has-collapse custom"}:{})}>               
               <h3><span>{this.proplink(k,null,n)}{I18n.t("punc.colon")}</span> </h3>
               {this.preprop(k,0,n)}
               <div className={k === bdo+"personTeacherOf" || k === bdo + "personStudentOf" ? "propCollapseHeader in-false":"group"}>
               {ret}               
               </div>
            </div>
         )
      }
   }


   samePopup(same,id,noS) {

      let list = [], useRid = []

      if(same && same.length) { 
         
         let viaf = same.filter(s => s.value.includes("viaf.org/"))
         if(viaf.length) {
            viaf = viaf[0].value
            if(viaf && !same.filter(s => s.value.includes("worldcat.org/")).length) same.push({value:viaf.replace(/^.*\/([^/]+)$/,"https://www.worldcat.org/identities/containsVIAFID/$1"),type:"uri"})
         } 
            

         let mapSame = same.map(s => {
            //loggergen.log("s.val:",s.value)

            let prefix = shortUri(s.value).split(":")[0]
            if(prefix.startsWith("http") && s.fromSeeOther) prefix = s.fromSeeOther
            // TODO fix Sakya Research Center
            if(!list.includes(prefix)) {
               list.push(prefix)
               return <span class={"provider "+prefix}>{provImg[prefix]?<img src={provImg[prefix]}/>:<span class="img">{prefix.replace(/^cbc.$/,"cbc@").toUpperCase()}</span>}</span>
            } else {
               useRid.push(prefix)
            }
         })

         return ([
    
            <span id="same" title={I18n.t("resource.sameL",{count:same.length})} class={noS?"PE0":""} onClick={(e) => this.setState({...this.state,anchorPermaSame:e.currentTarget, collapse: {...this.state.collapse, ["permaSame-"+id]:!this.state.collapse["permaSame-"+id] } } ) }>
               { id === "permalink" && <span>{I18n.t("misc.link",{count:mapSame.length})}</span> }
               { mapSame}
            </span>,

            <Popover
               id="popSame"
               open={this.state.collapse["permaSame-"+id]?true:false}
               transformOrigin={{vertical:'bottom',horizontal:'right'}}
               anchorOrigin={{vertical:'top',horizontal:'right'}}
               anchorEl={this.state.anchorPermaSame}
               onClose={e => { this.setState({...this.state,anchorPermaSame:null,collapse: {...this.state.collapse, ["permaSame-"+id]:false } } ) }}
               >
               { same.map(s => { 
                     let link = s.value, prov = shortUri(s.value).split(":")[0], name = I18n.t("result.resource")
                     if(prov.startsWith("http") && s.fromSeeOther) prov = s.fromSeeOther
                     let data,tab ;
                     if(this.props.assocResources) data = this.props.assocResources[s.value]                  
                     if(data && (tab=data.filter(t => t.fromKey === adm+"canonicalHtml")).length) link = tab[0].value                       
                     
                     // DONE case when more than on resource from a given provider (cf RKTS)
                     let useR = !useRid.includes(prov)
                     
                     let open = <MenuItem>{I18n.t("result.open")} {useR && name} {!useR && <emph> {shortUri(s.value)} </emph>}{I18n.t("misc.in")} &nbsp;<b>{providers[prov]}</b><img src="/icons/link-out.svg"/></MenuItem>
                     if(s.isOrig) open = <MenuItem style={{display:"block",height:"32px",lineHeight:"12px"}}>{I18n.t("popover.imported")} <b>{providers[prov]}</b><br/>{I18n.t("popover.seeO")}<img style={{verticalAlign:"middle"}} src="/icons/link-out.svg"/></MenuItem>

                     //loggergen.log("permaSame",s,data,tab,link,name,prov) 

                     if(this.props.config && this.props.config.chineseMirror) link = link.replace(new RegExp(cbeta), "http://cbetaonline.cn/")

                     if(prov != "bdr") return (<a target="_blank" href={link  /*.replace(/^https?:/,"") */ }>{open}</a>) // keep original http/s prefix (#381)
               } ) }
            </Popover>
         ])
      }
   }

perma_menu(pdfLink,monoVol,fairUse,other)
{
   let that = this


   let legal = this.getResourceElem(adm+"metadataLegal"), legalD, sameLegalD
   if(legal && legal.length) legal = legal.filter(p => !p.fromSameAs)
   if(legal && legal.length && legal[0].value && this.props.dictionary) { 
      legalD = this.props.dictionary[legal[0].value]
      sameLegalD = legalD
      if(legalD) legalD = legalD[adm+"license"]
      if(legalD && legalD.length && legalD[0].value) legalD = legalD[0].value
   }

   let cLegal = this.getResourceElem(adm+"contentLegal"), cLegalD
   if(cLegal && cLegal.length) cLegal = cLegal.filter(p => !p.fromSameAs)
   if(cLegal && cLegal.length && cLegal[0].value && this.props.dictionary) { 
      cLegalD = this.props.dictionary[cLegal[0].value]
      if(cLegalD) cLegalD = cLegalD[adm+"license"]
      if(cLegalD && cLegalD.length && cLegalD[0].value) cLegalD = cLegalD[0].value
   }

   let copyR = ""  //"open_unknown" ;
   if((cLegalD && cLegalD.endsWith("CC0"))||(!cLegalD && legalD && legalD.endsWith("CC0"))) copyR = "open" ;
   else if((cLegalD && cLegalD.endsWith("PublicDomain"))||(!cLegalD && legalD && legalD.endsWith("PublicDomain"))) copyR = "open" ;
   else if((cLegalD && cLegalD.endsWith("AllRightsReserved"))||(!cLegalD && legalD && legalD.endsWith("AllRightsReserved"))) copyR = "not_open" ;
   else if((cLegalD && cLegalD.endsWith("Undetermined"))||(!cLegalD && legalD && legalD.endsWith("Undetermined"))) copyR = "open_unknown" ;
   // TODO other kind of licenses ?

   //loggergen.log("legal",cLegal,cLegalD,legal,legalD)

   let same = this.getResourceElem(owl+"sameAs")
   if(!same || !same.length) same = [] 
   for(let o of other) { 
      let osame = this.getResourceElem(o)
      if(osame) same = same.concat(osame.map(p => ({...p,fromSeeOther:o.replace(/.*seeOther/,"").toLowerCase()})))
   }
   if(!same.length && sameLegalD) { 
      let prov = sameLegalD[adm+"provider"]
      prov = this.getProviderID(prov)

      //else prov = ""

      let orig = this.getResourceElem(adm+"originalRecord")
      if(orig && orig.length) orig = orig[0].value
   
      //else orig = ""

      //loggergen.log("prov,orig",prov,orig)

      if(prov && orig) same = [ { fromSeeOther:prov.toLowerCase(), value:orig, isOrig:true } ]
   }
   let noS = false
   if(!same.length) { 
      if (!this.props.IRI.startsWith("bda:")) {
         same = same.concat([{ type:"uri", value:fullUri(this.props.IRI)}])
         if(this.props.IRI.startsWith("bdr:")) noS = true      
      }
      else {
         // change url to bdr: to display icon
         same = same.concat([{ type:"uri", value:fullUri(this.props.IRI).replace(/admindata/,"resource")}])
         noS = true
      }
   }
   

   let isEtextVol = false
   if(this.props.IRI && getEntiType(this.props.IRI) === "Etext") {
      let isVol = this.getResourceElem(bdo+"eTextIsVolume")
      if(isVol && isVol.length) isEtextVol = true
      else {
         isVol = this.getResourceElem(bdo+"eTextInVolume")
         if(isVol && isVol.length) isEtextVol = true
      }
   }



   //loggergen.log("same:",same)

   // TODO 
   // + fix bdr:G3176 (sameAs Shakya Research Center)
   // + use <Tooltip/> instead of title="""

   return (

    <div>

       { that.props.IRI && <CopyToClipboard text={"http://purl.bdrc.io/resource/"+that.props.IRI.replace(/^bdr:/,"")} onCopy={(e) =>
                //alert("Resource url copied to clipboard\nCTRL+V to paste")
                prompt(I18n.t("misc.clipboard"),fullUri(that.props.IRI))
          }>

          <a id="permalink" style={{marginLeft:"0px"}} title={I18n.t("misc.permalink")}>
             <img src="/icons/PLINK.png"/>{/* <ShareIcon /> */}
             <span>{I18n.t("misc.permalink")}</span>
          </a>
       </CopyToClipboard> }

      { that.props.IRI && <span id="rid">{shortUri(that.props.IRI)}</span> }

      <span id="DL" onClick={(e) => this.setState({...this.state,anchorPermaDL:e.currentTarget, collapse: {...this.state.collapse, permaDL:!this.state.collapse.permaDL } } ) }>
      {I18n.t("resource.download")} { this.state.collapse.permaDL ? <ExpandLess/>:<ExpandMore/>}
      </span>


      { cLegalD && <span id="copyright" title={this.fullname(cLegalD,false,false,true,false)}><img src={"/icons/"+copyR+".png"}/></span> }

         {this.samePopup(same,"permalink",noS)}

         <Popover
            id="popDL"
            open={this.state.collapse.permaDL}
            anchorEl={this.state.anchorPermaDL}
            onClose={e => { this.setState({...this.state,anchorPermaDL:null,collapse: {...this.state.collapse, permaDL:false } } ) }}
            >

               { (this.props.eTextRefs && this.props.eTextRefs.mono) && 
                     <a target="_blank" title={I18n.t("resource.version",{format:"TXT"})} rel="alternate" type="text"  download href={this.props.eTextRefs.mono.replace(/bdr:/,bdr)+".txt"}>
                        <MenuItem>{I18n.t("resource.exportDataAs",{data: I18n.t("types.etext"), format:"TXT"})}</MenuItem>
                     </a> }

               { isEtextVol && 
                     <a target="_blank" title={I18n.t("resource.version",{format:"TXT"})} rel="alternate" type="text"  download href={this.props.IRI?this.props.IRI.replace(/bdr:/,bdr)+".txt":""}>
                        <MenuItem>{I18n.t("resource.exportDataAs",{data: I18n.t("types.etext"), format:"TXT"})}</MenuItem>
                     </a> }

               { pdfLink && 
                  ( (!(that.props.manifestError && that.props.manifestError.error.message.match(/Restricted access/)) /*&& !fairUse*/) || (that.props.auth && that.props.auth.isAuthenticated()))
                  &&
               <a> <MenuItem title={I18n.t("resource.downloadAs")+" PDF/ZIP"} onClick={ev =>
                      {
                         //if(that.props.createPdf) return ;
                          if((monoVol && monoVol.match && monoVol.match(/[^0-9]/)) || monoVol > 0){
                            that.props.onInitPdf({iri:that.props.IRI,vol:monoVol},pdfLink)
                          }
                          else if(!that.props.pdfVolumes) {
                            that.props.onRequestPdf(that.props.IRI,pdfLink)
                         }
                         that.setState({...that.state, collapse:{...this.state.collapse,permaDL:false}, pdfOpen:true,anchorElPdf:({...ev}).currentTarget})
                      }
                   }>
                   {I18n.t("resource.exportDataAs",{data: "images", format:"PDF/ZIP", interpolation: {escapeValue: false}}) /* TODO use i18next interpolation with nesting '$t(types.images)'*/ }
                </MenuItem></a>  }

               { !that.props.manifestError && that.props.imageAsset &&

                       <CopyToClipboard text={that.props.imageAsset} onCopy={(e) =>
                                 //alert("Resource url copied to clipboard\nCTRL+V to paste")
                                 prompt(I18n.t("misc.clipboard"),that.props.imageAsset)
                           }>
                           <a><MenuItem>{I18n.t("resource.exportData",{data: "IIIF manifest"})}</MenuItem></a>
                        </CopyToClipboard>

                   }

               <a target="_blank" title={I18n.t("resource.version",{format:"TTL"})} rel="alternate" type="text/turtle" href={that.expand(that.props.IRI, true)+".ttl"} download>
                  <MenuItem>{I18n.t("resource.exportDataAs",{data: "metadata", format:"TTL"})}</MenuItem>
               </a>
               
               <a target="_blank" title={I18n.t("resource.version",{format:"JSON-LD"})} rel="alternate" type="application/ld+json" href={that.expand(that.props.IRI, true)+".jsonld"} download>
                  <MenuItem>{I18n.t("resource.exportDataAs",{data: "metadata", format:"JSON-LD"})}</MenuItem>           
               </a>

               { that.props.IRI && that.props.IRI.match(/bdr:MW/) && [
                     <a target="_blank" title={I18n.t("resource.version",{format:"MARC"})} rel="alternate" type="application/marc" href={that.expand(that.props.IRI, true)+".mrc"} download>
                        <MenuItem>{I18n.t("resource.exportDataAs",{data: "metadata", format:"MARC"})}</MenuItem>           
                     </a>,
                     <a target="_blank" title={I18n.t("resource.version",{format:"MARCXML"})} rel="alternate" type="application/marcxml+xml" href={that.expand(that.props.IRI, true)+".mrcx"} download>
                        <MenuItem>{I18n.t("resource.exportDataAs",{data: "metadata", format:"MARCXML"})}</MenuItem>           
                     </a> 
                  ]
                }
              
         </Popover>

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


                              let pdfMsg = I18n.t("resource.gener1pdf")
                              let zipMsg = "ZIP"

                              if(Ploading) {
                                 pdfMsg = I18n.t("resource.gener2pdf")
                                 zipMsg =  I18n.t("resource.gener1zip")
                              }

                              if(Ploaded) {
                                 pdfMsg = I18n.t("resource.gener3pdf")
                                 zipMsg =  I18n.t("resource.gener1zip")
                              }

                              if(Zloading) {
                                 zipMsg = I18n.t("resource.gener2zip")
                              }

                              if(Zloaded) {                                 
                                 zipMsg =  (Ploaded?"ZIP":I18n.t("resource.gener3zip"))
                              }

                              return (<ListItem className="pdfMenu">
                                     <b>{(e.volume !== undefined?(!e.volume.match || e.volume.match(/^[0-9]+$/)?"Volume ":"")+(e.volume):monoVol)}{I18n.t("punc.colon")}</b>
                                     <a onClick={ev => that.handlePdfClick(ev,e.link,e.pdfFile)}
                                        {...(Ploaded ?{href:e.pdfFile}:{})}
                                     >
                                        { Ploading && <Loader className="pdfSpinner" loaded={Ploaded} scale={0.35}/> }
                                        <span {... (Ploading?{className:"pdfLoading"}:{})}>{pdfMsg}</span>
                                     </a>
                                     <a onClick={ev => that.handlePdfClick(ev,e.link,e.zipFile,"zip")}
                                        {...(Zloaded ?{href:e.zipFile}:{})}
                                     >
                                        { Zloading && <Loader className="zipSpinner" loaded={Zloaded} scale={0.35}/> }
                                        <span {... (Zloading?{className:"zipLoading"}:{})}>{zipMsg}</span>
                                       </a>
                                       { that.props.IRI && getEntiType(that.props.IRI) === "Etext" && // TODO fix download etext
                                          <div> 

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
         
   </div>
  )
}


   renderEtextHasChunk = (elem, k, tags) => {

      let next, prev;
      if(elem && elem.length) { 
         prev = elem.filter(e => e.value && e.start !== undefined)
         next = elem.filter(e => e.value && e.end)
      }
      if(next && next.length) next = next[next.length - 1].end + 1
      else next = 0

      if(prev && prev.length) prev = -prev[0].start
      if(!prev) prev = -1


      //loggergen.log("etext",prev,next,elem,this.props.nextChunk,tags,this.hasSub(k))

      // + sort etext by sliceStartchar not seqNum
      // DONE 

      //return tags ; // what??

      return (
         
         <InfiniteScroll
            //isReverse={true}
            //id="etext-scroll"
            hasMore={true}
            pageStart={0}
            loadMore={(e) => { 
            
               //loggergen.log("next?",this.props.nextChunk,next,JSON.stringify(elem,null,3))

               if(next && this.props.nextChunk !== next) {                               
                  this.props.onGetChunks(this.props.IRI,next); 
               } 
            }
         }
         //loader={<Loader loaded={false} />}
         > {tags}
            {/* <h3 class="chunk"><span>{this.proplink(k)}:</span>&nbsp;{prev!==-1 && <a onClick={(e) => this.props.onGetChunks(this.props.IRI,prev)} class="download" style={{float:"right",fontWeight:700,border:"none"}}>Load Previous Chunks &lt;</a>}</h3> */}
               {/* {this.hasSub(k)?this.subProps(k):tags.map((e)=> [e," "] )} */}
            {/* // import make test fail...
               <div class="sub">
               <AnnotatedEtextContainer dontSelect={true} chunks={elem}/>
               </div>
            */}
         </InfiniteScroll>
      )
   }

   renderEtextHasPage = (elem, kZprop, iiifpres) => {

      let next, prev;
      if(elem && elem.length) { 
         prev = elem.filter(e => e.value && e.start !== undefined)
         next = elem.filter(e => e.value && e.end)
      }
      if(next && next.length) next = next[next.length - 1].end + 1
      else next = 0

      if(prev && prev.length) prev = -prev[0].start
      if(!prev) prev = -1

      
      let imageLinks ;
      if(this.state.imageLinks) imageLinks = this.state.imageLinks[this.props.IRI]
      if(!imageLinks) imageLinks = {}
      
      if(!this.props.imageVolumeManifests) // && !this.props.manifestError)
      {

         let elem = this.getResourceElem(tmp+"imageVolumeId")
         if(elem && elem.length)
         {
            //loggergen.log("elem",elem)
            for(let e of elem) {
               this.props.onImageVolumeManifest(iiifpres+"/v:"+ e.value.replace(new RegExp(bdr), "bdr:") + "/manifest",this.props.IRI);
            }
         }
      }
      else if(this.props.imageVolumeManifests !== true) for(let id of Object.keys(this.props.imageVolumeManifests)) {

         if(!imageLinks[id])
         {
            let manif = this.props.imageVolumeManifests[id]
            let imageList = this.props.imageLists, iiifpres = "//iiifpres.bdrc.io", iiif = "//iiif.bdrc.io"            
            if(imageList) imageList = imageList[id]
            
            loggergen.log("k:",id,manif,imageList)

            if(this.props.config && this.props.config.iiifpres) iiifpres = this.props.config.iiifpres.endpoints[this.props.config.iiifpres.index]      
            if(this.props.config && this.props.config.iiif) iiif = this.props.config.iiif.endpoints[this.props.config.iiif.index]      
            // DONE prepare all images at once, not just according to etext pages that are already loaded
            imageLinks[id] = imageList.reduce( (acc,e,i) => {               
               let can, image, file
               file = imageList[i].filename
               if(file) {                                 
                  can = iiifpres + "/v:" + id + "/canvas/" + file
                  image = iiif + "/" + id + "::" + file + "/full/"+(imageList[i].width > 3500 ? "3500,":"max")+"/0/default.jpg"
                  return {...acc, [i+1]: { id:can, image } }
               }
               return acc ;
            }, {})
            this.setState({ ...this.state,imageLinks:{...this.state.imageLinks, [this.props.IRI]: imageLinks } })

            
               /*
            if(manif && manif.sequences && manif.sequences[0] && manif.sequences[0].canvases) {
               
               let nc = 0, np = 0                           
               imageLinks[id] = manif.sequences[0].canvases.reduce( (acc,e,i) => {
                  if(e.label) { 
                     //loggergen.log("label",e.label)
                     return ({
                        ...acc, [Number((""+(Array.isArray(e.label)?e.label[0]["@value"]:e.label["@value"])).replace(/[^0-9]/g,""))]:{id:e["@id"],image:(e.images?e.images[0].resource["@id"]:null) }
                     })
                  }
                  else {
                     //loggergen.log("no lab",e)
                     return acc ; 
                  }
               },{})
               //loggergen.log("imaL",imageLinks)
               this.setState({ ...this.state,imageLinks:{...this.state.imageLinks, [this.props.IRI]: imageLinks } })
            }
               */
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
         //loggergen.log("num?",num)
         window.MiradorUseEtext = true ; 
         this.showMirador(num,manif);
      }

      //loggergen.log("imL:",imageLinks,JSON.stringify(elem,null,3))

      let kw 

      if(this.props.highlight && this.props.highlight.key) {
         kw = getLangLabel(this,"",[{value:lucenequerytokeyword(this.props.highlight.key), lang:this.props.highlight.lang}])
         if(kw) kw = kw.value         
      }

      let unpag = this.unpaginated()

      return (
         
         [<InfiniteScroll
            id="etext-scroll"
            hasMore={true}
            pageStart={0}
            loadMore={(e) => { 
            
               //loggergen.log("next?",this.props.nextChunk,next,JSON.stringify(elem,null,3))

               if(next && this.props.nextPage !== next) {                               
                  this.props.onGetPages(this.props.IRI,next); 
               } 
            }
         }
         //loader={<Loader loaded={false} />}
         >
         { prev!==-1 && <h3 style={{marginBottom:"20px",width:"100%",textAlign:"right"}}><a onClick={(e) => this.props.onGetPages(this.props.IRI,prev)} class="download" style={{fontWeight:700,border:"none",textAlign:"right"}}>{I18n.t("resource.loadP")} &lt;</a></h3>}
         {/* {this.hasSub(k)?this.subProps(k):tags.map((e)=> [e," "] )} */}
         { elem.map( e => { 

               let pageVal ="", pageLang = "", current = []

            let showIm = ((this.state.showEtextImages && !(this.state.collapse["image-"+this.props.IRI+"-"+e.seq] === false)) || this.state.collapse["image-"+this.props.IRI+"-"+e.seq])

            return (
            <div class={"etextPage"+(this.props.manifestError&&!imageLinks?" manifest-error":"")+ (!e.value.match(/[\n\r]/)?" unformated":"") + (e.seq?" hasSeq":"")/*+(e.language === "bo"?" lang-bo":"")*/ }>
               {/*                                          
                  e.seq && this.state.collapse["image-"+this.props.IRI+"-"+e.seq] && imageLinks[e.seq] &&
                  <img title="Open image+text view in Mirador" onClick={eve => { openMiradorAtPage(imageLinks[e.seq].id) }} style={{maxWidth:"100%"}} src={imageLinks[e.seq].image} />
               */}
               {
                  e.seq && showIm && Object.keys(imageLinks).sort().map(id => {
                     if(!this.state.collapse["imageVolume-"+id] && imageLinks[id][e.seq]) 
                        return (
                           <div class="imagePage">
                              <img class="page" title="Open image+text reading view" src={imageLinks[id][e.seq].image} onClick={eve => { 
                                 let manif = this.props.imageVolumeManifests[id]
                                 window.MiradorUseEtext = "open" ;                                 
                                 this.showMirador(imageLinks[id][e.seq].id,manif["@id"]);
                                 //openMiradorAtPage(imageLinks[id][e.seq].id,manif["@id"])
                              }}/>          
                              {/*}
                              <div class="small"><a title="Open image+text reading view" onClick={eve => { 
                                 let manif = this.props.imageVolumeManifests[id]
                                 openMiradorAtPage(imageLinks[id][e.seq].id,manif["@id"])
                              }}>p.{e.seq}</a> from {this.uriformat(null,{value:id.replace(/bdr:/,bdr).replace(/[/]V([^_]+)_I.+$/,"/W$1")})}                                                      
                              { imageLinks && Object.keys(imageLinks).length > 1 && <span class="button hide" title={"Hide this image volume"} 
                                 onClick={(eve) => {
                                    this.setState({...this.state, collapse:{...this.state.collapse, ["imageVolume-"+id]:true}}) 
                                 }}> 
                                 <VisibilityOff/>
                              </span>  }
                              <br/>
                              </div>
                              */}        
                           </div>
                        )
                  })
               }
               { e.seq && <div> 
                  { !unpag && <span class="button" title={I18n.t("misc."+(!showIm?"show":"hide"))+" "+I18n.t("available scans for this page")} 
                  onClick={(eve) => {
                        let id = "image-"+this.props.IRI+"-"+e.seq
                        this.setState({...this.state, collapse:{...this.state.collapse, [id]:!showIm}}) 
                     }}> 
                     <img src="/icons/image.svg"/>
                  </span> }
                  {/* { <h5><a title="Open image+text view in Mirador" onClick={eve => { openMiradorAtPage(imageLinks[e.seq].id) }}>p.{e.seq}</a></h5> } */}
                  {   !unpag && <h5><a title={I18n.t("misc."+(!showIm?"show":"hide"))+" "+I18n.t("available scans for this page")} onClick={(eve) => {
                        let id = "image-"+this.props.IRI+"-"+e.seq
                        this.setState({...this.state, collapse:{...this.state.collapse, [id]:!showIm}}) 
                     }}>{I18n.t("resource.page",{num:e.seq})}</a>                                             
                     </h5> }
                     { unpag && <h5><a class="unpag" title={I18n.t("resource.unpag")}>{I18n.t("resource.pageN",{num:e.seq})}</a></h5>}
                     &nbsp;
                     { Object.keys(imageLinks).sort().map(id => {
                        if( /* !this.state.collapse["imageVolume-"+id] &&*/ imageLinks[id][e.seq]) 
                           return (
                                 <h5>{I18n.t("misc.from")} {this.uriformat(null,{value:id.replace(/bdr:/,bdr).replace(/[/]V([^_]+)_I.+$/,"/W$1")})}</h5>
                           )
                     })}

                     { imageLinks && Object.keys(imageLinks).length > 1 && <span class="button close" data-seq={"image-"+this.props.IRI+"-"+e.seq} title="Configure which image volumes to display" 
                        onClick={e => { 
                           $(e.target).closest(".button").addClass("show");
                           this.setState({...this.state,
                              collapse:{...this.state.collapse, imageVolumeDisplay:!this.state.collapse.imageVolumeDisplay},
                              anchorElemImaVol:e.target
                           })} }
                        >
                        <SettingsApp/>
                     </span> }

               </div> }
               <div class="overpage">
                  <h4 class="page">{!e.value.match(/[\n\r]/) && !e.seq ?[<span class="startChar"><span>[&nbsp;<Link to={"/show/"+this.props.IRI+"?startChar="+e.start+"#open-viewer"}>@{e.start}</Link>&nbsp;]</span></span>]:null}{e.value.split("\n").map(f => {
                        let label = getLangLabel(this,"",[{"lang":e.language,"value":f}]), lang
                        if(label) { lang = label["lang"] ; if(!pageLang) pageLang = lang }
                        if(label) { label = label["value"]; pageVal += " "+label ; }
                        if(label && this.props.highlight && this.props.highlight.key) { label = highlight(label,kw); current.push(label); }
                        //label = f
                        let size = this.state.etextSize
                        if(lang === "bo") { size += 0.4 ; }
                        return ([<span lang={lang} {...this.state.etextSize?{style:{ fontSize:size+"em", lineHeight:(size * 1.0)+"em" }}:{}}>{label}</span>,<br/>])})}
                        {this.hoverMenu(bdo+"EtextHasPage",{value:pageVal,lang:pageLang,start:e.start,end:e.end},current)}
                  </h4>
               </div>
            </div>)})  }
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

   renderRoles = () => {

      let assoP 

      if(["Role"].indexOf(getEntiType(this.props.IRI)) !== -1 && this.props.assocResources && Object.keys(this.props.assocResources).length > 0 )
         return (
            <div>
               <h3><span>Associated Persons:</span>&nbsp;</h3>
            {   this.props.assocResources &&
                  (assoP = Object.keys(this.props.assocResources).filter(e => !this.props.assocResources[e].filter(f => f.fromKey).length)).map((e,i) =>
                        i<20?
                           <h4 class={assoP.length>1 ? "multiple" : ""}>{this.uriformat(tmp+"AssociatedPersons",{value:e})}</h4>
                        :(i==20?
                           <h4 class="multiple"><a href={'/search?r='+this.props.IRI}>browse all</a>)</h4>:null))
            }
            </div>
         )
   }

   renderData = (kZprop, iiifpres, title, otherLabels, div = "", hash = "") => {

      let { doMap, doRegion, regBox } = this.getMapInfo(kZprop);

      //loggergen.log("data!",kZprop)

      let data = kZprop.map((k) => {

            let elem = this.getResourceElem(k);
            let hasMaxDisplay ;

            //loggergen.log("prop",k,elem,this.hasSuper(k))
            //for(let e of elem) loggergen.log(e.value,e.label1);

            //if(!k.match(new RegExp("Revision|Entry|prefLabel|"+rdf+"|toberemoved"))) {
            if(elem && 
               (!k.match(new RegExp(adm+"|adm:|isRoot$|SourcePath|"+rdf+"|toberemoved|entityScore|associatedCentury|lastSync|dateCreated|inRootInstance|workPagination|partIndex|partTreeIndex|legacyOutlineNodeRID|sameAs|thumbnailIIIFService|instanceOf|instanceReproductionOf|instanceHasReproduction|seeOther|(Has|ction)Member$|withSameAs|first(Text|Vol)N?"+(this._dontMatchProp?"|"+this._dontMatchProp:"")))
               ||k.match(/(metadataLegal|contentProvider|replaceWith)$/)
               //||k.match(/([/]see|[/]sameAs)[^/]*$/) // quickfix [TODO] test property ancestors
               || (this.props.IRI.match(/^bda:/) && (k.match(new RegExp(adm+"|adm:"))) && !k.match(/\/(git[RP]|adminAbout|logEntry|graphId|facetIndex)/)))
            && (k !== bdo+"eTextHasChunk" || kZprop.indexOf(bdo+"eTextHasPage") === -1) 
            && ( (k !== bdo+"hasPart" && k !== bdo+"partOf") || !this.props.outline || this.props.outline === true) 
            )
            {

               let sup = this.hasSuper(k)
               
               if(k === skos+"prefLabel") { //} && !this.props.authUser) {
                  if(!otherLabels || !otherLabels.length)
                     return ;               
                  else if(!this.getResourceElem(skos+"altLabel")) //if(kZprop.indexOf(skos+"altLabel") === -1)
                     k = skos+"altLabel"                                    
                  else 
                     return
                  
               }
               
               if(!sup) // || sup.filter(e => e.value == bdo+"workRefs").length > 0) //
               {
                  let allLabels
                  if(k === skos+"altLabel" && otherLabels && otherLabels.length && !this.props.authUser) {
                     allLabels = this.getResourceElem(k)
                     if(!allLabels) allLabels = []
                     allLabels = [ ...otherLabels, ...allLabels ].map(l => {
                        let lang
                        if(l["lang"]) lang = l["lang"] ; else if(l["xml:lang"]) lang = l["@language"] ; else if(l["xml:lang"]) lang = l["xml:lang"] ;
                        let index = 100
                        if(lang) for(let i in canoLang) { let c = canoLang[i].toLowerCase(); if(lang.match(new RegExp("^"+c))) { index = i ; break ; } }
                        return { index1:index, index2:lang, l }
                     })
                     allLabels = _.orderBy(allLabels, ['index1','index2']).map(a => a.l)
                     elem = allLabels
                     let hasCano 
                     for(let i in allLabels) {
                        let l = allLabels[i]
                        let lang, found
                        if(l["lang"]) lang = l["lang"] ; else if(l["xml:lang"]) lang = l["@language"] ; else if(l["xml:lang"]) lang = l["xml:lang"] ;                        
                        if(lang) for(let c of canoLang) { c = c.toLowerCase(); if(lang.match(new RegExp("^"+c))) { found = true; hasCano = true ; break ; } }
                        if(hasCano && !found && i < 10) { hasMaxDisplay = Number(i) ; break ; } 
                     }

                     //loggergen.log("hMd",allLabels,hasMaxDisplay)

                     /*
                     let sortLabel = []
                     let label = getLangLabel(this,"",allLabels,false,false,sortLabel,true)
                     allLabels = [ label, ...sortLabel ]
                     */
                  } 

                  let tags = this.format("h4",k,"",false,"sub",allLabels)

                  //loggergen.log("tags",tags,k,elem)

                  if(k == bdo+"note")
                  {
                     //loggergen.log("note",tags,k);//tags = [<h4>Note</h4>]
                  }           
                  else if(k == bdo+"contentLocation")
                  {
                     tags = this.getWorkLocation(elem)
                  }             
                  
                  if((!this.props.config || !this.props.config.chineseMirror) && (k == bdo+"placeRegionPoly" || (k == bdo+"placeLong" && !doRegion))) {
                     return this.renderMap(elem, k, tags, kZprop, doMap, doRegion, regBox, title)
                  }
                  else if(this.state.openEtext && k == bdo+"eTextHasPage") {
                     return this.renderEtextHasPage(elem, kZprop, iiifpres /*+"/2.1.1"*/)
                  }
                  else if(this.state.openEtext && k == bdo+"eTextHasChunk" && kZprop.indexOf(bdo+"eTextHasPage") === -1) {
                     return this.renderEtextHasChunk(elem, k, tags)                     
                  }
                  else if(k !== bdo+"eTextHasChunk" && k !== bdo+"eTextHasPage" ) {
                     return this.renderGenericProp(elem, k, tags, hasMaxDisplay) //div!=="ext-props"?hasMaxDisplay:-1)
                  }
               }
            }
         } ) 

      data = data.filter(e => e)

      //loggergen.log("data?",kZprop,data)

      if(data && data.length) return <div className={div!=="header"?"data "+div:div} {...hash?{id:hash}:{}}>
         {data}
         {/* // TODO not working anymore
         { this.renderRoles() } 
         */}
         { this.renderPostData() }           
      </div>
      
   }
   
   renderAnnoPanel = () => {
      return (
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
                     //loggergen.log("labs",labels,this.props.annoCollec[e])
                     let l = e
                     if(labels) {
                        /*
                        l = labels.filter((e) => (e.value && (e["lang"] == this.props.prefLang || e["xml:lang"] == this.props.prefLang)))[0]
                        if(!l || l.length == 0) l = labels.filter((e) => (e.value))[0]
                        */
                        l = getLangLabel(this, "", labels.filter((e) => (e.value)))
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
                     {I18n.t("Asidebar.title")}
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
                           {this.state.newAnno.prop}{I18n.t("punc.colon")} {this.state.newAnno.val}
                           <hr/>
                        </div> ,
                        <div class="sub">
                           <h4 class="first type">{this.proplink("http://purl.bdrc.io/ontology/admin/supportedBy")}{I18n.t("punc.colon")}</h4>
                           <div class="subsub new">
                              <TextField type="text" label="Assertion" multiline={true} fullWidth={true} rows={5} defaultValue={""} helperText="some short help text"/>
                              <TextField type="text" label="Location" multiline={true} fullWidth={true} rows={3} defaultValue={""} helperText="some short help text"/>
                              <TextField type="text" label="URL" multiline={true} fullWidth={true} rows={1} defaultValue={""} helperText="some short help text"/>
                           </div>
                        </div> ,
                        <div class="sub">
                           <h4 class="first type">{this.proplink("http://purl.bdrc.io/ontology/admin/statementScore")}{I18n.t("punc.colon")}</h4>
                           <div class="subsub new">
                              <TextField type="text" label="Value" multiline={true} fullWidth={true} rows={1} defaultValue={""} helperText="some short help text"/>
                           </div>
                        </div> ]
                     }
                  </div>
               </div>
            }
         </div>               
      )
   }

   renderWithdrawn = (withdrawn) => {

      if(withdrawn) return <h3 class="withdrawn"><WarnIcon/>This record has been withdrawn.<WarnIcon/></h3>
   }

   renderBrowseAssoRes = () => {
      if(this.props.resources && this.props.resources[this.props.IRI])
         return (

         <div class="data">
            <div class="browse">
               <Link className="download login" to={"/search?r="+this.props.IRI+"&t=Work"}>
                  &gt; {I18n.t("resource.browse")}
               </Link>
            </div>
         </div>
         )
   }

   renderHeader = (kZprop, T, etextUT) => {

      let imageLabel = "images"
      if(!this.props.collecManif && this.props.imageAsset && this.props.imageAsset.match(/[/]collection[/]/)) imageLabel = "collection"


      let src //= <div class="src"><img src="/logo.svg"/></div> 
      let legal = this.getResourceElem(adm+"metadataLegal"), legalD, sameLegalD
      if(legal && legal.length) legal = legal.filter(p => !p.fromSameAs)
      if(legal && legal.length && legal[0].value && this.props.dictionary) { 
         legalD = this.props.dictionary[legal[0].value]
         sameLegalD = legalD
      }
      let prov,orig
      if(sameLegalD) { 
         prov = sameLegalD[adm+"provider"]
         prov = this.getProviderID(prov)
         //else prov = ""

         orig = this.getResourceElem(adm+"originalRecord")
         if(orig && orig.length) orig = orig[0].value
         else orig = ""

         loggergen.log("prov x orig",prov,orig)

         if(prov !== "BDRC" && prov) {

            if(orig) 
               src = <div class="src orig" onClick={(e) => this.setState({...this.state,anchorPermaSame:e.currentTarget, collapse: {...this.state.collapse, ["permaSame-permalink"]:!this.state.collapse["permaSame-permalink"] } } ) }>
                  <img src={provImg[prov.toLowerCase()]}/>
               </div> 
            else  
               src = <div class="src">
                  <img src={provImg[prov.toLowerCase()]}/>
               </div> 

         }
      }
      let etext = this.isEtext()

      let iiifThumb = this.getResourceElem(tmp+"thumbnailIIIFService")
      if(iiifThumb && iiifThumb.length) iiifThumb = iiifThumb[0].value

      let handleViewer = (ev) => {
         if(ev.type === 'click') { 
            this.showMirador(null,null,true)
            ev.preventDefault();
            ev.stopPropagation();
            return false ;
         }
      }


      let viewUrl = { ...this.props.history.location }
      viewUrl.pathname = viewUrl.pathname.replace(/\/show\//,"/view/")
      viewUrl.search = "" 
      // TODO do we really need this now?
      if(this.props.langPreset) viewUrl.search = "?lang="+this.props.langPreset.join(",")

      let copyRicon

      let access = this.getResourceElem(adm+"access");
      if(access && access.length) access = access[0].value ;

      let hasCopyR = "" 
      if(access) {
         if(access.includes("FairUse")) hasCopyR = "fair_use"
         else if(access.includes("Temporarily"))  hasCopyR = "temporarily"; 
         else if(access.includes("Sealed"))  hasCopyR = "sealed";  
         else if(access.includes("Quality")) hasCopyR = "quality" ;
      }

      if(hasCopyR === "fair_use") copyRicon = <img class="access-icon" title={I18n.t("copyright.fairUse")} src="/icons/fair_use.svg"/>
      else if(hasCopyR === "temporarily") copyRicon = <img class="access-icon" title={I18n.t("copyright.tempo")} src="/icons/temporarily.svg"/>
      else if(hasCopyR === "sealed") copyRicon = <img class="access-icon" title={I18n.t("copyright.sealed")} src="/icons/sealed.svg"/>
      else if(hasCopyR === "quality") copyRicon = <img class="access-icon" title={I18n.t("copyright.quality")} src="/icons/unknown.svg"/>
      
      if(!this.state.imageError && iiifThumb && T === "Images") 
         return  ( 
            <div class="data simple" id="first-image">
               <a onClick={handleViewer} onContextMenu={handleViewer}  href={viewUrl.pathname+viewUrl.search} target="_blank" className={"firstImage "+(this.state.imageLoaded?"loaded":"")} 
               /*{...(this.props.config.hideViewers?{"onClick":() => this.showMirador(null,null,true),"style":{cursor:"pointer"}}:{})}*/ >
                  <Loader className="uvLoader" loaded={this.state.imageLoaded} color="#fff"/>
                  <img onError={(e)=>this.setState({...this.state,imageError:true})} onLoad={(e)=>this.setState({...this.state,imageLoaded:true,imageError:false})} src={iiifThumb+"/full/!1000,500/0/default.jpg"} /> 
               </a>
            </div>
         )
      else if(!this.props.manifestError &&  this.props.imageAsset && !etext)
         return  ( 
         <div class="data" id="first-image">
            <a onClick={handleViewer} onContextMenu={handleViewer} href={viewUrl.pathname+viewUrl.search} target="_blank" className={"firstImage "+(this.state.imageLoaded?"loaded":"")} 
               /*{...(this.props.config.hideViewers?{"onClick":this.showMirador.bind(this),"style":{cursor:"pointer"}}:{})}*/ >
               <Loader className="uvLoader" loaded={this.state.imageLoaded} color="#fff"/>
               { 
                  this.props.firstImage && 
                  <img onLoad={(e)=>this.setState({...this.state,imageLoaded:true})}
                     src={this.props.firstImage} 
                   /*src={`data:image/${this.props.firstImage.match(/png$/)?'png':'jpeg'};base64,${this.props.imgData}`}*/  
                  /> }
               { /* // deprecated 
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
                     { // this.props.config && this.props.config.hideViewers &&
                       // <div onClick={this.showMirador.bind(this)}>
                       //    <span>{I18n.t("resource.view")} {I18n.t("resource."+imageLabel)}</span>
                       //    <Fullscreen style={{transform: "scale(1.4)",position:"absolute",right:"3px",top:"3px"}}/>
                       // </div>
                     }
                  </div>
               */}
            </a>
         </div>
         )
      else if(kZprop.length && (!this.props.config || !this.props.config.chineseMirror))
         return <div class="data" id="map">{this.renderData(kZprop,null,null,null,"header")}</div>
      else if(etext && !(prov !== "BDRC" && prov && orig)) {
         let loca = this.props.history.location
         let view = loca.pathname+loca.search+"#open-viewer"
         if(etextUT) view = etextUT+"#open-viewer"
         return <div class="data" id="head"><Link title='View Etext' to={view}><div class={"header "+(!this.state.ready?"loading":"")}>{ !this.state.ready && <Loader loaded={false} /> }{src}{copyRicon}</div></Link></div>
      }
      else 
         return <div class="data" id="head"><div class={"header "+(!this.state.ready?"loading":"")}>{ !this.state.ready && <Loader loaded={false} /> }{src}{copyRicon}</div></div>   
   }

   // TODO case of part of instance after p.20 (see bdr:MW1KG2733_65CFB8)

   renderNoAccess = (fairUse) => {
      if(fairUse && (!this.props.auth || this.props.auth && !this.props.auth.isAuthenticated()) ) 
         return <div class="data access">
                  <h3>
                     <span style={{textTransform:"none"}}>
                     {/* {I18n.t("access.limited20")}<br/> */}
                     <Trans i18nKey="access.fairuse1" components={{ bold: <u /> }} /> { I18n.t("access.fairuse2")} <a href="mailto:help@bdrc.io">help@bdrc.io</a> { I18n.t("access.fairuse3")}
                     { /*this.props.locale !== "bo" && [ I18n.t("misc.please"), " ", <a class="login" onClick={this.props.auth.login.bind(this,this.props.history.location)}>{I18n.t("topbar.login")}</a>, " ", I18n.t("access.credentials") ] }
                     { this.props.locale === "bo" && [ I18n.t("access.credentials"), " ", <a class="login" onClick={this.props.auth.login.bind(this,this.props.history.location)}>{I18n.t("topbar.login")}</a> ] */ }
                   </span>
                  </h3>
               </div>
   }

   renderOCR = () => {
      let elem = this.getResourceElem(bdo+"contentMethod");
      console.log("OCR:",elem)
      if(elem && elem.length) elem = elem[0].value ;
      if(elem === bdr+"ContentMethod_OCR") {
         return <div class="data access"><h3><span style={{textTransform:"none"}}>{I18n.t("access.OCR")}</span></h3></div>
      }
   }

   // DONE check if this is actually used (it is)
   renderAccess = () => {


      let elem = this.getResourceElem(adm+"access");
      if(elem && elem.length) elem = elem[0].value ;

      if ( this.props.manifestError && this.props.manifestError.error.code === 404)
         return  <div class="data access"><h3><span style={{textTransform:"none"}}>{I18n.t("access.notyet")}</span></h3></div>
      else if ( this.props.manifestError && (!this.props.auth || this.props.auth && (this.props.manifestError.error.code === 401 || this.props.manifestError.error.code === 403) )) 
         if(elem && elem.includes("RestrictedSealed"))
            return  <div class="data access"><h3><span style={{textTransform:"none"}}><Trans i18nKey="access.sealed" components={{ bold: <u /> }} /> <a href="mailto:help@bdrc.io">help@bdrc.io</a>{I18n.t("punc.point")}</span></h3></div>
         else 
            //return  <div class="data access"><h3><span style={{textTransform:"none"}}>{I18n.t("misc.please")} <a class="login" {...(this.props.auth?{onClick:this.props.auth.login.bind(this,this.props.history.location)}:{})}>{I18n.t("topbar.login")}</a> {I18n.t("access.credentials")}</span></h3></div>
            return  <div class="data access"><h3><span style={{textTransform:"none"}}><Trans i18nKey="access.generic" components={{ policies: <a /> }} /></span></h3></div>
            
      else if ( this.props.manifestError && this.props.manifestError.error.code === 500 && this.props.IRI && !this.props.IRI.match(/^bdr:(IE|UT)/))
         return  <div class="data access"><h3><span style={{textTransform:"none"}}>{I18n.t("access.error")}</span></h3></div>
      
   }

   renderPdfLink = (pdfLink, monoVol, fairUse) => {
      if( (pdfLink) &&
                 ( (!(this.props.manifestError && this.props.manifestError.error.message.match(/Restricted access/)) && !fairUse) ||
                  (this.props.auth && this.props.auth.isAuthenticated())) )
         return [<div class="data"><div class="browse">
                  <a onClick={ ev => {
                        //if(that.props.createPdf) return ;
                        if((monoVol.match && monoVol.match(/[^0-9]/)) || monoVol > 0){
                           this.props.onInitPdf({iri:this.props.IRI,vol:monoVol},pdfLink)
                        }
                        else if(!this.props.pdfVolumes) {
                           this.props.onRequestPdf(this.props.IRI,pdfLink)
                        }
                        this.setState({...this.state, pdfOpen:true,anchorElPdf:ev.currentTarget})
                     }
                  } class="download login">&gt; Download images as PDF/ZIP</a>
                  <Loader loaded={(!this.props.pdfVolumes || this.props.pdfVolumes.length > 0)} options={{position:"relative",left:"115%",top:"-11px"}} />
               </div></div>]
   } 

   renderMirador = (isMirador) => {
      
      if(isMirador)
         return [<div id="fond" >
                  <Loader loaded={false} color="#fff"/>
               </div>,
               <div id="viewer"></div>,
               //<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/mirador@2.7.2/dist/css/mirador-combined.css"/>,
               //<Script url={"https://cdn.jsdelivr.net/npm/mirador@2.7.2/dist/mirador.js"}/>]
               <link rel="stylesheet" type="text/css" href="../scripts/mirador/css/mirador-combined.css"/>,
               <link rel="stylesheet" type="text/css" href="../scripts/src/lib/mirador.css"/>,
               <Script url={"../scripts/mirador/mirador.js"} onLoad={(e) => { require("@dbmdz/mirador-keyboardnavigation"); }} />,
            ]
   }

   // to be redefined in subclass
   renderPostData = () => {}

   renderEtextNav = () => {
    
      let etextSize = (inc:boolean=true) => {
         let size = this.state.etextSize ;
         if(!size) size = 1.0
         if(inc) size += 0.1
         else size -= 0.1
         this.setState({ etextSize: size })
      }

      let size = this.state.etextSize

      // DONE remove "show images" when not needed
      let showToggleScan = this.getResourceElem(bdo+"eTextHasPage")
      if(showToggleScan && showToggleScan.length && !this.unpaginated()) showToggleScan = (showToggleScan[0].seq !== undefined)
      else showToggleScan = false

      return (
         <div id="etext-nav">
            <div>
               <a id="DL" class="on" target="_blank" rel="alternate" type="text" download href={this.props.IRI?this.props.IRI.replace(/bdr:/,bdr)+".txt":""}>{I18n.t("mirador.downloadE")}<img src="/icons/DLw.png"/></a>
               <div id="control">
                  <span title={I18n.t("mirador.decrease")} class={!size||size > 0.6?"on":""} onClick={(e)=>etextSize(false)}><img src="/icons/Zm.svg"/></span>
                  <span title={I18n.t("mirador.increase")} class={!size||size < 2.4?"on":""} onClick={(e)=>etextSize(true)}><img src="/icons/Zp.svg"/></span>
                  {lang_selec(this,true)}
               </div>
               <a class={showToggleScan?"on":""} onClick={(e) => this.setState({showEtextImages:!this.state.showEtextImages})}>{this.state.showEtextImages?<img id="check" src="/icons/check.svg"/>:<span id="check"></span>}{I18n.t("mirador.showI")}<img width="42" src="/icons/search/images_b.svg"/></a>
            </div>
         </div>
      )
   }


   renderEtextRefs() {

      let toggle = (e,r,i,x = "",force) => {         
         let tag = "etextrefs-"+r+"-"+i+(x?"-"+x:"")
         let val = this.state.collapse[tag]
         if((r === i || force) && val === undefined) val = true ;
         this.setState( { collapse:{...this.state.collapse, [tag]:!val } })         
      }
      
      let title = this.state.title.instance
      if(title) title = title[0].value
      else { 
         title = this.state.title.work
         if(title) title = title[0].value
      }
      if(title) title = this.getResourceElem(skos+"prefLabel", title, this.props.assocResources)
      if(title && title.length) title = getLangLabel(this,"",title)
      if(title && title.value) title = <h2><a><span>{title.value}</span></a></h2>

      // TODO fix for UTxyz
      let root = this.props.IRI 


      const parts = {
         "bdo:VolumeEtextAsset":"vol",
         "bdo:EtextRef":"txt",
         "?":"unk",
      }


      let makeNodes = (top,parent) => {               
         let elem = this.props.eTextRefs["@graph"]
         let node = []
         if(elem) node = elem.filter(e => e["@id"] === top) 
         let etextrefs = []

         console.log("node:",this.props.eTextRefs,node,top)

         if(node.length && (node[0].instanceHasVolume || node[0].volumeHasEtext))
         {
            let children = node[0].instanceHasVolume
            if(!children) children = node[0].volumeHasEtext 
            if(children && !Array.isArray(children)) children = [ children ]
            
            //console.log("chil:",children);

            for(let e of children) {
               //console.log("e:",e);

               let w_idx = elem.filter(f => e["@id"] && f["@id"] === e["@id"] || f["@id"] === e) 
               if(w_idx.length) {
                  
                  //loggergen.log("found:",w_idx[0])  

                  let g = w_idx[0]
                  
                  if(g.details) { //} && (g.lang !== this.props.locale || g.rid === g["@id"] || g["@id"] === this.props.IRI)) { 
                     delete g.details ;
                     delete g.hidden ;
                  }

                  if(!g.details) {
                     g.rid = this.props.IRI
                     g.lang = this.props.locale
                  }

                  let nav = []

                  /*
                  if(g.contentLocation) {
                     if(!g.details) g.details = []
                     g.hasImg = "/show/"+g["@id"].replace(/^((bdr:MW[^_]+)_[^_]+)$/,"$1")+"?s="+encodeURIComponent(this.props.history.location.pathname+this.props.history.location.search)+"#open-viewer"
                     nav.push(<Link to={g.hasImg} class="ulink">{I18n.t("copyright.view")}</Link>)
                  }
                  else if (g.instanceHasReproduction) {
                     if(!g.details) g.details = []
                     g.hasImg = "/show/"+g.instanceHasReproduction+"?s="+encodeURIComponent(this.props.history.location.pathname+this.props.history.location.search)+"#open-viewer"
                     nav.push(<Link to={g.hasImg} class="ulink">{I18n.t("copyright.view")}</Link>)  
                  }
                  */



                  if(g.volumeNumber) { 
                     g.index = g.volumeNumber
                     g.link = g["@id"]
                     if(g.volumeHasEtext) {
                        if(!Array.isArray(g.volumeHasEtext)) {
                           let txt = elem.filter(e => e["@id"] === g.volumeHasEtext)
                           if(txt.length) g.link = txt[0].eTextResource + "#open-viewer"


                           //nav.push(<Link to={"/show/"+txt[0].eTextResource} class="ulink">{I18n.t("resource.openR")}</Link>)
                           //nav.push(<span>|</span>)
                           nav.push(<Link to={"/show/"+txt[0].eTextResource+"#open-viewer"} class="ulink">{I18n.t("result.openE")}</Link>)
                           nav.push(<span>|</span>)
                           nav.push(<a href={fullUri(txt[0].eTextResource)+".txt"} class="ulink"  download type="text" target="_blank">{I18n.t("mirador.downloadE")}</a>)

                        }
                        else {
                           g.hasPart = true
                           
                        }
                     }
                  } else if(g.seqNum && g.eTextResource) {
                     g.index = g.seqNum
                     g.link = g.eTextResource + "#open-viewer"


                     //nav.push(<Link to={"/show/"+g.eTextResource} class="ulink">{I18n.t("resource.openR")}</Link>)
                     //nav.push(<span>|</span>)
                     nav.push(<Link to={"/show/"+g.eTextResource+"#open-viewer"} class="ulink">{I18n.t("result.openE")}</Link>)
                     nav.push(<span>|</span>)
                     nav.push(<a href={fullUri(g.eTextResource)+".txt"} class="ulink" download type="text" target="_blank">{I18n.t("mirador.downloadE")}</a>)

                  }


                  if(nav.length) { 
                     if(!g.details) g.details = []
                     g.details.push(<div class="sub view">{nav}</div>)
                  }

                  //else if(g.)

                  etextrefs.push(g)
               }
            }         
         } 

         etextrefs = _.orderBy(etextrefs,["index"],["asc"]).map(e => {
            
            let tag = "etextrefs-"+root+"-"+e['@id']
            let ret = []
            let pType = e["type"], fUri = fullUri(e["@id"])
            let gUri = fUri ;
            if(e.link) gUri = fullUri(e.link).replace(/#.*/,"")
            if(pType && pType["@id"]) pType = pType["@id"]
            else pType = "bdo:"+pType
            let tLabel 
            //console.log("e:",tag,pType,parts);
            if(pType) {
               if(Array.isArray(pType)) pType = pType[0]
               tLabel = getOntoLabel(this.props.dictionary,this.props.locale,fullUri(pType))
               tLabel = tLabel[0].toUpperCase() + tLabel.slice(1)
               // TODO use translation from ontology
            }
            let open = this.state.collapse[tag]                         
            let mono = etextrefs.length === 1
            let openD = this.state.collapse[tag+"-details"] || this.state.collapse[tag+"-details"]  === undefined && mono

            ret.push(<span class={'top'+ (this.state.collapse[tag]?" on":"") }>
                  {(e.hasPart && !open) && <img src="/icons/triangle_.png" onClick={(ev) => toggle(ev,root,e["@id"],"",false,e)} className="xpd"/>}
                  {(e.hasPart && open) && <img src="/icons/triangle.png" onClick={(ev) => toggle(ev,root,e["@id"],"",false,e)} className="xpd"/>}
                  <span class={"parTy "+(e.details?"on":"")} {...e.details?{title: I18n.t("resource."+(openD?"hideD":"showD")), onClick:(ev) => toggle(ev,root,e["@id"],"details",mono)}:{title:tLabel}} >
                     {pType && parts[pType] ? <div>{parts[pType]}</div> : <div>{parts["?"]}</div> }
                  </span>
                  <span>{this.uriformat(null,{type:'uri', value:gUri, volume:fUri, inOutline: (!e.hasPart?tag+"-details":tag), url:"/show/"+e.link, debug:false, toggle:() => toggle(null,root,e["@id"],!e.hasPart?"details":"",mono) })}</span>
                  <div class="abs">                  
                     { !e.hasPart && <Link className="hasImg hasTxt" title={I18n.t("result.openE")}  to={"/show/"+e.link}><img src="/icons/search/etext.svg"/><img src="/icons/search/etext_r.svg"/></Link> }                   
                     { e.details && <span id="anchor" title={I18n.t("resource."+(openD?"hideD":"showD"))} onClick={(ev) => toggle(ev,root,e["@id"],"details",mono)}>
                        <img src="/icons/info.svg"/>
                     </span> }
                     <CopyToClipboard text={gUri} onCopy={(e) => prompt(I18n.t("misc.clipboard"),gUri)}>
                        <a class="permalink" title={I18n.t("misc.permalink")}>
                           <img src="/icons/PLINK_small.svg"/>
                           <img src="/icons/PLINK_small_r.svg"/>
                        </a>
                     </CopyToClipboard>
                  </div>
               </span>)
               
            if(openD && e.details) 
               ret.push(<div class="details">
                     {e.details}
                  </div>)
            if(e.hasPart && open) ret.push(<div style={{paddingLeft:"25px"}}>{makeNodes(e["@id"],top)}</div>)
            return ret
         })

         return etextrefs
      }

      let etextRefs = makeNodes(root,root)

      let colT = <span class={"parTy"} title={I18n.t("types.etext")}><div>TXT</div></span>
      if(!this.props.eTextRefs.mono) colT = <span class={"parTy"} title={I18n.t("Lsidebar.collection.title")}><div>COL</div></span>
      let open = this.state.collapse["etextrefs-"+root+"-"+root] === undefined || this.state.collapse["etextrefs-"+root+"-"+root];

      return (
         <div class="data etextrefs" id="outline">
            <h2>{I18n.t("home.search")}</h2>
            <div class="search on">
               <div>
                  <input type="text" placeholder={I18n.t("resource.searchE")} value={this.state.outlineKW} onChange={this.changeOutlineKW.bind(this)} onKeyPress={ (e) => { 
                     if(e.key === 'Enter' && this.state.outlineKW) { 
                        if(this.state.dataSource&&this.state.dataSource.length) { 
                           let param = this.state.dataSource[0].split("@")
                           let loca = { pathname:"/search", search:"?q="+keywordtolucenequery(param[0])+"&lg="+param[1]+"&r="+this.props.IRI+"&t=Etext" }
                           this.props.history.push(loca)
                        }
                        else this.changeOutlineKW(null,this.state.outlineKW)
                     }
                  }} />
                  <span class="button" /*onClick={outlineSearch}*/  title={I18n.t("resource.start")}></span>
                  { (this.state.outlineKW || this.props.outlineKW) && <span class="button" title={I18n.t("resource.reset")} onClick={(e) => { 
                     this.setState({outlineKW:"",dataSource:[]})
                     if(this.props.outlineKW) {
                        this.props.onResetOutlineKW()
                        let loca = { ...this.props.history.location }
                        if(!loca.search) loca.search = ""
                        loca.search = loca.search.replace(/(&osearch|osearch)=[^&]+/, "").replace(/[?]&/,"?")
                        this.props.history.push(loca)
                     }
                  }}><Close/></span> }                  
                  { (this.state.outlineKW && this.state.dataSource && this.state.dataSource.length > 0) &&   
                     <div><Paper id="suggestions">
                     { this.state.dataSource.map( (v) =>  {
                           let tab = v.split("@")
                           return (
                              <MenuItem key={v} style={{lineHeight:"1em"}} onClick={(e)=>{ 
                                 this.setState({dataSource:[]});
                                 let param = this.state.dataSource[0].split("@")
                                 let loca = { pathname:"/search", search:"?q="+keywordtolucenequery(param[0])+"&lg="+param[1]+"&r="+this.props.IRI+"&t=Etext" }
                                 this.props.history.push(loca)
                              }}>{ tab[0].replace(/["]/g,"")} <SearchIcon style={{padding:"0 10px"}}/><span class="lang">{(I18n.t(""+(searchLangSelec[tab[1]]?searchLangSelec[tab[1]]:languages[tab[1]]))) }</span></MenuItem> ) 
                           } ) }
                     </Paper></div> }
               </div>
            </div>
            <h2>{I18n.t("resource.browsE")}</h2>
            <div class="search">
               <div>
                  <input type="text" class="disabled" placeholder={I18n.t("resource.searchO")}  />
                  <span class="button" title={I18n.t("resource.start")}></span> 
               </div>
            </div>
            <div>
               <div class={"root is-root"} onClick={(e) => toggle(e,root,root)} >                     
                  { !open && [<img src="/icons/triangle_.png" className="xpd" />,colT,<span >{title}</span>]}
                  {  open && [<img src="/icons/triangle.png" className="xpd"  />,colT,<span class='on'>{title}</span>]}
               </div>
               { open && <div style={{paddingLeft:"50px"}}>{etextRefs}</div> }
            </div>
         </div> 
         )
   }

   changeOutlineKW(e, value) {

      if(!value && e) value = e.target.value

      let language = this.state.language
      let detec = narrowWithString(value, this.state.langDetect)
      let possible = [ ...this.state.langPreset, ...langSelect ]
      if(detec.length < 3) { 
         if(detec[0] === "tibt") for(let p of possible) { if(p === "bo" || p.match(/-[Tt]ibt$/)) { language = p ; break ; } }
         else if(detec[0] === "hani") for(let p of possible) { if(p.match(/^zh((-[Hh])|$)/)) { language = p ; break ; } }
         else if(["ewts","iast","deva","pinyin"].indexOf(detec[0]) !== -1) for(let p of possible) { if(p.match(new RegExp(detec[0]+"$"))) { language = p ; break ; } }
      }
      
      possible = [ ...this.state.langPreset, ...langSelect.filter(l => !this.state.langPreset || !this.state.langPreset.includes(l))]
      loggergen.log("detec",possible,detec,this.state.langPreset,this.state.langDetect)
      
      this.setState({ outlineKW:value, outlineKWlang: language, dataSource: detec.reduce( (acc,d) => {
         
         let presets = []
         if(d === "tibt") for(let p of possible) { if(p === "bo" || p.match(/-[Tt]ibt$/)) { presets.push(p); } }
         else if(d === "hani") for(let p of possible) { if(p.match(/^zh((-[Hh])|$)/)) { presets.push(p); } }
         else if(["ewts","iast","deva","pinyin"].indexOf(d) !== -1) for(let p of possible) { if(p.match(new RegExp(d+"$"))) { presets.push(p); } }
         
         return [...acc, ...presets]
      }, [] ).concat(value.match(/[a-zA-Z]/)?["en"]:[]).map(p => '"'+value+'"@'+(p == "sa-x-iast"?"sa-x-ndia":p)) } ) 

   }


   renderOutline() {

      if(this.props.outline && this.props.outline !== true) {

         let outline = [], title
         let root = this.props.IRI

         let osearch 
         if(this.props.outlineKW) osearch = this.props.outlineKW

         let toggle = (e,r,i,x = "",force = false, node) => {
            let tag = "outline-"+r+"-"+i+(x?"-"+x:"")
            let val = this.state.collapse[tag]
            if(osearch) {

               loggergen.log("toggle?",tag,val,x,force,node) 

               if(val === undefined && (!x && (!node || !node.notMatch ) || node.hasMatch) ) val = true // details of matching nodes + ancestor shown by default when search

               if(force && val && !x) val = false
            }

            loggergen.log("toggle!",tag,val)

            this.setState( { collapse:{...this.state.collapse, [tag]:!val } })
            if(/*this.state.outlinePart  &&*/ (!this.props.outlineKW || force || node && node.notMatch) &&  !x && this.props.outlines && (!this.props.outlines[i] || force && r === i) )this.props.onGetOutline(i);
         }


         let rootClick = (e) => {

            loggergen.log("rootC?")

            toggle(null,root,root)            

            /* //deprecated
            let tag = "outline-" + this.props.IRI + "-" + this.props.IRI
            let collapse = { ...this.state.collapse }
            if(this.props.outlineKW) collapse[tag] = (collapse[tag] === undefined ? false : !collapse[tag])
            else collapse[tag] = !collapse[tag]
            this.setState({ collapse })
            */

            /* //deprecated
            let s
            if(!s) s = { ...this.state } 
            s.outlinePart = null;
            //s.outlineKW = ""
            this.setState(s)
            
            //this.props.onResetOutlineKW()

            let loca = { ...this.props.history.location }
            loca.search = loca.search.replace(/(&part|part)=[^&]+/g, "") 
            loca.search = loca.search.replace(/[?]&/,"?")
            this.props.history.push(loca)
            */

            e.preventDefault();
            e.stopPropagation();
            return false
         }


         let elem = this.getResourceElem(bdo+"inRootInstance")
         if(elem && elem.length) { 
            root = shortUri(elem[0].value)
            title = this.getWtitle(elem, rootClick)
         }
         else {
            title = this.getWtitle([{value:fullUri(this.props.IRI)}], rootClick)
         }
         let opart 
         if(this.state.outlinePart) opart = this.state.outlinePart         
         else if(root !== this.props.IRI) opart = this.props.IRI
         else opart = root

         loggergen.log("renderO?",osearch,opart,title)


         if(opart && opart !== root && this.state.collapse["outline-"+root+"-"+root] === undefined) toggle(null,root,root)         


         if((this.state.collapse["outline-"+root+"-"+root] || opart === root || osearch) && this.props.outlines  && this.props.dictionary) {

            let collapse = {...this.state.collapse }

            loggergen.log("collapse!",root,opart,JSON.stringify(collapse,null,3),this.props.outlines[opart])

            if(!this.props.outlines[opart]) this.props.onGetOutline(opart);

            if(this.props.outlines[opart] && this.props.outlines[opart] !== true && this.state.collapse["outline-"+root+"-"+opart+"-details"] === undefined) {

               Object.keys(collapse).filter(k => k.startsWith("outline-"+root)).map(k => { delete collapse[k]; })
               collapse["outline-"+root+"-"+opart] = true
               collapse["outline-"+root+"-"+opart+"-details"] = true          

               let nodes = this.props.outlines[opart]
               if(nodes && nodes["@graph"]) nodes = nodes["@graph"]
               if(root !== opart && nodes && nodes.length) {
                  let head = opart
                  do {
                     head = nodes.filter(n => n.hasPart && (n.hasPart === head || n.hasPart.includes(head)))
                     loggergen.log("head?",head)
                     if(head && head.length) { 
                        head = head[0]["@id"]
                        if(collapse["outline-"+root+"-"+head] === undefined) { //} && (opart !== root || head !== root)) {
                           collapse["outline-"+root+"-"+head] = true ;
                           if(!this.props.outlines[head]) this.props.onGetOutline(head);
                        }
                     }
                  } while(head !== root && head.length); 
               }

               this.setState( { collapse } )               
               //loggergen.log("collapse?",JSON.stringify(collapse,null,3))

               
               if(opart && this.state.outlinePart) {
                  const el = document.querySelector("#outline")
                  if(el) el.scrollIntoView()      
               }
               
               
                  /*
                  // TODO more precise scroll (no scroll?)
                  if(opart) setTimeout(()=>{
                     const el = document.querySelector("#outline")
                     if(el) el.scrollIntoView()      
                  }, 1000);                  
                  */
               

            }
            /*
            else { 
               Object.keys(collapse).filter(k => k.startsWith("outline-"+root)).map(k => { delete collapse[k]; })
               this.setState( { collapse } )              
            }
            */

            const parts = {
               "bdr:PartTypeSection":"sec",
               "bdr:PartTypeVolume":"vol",
               "bdr:PartTypeChapter":"cha",
               "bdr:PartTypeTableOfContent":"toc",
               "bdr:PartTypeText":"txt",
               "?":"unk",
            }
            
            let makeNodes = (top,parent) => {               
               let elem 
               if(!osearch) elem = this.props.outlines[top]
               else { 
                  elem = this.props.outlines[osearch]
                  if(elem === true) {
                     let tmp = this.props.outlineKW.split("/")
                     if(tmp && tmp.length >= 2) tmp = tmp[1].split("@")
                     return <span class="top is-root"><span>No result found for {tmp[0]}.{ /* in {(I18n.t(""+(searchLangSelec[tmp[1]]?searchLangSelec[tmp[1]]:languages[tmp[1]])))}. */ }</span></span>
                  }
               }
               
               //loggergen.log("makeNode/elem:",elem,top,parent)

               let outline = []
               if(elem && elem["@graph"]) { 
                  elem = elem["@graph"]
                  let node = elem.filter(e => e["@id"] === top)                  
                  if(node.length && node[0].hasPart) { 
                     if(!Array.isArray(node[0].hasPart)) node[0].hasPart = [ node[0].hasPart ]
                     for(let e of node[0].hasPart) {
                        
                        //loggergen.log("node:",e)  

                        let w_idx = elem.filter(f => f["@id"] === e) 
                        if(w_idx.length) {
                           //loggergen.log("found:",w_idx[0])  
                           let g = w_idx[0]
                           
                           if(g.details && (g.lang !== this.props.locale || g.rid === g["@id"] || g["@id"] === this.props.IRI)) { 
                              delete g.details ;
                              delete g.hidden ;
                           }

                           if(!g.details) {
                              g.rid = this.props.IRI
                              g.lang = this.props.locale
                              if(!g.hidden) g.hidden = []
                              // deprecated
                              // if(! (["bdr:PartTypeSection", "bdr:PartTypeVolume"].includes(g.partType)) ) {

                              let nav = []

                              if(g.contentLocation) {
                                 if(!g.details) g.details = []
                                 g.hasImg = "/show/"+g["@id"].replace(/^((bdr:MW[^_]+)_[^_]+)$/,"$1")+"?s="+encodeURIComponent(this.props.history.location.pathname+this.props.history.location.search)+"#open-viewer"
                                 nav.push(<Link to={g.hasImg} class="ulink">{I18n.t("copyright.view")}</Link>)
                              }
                              else if (g.instanceHasReproduction) {
                                 if(!g.details) g.details = []
                                 g.hasImg = "/show/"+g.instanceHasReproduction+"?s="+encodeURIComponent(this.props.history.location.pathname+this.props.history.location.search)+"#open-viewer"
                                 nav.push(<Link to={g.hasImg} class="ulink">{I18n.t("copyright.view")}</Link>)  
                              }

                              if(g["@id"] !== this.props.IRI || (g["@id"] === opart && opart !== this.props.IRI)) {
                                 if(nav.length) nav.push(<span>|</span>)
                                 nav.push(<Link to={"/show/"+g["@id"]} class="ulink">{I18n.t("resource.openR")}</Link>)
                              }

                              if(nav.length) { 
                                 if(!g.details) g.details = []
                                 g.details.push(<div class="sub view">{nav}</div>)
                              }

                              if(g["tmp:titleMatch"] || g["tmp:labelMatch"]) {
                                 g.hasMatch = true
                              }
                              if(g["bf:identifiedBy"]) {
                                 if(!Array.isArray(g["bf:identifiedBy"])) g["bf:identifiedBy"] = [ g["bf:identifiedBy"] ]
                                 if(g["bf:identifiedBy"].length) { 
                                    g.id = []
                                    for(let node of g["bf:identifiedBy"]) {
                                       let id = elem.filter(f => f["@id"] === node) 
                                       // TODO add prefix letter (either in value or from ontology property)
                                       if(id.length) g.id.push(<span class="id" title={this.fullname(id[0].type,false,false,true,false)}>{id[0]["rdf:value"]}</span>)
                                    }
                                 }
                              }

                              
                              if(g.contentLocation) {
                                 if(!g.details) g.details = []
                                 let loca = elem.filter(f => f["@id"] === g.contentLocation), jLoca = {}
                                 if(loca && loca.length) loca = loca[0]
                                 for(let k of Object.keys(loca)) {
                                    let val = "" + loca[k]
                                    if(k.includes("content")) jLoca[bdo+k] = [ { value:(val.includes(":")?fullUri(loca[k]):loca[k]), type:"literal" } ]
                                 }                                                             
                                 if(g.contentLocationStatement) {
                                    jLoca[bdo+"contentLocationStatement"] = [ { value:g.contentLocationStatement, type:"literal" } ]
                                 }
                                 g.details.push(<div class="sub loca"><h4 class="first type">{this.proplink(bdo+"contentLocation")}{I18n.t("punc.colon")} </h4>{this.getWorkLocation([{value:loca["@id"]}],true, jLoca)}</div>)
                              }

                              /*
                              if(osearch && g["tmp:titleMatch"]) {
                                 if(!g.details) g.details = []
                                 if(!Array.isArray(g["tmp:titleMatch"])) g["tmp:titleMatch"] = [ g["tmp:titleMatch"] ]
                                 g.details.push(<div class="sub"><h4 class="first type">{this.proplink(tmp+"titleMatch")}: </h4><div>{g["tmp:titleMatch"].map(t => <h4>{highlight(t["@value"])}</h4>)}</div></div>)
                              }
                              else 
                              */


                              
                              if(g.hasTitle) {
                                 if(!g.details) g.details = []
                                 if(!Array.isArray(g.hasTitle)) g.hasTitle = [ g.hasTitle ]
                                 let lasTy
                                 for(let t of g.hasTitle) { 
                                    let title = elem.filter(f => f["@id"] === t)
                                    if(title.length) {                                        
                                       title = { ...title[0] }
                                       let titleT = bdo + title.type
                                       let hideT = (lasTy === title.type)
                                       lasTy = title.type
                                       if(title && title["rdfs:label"]) title = title["rdfs:label"]
                                       if(!Array.isArray(title)) title = [ title ]                                      
                                       title = title.map(f => ({value:f["@value"],lang:f["@language"], type:"literal"}))
                                       //loggergen.log("title?",JSON.stringify(title,null,3))
                                       
                                       // TODO which to show or not ? in outline search results ?
                                       let addTo = g.hidden
                                       if(titleT === bdo+"Title"|| (title.length && title[0].value && title[0].value.includes("↦"))) addTo = g.details 
                                       addTo.push(<div class={"sub " + (hideT?"hideT":"")}><h4 class="first type">{this.proplink(titleT)}{I18n.t("punc.colon")} </h4>{this.format("h4", "", "", false, "sub", title)}</div>)
                                    }
                                 }
                              }


                              if(g.instanceOf) {
                                 //if(Array.isArray(g.instanceOf)) g.instanceOf = 
                                 if(!g.details) g.details = []
                                 g.details.push(<div class="sub"><h4 class="first type">{this.proplink(tmp+"instanceOfWork")}{I18n.t("punc.colon")} </h4>{this.format("h4","instacO","",false, "sub", [{type:"uri",value:fullUri(g.instanceOf)}])}</div>)
                                 let instOf = elem.filter(f => f["@id"] === g.instanceOf)
                                 if(instOf.length && instOf[0]["tmp:labelMatch"]) {
                                    g.hasMatch = true
                                    let node = instOf[0]["tmp:labelMatch"]
                                    if(!Array.isArray(node)) node = [node]                                    
                                    //loggergen.log("instOf",instOf,node)
                                    g.hidden.push(<div class="sub"><h4 class="first type">{this.proplink(tmp+"instanceLabel")}{I18n.t("punc.colon")} </h4><div>{node.map(n => this.format("h4","","",false, "sub",[{ value:n["@value"], lang:n["@language"], type:"literal"}]))}</div></div>)
                                 }
                              }


                              // WIP sameAs icon / seeAlso link
                              if(g["owl:sameAs"] || g["rdfs:seeAlso"]){
                                 g.same = []
                                 if(g["owl:sameAs"] && !Array.isArray(g["owl:sameAs"])) g["owl:sameAs"] = [ g["owl:sameAs"] ]
                                 if(g["rdfs:seeAlso"] && !Array.isArray(g["rdfs:seeAlso"])) g["rdfs:seeAlso"] = [ g["rdfs:seeAlso"] ]
                                 let same = []
                                 if(g["owl:sameAs"] && g["owl:sameAs"].length) same = same.concat(g["owl:sameAs"])
                                 if(g["rdfs:seeAlso"] && g["rdfs:seeAlso"].length) same = same.concat(g["rdfs:seeAlso"])
                                 for(let node of same) {                                    
                                    if(node["@id"]) { 
                                       g.same.push({value:node["@id"]})
                                    } 
                                    // DONE link to NGMPP
                                    else if(node["@value"] && node["type"] === "xsd:anyURI") {
                                       let prefix = shortUri(node["@value"]).split(":")[0];
                                       if(providers[prefix]) {
                                          g.same.push({value:node["@value"]})                                             
                                       } else {
                                          if(!g.details) g.details = [] 
                                          g.details.push(<div class="sub"><h4 class="first type">{this.proplink(rdfs+"seeAlso")}{I18n.t("punc.colon")} </h4><div>{this.format("h4","","",false, "sub",[{ value:node["@value"], type:"xsd:anyUri"}])}</div></div>)
                                       }                                 
                                    }
                                    
                                    // deprecated
                                    //if(prefix && url) g.same.push(<a href={url} target="_blank" class={"provider "+prefix}>{provImg[prefix]?<img src={provImg[prefix]}/>:<span class="img">{prefix.replace(/^cbc.$/,"cbc@").toUpperCase()}</span>}</a>)
                                 }
                              }
                           }
                           outline.push(g);
                        }
                     }
                     
                     //loggergen.log("outline?",elem,outline)

                     outline = _.orderBy(outline,["partIndex"],["asc"]).map(e => {
                        let tag = "outline-"+root+"-"+e['@id']
                        let ret = []
                        let pType = e["partType"], fUri = fullUri(e["@id"])
                        let tLabel 
                        if(pType) {

                           if(Array.isArray(pType)) pType = pType[0]

                           tLabel = getOntoLabel(this.props.dictionary,this.props.locale,fullUri(pType))
                           tLabel = tLabel[0].toUpperCase() + tLabel.slice(1)
                           // TODO use translation from ontology
                        }
                        let open = this.state.collapse[tag] || (osearch &&  this.state.collapse[tag] === undefined && !e.notMatch)
                        if(pType && pType["@id"]) pType = pType["@id"]
                        ret.push(<span class={'top'+ (this.state.outlinePart === e['@id'] || (!this.state.outlinePart && this.props.IRI===e['@id']) ?" is-root":"")+(this.state.collapse[tag]||osearch&&e.hasMatch?" on":"") }>
                              {(e.hasPart && open && osearch && !this.props.outlines[e['@id']]) && <span onClick={(ev) => toggle(ev,root,e["@id"],"",true)} className="xpd" title={I18n.t("resource.otherN")}><RefreshIcon /></span>}
                              {(e.hasPart && !open && this.props.outlines[e['@id']] !== true) && <img src="/icons/triangle_.png" onClick={(ev) => toggle(ev,root,e["@id"],"",false,e)} className="xpd"/>}
                              {(e.hasPart && open && this.props.outlines[e['@id']] !== true) && <img src="/icons/triangle.png" onClick={(ev) => toggle(ev,root,e["@id"],"",false,e)} className="xpd"/>}
                              <span class={"parTy "+(e.details?"on":"")} {...e.details?{title:/*tLabel+" - "+*/ I18n.t("resource."+(this.state.collapse[tag+"-details"]?"hideD":"showD")), onClick:(ev) => toggle(ev,root,e["@id"],"details",false,e)}:{title:tLabel}} >
                                 {pType && parts[pType] ? <div>{parts[pType]}</div> : <div>{parts["?"]}</div> }
                              </span>
                              <span>{this.uriformat(null,{type:'uri', value:fUri, inOutline: (!e.hasPart?tag+"-details":tag), url:"/show/"+root+"?part="+e["@id"], debug:false, toggle:() => toggle(null,root,e["@id"],!e.hasPart?"details":"",false,e)})}</span>
                              {e.id}
                              {this.samePopup(e.same,fUri)}
                              <div class="abs">
                                 { e.hasImg && <Link className="hasImg" title={I18n.t("copyright.view")}  to={e.hasImg}><img src="/icons/search/images.svg"/><img src="/icons/search/images_r.svg"/></Link> }
                                 { /* pType && 
                                    <span class={"pType "+(e.details?"on":"")} {...e.details?{title:(this.state.collapse[tag+"-details"]?"Hide":"Show")+" Details", onClick:(ev) => toggle(ev,root,e["@id"],"details")}:{}} >
                                       {this.proplink(pType)}
                                       { !this.state.collapse[tag+"-details"] && <ExpandMore className="details"/>}
                                       {  this.state.collapse[tag+"-details"] && <ExpandLess className="details"/>}
                                    </span> */ }
                                 { e.details && <span id="anchor" title={/*tLabel+" - "+*/I18n.t("resource."+(this.state.collapse[tag+"-details"]?"hideD":"showD"))} onClick={(ev) => toggle(ev,root,e["@id"],"details",false,e)}>
                                    <img src="/icons/info.svg"/>
                                 </span> }
                                 <CopyToClipboard text={fUri} onCopy={(e) => prompt(I18n.t("misc.clipboard"),fUri)}>
                                    <a class="permalink" title={I18n.t("misc.permalink")}>
                                       <img src="/icons/PLINK_small.svg"/>
                                       <img src="/icons/PLINK_small_r.svg"/>
                                    </a>
                                 </CopyToClipboard>
                              </div>
                           </span>)
                        if(((osearch && e.hasMatch && this.state.collapse[tag+"-details"] !== false) || this.state.collapse[tag+"-details"]) && e.details) 
                           ret.push(<div class="details">
                              {e.details}
                              { (e.hidden && e.hidden.length > 0) && [
                                 <Collapse timeout={{enter:0,exit:0}} className={"outlineCollapse in-"+(this.state.collapse["hide-"+fUri]===true)} in={this.state.collapse["hide-"+fUri]}>
                                    {e.hidden}
                                 </Collapse>,
                                 <span
                                    onClick={(e) => this.setState({...this.state,collapse:{...this.state.collapse,["hide-"+fUri]:!this.state.collapse["hide-"+fUri]}})}
                                    className="expand">
                                       {I18n.t("misc."+(this.state.collapse["hide-"+fUri]?"hide":"seeMore")).toLowerCase()}&nbsp;<span
                                       className="toggle-expand">
                                          { this.state.collapse["hide-"+fUri] && <ExpandLess/>}
                                          { !this.state.collapse["hide-"+fUri] && <ExpandMore/>}
                                       </span>
                                 </span>] }</div>
                           )
                        if((osearch && this.state.collapse[tag] !== false) || (this.props.outlines[e["@id"]] && this.props.outlines[e["@id"]] !== true && this.state.collapse[tag]) ) ret.push(<div style={{paddingLeft:"25px"}}>{makeNodes(e["@id"],top)}</div>)                        
                        return ( ret )
                     })
                  }
               }
               return outline
            }

            outline = makeNodes(root,root)
            
         }

         let tag = "outline-"+root+"-"+root

         let outlineSearch = (e, lg = "bo-x-ewts") => {
            loggergen.log("outlineS",this.state.outlineKW)

            // NOTO
            // x search either from root or current node
            // DONE
            // + add to url (=>back button)
            // + add language alternatives using autodetection
            // + clean collapsed nodes before displaying results

            if(this.state.outlineKW) { 


               let loca = { ...this.props.history.location }

               loca.search = loca.search.replace(/&*osearch=[^&]+/, "") 

               if(!loca.search) loca.search = "?"
               else if(loca.search !== "?") loca.search += "&"

               loca.search += "osearch="+keywordtolucenequery(this.state.outlineKW, lg)+"@"+lg

               loggergen.log("loca!",loca)

               this.setState({dataSource:[]});
               this.props.history.push(loca)
               
               //this.props.onOutlineSearch(root, this.state.outlineKW,lg)
            }
         }

         let open = this.state.collapse[tag] || (osearch && this.state.collapse[tag] === undefined)


         let colT = <span class={"parTy"} title={I18n.t("Lsidebar.collection.title")}><div>COL</div></span>

         if(opart && this.state.outlinePart) { 
            let _this = this, timinter = setInterval(()=>{
               const el = document.querySelector("#outline .is-root")
               if(el) { 
                  clearInterval(timinter)
                  if(_this.state.opartinview != opart) {
                     el.scrollIntoView()      
                     _this.setState({opartinview: opart})
                  }
               }
            }, 250)
         }

         return ( 
         <div class="data" id="outline">
            <h2>{I18n.t("index.outline")}</h2>
               <div class="search">
                  <div>
                     <input type="text" placeholder={I18n.t("resource.searchO")} value={this.state.outlineKW} onChange={this.changeOutlineKW.bind(this)} onKeyPress={ (e) => { 
                        if(e.key === 'Enter' && this.state.outlineKW) { 
                           if(this.state.dataSource&&this.state.dataSource.length) outlineSearch(e,this.state.dataSource[0].split("@")[1])
                           else this.changeOutlineKW(null,this.state.outlineKW)
                        }
                     }}/>
                     <span class="button" onClick={outlineSearch}  title={I18n.t("resource.start")}></span>
                     { (this.props.outlineKW || this.state.outlineKW) && <span class="button" title={I18n.t("resource.reset")} onClick={(e) => { 
                        this.setState({outlineKW:"",dataSource:[]})
                        if(this.props.outlineKW) {
                           this.props.onResetOutlineKW()
                           let loca = { ...this.props.history.location }
                           if(!loca.search) loca.search = ""
                           loca.search = loca.search.replace(/(&osearch|osearch)=[^&]+/, "").replace(/[?]&/,"?")
                           this.props.history.push(loca)
                        }
                     }}><Close/></span> }                  
                     { (this.state.outlineKW && this.state.dataSource && this.state.dataSource.length > 0) &&   
                        <div><Paper id="suggestions">
                        { this.state.dataSource.map( (v) =>  {
                              let tab = v.split("@")
                              return (
                                 <MenuItem key={v} style={{lineHeight:"1em"}} onClick={(e)=>{ 
                                    this.setState({dataSource:[]});
                                    outlineSearch(e,tab[1]);
                                    //this.requestSearch(tab[0],null,tab[1])
                                 }}>{ tab[0].replace(/["]/g,"")} <SearchIcon style={{padding:"0 10px"}}/><span class="lang">{(I18n.t(""+(searchLangSelec[tab[1]]?searchLangSelec[tab[1]]:languages[tab[1]]))) }</span></MenuItem> ) 
                              } ) }
                        </Paper></div> }
                  </div>
               </div>
               <div>
                  <Loader loaded={this.props.loading !== "outline"}/>
                  <div class={"root " +(this.state.outlinePart === root || (!this.state.outlinePart && this.props.IRI===root)?"is-root":"")} >
                     { (osearch && open && (this.props.outlines[root] && !this.props.outlines[osearch].reloaded)) && <span onClick={(ev) => toggle(ev,root,root,"",true)} className="xpd" title={I18n.t("resource.otherN")}><RefreshIcon /></span>}
                     { !open && [<img src="/icons/triangle_.png" className="xpd" onClick={(e) => toggle(e,root,root)} />,colT,<span onClick={rootClick}>{title}</span>]}
                     {  open && [<img src="/icons/triangle.png" className="xpd" onClick={(e) => toggle(e,root,root)} />,colT,<span onClick={rootClick} class='on'>{title}</span>]}
                  </div>
                  { open && <div style={{paddingLeft:"50px"}}>{outline}</div> }
               </div>
         </div> )
      }
   }


   getWtitle(baseW,rootC) {
      if(baseW && baseW.length && baseW[0].value) {
         let wUri = shortUri(baseW[0].value);
         if(this.props.resources && !this.props.resources[wUri]) this.props.onGetResource(wUri);
         
         //loggergen.log("is?",baseW[0].value,this.props.assocResources?this.props.assocResources[baseW[0].value]:null)

         let baseData = []
         if(this.props.assocResources) {
            baseData = this.props.assocResources[baseW[0].value]
            if(baseData && baseData.length) baseData = baseData.map(e => (e.fromKey?e.fromKey:(e.type?e.type:e)))         
            else baseData = []
         }
         let _T = getEntiType(shortUri(baseW[0].value))
         let { title,titlElem,otherLabels } = this.setTitle(baseData,_T,baseW[0].value,rootC) ;
         return title
      }
      return null
   }

   getProv() {

      let legal = this.getResourceElem(adm+"metadataLegal"), legalD
      if(legal && legal.length) legal = legal.filter(p => !p.fromSameAs)
      if(legal && legal.length && legal[0].value && this.props.dictionary) { 
         legalD = this.props.dictionary[legal[0].value]
         
         let prov ;
         if(legalD) prov = legalD[adm+"provider"]
         prov = this.getProviderID(prov)
         
         return prov
      }
            
   }

   unpaginated() {
      let unpag = this.getResourceElem(rdf+"type")
      if(unpag && unpag.length && unpag.filter(u => u.value === bdo+"EtextNonPaginated").length) unpag = true
      else unpag = false

      return unpag
   }

   render()
   {
      loggergen.log("render",this.props,this.state,this._refs)
   
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

      let redir, withdrawn
      if(this.props.resources && (redir = this.props.resources[this.props.IRI]) && (redir = redir[fullUri(this.props.IRI)]))
      {
         //loggergen.log("WithD?",redir);
         if(redir[adm+"replaceWith"]) {
            redir = shortUri(redir[adm+"replaceWith"][0].value)            
            return (
               <Redirect404  history={this.props.history} message={"Record withdrawn in favor of "+redir} to={"/show/"+redir}/>
            )
         }
         else if(this.props.auth && this.props.auth.isAuthenticated() && redir[adm+"status"] && (redir = redir[adm+"status"]).length && redir[0].value === bda+"StatusWithdrawn"){
            withdrawn = true 
            //loggergen.log("WithD");
         }         
      }
      //loggergen.log("WithD...",redir);


      let kZprop = Object.keys(this.properties(true))
      //loggergen.log("kZprop",kZprop)

      // [TODO] test external pdf download using "rendering" field of manifest
      let { pdfLink, monoVol } = this.getPdfLink();
      //loggergen.log("pdf",pdfLink,this._annoPane.length)
      
      let fairUse = false
      if(kZprop.indexOf(adm+"access") !== -1) {
         let elem = this.getResourceElem(adm+"access")
         if(elem && elem.filter(e => e.value.match(/(AccessFairUse)$/)).length >= 1) fairUse = true
         //loggergen.log("adm",elem,fairUse)
      }

      let iiifpres = "//iiifpres.bdrc.io" ;
      if(this.props.config && this.props.config.iiifpres) iiifpres = this.props.config.iiifpres.endpoints[this.props.config.iiifpres.index]      
      //iiifpres += "/2.1.1"


      let getWtitle = this.getWtitle.bind(this)
      let wTitle,iTitle,rTitle ;
      let _T = getEntiType(this.props.IRI)
      let { title,titlElem,otherLabels } = this.setTitle(kZprop,_T) ;
      if(_T === "Instance") { 
         iTitle = title ; 

         let baseW = this.state.title.work 
         wTitle = getWtitle(baseW);

         baseW = this.state.title.images 
         rTitle = getWtitle(baseW)

      }
      else if(_T === "Images") { 
         rTitle = title ; 

         let baseW = this.state.title.work 
         wTitle = getWtitle(baseW)

         baseW = this.state.title.instance 
         iTitle = getWtitle(baseW)

      }
      else if(_T === "Etext") { 
         rTitle = title ; 

         let baseW = this.state.title.work 
         wTitle = getWtitle(baseW)

         baseW = this.state.title.instance 
         iTitle = getWtitle(baseW)
      }
      else { 
         wTitle = title ; 

         let baseW = this.state.title.instance
         iTitle = getWtitle(baseW)

         baseW = this.state.title.images
         rTitle = getWtitle(baseW)
      }
      
      console.log("_T!!",_T)
      if(this.props.resources && this.props.resources[this.props.IRI] && _T !== "Etext") this.setManifest(kZprop,iiifpres)    


      let resLabel = getLangLabel(this,"",titlElem)

      //loggergen.log("ttlm",titlElem,otherLabels)
      
      let mapProps = [bdo+"placeRegionPoly", bdo+"placeLong", bdo+"placeLat" ]
                           
      let topProps = topProperties[_T]
      if(!topProps) topProps = []

      let extProps = extProperties[_T]
      if(!extProps) extProps = []


   /*
      let related = [<div>
                        <div class="header"></div>
                        <div>Work1</div>
                     </div>,
                     <div>
                        <div class="header"></div>
                        <div>Work2</div>
                     </div>
                     ]
   */

      // TODO Related Works
      // - move towards top of page 
      // - use '...' to tell it's just an overview
      // - use prefLabel in tabs title 

      let related = [], createdBy = [], wUrl = fullUri(this.props.IRI), serial
      if(this.state.title.work && this.state.title.work[0].value) wUrl = this.state.title.work[0].value

      if(this.props.assocResources) {

         let res = wUrl

         related = Object.keys(this.props.assocResources).map((k,i) => {
            let v = this.props.assocResources[k]
            let s = shortUri(k)
            let isA = v.filter(k => k.fromKey === (bdo+"workIsAbout") && k.value === res)
            
            //loggergen.log("isA",v,s,isA)

            if(isA.length) {               
               let label, pLab = v.filter(k => k.fromKey === skos+"prefLabel" || k.type === skos+"prefLabel")
               if(pLab.length) label = getLangLabel(this,"",pLab)
               if(!label) label = { value:s }

               let n = v.filter(k => k.fromKey === tmp+"entityScore")
               if(n.length) n = Number(n[0].value)
               else n = -99 
               
               let m = label.lang+"_"+label.value

               return {s,k,n,m,label} ;
            }
         }).filter(k => k)
         related = _.orderBy(related, ["n","m"], ["desc","asc"])

         serial = this.getResourceElem(bdo+"serialHasMember");
         if(!serial) serial = this.getResourceElem(bdo+"collectionMember");
         if(!serial) serial = this.getResourceElem(bdo+"corporationHasMember");
         
         //loggergen.log("serial:",serial)

         createdBy = Object.keys(this.props.assocResources).map( (k,i) => {
            let v = this.props.assocResources[k]
            let s = shortUri(k)
            if(_T === "Corporation" && v.filter(m => m.fromKey === bdo+"corporationMember").length) { s = shortUri(v.filter(m => m.fromKey === bdo+"corporationMember")[0].value); }
            let crea = v.filter(m => !serial && m.fromKey === (_T === "Place"?tmp+"printedAt":tmp +"createdBy") && m.value === res || serial && serial.filter(s => s.value === k).length )

            
            //loggergen.log("crea:",k,s,v,crea)

            if(crea.length) {

               let label, pLab = v.filter(k => k.fromKey === skos+"prefLabel" || k.type === skos+"prefLabel")
               if(pLab.length) label = getLangLabel(this,"",pLab)
               if(!label) label = { value:s }

               let n = v.filter(k => k.fromKey === tmp+"entityScore")
               if(n.length) n = Number(n[0].value)
               else n = -99 
               
               let m = label.lang+"_"+label.value

               let thumb = v.filter(k => k.fromKey === tmp+"thumbnailIIIFService" || k.type === tmp+"thumbnailIIIFService")
               if(thumb && thumb.length) thumb = thumb[0].value
               else thumb = null

               return {s,k,n,m,label,thumb};
            }
         }).filter(k => k)
         createdBy = _.orderBy(createdBy, ["n","m"], ["desc","asc"])

         console.log("rel:",related,createdBy)

         related = related.map( ({s,k,n,m,label},i) => {            
            this._refs["rel-"+i] = React.createRef();
            return ( 
               <div ref={this._refs["rel-"+i]}>
                  <Link to={"/show/"+s}><div class="header"></div></Link>
                  <div><Link to={"/show/"+s}><span {...label.lang?{lang:label.lang}:{}}>{ label.value }</span></Link>{ label.lang && this.tooltip(label.lang) }</div>
                  {/* <Link to={"/show/"+s}>{I18n.t("misc.readM")}</Link> */}
               </div>
            )
         })

         createdBy = createdBy.map( ({s,k,n,m,label,thumb},i) => {             
            this._refs["crea-"+i] = React.createRef();
            return ( 
               <div ref={this._refs["crea-"+i]}>
                  <Link to={"/show/"+s}><div class={"header"+(thumb?" thumb":"") + (_T === "Product"?" instance":"")} style={{backgroundImage:"url("+thumb+"/full/,185/0/default.jpg)"}}></div></Link>
                  <div><Link to={"/show/"+s}><span {...label.lang?{lang:label.lang}:{}}>{ label.value }</span></Link>{ label.lang && this.tooltip(label.lang) }</div>
                  {/* <Link to={"/show/"+s}>{I18n.t("misc.readM")}</Link> */}
               </div>
            )
         })

      }

      let hasRel = ((related && related.length > 0)||(createdBy && createdBy.length > 0))
      if((!hasRel || this.state.relatedTabAll) && !["Instance","Images","Etext"].includes(_T)) {
         if(this.props.assocResources && this.props.config &&  (!this.props.assocTypes || !this.props.assocTypes[this.props.IRI+"@"])) this.props.onGetAssocTypes(this.props.IRI)
      }  
      let all    
      if(this.props.assocTypes && this.props.assocTypes[this.props.IRI+"@"] && this.props.assocTypes[this.props.IRI+"@"].metadata) {
         all = Object.values(this.props.assocTypes[this.props.IRI+"@"].metadata).reduce( (acc,c) => acc+Number(c), 0)
      }

      let allRel, t1 ;
      if(this.props.assocTypes && this.props.assocTypes[this.props.IRI+"@"] && this.props.assocTypes[this.props.IRI+"@"].metadata) {
         allRel = Object.keys(this.props.assocTypes[this.props.IRI+"@"].metadata).map(r => { 
            let v = Number(this.props.assocTypes[this.props.IRI+"@"].metadata[r])
            let t = r.replace(/^.*\/([^/]+)$/,"$1")
            let url = "/search?r="+this.props.IRI+"&t="+t
            if(!t1) t1 = url
            return (<div>                                                                           
               <Link to={url}><div class={"header "+t.toLowerCase()}></div></Link>
               <div><Link to={url}><span lang={this.props.locale}>{I18n.t("misc.allT",{count:v,type:I18n.t("types."+t.toLowerCase(),{count:v})})}</span></Link></div>
               {/* <Link to={url}>{I18n.t("misc.seeR",{count:v})}</Link> */}
            </div>)
         })         
      }

   /* //deprecated
      let hasLongExtP = false; //[bf+"identifiedBy",bdo+"note"].filter(k => kZprop.includes(k) ).length > 0

      let extPlabel = "hide"
      if(hasLongExtP) {
         extPlabel = "seeA"
         if(this.state.collapse.extProps) extPlabel = "hide"
      }
      else {
         if(this.state.collapse.extProps) extPlabel = "seeA"
      }
      
      let toggleExtProps = (e) => {
         let show = this.state.collapse.extProps
         if(!hasLongExtP) show = (this.state.collapse.extProps === undefined) || !this.state.collapse.extProps
         let state = { ...this.state, collapse:{ ...this.state.collapse, extProps:!this.state.collapse.extProps, ...extProps.reduce( (acc,p) => ({...acc, [p]:!show}),{} ) } }
         this.setState(state)
      }
   */
   
      let root = this.getResourceElem(bdo+"inRootInstance");

      let sideMenu = (rid,tag,rel,ext,outL,openV,etextUT) => {
         let sRid = shortUri(rid)
         let loca = this.props.history.location
         let url = "/show/"+sRid+this.getTabs(tag)
         //if(sRid === this.props.IRI) url = ""
         let view = "/show/"+sRid+loca.search+"#open-viewer"
         let relW = url+"#resources"
         /*
         if(tag === "Work" && !rel) {
            relW = '/search?r='+sRid
            let keys
            //if(this.props.config &&  (!this.props.assocTypes || !this.props.assocTypes[sRid+"@"])) this.props.onGetAssocTypes(sRid)
            else if(this.props.assocTypes && this.props.assocTypes[sRid+"@"] && this.props.assocTypes[sRid+"@"].metadata && (keys = Object.keys(this.props.assocTypes[sRid+"@"].metadata)).length) { 
               let max = 0, i = 0, m ;
               for(let k in keys) if((m = Number(this.props.assocTypes[sRid+"@"].metadata[keys[k]])) > max) {
                  max = m
                  i = k
                  //console.log("max=",max,i)
               }
               relW += "&t=" + keys[i].replace(/.*\/([^/]+)$/,"$1")
            }
            else relW += "&t=Instance"
         }
         */
         return (<div>
            { tag === "Images" && <h3><Link to={!etextUT?view:etextUT+"#open-viewer"} class={(!openV?"disabled":"")}>{I18n.t("index.openViewer")}</Link></h3> }
            <h3><Link to={url+"#main-info"} >{I18n.t("index.mainInfo")}</Link></h3>
            { tag === "Instance" && <h3><Link to={url+"#outline"} class={(!outL||!this.state.outlinePart && root && root.length?"disabled":"")}>{I18n.t("index.outline")}</Link></h3> }
            { tag === "Work" && <h3><Link to={relW} /*class={(!rel?"disabled":"")}*/>{I18n.t(true || !rel || _T ==="Place"||_T==="Corporation"?"index.relatedR":"index.related")}</Link></h3> }
             <h3><Link class={(!ext?"disabled":"")} to={url+"#ext-info"} >{I18n.t("index.extended")}</Link></h3> 
         </div>)
      }

      
      if(_T === "Etext" && !window.MiradorUseEtext) window.MiradorUseEtext = true ; 
      

      let inTitle 
      //loggergen.log("root?",root)
      if(root && root.length) {
         inTitle  = [ 
            <h3><span>{I18n.t("misc.in")}{I18n.t("punc.colon")} </span> {this.uriformat(tmp+"in",root[0])}</h3>,
            //<br/>,
            //<h3 class="outline-link"><Link class="urilink" to={"/show/"+shortUri(root[0].value)+"?part="+this.props.IRI+"#outline"}>{"View in the outline"}</Link></h3>
         ]
      }

      let isMirador = (!this.props.manifestError || (this.props.imageVolumeManifests && Object.keys(this.props.imageVolumeManifests).length)) && (this.props.imageAsset || this.props.imageVolumeManifests) && this.state.openMirador

      let searchUrl, searchTerm
      
      if(this.state.fromSearch) {
         let backTo = this.state.fromSearch
         if(!decodeURIComponent(backTo).startsWith("/show/")) {
            let withW = backTo.replace(/^.*[?&](w=[^&]+)&?.*$/,"$1")
            loggergen.log("fromS",this.state.fromSearch,backTo,withW)
            if(backTo === withW) { 
               backTo = decodeURIComponent(backTo)
               searchUrl = backTo
               if(searchUrl.match(/q=/))               
                  searchTerm = lucenequerytokeyword(searchUrl.replace(/.*q=([^&]+).*/,"$1")) 
               else if(searchUrl.match(/r=/))               
                  searchTerm = lucenequerytokeyword(searchUrl.replace(/.*r=([^&]+).*/,"$1")) 

            }
            else { 
               backTo = decodeURIComponent(backTo.replace(new RegExp("(([?])|&)"+withW),"$2"))+"&"+withW
               searchUrl = backTo
               searchTerm = I18n.t("topbar.instances")+" "+searchUrl.replace(/.*i=([^&]+).*/,"$1")
            }
         }
      }


      
      let hasChunks = this.getResourceElem(bdo+"eTextHasChunk")

      //loggergen.log("chunks?",hasChunks)

      if(hasChunks && hasChunks.length && this.state.openEtext) {
         
         let hasPages = this.getResourceElem(bdo+"eTextHasPage")
         let etext_data = this.renderData([!hasPages?bdo+"eTextHasChunk":bdo+"eTextHasPage"],iiifpres,title,otherLabels,"etext-data")
         let etextRes = this.getResourceElem(bdo+"eTextInInstance")
         if(etextRes && etextRes.length) etextRes = shortUri(etextRes[0].value)
         else etextRes = null


         // TODO fix loader not hiding when closing then opening again

         return ([
            getGDPRconsent(this),
            <div>
               { top_right_menu(this,title,searchUrl,etextRes) }               
               { this.renderMirador(isMirador) }           
               <div class="resource etext-view">
                  <Loader loaded={!this.props.loading}  options={{position:"fixed",left:"50%",top:"50%"}} />      
                  <div class="">
                     { this.unpaginated() && <h4 style={{fontSize:"16px",fontWeight:600,textAlign:"center", marginBottom:"50px",top:"-15px"}}>{I18n.t("resource.unpag")}</h4>}
                     { etext_data }
                  </div>                  
               </div>
               { this.renderEtextNav() }
            </div>
         ])
      }
      else {
         
         let theDataTop = this.renderData(topProps,iiifpres,title,otherLabels,"top-props","main-info")      
         let theDataBot = this.renderData(kZprop.filter(k => !topProps.includes(k) && !extProps.includes(k)),iiifpres,title,otherLabels,"bot-props")      

         let theEtext
         if(this.props.eTextRefs && this.props.eTextRefs !== true && this.props.IRI && this.props.IRI.startsWith("bdr:IE")) { 
            extProps = extProps.filter(p => p !== bdo+"instanceHasVolume")
            theEtext = this.renderEtextRefs()      
         }

         let theDataExt = this.renderData(extProps,iiifpres,title,otherLabels,"ext-props")      
         let theDataLegal = this.renderData([adm+"metadataLegal"],iiifpres,title,otherLabels,"legal-props")      
         
         let theOutline ;
         if(!root || !root.length) theOutline = this.renderOutline()      

         let etext = this.isEtext()
         if(etext && !this.props.eTextRefs) this.props.onGetETextRefs(this.props.IRI);

         let loca = this.props.history.location            

         let rView = true, iOutline, wDataExt, iDataExt, rDataExt, checkDataExt = (rid) => {            
            let sRid = shortUri(rid)
            for(let p of extProps) { 
               let ret = this.getResourceElem(p, sRid, this.props.resources, rid) 
               //console.log("rid:",sRid,p,ret)
               if(ret && ret.length) return true
            }
            return false
         }

         if(this.state.title.work && this.state.title.work[0].value) wDataExt = checkDataExt(this.state.title.work[0].value)
         if(this.state.title.instance && this.state.title.instance[0].value) { 
            iDataExt = checkDataExt(this.state.title.instance[0].value)
            let sRid = shortUri(this.state.title.instance[0].value)               
            if(this.props.outlines && this.props.outlines[sRid] !== undefined  && this.props.outlines[sRid]) {
               if(this.props.outlines[sRid]["@graph"] &&  this.props.outlines[sRid]["@graph"].filter &&  this.props.outlines[sRid]["@graph"].filter(n => n.hasPart).length) iOutline = true
            }
            else if(this.props.config && this.state.outlinePart) {
               this.props.onGetOutline(sRid);
            }
         }
         if(this.state.title.images && this.state.title.images[0].value) {
            rDataExt = checkDataExt(this.state.title.images[0].value)
            let sRid = shortUri(this.state.title.images[0].value)
            
            if(this.props.IIIFerrors) {
               if(this.props.IIIFerrors[sRid]) rView = false
            }
            else {
               if(sRid !== this.props.IRI && this.props.resources  && this.props.resources[sRid] && this.props.resources[sRid][this.state.title.images[0].value] && !this.state.title.images[0].value.includes("resource/IE"))  {
                  this.setManifest(Object.keys(this.props.resources[sRid][this.state.title.images[0].value]),iiifpres,sRid,this.state.title.images[0].value)    
               }
            }

         }

         // DONE
         // + update index links (add outline)
         // + fix open etext OR images
         // + add loader to show when back to seach

         let orig = this.getResourceElem(adm+"originalRecord")
         if(orig && orig.length) orig = orig[0].value
         else orig = ""


         let prov = this.getProv()

         let etextLoca = I18n.t("resource.openViewer"), etextVolN, etextTxtN, etextUT = loca.pathname+loca.search
         if(etext) {
            let fVol = this.getResourceElem(tmp+"firstVolN")
            if(fVol && fVol.length) etextVolN = fVol[0].value
            let fTxt = this.getResourceElem(tmp+"firstTextN")
            if(fTxt && fTxt.length) etextTxtN = fTxt[0].value
            let fUT = this.getResourceElem(tmp+"firstText")
            if(fUT && fUT.length) etextUT = "/show/"+shortUri(fUT[0].value)
            if(fVol && fTxt && (this.props.eTextRefs && this.props.eTextRefs !== true && !this.props.eTextRefs.mono)) etextLoca = I18n.t("resource.openVolViewer", {VolN:etextVolN}) // not sure we need this:  TxtN:etextTxtN
         }

         let scrollRel = (ev,next) => { 
            let idx = !this.state.relatedTab&&related.length?"rel":"crea"
            let max = !this.state.relatedTab&&related.length?related.length:createdBy.length
            let i = (this.state["i"+idx]!==undefined?this.state["i"+idx]:0)
            if(next) i+=4 ;
            else i-=4 ;
            if(i > max) i = max
            else if(i < 0) i = 0
            console.log("i:",next,i,max,idx,this._refs[i],this._refs)
            if(this._refs[ idx + "-" + i ]) {
               this._refs[ idx + "-" + i ].current.scrollIntoView({behavior:"smooth",block:"nearest",inline:"start"})
               this.setState({["i"+idx]:i})
            }
         }

         let navNext = false          
         if(related && related.length && !this.state.relatedTab) {
            navNext = this.state.irel === undefined || (this.state.irel / 4) * 4 + 4 < related.length - 1 
         }
         else if(createdBy) {
            navNext = this.state.icrea === undefined || (this.state.icrea / 4) * 4 + 4 < createdBy.length - 1 
         }

         let dates ;
         if(_T === "Person") {
            let elem = this.getResourceElem(bdo+"personEvent")
            if(elem && elem.length) {
               let birth = elem.filter(e => e.k && e.k.endsWith("PersonBirth")).map(e => this.getResourceBNode(e.value));
               if(birth.length) birth = birth[0]
               let death = elem.filter(e => e.k && e.k.endsWith("PersonDeath")).map(e => this.getResourceBNode(e.value));
               if(death.length) death = death[0]
               console.log("dates:",birth,death,elem)
               //elem = elem.filter(e => )
               
               let vals = []
               for(const [p,date] of Object.entries({ [bdo+"PersonBirth"]:birth, [bdo+"PersonDeath"]:death })  ) {
                  if(!date) continue ;
                  let val = date[bdo+"onYear"]
                  if(val && val.length) val = <span>{(""+val[0].value).replace(/^([^0-9]*)0+/,"$1")}</span>
                  else {
                     let bef = date[bdo+"notBefore"]
                     let aft = date[bdo+"notAfter"]
                     if(bef && bef.length && aft && aft.length) val = <span>{(""+bef[0].value).replace(/^([^0-9]*)0+/,"$1")+ "~" +(""+aft[0].value).replace(/^([^0-9]*)0+/,"$1")}</span>
                     else val = null
                  }

                  if(p.includes("Death") && !vals.length) {vals.push(<span>&nbsp;&ndash;&nbsp;</span>) }
                  if(val) vals.push(val)
                  if(p.includes("Birth")) vals.push(<span>&nbsp;&ndash;&nbsp;</span>)
               }
               if(vals.length > 1) dates = <span clas='date'>{vals}</span> ;
            }
         }

         return (
         [getGDPRconsent(this),
         <div class={isMirador?"H100vh OF0":""}>
            <div className={"resource "+getEntiType(this.props.IRI).toLowerCase()}>               
               {searchUrl && <div class="ariane">
                  <Link to={searchUrl.startsWith("latest")?searchUrl:"/search?"+searchUrl} onClick={(ev) => {
                     this.props.onLoading("search",true)                     

                     let pathname = "/search"
                     if(searchUrl.startsWith("latest")) {
                        pathname = "/latest"
                        searchUrl = searchUrl.replace(/^latest[?]/,"")
                     }

                     setTimeout(() => { 
                           this.props.history.push({pathname,search:"?"+searchUrl}) ; 
                     }, 100)

                     ev.preventDefault()
                     ev.stopPropagation();
                     return false
                  }}
                  ><img src="/icons/FILARIANE.svg" /><span>{searchUrl.startsWith("latest")?I18n.t("home.new").toLowerCase():I18n.t("topbar.results")} <span>{searchTerm}</span></span></Link>
                  {this.state.ready && <Loader loaded={!this.props.loading} options={{position:"fixed",left:"50%",top:"50%"}} /> }
               </div> }
               <div class="index">                  
                  {/* { this.renderBrowseAssoRes() } */}
                  {/* { this.renderPdfLink(pdfLink,monoVol,fairUse) } */}
                  <div class="title">
                  { wTitle }
                  { wTitle && this.state.title.work && sideMenu(this.state.title.work[0].value, "Work", hasRel, wDataExt)  }
                  { iTitle }
                  { iTitle && this.state.title.instance && sideMenu(this.state.title.instance[0].value,"Instance", false, iDataExt, iOutline) }
                  { rTitle }
                  { rTitle && this.state.title.images && sideMenu(this.state.title.images[0].value,"Images", false, rDataExt, false, rView && !orig, etextUT) }
                  </div>
               </div>
               <div>
                  { top_right_menu(this) }               
                  {/* { this.renderAnnoPanel() } */}
                  { this.renderWithdrawn() }             
                  <div class="title">{ wTitle }{ iTitle }{ rTitle }</div>
                  { this.renderHeader(kZprop.filter(k => mapProps.includes(k)), _T, etextUT) }
                  { (etext && !orig) && <div class="data" id="open-etext"><div><Link to={etextUT+"#open-viewer"}>{etextLoca}</Link></div></div> }
                  { (etext && orig) && <div class="data" id="open-etext"><div><a target="_blank" href={orig}>{I18n.t("resource.openO",{src:prov})}<img src="/icons/link-out_.svg"/></a></div></div> }
                  <div class={"data" + (_T === "Etext"?" etext-title":"")+(_T === "Images"?" images-title":"")}>
                     {_T === "Images" && iTitle?[<h2 class="on intro">{I18n.t("resource.scanF")}</h2>,iTitle]
                      :(_T === "Etext" && iTitle?[<h2 class="on intro">{I18n.t("resource.etextF")}</h2>,iTitle]
                       :(_T === "Etext" && wTitle?[<h2 class="on intro">{I18n.t("resource.etextF")}</h2>,wTitle]
                       :title))}
                     {inTitle}
                     {dates}
                  </div>
                  { this.renderOCR() }
                  { this.renderNoAccess(fairUse) }
                  { this.renderAccess() }
                  { this.renderMirador(isMirador) }           
                  { theDataTop }
                  <div class="data" id="perma">{ this.perma_menu(pdfLink,monoVol,fairUse,kZprop.filter(k => k.startsWith(adm+"seeOther")))  }</div>
                  { theDataBot }
                  { ( /*hasRel &&*/ this.props.assocResources && !["Instance","Images","Etext"].includes(_T)) &&
                     <div class="data related" id="resources">
                        <div>
                           <div><h2>{I18n.t(true || _T=== "Place"||_T==="Corporation"?"index.relatedR":(_T==="Product"?"index.relatedM":(_T==="Work"&&serial?"index.relatedS":"index.related")))}</h2>{ ( ( (this.state.relatedTabAll||!related.length&&!createdBy.length)&&t1) || related && related.length > 4 || createdBy && createdBy.length > 4) && <Link to={(this.state.relatedTabAll||!related.length&&!createdBy.length)&&t1?t1:("/search?t="+(_T==="Corporation"&&(this.state.relatedTab||!related.length)?"Person":(_T==="Place"&&this.state.relatedTab?"Instance":(_T==="Product"?"Scan":"Work")))+"&r="+this.props.IRI)}>{I18n.t("misc.seeA")}</Link> }</div>
                           { /*(related && related.length > 0 && (!createdBy  || !createdBy.length)) && <div class="rel-or-crea">{related}</div>*/}
                           { /*(createdBy && createdBy.length > 0 && (!related  || !related.length)) && <div class={"rel-or-crea"+(_T==="Corporation"?" person":"")}>{createdBy}</div> */}
                           { /*(related.length > 0 && createdBy.length > 0) && */ <div>
                              <Tabs>
                                 <TabList>
                                    { (related.length > 0) && <Tab onClick={(ev)=>this.setState({relatedTab:false,relatedTabAll:false,irel:0,icrea:0})}>{I18n.t(_T=== "Place"?"resource.wAbout":"resource.about",{resLabel, count:related.length, interpolation: {escapeValue: false}})} </Tab> }
                                    { (createdBy.length > 0) && <Tab onClick={(ev)=>this.setState({relatedTab:true,relatedTabAll:false,irel:0,icrea:0})}>{I18n.t(_T=== "Place"?"resource.printedA":(_T==="Corporation"?"resource.memberO":(_T==="Product"?"index.relatedM":(_T==="Work"&&serial?"index.relatedS":"resource.createdB"))),{resLabel, count:createdBy.length, interpolation: {escapeValue: false}})}</Tab> }
                                    <Tab onClick={(ev)=>this.setState({relatedTab:false,relatedTabAll:true,irel:0,icrea:0})}>{I18n.t(all=== undefined?"misc.all":"misc.allC",{count:all})} </Tab>
                                 </TabList>
                                 { (related.length > 0) &&  <TabPanel><div class={"rel-or-crea"}>{related}</div></TabPanel> }
                                 { (createdBy.length > 0) && <TabPanel><div class={"rel-or-crea"+(_T==="Corporation"?" person":"")}>{createdBy}</div></TabPanel> }
                                 <TabPanel>
                                    <div class={"rel-or-crea all"+(allRel && !allRel.length?" noAssoc":"")}>
                                    { this.props.loading && <Loader loaded={false} /> }
                                    { !this.props.loading && allRel }
                                    { !this.props.loading && allRel !== undefined && !allRel.length && <p>{I18n.t("resource.noAssoc")}</p>}
                                    </div>
                                 </TabPanel>
                              </Tabs>
                           </div> }
                        </div>
                        { 
                           (!this.state.relatedTab && !this.state.relatedTabAll && related.length > 4 || this.state.relatedTab && createdBy.length > 4 || !related.length && createdBy.length > 4) &&
                           <div id="related-nav" >
                              <span class={!this.state.relatedTab&&related.length?(this.state.irel>0?"on":""):(this.state.icrea>0?"on":"")} onClick={(ev) => scrollRel(ev)}><img src="/icons/g.svg"/></span>
                              <span class={navNext?"on":""} onClick={(ev) => scrollRel(ev,true)}><img src="/icons/d.svg"/></span>
                           </div>
                        }
                     </div> 
                  }         
                  { theEtext }
                  { theOutline }
                  { theDataLegal }
                  { theDataExt && 
                     <div class="data ext-props" id="ext-info">
                        <div><h2>{I18n.t("resource.extended")}</h2>{/*<span onClick={toggleExtProps}>{I18n.t("misc."+extPlabel)}</span>*/}</div>
                     </div> }
                  { theDataExt }
               </div>
            </div>
            {/* <Footer locale={this.props.locale}/> */}
         </div>,
         <LanguageSidePaneContainer />]

      ) ;
   }


   }
}

export default ResourceViewer ;
