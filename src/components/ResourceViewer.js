//@flow
//import {Mirador, m3core} from 'mirador'
//import diva from "diva.js" //v6.0, not working
//import Portal from 'react-leaflet-portal';
import bbox from "@turf/bbox"
import {MapContainer as Map,TileLayer,LayersControl,Marker,Popup,GeoJSON,Tooltip as ToolT} from 'react-leaflet' ;
import 'leaflet/dist/leaflet.css';
import ReactLeafletGoogleLayer from "react-leaflet-google-layer" ;
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
import ErrorOutlineIcon from '@material-ui/icons/Error';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import SpeakerNotes from '@material-ui/icons/SpeakerNotes';
import SpeakerNotesOff from '@material-ui/icons/SpeakerNotesOff';
import BlockIcon from '@material-ui/icons/Block';
import Feedback from '@material-ui/icons/QuestionAnswer';
//import NewWindow from 'react-new-window'
import InfoIcon from '@material-ui/icons/InfoOutlined';
import ErrorIcon from '@material-ui/icons/AddCircle';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import MailIcon from '@material-ui/icons/MailOutline';
import PrintIcon from '@material-ui/icons/LocalPrintshop';
import CheckCircle from '@material-ui/icons/CheckCircle';
import ChevronLeft from '@material-ui/icons/ChevronLeft';
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
import CiteIcon from '@material-ui/icons/FormatQuote';
import ClipboardIcon from '@material-ui/icons/Assignment';
import CheckIcon from '@material-ui/icons/Check';
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

import TextToggle from "./TextToggle"

import Loader from "react-loader"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLanguage } from '@fortawesome/free-solid-svg-icons'
//import {MapComponent} from './Map';
import {getEntiType,dPrefix,RISexportPath,staticQueries} from '../lib/api';
import {numtobo} from '../lib/language';
import {languages,getLangLabel,top_right_menu,prefixesMap as prefixes,sameAsMap,shortUri,fullUri,
   highlight,lang_selec,etext_lang_selec,langSelect,searchLangSelec,report_GA,getGDPRconsent,renderDates,
   renderBanner, isProxied} from './App';
import {narrowWithString} from "../lib/langdetect"
import {addMonlamStyle} from "../lib/monlam"
import Popover from '@material-ui/core/Popover';
import Popper from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import L from 'leaflet';    
import { Decimal2DMS } from 'dms-to-decimal';
import rangy from "rangy"
import "rangy/lib/rangy-textrange"

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

import { Swipeable, useSwipeable } from 'react-swipeable'

import {svgEtextS,svgInstanceS,svgImageS} from "./icons"

import {keywordtolucenequery,lucenequerytokeyword,lucenequerytokeywordmulti, isGroup} from './App';
import ResourceViewerContainer from '../containers/ResourceViewerContainer'
import InnerSearchPageContainer from '../containers/InnerSearchPageContainer'

import { getAutocompleteRequest } from "../lib/searchkit/api/AutosuggestAPI";
import { SuggestsList, updateHistory, formatResponseForURLSearchParams } from "../lib/searchkit/components/SearchBoxAutocomplete";
import { debounce } from "../lib/searchkit/helpers/utils";


import HTMLparse from 'html-react-parser';
import logdown from 'logdown'
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

import EtextPage from "./EtextPage"

import StickyElement from "./StickyElement"
import {EtextSearchBox, EtextSearchResult } from "./EtextSearchBox"

//import edtf, { parse } from "edtf/dist/../index.js" // finally got it to work!! not in prod...
import edtf, { parse } from "edtf" // see https://github.com/inukshuk/edtf.js/issues/36#issuecomment-1073778277

import { Helmet } from "react-helmet"

// error when using after build: "Uncaught ReferenceError: s is not defined"
// => fixed by upgrading react-scripts
import Cite from 'citation-js'
let citationConfig ;

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
   citationData?:{},
   etextLang?:string,
   onGetAssocTypes: (s:string) => void,
   onInitPdf: (u:string,s:string) => void,
   onRequestPdf: (u:string,s:string) => void,
   onCreatePdf: (s:string,u:string) => void,
   onGetResource: (s:string) => void,
   onGetOutline: (s:string,n?:{}) => void,
   onGetAnnotations: (s:string) => void,
   onHasImageAsset:(u:string,s:string) => void,
   onGetChunks: (s:string,b:number) => void,
   onGetPages: (s:string,b:number) => void,
   onGetETextRefs: (s:string) => void,
   onToggleLanguagePanel:()=>void,
   onResetSearch:()=>void,
   onUserProfile:(url:{})=>void,
   onGetCitationLocale:(lg:string)=>void,
   onGetCitationStyle:(s:string)=>void,
   onGetCitationData:(id:string)=>void,
   onSetEtextLang:(lang:string)=>void
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
   openEtext?:boolean,
   initCitation?:boolean,
   citationStyle?:string,
   citationLang?:string,
   citationRID?:string,
   catalogOnly?:{}
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
   

export const provNoLogo = {
   "sat":  "SAT", 
}

export const provImg = {
   "bdr":  "/logo.svg", 
   "bn":  "/BUDDHANEXUS.png",
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
      "bdo:personEvent",
      "bdo:kinWith",
      // "bdo:incarnationActivities",
      "bdo:isIncarnation",
      "bdo:hasIncarnation",
      // "bdo:incarnationGeneral",
      "bdo:personStudentOf",
      "bdo:personTeacherOf",
      "bdo:associatedTradition",
      "tmp:hasRole",
      "bdo:personGender",
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
      "tmp:GISCoordinates",
      "bdo:placeAccuracy",
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
      "bdo:workHasInstance",
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
      "tmp:outlineAuthorshipStatement",
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
   "Product":[
      rdfs+"comment"
   ],
   "Topic": [ 
      skos+"prefLabel", 
      skos+"altLabel",
      bdo+"note"
   ],
   "Person": [ 
      //bdo+"personName", 
      skos+"prefLabel", 
      skos+"altLabel",
      //bdo+"personGender"
   ],
   "Place": [ 
      skos+"prefLabel", 
      skos+"altLabel",
      _tmp+"findText",
      //bdo+"placeType",
      bdo+"placeLocatedIn",
      bdo+"placeContains",
      bdo+"placeEvent",
      _tmp+"map",
      _tmp+"GISCoordinates"
   ],
   "Work": [ 
      bdo+"hasTitle", 
      skos+"prefLabel", 
      skos+"altLabel",
      bdo+"language",
      bdo+"creator",
      bdo+"catalogInfo",
      bdo+"workHasParallelsIn",
      bdo+"workTranslationOf",
      //bdo+"workHasTranslation",
      //bdo+"workHasInstance",
   ],
   "Instance": [ 
      bdo+"creator",
      bdo+"extentStatement",
      tmp+"containingOutline",
      bdo+"instanceHasReproduction",
      tmp+"outline",
      tmp+"propHasScans",
      tmp+"propHasEtext",
      bdo+"workIsAbout",
      bdo+"workGenre",
      bdo+"catalogInfo",
      bdo+"workHasParallelsIn",
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
              
let midProperties = {
   "Instance": [ 
      _tmp+"workHasInstance",
      bdo+"workHasInstance",
      //bdo+"instanceOf",
      //bdo+"catalogInfo",
      bdo+"hasTitle", 
      skos+"prefLabel", 
      skos+"altLabel", 
      //bdo+"contentLocation",
      bdo+"instanceEvent",
      bdo+"publisherName",
      bdo+"publisherLocation",
      bdo+"editionStatement"
   ],
   "Person":[
      bdo+"personName"
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
      tmp+"dimensions",
      tmp+"contentDimensions",
      bdo+"dimensionsStatement",
      bdo+"instanceReproductionOf",
      bdo+"note",
      bdo+"instanceHasVolume",
      bdo+"paginationExtentStatement",
      bdo+"conditionGrade",
      bdo+"readabilityGrade"
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


// from https://css-tricks.com/better-line-breaks-for-long-urls/
function formatUrl(url) {
   var doubleSlash = url.split('//')
   var formatted = doubleSlash.map(str =>
      str.replace(/(:)/giu, '$1<wbr>')
         .replace(/([/~.,\-_?#%])/giu, '<wbr>$1')
         .replace(/([=&])/giu, '<wbr>$1<wbr>')
      ).join('//<wbr>')

   //loggergen.log("fU:",formatted)

   return formatted
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


class PdfZipSelector extends Component<Props,State> {

   
   constructor(props:Props)
   {
      super(props);

      this.state = { ranges: {} }
   }

   render() {

      let e = this.props.elem
      let that = this.props.that

      return <>
         <emph>{I18n.t("resource.full")}</emph>
         <span onClick={(ev) => ev.stopPropagation()}>{I18n.t("misc.or")} {I18n.t("resource.range")[0].toUpperCase()+I18n.t("resource.range").substring(1)}: <input type="text" onKeyPress={ (ev) => { 
                  //loggergen.log("key:",ev,this.state.ranges[this.props.type+"_"+e.link])
                  if(ev.key === 'Enter' && this.state.ranges[this.props.type+"_"+e.link]) {
                     that.handlePdfClick(ev,e.link,e[this.props.type+"File"],this.props.type,this.state.ranges[this.props.type+"_"+e.link])
                  } 
               }}
               onChange={(ev) => this.setState({ranges:{...this.state.ranges,[this.props.type+"_"+e.link]:ev.target.value}})}
               value={this.state.ranges[this.props.type+"_"+e.link]!==undefined?this.state.ranges[this.props.type+"_"+e.link]:"1-"}/>
            <button onClick={ev => that.handlePdfClick(ev,e.link,e[this.props.type+"File"],this.props.type,this.state.ranges[this.props.type+"_"+e.link])}>{I18n.t("resource.ok")}</button>
            <Close onClick={ev => that.setState({collapse:{...that.state.collapse, [this.props.type+"_"+e.link]:false}})} />
         </span>
      </>
   }
}



class OutlineSearchBar extends Component<Props,State>
{
   constructor(props:Props) {
      super(props);

      this.state = { 
         value: props.that.state.outlineKW?props.that.state.outlineKW:"", 
         language: props.that.state.outlineKWlang?props.that.state.outlineKWlang:"bo-x-ewts", 
         dataSource:[],
         suggestionSel: -1,
         suggestionList: []

      }

      this.handleChangeKW = debounce((newValue) => {
         const pageFilters =  "associated_res:"+props.that.props.IRI.split(":")[1]
         console.log("debounce!",props.that.props.IRI)
         getAutocompleteRequest(newValue,pageFilters).then((requests) => {
            console.log("requests:", requests)
            this.setState({ autocomplete: { newValue, requests, pageFilters } })
         });
      }, 350)
   
   }
   



   cleanOutlineCollapse() {
      let collapse = this.props.that.state.collapse
      for(let k of Object.keys(collapse)) {
         if(k.startsWith("outline-")) delete collapse[k]
      }
      return collapse
   }

   search(e, lang = this.state.language, val = this.state.value) {

      updateHistory(val, "associated_res:"+this.props.that.props.IRI.split(":")[1])
      
      let collapse = this.cleanOutlineCollapse()
      this.setState({dataSource:[], autocomplete: undefined, value: val, language: lang});
      this.props.that.setState({collapse});
      this.props.outlineSearch(e,lang,val)
   }

   changeOutlineKW(e, value) {

      loggergen.log("osb:change:",this,this.props.that)

      if(!this.props.that.state) return

      if(!value && e) value = e.target.value

      // TODO: handle different language without autocomplete?
      const language = "bo-x-ewts"

      this.setState({ value, language })

      this.handleChangeKW(value)

      /* // with old query:

      //loggergen.log("value:",value)

      let language = this.state.language
      let detec = narrowWithString(value, this.props.that.state.langDetect)
      let possible = [ ...this.props.that.state.langPreset, ...langSelect ]
      if(detec.length < 3) { 
         if(detec[0] === "tibt") for(let p of possible) { if(p === "bo" || p.match(/-[Tt]ibt$/)) { language = p ; break ; } }
         else if(detec[0] === "hani") for(let p of possible) { if(p.match(/^zh((-[Hh])|$)/)) { language = p ; break ; } }
         else if(["ewts","iast","deva","pinyin"].indexOf(detec[0]) !== -1) for(let p of possible) { if(p.match(new RegExp(detec[0]+"$"))) { language = p ; break ; } }
      }
      
      possible = [ ...this.props.that.state.langPreset, ...langSelect.filter(l => !this.props.that.state.langPreset || !this.props.that.state.langPreset.includes(l))]
      loggergen.log("detec",possible,detec,this.props.that.state.langPreset,this.props.that.state.langDetect)
      
      this.setState({ value, language, dataSource: detec.reduce( (acc,d) => {
         
         let presets = []
         if(d === "tibt") for(let p of possible) { if(p === "bo" || p.match(/-[Tt]ibt$/)) { presets.push(p); } }
         else if(d === "hani") for(let p of possible) { if(p.match(/^zh((-[Hh])|$)/)) { presets.push(p); } }
         else if(["ewts","iast","deva","pinyin"].indexOf(d) !== -1) for(let p of possible) { if(p.match(new RegExp(d+"$"))) { presets.push(p); } }
         
         return [...acc, ...presets]
      }, [] ).concat(value.match(/[a-zA-Z]/)?["en"]:[]).map(p => '"'+value+'"@'+(p == "sa-x-iast"?"sa-x-ndia":p)) } ) 
      */
   }


   render() {

      loggergen.log("osb:",this,this.props,this.state)

      return (
         <div class="search">
            <div>
               <input type="text" placeholder={I18n.t("resource.searchO")} value={this.state.value} //onChange={(e) => this.setState({value:e.target.value})}
                  onFocus={this.changeOutlineKW.bind(this)} onBlur={() => setTimeout(() => this.setState({autocomplete: undefined}), 350)}
                  /*value={this.props.that.state.outlineKW} */ onChange={this.changeOutlineKW.bind(this)} 
               onKeyDown={ (e) => { 
                  if(e.key === 'Enter') {
                     
                     
                     if(this.state.autocomplete?.suggestionSel != -1) {
                        if(! this.state.suggestionList?.length ) {
                           if(this.state.value) { 
                              this.search(e)
                           }
                        } else {
                           //console.log("acp:",this.state.autocomplete)
                           this.search(e,this.state.language, formatResponseForURLSearchParams(this.state.suggestionList[this.state.suggestionSel]?.res))
                        }
                      } else if(this.state.value){
                        this.search(e)
                      }
                     /*
                     if(this.state.dataSource?.length) { search(e, this.state.dataSource[0].split("@")[1]) }
                     else this.changeOutlineKW(null,this.state.value)
                     */


                  }  else if(e.key === "ArrowDown") {
                     if(! this.state.suggestionList?.length ) return
                     const newSel = (this.state.suggestionSel === -1 ? 0 : this.state.suggestionSel + 1) % this.state.suggestionList.length
                     this.setState({suggestionSel:newSel})
                   } else if(e.key === "ArrowUp") {
                     if(! this.state.suggestionList?.length ) return
                     const newSel = (this.state.suggestionSel === -1 ? this.state.suggestionList.length - 1 : this.state.suggestionSel - 1 + this.state.suggestionList.length) % this.state.suggestionList.length
                     this.setState({suggestionSel:newSel})
                   } 

               }}/>
               <span class="button" onClick={(e) => { if(this.state.value) { this.search(e) } }}  title={I18n.t("resource.start")}></span>
               { (this.props.that.props.outlineKW || this.props.that.state.outlineKW) && <span class="button" title={I18n.t("resource.reset")} onClick={(e) => { 
                  let collapse = this.cleanOutlineCollapse()
                  this.setState({value:"", autocomplete: undefined})
                  this.props.that.setState({outlineKW:"",collapse})
                  if(this.props.that.props.outlineKW) {
                     this.props.that.props.onResetOutlineKW()
                     let loca = { ...this.props.that.props.location }
                     if(!loca.search) loca.search = ""
                     loca.search = loca.search.replace(/((&?root)|(&?osearch))=[^&]+/g, "").replace(/[?]&/,"?")
                     this.props.that.props.navigate(loca)
                  }
               }}><Close/></span> }            
               { this.state.autocomplete && <div>
                     <Paper id="suggestions">
                        { this.state.autocomplete && <SuggestsList
                           query={this.state.autocomplete?.newValue}
                           items={this.state.autocomplete?.requests}
                           onClick={(item) => {
                              console.log("item!",item)
                              const value = item.res.replace(/<[^>]*>/g,"")
                              const language = (item.lang ?? this.state.language).replace(/_/g,"-")
                              this.search(item,language,value)
                           }}
                           setIsFocused={(f) => { if(!f) this.setState({autocomplete: undefined}) } }
                           isVisible={true}
                           setActualList={(n) => this.setState({suggestionList: n})}
                           selected={this.state.suggestionSel}
                           {...{ pageFilters: this.state.autocomplete?.pageFilters }}
                           />}
                     </Paper>
                  </div> }
               {/* (this.state.value && this.state.dataSource && this.state.dataSource.length > 0) &&   
                  <div><Paper id="suggestions">
                  { this.state.dataSource.map( (v) =>  {
                        let tab = v.split("@")
                        return (
                           <MenuItem key={v} style={{lineHeight:"1em"}} onClick={(e) => search(e,tab[1])}><span class="maxW">{ tab[0].replace(/["]/g,"")}</span> <SearchIcon style={{padding:"0 10px"}}/><span class="lang">{(I18n.t(""+(searchLangSelec[tab[1]]?searchLangSelec[tab[1]]:languages[tab[1]]))) }</span></MenuItem> ) 
                        } ) }
                  </Paper></div> */}
            </div>
         </div>
      )
   }
}
export const locales = { en: "en-US", zh: "zh-Hans-CN", bo: "bo-CN", km:"km-KH" }

export const intervalToEDTF = (notBefore = null, notAfter = null) => {
   //loggergen.log("inter2edtf:", notBefore, notAfter)
   if (notBefore == null && notAfter == null)
       return null;
   if (notBefore == null)
       return "/"+notAfter;
   if (notAfter == null)
       return notBefore+"/";
   if (notBefore[0] == notAfter[0] && notBefore[1] == notAfter[1]) {
       if (notBefore[2] == notAfter[2]) {
           if (notBefore[3] == '0' && notAfter[3] == '9')
               return notBefore.substring(0,3)+"X";
       } else if (notBefore[2] == '0' && notAfter[2] == '9' && notBefore[3] == '0' && notAfter[3] == '9') {
           return notBefore.substring(0, 2)+"XX";
       }
   }
   return notBefore+"/"+notAfter;
}
export const humanizeEDTF = (obj, str, locale = "en-US", dbg = false) => {

   //loggergen.log("edtf2H:", obj, str, locale, dbg)
   if (!obj) return ""
 
   const conc = (values, sepa) => {
     sepa = sepa ? " " + sepa + " " : ""
     return values.reduce((acc, v, i, array) => {
       if (i > 0) acc += i < array.length - 1 ? ", " : sepa
       acc += humanizeEDTF(v)
       return acc
     }, "")
   }
 
   // just output EDTF object
   if (dbg /*|| true*/) return JSON.stringify(obj, null, 3)
 
   if (obj.type === "Set") return conc(obj.values, "or")
   else if (obj.type === "List") return conc(obj.values, "and")
   else if (obj.type === "Interval" && !obj.values[0]) return "not after " + conc([obj.values[1]])
   else if (obj.type === "Interval" && !obj.values[1]) return "not before " + conc([obj.values[0]])
   else if (obj.type === "Interval") return "between " + conc(obj.values, "and")
   else if (obj.approximate) {
     if (obj.type === "Century") return "circa " + (Number(obj.values[0]) + 1) + "th c."
     return "circa " + humanizeEDTF({ ...obj, approximate: false }, str, locale, dbg)
   } else if (obj.uncertain) {
     if (obj.type === "Century") return Number(obj.values[0]) + 1 + "th c. ?"
     return humanizeEDTF({ ...obj, uncertain: false }, str, locale, dbg) + "?"
   } else if (obj.unspecified === 12) return obj.values[0] / 100 + 1 + "th c."
   else if (obj.type === "Century") return Number(obj.values[0]) + 1 + "th c."
   else if (obj.unspecified === 8) return obj.values[0] + "s"
   else if (obj.type === "Decade") return obj.values[0] + "0s"
   else if (!obj.unspecified && obj.values.length === 1) return obj.values[0]
   else if (!obj.unspecified && obj.values.length === 3) {
     try {
       const event = new Date(Date.UTC(obj.values[0], obj.values[1], obj.values[2], 0, 0, 0))
       const options = { year: "numeric", month: "numeric", day: "numeric" }
       const val = event.toLocaleDateString(locale, options)
       loggergen.log("val:",locale,val)
       return val
     } catch (e) {
       console.warn("locale error:", e, str, obj)
     }
     return str
   } else {
     return str
   }
 }


function MySwipeable(props) {
   const handlers = useSwipeable({
      onSwipedRight: (ev) => {
         loggergen.log("User Swiped Right!", ev)
         props.scrollRel(ev)
      },
      onSwipedLeft: (ev) => { 
         loggergen.log("User Swiped Left!", ev)
         props.scrollRel(ev, true)
      },
   });
   return <div {...handlers}>{props.children}</div>
}

function GenericSwipeable(props) {
   //loggergen.log("sw:",props)
   const { classN } = props
   let newProps = { ...props }
   if(classN) delete newProps.classN 
   const handlers = useSwipeable({
      ...newProps,
   });
   return <div {...handlers} className={classN}>{props.children}</div>
}


let oldScrollTop = 0


class ResourceViewer extends Component<Props,State>
{
   _annoPane = [] ;
   //_leafletMap = null ;
   _properties = {} ;
   _dontMatchProp = "" ;
   _mouseover = {}
   _refs = {}

   constructor(props:Props)
   {
      super(props);

      this.state = { uviewer:false, imageLoaded:false, collapse:{}, pdfOpen:false, showAnno:true, errors:{},updates:{},title:{}, anchorEl:{}, enableDicoSearch: true }

      loggergen.log("props",props)

      let tmp = {}
      for(let k of Object.keys(propOrder)){ tmp[k] = propOrder[k].map((e) => this.expand(e)) }
      //loggergen.log("tmp",tmp)
      propOrder = tmp

      const oldClose = (ev, gotoResults = false) => {
         //delete window.mirador

         if(window.myAnalytics.unloadMirador) window.myAnalytics.unloadMirador()

         document.getElementsByName("viewport")[0].content = "width=device-width, initial-scale=1, shrink-to-fit=no" ;

         //loggergen.log("closeV",this.state.fromSearch,this.state,this.props)

         loggergen.log("ev:", ev, gotoResults)

         let get = qs.parse(this.props.location.search)
         let hasQinS, backToPart
         if(get.s && !get.part) {
            get = qs.parse(get.s.replace(/^[^?]+[?]/,""))
            //loggergen.log("hQinS:",get) 
            if((get.q || get.r || get.w || get.i)) { hasQinS = true
               //fromSearch = this.state.fromSearch               
            }                
         }

         let fromSearch
         if(this.state.fromSearch  && !this.state.fromClick) {

            let backTo = this.state.fromSearch

            let withW = backTo.replace(/^.*[?&]([sw]=[^&]+)&?.*$/,"$1")
            if(backTo === withW) backTo = decodeURIComponent(backTo)
            else backTo = (decodeURIComponent(backTo.replace(new RegExp("(([?])|&)"+withW),"$2"))+"&"+withW).replace(/\?&/,"?")
            
            loggergen.log("fromS:",this.state.fromSearch, backTo, withW, get)
            
            //fromSearch = this.state.fromSearch

            if(gotoResults) {
               let staticRegExp = new RegExp("^(latest|"+Object.keys(staticQueries).join("|")+")(.*)$"), m;
               if(backTo.startsWith("latest")) this.props.navigate({pathname:"/latest",search:backTo.replace(/^latest/,"")})
               else if(m = backTo.match(staticRegExp)) this.props.navigate({pathname:"/"+m[1],search:m[2]})
               else if(backTo.startsWith("search")) this.props.navigate({pathname:"/search",search:backTo.replace(/^[^?]+[?]/,"")})                              
               else {
                  get = qs.parse(backTo.replace(/^[^?]+[?]/,""))
                  this.props.navigate({pathname:"/search",search:get.s?get.s:backTo.replace(/^[^?]+[?]/,"")})   
               }
            } else {
               if(backTo.startsWith("/show") && backTo.includes("backToOutline=true")) { 
                  const part = backTo.split("?")
                  this.props.navigate({pathname:part[0],search:part[1].replace(/.backToOutline=true/,"")})
               }
               
            }

            /*
            if(backTo.startsWith("latest") && gotoResults) this.props.navigate({pathname:"/latest",search:backTo.replace(/^latest/,"")})
            else if(!backTo.startsWith("/show") && hasQinS && gotoResults ) this.props.navigate({pathname:"/search",search:backTo})
            else if(hasQinS) {
               fromSearch = this.state.fromSearch
               let path = backTo.split("?")
               this.props.navigate({pathname:hasQinS&& gotoResults?"/search":path[0],search:path[1]})
            }
            else {
               fromSearch = backTo               
            }
            */
         }

         if(window.mirador) delete window.mirador
         if(window.MiradorUseEtext) delete window.MiradorUseEtext ;
         if(window.currentZoom) delete window.currentZoom ;

         let loca = { ...this.props.location }
         if(loca.hash == "#open-viewer") { 
            
            loca.hash = ""            
            window.closeMirador = true;
            
            let get = qs.parse(this.props.location.search)          
            let s = get.s ? decodeURIComponent(get.s) : ""
            if(s?.includes("/show/")) this.props.navigate(s)
            else this.props.navigate(loca)
         }

         if(this.props.feedbucket && window.innerWidth <= 800) {
            if(window.initFeedbucketInMirador) delete window.initFeedbucketInMirador;
            $(".nav+#feedback").css("display","flex");
            if(!$("#feedbucket.X").length) {
               $("feedbucket-app").removeClass("on");
               this.props.onFeedbucketClick("on");
            } else {
               this.props.onFeedbucketClick("on X");
            }
         }

         this.setState({...this.state, openUV:false, openMirador:false, openDiva:false, ...(fromSearch?{fromSearch}:{}) } ); 

      }


      $(window).off("scroll").on("scroll", (ev) => {
         if(ev.currentTarget){
         let down = false
         if(oldScrollTop < ev.currentTarget.scrollY) down = true
         
         if(down) {
            if(ev.currentTarget.scrollY >= 50) $(".resource").addClass("scrolled")
         } else {
            if(ev.currentTarget.scrollY <= 0) $(".resource").removeClass("scrolled")
         }

         oldScrollTop = ev.currentTarget.scrollY
         }
      })

      
      const that = this
      $(window).off("resize").on("resize",(ev) => {
         if(that.state.monlam) {         
            that.setState({ monlam: { ...that.state.monlam, ...that.state.monlam.updateHilightCoords() } })
         }
      })

      $(document).off("keydown").on("keydown", function (myEvent) {
   
         // function that verifies the detection
         myEvent = myEvent || window.event; // 'myEvent' is event object
         let key = myEvent.which || myEvent.keyCode; // this is to detect keyCode         
         // Detecting Ctrl / Command
         let ctrl = myEvent.ctrlKey ? myEvent.ctrlKey : ((key === 17) ? true : false);
         let cmd = myEvent.metaKey 
         
         if (that.state?.monlam?.range && key == 67 && (ctrl || cmd)) {         
            navigator.clipboard.writeText(that.state.monlam.range.toString())
            loggergen.log("copied:",that.state.monlam.range.toString())
         }
      });
      
      
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
      let s

      $(window).scroll()

      if(state.collapse.citation) {

         if(Cite && Cite.plugins && Cite.plugins.config) {

            if(!citationConfig) citationConfig = Cite.plugins.config.get('@csl')
            //loggergen.log("_cite:",citationConfig,props.citationData)
            
            let citaSty = "mla"
            if(state.citationStyle) citaSty = state.citationStyle
            // add new style if needed
            if(!citationConfig.templates.data[citaSty]) {
               if(!state.initCitation || !state.initCitation.includes(citaSty)) { 
                  props.onGetCitationStyle(citaSty)            
                  if(!s) s = { ...state }
                  if(!s.initCitation) s.initCitation = []
                  s.initCitation.push(citaSty)
               } else if(props.citationData && props.citationData.styles && props.citationData.styles[citaSty]){
                  citationConfig.templates.add(citaSty, props.citationData.styles[citaSty])
                  //loggergen.log("added:",citaSty,citationConfig)
               }
            } 

            let citaLg = props.locale
            if(state.citationLang) citaLg = state.citationLang
            else if(props.locale === "en") citaLg = "latn"
            const supportedLocales = { "bo":"en-US", "en":"en-US", "zh":"zh-CN", "latn":"en-US" }
            // add new locale if needed
            if(supportedLocales[citaLg] && !citationConfig.locales.data[supportedLocales[citaLg]]) {               
               if(!state.initCitation || !state.initCitation.includes(citaLg)) { 
                  const supportedLocales = { "en":"en-US", "zh":"zh-CN" }
                  if(supportedLocales[citaLg]) { 
                     props.onGetCitationLocale(supportedLocales[citaLg])            
                  }
                  if(!s) s = { ...state }
                  if(!s.initCitation) s.initCitation = []
                  s.initCitation.push(citaLg)
               } else if(props.citationData && props.citationData.locales && props.citationData.locales[supportedLocales[citaLg]]){
                  citationConfig.locales.add(supportedLocales[citaLg], props.citationData.locales[supportedLocales[citaLg]])
                  //loggergen.log("added:",citaLg,citationConfig)
               }
            }

            // fetch citation data if needed
            if(props.IRI && (!props.citationData || !props.citationData.data || !props.citationData.data[props.IRI])) {
               if(!state.initCitation || !state.initCitation.includes(props.IRI)) { 
                  props.onGetCitationData(props.IRI)            
                  if(!s) s = { ...state }
                  if(!s.initCitation) s.initCitation = []
                  s.initCitation.push(props.IRI)
               }
               /* // moved to getDerivedStateFromProp
               } else if(props.citationData && props.citationData.data && props.citationData.data[props.IRI]){
                  //citationConfig.templates.add(citaSty, props.citationData.styles[citaSty])
                  loggergen.log("added:",props.citationData.data[props.IRI])
               }
               */
            } 
            
         }
      }

/* // v0
 
         let citaLg = (!state.citationLang?props.locale:state.citationLang), hasLg = false ;
         let citaSty = (!state.citationStyle?"mla":state.citationStyle), hasSty = false ;
         if(!props.citationData 
         || !props.citationData.locales 
         || (hasLg = !props.citationData.locales[citaLg])
         || !props.citationData.styles
         || (hasSty = !props.citationData.styles[citaSty])) {

            if(!hasLg && (!state.initCitation || !state.initCitation.includes(citaLg))) { 
               const supportedLocales = { "en":"en-US", "zh":"zh-CN" }
               if(supportedLocales[citaLg]) { 
                  props.onGetCitationLocale(supportedLocales[citaLg])            
               }
               if(!s) s = { ...state }
               if(!s.initCitation) s.initCitation = []
               s.initCitation.push(citaLg)
            }

            if(!hasSty && (!state.initCitation || !state.initCitation.includes(citaSty))) { 
               props.onGetCitationStyle(citaSty)            
               if(!s) s = { ...state }
               if(!s.initCitation) s.initCitation = []
               s.initCitation.push(citaSty)
            }
         } 
         */
      
      

      if(props.auth) {
         const { userProfile, getProfile, isAuthenticated } = props.auth;         
         if (isAuthenticated() && !userProfile && !state.fetchedProfile) {
            if(!s) s = { ...state }
            s.fetchedProfile = true
            // this will set props.auth.userProfile
            getProfile((err, profile) => {
               // loggergen.log("profile:",profile,this.props.auth.userProfile)
            });
         }

         if(state.collapse["commit"] && props.resources && props.resources[props.IRI]) {
            let logs = props.resources[props.IRI][bda+props.IRI.replace(/bdr:/,"")]
            if(logs && logs[adm+"logEntry"]) {
               logs = logs[adm+"logEntry"]
               //loggergen.log("logs:",logs)
            }
         }
      }

      // #732 handle withdrawn record links in tabs
      const replaceW = (id) => { 
         if(id?.length) {
            if(props.assocResources) {
               const rw = getElem(adm+"replaceWith",shortUri(id[0].value)) 
               if(rw?.length) return rw
            }
         }
         return id
      }

      const getElem = (prop,IRI,useAssoc,subIRI) => {         
         let longIRI = fullUri(IRI)
         if(subIRI) longIRI = subIRI
         if(useAssoc) {
            let elem = useAssoc[longIRI]
            if(elem) elem = elem.filter(e => e.type === prop || e.fromKey === prop)
            else elem = null
            return replaceW(elem)
         }
         else if(props.resources && props.resources[IRI] && props.resources[IRI][longIRI]){
            let elem = props.resources[IRI][longIRI][prop]
            return replaceW(elem)
         }
      }



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

      /* // no need
      if(props.outlines) {
         if(!state.outlines) {
            if(!s) s = { ...state }
            s.outlines = {}
         }
         for(let k of Object.keys(props.outlines)) {
            if(!state.outlines || !state.outlines[k] || props.outlines[k] != state.outlines[k]) {
               if(!s) s = { ...state }
               s.outlines[k] = props.outlines[k]
            }
         }
      }
      */

      // fix Volume toggle not possible because volume id not known 
      if(props.outlines && props.IRI) {
         for(let k of Object.keys(props.outlines)) {
            if(props.outlines[k] && props.outlines[k] !== true && state.collapse["outline-"+props.IRI+"-"+k] === undefined) {
               //console.warn("strange:",k)
               if(!s) s = { ...state }
               s.collapse["outline-"+props.IRI+"-"+k] = true
            }
         }
      }
      
      if(props.resources && props.resources[props.IRI]) {

         
         let root = getElem(bdo+"inRootInstance",props.IRI)
         if(root && root.length) {
            let shR = shortUri(root[0].value)
            if(props.outlines && !props.outlines[shR] && props.config && state.outlinePart) props.onGetOutline(shR)
         }

         // #754 don't need to get outline data when on sub-node record page
         if(props.IRI && !props.outline && getEntiType(props.IRI) === "Instance" && props.config && !root?.length) {             
            let hasPartB = getElem(tmp+"hasNonVolumeParts",props.IRI)
            if(hasPartB?.length && hasPartB[0].value == "true") props.onGetOutline(props.IRI, { "tmp:hasNonVolumeParts": true})
            else props.onGetOutline(props.IRI)
         }

         let 
            work = getElem(bdo+"instanceOf",props.IRI),
            instance = getElem(bdo+"instanceReproductionOf",props.IRI),
            images = getElem(bdo+"instanceHasReproduction",props.IRI),
            _T = getEntiType(props.IRI)

         
         // #732 show Scans rather than Etext as third tab 
         if(images) images = _.sortBy(images, (i) => i.value && i.value.includes("/resource/W")?-1:1)
         

         // TODO find a way to keep an existing Etext/Images tab
         //if(images) images = images.filter(e => getEntiType(e.value) === "Images")


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
            else if( /* _T === "Etext" && */ instance?.length) {
               //loggergen.log(instance)
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
               
               //console.warn("has!",has)

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


         // no scans for instance/work (#527)
         let catalogOnly = false
         if(state.catalogOnly && state.catalogOnly[props.IRI] !== undefined) catalogOnly = catalogOnly[props.IRI] 
         if(_T == "Instance" && state.title && !state.title.images && (!s || !s.title || !s.title.images) && (!root || !root.length)) {             
            //console.warn("no scans!",_T)
            catalogOnly = true 
         } else if(_T === "Work" && state.title && state.title.instance && !state.title.images ) {
            let img = getElem(bdo+"instanceHasReproduction",shortUri(state.title.instance[0].value))
            let inRoot = getElem(bdo+"inRootInstance",shortUri(state.title.instance[0].value))
            if((!img || !img.length)  && (!inRoot || !inRoot.length) && (!s || !s.title || !s.title.images) ) {
               //console.warn("no scans or not loaded yet?",_T,img,inRoot)
               catalogOnly = true 
            } else {
               //console.warn("not has no scans!",_T,img,inRoot)
               catalogOnly = false 
            }            
         }
         if(catalogOnly) {
            if(!s) s = { ...state }
            s.catalogOnly = { ...s.catalogOnly, [props.IRI]:true }
         } else if(state.catalogOnly && state.catalogOnly[props.IRI]) {
            if(!s) s = { ...state }
            s.catalogOnly = { ...s.catalogOnly, [props.IRI]:false }
         }
         //console.warn("catOn:",catalogOnly,s.catalogOnly)




         //loggergen.log("title?",JSON.stringify(state.title,null,3),JSON.stringify(s?s.title:state.title,null,3),props.IRI,_T)
      }

      if(props.IRI && props.resources && props.resources[props.IRI]) {
         if(!s) s = { ...state }
         s.ready = true
      }

      let loadETres = props.disableInfiniteScroll?.outETvol
      if(loadETres?.length) {
         loadETres = shortUri(loadETres?.[0]?.value ?? "")
         if(state.currentText != loadETres && !props.resources[props.IRI]) {
            let startChar =  Number(props.disableInfiniteScroll?.outETstart?.[0].value ?? 0)
            props.onLoading("etext", true)            
            props.onReinitEtext(loadETres, { startChar }, true)
            if(!s) s = { ...state }
            s.currentText = loadETres
         }
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

   browseByWithGenderLabel() {
      let gender = this.getResourceElem(bdo+"personGender")
      if(gender && gender.length && gender[0].value && gender[0].value === bdr + "GenderFemale") return I18n.t("misc.her")
      else return I18n.t("misc.his")
   }

   isEtext() {
      let etext = this.getResourceElem(rdf+"type")
      if(etext && etext.filter(e=> e.value.startsWith(bdo+"Etext")).length) etext = true
      else etext = false

      //loggergen.log("isEt?",etext)

      return etext
   }

   scrollToHashID(location) {

      // TODO scroll to top when IRI changed (and not on collapse open/close)
      // window.scrollTo(0, 0)

      //loggergen.log("histo?",JSON.stringify(history.location),this.state.openEtext)

      if(!location) return

      let loca = { ...location }
      const hash = loca.hash.substring(1)
      
      if (hash && hash.length) {
         if(hash === "open-viewer") {
            // fix infinite loop - TODO? directly open viewer when outline node
            if(this.state.opart && this.state.opartinview !== "tmp:none") this.setState({ opartinview:"tmp:none" })
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
         else { 
            let _this = this
            setTimeout( 
               window.requestAnimationFrame(function () {
                  let el 
                  
                  if(_this._refs["fromText"] && _this._refs["fromText"].current) el = _this._refs["fromText"].current
                  else el = document.getElementById(hash)

                  if(el) { 
                     el.scrollIntoView()      
                     delete loca.hash      
                     this.props.navigate(loca, {replace: true})
                  }
               }), 
               3000 
            )
         }
      }
      /*
      else if(this.state.openEtext) {         
         this.setState({openEtext:false })
      }
      */
   }



   componentDidUpdate()  {

      if(!this.props.pdfDownloadOnly && !this.props.outlineOnly) window.closeViewer = (ev, gotoResults = false) => {

         loggergen.log("ev:", ev, gotoResults, this.props.location)

         if(window.myAnalytics.unloadMirador) window.myAnalytics.unloadMirador()
         if(window.mirador) delete window.mirador
         if(window.MiradorUseEtext) delete window.MiradorUseEtext ;
         if(window.currentZoom) delete window.currentZoom ;
         
         setTimeout( () => {
            this.setState({ ...this.state, openMirador:false }); 
         }, 15)

         setTimeout( () => {

            let loca = { ...this.props.location }
            if(loca.hash == "#open-viewer") { 
            
               loca.hash = ""            
               window.closeMirador = true;
               
               let get = qs.parse(this.props.location.search)
               if(gotoResults) {
                  let _get = qs.parse(get.s.split("?")[1])
                  console.log("bTr:1",_get)
                  if(_get.s?.includes("/search")) {
                     this.props.navigate(decodeURIComponent(_get.s))         
                     return
                  }
               } 
               //console.log("bTr:2",this.props.location.search,get)
               if(get.s?.includes("/show/")) this.props.navigate(get.s)
               else this.props.navigate(loca)
            }

         }, 10)

         
         if(this.props.feedbucket && window.innerWidth <= 800) {
            if(window.initFeedbucketInMirador) delete window.initFeedbucketInMirador;
            $(".nav+#feedback").css("display","flex");
            if(!$("#feedbucket.X").length) {
               $("feedbucket-app").removeClass("on");
               this.props.onFeedbucketClick("on");
            } else {
               this.props.onFeedbucketClick("on X");
            }
         
         }
      }
      
      //console.log("cdp:openMirador", this.props.IRI, this.props.pdfDownloadOnly, this.state.openMirador)

      if(this.state.openMirador) { 
         let t = getEntiType(this.props.IRI);  
         let inRoot =  this.getResourceElem(bdo+"inRootInstance")
         if(t && t != "Images" && !inRoot?.length) {
            this.setState({openMirador:false})
            return
         }
      }


      report_GA(this.props.config,this.props.location);
      
      if(window.closeMirador) { 
         delete window.closeMirador
         if(this.state.openMirador && window.closeViewer) {
            window.closeViewer()         
         }
      }

      let get = qs.parse(this.props.location.search)
      if(!get.osearch && this.props.outlineKW) {          
         //this.setState({outlineKW:"",dataSource:[]})
         this.props.onResetOutlineKW()
         
         if(!s) s = { ...this.state } 
         clear = true
      }

      let s, clear, part = this.props.part ?? get.part
      
      if(part && this.state.outlinePart !== part) { 
         if(!s) s = { ...this.state } 
         if(!s.title) s.title = {}
         s.outlinePart = part
         clear = true
      }
      
      if(!part && (!s && this.state.outlinePart || s && s.outlinePart) ) {
         if(!s) s = { ...this.state } 
         s.outlinePart = false
         clear = true
      }
      //loggergen.log("outlinePart: ", s?s.outlinePart:"no s")
      if(clear) {
         let collapse = { ...s.collapse }
         Object.keys(collapse).filter(k => k.startsWith("outline-")).map(k => { delete collapse[k]; })
         s.collapse = collapse
      }


      if(get.s && (!s && this.state.fromSearch !== get.s || s && s.fromSearch !== get.s ) ) { 
         if(!Array.isArray(get.s)) {
            if(!s) s = { ...this.state } 
            s.fromSearch = get.s
         }
      }

      // DONE
      // + clean collapsed nodes when changing node/part
      // + change hilighted node
      // TODO
      // - expand '...' node already open by search

      //loggergen.log("update!!",s)
      

      let loca = { ...this.props.location }
      const hash = loca.hash.substring(1)
      
      if (hash && hash.length && hash === "open-viewer" && !this.props.pdfDownloadOnly && !this.props.outlineOnly) {

         let etext = this.isEtext()

         loggergen.log("etxt?",etext, this.props.imageAsset,this.props.firstImage,this.state.openMirador)

         if(!etext && this.props.imageAsset /*&& this.props.firstImage*/) {
            if(!this.state.openMirador) { 
               let t = getEntiType(this.props.IRI);  
               let inRoot =  this.getResourceElem(bdo+"inRootInstance")
               if(t && (t == "Images" || t == "Instance" && inRoot?.length)) {
                  console.log("call showM", this.props.IRI)
                  this.showMirador()   
               }
            } 

            //delete loca.hash      
            //history.replace(loca)
         }
         else if( etext && (!s && !this.state.openEtext || s && !s.openEtext ) ) {
            if(!s) s = { ...this.state } 
            s.openEtext = true 
         }         
      }      

      if(s) this.setState(s);

      if(this.props.monlamResults) {
         $(".dhtmlgoodies_question.collapsible").off("click").on("click",function(ev) {
            //alert("ok!")
            $(ev.currentTarget).toggleClass("on")
         })
      }
      
      this.scrollToHashID(this.props.location)

      if(window.initFeedbucket) window.initFeedbucket()
   }

   componentWillUnmount() {
      //console.log("cwu:openMirador",this.props.IRI, this.props.pdfDownloadOnly, this.state.openMirador)
      window.removeEventListener('popstate', this.onBackButtonEvent);
   }
   
   componentDidMount()
   {
      //console.log("cdm:openMirador",this.props.IRI,this.props.pdfDownloadOnly,this.state.openMirador)
      
      window.addEventListener('popstate', this.onBackButtonEvent);  

      //console.log("props:", this.props)

      let s, timerScr
      let get = qs.parse(this.props.location.search)
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

      this.scrollToHashID(this.props.location)
   }

   onBackButtonEvent(event) {      
      // DONE fix back button to page with open mirador not working
      if(window.location.hash !== "#open-viewer") window.closeMirador = true ;
      else if(window.location.search.includes("openEtext")) { 
         // quickfix for etext viewer
         window.location.reload()

         /*
         // better fix? this.props looks undefined...
         let ETres = window.location.search.replace(/^.*openEtext=([^#&]+)[#&].*$/,"$1")
         this.props.onLoading("etext", true)
         this.props.onReinitEtext(ETres)
         this.setState({ currentText: ETres })
         */
      }
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
      
      // no need, data should not have entities
      // str = htmlEntitiesDecode(str)

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

      w = prop[bdo+"contentWidth"]
      h = prop[bdo+"contentHeight"]

      //loggergen.log("propZ",prop,sorted)

      if(w && h && w[0] && h[0] && !w[0].value.match(/cm/) && !h[0].value.match(/cm/)) {
         prop[tmp+"contentDimensions"] = [ {type: "literal", value: w[0].value+"×"+h[0].value+"cm" } ]
         delete prop[bdo+"contentWidth"]
         delete prop[bdo+"contentHeight"]
      }
      else if(w && w[0] && !w[0].value.match(/cm/)) {
         prop[bdo+"contentWidth"] = [ { ...w[0], value:w[0].value+"cm" } ]
      }
      else if(h && h[0] && !h[0].value.match(/cm/)) {
         prop[bdo+"contentHeight"] = [ { ...h[0], value:h[0].value+"cm" } ]
      }

      const customDMS = (val, tag, obj) => {
         const res = Decimal2DMS(val, tag)
         if(obj) {
            if(obj.res) obj.res += ", " 
            obj.res += res
         }
         const str = ""+val
         if(str.match(/[.][0-9][0-9]$/)) {
            const parts = res.split(/[°'"]/)
            const sec = Number(parts[2])
            let min = Number(parts[1])
            if(sec > 30) min++
            return parts[0]+"°"+min+"'"+parts[3] 
         } 
         return res
      }

      let lat = prop[bdo+"placeLat"]
      let lon = prop[bdo+"placeLong"]
      if(lon?.length && lat?.length) {      
         const obj = null, // = { res:"" }, 
            val = customDMS(lat[0].value, "latitude", obj)+", "+customDMS(lon[0].value, "longitude", obj) 
         prop[tmp+"GISCoordinates"] = [ { type:"literal", value: val, decimalValue:lat[0].value+", "+lon[0].value }] //, tmpUnrounded:obj.res } ]
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

      if(prop[bdo+"instanceHasReproduction"] && !prop[rdf+"type"].some(t => t.value === bdo+"ImageInstance")) {
         let etexts = [ ...prop[bdo+"instanceHasReproduction"].filter(p => p.value && p.value.startsWith(bdr+"IE")) ] ;
         let images = [ ...prop[bdo+"instanceHasReproduction"].filter(p => p.value && p.value.startsWith(bdr+"W")) ] ;

         if(etexts.length) prop[tmp+"propHasEtext"] = etexts
         if(images.length) prop[tmp+"propHasScans"] = images

         //delete prop[bdo+"instanceHasReproduction"]
      }

      if(prop[bdo+"contentLocation"] && prop[bdo+"inRootInstance"] && prop[rdf+"type"].some(t => t.value === bdo+"Instance")) {

         prop[tmp+"propHasScans"] = [{ type: "uri", value: this.props.IRI }]
      }
      
      // #918
      if(!prop[tmp+"propHasEtext"] && prop[tmp+"hasEtextInOutline"]?.length == 1) {
         prop[tmp+"propHasEtext"] = prop[tmp+"hasEtextInOutline"]
      }

      if(!prop[tmp+"propHasEtext"] && prop[tmp+"propHasScans"]) prop[tmp+"propHasEtext"] = [{ value:tmp+"notAvailable"}]

      if(sorted)
      {

         let customSort = [ bdo+"hasPart", bdo+"instanceHasVolume", bdo+"workHasInstance", tmp+"siblingInstances", bdo+"hasTitle", bdo+"personName", bdo+"volumeHasEtext", prop[tmp+"hasEtextInOutline"],
                            bdo+"personEvent", bdo+"placeEvent", bdo+"workEvent", bdo+"instanceEvent", bf+"identifiedBy", bdo+"lineageHolder", bdo+"creator" ]

         let sortLineageHolder = () => {
            let parts = prop[bdo+"lineageHolder"]
            if(parts) {
               let assoR = this.props.assocResources, extData = [], sorted = []
               if (assoR) {
                  for(let p of parts) {
                     let lh = assoR[p.value]
                     if(lh) {
                        let from = lh.filter(t => t.fromKey == bdo+"lineageFrom")
                        if(from.length) from = from[0].value
                        else from = null
                        let to = lh.filter(t => t.fromKey == bdo+"lineageWho")
                        if(to.length) to = to[0].value
                        else to = null
                        extData.push({...p, from, to})                        
                     }
                  }
                  //loggergen.log("lh:",extData)
                  for(let p of extData) {
                     if(!sorted.length) sorted.push(p)
                     else {   
                        let idx = sorted.length
                        for(let i in sorted) {
                           let s = sorted[i]
                           if(s.from === p.to) {
                              idx = i  ;
                              break ;
                           }
                        }                     
                        sorted.splice( idx, 0, p );
                     }
                  }
                  //loggergen.log("sorted:",sorted)
                  return sorted.reverse()
               }
               return parts ;
            }
         }

         if(prop[bdo+"lineageHolder"]) prop[bdo+"lineageHolder"] = sortLineageHolder();


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



         let sortBySubPropNumber = (tag:string,idx:string,idx2?:string) => {
            let parts = prop[tag]
            if(parts) {

               //console.log("sBspN:", tag, idx, parts, this.props.assocResources)

               let assoR = this.props.assocResources
               if (assoR) {
                  parts = parts.map((e) => {

                     let index = assoR[e.value], index2 = null

                     if(index) index = index.filter(e => e.type === idx || e.fromKey === idx)
                     if(index && index[0] && index[0].value) index = Number(index[0].value)
                     else index = null

                     if(idx2) {
                        index2 = assoR[e.value]
                        if(index2) index2 = index2.filter(e => e.type === idx || e.fromKey === idx)
                        if(index2 && index2[0] && index2[0].value) index2 = Number(index2[0].value)
                        else index2 = null
                     }

                     return ({ ...e, index, index2 })
                  })
                  parts = _.orderBy(parts,['index','index2'],['asc','asc'])
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

         // #918
         if(!prop[tmp+"propHasEtext"] && prop[tmp+"hasEtextInOutline"]?.length > 1 && this.props.assocResources) {
            prop[tmp+"propHasEtext"] = [ sortBySubPropNumber(tmp+"hasEtextInOutline",tmp+"eTextInVolumeNumber",bdo+"sliceStartChar")[0] ];
         }

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


         let sortByEventType = (tagEnd:string) => {
            let valSort = prop[bdo+tagEnd] 

            if(this.props.dictionary && this.props.resources && this.props.assocResources) {
               let assoR = this.props.resources[this.props.IRI]
               const order = {
                  evT: [ 
                     "ThirdRevisedEvent",
                     "ThirdTranslatedEvent", 
                     "SecondRevisedEvent", 
                     "SecondTranslatedEvent", 
                     "RevisedEvent", 
                     "TranslatedEvent", 
                  ],
                  role: [ 
                     "R0ER0023", //reviser
                     "R0ER0018", //Source Language Scholar
                     "R0ER0020", //oral translator
                     "R0ER0026", //translator
                     "R0ER0011", //attributed author
                     "R0ER0016", //contributing author
                     "R0ER0019", //main author
                  ] 
               }
               if(assoR) { 
                  valSort = valSort.map(v => {
                     if(assoR[v?.value]) {
                        //loggergen.log("assoR:",assoR[v.value],assoR[v.value][bdo+"agent"][0].value,assoR[assoR[v.value][bdo+"agent"][0].value])

                        let evT = assoR[v.value][bdo+"creationEventType"]
                        if(!evT) evT = [{ idx:9, value: "" }]
                        else evT = evT.map(e => ({...e, idx:order.evT.findIndex(w => e.value.endsWith(w))}))
                        evT = evT.map(v => v.idx+";"+v.value).join(";")

                        let role = assoR[v.value][bdo+"role"]
                        if(!role) role = [{ idx:0, value: "" }]
                        else role = role.map(e => ({...e, idx:order.role.findIndex(w => e.value.endsWith(w))}))
                        role = role.map(r => r.idx+";"+r.value).join(";")

                        let label,lang 
                        if(assoR[v.value][bdo+"agent"] && assoR[v.value][bdo+"agent"].length && this.props.assocResources[assoR[v.value][bdo+"agent"][0].value]) {
                           label = getLangLabel(this, "", this.props.assocResources[assoR[v.value][bdo+"agent"][0].value])
                           if(label) {
                              lang = label.lang
                              label = label.value
                           }
                        }

                        return { ...v, evT, role, lang, label }
                     } else {
                        return v
                     }
                  })
                  //loggergen.log("vS:",valSort)
                  valSort = _.orderBy(valSort,['evT', 'role', 'lang','label'],['desc','desc','asc','asc']).map(v => ({value:v.value, type:v.type}))
               }
            }
            return valSort
         }

         if(prop[bdo+"creator"]) prop[bdo+"creator"] = sortByEventType("creator");




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

                        //loggergen.log("sBeD:",w,assoR[w.value])

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
                           if(d) d = Number(d.value)
                        }                           
                        else if(assoR[w.value][bdo+"notBefore"]) {
                           d = assoR[w.value][bdo+"notBefore"][0]
                           if(d) d = Number(d.value)
                        }

                        if(assoR[w.value][bdo+"eventWhen"]){
                           
                           if(!assoR[w.value][bdo+"eventWhen"][0].parsed) {

                              assoR[w.value][bdo+"eventWhen"][0].parsed = true
                              
                              //loggergen.log("eW:",JSON.stringify(assoR[w.value][bdo+"eventWhen"][0], null,3))
                              
                              let value = assoR[w.value][bdo+"eventWhen"][0].value, obj, edtfObj, readable = value
                              if(value?.includes("XX?")) value = value.replace(/XX\?/,"?") // #771
                              try {
                                 obj = parse(value)
                                 edtfObj = edtf(value)
                                 readable = humanizeEDTF(obj, value, locales[this.props.locale])

                                 d = Number(edtf(edtfObj.min)?.values[0])
                                 loggergen.log("date:",d)

                              } catch(e) {
                                 console.warn("EDTF error:",e,value,obj,edtfObj,readable)
                              }
                              
                              assoR[w.value][bdo+"eventWhen"][0].d = d
                              assoR[w.value][bdo+"eventWhen"][0].edtf = value
                              assoR[w.value][bdo+"eventWhen"][0].value = readable
                           } else {
                              d = assoR[w.value][bdo+"eventWhen"][0].d
                           }

                        } else {
                           let sameAsData = {}, value = "", notBefore, notAfter
                           if(assoR[w.value][bdo+"onYear"]) { 
                              value = assoR[w.value][bdo+"onYear"][0].value
                              if(assoR[w.value][bdo+"onYear"][0].datatype == xsd+"integer") { 
                                 if(Number(value) >= 0) value = value.padStart(4,"0")
                                 else value = "-"+value.replace(/^-/,"").padStart(4,"0")
                              }
                              if(assoR[w.value][bdo+"onYear"][0].fromSameAs) sameAsData.fromSameAs = assoR[w.value][bdo+"onYear"][0].fromSameAs
                              if(assoR[w.value][bdo+"onYear"][0].allSameAs) sameAsData.allSameAs = [ ...assoR[w.value][bdo+"onYear"][0].allSameAs ]
                           } 
                           else if(assoR[w.value][bdo+"onDate"]) { 
                              value = assoR[w.value][bdo+"onDate"][0].value
                              if(assoR[w.value][bdo+"onDate"][0].fromSameAs) sameAsData.fromSameAs = assoR[w.value][bdo+"onDate"][0].fromSameAs
                              if(assoR[w.value][bdo+"onDate"][0].allSameAs) sameAsData.allSameAs = [ ...assoR[w.value][bdo+"onDate"][0].allSameAs ]
                           } else {
                              if(assoR[w.value][bdo+"notBefore"]) { 
                                 notBefore = assoR[w.value][bdo+"notBefore"][0].value
                                 if(assoR[w.value][bdo+"notBefore"][0].fromSameAs) sameAsData.fromSameAs = assoR[w.value][bdo+"notBefore"][0].fromSameAs
                                 if(assoR[w.value][bdo+"notBefore"][0].allSameAs) sameAsData.allSameAs = [ ...assoR[w.value][bdo+"notBefore"][0].allSameAs ]
                              } 
                              if(assoR[w.value][bdo+"notAfter"]) { 
                                 notAfter = assoR[w.value][bdo+"notAfter"][0].value
                                 if(assoR[w.value][bdo+"notAfter"][0].fromSameAs) sameAsData.fromSameAs = assoR[w.value][bdo+"notAfter"][0].fromSameAs
                                 if(assoR[w.value][bdo+"notAfter"][0].allSameAs) sameAsData.allSameAs = [ ...assoR[w.value][bdo+"notAfter"][0].allSameAs ]
                              }
                              if(notBefore !== undefined|| notAfter !== undefined) value = intervalToEDTF(notBefore, notAfter)
                           }                          


                           if(value) {

                              let obj, edtfObj, readable = value
                              if(value?.includes("XX?")) value = value.replace(/XX\?/,"?") // #771
                              try {
                                 obj = parse(value)
                                 edtfObj = edtf(value)
                                 readable = humanizeEDTF(obj, value, locales[this.props.locale])
                              } catch(e) {
                                 console.warn("EDTF error:",e,value,obj,edtfObj,readable)
                              }

                              assoR[w.value][bdo+"eventWhen"] = [ { 
                                 parsed: true,
                                 edtf:value,
                                 value: readable, 
                                 datatype:"http://id.loc.gov/datatypes/edtf",
                                 ...sameAsData
                              } ]
                           }
                        }

                        // DONE: keep fromSameAs
                        /*
                        if(assoR[w.value][bdo+"eventWhen"]) {
                           loggergen.log("del?",w.value,JSON.stringify(assoR[w.value],null,3))
                           if(assoR[w.value][bdo+"onYear"]) delete assoR[w.value][bdo+"onYear"]
                           if(assoR[w.value][bdo+"notBefore"]) delete assoR[w.value][bdo+"notBefore"]
                           if(assoR[w.value][bdo+"notAfter"]) delete assoR[w.value][bdo+"notAfter"]
                        } 
                        */
                        
                     } 
                     if(!d) d = 100000
                     if(w.type!=='bnode'||!assoR[w.value]) return w
                     else return { ...w, d, n, k, bnode:w.value }
                  })
                  valSort = _.orderBy(valSort,['fromEvent','n', 'd', 'k'],['asc']).map(e => ({'type':'bnode','n':e.n,'k':e.k,'d':e.d,'value':e.bnode,'sorted':true, ...e.fromEvent?{fromEvent:e.fromEvent}:{}, ...e.fromSameAs?{fromSameAs:e.fromSameAs}:{}}))               
                  //loggergen.log("valsort",assoR,valSort)
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
                        withThumb = 1 - assoR[e.value].filter(e => e.type && e.type.startsWith(tmp+"thumbnailIIIFSe")).length 

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



   fullname(prop:string,isUrl:boolean=false,noNewline:boolean=false,useUIlang:boolean=false,canSpan = true,count?:integer=1,lang?:string="")
   {
      if(prop && !prop.replace) {
         //console.warn("prop:?:",prop)
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
         if(ret && ret.value && ret.value != "") {
            let hasSpace = false
            if(ret.value.includes(" ")) hasSpace = true            
            if(canSpan) return <span lang={ret.lang} {...hasSpace?{className:"hasSpace"}:{}}>{ret.value}</span>
            else return ret.value
         }

       //&& this.props.ontology[prop][rdfs+"label"][0] && this.props.ontology[prop][rdfs+"label"][0].value) {
         //let comment = this.props.ontology[prop][rdfs+"comment"]
         //if(comment) comment = comment[0].value
         //return <a className="nolink" title={comment}>{this.props.ontology[prop][rdfs+"label"][0].value}</a>
         //return this.props.ontology[prop][rdfs+"label"][0].value
      }

    
      if(canSpan) { 
         let hasSpace = false
         if(prop.includes(" ")) hasSpace = true            
         return <span {...hasSpace?{className:"hasSpace"}:{}} lang={lang}>{this.pretty(prop,isUrl,noNewline)}</span>
      }
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
      // related to #828
      if(!k.includes("purl.bdrc.io")) return false
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

   getInfo(prop,infoBase,withProp,parent = "")
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

         //loggergen.log("info?",info,infoBase)

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
               if(infoBase[0].type && (infoBase[0].type == bdo+"volumeNumber" || infoBase[0].fromKey == bdo+"volumeNumber"))  {
                  if(parent && isGroup(this.props.auth, "editors")) info = I18n.t("types.volume_num",{num:infoBase[0].value, id:shortUri(parent).replace(/^[^:]+:/,"")}) ;
                  else info = I18n.t("types.volume_num_noid",{num:infoBase[0].value }) ;
               }
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
      if(prov) prov = prov.replace(/The SAT .*/g,"SAT")      
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
         
         if(elem?.value?.startsWith("bdr:")) elem.value = elem.value.replace(/^bdr:/,bdr)

         // related to #828
         if(!elem.value.includes("purl.bdrc.io") /* && !hasExtPref */ && ((!dic || !dic[elem.value]) && !prop?.match(/[/#]sameAs/))) {
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
         if(prop === adm+"logWho") noLink = true
   
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


            // handle case of associatedTradition/broader
            else if(infoBase &&  infoBase[skos+"broader"]) infoBase = infoBase[skos+"broader"]

         }

         //loggergen.log("base:", noLink, JSON.stringify(infoBase,null,3))

         if(infoBase) {
            let { _info, _lang } = this.getInfo(prop,infoBase,withProp, !elem.noid?elem.value:undefined) 
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
         
         let sUri = shortUri(elem.value)
         let inRoot =  this.getResourceElem(bdo+"inRootInstance", sUri, this.props.assocResources)

         let thumb, thumbV, hasThumbV, enti = getEntiType(elem.value)
         if(prop === bdo+"workHasInstance"  || prop === tmp+"propHasScans" || prop === tmp+"propHasEtext" ) {
            if(!info) info = [] 

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
               
               //let vlink = "/"+show+"/"+prefix+":"+pretty+"?s="+encodeURIComponent(this.props.location.pathname+this.props.location.search)+"#open-viewer"    
               let vlink = "/"+show+"/"+prefix+":"+pretty+"?backToEtext="+this.props.IRI+"#open-reader"    
               ret = [  <Link {...this.props.preview?{ target:"_blank" }:{}} to={"/show/"+sUri} class={"images-thumb no-thumb 1"} style={{"background-image":"url(/icons/etext.png)"}}></Link> ,
                     <div class="images-thumb-links"  data-n={1}>
                        <Link {...this.props.preview?{ target:"_blank" }:{}} className={"urilink "+ prefix} to={vlink}>{I18n.t("resource.openViewer")}</Link>
                        {/* <Link {...this.props.preview?{ target:"_blank" }:{}} className={"urilink "+ prefix} to={"/"+show+"/"+prefix+":"+pretty}>{I18n.t("resource.openR")}</Link> */}                        
                     </div> ]
               if(prov) ret.push(prov)
            
            }
            else if(enti === "Instance" && this.props.IRI === sUri )   { 
               //ret = [<span class="svg">{svgInstanceS}</span>]
               
               
               thumb =  this.getResourceElem(tmp+"thumbnailIIIFService", sUri, this.props.assocResources)
               if(!thumb?.length) thumb = this.getResourceElem(tmp+"thumbnailIIIFSelected", sUri, this.props.assocResources)
               if(!thumb?.length && this.props.firstImage) thumb = [{ value: this.props.firstImage }]
                              
               //console.log("noT?", !thumb?.length, sUri, this.props.assocResources, this.props.firstImage)               

               if(!thumb || !thumb.length)  ret = [  <Link {...this.props.preview?{ target:"_blank" }:{}} to={"/show/"+sUri+"#open-viewer"} class={"images-thumb no-thumb 2a"} style={{"background-image":"url(/icons/header/instance.svg)"}}></Link> ]
               else {
                  let thumbUrl = thumb[0].value
                  if(!thumbUrl.match(/[/]default[.][^.]+$/)) thumbUrl += "/full/"+(thumb[0].value.includes(".bdrc.io/")?"!2000,145":",145")+"/0/default.jpg"
                  else if(thumbUrl.match(/bdrc.io.*\/2000,\//)) thumbUrl = thumbUrl.replace(/\/2000,\//,"/!2000,145/")
                  else thumbUrl = thumbUrl.replace(/[/]max[/]/,"/"+(thumbUrl.includes(".bdrc.io/")?"!2000,145":",145")+"/")
                  ret = [  <Link {...this.props.preview?{ target:"_blank" }:{}} to={"/show/"+sUri+"#open-viewer"} class={"images-thumb"} style={{"background-image":"url("+thumbUrl+")"}}><img src={thumbUrl}/></Link> ]
               }
                           
               if(prov) ret.push(prov)

               //loggergen.log("thumbV:",thumbV,elem.value)

            }
            else if(enti === "Instance")  { 
               //ret = [<span class="svg">{svgInstanceS}</span>]
               
               
               thumbV =  this.getResourceElem(tmp+"thumbnailIIIFService", sUri, this.props.assocResources)
               if(!thumbV || !thumbV.length) thumbV = this.getResourceElem(tmp+"thumbnailIIIFSelected", sUri, this.props.assocResources)
                              
               //console.log("noT?", !thumbV?.length, sUri, this.props.assocResources)               

               if(!thumbV || !thumbV.length)  ret = [  <Link {...this.props.preview?{ target:"_blank" }:{}} to={"/show/"+sUri} class={"images-thumb no-thumb 2b"} style={{"background-image":"url(/icons/header/instance.svg)"}}></Link> ]
               else {
                  let thumbUrl = thumbV[0].value
                  if(!thumbUrl.match(/[/]default[.][^.]+$/)) thumbUrl += "/full/"+(thumbV[0].value.includes(".bdrc.io/")?"!2000,145":",145")+"/0/default.jpg"
                  else if(thumbUrl.match(/bdrc.io.*\/2000,\//)) thumbUrl = thumbUrl.replace(/\/2000,\//,"/!2000,145/")
                  else thumbUrl = thumbUrl.replace(/[/]max[/]/,"/"+(thumbUrl.includes(".bdrc.io/")?"!2000,145":",145")+"/")
                  ret = [  <Link {...this.props.preview?{ target:"_blank" }:{}} to={"/show/"+sUri} class={"images-thumb"} style={{"background-image":"url("+thumbUrl+")"}}><img src={thumbUrl}/></Link> ]
               }
                           
               if(inRoot && inRoot.length && info && lang && lang === "bo-x-ewts" && info.match(/^([^ ]+ ){11}/)) info = [ info.replace(/^(([^ ]+ ){10}).*?$/,"$1"), <span class="ellip">{info.replace(/^([^ ]+ ){10}([^ ]+.*?)$/,"$2")}</span> ]

               if(prov) ret.push(prov)

               //loggergen.log("thumbV:",thumbV,elem.value)

               thumbV = null
            }
            else if(enti === "Images") { 
               ret = []
               thumb =  this.getResourceElem(tmp+"thumbnailIIIFService", sUri, this.props.assocResources)
               if(!thumb || !thumb.length) thumb = this.getResourceElem(tmp+"thumbnailIIIFSelected", sUri, this.props.assocResources)
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
         
         let noSpace

         if(elem.inOutline || ((!thumbV || !thumbV.length) && enti != "Images" && (enti != "Instance" || sUri != this.props.IRI) && ((info && infoBase && infoBase.filter(e=>e["xml:lang"]||e["lang"]).length >= 0) || (prop && prop.match && prop.match(/[/#]sameAs/))))) {

            //loggergen.log("svg?",svgImageS)

            if(info && !info.includes(" ")) noSpace= true

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

            // #828
            if(!elem.value.includes("purl.bdrc.io")) { 
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

                  //loggergen.log("inOutL:",elem,info,uri,dico)

                  if(info === uri) {                      
                     if(elem.volume) {
                        infoBase = dico[elem.volume]
                        const fUri = fullUri(uri.replace(/[?].*$/,""))
                        if(dico[fUri]) {
                           if(!infoBase) infoBase = dico[fUri]
                           else infoBase = infoBase.concat(dico[fUri])
                        }
                        
                        //loggergen.log("iB:",infoBase,elem.volume,dico)

                        if(infoBase) infoBase = infoBase.filter(e => !e.fromIRI && [bdo+"volumeNumber",skos+"prefLabel", /*skos+"altLabel",*/ foaf+"name" /*,"literal"*/].reduce( (acc,f) => ((acc || f === e.type || f === e.fromKey) && !e.fromSameAs), false))
                        if(infoBase) {
                           let { _info, _lang } = this.getInfo(prop,infoBase,withProp) 
                           if(_info) {
                              info = _info
                              lang = _lang
                           }
                        }
                     } else if(elem.volumeNumber) {
                        let { _info, _lang } = this.getInfo(prop,[{ type:bdo+"volumeNumber", value: elem.volumeNumber }],withProp) 
                        if(_info) {
                           info = _info
                           lang = _lang
                        }
                     }
                     
                     if(!info || info === uri) info = I18n.t("resource.noT")

                     //loggergen.log("dico:",uri,info)
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

                        //loggergen.log("furi?",root,part)

                        let collapse = { ...this.state.collapse }
                        if(this.props.outlineKW) collapse[elem.inOutline] = (collapse[elem.inOutline] === undefined ? false : !collapse[elem.inOutline])
                        else collapse[elem.inOutline] = !collapse[elem.inOutline]
                        this.setState({ collapse }) // ,outlineKW:"" })
                        
                        let loca = {...this.props.location}

                        loca.search = loca.search.replace(/((&part|part)=[^&]+)/,"") //|(&*osearch=[^&]+))/g,"")  ;
                        loca.search += "&part="+part
                        loca.search = loca.search.replace(/[?]&/,"?")
                        
                        loca.pathname = root
                        this.props.navigate(loca)

                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                     }
                                                
                  } } data-info={info}>{(elem?.data?.partIndex ?? elem?.data?.index)  != undefined && I18n.t("resource.outLn", {n:(""+(elem.data.partIndex?? elem?.data?.index)).padStart(2,'0')})}{info}</a>
               }
               else link = <Link {...this.props.preview?{ target:"_blank" }:{}} className={"urilink prefLabel " } to={"/"+show+"/"+uri}>{info}</Link>

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
            
            ret.push([<span lang={lang} class={"ulink " + (sameAsPrefix?sameAsPrefix:'') + (noSpace ? "" : " hasSpace" ) }>{befo}{link}</span>,lang?<Tooltip placement="bottom-end" title={
               <div style={{margin:"10px"}}>
                  {I18n.t(languages[lang]?languages[lang].replace(/search/,"tip"):lang)}
               </div>
            }><span className="lang">{lang}</span></Tooltip>:null,bdrcData])
         }
         else if(pretty.toString().match(/^V[0-9A-Z]+_I[0-9A-Z]+$/)) { ret.push(<span>
            <Link {...this.props.preview?{ target:"_blank" }:{}} className={"urilink "+prefix} to={"/"+show+"/"+prefix+":"+pretty}>{pretty}</Link>&nbsp;
            {/* <Link className="goBack" target="_blank" to={"/gallery?manifest=//iiifpres.bdrc.io/v:bdr:"+pretty+"/manifest"}>{"(view image gallery)"}</Link> */}
         </span> ) }
         else if(pretty.toString().match(/^([A-Z]+[v_0-9-]*[A-Z]*)+$/)){ 

            if(!thumb && !thumbV) {
               ret = (<Link {...this.props.preview?{ target:"_blank" }:{}} className={"urilink "+ prefix} to={"/"+show+"/"+prefix+":"+pretty}><span lang="">{ret}{enti!="Etext"||prop?.endsWith("eTextInInstance")?prefix+":"+pretty:""}</span></Link>)
            }
            else if(thumb && thumb.length) {
               let thumbUrl = thumb[0].value
               if(!thumbUrl.match(/[/]default[.][^.]+$/)) thumbUrl += "/full/"+(thumb[0].value.includes(".bdrc.io/")?"!2000,145":",145")+"/0/default.jpg"
               else if(thumbUrl.match(/bdrc.io.*\/2000,\//)) thumbUrl = thumbUrl.replace(/\/2000,\//,"/!2000,145/")
               else thumbUrl = thumbUrl.replace(/[/](max|(,600))[/]/,"/"+(thumbUrl.includes(".bdrc.io/")?"!2000,145":",145")+"/")
               let vlink = "/"+show+"/"+prefix+":"+pretty+"?s="+encodeURIComponent(this.props.location.pathname+this.props.location.search)+"#open-viewer"                
               thumb = <div class="images-thumb" style={{"background-image":"url("+thumbUrl+")"}}><img src={thumbUrl}/></div>;               

               const checkDLD = (ev) => {
                  loggergen.log("CDLD:",this.props.useDLD)
                  if(this.props.useDLD) { 
                     let nbVol =  this.getResourceElem(bdo+"numberOfVolumes")
                     if(nbVol) nbVol = nbVol.map(v => v.value)
                     let rid = pretty
                     if(window.DLD && window.DLD[rid]) {                        
                        window.top.postMessage(JSON.stringify({"open-viewer":{rid, nbVol:""+nbVol}}),"*")        
                        ev.preventDefault();
                        ev.stopPropagation();
                        return false ;
                     } else {                           
                        const go = window.confirm(I18n.t("misc.DLD"))
                        if(!go)  {
                           ev.preventDefault();
                           ev.stopPropagation();
                           return false ;
                        }
                     }
                  } 
               }

               let scanInfo = this.getResourceElem(bdo+"scanInfo")
               if(!scanInfo?.length) scanInfo = this.getResourceElem(bdo+"scanInfo", prefix+":"+pretty)
               //console.log("scinfo:",this.props.IRI,scanInfo,this.props.resources,prefix+":"+pretty)
               if(!scanInfo?.length) {   
                  let loca = this.getResourceElem(bdo+"contentLocation")
                  if(loca?.length) loca = this.getResourceBNode(loca[0].value)
                  //console.log("loca:",this.props.IRI,loca,this.props.resources,prefix+":"+pretty)
                  if(loca && loca[bdo+"contentLocationInstance"]?.length) {
                     scanInfo = this.getResourceElem(bdo+"scanInfo", shortUri(loca[bdo+"contentLocationInstance"][0].value))
                     //console.log("scan:",scanInfo,shortUri(loca[bdo+"contentLocationInstance"][0].value),this.props.resources)            
                  }
               }       

               let inCollec = this.getResourceElem(bdo+"inCollection")
               if(!inCollec?.length) inCollec = this.getResourceElem(bdo+"inCollection", prefix+":"+pretty)

               let quality
               elem = this.getResourceElem(bdo+"qualityGrade");
               if(!elem?.length) elem = this.getResourceElem(bdo+"qualityGrade", prefix+":"+pretty)
               if(elem && elem.length) elem = elem[0].value ;
               if(elem === "0") {
                  quality = <div class="data access"><h3><span style={{textTransform:"none"}}>{I18n.t("access.quality0")}</span></h3></div>
               }

               let fairUse = false, restrict = false
               let elem = this.getResourceElem(adm+"access")
               if(!elem?.length) elem = this.getResourceElem(adm+"access", prefix+":"+pretty)
               if(elem && elem.filter(e => e.value.match(/(AccessFairUse)$/)).length >= 1) fairUse = true
               let accessLabel
               if(elem?.length) accessLabel = getOntoLabel(this.props.dictionary,this.props.locale,elem[0].value)

               if(fairUse) { // && (!this.props.auth || this.props.auth && !this.props.auth.isAuthenticated()) ) { 

                  let fairTxt, hasIA, elem = this.getResourceElem(bdo+"digitalLendingPossible");
                  if(!elem?.length) elem = this.getResourceElem(bdo+"digitalLendingPossible", prefix+":"+pretty)
                  if(this.props.config && !this.props.config.chineseMirror) {
                     if(!elem || elem.length && elem[0].value == "true" ) { 
                        hasIA = true
                     }
                  }

                  const toggleSnippet = () => this.setState({collapse:{...this.state.collapse, snippet:!this.state.collapse?.snippet}})

                  if(!hasIA) {
                     fairTxt = <>
                        {/* <a class="fairuse-IA-link no-IA" onClick={toggleSnippet}>{I18n.t("access.snippet"+(this.state.collapse.snippet?"H":"V"))}</a>*/}
                        <br/> 
                        <Trans i18nKey="access.fairuse1" components={{ bold: <u /> }} /> { I18n.t("access.fairuse2")} <a href="mailto:help@bdrc.io">help@bdrc.io</a> { I18n.t("access.fairuse3")}
                     </>
                  } else {         
                     let loca = this.getResourceElem(bdo+"contentLocation")
                     if(loca?.length) loca = this.getResourceBNode(loca[0].value)
                     let IAlink = this.getIAlink(loca, bdo)

                     fairTxt = <>
                        <span class="fairuse-IA-link-new">
                           {/* <img class="ia" src="/IA.svg"/> */}
                           {<Trans i18nKey="access.fairUseIA3" components={{ icon:<img class="link-out" src="/icons/link-out_fit.svg"/>, lk:<a target="_blank" href={IAlink} /> }} />}
                           {/* <img class="link-out" src="/icons/link-out_fit.svg"/> */}
                        </span>
                        {/* <a class="fairuse-IA-link" onClick={toggleSnippet}>{I18n.t("access.snippet"+(this.state.collapse.snippet?"H":"V"))}</a>*/}
                        <br/> 
                        <Trans i18nKey="access.fairUseIA4" components={{ bold: <u /> }} />
                     </>
                  }

                  fairUse = <div class= {"data access "+(hasIA?" hasIA newIA":" fairuse")}>
                        <h3>
                           <span style={{textTransform:"none"}}>
                           {/* {I18n.t("access.limited20")}<br/> */}
                           {fairTxt}
                           { /*this.props.locale !== "bo" && [ I18n.t("misc.please"), " ", <a class="login" onClick={this.props.auth.login.bind(this,this.props.location)}>{I18n.t("topbar.login")}</a>, " ", I18n.t("access.credentials") ] }
                           { this.props.locale === "bo" && [ I18n.t("access.credentials"), " ", <a class="login" onClick={this.props.auth.login.bind(this,this.props.location)}>{I18n.t("topbar.login")}</a> ] */ }
                        </span>
                        </h3>
                     </div>
               } else {
                  if ( this.props.IIIFerrors && this.props.IIIFerrors[prefix+":"+pretty] && [404, 444].includes(this.props.IIIFerrors[prefix+":"+pretty]?.error.code))
                        restrict =  <>
                           <div class="data access notyet"><h3><span style={{textTransform:"none"}}>{I18n.t(this.props.outline?"access.not":"access.notyet")}</span></h3></div>
                        </>
                  else if ( this.props.IIIFerrors && this.props.IIIFerrors[prefix+":"+pretty] && (!this.props.auth || this.props.auth && (this.props.IIIFerrors[prefix+":"+pretty]?.error.code === 401 || this.props.IIIFerrors[prefix+":"+pretty]?.error.code === 403) )) 
                     if(elem && elem.includes("RestrictedSealed")) 
                        restrict =  <>
                           <a class="urilink nolink noIA"><BlockIcon style={{width:"18px",verticalAlign:"top"}}/>{accessLabel}</a>
                           <div class="data access sealed"><h3><span style={{textTransform:"none"}}><Trans i18nKey="access.sealed" components={{ bold: <u /> }} /> <a href="mailto:help@bdrc.io">help@bdrc.io</a>{I18n.t("punc.point")}</span></h3></div>
                        </>
                     else 
                        //return  <div class="data access"><h3><span style={{textTransform:"none"}}>{I18n.t("misc.please")} <a class="login" {...(this.props.auth?{onClick:this.props.auth.login.bind(this,this.props.location)}:{})}>{I18n.t("topbar.login")}</a> {I18n.t("access.credentials")}</span></h3></div>
                        restrict =  <>
                           <a class="urilink nolink noIA"><BlockIcon style={{width:"18px",verticalAlign:"top"}}/>{accessLabel}</a>
                           <div class="data access generic"><h3><span style={{textTransform:"none"}}><Trans i18nKey="access.generic" components={{ policies: <a /> }} /></span></h3></div>
                        </>
                        
                  else if ( this.props.IIIFerrors && this.props.IIIFerrors[prefix+":"+pretty] && this.props.IIIFerrors[prefix+":"+pretty]?.error.code === 500 && this.props.IRI && !this.props.IRI.match(/^bdr:(IE|UT|V)/))
                     restrict =  <>
                        <div class="data access error"><h3><span style={{textTransform:"none"}}>{I18n.t("access.error")}</span></h3></div>
                     </>
                  
               }

               ret = [ 
                        quality,
                        fairUse,
                        (!fairUse || this.state.collapse.snippet || true) &&(!this.props.IIIFerrors||!this.props.IIIFerrors[prefix+":"+pretty]|| this.props.IIIFerrors[prefix+":"+pretty].error?.code != 403)
                        ? <Link {...this.props.preview?{ target:"_blank" }:{}} className={"urilink " + prefix + (this.props.IIIFerrors&&this.props.IIIFerrors[prefix+":"+pretty]?.error.code ? " error-"+this.props.IIIFerrors[prefix+":"+pretty]?.error?.code : "")} onClick={checkDLD.bind(this)} to={vlink}>{thumb}</Link>
                        : null,
                        (!fairUse || this.state.collapse.snippet || true || restrict) && <div class="images-thumb-links"  data-n={2}>
                           { restrict 
                              ? restrict 
                              :  !this.props.IIIFerrors||!this.props.IIIFerrors[prefix+":"+pretty]                            
                                 ?  <>
                                       <Link {...this.props.preview?{ target:"_blank" }:{}} className={"urilink "+ prefix} to={vlink} onClick={checkDLD.bind(this)}>{I18n.t("index.openViewer"+(fairUse?"FU":""))}</Link>
                                       <ResourceViewerContainer auth={this.props.auth} /*history={this.props.history}*/ location={this.props.location} navigate={this.props.navigate} IRI={prefix+":"+pretty} pdfDownloadOnly={true} />
                                    </>
                                 :  this.props.IIIFerrors[prefix+":"+pretty].error.code === 401 && (!this.props.auth || !this.props.auth.isAuthenticated())
                                    ? <a class="urilink nolink"><BlockIcon style={{width:"18px",verticalAlign:"top"}}/>&nbsp;{I18n.t("viewer.dlError401")}</a>                              
                                    : [404,444].includes(this.props.IIIFerrors[prefix+":"+pretty].error.code) 
                                       ? <a class="urilink nolink"><BlockIcon style={{width:"18px",verticalAlign:"top"}}/>&nbsp;{I18n.t("access.notyet")}</a>                              
                                       : <a class="urilink nolink"><BlockIcon style={{width:"18px",verticalAlign:"top"}}/>&nbsp;{I18n.t("access.error")}</a>                              
                                    // TODO: handle more access cases (fair use etc., see figma)
                           }                        
                           { scanInfo && //(!this.props.IIIFerrors||!this.props.IIIFerrors[prefix+":"+pretty]|| this.props.IIIFerrors[prefix+":"+pretty].error?.code != 403) && 
                              <div>{scanInfo.map(s => <TextToggle text={getLangLabel(this,bdo+"scanInfo",[s])?.value}/>)}</div>}
                           { inCollec?.length && <div>{I18n.t("resource.inCollection",{count:inCollec.length})} {inCollec.map((c,i) => ([i > 0 ? " | ":null,this.uriformat("", { type:"uri", value:c.value })]))}</div>}
                           {/* <Link {...this.props.preview?{ target:"_blank" }:{}} className={"urilink "+ prefix} to={"/"+show+"/"+prefix+":"+pretty}>{I18n.t("resource.openR")}</Link> */}
                        </div>]
            } else if(thumbV && thumbV.length) {
               let repro = this.getResourceElem(bdo+"instanceHasReproduction", shortUri(elem.value), this.props.assocResources)
               if(repro && repro.length) repro = shortUri(repro[0].value)
               let img = thumbV[0].value, hasT = true
               if(img.startsWith("http")) { 
                  if(!img.match(/[/]default[.][^.]+$/)) img += "/full/"+(img.includes(".bdrc.io/")?"!2000,145":",145")+"/0/default.jpg"                  
                  else img = img.replace(/[/]max[/]/,"/"+(img.includes(".bdrc.io/")?"!2000,145":",145")+"/")
               }
               else hasT = false
               let vlink = "/"+show+"/"+repro+"?s="+encodeURIComponent(this.props.location.pathname+this.props.location.search)+"#open-viewer"                
               thumbV = <div class={"images-thumb"+(!hasT?" no-thumb 3":"")} style={{"background-image":"url("+img+")"}}/>;               

               ret = [<Link {...this.props.preview?{ target:"_blank" }:{}} className={"urilink "+ prefix} to={hasT?vlink:"/"+show+"/"+prefix+":"+pretty}>{thumbV}</Link>,
                     <div class="images-thumb-links" data-n={3}>
                        <Link {...this.props.preview?{ target:"_blank" }:{}} className={"urilink "+ prefix + (!hasT?" disable":"")} to={vlink}>{I18n.t("index.openViewer")}</Link>
                        <Link {...this.props.preview?{ target:"_blank" }:{}} className={"urilink "+ prefix} to={"/"+show+"/"+prefix+":"+pretty}>{I18n.t("resource.openR")}</Link>
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

      if(!IRI || IRI && !useAssoc) { 

         if(!IRI) IRI = this.props.IRI
             
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

      //loggergen.log("gR",prop,IRI,elem,useAssoc)

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
         if(window.innerWidth <= 1024) return
         let elem = $(ev.target).closest(".propCollapseHeader,.propCollapse,[data-prop='bdo:workHasInstance'],.etextPage")
         let popperFix 
         if(elem.length > 0) {
            let i = $(ev.target).closest("h4").index() 
            let n = elem.find("h4").parent().children().length
            let x = elem.find(".expand")
            let p = elem.closest(".ext-props")
            let h = elem.closest("[data-prop='bdo:workHasInstance']")
            
            let etext = $(ev.target).closest("h5.withHoverM").index() 
            //loggergen.log("i/n",i,n,etext)
            
            if(/*!p.length &&*/ (elem.hasClass("propCollapse") && !elem.closest("[data-prop]") === "adm:logEntry" 
               || x.length || h.length) && (i < Math.floor(n/2) || (n%2 == 1 && i == Math.floor(n/2)) || i === 0 && n === 1)) 
                  popperFix = true
            else if(etext >= 0) 
               popperFix = "etext"
         }
         let target = $(ev.currentTarget).closest("h4")
         if(target.length) target = target.find(".hover-menu")[0]  
         else {
            target = $(ev.currentTarget).closest(".sub")
            if(target.length) target = target.find(".hover-menu")[0]
            else target = ev.currentTarget

            if(popperFix === "etext") target = $(ev.currentTarget).closest("h5").prev()

            //loggergen.log("tg:",target)
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
         
         //loggergen.log("ID:",prop,ID,val,elem)

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
        // loggergen.log("other:",other,data)
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

            //loggergen.log("comm:",comment)
         }
      }

      //loggergen.log("data",lang,data,other)                  

      let loca = { ...this.props.location }
      if(e.start !== undefined) { 
         loca.search = loca.search.replace(/(^[?])|(&*startChar=[^&]+)/g,"")
         loca.search = "?startChar="+e.start+(loca.search?"&"+loca.search:"")
      }

      let repro, inPart = [] //[ this.uriformat("", { type:"uri", value:fullUri("bdr:MW4CZ5369_0001-1") }) ]
      if(e.value === "etextMoreInfo") { 
         repro = <span class="etextMoreInfo" onClick={(ev) => { 
               //loggergen.log("repro:",ID,this.state.collapse,ev.target)
               if($(ev.target).closest("a").length) this.setState({collapse:{...this.state.collapse, ["hover"+ID]:false }}) 
            }}>
               {this.format("span",bdo+"instanceReproductionOf","",false,"sub")}
            </span>
         //loggergen.log("repro:",repro,e.elem)
         if(e.elem?.id && this.props.assocResources[e.elem.id]) inPart = this.props.assocResources[e.elem.id]?.filter(v => v.type === _tmp+"inInstancePart").map(e => this.uriformat("",e))
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
               className={this.state.collapse.popperFix===true?"fixW":this.state.collapse.popperFix?this.state.collapse.popperFix:""}
               data-class={(e.start !== undefined?"in-etext":"")}
               marginThreshold={0}
               open={this.state.collapse["hover"+ID]}
               //anchorOrigin={{horizontal:"right",vertical:"top"}}
               //transformOrigin={{horizontal:"right",vertical:"top"}}
               placement={this.state.collapse.popperFix==="etext"?"bottom-start":"bottom-end"}
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
                     //loggergen.log("clickA",ID,ev,ev.target,ev.currentTarget)                     
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
                              !prop.startsWith(" ") && <h3>{this.proplink(prop)}{I18n.t("punc.colon")}</h3>,
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
                              { (other.length > 0) && <div><span class='first'>{I18n.t("popover.otherLang",{count:other.length})}</span><span>{I18n.t("punc.colon")}&nbsp;</span><div>{other.map(o => <span class="label" lang={o.lang}>{o.value}{this.tooltip(o.lang)}</span>)}</div></div> }
                              { (e.datatype && e.datatype.endsWith("#gYear")) && <div><span class='first'>{I18n.t("popover.calendar")}</span><span>{I18n.t("punc.colon")}&nbsp;</span><span>{I18n.t("popover.gregorian")}</span></div>}
                              { (era && era.length > 0) &&  <div><span class='first'>{this.proplink(bdo+"yearInEra")}</span><span>{I18n.t("punc.colon")}&nbsp;</span><span>{this.proplink(era[0].value)}</span></div>  }
                              { (e.start !== undefined) &&  <div><span class='first'>{this.proplink(bdo+"startChar")}</span><span>{I18n.t("punc.colon")}&nbsp;</span><span>{e.start}</span></div>  }
                              { (e.end !== undefined) &&  <div><span class='first'>{this.proplink(bdo+"endChar")}</span><span>{I18n.t("punc.colon")}&nbsp;</span><span>{e.end}</span></div>  }
                              { (comment !== undefined) &&  <div><span class='first'>{this.proplink(rdfs+"comment")}</span><span>{I18n.t("punc.colon")}&nbsp;</span><span>{comment.value}</span></div>  }
                              { (ontolink !== undefined) &&  <div><span class='first'>{I18n.t("prop.tmp:ontologyProperty")}</span><span>{I18n.t("punc.colon")}&nbsp;</span><Link class="ontolink" to={"/show/"+ontolink}>{ontolink}</Link></div>  }
                              { (e.value === "etextMoreInfo") && <div><span class='first'>{this.proplink(bdo+"instanceReproductionOf")}</span><span>{I18n.t("punc.colon")}&nbsp;</span>{repro}</div>  }
                              { (e.value === "etextMoreInfo" && inPart.length) && <div><span class='first'>{this.proplink(tmp+"inInstancePart")}</span><span>{I18n.t("punc.colon")}&nbsp;</span><div class="inPart">{inPart}</div></div>  }
                              { (e.decimalValue) &&  <div><span class='first'>{this.proplink(tmp+"decimalValue")}</span><span>{I18n.t("punc.colon")}&nbsp;</span>{e.decimalValue}</div>  }
                              {/* { (e.tmpUnrounded) &&  <div><span class='first'>{this.proplink(tmp+"unrounded")}</span><span>{I18n.t("punc.colon")}&nbsp;</span>{e.tmpUnrounded}</div>  } */}
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

   isTransitiveSame(id) {
      const same = this.getResourceElem(tmp+"withSameAs")
      return same && same.length && same.some(s => s.type === "uri" && s.value === id)
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

      //loggergen.log("format:",Tag, prop,JSON.stringify(elem,null,3),txt,bnode,div);

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

         if(prop === bdo+"workHasInstance" && e.value && e.value.match(new RegExp(bdr+"(W|IE)"))) continue ;



         //loggergen.log("iK",iKeep,e,elem,elem.length)

         // #562 skip circular property value
         if(_e.type === "uri" && this.isTransitiveSame(_e.value)) continue

         let value = ""+e
         if(e.value || e.value === "") value = e.value
         else if(e["@value"]) value = e["@value"]
         else if(e["@id"]) value = e["@id"]
         else if(e["id"]) value = e["id"]
         let pretty = this.fullname(value,null,prop === bdo+"eTextHasChunk") // || prop === bdo+"eTextHasPage")

         if(value === bdr+"LanguageTaxonomy") continue ;

         //loggergen.log("e",e,pretty,value)

         //if(this.props.assocResources && this.props.assocResources[value] && this.props.assocResources[value][0] && this.props.assocResources[value][0].fromKey && !prop.match(/[/#]sameAs/) ) 
         if(this.props.resources && this.props.resources[this.props.IRI] && this.props.resources[this.props.IRI][value] && !prop.match(/[/#]sameAs/) 
            && prop != _tmp+"propHasScans") 
         { 
            e.type = "bnode" 

            //loggergen.log("aRes",this.props.assocResources[value])
         } else {
            // case of note with no content
            if(prop === bdo+"note") continue
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
               if(!lang) lang = e["@language"]
               tmp = [pretty]

               if(lang) {

                  let tLab = getLangLabel(this,prop,[e])
                  if(!tLab) tLab = { ...e, value: "--" }
                  let lang = tLab["lang"]
                  if(!lang) lang = tLab["xml:lang"]
                  if(!lang) lang = this.props.locale
                  let tVal = tLab["value"]
                  if(!tVal) tVal = tLab["@value"]
                  if(!tVal) tVal = ""

                  let hasSpace = false
                  if(tVal.includes(" ")) hasSpace = true

                  if(tLab.start !== undefined) tmp = [ <span class="startChar">
                     <span>[&nbsp;
                        <Link to={"/show/"+this.props.IRI+"?startChar="+tLab.start+(this.props.highlight?'&keyword="'+this.props.highlight.key+'"@'+this.props.highlight.lang:"")+"#open-viewer"}>@{tLab.start}</Link>
                     </span>&nbsp;]</span>,<br/> ]
                  else tmp = []
                  
                  if(tmp.length || tVal.match(/[↦↤]/)) tmp.push(highlight(tVal,null,null,false /*true*/))
                  else tmp.push(this.fullname(tVal))

                  if(lang) {
                     let size = this.state.etextSize
                     tmp = [ <span {...hasSpace?{className:"hasSpace"}:{}} lang={lang} {...this.state.etextSize?{style:{ fontSize:size+"em", lineHeight:(Math.max(1.0, size + 0.75))+"em" }}:{}}>{tmp}</span> ]
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

            if([bdo+"placeLat", bdo+"placeLong"].includes(prop)) { 
               tmp = <span>{Decimal2DMS(value, prop == bdo+"placeLong" ? "longitude" : "latitude")}</span>
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
               //loggergen.log("togHovM",ev,ev.currentTarget)
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

            //loggergen.log("bnode:",e,prop,e.value,elem)

            if(!elem) continue ;

            let sub = []

            let val = elem[rdf+"type"]
            let lab = elem[rdfs+"label"]

            if(prop === bdo+"instanceEvent")  {
               let from = e.fromEvent
               
               //loggergen.log("fromE:",from,this.getResourceBNode(from)        )

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

                  let tip = [this.fullname(tVal,false,false,false,true,1,lang),lang?<Tooltip placement="bottom-end" title={
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
                     const rank = { [bdo+"noteText"]:4, [bdo+"contentLocationStatement"]:3, [bdo+"contentLocation"]:2, [bdo+"noteSource"]:1 }
                     if(rank[elem]) return rank[elem]
                     else return 5 ;
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

                     let workuri, loca
                     if(noteData[bdo+"noteSource"] && noteData[bdo+"contentLocationStatement"])
                     {
                        loca = [" @ ", noteData[bdo+"contentLocationStatement"].value ]
                     }
                     if(noteData[bdo+"contentLocation"])
                     {
                        if(loca) loca.push(<br/>)
                        else loca = [" @ "]
                        loca.push(this.getWorkLocation([ noteData[bdo+"contentLocation"] ]))
                     }
                     

                     //loggergen.log("noteData",noteData)
                     if(noteData[bdo+"noteText"]) // case when source and text
                     {
                        if(noteData[bdo+"noteSource"]) 
                        {
                           workuri = <div><Tag style={{fontSize:"14px"}}>(from {this.uriformat(bdo+"noteSource",noteData[bdo+"noteSource"])}{loca})</Tag></div>
                        }

                        let text = getLangLabel(this,"",[ noteData[bdo+"noteText"] ])
                        //loggergen.log("text:",text)
                        if(text) text = text.value
                        else text = this.pretty(noteData[bdo+"noteText"].value) 
                        if(text?.includes && text.includes("\n")) { 
                           text = text.split("\n").map(t => ([t,<br/>]))
                        }


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
                     else if(noteData[bdo+"noteSource"]) // case when only source, no text
                     {
                        workuri = <div><Tag style={{fontSize:"14px"}}>({I18n.t("misc.from")} {this.uriformat(bdo+"noteSource",noteData[bdo+"noteSource"])}{loca})</Tag></div>

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

                        if(f == bdo+"contentLocation" || f == bdo+"contentLocationStatement" || f == bdo+"noteSource" || f == bdo+"noteText") {
                           noteData[f] = v
                           //loggergen.log("nD:",f,v,noteData)
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
                           else if(v.type === 'literal' && v.datatype === xsd+"dateTime" && v.value.match(/^[0-9-]+T[0-9:.]+Z+$/)) {                  
                              let code = "en-US", opt = { year: 'numeric', month: 'long', day: 'numeric' }
                              if(this.props.locale === "bo") { 
                                 // TODO: add year
                                 code = "en-US-u-nu-tibt"; 
                                 opt = { year:'numeric', day:'2-digit', month:'2-digit' } 
                                 let dtf = new Intl.DateTimeFormat(code, opt).formatToParts(new Date(v.value))
                                 //loggergen.log("dtf:",dtf)
                                 txt = "སྤྱི་ལོ་"+dtf[4].value + " ཟླ་" + dtf[0].value + " ཚེས་" +  dtf[2].value 
                                 //txt = 'ཟླ་' + (new Intl.DateTimeFormat(code, opt).formatToParts(new Date(v.value)).map(p => p.type === 'literal'?' ཚེས་':p.value).join(''))
                              }
                              else {
                                 if(this.props.locale === "zh") code = "zh-CN"
                                 txt = new Date(v.value).toLocaleDateString(code, opt);  
                              }
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
                           else {
                              let lang = v["lang"], label
                              if(!lang) lang = v["xml:lang"]
                              if(lang) {
                                 txt = getLangLabel(this, "", [v])
                                 if(txt?.value) { 
                                    lang = txt.lang
                                    txt = txt.value
                                 }
                              }
                              if(!txt) txt = this.fullname(v.value)

                              //loggergen.log("txt",txt,lang,v)

                              if(lang) {
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
                  if(!noVal && !f.match(/[/]note[^F]/) && f !== bdo+"contentLocationStatement" && f !== bdo+"contentLocation") {
                     //loggergen.log("push?sub+",subsub)
                     group.push(<div className={div+"sub "+(hasBnode?"full":"")}>{subsub}</div>)
                  }
                  else {

                     if(subsub.length > 0) { 
                        //loggergen.log("push?subsub",subsub)
                        sub.push(subsub) //<div className="sub">{subsub}</div>)
                     }

                     if(f == bdo+"contentLocation" || f == bdo+"contentLocationStatement" || f == bdo+"noteSource" || f == bdo+"noteText") {
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


   showMirador(num?:number,useManifest?:{},click) {

      let state = { ...this.state, openMirador:true, openDiva:false, openUV:false }
      
      if(!this.state.openMirador) // || !$("#viewer").hasClass("hidden"))
      {

         window.isProxied = isProxied(this)
         
         document.getElementsByName("viewport")[0].content = "width=device-width, initial-scale=1.0, maximum-scale=1.0" ;

         if(click && state.fromSearch && (state.fromSearch.startsWith("latest") || state.fromSearch.includes("t=Scan"))) {
            let loca = {... this.props.location}
            if(loca.search.match(/[?&]s=/)) loca.search = loca.search.replace(/[?&]s=[^&]+/,"")
            if(loca.search && !loca.search.endsWith("?")) loca.search += "&"            
            loca.search += "s="+encodeURIComponent(window.location.href.replace(/.*(\/show\/)/,"$1"))
            this.props.navigate(loca)
         } else if(click) {
            state.fromClick = true ;
         } else {
            state.fromClick = false ;
         }

         $("#fond").removeClass("hidden");

         if(this.state.UVcanLoad) { window.location.hash = "mirador"; window.location.reload(); }

         loggergen.log("showM:",num,useManifest)

         if(!tiMir) tiMir = setInterval( async () => {

            //loggergen.log("tiMir")

            if(window.Mirador && $("#viewer").length && window.Mirador.Viewer.prototype.setupViewer.toString().match(/going to previous page/) && !window.mirador) {

               clearInterval(tiMir);
               tiMir = 0

               $("#fond").addClass("hidden");

               loggergen.log("fdbk?",window.useFeedbucket)

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
                  loggergen.log("here:",this.props.collecManif)

                  if(this.props.imageAsset.match(/[/]collection[/]/) && (!this.props.collecManif || true || this.props.monovolume === false))
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

               let config = await miradorConfig(data,manif,canvasID,withCredentials,this.props.langPreset,null,this.props.IRI,this.props.locale, this.props.etextLang);

               loggergen.log("mir ador",num,config,this.props,withCredentials,elem)

               if(window.mirador) delete window.mirador

               var qG = this.getResourceElem(bdo+"qualityGrade")
               if(qG && qG.length) config["windowSettings"]["qualityGrade"] = qG[0].value

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



   handlePdfClick = (event,pdf,askPdf,file = "pdf", range = "1-") => {
      // This prevents ghost click.

      // trick to prevent popup warning
      //let current = window.self
      //let win = window.open("","pdf");
      //window.focus(current)

      if(!this.state.collapse[file+"_"+pdf]){
         this.setState({collapse:{...this.state.collapse, [file+"_"+pdf]:true}})
      }
      else if(!askPdf)
      {
         event.preventDefault();
         const ok = range.match(/^([0-9]*)-([0-9]*)$/)
         loggergen.log("pdf:",pdf,file,ok)
         if(range !== "-" && ok && (ok[1] != '' && ok[2] != '' && Number(ok[1]) <= Number(ok[2]) || ok[1] === '' && ok[2] !== '' || ok[1] !== '' && ok[2] === '')) {
            this.props.onCreatePdf(pdf.replace(/1-$/,range),{iri:this.props.IRI,file});
         } else {
            this.props.onErrorPdf(501,pdf.replace(/zip/,file).replace(/1-$/,range),this.props.IRI) ;
         }
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

   proplink = (k,txt,count?:integer=1,checkPlural = false) => {      

      if(txt) console.warn("use of txt in proplink",k,txt)

      const t = getEntiType(this.props.IRI)
      if(t === "Instance" && k === bdo+"workHasInstance") k = _tmp + "otherInstance"

      let tooltip
      if(this.props.dictionary && this.props.dictionary[k]) {
         if(this.props.dictionary[k][skos+"definition"]) 
            tooltip = this.props.dictionary[k][skos+"definition"]
         else if(this.props.dictionary[k][adm+"userTooltip"]) 
            tooltip = this.props.dictionary[k][adm+"userTooltip"]
         else if(this.props.dictionary[k][rdfs+"comment"]) 
            tooltip = this.props.dictionary[k][rdfs+"comment"].filter(comm => !comm.value.match(/^([Mm]igration|[Dd]eprecated)/))
      }

      if(tooltip) tooltip = getLangLabel(this, "", tooltip, false, true)

      if(k === bdo+'note' && !checkPlural) txt = I18n.t("popover.notes") ;
      else if(k === skos+'altLabel') { 
         const t = getEntiType(this.props.IRI)
         if(["Work","Instance","Images","Etext"].includes(t)){
            txt = I18n.t("prop.tmp:altLabelTitle") ;
         } else {
            txt = I18n.t("prop.tmp:altLabelName") ;
         }
      }

      let ret = (<a class="propref" {...(k.match(/purl[.]bdrc[.]io/) && !k.match(/[/]tmp[/]/) ? {"href":k}:{})} target="_blank">{txt?<span>{txt}</span>:this.fullname(k,false,false,true,true,count)}</a>)

      if(tooltip && tooltip.value) ret = <Tooltip placement="bottom-start" classes={{tooltip:"commentT",popper:"commentP"}} style={{marginLeft:"50px"}} title={<div>{tooltip.value}</div>}>{ret}</Tooltip>

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
      let get = qs.parse(this.props.location.search)

      if(tabs.length) return "?tabs="+tabs.join(",")+(get.v?"&v="+get.v:"")
      else return ""
   }

   getH2 = (title,_befo,_T,other,T_,rootC) => {

      //loggergen.log("H2?",title, rootC, other)

      if(other) return <h2 title={title.value} lang={title.lang || this.props.locale}><Link {...this.props.preview?{ target:"_blank" }:{}}   {... rootC?{onClick:rootC}:{onClick:() => setTimeout(()=>window.scrollTo(0,0),10)}}  to={"/show/"+shortUri(other)+this.getTabs(T_,other)}>{_T}<span>{_befo}{title.value}</span>{this.tooltip(title.lang)}</Link></h2>
      else return <><h2 title={title.value} lang={title.lang || this.props.locale} class="on">{_T}<span>{_befo}<span class="placeType">{title.value}</span></span>{this.tooltip(title.lang)}</h2>{ title.placeT?.length && <span class="date">{title.placeT.map(t => this.fullname(t.value, false, false, true)).map((s,i) => i > 0 ? ([I18n.t("punc.comma"), s]):s)}</span>}</>
   }

   setTitle = (kZprop,_T,other,rootC,noSame:boolean=false) => {

      //loggergen.log("setT:", rootC, other)

      let placeT ;
      if(_T === "Place") {
         placeT = this.getResourceElem(bdo+"placeType",other,this.props.assocResources);         
      }

      let title,titlElem,otherLabels = [], T_ = _T ;
      _T = [<span class={"newT "+_T.toLowerCase()}>
         <span class="space-fix">
            <span>{I18n.t("types."+_T.toLowerCase())}</span>
            {/* <span class="RID">{shortUri(other?other:this.props.IRI)}</span> */}
         </span>         
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
          if(other) title = <h2 lang={this.props.locale}><Link {...this.props.preview?{ target:"_blank" }:{}}  onClick={() => setTimeout(()=>window.scrollTo(0,0),10)} to={"/show/"+shortUri(other)+this.getTabs(T_,other)}>{_T}<span>{loaded && (T_ === "Work" || T_ === "Instance")?I18n.t("resource.noT"):shortUri(other?other:this.props.IRI)}</span></Link></h2>
          else  title = <h2 class="on" lang={this.props.locale}>{_T}<span>{loaded && (T_ === "Work" || T_ === "Instance")?I18n.t("resource.noT"):shortUri(other?other:this.props.IRI)}</span></h2>
      }

      if(!title) {
         if(titlElem) {
            
            
            if(typeof titlElem !== 'object') titlElem =  { "value" : titlElem, "lang":""}
            if(noSame) {
               let asArray = titlElem
               if(!Array.isArray(asArray)) asArray = [ asArray]
               titlElem = asArray.filter(a => !a.allSameAs || a.allSameAs.filter(b => b.includes(bdr)).length)
            }
            title = getLangLabel(this,"", titlElem, false, false, otherLabels)            
         }
         
         //loggergen.log("titl:",title,kZprop,titlElem,otherLabels,other)
      
         let _befo
         if(title && title.value) {
            if(!other && !document.title.includes(title.value) ) document.title = title.value + " - " + (this.props.config?.khmerServer?"Khmer Manuscript Heritage Project":"Buddhist Digital Archives")
            if(title.fromSameAs && !title.fromSameAs.match(new RegExp(bdr))) {
               const {befo,bdrcData} = this.getSameLink(title,shortUri(title.fromSameAs).split(":")[0]+" sameAs hasIcon")            
               _befo = befo
            }
         }
         if(!title || title.value == "") title = { value: I18n.t("resource.noT"), lang: this.props.locale } // #825
         if(placeT?.length) title.placeT = placeT //T[0].value
         title = this.getH2(title,_befo,_T,other,T_,rootC)         

      }


      //loggergen.log("sT",other,title,titlElem)

      return { title, titlElem, otherLabels }
   }

   setManifest = (kZprop,iiifpres, rid = this.props.IRI, fullRid = fullUri(this.props.IRI)) => {

      //loggergen.log("kZprop:",kZprop,iiifpres,rid)

      let iiifThumb = this.getResourceElem(tmp+"thumbnailIIIFService"), assetUrl
      if(!iiifThumb || !iiifThumb.length) iiifThumb = this.getResourceElem(tmp+"thumbnailIIIFSelected")
      if(iiifThumb && iiifThumb.length) iiifThumb = iiifThumb[0].value

      if(kZprop.indexOf(bdo+"imageList") !== -1)
      {
         if(!this.props.imageAsset && !this.props.manifestError) {
            if(rid !== this.props.IRI) this.setState({...this.state, imageLoaded:false})
            //this.props.onHasImageAsset(iiifpres+"/v:"+ rid+ "/manifest",rid,iiifThumb);
            assetUrl = iiifpres+"/v:"+ rid+ "/manifest"
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
              manif = iiifpres + "/collection/wio:"+work[0].value.replace(new RegExp(bdr),"bdr:")+"::"+rid
            //this.props.onHasImageAsset(manif,rid,iiifThumb)
            assetUrl = manif
         }
      }
      else if(kZprop.indexOf(bdo+"volumeOf") !== -1)
      {
         let elem = this.getResourceElem(bdo+"volumeHasEtext",rid,this.props.resources,fullRid)
         if(!elem && !this.props.imageAsset && !this.props.manifestError) {
            this.setState({...this.state, imageLoaded:false})
            //this.props.onHasImageAsset(iiifpres+"/vo:"+ rid + "/manifest",rid,iiifThumb);
            assetUrl = iiifpres+"/vo:"+ rid + "/manifest"
         }
      }
      else if(kZprop.indexOf(bdo+"hasIIIFManifest") !== -1)
      {
         let elem = this.getResourceElem(bdo+"hasIIIFManifest",rid,this.props.resources,fullRid)
         if(elem[0] && elem[0].value && !this.props.manifestError && !this.props.imageAsset) {
            if(rid !== this.props.IRI) this.setState({...this.state, imageLoaded:false})
            //this.props.onHasImageAsset(elem[0].value,rid,iiifThumb);
            assetUrl = elem[0].value
         }
      }
      else if(kZprop.indexOf(bdo+"contentLocation") !== -1)
      {
         if(!this.props.imageAsset && !this.props.manifestError) {
            if(rid !== this.props.IRI) this.setState({...this.state, imageLoaded:false})
            //this.props.onHasImageAsset(iiifpres+"/collection/wio:"+rid,rid,iiifThumb)
            assetUrl = iiifpres+"/collection/wio:"+rid
         }
      }      
       else if(kZprop.indexOf(bdo+"instanceHasVolume") !== -1)
      {
         let elem = this.getResourceElem(bdo+"instanceHasVolume",rid,this.props.resources,fullRid)
         let nbVol = this.getResourceElem(bdo+"itemVolumes",rid,this.props.resources,fullRid)
         let work = this.getResourceElem(bdo+"instanceReproductionOf",rid,this.props.resources,fullRid)

         if(elem[0] && elem[0].value && !this.props.imageAsset && !this.props.manifestError) {
            
            //loggergen.log("iHv:",elem,nbVol,work)

            if(rid !== this.props.IRI)this.setState({...this.state, imageLoaded:false})
            let manif = iiifpres + "/vo:"+elem[0].value.replace(new RegExp(bdr),"bdr:")+"/manifest"
            if(nbVol && nbVol[0] && nbVol[0].value && nbVol[0].value > 1 && work && work[0] && work[0].value)
              manif = iiifpres + "/collection/wio:"+work[0].value.replace(new RegExp(bdr),"bdr:")
            //this.props.onHasImageAsset(manif,rid,iiifThumb)
            assetUrl = manif

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
            //this.props.onHasImageAsset(manif,rid,iiifThumb)
            assetUrl = manif
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

                  if(assoc.length == 1) { 
                     //this.props.onHasImageAsset(iiifpres + "/v:bdr:"+this.pretty(imItem[0].value,true)+"/manifest",rid,iiifThumb); 
                     assetUrl = iiifpres + "/v:bdr:"+this.pretty(imItem[0].value,true)+"/manifest"
                  }
                  else { 
                     //this.props.onHasImageAsset(iiifpres + "/collection/wio:"+this.pretty(rid,true),rid,iiifThumb);  
                     assetUrl = iiifpres + "/collection/wio:"+this.pretty(rid,true)
                  }

               }
            }
         }
         
      }

      if(assetUrl) {
         this.props.onHasImageAsset(assetUrl,rid,iiifThumb); 
      }
   }


   getPdfLink = (data) =>  {

      let pdfLink,monoVol = -1 ;
      // allow pdf download on chinese server too + #829 
      if(this.props.firstImage &&  !this.props.manifestError && (this.props.firstImage.includes("iiif.bdrc.io") || this.props.firstImage.includes("buda.zju"))) 
      {
         let iiif = "//iiif.bdrc.io" ;
         if(this.props.config && this.props.config.iiif) iiif = this.props.config.iiif.endpoints[this.props.config.iiif.index]

         //loggergen.log("iiif:",this.props.firstImage,this.props.imageAsset,iiif,this.props.config)

         let id = this.props.IRI.replace(/^[^:]+:[MW]+/,"")
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
         if( (eV === vol || !vol || !eV ) && p == eP) oneP = true

         if(vol) str = I18n.t("resource.volume",{num:vol})+" " ;
         else monoVol = true
         if(p) str += I18n.t("resource.page",{num:p}) ;
         if(l) str += "|"+I18n.t("location.line",{num:l}) ;
         if(!oneP) {
            if(str && p) str += " - "
            if(eV) str += I18n.t("resource.volume",{num:eV})+" " ;
            if(eP) str += I18n.t("resource.page",{num:eP}) ;
            if(eL) str += "|"+I18n.t("location.line",{num:eL}) ;
         }

         let w = loca("Instance")

         if(withTag) { 
   
            if(stat) { 
               if(Array.isArray(stat)) str = stat.join(" / ")
               else { 
                  str = stat
                  if(p) {
                     if(vol) str += I18n.t("resource.location"+(oneP?"1":"M"),{vol,page:p,endPage:eP})
                     else str += I18n.t("resource.location1vol"+(oneP?"1":"M"),{page:p,endPage:eP})
                  }
               }
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

      var redIcon = new L.Icon({
         iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
         shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
         iconSize: [25, 41],
         iconAnchor: [12, 41],
         popupAnchor: [1, -34],
         shadowSize: [41, 41]
      });

      const coords = this.getResourceElem(tmp+"GISCoordinates") 
      let accu = this.getResourceElem(bdo+"placeAccuracy") 
      if(accu?.length) accu = accu[0].value
      else accu = false
      

      return ( 
         <div data-prop={shortUri(k)}>
            <h3><span>{this.proplink(k)}{I18n.t("punc.colon")}</span>&nbsp;</h3>
            { k == bdo+"placeLong" && tags }
            <div class="map"> {/* style={ {width:"100%",marginTop:"10px"} }> */}
               {  <Map //ref={m => { this._leafletMap = m; }}
                  className={"placeMap"} // + (this.state.largeMap?" large":"")}
                  // style={{boxShadow: "0 0 5px 0px rgba(0,0,0,0.5)"}}
                  center={doMap} zoom={5} bounds={doRegion?regBox:null}

                  // attempt to fix #584 (see https://github.com/Leaflet/Leaflet/issues/7255 + https://stackoverflow.com/questions/67406533/react-leaflet-popups-not-working-on-mobile-devices/67422057#67422057)
                  tap={false} 

                  //attributionControl={false}
                  >
                  <LayersControl position="topright">
                     { this.props.config.googleAPIkey && [
                        <BaseLayer name='Satellite+Roadmap'>

                           <ReactLeafletGoogleLayer apiKey={this.props.config.googleAPIkey} type='hybrid'
                                 //attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;></a> contributors"
                                 //attribution="&amp;copy 2018 Google"
                           />
                        </BaseLayer>,
                        <BaseLayer checked name='Terrain'>
                           <ReactLeafletGoogleLayer apiKey={this.props.config.googleAPIkey} type='terrain'/>
                        </BaseLayer>,
                        <BaseLayer name='Satellite'>
                           <ReactLeafletGoogleLayer apiKey={this.props.config.googleAPIkey} type='satellite'/>
                        </BaseLayer>,
                        <BaseLayer name='Roadmap'>
                           <ReactLeafletGoogleLayer apiKey={this.props.config.googleAPIkey} type='roadmap'/>
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
                  <Marker position={doMap} icon={redIcon}>
                        {/* <ToolT direction="top">{title}</ToolT> */}

                     { coords.length && <ToolT direction="bottom" /*offset={[0, 20]}*/ opacity={1} permanent className="GIS"> 
                        { coords[0].value }
                     </ToolT> }
                  </Marker>
                  {doRegion && <GeoJSON data={doRegion} style={ {color: '#006699', weight: 5, opacity: 0.65} }/>}
                  {/* <Portal position="bottomleft">
                     <div class="leaflet-control-attribution leaflet-control" >
                        <a onClick={ e => { setTimeout(((map)=> () => {map.leafletElement.invalidateSize();})( this._leafletMap), 200); this.setState({...this.state,largeMap:!this.state.largeMap}); } }>
                           {!this.state.largeMap?"Enlarge":"Shrink"} Map
                        </a>
                     </div>
                  </Portal> */}
               </Map> }
               <div class="accu"><span>{accu}</span></div>
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

      // case when every note has empty content
      if(tags.length === 0 && k == bdo+"note") return

      let expand
      let maxDisplay = 9
      if(k === bdo+"workHasInstance") maxDisplay = 10 ;
      if(k === bdo+"placeContains") maxDisplay = 6 ;
      if(hasMaxDisplay) maxDisplay = hasMaxDisplay ;

      let n = 0
      if(elem && elem.filter) n = elem.filter(t=>t && ( (t.type === "uri" && !this.isTransitiveSame(t.value) && (k !== bdo+"workHasInstance" || t.value.match(/[/]MW[^/]+$/))) || t.type === "literal")).length
      ret = this.insertPreprop(k, n, ret)

      //loggergen.log("genP:",elem,k,maxDisplay,n)

      let linkToVersions, maxVersions = 20
      if(k === bdo+"workHasInstance" && ret.length > 2) {
         let wrid =  this.props.IRI 
         const t = getEntiType(this.props.IRI)
         if(t != "Work") {
            let work = this.getResourceElem(bdo+"instanceOf")
            if(work?.length) wrid = shortUri(work[0].value)
         }
         linkToVersions = <span class="expand linkToVersions">
            <Link {...this.props.preview?{ target:"_blank" }:{}} 
               to={/*"/search?i="+wrid+"&t=Work"*/"/osearch/associated/"+wrid?.split(":")[1]+"/search"}>
                  {I18n.t("misc.browseA",{count: ret.length})}
            </Link>
         </span>
      }
      
      let linkToPlaces, maxPlaces = 20
      if(k === bdo+"placeContains" && ret.length >= 2) {
         linkToPlaces = <span class="expand linkToPlaces">
            <Link {...this.props.preview?{ target:"_blank" }:{}} 
               to={ //"/search?r="+this.props.IRI+"&t=Place&f=relation,inc,bdo:placeLocatedIn"
                    "/osearch/associated/"+this.props.IRI.split(":")[1]+"/search?type%5B0%5D=Place"}> 
                  {I18n.t("misc.browseA",{count: ret.length})}
            </Link>
         </span>
      }

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
            <div data-prop={shortUri(k)} class={"has-collapse custom max-"+(maxDisplay)+" "+(n%2===0?"even":"odd") + (linkToPlaces||linkToVersions?" withLinkTo":"")}>
               <h3><span>{this.proplink(k,null,n)}{I18n.t("punc.colon")}</span></h3>
               <div className={"propCollapseHeader in-"+(this.state.collapse[k]===true)}>
                  {ret.slice(0,maxDisplay)}
                  { (false || (!this.state.collapse[k] && hasMaxDisplay !== -1) ) && <><span
                     onClick={(e) => this.setState({...this.state,collapse:{...this.state.collapse,[k]:!this.state.collapse[k]}})}
                     className="expand">
                        {I18n.t("misc."+(this.state.collapse[k]?"hide":"see"+(linkToVersions&&ret.length > maxVersions||linkToPlaces&&ret.length > maxPlaces?"10":"")+"More")).toLowerCase()}&nbsp;<span
                        className="toggle-expand">
                           { this.state.collapse[k] && <ExpandLess/>}
                           { !this.state.collapse[k] && <ExpandMore/>}
                     </span>
                  </span>
                  { linkToVersions }
                  { linkToPlaces }
                  </> }
               </div> 
               <Collapse timeout={{enter:0,exit:0}} className={"propCollapse in-"+(show===true)} in={show}>
                  { k === bdo+"workHasInstance"
                     ? ret.slice(0,maxVersions)
                     : (k === bdo+"placeContains"
                        ? ret.slice(0,maxPlaces)
                        : ret)  }
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
               { (this.state.collapse[k] || hasMaxDisplay === -1) && <><span
               onClick={(e) => this.setState({...this.state,collapse:{...this.state.collapse,[k]:!show}})}
               className="expand">
                  {I18n.t("misc."+(show?"hide":"see"+(linkToVersions&&ret.length > maxVersions?"10":"")+"More")).toLowerCase()}&nbsp;<span
                  className="toggle-expand">
                     { show && <ExpandLess/>}
                     { !show && <ExpandMore/>}
                  </span>
               </span>
               { linkToVersions }
               { linkToPlaces }
               </> }               
            </div>
         )
      }
      else if(k === _tmp+"propHasEtext") {

         if(elem.[0].value === _tmp+"notAvailable") 
            return <div  data-prop={shortUri(k)} >               
               <h3><span>{this.proplink(k,null,n)}{I18n.t("punc.colon")}</span> </h3>               
                  <div class="group">
                     {this.format("h4",k,"",false,"sub",elem)}
                  </div>
               </div>
         
         let outlineEtext = this.getResourceElem(tmp+"hasEtextInOutline")
         return ( elem.map((e,i) => { 
            
            let outETvol, outETinst, outETstart, outETscope 
            if(outlineEtext?.length){
               outETscope = shortUri(outlineEtext[i].value)
               outETinst = this.getResourceElem(bdo+"eTextInInstance", outETscope, this.props.assocResources)
               outETvol = this.getResourceElem(bdo+"eTextInVolume", outETscope, this.props.assocResources)
               outETstart= this.getResourceElem(bdo+"sliceStartChar", outETscope, this.props.assocResources)              
               console.log("oEiv:", outETinst, outETvol, outETstart, outETscope)
            }   
            
            return  this.state.openMirador?<></>:( <div  data-prop={shortUri(k)} >               
               <h3><span>{this.proplink(k,null,n)}{ret.length > 1 ? " "+I18n.t("punc.num",{num:i+1}) : ""}{I18n.t("punc.colon")}</span> </h3>
               {this.preprop(k,0,n)}
               <div class="group preview-etext">
                  {/* <Link to={"/show/"+shortUri(e.value)}>{shortUri(e.value)}</Link> */}
                  <ResourceViewerContainer  auth={this.props.auth} /*history={this.props.history}*/ location={this.props.location} navigate={this.props.navigate} IRI={shortUri(outETvol?.[0]?.value ?? e.value)} previewEtext={{ outETvol, outETstart, outETscope, outETinst }}/>  
               </div>
            </div>
         )}))
      } else if(k === _tmp+"propHasScans") {
         console.log("pHs")
         return  this.state.openMirador?<></>:( ret.map((r,i) => (
            <div  data-prop={shortUri(k)} >               
               <h3><span>{this.proplink(k,null,n)}{ret.length > 1 ? " "+I18n.t("punc.num",{num:i+1}) : ""}{I18n.t("punc.colon")}</span> </h3>
               {this.preprop(k,0,n)}
               <div class="group">
                  {r}                  
               </div>
            </div>
         )))
      } else if(k === _tmp+"containingOutline") {
         let data
         if(this.props.assocResources && elem?.length) { 
            data = this.props.assocResources[elem[0].value]
            if(data && data.length) data = getLangLabel(this,k,data.filter(d => [skos+"prefLabel",skos+"altLabel",rdfs+"label"].includes(d.type) || [skos+"prefLabel",skos+"altLabel",rdfs+"label"].includes(d.fromKey)))
            console.log('ctnO:', data, elem)
         }
         return ( 
            <ResourceViewerContainer auth={this.props.auth} /*history={this.props.history}*/ location={this.props.location} navigate={this.props.navigate} IRI={shortUri(elem[0]?.value)} outlineOnly={true} part={this.props.IRI}/> 
         )
         
      } else {
         let classN = k===bdo+"note"
            ? "has-collapse custom"
            :  linkToPlaces
               ? "withLinkTo"
               : ""
         return (
            <div  data-prop={shortUri(k)} className={classN}>               
               <h3><span>{this.proplink(k,null,n)}{I18n.t("punc.colon")}</span> </h3>
               {this.preprop(k,0,n)}
               <div className={k === bdo+"personTeacherOf" || k === bdo + "personStudentOf" ? "propCollapseHeader in-false":"group"}>
               {ret}               
               </div>
               { linkToVersions }
               { linkToPlaces }
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
            if(prefix === "sats") prefix = "sat" // #570
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
    
            !noS ? <span class="NL nl-same"></span>:null,

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
                     if(prov === "sats") prov = "sat" // #570
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

   otherResources(same,id,noS) {

      let list = [], useRid = []

      if(same && same.length) { 
         
         let viaf = same.filter(s => s.value.includes("viaf.org/"))
         if(viaf.length) {
            viaf = viaf[0].value
            if(viaf && !same.filter(s => s.value.includes("worldcat.org/")).length) same.push({value:viaf.replace(/^.*\/([^/]+)$/,"https://www.worldcat.org/identities/containsVIAFID/$1"),type:"uri"})
         } 
         
         let mapSame = same.map(s => {
            //loggergen.log("s.val:",s.value)

            if(s.value.startsWith(bdr)) return

            let prefix = shortUri(s.value).split(":")[0]            
            if(prefix === "sats") prefix = "sat" // #570
            if(prefix.startsWith("http") && s.fromSeeOther) prefix = s.fromSeeOther
            // TODO fix Sakya Research Center
            if(!list.includes(prefix)) {
               list.push(prefix)
               let link = s.value, prov = shortUri(s.value).split(":")[0], name = I18n.t("result.resource")
               if(prov === "sats") prov = "sat" // #570
               if(prov.startsWith("http") && s.fromSeeOther) prov = s.fromSeeOther
               let data,tab ;
               if(this.props.assocResources) data = this.props.assocResources[s.value]                  
               if(data && (tab=data.filter(t => t.fromKey === adm+"canonicalHtml")).length) link = tab[0].value                       
               
               // DONE case when more than on resource from a given provider (cf RKTS)
               let useR = !useRid.includes(prov)
               
               if(this.props.config && this.props.config.chineseMirror) link = link.replace(new RegExp(cbeta), "http://cbetaonline.cn/")
               
               let ID = "ID-tmp:otherResources-"+link      
   

               let ret = <a target="_blank" href={link} className="otherRlink">                     
                  <span class={"provider "+prefix}>{provImg[prefix]?<img src={provImg[prefix]}/>:<span class="img">{prefix.replace(/^cbc.$/,"cbc@").toUpperCase()}</span>}</span>
                  {/* {I18n.t("result.open")} {useR && name} {!useR && <emph> {shortUri(s.value)} </emph>}{I18n.t("misc.in")} &nbsp; */}
                  {providers[prov]}
                  <img src="/icons/link-out.svg"/>
               </a>
            
               const sav = [ ret ]
               sav.push(this.hoverMenu("tmp:otherResources",{value:link}, [ ret ]))

               return (<h4 class="multiple hasTogHovM" onClick={this.toggleHoverM(ID,true)} onMouseEnter={this.toggleHoverMtooltip(ID,true)} onMouseLeave={this.toggleHoverMtooltip(ID,false)}>
                     { sav }
                  </h4>
                  )

               //loggergen.log("permaSame",s,data,tab,link,name,prov) 


            } else {
               useRid.push(prefix)
            }
         }).filter(s => s)
         
         if(mapSame.length) return (
            <div id="otherR" data-prop="tmp:otherResources">
               <h3>
                  <span>
                      <Tooltip placement="bottom-start" classes={{tooltip:"commentT",popper:"commentP"}} style={{marginLeft:"50px"}} title={<div>{I18n.t("resource.sameL",{count:mapSame.length})}</div>}>
                        <a class="propref"><span>{I18n.t("misc.otherR",{count:mapSame.length})}</span></a>
                     </Tooltip>
                     {I18n.t("punc.colon")}
                  </span>
               </h3> 
               <div class="group">{ mapSame }</div>
            </div>
         )
      

         /*
         return ([
   

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
                     if(prov === "sats") prov = "sat" // #570
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

                     if(prov != "bdr") return (<a target="_blank" href={link}>{open}</a>) // keep original http/s prefix (#381)
               } ) }
            </Popover>
         ])
         */
      }
   }

renderPopupCitation(IRI) {

   //loggergen.log("rPc:",IRI)
   
   let citation = "", citaD, popupCitation = [];
   if(this.state.collapse.citation && IRI && (citaD = this.props.citationData)) {

      const supportedLocales = { "bo":"en-US", "en":"en-US", "zh":"zh-CN", "latn":"en-US" }
      let citaLg = this.props.locale
      if(this.state.citationLang) citaLg = this.state.citationLang
      else if(this.props.locale === "en") citaLg = "latn"

      let citaSty = "mla"
      if(this.state.citationStyle) citaSty = this.state.citationStyle

      //loggergen.log("citaD:",citaD,citaSty,citaLg,supportedLocales[citaLg],citationConfig)

      if(citationConfig.templates.data[citaSty] && supportedLocales[citaLg] && citationConfig.locales.data[supportedLocales[citaLg]] && citaD.data && citaD.data[IRI]&& citaD.data[IRI][citaLg]) {

         let cite = new Cite(citaD.data[IRI][citaLg], { 'forceType': '@csl/object' })

         //loggergen.log("cite:",cite,citaD.data[IRI][citaLg])

         if(cite) citation = cite.format('bibliography', {
            format: 'html',
            template: citaSty,
            lang: supportedLocales[citaLg],
            append: ({id}) => {
               return ` [BDRC ${id}]`
            }
         })

         if(citation) {
            citation = citation.replace(/(https?:[^;, ]+)/g,(m,g1) => formatUrl(g1))
            if(citaSty === "mla") citation = citation.replace(/https?[^/]+\/\//,"")
         }
      }

      if(this.props.config && this.props.config.language && this.props.config.language.menu) {
         popupCitation.push(
            <Popper
               id="popDL"
               className="cite"
               //anchorOrigin={{ horizontal: 89 }}
               //transformOrigin={{ horizontal: 'center' }}
               open={this.state.collapse.citation}
               anchorEl={this.state.anchorEl.citation}
               //keepMounted
               placement={"bottom"}
               { ...(IRI !== this.props.IRI?{popperOptions:{modifiers:{ offset: { enabled: true, offset: '350,0' }}}}:{}) }
            >
               <ClickAwayListener onClickAway={ev => { 
                     //loggergen.log("ev1:",ev.target,ev.currentTarget)
                     if(!$(ev.target).closest("[role='tooltip'],#popDL,#menu-citationLang,#cite").length){
                        if(this.state.collapse.export){
                           //loggergen.log("ev1a:",ev.target,ev.currentTarget)
                           this.setState({ collapse:{ ...this.state.collapse, export:false }}) 
                        } else {
                           //loggergen.log("ev1b:",ev.target,ev.currentTarget)
                           this.setState({ citationRID:false, collapse:{ ...this.state.collapse, citation:false }})
                        } 
                     }  
                  }}>
                  <div>
                     <FormControl className={"formControl"} style={{ width:"calc(100% - 16px)", margin:"16px", marginRight:0 }}>
                        <InputLabel htmlFor="citationLang">{I18n.t("lang.lg")}</InputLabel>
                        <Select
                           value={citaLg} 
                           onChange={ev => this.setState({ citationLang: ev.target.value })}
                           open={this.state.collapse.citationLang}
                           onClose={(e) => e.preventDefault() }
                           inputProps={{ name: 'citationLang', id: 'citationLang', }}
                           //style={{ width: "100%" }}
                        >
                           { [ ...this.props.config.language.menu, "latn" ].map( (lg,i) => (
                              <MenuItem key={lg} value={lg}>{I18n.t("lang."+lg)}</MenuItem>)) 
                           }
                        </Select>
                     </FormControl> 
                  

                  { [ "mla", "chicago", "apa" ].map( (s,i) => 
                     <a>
                        <MenuItem 
                           classes={{ selected: "selected-style" }} 
                           onClick={ev => this.setState({citationStyle: s})} {...!this.state.citationStyle&&i==0||this.state.citationStyle === s?{selected:true}:{}}>
                              {I18n.t("resource.citation."+s)}
                        </MenuItem>
                     </a>) }
                  </div>
                  <div class="output">
                     { this.props.loading && <Loader loaded={!this.props.loading}  options={{position:"relative",top:"0px"}}/> }
                     { !this.props.loading && <div class="main">{HTMLparse(citation)}</div> }
                     { !this.props.loading && <div class="actions">
                        <CopyToClipboard text={citation.replace(/<[^>]+>/g, '')} onCopy={(e) => {
                              this.setState({citationCopied:true})
                              setTimeout(()=>this.setState({citationCopied:false}), 3000)
                           }}>                        
                              <a id="clipB" className={this.state.citationCopied?"copied":""}>
                                 { this.state.citationCopied 
                                    ? [<CheckIcon/>,I18n.t("resource.clipC")] 
                                    : [<ClipboardIcon/>,I18n.t("resource.clipB")] 
                                 }
                              </a>
                        </CopyToClipboard>
                        <a id="export" onClick={ev => {
                           //loggergen.log("ev3:",ev.target,ev.currentTarget)
                           this.setState({
                              collapse:{ ...this.state.collapse, export:!this.state.collapse.export },
                              anchorEl:{ ...this.state.anchorEl, export:({...ev}).currentTarget }
                           })
                        }}>
                           <span class="icon"><img src="/icons/export.svg"/></span> {I18n.t("resource.export")} { this.state.collapse.export ? <ExpandLess/>:<ExpandMore/>}
                        </a>
                     </div>}
                  </div>
               </ClickAwayListener>
            </Popper>
         )
      }
            
      if(this.state.collapse.export) {
         popupCitation.push(
            <Popper
               id="popDL"
               className="export"
               //anchorOrigin={{ horizontal: 30 }}
               //transformOrigin={{ horizontal: 'center' }}
               open={this.state.collapse.export}
               anchorEl={this.state.anchorEl.export}
               placement={"bottom-end"}
            >
               <ClickAwayListener onClickAway={ev => {
                     //loggergen.log("ev2:",ev.target,ev.currentTarget)
                     if(!$(ev.target).closest("#popDL.export,#export").length) {
                        //loggergen.log("ev2a:",ev.target,ev.currentTarget)
                        this.setState({ collapse:{ ...this.state.collapse, export:false }}) 
                     }
                  }}> 
                  <a rel="alternate" type="application/x-research-info-systems" 
                     href={RISexportPath(IRI,(this.state.citationLang?this.state.citationLang:this.props.locale))} download>
                        {/* "https://ldspdi.bdrc.io/RIS/"+IRI+"/"+(this.state.citationLang?this.state.citationLang:this.props.locale)"+ */}
                        <MenuItem>
                              { I18n.t("resource.exportRIS", {format:"RIS"})}
                        </MenuItem>
                  </a>
                  { IRI && IRI.match(/^bdr:MW[^_]+$/) && [
                     <a rel="alternate" type="application/marc" href={this.expand(IRI, true)+".mrc"} download>
                           <MenuItem>{I18n.t("resource.export2",{format:"MARC"})}</MenuItem>           
                     </a>,
                     <a rel="alternate" type="application/marcxml+xml" href={this.expand(IRI, true)+".mrcx"} download>
                           <MenuItem>{I18n.t("resource.export2",{format:"MARCXML"})}</MenuItem>           
                     </a> 
                  ]}
               </ClickAwayListener>
            </Popper>
         )
      }  

   }
   return popupCitation
}

renderPopupPrint(IRI,place = "bottom-start") {
   return (
      <Popper
         id="popDL"
         className="print"
         open={this.state.collapse.print}
         anchorEl={this.state.anchorEl.print}
         placement={place}
      >
         <ClickAwayListener onClickAway={ev => { this.setState({ printRID:false, collapse:{ ...this.state.collapse, print:false }})}}>
            <div> 
               <div class="main">
                  <p>{I18n.t("resource.orderVT")}</p>
                  <div>I want to order 1 copy of {HTMLparse(formatUrl(fullUri(IRI)))}</div>
               </div>
               <div class="actions">
                  <CopyToClipboard text={"I want to order 1 copy of "+fullUri(IRI)} onCopy={(e) => {
                        this.setState({printCopied:true})
                        setTimeout(()=>this.setState({printCopied:false}), 3000)
                     }}>                        
                        <a id="clipB" className={this.state.printCopied?"copied":""}>
                           { this.state.printCopied 
                              ? [<CheckIcon/>,I18n.t("resource.clipT")] 
                              : [<ClipboardIcon/>,I18n.t("resource.clipB")] 
                           }
                        </a>
                  </CopyToClipboard>
                  <a id="export" href="http://vimalatreasures.org/contact-us.aspx" target="_blank">
                     <span class="icon"><MailIcon/></span> {I18n.t("resource.contactVT")}
                  </a>
               </div>
            </div>
            {/*
            <div class="output">
               { this.props.loading && <Loader loaded={!this.props.loading}  options={{position:"relative",top:"0px"}}/> }
               { !this.props.loading && }*/}
         </ClickAwayListener>
      </Popper>
   )
}

prepareSame(other, sameLegalD) 
{
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
   } else {
      if(!same.some(s => s.value && !s.value.startsWith(bdr))) noS = true
   }

   return {same, noS}
}

perma_menu(pdfLink,monoVol,fairUse,other,accessET, onlyDownload)
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

   let { same, noS } = this.prepareSame(other, sameLegalD) 

   let isEtextVol = false
   if(this.props.IRI && getEntiType(this.props.IRI) === "Etext") {
      let isVol = this.getResourceElem(bdo+"eTextIsVolume")
      if(isVol && isVol.length) isEtextVol = true
      else {
         isVol = this.getResourceElem(bdo+"eTextInVolume")
         if(isVol && isVol.length) isEtextVol = true
      }
   }


   let authError = false ;
   if(this.props.pdfVolumes && this.props.pdfVolumes.length > 0) {
      for(let v of this.props.pdfVolumes) {
         if([401,403].includes(v.pdfError) || [401,403].includes(v.pdfError)) { 
            authError = true 
            //setImmediate(() => window.dispatchEvent(new CustomEvent('resize')))
            break;
         }
      }
   }
   
   let popupCitation = this.renderPopupCitation(!this.state.citationRID?this.props.IRI:this.state.citationRID);
   //this._refs["perma_DL"] = React.createRef();

   let popupPrint =  this.renderPopupPrint(this.state.printRID?this.state.printRID:this.props.IRI,this.state.printRID?"bottom-end":"bottom-start")

   //loggergen.log("same:",same)


   let pdfZipError = (e, code, t) => <>
      {  [404,501].includes(code)
         ? I18n.t("resource.pdferror1")+(e[t+"Range"]?": "+e[t+"Range"]+"":"")
         : I18n.t("resource.pdferror2")+(e[t+"Range"]?" ("+I18n.t("resource.range")+": "+e[t+"Range"]+")":"")} 
         <Close  onClick={(ev) => { 
         this.props.onResetPdf(e,t)
         ev.preventDefault()
         ev.stopPropagation()
      }}/>
   </>
   
   // TODO 
   // + fix bdr:G3176 (sameAs Shakya Research Center)
   // + use <Tooltip/> instead of title="""

   const popupPdf = (that.props.pdfVolumes && that.props.pdfVolumes.length > 0) &&
      <Popover
         className="poPdf"
         open={that.state.pdfOpen == true || that.props.pdfReady == true}
         anchorEl={that.state.anchorPermaDL}
         //anchorOrigin={{ vertical: 'bottom' }}
         //transformOrigin={{ vertical: 'top' }}
         onClose={that.handleRequestClosePdf.bind(this)}
      >
         <List>
            {/*
            that.props.pdfUrl &&
            [<MenuItem onClick={e => that.setState({...that.state,pdfOpen:false})}><a href={that.props.pdfUrl} target="_blank">Download</a></MenuItem>
            ,<hr/>]
            */}
            { !this.props.useDLD && authError && (
            isProxied(that)
               ? <ListItem><div className="mustLogin"><Trans i18nKey="resource.notInList" components={{lk:<a class='uri-link' target='_blank' href={"https://library"+"."+"bdrc"+"."+"io/show/"+that.props.IRI} />, nl:<br/>}}/></div></ListItem>
               : <ListItem><a className="mustLogin" onClick={() => that.props.auth.login(that.props.location)}>{I18n.t("resource.mustLogin")}</a></ListItem>
            )}
            {
            (!authError || this.props.useDLD) && that.props.pdfVolumes.map(e => {

               let Ploading = e.pdfFile && e.pdfFile == true
               let Ploaded = e.pdfFile && e.pdfFile != true
               let Perror = e.pdfFile && e.pdfError || e.pdfError === 501
               let Prange = this.state.collapse["pdf_"+e.link]

               let Zloading = e.zipFile && e.zipFile == true
               let Zloaded = e.zipFile && e.zipFile != true
               let Zerror = e.zipFile && e.zipError || e.zipError === 501
               let Zrange = this.state.collapse["zip_"+e.link]


               let pdfMsg = I18n.t("resource.gener1pdf")
               let zipMsg = I18n.t("resource.gener0zip")

               if(Prange) {
                  pdfMsg = <PdfZipSelector type="pdf" that={that} elem={e}/>                                 
               }

               if(Ploading) {
                  pdfMsg = I18n.t("resource.gener2pdf")
                  zipMsg =  I18n.t("resource.gener1zip")
               }

               if(Ploaded) {
                  pdfMsg = <>{I18n.t("resource.gener3pdf")}<Close onClick={(ev) => {
                     this.props.onResetPdf(e,"pdf")
                     ev.preventDefault()
                     ev.stopPropagation()
                  }}/></>
                  zipMsg =  I18n.t("resource.gener1zip")
               }

               if(Perror) {
                  Ploading = false
                  pdfMsg = pdfZipError(e,e.pdfError,"pdf")
                  
               }

               if(Zrange) {
                  zipMsg = <PdfZipSelector type="zip" that={that} elem={e}/>
               }

               if(Zloading) {
                  zipMsg = I18n.t("resource.gener2zip")
               }

               if(Zloaded) {                                 
                  zipMsg =  <>{(Ploaded?I18n.t("resource.gener0zip"):I18n.t("resource.gener3zip"))}<Close  onClick={(ev) => { 
                     this.props.onResetPdf(e,"zip")
                     ev.preventDefault()
                     ev.stopPropagation()
                  }}/></>
               }

               if(Zerror) {
                  Zloading = false
                  zipMsg = pdfZipError(e,e.zipError,"zip")
                  
               }

               //loggergen.log("pdfMenu:",e)

               const nbVol = (e.volume !== undefined?e.volume:monoVol.replace(/[^0-9]+/,""))
               if(this.props.useDLD)  return (<ListItem className="pdfMenu">
                     <b>{(e.volume !== undefined?(!e.volume.match || e.volume.match(/^[0-9]+$/)?"Volume ":"")+(e.volume):monoVol)}{I18n.t("punc.colon")}</b>
                     <a href="#" onClick={(ev) => {
                        window.top.postMessage(JSON.stringify({"download":{nbVol:""+nbVol,"rid":this.props.IRI.replace(/^bdr:/,"")}}),"*")        
                        ev.preventDefault()
                        ev.stopPropagation()
                     }}><span class="on">{I18n.t("resource.gener3pdf")}</span></a>                                     
                  </ListItem>)                              
               else  return (<ListItem className="pdfMenu">
                        <b>{(e.volume !== undefined?(!e.volume.match || e.volume.match(/^[0-9]+$/)?"Volume ":"")+(e.volume):monoVol)}{I18n.t("punc.colon")}</b>
                        <a onClick={ev => that.handlePdfClick(ev,e.link,e.pdfFile)}
                           {...(Ploaded ?{href:e.pdfFile}:{})}
                        >
                           { Ploading && <Loader className="pdfSpinner" loaded={Ploaded} scale={0.35}/> }
                           <span {... (Ploading?{className:"pdfLoading"}:{className: this.state.collapse["pdf_"+e.link]?"on":""})} >{pdfMsg}</span>
                           { Ploading && e.pdfPercent !== undefined && <span>&nbsp;{e.pdfPercent}%</span>}
                        </a>
                        <a onClick={ev => that.handlePdfClick(ev,e.link,e.zipFile,"zip")}
                           {...(Zloaded ?{href:e.zipFile}:{})}
                        >
                           { Zloading && <Loader className="zipSpinner" loaded={Zloaded} scale={0.35}/> }
                           <span {... (Zloading?{className:"zipLoading"}:{className:this.state.collapse["zip_"+e.link]?"on":""})}>{zipMsg}</span>
                           { Zloading && e.zipPercent !== undefined && <span>&nbsp;{e.zipPercent}%</span>}
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


   if(onlyDownload) { 
      return (<>
       { popupPdf }
       { pdfLink && 
            ( (!(that.props.manifestError && that.props.manifestError.error.message.match(/Restricted access/)) /*&& !fairUse*/) )
            ? <a href="#" class="urilink" onClick={ev =>
                  {
                     //if(that.props.createPdf) return ;
                     if((monoVol && monoVol.match && monoVol.match(/[^0-9]/)) || monoVol > 0){
                        that.props.onInitPdf({iri:that.props.IRI,vol:monoVol},pdfLink)
                     }
                     else if(!that.props.pdfVolumes) {
                        that.props.onRequestPdf(that.props.IRI,pdfLink)
                     }
                     that.setState({...that.state, collapse:{...this.state.collapse,permaDL:false}, pdfOpen:true,anchorPermaDL:ev.currentTarget,anchorElPdf:ev.currentTarget})

                     ev.stopPropagation()
                     ev.preventDefault()
                     return false
                  }
               }>
               {I18n.t("resource.download"+(fairUse?"FU":""))}
            </a>
            : that.props.manifestError && !that.props.manifestError.error.message.match(/Restricted access/) 
               ? <a class="urilink nolink">{I18n.t("viewer.pdferror2")} ({I18n.t("user.errors.server2")})</a>
               : <Loader  className="scans-viewer-loader" loaded={that.props.firstImage && !that.props.firstImage.includes("bdrc.io") || !( (!(that.props.manifestError && that.props.manifestError.error.message.match(/Restricted access/)) /*&& !fairUse*/) || (that.props.auth && that.props.auth.isAuthenticated())) } />
         }      
      </>)
   }
   else return (

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

      <span class="NL nl-dl"></span>

      <span id="DL" ref={this._refs["perma_DL"]} onClick={(e) => this.setState({...this.state,anchorPermaDL:e.currentTarget, collapse: {...this.state.collapse, permaDL:!this.state.collapse.permaDL } } ) }>
         <img src="/icons/DL_.svg"/>{I18n.t("resource.exportData",{data: "metadata" })} { this.state.collapse.permaDL ? <ExpandLess/>:<ExpandMore/>}
      </span>

      { that.props.IRI && that.props.IRI.match(/bdr:((MW)|(W[0-9])|(IE))/) && 
         <>
            <span class="NL nl-cite"></span>
            <span id="cite" onClick={ev => {
               that.setState({
                  collapse:{ ...that.state.collapse, citation:!that.state.collapse.citation },
                  anchorEl:{ ...that.state.anchorEl, citation:({...ev}).currentTarget }
               })
            }}>
               <CiteIcon />{I18n.t("resource.cite")} 
            </span> 
         </>
      }


      { cLegalD && <>
            <span class="NL nl-copy"></span>
            <span id="copyright" title={this.fullname(cLegalD,false,false,true,false)}><img src={"/icons/"+copyR+".png"}/></span> 
         </>
      }


         {this.samePopup(same,"permalink",noS)}

         <Popover
            id="popDL"
            open={this.state.collapse.permaDL}
            anchorEl={this.state.anchorPermaDL}
            onClose={e => { this.setState({...this.state, /*anchorPermaDL:null,*/ collapse: {...this.state.collapse, permaDL:false } } ) }}
            >

               { (this.props.eTextRefs && this.props.eTextRefs.mono && accessET) && 
                     <a target="_blank" title={I18n.t("resource.version",{format:"TXT"})} rel="alternate" type="text"  download href={fullUri(this.props.eTextRefs.mono).replace(/^http:/,"https:")+".txt"}>
                        <MenuItem>{I18n.t("resource.exportDataAs",{data: I18n.t("types.etext"), format:"TXT"})}</MenuItem>
                     </a> }

               { (isEtextVol && accessET) &&
                     <a target="_blank" title={I18n.t("resource.version",{format:"TXT"})} rel="alternate" type="text"  download href={this.props.IRI?fullUri(this.props.IRI).replace(/^http:/,"https:")+".txt":""}>
                        <MenuItem>{I18n.t("resource.exportDataAs",{data: I18n.t("types.etext"), format:"TXT"})}</MenuItem>
                     </a> }

               { pdfLink && 
                  ( (!(that.props.manifestError && that.props.manifestError.error.message.match(/Restricted access/)) /*&& !fairUse*/) || (that.props.auth && that.props.auth.isAuthenticated()))
                  && <>
               <a> <MenuItem onClick={ev =>
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
                   {I18n.t("resource.getPDF")}
                </MenuItem></a>
                  <a><MenuItem  onClick={ev => {
                        that.setState({...that.state, 
                           collapse:{...this.state.collapse,permaDL:false,print:true},
                           anchorEl:{...this.state.anchorEl, print:this.state.anchorPermaDL}
                        })
                      }}>
                   {I18n.t("resource.print")}
                </MenuItem></a>
                </>  }

               { !that.props.manifestError && that.props.imageAsset &&

                       <CopyToClipboard text={that.props.imageAsset.replace(/^\/\//,"https://")} onCopy={(e) =>
                                 //alert("Resource url copied to clipboard\nCTRL+V to paste")
                                 prompt(I18n.t("misc.clipboard"),that.props.imageAsset.replace(/^\/\//,"https://"))
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

               { /* that.props.IRI && that.props.IRI.match(/bdr:MW/) && [
                     <a target="_blank" title={I18n.t("resource.version",{format:"MARC"})} rel="alternate" type="application/marc" href={that.expand(that.props.IRI, true)+".mrc"} download>
                        <MenuItem>{I18n.t("resource.exportDataAs",{data: "metadata", format:"MARC"})}</MenuItem>           
                     </a>,
                     <a target="_blank" title={I18n.t("resource.version",{format:"MARCXML"})} rel="alternate" type="application/marcxml+xml" href={that.expand(that.props.IRI, true)+".mrcx"} download>
                        <MenuItem>{I18n.t("resource.exportDataAs",{data: "metadata", format:"MARCXML"})}</MenuItem>           
                     </a> 
                  ]
                */ }

              
         </Popover>

            { popupPrint }
            
            { popupCitation }
   
           { popupPdf }
         
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


      loggergen.log("etext",prev,next,elem,this.props.nextChunk,tags,this.hasSub(k))

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

               if(!this.props.disableInfiniteScroll && next && this.props.nextChunk !== next) {                               
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

      const inst = this.getResourceElem(bdo+"eTextInInstance") ?? this.getResourceElem(bdo+"volumeOf") 
      let info = this.props.allETrefs?.[shortUri(inst?.[0]?.value ?? "")]?.["@graph"]?.filter(n => n["@id"] === this.props.IRI) ?? []
      const get = qs.parse(this.props.location.search)
      let firstC = 0, lastC = 10000000, text
      if(info?.[0]?.type === "EtextVolume") {
         console.log("info:",info)
         let vhet = info[0].volumeHasEtext
         if(vhet) {
            if(!Array.isArray(vhet)) vhet = [ vhet ]
            text = this.props.allETrefs?.[shortUri(inst?.[0]?.value)]?.["@graph"]?.filter(n => vhet.includes(n["@id"])) ?? []
            //const sc = this.props.that.state.scope === text[@id] ? Number(get.startChar) ?? 0 : 0
            //text = text.filter(t => t.sliceStartChar <= sc && sc < t.sliceEndChar)
            let _text = text?.filter(t => t["@id"] === this.props.that?.state?.scope)            
            if(_text.length) {
               firstC = _text[0].sliceStartChar
               lastC =  _text[0].sliceEndChar - 1
            } else {
               text = _.orderBy(text, "sliceStartChar", "asc")
               firstC = text[0].sliceStartChar
               lastC =  text[text.length - 1].sliceEndChar - 1
            }
         }
      } else if(info?.[0]?.type === "Etext" || Array.isArray(info?.[0]?.type) && info[0].type.includes("Etext")) {
         firstC = info[0].sliceStartChar
         lastC = info[0].sliceEndChar - 1
      }

      
      let next, prev;
      if(elem && elem.length) { 
         elem = elem.filter(e => e.value && e.start !== undefined && e.start >= firstC && e.start < lastC)
         prev = elem.filter(e => e.value && e.start !== undefined)
         next = elem.filter(e => e.value && e.end)
      }
      if(next && next.length) next = next[next.length - 1].end + 1
      else next = 0
      
      if(prev && prev.length) prev = -prev[0].start
      if(!prev) prev = -1
      
      //loggergen.log("epage:", elem, kZprop, iiifpres, this.props.IRI, inst, info, get, text, prev, next, firstC, lastC)

      if(prev === -firstC) prev = - 1
      
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
         } else {
            elem = this.getResourceElem(bdo+"eTextInVolume")
            console.log("eiv:1",elem)
            if(elem?.length) elem = this.getResourceElem(bdo+"eTextVolumeForImageGroup", shortUri(elem[0].value), this.props.assocResources)
            else elem = this.getResourceElem(bdo+"eTextVolumeForImageGroup")
            console.log("eiv:2",elem)
            if(elem && elem.length) {
               //loggergen.log("elem",elem)
               for(let e of elem) {
                  this.props.onImageVolumeManifest(iiifpres+"/v:"+ e.value.replace(new RegExp(bdr), "bdr:") + "/manifest",this.props.IRI);
               }
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

            if(!this.props.previewEtext && this.props.resources && !this.props.resources[id]) this.props.onGetResource(id);

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

      let kw = []

      if(this.props.highlight && this.props.highlight.key) {
         for(let k of lucenequerytokeywordmulti(this.props.highlight.key)) { 
            const subkw = getLangLabel(this,bdo+"eTextHasPage",[{value:k, lang:this.props.highlight.lang}])
            kw.push(subkw)
         }
         if(kw.length) kw = kw.map(k => k.value)
      }

      let unpag = this.unpaginated()

      let firstPageUrl 
      let loca = { ...this.props.location }
      //if(prev!==-1) {
         loca.search = loca.search.replace(/(^[?])|(&*startChar=[^&]+)(&&+)?/g,"")
         firstPageUrl = "?startChar="+(firstC ?? 0)+(loca.search?"&"+loca.search:"") + "#open-viewer"
      //}

      //let last = this.getResourceElem(tmp+"lastChunk");
      let lastPageUrl 
      loca = { ...this.props.location }
      if(lastC) {//(last?.length) { //} && next <= Number(last[0].value)) {
         loca.search = loca.search.replace(/(^[?])|(&*startChar=[^&]+)(&&+)?/g,"")
         lastPageUrl = "?startChar="+lastC+(loca.search?"&"+loca.search:"") + "#open-viewer"
      }

      const monlamPopup = (ev, seq, pageVal) => {

         ev.persist()

         const MAX_SELECTION_LENGTH = 120
         const MIN_CONTEXT_LENGTH = 40
         const selection = window.getSelection();
         
         //loggergen.log("closest:",ev.target.closest(".popper"),ev.currentTarget,ev.target)

         if(!this.props.config.useMonlam || !this.state.enableDicoSearch || this.props.disableInfiniteScroll || ev.target.closest(".popper")) return
         
         let langElem = selection.anchorNode?.parentElement?.getAttribute("lang")
         if(!langElem) langElem = selection.anchorNode?.parentElement?.parentElement?.getAttribute("lang")
         
         // #818
         if(langElem && !langElem.startsWith("bo")) return

         let parent = selection.anchorNode?.parentElement
         if(!parent?.getAttribute("lang")) parent = parent?.parentElement

         //loggergen.log("parent:",langElem,ev.currentTarget,parent,selection.toString(),selection,parent.children,selection.anchorNode)
         
         const getAbsOffset = (node, nodeOffset) => {

            // case when multiple bo-x-ewts span in a row inside page (bdr:UT3JT13384_014_0001)                             
            let rootPage = ev.currentTarget, startFromRoot = 0                  
            for(let n of rootPage.children) {
               if(n == parent) break ;
               startFromRoot += n.textContent?.length || 0
            }

            // case when there are already some highlighted keyword from search
            let start = startFromRoot, nodes = parent?.children ? Array.from(parent?.children) : []
            if(nodes?.length) for(let i in nodes) {
               if(nodes[i] == node.parentElement) break ;
               start += nodes[i].textContent?.length || 0
               //loggergen.log("i:",i,start)
            }
            
            // case when there are <br/>, must count inner nodes as well 
            let previousElement = node?.previousSibling
            while (previousElement) {
               //loggergen.log("prev:",previousElement)
               if (previousElement.nodeType === Node.TEXT_NODE) {
                  start += previousElement.nodeValue.length;
               } 
               if (previousElement.nodeName === "BR") {
                  start += 1
               }
               previousElement = previousElement.previousSibling;
            }
            start += nodeOffset

            return start
         }

         let start = getAbsOffset(selection.anchorNode, selection.anchorOffset)
         let end = getAbsOffset(selection.focusNode, selection.focusOffset)                

         // DONE: check case when selection is made backwards? right to left 
         let invert = false
         if(start > end) {

            invert = true

            let tmp = start
            start = end
            end = tmp

            if(start + selection.toString().length != end) console.warn(start,end,start + selection.toString().length)

         } 
         else if(start === end) {

            
            // #800 keep open until closed with cross
            /*  
            if(this.state.monlam && this.state.collapse.monlamPopup) { 
               this.setState({ noHilight:false, monlam:null })
               this.props.onCloseMonlam()
            }
            */                 
            if(this.state.monlam) {
               this.setState({ monlam:null, ...this.state.noHilight && seq != this.state.noHilight?{noHilight:false}:{} })
            }

            return
         } 

         let range = selection.getRangeAt(0);

         if(end > start + MAX_SELECTION_LENGTH) { 
            try {
               let sameElem = range.startContainer === range.endContainer || range.startContainer.parentElement === range.endContainer.parentElement
               loggergen.log("range:", sameElem, range, start, end, range.startOffset + MAX_SELECTION_LENGTH)
               if(!invert) {
                  end = start + MAX_SELECTION_LENGTH
                  
                  /*
                  // use rangy in every case 
                  if(sameElem) range.setEnd(range.startContainer, range.startOffset + MAX_SELECTION_LENGTH);
                  else {
                  */

                     let mutRange = rangy.createRange();
                     mutRange.setStart(range.startContainer, range.startOffset) 
                     mutRange.setEnd(range.endContainer, range.endOffset)                      
                     mutRange.moveEnd("character", MAX_SELECTION_LENGTH - range.toString().length)
                     range.setEnd(mutRange.endContainer, mutRange.endOffset)
                     //loggergen.log(mutRange, mutRange.toString(), mutRange.toString().length, range, range.toString(), range.toString().length)     
                  //}
               } else {
                  start = end - MAX_SELECTION_LENGTH
                  //if(sameElem) range.setStart(range.endContainer, range.endOffset - MAX_SELECTION_LENGTH);
                  //else {
                     let mutRange = rangy.createRange();
                     mutRange.setStart(range.startContainer, range.startOffset) 
                     mutRange.setEnd(range.endContainer, range.endOffset)                      
                     mutRange.moveStart("character", range.toString().length - MAX_SELECTION_LENGTH)
                     range.setStart(mutRange.startContainer, mutRange.startOffset)
                  //}
               }
            } catch(err) {                  
               console.warn("can't update range", err, start, end, range, selection)     
               if(this.state.enableDicoSearch) selection.removeAllRanges()
               if(this.state.monlam) {
                  this.setState({ monlam:null, ...this.state.noHilight && seq != this.state.noHilight?{noHilight:false}:{} })
               }
               return
            }
         }

         
         const startOff = Math.max(0, start - MIN_CONTEXT_LENGTH)
         const endOff = Math.min(pageVal.length, end + MIN_CONTEXT_LENGTH)

         // let's use indexOf to get exact coordinates of selection in page
         const chunk =  pageVal.substring(startOff, endOff).replace(/[\r\n]/g," ");
         let cursor_start = chunk.indexOf(selection.toString())
         if(cursor_start < 0) cursor_start = start - startOff 
         let cursor_end =  cursor_start + selection.toString().length

         const updateHilightCoords = (target = this.state.monlam?.target, _range = this.state.monlam?.range) => {

            const { top, left } = target.getBoundingClientRect()
            let coords = Array.from(_range.getClientRects()).map(r => ({ 
               ...r, 
               px:{
                  top:(r.top - top)+"px",
                  left:(r.left - left)+"px",
                  height:r.height+"px",
                  width:r.width+"px"
               }
            }))
         
            let ref = React.createRef()
            coords = coords.map( (c,i) => { 
               if(i > 0) ref = null
               return <div {...ref?{ref}:{}} style={{...c.px, scrollMargin:"50vh 50px 50vh 50px", pointerEvents:"none", position:"absolute", background: "rgba(252,224,141,0.65)", display:"block", zIndex: 1, mixBlendMode: "darken" }}></div>
            })

            loggergen.log("coords:",coords,ev.currentTarget,start,end,startOff,endOff,pageVal.substring(startOff, endOff))
            
            return { hilight:coords, ref, popupCoords:Array.from(_range.getClientRects()) }
         }
     
         
         if (selection.rangeCount > 0) {
            range = range.cloneRange();
         }

         const data = { 
            target: ev.currentTarget,
            seq,
            range,
            ...updateHilightCoords(ev.currentTarget, selection.getRangeAt(0)),
            updateHilightCoords,
            api: {chunk, lang: langElem, cursor_start, cursor_end },
         }

         this.setState({ 
            collapse:{...this.state.collapse, monlamPopup: false},
            monlamTab:null, 
            monlam: data,
            ...this.state.monlam && this.state.noHilight && seq != this.state.noHilight?{noHilight:false}:{} 
         })               

         if(this.state.enableDicoSearch) selection.removeAllRanges()

         if(this.props.monlamResults) this.callMonlam(data)
      }

      const thatGetLangLabel = (...args) => getLangLabel(this, ...args)
      const thatSetState = (arg) => this.setState(arg)
      const uriformat = (...args) => this.uriformat(...args) 
      const hoverMenu = (...args) => this.hoverMenu(...args)
      const onGetContext = this.props.onGetContext      
      const ETSBresults = this.state.ETSBresults 

      return (
         
         [<InfiniteScroll
            id="etext-scroll"
            hasMore={true}
            pageStart={0}
            loadMore={(e) => { 
            
               //loggergen.log("next?",this.props.nextChunk,next,JSON.stringify(elem,null,3))

               if(!this.props.disableInfiniteScroll && next && this.props.nextPage !== next) {                               
                  this.props.onGetPages(this.props.IRI,next,undefined,{firstC, lastC}); 
               } 
            }
         }
         //loader={<Loader loaded={false} />}
         >
         { !this.props.disableInfiniteScroll && <div style={{display:"flex", justifyContent:"space-between", width:"100%", scrollMargin:"160px" }}>
            <h3 style={{marginBottom:"20px",textAlign:"right"}}>{ firstPageUrl && <Link onClick={(e) => this.props.onGetPages(this.props.IRI,firstC,true,{firstC, lastC})} to={firstPageUrl}>{I18n.t("resource.firstP")}</Link>}</h3>
            <h3 style={{marginBottom:"20px",textAlign:"right"}}>{ prev!==-1 && <a onClick={(e) => this.props.onGetPages(this.props.IRI, prev, true, {firstC, lastC} )} class="download" style={{fontWeight:700,border:"none",textAlign:"right"}}>{I18n.t("resource.loadP")}</a>}</h3>
            <h3 style={{marginBottom:"20px",textAlign:"right"}}>{ lastPageUrl && <Link to={lastPageUrl} onClick={(e) => this.props.onGetPages(this.props.IRI,lastC-999 /* TODO: use the other query here (mirador/num page)*/,true,{firstC, lastC})} >{I18n.t("resource.lastP")}</Link>}</h3>
         </div> }
         {/* {this.hasSub(k)?this.subProps(k):tags.map((e)=> [e," "] )} */}
         { elem.filter((e,i) => !this.props.disableInfiniteScroll || i > 0 || !e.chunks?.some(c => c["@value"].includes("Text Scan Input Form" /*" - Title Page"*/))).filter((e,i) => !this.props.disableInfiniteScroll || i < 2).map( (e,_i) => { 
            
            const state_monlam_hilight = e.seq == this.state.monlam?.seq && this.state.enableDicoSearch ? this.state.monlam?.hilight : null

            //console.log("this:",this)

            return <EtextPage 
                  { ...{ e, _i, unpag, imageLinks, kw, monlamPopup, preview:this.props.disableInfiniteScroll?true:false } } 
                  
                  state_showEtextImages={this.state.showEtextImages}
                  //state_monlam={this.state.monlam}
                  state_monlam_hilight={state_monlam_hilight}
                  //state_noHilight={this.state.noHilight}
                  state_enableDicoSearch={this.state.enableDicoSearch} 
                  state_etextHasBo={this.state.etextHasBo}
                  state_etextSize={this.state.etextSize}
                  //state_collapse={this.state.collapse}

                  props_IRI={this.props.IRI} 
                  props_location={this.props.location} 
                  props_config={this.props.config} 
                  props_highlight={this.props.highlight}
                  props_monlamResults={this.props.monlamResults}
                  props_disableInfiniteScroll={this.props.disableInfiniteScroll}
                  props_manifestError={this.props.manifestError} 
                  props_assocResources={this.props.assocResources}

                  { ...{ thatGetLangLabel, thatSetState, uriformat, hoverMenu, onGetContext, ETSBresults:ETSBresults?.filter(r => "bdr:"+r.volumeId === this.props.that?.state?.currentText && r.startPnum <= e.seq && e.seq <= r.endPnum) } }

               />
         })  }
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

   renderData = (returnLen, kZprop, iiifpres, title, otherLabels, div = "", hash = "", prepend = [], append = [], customData = {}) => {

      let { doMap, doRegion, regBox } = this.getMapInfo(kZprop);

      //loggergen.log("data!",kZprop)

      let data = kZprop.map((k) => {

            let elem = this.getResourceElem(k);

            if(!elem && customData[k]) {
               return customData[k]
            }

            // #783 + #851
            if(k === tmp+"outlineAuthorshipStatement" && this.props.outlines /*&& !elem?.length*/) {
               let nodes = this.props.outlines[this.props.IRI]
               if(nodes && nodes["@graph"]) nodes = nodes["@graph"] 
               if(nodes?.filter) {
                  nodes = nodes?.filter(n => n.outlineOf && n.outlineOf["@id"] === this.props.IRI)
                  if(nodes.length && nodes[0].authorshipStatement) {
                     elem = nodes[0].authorshipStatement
                     if(elem && !Array.isArray(elem)) elem = [ elem ]
                     elem = elem.map(e => ({value:e["@value"], lang:e["@language"], type:"literal"}))
                     k = tmp+"outlineAuthorshipStatement"
                  }
               }
            }
            let hasMaxDisplay ;

            //loggergen.log("prop:",k,elem,this.hasSuper(k))
            //for(let e of elem) loggergen.log(e.value,e.label1);

            //if(!k.match(new RegExp("Revision|Entry|prefLabel|"+rdf+"|toberemoved"))) {
               if(elem && 
               (![bdo+"placeLong",bdo+"placeLat"].includes(k) || !kZprop.includes(tmp+"GISCoordinates")) &&
               (!k.match(new RegExp(adm+"|adm:|isRoot$|SourcePath|"+rdf+"|toberemoved|entityScore|associatedCentury|lastSync|dateCreated|qualityGrade|digitalLendingPossible|inRootInstance|workPagination|partIndex|partTreeIndex|legacyOutlineNodeRID|sameAs|thumbnailIIIFSe|instanceOf|instanceReproductionOf|instanceHasReproduction|seeOther|(Has|ction)Member$|serialHasInstance|withSameAs|hasNonVolumeParts|hasPartB|hasEtextInOutline|addIALink|lastChunk|provider|hasOutline|first(Text|Vol)N?"+(this._dontMatchProp?"|"+this._dontMatchProp:"")))
               ||k.match(/(metadataLegal|contentProvider)$/) // |replaceWith
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
                  if(k === tmp+"outlineAuthorshipStatement") allLabels = elem
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
                  else if(/*this.state.openEtext &&*/ k == bdo+"eTextHasPage") {
                     return this.renderEtextHasPage(elem, kZprop, iiifpres /*+"/2.1.1"*/)
                  }
                  else if(/*this.state.openEtext &&*/ k == bdo+"eTextHasChunk" && kZprop.indexOf(bdo+"eTextHasPage") === -1) {
                     return this.renderEtextHasChunk(elem, k, tags)                     
                  }
                  else if(k !== bdo+"eTextHasChunk" && k !== bdo+"eTextHasPage" && (k !== bdo+"instanceHasVolume" || this.props.logged === "admin")) {
                     let disable
                     if(k === bdo+"scanInfo") disable = elem?.length && elem.some(l => l.value?.startsWith("Scanned or acquired in Tibetan areas of China by BDRC") )
                     if(!disable) return this.renderGenericProp(elem, k, tags, hasMaxDisplay) //div!=="ext-props"?hasMaxDisplay:-1)
                  }
               }
            }
         } ) 

      data = data.filter(e => e)

      //loggergen.log("data?",kZprop,data)

      let groups 
      if(div == "ext-props" && this.props.auth && this.props.auth.userProfile && (groups = this.props.auth.userProfile["https://auth.bdrc.io/groups"])) {         
         if(groups.includes("admin")) {
            if(this.props.resources && this.props.resources[this.props.IRI]) {                
               let logs = this.props.resources[this.props.IRI][bda+this.props.IRI.replace(/bdr:/,"")]
               if(logs && logs[adm+"logEntry"]) {
                  logs = logs[adm+"logEntry"]

                  let sortByTypeAndDate = (parts) => {
                     let assoR = this.props.assocResources, extData = [], sorted = []
                     if (assoR) {
                        for(let p of parts) {
                           let le = assoR[p.value]
                           if(le) {
                              //loggergen.log("le?",le)
                              let ty = le.filter(t => t.fromKey == rdf+"type")
                              if(ty.length) ty = ty[0].value
                              else ty = null
                              let da = le.filter(t => t.datatype == xsd+"dateTime")
                              if(da.length) da = da[0].value
                              else da = null
                              extData.push({...p, ty, da})                        
                           }
                        }
                        //loggergen.log("le:",extData) 
                        return _.orderBy(extData, ["ty","da"], ["asc","asc"])
                     }
                     return parts
                  }

                  logs = sortByTypeAndDate(logs);
                  
                  let tags = this.format("h4",adm+"logEntry","",false,"sub",logs)
                  logs = this.renderGenericProp(logs, adm+"logEntry", tags, -1)                   

                  if(this.state.collapse["commit"]) data.push(logs)
                  else if(logs /*&& logs.length*/ ) data.push(<div></div>)

                  //loggergen.log("logs:",logs, data)
                  
                  if(logs /*&& logs.length*/) {
                     data.unshift(
                        <a class="" onClick={() => this.setState({collapse:{...this.state.collapse, commit:!this.state.collapse["commit"]}})}>
                           {I18n.t(this.state.collapse["commit"]?"resource.commitH":"resource.commitV")}
                        </a>
                     )
                  }

               }
            }
         }
      }

      //loggergen.log("data:",data)      

      const html = <div className={div!=="header"?"data "+div:div} {...hash?{id:hash}:{}}>
         {prepend}
         {data}
         {/* // TODO not working anymore
         { this.renderRoles() } 
         */}
         { this.renderPostData() }       
         {append}    
      </div>

      if(data && data.length || append?.length || prepend?.length) { 
         if(returnLen) return ({ html, nbChildren: data?.length + prepend?.length + append?.length })
         else return html
      }
      
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

   renderHeader = (kZprop, T, etextUT, root) => {

      let imageLabel = "images"
      if(!this.props.collecManif && this.props.imageAsset && this.props.imageAsset.match(/[/]collection[/]/)) imageLabel = "collection"


      let src //= <div class="src"><img src="/logo.svg"/></div> 
      let legal = this.getResourceElem(adm+(T=="Images"?"contentLegal":"metadataLegal")), legalD, sameLegalD
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
            const img = provImg[prov.toLowerCase()]
            if(orig) 
               src = <div class={"src orig "+(!img?prov:"")} onClick={(e) => this.setState({...this.state,anchorPermaSame:e.currentTarget, collapse: {...this.state.collapse, ["permaSame-permalink"]:!this.state.collapse["permaSame-permalink"] } } ) }>
                  {img && <img src={img}/>}
               </div> 
            else  
               src = <div class={"src "+(!img?prov:"")}>
                  {img && <img src={img}/>}
               </div> 

         }
      }
      let etext = this.isEtext()

      let iiifThumb = this.getResourceElem(tmp+"thumbnailIIIFService")
      if(!iiifThumb || !iiifThumb.length) iiifThumb = this.getResourceElem(tmp+"thumbnailIIIFSelected")
      if(iiifThumb && iiifThumb.length) iiifThumb = iiifThumb[0].value

      let handleViewer = (ev) => {
         if(ev.type === 'click') {
            
            loggergen.log("hv:",this.props.useDLD)

            if(this.props.useDLD) { 

               let nbVol =  this.getResourceElem(bdo+"numberOfVolumes")
               if(nbVol) nbVol = nbVol.map(v => v.value)
               let rid = this.props.IRI.replace(/^bdr:/,"")

               if(window.DLD && window.DLD[rid]) {
                  window.top.postMessage(JSON.stringify({"open-viewer":{nbVol:""+nbVol,rid}}),"*")        
                  ev.preventDefault();
                  ev.stopPropagation();
                  return false ;
               } else {                  
                  const go = window.confirm(I18n.t("misc.DLD"))
                  if(!go)  {
                     ev.preventDefault();
                     ev.stopPropagation();
                     return false ;
                  }
               }
            } 
            
            let location = { ...this.props.location, hash:"open-viewer" }
            this.props.navigate(location)
            //this.showMirador(null,null,true)
            ev.preventDefault();
            ev.stopPropagation();
            return false ;
         }
      }


      let viewUrl = { ...this.props.location }
      viewUrl.pathname = viewUrl.pathname.replace(/\/show\//,"/view/")
      viewUrl.search = "" 
      // DONE do we really need this now? no we don't
      //if(this.props.langPreset) viewUrl.search = "?lang="+this.props.langPreset.join(",")

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
      

      let rootWarn
      if(T === "Instance" && root?.length) {

         let loca = this.getResourceElem(bdo+"contentLocation")
         if(loca?.length) loca = this.getResourceBNode(loca[0].value)
         if(root?.length && loca && loca[bdo+"contentLocationVolume"] && !loca[bdo+"contentLocationPage"]) {
            let ptype = this.getResourceElem(bdo+"partType")
            loggergen.log("root:",root,loca,ptype)
            if(ptype?.length && ![bdr+"PartTypeVolume",bdr+"PartTypeSection"].includes(ptype[0].value)) {
               rootWarn =  <Tooltip placement="top-end" title={
                  <div style={{margin:"10px"}}><Trans i18nKey="location.tooltip" components={{ newL: <br /> }} /></div>
               }><div class="outline-warn"><WarnIcon/></div></Tooltip>
            } 
         }
      }

      if(!this.state.imageError && iiifThumb && T === "Images") 
         return  ( 
            <div class="data simple" id="first-image">
               { /*(prov && prov !== "BDRC" && orig) &&*/ src }
               <a onClick={handleViewer} onContextMenu={handleViewer}  href={viewUrl.pathname+viewUrl.search} target="_blank" className={"firstImage "+(this.state.imageLoaded?"loaded":"")} 
               /*{...(this.props.config.hideViewers?{"onClick":() => this.showMirador(null,null,true),"style":{cursor:"pointer"}}:{})}*/ >
                  <Loader className="uvLoader" loaded={this.state.imageLoaded} color="#fff"/>
                  <img onError={(e)=>this.setState({...this.state,imageError:"!"})} onLoad={(e)=>this.setState({...this.state,imageLoaded:true,imageError:false})} src={iiifThumb+"/full/!1000,500/0/default.jpg"} /> 
               </a>
               { rootWarn }
            </div>
         )
      else if(this.state.imageError === "!" && iiifThumb && T === "Images") 
         return  ( 
            <div class="data simple" id="first-image">
               { /*(prov && prov !== "BDRC" && orig) &&*/  src }
               <a onClick={handleViewer} onContextMenu={handleViewer}  href={viewUrl.pathname+viewUrl.search} target="_blank" className={"firstImage "+(this.state.imageLoaded?"loaded":"")} 
               /*{...(this.props.config.hideViewers?{"onClick":() => this.showMirador(null,null,true),"style":{cursor:"pointer"}}:{})}*/ >
                  <Loader className="uvLoader" loaded={this.state.imageLoaded} color="#fff"/>
                  <img onError={(e)=>this.setState({...this.state,imageError:true})} onLoad={(e)=>this.setState({...this.state,imageLoaded:true})} src={iiifThumb+"/full/,500/0/default.jpg"} />                   
               </a>
               { rootWarn }
            </div>
         )
      else if(!this.props.manifestError && this.props.imageAsset && !etext && T === "Images")
         return  ( 
         <div class="data" id="first-image">
            { /*(prov && prov !== "BDRC" && orig) &&*/  src }
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
            { rootWarn }
         </div>
         )
      else if(!this.props.preview && kZprop.length && (!this.props.config || !this.props.config.chineseMirror))
         return <div class="data" id="map">{this.renderData(false, kZprop,null,null,null,"header")}</div>
      else if(etext && !(prov !== "BDRC" && prov && orig)) {
         let loca = this.props.location
         let view = loca.pathname+loca.search+"#open-viewer"
         if(etextUT) view = etextUT+"#open-viewer"
         return <div class="data" id="head"><Link title='View Etext' to={view}><div class={"header "+(!this.state.ready?"loading":"")}>{ !this.state.ready && <Loader loaded={false} /> }{src}{copyRicon}</div></Link></div>
      }
      else 
         return <div class="data" id="head"><div class={"header "+(!this.state.ready?"loading":"")}>{ !this.state.ready && <Loader loaded={false} /> }{src}{copyRicon}</div></div>   
   }
   

   // TODO case of part of instance after p.20 (see bdr:MW1KG2733_65CFB8)

   renderNoAccess = (fairUse) => {
      
      if ( this.props.manifestError && [404, 444].includes(this.props.manifestError.error.code)) return this.renderAccess()

      if(fairUse) { // && (!this.props.auth || this.props.auth && !this.props.auth.isAuthenticated()) ) { 

         let fairTxt, hasIA, elem = this.getResourceElem(bdo+"digitalLendingPossible");
         if(this.props.config && !this.props.config.chineseMirror) {
            //loggergen.log("elemIA:",elem)
            if(!elem || elem.length && elem[0].value == "true" ) { 
               hasIA = true
            }
         }

         if(!hasIA) {
            fairTxt = <><Trans i18nKey="access.fairuse1" components={{ bold: <u /> }} /> { I18n.t("access.fairuse2")} <a href="mailto:help@bdrc.io">help@bdrc.io</a> { I18n.t("access.fairuse3")}</>
         } else {         
            let loca = this.getResourceElem(bdo+"contentLocation")
            if(loca?.length) loca = this.getResourceBNode(loca[0].value)
            let IAlink = this.getIAlink(loca, bdo)

            fairTxt = <>
               <Trans i18nKey="access.fairUseIA4" components={{ bold: <u /> }} />
               <br/><br/>
               <span class="fairuse-IA-link-new">
                  {/* <img class="ia" src="/IA.svg"/> */}
                  {<Trans i18nKey="access.fairUseIA3" components={{ icon:<img class="link-out" src="/icons/link-out_fit.svg"/>, lk:<a target="_blank"  href={IAlink} /> }} />}
                  {/* <img class="link-out" src="/icons/link-out_fit.svg"/> */}
               </span>
            </>
         }

         return <div class= {"data access "+(hasIA?" hasIA newIA":" fairuse")}>
                  <h3>
                     <span style={{textTransform:"none"}}>
                     {/* {I18n.t("access.limited20")}<br/> */}
                     {fairTxt}
                     { /*this.props.locale !== "bo" && [ I18n.t("misc.please"), " ", <a class="login" onClick={this.props.auth.login.bind(this,this.props.location)}>{I18n.t("topbar.login")}</a>, " ", I18n.t("access.credentials") ] }
                     { this.props.locale === "bo" && [ I18n.t("access.credentials"), " ", <a class="login" onClick={this.props.auth.login.bind(this,this.props.location)}>{I18n.t("topbar.login")}</a> ] */ }
                   </span>
                  </h3>
               </div>
      }
      else{
         return this.renderAccess()
      }
   }

   renderQuality = () => {
      let elem = this.getResourceElem(bdo+"qualityGrade");
      //loggergen.log("QG:",elem)
      if(elem && elem.length) elem = elem[0].value ;
      if(elem === "0") {
         return <div class="data access"><h3><span style={{textTransform:"none"}}>{I18n.t("access.quality0")}</span></h3></div>
      }
   }

   renderOCR = (extra) => {
      // #817
      let elem = this.getResourceElem(bdo+"OPFOCRWordMedianConfidenceIndex")
      if(!elem?.length) elem = this.getResourceElem(bdo+"OPFOCRWordMedianConfidenceIndex", this.props.IRI, this.props.assocResources)
      /*
      let elem = this.getResourceElem(bdo+"contentMethod");            
      if(elem && elem.length) elem = elem[0].value ;
      if(elem === bdr+"ContentMethod_OCR") {
      */

      //loggergen.log("OCR:",elem)

      if(elem?.length) {
         return <div class="data access"><h3><span style={{textTransform:"none"}}>{extra ?? I18n.t("access.OCR")}</span></h3></div>
      }
   }

   renderEtextAccess = (error) => {
      if(error) {
         return <div class="data access"><h3><span style={{textTransform:"none"}}><Trans i18nKey="access.fairuseEtext" components={{ bold: <u /> }} /></span></h3></div>
      }
   }

   // DONE check if this is actually used (it is)
   renderAccess = () => {


      let elem = this.getResourceElem(adm+"access");
      if(elem && elem.length) elem = elem[0].value ;

      if ( this.props.manifestError && [404, 444].includes(this.props.manifestError.error.code))
         return  <div class="data access notyet"><h3><span style={{textTransform:"none"}}>{I18n.t(this.props.outline?"access.not":"access.notyet")}</span></h3></div>
      else if ( this.props.manifestError && (!this.props.auth || this.props.auth && (this.props.manifestError.error.code === 401 || this.props.manifestError.error.code === 403) )) 
         if(elem && elem.includes("RestrictedSealed"))
            return  <div class="data access sealed"><h3><span style={{textTransform:"none"}}><Trans i18nKey="access.sealed" components={{ bold: <u /> }} /> <a href="mailto:help@bdrc.io">help@bdrc.io</a>{I18n.t("punc.point")}</span></h3></div>
         else 
            //return  <div class="data access"><h3><span style={{textTransform:"none"}}>{I18n.t("misc.please")} <a class="login" {...(this.props.auth?{onClick:this.props.auth.login.bind(this,this.props.location)}:{})}>{I18n.t("topbar.login")}</a> {I18n.t("access.credentials")}</span></h3></div>
            return  <div class="data access generic"><h3><span style={{textTransform:"none"}}><Trans i18nKey="access.generic" components={{ policies: <a /> }} /></span></h3></div>
            
      else if ( this.props.manifestError && this.props.manifestError.error.code === 500 && this.props.IRI && !this.props.IRI.match(/^bdr:(IE|UT|V)/))
         return  <div class="data access error"><h3><span style={{textTransform:"none"}}>{I18n.t("access.error")}</span></h3></div>
      
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

   callMonlam = (data = this.state.monlam) => {

      const collapse = { ...this.state.collapse, monlamPopup: true  }
      for(const k of Object.keys(collapse)) {
         if(k.startsWith("monlam-def-")) delete collapse[k]
      }
      this.setState({ collapse })
      this.props.onCallMonlamAPI(data.api, {value: data.range.toString(), lang: (this.props.etextLang || ["bo"]).filter(l => l.startsWith("bo"))[0]});
      
   }

   // to be redefined in subclass
   renderPostData = () => {}

   renderEtextLink = (etextRes) => {
      let base = etextRes
      let back = this.props.location?.pathname?.split("/")?.[2]

      if(this.props.disableInfiniteScroll?.outETscope) {
         let coords = this.props.disableInfiniteScroll
         base = base + "?scope="+coords.outETscope
                     + "&openEtext="+shortUri(coords.outETvol?.[0]?.value ?? "")
                     + "&startChar="+coords.outETstart?.[0]?.value
                     + (back?"&back="+encodeURIComponent(back):"")
         
      }
      return "/show/"  + base
   }

   renderEtextDLlink = (accessError, noIcon = false) => { 
      let ldspdi = this.props.config.ldspdi, base 
      if(ldspdi) base = ldspdi.endpoints[ldspdi.index]
      let url = "", id = this.props.that?.state?.scope ?? this.props.disableInfiniteScroll?.outETscope ?? this.props.IRI
      if(id) { 
         if(base.includes("-dev")) url = base + "/resource/" + id.split(":")[1] +".txt"
         else url = fullUri(id).replace(/^http:/,"https:")+".txt"
         url = url.replace(/^\/\//,"https://")
      }
      return (
         <a id="DL" class={!accessError?"on":""} onClick={(e) => this.setState({...this.state,anchorLangDL:e.currentTarget, collapse: {...this.state.collapse, langDL:!this.state.collapse.langDL } } ) }>
            {etext_lang_selec(this,true,<>
                  {I18n.t("mirador.downloadE")}
                  {!noIcon && <img src="/icons/DLw.png"/>}
               </>, url)}
            </a>
      )
   }

   renderEtextNav = (accessError) => {
    
      let etextSize = (inc:boolean=true) => {
         let size = this.state.etextSize ;
         if(!size) size = 1.0
         if(inc) size += 0.1
         else size -= 0.1
         this.setState({ etextSize: size })
         if(this.state.monlam) setTimeout( () => {
            this.setState({ 
               monlam: { ...this.state.monlam, ...this.state.monlam.updateHilightCoords() },
               collapse:{ ...this.state.collapse, monlamPopupMove: true } 
            } )         
            setTimeout( () => this.setState({ collapse:{ ...this.state.collapse, monlamPopupMove: false } } ), 10)
         }, 10)
      }

      let size = this.state.etextSize

      let showToggleScan = this.getResourceElem(bdo+"eTextVolumeForImageGroup") //(_tmp+"etextIsPaginated")
      if(showToggleScan?.length) showToggleScan = true
      else showToggleScan = false

      /*
      // DONE remove "show images" when not needed
      if(!showToggleScan?.length) {
         const inst = this.getResourceElem(bdo+"eTextInInstance") ?? this.getResourceElem(bdo+"volumeOf")          
         if(inst?.length) showToggleScan = this.getResourceElem(_tmp+"etextIsPaginated", shortUri(inst[0].value), this.props.assocResources)
      }
         if(showToggleScan?.length && showToggleScan[0].value == "true" ) showToggleScan = true // (bdo+"eTextHasPage")
         else showToggleScan = false

         //if(showToggleScan && showToggleScan.length && !this.unpaginated()) showToggleScan = (showToggleScan[0].seq !== undefined)
         //else showToggleScan = false
      */



      let monlamPop
      if(this.state.monlam?.popupCoords) {
         monlamPop = <Popover
               className="monlamPopup"
               open={this.state.collapse.monlamPopup != true && this.state.enableDicoSearch && !this.state.collapse.monlamPopupMove}
               anchorReference="anchorPosition"
               anchorPosition={{ top:-50+this.state.monlam.popupCoords[0]?.top, left:this.state.monlam.popupCoords[0]?.left }}
               onClose={() => { 
                  this.setState({noHilight:false, monlam:null, collapse:{ ...this.state.collapse, monlamPopup: true }})
                  this.props.onCloseMonlam()
               }}
            >
               <MenuItem onClick={(ev) => {

                  this.callMonlam()

                  if(!this.props.monlamResults) {
                     setTimeout( () => {
                        const { ref, hilight } = this.state.monlam.updateHilightCoords()
                        this.setState({ 
                           monlam: { ...this.state.monlam, ref, hilight },
                           ...this.state.ETSBresults ? { collapse: { ...this.state.collapse, ETSBresults: true }}:{}
                        })
                        setTimeout(() => {
                           if(ref?.current && window.innerWidth > 800) ref.current.scrollIntoView(({behavior:"smooth",block:"nearest",inline:"start"}))
                        }, 10)

                     }, 10)
                  }

               }}><img class="ico" src="/icons/monlam.png"/>{I18n.t("viewer.find")}</MenuItem>
            </Popover>
      }

      const inst = this.getResourceElem(bdo+"eTextInInstance") ?? this.getResourceElem(bdo+"volumeOf") 
      let repro = this.getResourceElem(bdo+"instanceReproductionOf")
      if(!repro?.length && inst?.length) repro = this.getResourceElem(bdo+"instanceReproductionOf", shortUri(inst[0].value), this.props.assocResources)

      if(repro?.length) {
         const mwUri = shortUri(repro[0].value)
         if(this.props.resources && !this.props.resources[mwUri]) this.props.onGetResource(mwUri);
      }

            
      let label = [{ value: this.props.that?.state?.scope, lang:"" }], back = "", t,
         labelSticky = [{ value: shortUri(inst?.[0]?.value ?? ""), lang:"" }]
      
      const refs = this.props.that?.props?.eTextRefs?.["@graph"]?.filter(n => n["@id"] === label[0].value)
      let ETtype = refs?.[0]?.type
      if(Array.isArray(ETtype)) {
         const possibleET = { 
            "EtextInstance": "etext_instance",
            "EtextVolume": "etext_vol",
            "Etext":"id"
         } 
         ETtype = ETtype.find(t => possibleET[t])
      }

      if(repro?.length) { 
         back = repro.filter(r => (t=(this.getResourceElem(rdf+"type", shortUri(r.value), this.props.assocResources) ?? [])).some(s => s.value === bdo+"Instance") && !t.some(s => s.value === bdo+"ImageInstance" )  )
         if(back?.length) back = "/show/"+shortUri(back[0].value)
         labelSticky = repro.map(r => this.getResourceElem(skos+"prefLabel", shortUri(r.value), this.props.assocResources) ?? []).flatten() 
         if(inst[0].value.endsWith(this.props.that?.state?.scope?.split(":")[1])) {
            label = labelSticky
         } else {            
            label = refs?.[0]?.["skos:prefLabel"] ?? label
         }
      }

      let get = qs.parse(this.props.location.search)          
      if(get.s) back = decodeURIComponent(get.s)
      else if(get.back) back = "/show/" + decodeURIComponent(get.back)
      
      label = getLangLabel(this, skos+"prefLabel", label) ?? {}    
      labelSticky = getLangLabel(this, skos+"prefLabel", labelSticky) ?? {}    
      
      if(label.value?.startsWith("bdr:")) {
         if(refs?.[0]?.eTextInVolume) {
            const volN = this.props.that?.props?.eTextRefs?.["@graph"]?.filter(n => n["@id"] === refs?.[0]?.eTextInVolume)?.[0].volumeNumber
            label.value = I18n.t("types.volume_num_noid",{num:volN})
            label.lang = this.props.locale
         }

      }

      //console.log("rEtN:",this.props.that?.state?.scope,this.props,this.props.resources[this.props.IRI], repro, this.props.assocResources, label, back)
            
      document.title = label.value + " - " + (this.props.config?.khmerServer?"Khmer Manuscript Heritage Project":"Buddhist Digital Archives")

      const title =({value: text, lang}) => <h2 title={text} lang={lang} class="on">
         <span class="newT etext">
            <span class="space-fix">
               <span>{ETtype ? I18n.t("types.ET."+ETtype) : I18n.t("types.etext")}</span>
            </span>
         </span>
         <span><span class="placeType">{text}</span></span>
      </h2>
   
      const header = (l) => <div>
         <span>
            <Link className="urilink" to={back} onClick={(e) => {
               this.props.onLoading("etext", true)
               setTimeout(() => {
                  this.props.navigate(back)                  
               }, 10)
               e.preventDefault()
               e.stopPropagation()
               return false
            }} ><ChevronLeft />{I18n.t("resource.goB")}</Link>
            {title(l)}
         </span>
      </div>

      return (!this.props.disableInfiniteScroll && <>
         { monlamPop }
         <div id="settings" onClick={() => this.setState({collapse:{...this.state.collapse, etextNav:!this.state.collapse.etextNav}})}><img src="/icons/settings.svg"/></div>
          {/* <GenericSwipeable onSwipedRight={() => this.setState({ collapse:{ ...this.state.collapse, etextNav:!this.state.collapse.etextNav }})}> */}
         <div class="etext-header">
            {header(label)}
         </div>
         <StickyElement className="etext-nav-parent">
            <div class="etext-header sticky">
               {header(label /*Sticky*/)}
            </div>
            <div id="etext-nav" class={this.state.collapse.etextNav?"on":""}>
               <div>
                  { this.renderEtextDLlink(accessError) }
                  {/* // <a id="DL" class={!accessError?"on":""} target="_blank" rel="alternate" type="text" download href={this.props.IRI?fullUri(this.props.IRI).replace(/^http:/,"https:")+".txt":""}>{I18n.t("mirador.downloadE")}<img src="/icons/DLw.png"/></a>) */}
                  { this.props.config.useMonlam && this.state.etextHasBo && <a id="dico" class="on" onClick={(e) => { 
                     if(this.state.enableDicoSearch) this.props.onCloseMonlam()
                     this.setState({noHilight:false, enableDicoSearch:!this.state.enableDicoSearch, ...this.state.enableDicoSearch?{monlam:null}:{}})
                  }}>
                     {/* <div class="new">{I18n.t("viewer.new")}</div> */}
                     {this.state.enableDicoSearch?<img id="check" src="/icons/check.svg"/>:<span id="check"></span>}{I18n.t("viewer.monlam")}<span><img class="ico" src="/icons/monlam.png"/></span></a> }
                  <div id="control">
                     <span title={I18n.t("mirador.decreaseFont")} class={!size||size > 0.6?"on":""} onClick={(e)=>etextSize(false)}><img src="/icons/Zm.svg"/></span>
                     <span title={I18n.t("mirador.increaseFont")} class={!size||size < 2.4?"on":""} onClick={(e)=>etextSize(true)}><img src="/icons/Zp.svg"/></span>
                     {etext_lang_selec(this,true)}
                  </div>
                  <a class={showToggleScan?"on":""} onClick={(e) => this.setState({showEtextImages:!this.state.showEtextImages})}>{this.state.showEtextImages?<img id="check" src="/icons/check.svg"/>:<span id="check"></span>}{I18n.t("mirador.showI")}<img width="42" src="/icons/search/images_b.svg"/></a>
                  <EtextSearchBox that={this} scopeId={this.props?.that?.state?.scope} ETrefs={this.props.that?.props.eTextRefs?.["@graph"]}/>
                  <span class="X" onClick={() => this.setState({ collapse:{ ...this.state.collapse, etextNav:!this.state.collapse.etextNav }})}></span>
               </div>
            </div>
         </StickyElement>
         {/* </GenericSwipeable>  */}
      </>)
   }


   renderEtextRefs(access = true, useRoot = this.props.IRI) {

      let openText = (e, redirect, id) => {
         let ETres = id ?? e.link.replace(/^.*openEtext=([^#&]+)[#&].*$/,"$1")
         this.props.onLoading("etext", true)
         setTimeout(() => this.props.onReinitEtext(ETres), 150)                        
         this.setState({ currentText: ETres, scope:e.scope ?? e["@id"] })
         if(redirect) this.props.navigate((!e.link.startsWith("/show/")?"/show/":"")+e.link)
         
      }

      let toggle = (e,r,i,x = "",force,el) => {                 

         console.log("el:",el,e,r,i,x,force,this.props.eTextRefs,this.state.scope)

         let tag = "etextrefs-"+r+"-"+i+(x?"-"+x:"")
         let val = this.state.collapse[tag];         

         //loggergen.log("tog:",e,force,val,tag,JSON.stringify(this.state.collapse),this.state.collapse[tag]);
         
         if(x.endsWith("details")) {
            if((r === i || force) && val === undefined ) val = true ;
            this.setState( { collapse:{...this.state.collapse, [tag]:!val }})                     
         } else {            
            if(this.state.scope === i) { 
               if(val === undefined) val = true
               val = !val
            }
            else val = true
            let firstVol = null
            if(i == r) {
               firstVol = this.props.eTextRefs?.["@graph"]?.filter(n => n["@id"] === r)
               if(firstVol?.[0]?.instanceHasVolume) {
                  firstVol = firstVol?.[0]?.instanceHasVolume
                  if(!Array.isArray(firstVol)) firstVol = [ firstVol ]
                  firstVol = this.props.eTextRefs?.["@graph"]?.filter(n => firstVol.includes(n["@id"]) )
                  firstVol = _.orderBy(firstVol, ["volumeNumber","sliceStartChar"])
                  firstVol = firstVol[0]["@id"]
                  //console.log("fV:",firstVol)
               } else {
                  firstVol = null
               }
            }
            this.setState( { scope:i, ...(val != this.state.collapse[tag] ? { collapse: { ...this.state.collapse, [tag]:val }}:{}) })         
            if(i != r) { 
               if(this.state.scope != i) openText(el, true)
            } else {
               openText({ link:"/show/"+r, "@id":r }, true, firstVol)               
            }

         }
      }
      
      let title = this.state.title.instance
      if(title?.length) title = title[0].value
      else { 
         title = this.state.title.work
         if(title?.length) title = title[0].value
      }
      if(title?.length) title = this.getResourceElem(skos+"prefLabel", title, this.props.assocResources)
      if(title?.length) title = getLangLabel(this,_tmp+"withEtextPrefLang",title)
      if(title?.value) title = <h2><a><span>{title.value}</span></a></h2>

      // TODO fix for UTxyz
      let root = useRoot 


      const parts = {
         "bdo:EtextVolume":"vol",
         "bdo:VolumeEtextAsset":"vol",
         "bdo:EtextRef":"txt",
         "bdo:Etext":"txt",
         "?":"unk",
      }

      let get = qs.parse(this.props.location.search,{decode:false})
      const back = (get.s ? "s="+get.s+"&" : "") + (get.back ? "back="+get.back+"&" : "")

      let makeNodes = (top,parent) => {               
         let elem = this.props.eTextRefs["@graph"]
         let node = []
         if(elem) node = elem.filter(e => e["@id"] === top) 
         let etextrefs = []
         let loadETres

         loggergen.log("node:",this.props.IRI,this.props.eTextRefs,node,top)

         if(node.length && (node[0].instanceHasVolume || node[0].volumeHasEtext))
         {
            let children = node[0].instanceHasVolume
            if(!children) children = node[0].volumeHasEtext 
            if(children && !Array.isArray(children)) children = [ children ]
            
            //loggergen.log("chil:",children);

            for(let e of children) {
               //loggergen.log("e:",e);

               let w_idx = elem.filter(f => e["@id"] && f["@id"] === e["@id"] || f["@id"] === e) 
               if(w_idx.length) {
                  
                  //loggergen.log("found:",w_idx[0])  

                  let g = w_idx[0]
                  
                  if(g.details) { //} && (g.lang !== this.props.locale || g.rid === g["@id"] || g["@id"] === this.props.IRI)) { 
                     delete g.details ;
                     delete g.hidden ;
                  }

                  if(!g.details) {
                     g.rid = useRoot //this.props.IRI
                     g.lang = this.props.locale
                  }

                  let nav = []

                  /*
                  if(g.contentLocation) {
                     if(!g.details) g.details = []
                     g.hasImg = "/show/"+g["@id"].replace(/^((bdr:MW[^_]+)_[^_]+)$/,"$1")+"?s="+encodeURIComponent(this.props.location.pathname+this.props.location.search)+"#open-viewer"
                     nav.push(<Link to={g.hasImg} class="ulink">{I18n.t("copyright.view")}</Link>)
                  }
                  else if (g.instanceHasReproduction) {
                     if(!g.details) g.details = []
                     g.hasImg = "/show/"+g.instanceHasReproduction+"?s="+encodeURIComponent(this.props.location.pathname+this.props.location.search)+"#open-viewer"
                     nav.push(<Link to={g.hasImg} class="ulink">{I18n.t("copyright.view")}</Link>)  
                  }
                  */

                  const etextDL = (qname) => { 

                     let ldspdi = this.props.config.ldspdi, base 
                     if(ldspdi) base = ldspdi.endpoints[ldspdi.index]
                     let url = ""
                     if(qname) { 
                        if(base.includes("-dev")) url = base + "/resource/" + qname.split(":")[1] +".txt"
                        else url = fullUri(qname).replace(/^http:/,"https:")+".txt"
                        url = url.replace(/^\/\//,"https://")
                     }

                     return (
                        <a  {...!access?{disabled:true}:{}} onClick={(e) => this.setState({...this.state,anchorLangDL:e.currentTarget, collapse: {...this.state.collapse, langDL:!this.state.collapse.langDL } } ) } 
                           class="ulink" style={{cursor:"pointer"}}>
                              {etext_lang_selec(this,true,<>{I18n.t("mirador.downloadE")}</>,url)}
                        </a>
                     )
                  }


                  if(g.volumeNumber) { 
                     g.index = g.volumeNumber
                     g.link =  useRoot+"?"+back+"openEtext="+ g["@id"] + "#open-viewer"
                     if(g.volumeHasEtext) {
                        if(!Array.isArray(g.volumeHasEtext)) {
                           let txt = elem.filter(e => e["@id"] === g.volumeHasEtext)                           
                           const ETres = txt[0]?.["@id"] //txt[0]?.eTextResource || txt[0]?.etextResource["@id"]
                           if(ETres) {                                                            

                              g.link = useRoot+"?"+back+"openEtext="+ETres /*this.props.IRI*/ + "#open-viewer"
                              g.scope = ETres
                              
                              //nav.push(<Link to={"/show/"+txt[0].eTextResource} class="ulink">{I18n.t("resource.openR")}</Link>)
                              //nav.push(<span>|</span>)
                              nav.push(<Link  {...!access?{disabled:true}:{}} to={"/show/"+g.link} class="ulink" onClick={(ev) => {                                 
                                 this.props.onLoading("etext", true)
                                 this.props.onReinitEtext(ETres)
                                 this.setState({currentText: ETres, scope:ETres})
                              }}>{I18n.t("result.openE")}</Link>)
                              nav.push(<span>|</span>)
                              //nav.push(<a href={fullUri(txt[0].eTextResource).replace(/^http:/,"https:")+".txt"} class="ulink"  download type="text" target="_blank">{I18n.t("mirador.downloadE")}</a>)
                              nav.push(etextDL(ETres))

                           } else {
                              console.log("not ETres",g)
                           }
                        }
                        else {
                           g.hasPart = true
                           
                        }
                     }
                  } else if(g.seqNum && (g.eTextResource || g.etextResource && g.etextResource["@id"])) {
                     g.index = g.seqNum
                     const ETres = g.etextResource["@id"] ?? g.eTextResource  
                     g.link = useRoot+"?"+back+"openEtext="+ETres /*this.props.IRI*/ + "#open-viewer"
                              
         
                     //nav.push(<Link to={"/show/"+g.eTextResource} class="ulink">{I18n.t("resource.openR")}</Link>)
                     //nav.push(<span>|</span>)
                     nav.push(<Link {...!access?{disabled:true}:{}} to={"/show/"+g.link} class="ulink" onClick={(ev) => {                                                         
                        this.props.onLoading("etext", true)
                        this.props.onReinitEtext(ETres)                        
                        this.setState({currentText: ETres, scope:g["@id"]})
                     }}>{I18n.t("result.openE")}</Link>)
                     nav.push(<span>|</span>)
                     //nav.push(<a href={fullUri(g.eTextResource).replace(/^http:/,"https:")+".txt"} class="ulink" download type="text" target="_blank">{I18n.t("mirador.downloadE")}</a>)                     
                     nav.push(etextDL(ETres))

                  } else if(g.eTextInVolume){
                     g.index = g.seqNum

                     //loggergen.log("default link:", g)

                     const ETres = g.eTextInVolume
                     g.link = useRoot+"?"+back+"scope="+g["@id"]+"&openEtext="+ETres /*this.props.IRI*/ 
                     g.link += "&startChar="+(g.sliceStartChar ?? 0)
                     //if(g.sliceEndChar) g.link += "&endChar="+g.sliceEndChar
                     g.link += "#open-viewer"
                     
                     nav.push(<Link {...!access?{disabled:true}:{}} to={"/show/" + g.link} class="ulink" onClick={(ev) => {                                                         
                        this.props.onLoading("etext", true)
                        setTimeout(() => this.props.onReinitEtext(ETres), 150)                        
                        this.setState({ currentText: ETres, scope:g["@id"] })
                     }}>{I18n.t("result.openE")}</Link>)
                     nav.push(<span>|</span>)
                     //nav.push(<a href={fullUri(g.eTextResource).replace(/^http:/,"https:")+".txt"} class="ulink" download type="text" target="_blank">{I18n.t("mirador.downloadE")}</a>)                     
                     nav.push(etextDL(ETres))
         
                     
                  }else {
                     loggergen.log("no link:", g)

                  }


                  if(nav.length) { 
                     if(!g.details) g.details = []
                     let title ;
                     if(!access) title = I18n.t("access.fairuseEtext").replace(/<[^>]+>/g,"")
                     g.details.push(<div class="sub view" {...{title}}>{nav}</div>)
                  }

                  //else if(g.)

                  etextrefs.push(g)
               }
            }         
         }                   

         etextrefs = _.orderBy(etextrefs,["index"],["asc"])

         if(!this.state.currentText && etextrefs.length) {
            let g = etextrefs[0], tag = "etextrefs-"+root+"-"+g['@id']
            if(!loadETres) { 
               if(g.volumeNumber) { 
                  if(g.volumeHasEtext) {
                     if(!Array.isArray(g.volumeHasEtext)) {
                        let txt = elem.filter(e => e["@id"] === g.volumeHasEtext)                           
                        loadETres = txt[0]?.["@id"] //txt[0]?.eTextResource || txt[0]?.etextResource["@id"]
                     } else if(etextrefs.length === 1 && !this.state.collapse[tag]){
                        console.log("RETURN:", tag)
                        this.setState({collapse: { ...this.state.collapse, [tag]:true }})                     
                        return      
                     } else {
                        loadETres = g["@id"]
                     }
                  } else {
                     loadETres = g["@id"]
                  }
               } else if(g.seqNum && (g.eTextResource || g.etextResource && g.etextResource["@id"])) {
                  loadETres = g.eTextResource || g.etextResource["@id"]
               } else if(g.eTextInVolume){
                  loadETres = g.eTextInVolume
               }
            }
            if(loadETres && this.state.currentText != loadETres) {
               this.props.onLoading("etext", true)            
               this.props.onReinitEtext(loadETres)
               this.setState({currentText: loadETres})
               return
            }
         }

         etextrefs = etextrefs.map(e => {            

            let tag = "etextrefs-"+root+"-"+e['@id']
            let ret = []
            let pType = e["type"], fUri = fullUri(e["@id"])
            let gUri = fUri ;
            if(e.link) gUri = fullUri(e.link).replace(/^.*openEtext=([^#]+)#.*$/,"$1")
            if(pType && pType["@id"]) pType = pType["@id"]
            else pType = "bdo:"+pType
            let tLabel 
            //loggergen.log("e:",e,tag,pType,parts);
            if(pType) {
               if(Array.isArray(pType)) pType = pType[0]
               tLabel = getOntoLabel(this.props.dictionary,this.props.locale,fullUri(pType))
               tLabel = tLabel[0].toUpperCase() + tLabel.slice(1)
               // TODO use translation from ontology
            }
            
            // #821 open etext node in outline after closing reader
            let ut = null, ref = {}
            //loggergen.log("tag:",tag,e,get)
            if(get.fromText) { 
               if(e.volumeHasEtext) {
                  let t = e.volumeHasEtext
                  if(!Array.isArray(t)) t = [t]
                  ut = elem.filter(f => t.includes(f["@id"]))
                  if(ut.length) { 
                     ut = ut.filter(u => u.eTextResource == get.fromText || u.etextResource && u.etextResource["@id"] == get.fromText ) 
                     //loggergen.log("ut:",ut)
                     if(ut.length) ut = true
                     else ut = false
                  }
                  else ut = null
               } else if(e.eTextResource == get.fromText || e.etextResource && e.etextResource["@id"] == get.fromText ) {
                  ut = true
               } 

               if(ut) {
                  this._refs["fromText"] = React.createRef()
                  ref = { ref: this._refs["fromText"] }
               }                  

            } else {
               if(this._refs["fromText"] && this._refs["fromText"].current) this._refs["fromText"].current = null
            }          

            let isCurrent = e.link?.includes("openEtext="+this.state.scope + "#") || e["@id"] === this.state.scope  // e.link?.includes("openEtext="+this.state.currentText + "#") //e.link.endsWith(this.state.currentText)            
            
            let open = this.state.collapse[tag] || this.state.collapse[tag]  === undefined && ut // #821
                        || e.link?.includes("openEtext="+this.state.currentText + "#") && this.state.scope != root && this.state.collapse[tag] != false
                        || e.link.endsWith(this.state.currentText)  && this.state.scope != root && this.state.collapse[tag] != false
            let mono = false // etextrefs.length === 1
            let openD = this.state.collapse[tag+"-details"] // || this.state.collapse[tag+"-details"]  === undefined && (mono || ut) // #821          
                        //|| isCurrent                 
                        //|| e.link?.includes("openEtext="+this.state.currentText + "#") && this.state.collapse[tag+"-details"] != false
            
            let terminal = e.type === "Etext" || !Array.isArray(e.volumeHasEtext) ||  e.volumeHasEtext.length === 1

            /*
            if(e.link?.includes("openEtext="+this.state.currentText + "&")) {
               let nextP = this.getResourceElem(bdo+"eTextHasPage", this.state.currentText)?.[0]?.start 
               //console.log("nxp:",nextP)
               if(nextP != undefined) isCurrent = isCurrent || e.link?.includes("openEtext="+this.state.currentText + "&") && nextP >= e.sliceStartChar && nextP < e.sliceEndChar
            }
            */

            ret.push(<span {...ref} class={'top' + (/*this.state.collapse[tag]*/ isCurrent?" on":"") }>
                  {(e.hasPart && !open) && <img src="/icons/triangle.png" onClick={(ev) => toggle(null,root,e["@id"],!e.hasPart?"details":"",!e.hasPart && mono, e)} className="xpd right"/>}
                  {(e.hasPart && open) && <img src="/icons/triangle_.png" onClick={(ev) => toggle(null,root,e["@id"],!e.hasPart?"details":"",!e.hasPart && mono, e)} className="xpd"/>}
                  <span class={"parTy "+(/*e.details*/isCurrent?"on":"") } {...e.details?{title: I18n.t("resource."+(openD?"hideD":"showD")), onClick:(ev) => toggle(ev,root,e["@id"],"details",!e.hasPart && mono,e) /*openText()*/ }:{title:tLabel}} >
                     {pType && parts[pType] ? <div>{parts[pType]}</div> : <div>{parts["?"]}</div> }
                  </span>
                  <span>{this.uriformat(_tmp+"withEtextPrefLang",{type:'uri', value:gUri, volume:fUri, data:e, inOutline: (!e.hasPart?tag+"-details":tag), /*url:"/show/"+e.link,*/ debug:false, noid:true, toggle:(ev) => toggle(null,root,e["@id"],/*!e.hasPart?"details":*/"",!e.hasPart && (mono || ut), e)  })}</span>
                  <div class="abs">                  
                     { !e.hasPart && (
                           access 
                           ?  <Link className="hasImg hasTxt" title={I18n.t("result.openE")}  to={"/show/"+e.link} onClick={(ev) => openText(e) /*{                                                         
                              const ETres = e.link.replace(/^.*openEtext=([^#]+)#.*$/, "$1")
                              this.props.onLoading("etext", true)
                              this.props.onReinitEtext(ETres)
                              this.setState({currentText: ETres})
                           }*/}>
                                 <img src="/icons/search/etext.svg"/><img src="/icons/search/etext_r.svg"/>
                              </Link> 
                           :  <a disabled="true" className="hasImg hasTxt" title={I18n.t("access.fairuseEtext").replace(/<[^>]+>/g,"")}>
                                 <img src="/icons/search/etext.svg"/><img src="/icons/search/etext.svg"/>
                              </a> 
                     )}                   
                     { e.details && <span id="anchor" title={I18n.t("resource."+(openD?"hideD":"showD"))} onClick={(ev) => toggle(ev,root,e["@id"],"details",!e.hasPart && (mono || ut), e)}>
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
            if(e.hasPart && open) ret.push(<div style={{paddingLeft:"26px"}}>{makeNodes(e["@id"],top)}</div>)
            return ret
         })

         return etextrefs
      }

      let etextRefs = makeNodes(root,root)

      let isCurrent = this.state.scope == this.props.IRI
      let colT = <span class={"parTy " + (isCurrent?"on":"")} title={I18n.t("types.etext")}><div>TXT</div></span>
      if(!this.props.eTextRefs.mono) colT = <span class={"parTy "} title={I18n.t("Lsidebar.collection.title")}><div>COL</div></span>
      let open = this.state.collapse["etextrefs-"+root+"-"+root] === undefined || this.state.collapse["etextrefs-"+root+"-"+root];

            
            // <h2>{I18n.t("home.search")}</h2>
            // <div class="search on">
            //    <div>
            //       <input type="text" placeholder={I18n.t("resource.searchE")} value={this.state.outlineKW} onChange={this.changeOutlineKW.bind(this)} onKeyPress={ (e) => { 
            //          if(e.key === 'Enter' && this.state.outlineKW) { 
            //             if(this.state.dataSource&&this.state.dataSource.length) { 
            //                let param = this.state.dataSource[0].split("@")
            //                let loca = { pathname:"/search", search:"?q="+keywordtolucenequery(param[0])+"&lg="+param[1]+"&r="+this.props.IRI+"&t=Etext" }
            //                this.props.navigate(loca)
            //             }
            //             else this.changeOutlineKW(null,this.state.outlineKW)
            //          }
            //       }} />
            //       <span class="button" /*onClick={outlineSearch}*/  title={I18n.t("resource.start")}></span>
            //       { (this.state.outlineKW || this.props.outlineKW) && <span class="button" title={I18n.t("resource.reset")} onClick={(e) => { 
            //          this.setState({outlineKW:"",dataSource:[]})
            //          if(this.props.outlineKW) {
            //             this.props.onResetOutlineKW()
            //             let loca = { ...this.props.location }
            //             if(!loca.search) loca.search = ""
            //             loca.search = loca.search.replace(/(&osearch|osearch)=[^&]+/, "").replace(/[?]&/,"?")
            //             this.props.navigate(loca)
            //          }
            //       }}><Close/></span> }                  
            //       { (this.state.outlineKW && this.state.dataSource && this.state.dataSource.length > 0) &&   
            //          <div><Paper id="suggestions">
            //          { this.state.dataSource.map( (v,i) =>  {
            //                let tab = v.split("@")
            //                return (
            //                   <MenuItem key={v} style={{lineHeight:"1em"}} onClick={(e)=>{ 
            //                      this.setState({dataSource:[]});
            //                      let param = this.state.dataSource[i].split("@")
            //                      let loca = { pathname:"/search", search:"?q="+keywordtolucenequery(param[0])+"&lg="+param[1]+"&r="+useRoot /*this.props.IRI*/+"&t=Etext" }
            //                      this.props.navigate(loca)
            //                   }}>{ tab[0].replace(/["]/g,"")} <SearchIcon style={{padding:"0 10px"}}/><span class="lang">{(I18n.t(""+(searchLangSelec[tab[1]]?searchLangSelec[tab[1]]:languages[tab[1]]))) }</span></MenuItem> ) 
            //                } ) }
            //          </Paper></div> }
            //    </div>
            // </div>
            // <h2>{I18n.t("resource.browsE")}</h2>
            // <div class="search">
            //    <div>
            //       <input type="text" class="disabled" placeholder={I18n.t("resource.searchO")}  />
            //       <span class="button" title={I18n.t("resource.start")}></span> 
            //    </div>
            // </div>

      return (
         <div class="data etextrefs" id="outline">
            <Close width="24" className="close-etext-outline" onClick={() => this.setState({collapse:{...this.state.collapse, etextRefs:true}})}/>
            {/* <Loader  options={{position:"fixed",left:"calc(50% + 100px)",top:"calc(50% - 20px)"}} loaded={!this.props.loading === "etext"}/> */}
            <div>
               <div class={"root is-root "+ (isCurrent?"on":"")} onClick={(e) => toggle(e,root,root)} >                     
                  { !open && [<img src="/icons/triangle.png" className="xpd right" />,colT,<span >{title}</span>]}
                  {  open && [<img src="/icons/triangle_.png" className="xpd"  />,colT,<span /* class='on' */>{title}</span>]}
               </div>
               { open && <div style={{paddingLeft:"43px"}}>{etextRefs}</div> }
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


   hasLinkToIA() {      
      let hasIA = false
      let elem = this.getResourceElem(tmp+"addIALink");
      if(this.props.config && !this.props.config.chineseMirror) {
         if(elem?.length && elem[0].value == "true" ) { 
            hasIA = true
         }
      }
      return hasIA
   }

   getIAlink(loca = {}, prefix = "") {
      let id = this.props.IRI.replace(/^(bdr:M?)|(_[A-Z0-9]+)$/g,""), vid = "", pid = ""      
      let vol = loca[prefix+"contentLocationVolume"]
      if(vol?.length && vol[0].value) vol = Number(vol[0].value)
      if(vol) { 
         vid = "bdrc-"+ id 
         if(vol > 1) vid += "-" + (vol - 1) 
         vid += "/"
      }
      let page = loca[prefix+"contentLocationPage"]
      if(page?.length && page[0].value) page = page[0].value
      if(page) { 
         if(page > 1) pid = "page/n"+(page - 1)+"/"
      }
      //loggergen.log("loca:",loca,vol,page,prefix)
      return "https://archive.org/details/bdrc-"+id+"/"+vid+pid      
   }


   renderOutline() {

      if(this.props.outline && this.props.outline !== true) {

         let hasIA = this.hasLinkToIA()            
   
         let outline = [], title
         let root = this.props.IRI

         let osearch 
         if(this.props.outlineKW) osearch = this.props.outlineKW

         let toggle = (e,r,i,x = "",force = false, node, volFromUri) => {
            let tag = "outline-"+r+"-"+i+(x?"-"+x:"")
            let val = this.state.collapse[tag]
            if(osearch) {

               loggergen.log("toggle?",tag,val,x,force,node) 

               if(val === undefined && (!x && (!node || !node.notMatch ) || node.hasMatch) ) val = true // details of matching nodes + ancestor shown by default when search

               if(force && val && !x) val = false
            }

            loggergen.log("toggle!",tag,val,node)

            this.setState( { collapse:{...this.state.collapse, [tag]:!val } })
            if(/*this.state.outlinePart  &&*/ (!this.props.outlineKW || force || node && node.notMatch) &&  !x && this.props.outlines && (!this.props.outlines[i] || force && r === i) ) {

               if(i === root) {
                  let hasPartB = this.getResourceElem(tmp+"hasNonVolumeParts")
                  //loggergen.log("hasPartB:",hasPartB,i)
                  if(hasPartB?.length && hasPartB[0].value == "true") this.props.onGetOutline(i, { "tmp:hasNonVolumeParts": true})
                  else this.props.onGetOutline(i,node,volFromUri);
               } 
               else this.props.onGetOutline((i.startsWith("bdr:I")?i:i.replace(/;.*/,"")),node,volFromUri);
            }
         }


         let rootClick = (e) => {

            //loggergen.log("rootC?")

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

            let loca = { ...this.props.location }
            loca.search = loca.search.replace(/(&part|part)=[^&]+/g, "") 
            loca.search = loca.search.replace(/[?]&/,"?")
            this.props.navigate(loca)
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
         let opart, opartInVol = [], osearchIds = []
         if(this.state.outlinePart) opart = this.state.outlinePart         
         else if(root !== this.props.IRI) opart = this.props.IRI
         else opart = root

         //loggergen.log("renderO?",osearch,opart,title)
         
         let get = qs.parse(this.props.location.search)

         if(opart && opart !== root && this.state.collapse["outline-"+root+"-"+root] === undefined) toggle(null,root,root)         

         if((this.state.collapse["outline-"+root+"-"+root] || opart === root || osearch) && this.props.outlines  && this.props.dictionary) {

            let collapse = {...this.state.collapse }

            loggergen.log("collapse!",osearch,root,opart,JSON.stringify(collapse,null,3),this.props.outlines[opart])

            let nodes = Object.values(this.props.outlines).reduce( (acc,v) => ([...acc, ...(v["@graph"]?v["@graph"]:[v])]), []), matches = []
            let opart_node = nodes.filter(n => n["@id"] === opart), path = []

            if(!osearch && !get.osearch && !this.props.outlines[opart]) {             
               let parent_nodes = nodes.filter(n => n["@id"] === opart) //n => n.hasPart && (n.hasPart === opart || n.hasPart.includes(opart)))
               //loggergen.log("pNode:",nodes,parent_nodes)
               if(opart_node.length && opart_node[0] !== true && opart_node[0]["tmp:hasNonVolumeParts"] && parent_nodes.length && parent_nodes[0] !== true) {
                  
                  this.props.onGetOutline(parent_nodes[0]["@id"], parent_nodes[0]);

                  /* // no need
                  if(opart_node.length) {
                     let vol = nodes.filter(n => n["@id"] === opart_node[0].contentLocation)
                     if(vol.length) { 
                        vol = vol[0].contentLocationVolume
                        this.props.onGetOutline("tmp:uri", { partType: "bdr:PartTypeVolume", "tmp:hasNonVolumeParts": true, volumeNumber: vol }, nodes[0]["@id"]);
                     }
                  }
                  */
               } else {                     
                  this.props.onGetOutline(opart);
               }

            }
            
            if(!osearch && opart_node && opart_node.length && opart_node[0].contentLocation) {
               let hasContentLoc = nodes.filter(o => o["@id"] === opart_node[0].contentLocation)
               if(hasContentLoc.length) {
                  opartInVol = hasContentLoc.map(v => v.contentLocationVolume)
                  //loggergen.log("opiv:",opartInVol,hasContentLoc)
               }
            } else if(osearch) {
               matches = nodes.filter(g => g["tmp:titleMatch"] || g["tmp:labelMatch"]|| g["tmp:colophonMatch"])
               let hasContentLoc = nodes.filter(o => matches.some(m => m.contentLocation === o["@id"]))
               if(hasContentLoc.length) {
                  opartInVol = hasContentLoc.map(v => v.contentLocationVolume)
               }
               osearchIds = nodes.filter(o => matches.some(m => m["@id"] === o["@id"])).map(o => o["@id"])
               //loggergen.log("opiv:",opartInVol,matches,hasContentLoc,osearchIds)
            }  
               
               /*
               // no need
               && this.props.outlines[this.props.IRI]  && this.props.outlines[this.props.IRI] !== true) {
               let opart_node = elem.filter(o => o["@id"] === opart)
               if(!opart_node.length) opart_node = null
               let opart_parent = elem.filter(o => o.hasPart && (o.hasPart === opart || o.hasParent.includes(opart)))
               if(opart_parent.length) opart_parent = opart_parent[0]["@id"]
               else opart_parent = null
               */

            if(osearch && this.props.outlines[osearch] && this.props.outlines[osearch] !== true) {

               // #768 fix infinite loop
               let parents = nodes.filter(n => matches.some(m => n.hasPart === m["@id"] || Array.isArray(n.hasPart) && n.hasPart.includes(m["@id"]) )), update, previously = {}
               while(parents.length) {
                  let head = parents.pop()
                  previously[head["@id"]] = true
                  
                  //loggergen.log("parents:",head,parents) 

                  if(collapse["outline-"+root+"-"+head["@id"]] === undefined) { 
                     update = true
                     collapse["outline-"+root+"-"+head["@id"]] = true
                  }
                  parents = parents.concat(nodes.filter(n => !previously[n["@id"]] && (n.hasPart === head["@id"] || Array.isArray(n.hasPart) && n.hasPart.includes(head["@id"]))))
               } 

               if(update) this.setState( { collapse } )           

            }
            else  if(!osearch && !get.osearch && this.props.outlines[opart] && this.props.outlines[opart] !== true && this.state.collapse["outline-"+root+"-"+opart+"-details"] === undefined) {

               Object.keys(collapse).filter(k => k.startsWith("outline-"+root)).map(k => { delete collapse[k]; })
               collapse["outline-"+root+"-"+opart] = true
               collapse["outline-"+root+"-"+opart+"-details"] = true          

               let nodes = this.props.outlines[opart], preloading = false, update = false
               if(nodes && nodes["@graph"]) nodes = nodes["@graph"]
               if(root !== opart && nodes && nodes.length) {
                  let head = opart, done_opart = false, parent_head = null, child_node
                  //loggergen.log("opart??",opart,head)
                  const already = []
                  do {
                     let head_node = nodes.filter(n => n.hasPart && (n.hasPart === head || n.hasPart.includes(head)))
                     //loggergen.log("head?",head, head_node, child_node)
                     head = head_node
                     if(head && head.length) { 
                        head = head[0]["@id"]
                        head_node = head_node[0]
                        // #641 need to load/open volume in root node as well
                        if(head === root && head_node["tmp:hasNonVolumeParts"] && child_node) {
                           if(!this.props.outlines[child_node["@id"]] || !this.props.outlines[child_node["@id"]]["@graph"]) {
                              preloading = true
                              break ;
                           } else {
                              let vol = this.props.outlines[child_node["@id"]]["@graph"].filter(n => n["@id"] === child_node["@id"])
                              if(vol.length) vol = this.props.outlines[child_node["@id"]]["@graph"].filter(n => n["@id"] === vol[0].contentLocation)
                              if(vol.length) vol = vol[0].contentLocationVolume
                              if(!already.includes(head)) { // fix side-effect of #729 (prevent opening same text from multiple volumes like bdr:MW3CN27014_K0022-40) 
                                 this.props.onGetOutline("tmp:uri", { partType: "bdr:PartTypeVolume", "tmp:hasNonVolumeParts": true, volumeNumber: vol }, head);
                                 already.push(head)
                              }
                           }
                        }
                        if(collapse["outline-"+root+"-"+head] === undefined) { //} && (opart !== root || head !== root)) {
                           collapse["outline-"+root+"-"+head] = true ;                           
                           //loggergen.log("parent_head:",root,head,already) //,JSON.stringify(head_node,null,3),done_opart)
                           if((!done_opart 
                                 || head_node["tmp:hasNonVolumeParts"] // #729 need to open virtual volume when page node is a sub sub node of it                                    
                              ) && (head_node.partType === "bdr:PartTypeSection" || head === root)) {
                              let parent_head = []
                              if(head === root) parent_head = [ head_node ]
                              else parent_head = nodes.filter(n => n.hasPart && (n.hasPart === head || n.hasPart.includes(head)))
                              if(parent_head.length) {
                                 let opart_node = nodes.filter(n => n["@id"] === opart)
                                 //loggergen.log("opart_n:",opart_node,nodes)
                                 if(opart_node.length) {
                                    let vol = nodes.filter(n => n["@id"] === opart_node[0].contentLocation)
                                    if(vol.length) { 
                                       vol = vol[0].contentLocationVolume
                                       //loggergen.log("ready for vol."+vol+" in "+head,head_node)
                                       if(!already.includes(head) && vol != undefined) { // fix side-effect of #729 (prevent opening same text from multiple volumes like bdr:MW3CN27014_K0022-40)
                                          update = true                              
                                          this.props.onGetOutline("tmp:uri", { partType: "bdr:PartTypeVolume", "tmp:hasNonVolumeParts": true, volumeNumber: vol }, head);
                                          already.push(head)
                                       }
                                    }
                                 }
                                 parent_head = parent_head[0]["@id"]
                              }
                           }
                           else parent_head = null
                           if(!this.props.outlines[head]) this.props.onGetOutline(head, head_node, parent_head);
                           child_node = head_node
                        }
                        done_opart = true
                     }
                  } while(head !== root && head.length);
               }

               if(!preloading || update) this.setState( { collapse } )               
               loggergen.log("collapse?",JSON.stringify(collapse,null,3))

               
               if(opart && this.state.outlinePart && !osearch && !this.props.outlineOnly) {
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
               

            } else {
               let parent_nodes = nodes.filter(n => n.hasPart && (n.hasPart === opart || n.hasPart.includes(opart)))
               //loggergen.log("parent:",parent_nodes,opart_node)
               if(parent_nodes.length) { 
                  let update = false
                  for(let n of parent_nodes) {
                     if(n["@id"] && n["@id"].startsWith("bdr:I")) { 
                        if(collapse["outline-"+root+"-"+opart+";"+n["@id"]+"-details"]) {
                           //break ;
                        } else if(collapse["outline-"+root+"-"+opart+";"+n["@id"]+"-details"] === undefined) {
                           collapse["outline-"+root+"-"+opart+";"+n["@id"]+"-details"] = true
                           //loggergen.log("hello:","outline-"+root+"-"+opart+";"+n["@id"]+"-details")
                           update = true
                           //break ;
                        }
                     } else if(n.parent?.startsWith("bdr:I") && collapse["outline-"+root+"-"+n["@id"]+";"+n.parent] === undefined){
                        collapse["outline-"+root+"-"+n["@id"]+";"+n.parent] = true
                        update = true
                     } else { // #729 need to open node if page node is a sub node of it
                        const p = nodes.filter(m => m.hasPart && (m.hasPart === n["@id"] || m.hasPart.includes(n["@id"])))
                        //loggergen.log("n.p:",n["@id"],n.parent, Object.keys(n),p)
                        for(const q of p) {
                           if(collapse["outline-"+root+"-"+n["@id"]+";"+q["@id"]] === undefined) {
                              collapse["outline-"+root+"-"+n["@id"]+";"+q["@id"]] = true
                              update = true                              
                           }
                        }
                        // #729 check contentLocation from parent node if not returned by query
                        const parent = nodes.filter(n => opart_node.length && (n.hasPart === opart_node[0]["@id"] || n.hasPart?.includes(opart_node[0]["@id"])) && n.contentLocation)
                        if(!osearch && opart_node.length && !opart_node[0].contentLocation && parent.length && !opart_node[0].hasPart) { // #759 fix open node "sometimes" empty
                           const cLoc = nodes.filter(n => n["@id"] === parent[0].contentLocation)
                           if(cLoc.length && cLoc[0].contentLocationVolume) {                        
                              let vol = cLoc[0].contentLocationVolume, volElem
                              if(vol) {
                                 volElem = nodes.filter(v => v.volumeNumber === vol)                                                            
                                 if(volElem.length && collapse["outline-"+root+"-"+volElem[0]["@id"]] === undefined) {                                    
                                    //loggergen.log("no location:", parent, cLoc, vol, volElem)
                                    collapse["outline-"+root+"-"+volElem[0]["@id"]] = true
                                    update = true                              
                                    this.props.onGetOutline(volElem[0]["@id"], volElem[0], p[0]["@id"]);                              
                                 }
                              }
                           }
                        }
                     }
                  }

                  if(update) this.setState({ collapse })
               }
            }
            /*
            else { 
               Object.keys(collapse).filter(k => k.startsWith("outline-"+root)).map(k => { delete collapse[k]; })
               this.setState( { collapse } )              
            }
            */

            const parts = {
               "bdr:PartTypeFragment":"frg",
               "bdr:PartTypeFascicle":"fas",
               "bdr:PartTypeEditorial":"ed",
               "bdr:PartTypeSection":"sec",
               "bdr:PartTypeVolume":"vol",
               "bdr:PartTypeChapter":"cha",
               "bdr:PartTypeTableOfContent":"toc",
               "bdr:PartTypeText":"txt",
               "?":"unk",
            }

            let osearch_map, already = false

            let makeNodes = (top,parent) => {               
               let elem, osearchElem
               elem = this.props.outlines[top]               
               if(osearch) { 
                  osearchElem = this.props.outlines[osearch]
                  if(osearchElem === true) {
                     let tmp = this.props.outlineKW.split("/")
                     if(tmp && tmp.length >= 2) tmp = tmp[1].split("@")
                     return <span class="top is-root"><span>No result found for {tmp[0]}.{ /* in {(I18n.t(""+(searchLangSelec[tmp[1]]?searchLangSelec[tmp[1]]:languages[tmp[1]])))}. */ }</span></span>
                  } else if(osearchElem) {
                     if(top === root && !this.props.outlines[osearch].reloaded || !elem || !elem["@graph"] || !elem["@graph"].length) elem = osearchElem
                     /* // not needed
                     else if(osearchElem["@graph"] && !osearch_map) {
                        osearch_map = {}
                        osearchElem["@graph"].map( e => osearch_map[e["@id"]] = [e] )
                        loggergen.log("init:osm:",osearch_map,osearchElem)
                     }
                     */
                  }
               }
               
               //loggergen.log("makeNode/elem:",osearch,elem,top,parent)

               let outline = [], showPrev = null, showNext = null
               if(elem && elem["@graph"]) { 
                  elem = elem["@graph"]

                  const time = Date.now()
                  let last = Date.now(), subtimes = [0,0,0,0,0,0,0,0,0,0]              
                  const subtime = (n) => {
                     subtimes[n] += Date.now() - last
                     last = Date.now()
                  }

                  let elem_map = {}, elem_val ;
                  elem.map( e => elem_map[e["@id"]] = [e] )
                  const mapElem = (i) => {
                     elem_val = elem_map[i]
                     if(elem_val) return elem_val
                     else return []
                  }

                  //let node = elem.filter(e => e["@id"] === top)                  
                  let node = mapElem(top)

                  //loggergen.log("mapelem:",top,node,elem_map)

                  if(node.length && node[0].hasPart) { 
                     if(!Array.isArray(node[0].hasPart)) node[0].hasPart = [ node[0].hasPart ]

                     // expand node when it's an only child and it's a inserted volume but #748 don't show results siblings unless asked for
                     if(!osearch && node[0].hasPart.length === 1 && node[0].hasPart[0].includes(";")) { 
                        if(this.state.collapse["outline-"+root+"-"+node[0].hasPart[0]] === undefined) { 
                           let vol = mapElem(node[0].hasPart[0])
                           this.setState({collapse:{...this.state.collapse, ["outline-"+root+"-"+node[0].hasPart[0]]:true }})
                           this.props.onGetOutline(node[0].hasPart[0], vol[0], top)
                        } else {
                           return makeNodes(node[0].hasPart[0],top)
                        }

                        
                        //toggle(null,top,node[0].hasPart[0])
                     }

                     let subparts = [], sorted = _.orderBy(node[0].hasPart.map(n => {
                        const e = mapElem(n)
                        let hasPart = e?.[0]?.hasPart
                        if(hasPart && !Array.isArray(hasPart)) hasPart = [ hasPart ]
                        if(e && e.length && (e[0].partIndex !== undefined  || e[0].volumeNumber !== undefined)) 
                           return { id:n, partIndex: ( e[0].partIndex != undefined ? e[0].partIndex : e[0].volumeNumber ), hasPart }
                        else 
                           return { id:n, partIndex:999999, hasPart }
                     }),["partIndex"],["asc"])

                     //subparts = sorted.map(n => n.id)
                                          
                     // keep only ~50 children and everything inside
                     const ShowNbChildren = 40

                     // TODO: case of a search 

                     // use opartInVol only when corresponding with page node 
                     const parentIsVol = nodes.filter(m => m.hasPart && (m.hasPart === opart || m.hasPart.includes(opart))).map(m => m["@id"]).some(o => o && o.startsWith("bdr:I"))
                     let isParent = sorted.filter(n => n.id === opart || n.hasPart?.includes(opart) || !osearch && parentIsVol && opartInVol.includes(n.partIndex) || osearchIds.includes(n.id) ), start = 0, end = start + ShowNbChildren
                     if(isParent.length) {                                             
                        //loggergen.log("opIv:",opartInVol,opart_node,parentIsVol)
                        let mustBe = sorted.map( (n,i) => {
                           //loggergen.log("isP?",n,i)
                           if(isParent.some(m => m.id === n.id)) {
                              return i
                           }
                        }).filter(e => e)
                        if(mustBe.length) { 
                           // TODO: case of multiple/matches
                           start = Math.max(0, mustBe[0] - Math.floor(ShowNbChildren / 2))
                           end = Math.max(start + ShowNbChildren + 1, mustBe[mustBe.length - 1] + Math.floor(ShowNbChildren / 2))
                        }                        
                        
                        //loggergen.log("mB:",isParent,mustBe,start,end)
                     }

                     let min = 0 //sorted.findIndex(s => s.partIndex !== 999999)
                     let max = sorted.length //sorted.filter(s => s.partIndex !== 999999).length
                     let isOpen = !osearch || this.state.collapse["outline-"+root+"-"+top]  //&& !this.props.loading

                     if(start > min) {
                        let tag = "outline-"+root+"-"+top+"-prev"
                        let prev = this.state.collapse[tag]?this.state.collapse[tag]:[]
                        if(prev.length) start = prev[prev.length - 1]
                        if(start > min && isOpen && this.props.outlines[top]) showPrev = <span class="node-nav" onClick={
                           () => this.setState({collapse:{...this.state.collapse, [tag]:[...prev, Math.max(0,start-ShowNbChildren)]}})
                        }>{I18n.t("resource.showPnodes")}</span>
                     }
                     if(end < max - 1) {
                        let tag = "outline-"+root+"-"+top+"-next"
                        let next = this.state.collapse[tag]?this.state.collapse[tag]:[]
                        if(next.length) end = next[next.length - 1]
                        if(end < max - 1 && isOpen && this.props.outlines[top]) showNext = <span class="node-nav" onClick={
                           () => this.setState({collapse:{...this.state.collapse, [tag]:[...next, end+ShowNbChildren]}})
                        }>{I18n.t("resource.showNnodes")}</span>
                     }

                     /*
                     if(!osearch) subparts = sorted.slice(start,end).map(n => n.id)
                     else subparts = sorted.map(n => n.id)
                     */

                     subparts = sorted.slice(start,end).map(n => n.id)

                     //loggergen.log("next/prev:",start,end,min,max,subparts,sorted,isParent)
                     

                     for(let e of subparts) {
                        
                        subtime(0)

                        //loggergen.log("node:",e)  

                        //let w_idx = elem.filter(f => f["@id"] === e) 
                        let w_idx = mapElem(e)

                        if(w_idx.length) {
                           //loggergen.log("found:",w_idx[0])  
                           let g = w_idx[0]
                           
                           if(g.details && (g.lang !== this.props.locale || g.rid === g["@id"] || g["@id"] === this.props.IRI)) { 
                              delete g.details ;
                              delete g.hidden ;
                           }

                           if(!g.details) {
                              let tag = "outline-"+root+"-"+g['@id'] 
                              if(g["@id"] && g["@id"].startsWith("bdr:I") && !g["@id"].includes(";") || top.startsWith("bdr:I")) tag += ";"+top
                              
                              let showDetails = this.state.collapse[tag+"-details"]                              

                              g.rid = this.props.IRI
                              g.lang = this.props.locale
                              g.parent = top
                              // deprecated
                              // if(! (["bdr:PartTypeSection", "bdr:PartTypeVolume"].includes(g.partType)) ) {

                              let nav = [] ;

                              if(g["tmp:titleMatch"] || g["tmp:labelMatch"]|| g["tmp:colophonMatch"]) {
                                 g.hasMatch = true
                                 if(g["tmp:titleMatch"] && !Array.isArray(g["tmp:titleMatch"])) g["tmp:titleMatch"] = [ g["tmp:titleMatch"] ]
                              }

                              if(g.instanceOf) {
                                 let instOf = mapElem(g.instanceOf)
                                 if(instOf.length && instOf[0]["tmp:labelMatch"]) {
                                    g.hasMatch = true
                                 }   
                              }

                              showDetails = showDetails || (osearch && g.hasMatch && this.state.collapse[tag+"-details"] !== false) 
                              if(showDetails && !g.hidden) g.hidden = []

                              //loggergen.log("showD:",g["@id"], g.hasMatch, g)


                              subtime(1)

                              if(this.props.useDLD) { 
                                 g.checkDLD = (ev) => {
                                    //loggergen.log("CDLD:",this.props.useDLD,g)

                                    let loca = mapElem(g.contentLocation), go
                                    if(loca?.length) loca = loca[0]
                                    if(loca && loca.contentLocationInstance) {
                                       //loggergen.log("root:",loca)

                                       let nbVol =  this.getResourceElem(bdo+"numberOfVolumes")
                                       if(nbVol) nbVol = nbVol.map(v => v.value)
                                       let rid = loca.contentLocationInstance.replace(/^bdr:/,"")
                                       
                                       if(window.DLD && window.DLD[rid]) {                        
                                          window.top.postMessage(JSON.stringify({"open-viewer":{
                                             "rid":rid,
                                             "vol":loca.contentLocationVolume,
                                             "page":loca.contentLocationPage,
                                             "nbVol":""+nbVol
                                          }}),"*")        
                                          
                                          ev.currentTarget.closest(".details,.top").scrollIntoView()
                                       } else {                           
                                          go = window.confirm(I18n.t("misc.DLD"))
                                          if(!go)  {
                                             ev.preventDefault();
                                             ev.stopPropagation();
                                             return false ;
                                          }
                                       }
                                    }
                                    
                                    if(!go) {
                                       ev.preventDefault();
                                       ev.stopPropagation();
                                       return false ;
                                    }
                                 }
                              }


                              let warn
                              if(g.contentLocation && (!this.state.catalogOnly || !this.state.catalogOnly[this.props.IRI])) {
                                 g.hasImg = "/show/"+g["@id"].split(";")[0].replace(/^((bdr:MW[^_]+)_[^_]+)$/,"$1")+"?s="+encodeURIComponent(this.props.location.pathname+this.props.location.search)+"#open-viewer"
                                 g.hasDetails = true
                                 if(showDetails) {
                                    if(!g.details) g.details = []
                                    nav.push(<Link onClick={g.checkDLD} to={g.hasImg} class="ulink">{I18n.t("copyright.view")}</Link>)                                    
                                    warn = true
                                 }
                              }
                              else if(g.instanceHasReproduction) {
                                 g.hasImg = "/show/"+g.instanceHasReproduction.split(";")[0]+"?s="+encodeURIComponent(this.props.location.pathname+this.props.location.search)+"#open-viewer"
                                 g.hasDetails = true
                                 if(showDetails) {
                                    if(!g.details) g.details = []
                                    nav.push(<Link onClick={g.checkDLD} to={g.hasImg} class="ulink">{I18n.t("copyright.view")}</Link>)  
                                    warn = true
                                 }
                              } 
                              else if(!g.contentLocation) {
                                 let repro = this.getResourceElem(bdo+"instanceHasReproduction")
                                 if(repro?.length && repro[0].value) {
                                    let backToUrl = this.props.location.search.replace(/([?&])(part|backToOutline)=[^&]+/,"$1")
                                    if(!backToUrl.endsWith("&")) {
                                       if(backToUrl && backToUrl.includes("?")) backToUrl += "&"
                                       else backToUrl += "?"
                                    }
                                    backToUrl += "part="+g["@id"]+"&backToOutline=true"
                                    backToUrl = this.props.location.pathname+backToUrl
                                    g.hasImg = "/show/"+shortUri(repro[0].value)+"?s="+encodeURIComponent(backToUrl)+"#open-viewer"
                                    g.hasDetails = true
                                    if(showDetails) {
                                       if(!g.details) g.details = []
                                       nav.push(<Link onClick={g.checkDLD} to={g.hasImg} class="ulink">{I18n.t("copyright.view")}</Link>)  
                                       warn = true
                                    }
                                 }
                              }
                              if(warn) {
                                 let loca = mapElem(g.contentLocation)
                                 if(loca?.length) loca = loca[0]
                                 if(loca && loca.contentLocationVolume && !loca.contentLocationPage) {
                                    let ptype = g.partType
                                    //loggergen.log("root:",loca,ptype,g)
                                    if(ptype && !["bdr:PartTypeVolume","bdr:PartTypeSection"].includes(ptype)) {
                                       nav.push(<div class="outline-warn"><Tooltip placement="top-end" title={
                                          <div style={{margin:"10px"}}><Trans i18nKey="location.tooltip" components={{ newL: <br /> }} /></div>
                                       }><WarnIcon/></Tooltip></div>)
                                    } 
                                 } else if(loca && Array.isArray(loca) && !loca.length){
                                    //loggergen.log("warn:",loca,g)                                    
                                    nav.push(<div class="outline-warn"><Tooltip placement="top-end" title={
                                       <div style={{margin:"10px"}}><Trans i18nKey="location.tooltip" components={{ newL: <br /> }} /></div>
                                    }><WarnIcon/></Tooltip></div>)                                 
                                 } 
                              }


                              subtime(2)


                              if(g["@id"] !== this.props.IRI || (g["@id"] === opart && opart !== this.props.IRI)){
                                 g.hasDetails = true
                                 if(showDetails) {
                                    if(nav.length) nav.push(<span>|</span>)
                                    nav.push(<Link to={"/show/"+g["@id"].split(/;/)[0]} class="ulink">{I18n.t("resource.openR")}</Link>)

                                    if(hasIA) {
                                       let loca = mapElem(g.contentLocation)
                                       if(loca?.length) loca = loca[0]
                                       let IAlink = this.getIAlink(loca)                                       
                                       if(nav.length) nav.push(<span>|</span>)                                    
                                       nav.push(<a target="_blank" rel="noopener noreferrer" href={IAlink} class="ulink">{I18n.t("resource.openIA")}</a>)
                                    }
                                 }
                              }


                              if(g.instanceOf) {
                                 if(nav.length) nav.push(<span>|</span>)
                                 nav.push(<Link to={"/show/"+(Array.isArray(g.instanceOf)?g.instanceOf[0]:g.instanceOf)} class="ulink">{I18n.t("resource.openW")}</Link>)                                                                     
                              }

                              if(nav.length) { 
                                 g.hasDetails = true
                                 if(showDetails) {
                                    if(!g.details) g.details = []
                                    g.details.push(<div class="sub view">{nav}</div>)
                                 }
                              }

                              if(g["bf:identifiedBy"]) {
                                 if(!Array.isArray(g["bf:identifiedBy"])) g["bf:identifiedBy"] = [ g["bf:identifiedBy"] ]
                                 if(g["bf:identifiedBy"].length) { 
                                    g.id = []
                                    for(let node of g["bf:identifiedBy"]) {
                                       //let id = elem.filter(f => f["@id"] === node["@id"]) 
                                       let id = mapElem(node["@id"])

                                       //loggergen.log("idBy:",g["bf:identifiedBy"],g,id,elem,node)
                                       // TODO add prefix letter (either in value or from ontology property)
                                       if(id.length) g.id.push(<span class="id" title={this.fullname(id[0].type,false,false,true,false)}>{id[0]["rdf:value"]}</span>)
                                    }
                                 }
                              }


                              subtime(3)

                              
                              if(showDetails && g.contentLocation) {
                                 if(!g.details) g.details = []
                                 // let loca = elem.filter(f => f["@id"] === g.contentLocation), 
                                 let loca = mapElem(g.contentLocation),
                                    jLoca = {}
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


                              subtime(4)

                              const inst = []
                              if(g.instanceOf) {
                                 //if(Array.isArray(g.instanceOf)) g.instanceOf = 
                                 if(showDetails) {
                                    if(!g.details) g.details = []
                                    inst.push(<div class="sub"><h4 class="first type">{this.proplink(tmp+"instanceOfWork")}{I18n.t("punc.colon")} </h4>{this.format("h4","instacO","",false, "sub", [{type:"uri",value:fullUri(g.instanceOf)}])}</div>)
                                 }
                              }
                              
                              const titleTxt = []
                              if(showDetails && g.hasTitle) {
                                 if(!g.details) g.details = []
                                 if(!Array.isArray(g.hasTitle)) g.hasTitle = [ g.hasTitle ]
                                 let lasTy
                                 for(let t of g.hasTitle) { 
                                    //let title = elem.filter(f => f["@id"] === t)
                                    let title = mapElem(t)
                                    if(title.length) {                                        
                                       title = { ...title[0] }
                                       let titleT = bdo + title.type
                                       let hideT = (lasTy === title.type)
                                       lasTy = title.type
                                       if(title && title["rdfs:label"]) title = title["rdfs:label"]
                                       // #852
                                       if(typeof title == "string") { 
                                          let lang = narrowWithString(title)
                                          title = { "@value": title, "@language":lang[0] === "tibt" ? "bo": "?" }
                                       }
                                       if(!Array.isArray(title)) title = [ title ]                                      
                                       title = title.map(f => ({value:f["@value"],lang:f["@language"], type:"literal"}))                                       
                                       //loggergen.log("title?",JSON.stringify(title,null,3),g)
                                       
                                       // TODO which to show or not ? in outline search results ?
                                       let useT
                                       if(g["tmp:titleMatch"]) useT = g["tmp:titleMatch"].filter(tm => title[0].value.replace(/[↦↤]/g,"") == tm["@value"].replace(/[↦↤]/g,""))
                                       if(useT && useT.length || 
                                          titleT === bdo+"Title"|| 
                                          //(title.length && title[0].value && title[0].value == .includes("↦"))) 
                                          title.length && title[0].value && g["tmp:titleMatch"] && useT.length) {

                                          //loggergen.log("useT:",useT,title,g["tmp:titleMatch"], titleT)

                                          titleTxt.push(getLangLabel(this,"",title))

                                          if(!g.details) g.details = []
                                          g.details.push(<div class={"sub " + (hideT?"hideT":"")}><h4 class="first type">{this.proplink(titleT)}{I18n.t("punc.colon")} </h4>{this.format("h4", "", "", false, "sub", useT?.length?useT:title)}</div>)
                                       } else {
                                          g.hidden.push(<div class={"sub " + (hideT?"hideT":"")}><h4 class="first type">{this.proplink(titleT)}{I18n.t("punc.colon")} </h4>{this.format("h4", "", "", false, "sub", title)}</div>)
                                       }
                                    }
                                 }
                              }

                              const catInf = [], wLab = []
                              if(showDetails && g.instanceOf) {
                                 if(!g.details) g.details = []
                                 if(!Array.isArray(g.instanceOf)) g.instanceOf = [ g.instanceOf ]
                                 const cInfo = []
                                 
                                 for(let t of g.instanceOf) { 
                                    t = mapElem(t)
                                    if(t.length) {                                        
                                       t = { ...t[0] }
                                       const l = t["skos:prefLabel"]
                                       if(l) {
                                          if(!Array.isArray(l)) l = [ l ]   
                                          wLab.push(getLangLabel(this, "", l))
                                       }
                                       if(t && t["catalogInfo"]) { 
                                          t = t["catalogInfo"]
                                          if(!Array.isArray(t)) t = [ t ]
                                          cInfo.push(this.format("h4", "", "", false, "sub", t))
                                       }
                                    }
                                 }                                 
                                 if(cInfo?.length) catInf.push(<div class={"sub "}><h4 class="first type">{this.proplink(bdo+"catalogInfo")}{I18n.t("punc.colon")} </h4><div>{cInfo}</div></div>)
                              }

                              if(inst.length && g.details) {
                                 if(titleTxt.length && wLab.length) {
                                    //loggergen.log("tTxt:",titleTxt,wLab)
                                    if(!wLab.some(l => titleTxt.some(t => t.value === l.value))){
                                       g.details.push(inst)   
                                    }
                                 } else {
                                    g.details.push(inst)
                                 }
                              }

                              if(g.instanceOf) {
                                 //let instOf = elem.filter(f => f["@id"] === g.instanceOf)
                                 let instOf = mapElem(g.instanceOf)
                                 if(instOf.length && instOf[0]["tmp:labelMatch"]) {
                                    g.hasMatch = true
                                    //loggergen.log("instOf",instOf,node)
                                    if(showDetails) {
                                       let node = instOf[0]["tmp:labelMatch"]
                                       if(!Array.isArray(node)) node = [node]  
                                       if(!g.details) g.details = []
                                       g.details.push(<div class="sub"><h4 class="first type">{this.proplink(tmp+"instanceLabel")}{I18n.t("punc.colon")} </h4><div>{node.map(n => this.format("h4","","",false, "sub",[{ value:n["@value"], lang:n["@language"], type:"literal"}]))}</div></div>)
                                    }
                                 }
   
                              }

                              if(showDetails && g.note) {
                                 if(!Array.isArray(g.note)) g.note = [ g.note ]
                                 const notes = []
                                 for(const n of g.note) {
                                    if(!g.details) g.details = []
                                    let note = mapElem(g.note)
                                    //loggergen.log("note:",note)
                                    if(note?.length && note[0].noteText) notes.push(note[0].noteText["@value"]?note[0].noteText:{"@value":note[0].noteText, "@language":"en" })
                                 }
                                 if(notes.length) g.details.push(<div class="sub"><h4 class="first type">{this.proplink(bdo+"note",undefined,notes.length,true)}{I18n.t("punc.colon")} </h4><div>{notes.map(n => this.format("h4","","",false, "sub",[{ value:n["@value"], lang:n["@language"], type:"literal"}]))}</div></div>)
                              }
                              
                              if(showDetails && osearch && g["tmp:colophonMatch"]) {
                                 if(!g.details) g.details = []
                                 if(!Array.isArray(g["tmp:colophonMatch"])) g["tmp:colophonMatch"] = [ g["tmp:colophonMatch"] ]
                                 g.details.push(<div class="sub"><h4 class="first type">{this.proplink(tmp+"colophonMatch")}: </h4><div>{g["tmp:colophonMatch"].map(t => <h4>{
                                    this.format("h4","","",false, "sub",[{ value:t["@value"], lang:t["@language"], type:"literal"}])
                                    //highlight(t["@value"])
                                 }</h4>)}</div></div>)
                              }



                              subtime(5)


                              if(showDetails && g["tmp:author"]) {
                                 //loggergen.log("g:",g["tmp:author"],g["@id"]);
                                 if(!Array.isArray(g["tmp:author"])) g["tmp:author"] = [ g["tmp:author"] ]
                                 g.hidden.push(<div class="sub"><h4 class="first type">{this.proplink(tmp+"author", undefined, g["tmp:author"].length)}{I18n.t("punc.colon")} </h4>{this.format("h4","instacO","",false, "sub", 
                                    g["tmp:author"].map(aut => ({type:"uri",value:fullUri(aut["@id"])}))
                                 )}</div>)
                              }

                              subtime(6)

                              if(showDetails) for(let p of [ "colophon", "authorshipStatement", "incipit", "explicit" ]) {
                                 node = g[p]
                                 if(!node) continue;
                                 if(!Array.isArray(node)) node = [node]
                                 if(p === "colophon" && osearch && g["tmp:colophonMatch"]) {
                                    node = node.filter(n => !g["tmp:colophonMatch"].some(t => n["@value"] && t["@value"] && t["@value"].replace(/[↦↤]/g,"") === n["@value"].replace(/[↦↤]/g,"")))
                                    //loggergen.log("coloph:",node,g["tmp:colophonMatch"])
                                 }                                 
                                 if(!p.includes(":")) p = bdo+p
                                 if(node.length) { 
                                    
                                    // #784
                                    let addTo = g.hidden
                                    if(p.endsWith("incipit")) addTo = g.details

                                    addTo.push(<div class="sub"><h4 class="first type">{this.proplink(p)}{I18n.t("punc.colon")} </h4><div>{node.map(n => this.format("h4","","",false, "sub",[{ value:n["@value"], lang:n["@language"], type:"literal"}]))}</div></div>)
                                 }
                              }


                              subtime(7)


                              // WIP sameAs icon / seeAlso link
                              if(/*showDetails &&*/ (g["owl:sameAs"] || g["rdfs:seeAlso"])){
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
                                          if(showDetails) {
                                             if(!g.details) g.details = [] 
                                             g.details.push(<div class="sub"><h4 class="first type">{this.proplink(rdfs+"seeAlso")}{I18n.t("punc.colon")} </h4><div>{this.format("h4","","",false, "sub",[{ value:node["@value"], type:"xsd:anyUri"}])}</div></div>)
                                          }
                                       }                                 
                                    }
                                    
                                    // deprecated
                                    //if(prefix && url) g.same.push(<a href={url} target="_blank" class={"provider "+prefix}>{provImg[prefix]?<img src={provImg[prefix]}/>:<span class="img">{prefix.replace(/^cbc.$/,"cbc@").toUpperCase()}</span>}</a>)
                                 }
                              }


                              if(catInf.length && g.details) g.details.push(catInf)

                              subtime(8)
                           }

                           // #784
                           if(g.details?.length === 1 && g.hidden?.length) {
                              g.details = g.details.concat(g.hidden)
                              g.hidden = []
                           }

                           outline.push(g);
                        }
                     }

                     //loggergen.log("end/loop:",(Date.now() - time)/1000, subtimes)

                     //loggergen.log("outline?",elem,outline)

                     outline = outline.map(e => {
                        let url = "/show/"+root+"?part="+e["@id"]
                        let togId = e["@id"]
                        if(e["@id"] && e["@id"].startsWith("bdr:I")) {                           
                           url = "/show/"+e["@id"].split(";")[0]
                           if(e.parent && !togId.includes(";")) togId += ";"+e.parent
                        } else if(e.parent && e.parent.startsWith("bdr:I")) {
                           togId += ";"+e.parent
                        }

                        let tag = "outline-"+root+"-"+togId
                        let ret = []
                        let pType = e["partType"], fUri = fullUri(e["@id"])
                        if(e["@id"].includes(";")) fUri = fullUri(e["@id"].split(";")[0])
                        let tLabel 
                        if(pType) {

                           if(Array.isArray(pType)) pType = pType[0]

                           tLabel = getOntoLabel(this.props.dictionary,this.props.locale,fullUri(pType))
                           tLabel = tLabel[0].toUpperCase() + tLabel.slice(1)
                           // TODO use translation from ontology
                        }
                        let open = this.state.collapse[tag] || (osearch &&  this.state.collapse[tag] === undefined && !e.notMatch)
                        if(pType && pType["@id"]) pType = pType["@id"]

                        const citeRef = React.createRef(), printRef = React.createRef()

                        //loggergen.log("reload?",e,e.hasPart,this.props.outlines[e['@id']])

                        let isRoot = this.state.outlinePart === e['@id'] && !already || (!this.state.outlinePart && this.props.IRI===e['@id'] && !already)
                        if(isRoot) already = true

                        ret.push(<span class={'top'+ (isRoot ?" is-root":"")+(this.state.collapse[tag]||osearch&&e.hasMatch?" on":"") }>
                              {((e.hasPart || e["tmp:hasNonVolumeParts"]) && open && osearch && !this.props.outlines[e['@id']]) && <span onClick={(ev) => toggle(ev,root,e["@id"],"",true,e,top)} className="xpd" title={I18n.t("resource.otherN")}><RefreshIcon /></span>}
                              {((e.hasPart || e["tmp:hasNonVolumeParts"]) && !open && this.props.outlines[e['@id']] !== true) && <img src="/icons/triangle.png" onClick={(ev) => toggle(null,root,togId,!e.hasPart&&!e["tmp:hasNonVolumeParts"]?"details":"",false,e,top)} className="xpd right"/>}
                              {((e.hasPart || e["tmp:hasNonVolumeParts"])&& open && this.props.outlines[e['@id']] !== true) && <img src="/icons/triangle_.png" onClick={(ev) => toggle(null,root,togId,!e.hasPart&&!e["tmp:hasNonVolumeParts"]?"details":"",false,e,top)} className="xpd"/>}
                              <span class={"parTy "+(e.details?"on":"")}  ref={citeRef} {...e.details?{title:/*tLabel+" - "+*/ I18n.t("resource."+(this.state.collapse[tag+"-details"]?"hideD":"showD")), onClick:(ev) => toggle(ev,root,e["@id"],"details",false,e)}:{title:tLabel}} >
                                 {pType && parts[pType] ? <div>{parts[pType]}</div> : <div>{parts["?"]}</div> }
                              </span>
                              <span>{this.uriformat(null,{noid:true, type:'uri', value:fUri, data: e, ...(e.partType==="bdr:PartTypeVolume"?{volumeNumber:e.volumeNumber}:{}), inOutline: (!e.hasPart?tag+"-details":tag), url, debug:false, toggle:() => toggle(null,root,togId,!e.hasPart&&!e["tmp:hasNonVolumeParts"]?"details":"",false,e,top)})}</span>
                              {e.id}
                              {this.samePopup(e.same,fUri)}
                              <div class="abs">
                                 { e.hasImg && <Link className="hasImg" title={I18n.t("copyright.view")} onClick={e.checkDLD}  to={e.hasImg}><img src="/icons/search/images.svg"/><img src="/icons/search/images_r.svg"/></Link> }
                                 { /* pType && 
                                    <span class={"pType "+(e.details?"on":"")} {...e.details?{title:(this.state.collapse[tag+"-details"]?"Hide":"Show")+" Details", onClick:(ev) => toggle(ev,root,e["@id"],"details")}:{}} >
                                       {this.proplink(pType)}
                                       { !this.state.collapse[tag+"-details"] && <ExpandMore className="details"/>}
                                       {  this.state.collapse[tag+"-details"] && <ExpandLess className="details"/>}
                                    </span> */ }
                                 { e.hasDetails && <span id="anchor" title={/*tLabel+" - "+*/I18n.t("resource."+(this.state.collapse[tag+"-details"]?"hideD":"showD"))} onClick={(ev) => toggle(ev,root,togId,"details",false,e)}>
                                    <img src="/icons/info.svg"/>
                                 </span> }
                                 <CopyToClipboard text={fUri} onCopy={(e) => prompt(I18n.t("misc.clipboard"),fUri)}>
                                    <a class="permalink" title={I18n.t("misc.permalink")}>
                                       <img src="/icons/PLINK_small.svg"/>
                                       <img src="/icons/PLINK_small_r.svg"/>
                                    </a>
                                 </CopyToClipboard>

                                 
                                 <span id="cite" title={I18n.t("resource.cite")} onClick={ev => {
                                    let s = {
                                       citationRID:e["@id"],
                                       collapse:{ ...this.state.collapse, citation:!this.state.collapse.citation },
                                       anchorEl:{ ...this.state.anchorEl, citation:citeRef&&citeRef.current?citeRef.current:({...ev}).currentTarget }
                                    }
                                    // fetch citation data if needed
                                    if(e["@id"] && (!this.props.citationData || !this.props.citationData.data || !this.props.citationData.data[e["@id"]])) {
                                       if(!this.state.initCitation || !this.state.initCitation.includes(e["@id"])) { 
                                          this.props.onGetCitationData(e["@id"])            
                                          if(!s.initCitation) s.initCitation = []
                                          s.initCitation.push(e["@id"])
                                       } else if(this.props.citationData && this.props.citationData.data && this.props.citationData.data[e["@id"]]){
                                          //loggergen.log("added:",this.props.citationData.data[e["@id"]])
                                       }
                                    } 
                                    this.setState(s)
                                 }}>
                                    <CiteIcon /> 
                                 </span> 

                                 { e.hasImg && 
                                 <span id="print" title={I18n.t("resource.print")} onClick={ev => {
                                    let s = { 
                                       printRID:e["@id"],
                                       collapse:{ ...this.state.collapse, print:!this.state.collapse.print }, 
                                       anchorEl:{ ...this.state.anchorEl, print: printRef&&printRef.current?printRef.current:({...ev}).currentTarget }}
                                    this.setState(s)
                                 }}>
                                    {/* <span class="icon"><img src="/icons/print.svg"/></span>  */}
                                    <PrintIcon/>
                                 </span> }
                              
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
                        //loggergen.log("will loop:",e["@id"], top, this.props.outlines[e["@id"]],tag,this.state.collapse[tag])
                        if((osearch && this.state.collapse[tag] !== false) || (this.props.outlines[e["@id"]] && this.props.outlines[e["@id"]] !== true && this.state.collapse[tag]) ) 
                           ret.push(<div style={{paddingLeft:"33px"}}>{makeNodes(e["@id"],top)}</div>)                        
                        return ( ret )
                     })
                  }
               }
               return [ showPrev, outline, showNext ]
            }

            outline = makeNodes(root,root)
            
         }

         let tag = "outline-"+root+"-"+root

         let outlineSearch = (e, lg = "bo-x-ewts", val = this.state.outlineKW) => {
            loggergen.log("outlineS:",val)

            // NOTO
            // x search either from root or current node
            // DONE
            // + add to url (=>back button)
            // + add language alternatives using autodetection
            // + clean collapsed nodes before displaying results

            if(val) { 


               let loca = { ...this.props.location }

               loca.search = loca.search.replace(/((&?root)|(&?osearch))=[^&]+/g, "") 

               if(!loca.search) loca.search = "?"
               else if(loca.search !== "?") loca.search += "&"

               loca.search += "root="+root+"&osearch="+encodeURIComponent(keywordtolucenequery(val.trim(), lg))+"@"+lg

               loggergen.log("loca!",loca)

               this.setState({dataSource:[], outlineKW:val.trim()});
               this.props.navigate(loca)
               
               //this.props.onOutlineSearch(root, this.state.outlineKW,lg)
            }
         }

         let open = this.state.collapse[tag] || (osearch && this.state.collapse[tag] === undefined)


         let colT = <span class={"parTy"} title={I18n.t("Lsidebar.collection.title")}><div>COL</div></span>


         if(osearch) { 
            let _this = this, timinter = setInterval(()=>{
               const el = document.querySelector("#outline")
               if(el) { 
                  clearInterval(timinter)
                  if(_this.state.opartinview != osearch) {
                     el.scrollIntoView()      
                     _this.setState({opartinview: osearch})
                  }
               }
            }, 250)
         } else if(opart && this.state.outlinePart) { 
            let _this = this, timinter = setInterval(()=>{
               const el = document.querySelector("#outline .is-root")
               if(el) { 
                  clearInterval(timinter)
                  if(_this.state.opartinview != opart) {
                     el.scrollIntoView()      
                     _this.setState({opartinview: opart})               
                  }
               } 
               /* // quickfix for #538 but there might be a better way
               else {
                  const next = document.querySelector("span.node-nav:last-child")
                  if(next) next.click()
               }
               */
            }, 250)
         } 


         return ( <>
            <div data-prop="tmp:outlineSearch">
               <h3><span>Outline Search:</span></h3>
               <div class="group">
                  <OutlineSearchBar that={this} outlineSearch={outlineSearch}/>
               </div>
            </div>
            <div class="data" id="outline" data-prop="tmp:outline">
               <h3><span>Outline:</span></h3>
               <div class="group">
                  <Loader  options={{
                        position:this.props.outlineOnly?"absolute":"fixed",
                        left:"calc(50% "+(this.props.outlineOnly?")":"+ 100px)"),
                        top:"calc(50% - 20px)"}
                     } loaded={this.props.loading !== "outline"}/>
                  <div class={"root " +(this.state.outlinePart === root || (!this.state.outlinePart && this.props.IRI===root)?"is-root":"")} >
                     { (osearch && open && (this.props.outlines[root] && !this.props.outlines[osearch].reloaded)) && <span onClick={(ev) => toggle(ev,root,root,"",true)} className="xpd" title={I18n.t("resource.otherN")}><RefreshIcon /></span>}
                     { !open && [<img src="/icons/triangle.png" className="xpd right" onClick={(e) => toggle(e,root,root)} />,colT,<span onClick={rootClick}>{title}</span>]}
                     {  open && [<img src="/icons/triangle_.png" className="xpd" onClick={(e) => toggle(e,root,root)} />,colT,<span onClick={rootClick} class='on'>{title}</span>]}
                  </div>
                  { open && <div style={{paddingLeft:"50px"}}>{outline}</div> }
               </div>
            </div>
         </> )
      }
   }


   getWtitle(baseW,rootC,titleRaw) {
      if(baseW && baseW.length && baseW[0].value) {
         let wUri = shortUri(baseW[0].value);
         // DONE: work loaded with instance
         //if(this.props.resources && !this.props.resources[wUri]) this.props.onGetResource(wUri);
         
         //loggergen.log("is?",baseW[0].value,this.props.assocResources?this.props.assocResources[baseW[0].value]:null)

         let baseData = []
         if(this.props.assocResources) {
            baseData = this.props.assocResources[baseW[0].value]
            if(baseData && baseData.length) baseData = baseData.map(e => (e.fromKey?e.fromKey:(e.type?e.type:e)))         
            else baseData = []
         }
         let _T = getEntiType(shortUri(baseW[0].value))
         let { title,titlElem,otherLabels } = this.setTitle(baseData,_T,baseW[0].value,rootC,titleRaw) ;
         
         //loggergen.log("tEl:",titlElem)

         if(titleRaw && titlElem) titleRaw.label = titlElem
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

      if(!unpag) {
         unpag = this.getResourceElem(bdo+"eTextVolumeForImageGroup")
         if(!unpag?.length) unpag = this.props.resources?.[this.props.IRI] && this.props.resources?.[this.props.IRI] != true
         else unpag = false
      }

      return unpag
   }


   render()
   {
      let isMirador = (!this.props.manifestError || (this.props.imageVolumeManifests && Object.keys(this.props.imageVolumeManifests).length)) && (this.props.imageAsset || this.props.imageVolumeManifests) && this.state.openMirador

      loggergen.log("render",this.props.IRI,this.props.pdfDownloadOnly,isMirador,this.state.openMirador,this.props,this.state,this._refs)
   
      this._annoPane = []

      let status = this.getResourceElem(adm+"status");
      if(status && status.length) status = status[0].value ;

      if(!this.props.IRI || (this.props.failures && this.props.failures[this.props.IRI]) || status === bda+"StatusHidden" && this.props.logged !== undefined && !isGroup(this.props.auth, "admin"))
      {
         let msg = "IRI undefined" ;
         if(this.props.IRI) msg = "Resource "+this.props.IRI+" does not exist."
         return (
            <Redirect404 propid={this.props.propid} from={this.props.IRI} simple={this.props.simple} navigate={this.props.navigate} location={this.props.location}  message={msg}/>
         )
      }

      let redir, withdrawn
      if(this.props.resources && (redir = this.props.resources[this.props.IRI]) && (redir = redir[fullUri(this.props.IRI)]))
      {
         //loggergen.log("WithD?",redir);
         if(redir[adm+"replaceWith"]) {
            redir = shortUri(redir[adm+"replaceWith"][0].value)                        
            
            let path = "/show/" 
            if(this.props.simple) path = "/simple/"
            if(this.props.preview) path = "/preview/"

            if(redir != this.props.IRI) {
               return (               
                  <Redirect404 navigate={this.props.navigate} location={this.props.location} message={"Record withdrawn in favor of "+redir} to={path+redir+this.props.location.search+this.props.location.hash} />
               )
            }
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
      let titleRaw = { label:[] }
      let { title,titlElem,otherLabels } = this.setTitle(kZprop,_T,null,null,true) ;
      let versionTitle, ilabel 
      if(_T === "Instance") { 
         iTitle = title ; 

         let baseW = this.state.title.work
         wTitle = getWtitle(baseW, undefined, titleRaw)
         
         if(titleRaw.label?.length) { 
            title = getLangLabel(this,"",titleRaw.label)
            ilabel = getLangLabel(this,"",titlElem)
            if(ilabel?.value != title.value) versionTitle = ilabel
            title = <h2 class="on" title={title.value} lang={title.lang} >
               <span class={"newT "+_T.toLowerCase()}>
                  <span class="space-fix">
                     <span>{I18n.t("types."+_T.toLowerCase())}</span>
                  </span>
               </span>
               <span>{title.value}</span>
            </h2> 
         }

         if(this.state.catalogOnly  && this.state.catalogOnly[this.props.IRI]) {
            rTitle = <h2 class="catalogOnly" title={I18n.t("resource.noImages")}><span class="T catalog">{I18n.t("types.images")}<span class="RID">{I18n.t("prop.tmp:catalogOnly")}</span></span></h2>
         } else {
            baseW = this.state.title.images 
            rTitle = getWtitle(baseW)
         }
      }
      else if(_T === "Images") { 
         rTitle = title ; 

         let baseW = this.state.title.work 
         wTitle = getWtitle(baseW,null,titleRaw)

         baseW = this.state.title.instance 
         iTitle = getWtitle(baseW,null,titleRaw)

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

         if(this.state.catalogOnly && this.state.catalogOnly[this.props.IRI]) {
            rTitle = <h2 class="catalogOnly" title={I18n.t("resource.noImages")}><span class="T catalog">{I18n.t("types.images")}<span class="RID">{I18n.t("prop.tmp:catalogOnly")}</span></span></h2>
         } else {
            baseW = this.state.title.images
            rTitle = getWtitle(baseW)
         }
      }
      
      //loggergen.log("_T!!",_T)
      if(this.props.resources && this.props.resources[this.props.IRI] && _T !== "Etext") this.setManifest(kZprop,iiifpres)    

      if(this.props.previewEtext) {
         // DONE: should be already loaded with the MW query
         //if(this.props.resources && !this.props.resources[this.props.IRI]) this.props.onGetResource(this.props.IRI);
      }

      if(this.props.outlineOnly) {
         // delayed until outline is toggled
         //if(this.props.resources && !this.props.resources[this.props.IRI] /*&& this.state.collapse.containingOutline*/) this.props.onGetResource(this.props.IRI);
      }

      if(this.props.pdfDownloadOnly) {
         console.log("render perma", this.props.feedbucket)
         // DONE: scans loaded with instance
         //if(this.props.resources && !this.props.resources[this.props.IRI]) this.props.onGetResource(this.props.IRI);
         return this.perma_menu(pdfLink,monoVol,fairUse,kZprop.filter(k => k.startsWith(adm+"seeOther")), accessET && !etextAccessError, true)
      }

      let resLabel = getLangLabel(this,"",titlElem)

      //loggergen.log("ttlm",titlElem,otherLabels)
      
      let mapProps = [bdo+"placeRegionPoly", bdo+"placeLong", bdo+"placeLat" ]
                           
      let topProps = topProperties[_T]
      if(!topProps) topProps = []

      let midProps = midProperties[_T]
      if(!midProps) midProps = []

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

      let related = [], createdBy = [], wUrl = fullUri(this.props.IRI), serial, isSerialWork
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

         serial = this.getResourceElem(bdo+"serialHasInstance");
         if(!serial) serial = this.getResourceElem(bdo+"collectionMember");
         if(!serial) serial = this.getResourceElem(bdo+"corporationHasMember");

         const resType = this.getResourceElem(rdf+"type")
         isSerialWork = resType && resType.some(e=> e.value?.endsWith("SerialWork"))
         
         // #871 
         const isEtextCollection = serial && serial.some(k => k.value?.includes("/resource/IE")) ;
         const isInstanceCollection = serial && serial.some(k => k.value?.includes("/resource/MW")) ;

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

               let thumb = v.filter(k => k.fromKey && k.fromKey.startsWith(tmp+"thumbnailIIIFSe") || k.type && k.type.startsWith(tmp+"thumbnailIIIFSe"))
               if(thumb && thumb.length) thumb = thumb[0].value
               else thumb = null

               return {s,k,n,m,label,thumb};
            }
         }).filter(k => k)
         createdBy = _.orderBy(createdBy, ["n","m"], ["desc","asc"])

         //loggergen.log("rel:",related,createdBy)

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

         if(related.length && related.length > 4) { 
            let searchUrl = "/search?r="+this.props.IRI+"&t=Work&f=relation,inc,bdo:workIsAbout&f=relation,inc,bdo:workGenre"
            related.push(<Link class="search" to={searchUrl}>{I18n.t("misc.seeMore")}</Link>)
         }

         createdBy = createdBy.map( ({s,k,n,m,label,thumb},i) => {             
            this._refs["crea-"+i] = React.createRef();            
            let thumbUrl = thumb 
            if(thumbUrl) {
               if(!thumbUrl.match(/[/]default[.][^.]+$/)) thumbUrl += "/full/"+(thumb&&thumb.includes(".bdrc.io/")?"!2000,185":",185")+"/0/default.jpg"
               else thumbUrl = thumbUrl.replace(/[/]max[/]/,"/"+(thumbUrl.includes(".bdrc.io/")?"!2000,185":",185")+"/")            
            }
            return ( 
               <div ref={this._refs["crea-"+i]}>
                  <Link to={"/show/"+s}><div class={"header"+(thumb?" thumb":"") + (_T === "Product"?(isEtextCollection?" etext":" instance"):"")} style={{backgroundImage:"url("+thumbUrl+")"}}></div></Link>
                  <div><Link to={"/show/"+s}><span {...label.lang?{lang:label.lang}:{}}>{ label.value }</span></Link>{ label.lang && this.tooltip(label.lang) }</div>
                  {/* <Link to={"/show/"+s}>{I18n.t("misc.readM")}</Link> */}
               </div>
            )
         })

         if(createdBy.length && createdBy.length > 4) { 
            let searchUrl = "/search?r="+this.props.IRI
            if(_T === "Person") {
               searchUrl += "&t=Work&f=relation,exc,bdo:workIsAbout"
            } else if(_T === "Place" || serial && _T === "Work") {
               searchUrl += "&t=Instance"+(this.props.useDLD?"&f=inDLD,inc,tmp:available":"")
            } else if( _T === "Product") {
               searchUrl += "&t="+(isEtextCollection?"Etext":(isInstanceCollection?"Instance":"Scan"):"Scan")+(this.props.useDLD?"&f=inDLD,inc,tmp:available":"")
            } else if(_T === "Corporation") {
               searchUrl += "&t=Person"
            } else {
               searchUrl += "&t=Work"
            }

            createdBy.push(<Link class="search" to={searchUrl}>{I18n.t("misc.seeMore")}</Link>)
         }

      }

      let hasRel = ((related && related.length > 0)||(createdBy && createdBy.length > 0))
      if(!this.props.preview && (!hasRel || this.state.relatedTabAll) && !["Instance","Images","Etext"].includes(_T)) {
         // deprecated
         //if(this.props.assocResources && this.props.config &&  !this.props.assocTypes) this.props.onGetAssocTypes(this.props.IRI, "assocTypes")
      }  
      
      let onKhmerServer = (this.props.config && this.props.config.khmerServer)

      let all    
      if(this.props.assocTypes && this.props.assocTypes[this.props.IRI+"@"] && this.props.assocTypes[this.props.IRI+"@"].metadata) {
         if(serial || /* !onKhmerServer || */ _T !== "Work") all = Object.values(this.props.assocTypes[this.props.IRI+"@"].metadata).reduce( (acc,c) => acc+Number(c), 0)
         else {
            all = 0
            for(let k of Object.keys(this.props.assocTypes[this.props.IRI+"@"].metadata)) {
               if(!k.endsWith("Instance")) all += Number(this.props.assocTypes[this.props.IRI+"@"].metadata[k])
            }
         }
      }


      let allRel, t1 ;
      if(this.props.assocTypes && this.props.assocTypes[this.props.IRI+"@"] && this.props.assocTypes[this.props.IRI+"@"].metadata) {
         allRel = Object.keys(this.props.assocTypes[this.props.IRI+"@"].metadata).map(r => { 
            let v = Number(this.props.assocTypes[this.props.IRI+"@"].metadata[r])
            let t = r.replace(/^.*\/([^/]+)$/,"$1")
            if(!serial && /* onKhmerServer && */ t === "Instance" && _T === "Work") return 
            if(t == "Instance" && _T == "Product") t = "Scan"
            let url = "/search?r="+this.props.IRI+"&t="+t
            if(!t1) t1 = url
            return (<div>                                                                           
               <Link to={url}><div class={"header "+t.toLowerCase()}></div></Link>
               <div><Link to={url}><span lang={this.props.locale}>{I18n.t("misc.allT",{count:v,type:I18n.t("types."+t.toLowerCase(),{count:v})})}</span></Link></div>
               {/* <Link to={url}>{I18n.t("misc.seeR",{count:v})}</Link> */}
            </div>)
         }).filter(a => a)         
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
         let loca = this.props.location
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
                  //loggergen.log("max=",max,i)
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

      
      /*
      // new UX
      if(root && root.length) {
         inTitle  = [ 
            <h3 class="inT">
               <span>{I18n.t("misc.in")}{I18n.t("punc.colon")} </span> {this.uriformat(tmp+"in",root[0])}
               <Link {...this.props.preview?{ target:"_blank" }:{}} onClick={() => this.setState({opartinview:""})} to={"/show/"+shortUri(root[0].value)+"?part="+this.props.IRI} class="outL"><img src="/scripts/mirador/images/collecR.svg"/>{I18n.t("result.openO")}</Link>
            </h3>,
            //<br/>,
            //<h3 class="outline-link"><Link class="urilink" to={"/show/"+shortUri(root[0].value)+"?part="+this.props.IRI+"#outline"}>{"View in the outline"}</Link></h3>
         ]
      }
      */

      let searchUrl, searchTerm
      
      if(this.state.fromSearch) {
         let backTo = this.state.fromSearch, oldUrl = backTo
         if(oldUrl.startsWith("/show/")) {
            let get = qs.parse(oldUrl.replace(/^[^?]+[?]/,""))
            loggergen.log("old get:",get)
            if(get.s) { 
               oldUrl = get.s 
               backTo = oldUrl
            }
         }


         let decoded = "" 
         try {
            decoded = decodeURIComponent(oldUrl)
         } catch(e) {
            console.error("pb:",oldUrl)
         }
         if(decoded && (!decoded.startsWith("/show/") || decoded.includes("?")) && !decoded.startsWith(this.props.location.pathname)) {
            let withW = backTo.replace(/^.*[?&](w=[^&]+)&?.*$/,"$1")
            //loggergen.log("fromS",this.state.fromSearch,backTo,withW)
            if(backTo === withW) { 
               backTo = decodeURIComponent(backTo)
               searchUrl = backTo
               if(searchUrl.match(/q=/)) {
                  if(searchUrl?.startsWith("/search")) searchTerm = lucenequerytokeyword(decodeURIComponent(searchUrl.replace(/.*q=([^&]+).*/,"$1"))) 
                  else searchTerm = decodeURIComponent(searchUrl.replace(/.*q=([^&]+).*/,"$1")) 
               }    
               else if(searchUrl.match(/r=/))               
                  searchTerm = lucenequerytokeyword(searchUrl.replace(/.*r=([^&]+).*/,"$1")) 
               else if(searchUrl.match(/i=/))               
                  searchTerm = I18n.t("topbar.instances")+" "+searchUrl.replace(/.*i=([^&]+).*/,"$1") 
               else if(searchUrl.match(/id=/))               
                  searchTerm = searchUrl.replace(/.*id=([^&]+).*/,"$1")
               else if(searchUrl.match(/date=/))               
                  searchTerm = searchUrl.replace(/.*date=([^&]+).*/,"$1")
            }
            else { 
               backTo = decodeURIComponent(backTo.replace(new RegExp("(([?])|&)"+withW),"$2"))+"&"+withW
               searchUrl = backTo
               searchTerm = I18n.t("topbar.instances")+" "+searchUrl.replace(/.*i=([^&]+).*/,"$1")
            }
         } else {
            loggergen.log("backto:",oldUrl)
         }
      }


      
      let hasChunks = this.getResourceElem(bdo+"eTextHasChunk")

      let accessET = this.getResourceElem(adm+"access")
      if(accessET && accessET.filter(e => e.value.match(/(AccessFairUse)|(Restricted.*)$/)).length) accessET = false
      else accessET = true

      //loggergen.log("chunks?",hasChunks,accessET)

      let etextAccessError = !accessET || this.props.etextErrors && this.props.etextErrors[this.props.IRI] && [401, 403].includes(this.props.etextErrors[this.props.IRI])

      let resType = this.getResourceElem(rdf+"type"), topLevel = false
      if(resType && resType.some(e=> e.value?.endsWith("EtextInstance"))) {
         topLevel = true
         if(!this.state.openEtext) {
            let get = qs.parse(this.props.location.search), currentText, scope = this.props.IRI
            if(get.openEtext && get.openEtext != this.props.IRI) { 
               currentText = get.openEtext
               scope = get.scope || currentText                
            }
            this.setState({openEtext:true,currentText,scope})
            if(currentText) {
               this.props.onLoading("etext", true)
               this.props.onReinitEtext(currentText)
            }
            return null
         }
      }

      if(this.props.previewEtext || this.props.disableInfiniteScroll || topLevel || this.props.openEtext || hasChunks && hasChunks.length && this.state.openEtext) {
         
         let hasPages = this.getResourceElem(bdo+"eTextHasPage")
         let etextRes = this.getResourceElem(bdo+"eTextInInstance")         
         if(!etextRes?.length) etextRes = this.getResourceElem(bdo+"volumeOf") 
         if(etextRes && etextRes.length) etextRes = shortUri(etextRes[0].value)               
         else if(this.props.disableInfiniteScroll?.etextRes) etextRes = this.props.disableInfiniteScroll.etextRes    
         else if(this.props.disableInfiniteScroll?.outETinst?.length) etextRes = shortUri(this.props.disableInfiniteScroll.outETinst[0].value)
         else etextRes = null
         
         let etext_data = this.renderData(false, [!hasPages?bdo+"eTextHasChunk":bdo+"eTextHasPage"],iiifpres,title,otherLabels,"etext-data",undefined,undefined,
            this.props.disableInfiniteScroll&&etextRes?[<div class="etext-continue"><Link onClick={() => {                
               if(this.props.disableInfiniteScroll?.outETvol?.length) { 
                  const loadETres = shortUri(this.props.disableInfiniteScroll.outETvol[0].value)
                  this.props.onGetResource(loadETres)
                  this.props.onReinitEtext(loadETres, { startChar: this.props.disableInfiniteScroll.outETstart[0].value})                  
               }
            }} to={this.renderEtextLink(etextRes)}>{I18n.t("resource.continue")}</Link></div>]:[])
            
         if(topLevel || this.props.previewEtext) etextRes = this.props.IRI

         let etRefs 
         if(!this.props.eTextRefs && etextRes && topLevel && !this.props.previewEtext && !this.props.disableInfiniteScroll) {
            this.props.onGetETextRefs(etextRes);
         } else if(this.props.eTextRefs && this.props.eTextRefs !== true && !this.props.previewEtext && !this.props.disableInfiniteScroll) { 
            //extProps = extProps.filter(p => p !== bdo+"instanceHasVolume")
            etRefs = this.renderEtextRefs(accessET, etextRes)      
         }

         loggergen.log("eR:", topLevel, etextRes, this.state.currentText, hasPages, etext_data, this.props.eTextRefs, etRefs, this.props, this.state)

         let ETSBresults 
         if(this.state.ETSBresults) {
            ETSBresults = <div>{this.state.ETSBresults.map((r,i) => (
               <EtextSearchResult page={this.state.ETSBpage.page} vol={this.state.ETSBpage.vol} res={r} n={i} 
                  setETSBpage={(p,v,i) => { if(!this.state.ETSBpage || this.state.ETSBpage?.page != p || this.state.ETSBpage?.vol != v || this.state.ETSBpage?.idx != i) this.setState({ ETSBpage:{page:p, vol:v, idx:i } }) }}
                  getLabel={(l) => getLangLabel(this,bdo+"eTextHasPage",l)}
                  etextLang={this.props.etextLang}
               />
            ))}</div>
         }

         let monlamResults 
         if(!this.state.enableDicoSearch || this.props.disableInfiniteScroll) { 

         } else if(Array.isArray(this.props.monlamResults) && this.props.monlamResults.length > 0) { 
            let renderMonlamResults = (j, res) => res.map( (w,i) => { 
               let word = //w.word
                     getLangLabel(this,bdo+"eTextHasPage",[w.word]) 
               let def = w.def 
                     //getLangLabel(this, "", [w.def])
               let open = this.state.collapse["monlam-def-"+j+"-"+i] || res.length === 1 && this.state.collapse["monlam-def-"+j+"-"+i] === undefined
               let kw = getLangLabel(this,bdo+"eTextHasPage",[ { ...this.props.monlamKeyword }])
               if(kw?.value) kw = kw.value 
               else kw = this.props.monlamKeyword?.value                  
               kw = kw?.replace(/(^[ ་།/]+)|([ ་།/]+$)/g, "") 

               //loggergen.log("kw:",kw,word?.value)

               let hasCollapsible = false
               return <div class="def">
                  <b lang={word.lang} onClick={() => this.setState({collapse:{...this.state.collapse, ["monlam-def-"+j+"-"+i]:!open}})}>
                     <span>{
                        word?.value.includes("↦") 
                        ? highlight(word?.value)
                        : word?.value.split(kw).map((v,j) => <>{j > 0 ? <span className="kw">{kw}</span>:null}<span>{v}</span></>)
                     }</span>
                     <ExpandMore className={open?"on":""}/>
                  </b>
                  <Collapse timeout={0} className={open?"collapse-on":""} in={open}>{HTMLparse("<div><div><div>"+def?.value?.split(/[\r\n]+/).map(d => { 
                     let val = addMonlamStyle(d)
                     val = getLangLabel(this,bdo+"eTextHasPage",[{value: val, lang: "bo"}]) 
                     if(val?.value) {
                        //loggergen.log("?", val?.value,val?.value?.replace(/((>) *\] *)|( *\[ *(<))/g,"$2 $4"))
                        //return <span>{HTMLparse(val?.value?.replace(/((>) *\] *)|( *\[ *(<))/g,"$2 $4"))}</span>
                        let res = ""+val?.value?.replace(/((>) *\] *)|( *\[ *(<))/g,"$2 $4")
                        if(hasCollapsible) res += "</div></div>"
                        hasCollapsible = val.value.includes("dhtmlgoodies_answer")
                        //if(!hasCollapsible) res += "</span>"
                        return res
                     }
                  }).join("")+"</div></div></div>")}</Collapse>
               </div>
            })
            let results = [ 
               renderMonlamResults(0, this.props.monlamResults.filter(m => !m.type ||["e","c"].includes(m.type))),
               renderMonlamResults(1, this.props.monlamResults.filter(m => ["k"].includes(m.type))),
               renderMonlamResults(2, this.props.monlamResults.filter(m => ["d"].includes(m.type)))
            ]


            const firstNonZero = results[0].length ? 0 : results[1].length ? 1 : results[2].length ? 2 : -1,
               selectedIndex = this.state.monlamTab || firstNonZero, 
               onSelect = (i) => this.setState({monlamTab: i == this.state.monlamTab || this.state.monlamTab == undefined && i == firstNonZero ? -1 : i}),
               isSelected = (n) => selectedIndex == n ? "on" : "" 

            monlamResults = <Tabs {...{selectedIndex, onSelect}} >
               <Tab {...{className: isSelected(0)}} {...results[0].length == 0 ? {"disabled":true}:{}}>{I18n.t("viewer.monlamExact",{count: results[0].length})}</Tab>
               <TabPanel>{results[0]}</TabPanel>
               <Tab {...{className: isSelected(1)}} {...results[1].length == 0 ? {"disabled":true}:{}}>{I18n.t("viewer.monlamContain",{count: results[1].length})}</Tab>
               <TabPanel>{results[1]}</TabPanel>
               <Tab {...{className: isSelected(2)}} {...results[2].length == 0 ? {"disabled":true}:{}} >{I18n.t("viewer.monlamDef",{count: results[2].length})}</Tab>
               <TabPanel>{results[2]}</TabPanel>
            </Tabs>

            
         } else if(this.props.monlamResults && this.props.monlamResults != true) {
            monlamResults = <div  className="monlam-no-result">Nothing found for "<span>{this.props.monlamKeyword?.value}</span>".</div>
         } else if(this.state.monlam && this.state.collapse.monlamPopup) {
            monlamResults = <div></div>
         }
         //loggergen.log("monlamR:",monlamResults,this.props.monlamResults)

      
         // TODO fix loader not hiding when closing then opening again

         const monlamVisible = this.state.enableDicoSearch && (this.state.monlam && this.state.collapse.monlamPopup || monlamResults)

         if(this.props.previewEtext) { 
            let vols
            if(!this.state.currentText && !this.props.previewEtext?.outETvol?.length) {
               // just get the first volume
               vols = this.getResourceElem(bdo+"instanceHasVolume")
               if(vols?.length){
                  vols = _.orderBy(vols.map(v => {
                     return ({ v, n:this.getResourceElem(bdo+"volumeNumber", shortUri(v.value), this.props.assocResources)?.[0]})
                  }).filter(f => f.n != undefined).map(f => ({f, n:Number(f.n.value)})), ["n"], ["asc"])
                  console.log("vols:",vols)
               }
            }
            return (<>            
               { this.state.currentText || this.props.previewEtext?.outETvol?.length || vols?.length
                  ? <>
                     <ResourceViewerContainer  auth={this.props.auth} location={this.props.location} navigate={this.props.navigate} /*history={this.props.history}*/ IRI={this.state.currentText ?? (vols?.length ? shortUri(vols[0].f.v.value) : shortUri(this.props.previewEtext?.outETvol?.[0]?.value ?? ""))} openEtext={true} openEtextRefs={false} disableInfiniteScroll={vols?.length ? {etextRes:this.props.IRI,outETscope:this.props.IRI, outETvol:[vols[0].f.v], outETstart:[{value:1}] } : this.props.previewEtext} that={this}/> 
                  </>
                  : this.props.etextErrors?.[this.props.IRI] 
                     ? <h4><div class="images-thumb-links"  data-n={4} style={{ marginLeft:0 }}><a class="urilink nolink"><BlockIcon style={{width:"18px",verticalAlign:"top"}}/>&nbsp;{I18n.t("access.errorE")}</a></div></h4>
                     : <Loader className="etext-viewer-loader preview" loaded={false}  //options={{position:"fixed",left:"calc(200px)",top:"50%"}} 
                  />      
               }
            </>) 
         } else if(topLevel) { 
            const outline = <>
               <SimpleBar class={"resource etext-outline "+(this.state.collapse.etextRefs ? "withOutline-false":"withOutline-true")}>
               { etRefs }          
               </SimpleBar>
               {this.state.collapse.etextRefs && <IconButton width="32" className="show-outline-etext" onClick={() => this.setState({collapse:{...this.state.collapse,etextRefs:false}})}><img src="/icons/collecN.svg" /></IconButton>}
            </>
            return (<>            
               {getGDPRconsent(this)}
               {top_right_menu(this,title,searchUrl,etextRes,null,this.props.location)}                       
                  { this.state.currentText 
                     ? <ResourceViewerContainer auth={this.props.auth} /*history={this.props.history}*/ location={this.props.location} navigate={this.props.navigate} IRI={this.state.currentText} openEtext={true} openEtextRefs={!this.state.collapse.etextRefs} topEtextRefs={outline} that={this}/> 
                     : <>
                        { outline }
                        <Loader className="etext-viewer-loader" loaded={!this.props.loading} 
                           {...!this.props.disableInfiniteScroll ? {options:{position:"fixed",left:"calc(50% + 200px)",top:"50%"}}:{}}
                        />      
                     </>
                  }
               </>) 
         }
         else return ([            
            this.renderEtextNav(etextAccessError),
            this.props.topEtextRefs,
            <div class={(monlamResults ? "withMonlam " : "")+(this.props.openEtextRefs ? "withOutline ":"")+(this.state.ETSBresults && !this.state.collapse.ETSBresults ? "withETSBresults ":"")}>               
               { monlamResults && <link rel="stylesheet" href="https://monlamdictionary.com/files/css/basic.css" /> }               
               { this.renderMirador(isMirador) }           
               <div class="resource etext-view" >                                    
                  { this.props.disableInfiniteScroll && etextRes && !etextAccessError && <>
                     <div style={{ lineHeight:"23px"}}>
                      { this.renderOCR(<Trans i18nKey="access.OCRnew" components={{ bold: <b style={{ fontWeight:600 }}/>, nl: <br /> }} />) }
                     </div>
                     <div class={"etext-top-links"}>
                        <Link to={this.renderEtextLink(etextRes)} onClick={() => { 
                           if(this.props.disableInfiniteScroll?.outETvol?.length) {
                              const loadETres = shortUri(this.props.disableInfiniteScroll.outETvol[0].value)
                              this.props.onGetResource(loadETres)
                              this.props.onReinitEtext(loadETres, { startChar: this.props.disableInfiniteScroll.outETstart[0].value})                  
                           }
                        }}>{I18n.t("resource.openViewer")}</Link>
                        { this.renderEtextDLlink(etextAccessError, true) }
                     </div> 
                  </>}
                  <div class="">
                     { //(this.props.disableInfiniteScroll ? this.props.loading?.startsWith && this.props.loading?.startsWith("etext") : this.props.loading ) 
                         this.props.loading && <Loader className="etext-viewer-loader"  loaded={!this.props.loading}  
                           {...!this.props.disableInfiniteScroll ? {options:{position:"fixed",left:"calc(50% + 200px)",top:"50%"}}:{}}
                        />  }
                     { this.unpaginated() && !this.props.disableInfiniteScroll && <h4 style={{fontSize:"16px",fontWeight:600,textAlign:"center", marginBottom:"50px",top:"20px"}}>{I18n.t("resource.unpag")}</h4>}
                     { !this.props.disableInfiniteScroll && etextAccessError && <h4 style={{fontSize:"16px",fontWeight:600,textAlign:"center",marginTop:"80px"}}>
                        <><img style={{height:"50px", verticalAlign:"middle", marginRight:"10px"}} src="/icons/unknown.svg"/><Trans i18nKey="access.fairuseEtext" components={{ bold: <u /> }} /></>
                     </h4> }
                     { !etextAccessError && (!this.props.disableInfiniteScroll?.outETvol?.length ? etext_data : <div onClick={() => {
                        const loadETres = shortUri(this.props.disableInfiniteScroll.outETvol[0].value)
                        this.props.onGetResource(loadETres)
                        this.props.onReinitEtext(loadETres, { startChar: this.props.disableInfiniteScroll.outETstart[0].value})                  
                        this.props.navigate(this.renderEtextLink(etextRes))
                     }}>{etext_data}</div>)}
                     { this.props.disableInfiniteScroll && etextAccessError && <h4  style={{ lineHeight:"23px" }}>
                        <div class="images-thumb-links"  data-n={5} style={{ marginLeft:0 }}>
                           <a class="urilink nolink noIA"><BlockIcon style={{width:"18px",verticalAlign:"top"}}/>{I18n.t("access.restrictedC")}</a>
                           <div class="data access generic"><h3><span style={{ textTransform: "none", width: "100%" }}><Trans i18nKey="access.fairuseEtext" components={{ bold: <span style={{ textTransform: "none"}} /> }}/></span></h3></div>
                        </div>
                     </h4> } 
                  </div>                     
               </div>
               {!this.props.disableInfiniteScroll && <GenericSwipeable classN={"monlamResults "+(monlamVisible ? "visible" : "")} onSwipedRight={() => { 
                     this.setState({noHilight:false, monlam:null, collapse:{ ...this.state.collapse, monlamPopup: true }})
                     this.props.onCloseMonlam()
                  }}>                  
                  <SimpleBar>
                     <h2>
                        <a href="https://monlamdic.com" target="_blank" rel="noopener noreferrer"><img width="32" src="/icons/monlam.png" title="monlamdic.com"/></a>
                        <a href="https://monlamdic.com" target="_blank" rel="noopener noreferrer">{I18n.t("viewer.monlamTitle")}</a>
                        {/* <a href="https://monlamdic.com" target="_blank" rel="noopener noreferrer"><img width="32" src="/icons/monlam.png" title="monlamdic.com"/></a> */}
                        <Close width="32" onClick={() => { 
                           this.setState({noHilight:false, monlam:null, collapse:{ ...this.state.collapse, monlamPopup: true }})
                           this.props.onCloseMonlam()
                        }}/>
                     </h2>
                     { this.props.monlamResults == true && <Loader  /> }
                     { monlamResults }
                  </SimpleBar>
               </GenericSwipeable> }
               { !this.props.disableInfiniteScroll && <GenericSwipeable classN={"ETSBresults "+(!monlamVisible && this.state.ETSBresults&&!this.state.collapse.ETSBresults? "visible" : "")} onSwipedRight={() => { 
                     this.setState({ collapse:{ ...this.state.collapse, ETSBresults: true }})
                  }}>
                  <SimpleBar>
                     { ETSBresults }
                  </SimpleBar>
               </GenericSwipeable> }
            </div>,
         ])
      }
      else {

         let legal = this.getResourceElem(adm+"metadataLegal"), legalD, sameLegalD
         if(legal && legal.length) legal = legal.filter(p => !p.fromSameAs)
         if(legal && legal.length && legal[0].value && this.props.dictionary) { 
            legalD = this.props.dictionary[legal[0].value]
            sameLegalD = legalD
         }
         let { same, noS } = this.prepareSame(kZprop.filter(k => k.startsWith(adm+"seeOther")), sameLegalD)
         let otherResourcesData = this.otherResources(same,"permalink",noS)

         // #851
         let listWithAS = [ ], tmpElem = this.getResourceElem(tmp+"outlineAuthorshipStatement")
         if(!tmpElem?.length && this.props.outlines && this.props.outlines[this.props.IRI]) {
            listWithAS = [ tmp+"outlineAuthorshipStatement" ]
         }

         let hasMap = kZprop.filter(k => mapProps.includes(k))
         let header = this.renderHeader(hasMap, _T, etextUT, root)
         
         let theOutline, showOutline = this.state.collapse.containingOutline || this.state.collapse.containingOutline === undefined && this.props.outlineKW
         if((!root || !root.length) && (!this.props.outlineOnly || showOutline)) theOutline = this.renderOutline()      

         if(theOutline && !this.props.outlineOnly) {
            //theOutline = <div data-prop="tmp:outline"><h3><span>Outline:</span></h3><div class="group">{theOutline}</div></div>
         }


         let iof = this.getResourceElem(bdo+"instanceOf")
         if(iof?.length) iof = shortUri(iof[0].value)
         else iof = null

         let findText
         if(![/*"Instance",*/ "Images", "Etext"].includes(_T) && (_T != "Work" || serial?.length || isSerialWork) && (_T != "Instance" || this.getResourceElem(bdo+"workHasInstance")?.length && (!this.props.loading||this.state.collapse["findText-"+this.props.IRI]) )) {            
            findText = <InnerSearchPageContainer isOtherVersions={_T === "Instance"} srcVersionID={_T === "Instance" ? this.props.IRI.split(":")[1] : undefined} location={this.props.location} /*history={this.props.history}*/ auth={this.props.auth} isOsearch={true} RID={iof ?? this.props.IRI} T={_T} />          
            if(_T == "Instance") {
               if(!this.state.collapse["findText-"+this.props.IRI]) this.setState({collapse:{...this.state.collapse,["findText-"+this.props.IRI]:true}})
               findText = <div data-prop="tmp:workHasInstance" class="">                  
                  <h3><span>{this.proplink(bdo+"workHasInstance",null,2)}{I18n.t("punc.colon")}</span> </h3>
                  <div class="group">
                     {findText}
                  </div>
               </div>
            }
         }
         let theDataTop = this.renderData(false, topProps,iiifpres,title,otherLabels,"top-props","main-info",versionTitle?[this.renderGenericProp(versionTitle, _tmp+"versionTitle", this.format("h4",_tmp+"versionTitle","",false,"sub",[{...versionTitle, type:"literal"}]))]:[],[], { [_tmp+"outline"]: theOutline, [_tmp+"map"]: hasMap.length ? header : undefined, [_tmp+"findText"]: _T != "Instance" && hasMap.length ? findText : undefined})      

         console.log("serial:", serial)

         if(hasMap.length) findText = undefined

         let { html: theDataMid, nbChildren: midPropsLen }= this.renderData(true, midProps,iiifpres,title,otherLabels,"mid-props", undefined, otherResourcesData, [], {[_tmp+"workHasInstance"]: _T === "Instance" ? findText : undefined}) ?? {}
         let theDataBot = this.renderData(false, kZprop.filter(k => !topProps.includes(k) && !midProps.includes(k) && !extProps.includes(k)).concat(listWithAS),iiifpres,title,otherLabels,"bot-props", undefined)      

         let theEtext
         if(this.props.eTextRefs && this.props.eTextRefs !== true && this.props.IRI && this.props.IRI.startsWith("bdr:IE")) { 
            extProps = extProps.filter(p => p !== bdo+"instanceHasVolume")
            theEtext = this.renderEtextRefs(accessET)      
         }

         let theDataExt = this.renderData(false,extProps,iiifpres,title,otherLabels,"ext-props")      
         let theDataLegal = this.renderData(false,[adm+"metadataLegal"],iiifpres,title,otherLabels,"legal-props")      
         
         if(this.props.outlineOnly) {            
            return <>
               <div  data-prop={"tmp:containingOutline"} >               
                  <h3><span>{this.proplink(_tmp+"containingOutline",null,1)}{I18n.t("punc.colon")}</span> </h3>
                  <div class="group">
                     <a class="ulink prefLabel containing-outline" href="#" 
                        onClick={(ev) => { 
                           this.setState({collapse:{...this.state.collapse, containingOutline:!(this.state.collapse.containingOutline ?? showOutline)}})

                           if(!(this.state.collapse.containingOutline ?? showOutline)) {
                              if(this.props.resources && !this.props.resources[this.props.IRI] /*&& this.state.collapse.containingOutline*/) this.props.onGetResource(this.props.IRI);
                           }

                           ev.preventDefault()
                           ev.stopPropagation()
                        }}  
                     >
                        { showOutline ? I18n.t("resource.closeO") : I18n.t("resource.seeIn",{txt: ilabel?.value ?? I18n.t("index.outline")}) }
                     </a>     
                     { this.props.part && <Link {...this.props.preview?{ target:"_blank" }:{}} to={"/show/"+this.props.IRI} class="ulink prefLabel containing-outline" >{I18n.t("resource.openR")}</Link> }         
                  </div>
               </div>             
               { showOutline && theOutline }
            </>
         }


         let etext = this.isEtext(), etextRes = etext ? this.getResourceElem(bdo+"eTextInInstance") : false, backToET = etextRes?.length ? shortUri(etextRes[0].value) : this.props.IRI
         if(etext && !this.props.eTextRefs) { 
            if(!etextRes || !etextRes.length) this.props.onGetETextRefs(this.props.IRI);
         }

         let loca = this.props.location            

         let rView = true, iOutline, wDataExt, iDataExt, rDataExt, checkDataExt = (rid) => {            
            let sRid = shortUri(rid)
            for(let p of extProps) { 
               let ret = this.getResourceElem(p, sRid, this.props.resources, rid) 
               //loggergen.log("rid:",sRid,p,ret)
               if(ret && ret.length) return true
            }
            return false
         }

         if(this.state.title.work?.length && this.state.title.work[0].value) wDataExt = checkDataExt(this.state.title.work[0].value)
         if(this.state.title.instance?.length && this.state.title.instance[0].value) { 
            iDataExt = checkDataExt(this.state.title.instance[0].value)
            let sRid = shortUri(this.state.title.instance[0].value)               
            if(this.props.outlines && this.props.outlines[sRid] !== undefined  && this.props.outlines[sRid]) {
               if(this.props.outlines[sRid]["@graph"] &&  this.props.outlines[sRid]["@graph"].filter &&  this.props.outlines[sRid]["@graph"].filter(n => n.hasPart).length) iOutline = true
            }
            else if(this.props.config && this.state.outlinePart) {
               let hasPartB = this.getResourceElem(tmp+"hasNonVolumeParts")
               loggergen.log("hasPartB:",hasPartB,sRid)
               if(hasPartB?.length && hasPartB[0].value == "true") this.props.onGetOutline(sRid, { "tmp:hasNonVolumeParts": true})
               else this.props.onGetOutline(sRid)
            }
         }
         if(this.state.title.images?.length && this.state.title.images[0].value) {
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
            if(fUT && fUT.length) { 
               let shUri = shortUri(fUT[0].value)
               etextUT = "/show/"+shUri
               etextAccessError = etextAccessError || this.props.etextErrors && this.props.etextErrors[shUri] && [401, 403].includes(this.props.etextErrors[shUri])
            }
            if(fVol && fTxt && (this.props.eTextRefs && this.props.eTextRefs !== true && !this.props.eTextRefs.mono)) etextLoca = I18n.t("resource.openVolViewer", {VolN:etextVolN}) // not sure we need this:  TxtN:etextTxtN
            if(this.props.location.hash == "#open-reader") { //} && this.state.fromSearch) {

               let loca = { ...this.props.location, hash:"#open-viewer", pathname: etextUT } //, search:"?backToEtext="+encodeURIComponent(this.state.fromSearch) }
               this.props.navigate(loca, {replace: true})

            }
         }

         let scrollRel = (ev,next,smooth) => { 
            let rel = $(".resource .data.related > div:first-child > div:last-child") 
            let div = rel.find(".rel-or-crea > div:first-child")
            let nb = Math.floor(rel.width()/(div.width()+Number((""+div.css("margin-right")).replace(/[^0-9]+/g,"")))) // 4 = default in desktop
            //loggergen.log("rel:",nb,rel,div,next,ev)
            let idx = !this.state.relatedTab&&related.length?"rel":"crea"
            let max = !this.state.relatedTab&&related.length?related.length:createdBy.length
            let i = (this.state["i"+idx]!==undefined?this.state["i"+idx]:0)
            if(next) i+=nb ;
            else i-=nb ;
            if(i > max) i = max
            else if(i < 0) i = 0
            if(this._refs[ idx + "-" + i ]?.current) {
               //loggergen.log("i:",next,i,max,idx,this._refs[idx + "-" + i].current,this._refs)
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
            /*
            let elem = this.getResourceElem(bdo+"personEvent")
            if(elem && elem.length) {
               let birth = elem.filter(e => e.k && e.k.endsWith("PersonBirth")).map(e => this.getResourceBNode(e.value));
               if(birth.length) birth = birth[0]
               let death = elem.filter(e => e.k && e.k.endsWith("PersonDeath")).map(e => this.getResourceBNode(e.value));
               if(death.length) death = death[0]
               //loggergen.log("dates:",birth,death,elem)
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
               if(vals.length > 1) dates = <span class='date'>{vals}</span> ;
            }
            */

            const prep = (obj) => {
               let ret = []
               for(let k of [ bdo+"onYear", bdo+"notBefore", bdo+"notAfter", bdo+"eventWhen" ]) {
                  if(obj[k]) for(let v of obj[k]) {
                     const edtf = v.edtf
                     ret.push({ type:k, value: v.value, edtf })
                  }   
               }
               return ret
            }

            let elem = this.getResourceElem(bdo+"personEvent")
            if(elem && elem.length) {
               let birth = [], death = [], floruit = [] 
               for(let e of elem) {
                  if(e.k) {
                     if(e.k.endsWith("Birth")) birth = birth.concat(prep(this.getResourceBNode(e.value)))
                     else if(e.k.endsWith("Death")) death = death.concat(prep(this.getResourceBNode(e.value)))
                     else if(e.k.endsWith("Floruit")) floruit = floruit.concat(prep(this.getResourceBNode(e.value)))
                  }                  
               }
               const vals = renderDates(birth, death, floruit, this.props.locale)
               if(vals.length >= 1) dates = <span class='date'>{vals}</span> ;
            }
         }


         let infoPanelR
         if(this.props.config && this.props.config.msg && !this.props.preview && !this.props.simple) {
            infoPanelR = this.props.config.msg.filter(m => m.display && m.display.includes("resource"))            
            if(infoPanelR && infoPanelR.length) infoPanelR = renderBanner(this, infoPanelR, true)
         }

   
         let sendMsg = (ev,prevent = false) => {

            if(this.props.simple /*&& this.props.propid*/) {
               let otherData = { "tmp:type": this.getResourceElem(rdf+"type").map(e => shortUri(e.value)) }, prettId = this.props.IRI;
               
               if(_T === "Person") {
                  let pEv = this.getResourceElem(bdo+"personEvent")
                  if(pEv) for(let p of pEv) {
                     let elem = this.getResourceBNode(p.value)                     
                     //loggergen.log("elem:",p.value,elem)
                     if(elem) {
                        let prop = elem[rdf+"type"]
                        if(prop && prop.length) prop = shortUri(prop[0].value, true)
                        else prop = false
                        if(prop) {
                           let data                            
                           [bdo+"onYear", bdo+"notBefore", bdo+"notAfter", bdo+"eventWhere" /*, bdo+"eventWhen"*/].map(e => { // DONE: fix editor crash
                              if(!data) data = {}
                              if(elem[e] && elem[e].length) data[shortUri(e,true)] = shortUri(elem[e][0].value)
                              //loggergen.log("data?",JSON.stringify(data))
                           })
                           if(data) { 
                              if(!otherData[prop]) otherData[prop] = []
                              otherData[prop].push(data)
                           }
                        }
                     }
                  }
               }
               
               // TODO add altLabel/prefLabel from sameAs (related to #438)
               let labels = this.getResourceElem(skos+"prefLabel")
               let alt = this.getResourceElem(skos+"altLabel")
               if(!labels) labels = []
               let msg = 
                  '{"@id":"'+prettId+'"'
                  +',"skos:prefLabel":'+JSON.stringify(labels
                     .filter(p => !p.fromSameAs || p.allSameAs && p.allSameAs.length && p.allSameAs.filter(a => a.startsWith(bdr)).length)
                     .map(p => ({"@value":p.value,"@language":p.lang})))
                  +(alt?.length?',"skos:altLabel":'+JSON.stringify(alt
                        .filter(p => !p.fromSameAs || p.allSameAs && p.allSameAs.length && p.allSameAs.filter(a => a.startsWith(bdr)).length)
                        .map(p => ({"@value":p.value,"@language":p.lang}))):"")
                  +',"tmp:keyword":{"@value":"'+this.props.IRI+'","@language":""}'
                  +',"tmp:propid":"'+this.props.propid+'"'
                  +(otherData?',"tmp:otherData":'+JSON.stringify(otherData):'')
                  +'}'
               //loggergen.log("(MSG)",this.props.propid,JSON.stringify(otherData,null,3),msg)
               window.top.postMessage(msg, "*") // TODO set target url for message
               if(ev && prevent) {
                  ev.preventDefault()
                  ev.stopPropagation()
                  return false;
               }
            }
         }

         
         if(this.props.loading || !this.props.resources || !this.props.resources[this.props.IRI] || !this.props.resources[this.props.IRI][fullUri(this.props.IRI)]) {
            
         } else {
            // DONE: automatically select when close popup
         
            if(this.props.simple /*&& !this.props.onlyView*/ && !this.state.onlyView) { 
               
               window.addEventListener("message",(mesg) => {
                  loggergen.log("MSG:",mesg)
                  if(mesg?.data === "click") sendMsg()
               })
               this.setState({ onlyView: true})
               
               /*
               setTimeout(() => { 
                  $(".resource.simple").click() 
               }, 1500)
               */
            }
         }

         const hasTabs = [wTitle,iTitle,rTitle].filter(e=>e).length > 1 ? " hasTabs ": ""

         if(this.props.useDLD) {            
            window.top.postMessage(JSON.stringify({label:getLangLabel(this,"",titleRaw.label)}),"*")
         }

         let staticRegExp = new RegExp("^(latest|"+Object.keys(staticQueries).join("|")+").*"),
            fromStaticRoute = searchUrl?.match(staticRegExp)
         if(fromStaticRoute) { 
            fromStaticRoute = searchUrl.replace(staticRegExp,"$1")
            if(fromStaticRoute != "latest") searchTerm = I18n.t("home."+fromStaticRoute).toLowerCase()
         }

         let tablist = [
            <>{ (related.length > 0) && <Tab onClick={(ev)=>this.setState({relatedTab:false,relatedTabAll:false,irel:0,icrea:0})}>{I18n.t(_T=== "Place"?"resource.wAbout":"resource.about",{resLabel, count:related.length, interpolation: {escapeValue: false}})} </Tab> }</>,
            <>{ (createdBy.length > 0) && <Tab onClick={(ev)=>this.setState({relatedTab:true,relatedTabAll:false,irel:0,icrea:0})}>{I18n.t(_T=== "Place"?"resource.printedA":(_T==="Corporation"?"resource.memberO":(_T==="Product"?"index.relatedM":(_T==="Work"&&serial?"index.relatedS":"resource.createdB"))),{resLabel, count:createdBy.length, interpolation: {escapeValue: false}})}</Tab> }</>,
         ], tabpanels = [
            <>{ (related.length > 0) &&  <TabPanel><div class={"rel-or-crea"}>{related}</div></TabPanel> }</>,
            <>{ (createdBy.length > 0) && <TabPanel><div class={"rel-or-crea"+(_T==="Corporation"?" person":"")}>{createdBy}</div></TabPanel> }</>,
         ]

         if(_T == "Person") {
            tablist = tablist.filter(t => t).reverse()
            tabpanels = tabpanels.filter(t => t).reverse()            
         } 

         
         return (
         [getGDPRconsent(this),   
         <Helmet>
            <link rel="canonical" href={"https://library.bdrc.io"+this.props.location.pathname} />
         </Helmet>,
         top_right_menu(this, null, null, null, isMirador, this.props.location),
         // <Loader className="resource-viewer-loader" loaded={false}  options={{position:"fixed",left:"50%",top:"50%"}} />,
         <div class={isMirador?"H100vh OF0":""}>
            { ["Images","Instance"].includes(_T) && <abbr class="unapi-id" title={this.props.IRI}></abbr> }
            { infoPanelR }
            <div {...searchUrl?{"data-searchUrl":searchUrl}:{}} className={"resource "+hasTabs+getEntiType(this.props.IRI).toLowerCase() + (this.props.simple?" simple":"") + (this.props.preview?" preview":"") /*+(!this.props.portraitPopupClosed?" portrait-warn-on":"")*/} {...this.props.simple?{onClick:sendMsg}:{}}>                                             
               {searchUrl && <div class="ariane" >
                  <Link to={searchUrl} /*onClick={(ev) => {
                     this.props.onLoading("search",true)                     
                     
                     let pathname = "/osearch/search"
                     if(fromStaticRoute){
                        pathname = "/"+fromStaticRoute
                        searchUrl = searchUrl.replace(new RegExp(fromStaticRoute+"[?]"),"")
                     }                     

                     setTimeout(() => { 
                           //this.props.navigate({pathname,search:"?"+searchUrl}) ; 
                           this.props.navigate(searchUrl) ; 
                     }, 100)

                     ev.preventDefault()
                     ev.stopPropagation();
                     return false
                  }}*/
                  ><img src="/icons/FILARIANE.svg" /><span>{searchUrl.startsWith("latest")?I18n.t("home.new").toLowerCase():I18n.t("topbar."+(searchTerm?"results":"resultsNoKW"))} <span>{searchTerm}</span></span></Link>
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
                  {/* { this.renderAnnoPanel() } */}
                  { this.renderWithdrawn() }             
                  <div class="title">{ wTitle }{ iTitle }{ rTitle }</div>
                  { /* header */ }
                  { (etext && !orig) && <div class={"data open-etext"+(etextAccessError?" disable":"")}><div><Link to={etextUT+(etextUT.includes("?")?"&":"?")+"backToEtext="+backToET+"#open-viewer"}>{etextLoca}</Link></div></div> }
                  { (etext && orig) && <div class="data open-etext"><div><a target="_blank" href={orig}>{I18n.t("resource.openO",{src:prov})}<img src="/icons/link-out_.svg"/></a></div></div> }
                  <div class={"data" + (_T === "Etext"?" etext-title":"")+(_T === "Images"?" images-title":"")}>
                     {_T === "Images" && iTitle?[<h2 class="on intro">{I18n.t("resource.scanF")}</h2>,iTitle]
                      :(_T === "Etext" && iTitle?[<h2 class="on intro">{I18n.t("resource.etextF")}</h2>,iTitle]
                       :(_T === "Etext" && wTitle?[<h2 class="on intro">{I18n.t("resource.etextF")}</h2>,wTitle]
                       :title))}
                     {inTitle}
                     {dates}
                     {/* { ( _T === "Person" && createdBy && createdBy.length > 0 ) && <div class="browse-by"><Link to={"/search?r="+this.props.IRI+"&t=Work"}><img src="/icons/sidebar/work_white.svg"/>{I18n.t("resource.assoc")}</Link></div> } */}
                     { this.props.preview && <a href={"/show/"+this.props.IRI} target="_blank">{I18n.t("resource.fullR")}<img src="/icons/link-out.svg"/></a>}
                  </div>
                  { this.props.preview && _T === "Place" && <div class="data" id="map">{this.renderData(false, kZprop.filter(k => mapProps.includes(k)),null,null,null,"header")}</div> }
                  
                  {/*                   
                  { _T !== "Etext" && this.renderQuality() }
                  { _T === "Etext" && this.renderEtextAccess(etextAccessError) }
                  { _T === "Etext" && this.renderOCR() }
                  { _T !== "Etext" && this.renderNoAccess(fairUse) }
                  */}
                  
                  { this.renderMirador(isMirador) }                            

                  { theDataTop }
                  
                  { !["Instance", "Scan", "Etext"].includes(_T) && findText != null && <>
                     {/* // DONE: inner search results */}
                     <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/instantsearch.css@7/themes/satellite-min.css" />                           
                     { findText }
                   </>}

                  <div class="data" id="perma">{ this.perma_menu(pdfLink,monoVol,fairUse,kZprop.filter(k => k.startsWith(adm+"seeOther")), accessET && !etextAccessError)  }</div>
                  { theDataMid }
                  { theDataBot }
                  { ( /*hasRel &&*/ false && !this.props.preview && this.props.assocResources && !["Instance","Images","Etext"].includes(_T)) &&
                     <div class="data related" id="resources" data-all={all}>
                        <MySwipeable scrollRel={scrollRel}>
                           <div><h2>{I18n.t(true || _T=== "Place"||_T==="Corporation"?"index.relatedR":(_T==="Product"?"index.relatedM":(_T==="Work"&&serial?"index.relatedS":"index.related")))}</h2>{/* ( ( (this.state.relatedTabAll||!related.length&&!createdBy.length)&&t1) || related && related.length > 4 || createdBy && createdBy.length > 4) && <Link to={(this.state.relatedTabAll||!related.length&&!createdBy.length)&&t1?t1:("/search?t="+(_T==="Corporation"&&(this.state.relatedTab||!related.length)?"Person":(_T==="Place"&&this.state.relatedTab?"Instance":(_T==="Product"?"Scan":"Work")))+"&r="+this.props.IRI)}>{I18n.t("misc.seeA")}</Link> */}</div>
                           { /*(related && related.length > 0 && (!createdBy  || !createdBy.length)) && <div class="rel-or-crea">{related}</div>*/}
                           { /*(createdBy && createdBy.length > 0 && (!related  || !related.length)) && <div class={"rel-or-crea"+(_T==="Corporation"?" person":"")}>{createdBy}</div> */}
                           { /*(related.length > 0 && createdBy.length > 0) && */ 
                           <div>
                              <Tabs>
                                 <TabList>
                                    {tablist}
                                    <Tab onClick={(ev)=>this.setState({relatedTab:false,relatedTabAll:true,irel:0,icrea:0})}>{I18n.t(all=== undefined?"misc.all":"misc.allC",{count:all})} </Tab>
                                 </TabList>
                                 {tabpanels}                                    
                                 <TabPanel>
                                    <div class={"rel-or-crea all"+(allRel && !allRel.length?" noAssoc":"")}>
                                    { this.props.loading && <Loader loaded={false} /> }
                                    { !this.props.loading && allRel }
                                    { !this.props.loading && allRel !== undefined && !allRel.length && <p>{I18n.t("resource.noAssoc")}</p>}
                                    </div>
                                 </TabPanel>
                              </Tabs>
                           </div>
                           }
                        </MySwipeable>
                        { 
                           (!this.state.relatedTab && !this.state.relatedTabAll && related.length > 4 || this.state.relatedTab && createdBy.length > 4 || !this.state.relatedTabAll && !related.length && createdBy.length > 4) &&
                           <div id="related-nav" >
                              <span class={!this.state.relatedTab&&related.length?(this.state.irel>0?"on":""):(this.state.icrea>0?"on":"")} onClick={(ev) => scrollRel(ev)}><img src="/icons/g.svg"/></span>
                              <span class={navNext?"on":""} onClick={(ev) => scrollRel(ev,true)}><img src="/icons/d.svg"/></span>
                           </div>
                        }
                     </div> 
                  }         
                  { (!(etext && orig)) && theEtext }
                  { theDataLegal }
                  { theDataExt && 
                     <div class="data ext-props" id="ext-info">
                        <div><h2>{I18n.t("resource.extended")}</h2>{/*<span onClick={toggleExtProps}>{I18n.t("misc."+extPlabel)}</span>*/}</div>
                     </div> }
                  { theDataExt }
               </div>
            </div>
            {/* <Footer locale={this.props.locale}/> */}
         </div>
         /*
         ,
         <LanguageSidePaneContainer />
         */
         ]

      ) ;
   }


   }
}

export default ResourceViewer ;
