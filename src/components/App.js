// @flow
import ReactDOM from 'react-dom';
import { ResizableBox } from 'react-resizable';
import TextField from '@material-ui/core/TextField';
import type Auth from '../Auth';
import _ from "lodash";
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import React, { Component } from 'react';
import SearchBar from 'material-ui-search-bar'
import Paper from '@material-ui/core/Paper';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/List';
import ListItemText from '@material-ui/core/List';
import ListItemIcon from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Loader from 'react-loader';
import Collapse from '@material-ui/core/Collapse';
import MenuIcon from '@material-ui/icons/Menu';
import RefreshIcon from '@material-ui/icons/Refresh';
import ErrorIcon from '@material-ui/icons/Error';
import ErrorIconC from '@material-ui/icons/AddCircle';
import InfoIcon from '@material-ui/icons/InfoOutlined';
import WarnIcon from '@material-ui/icons/Warning';
import SearchIcon from '@material-ui/icons/Search';
import Settings from '@material-ui/icons/SettingsSharp';
import TranslateIcon from '@material-ui/icons/Translate';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Apps from '@material-ui/icons/Apps';
import Close from '@material-ui/icons/Close';
import Cancel from '@material-ui/icons/Cancel';
import ImportExport from '@material-ui/icons/ImportExport';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import PanoramaFishEye from '@material-ui/icons/PanoramaFishEye';
import CheckCircle from '@material-ui/icons/CheckCircle';
import CheckBoxOutlineBlank from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBox from '@material-ui/icons/CheckBox';
import CropFreeIcon from '@material-ui/icons/CropFree';
import CropDin from '@material-ui/icons/CropDin';
import CenterFocusWeak from '@material-ui/icons/CenterFocusWeak';
import CenterFocusStrong from '@material-ui/icons/CenterFocusStrong';
import FilterNone from '@material-ui/icons/FilterNone';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import withStyles from '@material-ui/core/styles/withStyles';
import gray from '@material-ui/core/colors/green';
import { Link } from 'react-router-dom'
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLanguage,faUserCircle,faSignOutAlt,faSlidersH } from '@fortawesome/free-solid-svg-icons'
import qs from 'query-string'
import FormGroup from '@material-ui/core/FormGroup';
import Popover from '@material-ui/core/Popover';
import $ from 'jquery' ;
import {CopyToClipboard} from 'react-copy-to-clipboard' ;
import LazyLoad from 'react-lazyload';

import {MapContainer,TileLayer,LayersControl,Marker,Popup,GeoJSON,Popup as MapPopup} from 'react-leaflet' ;
import ReactLeafletGoogleLayer from "react-leaflet-google-layer" ;
import L from 'leaflet';
import { GestureHandling } from "leaflet-gesture-handling";
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet.markercluster.freezable';

import 'leaflet/dist/leaflet.css';
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";

import CookieConsent from "react-cookie-consent";
import ReactGA from 'react-ga';

//import { I18n, Translate, Localize } from "react-redux-i18n" ;
import I18n from 'i18next';
import { Trans } from 'react-i18next'

import axios from "axios"


import LanguageSidePaneContainer from '../containers/LanguageSidePaneContainer';
import ResourceViewerContainer from '../containers/ResourceViewerContainer';
import {getOntoLabel,provImg as img,providers} from './ResourceViewer';
import {getQueryParam} from './GuidedSearch';
import {getEntiType} from '../lib/api';
import {narrowWithString} from "../lib/langdetect"
import {sortLangScriptLabels, extendedPresets, getMainLabel} from '../lib/transliterators';
import './App.css';
import Footer from "./Footer"
import store from "../index"
import {closePortraitPopup} from "../state/ui/actions"

import {svgEtextS,svgImageS} from "./icons"

import logdown from 'logdown'

import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';


// for full debug, type this in the console:
// window.localStorage.debug = 'gen'

const loggergen = new logdown('gen', { markdown: false });

const adm   = "http://purl.bdrc.io/ontology/admin/" ;
const bda   = "http://purl.bdrc.io/admindata/";
const bdac  = "http://purl.bdrc.io/anncollection/" ;
const bdan  = "http://purl.bdrc.io/annotation/" ;
const bdo   = "http://purl.bdrc.io/ontology/core/"
const bdou  = "http://purl.bdrc.io/ontology/ext/user/" ;
const bdr   = "http://purl.bdrc.io/resource/";
const bdr_len   = bdr.length ;
const bdu   = "http://purl.bdrc.io/resource-nc/user/" ;
const bf    = "http://id.loc.gov/ontologies/bibframe/";
const cbcp  = "https://dazangthings.nz/cbc/person/"
const cbct  = "https://dazangthings.nz/cbc/text/"
const dila  = "http://purl.dila.edu.tw/resource/";
const eftr  = "http://purl.84000.co/resource/core/" ;
const foaf  = "http://xmlns.com/foaf/0.1/" ;
const mbbt  = "http://mbingenheimer.net/tools/bibls/" ;
const oa    = "http://www.w3.org/ns/oa#" ;
const ola   = "https://openlibrary.org/authors/" 
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

// experimental
const bn    = "https://buddhanexus.net/tib/";
const cbeta = "http://cbetaonline.dila.edu.tw/"
const har   = "http://www.himalayanart.org/search/"
const idp   = "http://idp.bl.uk:80/"
const loc   = "http://lccn.loc.gov/"
const lul   = "http://hdl.handle.net/"
const ngmpp = "https://catalogue.ngmcp.uni-hamburg.de/receive/"
const sat   = "http://21dzk.l.u-tokyo.ac.jp/SAT2018/"
const sats   = "https://dzkimgs.l.u-tokyo.ac.jp/"
const sbb   = "http://resolver.staatsbibliothek-berlin.de/"
const src   = "https://sakyaresearch.org/"
const tol   = "http://api.treasuryoflives.org/resource/";
const wc    = "https://www.worldcat.org/identities/";


export const prefixesMap = { adm, bda, bdac, bdan, bdo, bdou, bdr, bdu, bf, cbcp, cbct, dila, eftr, foaf, oa, mbbt, owl, rdf, rdfs, rkts, skos, wd, ola, viaf, xsd, tmp, 
   bn, cbeta, har, idp, loc, lul, ngmpp, sat, sats, sbb, src, tol, wc }
export const prefixes = Object.values(prefixesMap) ;
export const sameAsMap = { wd:"WikiData", ol:"Open Library", ola:"Open Library", bdr:"BDRC", mbbt:"Marcus Bingenheimer", eftr:"84000" }

// TODO: example C1 P1 G10 W1 WA1 MW1 R37 IE23703 I1KG9127 UT4CZ5369_I1KG9127_0000 (with bda:)PR0ET003
export const RIDregexp = /(^([^:]+:)?([cpgwrti]|mw|was?|ws|ut|ie|pr)(\d|eap)[^ ]*$)/i

export function fullUri(id:string, force:boolean=false) {   
   if(id && !id.replace) {
      console.warn("id:?:",id)
      return id
   }
   if(force && id.indexOf(":") === -1) id = bdo + id
   else for(let k of Object.keys(prefixesMap)) {
      id = id.replace(new RegExp(k+":"),prefixesMap[k])
   }
   return id ;
}

export function shortUri(id:string, nobdo?:boolean=false) {
   for(let k of Object.keys(prefixesMap)) {
      id = id.replace(new RegExp(prefixesMap[k]),k+":")  
   }
   if(nobdo) id = id.replace(/^bdo:/,"")
   return id.replace(/[/]$/,"") ;
}

console.log("loca:",window.location.hostname)

const onKhmerUrl = (
      window.location.host.startsWith("khmer-manuscripts")   
   || window.location.search.includes("forceCambodia=true")
   //|| window.location.host.startsWith("library-dev")
   //|| window.location.host.startsWith("localhost")
)



/*
// can also be used for display purposes (in the breadcrumbs)
export function queryinfotosearchbar(qi) {
   if (!qi || !qi.keywords)
      return ""
   if (qi.keywords.length == 1)
      return qi.keywords[0]
   return '"'+qi.keywords.join('" AND "')+'"'
}

// to get from query info to the SPARQL queries and routes
export function queryinfotolucene(qi) {
   if (!qi || !qi.keywords)
      return null
   if (qi.keywords.length == 1) {
      k = qi.keywords[0]
      if (qi.lang.startsWith("bo"))
         return '"'+k+'"~1'
      return '"'+k+'"'
   }
   return '("'+qi.keywords.join('" AND "')+'")'
}

// to parse the route
export function luceneqtoqueryinfo(luceneq, lang) {
   res = {lang: lang}
   if (luceneq.startswith('(') && luceneq.endswith(')'))
      luceneq = luceneq.substring(1, luceneq.length-1)
   res.keywords = []
   for (k in luceneq.split(' AND ')) {
      if (k.endswith('~1'))
         k = k.substring(0, k.length-2)
      k = k.replace('"', '')
      res.keywords.push(k)
   }
}
*/

export function keywordtolucenequery(key:string, lang?:string) {

   // advanced query syntax
   if (key.indexOf(" AND ") !== -1) {
      let keywords = []
      for (let k of key.split(' AND ')) {
         if (k.endsWith('~1'))
            k = k.substring(0, k.length-2)
         k = k.replace(/"/g, '')
         keywords.push(k)
      }
      key = '("'+keywords.join('" AND "')+'")'
      return key
   }
   else if(key.indexOf("\"") === -1) 
      key = "\""+key+"\""
   // https://github.com/buda-base/public-digital-library/issues/155
   if (lang && lang.startsWith("bo") && !key.match(/(~\d$)|( AND )/))
      key = key+"~1"
   return key
}


export function lucenequerytokeyword(lq) {
   lq = lq.replace(/~\d$/,"")
   lq = lq.replace(/\"/g, "")
   lq = lq.replace(/^\(|\)$/g, "") // advanced query
   return lq
}


// get array of keywords
export function lucenequerytokeywordmulti(key:string) {
   let res = []
   if (key.indexOf(" AND ") === -1) {
      res = [ lucenequerytokeyword(key).trim() ] //.replace(/["()]g/, "").trim()]
      return res
   }
   // we have an "AND":
   let keys = key.split(" AND ") //, 4)
   for (let k of keys) {
      if (k)
         res.push(k.replace(/["()]/g, "").trim())
   }
   //console.log("multi:",res)
   return res
}

const facetLabel = {
   "root": "Lsidebar.widgets.root",
   "tree": "Lsidebar.widgets.tree",
   "relationInv": "Lsidebar.widgets.relationInv"
}

export const languages = {
   "km-x-twktt":"lang.search.kmXTwktt",
   "km-x-iast":"lang.search.kmXIast",
   "km":"lang.search.km",
   "zh":"lang.search.zh",
   "zhHani":"lang.search.zh",
   "zhHant":"lang.search.zhHant",
   "zhHans":"lang.search.zhHans",
   "zh-hani":"lang.search.zh",
   "zh-hant":"lang.search.zhHant",
   "zh-hans":"lang.search.zhHans",
   "zh-latn-pinyin":"lang.search.zhLatnPinyin",
   "zh-x-phon-en":"lang.search.zhXPhonEn",
   "sa-x-iast":"lang.search.saXIast",
   "sa-x-ndia":"lang.search.saXNdia",
   "sa-deva":"lang.search.saDeva",
   "en":"lang.search.en",
   "pi":"lang.search.pi",
   "pi-x-iast": "lang.search.piXIast",
   "pi-x-ndia":"lang.search.piXNdia",
   "pi-khmr":"lang.search.piKhmr",
   "bo":"lang.search.bo",
   "bo-x-ewts":"lang.search.boXEwts",
   "bo-x-ewts_lower":"lang.search.boXEwtsLower",
   "bo-x-dts":"lang.search.boXDts",
   "bo-alalc97":"lang.search.boAlaLc",
   //"other":"lang.search.other"
   "inc":"lang.search.inc",
   "inc-x-ndia":"lang.search.incXNdia",
   "inc-x-iast":"lang.search.incXIast",
   "sa":"lang.search.sa",
   "hans":"lang.search.hans","hant":"lang.search.hant",
   "deva":"lang.search.deva","newa":"lang.search.newa","sinh":"lang.search.sinh",
   "latn":"lang.search.ltn",
   "x-ewts":"lang.search.xEwts","x-dts":"lang.search.sDts","alalc97":"lang.search.alalc97","latn-pinyin":"lang.search.latnPinyin"
}

export const searchLangSelec = {
   "zh-hant":"lang.search.zh"
}

export const langSelect = onKhmerUrl ? [
   "pi-x-ndia",
   "en",   
] : [
   "zh-hant",
   "zh-latn-pinyin",
   "bo",
   "bo-x-ewts",
   "bo-x-dts",
   "bo-alalc97",
   "sa-x-ndia",
   "sa-x-iast",
   "sa-deva",
   "en",
   //"pi-x-iast"
]

//const searchTypes = ["All","Work","Etext","Topic","Person","Place","Lineage","Corporation","Role"]
const searchTypes = onKhmerUrl ? [ "Work", "Instance" ] : [ "Work", "Instance","Scan", "Etext", "Person","Place","Topic", "Product", /*"Lineage","Role","Corporation"*/ ]


/*
export const langProfile = [
   "en",
   "bo-x-ewts",
   "sa-x-iast",
   "zh-x-phon-en",
   "zh-latn-pinyin",
   "pi-x-iast",
   "pi",
   "sa-deva",
   "sa-x-ndia",
   "bo",
   "bo-x-dts",
   "bo-alalc97",
   "zh-hans",
   "zh-hant",
   "zh"
]


export const langProfile = [
   "zh-hant",
   "zh-hans",
   "zh",
   "sa-deva",
   "sa-x-ndia",
   "sa-x-iast",
   "en",
   "pi",
   "pi-x-iast",
   "zh-latn-pinyin",
   "bo",
   "bo-x-ewts",
   "bo-x-dts",
   "bo-alalc97"
]
*/

let _GA = false ;
export function report_GA(config,location) {


   let ck = document.cookie
   if(ck) ck = ck.split(/ *; */).reduce((acc,e)=>{ 
      let k = e.split(/=/)
      return ({...acc,[k[0]]:k[1]})
   },{})
   
   loggergen.log("ck?",ck,config,location,_GA)

   if(!config || !location) return

   if(config.GA && ck["BDRC-GDPR-consent"] == "true") {            
      
      if(!_GA) { 
         _GA  = true ;  
         ReactGA.initialize(config.GA) //,{debug:true}); 
      }

      let GAtxt = location.pathname+location.search+location.hash

      loggergen.log("GA?",GAtxt);

      ReactGA.pageview(GAtxt);
   }        
}



export function highlight(val,k,expand,newline,force)
{
   if(k == "-") return val

   //loggergen.log("hi:",val,k,expand)

   if(expand && expand.value) val = expand.value.replace(/([^\n])[\n]([^\n])/g,"$1$2")

   if(!val.match(/↤/) && k ) { 

      //val = /*val.replace(/@.* /,"")*/ val.split(new RegExp(k.replace(/[ -'ʾ_]/g,"[ -'ʾ_]+"))).map((l) => ([<span>{l}</span>,<span className="highlight">{k}</span>])) ;

      //console.log("val:",val)
      
      // DONE fix highlight bug when keyword is a number
      if(!((""+k).match(/^"?[0-9]+"?$/))) {

         // DONE "manually" add the ↦
         if(!Array.isArray(k)) 
            val = val.replace(new RegExp("("+k.replace(/[+]/g,"\\+").replace(/[ -'ʾʼʹ‘_/  \(\)\[\]0-9\n\r།]+/igu,"[ -'ʾʼʹ‘_/  \\(\\)\\[\\]0-9\n\r།]+")+")","igu"),"↦$1↤")
         else for(let key of k) { // advanced query
            val =  val.replace(new RegExp("("+key.replace(/[+]/g,"\\+").replace(/[ -'ʾʼʹ‘_/  \(\)\[\]0-9\n\r།]+/igu,"[ -'ʾʼʹ‘_/  \\(\\)\\[\\]0-9\n\r།]+")+")","igu"),"↦$1↤")
         }
      } else {
         if(!Array.isArray(k)) 
            val = val.replace(new RegExp("("+k.replace(/[+]/g,"\\+").replace(/[ -'ʾʼʹ‘_/  \(\)\[\]\n\r།]+/igu,"[ -'ʾʼʹ‘_/  \\(\\)\\[\\]\n\r།]+")+")","igu"),"↦$1↤")
         else for(let key of k) { // advanced query
            val =  val.replace(new RegExp("("+key.replace(/[+]/g,"\\+").replace(/[ -'ʾʼʹ‘_/  \(\)\[\]\n\r།]+/igu,"[ -'ʾʼʹ‘_/  \\(\\)\\[\\]\n\r།]+")+")","igu"),"↦$1↤")
         }
      }

      //console.log("k:",val,k.replace(/[ -'ʾ_/  \[\]0-9\n\r།]+/gu,"[ -'ʾ_/  \\[\\]0-9\n\r།]+"))
   }

   val = val.replace(/(\[[^\]]*?)([↦])([^\]]*?\])/g,"$1$3$2");
   val = val.replace(/(\[[^\]]*?)([↤])([^\]]*?\])/g,"$2$1$3");
   val = val.replace(/(↦↤)|(\[ *\])/g,"");
   val = val.replace(/\[( *\(…\) *)\]/g," $1 ");

   val = val.split(/↦/)
   val = val.map((e,_idx) => { 
            
      //loggergen.log("e:",_idx,e,e.length,newline,force)

      const prepNewL = (w) => {
         //console.log("split:",w,w.split("\n"))
         return w.split("\n").reduce( (acc,k) => {
            let ret = [ ]
            if(acc.length && (!k || k?.match(/[^ \n\r]/))) ret.push(<br/>) // fix for https://youtu.be/Qmxr-p-7Od8?t=4090
            ret.push(k)
            return acc.concat(ret)
         },[])
      }

      if(e.length) {
         let f = e.split(/↤/)
         if(f.length > 1) {
            let tail 
            if(newline && f[1].indexOf("\n\n") !== -1) { 
               tail = f[1].split(/\n\n/)
               tail = tail.map((i,idx) => [<span>{i}</span>, ...(idx==tail.length - 1 ?[]:[<br data-last={_idx >= val.length - 1 && idx === tail.length - 1}/>,<br/>]) ])
            }
            else tail = [ <span>{force?prepNewL(f[1]):f[1]}</span> ]
            return [<span className="highlight">{force?prepNewL(f[0]):f[0]}</span>,...tail,<span></span>]
         }
         else {
            let tail 
            if(newline && f[0].indexOf("\n\n") !== -1) { 
               tail = f[0].split(/\n\n/)
               tail = tail.map( (i,idx) => [<span>{i}</span>, ...(idx==tail.length - 1 ?[]:[<br data-last={_idx >= val.length - 1 && idx === tail.length - 1}/>,<br/>]) ])
            }
            else tail = [ <span>{force?prepNewL(f[0]):f[0]}</span> ]
            return [...tail,<span></span>]
         }
      }
   })
   
   // else {
   //    let str = val.replace(/[\n\r]+/g," ").replace(/^.*?(↦([^↤]+)↤([-/_()\[\]: ]+↦([^↤]+)↤)*).*$/g,"$1").replace(/↤([-/_() ]+)↦/g,"$1").replace(/[↤↦]/g,"")
   //                .replace(/[\[\]]+/g,"")
   //    let ret = val.replace(/↦[^↤]+↤([-/_()\[\]: ]+↦[^↤]+↤)*/g,"↦↤")

   //    //loggergen.log("str:",str,"=",ret)

   //    val = ret.split(/[\[\] ]*↦↤[\[\] ]*/).map((l) => ([<span>{l}</span>,<span className="highlight">{str}</span>])) ;
   // }
   

   val = [].concat.apply([],val);
   val.pop();
   return val;
}

const preferUIlang = [ bdo+"placeType", bdo+"workIsAbout", bdo+"workGenre", bdo+"role", bdo+"language", bdo+"script", adm+"metadataLegal", bdo+"personGender", bdo+"printMethod", bdo+"workGenre",
   tmp+"relationType", bdo+"material", adm+"status", adm+"access", adm+"contentLegal", bdo+"partType", adm+"contentLegal",
   bdo+"binding",
   bdo+"tradition", tmp+"hasRole",
   adm+"logWho",
   bdo+"creationEventType" ]

export function getLangLabel(that:{},prop:string="",labels:[],proplang:boolean=false,uilang:boolean=false,otherLabels:[],dontUseUI:boolean=false)
{
   if(labels && labels.length)
   {
      //loggergen.log("getL",prop,labels,proplang,uilang,dontUseUI);

      let langs = []
      if(that.state.langPreset) langs = that.state.langPreset
      else if(that.props.langPreset) langs = that.props.langPreset
      if(proplang || uilang || preferUIlang.indexOf(prop) !== -1) langs = [ that.props.locale, ...langs.filter(l => l != that.props.locale) ]

      if(langs.indexOf(that.props.locale) === -1 && !dontUseUI) { 
         langs = [ ...langs, that.props.locale ]
      }            

      
      if(that.props.etextLang && (prop == bdo+"eTextHasPage" || prop == bdo+"eTextHasChunk")) { 
         langs = [ that.props.etextLang ]
         //console.log("prop:",langs,prop)
      }
      

      // TODO move that to redux state 
      // not that simple because UI lang has to be used first or not
      /*
      if(!that.props.langExt) { 
         console.log("regenerate langExt");
         langs = extendedPresets(langs)
      } else {
         langs = that.props.langExt      
      }
      */

      langs = extendedPresets(langs);

      //loggergen.log(JSON.stringify(labels,null,3))

      if (!otherLabels) {
         return getMainLabel(labels, langs)
      }

      let sortLabels =  sortLangScriptLabels(labels,langs.flat,langs.translit);

      let labels2 = [ ...sortLabels ];
      labels2.shift();
      for(let e of labels2) otherLabels.push(e);
      return sortLabels[0];

   //   return sortLabels[0];

      /*
      let l,langs = [];
      if(that.state.langProfile) langs = [ ...that.state.langProfile ] ;
      if(proplang && that.props.language) langs = [ that.props.language, ...langs ]
      if(uilang && that.state.UI && that.state.UI.language) langs = [ that.state.UI.language, ...langs ]

      for(let lang of langs) {
         l = labels.filter((e) => ((e.value||e["@value"]) && (e["lang"] == lang || e["xml:lang"] == lang || e["@language"] == lang)))
         //loggergen.log("l?",l,lang);
         if(l.length > 0) {
            //loggergen.log("lang",lang,l)
            return l[0]
         }
      }
      if(!l || l.length == 0) l = labels.filter((e) => (e.value) || (e["@value"]))
      return l[0]
      */
   }
};


function pretty(str:string) {
   //loggergen.log("str",str)
   if(!str || !str.length) return 

   for(let p of prefixes) { str = str.replace(new RegExp(p,"g"),"") }

   str = str.replace(/([a-z])([A-Z])/g,"$1 $2")

   return str ;
}


export function getPropLabel(that, i, withSpan = true, withLang = false) {

   if(!that.props.dictionary) return 

   let sTmp = shortUri(i), trad = I18n.t("prop."+sTmp)
   if("prop."+sTmp !== trad) return trad

   let label = that.props.dictionary[i], labels
   if(label) {
      labels = label[skos+"prefLabel"]
      if(!labels) labels = label["http://www.w3.org/2000/01/rdf-schema#label"]
   }
   else if(that.props.assoRes && that.props.assoRes[i]) labels = that.props.assoRes[i]
   else if(that.props.resources && that.props.resources[i]) { 
      labels = that.props.resources[i]
      if(labels) labels = labels[fullUri(i)]
      if(labels) labels = labels[skos+"prefLabel"]
   }

   let lang
   if(labels) {
      label = getLangLabel(that,"",labels,true)

      //loggergen.log("label",i,label)

      if(label) {
         if(label.lang) lang = label.lang
         else if(label["@language"]) lang = label["@language"]
         else if(label["xml:lang"]) lang = label["xml:lang"]

         if(label.value) label = label.value
         else if(label["@value"]) label = label["@value"]

      }
   }
   else label = that.pretty?that.pretty(i):pretty(i)

   if(withSpan) return <span {...lang?{lang}:{}} >{label}</span>
   else if(!withLang) return label
   else return {value:label,lang}
}

export function getFacetUrl(filters,dic){
   let str = "";
   if(filters.facets) { 
      if(dic) dic = Object.keys(dic).reduce ( (acc,f) => ({ ...acc, [dic[f]]:f}),{})
      for(let k of Object.keys(filters.facets)) {
         let vals = filters.facets[k]
         if(vals.val) vals = vals.val
         if(!vals.includes("Any")) str += vals.map(v => "&f="+dic[k]+","+(filters.exclude[k] && filters.exclude[k].indexOf(v) !== -1?"exc":"inc")+","+shortUri(v)).join("")
      }
   }
   loggergen.log("gFu",str,filters,dic)
   return str
}
export function lang_selec(that,black:boolean = false,inPopup:false, useCheckbox: false, callback: false)
{
   let prio = ["zh", "en", "bo" ]
   if(that.props.config && that.props.config.language && that.props.config.language.menu) prio = that.props.config.language.menu

   let form =  <FormControl className="formControl">
                {/* <InputLabel htmlFor="datatype">In</InputLabel> */}
                  
                  { prio.map((i) => {

                        let label = "English";
                        if (i === "bo") label="བོད་ཡིག";
                        if (i === "zh") label="中文";;
                        if (i === "fr") label="Français";
                        if (i === "km") label = "ភាសាខ្មែរ";
                        let disab = false ; //["en","bo"].indexOf(i) === -1

                        // TODO add link to user profile / language preferences

                        const onClick = (event) => { 

                           localStorage.setItem('uilang', i);
                           localStorage.setItem('langpreset', i);
                           const list = that.props.config.language.data.presets.custom[i]
                           
                           if(list && that.props.langIndex != "custom") localStorage.setItem("customlangpreset",list)

                           that.setState({...that.state,anchorLang:null,collapse: {...that.state.collapse, lang:false, uiLangPopup:true }, titles:false, ldspdi:false }); 
                           document.documentElement.lang = i

                           that.props.onSetLocale(i);
                           if(that.props.langIndex != "custom") { // && !callback) {
                              if(i === "bo") that.props.onSetLangPreset(["bo","zh-hans"], "bo")
                              else if(i === "en") that.props.onSetLangPreset(["bo-x-ewts","inc-x-iast"], "en")
                              else if(i === "zh") that.props.onSetLangPreset(["zh-hant","bo"], "zh")
                           }

                           let loca = { ...that.props.history.location }
                           if(loca.search.includes("uilang")) loca.search = loca.search.replace(/uilang=[^&]+/,"uilang="+i)
                           else loca.search += (loca.search&&loca.search.match(/[?]./)?"&":"?")+"uilang="+i
                           that.props.history.push(loca)

                           if(callback) callback()
                        }

                        if(useCheckbox) {
                           return (<div key={i} style={{width:"310px",textAlign:"left"}} class="dataWidget widget">
                               <FormControlLabel
                                 control={
                                    <Checkbox
                                       checked={ that.props.locale===i }
                                       disabled={disab}
                                       className={"checkbox "+ (disab?"disabled":"") + (that.props.locale===i?" is-locale":"")}
                                       icon={<PanoramaFishEye/>}
                                       checkedIcon={<CheckCircle/>}
                                       onChange={onClick}
                                          /> }
                                 label={label}
                            />
                           </div>)
                        } else return ( <MenuItem
                                    className={that.props.locale===i?"is-locale":""}     
                                    value={i}
                                    lang={i}
                                    disabled={disab}
                                    onClick={onClick} >{label}</MenuItem> ) 
                  } ) } 
                  
            </FormControl>

   if(inPopup) return form
   else return [
         <span id="lang" title={I18n.t("home.choose")} onClick={(e) => that.setState({...that.state,anchorLang:e.currentTarget, collapse: {...that.state.collapse, lang:!that.state.collapse.lang } } ) }><img src={"/icons/LANGUE"+(onKhmerUrl?"km":"")+(black?"b":"")+".svg"}/></span>
         ,
         <Popover
            id="popLang"
            open={that.state.collapse&&that.state.collapse.lang?true:false}
            transformOrigin={{vertical:(!black?'top':'bottom'),horizontal:(!black?'right':'left')}}
            anchorOrigin={{vertical:(!black?'bottom':'top'),horizontal:(!black?'right':'left')}}
            anchorEl={that.state.anchorLang}
            onClose={e => { that.setState({...that.state,anchorLang:null,collapse: {...that.state.collapse, lang:false } } ) }}
            className={black?"black":""}
            >

             {form}
         </Popover>
   ]
}
export function etext_lang_selec(that,black:boolean = false, elem, DL)
{
   if(!elem) elem = <span id="lang" title={I18n.t("home.choose")} onClick={(e) => that.setState({...that.state,anchorLang:e.currentTarget, collapse: {...that.state.collapse, lang:!that.state.collapse.lang } } ) }><img src={"/icons/LANGUE"+(black?"b":"")+".svg"}/></span>
   
   let text = { "bo":"lang.tip.bo","bo-x-ewts":"lang.tip.boXEwts" }, prio = ["bo", "bo-x-ewts" ]

   let current = that.props.etextLang
   if(!current || !text[current]) {
      if(that.props.locale === "en") current = "bo-x-ewts"
      else current = "bo"
   }

   const anchor = "anchorLang"+(DL?"DL":"")
   const lang = "lang"+(DL?"DL":"")

   return [
         elem
         ,
         <Popover
            id="popLang"
            open={that.state.collapse&&that.state.collapse[lang]?true:false}
            transformOrigin={{vertical:(!black?'top':'bottom'),horizontal:(!black?'right':'left')}}
            anchorOrigin={{vertical:(!black?'bottom':'top'),horizontal:(!black?'right':'left')}}
            anchorEl={that.state[anchor]}
            onClose={e => { that.setState({...that.state,[anchor]:null,collapse: {...that.state.collapse, [lang]:false } } ) }}
            className={(black?"black":"")+(DL?" DL":"")}
            >

              <FormControl className="formControl">
                {/* <InputLabel htmlFor="datatype">In</InputLabel> */}
                  
                  { prio.map((i) => {

                        let label = I18n.t(text[i]);

                        // TODO add link to user profile / language preferences

                        if(DL) return (
                           // better use a file request to send a token
                           //<a target="_blank" rel="alternate" type="text" download /*={DL.split(/[/]/).pop().split(/[.]/)[0]+"_"+i} // can't bypass 'Content-Disposition: attachment; filename=' in response header */
                           //   style={{color:"#4a4a4a",textDecoration:"none", display:"block"}} href={DL+"?prefLangs="+i}>
                           //</a> 
                              <MenuItem /*className={current===i?"is-locale":""}*/ onClick={async (event) => { 

                                 const token = localStorage.getItem('id_token');
                                 
                                 that.props.onLoading("outline",true)

                                 await axios
                                 .request({
                                   method: "get",
                                   responseType: "blob",
                                   timeout: 4000,
                                   baseURL: DL.replace(/^(https:..[^/]+).*$/,"$1"),
                                   url: DL.replace(/^https:..[^/]+(.*)$/,"$1")+"?prefLangs="+i,
                                   ...token?{headers: {Authorization: `Bearer ${token}`}}:{},
                                 })
                                 .then(function (response) {
                                   //console.log("loaded:", response.data)
                         
                                   // download file
                                   const temp = window.URL.createObjectURL(new Blob([response.data]))
                                   const link = document.createElement("a")
                                   link.href = temp
                                   let filename = DL.split(/[/]/).pop().split(/[.]/)[0]+"_"+i+".txt"
                                   //debug("filename:",filename)
                                   link.setAttribute("download", filename)
                                   link.click()
                                   window.URL.revokeObjectURL(link)
                         
                                 })
                                 .catch(function (error) {
                                   //console.error("error:", error.message)
                                 })

                                 that.props.onLoading("outline",false)
                              }}>
                                 {label}
                              </MenuItem> 
                        )
                        else return ( <MenuItem
                                    className={current===i?"is-locale":""}     
                                    value={i}
                                    onClick={(event) => { 
                                       localStorage.setItem('etextlang', i);
                                       that.setState({...that.state,[anchor]:null,collapse: {...that.state.collapse, [lang]:false } }); 
                                       that.props.onSetEtextLang(i)
                                    

                                       /*
                                       // not sure we need a url param
                                       let loca = { ...that.props.history.location }
                                       if(loca.search.includes("etextlang")) loca.search = loca.search.replace(/etextlang=[^&]+/,"etextlang="+i)
                                       else loca.search += (loca.search&&loca.search.match(/[?]./)?"&":"?")+"etextlang="+i
                                       that.props.history.push(loca)
                                       */
                                    }} >{label}</MenuItem> ) 
                  } ) } 
                  
            </FormControl>
         </Popover>
   ]
}

export function getGDPRconsent(that) {

   //ReactGA.pageview('/homepage');
   //loggergen.log("cookie?",document.cookie)

   if(that.props.config && that.props.config.GA && !that.props.simple) return (
      <CookieConsent
         location="bottom"
         onAccept={() => { loggergen.log("accept!"); if(that) { report_GA(that.props.config,that.props.history.location); that.forceUpdate(); } } }
         cookieName="BDRC-GDPR-consent"
         style={{ background: "#2B373B",zIndex:100000,  }}
         buttonText={I18n.t("cookies.yes")}
         buttonStyle={{ background:"#fce08e", color: "#4a4a4a", fontSize: "13px", marginLeft:0, marginRight:"30px" }}
         enableDeclineButton={true}
         declineButtonText={I18n.t("cookies.no")}
         declineButtonStyle={{ background:"#d73449", color: "white", fontSize: "13px" }}
         expires={150}
         debug={false /**/ } 
      >
         {I18n.t("cookies.message")}
      </CookieConsent>
   )
}

export function top_right_menu(that,etextTitle,backUrl,etextres)
{
   let onZhMirror = (that.props.config && that.props.config.chineseMirror)
   let onKhmerServer = (that.props.config && that.props.config.khmerServer)

   let logo = [
            <div id="logo">
               <Link to="/"  onClick={() => { 
                  that.props.history.push({pathname:"/",search:""}); 
                  if(that.props.keyword) { that.props.onResetSearch(); } 
                  that.setState({blurSearch:false})
               } }><img src="/icons/BUDA-small.svg"/><span>BUDA</span></Link>                                  
               <a id="by"><span>by</span></a>
               { !onZhMirror && [
                  <a href={"https://bdrc.io/"} target="_blank" id="BDRC"><span>BDRC</span></a>,
                  <a href={"https://bdrc.io/"} target="_blank"><img src="/BDRC-Logo_.png"/></a>
               ]}
               { onZhMirror && [
                  <Link to={"/static/about"} id="BDRC"><span>BDRC</span></Link>,
                  <Link to={"/static/about"} ><img src="/BDRC-Logo_.png"/></Link>
               ]}
            </div>,

   ]
   if(onKhmerServer) {
      logo = <div id="logo" class="khmer">                              
               <a href={"https://bdrc.io/"} target="_blank"><img src="/BDRC-Logo_.png"/></a>
               <a href={"https://bdrc.io/"} target="_blank" id="BDRC"><span>BDRC</span></a>               
            </div> 
   }

   let profileName = I18n.t("topbar.profile")
   if(that.props.profileName) profileName = that.props.profileName


   let uiLangPopup
   if(!that.state?.collapse?.uiLangPopup && !localStorage.getItem('uilang')) {
      uiLangPopup = <div id="uiLangPopup">
         <div class="bg" onClick={() => that.setState({collapse:{...that.state?.collapse,uiLangPopup:true}})}></div>
         <div class="fg">
            <div>
               {I18n.t("home.choose")}
               <span id="lang"  style={{margin:"0 0 0 10px"}}><img src={"/icons/LANGUE"+(onKhmerUrl?"km":"")+".svg"}/></span>
            </div>
            <div>{ lang_selec(that, false, true) }</div>
         </div>
      </div>
   }

   // no need anymore
   const portrait = null //<div class="portrait-warn" onClick={()=>store.dispatch(closePortraitPopup())}><div><span></span><p data-tilt1={I18n.t("misc.tilt1")} data-tilt2={I18n.t("misc.tilt2")}></p></div></div>

   if(etextTitle)
      return (<>
      {!that.props.portraitPopupClosed && portrait}
      <div class={"mobile-button top"+(!that.state.collapse.navMenu?" off":" on")} onClick={()=>that.setState({collapse:{...that.state.collapse,navMenu:!that.state.collapse.navMenu}})}><img src="/icons/burger.svg" /></div>
      <div class={"nav"+(onZhMirror?" zhMirror":"")+(that.state.collapse.navMenu?" on":"")}>
         {uiLangPopup}
         <div>
            {logo}

            <span id="back"><span>&lt;</span>{ backUrl && <a //{...etextres?{href:"/show/"+etextres}:{}}
               onClick={(ev   ) => {

                  // DONE add loader to wait when back to search 
                  // TODO dont go back to search when opened from button


                  //console.log('cV:',backUrl,etextres)

                  that.props.onLoading("search",true,etextres)

                  //if(!etextres) 
                  setTimeout(() => { 
                     
                     if(backUrl) {
                        that.props.history.push({pathname:"/search",search:"?"+backUrl}) ; 
                     }

                     that.props.onLoading("search",false)
                     //setTimeout(()=>that.props.onLoading("search",false),100)                     

                  }, 100)

               }}><span style={{verticalAlign:"-3px"}}>{I18n.t("viewer.results")}</span></a> }
               <span>{etextTitle}</span>
            </span>
            <div class="close" 
               onClick={()=>{ 
                  // #743 TODO: use burger-like icon instead
                  //that.setState({collapse:{...that.state.collapse,navMenu:false}})

                  that.props.onLoading("search",true,etextres)

                  //if(!etextres) 
                  setTimeout(() => { 
                     
                     let loca = { ...that.props.history.location }, rid                  
                     const urlParams = new URLSearchParams(loca.search)
                     if(rid = urlParams.get("backToEtext")) {
                        loca.pathname = "/show/"+rid
                        delete loca.search
                        delete loca.hash
                        if(!rid.startsWith("bdr:MW")) loca.hash = "outline"
                        console.log("loca:",loca)
                        that.props.history.push(loca) ; 
                     }
                     else {
                        delete loca.hash
                        that.props.history.push(loca) ; 
                     }                        
                     if(that.state.openEtext) that.setState({...that.state, openEtext: false });
                  
                     that.props.onLoading("search",false)
                     //setTimeout(()=>that.props.onLoading("search",false),100)                     

                  }, 100)
                  
                  
               }}>+</div> 
         </div>
      </div></>)
   else {

      const toggleHoverLogin = (hoverLogin,e) => {
         //console.warn("hoverLogin:",hoverLogin,e.target,e)
         if(hoverLogin === undefined) hoverLogin = !that.state.collapse.hoverLogin
         that.setState({collapse:{...that.state.collapse, hoverLogin } } )
      }

      let proxied = !window.location.host.includes("localhost") && 
            that.props.config && that.props.config.primaryUrl && that.props.config.primaryUrl != window.location.host

      let login       
      if(that.props.auth) login = <div id="login" {...(proxied?{class:"proxied"}:{})}>
         {
            !that.props.auth.isAuthenticated() && // TODO check redirection
               <div class="not-logged">
                  <span onClick={() => that.props.auth.login(that.props.history.location,true)} >
                     {I18n.t("topbar.register")}
                     <svg style={{fill:"#d73449", width:"22px", padding:"1px", border: "2px solid #d73449", borderRadius:"50%"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ><path d="M0 0h24v24H0z" fill="none"/><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  </span>
                  <span onClick={() => that.props.auth.login(that.props.history.location)} >
                     {I18n.t("topbar.login")}
                     <svg style={{fill:"#d73449", width:"28px"}} xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24"><g><rect fill="none" height="24" width="24"/></g><g><path d="M11,7L9.6,8.4l2.6,2.6H2v2h10.2l-2.6,2.6L11,17l5-5L11,7z M20,19h-8v2h8c1.1,0,2-0.9,2-2V5c0-1.1-0.9-2-2-2h-8v2h8V19z"/></g></svg>
                  </span>
               </div>
         }
         {
            that.props.auth.isAuthenticated() && 
               <div class="logged">
                  <span onClick={(e) => { that.props.onUserProfile(that.props.history.location); that.props.history.push("/user");    }}>
                     {profileName}
                     <AccountCircleIcon style={{ fontSize:"28px" }}/>
                  </span>
                  <span onClick={(e) => { that.props.auth.logout(that.props.history.location.pathname!=="/user"?window.location.href:window.location.origin) }} >
                     {I18n.t("topbar.logout")}
                     <svg style={{fill:"#d73449", width:"28px"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>
                  </span>
               </div>
         }
      </div>

      if(proxied) {
         const dot = '.'
         login = <Tooltip id="hoverLogin" open={that.state.collapse.hoverLogin === undefined?false:that.state.collapse.hoverLogin} 
                     placement="center" 
                     onOpen={(e)=>toggleHoverLogin(true,e)} onClose={(e)=>toggleHoverLogin(false,e)} 
                     title={<span style={{ whiteSpace:"normal" }} onMouseEnter={(e)=>toggleHoverLogin(true, e)} onMouseLeave={(e)=>toggleHoverLogin(false,e)}><Trans i18nKey="topbar.proxied" values={{library: "library"+dot+"bdrc"+dot+"io"}} components={{ tag: <a /> }} /></span>}  >{login}</Tooltip>
      }

      let khmerLinks 
      if(onKhmerServer) {
         const setCurrent = (route) => (window.location.pathname === route ? {className:"current"}:{})
         khmerLinks = <div class="links">
            <Link {...setCurrent("/")} to={"/"} >{I18n.t("topbar.home")}</Link> 
            <Link {...setCurrent("/guidedsearch")} to={"/guidedsearch"} >{I18n.t("topbar.guided")}</Link> 
            <Link {...setCurrent("/browse")} to={"/browse"} >{I18n.t("topbar.browse")}</Link> 
            <Link {...setCurrent("/static/aboutkm")} to={"/static/aboutkm"} >{I18n.t("topbar.about")}</Link> 
            <Link {...setCurrent("/static/resources")} to={"/static/resources"} >{I18n.t("topbar.resources")}</Link> 
         </div>
      }

      return ([
      !that.props.portraitPopupClosed? portrait:null,
      <div class={"mobile-button top"+(!that.state.collapse.navMenu?" off":" on")} onClick={() => that.setState({collapse:{...that.state.collapse,navMenu:!that.state.collapse.navMenu}})}><img src="/icons/burger.svg" /></div>,
      <div class={"nav"+(onZhMirror?" zhMirror":"")+ (that.state.collapse.navMenu?" on":"")+(onKhmerServer||onKhmerUrl?" khmerServer":"")}>
         {uiLangPopup}
          <div>
         {logo}

         { !onKhmerServer && [
            !onZhMirror &&  <a id="about" href={"https://bdrc.io"} target="_blank">{I18n.t("topbar.about")}</a> 
            ,
            onZhMirror  && <Link id="about" to={"/static/about"} >{I18n.t("topbar.about")}</Link> 
         ] }

         { !onKhmerServer && <Link to="/"  onClick={(ev) => { 
               that.props.history.push({pathname:"/",search:""}); 
               if(that.props.keyword) { that.props.onResetSearch();}
               if(window.innerWidth > 800)  setTimeout(() => {
                  $("#search-bar input").click()
                  document.querySelector("#search-bar input").focus()
                  document.querySelector("#search-bar").scrollIntoView({block: "start", inline: "nearest", behavior:"smooth"})
               },350)
               ev.preventDefault()
            } }><span>{I18n.t("topbar.search")}</span></Link> }         

         { onKhmerServer && khmerLinks }

         { proxied &&   
            <Tooltip placement="center" title={<span style={{ whiteSpace:"normal" }}><Trans i18nKey="topbar.collections" /></span>}  >
               <Link id="collections" to={"/search?r=tmp:subscriptions&t=Product"} >{I18n.t("types.product",{ count:2 })}</Link>
            </Tooltip>
         }

         <div class="history">
            <span title={I18n.t("topbar.history")}><img src="/icons/histo.svg"/></span>
            <span title={I18n.t("topbar.bookmarks")}><img src="/icons/fav.svg"/></span>
         </div>

         { that.props.auth && login }

         { lang_selec(that) }

         { (!that.props.config || !that.props.config.chineseMirror) && <a target="_blank" href="https://bdrc.io/donation/" id="donate"><img src="/donate.svg"/>{I18n.t("topbar.donate")}</a> }

         { <div class="close" onClick={()=>that.setState({collapse:{...that.state.collapse,navMenu:false}})}>+</div> }
       </div>
     </div>]
   )}
}

function getLang(label) 
{
   let lang
   if(label["@language"]) lang = label["@language"]
   else if(label["lang"]) lang = label["lang"]
   else if(label["xml:lang"]) lang = label["xml:lang"]
   return lang
}

function getVal(label) 
{
   let val
   if(label["@value"]) val = label["@value"]
   else if(label["value"]) val = label["value"]
   return val
}

export function isAdmin(auth) {
   let groups, result = auth && auth.isAuthenticated() && auth.userProfile && (groups = auth.userProfile["https://auth.bdrc.io/groups"]) && groups.includes("admin")
   //console.log("isAdm:",result)
   return result
}


export function renderDates(birth,death,floruit) {
      
   //console.log("b/d/f:",birth,death,floruit)

   const formatDate = (dates) => {
      const clean = (d) => (""+d).replace(/^([^0-9]*)0+/,"$1")
      let date = "", min, max, val, isCentury
      for(let d of dates) {
         val = clean(d.value)
         //console.log("d:",min,max,val,JSON.stringify(d))
         if(d.type === bdo+"notBefore") {
            if(min === undefined || val < min) min = val
            if(max === undefined) max = val
         } else if(d.type === bdo+"notAfter") {
            if(max === undefined || val > max) max = val
            if(min === undefined) min = val
         } else if(d.type === bdo+"onYear") {
            if(max === undefined || val > max) max = val
            if(min === undefined || val < min) min = val
         }
      }
      if(min !== undefined && max != undefined) {
         if(min === max) date = I18n.t("misc.card", { num: min })
         else if(min%100 == 0 && max%100 == 99) { 
            isCentury = true
            let cmin = Math.ceil(min/100+1)
            let cmax = Math.ceil(max/100)
            if(cmin == cmax) date = I18n.t("misc.ord", { num: cmin })
            else date = I18n.t("misc.ordInter", { min: cmin, max:cmax })
         }
         else date = I18n.t("misc.inter", { min, max }) 
      }

      //console.log("date:",dates,date);

      return { date, isCentury }
   }

   let vals = []
   const useAbbr = (!birth.length || !death.length)
   let b,d,f,date
   if(birth.length) {
      date = formatDate(birth)
      b = date.date
      if(b != "" && useAbbr) {
         if(!date.isCentury) vals.push(<span>{I18n.t("result.bDate", { num:b })}</span>)
         else vals.push(<span>{I18n.t("result.bDateCentury", { num:b })}</span>)
      }
   }
   if(death.length) {
      date = formatDate(death)
      d = date.date
      if(d != "" && useAbbr) vals.push(<span>{I18n.t("result.dDate", { num:d })} </span>)
   }
   if(!useAbbr && b != "" && d != "") {
      vals.push(<span>{I18n.t("result.bdDate", { birth:b, death:d })} </span>)
   }
   // TODO: check if this is ok when data available
   if(floruit.length) {
      date = formatDate(floruit)
      f = date.date
      if(f != "") vals.push(<span>{I18n.t("result.fDate", { num:f })} </span>)
   }
   return vals
}


const TagTab = {
   "Abstract Work":CropFreeIcon,
   "Work Has Expression":CenterFocusStrong,
   "Work Expression Of":CenterFocusWeak,
   "Work":CropDin
}

const styles = {
  checked: {
    color: "rgb(50,50,50)",
},
  refine: {
    color: "gb(50,50,50)",
  },
};

type Props = {
   auth:Auth,
   config:{
      ldspdi:{
         endpoints:string[],
         index:number
      }
   },
   latest?:boolean,
   facets?:{[string]:boolean|{}},
   searches:{[string]:{}},
   resources:{[string]:{}},
   hostFailure?:string,
   langIndex?:integer,
   langExt?:string[],
   loading?:boolean,
   keyword?:string,
   language?:string,
   prefLang?:string,
   locale?:string,
   datatypes:boolean|{},
   history:{},
   ontology:{},
   dictionary:{},
   ontoSearch:string,
   rightPanel?:boolean,
   failures?:{},
   assoRes?:{},
   sortBy?:string,
   instances?:{},
   isInstance?:boolean,
   latestSyncs?:boolean|{},
   latestSyncsNb?:integer,
   onResetSearch:()=>void,
   onOntoSearch:(k:string)=>void,
   onStartSearch:(k:string,lg:string,t?:string)=>void,
   onSearchingKeyword:(k:string,lg:string,t?:string[])=>void,
   onGetInstances:(uri:string)=>void,
   onCheckDatatype:(t:string,k:string,lg:string)=>void,
   onGetFacetInfo:(k:string,lg:string,f:string)=>void,
   onCheckFacet:(k:string,lg:string,f:{[string]:string})=> void,
   onUpdateFacets:(key:string,t:string,f:{[string]:string[],m:{[string]:{}}},cfg:{[string]:string})=> void,
   onGetResource:(iri:string)=>void,
   onSetPrefLang:(lg:string)=>void,
   onToggleLanguagePanel:()=>void,
   onUserProfile:(url:{})=>void,
   onUpdateSortBy:(i:string,t:string)=>void,
   onGetContext:(iri:string,start:integer,end:integer)=>void,
   onGetDatatypes:(k:string,lg:string)=>void

}

type State = {
   anchor:{[string]:{}},
   id?:string,
   loading?:boolean,
   //willSearch?:boolean,
   language:string,
   langOpen:boolean,
   customLang?:string[],
   langPreset?:string[],
   langDetect?:string[],
   checked?:string,
   unchecked?:string,
   keyword:string,
   newKW:string,
   dataSource : string[],
   leftPane?:boolean,
   LpanelWidth:number,
   closeLeftPane?:boolean,
   uriPage?:integer,
   backToWorks?:string,
   filters:{
      datatype:string[],
      facets?:{[string]:string[]},
      exclude:{[string]:boolean},
      preload:{}
   },
   collapse:{ [string] : boolean },
   loader:{[string]:Component<*>},
   facets? : string[],
   autocheck?:boolean,   
   paginate:{},   
   repage:boolean,
   instances?:{},
   results:{
      [string]:{
         message:[],
         counts:{},
         types:[],      
         paginate:{index:number,pages:number[],n:number[],goto?:number}
      }      
   },
   assoRes?:{},
   locale:string,
   checked:{},
   syncsSlided?:boolean
}


let start = Date.now(), last_t = start
let sublabels = {}
const timesToString = () => {
   let keys = Object.keys(sublabels) 
   return keys.map(k => k+": "+sublabels[k].total+(sublabels[k].tmp!==undefined?" ("+sublabels[k].tmp+")":"") ).join("\n")
}
export const subtime = (label = "", init) => {         
   const time = Date.now()
   if(label) { 
      if(sublabels[label] === undefined) { 
         sublabels[label] = { total:0, start:time, tmp:0, last:time }
      }
      if(init !== 0) {
         sublabels[label].total += time - sublabels[label].start
         if(sublabels[label].tmp !== undefined) delete sublabels[label].tmp
      } else { 
         sublabels[label].start = time
         sublabels[label].tmp = 0  
      }
      sublabels[label].last = time
   }
   for(let k of Object.keys(sublabels)) {
      if(sublabels[k].tmp !== undefined) {
         sublabels[k].tmp += time - sublabels[k].last
         sublabels[k].last = time
      }
   }
   //if(init !== 0) console.log("subtime:", label, init, "\n"+timesToString(),"\nsubtime;"+(time - start))
}


class App extends Component<Props,State> {
   _facetsRequested = false;
   _customLang = null ;
   _menus = {}
   _refs = {}
   _scrollTimer = null
   _get = null
   _map = null



   constructor(props : Props) {
      super(props);      

      this.requestSearch.bind(this);
      this.handleCheck.bind(this);
      this.handleResults.bind(this);
      this.handleResOrOnto.bind(this);
      this.makeResult.bind(this);
      this.render_filters.bind(this);

      if(!this._get) this._get = qs.parse(this.props.history.location.search)
      let get = this._get 

      let lg = "bo-x-ewts"
      if(get.p) lg = ""
      else if(get.lg) lg = get.lg

      let kw = "", newKW
      if(get.q) kw = lucenequerytokeyword(get.q)
      if(kw) newKW = kw

      let types = [ "Instance" ] //[ ...searchTypes.slice(1) ]
      if(onKhmerUrl) types = [ "Work" ]
      let e = types.indexOf("Etext")
      if(e !== -1) { 
         delete types[e]
         types = types.filter(e => e)
         //loggergen.log("types",types)
      }

      // x reset facets when switching to instances (use w=)
      // + use page number given in url
      // + switching back when returning to Works ? use "w="+encoded url
      // TODO 
      // - hide Works before instances are displayed 

      let sortBy = get.s

      this.state = {
         language:lg,
         langOpen:false,
         UI:{language:"en"},
         filters: {
            datatype:this.props.latest?["Scan"]:(get.t?get.t.split(","):["Any"]),
         },
         collapse:{},
         sortBy,
         searchTypes: get.t?get.t.split(","):types,
         dataSource: [],         
         newKW,
         loader:{},
         paginate:{index:0,pages:[0],n:[0]},
         anchor:{},
         LpanelWidth:375,
         //leftPane:false //(window.innerWidth > 1400 && this.props.keyword),
         checked:{}
      };


      if(langSelect.indexOf(lg) === -1) this.state = { ...this.state, customLang:[lg]}

      loggergen.log('qs',get,this.state)

      if(window.innerWidth < 800) L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);

      /*
      window.onresize = function(ev) { 
         if(window.innerWidth < window.innerHeight && window.screen.width < 800) {
            console.log("resize:",window.innerHeight);
            $("body").height(window.innerHeight)
         }
      }
      */ 

      //console.log("dld?",window.top.DLD)
   }

   componentDidUpdate() {
      if(!this.state.blurSearch) {
         let elem = document.querySelector("#search-bar input")
         if(elem && window.innerWidth > 800) { 
            elem.focus()
            $("#search-bar input[type=text][placeholder]").attr("placeholder",I18n.t("home.start"));
         }
      }

      // TODO check how this behave with smaller screen width/height
      let ref
      if(this._refs["sidepane"] && (ref = this._refs["sidepane"].current) /*&& this.props.language*/) {                     
         $(window).off("scroll").on("scroll", () => {

            if(!this.props.keyword) return

            const rect = ref.getBoundingClientRect()
            const stuck = rect.y > 230
            if(stuck !== this.state.stuck) {
               //console.log("stuck?",stuck,ref,rect.y)
               this.setState({stuck})
            } 
            const toph = $("#filters-UI").height() 
            const navh = window.innerWidth <= 1024 ? -10 : $(".nav").height()
            const headh = $("#res-header").height()
            if(this._refs["header"].current) $(this._refs["header"].current).css("top",(toph+navh+15)+"px") //
            
            if(window.innerWidth > 1024)
               $(ref)
               .height(window.innerHeight - rect.y + (window.innerWidth <= 1024 ? 0 : 0))
               .css("top",(toph+navh+(window.innerWidth > 1024 ? headh+15 : 5)+"px"))
            else 
               $(ref)
               .height(window.innerHeight)
               .css("top",0)

            if(this._refs["simplebar"].current) this._refs["simplebar"].current.recalculate()
            if(this._refs["filters-UI"].current) this._refs["filters-UI"].current.recalculate()
            
         }).scroll()
      } 

      if(this._refs["filters-UI"].current) this._refs["filters-UI"].current.recalculate()
      if(this._refs["filters-UI-scrollable"].current) this._refs["filters-UI-scrollable"].current.scrollTop = 500

      loggergen.log("didU:",this.state,this.state.uriPage,this._refs["maps"],this._refs["cluster"]) //,this._refs)

      
      if(this._map && this._refs["cluster"]?.current) {
         
         if(this._refs.markers) {
            const currentMarkers = []
            const vals = Object.values(this.state.mapInfo)
            for(let v of vals) {
               if(this.hasAllFacets(v.data)) {
                  //console.log("on map:",v)
                  
                  if(v.ref?.current) v.ref.current.addTo(this._refs["cluster"].current) 

                  currentMarkers.push(v.latLong)
               } else {                  
                  //console.log("not on map:",v)
                  if(v.ref?.current) this._refs["cluster"].current.removeLayer(v.ref.current)
               }
            }

            try { 
               if(currentMarkers.length < 50) { 
                  this._refs["cluster"].current.disableClusteringKeepSpiderfy();
               }
               else {
                  this._refs["cluster"].current.enableClustering()
               }

               this._refs["cluster"].current.refreshClusters()

               $(".resultsMap").attr("data-nb-markers", currentMarkers.length)
               if(currentMarkers.length) { 
                  this._map.fitBounds(currentMarkers, currentMarkers.length === 1 ? {maxZoom: 10}:{padding:[50,50]})
               }
            } catch(e) {
               console.error("refreshClusters/map error",e)
            }

         } else {
            $(".resultsMap").attr("data-nb-markers", 0)
         }
      } 
      

      report_GA(this.props.config,this.props.history.location);


      this._get = qs.parse(this.props.history.location.search)
      let get = this._get 

      let n, scrolled
      if(get.n) {
         n = get.n
         if(this._refs[n] && this._refs[n].current && this.state.scrolled !== n)  {
            this._scrollTimer = setInterval(((that) => () => { 
               
               if(that._refs[n] && that._refs[n].current) that._refs[n].current.scrollIntoView()


               //else if(n === 0 && that._refs["logo"].current) window.scrollTop(0) //TODO scroll to top of window when changing page

               loggergen.log("timer")
            })(this),10) 

            setTimeout(((that) => () => { clearInterval(this._scrollTimer)})(this),1000)

            scrolled = n
         }
      }
      
      let pg 
      if(get.pg) pg = Number(get.pg) - 1

      let backToWorks
      if(get.w) backToWorks = decodeURIComponent(get.w)

      let filters 
      let collapse = { ...this.state.collapse }
      let exclude = {}
      let preload = {}
      let facets= {} 
      let encoded = ""
      if(!get.f) filters = { datatype: this.state.filters.datatype, encoded }            
      else { 
         encoded = ""
         let F = get.f
         if(!Array.isArray(F)) F = [F]
         for(let f of F) {
            if(encoded) encoded += "&"
            encoded += "f="+f
            let val = f.split(",")
            if(val.length === 3) {
               let exc =  val[1] === "exc"
               collapse[val[0]] = true
               if(!preload[val[0]]) preload[val[0]] = []
               preload[val[0]].push(fullUri(val[2]))
               if(exc) {
                  if(!exclude[val[0]]) exclude[val[0]]= []
                  exclude[val[0]].push(fullUri(val[2]))
               }
            }
         }
         filters = {
            datatype:get.t?get.t.split(","):["Any"],
            exclude,
            facets,
            preload,
            encoded
         }
      }

      loggergen.log("encoded=|"+encoded+"|"+this.state.filters.encoded+"| pg="+pg)

      let uriPage = this.state.uriPage
      if(uriPage !== pg && this.state.paginate && this.state.paginate.index !== pg && this.state.paginate.pages.length >= pg) {
         uriPage = pg
      } else if(pg === undefined) {
         uriPage = 0
      }


      let updatePagin = false      
      if(pg && this.state.paginate?.nMax && this.state.paginate?.index != pg) {
            updatePagin = true
      }
      

      //console.log("uriP:",uriPage,updatePagin)

      if(this.state.uriPage !== uriPage || updatePagin || this.state.backToWorks !== backToWorks || (encoded !== this.state.filters.encoded ) || (scrolled && this.state.scrolled !== scrolled) )
         this.setState({...this.state, repage:true, uriPage, backToWorks, scrolled, collapse, ...(filters?{filters}:{})})
      else if(get.t) {
         let dt = get.t.split(",").filter(d => !this.state.filters.datatype.includes(d))
         if(dt.length) this.setState({...this.state, filters:{...this.state.filters, datatype:dt}})
      }
   }

   requestSearch(key:string,label?:string,lang?:string,forceSearch:boolean=false,dataInfo:string,menu_i?:number)
   {
      // DONE trigger find as date/id when press return
      let idx = menu_i      
      if(idx === undefined) idx = this.state.langIndex
      if(idx === undefined) idx = 0 
      if(idx > this.state.dataSource.length) idx = 0
      
      let tab = this.state.dataSource[idx]
      if(tab) {
         tab = tab.split("@")
         let kw = tab[0]
         let isRID = !languages[tab[1]]
         if(isRID && !kw.includes(":")) {
            if(tab[1].match(/date|identifier/)) {
               key = key.replace(/^d([0-9]+)/,"D$1")
               dataInfo = tab[1].replace(/^.*?([^ ]+)$/,"$1")
            }
         }
      }

      loggergen.log("key:",idx,tab,key,label,lang,this.state.searchTypes,dataInfo)

      // moved this from else at bottom of function to fix adding ~1 suffix
      lang = (lang?lang:this.getLanguage())
      
      if(key) key = key.trim()

      let _key = ""+key
      if(!key || key == "" || !key.match) return ;
      if(!key.match(/:/)) {
        key = keywordtolucenequery(key, lang)
        key = encodeURIComponent(key) // prevent from losing '+' when adding it to url
      }
      loggergen.log("new key",key)


      let searchDT = this.state.searchTypes
      if(!label) label = searchDT
      if(!label || label.length === 0 || label.length > 1) { 
         searchDT = [ "Any" ]
         label = [ "Any" ] 
      }
      if(label.indexOf("Any") !== -1) label = "Any" 
      else label = label.join(",")

      if(label.indexOf("Scan") !== -1) {
         searchDT = [ "Instance" ]
         label = [ "Instance" ] 
      }

      let khmerCollec = ""
      if(onKhmerUrl && label.includes("Instance")) khmerCollec = "&f=collection,inc,bdr:PR1KDPP00" // not working for Works yet

      loggergen.log("search::",key,_key,label,searchDT) //,this.state,!global.inTest ? this.props:null)

      let hasOpenPossibly = ""
      if(label.includes("Instance") || label.includes("Scan")) { 
         hasOpenPossibly = "&f=asset,inc,tmp:possibleAccess&f=asset,inc,tmp:catalogOnly" ;
         if(this.props.useDLD) hasOpenPossibly += (hasOpenPossibly?"&":"")+"&f=inDLD,inc,tmp:available"
      }

      if(dataInfo) {
         console.log("new route:",dataInfo)

         this.props.history.push({pathname:"/search",search:"?"+(dataInfo==="date"?"date":"id")+"="+key+"&t="+label+khmerCollec})
      }
      else if(_key.match(RIDregexp) || prefixesMap[key.replace(/^([^:]+):.*$/,"$1")])
      {
         if(_key.indexOf(":") === -1) _key = "bdr:"+_key
         let uc = _key.split(":")
         _key = uc[0] + ":" + uc[1].toUpperCase()         
         
         if(!forceSearch && !idx) { 

            this.props.history.push({pathname:"/show/"+_key})
         }
         else {
            if(!label) label = this.state.filters.datatype.filter((f)=>["Person","Work"].indexOf(f) !== -1)[0]
            this.props.history.push({pathname:"/search",search:"?r="+_key+(label?"&t="+label+khmerCollec+hasOpenPossibly:"")})
         }
      }
      else if(key.match(/^[^:]*:[^ ]+/))
      {
         this.props.history.push({pathname:"/search",search:"?p="+key+khmerCollec})

      }
      else {

         if(lang === "bo-x-ewts_lower" ) {
            key = key.toLowerCase();
            lang = "bo-x-ewts"
         }

         let inEtext
         if(this.props.searches && this.props.searches[this.state.filters.datatype[0]] && this.props.searches[this.state.filters.datatype[0]][this.props.keyword+"@"+this.props.language] && this.props.searches[this.state.filters.datatype[0]][this.props.keyword+"@"+this.props.language].inEtext) {
            inEtext = this.props.searches[this.state.filters.datatype[0]][this.props.keyword+"@"+this.props.language].inEtext
         }
         const newLoca = {pathname:"/search",search:"?q="+key+"&lg="+lang+"&t="+label+khmerCollec+hasOpenPossibly+(inEtext?"&r="+inEtext:"")}
         console.log("newL?",newLoca)
         this.props.history.push(newLoca)
         
         // TODO add permanent filters (here ?)
      }


      let state = { ...this.state, dataSource:[], leftPane:true, filters:{ datatype:[ ...searchDT ] } }
      this.setState(state)


      /*
      else if(label === "Any") // || ( !label)) // && ( this.state.filters.datatype.length === 0 || this.state.filters.datatype.indexOf("Any") !== -1 ) ) )
      {
         this.props.history.push({pathname:"/search",search:"?q="+key+"&lg="+this.getLanguage()+"&t=Any"})
      }
      else if (label || this.state.filters.datatype.filter((f)=>["Person","Work","Etext"].indexOf(f) !== -1).length > 0)
      {
         if(!label) label = this.state.filters.datatype.filter((f)=>["Person","Work","Etext"].indexOf(f) !== -1)[0]

         this.props.history.push({pathname:"/search",search:"?q="+key+"&lg="+this.getLanguage()+"&t="+label})
      }
      else 
      {
         this.props.history.push({pathname:"/search",search:"?q="+key+"&lg="+this.getLanguage()+"&t=Any"})
      }
      */


   }

   getEndpoint():string
   {
      return this.props.config.ldspdi.endpoints[this.props.config.ldspdi.index]
   }

   getLanguage():string
   {
      if(!this.state.language || !this.state.dataSource || !this.state.dataSource.length) return this.state.language

      let idx = this.state.langIndex
      if(idx === undefined) idx = 0 
      if(idx > this.state.dataSource.length) idx = 0
      
      let lang = this.state.dataSource[idx]
      if(lang) {
         lang = lang.split("@")
         if(lang.length > 1) return lang[1]
      }
      
      return this.state.language
      /*
      if(lang && lang === "other")
         lang = this.state.customLang
      return lang
      */
   }

   static getDerivedStateFromProps(prop:Props,state:State)
   {
      subtime("getDerivedState",0)

      let s ;

      let props = { ...prop }, title = ""

      if(props.keyword) { 
         if(props.keyword === "(latest)") title = I18n.t("home.new") + " - "
         else title = /*""+*/ (props.keyword==="-"?"Version":"")+" search results - "
      }
      if(props.config?.khmerServer) title += "Khmer Manuscript Heritage Project"
      else title += "Buddhist Digital Archives"

      document.title = title

      if(!props.language && props.keyword) {
         if(state.resReceived !== props.keyword && props.resources[props.keyword] && props.resources[props.keyword] !== true) {
            if(!s) s = { ...state }
            s.resReceived = props.keyword ;
            s.repage = true
         }
      }

      if(props.assoRes && (!state.assoRes || Object.keys(state.assoRes).length !== Object.keys(props.assoRes).length)) {

         if(!s) s = { ...state }
         s.assoRes = { ...props.assoRes }
         s.repage = true
      }

      if(props.genresParents && state.filters.facets && state.filters.facets[bdo+"workGenre"]) {
         console.log("genresParents",props.genresParents)
         if(!s) s = { ...state }
         let genre = state.filters.facets[bdo+"workGenre"]
         if(genre.val) genre = genre.val
         for(let p of genre) 
            if(props.genresParents[p]) 
               for(let q of props.genresParents[p]) 
                  if(s.collapse[q] === undefined) {
                     //console.log("genres:collapse",q,p)
                     s.collapse[q] = true
                  }
      }

      if(props.topicParents && state.filters.facets && state.filters.facets[bdo+"workIsAbout"]) {
         console.log("topicParents",props.topicParents)
         if(!s) s = { ...state }
         let topic = state.filters.facets[bdo+"workIsAbout"]
         if(topic.val) topic = topic.val
         for(let p of topic) 
            if(props.topicParents[p]) 
               for(let q of props.topicParents[p]) 
                  if(s.collapse[q] === undefined) {
                     //console.log("topic:collapse",q,p)
                     s.collapse[q] = true
                  }
      }

      if(state.filters.preload && state.sortBy && !props.sortBy) { 
         
         if(!s) s = { ...state }

         props.onUpdateSortBy(s.sortBy.toLowerCase(),s.filters.datatype[0])
         
         delete s.sortBy

      }

      if(state.filters.preload && props.keyword && props.config && !state.filters.datatype.includes("Any")) {
         
         if(!s) s = { ...state }

         if(s.filters.preload && s.filters.preload !== true) {
            let dic = props.config.facets[state.filters.datatype[0]]
            if(dic) for(let k of Object.keys(s.filters.preload)) {
               s.filters.facets[dic[k]] = s.filters.preload[k]
            }
            let exclude = {}
            //loggergen.log("exc1",JSON.stringify(s.filters.exclude,null,3))
            if(dic) for(let k of Object.keys(s.filters.exclude)) {
               exclude[dic[k]] = s.filters.exclude[k] 
            }
            s.filters.exclude = exclude
            //loggergen.log("exc2",JSON.stringify(exclude,null,3))

            s.filters.preload = true

         }         
         
         if(props.searches && props.searches[s.filters.datatype[0]] && props.searches[s.filters.datatype[0]][props.keyword+"@"+props.language] && props.searches[s.filters.datatype[0]][props.keyword+"@"+props.language].metadata )
         {
            delete s.filters.preload

            let facets = { ...s.filters.facets }
            facets = Object.keys(facets).reduce((acc,f) => {
                  if(facets[f].indexOf && facets[f].indexOf("Any") !== -1) return acc ;
                  else if(facets[f].val && facets[f].val.indexOf("Any") !== -1) return acc ;
                  else if(f !== bdo+"workGenre" && f !== bdo+"workIsAbout" || facets[f].alt) return { ...acc, [f]:facets[f] }
                  else return { ...acc, [f]:{alt:[bdo+"workGenre",bdo+"workIsAbout"],val:facets[f]} }
               },{})

            s.filters.facets = facets

            //loggergen.log("facets?",facets,props.loading)

            if(!props.loading) 
               props.onUpdateFacets(
                  props.keyword+"@"+props.language,
                  s.filters.datatype[0],
                  facets,
                  s.filters.exclude,
                  props.searches[s.filters.datatype[0]][props.keyword+"@"+props.language].metadata,
                  props.config.facets[s.filters.datatype[0]]
               )
            else 
               setTimeout(() => {
                  props.onUpdateFacets(
                     props.keyword+"@"+props.language,
                     s.filters.datatype[0],
                     facets,
                     s.filters.exclude,
                     props.searches[s.filters.datatype[0]][props.keyword+"@"+props.language].metadata,
                     props.config.facets[s.filters.datatype[0]]
                  )}, 1000);            
         }
      }


      if(!state.newKW || state.newKW !== props.keyword || props.keyword === null) { 
         if(!s) s = { ...state }
         if(s.newKW !== props.keyword) {
            s.newKW = props.keyword
            s.keyword = props.keyword
            if(!props.keyword) s.leftPane = false ;
         }

      }


      //loggergen.log("collap?",JSON.stringify(state.collapse,null,3))

      
      // TODO deprecate in favor of query modification      
      if(props.language == "" && props.keyword !== "tmp:subscriptions" && (!props.resources || !props.resources[props.keyword]))
      {
         loggergen.log("gRes?",props.resources,props.keyword);
         props.onGetResource(props.keyword);
      }
     

      /*
      // update when datatype filter has changed 
      if(state.filters && state.filters.datatype) {
         let get = qs.parse(props.history.location.search)
         let d_url = (get.t?get.t.split(","):[])
         if(d_url.length) {
            let d_sta = state.filters.datatype
            if(d_sta.filter(i => !d_url.includes(i)).length > 0) {
               if(!s) s = { ...state }
               s = { ...s, filters : { ...s.filters, datatype : d_url }, repage:true }
               loggergen.log("filt::",d_url)
            }
            //loggergen.log("what...",d_sta,d_url)
         }
      }
      */

      if(!state.leftPane && props.keyword && !state.closeLeftPane) {
         if(!s) s = { ...state }
         s.leftPane =  true 
      }

      if(props.keyword && props.datatypes && props.datatypes.hash && (!props.datatypes.metadata || Object.keys(props.datatypes.metadata).length === 0) ) {
         if(!s) s = { ...state }
         s.leftPane = false 

         //loggergen.log("no leftPane")
      }

      
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

      if(props.locale !== state.locale)
      {
         if(!s) s = { ...state } 
         s = { ...s, locale: props.locale, repage: true } 

      }

      loggergen.log("gDsFp",eq,props,state,s,state.id,state.LpanelWidth,JSON.stringify(state.filters))

      // pagination settings
      let d, newid = state.filters.datatype.sort()+"#"+props.keyword+"@"+props.language      
      if(state.id !== newid && props.keyword) { // && props.language) { 
         if(!s) s = { ...state }

         /*
         let fromAny2Work = state.id && state.filters.datatype.indexOf("Work") !== -1 && state.id.match(/^Any/)
         if(!state.id || !(sameKW && fromAny2Work)) 
         */   

         let sameKW = state.id && state.id.match(new RegExp("#"+props.keyword+"@"+props.language+"$"))
         

         if(!sameKW || (state.filters.datatype.length > 1 || state.filters.datatype.indexOf("Any") !== -1)) { //((state.filters.datatype.indexOf("Work") !== -1 || state.filters.datatype.indexOf("Any") !== -1) && (!state.id || state.filters.datatype.length > 1 || (!state.id.match(/Work/)&&!state.id.match(/Any/)) ) ) )
            for(let c of ["Other","ExprOf", "HasExpr", "Abstract"]) if(s.collapse[c] != undefined) delete s.collapse[c]         
            
            // + "purge cache" when changing keyword
            // TODO
            // ? investigate why pagination changes when back from instances ("191 -> 197")
            
            s.results = {}
         }
         //s.id = newid
         s.paginate = {index:0,pages:[0],n:[0]}         
         s.repage = true 
         if(sameKW && /*state.id.match(/Work/) &&*/ state.results[state.id] && state.results[state.id].bookmarks && Object.keys(state.results[state.id].bookmarks).length) {            
            if(!s.results) s.results = {}
            s.results[newid] = { bookmarks: state.results[state.id].bookmarks }
         }

         loggergen.log("new id",state.id,newid,sameKW,state.filters.datatype,s.results&&s.results[newid]?JSON.stringify(s.results[newid].bookmarks,null,3):null)
         
         //loggergen.log("collap!",JSON.stringify(state.collapse,null,3))

         if(props.config && props.config["facets-open"]) for(let o of props.config["facets-open"]) {
            if(o.types) {
               if(o.types.includes(state.filters.datatype.join("")) && o.facets) for(let p of o.facets) { 
                  if(s.collapse[p] === undefined) s.collapse[p] = true ;
               }
            } else {
               if(s.collapse[o] === undefined) s.collapse[o] = true ;
            }
         }

         if(s.uriPage) delete s.uriPage

      }
      else {
         newid = null

         if(props.keyword === "(latest)" && state.uriPage !== undefined) {
            if(!s) s = { ...state }
            delete s.uriPage
         }
      }


      subtime("getDerivedState:needRefresh",0)

      let needRefresh, time, current ;
      if(state.id && !newid && !props.loading) { 
         let inEtext 
         if(props.searches && props.searches[state.filters.datatype[0]] && props.searches[state.filters.datatype[0]][props.keyword+"@"+props.language] && props.searches[state.filters.datatype[0]][props.keyword+"@"+props.language].inEtext) {
            inEtext = props.searches[state.filters.datatype[0]][props.keyword+"@"+props.language].inEtext
         }         
         if(!state.results || !state.results[state.id] || !state.results[state.id].results || state.results[state.id].results.inEtext !== inEtext ) //|| !state.results[state.id].results.resLength //|| !Object.keys(state.results[state.id].results).length
         {
            needRefresh = true
            time = 1
            loggergen.log("refreshA",time)
         }
         else {
            current = state.results[state.id].results.time
            let k = props.keyword+"@"+props.language
            if(props.searches && props.searches[k]) { // && props.searches[k].time > state.results[state.id].results.time) {
               needRefresh = true ;
               time = props.searches[k].time
               loggergen.log("refreshB",time)
            }
            for(let d of ["Etext","Person","Instance","Work","Place","Topic","Corporation","Role","Lineage","Product","Scan"]) {
               if(props.searches && props.searches[d] && props.searches[d][k]) {
                  if(!time || props.searches[d][k].time > time) { 
                     time = props.searches[d][k].time 
                     needRefresh = true 
                     loggergen.log("refreshC",time,d,state.id,current)
                  }
               }  
            }      
            //|| (state.id.match(/Etext/) && state.results[state.id].results && state.results[state.id].results.results && state.results[state.id].results.results.bindings && !state.results[state.id].results.results.bindings.etexts)         
            //|| (state.id.match(/Work#/) && state.results[state.id].results && props.searches && props.searches["Work"] && props.searches["Work"][props.keyword+"@"+props.language] && state.results[state.id].results.time < props.searches["Work"][props.keyword+"@"+props.language])
         }
      }

      //console.log("time:",time,state.id,needRefresh,current)

      // 
      if(state.id && needRefresh && time && (!current || time > current))
      {
         //console.group("NEED REFRESH")

         if(props.searches[props.keyword+"@"+props.language] && (!time || time == 1)) { 
            time = props.searches[props.keyword+"@"+props.language].time
         }

         //loggergen.log("K:", props.keyword, time, current)

         let results
         if(state.filters.datatype.indexOf("Any") !== -1 || state.filters.datatype.length > 1 || state.filters.datatype.filter(d => ["Work","Etext","Person","Place","Topic","Role","Corporation","Lineage","Product","Scan"].indexOf(d) === -1).length ) {
            results = { ...props.searches[props.keyword+"@"+props.language] }
            //loggergen.log("any")
         }
         //loggergen.log("Ts1",JSON.stringify(state.searchTypes,null,3),JSON.stringify(state.filters.datatype,null,3))

         let Ts = [ ] //[ ...state.searchTypes.filter(e => e !== "Any") ]
         for(let dt of state.filters.datatype) { 
            if(dt === "Any") for(let t of searchTypes.slice(1)) { if(Ts.indexOf(t) === -1) Ts.push(t) }
            else if(Ts.indexOf(dt) === -1) Ts.push(dt)
         }
         
         //loggergen.log("Ts",Ts) //,props.searches,props.keyword+"@"+props.language,props.searches[props.keyword+"@"+props.language])

         let merge 
         if(props.searches[props.keyword+"@"+props.language] !== undefined || props.language === "") for(let dt of Ts) { 
            
            let res ;
            if(props.searches[dt]) res = { ...props.searches[dt][props.keyword+"@"+props.language] }
               
            if(!props.language) {
               results = { results:{ bindings:{} } }
            }
            else if(!results) {
               results = { ...props.searches[props.keyword+"@"+props.language] }               
               if(results) { results = { time:results.time, ...(res && res.inEtext?{inEtext:res.inEtext}:{}), results: { bindings:{ ...results.results.bindings } } }; }
               else results = { results: { time, bindings:{ } } }
            }
            
            let dts = dt.toLowerCase()+"s" 
            if(!merge) merge = {}

            loggergen.log("dts",dts,results,res)

            if(!res || !res.results || !res.results.bindings || !res.results.bindings[dts]) { 

               if(results.results && results.results.bindings[dts]) merge[dts] = { ...results.results.bindings[dts] } 
            }
            else {

               subtime("getDerivedState:needRefresh:merge",0)
               

               // >5sec!
               //
               // merge[dts] = { 
               //    ...Object.keys(res.results.bindings[dts]).reduce( (acc,k) =>{

               //          let m = [ ...res.results.bindings[dts][k].map(p => (p.type === tmp+"labelMatch"?{...p, type:tmp+/*pref*/"labelMatch"}:p)), //.filter(p => (!p.value || !p.value.match( /*/([Aa]bstract)*/ /([↦↤])/)) /*&& (!p.type || !p.type.match(/[Mm]atch|[Ee]xpression/))*/ ), 
               //                   ...(!results.results.bindings[dts]||!results.results.bindings[dts][k]||!props.language?[]:results.results.bindings[dts][k]) ]

               //          //loggergen.log("m?",dts,k,m.length) //,m)

               //          return {
               //             ...acc, 
               //             [k]:m 
               //          }
               //       }, {}),

               //    ...(!results.results.bindings[dts]||!props.language?[]:Object.keys(results.results.bindings[dts]).reduce( (acc,k) => {
               //          return {
               //             ...acc, 
               //             ...(!res.results.bindings[dts][k]?{[k]:results.results.bindings[dts][k]}:{})
               //          }
               //    },{}))
               // } 

               merge[dts] = {} // < 0.2sec!
               for(let k1 of Object.keys(res.results.bindings[dts])) {
                  let m = [ ...res.results.bindings[dts][k1].map(p => (p.type === tmp+"labelMatch"?{...p, type:tmp+"labelMatch"}:p)), 
                           ...(!results.results.bindings[dts]||!results.results.bindings[dts][k1]||!props.language?[]:results.results.bindings[dts][k1]) ]

                  merge[dts][k1] = m 
               }
               for(let k2 of (!results.results.bindings[dts]||!props.language?[]:Object.keys(results.results.bindings[dts]))) {
                  if(!res.results.bindings[dts][k2]) {
                     merge[dts][k2] = results.results.bindings[dts][k2]
                  }
               }                  

               subtime("getDerivedState:needRefresh:merge")

               // merge[dts] = { ...merge[dts], ...res.results.bindings[dts] } 
               /*...Object.keys(res.results.bindings[dts]).reduce( (acc,k) =>{
                  
                  return {
                     ...acc, 
                     [k]:[ ...res.results.bindings[dts][k].filter( p => (!time || !p.value || !p.value.match(/[Aa]bstract|[Mm]atch/) || !p.type || !p.type.match(/[Ee]xpression/)))),                      
                           ...(!time||dts!=="works"?[]:results.results.bindings[dts][k].filter( p => (!p.type || !p.type.match(/[Mm]atch/))))
                        ] 
                  }
               }, {}) } */

            }
            

            //loggergen.log("res!",dts,JSON.stringify(merge[dts],null,3))
         }         
         if(merge) { 
            if(!results.results) results = { results: {} }
            else results = { ...results, results: { ...results.results } }
            results.results.bindings = { ...merge }
         }
         

         //loggergen.log("rootres",JSON.stringify(results,null,3))

         /*
         if(!results) {

            if(Ts.indexOf("Etext")!==-1 && props.searches["Etext"] && props.searches["Etext"][props.keyword+"@"+props.language])
            {
               loggergen.log("etexts?",props.searches["Etext"][props.keyword+"@"+props.language])
               results = { ...props.searches["Etext"][props.keyword+"@"+props.language] }
            }
            ////results = { results:{ bindings:{} }, numResults:0 }
         }
         */
         if(results) {

            /* deprecated - no more abstract works
            if(results && results.results && results.results.bindings && results.results.bindings.works) {

               let works = results.results.bindings.works

               let ordered = Object.keys(works).sort((a,b) => {
                  let propAbsA = works[a].filter((e)=>(e.value.match(/AbstractWork/)))
                  let propAbsB = works[b].filter((e)=>(e.value.match(/AbstractWork/)))
                  let propExpA = works[a].filter((e)=>(e.type.match(/HasExpression/)))
                  let propExpB = works[b].filter((e)=>(e.type.match(/HasExpression/)))
                  let propExpOfA = works[a].filter((e)=>(e.type.match(/ExpressionOf/)))
                  let propExpOfB = works[b].filter((e)=>(e.type.match(/ExpressionOf/)))

                  if(propAbsA.length > 0) return -1 ;
                  else if(propAbsB.length > 0) return 1 ;
                  else if(propExpA.length > 0 && propExpB.length == 0) return -1 ;
                  else if(propExpB.length > 0 && propExpA.length == 0) return 1 ;
                  else if(propExpOfA.length > 0 && propExpOfB.length == 0) return -1 ;
                  else if(propExpOfB.length > 0 && propExpOfA.length == 0) return 1 ;
                  else return 0;
               })

               let tmp = {}
               for(let o of ordered) { tmp[o] = works[o]; 
               
                  //loggergen.log("o",o,tmp[o].filter(e => e.value && e.value.match(/[Aa]bstract/)))
               }
               results.results.bindings.works = tmp
               // results = ordered.reduce((acc,k) => { acc[k]=results[k]; },{})
            }
            */

            if(!s) s = { ...state }
            if(!s.results) s.results = {}
            if(!s.results[s.id]) s.results[s.id] = {}
            //if(s.results[s.id].bookmarks) delete s.results[s.id].bookmarks
            if(results && results.results && results.results.bindings && Object.keys(results.results.bindings).length) {
               s.results[s.id].results = results        
               s.results[s.id].repage = true
               //s.results[s.id].paginate = {index:0,pages:[0],n:[0]}
            }
            if(time && s.results[s.id].results) s.results[s.id].results.time = time    



            const t = s.filters.datatype[0].toLowerCase()
            if(t === "place") {
               const mapInfo = {}
               const sublist = s.results[s.id]?.results?.results?.bindings[t+"s"];
               const keys = Object.keys(sublist?sublist:{})
               //console.log("keys:",keys,s.results[s.id])
               for(let n in keys) {
                  let o = keys[n]
                  let lat = sublist[o].filter(k => k.type === bdo+"placeLat"),
                    long = sublist[o].filter(k => k.type === bdo+"placeLong")
                  if(lat.length && long.length) { 
                     mapInfo[o] = { data: sublist[o] }

                     lat = lat[0].value;
                     long = long[0].value                           
                     const latLong = [lat,long].map(n => {
                        if(n.match(/ [WS]$/)) n = "-" + n
                        return n.replace(/ [EWSN]$/,"")
                     })
                     mapInfo[o].latLong = (latLong)
                     
                     var redIcon = new L.Icon({
                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                     });

                     let sUri = shortUri(o), url = "/show/"+sUri+"?s="+ encodeURIComponent(window.location.href.replace(/^https?:[/][/][^?]+[?]?/gi,"").replace(/(&n=[^&]*)/g,"")+"&n="+(1+n))
                     
                     const sendMsgMap = (ev) => {
                        if(this.props.simple) {
                           let otherData =  {}, allProps = sublist[o] ;                              
                           otherData["tmp:type"] = "bdo:Place"
                           //if(!prettId.startsWith("bdr:")) otherData["tmp:externalUrl"] = resUrl
                           let msg = 
                              '{"@id":"'+sUri+'"'
                              +',"skos:prefLabel":'+JSON.stringify(allProps.filter(p => p.type === skos+"prefLabel").map(p => ({"@value":p.value,"@language":p["xml:lang"]})))
                              +',"tmp:keyword":{"@value":"'+lucenequerytokeyword(this.props.keyword)+'","@language":"'+this.props.language+'"}'
                              +',"tmp:propid":"'+this.props.propid+'"'
                              +(otherData?',"tmp:otherData":'+JSON.stringify(otherData):'')
                              +'}'
                           console.log("(MSG)",this.props.propid,JSON.stringify(otherData,null,3),msg)
                           window.top.postMessage(msg, "*") // TODO set target url for message
                           ev.preventDefault()
                           ev.stopPropagation()
                           return false
                        }
                     }

                     let lit = getLangLabel({props,state:s},"",sublist[o].filter(p => [skos+"prefLabel"].includes(p.type)))
                     if(!lit) console.warn("EMPTY lit:",o,sublist[o])
                     mapInfo[o].ref = React.createRef()
                     mapInfo[o].marker = (<Marker ref={mapInfo[o].ref} position={latLong} permanent icon={redIcon}> 
                           <MapPopup direction="top"><Link onClick={(ev) => sendMsgMap(ev)} to={url}>{ lit?.value }<br/><span className="RID">{sUri}</span></Link></MapPopup>
                     </Marker>)

                  }
               }
               s.mapInfo = mapInfo
            }

            
            if(needRefresh && results.results && results.results.bindings && Object.keys(results.results.bindings).length) { 
               s.repage = true
               
               // > pagination bug
               // s.paginate = {index:0,pages:[0],n:[0]}   
            }

            //loggergen.log("s.id",s.id,s.results[s.id],time)        
         }

         //console.groupEnd()
      }
      subtime("getDerivedState:needRefresh")


      if(props.instances) {

         let refresh = false
         if( !state.instances || (Object.keys(props.instances).length !== Object.keys(state.instances).length) 
            || Object.values(state.instances).filter(i => i === true).length !== Object.values(props.instances).filter(i => i === true).length
            ) {
            refresh = true
         }

         /*
         loggergen.log("inst ref",refresh,JSON.stringify(Object.keys(props.instances)), Object.values(props.instances).filter(i => i === true).length)
         if(state.instances) loggergen.log(JSON.stringify(Object.keys(state.instances)), Object.values(state.instances).filter(i => i === true).length)
         */
         
         if(refresh)
         {
            if(!s) s = { ...state }

            s.instances = { ...props.instances }
            s.repage = true
         }
      }

      if(props.isInstance) {
         
         if(!s) s = { ...state }

         s.filters = { ...s.filters, instance: props.keyword }

      }

      subtime("getDerivedState")

      if(s) { 
         loggergen.log("newS",s)
         return s ;
      }
      else return null;
   }


      // loggergen.log("newProps.facets",newProps.facets)


/*
   handleCheckFacet = (ev:Event,prop:string,lab:string[],val:boolean) => {

      let state =  this.state

      let propSet ;
      if(state.filters.facets) propSet = state.filters.facets[prop]

      let newF ;
      if(prop == bdo+"workGenre") {
         if(!val) lab = ["Any"]
         //newF = { ...prop.map(p => ({ [p] : lab })).reduce((e,acc) => ({...acc,...e}),{}) }
         newF = { [prop] : { alt : [ prop, bdo + "workIsAbout", tmp + "etextAbout" ], val : lab } }
      }
      else
      {
         newF = { [prop] : lab }
      }

      loggergen.log("checkF",prop,lab,val,newF)

      state = { ...state, paginate:{index:0,pages:[0],n:[0]}, repage: true }
      

      if(val || propSet)
      {
         let facets = { ...state.filters.facets, ...newF }
         state = {  ...state, filters: {  ...state.filters, facets } }

         if(this.state.filters.datatype && this.state.filters.datatype.indexOf("Any") === -1 && this.props.searches && this.props.searches[this.state.filters.datatype[0]])          
           this.props.onUpdateFacets(this.props.keyword+"@"+this.props.language,this.state.filters.datatype[0],Object.keys(facets).reduce((acc,f) => {
              if(facets[f].indexOf && facets[f].indexOf("Any") !== -1) return acc ;
              else if(facets[f].val && facets[f].val.indexOf("Any") !== -1) return acc ;
              else return { ...acc, [f]:facets[f] }
           },{}),this.props.searches[this.state.filters.datatype[0]][this.props.keyword+"@"+this.props.language].metadata,this.props.config.facets[this.state.filters.datatype[0]]);
      }      
      //else if(propSet)
      //{
      //   state = {  ...state, filters: {  ...state.filters, facets: { ...state.filters.facets, ...newF } } }
      //}

      this.setState( state )
   }
   */

   handleSearchTypes = (event:Event) => { //},lab:string,val:boolean) => {


      loggergen.log("checkST::",event.target,event.key,event.target.value)


      this.setState( { ...this.state, searchTypes:[ event.target.value ], langOpen:false }  );

      /*

      if(!val) {

         let dt = [ ...this.state.searchTypes ]

         if(lab === "Any") { dt = [] ; }
         else 
         {
            if(dt.indexOf("Any") !== -1) { dt = [ ...searchTypes.slice(1) ]; }
            let i ;
            if((i = dt.indexOf(lab))   !== -1) { delete dt[i]; }
            dt = dt.filter(e => e);
         }

         this.setState( { ...this.state, searchTypes:dt }  );
      }
      else {
         let dt = [ ...this.state.searchTypes ]         
         
         if(dt.indexOf(lab) === -1 && dt.indexOf("Any") === -1) 

         //if(searchTypes.slice(1).filter(i => !dt.includes(i)).length == 0 || lab === "Any" ) { dt = [ "Any" ] }

         this.setState( { ...this.state, searchTypes:dt, langOpen:false }  );
      }
      */
   }

   reverseSortBy(ev,check) {

      let sortBy = this.props.sortBy
      if(!sortBy) sortBy = "popularity"

      if(sortBy) {

         if(sortBy.endsWith("reverse") && !check) sortBy = sortBy.replace(/ reverse$/,"")
         else if(!sortBy.endsWith("reverse") && check) sortBy = sortBy+ " reverse"

         if(sortBy !== this.props.sortBy) this.updateSortBy(ev,true,sortBy,true)
      }

   }

   updateSortBy(ev,check,i,fromReverse = false) {

      let sortBy = this.props.sortBy
      if(!sortBy) sortBy = "popularity"

      if(sortBy.endsWith("reverse") && !fromReverse) i = i + " reverse"

      if(check && (!this.props.sortBy || i !== this.props.sortBy)) {            

         this.setState({collapse:{...this.state.collapse, sortBy:false}})

         let {pathname,search} = this.props.history.location
         search = search.replace(/((&|[?])s=[^&#]+)/g,"")      
         search += (search === ""?"?":"&")+"s="+i.toLowerCase()
         search = search.replace(/(\?&)|(^&)/,"?")
         this.props.history.push({pathname,search})         
         
      } 
   }

   handleCheckFacet = (ev:Event,prop:string,lab:string[],val:boolean,excl:boolean=false,force:boolean=false) => {

      start = Date.now()
      last_t = start
      sublabels = {}


      let state =  this.state

      let propSet ;
      if(state.filters.facets) propSet = state.filters.facets[prop]

      if(force) propSet = []

      if(!propSet) propSet = [ "Any" ]
      else if(propSet.val) propSet = propSet.val

      if(excl || !val) { propSet = propSet.filter(v => lab.indexOf(v) === -1) ; }
      if(val) propSet = propSet.concat(lab);

      if(!propSet.length) propSet = [ "Any" ] ;


      if(lab.indexOf("Any") !== -1) {
         if(val) propSet = [ "Any" ]
      }
      else {
         if(propSet.indexOf("Any") !== -1) propSet = propSet.filter(v => v !== "Any")
         if(!propSet.length) propSet = [ "Any" ] ;
      }

      
      if(!state.filters.exclude) state.filters.exclude = {}
      let exclude = state.filters.exclude ;
      if(!excl) {
         if(val) { 
            if(exclude[prop]) propSet = propSet.filter(v => exclude[prop].indexOf(v) === -1)
            exclude[prop] = [] // doesn't make sense both selecting a value and excluding another
         }
         else if(exclude[prop]) { 
            if(lab.indexOf("Any") === -1) exclude[prop] = exclude[prop].filter(v => lab.indexOf(v) === -1)
            else exclude[prop] = []
         }
         //if(!exclude[prop]) delete exclude[prop]
      }
      else if(propSet.indexOf("Any") === -1) { 
         if(!exclude[prop]) exclude[prop] = []
         exclude[prop] = [ ...exclude[prop], ...lab ]         
         if(excl && exclude[prop]) propSet = propSet.filter(v => exclude[prop].indexOf(v) !== -1)
      }


      loggergen.log("hCf:",ev,prop,lab,val,excl,propSet)


      let facets = state.filters.facets ;
      if(!facets) facets = {}
      if(prop == bdo+"workGenre" || prop == bdo+"workIsAbout") {
         facets = { ...facets, [prop] : { alt : [ prop, bdo + "workIsAbout", tmp + "etextAbout" ], val : Array.from(new Set(propSet.reduce( (acc,p) => {
            let ret = false
            if(val) {
               ret = true 
               let meta = this.props.searches[this.state.filters.datatype[0]][this.props.keyword+"@"+this.props.language]
               if(meta) meta = meta.metadata                  
               let already = []
               const checkParent = (p) => {
                  let node                  
                  if(prop == bdo+"workIsAbout" && meta.tree && meta.tree["@graph"]) node =  meta.tree["@graph"].filter(n => n["@id"] === p)
                  else if(prop == bdo+"workGenre" && meta.genres && meta.genres["@graph"]) node =  meta.genres["@graph"].filter(n => n["@id"] === p)
                  //console.log("check:",p,meta,node)
                  if(node?.length && !node.some(n => n.taxHasSubClass?.includes("Any"))) {
                     //console.log("check?",node[0]["@id"])
                     if(!node[0].taxHasSubClass.some(n => !lab.includes(n) && !propSet.includes(n) && !already.includes(n)) ){
                        if(!node[0].taxHasSubClass.some(n => !lab.includes(n) && !propSet.includes(n) && !already.includes(n)) ){
                           //console.log("check!")
                           if(excl) exclude[prop].push(node[0]["@id"])
                           acc.push(node[0]["@id"])
                           let k = node[0]["@id"]
                           if(this.props.topicParents && this.props.topicParents[k] && this.props.topicParents[k]) this.props.topicParents[k].map(checkParent)
                           else if(this.props.genresParents && this.props.genresParents[k] && this.props.genresParents[k]) this.props.genresParents[k].map(checkParent)
                           already.push(node[0]["@id"])
                        }
                     }
                  }
               }
               if(meta && lab) { 
                  // must add ancestor topic if all its subtopic checked
                  lab.map(k => {
                     if(prop == bdo+"workIsAbout" && this.props.topicParents && this.props.topicParents[k] && this.props.topicParents[k]) this.props.topicParents[k].map(checkParent)
                     else if(prop == bdo+"workGenre" && this.props.genresParents && this.props.genresParents[k] && this.props.genresParents[k]) this.props.genresParents[k].map(checkParent)
                  })
               }
            }
            else {
               if(lab) { 
                  ret = lab.some(k => {
                     // must remove all ancestor topic if any => keep ones that are not ancestor of current unchecked   
                     let isAncestor =  this.props.topicParents && this.props.topicParents[k] && this.props.topicParents[k].includes(p)
                                    || this.props.genresParents && this.props.genresParents[k] && this.props.genresParents[k].includes(p) 
                                    
                     // remove subtopics with subsubtopics too => keep topics that are not subtopic of unchecked topic (check Nyingma + uncheck/check Kama + uncheck Nyingma)
                     let isSubtopic = isAncestor // skip if already ancestor 
                                 || lab.reduce( (acc, q) =>  (acc 
                                                               || this.props.topicParents && this.props.topicParents[q] && this.props.topicParents[q].includes(p)
                                                               || this.props.genresParents && this.props.genresParents[q] && this.props.genresParents[q].includes(p)                                     
                                             ), false)

                     return !isAncestor && !isSubtopic
                  }) 


               } else {
                  ret = true
               }              
            }
            if(ret) {
               if(excl) exclude[prop].push(p)
               acc.push(p)                           
            }
            return acc
         },[]))) } }
      }
      else
      {
         facets = { ...facets, [prop] : Array.from(new Set(propSet)) }
      }

      if(exclude[prop]) exclude[prop] = Array.from(new Set(exclude[prop]))

      state = { ...state, paginate:{index:0,pages:[0],n:[0]}, repage: true, filters:{ ...state.filters, facets, exclude }  }      

      if(this.state.filters.datatype && this.state.filters.datatype.indexOf("Any") === -1 && this.props.searches && this.props.searches[this.state.filters.datatype[0]]) {

         loggergen.log("facets?",facets,prop)

         state.filters.preload = true

         let {pathname,search} = this.props.history.location
         search = search.replace(/([&?]([nf]|pg)=[^&]+)/g,"")+"&pg=1"+getFacetUrl(state.filters,this.props.config.facets[state.filters.datatype[0]])+(this.props.latest&&!(""+search).match(/t=/)?"&t=Scan":"")
         search = search.replace(/(\?&)|(^&)/,"?")
         this.props.history.push({pathname,search })
      }

      this.setState(state);

      loggergen.log("checkF",prop,lab,val,facets,state);



   }

   /*
   handleCheckMulti = (ev:Event,lab:string,val:boolean,params?:{},force?:boolean) => {

      loggergen.log("check::",lab,val,this.props.keyword,'('+this.state.keyword+')')

      //if(this.props.language == "") return

      //  // to be continued ...
      // let f = this.state.filters.datatype
      // if(f.indexOf(lab) != -1 && !val) f.splice(f.indexOf(lab),1)
      // else if(f.indexOf(lab) == -1 && val) f.push(lab)

      let types = searchTypes.slice(1) //[ "Person","Work","Corporation","Place","Etext", "Role","Topic","Lineage"]
      if(this.state.results && this.state.results[this.state.id] && this.state.results[this.state.id].types) types = this.state.results[this.state.id].types

      let f = [lab]

      let prevDT = [ ...this.state.filters.datatype ]

      let state =  { ...this.state, collapse: { ...this.state.collapse, HasExpr:true, Other:true, ExprOf:true, Abstract:true }, 
                     filters: {  datatype:f }, paginate:{index:0,pages:[0],n:[0]}, repage: true, 
                     ...params  }
     
      if(val)
      {
        
         if(lab === "Any") state = { ...state, filters:{ ...state.filters, datatype:["Any"] }}
         else {
            let dt = [ ...this.state.filters.datatype ]
            if(dt.indexOf(lab) === -1 && dt.indexOf("Any") === -1) dt.push(lab);

            if(types.filter(i => !dt.includes(i)).length == 0) { dt = [ "Any" ] }

            if(force) dt = [lab]
            else prevDT = null

            loggergen.log("dt:!:",dt,force,JSON.stringify(params,null,3))

            state = { ...state, filters:{ ...state.filters, datatype: dt, prevDT }}
         }

         if(["Any","Person","Work","Etext"].indexOf(lab) !== -1)
         {
            this.requestSearch(this.props.keyword,[lab])
            //state = { ...state, filters:{ ...state.filters, datatype: [lab] }}
         }
      }
      else if(!val)
      {           
         if(lab === "Any") state = { ...state, filters:{ ...state.filters, datatype:[] }}
         else {
            let dt = [ ...this.state.filters.datatype ]
            let i
            if(i = dt.indexOf("Any") !== -1) { dt = [ ...types ] }
            if((i = dt.indexOf(lab)) !== -1) { delete dt[i] }
            if((i = dt.indexOf("Any")) !== -1) { delete dt[i] }
            dt = dt.filter(e => e)

            loggergen.log("dt::",dt)

            if(prevDT.length <= 1) prevDT = null

            state = { ...state, filters:{ ...state.filters, datatype: dt, prevDT }}

            if(dt.length === 1) this.requestSearch(this.props.keyword,[dt[0]]);
         }
      }

      this.setState(state)
      loggergen.log("state::",JSON.stringify(state.collapse,null,3))

   }
   */

   handleCheck = (ev:Event,lab:string,val:boolean,params?:{},force?:boolean) => {

      loggergen.log("check::",lab,val,this.props.keyword,'('+this.state.keyword+')')

      //if(this.props.language == "") return

      //  // to be continued ...
      // let f = this.state.filters.datatype
      // if(f.indexOf(lab) != -1 && !val) f.splice(f.indexOf(lab),1)
      // else if(f.indexOf(lab) == -1 && val) f.push(lab)

      let types = searchTypes //.slice(1) //[ "Person","Work","Corporation","Place","Etext", "Role","Topic","Lineage"]
      if(this.state.results && this.state.results[this.state.id] && this.state.results[this.state.id].types) types = this.state.results[this.state.id].types

      let f = [lab]

      let prevDT = [ ...this.state.filters.datatype ]

      let state =  { ...this.state, collapse: { ...this.state.collapse, HasExpr:true, Other:true, ExprOf:true, Abstract:true }, 
                     filters: {  datatype:f }, paginate:{index:0,pages:[0],n:[0]}, repage: true, 
                     ...params  }
     
      if(val)
      {
         prevDT = null

         state = { ...state, filters:{ ...state.filters, datatype:[ lab ], prevDT }}

         if(state.sortBy) delete state.sortBy
         
         if([ /*"Any",*/ "Person","Place","Work","Etext","Role","Topic","Corporation","Lineage","Instance","Product","Scan"].indexOf(lab) !== -1)
         {
            console.log("rs??1")
            this.requestSearch(this.props.keyword.replace(/(^[(")]+)|([")]+(~1)?$)/g,""),[ lab ], this.props.language, true, ["date","id"].includes(this.props.language)?this.props.language:null);
         }
         
      }
      /*
      else if(!val)
      {            
         prevDT = null

         state = { ...state, filters:{ ...state.filters, datatype:[ "Any" ], prevDT }}
         
         this.requestSearch(this.props.keyword,["Any"]);
         
      }
      */

      this.setState(state)
      loggergen.log("state::",JSON.stringify(state.collapse,null,3))

   }
/*
handleCheck = (ev:Event,lab:string,val:boolean,params:{}) => {

      loggergen.log("check::",lab,val,this.props.keyword,'('+this.state.keyword+')')

      //if(this.props.language == "") return

      //  // to be continued ...
      // let f = this.state.filters.datatype
      // if(f.indexOf(lab) != -1 && !val) f.splice(f.indexOf(lab),1)
      // else if(f.indexOf(lab) == -1 && val) f.push(lab)


      let f = [lab]

      let state =  { ...this.state, collapse: { ...this.state.collapse, HasExpr:true, Other:true, ExprOf:true, Abstract:true }, 
                     filters: {   datatype:f }, paginate:{index:0,pages:[0],n:[0]}, repage: true, 
                     ...params  }

      if(val && this.props.keyword)
      {

         if(this.props.language != "")
         {
            loggergen.log("here?",lab)

            if(["Any","Person","Work","Etext"].indexOf(lab) !== -1)
            {
               this.requestSearch(this.props.keyword,lab)
            }
            else  {

               this.props.history.push("/search?q="+this.props.keyword+"&lg="+this.getLanguage()+"&t="+lab);
            }
         }
         else {


               this.props.history.push("/search?r="+this.props.keyword+"&t="+lab);

         }


      }

      this.setState(state)

   }
*/


   login() {
      this.props.auth.login(this.props.history.location);
   }

   logout() {
      this.props.auth.logout(this.props.history.location);
   }

   handleLanguage = event => {

      loggergen.log("handleL",event.target,event.key,event.target.value)

      if(!event.key && event.target.value!== undefined)
      {
         let s = { ...this.state, [event.target.name]: event.target.value, langOpen:false }
         if(this.props.keyword) s = { ...s } //, willSearch:true }

         loggergen.log("s!!!",s)

         this.setState( s );
      }
      else {

         loggergen.log("...",event,event.target.name,this._customLang.value)

         let s = { ...this.state,
               langOpen:true }

         if (event.key === 'Enter')
         {
            let customLang = this.state.customLang
            if(!customLang) customLang = []
            if(this._customLang.value && customLang.indexOf(this._customLang.value) === -1 && langSelect.indexOf(this._customLang.value) === -1)
               customLang.push(this._customLang.value)

            s = { ...s, [event.target.name]: this._customLang.value, langOpen:false, customLang }

            loggergen.log("s",s)

         }
         else if(!event.target.name) {
            s = { ...s, langOpen:false }

         }


         this.setState( s );

      }
  };

   /*
     handleCustomLanguage(e)
     {
         loggergen.log("handleCL",e)

         //this.setState({...this.state,customLang:this._customLang.value})
     }

     handleCustomLanguageKey(e)
     {
        loggergen.log("handleCLK",e)

        if (e.key === 'Enter')
        {

            loggergen.log("enter")
           //this.handleLanguage(e,this._customLang.value)

           this._customLang.value = "" ;
        }
     }
*/

   fullname(prop:string,preflabs:[],useUIlang:boolean=false,count)
   {
      if(!prop||prop.length === 0) return 
      let sTmp = shortUri(prop), trad = I18n.t("prop."+sTmp,{count})
      if("prop."+sTmp !== trad) return trad

      if(this.props.dictionary && this.props.dictionary[prop] && this.props.dictionary[prop][rdfs+"label"])
      {
         preflabs = []
         if(this.props.dictionary[prop][rdfs+"label"]) preflabs = [ ...preflabs, ...this.props.dictionary[prop][rdfs+"label"] ]
         if(this.props.dictionary[prop][skos+"prefLabel"]) preflabs = [ ...preflabs, ...this.props.dictionary[prop][skos+"prefLabel"] ]
      }      
      else if(this.props.dictionary && this.props.dictionary[prop] && !this.props.dictionary[prop][rdfs+"label"])
      {
         preflabs = []
      }

      if(preflabs)
      {
         if(!Array.isArray(preflabs)) preflabs = [ preflabs ]



         //loggergen.log("fullN",prop,preflabs,this.props.locale,this.props.prefLang,typeof preflabs[0])

         let lang = "lang";
         let val = "value";
         if(preflabs.length > 0 && preflabs[0]["@language"]) { lang = "@language" ; val = "@value"; }
         if(preflabs.length > 0 && preflabs[0]["xml:lang"]) { lang = "xml:lang" ; val = "value"; }

         let label = getLangLabel(this,prop,preflabs,false,useUIlang)

         //loggergen.log("full",prop,label,preflabs,useUIlang)

         /*
         let label = preflabs.filter(e => e[lang] == this.props.locale )
         if(label.length > 0) return label[0][val]
         label = preflabs.filter(e => e[lang] == this.props.prefLang)
         if(label.length > 0) return label[0][val]
         label = preflabs.filter(e => e[lang] == "en")
         if(label.length > 0) return label[0][val]
         label = preflabs.filter(e => e[lang] == "bo-x-ewts")
         */
         if(label) return label[val]
         //return preflabs[0][value]
      }

      return pretty(prop)
   }


   counTree(tree:{},meta:{},any:integer=0,tag:string):[]
   {
      //loggergen.log("cT:",tree,meta,any)
      let ret = [], idx = 0
      let tmp = Object.keys(tree).map(k => ({[k]:tree[k]}))
      let index = {}
      //loggergen.log("tmp",tmp)
      while(tmp.length > 0) {
         let t = tmp[0]

         let kZ = Object.keys(t)
         let kZsub = Object.keys(t[kZ[0]])

         let labels = this.props.dictionary[kZ[0]]
         if(labels && labels[rdfs+"label"]) labels = labels[rdfs+"label"]
         else if(labels && labels[skos+"prefLabel"]) labels = labels[skos+"prefLabel"]
         if(!labels) labels = []

         //loggergen.log("t:",t,kZ,kZsub,labels)

         tmp = tmp.concat(kZsub.map(k => ({[k]:t[kZ[0]][k]})))

         //loggergen.log("tmp",tmp)

         let cpt,checkSub ;         
         if(meta[kZ[0]] && meta[kZ[0]].n && kZ[0] != _tmp+"partOfVersion") 
            cpt = meta[kZ[0]].n
         else {
            cpt = kZsub.reduce((acc,e) => { return acc + (meta[e]&&meta[e].n?meta[e].n:0) ; },0)
            if(any && cpt > any) cpt = any ;
            checkSub = true ;
         }

         let cpt_i ;
         if(tag && this.props.metadata && this.props.metadata[tag]) {

            cpt_i = this.subcount(tag,kZ[0])         
            /*
            kZsub.reduce((acc,e) => { return acc + (meta[e]&&meta[e].i?meta[e].i:0) ; },0)
            if(cpt && cpt_i > cpt) cpt_i = cpt ;
            cpt_i = cpt_i + " / "
            */
         }
         

         //loggergen.log("cpt",cpt)

         var elem = {"@id":kZ[0],"taxHasSubClass":kZsub,["tmp:count"]:cpt,"skos:prefLabel":labels}
         if(cpt_i !== "") elem["tmp:subCount"] = cpt_i ;
         if(checkSub) elem = { ...elem, checkSub}
         ret.push(elem)
         index[kZ[0]] = idx + 2
         idx ++

         delete tmp[0]
         tmp = tmp.filter(e=> e != null);

         //loggergen.log("tmp",tmp,ret)
         //break;
      }

      ret = [
               {"@id":"root", "taxHasSubClass":["Any"].concat(Object.keys(tree))},
               {"@id":"Any",["tmp:count"]:any,"taxHasSubClass":[]}
           ].concat(ret)

      //loggergen.log("index",index)

      if(tag && this.props.metadata && this.props.metadata[tag]) {
         let any_i = 0
         for(let e of ret[0]["taxHasSubClass"]) {
            if(e !== "Any") {
               let root = ret[index[e]]
               /*
               //loggergen.log("root",root)
               root["tmp:subCount"] = 0
               for(let f of root["taxHasSubClass"]) {
                  let i = ret[index[f]]["tmp:subCount"] 
                  if(i) root["tmp:subCount"] += Number(i.replace(/[^0-9]/g,""))
               }
               */
               if(root["tmp:subCount"]) any_i += Number(root["tmp:subCount"].replace(/[^0-9]/g,""))
               root["tmp:subCount"] = root["tmp:subCount"] //+ " / "
            }
         }
         ret[1]["tmp:subCount"] = any_i + " / "
      }

      return ret;
   }

   prevPage(id)
   {
      let state = this.state.results[id] 
      if(state) state = state.paginate
      loggergen.log("state",state)   
      if(state && state.index > 0) {          
         this.setState({ 
            ...this.state, uriPage:false, results:{...this.state.results[id], message:[] }, paginate:{...state, index:state.index - 1}
         }) 

         let {pathname,search} = this.props.history.location
         search = search.replace(/(([&?])(n|pg)=[^&]+)/g,"")
         if(search) search += "&"
         this.props.history.push({pathname,search:search+"pg="+(state.index - 1 + 1)+"&n="+(state.n[state.index - 1]+1)})
      }
   }

   goPage(id,i)
   {
      let state = this.state.results[id] 
      if(state) state = state.paginate
      loggergen.log("state",state)   
      if(state && i > 0) { 
         this.setState({ 
            ...this.state, uriPage:false, results:{...this.state.results[id], message:[] }, paginate:{...state, index:i-1}
         }) 

         let {pathname,search} = this.props.history.location
         search = search.replace(/(([&?])(n|pg)=[^&]+)/g,"")
         if(search) search += "&"
         this.props.history.push({pathname,search:search+"pg="+(i)+"&n="+(state.n[i-1]+1)})
      }
   }

   nextPage(id)
   {
      let state = this.state.results[id] 
      if(state) state = state.paginate
      if(state && state.index < state.pages.length - 1) { 
         this.setState({ 
            ...this.state, uriPage:false, results:{...this.state.results[id], message:[] }, paginate:{...state, index:state.index + 1}
         }) 

         let {pathname,search} = this.props.history.location
         search = search.replace(/(([&?])(n|pg)=[^&]+)/g,"")
         if(search) search += "&"
         this.props.history.push({pathname,search:search+"pg="+(state.index + 1 + 1)+"&n="+(state.n[state.index + 1]+1)})
      }
   }

   inserTree(k:string,p:{},tree:{}):boolean
   {
      //loggergen.log("ins:",k,p,tree);

      for(let t of Object.keys(tree))
      {
         //loggergen.log(" t:",t)

         if(p[rdfs+"subPropertyOf"] && p[rdfs+"subPropertyOf"].filter(e => e.value == t).length > 0
         || p[rdfs+"subClassOf"] && p[rdfs+"subClassOf"].filter(e => e.value == t).length > 0
         || p[bdo+"taxSubClassOf"] && p[bdo+"taxSubClassOf"].filter(e => e.value == t).length > 0 
         || t === _tmp+"partOfVersion")
         {
            //loggergen.log("  k",k)
            tree[t] = { ...tree[t], [k]:{} }
            return true
         }
         else if(this.inserTree(k,p,tree[t])) return true ;
      }

      return false ;
   }

   handleOpenSourceMenu(event,src) {
      this.setState({ ...this.state,
         anchor:{...this.state.anchor,[src]:event.currentTarget},
         collapse:{...this.state.collapse,[src]:true}
      })
   }

   handleCloseSourceMenu(event,src) {
      this.setState({ ...this.state,
         anchor:{...this.state.anchor,[src]:null},
         collapse:{...this.state.collapse,[src]:false}
      })
   }


   getEtextLink(id,n,allProps:[]=[]) {

      // TODO activate links

      if(allProps.filter(e => e.type === bdo+"chunkContents" || e.type === tmp+"nbChunks").length)
         return <div class="match">
            <span class="instance-link">&gt;&nbsp;
               <span class="urilink" /*onClick={(e) => this.props.onGetInstances(shortUri(id))}*/ >See context</span>
               <emph> or </emph>
               <span class="urilink" >Open Etext</span>
            </span>
            </div>
   }

   getEtextChunks(id,n,allProps:[]=[]) {
      let chunks= allProps.filter(p => p.type === bdo+"eTextHasChunk")
      if(chunks.length) {

      }
   }

   getInstanceLink(id,n,allProps:[]=[]) {
      let nb = allProps.filter(p => p.type === tmp+"nbInstance"), ret = []
      if(nb.length) {
         nb = Number(nb[0].value)
         if(nb) {
            let instances = this.props.instances
            if(instances) instances = instances[fullUri(id)]


            const maxNbPreview = 10
            const normalNbPreview = 6
            let n = 0


            let iUrl = "/search?i="+shortUri(id)+"&t=Work&w="+ encodeURIComponent(window.location.href.replace(/^https?:[/][/][^?]+[?]?/gi,"").replace(/(&n=[^&]*)/g,"")+"&n="+n) //"/search?q="+this.props.keyword+"&lg="+this.props.language+"&t=Work&s="+this.props.sortBy+"&i="+shortUri(id)

            //loggergen.log("inst",instances)

            if(instances) { 
               let instK = Object.keys(instances).sort()

               for(let k of instK) {
                  let label = getLangLabel(this,"",instances[k].filter(e => e.type === skos+"prefLabel"))
                  
                  if(!label) label = { value:"","xml:lang":"?"}
                  // TODO etext instance ?

                  n++
                  ret.push(this.makeResult(k,-n,null,label.value,label["xml:lang"],null,null,null,[],null,instances[k],label.value,true))

                  if(nb > maxNbPreview && n >= normalNbPreview) {                     
                     break ;
                  }
               }
               if(ret.length) { 

                  ret = <Collapse className="res-collapse" in={this.state.collapse[id]}>
                     {ret}
                  </Collapse>
               }
            }

            let hasOpenPossibly = allProps.filter(p => p.type === tmp+"assetAvailability" && p.value === tmp+"possibleAccess") 
            let hasImage = allProps.filter(p => p.type === tmp+"assetAvailability" && p.value === tmp+"hasImage") 
            let hasEtext = allProps.filter(p => p.type === tmp+"assetAvailability" && p.value === tmp+"hasEtext") 

            ret = 
               <div style={{display:"block"}}>
                  <div class="match" style={{marginBottom:0}}>
                     <span class="label">{I18n.t("result.hasInstance", {count:nb})}</span>
                     <span class="assets">
                     { (hasOpenPossibly.length > 0) && <span title={getPropLabel(this,tmp+"assetAvailability",false)+": "+getPropLabel(this,tmp+"possibleAccess",false)}><img src="/icons/open.png"/></span>}
                     { (hasImage.length > 0) && <span title={getPropLabel(this,tmp+"assetAvailability",false)+": "+getPropLabel(this,tmp+"hasImage",false)}>{svgImageS}</span>}
                     { (hasEtext.length > 0) && <span title={getPropLabel(this,tmp+"assetAvailability",false)+": "+getPropLabel(this,tmp+"hasEtext",false)}>{svgEtextS}</span>}
                     </span>
                     <span class="instance-link">
                        { nb > maxNbPreview && <>
                           <Link class="urilink" to={iUrl}>{I18n.t("misc.browseA",{count:nb})}</Link>                     
                           <emph style={{margin:"0 5px"}}> {I18n.t("misc.or")} </emph>
                        </> }
                        <span class="instance-collapse" onClick={(e) => { 
                           if(!instances) this.props.onGetInstances(shortUri(id)) ; 
                           this.setState({...this.state,collapse:{...this.state.collapse,[id]:!this.state.collapse[id] },repage:true })
                        } } >{!this.state.collapse[id]
                                 ? (nb > maxNbPreview
                                    ? <span>{I18n.t("misc.previewN",{count:normalNbPreview})}</span>
                                    : <span>{I18n.t("misc.seeI",{count: nb})}</span>)
                                 : <span>{nb > maxNbPreview?I18n.t("misc.hide").toLowerCase():I18n.t("misc.hide")}</span>}
                           {!this.state.collapse[id]?<ExpandMore/>:<ExpandLess/>}
                        </span>
                     </span>
                  </div>
                  {ret}
                  { (nb > maxNbPreview && this.state.collapse[id]) && //!this.props.loading && 
                     <div class="match" style={{marginBottom:0}}>
                        <span class="label" style={{textTransform:"none"}}>{I18n.t("misc.seeM", {count:nb - normalNbPreview})}:</span>&nbsp;
                        <span class="instance-link"><Link class="urilink" to={iUrl}>{I18n.t("misc.browse").toLowerCase()}</Link></span> 
                     </div>
                  }
               </div>
                  
                     
                  


            return ret
         }
      }
   }

            /*
                  //if(seeAll) ret.push(<span class="instance-link">&gt;&nbsp;<Link class="urilink" to={iUrl}>Browse All Instances ({nb})</Link></span>)
            }
            else
               return <div class="match">
                  <span class="label">{"Has Instance"+(
                     //ret.length > 1 ?"s":""
                     "")}:&nbsp;</span> 
                  <span class="instance-link">
                     <span class="urilink" onClick={(e) => this.props.onGetInstances(shortUri(id))}>Preview</span>
                     <emph> or </emph>
                     <Link class="urilink" to={iUrl}>Browse All ({nb})</Link>
                  </span>
                </div>
         }
                */
      

   getReproductionsNoLink(id,n,allProps:[]=[]) {
      let nb = allProps.filter(p => p.type === tmp+"nbImageReproductions"), ret = []
      if(nb.length) {
         nb = Number(nb[0].value)
         if(nb >= 2) {
            let instances = this.props.instances
            if(instances) instances = instances[fullUri(id)]

            let iUrl = "/search?i="+shortUri(id)+"&t=Work&w="+ encodeURIComponent(window.location.href.replace(/^https?:[/][/][^?]+[?]?/gi,"").replace(/(&n=[^&]*)/g,"")+"&n="+n) //"/search?q="+this.props.keyword+"&lg="+this.props.language+"&t=Work&s="+this.props.sortBy+"&i="+shortUri(id)

            loggergen.log("inst:",instances,this.props.instances,this.state.collapse[id],id)


            if(!instances) {

               //setTimeout(() => this.props.onGetReproductions(shortUri(id)), 150) ; 
               
            } else { 
               
               let instK = Object.keys(instances).sort(), n = 1,  seeAll 

               for(let k of instK) {
                  let label = getLangLabel(this,"",allProps.filter(e => e.type === skos+"prefLabel"))
                  
                  if(!label) label = { value:"","xml:lang":"?"}
                  // TODO etext instance ?

                  ret.push(this.makeResult(k,-n,null,label.value,label["xml:lang"],null,null,null,[],null,instances[k],label.value,true))
                  n++
               }

               if(ret.length) { 

                  ret = <Collapse className="res-collapse" in={this.state.collapse[id]}>
                     {ret}
                  </Collapse>
               }
            }

            ret = 
               <div style={{display:"block"}}>
                  <div class="match" style={{marginBottom:0}}>
                     <span class="instance-link">
                        <span class="instance-collapse repro" onClick={(e) => { 
                           if(!instances) this.props.onGetReproductions(shortUri(id)) 
                           this.setState({...this.state,collapse:{...this.state.collapse,[id]:!this.state.collapse[id] },repage:true })
                        } } >{!this.state.collapse[id]?<span>{I18n.t("misc.showR",{count:nb})}</span>:<span>{I18n.t("misc.hideR")}</span>}{!this.state.collapse[id]?<ExpandMore/>:<ExpandLess/>}</span>
                     </span>
                  </div>

                  {ret}
               </div>

            return ret
         }
      }
   }


   
   getVal(prop,allProps) {

      if(!this.state.langPreset) return ;

      let ret = []
      let langs = extendedPresets(...this.state.langPreset)
      let labels = sortLangScriptLabels(allProps.filter(a => a.type === prop || a.fromKey === prop),langs.flat,langs.translit)
      for(let i of labels) {
         let val = i["value"] 
         //if(val === exclude) continue
         if(val && val.startsWith("http")) val = this.fullname(val,[],true)
         else val = highlight(val,lucenequerytokeywordmulti(this.props.keyword))
         let lang = i["xml:lang"]
         if(!lang) lang = i["lang"]
         ret.push(<span {...(lang?{lang:lang}:{})}>{val}{
            lang && <Tooltip placement="bottom-end" title={
                              <div style={{margin:"10px"}}>
                                 {I18n.t(languages[lang]?languages[lang].replace(/search/,"tip"):lang)}/>
                              </div>
                           }><span className="lang">&nbsp;{lang}</span></Tooltip>
                  }</span>)
      }
      return ret
   }

   getSeriesNumber(allProps)  {

      if(!allProps || !this.props.assoRes) return 

      let res = [], 
         number = allProps.filter(a => a.type === bdo+"seriesNumber"),
         series = allProps.filter(a => a.type === bdo+"serialInstanceOf"),
         label = this.props.assoRes[series[0]?.value]?.filter(l => l.fromKey === skos+"prefLabel")
      
      if(number?.length) { 
         number = <span>{number[0].value /*?.replace(/v. ?/g,"")*/ }</span>
      } else {
         number = false
      }
      
      if(series?.length) {
         const qname = shortUri(series[0]?.value)
         if (qname && label?.length) {
            label = getLangLabel(this, bdo+"serialInstanceOf", label)
            if(label?.value) {
               label = <Link to={"/show/"+qname} lang={label.lang}>{label.value}</Link>
            } else {
               label = <Link to={"/show/"+qname}>{qname}</Link>
            }
         } else {
            label = <Link to={"/show/"+qname}>{qname}</Link>
         }
      } else {
         label = false
      }
      
      if(label && number) res.push(<div class="match">
         <span class="label">{this.fullname(bdo+"seriesNumber",[],true)}{I18n.t("punc.colon")}&nbsp;</span>
         <div class="multi"><span>{number}&nbsp;{I18n.t("misc.in")}&nbsp;{label}</span></div>
      </div>)

      return res
   }

   getPublisher(allProps)  {

      //if (this.state.filters.datatype[0] !== "Instance")
      //   return

      let hasName, hasLoc, lab
      hasName = allProps.filter(a => a.type === bdo+"publisherName")  //.length > 0
      hasLoc = allProps.filter(a => a.type === bdo+"publisherLocation") //.length > 0
      
      const Ystart = allProps.filter(a => a.type === tmp+"yearStart") 
      const Yend = allProps.filter(a => a.type === tmp+"yearEnd") 
      
      let ret = []
      //if(ret.length) 
      if(hasName.length) { 
         lab = getLangLabel(this,"",hasName)
         ret.push(<div class={"match publisher "+this.props.locale}>
               <span class="label">{this.fullname("tmp:publisherName",[],true)}{I18n.t("punc.colon")}&nbsp;</span>
               <div class="multi"><span>{highlight(lab.value,lucenequerytokeywordmulti(this.props.keyword))}</span></div>
            </div>)
      }
      if(hasLoc.length) { 
         lab = getLangLabel(this,"",hasLoc)
         ret.push(<div class="match publisher">
               <span className={`label ${hasName.length ? "hidden-en" : ""}`}>{this.fullname("tmp:publisherName",[],true)}{I18n.t("punc.colon")}&nbsp;</span>
               <div class="multi"><span>{highlight(lab.value,lucenequerytokeywordmulti(this.props.keyword))}</span></div>
            </div>)
      }
      if(Ystart.length || Yend.length) {
         let dates = ""
         if(Ystart.length) dates += Ystart[0].value
         if(Yend.length) dates += " – " + Yend[0].value
         ret.push(<div class="match publisher">
               <span className={`label ${hasName.length||hasLoc.length ? "hidden-en" : ""}`}>{this.fullname("tmp:publisherName",[],true)}{I18n.t("punc.colon")}&nbsp;</span>
               <div class="multi"><span>{dates}</span></div>
            </div>)
      }

      return ret;
   }

   getResultProp(prop:string,allProps:[],plural:string="_plural", doLink:boolean = true, fromProp:[], exclude:string,useAux:[],findProp:[],altInfo:[],iri,T,n) {

      if(plural === true) plural = "_plural"

      if(exclude) {         
         if(exclude.value) { 
            exclude.value = exclude.value.replace(/[↦↤]/g,"")
            const translit = getLangLabel(this,"",[exclude])
            exclude = translit.value
         } else {
            exclude = exclude.replace(/[↦↤]/g,"")
         }
      }

      if(allProps && this.props.assoRes) { 
         if(!fromProp) fromProp = [ prop ]
         let ret = []
         let id ;
         if(!useAux) id = allProps.filter( e => fromProp.includes(e.type) && (!exclude || exclude !== e.value) )
         else if(findProp) { 
            id = allProps.filter(e => useAux.includes(e.type)).map(e => this.props.assoRes[e.value]).filter(e=>e).reduce( (acc,e) =>{
               let t = e.filter(f => f.type === rdf+"type")
               if(t.length) return { ...acc, [t[0].value]:[ ...acc[t[0].value]?acc[t[0].value]:[], ...e ]}
               else return acc
            },{}) 
         }
         
         //loggergen.log("labels/prop",iri,prop,id,exclude,useAux,fromProp,allProps) //,this.props.assoRes)         

         if(useAux && !findProp) { // etext

            id = allProps.filter(e => fromProp.includes(e.type)).map(e => [{"@id":e.value}, ...(!this.props.assoRes[e.value]?[]:this.props.assoRes[e.value].map(f => !e.expand||!e.expand.value||f.type !== bdo+"chunkContents"?f:{...e, ...f /*,expand:e.expand*/})) ]) //.reduce( (acc,e) => ([ ...acc, ...this.props.assoRes[e.value] ]),[]) 

            //loggergen.log("uA1",id,allProps,fromProp,useAux,findProp)

            let val,lang,cpt = 1

            for(let i of id) {
               let lab = i.filter(e => useAux.includes(e.type)), 
                  labels = getLangLabel(this,prop,lab) 


               if(labels) { 
                  lang = labels["xml:lang"]
                  if(!lang) lang = labels["lang"]
                  if(!lang) lang = labels["@language"]
                  val = labels.value
                  if(!val) val = labels["@value"]
               }

               let startChar, endChar, expand, context, inPart

               if(lab.length) { 
                  startChar = lab[0].startChar ; 
                  endChar = lab[0].endChar
               
                  expand = lab[0].expand
                  if(expand && expand.value) expand = getLangLabel(this,prop,[ expand ])
                  context = lab[0].context
                  if(context && context.value) context = getLangLabel(this,prop,[ context ])

                  inPart = lab[0].inPart
               }

               //loggergen.log("expand",expand)

               let info = ""
               if(altInfo) {
                  for(let f of altInfo) {
                     f = i.filter(e => e.type === f)
                     if(f[0] && f[0].value) info += " / " + f[0].value
                  }
               }
               
               /*
               ret.push(<div class="match" style={{margin:"5px 0 5px 0"}}>
                  <span>{highlight(val)}{
                     lang && <Tooltip placement="bottom-end" title={
                                       <div style={{margin:"10px"}}>
                                          <Translate value={languages[lang]?languages[lang].replace(/search/,"tip"):lang}/>
                                       </div>
                                    }><span className="lang">&nbsp;{lang}</span></Tooltip>
                           }{info}
                  </span>
               </div>)
               */
               
               ret.push(<div>{this.makeResult(iri /*i[0]["@id"]*/,n+"_"+cpt,null,"@"+startChar+"~"+endChar,"?",null,null,null,
                  [{lang,value:val,type:tmp+"textMatch",expand,context,startChar,endChar,inPart} ], //...i.filter(e => [bdo+"sliceStartChar",tmp+"matchScore"].includes(e.type) )],
                  null,[],null,true)}</div>)

               cpt++
            }

            if(ret.length) return ([
                        <span class="instance-collapse" onClick={(e) => { 
                           this.setState({...this.state,collapse:{
                              ...this.state.collapse,
                              [iri]: this.state.collapse.etextOtherM
                                     ? ( this.state.collapse[iri] === undefined
                                       ? false                                  
                                       : !this.state.collapse[iri] 
                                     )
                                     : !this.state.collapse[iri] 
                           }, repage:true })
                        }}>{!this.state.collapse[iri]&&(!this.state.collapse.etextOtherM||this.state.collapse[iri]===false)?<ExpandMore/>:<ExpandLess/>}</span>,
                        <span class="label">{this.fullname(prop,[],true,(plural && ret.length > 1 ?2:1))}{I18n.t("punc.colon")}&nbsp;</span>,
                        <div style={{clear:"both"}}></div>,
                        <Collapse in={this.state.collapse.etextOtherM && this.state.collapse[iri] !== false || this.state.collapse[iri]} >
                           {ret}
                        </Collapse>
                     ])
         }
         else if(useAux && findProp) {
            
            //loggergen.log("uA2",id,useAux,findProp)
            
            let birth = [], death = [], floruit = [], other = []

            for(let p of findProp) {
               
               if(id[p]) {
                  
                  let val = id[p].filter(e => fromProp.includes(e.type) )
                  //console.log("p:",p,val)
                  if(val.length) {
                     if(p.endsWith("Death")) death = death.concat(val)
                     else if(p.endsWith("Birth")) birth = birth.concat(val)
                     else if(p.endsWith("Floruit")) floruit = floruit.concat(val)
                     else other = other.concat(val)
                  } 

                  // let val = id[p].filter(e => e.type === bdo+"onYear")
                  // if(val.length) val = <span>{(""+val[0].value).replace(/^([^0-9]*)0+/,"$1")}</span>
                  // else {
                  //    let bef = id[p].filter(e => e.type === bdo+"notBefore")
                  //    let aft = id[p].filter(e => e.type === bdo+"notAfter")
                  //    if(bef.length && aft.length) val = <span>{(""+bef[0].value).replace(/^([^0-9]*)0+/,"$1")+"~" +(""+aft[0].value).replace(/^([^0-9]*)0+/,"$1")}</span>
                  //    else val = null
                  // }

                  // if(p.includes("Death") && !vals.length) { /*vals.push(<span>?</span>);*/ vals.push(<span>&nbsp;&ndash;&nbsp;</span>) }
                  // if(val) vals.push(val)
                  // if(p.includes("Birth")) vals.push(<span>&nbsp;&ndash;&nbsp;</span>)

                  /*
                  ret.push(<div class="match">
                     <span class="label">{this.fullname(p,[],true)}:&nbsp;</span>
                     <div class="multi">{val}</div>
                  </div>)
                  */

               }
            }

            //console.log("B/D:",JSON.stringify(birth,null,3),JSON.stringify(death,null,3))

            if(!other.length) {
               const vals = renderDates(birth, death, floruit)
               if(vals.length >= 1) ret.push(<div class="match dates">{vals}</div>)
            } else {

               ret.push(<div class="match">
                  <span class="label">{this.fullname(prop,[],true,(plural && ret.length > 1 ?2:1))}{I18n.t("punc.colon")}&nbsp;</span>
                  <div class="multi">{other.map(o => <span>{o.value}</span>)}</div>
               </div>)
            }
            
            return ret
         }
         else if(!doLink) {
            let hasToggle
            let langs = extendedPresets(...this.state.langPreset)
            let labels = sortLangScriptLabels(id,langs.flat,langs.translit)
            if(prop === bdo+"biblioNote") labels = _.orderBy(labels.map(l => ({l,len:l.value?.length})), ["len"]).map(l => l.l)
            for(let i of labels) {
               let val = i["value"] 
               if(val === exclude) continue
               
               let langval = getLangLabel(this,prop,[ i ])
               if(langval.value?.replace(/[↦↤]/g,"") === exclude) continue

               const translit = getLangLabel(this, "", [i])

               //console.log("val/excl:",val,exclude,translit)

               if(val === exclude || translit?.value?.replace(/_/g," ").replace(/[\/། ]+$|[↦↤]/g,"") === exclude?.replace(/_/g," ").replace(/[\/། ]+$|[↦↤]/g,"")) continue
               let lang = i["xml:lang"]

               if((""+val).match(/^[0-9-]+T[0-9:.]+Z+$/)) {
                  //val.replace(/[ZT]/g," ").replace(/:[0-9][0-9][.].*?$/,"")
                  
                  let code = "en-US"
                  let opt = { month: 'long', day: 'numeric' }
                  if(this.props.locale === "bo") { 
                     code = "en-US-u-nu-tibt"; 
                     opt = { day:'2-digit', month:'2-digit' } 
                     val = 'ཟླ་' + (new Intl.DateTimeFormat(code, opt).formatToParts(new Date(val)).map(p => p.type === 'literal'?' ཚེས་':p.value).join(''))
                     lang= "bo"
                  }
                  else {
                     if(this.props.locale === "zh") code = "zh-CN"
                     val = new Date(val).toLocaleDateString(code, { month: 'long', day: 'numeric' });  // does not work for tibetan
                  }
               }
               else if(val && val.startsWith("http")) val = this.fullname(val,[],true)
               else { 
                  /*
                  val = getLangLabel(this,prop,[i])
                  if(val) {
                     if(val.value && exclude && val.value.replace(/[↦↤]/g,"") === exclude) continue ;
                     val = highlight(val.value,lucenequerytokeywordmulti(this.props.keyword))
                     lang = val.lang
                  } else {
                     console.warn("val==NULL:",val,prop,i)
                  }
                  */
                  val = getLangLabel(this,prop,[i])
                  let kw = lucenequerytokeywordmulti(this.props.keyword).map(v => v.trim().replace(/[་༌།]+$/,""))                  
                  lang = val.lang
                  if(!lang) lang = val["xml:lang"]
                  
                  if(prop === bdo+"biblioNote") { 
                     if(this.state.collapse[iri+"-note"] != true) {
                        if(!val.value?.includes("↦")) val.value = val.value.replace(/^ *(([^ ]+ ){35})(.*?)$/,(m,g1,g2,g3)=>g1+(g3?" (...)":""))
                        else { 
                           val.value = val.value.replace(/^ *(.*?)(([^ ]+ ){17} *↦)/,(m,g1,g2,g3)=>(g1?"(...) ":"")+g2)
                           val.value = val.value.replace(/(↤ *([^ ]+ ){17})(.*?)$/,(m,g1,g2,g3)=>g1+(g3?" (...)":""))
                        }
                        if(val.value.startsWith("(...)") || val.value.endsWith("(...)") || this.state.collapse[iri+"-note"] == false) hasToggle = true
                     } else {
                        hasToggle = true
                     }
                  }
                  
                  // join by "EEEE" as it won't be affected in wylie from/to conversion 
                  if(this.props.language) {
                     kw = getLangLabel(this,"",[ { "value":kw.join("EEEE"), "lang": this.props.language } ])
                     if(val && kw.value !== undefined) {
                        val = highlight(val.value,kw.value.replace(/ *\[?EEEE\]? */g,"|"))
                     } else { 
                        if(!Array.isArray(kw)) kw = [ kw ]
                        val = highlight(i.value,kw.join("|"))
                     }
                     if(langval.lang) lang = langval.lang
                     else if(langval["xml:lang"]) lang = langval["xml:lang"]
                  } else {
                     if(val?.value) val = val.value
                     else val = i.value
                  }

               }
               //console.log("1 val:",val,lang,i)

               if(!lang) lang = i["lang"]
               if(!lang) lang = i["xml:lang"]
               ret.push(<span {...lang?{lang}:{}}>{val}{
                  lang && <Tooltip placement="bottom-end" title={
                                    <div style={{margin:"10px"}}>
                                       {I18n.t(languages[lang]?languages[lang].replace(/search/,"tip"):lang)}/>
                                    </div>
                                 }><span className="lang">&nbsp;{lang}</span></Tooltip>
                        }</span>)
            }
            if(hasToggle) {
               ret.push(
                  <span onClick={() => this.setState({repage:true,blurSearch:true,collapse:{ ...this.state.collapse, [iri+"-note"]:!this.state.collapse[iri+"-note"]}})} 
                     className="toggle-note" style={{display:"inline-flex", alignItems:"flex-end"}}>
                        <span>{I18n.t(this.state.collapse[iri+"-note"]?"misc.hide":"misc.expand")}</span>
                        {this.state.collapse[iri+"-note"]?<ExpandLess style={{fontSize:"18px"}}/>:<ExpandMore style={{fontSize:"18px"}}/>}
                  </span>)
            }
         }
         else if(id && id.length) { 

            let sortId = []

            for (let i of id) {

               // TODO presort values using language preferences

               let _i = i
               i = fullUri(i.value)
               let uri = shortUri(i), val = uri, lang

               let labels = this.props.assoRes[i]
               if(!labels && this.props.dictionary) { 
                  labels = this.props.dictionary[_i.value]
                  if(labels) {
                     if(labels[skos+"prefLabel"]) labels = labels[skos+"prefLabel"]
                     else labels = labels["http://www.w3.org/2000/01/rdf-schema#label"]
                  }
               }
               if(labels) labels = labels.filter(l => l.type === skos+"prefLabel" || l.fromKey === skos+"prefLabel")
               
               //loggergen.log("labels1",i,prop) //,labels,this.props.assoRes)

               if(labels?.length) { 
                  labels = getLangLabel(this,prop,labels)
                  if(labels) {
                     lang = labels["xml:lang"]
                     if(!lang) lang = labels["lang"]
                     if(!lang) lang = labels["@language"]
                     val = labels.value
                     if(!val) val = labels["@value"]
                  }
                  //loggergen.log("labels2",labels)                        
               }

               sortId.push({ value: val, lang, uri, _i})
            }

            let langs = extendedPresets(this.state.langPreset)
            sortId = sortLangScriptLabels(sortId,langs.flat,langs.translit)

            let outlineB 
            if(fromProp.filter(p => p.includes("/inRootInstance")).length) outlineB = []

            for (let i of sortId) {

               if(i.value != "false") {
                  let urilink

                  if(i.uri && !i.uri.includes(".bdrc.") && i.uri.startsWith("http")) urilink = <a target="_blank" href={i.uri}><span {...(i.lang?{lang:i.lang}:{})}>{i.value}</span></a> 
                  else urilink =  <Link class="inRoot" to={"/show/"+i.uri}><span {...(i.lang?{lang:i.lang}:{})}>{i.value}</span></Link> 

                  if(outlineB !== undefined && (!T || T !== "Etext")) {
                     outlineB.push(<span class="sepa"/>)
                     outlineB.push(<Link class="outL" to={iri}><img src="/scripts/mirador/images/collecR.svg"/>{I18n.t("result.openO")}</Link>)
                     outlineB.push(<span class="sepa"/>)
                     outlineB.push(<Link class="rec" to={iri.replace(/(show[/]).*?part=([^&]+)&/,"$1$2?")}><img src="/icons/rec.svg"/>{I18n.t("resource.openR")}</Link>)
                  }

                  //console.log("2 val:",i.lang,i)

                  ret.push(<span {...i.lang?{lang:i.lang}:{}}>{urilink}{outlineB}
                     {
                     i.lang && <Tooltip placement="bottom-end" title={
                                       <div style={{margin:"10px"}}>
                                          {I18n.t(languages[i.lang]?languages[i.lang].replace(/search/,"tip"):i.lang)}/>
                                       </div>
                                    }><span className="lang">&nbsp;{i.lang}</span></Tooltip>
                           }</span>)
               }
            }            
         }

         let by, inRoo ;
         if(fromProp) by = fromProp.filter(p => p.includes("/author")).length > 0
         if(fromProp) inRoo = fromProp.filter(p => p.includes("/inRootInstance")).length > 0

         if(ret.length && !useAux) return <div class={"match"+(by?" by":(inRoo?" inRootInst":""))} data-prop={prop}>
                  <span class="label">{this.fullname(prop,[],true,(plural && ret.length > 1 ?2:1))}<span class="colon">{I18n.t("punc.colon")}</span>&nbsp;</span>
                  <div class="multi">{ret}</div>
                </div>
      }
   }

   getEtextMatches(prettId,startC,endC,bestM,rmatch,facet,n) { 
      let lastP,prop = ""

      return rmatch.filter(m => !([ tmp+"nameMatch", bdo+"biblioNote", bdo+"catalogInfo", rdfs+"comment", tmp+"noteMatch", bdo+"colophon", bdo+"incipit" ].includes(m.type)) ).map((m) => {

         let expand,context,inPart	
         let uri,from	 	
         prop = this.fullname(m.type.replace(/.*altLabelMatch/,skos+"altLabel"),[],true)                     	

         let sTmp = shortUri(m.type), trad = I18n.t("prop."+sTmp)	
         if(trad !== sTmp) from = trad	

         //console.log("m:",m)

         let val,isArray = false ;	
         let lang = m["lang"]	
         if(!lang) lang = m["xml:lang"]	
         if(!Array.isArray(m.value)) {

            let mLit = getLangLabel(this,"",[m])	

            expand = m.expand	
            if(expand && expand.value) {	
               if(!this.state.collapse[prettId+"@"+startC]) expand = getLangLabel(this,m.type,[{...m, "value":expand.value}])	
               else expand = true	
            }	

            context = m.context	
            if(context && context.value) {	
               if(this.state.collapse[prettId+"@"+startC]) context = getLangLabel(this,m.type,[{...m, "value":context.value}])	
               else context = false	
            }	
            else context = false	

            inPart = m.inPart	

            if(mLit) {               
               lang = mLit["lang"]	
               if(!lang) lang = mLit["xml:lang"]	
               
               if(!facet && this.props.keyword && !this.props.keyword.includes(" AND ")) {
                  facet = lucenequerytokeyword(this.props.keyword) 
                  facet = getLangLabel(this,"",[{value:facet, lang:this.props.language}]) 
                  facet = facet.value
                  //console.log("facet2:",facet)
               } else if(!facet && this.props.keyword || facet && facet.indexOf(" AND ") !== -1) {
                  facet = []
                  for(let k of lucenequerytokeywordmulti(this.props.keyword)) facet.push(getLangLabel(this,"",[{value:k, lang:this.props.language}]))
                  if(facet.length) facet = facet.map(k => k.value)                  
                  //console.log("facet1:",facet)
               }
               val = highlight(mLit["value"], facet, context?context:expand, context)	
               //val =  mLit["value"]	
            }
         } 


         let toggleExpand = (e,id) => {	
            //loggergen.log("toggle",id)	
            this.setState({...this.state,repage:true,collapse:{...this.state.collapse, [id]:!this.state.collapse[id]}})
         }	

         let getUrilink = (uri,val,lang) => ([ <Link className="urilink" to={"/show/"+shortUri(uri)}>{val}</Link>,lang?<Tooltip placement="bottom-end" title={	
               <div style={{margin:"10px"}}>	
                  {I18n.t(languages[lang]?languages[lang].replace(/search/,"tip"):lang)}/>	
               </div>	
            }><span className="lang">&nbsp;{lang}</span></Tooltip>:null])	

         if(inPart && inPart.length) {	

            //loggergen.log("inPart:",inPart)	

            inPart = <div class="inPart">{[ <span>[ from part </span>, inPart.map( (p,i) => { 	
               let label = getPropLabel(this,p,false,true)	
               let ret = [getUrilink(p,label.value,label.lang)]	
               if(i > 0) ret = [ " / ", ret ]	
               return ret 	
            }), " ]" ]}<br/><br/></div>	
         }	

         return (<div className={"match "+prop}>	
            <span className={"label " +(lastP === prop?"invisible":"")}>{(!from?prop:from)}{I18n.t("punc.colon")}&nbsp;</span>	
               <span>{expand!==true?null:inPart}{[!uri?val:<Link className="urilink" to={uri}><span {...(lang?{lang:lang}:{})}>{val}</span></Link>,lang?<Tooltip placement="bottom-end" title={	
               <div style={{margin:"10px"}}>	
                  {I18n.t(languages[lang]?languages[lang].replace(/search/,"tip"):lang)}/>	
               </div>	
            }><span className="lang">&nbsp;{lang}</span></Tooltip>:null]}{expand?<span class="etext-match"><br/>&gt;&nbsp;	
               <span class="uri-link" onClick={(e) => { 	
                  if(!this.state.collapse[prettId+"@"+startC] && !m.context) this.props.onGetContext(prettId,startC,endC) ; 	
                  if(this.state.collapse[prettId+"@"+startC]) {  
                     if(this._refs && this._refs[n] && this._refs[n].current) {
                        this._refs[n].current.scrollIntoView(); 
                        console.log("ref:",n,this._refs[n].current)
                     }
                  }
                  toggleExpand(e,prettId+"@"+startC); 
               }}>{expand!==true?I18n.t("result.expandC"):I18n.t("result.hideC")}</span>	
               <span> {I18n.t("misc.or")} </span>	
               <Link to={"/show/"+prettId+bestM} class="uri-link">{I18n.t("result.openEin")}</Link>	
               </span>:null}</span>	                      	
            </div>)	
         
      })	
   }

   makeResult(id,n,t,lit,lang,tip,Tag,url,rmatch = [],facet,allProps = [],preLit,isInstance)
   {
      //loggergen.log("res:",id,facet,allProps,n,t,lit,preLit,lang,tip,Tag,rmatch,sameAsRes)

      // DONE fix scrolling back to result (#425)
      let doRef = true, nsub = n
      if(n < 0) { 
         n = -n
         doRef = false
      } else if((""+n).includes("_")) {
         n = nsub.split("_")[1]         
      }

      let sameAsRes,otherSrc= [] ;
      if(allProps) sameAsRes = [ ...allProps ]
      if(!id.match(/[:/]/)) id = "bdr:"+id // (id.startsWith("PR")?"bda:":"bdr:") + id

      let litLang = lang
      let savLit = "" + lit

      let prettId = id, fullId = id ;      
      for(let k of Object.keys(prefixesMap)) {
         prettId = prettId.replace(new RegExp(prefixesMap[k]),k+":")  
         fullId = fullId.replace(new RegExp(k+":"),prefixesMap[k])
      }
      prettId = prettId.replace(/[/]$/,"");

      if(!lit) lit = prettId

      let T = getEntiType(id)

      //loggergen.log("id",id,prettId)



      let status = "",warnStatus,warnLabel

      if(isAdmin(this.props.auth))
      {
         if(allProps) status = allProps.filter(k => k.type === adm+"status" || k.type === tmp+"status")
         if(status && status.length) status = status[0].value
         else status = null
         
         //if(status) warnLabel = getOntoLabel(this.props.dictionary,this.props.locale,status)
         if(!warnLabel && status)  warnLabel = status.replace(/^.*[/]([^/]+)$/,"$1")

         if(status && !status.match(/Released/)) warnStatus = <ErrorIcon/>
         if(status && status.match(/Withdra/)) warnStatus = <WarnIcon/>

         if(warnStatus) warnStatus = <Tooltip key={"tip"} placement="bottom-end" title={<div style={{margin:"10px"}}>{warnLabel}</div>}>{warnStatus}</Tooltip>

         if(status) status = status.replace(/^.*[/]([^/]+)$/,"$1")
         else status = ""
      }

      let langT, langs = [], isSerial;
      if(lit && lit.startsWith && lit.startsWith("@")) T = "match"
      if(T === "Work") { 
         langT = allProps.filter(p => p.type === bdo+"language")      
         isSerial = allProps.filter(a => a.type === rdf+"type" && a.value === bdo+"SerialWork").length > 0
      }
      else if(T === "Instance") langT = allProps.filter(p => p.type === bdo+"script")

      if(langT && langT.length) for(let l of langT.sort((a,b)=>{
         if(a.value > b.value) return 1
         else if(a.value < b.value) return -1
         else return 0
      })) { 
         langs.push(<span title={getPropLabel(this,bdo+(T==='Work'?'language':'script'),false)+I18n.t("punc.colon")+" "+getPropLabel(this,l.value,false)} data-lang={l.value}>
            {T==='Instance'?<span>{l.value.replace(/^.*[/]Script([^/]+)$/,"$1")}</span>:null}
         </span>)
      }

      let enType = getEntiType(id).toLowerCase()

      let hasImage = allProps.filter(p => p.type === tmp+"assetAvailability" && p.value === tmp+"hasImage") 
      if(enType === "instance" && (!hasImage || !hasImage.length)) hasImage = false
      else hasImage = true

      let hasThumb = allProps.filter(a => a.type && a.type.startsWith(tmp+"thumbnailIIIFSe")), hasCopyR, viewUrl,access, quality
      if(hasThumb.length) { 
         hasThumb = hasThumb[0].value 
         if(hasThumb) {             
            //loggergen.log("hasThumb",hasThumb)
            
            //hasCopyR = allProps.filter(a => a.type === tmp+"hasOpen")
            //if(hasCopyR.length && hasCopyR[0].value == "false") {

            viewUrl = allProps.filter(a => a.type === bdo+"instanceHasReproduction" && !a.value.includes("/resource/IE"))
            if(viewUrl.length) viewUrl = shortUri(viewUrl[0].value)
            else viewUrl = null
            if(viewUrl && viewUrl.startsWith("bdr:")) viewUrl = "/show/" + viewUrl + "?s="+ encodeURIComponent(window.location.href.replace(/^https?:[/][/][^?]+[?]?/gi,"").replace(/(&n=[^&]*)/g,"")+"&n="+n)+"#open-viewer"
            else if(viewUrl) viewUrl = fullUri(viewUrl)


            access = allProps.filter(a => [tmp+"hasReproAccess", adm+"access", tmp+"access"].includes(a.type))
            if(access.length) access = access[0].value            
            
            if(this.props.config && this.props.config.iiif && this.props.config.iiif.endpoints[this.props.config.iiif.index].match(/iiif-dev/)) hasThumb = hasThumb.replace(/iiif([.]bdrc[.]io)/, "iiif-dev$1")
            if(!hasThumb.match(/[/]default[.][^.]+$/)) hasThumb += "/full/"+(hasThumb.includes(".bdrc.io/")?"!2000,145":",145")+"/0/default.jpg" 
            else hasThumb = hasThumb.replace(/[/]max[/]/,"/"+(hasThumb.includes(".bdrc.io/")?"!2000,145":",145")+"/")

            quality = allProps.filter(a => [ bdo+"qualityGrade", tmp+"hasReproQuality" ].includes(a.type))
            if(quality.length) quality = quality[0].value            

            //loggergen.log("access",access,quality)

            if(access && access.length) {
               hasCopyR = "unknown"            
               if(access.includes("FairUse")) hasCopyR = "fair_use"
               else if(access.includes("Temporarily")) { hasCopyR = "temporarily";  hasThumb = []; }
               else if(access.includes("Sealed")) { hasCopyR = "sealed";  hasThumb = []; }
               else if(access.includes("Quality")) { if(this.props.auth && !this.props.auth.isAuthenticated()) hasThumb = []; }
               else if(access.includes("Open")) hasCopyR = "copyleft"
               //if(access.includes("Restricted")) { hasCopyR = "restricted"; hasThumb = []; }
            } 

            if(quality === "0") {
               hasCopyR = "quality"
            }

         }
      }

      let orec = allProps.filter(e => e.type === adm+"originalRecord")

      let hasProv, prov = allProps.filter(a => a.type === tmp+"provider")
      if(prov && prov.length && this.props.dictionary) prov = this.props.dictionary[prov[0].value]
      if(prov && prov[skos+"prefLabel"] && prov[skos+"prefLabel"]) prov = (""+prov[skos+"prefLabel"].filter(p=>!p.lang || p.lang === "en")[0].value).toLowerCase()
      else prov = false
      
      //console.log("prov:",prov)

      if(prov) prov = prov.replace(/(^\[ *)|( *\]$)/g,"") // CUDL
      if(prov) prov = prov.replace(/internet archives/g,"ia") 
      if(prov) prov = prov.replace(/library of congress/g,"loc") 
      if(prov) prov = prov.replace(/staatsbibliothek zu berlin/g,"sbb")
      if(prov) prov = prov.replace(/leiden university libraries/g,"lul")
      if(prov && prov !== "bdrc" && img[prov]) hasProv = <img class={"provImg "+prov+ (orec.length?" oriRec":"")} title={I18n.t("copyright.provided",{provider:providers[prov]})} src={img[prov]}/>


    


         let bestM = allProps.filter(e => e.type === tmp+"bestMatch")
         if(!bestM.length) bestM = rmatch.filter(e => e.type === tmp+"textMatch")
         let startC, endC 

         //loggergen.log("bestM",bestM)

         if(bestM.length) { 
            endC = bestM[0].endChar
            bestM = "?startChar="+(startC = bestM[0].startChar) /*+"-"+bestM[0].endChar*/ +"&keyword="+this.props.keyword+"@"+this.props.language+"#open-viewer"
         }
         else bestM = ""

         let prefix = prettId.replace(/:.*$/,""), resUrl
         
         let directSameAs = false

         if(!prettId.match(/^bd[ar]:/) && (fullId.match(new RegExp(cbcp+"|"+cbct+"|"+rkts)) || !sameAsRes || !sameAsRes.filter(s => s.value.match(/[#/]sameAs/) || (s.type.match(/[#/]sameAs/) && (s.value.indexOf(".bdrc.io") !== -1 || s.value.indexOf("bdr:") !== -1))).length))   {
            let u 
            if ((u = sameAsRes.filter(s => s.type === adm+"canonicalHtml")).length) {
               u = u[0].value
            } else {
               u = fullId
            }

            resUrl = u
            //retList.push( <a target="_blank" href={u} className="result">{ret}</a> )

            if(!this.props.language && !fullId.match(new RegExp(cbcp+"|"+cbct+"|"+rkts)) && fullId.match(new RegExp(bdr))) rmatch = [ { type:tmp+"sameAsBDRC", value:prettId,  lit } ]

            directSameAs = true
         }
         else if(prettId.match(/^([^:])+:/)) {
            let urlpart = prettId+"?"
            let inRoot = allProps.filter(e => e.type === bdo+"inRootInstance")
            if (inRoot.length > 0) {
               let root = inRoot[0].value
               if (root.startsWith(bdr)) {
                  root = "bdr:"+root.substring(bdr_len)
                  urlpart = root+"?part="+prettId+"&"
               }
            }
            let urlBase ;
            if(window.location.href.match(/\/latest/)) urlBase = window.location.href.replace(/.*?\/latest[\/]?/,"latest?");
            else urlBase = window.location.href.replace(/^https?:[/][/][^?]+[?]?/gi,"")+"&"
            //console.log("urlB",urlBase)
            resUrl = "/show/"+urlpart+"s="+ encodeURIComponent((urlBase.replace(/((([?])?&*|^)n=[^&]*)/g,"$3")+(!urlBase.match(/[\?&]$/)?"&":"")+"n="+n).replace(/\?+&?/,"?"))+(!bestM?"":"&"+bestM.replace(/^\?/,""))
            //retList.push( <Link key={n} to={"/show/"+prettId+bestM} className="result">{ret}</Link> )
         }
         else
            resUrl = (url?url.replace(/^https?:/,""):id.replace(/^https?:/,""))
            //retList.push( <Link key={n} to={url?url.replace(/^https?:/,""):id.replace(/^https?:/,"")} target="_blank" className="result">{ret}</Link> )


         let getBDOtype = (t) => {
            // DONE: check compliance with BLMP
            if(t === "Images") return "bdo:ImageInstance"
            else if(t === "Etext") return "bdo:EtextInstance"
            else if(t === "Work" && isSerial) return "bdo:SerialWork"            
            return "bdo:"+t
         }

         let sendMsg = (ev,prevent = false,resUrl) => {

            if(this.props.useDLD && resUrl){
               let scans = allProps.filter(a => a.type === bdo+"instanceHasReproduction" && !a.value.includes("/resource/IE"))
               let version = allProps.filter(a => a.type === bdo+"instanceReproductionOf")               
               let hasRoot = allProps.filter(a => a.type === bdo+"inRootInstance")               
               //console.log("resU:",resUrl,scans,version,hasRoot,allProps)
               if(scans.length || version.length || hasRoot.length) {
                  const rid = resUrl.replace(/^[/]show[/]bdr:([^?]+)[?].*/,"$1")
                  const nbVol = allProps.filter(a => a.type === bdo+"numberOfVolumes").map(v => v.value)               
                  if(window.DLD && window.DLD[rid]) {
                     window.top.postMessage(JSON.stringify({"open-viewer":{ rid, label: [ preLit ], nbVol: ""+nbVol }}),"*")        
                     ev.preventDefault();
                     ev.stopPropagation();
                     return false ;
                  } else {
                     //console.log("hR:",hasRoot)
                     if(hasRoot.length && (hasRoot = hasRoot[0]?.value?.replace(/.*[/]M([^/]+)$/,"$1")) && window.DLD && window.DLD[hasRoot]) {
                        window.top.postMessage(JSON.stringify({"open-viewer":{ rid, label: [ preLit ], nbVol: ""+nbVol }}),"*")        
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
            } else if(this.props.simple) {
               let otherData =  {} ;
               if(T === "Person") {
                  //console.log("allP:",allProps)
                  otherData = allProps.filter(e => [bdo+"personEvent"].includes(e.type)).map(e => this.props.assoRes[e.value]).reduce( (acc,e) =>{
                     let t = e.filter(f => f.type === rdf+"type")
                     let k = shortUri(t[0].value, true)
                     //console.log("t,k",t,k)
                     if(t.length) return { ...acc, 
                        [k]:[ ...acc[k]?acc[k]:[],
                           e.filter(e => [bdo+"onYear", bdo+"notBefore", bdo+"notAfter", bdo+"eventWhere"].includes(e.type))
                            .reduce( (subacc,p)=>( {...subacc, [shortUri(p.type, true)]: shortUri(p.value, true) }),{}) 
                        ] }
                     else return acc
                  },{}) 
               }
               otherData["tmp:type"] = getBDOtype(T) 
               if(!prettId.startsWith("bdr:")) otherData["tmp:externalUrl"] = resUrl
               let msg = 
                  '{"@id":"'+prettId+'"'
                  +',"skos:prefLabel":'+JSON.stringify(allProps.filter(p => p.type === skos+"prefLabel").map(p => ({"@value":p.value,"@language":p["xml:lang"]})))
                  +',"skos:altLabel":'+JSON.stringify(allProps.filter(p => p.type === skos+"altLabel").map(p => ({"@value":p.value,"@language":p["xml:lang"]})))
                  +',"tmp:keyword":{"@value":"'+lucenequerytokeyword(this.props.keyword)+'","@language":"'+this.props.language+'"}'
                  +',"tmp:propid":"'+this.props.propid+'"'
                  +(otherData?',"tmp:otherData":'+JSON.stringify(otherData):'')
                  +'}'
               console.log("(MSG)",this.props.propid,JSON.stringify(otherData,null,3),msg)
               window.top.postMessage(msg, "*") // TODO set target url for message
               if(prevent) {
                  ev.preventDefault()
                  ev.stopPropagation()
                  return false;
               }
            }
         }


         let getIconLink = (resUrl,div) => {

            if(!resUrl.startsWith("http")) return <Link to={resUrl}  onClick={(ev) => sendMsg(ev, true, resUrl)}>{div}</Link>
            else return <a href={resUrl} target="_blank"  onClick={(ev) => sendMsg(ev, true)}>{div}</a>

         }

         let resulType = T
         if(T === "Place") {            
            resulType = allProps.filter(p => p.type === bdo+"placeType")
            if(resulType.length) resulType = getPropLabel(this,resulType[0].value,false)
            else resulType = I18n.t("types.place")
         }
         else if(T === "Instance") {            
            resulType = allProps.filter(p => p.type === bdo+"partType")
            if(resulType.length) resulType = getPropLabel(this,resulType[0].value,false)
            else resulType = I18n.t("types.instance")
         } else {
            if(isSerial) resulType = "serial"
            resulType = I18n.t("types."+resulType.toLowerCase())
         }

           let ret = ([            
            <div key={t+"_"+n+"__"}  className={"contenu" }>
                  <ListItem style={{paddingLeft:"0"}}>
                     {/* <ListItemText style={{height:"auto",flexGrow:10,flexShrink:10}}
                        primary={ */}
                           <div>
                              <span class="T">{resulType}{langs}</span>
                              <h3 key="lit" lang={lang}>
                                 {lit}
                                 { (resUrl && !resUrl.includes("/show/bdr:") && !resUrl.includes("/show/bda:")) && <img class="link-out" src="/icons/link-out_fit.svg"/>}
                                 { lang && <Tooltip key={"tip"} placement="bottom-end" title={
                                          <div style={{margin:"10px"}}>
                                             {I18n.t(languages[lang]?languages[lang].replace(/search/,"tip"):lang)}/>
                                          </div>
                                       }>
                                          <span className="lang">&nbsp;{lang}</span>
                                       </Tooltip> }
                              </h3>
                        {/*   </div>
                         }
                        //secondary={id}
                        secondary={
                           <div> */}
                              {/* <p key="id">
                                 {prettId}
                                 { Tag && <Tooltip key={"tip"} placement="bottom-start" title={
                                          <div style={{margin:"10px"}}>
                                             {tip}
                                          </div>
                                       }>
                                          <Tag style={{height:"18px",verticalAlign:"-4px",marginLeft:"5px"}}/>
                                       </Tooltip>}
                              </p> */}
                           </div>
                        {/* }
                     ></ListItemText> */}
                     {/* { Tag && <ListItemIcon><Tag/></ListItemIcon> } */}
                  </ListItem>
            </div>
         ])



         let retList = [ 
            <div id="num-box" class={(this.state.checked[prettId] === true?"checked":"")} style={{flexShrink:0}} onClick={(e) => this.setState({repage:true,checked:{...this.state.checked,[prettId]:!this.state.checked[prettId]}})}>{warnStatus}{I18n.t("punc.num",{num:n})}</div>,         
            <div id="icon" class={enType + (hasCopyR?" wCopyR":"")+(hasThumb.length > 0 ? "" : " noThumb")}>
               { hasThumb.length > 0  && <div class="thumb" title={I18n.t("copyright.view")}>{
                   getIconLink(viewUrl?viewUrl:resUrl+"#open-viewer", <LazyLoad height={130} offset={500}><img src={hasThumb}/></LazyLoad>)
                  }</div> }
               { hasThumb.length === 0 && [
                  <div>{
                     getIconLink(resUrl,<img src={"/icons/search/"+enType+".svg"}/>)
                  }</div>, 
                  <div>{
                     getIconLink(resUrl,<img src={"/icons/search/"+enType+"_.svg"}/>)
                  }</div>] }                  
               <div class="RID">{prettId}</div>
               {hasProv}
               { /*hasCopyR === "copyleft" && <img title={I18n.t("copyright.open")} src="/icons/open.svg"/>*/ }
               {hasCopyR === "quality" && <span class="copyRi lowQ" title={I18n.t("copyright.lowQuality")}><img src="/icons/lowrate.png"/></span>}
               {hasCopyR === "fair_use" && <span class="copyRi" title={I18n.t("copyright.fairUse")}><img src="/icons/fair_use.svg"/></span>}
               {hasCopyR === "temporarily" && <span class="copyRi" title={I18n.t("copyright.tempo")}><img src="/icons/temporarily.svg"/></span>}
               {hasCopyR === "sealed" && <span class="copyRi" title={I18n.t("copyright.sealed")}><img src="/icons/sealed.svg"/></span>}
               {hasCopyR === "unknown" && <span class="copyRi" title={this.fullname(access)}><img src="/icons/unknown.svg"/></span>}
               {!hasImage && <span class="copyRi noImg" title={I18n.t("copyright.noImg")}><img src="/icons/noimg.svg"/></span>}
               { /* hasThumb.length > 0 && getIconLink(viewUrl?viewUrl:resUrl+"#open-viewer", <img title={I18n.t("copyright.scans")} style={{width:"20px"}} src="/icons/search/images.svg"/>) */}
            </div>
         ]

         if(!resUrl.startsWith("http")) retList.push(<Link to={resUrl.replace(/#open-viewer$/,"")} className="result" onClick={(ev) => sendMsg(ev, true)}>{ret}</Link>)         
         else retList.push(<a href={resUrl} target="_blank" className="result"  onClick={(ev) => sendMsg(ev, true)}>{ret}</a>)         

         let type = this.state.filters.datatype[0]
         let typeisbiblio = (type === "Work" || type === "Instance" || type === "Etext" || type === "Scan")
         let by = this.getResultProp(I18n.t("result.workBy"),allProps,false,true,[tmp+"author"])
         let byStat = this.getResultProp(I18n.t("result.workBy"),allProps,true,false,[bdo+"authorshipStatement"])
         let details = <div class={"more-details"+( this.state.collapse["more-details-"+id] == true ?" on":"" )} onClick={(ev) => {
            this.setState({ repage:true, collapse:{...this.state.collapse, ["more-details-"+id]:!this.state.collapse["more-details-"+id]}})
            ev.preventDefault();
            ev.stopPropagation();
            return false;
         }}>
                        { this.state.collapse["more-details-"+id] != true && <ExpandMore /> }
                        { this.state.collapse["more-details-"+id] && <ExpandLess /> }
                     </div>
         let inRoo = this.getResultProp(I18n.t("result.inRootInstance"),allProps,false,true,[bdo+"inRootInstance",tmp+"inRootInstance"],null,null,null,null,resUrl,T)
         let personDates = this.getResultProp(I18n.t("result.year"),allProps,false,false,[tmp+"onYear",bdo+"onYear",bdo+"notBefore",bdo+"notAfter"],null,[bdo+"personEvent"],[bdo+"PersonBirth",bdo+"PersonDeath"]) 

         if(typeisbiblio && (by || inRoo) || type === "Person" && personDates ) retList.push( <div id='matches' class={"mobile hasAuthor "+( this.state.collapse["more-details-"+id] == true ?" on":"" )}>         

               { typeisbiblio && inRoo } 
               { typeisbiblio && by }
               {/* { typeisbiblio && byStat } */}
               { type === "Person" && personDates }
               { details}
            </div>)
         else {

            retList.push(details)
         }   
         


         let dico
         if(!sameAsRes) sameAsRes = []        

         if(rmatch.filter(e => e.type === owl+"sameAs")) { 

            if(orec.length) orec = orec[0].value
            else orec = undefined

            sameAsRes.push({type:owl+"sameAs",value:id, orec});
         }

         if(!sameAsRes.length) sameAsRes = sameAsRes.concat(rmatch.filter(e => e.value === owl+"sameAs")).map(e => ({ "type":owl+"sameAs", "value":this.props.keyword}))
         else {
            dico = sameAsRes.filter(p => p["lang"]!== undefined || p["xml:lang"]!== undefined || p["@language"]!== undefined).reduce( (acc,e) => {
               let id = acc[e.type]
               if(!id) id= []
               id.push(e);
               return ({...acc,[e.type]:id})
            },{}) 
            
            rmatch = rmatch.concat(sameAsRes.filter(p => p.type === owl+"sameAs")) // || p.type.match(/sameAsMBBT$/)))
            sameAsRes = sameAsRes.filter(p => (p.type === owl+"sameAs" || p.type === rdfs+"seeAlso" || p.type === adm+"canonicalHtml")) // || p.type.match(/sameAsMBBT$/))
            
            //loggergen.log("dico",dico)
         }

         if(sameAsRes.length) {
            
            let viaf = sameAsRes.filter(s => s.value.includes("viaf.org/"))
            if(viaf.length) {
               viaf = viaf[0].value
               if(viaf && !sameAsRes.filter(s => s.value.includes("worldcat.org/")).length) sameAsRes.push({value:viaf.replace(/^.*\/([^/]+)$/,"https://www.worldcat.org/identities/containsVIAFID/$1"),type:owl+"sameAs"})
            } 
            
            //loggergen.log("sameAs:",prettId,id,dico,rmatch,sameAsRes)

            let menus = {}
            let sources = []
            let hasRes = {}
            /*
            let img = { 
               //"bdr":  "/logo.svg", 
               "dila": "/DILA-favicon.ico", 
               "mbbt": "/MB-icon.jpg",
               "ola":  "/OL.png",  //"https://openlibrary.org/static/images/openlibrary-logo-tighter.svg" //"https://seeklogo.com/images/O/open-library-logo-0AB99DA900-seeklogo.com.png", 
               "viaf": "/VIAF.png",
               "wd":   "/WD.svg",
               "rkts": "/RKTS.png",
               "eftr": "/84000.svg",
               "cbeta": "/CBETALogo.png", 
               "cbct": false,
               "cbcp": false,
            } 

            const providers = { 
               "ia":"Internet Archive",                 
               "mbbt":"Marcus Bingenheimer",
               "wd":"Wikidata",
               "ola":"Open Library",
               "eftr":"84000",
               "cbcp": "CBC@",
               "cbct": "CBC@"
            }
            */

            for(let res of sameAsRes.filter(r => r.type === rdfs+"seeAlso" || r.type.match(/[#/]sameAs[^/]*$/))) {
               for(let src of Object.keys(providers)) {
                  if(src == "bdr") continue
                  let val = res.value                  
                  if(res.orec) val = res.orec

                  if(val.match(new RegExp("(^"+src+":)|(^"+prefixesMap[src]+")"))) { 
                     if(!hasRes[src]) hasRes[src] = [ val ] //.replace(new RegExp(prefixesMap[src]),src+":")                  
                     else hasRes[src].push(val)
                  } 
               }
            }
            
            for(let src of Object.keys(providers)) {
               if(src == "bdr") continue
               if(!hasRes[src] && prettId.match(new RegExp("(^"+src+":)|(^"+prefixesMap[src]+")"))) 
                  if(!hasRes[src]) hasRes[src] = [ prettId ]
                  else  hasRes[src].push(prettId)
            }

            //loggergen.log("hasR:",hasRes)

            for(let src of Object.keys(providers)) {
               if(src == "bdr") continue
               if(hasRes[src]) for(let h in hasRes[src]) {             
                  
                  let hres = hasRes[src][h]

                  let shortU = shortUri(hres)
                  if(src === "rkts" || src == "cbct" || src == "cbcp") shortU = prettId
                  //let shortU = hasRes[src]

                  let prefix = shortU.replace(/:.*$/,""), _prefix = prefix;
                  const fromProv = { eftr:"84000", mbbt:"mbingenheimer" }
                  if(fromProv[prefix]) _prefix = fromProv[prefix]

                  let url = fullUri(hres)

                  if(url.match(new RegExp("^("+src+":)|("+prefixesMap[src]+")"))) {                     
                     let canonUrl = sameAsRes.filter(p => p.type === adm+"canonicalHtml")                     
                     if(canonUrl.length) for(let ican in canonUrl) if(canonUrl[ican].value && canonUrl[ican].value.indexOf(_prefix) !== -1) { url = canonUrl[ican].value; break ; }
                     //loggergen.log("cUrl1",canonUrl,url,prefix,hres)
                  }

                  if(this.props.assoRes && this.props.assoRes[url]) {
                     let canonUrl = this.props.assoRes[url]
                     if(canonUrl && canonUrl.filter) canonUrl = canonUrl.filter(p => p.type === adm+"canonicalHtml" || p.fromKey === adm+"canonicalHtml")
                     if(canonUrl.length) for(let ican in canonUrl) if(canonUrl[ican].value && canonUrl[ican].value.indexOf(_prefix) !== -1) { url = canonUrl[ican].value; break ; }
                     //loggergen.log("cUrl2",canonUrl,url,prefix,hres)
                  }

                  let prov = src.toUpperCase()
                  if(providers[src]) prov = providers[src]

                  let image = <div class="sameAsLogo"><div>{(!providers[src] || providers[src].indexOf(" ")!==-1?src:providers[src]).toUpperCase()}</div></div>
                  if(img[src]) image = <img src={img[src]}/>

                  if(h == 0) sources.push(
                     <div class="source-data" id={src}>
                        {/*!directSameAs &&
                        <Link onTouchEnd={(ev) => { if(src !== "bdr") { ev.stopPropagation(); ev.preventDefault(); this.handleOpenSourceMenu(ev,"menu-"+src+"-"+prettId); return false ; }}} to={"/show/"+shortU}>
                           {image}
                        </Link> }
                        {directSameAs &&
                        <a onTouchEnd={(ev) => { if(src !== "bdr") { ev.stopPropagation(); ev.preventDefault(); this.handleOpenSourceMenu(ev,"menu-"+src+"-"+prettId); return false ; }}} href={url} target="_blank">
                           {image}
                        </a> */}                        
                        <a 
                           /*onTouchEnd={(ev) => { if(src !== "bdr") { ev.stopPropagation(); ev.preventDefault(); this.handleOpenSourceMenu(ev,"menu-"+src+"-"+prettId); return false ; }}} href={url} target="_blank"*/
                           >
                           <Tooltip placement="bottom-start" title={<span>{I18n.t("result.available")} <b>{providers[src]}</b></span>}>{image}</Tooltip>
                        </a>
                        {/* {src !== "bdr" && <span onMouseEnter={(ev) => this.handleOpenSourceMenu(ev,"menu-"+src+"-"+prettId)}></span> } */}
                     </div>
                  )

                  
                  
                  let menuId = "menu-"+src+"-"+prettId

                  //loggergen.log("menuId",menuId,menus[menuId])

                  if(!menus[menuId]) menus[menuId] = { full: [ url ], short:shortU, src:prov }
                  else if(menus[menuId].full.indexOf(url) === -1) {
                     menus[menuId] = { ...menus[menuId], full:[ ...menus[menuId].full, url ] }
                  }

               }
            }
                     /*
                     <Tooltip placement="bottom-end" title={<div style={{margin:"10px"}}>Show data from {sameAsMap[src]?sameAsMap[src]:src.toUpperCase()}</div>}>
                        <Link to={"/show/"+hasRes[src]}><img src={img[src]}/>
                     </Link></Tooltip>
                     */
               
            if(sources.length > 1 || sources.length == 1 && !hasRes["bdr"] ) { 
               
               // TODO move this to bottom of result block

               otherSrc.push(<div class="source" onClick={(ev) => this.handleOpenSourceMenu(ev,"menu-.*-"+prettId)}>{sources}</div>)
               otherSrc = [ <div class="result-box">{otherSrc}</div> ]

               this._menus = { ...this._menus, ...menus } 
            }
            
         }



         let nbChunks = allProps.filter(e => e.type === tmp+"nbChunks")
         if(nbChunks[0] && nbChunks[0].value) nbChunks = Number(nbChunks[0].value)
         else nbChunks = "?"

         let slashEq = (a,b) => a ===b || a + "/" === b || a === b + "/"

         let allLabels = [ ], allLabelsNoMatch = [ ]
         allProps.filter(a => a.type.match(/([Ll]abel|[Mm]atch)$/)).map(a => {   
            if(!a || !a.value) return
            let labelNoMatch = a.value.replace(/[↦↤]/g,"")
            if(!allLabelsNoMatch.filter(b => slashEq(b.value,labelNoMatch)).length) { 
               allLabels.push(a)
               allLabelsNoMatch.push({...a, value:labelNoMatch})
            }
         })  

         for(let p of allProps) {
            if(p.type.endsWith("#sameAs") && p.value != fullId && this.props.assoRes[p.value]) {
               //console.log("sA?",p,this.props.assoRes[p.value])
               for(let q of this.props.assoRes[p.value]) {
                  if(q.type.match(/[Ll]abel$/) && !allLabelsNoMatch.filter(a => slashEq(a.value,q.value)).length) {
                     allLabels.push(q)
                  }
               }
            }
         }

         let onKhmerServer = (this.props.config && this.props.config.khmerServer)

         //console.log("allM:",allLabels)

         let hasNbRepro

         retList.push( <div id='matches'>         

            { typeisbiblio && inRoo } 
            { typeisbiblio && by }
            { typeisbiblio && byStat }

            { /*type === "Work" && // DONE: show in workInstanceGraph query
               this.getResultProp(I18n.t("result.year"),allProps,false,false,[tmp+"yearStart"]) */}

            { type === "Person" && personDates }

            {/* { type === "Etext" && this.getResultProp(I18n.t("result.eTextIsForWork"),allProps,false,true,[tmp+"forWork"]) }             */}
            { type === "Etext" && this.getResultProp(bdo+"eTextIsVolume",allProps,false,false) }
            { type === "Etext" && this.getResultProp(I18n.t("result.inInstance"),allProps,false,true,[tmp+"inInstance"]) }
            { type === "Etext" && this.getResultProp(I18n.t("result.inInstancePart"),allProps,false,true,[tmp+"inInstancePart"]) }

            { type === "Etext" && this.getEtextMatches(prettId,startC,endC,bestM,rmatch,null,nsub) }

            {/* { this.getResultProp("tmp:nameMatch",allLabels,true,false,[ tmp+"nameMatch" ], !preLit?preLit:preLit.replace(/[↦↤]/g,"") ) } */}


            {/* { this.getResultProp("bdo:note",allProps,true,false,[ tmp+"noteMatch" ]) } // see biblioNote below */}


            {/* { this.getResultProp("tmp:relationType",allProps,true,false,[ tmp+"relationType" ]) }  */}
            
            {/* { this.getResultProp(tmp+"InverseRelationType",allProps,true,true,[tmp+"relationTypeInv"]) } */}
            
            {/* { this.getResultProp(tmp+"numberOfMatchingChunks",allProps,true,false,[tmp+"nbChunks"]) } */}
            {/* { this.getResultProp(tmp+"maxScore",allProps,true,false) } */}
            { (nbChunks > 1) && this.getResultProp(I18n.t("prop.tmp:otherMatch", {count: nbChunks - 1}),allProps,false,false,[bdo+"eTextHasChunk"],null,[bdo+"chunkContents"],null,[tmp+"matchScore",bdo+"sliceStartChar"],id,T,n) }
            
            {/* { this.getResultProp(bdo+"workIsAbout",allProps,false) } */}
            {/* { this.getResultProp(bdo+"workGenre",allProps) } */}

            { this.getResultProp(["Work","Instance","Scan","Etext"].includes(this.state.filters.datatype[0])?"tmp:otherTitle":"tmp:otherName",allLabels, true, false, [ tmp+"labelMatch", tmp+"nameMatch", skos+"prefLabel", skos+"altLabel"], preLit ) }
            {/* { this.getResultProp(tmp+"assetAvailability",allProps,false,false) } */}
            
            {/* { this.getResultProp(rdf+"type",allProps.filter(e => e.type === rdf+"type" && e.value === bdo+"EtextInstance")) }  */}
            
            {/* //![bdo+"AbstractWork",bdo+"Work",bdo+"Instance",bdo+"SerialMember",bdo+"Topic"].includes(e.value))) } */}
            
            {/* { this.getResultProp("tmp:originalRecord",allProps,false,true, [ tmp+"originalRecord", adm+"originalRecord"]) } */}

            {/* { this.getResultProp(bdo+"language",allProps) } */}
            {/* { this.getResultProp(bdo+"script",allProps) } */}

            {/* { type === "Work" && this.getResultProp(bdo+"workTranslationOf",allProps,false) } */}

            {/* { this.getResultProp(bdo+"material",allProps) }
            { this.getResultProp(bdo+"printMethod",allProps) }
            
            
            {/* { this.getResultProp(tmp+"isCreator",allProps.filter(e => (e.type === tmp+"isCreator" && e.value !== "false")),false,false) } */}

            { type === "Place" && this.getResultProp(bdo+"placeLocatedIn",allProps,false) }
            {/* { this.getResultProp(bdo+"placeType",allProps) } */}

            { (type === "Instance") && this.getSeriesNumber(allProps) }            


            {/* { this.getResultProp(bdo+"publisherName",allProps,false,false) }
            { this.getResultProp(bdo+"publisherLocation",allProps,false,false) } */}
            { (type === "Instance" || type === "Etext" || type === "Scan" || type === "Work") && this.getPublisher(allProps) }


            {/* TODO fix facet count after preview instance */}


            {/* { this.getResultProp(bdo+"contentLocationStatement",allProps,false,false, [bdo+"instanceExtentStatement",bdo+"contentLocationStatement"]) } */}

            { (type === "Instance" || type === "Scan" || type === "Work") && this.getResultProp(bdo+"biblioNote",allProps,true,false,[bdo+"biblioNote", bdo+"catalogInfo", rdfs+"comment", tmp+"noteMatch", bdo+"colophon", bdo+"incipit"], undefined, undefined, undefined, undefined, id) }
            { (type !== "Instance" && type !== "Scan" && type !== "Work") && this.getResultProp(bdo+"biblioNote",allProps,true,false,[ tmp+"noteMatch" ], undefined, undefined, undefined, undefined, id) }

            {/* { this.getResultProp(tmp+"provider",allProps) } */}
            {/* { this.getResultProp(tmp+"popularity",allProps,false,false, [tmp+"entityScore"]) } */}
            

            { onKhmerServer && ["Work", "Instance"].includes(type) && <>
               {this.getResultProp(tmp+"FEMCManuscriptCode",allProps,false,false, [ rdf+"value" ], null, [ bf+"identifiedBy"  ], [ bdr+"FEMCManuscriptCode" ]) }
               {this.getResultProp(tmp+"incomplete", allProps.filter(a => a.type == bdo+"isComplete" && a.value == "false").map(a => ({...a, value:" "})), false,false, [ bdo+"isComplete"]) }
               {this.getResultProp(bdo+"hasFascicles",allProps,false,false) }
               { (hasNbRepro = allProps.filter(a => a.type === tmp+"nbImageReproductions" && a.value > 1).length > 0) && <>
                  {/* { this.getResultProp(tmp+"reproductions", allProps, false, false, [ tmp+"nbImageReproductions" ]) } */}
                  { this.getReproductionsNoLink(id,n,allProps) }
               </>}
            </> }
            
            {/* { hasThumb.length > 0 && <div class="match">{getIconLink(viewUrl?viewUrl:resUrl+"#open-viewer",<span class="urilink"><b>View Images</b></span>)}</div>} // maybe a bit overkill...? */ }

            { typeisbiblio && this.getInstanceLink(id,n,allProps) }


            { type === "Scan" &&  this.getResultProp(tmp+"lastSync",allProps,false,false) }
            {/* { type === "Scan" &&  this.getResultProp(tmp+"InverseRelationType",allProps,false,false,[tmp+"relationTypeInv"]) }  */}

            {/* { this.getEtextLink(id,n,allProps) } */}

            </div> )

      if(otherSrc.length) {
         if(!resUrl.includes("/show/bdr:")) retList.push(<div class="external">{otherSrc}</div>)
         else retList.push(otherSrc);
      }

      if(doRef) this._refs[nsub] = React.createRef();

      if(prettId.includes("bdr:")) retList.push( <CopyToClipboard text={"http://purl.bdrc.io/resource/"+prettId.replace(/^bdr:/,"")} onCopy={(e) =>
                //alert("Resource url copied to clipboard\nCTRL+V to paste")
                prompt(I18n.t("misc.clipboard"),fullUri(prettId))
          }>

          <a id="permalink" {...this.state.collapse[id] || hasNbRepro?{class:"wInstance"}:{}} style={{marginLeft:"0px"}} title={I18n.t("misc.permalink")}>
             <img src="/icons/PLINK.svg"/>
          </a>
       </CopyToClipboard> )

      retList = <div onClick={sendMsg} {... (!isInstance?{id:"result-"+n}:{})} {...(doRef?{ref:this._refs[nsub]}:{})} className={"result-content " + (otherSrc && otherSrc.length?"otherSrc ":"") + status + " " + enType + (hasThumb.length?" wThumb":"")}>{retList}</div>



      return retList
   }

   setTypeCounts(types,counts)
   {
      
      let m = 0 ;
      if( this.props.datatypes && this.props.datatypes.metadata) for(let r of Object.keys(this.props.datatypes.metadata) ){

         //r = r.bindings
         let typ = r.replace(/^.*?([^/]+)$/,"$1")
         typ = typ[0].toUpperCase() + typ.slice(1)

         //loggergen.log("typ1",typ)

         if(typ != "" && types.indexOf(typ) === -1)
         {
            m++;

            types.push(typ);

            counts["datatype"][typ]= /*Number(*/ this.props.datatypes.metadata[r] //)
            counts["datatype"]["Any"]+=Number(this.props.datatypes.metadata[r])

         }


         //loggergen.log("counts",counts,types)

      }
      else if(this.state.searchTypes) for(let typ of this.state.searchTypes) {
         
         //loggergen.log("typ2",typ)

         if(typ != "" && types.indexOf(typ) === -1)
         {

            let n ; 
            
            if(this.props.searches[typ] && this.props.searches[typ][this.props.keyword+"@"+this.props.language]) {
               n = this.props.searches[typ][this.props.keyword+"@"+this.props.language].numResults
               if(n) n = Number(n)
            }

            types.push(typ);

            if(n) {
               counts["datatype"][typ]= n
               counts["datatype"]["Any"]+= n
            }

         }

         

      }

      /* // TODO update datatype counts with actual results
      let searchT = Object.keys(this.props.searches)
      for(let k of searchT) {
         if(k.match(/^[A-Za-z]+$/) && !types.includes(k)) {
            types.push(k)
            let n = this.props.searches[k][this.props.keyword+"@"+this.props.language]
            if(n && n.numResults) n = n.numResults
            if(n) {
               counts["datatype"][k]= n
               counts["datatype"]["Any"]+=n
            }

         }
      }
      */


      if(types.length) types = types.sort(function(a,b) { return Number(counts["datatype"][b]) - Number(counts["datatype"][a]) })

      let showT =  [ this.state.filters.datatype[0] ] 


      for(let t of [ "Person", "Place", "Work", "Instance" ]) 
         if(!types.includes(t)) 
            showT.push(t) ;

      
      for(let t of showT)  {
         if(!types.includes(t)) {
            types.push(t)
            
            // breaks datatype count display...
            // counts["datatype"][t] = 0
         }
      }

      /*
      if(types.length == 2 && !this.state.autocheck)
      {
         this.setState({ ...this.state, autocheck:true })

         loggergen.log("autocheck",types)

         this.handleCheck(null, types[1], true)
      }
      */

      //loggergen.log("types",types,counts)
   }

   handleResOrOnto(message,id)
   {
      //message = []

      // general search or with datatype ?
      let results ;
      if(this.state.results && this.state.results[id] && this.state.results[id].results) results = this.state.results[id].results
      
      //loggergen.log("results?",this.state.filters.datatype,JSON.stringify(results,null,3),this.props.searches[this.props.keyword+"@"+this.props.language])

      // resource search ?
      if(this.props.language == "")
      {
         // ontology property search ?
         if(this.props.ontoSearch == this.props.keyword)
         {
            if(this.props.dictionary)
            {

               let iri = this.props.keyword
               let url = this.props.keyword
               for(let k of Object.keys(prefixesMap)) url = url.replace(new RegExp(k+":"),prefixesMap[k])

               let labels = this.props.dictionary[url]
               if(!labels && this.props.keyword.match(/^:/))
               {
                  for(let k of Object.keys(this.props.dictionary)) {
                     loggergen.log(k.replace(/^.*?[/]([^/]+)$/,":$1"),this.props.keyword)
                     if(k.replace(/^.*?[/]([^/]+)$/,":$1") === this.props.keyword)
                     {
                        labels = this.props.dictionary[k]
                        url = k
                        iri = k
                        for(let p of Object.keys(prefixesMap)) iri = iri.replace(new RegExp(prefixesMap[p]),p+":")
                        break ;
                     }
                  }
               }

               loggergen.log("onto lab",labels)

               if(labels)
               {
                  let l = { value : this.props.keyword, lang :"" }
                  if(labels) labels = labels[rdfs+"label"]
                  if(labels) l = labels[0]
                  message.push(<h4 key="keyResource" style={{marginLeft:"16px"}}>Ontology Property Matching (1)</h4>)
                  message.push(this.makeResult(iri,1,null,l.value,l.lang,null,null,"/show/"+iri))
                  //message.push(<iframe id="ontoFrame" className="ontoSearch" src={url} />)
                     /* onLoad={() =>
                     {
                        let iframe = window.parent.document.getElementById("ontoFrame");
                        var container = document.body
                        iframe.style.height = container.offsetHeight + 'px';
                     }} */


               }
               /*
               else {
                  message.push(
                     <Typography style={{fontSize:"1.5em",maxWidth:'700px',margin:'50px auto',zIndex:0}}>
                        No result found.
                     </Typography>
                  )
               }
               */
            }
         }
         
         // resource id matching ? deprecated ? WIP
         else if(false && this.props.resources &&  this.props.resources[this.props.keyword] )
         {
            let l ; // sublist[o].filter((e) => (e.type && e.type.match(/prefLabelMatch$/)))[0]
            let labels = this.props.resources[this.props.keyword]
            if(labels && labels != true)
            {
               let fullURI = this.props.keyword
               for(let k of Object.keys(prefixesMap)) fullURI = fullURI.replace(new RegExp(k+":"),prefixesMap[k])
               if(labels) labels = labels[fullURI]
               if(labels) {
                  l = getLangLabel(this,"",labels[skos+"prefLabel"]?labels[skos+"prefLabel"]:labels[foaf+"name"])
                  //loggergen.log("l",labels,l)
                  if(l) {
                     let sameAs = this.props.resources[this.props.keyword]
                     if(sameAs) sameAs = sameAs[fullURI]
                     if(sameAs) sameAs = Object.keys(sameAs).filter(k => k === adm+"canonicalHtml" || k === owl+"sameAs").reduce( (acc,k) => ([...acc, ...sameAs[k].map( s => ({ ...s, type:k }))]),[])
                     //loggergen.log("res sameAs", sameAs)
                     if(!this.props.isInstance) {
                        message.push(<h4 key="keyResource">{"Resource Id Matching"}</h4>)
                        message.push(this.makeResult(this.props.keyword,1,null,l.value,l.lang,null,null,null,[],null,sameAs)) //[{"type":owl+"sameAs","value":this.props.keyword}]))
                     }
                  }
               }
            }
         }
      }
      return results ;
   }

   resetDT()
   {
      let datatype = this.state.filters.prevDT
      if(!datatype) datatype  = [ "Any" ]
      this.setState({ ...this.state, filters: { ...this.state.filters, datatype } } ) 
      /*this.handleCheck(e,"Any",true,{},true)*/
   }

   /* // deprecated
   setWorkCateg(categ,paginate) //,categIndex)
   {
      let show  ;
      if(this.state.collapse[categ] == undefined) show = false
      else show = !this.state.collapse[categ]
      
      loggergen.log("setWC",categ,JSON.stringify(paginate,null,3))

      let gotoCateg = paginate.index
      if(show && paginate.pages.length > 1 && paginate.bookmarks && paginate.bookmarks[categ]) { 
         for(let i in paginate.pages) { 
            if(i > 0 && paginate.pages[i-1] <= paginate.bookmarks[categ].i && paginate.bookmarks[categ].i < paginate.pages[i]) { 
               gotoCateg = i-1 ; 
               loggergen.log("catI",gotoCateg);
               break ; 
            }      
         }
      }      

      let params = {  repage:true, paginate:{...paginate, gotoCateg }, collapse:{...this.state.collapse, [categ]:show} }
      
      loggergen.log("categ",categ,paginate,show,JSON.stringify(params,null,3))

      if(this.state.filters.datatype.indexOf("Work") === -1 || this.state.filters.datatype.length > 1) this.handleCheck(null, "Work", true, params, true )
      else this.setState({...this.state, ...params})
   }
   */

   hasAllFacets(elem) {
      let filtered = true

      if(this.state.filters.datatype.indexOf("Any") === -1 && this.state.filters && this.state.filters.facets) {
         for(let k of Object.keys(this.state.filters.facets)) {

            let v = this.state.filters.facets[k]

            let exclude = this.state.filters.exclude
            if(exclude) exclude = exclude[k]

            //loggergen.log("k",k,v,exclude)

            let withProp = false, hasProp = false, isExclu = false                   
            for(let e of elem) {

               if(v.alt) { 
                  for(let a of v.alt) {
                     if(e.type === a) { 
                        hasProp = true ;
                        //loggergen.log("e sub",e)
                        if( v.val.indexOf("Any") !== -1 || e.value === v.val || v.val.indexOf(e.value) !== -1 )  withProp = true ;                              
                        if(exclude && exclude.indexOf(e.value) !== -1) isExclu = true
                     }
                  }
               }
               else if(e.type === k) {
                  hasProp = true ;
                  if(v.indexOf("Any") !== -1 || e.value === v || v.indexOf(e.value) !== -1)  withProp = true ;                                                                       
                  if(exclude && exclude.indexOf(e.value) !== -1) isExclu = true
               }
            }

            if(!exclude || !exclude.length) {
               if((v.alt && v.val.indexOf("unspecified") !== -1) || (!v.alt && v.indexOf("unspecified") !== -1)) {
                  if( hasProp && !withProp ) filtered = false
               }
               else if((v.alt && v.val.indexOf("Any") === -1) || (!v.alt && v.indexOf("Any") === -1)) {
                  if( !withProp ) filtered = false
               } 
            }
            else {
               if((v.alt && v.val.indexOf("unspecified") !== -1) || (!v.alt && v.indexOf("unspecified") !== -1)) {
                  if( exclude.indexOf("unspecified") !== -1 && !hasProp ) filtered = false
                  if((v.alt && v.val.indexOf("Any") === -1) || (!v.alt && v.indexOf("Any") === -1)) {
                     if( withProp && isExclu ) filtered = false
                  } 
               }                     
               else if((v.alt && v.val.indexOf("Any") === -1) || (!v.alt && v.indexOf("Any") === -1)) {
                  if( withProp && isExclu ) filtered = false
               } 
            }
         }
      }

      return filtered ;
   }


   handleResults(types,counts,message,results,paginate,bookmarks,resLength, mapInfo) 
   {
      this._menus = {}

      let n = 0, m = 0 ;
      //loggergen.log("results::",results,paginate);
      let list = results.results.bindings

      let displayTypes = types //["Person"]
      if(this.state.filters.datatype.indexOf("Any") !== -1) { 
         console.warn("!Any?"+types)
      }
      displayTypes = displayTypes.filter(d => this.state.filters.datatype.indexOf(d) !== -1) ;

      //if(displayTypes.length) displayTypes = displayTypes.sort(function(a,b) { return searchTypes.indexOf(a) - searchTypes.indexOf(b) })

      //loggergen.log("list x types",list,types,displayTypes)


      // hide status if not admin, step 2 (#522)
      const removeUnreleased = !isAdmin(this.props.auth) || !this.state.filters.facets || !this.state.filters.facets[tmp+"nonReleasedItems"]


      for(let t of displayTypes) {

         let willBreak = false ;
         let dontShow = false ;
         let pagin ;
         let categIndex = 0, index = 0

         if(paginate.length) pagin = paginate[0]
         else pagin = { index:0, n:[0], pages:[0] };
         if(bookmarks) pagin.bookmarks = bookmarks
         
         /* // deprecated
         if(t === "Work" && pagin.gotoCateg !== undefined) { 
            //loggergen.log("pagin.goto A",JSON.stringify(pagin,null,3))                  
            pagin.index = pagin.gotoCateg
            pagin.pages = pagin.pages.slice(0,pagin.gotoCateg+1)
            pagin.n = pagin.n.slice(0,pagin.gotoCateg+1)
            //loggergen.log("pagin.goto Z",JSON.stringify(pagin,null,3))
         }
         */

         if(this.state.uriPage && pagin.pages && pagin.pages.length > this.state.uriPage) pagin.index = this.state.uriPage
         
         if(t === "Any") continue ;

         // DONE uriPage is set to a page that does not exist... yet
         //loggergen.log("dT:",t,list,pagin,this.state.uriPage)

         let iniTitle = false 
         let sublist = list[t.toLowerCase()+"s"]         
         //if(!sublist) sublist = list[bdo+t]         
         let cpt = 0
         n = 0
         let begin = pagin.pages[pagin.index]

         //loggergen.log("begin",begin,JSON.stringify(Object.keys(sublist),null,3))

         let categ = "Other" ;
         let end = n
         let max_cpt =  3
         let canCollapse = false 

         let findNext = false ;
         let findFirst = true ;

         let absi = -1
         let lastN, nMax
         
         let h5

         let hasUnreleased = false

         const markers = [], latLongs = []

         if(sublist) { for(let o of Object.keys(sublist))
         {
            if(!iniTitle) {
               iniTitle = true
               let _t = t.toLowerCase()
               if(_t === "work" && this.props.isInstance) _t = "instance"
               if(displayTypes.length > 1 || displayTypes.indexOf("Any") !== -1) message.push(<MenuItem  onClick={(e)=>this.handleCheck(e,t,true,{},true)}><h4>{I18n.t("types."+t.toLowerCase(),{count:2})+(false && displayTypes.length>1&&counts["datatype"][t]?" ("+counts["datatype"][t]+")":"")}</h4></MenuItem>);
               else { 
                  let txt = ""
                  if(this.props.latest) txt = I18n.t("home.new")
                  else txt = I18n.t("types."+_t,{count:2}) 
                  
                  if(this.props.language==="") {
                     let label = this.props.resources[this.props.keyword]
                     if(label) label = label[fullUri(this.props.keyword)]
                     if(label) label = label[skos+"prefLabel"]
                     if(label) label = getLangLabel(this,"",label)
                     if(!label || !label.value) label = { value: this.props.keyword }
                     //txt = I18n.t("result.assoc",{type:txt,name:label.value})
                     txt = <Trans i18nKey="result.assoc" components={{ res: <Link /> }} values={{type:txt,name:label.value,rid:this.props.keyword}} /> 
                  } else if(this.props.searches[this.state.filters.datatype[0]][this.props.keyword+"@"+this.props.language].inEtext) {
                     let inEtext = this.props.searches[this.state.filters.datatype[0]][this.props.keyword+"@"+this.props.language].inEtext
                     let label = getPropLabel(this,fullUri(inEtext),false,true)
                     
                     if(!label) label = inEtext
                     txt = <Trans i18nKey="result.inEtext" components={{ res: <Link />, key: <span /> }} values={{keyword:this.props.keyword, language:"$t("+languages[this.props.language]+")", name:label.value,rid:inEtext}} /> 
                  }
                  //(false && displayTypes.length>=1&&counts["datatype"][t]?" ("+counts["datatype"][t]+")":""))}
                  message.push(<MenuItem><h4>{txt}</h4></MenuItem>);
               }
               
               if(t === "Place") {

                  
                  if(mapInfo) {
                     for(let k of Object.keys(mapInfo)) {
                        markers.push(mapInfo[k].marker)
                        latLongs.push(mapInfo[k].latLong)                     
                     }
                  }
                  

                  const { BaseLayer} = LayersControl;
                  
                  
                  this._refs["markers"] = latLongs     
                  this._refs["cluster"] = React.createRef()
                  

                  console.log("latlongs:",latLongs, markers)
                  
                  // latLongs.length && 
                  const map =  (this.props.config && <> 
                     
                     { (!this.props.simple || this.state.collapse.placeMap) && <><MapContainer 
                        whenCreated={ mapInstance => { 
                           this._map = mapInstance ;                           
                        }}
                        center={[0,0]} zoom={18} 
                        // attempt to fix #584 (see https://github.com/Leaflet/Leaflet/issues/7255 + https://stackoverflow.com/questions/67406533/react-leaflet-popups-not-working-on-mobile-devices/67422057#67422057)
                        tap={false} 
                        className={"placeMap resultsMap"}                         
                        gestureHandling={window.innerWidth < 800}
                        gestureHandlingOptions={{
                           text: {
                                 touch: I18n.t("map.touch"),
                                 scroll: I18n.t("map.scroll"),
                                 scrollMac: I18n.t("map.scrollMac")
                           }
                        }}
                        whenReady={ () => {                            
                           let timeo = setInterval(() => {
                              console.log("timeo:",this._map)
                              latLongs = latLongs.filter(m => m)
                              if(this._map) {
                                 clearInterval(timeo)
                                 if( latLongs.length) {                                                         
                                    console.log(":map:",this._map,latLongs)
                                    this._map.fitBounds(latLongs, latLongs.length === 1 ?{maxZoom: 10}:{padding:[50,50]})                                    
                                 }
                                 $(".resultsMap").attr("data-nb-markers", latLongs.length)
                              }
                           }, 10);
                        }}
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
                        <MarkerClusterGroup ref={this._refs["cluster"]} spiderfyDistanceMultiplier={0.1} disableClusteringAtZoom={9} chunkedLoading maxClusterRadius={80} >{ markers }</MarkerClusterGroup>
                     </MapContainer>
                  </>}</>)
                  
                  if(map) message.push(map)
               }

               
            }
            absi ++ ;

            //loggergen.log("cpt",absi,cpt,n,begin,findFirst,findNext,o) //,sublist[o])


            if(absi < begin && findFirst) { cpt++ ; m++ ;  continue; }
            else if(cpt == begin && !findNext && findFirst) {
               cpt = 0 ;
               m = 0 ;
               findFirst = false ;
               n = pagin.n[pagin.index];
               //loggergen.log("=0",n)
            }

            //message.push(["cpt="+cpt+"="+absi,<br/>])

            let unreleased = false
            let label ; // sublist[o].filter((e) => (e.type && e.type.match(/prefLabelMatch$/)))[0]
            let prefL = sublist[o].filter(e => e.type && e.type === skos+"prefLabel")
            let sList = sublist[o].filter(e => e.type && e.type.match(/(label|name)Match$/)).filter(l => {
               let val = l.value.replace(/[↦↤]/g,"")
               return prefL.filter(p => p.value === val).length > 0 // keep match only if it is an actual prefLabe<l
            })
            if(!sList.length) sList = sublist[o].filter(e => (e.type && e.type === skos+"prefLabel")) //.match(/(prefLabel(Match)?|eTextTitle)$/)))

            /* // deprecated 
            let listOrder = { "prefLabelMatch$" : 1, "prefLabel$":2,"eTextTitle$":3 }
            sList = _.sortBy(sList, (e) => {
               for(let k of Object.keys(listOrder)) { if(e.type && e.type.match(new RegExp(k))) return listOrder[k] }
            })
            */

            //loggergen.log("sList",o,sublist[o],JSON.stringify(sList,null,3));

            label = getLangLabel(this,"",sList) // ,true)
            if(label && label.length > 0) label = label[0]

            if(!label) label = { value:  t != "Etext"?I18n.t("resource.noT"):" ", lang: this.props.locale }

            let preProps = sublist[o].filter((e) => e.type && e.type.match(/relationType$/ )).map(e => this.props.dictionary[e.value])

            //loggergen.log("label",label) //,sList,sublist[o]) //,preProps)


            let r = {
               //f  : { type: "uri", value:list[o].type },
               lit: label,
               s  : { type: "uri", value: o },
               match: sublist[o].filter((e) => {

                  let use = true ;

                  if(e.type && e.type.match(/relationType$/)) {
                     let prop = this.props.dictionary[e.value]
                     //loggergen.log("e",e,prop)
                     if(prop)
                        for(let p of preProps) {

                           //loggergen.log("::",p,preProps) //p[rdfs+"subPropertyOf"])

                           if(p && (p[rdfs+"subClassOf"] && p[rdfs+"subClassOf"].filter(q => q.value == e.value).length > 0
                              || p[rdfs+"subPropertyOf"] && p[rdfs+"subPropertyOf"].filter(q => q.value == e.value).length > 0
                              || p[bdo+"taxSubClassOf"] && p[bdo+"taxSubClassOf"].filter(q => q.value == e.value).length > 0 )
                           ) {
                              use = false ;
                              break ;
                           }
                        }
                  }

                  //loggergen.log("e",e,this.state.filters.facets)

                  return ( /*(this.state.filters.facets && e.type && this.state.filters.facets[e.type]) ||*/ use && (
                  ( this.props.language != "" ? e.value && ((e.value.match(/[↦↤]/) && e.type  && !e.type.match(/(creator)/) && (!e.type.match(/(prefLabelMatch$)/) || (!label.value.match(/[↦↤]/)))))
                                                            //|| e.type && e.type.match(/sameAs$/))
                                              : !e.lang && false && e.value !== bdo + "instanceOf" && (e.value.match(new RegExp(bdr+this.props.keyword.replace(/bdr:/,"")))
                                                            || (e.type && e.type.match(/relationType$/) ) ) )

                     ) ) } ).map(e => e.type.match(/prefLabelMatch$/) ? { ...e, type:skos+"prefLabel" }:e)
            }


            //loggergen.log("r",r,label);

            // || (e.type && e.type.match(/[Ee]xpression/) )
            // || ( )

            // deprecated
            let isAbs = [] //= sublist[o].filter((e) => e.value && e.value.match(/Abstract/))
            let hasExpr = [] //= sublist[o].filter((e) => e.type && e.type.match(/HasExpression/))
            let isExpr = []//= sublist[o].filter((e) => e.type && e.type.match(/ExpressionOf/))

            let hasPart = sublist[o].filter((e) => e.type && e.type.match(/HasPart/))
            let hasRoot = sublist[o].filter((e) => e.type && e.type.match(/HasRoot/) && e.value && !e.value.match(o) )
            let workLab = sublist[o].filter((e) => e.type && e.type.match(/workLabel/))
            let creator = sublist[o].filter((e) => e.type && e.type.match(/creator/))

            let addTmpProp = (tab,prop,lab,multiP:boolean = false) => {

               if(tab.length > 0)
               {
                  let subL = sublist[o].filter((e) => (e.type && e.type.match(new RegExp(prop)))) ///(work(Has)?Expression)|(workHasRoot)/) ) )                  

                  let subR,label,lang ;
                  if(subL.length == 1) {
                     subR = sublist[o].filter((e) => (e.type && e.type.match(new RegExp(lab)))) //(rootPrefLabel)|(prefLabel(Has)?Expression)/) ) )
                     if(subR.length > 0) {
                        let tLab = getLangLabel(this,"",subR)
                        lang = tLab["xml:lang"]
                        if(!lang) lang = tLab["lang"]
                        label = tLab["value"]
                     }
                  }
                  else if(multiP) {
                     subR = sublist[o].filter((e) => (e.type && e.type.match(new RegExp(lab))))
                     if(subR.length > 0) {
                        let tLab = getLangLabel(this,"",subR)
                        lang = tLab["xml:lang"]
                        if(!lang) lang = tLab["lang"]
                        label = tLab["value"]
                     }
                  }

                  //loggergen.log("sub",subL,subR,label);

                  let withKey ;
                  if(!multiP) withKey= subL.reduce((acc,e) => {
                     if(!acc[e.type]) acc[e.type] = []
                     acc[e.type] = [].concat(acc[e.type]) ;
                     acc[e.type].push(e.value);
                     return acc;
                  }, {} )
                  else withKey = subL.reduce((acc,e) => {
                     acc[e.value.toLowerCase()] = label
                     return acc;
                  }, {} )

                  //loggergen.log("wK",withKey);

                  r.match = r.match.concat( Object.keys(withKey).sort().reduce((acc,e)=>{
                     let elem = {"type":e,"value":withKey[e],lang}
                     if(label) elem = { ...elem, "tmpLabel":label, "tmpLang":lang}
                     acc.push(elem);
                     return acc;
                  } ,[]) )

                  //loggergen.log("r.match",r.match)
               }

            }

            // deprecated
            //addTmpProp(hasExpr,"workHasExpression","prefLabelHasExpression");
            //addTmpProp(isExpr,"workExpression","prefLabelExpression");

            addTmpProp(creator,"creatorRole","creatorLabel", true);
            addTmpProp(hasRoot,"inRootInstance","rootPrefLabel");
            addTmpProp(workLab,"forWork","workLabel");

            let k = lucenequerytokeyword(this.props.keyword) //this.props.keyword.replace(/"/g,"")

            let id = r.s.value
            if(sublist[o].filter(e => e.type && e.type === tmp+"forEtext").length > 0) id = sublist[o].filter(e => e.type === tmp+"forEtext")[0].value
            if(id.match(/bdrc[.]io/)) id = id.replace(/^.*?([^/]+)$/,"$1")



            let lit,lang ;
            if(r.lit) { 
               let val = getLangLabel(this,"",[r.lit]), kw = lucenequerytokeywordmulti(this.props.keyword).map(v => v.trim().replace(/[་༌།]+$/,""))
               // join by "EEEE" as it won't be affected in wylie from/to conversion 
               if(this.props.language) kw = getLangLabel(this,"",[ { "value":kw.join("EEEE"), "lang": this.props.language } ])
               if(this.props.language === "id") {
                  lit = val.value
                  lang = ""
               } else if(val && this.props.language) {
                  lit = highlight(val.value,kw.value.replace(/ *\[?EEEE\]? */g,"|"))
                  lang = val.lang
               } else {
                  lit = highlight(r.lit.value,kw.join("|"))
                  lang= r.lit["lang"]
                  if(!lang) lang = r.lit["xml:lang"]
               }
            }
            let typ ;
            //if(r.f && r.f.value) typ = r.f.value.replace(/^.*?([^/]+)$/,"$1")


            //loggergen.log("sublist:",o,sublist[o],r,label,lit);

            let filtered = this.hasAllFacets(sublist[o])

                  //if(isExclu) filtered = false

                  //loggergen.log("hP",o, hasProp,withProp,isExclu,filtered) //,k,v) //,sublist[o])
               


               //loggergen.log("typ",typ,t,filtered)

               //if(this.state.filters.datatype.length == 0 || this.state.filters.datatype.indexOf("Any") !== -1 || this.state.filters.datatype.indexOf(typ) !== -1)
               if((!typ || typ === t) && filtered)
               {
                  if(findNext) {

                     let next = absi

                     pagin = {
                                 ...pagin,
                                 pages: pagin.pages.concat([next]),
                                 n: pagin.n.concat([end])
                              };

                     //loggergen.log("good!",next,willBreak,JSON.stringify(pagin))

                     /*
                     if(this.state.paginate.pages.indexOf(next) === -1)
                        this.setState({...this.state,
                           paginate:{...this.state.paginate,
                              pages: this.state.paginate.pages.concat([next]),
                              n: this.state.paginate.n.concat([end])
                           }});
                     */
                     findNext = false
                     dontShow = true
                     index ++ ;
                     
                     //loggergen.log("index",index)

                     if(paginate.length && pagin.gotoCateg === undefined) break ;

                     /*
                     

                     if(displayTypes.length > 1)  continue; 
                     else if(t === "Any") break; 

                     */
                  }

                  //loggergen.log("lit",lit,n,cpt,max_cpt,categ,isAbs)


                  let Tag,tip,categChange = false, showCateg = false, prevCateg = categ, tmpN = n, prevH5 = h5  ;
                  
                  if(pagin.bookmarks && pagin.bookmarks[categ] && pagin.bookmarks[categ].nb && pagin.bookmarks[categ].nb == n) { categChange = true; }

                  
                  if(isAbs.length > 0)        { Tag = CropFreeIcon ;     tip = "Abstract Work" ;       if(categ !== "Abstract") { if(categ !== "Other" && cpt >= max_cpt) { categChange = true ; }; categ = "Abstract" ; if(!dontShow) { showCateg = true }; if(cpt!=0) {n = 0; }; willBreak = false ; max_cpt = cpt + 3 ; canCollapse = true ; } }
                  else if(hasExpr.length > 0) { Tag = CenterFocusStrong; tip = "Work Has Expression" ; if(categ !== "HasExpr")  { if(categ !== "Other" && cpt >= max_cpt) { categChange = true ; }; categ = "HasExpr" ;  if(!dontShow) { showCateg = true }; if(cpt!=0) {n = 0; }; willBreak = false ; max_cpt = cpt + 3 ; canCollapse = true ; } }
                  else if(isExpr.length > 0)  { Tag = CenterFocusWeak;   tip = "Work Expression Of";   if(categ !== "ExprOf")   { if(categ !== "Other" && cpt >= max_cpt) { categChange = true ; }; categ = "ExprOf" ;   if(!dontShow) { showCateg = true }; if(cpt!=0) {n = 0; }; willBreak = false ; max_cpt = cpt + 3 ; canCollapse = true ; } }
                  else if(categ !== "Other")  { Tag = CropDin;           tip = "Work" ;                                           if(                     cpt >= max_cpt)  { categChange = true ; }; categ = "Other";     if(!dontShow) { showCateg = true }; if(cpt!=0) {n = 0; }; willBreak = false ; max_cpt = cpt + 3 ; canCollapse = true ; } 
                  else if(categ === "Other")  { Tag = CropDin;           tip = "Work" ; if(t == "Work" && !findFirst && m == 0) { showCateg = true ; } ; if(t == "Work") { canCollapse = true ; } }
                  

                  if(Tag == CropDin && hasPart.length > 0) Tag = FilterNone;
               

                  if(t !== "Work") Tag = null
                  else {
                     if(showCateg) {
                        //if(displayTypes.length === 1) 
                        {
                           if(!pagin.bookmarks) pagin.bookmarks = {}
                           if(!pagin.bookmarks[categ]) { 
                              pagin.bookmarks[categ] = {i:absi}
                           }
                           //loggergen.log("bookMa",JSON.stringify(pagin.bookmarks,null,3))

                           if(pagin.bookmarks[prevCateg] && pagin.bookmarks[prevCateg].i < absi && pagin.bookmarks[prevCateg].nb === undefined) pagin.bookmarks[prevCateg] = { ...pagin.bookmarks[prevCateg], nb:absi - pagin.bookmarks[prevCateg].i }

                           //loggergen.log("bookMb",JSON.stringify(pagin.bookmarks,null,3))
                        }

                        //loggergen.log("categC",categChange,lastN,tmpN,categ)

                        // // deprecated
                        // if(categChange && (cpt - lastN > 1 || tmpN > 3)) {// && (!pagin.bookmarks || (!pagin.bookmarks[categ] || !pagin.bookmarks[prevCateg] || pagin.bookmarks[categ] - pagin.bookmarks[prevCateg] > 3))) {
                        //    //loggergen.log("bookM...",pagin.bookmarks)
                        //    message.push(<MenuItem className="menu-categ-collapse" onClick={this.setWorkCateg.bind(this,prevCateg,pagin)}><h5>{I18n.t(this.state.collapse[prevCateg]==false?"misc.hide":"misc.show" ) + " " + t + "s" + /*" / " + prevH5.replace(/ \([0-9]+\)$/,"")*/ (pagin.bookmarks[prevCateg].nb ? " ("+pagin.bookmarks[prevCateg].nb +")":"") /*+" "+prevCateg*/}</h5></MenuItem>);                      
                        // }
                        

                        //loggergen.log("bookM",pagin.bookmarks)

                        h5 = tip
                        if(h5 === "Work") h5 = "Other"
                        else h5 = tip.replace(/ ?Work ?/,"")
                        //if(pagin && pagin.bookmarks && pagin.bookmarks[categ] && pagin.bookmarks[categ].nb) h5 += " ("+pagin.bookmarks[categ].nb+")"

                        /* // deprecated
                        if(!dontShow) message.push(
                           <MenuItem className="menu-categ" onClick={this.setWorkCateg.bind(this,categ,pagin)}>
                              <h5>{h5}</h5>
                              { pagin.bookmarks && pagin.bookmarks[categ] && pagin.bookmarks[categ].nb > 3 && (this.state.collapse[categ]==false?<ExpandLess/>:<ExpandMore/>) }
                           </MenuItem>);
                        */

                        //loggergen.log("categIndex",categIndex,h5)
                     }  
                  }

                  //loggergen.log("lit:",lit,n)

                  //loggergen.log("willB",n,willBreak,categ)
                  //if(n != 0 && willBreak) break;
                  //else willBreak = false ;

                  if(removeUnreleased)
                  {
                     let allProps = sublist[o], status = allProps.filter(k => k.type === adm+"status" || k.type === tmp+"status")
                     if(status && status.length) status = status[0].value
                     else status = null

                     if(status && !status.match(/Released/)) {
                        unreleased = true
                        hasUnreleased = true
                     }
                  }


                  n ++;
                  end = n ;
                  if(!willBreak && !dontShow && !unreleased) { 
                     lastN = cpt ;
                     nMax = n
                     //loggergen.log("lastN",lastN)
                     message.push(this.makeResult(id,n,t,lit,lang,tip,Tag,null,r.match,k,sublist[o],{...r.lit}))
                  }
                  else {
                     if(unreleased) n --
                  }

                  cpt ++;
                  let isCollapsed = ( canCollapse && !(this.state.collapse[categ] || this.state.collapse[categ] == undefined))                  
                  if(!isCollapsed || n <= 3) m++ ;                  
                  
                  //loggergen.log("cpt",cpt,categ,canCollapse,isCollapsed,m,this.state.collapse[categ],index,n,willBreak,lastN,absi)

                  
                  if(displayTypes.length > 1 || t == "Work") {
                     if(cpt >= max_cpt&& (t != "Work" || isCollapsed)) {                      
                        if(categ == "Other") { break ; } 
                        else { willBreak = true;  } 
                     }
                  }
                  

                  if(displayTypes.length === 1)
                  {
                     if(m > 0 && m % 50 == 0 && !findFirst) {

                        findNext = true ;                     
                     }  
                  }
               
               }
            }
         }

         //console.log("cpt:",cpt)

         if(cpt == 0 ) { 
            let lang = languages[this.props.language]
            if(!lang) lang = this.props.language
            let other = this.state.results[this.state.id]
            if(other) other = other.counts
            if(other) other = other.datatype
            //loggergen.log("other:",other)
            if(other) other = Object.keys(other).filter(k => k !== "Any" && k !== t && other[k] !== 0 && searchTypes.includes(k))
            loggergen.log("other:",other)
            
            //if(other && other.length) 
            if(this.props.keyword==="tmp:subscriptions") {
               message.push(<Typography className="no-result"><span class="noR">Empty list of subscriptions<br/>(work in progress)</span></Typography>)
            } else if(this.props.loading && this.state.filters.datatype[0] !== "Any" || !this.props.datatypes || !this.props.datatypes.hash) {
               message.push(<Typography className="loading"></Typography>)
            } else {
               message.push(<Typography className="no-result">
                  { lang && I18n.t("search.filters.noresult"+(this.props.keyword=="-"?"-":"s"),{ 
                     keyword:'"'+lucenequerytokeyword(this.props.keyword)+'"', 
                     language:"$t("+lang+")", 
                     type:I18n.t("types.searchIn", { type:I18n.t("types."+this.state.filters.datatype[0].toLowerCase(),{count:2}).toLowerCase() }),  
                     interpolation: {escapeValue: false} }) }
                  { !lang && I18n.t("search.filters.noresultsAsso",{ 
                     keyword:lucenequerytokeyword(this.props.keyword), 
                     type:I18n.t("types.searchIn", { type:I18n.t("types."+this.state.filters.datatype[0].toLowerCase(),{count:2}).toLowerCase() }),  
                     interpolation: {escapeValue: false} }) }
                  {  this.state.filters.facets && I18n.t("search.filters.facets")}
                  {  this.state.filters.facets && <span class="reset-khmer"><br/>{this.renderResetF()}{onKhmerUrl&&<>
                     &nbsp;{I18n.t("misc.or")}&nbsp;
                     <Link to={"/guidedsearch"} id="clear-filters">
                        <span>{I18n.t("Lsidebar.tags.try")}</span>
                        <SearchIcon />                        
                     </Link>
                  </>}</span>}
                  { this.state.filters.datatype[0] === "Person" && <Trans i18nKey="search.filters.persons" components={{ newline: <br />, parag: <span class="noR"/>, list:<li/>, ita:<i/> }} />}
                  { this.state.filters.datatype[0] === "Instance" && <Trans i18nKey="search.filters.instances" components={{ newline: <br />, parag: <span class="noR"/>, list:<li/>, ita:<i/> }} />}
                  { this.state.filters.datatype[0] === "Work" && <Trans i18nKey="search.filters.instances" components={{ newline: <br />, parag: <span class="noR"/>, list:<li/>, ita:<i/> }} />}
               </Typography>);

               if(!this.state.filters.facets && other && other.length && !this.props.simple)   
                  message.push(<Typography className="no-result"><span>{I18n.t("search.seeO")}{I18n.t("misc.colon")} {other.map(o => <a onClick={(event) => this.handleCheck(event,o,true)} class="uri-link">{I18n.t("types."+o.toLowerCase(),{count:2})}</a>)}</span></Typography>)
               else if(this.props.language === "id" && this.props.keyword.match(RIDregexp)) {
                  let rid = this.props.keyword //
                  if(rid.includes(":")) { 
                     rid = this.props.keyword.split(":")
                     rid = rid[0].toLowerCase()+":"+rid[1].toUpperCase()
                  } else {
                     rid = rid.toUpperCase().replace(/^"?([^:"]+)"?$/,"bdr:$1")
                  }
                  message.push(<Typography className="no-result" style={{ lineHeight:"120%" }}>
                     <Link style={{ marginLeft:0 }} className="uri-link" to={"/show/"+rid}>Find resource with this RID</Link>
                  </Typography>)
               }
               
            }
         } 


         if(pagin.index == pagin.pages.length - 1) {

            //  // deprecated
            // if(cpt >= max_cpt && cpt - lastN >= 1 && Object.keys(sublist).length > 3 && (t != "Work" || pagin.bookmarks[categ].nb > 3) ) {
            //    //if(displayTypes.length > 1 || displayTypes.indexOf("Any") !== -1) 

            //    if((displayTypes.length > 1 || displayTypes.indexOf("Any") !== -1) && t !== "Work") 
            //        message.push(<MenuItem className="menu-categ-collapse" onClick={(e)=>this.handleCheck(e,t,true,{},true)}><h5>{I18n.t("misc.show") +" "+t+"s" +(counts["datatype"][t]?" ("+counts["datatype"][t]+")":"")/*+" "+categ*/}</h5></MenuItem>);                      
            //    else 
            //    { 
            //       if(t === "Work") 
            //          message.push(<MenuItem className="menu-categ-collapse" onClick={this.setWorkCateg.bind(this,categ,pagin)}><h5>{I18n.t(this.state.collapse[categ]==false?"misc.hide":"misc.show") + " " + t + "s" + /*" / " + h5.replace(/ \([0-9]+\)$/,"") +*/ (pagin.bookmarks[categ].nb ? " ("+pagin.bookmarks[categ].nb +")":"") /*+" "+categ*/}</h5></MenuItem>);                      

            //       if(/*t !== "Work" &&*/ displayTypes.length === 1 && displayTypes.indexOf("Any") === -1) 
            //          message.push(<MenuItem className="menu-categ-collapse datatype" onClick={(e)=> this.resetDT() }><h5>{I18n.t("misc.datatype")  /*+t+" "+categ*/}</h5></MenuItem>);                         
            //    }
            // }
            // else if(/*t !== "Work" &&*/ displayTypes.length === 1 && displayTypes.indexOf("Any") === -1 && iniTitle) 
            //    message.push(<MenuItem className="menu-categ-collapse datatype" onClick={(e)=>this.handleCheck(e,"Any",true,{},true)}><h5>{I18n.t("misc.datatype")  /*+" "+categ*/}</h5></MenuItem>);                      
         }

         if(!iniTitle && (displayTypes.length > 1 || displayTypes.indexOf("Any") !== -1) ) {
             iniTitle = true
             
             // // deprecated
             // message.push(<MenuItem  onClick={(e)=>this.handleCheck(e,t,true,{},true)}><h4>{I18n.t("types."+t.toLowerCase())+"s"+(false && displayTypes.length>1 && counts["datatype"][t]?" ("+counts["datatype"][t]+")":"")}</h4></MenuItem>);
             // message.push(<MenuItem className="menu-categ-collapse" onClick={(e)=>this.handleCheck(e,t,true,{},true)}><h5>{I18n.t("misc.show") +" "+t+"s"+(counts["datatype"][t]?" ("+counts["datatype"][t]+")":"") /*" "+categ */ }</h5></MenuItem>);                      
          }
         

         //loggergen.log("end pagin",pagin,paginate)
         if(pagin) {
            
            // TODO also use status in counts
            pagin.nMax = n // see facets

            if(pagin && pagin.bookmarks && pagin.bookmarks[categ] && pagin.bookmarks[categ].nb === undefined) { 
               pagin.bookmarks[categ] = { ...pagin.bookmarks[categ], nb:Object.keys(sublist).length - pagin.bookmarks[categ].i }
               //loggergen.log("bookM2",JSON.stringify(pagin.bookmarks,null,3))
            }

            if(pagin.gotoCateg !== undefined && paginate[0]) { paginate.length = 0; delete pagin.gotoCateg ; }
            if(paginate.length == 0) { paginate.push(pagin); }
         }

         if(hasUnreleased) {
            const f = this.props.config?.facets[this.state.filters.datatype[0]] 
            message.push(
               <Typography className="no-result">
                  <span>
                     {I18n.t("search.hidden")}<br/>
                     <a onClick={(event) => this.handleCheckFacet(event,f?.nonReleased,[_tmp+"show"],true)} class="uri-link" style={{marginLeft:0}}>{I18n.t("search.showU")}</a>
                  </span>
               </Typography>
            )
         }
      }

   }

   prepareResults()
   {

      let types = ["Any"]
      let counts = { "datatype" : { "Any" : 0 } }
      let id = this.state.filters.datatype.sort() + "#" + this.props.keyword + "@" + this.props.language
      let message = []
      let results = this.handleResOrOnto(message,id);      
      let resMatch = message.length
      let resLength = 0;
      if(results && results.results && results.results.bindings)
         resLength = Object.keys(results.results.bindings).filter(d => { 
                        let t = d[0].toUpperCase()+d.slice(1).replace(/s$/,"")
                        //loggergen.log("t",t)
                        return searchTypes.indexOf(t) !== -1 
                     }).reduce((acc,e)=>acc+Object.keys(results.results.bindings[e]).length,0)

      //loggergen.log("res::",id,results,message,message.length,resLength,resMatch,this.props.loading)

      let sta = { ...this.state }

      this.setTypeCounts(types,counts);

      if(!resMatch && ((this.props.failures[this.props.keyword]) || (counts.datatype["Any"] === 0 && !this.props.loading && !this.props.datatypes) ) ) { //resMatch == 0 && (!results  || results.numResults == 0) ) {
         
         if(!this.props.loading && (this.props.failures[this.props.keyword] || !this.props.resource || !this.props.resource[this.props.keyword]) ) {             
            message.push(
               <Typography style={{fontSize:"1.5em",maxWidth:'700px',margin:'50px auto',zIndex:0}}>
                  No result found. 
               </Typography>
            )
         }
         if(!sta.results || !sta.results[id] || (sta.results[id].message && message && sta.results[id].message.length != message.length))
         {
            let change
            if(!sta.results) sta.results = {}
            if(!sta.results[id]) {
               sta.results[id] = { message, types, counts, resMatch, results }
               this.setState(sta);
            }
         }
      }
      else 
      {
         //if(sta.results) loggergen.log("results::",JSON.stringify(Object.keys(sta.results),null,3),sta)

         /*
         if(!this.props.datatypes || !this.props.datatypes.metadata)
         {
            //loggergen.log("dtp?",this.props.datatypes)
         }
         else {
            
         }
         */



         /*
         loggergen.log("sta?",sta.id !== id,sta.repage,"=repage",
            !sta.results,
            !sta.results || !sta.results[id], 
            sta.results && sta.results[id] && (sta.results[id].resLength != resLength),
            sta.results && sta.results[id] && (sta.results[id].resMatch != resMatch),
            sta.results && sta.results[id] && sta.results[id].message && sta.results[id].message.length <= 1, 
            sta.results && sta.results[id] && sta.results[id].counts && sta.results[id].counts.datatype && Object.keys(sta.results[id].counts.datatype) && Object.keys(sta.results[id].counts.datatype).length != Object.keys(counts.datatype).length)
         */
         let paginate = [], bookmarks, noBookM = false;
         if( //!this.props.loading && 
          (  sta.id !== id || sta.repage 
         || !sta.results 
         || !sta.results[id] 
         || (sta.results[id].resLength != resLength) 
         || (sta.results[id].resMatch != resMatch) 
         || ( sta.results[id].message.length <= 1) 
         || Object.keys(sta.results[id].counts.datatype).length != Object.keys(counts.datatype).length ) 
         ) { 
            
            if(sta.id == id && this.state.paginate && this.state.paginate.pages && this.state.paginate.pages.length > 1) paginate = [ this.state.paginate ]
            if(sta.results && sta.results[id] && sta.results[id].bookmarks) bookmarks = sta.results[id].bookmarks                        
            else noBookM = true

            //loggergen.log("paginate?",JSON.stringify(paginate))

            if(!results) results = { results:{bindings:{}}}
            this.handleResults(types,counts,message,results,paginate,bookmarks,resLength, this.state.mapInfo);
            
            //loggergen.log("bookM:",results,JSON.stringify(paginate,null,3))
            
         }
         else if(!this.props.loading) {
            message = sta.results[id].message
            paginate = [ sta.results[id].paginate ]
            bookmarks = sta.results[id].bookmarks      

            //loggergen.log("bookM!",JSON.stringify(paginate,null,3))
         }

         //loggergen.log("mesg",id,message,types,counts,JSON.stringify(paginate,null,3))

         if(sta.id !== id || sta.repage || !sta.results || !sta.results[id] || (sta.results[id].resLength != resLength) || (sta.results[id].resMatch != resMatch) || ( sta.results[id].message.length < message.length ) || Object.keys(sta.results[id].counts.datatype).length != Object.keys(counts.datatype).length) {
            if(!sta.results) sta.results = {}
            if(!sta.results[id]) sta.results[id] = {}
            
            let newSta = { message, types, counts, resMatch, resLength, results }
            if(bookmarks) { 
               newSta.bookmarks = bookmarks
            }
            if(paginate[0]) { 
               newSta.paginate = paginate[0]
               newSta.bookmarks = { ...(bookmarks?bookmarks:paginate[0].bookmarks) }
               delete paginate[0].bookmarks
               sta.paginate = paginate[0]
               sta.paginate.bookmarks = newSta.bookmarks
            }
            //loggergen.log("bookM?",JSON.stringify(newSta.paginate,null,3))
            sta.results[id] = newSta
            sta.repage = false
            sta.id = id

            if(noBookM && paginate[0] && paginate[0].bookmarks) sta.repage = true

            //else sta.repage = false
            
            //loggergen.log("repage?",sta.repage)

            this.setState(sta);
         }
      }

      

      return id ;
   }

   subcount(u,v) 
   {     
      if(this.props.metadata && this.props.metadata[u] && this.props.metadata[u][v] && this.props.metadata[u][v].i !== undefined)
         return this.props.metadata[u][v].i + " / "
      else
         return ""
   }

   renderFilterTag(isText:boolean=true,t, k, f) {      
      let t_ = t,k_ = k,isExclu = this.state.filters.exclude && this.state.filters.exclude[t] && this.state.filters.exclude[t].includes(k)
      if(!isText) {
         t_ = getPropLabel(this,t,false) 
         k_ = getPropLabel(this,k,false)
         t = getPropLabel(this,t) 
         k = getPropLabel(this,k)
      }
      else { t = <span>{t}</span>; k = <span>{k}</span> }
      return <a  title={I18n.t("Lsidebar.tags."+(!isExclu?"include":"exclude"))+" "+t_+I18n.t("punc.colon")+" "+ k_} lang={this.props.locale} class={ "active-filter " + (isExclu?"exclu":"") + (!f?" disabled":"")}><span>{t}{I18n.t("punc.colon")} <b>{k}</b></span><a title={I18n.t("Lsidebar.activeF.remove")} {...f?{onClick:f.bind(this)}:{}}><Close/></a></a>
   }

   resetFilters(e) {
      
      let {pathname,search} = this.props.history.location
      
      if(!this.props.isInstance) {
         search = (search.replace(/((&|(\?))([tfin]|pg)=[^&]+)/g,"$3")+"&t="+this.state.filters.datatype[0])            
         let inEtext 
         if(this.props.searches && this.props.searches[this.state.filters.datatype[0]] && this.props.searches[this.state.filters.datatype[0]][this.props.keyword+"@"+this.props.language] && this.props.searches[this.state.filters.datatype[0]][this.props.keyword+"@"+this.props.language].inEtext) {
            inEtext = this.props.searches[this.state.filters.datatype[0]][this.props.keyword+"@"+this.props.language].inEtext
            if(inEtext) search = search.replace(/((&|(\?))([r])=[^&]+)/g,"$3")
         }
         if(onKhmerUrl && this.props.keyword === "-" && this.props.checkResults?.route) search = this.props.checkResults?.route.replace(/^[^?]+[?]/,"?")
         this.props.history.push({pathname,search:search.replace(/\?&/,"?")})
      }
      else this.props.history.push({pathname,search:this.state.backToWorks})
      
      // TODO fix reset filters 
      //setTimeout(() => this.setState({...this.state, repage:true, uriPage:0, scrolled:1, filters:{ datatype: this.state.filters.datatype } }), 100 )

   }

   treeWidget(j,meta,counts,jlabel,jpre) {
      if(j == "tree" || j == "genres") { // && meta[j]["@graph"]) { //
         let tree ;
         if(meta[j]) tree = meta[j]["@graph"]

         //loggergen.log("meta tree",tree,meta[j],counts)

         if(tree && tree[0]
            && this.state.filters && this.state.filters.datatype
            && counts["datatype"][this.state.filters.datatype[0]])
         {
            if(tree[0]["taxHasSubClass"] && tree[0]["taxHasSubClass"].indexOf("Any") === -1)
            {
               tree[0]['taxHasSubClass'] = ['Any'].concat(tree[0]['taxHasSubClass'])
               tree.splice(1,0,{"@id":"Any",
                  taxHasSubClass:[],"skos:prefLabel":[],
                  ["tmp:count"]:counts["datatype"][this.state.filters.datatype[0]]})
            }

            return this.widget(jlabel,j,this.subWidget(tree,jpre,tree[0]['taxHasSubClass'],true,j));
         }
      } else { //sort according to ontology properties hierarchy
         let tree = {}, tmProps = Object.keys(meta[j]).map(e => e), change = false
         //let rooTax = false
         do // until every property has been put somewhere
         {
            //loggergen.log("loop",JSON.stringify(tmProps,null,3))
            change = false ;
            for(let i in tmProps) { // try each one
               let k = tmProps[i]
               let p = this.props.dictionary[k]

               //loggergen.log("p",k,p)

               /* // not really useful, better change bdr:BoTibt label to "Tibetan in Tibetan script" (see bdr:EnLatn)
               let isSubClassOfASubClassOfLangScript ;
               if(p && p[rdfs+"subClassOf"]) for(let q of p[rdfs+"subClassOf"]) {
                  q = this.props.dictionary[q.value]
                  if(q && q[rdfs+"subClassOf"] && q[rdfs+"subClassOf"].filter(e => e.value === bdo+"LangScript").length) {
                     isSubClassOfASubClassOfLangScript = true ;
                     break ;
                  }
               }
               */

               if(!p || (!p[rdfs+"subPropertyOf"]
                  && (!p[rdfs+"subClassOf"] || p[rdfs+"subClassOf"].filter(e => e.value == bdo+"Event").length != 0  || p[rdfs+"subClassOf"].filter(e => e.value == bdo+"LangScript").length != 0 
                                             //|| isSubClassOfASubClassOfLangScript 
                  )
                  && (!p[bdo+"taxSubClassOf"] || p[bdo+"taxSubClassOf"].filter(e => e.value == bdr+"LanguageTaxonomy").length != 0 ) )  // is it a root property ?
                  && (j !== "versionType" || p[rdf+"type"] && p[rdf+"type"].includes(bdo+"WorkPartType") && ( k === _tmp+"standalone" || k === _tmp+"partOfVersion" ) )
               )
               {
                  //loggergen.log("root",k,p)
                  tree[k] = {} ;
                  delete tmProps[i];
                  change = true ;
                  break ;
               }
               else // find its root property in tree
               {
                  change = this.inserTree(k,p,tree)
                  //loggergen.log("inT",change)
                  if(change) {
                     delete tmProps[i];
                     break ;
                  }
               }
            }
            tmProps = tmProps.filter(String)

            //loggergen.log("ici?",tmProps,change)
            //if(rooTax) break ;

            if(!change) { //} && !rooTax) {
               //loggergen.log("!no change!")
               for(let i in tmProps) {
                  let k = tmProps[i]
                  let p = this.props.dictionary[k]
                  // is it a root property ?
                  //loggergen.log("k?",k,p)
                  if(p && p[bdo+"taxSubClassOf"] && p[bdo+"taxSubClassOf"].filter(q => tmProps.filter(r => r == q.value).length != 0).length == 0)
                  {
                     tmProps = tmProps.concat(p[bdo+"taxSubClassOf"].map(e => e.value));
                     //loggergen.log(" k1",k,tmProps)
                     change = true ;
                     //rooTax = true ;
                  }
                  else if(p && p[rdfs+"subClassOf"] && p[rdfs+"subClassOf"].filter(q => tmProps.filter(r => r == q.value).length != 0).length == 0)
                  {
                     tmProps = tmProps.concat(p[rdfs+"subClassOf"].map(e => e.value));
                     //loggergen.log(" k2",k,tmProps)
                     change = true ;
                     //rooTax = true ;
                  }
               }
               if(!change)break;
            }

         }
         while(tmProps.length > 0);
         
         if(tree[bdo+"Facet"]) {
            tree = { ...tree, ...tree[bdo+"Facet"] }
            delete tree[bdo+"Facet"] ;
         }
         
         //loggergen.log("inserTree",tree)

         tree = this.counTree(tree,meta[j],counts["datatype"][this.state.filters.datatype[0]],j)
         
         //loggergen.log("counTree",JSON.stringify(tree,null,3),j)

         return this.widget(jlabel,j,this.subWidget(tree,jpre,tree[0]['taxHasSubClass'],false,j));
      }

      return ;
   }

   popwidget(title:string,txt:string,inCollapse:Component,icon:Component)  { 
      return (
         [<ListItem key={1} className="widget-header"
            onClick={(e) => { this.setState({collapse:{ ...this.state.collapse, [txt]:!this.state.collapse[txt]}, anchor:{...this.state.anchor, [txt]:e.currentTarget} }); } }
            >
            {icon}
            <Typography  className="widget-title" ><span lang={this.props.locale}>{title}</span></Typography>
            { this.state.collapse[txt] ? <ExpandLess /> : <ExpandMore />}
         </ListItem>,
         // TODO replace Collapse by Popover
         <Popover key={2}
               open={this.state.collapse[txt]}
               className={["collapse sortBy ",this.state.collapse[txt]?"open":"close"].join(" ")}
               transformOrigin={{ vertical: 'top', horizontal: 'left'}} 
               anchorOrigin={{vertical: 'bottom', horizontal: 'left'}} 
               anchorEl={this.state.anchor[txt]} 
               onClose={e => { this.setState({...this.state,collapse: {...this.state.collapse, [txt]:false } } ) }}
            >
               {inCollapse}
         </Popover> ]
      )
  }


   widget(title:string,txt:string,inCollapse:Component)  { 
      let isNew = false
      if(this.props.config && this.props.config["facets-new"] && this.props.config["facets-new"].includes(txt)) isNew = true
      let open = this.state.collapse[txt] // ||(this.state.collapse[txt] === undefined && txt === "versionType")
      return (
         [<ListItem key={1} className="widget-header"
            onClick={(e) => { this.setState({collapse:{ ...this.state.collapse, [txt]:!open} }); } }
            >
            <Typography  className="widget-title" >
               <span lang={this.props.locale}>{title}</span>
               { isNew && <span className="new">{I18n.t("Lsidebar.widgets.new")}</span> }
            </Typography>
            { open ? <ExpandLess /> : <ExpandMore />}
         </ListItem>,
         // TODO replace Collapse by Popover
         <Collapse key={2}
            in={open}
            className={["collapse ",open?"open":"close"].join(" ")}
            >
               {inCollapse}
         </Collapse> ]
      )
  }

   subWidget(tree:[],jpre:string,subs:[],disable:boolean=false,tag:string) {

      if(!Array.isArray(subs)) subs = [ subs ]

      subs = subs.map(str => {
         let index
         let a = tree.filter(e => e["@id"] == str)
         if(a.length > 0 && a[0]["tmp:count"]) index = Number(a[0]["tmp:count"])

         return ({str,index})
      })
      subs = _.orderBy(subs,'index','desc').map(e => e.str)
      let unspec = subs.indexOf("unspecified")
      if(unspec != -1) { 
         subs.splice(unspec, 1) 
         subs.push("unspecified")
      }

      //loggergen.log("subW",tree,subs,jpre,tag)

      let checkbox = subs.map(e => {

         if(e === bdr+"LanguageTaxonomy") return ;

         let elem = tree.filter(f => f["@id"] == e)

         //loggergen.log("elem",elem,e)

         if(elem.length > 0) elem = elem[0]
         else return

         let label = getLangLabel(this,"",elem["skos:prefLabel"],true) 
         //if(label && label.value) label = label.value
         //else if(label && label["@value"]) label = label["@value"]
         if(!label) label = { value: this.fullname(e,elem["skos:prefLabel"],true) }

         //loggergen.log("check",e,label,elem,disable);

         let cpt   = tree.filter(f => f["@id"] == e)[0]["tmp:count"]
         let cpt_i                
         let id = elem["@id"].replace(/bdr:/,bdr)
         //loggergen.log("@id",id)
         if(this.props.metadata && this.props.metadata[tag] && this.props.metadata[tag][id]) { 
            cpt_i = this.props.metadata[tag][id].i + " / "
         }
         else {
            cpt_i = tree.filter(f => f["@id"] == e)[0]["tmp:subCount"]
            if(!cpt_i) cpt_i = ""
         }

         let checkable = tree.filter(f => f["@id"] == e)
         if(checkable.length > 0 && checkable[0].checkSub)
            checkable = checkable[0]["taxHasSubClass"]
         else
            checkable = [e]

         //let isdisabled = true
         if( disable && elem && elem["taxHasSubClass"] && elem["taxHasSubClass"].length > 0)
         {
            if(!Array.isArray(elem["taxHasSubClass"])) elem["taxHasSubClass"] = [ elem["taxHasSubClass"] ]

            checkable = []
            let tmp = elem["taxHasSubClass"].map(e => e)
            while(tmp.length > 0)
            {
               let t = tree.filter(f => f["@id"] == tmp[0])

               //loggergen.log("t",t);

               if(t.length > 0) {
                  t = t[0]
                  if(t) {
                     if(!t["taxHasSubClass"] || t["taxHasSubClass"].length == 0)  { checkable.push(tmp[0]); }
                     else tmp = tmp.concat(t["taxHasSubClass"])
                  }
               }

               delete tmp[0]
               tmp = tmp.filter(String)
               //loggergen.log("tmp:",tmp,checkable)
            }
         }
            
         checkable = checkable.map(e => e.replace(/bdr:/,bdr))
         //if(!checkable.includes(id)) checkable.unshift(id)

         let checked = this.state.filters.facets && this.state.filters.facets[jpre],partial

         //loggergen.log("checked1",jpre,e,checked,checkable)


         if(!checked) {
            if(label === "Any") checked = true ;
            else checked = false
         }
         else {
            let toCheck = this.state.filters.facets[jpre]
            if(toCheck.val) toCheck = toCheck.val
            if(checkable.indexOf(e) === -1) {
               for(let c of checkable) {
                  let chk  = toCheck.indexOf(c) !== -1 
                  checked = checked && chk ;
                  partial = partial || chk
               }
            }
            else checked = toCheck.indexOf(e) !== -1
         }

         //loggergen.log("checkedN",checked)

         let isExclu = this.state.filters.exclude && this.state.filters.exclude[jpre] && checkable && checkable.reduce( (acc,k) => (acc && this.state.filters.exclude[jpre].includes(k)), true )

         if(label !== "Any" && (label.value !== "Any") && label !== "unspecified") { 

            let val = getVal(label), lang = getLang(label)
            if(!lang) label = val
            else label = <span lang={lang}>{val}</span>

            let disabled = cpt_i.startsWith("0")&&!checked

            return (
               <div key={e} style={{width:"auto",textAlign:"left"}} className="widget searchWidget">
                  <FormControlLabel
                     {... disabled?{disabled:true}:{}}
                     control={
                        <Checkbox
                           checked={checked}
                           className={"checkbox "+(partial&&!checked?"partial":"")}
                           icon={<CheckBoxOutlineBlank/>}
                           checkedIcon={isExclu ? <Close className="excl"/>:<CheckBox  style={{color:"#d73449"}}/>}
                           onChange={(event, checked) => this.handleCheckFacet(event,jpre,[id, ...checkable],checked)}
                        />

                     }
                     label={<span title={e.replace(new RegExp(bdr),"bdr:")}>{label}&nbsp;<span class='facet-count-block'>{I18n.t("punc.lpar")}<span class="facet-count" lang={this.props.locale}>{I18n.t("punc.num",{num:cpt_i+cpt, interpolation: {escapeValue: false}})}</span>{I18n.t("punc.rpar")}</span></span>}
                  />&nbsp;{ elem && elem["taxHasSubClass"] && elem["taxHasSubClass"].length > 0 &&
                     <span className={"subcollapse " + (disabled?"off":"")} /*style={{width:"335px"}}*/
                           onClick={(ev) => { this.setState({collapse:{ ...this.state.collapse, [e]:!this.state.collapse[e]} }); } }>
                     { this.state.collapse[e] ? <ExpandLess /> : <ExpandMore />}
                     </span> }
                  { !isExclu && label !== "Any" && <div class="exclude"><Close onClick={(event, checked) => this.handleCheckFacet(event,jpre,[id, ...checkable],true,true)} /></div> }
                  {
                     elem && elem["taxHasSubClass"] && elem["taxHasSubClass"].length > 0 &&
                     [
                        <span className={"subcollapse " + (disabled?"off":"")} /*style={{width:"335px"}}*/
                              onClick={(ev) => { this.setState({collapse:{ ...this.state.collapse, [e]:!this.state.collapse[e]} }); } }>
                        { this.state.collapse[e] ? <ExpandLess /> : <ExpandMore />}
                        </span>,
                        <Collapse
                           in={this.state.collapse[e]}
                           className={["subcollapse",this.state.collapse[e]?"open":"close"].join(" ")}
                           style={{paddingLeft:20+"px"}} // ,marginBottom:"30px"
                           >
                              { this.subWidget(tree,jpre,elem["taxHasSubClass"],disable,tag) }
                        </Collapse>
                     ]
                  }
               </div>
            )
         }
      })

      return ( checkbox )
   }

   // TODO add providers icons

   render_filters(types,counts,sortByList,reverseSort,facetWidgets) {
      this._refs["sidepane"] = React.createRef()
      this._refs["simplebar"] = React.createRef()
      
      return ( <div ref={this._refs["sidepane"]} className={"SidePane left "+(!this.state.collapse.settings?"closed":"") + (this.state.stuck?" isTop":"")}>
            <SimpleBar ref={this._refs["simplebar"]} /*forceVisible="y" autoHide={false}*/ >
                  {/* <IconButton className="close" onClick={e => this.setState({...this.state,leftPane:false,closeLeftPane:true})}><Close/></IconButton> */}
               { //this.props.datatypes && (results ? results.numResults > 0:true) &&
                  <div style={{ /*minWidth:"335px",*/ position:"relative"}}>                 
                     <div id="closeSettings" onClick={() => this.setState({collapse:{...this.state.collapse, settings:false}})}><Close /></div>    
                     <Typography className="sidebar-title">
                        {I18n.t("Lsidebar.title")}
                     </Typography>
                     { /* // deprecated, now "Provider" facet
                        this.widget(I18n.t("Lsidebar.collection.title"),"collection",
                        ["BDRC" ,"rKTs" ].map((i) => <div key={i} style={{width:"150px",textAlign:"left"}} className="searchWidget">
                              <FormControlLabel
                                 control={
                                    <Checkbox
                                       {... i=="rKTs" ?{}:{defaultChecked:true}}
                                       disabled={true}
                                       className="checkbox disabled"
                                       icon={<PanoramaFishEye/>}
                                       checkedIcon={<CheckCircle/>}
                                       //onChange={(event, checked) => this.handleCheck(event,i,checked)}
                                    />

                                 }
                                 label={i}
                              /></div> ))
                     */}                     
                     {  this.props.datatypes && !this.props.datatypes.hash &&
                        <Loader loaded={false} className="datatypesLoader" style={{position:"relative"}}/>
                     }
                     <ListItem className="widget-header"                        
                        onClick={(e) => {
                           //if(!(this.props.datatypes && !this.props.datatypes.hash))
                              this.setState({collapse:{ ...this.state.collapse, "datatype":!this.state.collapse["datatype"]} }); } }
                        >
                        <Typography className="widget-title">
                           <span lang={this.props.locale}>{I18n.t("Lsidebar.datatypes.title")}</span>
                        </Typography>
                        { /*this.props.datatypes && this.props.datatypes.hash &&*/ !this.state.collapse["datatype"] ? <ExpandLess /> : <ExpandMore />  }
                     </ListItem>
                     <Collapse
                        in={/*this.props.datatypes && this.props.datatypes.hash &&*/ !this.state.collapse["datatype"]}
                        className={["collapse ",  !(this.props.datatypes && !this.props.datatypes.hash)&&!this.state.collapse["datatype"]?"open":"close"].join(" ")}
                        >
                        <div>
                        { //facetList&&facetList.length > 0?facetList.sort((a,b) => { return a.props.label < b.props.label } ):
                              types.map((i) => {

                                 if(i==="Any") return

                                 //loggergen.log("counts",i,counts,counts["datatype"][i],this.state.filters.datatype.indexOf(i))

                              let disabled = (!["Work","Instance","Person", "Place","Topic","Corporation","Role","Lineage","Etext","Product","Scan"].includes(i)) // false // (!this.props.keyword && ["Any","Etext","Person","Work"].indexOf(i)===-1 && this.props.language  != "")
                           // || (this.props.language == "")

                              let count = counts["datatype"][i]
                              if(this.props.searches && this.props.searches[i] && this.props.searches[i][this.props.keyword+"@"+this.props.language]) {
                                 if(this.props.searches[i][this.props.keyword+"@"+this.props.language].numResults == 0) count = 0
                              }
                              if(!count || count == 0) { 
                                 disabled = true
                                 count = 0
                              }

                              return (
                                 <div key={i} style={{textAlign:"left"}}  className={"searchWidget datatype "+i.toLowerCase()+ (disabled?" disabled":"")}>
                                    <span class={"img "+(disabled?"disabled":"") } style={{backgroundImage:"url('/icons/sidebar/"+i.toLowerCase()+".svg')"}} onClick={(event) => this.handleCheck(event,i,this.state.filters.datatype.indexOf(i) === -1)}></span>
                                    <FormControlLabel
                                       control={
                                          <Checkbox
                                             className={"checkbox "+(disabled?"disabled":"")}
                                             disabled={disabled}
                                             //{...i=="Any"?{defaultChecked:true}:{}}
                                             color="black"
                                             checked={this.state.filters.datatype.indexOf(i) !== -1} 
                                             icon={<PanoramaFishEye/>}
                                             checkedIcon={<CheckCircle style={{color:"#d73449"}}/>}
                                             onChange={(event, checked) => this.handleCheck(event,i,checked)}
                                          />

                                       }
                                       {...count !== undefined
                                       ?{label:<span lang={this.props.locale}>{I18n.t("types."+i.toLowerCase(),{count:2})+" "+I18n.t("punc.lpar")}<span class="facet-count" lang={this.props.locale}>{typeof count === "string" && "~"}{I18n.t("punc.num",{num:Number(count)})}</span>{I18n.t("punc.rpar")}</span>}
                                       :{label:<span lang={this.props.locale}>{I18n.t("types."+i.toLowerCase(),{count:2})}</span>}}
                                    />
                                 </div>
                              )
                           }
                        )}
                        </div>
                     </Collapse>
                     
                     {  facetWidgets }
                  
                  </div>
               }
                </SimpleBar>
               </div>
            )
   }

   renderResetF() {
      return <a title={I18n.t("Lsidebar.activeF.reset")} id="clear-filters" onClick={this.resetFilters.bind(this)}><span>{I18n.t("Lsidebar.tags.reset")}</span><RefreshIcon /></a>
   }

   render() {

      // avoid loading home page until we know where we are supposed to be
      if(!this.props.config) return <div><Loader loading={true}/></div>

      subtime("render",0)

      let results
      let message = [],messageD = [];
      //let results ;
      let facetList = []
      let types = ["Any"]
      let loader ;
      let counts = { "datatype" : { "Any" : 0 } }
      let paginate,pageLinks
      const { isAuthenticated } = this.props.auth;
      let id ;

      let nbResu = this.state.paginate && this.state.paginate.nMax ? this.state.paginate.nMax:(this.state.results&&this.state.results[this.state.id]?this.state.results[this.state.id].resLength:"--")
      

      if(!global.inTest) loggergen.log("render",this.props.keyword,this.props,this.state,isAuthenticated && isAuthenticated(),this._customLang) //,JSON.stringify(this.state.filters,null,3))
      // no search yet --> sample data
      if(!this.props.keyword || this.props.keyword == "")
      {
         if(this.props.config && this.props.config.links)
         {
            messageD.push(<h4 key={"sample"} style={{marginLeft:"16px"}}>Sample Resources</h4>)
            let i = 0
            for(let l of this.props.config.links) {
               //loggergen.log("l",l)
               let who = getLangLabel(this,"", l.label)
               //loggergen.log("who",who)
               messageD.push(<h5 key={i}>{l.title}</h5>)
               messageD.push(this.makeResult(l.id,null,getEntiType(l.id),who.value,who.lang,l.icon,TagTab[l.icon]))
               i++;
            }
            //message.push(this. akeResult("W19740",null,"Work","spyod 'jug'","bo-x-ewts","Abstract Work",TagTab["Abstract Work"]))
            //message.push(this. akeResult("P6161",null,"Person","zhi ba lha/","bo-x-ewts"))
         }

         types = this.state.searchTypes //[ /*"Any",*/ ...searchTypes.slice(1) ] //["Any","Person","Work","Corporation","Place", /*"Item",*/ "Etext","Role","Topic","Lineage"]
         /*
         let e = types.indexOf("Etext")
         if(e !== -1) { 
            delete types[e]
            types = types.filter(e => e)
            loggergen.log("types",types)
         }
         */
         //types = types.sort()
      }
      else {
         
         id = this.prepareResults();

         //loggergen.log("id",id)

         if(this.state.results && this.state.results[id])
         {
            const MAX_PAGE = window.innerWidth <= 1280 ? 5 : 10
            results = this.state.results[id].results
            message = this.state.results[id].message
            counts = this.state.results[id].counts
            types = this.state.results[id].types
            paginate = this.state.results[id].paginate
            if(paginate && paginate.pages && paginate.pages.length > 1) {
               pageLinks = []
               let min = 1, max = paginate.pages.length
               if(max > MAX_PAGE) { 
                  min = paginate.index + 1 - Math.floor(MAX_PAGE / 2) + 1 ;
                  if(min < 1) min = 1
                  max = min + MAX_PAGE - 3
                  if(max > paginate.pages.length) max = paginate.pages.length
               }

               //console.log("pages:",min,max, nbResu, paginate.pages[paginate.pages.length-1], paginate.pages )

               if(min > 1) pageLinks.push(<a onClick={this.goPage.bind(this,id,1)}>{I18n.t("punc.num",{num:1})}</a>) 
               if(min > 2) pageLinks.push(" ... ") 
               for(let i = min ; i <= max ; i++) { /*if(nbResu >= paginate.pages[i-1])*/ pageLinks.push(<a data-i={i} data-max={paginate.pages.length > MAX_PAGE} onClick={this.goPage.bind(this,id,i)}>{((i-1)===this.state.paginate.index?<b><u>{I18n.t("punc.num",{num:i})}</u></b>:I18n.t("punc.num",{num:i}))}</a>) }
               if(max < paginate.pages.length) {  
                  for(let i = paginate.pages.length-1 ; i >= min ; i--) {
                     if(nbResu >= paginate.pages[i]) {
                        if(max < paginate.pages.length - 1) pageLinks.push(" ... ")
                        pageLinks.push(<a onClick={this.goPage.bind(this,id,paginate.pages.length)}>{I18n.t("punc.num",{num:paginate.pages.length})}</a>) 
                        break;
                     }
                  }
               }
            }
            
            //loggergen.log("prep",message,counts,types,paginate)

            /* // deprecated
            if(!this.props.loading && !message.length && ( (this.props.searches[this.props.keyword+"@"+this.props.language] && !this.props.searches[this.props.keyword+"@"+this.props.language].numResults ) 
                  || (!this.props.loading && results && results.results && results.results.bindings && !results.results.bindings.numResults) ) 
                  || (!this.props.language && !this.props.loading && (counts["datatype"]["Any"] == 0 || !counts["datatype"][this.state.filters.datatype[0]]) ) )
               {
                  message = [
                     <Typography style={{fontSize:"1.5em",maxWidth:'700px',margin:'50px auto',zIndex:0}}>
                           No result found.
                     </Typography>
                  ]
                   
            }
            */
         }


      }

      let meta,metaK = [] ;
      if(this.state.filters.datatype && this.state.filters.datatype.indexOf("Any") === -1) {

         if(this.props.searches && this.props.searches[this.state.filters.datatype[0]]) {

            meta = this.props.searches[this.state.filters.datatype[0]][this.props.keyword+"@"+this.props.language]

            //loggergen.log("ici",meta)

            if(meta) meta = meta.metadata
            if(meta) {
               let that = this.props.config["facets"][this.state.filters.datatype[0]]
               if(that) that = Object.keys(that)
               metaK = Object.keys(meta).sort((a,b) => that.indexOf(a)<that.indexOf(b)?-1:(that.indexOf(a)>that.indexOf(b)?1:0))
            }

         }
      }

      //loggergen.log("metaK",metaK)

      /*

         <Popover 
            className="menu-source"
            id={"menu-"+src+"-"+prettId} 
            anchorEl={(()=>{ loggergen.log("where!!!???"); return this.state.anchor["menu-"+src+"-"+prettId]})()} 
            open={(() => { loggergen.log("what!!!???"); return this.state.collapse["menu-"+src+"-"+prettId]})()}                       
            onClose={(ev) => this.handleCloseSourceMenu(ev,"menu-"+src+"-"+prettId)}
            >
               <MenuItem onClick={(ev) => this.handleCloseSourceMenu(ev,"menu-"+src+"-"+prettId)}>View data in Public Digital Library</MenuItem>
               <MenuItem onClick={(ev) => this.handleCloseSourceMenu(ev,"menu-"+src+"-"+prettId)}><a href={id} class="menu-item-source" target="_blank">Go to external website</a></MenuItem>
         </Popover>

      */ 


      let menuK = {}
      Object.keys(this._menus).map(k => { 
         let mK = k.replace(/^([^-]+-).*(-[^-]+$)/,"$1.*$2")
         if(!menuK[mK]) menuK[mK] = []
         menuK[mK].push(this._menus[k])
      })

      //loggergen.log("_menus",this._menus, menuK)

      let showMenus = Object.keys(menuK).map(id => 
            <Popover 
               id="popSame"
               transformOrigin={{ vertical: 'bottom', horizontal: 'right'}} 
               anchorOrigin={{vertical: 'top', horizontal: 'right'}} 
               anchorEl={this.state.anchor[id]} 
               open={this.state.collapse[id]} 
               onClose={(ev) => this.handleCloseSourceMenu(ev,id)}>
                  {/*
                  <MenuItem onClick={(ev) => this.handleCloseSourceMenu(ev,id)}>
                     <span className="void">View data in Public Digital Library</span>
                     <Link className="menu-item-source" to={"/show/"+this._menus[id].short}>View data in Public Digital Library</Link>
                  </MenuItem>
                   */}
                  { menuK[id].map(m => m.full.map( u =>  {
                     let short = shortUri(u)
                     if(this.props.config && this.props.config.chineseMirror) u = u.replace(new RegExp(cbeta), "http://cbetaonline.cn/")
                     return (
                           /* <span className="void">Open {this._menus[id].full.length > 1 ?<b>&nbsp;{short}&nbsp;</b>:"resource"} in {this._menus[id].src} website</span> */
                           <a href={u} class="menu-item-source" target="_blank">
                              <MenuItem onClick={(ev) => this.handleCloseSourceMenu(ev,id)}>
                                 {I18n.t("result.open")} {m.full.length > 1 ?<b>&nbsp;{short}&nbsp;</b>:I18n.t("result.resource")} {I18n.t("result.in")} &nbsp;<b>{m.src}</b><img src="/icons/link-out.svg"/>
                              </MenuItem>
                           </a>
                     )
                  }))}
            </Popover> 
      );

      //loggergen.log("messageD",this._menus,showMenus,messageD,message)

      const textStyle = {marginLeft:"15px",marginBottom:"10px",marginRight:"15px"}


      let facetWidgets 
      if(meta && this.state.filters.datatype && this.state.filters.datatype.length === 1 && this.state.filters.datatype.indexOf("Any") === -1 && this.props.config && this.props.dictionary) {
         facetWidgets = metaK.map((j) =>
         {
            // no need for language on instances page
            if(j === "language" && this.props.isInstance ) return
            if(j === "creator" && !meta[j]["true"]) return

            let jpre = j;
            if (this.props.config.facets[this.state.filters.datatype[0]])
               jpre = this.props.config.facets[this.state.filters.datatype[0]][j]
            if(!jpre) jpre = j
            let jlabel ;
            if(j === "century" && !this.state.filters.datatype.includes("Person")) jlabel = I18n.t("prop.tmp:associatedAuthorCentury")
            else if(facetLabel[j]) jlabel = I18n.t(facetLabel[j]);   
            else {
               jlabel = this.props.dictionary[jpre]
               if(jlabel) jlabel = jlabel["http://www.w3.org/2000/01/rdf-schema#label"]
               /*
               //if(jlabel) for(let l of jlabel) { if(l.lang == "en") jlabel = l.value }
               if(jlabel && jlabel.length) jlabel = jlabel[0].value
               else jlabel = this.pretty(jpre)
               */

               jlabel = getLangLabel(this,jpre,jlabel)
               if(!jlabel) jlabel = I18n.t("prop."+shortUri(jpre))
               else jlabel = jlabel.value
            }
            // need to fix this after info is not in ontology anymore... make tree from relation/langScript 
            if(["genres","tree","relation","langScript","versionType"].indexOf(j) !== -1) {

               //loggergen.log("widgeTree",j,jpre,meta[j],counts["datatype"],this.state.filters.datatype[0])

               return this.treeWidget(j,meta,counts,jlabel,jpre)
            }
            else
            {

               // + fix updateFacet "0 / 123" when results loaded with facet checked 
               // TODO 
               // - trigger foundFacetInfo when language preference changed (labels displayed/sorted depend on language)


               // #580 auto add facet value with count 0 when selected from url but no occurrence in data
               if(this.state.filters.facets && this.state.filters.facets[jpre]) for(let f of this.state.filters.facets[jpre]) {
                  if(meta[j] && !meta[j][f] && !meta[j][" "+f] /* case of century facet js numerical key sort hack */ ) {        
                     console.log("new:",j,f,meta,jpre,this.state.filters.facets[jpre])        
                     meta[j][f] = { dict:{}, n:0 }
                  }
               }

               let meta_sort = Object.keys(meta[j])
               //console.log("meta:",j,jpre,meta_sort,meta)

               /* // deprecated 
               .sort((a,b) => {
                  if(Number(meta[j][a].n) < Number(meta[j][b].n)) return 1
                  else if(Number(meta[j][a].n) > Number(meta[j][b].n)) return -1
                  else return 0 ;
               });
               */

               delete meta_sort[meta_sort.indexOf("Any")]
               meta_sort.unshift("Any")


               meta[j]["Any"] =  { n: counts["datatype"][this.state.filters.datatype[0]]}

               let idx_check

               let checkboxes = meta_sort.map(  (i,idx) =>  {                  

                  let label, i_nosp = i
                  if(j === "century") { 
                     i_nosp = i.replace(/^ /,"")
                     if(i === " unspecified" ) label = <span>{I18n.t("Lsidebar.widgets.unknown")}</span>
                     else label = <span>{I18n.t("misc.ord",{num:i_nosp})}</span>

                  }
                  else label = getPropLabel(this,i)

                  //loggergen.log("label",i,j,jpre,label,meta)

                  let checked = this.state.filters.facets && this.state.filters.facets[jpre]
                  if(!checked) {
                     if(label === "Any") checked = true ;
                     else checked = false ;
                  }
                  else checked = this.state.filters.facets[jpre].indexOf(i_nosp) !== -1

                  if(checked) idx_check = idx

                  //loggergen.log("checked:"+i+";",checked)

                  let isExclu = this.state.filters.exclude && this.state.filters.exclude[jpre] && this.state.filters.exclude[jpre].includes(i)

                  let cpt_i = this.subcount(j,i)
                  
                  if(i !== "Any" && i !== "unspecified" && (i !== "false" || meta_sort.length === 3)) return (
                     <div key={i} style={{width:"auto",textAlign:"left"}} className={"widget searchWidget "}>
                        <FormControlLabel
                           {... cpt_i.startsWith("0")&&!checked?{disabled:true}:{}}
                           control={
                              <Checkbox
                                 checked={checked}
                                 className="checkbox"
                                 icon={<CheckBoxOutlineBlank/>}
                                 checkedIcon={isExclu ? <Close className="excl"/>:<CheckBox  style={{color:"#d73449"}}/>}
                                 onChange={(event, checked) => this.handleCheckFacet(event,jpre,[(j==="century"?(i_nosp==="unspecified"?i_nosp:i_nosp.replace(/[^0-9]+/g,"")):i)],checked)}
                              />

                           }
                           label={<a title={shortUri(i)}><span lang={this.props.locale}>{label}&nbsp;<span class="facet-count-block">{I18n.t("punc.lpar")}<span class="facet-count" lang={this.props.locale}>{I18n.t("punc.num",{num:cpt_i+meta[j][i].n, interpolation: {escapeValue: false}})}</span>{I18n.t("punc.rpar")}</span></span></a>}
                        />
                        { !isExclu && label !== "Any" && <div class="exclude"><Close onClick={(event, checked) => this.handleCheckFacet(event,jpre,[i],true,true)} /></div> }
                     </div>
                  )
               })

               let open = this.state.collapse[j+"_widget"] || this.state.collapse[j+"_widget"] === undefined && idx_check > 11

               return (

                 this.widget(jlabel,j, 
                  <div style={{textAlign:"right"}} class={"facetWidget " + j}>
                     {checkboxes.slice(0,11)}                     
                     {checkboxes.length > 12 && 
                        [<Collapse in={open} className="facetCollapse">
                           {checkboxes.slice(11)}
                        </Collapse>
                        ,
                        <span style={{fontSize:(this.props.locale==="bo"?"14px":"10px"),cursor:"pointer", marginTop:"5px",marginRight:"25px",display:"inline-block",fontWeight:600}} onClick={(e) => this.setState({...this.state, collapse:{...this.state.collapse, [j+"_widget"]:!open}})}>
                           {(!open?I18n.t("misc.show"):I18n.t("misc.hide"))}
                        </span>]
                     }
                  </div> )
               )
            }
         })
      }

      const allSortByLists = { 
         "Topic": [ "title" ],  
         "Role": [ "closestM", "roleN" ],
         "Work": [ "popu", "closestM", "workT" ], 
         "Person": [ "popu", "closestM", "personN", "yearB" ],  
         "Place": [ "popu", "closestM", "placeN" ],  
         "WorkInstance": [ "workT", "yearP" ],  
         "Instance": [ "popu", "closestM", "title", "yearP" ],  
         "Etext": [ "closestM", "numberMC" ],  
         "Product": [ "closestM", "title" ],  
         "Scan": (!this.props.latest?["popu", "closestM", "title", "yearP"]:["lastS", "title"]) //.map(m => I18n.t("sort."+m)),
      }

      let sortByList = allSortByLists[this.state.filters.datatype[0]]


      let inEtext 
      if(this.props.searches && this.props.searches[this.state.filters.datatype[0]] && this.props.searches[this.state.filters.datatype[0]][this.props.keyword+"@"+this.props.language] && this.props.searches[this.state.filters.datatype[0]][this.props.keyword+"@"+this.props.language].inEtext) {
         inEtext = this.props.searches[this.state.filters.datatype[0]][this.props.keyword+"@"+this.props.language].inEtext
         //console.log("inEt:",inEtext)         
         if(inEtext) {
            sortByList.push("volumeN")
         }
      }




      // TODO 
      // - fix bug when removing popularity from menu --> find a better solution than s=...forced (popularity is back after another sort is selected)
      // - fix bug when search "無著" then "thogs med" validated by RETURN (lang still zh)

      /*
      
      loggergen.log(JSON.stringify(allSortByLists,null,3))

      let tmpSort
      if(this.state.filters.datatype[0] && allSortByLists[this.state.filters.datatype[0]]) tmpSort = allSortByLists[this.state.filters.datatype[0]].map(e => ""+e)

      //loggergen.log(JSON.stringify(allSortByLists,null,3),JSON.stringify(tmpSort,null,3))
         
      this._get = qs.parse(this.props.history.location.search)
      let get = this._get 
      if(sortByList && tmpSort && get.s && get.s.includes("forced"))  {

         let i = tmpSort.indexOf("Popularity")
         if(i !== -1) { 
            delete tmpSort[i]
            sortByList = [ ...tmpSort.filter(s => s) ]
         }
      }
   
      loggergen.log(JSON.stringify(allSortByLists,null,3),JSON.stringify(sortByList,null,3))
      */

      // DONE
      // + fix sortBy for instances
      // + reset sort when switching datatype
      // TODO 
      // - fix reset filters (work instance)
      // - fix BackTo when opening route to work instance results


      if(this.props.isInstance) { 
         sortByList = allSortByLists["WorkInstance"]
         //sortByList = null
      }

      let reverseSort = false
      if(this.props.sortBy && this.props.sortBy.endsWith("reverse")) reverseSort = true

      let {pathname,search} = this.props.history.location      

      this._refs["logo"] = React.createRef();

      let changeKWtimer, changeKW = (value,keyEv,ev) => {

         /* // TODO find a way to speed up rendering when changing keyword with some previous results already displayed

         if(!changeKWtimer) {
            changeKWtimer = setTimeout( () => { changeKW() }, 1000) ;
         }
         */
         if(this.props.latest&&this.state.keyword==="(latest)") value = ""

         loggergen.log("changeKW",value,keyEv,ev)
         
         let dataSource = [] 
         let language = this.state.language
         
         if(value.match(RIDregexp)) {
            dataSource = [ value+"@Find resource with this RID", value+"@Find associated resources" ]
         }
         else {

            let detec ;
            if(value) detec = narrowWithString(value, this.state.langDetect)
            if(onKhmerUrl && detec?.includes("iast")) detec = [ "pi-x-ndia", "iast" ].concat(detec.filter(d => d != "iast")) 

            let possible = [ ...this.state.langPreset, ...langSelect ]
            if(detec && detec.length < 3) { 
               if(detec[0] === "tibt") for(let p of possible) { if(p === "bo" || p.match(/-[Tt]ibt$/)) { language = p ; break ; } }
               else if(detec[0] === "hani") for(let p of possible) { if(p.match(/^zh((-[Hh])|$)/)) { language = p ; break ; } }
               else if(["ewts","iast","deva","pinyin"].indexOf(detec[0]) !== -1) for(let p of possible) { if(p.match(new RegExp(detec[0]+"$"))) { language = p ; break ; } }
            }

            possible = [ ...this.state.langPreset, ...langSelect.filter(l => !this.state.langPreset || !this.state.langPreset.includes(l))]
            loggergen.log("detec:",detec,possible) //language,possible,detec,this.state.langPreset,this.state.langDetect)
            
            if(detec) {
               dataSource = detec.reduce( (acc,d) => {                  
                  let presets = []
                  
                  if(onKhmerUrl && d === "iast") presets.push("pi-x-ndia")                  

                  if(d === "tibt") for(let p of possible) { if(p === "bo" || p.match(/-[Tt]ibt$/)) { presets.push(p); } }
                  else if(d === "hani") for(let p of possible) { if(p.match(/^zh((-[Hh])|$)/)) { presets.push(p); } }
                  else if(["ewts","iast","deva","pinyin"].indexOf(d) !== -1) for(let p of possible) { 
                     if(p.match(new RegExp(d+"$"))) { 
                        
                        // disable lower case Wylie
                        //if(p === "bo-x-ewts" && value.toLowerCase() !== value) { presets.push("bo-x-ewts_lower"); }
                        
                        presets.push(p); 
                     } 
                  }
                  else if(d === "khmr") { presets.push("km");  } 
                  
                  // #509
                  if(!onKhmerUrl && d === "iast") presets.push("pi-x-ndia")                  
                  
                  return [...acc, ...presets]
               }, [] ).concat(!value || value.match(/[a-zA-Z0-9]/)?["en"]:[]).map(p => '"'+(p==="bo-x-ewts_lower"?value.toLowerCase():value).trim()+'"@'+(p == "sa-x-iast"?"inc-x-ndia":p))
            }
         }

         if(value.match(/(^[0-9]{3,4}$)/) && Number(value) < 2100)  dataSource.unshift(value+"@find as a date")         
         if(value) dataSource.push(value.replace(/^d([0-9]+)/,"D$1")+"@find as an identifier")

         this.setState({...this.state,keyword:value, language, dataSource,blurSearch:false   } ) 
         
         /*
         if(changeKWtimer) clearTimeout(changeKWtimer)
         changeKWtimer = setTimeout(() => {
            this.setState({...this.state, dataSource: [ value, "possible suggestion","another possible suggestion"]})
            changeKWtimer = null
         }, 1000) 
         */
      }

      this._refs["searchBar"] = React.createRef();

      let facetTags 
      if(this.state.filters.facets) {

         // do not use leaf but top-level topics if possible
         const subsumed = (k, all) => {
            if(!this.props.topicParents && !this.props.genresParents) return true
            else if(this.props.topicParents && this.props.topicParents[k] && this.props.topicParents[k].some(t => all.includes(t))) return true
            else if(this.props.genresParents && this.props.genresParents[k] && this.props.genresParents[k].some(t => all.includes(t))) return true
            return false
         }

         const taxWithSubClasses = (f,k) => {
            let ret = [ k ]
            let meta = this.props.searches[this.state.filters.datatype[0]][this.props.keyword+"@"+this.props.language]
            if(meta) meta = meta.metadata
            let node, queue = [ k ]
            if(meta) {
               do {        
                  let q = queue.shift()
                  if(f === bdo+"workIsAbout" && meta.tree && meta.tree["@graph"]) node =  meta.tree["@graph"].filter(n => n["@id"] === q)
                  else if(f === bdo+"workGenre" && meta.genres && meta.genres["@graph"]) node =  meta.genres["@graph"].filter(n => n["@id"] === q);
                  if(node) node.map(n => {
                     if(n.taxHasSubClass) n.taxHasSubClass.map(t => {
                        ret.push(t)   
                        queue = queue.concat(n.taxHasSubClass)
                     })
                  })
               } while(queue.length)
            }
            return ret
         }

         facetTags  = Object.keys(this.state.filters.facets).map(f => {
            let vals = this.state.filters.facets[f]
            if(vals.val) { 
               vals = vals.val
            }
            return vals.filter(k => k !== "Any" && (![bdo+"workIsAbout", bdo+"workGenre"].includes(f) || !subsumed(k,vals))).map(v => 
               this.renderFilterTag(false, f, v, (event, checked) => this.handleCheckFacet(event, f, taxWithSubClasses(f,v), false) ) 
            ) }
         )
      }


      let syncSlide = (e) => {
         this.setState({syncsSlided:!this.state.syncsSlided})
      }
      
       //           let nbResu = this.state.paginate && this.state.paginate.nMax ? this.state.paginate.nMax:(this.state.results&&this.state.results[this.state.id]?this.state.results[this.state.id].resLength:"--")
      
      if(this.state.filters.datatype.includes("Instance") && this.state.results&&this.state.results[this.state.id] && nbResu != this.state.results[this.state.id].resLength && message.length > 2 && message[1].type === "div" 
         && this.state.filters.facets && this.state.filters.facets[tmp+"assetAvailability"] && this.state.filters.facets[tmp+"assetAvailability"].includes(tmp+"possibleAccess"))  {
         let txt = I18n.t("types."+this.state.filters.datatype[0].toLowerCase(),{count:2}).toLowerCase(); 
         let moreres = <Typography className="no-result more-result">{I18n.t("result.moreres",{txt})} {this.renderResetF()}</Typography>
         let head = message.shift()
         message.unshift(moreres)
         message.unshift(head)
      }
      let reverse, by, sortByPopup ;
      if(sortByList) sortByPopup = sortByList.map((t,n) => {
         let i = I18n.t("sort."+t,{lng:"en"}), label = I18n.t("sort."+t), check = (this.props.sortBy && this.props.sortBy.startsWith(i.toLowerCase()) ) || (!this.props.sortBy && n === 0)
         if(check) by = label
         if(reverseSort) reverse = I18n.t("sort.reverseS")
         return(<div key={i} style={{width:"200px",textAlign:"left"}} className="searchWidget">
            <FormControlLabel
               control={
                  <Checkbox
                     checked={check}
                     className="checkbox"
                     icon={<PanoramaFishEye/>}
                     checkedIcon={<CheckCircle  style={{color:"#d73449"}}/>}
                     onChange={(event, checked) => this.updateSortBy(event, checked, i) }
                  />

               }
               label={<span lang={this.props.locale}>{label}</span>}
            /></div>) } ).concat([
               <div key={99} style={{width:"auto",textAlign:"left",marginTop:"5px",paddingTop:"5px"}} className="searchWidget">
               <FormControlLabel
                  control={
                     <Checkbox
                        checked={reverseSort}
                        className="checkbox"
                        icon={<CheckBoxOutlineBlank/>}
                        checkedIcon={<CheckBox  style={{color:"#d73449"}}/>}
                        onChange={(event, checked) => this.reverseSortBy(event, checked) }
                     />

                  }
                  label={<span lang={this.props.locale}>{I18n.t("sort.reverse")}</span>}
               /></div>
      ] )


      let hasMatchPopup, hasMatchFacet = this.props.config?.facets[this.state.filters.datatype[0]]?.hasMatch, hasMatchTitle
      if(metaK.includes("hasMatch")) { 
         
         hasMatchPopup = [<div key={0} style={{width:"200px",textAlign:"left"}} className="searchWidget">
            <FormControlLabel
               control={
                  <Checkbox
                     checked={(!this.state.filters.facets || !this.state.filters.facets[tmp+"hasMatch"])}
                     className="checkbox"
                     icon={<PanoramaFishEye/>}
                     checkedIcon={<CheckCircle  style={{color:"#d73449"}}/>}
                     onChange={(event, checked) => { 
                        this.handleCheckFacet(event, hasMatchFacet, Object.keys(meta["hasMatch"]), false) 
                        this.setState({ collapse: { ...this.state.collapse, hasMatchPopup: false }})
                     }}
                  />

               }
               label={<span lang={this.props.locale}>{I18n.t("sort.exact")}</span>}
            />
            </div> ]



         if(!this.state.filters.facets || !this.state.filters.facets[tmp+"hasMatch"]) hasMatchTitle = I18n.t("sort.exact")
         else {
            if(this.state.filters.facets) {
               if(this.state.filters.facets[tmp+"hasMatch"].includes(tmp+"isExactMatch")) {
                  if(this.state.filters.facets[tmp+"hasMatch"].includes(tmp+"hasExactMatch")) {
                     hasMatchTitle = I18n.t("sort.exactMF")
                  } else hasMatchTitle = I18n.t("sort.exactF")
               } else hasMatchTitle = I18n.t("sort.exactM")
            }
         }

         const matchK = Object.keys(meta["hasMatch"]).filter(p => p.startsWith(tmp)),
            allMatch = matchK.length > 1 && !matchK.some(t => !this.state.filters.facets || !this.state.filters.facets[tmp+"hasMatch"]?.includes(t))

         hasMatchPopup = hasMatchPopup.concat(matchK.map((t,n) => {         
            return(<div key={n} style={{width:"200px",textAlign:"left"}} className="searchWidget">
               <FormControlLabel
                  control={
                     <Checkbox
                        checked={!allMatch && this.state.filters.facets && this.state.filters.facets[tmp+"hasMatch"]?.includes(t)}
                        className="checkbox"
                        icon={<PanoramaFishEye/>}
                        checkedIcon={<CheckCircle  style={{color:"#d73449"}}/>}
                        onChange={(event, checked) => { 
                           if(checked) this.handleCheckFacet(event, hasMatchFacet, [ t ], checked, false, true)
                           this.setState({ collapse: { ...this.state.collapse, hasMatchPopup: false }})
                        }}
                     />

                  }
                  label={<span lang={this.props.locale}>{I18n.t("sort.exact"+(t.endsWith("hasExactMatch")?"M":"F"))}</span>}
               />
            </div> )
         }))       

         if(matchK.length > 1) {

            hasMatchPopup.push(         
               <div key={99} style={{width:"200px",textAlign:"left"}} className="searchWidget">
                  <FormControlLabel
                     control={
                        <Checkbox
                           checked={allMatch}
                           className="checkbox"
                           icon={<PanoramaFishEye/>}
                           checkedIcon={<CheckCircle  style={{color:"#d73449"}}/>}
                           onChange={(event, checked) => { 
                              if(checked) this.handleCheckFacet(event, hasMatchFacet, matchK, checked)
                              this.setState({ collapse: { ...this.state.collapse, hasMatchPopup: false }})
                           }}
                        />

                     }
                     label={<span lang={this.props.locale}>{I18n.t("sort.exactMF")}</span>}
                  />
               </div> 
            )            
         }                           
      }


      let infoPanelH, infoPanelR
      if(this.props.config && this.props.config.msg) {
         if(message.length == 0 && !this.props.loading && !this.props.keyword) infoPanelH = this.props.config.msg.filter(m => m.display && m.display.includes("home"))
         else infoPanelR = this.props.config.msg.filter(m => m.display && m.display.includes("search"))
         
         let rend = (infoPanel) => <div class="infoPanel">{ infoPanel.map(m => {
            let lab = getLangLabel(this,"",m.text)
            let icon 
            
            if(m.severity=="info") icon = <InfoIcon className="info"/>
            else if(m.severity=="warning") icon = <WarnIcon className="warn"/>
            else if(m.severity=="error") icon = <ErrorIconC className="error"/>

            if(lab) {
               let link ;
               let content = lab.value
               if(link = lab.value.match(/\[([^\]]+)\]\(([^)]+)\)(.*?$)/)) {
                  content = lab.value.split(/\[[^\]]+\]\([^)]+\)/)
                  content = [ content[0], <a href={link[2]} target="_blank">{link[1]}</a>, link[3] ]
               } 
               return <p>{icon}{content}</p>
            }
         }) }</div>

         if(infoPanelH && infoPanelH.length) infoPanelH = rend(infoPanelH)
         if(infoPanelR && infoPanelR.length) infoPanelR = rend(infoPanelR)
      }



      this._refs["header"] = React.createRef()
      this._refs["container"] = React.createRef()
      this._refs["filters-UI"] = React.createRef()
      this._refs["filters-UI-scrollable"] = React.createRef();


      let tags = <>
         { /* this.props.language && this.state.filters.datatype.filter(k => k !== "Any").map(k => this.renderFilterTag(true, I18n.t("Lsidebar.tags.type"), I18n.t("types."+k.toLowerCase()), (event, checked) => this.handleCheck(event, k, false) ) ) */ }                              
         { this.props.isInstance && this.state.backToWorks && this.state.filters.instance && this.renderFilterTag(false, I18n.t("Lsidebar.tags.instanceOf"), this.state.filters.instance, (event, checked) => {
            this.resetFilters(event)
         } )  } 
         { inEtext && this.renderFilterTag(false, I18n.t("Lsidebar.widgets.root"), fullUri(inEtext), (event, checked) => {
            this.resetFilters(event)
         } )  } 
         { facetTags }
         { (this.state.filters.facets || this.state.backToWorks )&& this.renderResetF() }
      </>
      if(tags && tags.props?.children?.length && !tags.props?.children?.some(e=>e)) tags = null


      //console.log("tags:",tags,message)

      const requestSearchOnClick = (tab,i) => {

         loggergen.log("CLICK:",i,tab[0],tab[1]);
         let kw = tab[0]
         let isRID = !languages[tab[1]], isDateOrId
         if(isRID) {
            if(!kw.includes(":")) {
               if(!tab[1].match(/date|identifier/)) kw = "bdr:"+kw.toUpperCase()
               else isRID = "IDorDate"
            }
            else {
               kw = kw.split(":")
               kw = kw[0].toLowerCase()+":"+kw[1].toUpperCase()
               if(tab[1].endsWith("identifier")) isRID = "IDorDate"
            }
         } 

         console.log("rs??2")
         if(this.state.keyword) this.requestSearch(kw,null,tab[1], isRID && i === 1, (isRID == "IDorDate"?tab[1].replace(/^.*(date|identifier).*$/,"$1"):null), i)
         this.setState({...this.state,langIndex:i,dataSource:[]});
         
      }


      const ret = (
<div className={(this.props.simple?"simpleSearch":"")}>
   {getGDPRconsent(this)}
   {/* <Link to="/about">About</Link> */}

         {/* // embed UniversalViewer
            <div
            className="uv"
            data-locale="en-GB:English (GB),cy-GB:Cymraeg"
            data-config="/config.json"
            data-uri="https://eap.bl.uk/archive-file/EAP676-12-4/manifest"
            data-collectionindex="0"
            data-manifestindex="0"
            data-sequenceindex="0"
            data-canvasindex="0"
            data-zoom="-1.0064,0,3.0128,1.3791"
            data-rotation="0"
            style={{width:"100%",height:"calc(100vh)",backgroundColor: "#000"}}/> */}

          { top_right_menu(this) }

         <div className={"App "+(message.length == 0 && !this.props.loading && !this.props.keyword ? "home":"") + (this.props.config.khmerServer?" khmerServer":"")} style={{display:"flex"}}>
            <div className={"SearchPane"+(this.props.keyword ?" resultPage":"") }  ref={this._refs["logo"]}>            
            { showMenus }
               { !this.props.config.khmerServer && 
                  <div class="fond-logo">
                     <a id="logo" target="_blank" old-href="https://www.tbrc.org/">
                        {/* <img src="/logo.svg" style={{width:"200px"}} /> */}
                        <img src="/pichome.jpg" />
                        <div>
                           <div>
                              {/* { I18n.t("home.BUDA") } */}
                              {/* <h1>{ I18n.t("home.titleBDRC1") }<br/>{ I18n.t("home.titleBDRC2") }<br/>{ I18n.t("home.titleBDRC3") }</h1> */}
                              <h1 lang={this.props.locale}>{ I18n.t("home.archives1") }{this.props.locale==="en" && <br/>}{ I18n.t("home.archives2") }</h1>
                              <div>{ I18n.t("home.by") }</div>
                              <span>{ I18n.t("home.subtitle") }</span>
                           </div>
                        </div>
                     </a>
                  </div>
               }
               { this.props.config.khmerServer &&  !this.props.loading && !this.props.keyword && 
                  <div class="fond-logo">
                     <a id="logo" target="_blank" old-href="https://www.tbrc.org/">
                        {/* <img src="/logo.svg" style={{width:"200px"}} /> */}
                        <img src="/pichome_khmer.jpg" />
                        <div>
                           <div>
                              {/* { I18n.t("home.BUDA") } */}
                              {/* <h1>{ I18n.t("home.titleBDRC1") }<br/>{ I18n.t("home.titleBDRC2") }<br/>{ I18n.t("home.titleBDRC3") }</h1> */}
                              <h1 lang={this.props.locale}><Trans i18nKey="home.khmer.title" components={{ newline: <br /> }} /></h1>
                              <p>{ I18n.t("home.khmer.subtitle") }<br/><span class="link" onClick={() => {
                                 document.querySelector("#learn").scrollIntoView({block: "start", inline: "nearest", behavior:"smooth"})
                              }}>{ I18n.t("home.khmer.anchor") }</span></p>
                           </div>
                        </div>
                     </a>
                     <div class="abs"><ExpandMore onClick={() => {
                        document.querySelector("#learn").scrollIntoView({block: "start", inline: "nearest", behavior:"smooth"})
                     }}/></div>
                  </div>
               }
               { infoPanelH }
               {/* <h2>BUDA Platform</h2> */}
               {/* <h3>Buddhist Digital Resource Center</h3> */}
               { (this.props.language && this.props.language != "-" || !this.props.keyword && !this.props.loading) && 
               <div id="search-bar">
               { this.props.config.khmerServer && !this.props.keyword &&  !this.props.loading && 
                  <span class="links">
                     <span><Link to="/guidedsearch">{I18n.t("topbar.guided")}</Link></span>
                     <span><Link to="/browse">{I18n.t("topbar.browse")}</Link></span>
                  </span>
               }
               {/* <IconButton style={{marginRight:"15px"}} className={this.state.leftPane?"hidden":""} onClick={e => this.setState({...this.state,leftPane:!this.state.leftPane,closeLeftPane:!this.state.closeLeftPane})}>                  
                  <FontAwesomeIcon style={{fontSize:"21px"}} icon={faSlidersH} title="Refine Your Search"/>
               </IconButton> */}
               <div ref={this._refs["searchBar"]} style={{display:"inline-block",position:"relative"}}>
                  <SearchBar                  
                     placeholder={I18n.t("home.search")}                        
                     closeIcon={<Close className="searchClose" style={ {color:"rgba(0,0,0,1.0)",opacity:1} } onClick={() => { this.props.history.push({pathname:"/",search:""}); this.props.onResetSearch();} }/>}
                     disabled={this.props.hostFailure}
                     onClick={(ev) => { changeKW(this.state.keyword?lucenequerytokeyword(this.state.keyword):""); $("#search-bar input[type=text][placeholder]").attr("placeholder",I18n.t("home.start"));  } }
                     onBlur={(ev) => { loggergen.log("BLUR"); setTimeout(() => this.setState({...this.state,dataSource:[],blurSearch:true}),100); $("#search-bar input[type=text][placeholder]").attr("placeholder", I18n.t("home.search"));  } }
                     onChange={(value:string) => changeKW(value)}
                     onKeyDown={(ev) => { 
                        //console.log("kd:",ev)
                        let idx = this.state.langIndex, max = this.state.dataSource.length
                        if(!idx) idx = 0
                        if (ev.key === 'ArrowUp') idx -- ;
                        else if (ev.key === 'ArrowDown') idx ++ ;
                        if(idx != this.state.langIndex) {
                           if(idx >= max) idx = 0
                           else if(idx < 0) idx = max - 1
                           this.setState({langIndex:idx})
                        }
                     }}
                     onRequestSearch={ () => {
                        if(!this.state.dataSource?.length) return
                        let i = 0
                        if(this.state.langIndex) i = this.state.langIndex
                        let v = this.state.dataSource[i]
                        let tab = v.split("@")
                        requestSearchOnClick(tab,i)
                     }}
                     value={this.props.latest&&this.state.keyword==="(latest)"?"":(this.props.hostFailure?"Endpoint error: "+this.props.hostFailure+" ("+this.getEndpoint()+")":this.state.keyword !== undefined && this.state.keyword!==this.state.newKW?this.state.keyword:this.props.keyword&&this.state.newKW?lucenequerytokeyword(this.state.newKW):"")}
                     style={{
                        marginTop: '0px',
                        width: (this.props.config.khmerServer&&!this.props.keyword?"400px":"700px"),
                        height:"60px",
                        boxShadow: "0 2px 4px rgba(187, 187, 187, 0.5)"
                     }}
                  />
                  {
                     (/* this.state.keyword && this.state.keyword.length > 0 && */ this.state.dataSource.length > 0) &&                     
                        <Paper
                           //onKeyDown={(e) => changeKW(this.state.keyword,e)} 
                           // this.setState({...this.state,dataSource:[]})}
                           //open={this.state.dataSource.length} 
                           id="suggestions" 
                           //anchorOrigin={{vertical:"bottom",horizontal:"left"}}
                           //anchorEl={() => this._refs["searchBar"].current} 
                           //onClose={()=>this.setState({...this.state,dataSource:[]})}
                           >
                              { this.state.dataSource.map( (v,i) =>  {
                                 let tab = v.split("@")
                                 //loggergen.log("suggest?",v,i,tab)

                                 if(this.state.langIndex === undefined && this.props.language && tab.length > 1 && tab[1] === this.props.language) {
                                    this.setState({langIndex:i})
                                 }

                                 return (
                                    <MenuItem key={v} style={{lineHeight:"1em"}} onMouseDown={(e) => e.preventDefault()} 
                                    className={(!this.state.langIndex && i===0 || this.state.langIndex === i || this.state.langIndex >= this.state.dataSource.length && i === 0?"active":"")} 
                                    onClick={(e)=> requestSearchOnClick(tab,i) } ><span class="maxW">{ tab.length == 1 ?"":tab[0].replace(/["]/g,"")}</span> <SearchIcon style={{padding:"0 10px"}}/><span class="lang">{tab.length == 1 ? I18n.t("home."+tab[0]):(I18n.t(""+(searchLangSelec[tab[1]]?searchLangSelec[tab[1]]:(languages[tab[1]]?languages[tab[1]]:tab[1])))) }</span></MenuItem> ) 
                                    })
                              }
                        </Paper>
                  }
               </div> 
               {/* work in progress
               <TextField
                  className="formControl"
                  id="lang"
                  label={<Translate value="lang.lg"/>}
                  //className={classes.textField}
                  value={I18n.t(languages[this.state.language])}
                  //onChange={this.handleChange('name')}
                  margin="normal"
               /> */}

              { (!this.props.config.khmerServer || this.props.keyword) && <FormControl className={"formControl "+this.state.searchTypes[0].toLowerCase()} style={{textAlign:"right"}}>
                {/* <InputLabel htmlFor="datatype">In</InputLabel> */}

                <Select
                  value={this.state.searchTypes[0]==="Scan"?"Instance":this.state.searchTypes[0]}
                  //onChange={this.handleLanguage} 
                  onChange={this.handleSearchTypes}
                  open={this.state.langOpen}
                  onOpen={(e) => { loggergen.log("open"); this.setState({...this.state,langOpen:true}) } }
                  onClose={(e) => this.setState({...this.state,langOpen:false})}
                  inputProps={{
                    name: 'datatype',
                    id: 'datatype',
                  }}
                >
                  {searchTypes.map(d => (
                     <MenuItem key={d} value={d}>
                        <span lang={this.props.locale} class="menu-dataT">
                           <span class="icone" style={{backgroundImage:"url('/icons/home/"+d.toLowerCase()+".svg')"}}></span>
                           {I18n.t("types.searchIn",{type:I18n.t("types."+d.toLowerCase(),{count:2}).toLowerCase()}) /* cannot use format in nested translation ( https://github.com/i18next/i18next/issues/1377) */ }
                        </span>
                     </MenuItem>))}
               </Select>
              </FormControl> }


            {/*  //deprecated
              <FormControl className="formControl" style={{textAlign:"left"}}>
                <InputLabel htmlFor="language"><Translate value="lang.lg"/></InputLabel>

                <Select
                  value={this.getLanguage()}
                  onChange={this.handleLanguage}
                  open={this.state.langOpen}
                  onOpen={(e) => { loggergen.log("open"); this.setState({...this.state,langOpen:true}) } }
                  onClose={this.handleLanguage} //(e) => this.setState({...this.state,langOpen:false})}
                  inputProps={{
                    name: 'language',
                    id: 'language',
                  }}
                >
                   { this.state.langPreset && this.state.langPreset.map((k) => (<MenuItem key={k} value={k}><Translate value={""+(searchLangSelec[k]?searchLangSelec[k]:languages[k])}/></MenuItem>))}
                   { this.state.langPreset && <hr style={{width:"90%"}}/> }
                   { langSelect.filter(e => !this.state.langPreset || this.state.langPreset.indexOf(e) === -1).map((k) => (<MenuItem key={k} value={k}><Translate value={""+(searchLangSelec[k]?searchLangSelec[k]:languages[k])}/></MenuItem>))}
                   {this.state.customLang &&  this.state.customLang.map(e => (
                      <MenuItem key="customLang_" value={e}>{e}</MenuItem>
                     ))
                   }
                   <MenuItem key="customLang" >
                      <TextField label="Other" name="language" onKeyPress={this.handleLanguage}
                        inputRef={(str) => { this._customLang = str;}} />
                   </MenuItem>
               </Select>
              </FormControl>  */}

               { /* // proof of concept
                  this.state.language == "other" && <TextField
                  style={{marginBottom:"-32px"}}
                  //label=""
                  value={ this.state.customLang }
                  id="other-lang"
                  type="text"
                  inputRef={(str) => { this._customLang = str }}
                  onKeyPress={(e) => this.handleCustomLanguage(e)}
               /> */ }
               </div> }
              { ( this.state.filters.facets || this.state.filters.datatype.indexOf("Any") === -1 )&& 
                        [ /*<Typography style={{fontSize:"23px",marginBottom:"20px",textAlign:"center"}}>
                           <Translate value="Lsidebar.activeF.title" />
                           <a title={I18n.t("Lsidebar.activeF.reset")} id="clear-filters" onClick={this.resetFilters.bind(this)}><RefreshIcon /></a>
                        </Typography>
                           ,*/
                           <div id="filters-UI">
                              <div>
                                 { tags && <SimpleBar ref={this._refs["filters-UI"]}  scrollableNodeProps={{ ref: this._refs["filters-UI-scrollable"] }}>
                                    <div>{tags}</div>
                                 </SimpleBar> }
                              </div>
                           </div>
                        ]
                  }
           <div id="data-checkbox">
            <FormGroup row>
               { 
                  // this.state.searchTypes.indexOf("Any") === -1 &&
                   searchTypes.map(d => 
                     <FormControlLabel className="data-checkbox" control={
                        <Checkbox onChange={(event, checked) => this.handleSearchTypes(event,d,checked)} 
                           checked={ this.state.searchTypes.indexOf("Any") !== -1 || this.state.searchTypes.indexOf(d) !== -1} 
                           color="black" icon={<CheckBoxOutlineBlank/>} checkedIcon={<CheckBox/>} /> 
                     } label={d} /> ) 
               }
               { /*
                  this.state.searchTypes.indexOf("Any") !== -1 &&
                     <FormControlLabel className="data-checkbox" control={
                        <Checkbox onChange={(event, checked) => this.handleSearchTypes(event,"Any",checked)} checked={ true } 
                           color="black" icon={<CheckBoxOutlineBlank/>} checkedIcon={<CheckBox/>} /> 
                     } label={"All Data Types"} />  
               */ }
            </FormGroup>
           </div>
           { this.props.config.khmerServer && !this.props.keyword && !this.props.loading &&
            <>
               <section id="learn">
                  <div>
                     <h2>{I18n.t("home.khmer.section1.title")}</h2>
                     <div class="float"><img src="/khmerhome-pic.jpg"/><p><Trans i18nKey="home.khmer.section1.caption" components={{lk:<Link className="khmer-link" />}}/></p></div>
                     <Trans i18nKey="home.khmer.section1.text" components={{ newline: <br />, parag: <p />, note: <span className="note" />, lk:<a class="khmer-link" />, nbsp:<span style={{whiteSpace:"nowrap"}} />}} />
                     <div style={{visibility:"hidden"}}>
                        <span className="noteText"><Trans i18nKey="home.khmer.section1.noteA" components={{ note: <span className="note" />}} /></span>
                        <span className="noteText"><Trans i18nKey="home.khmer.section1.noteB" components={{ note: <span className="note" />}} /></span>
                     </div>
                     <div class="abs">
                        <div><Link to="/static/aboutkm">{I18n.t("topbar.about")}</Link></div>
                     </div>
                  </div>
               </section>
               <section class="white-bg">
                  <div>
                     <h2>{I18n.t("home.khmer.section2.title")}</h2>
                     <Trans i18nKey="home.khmer.section2.text" components={{ newline: <br />, parag: <p />, note: <span className="note" />,nbsp:<span style={{whiteSpace:"nowrap"}} />}} />
                  </div>
               </section>
               <section class="white-bg">
                  <div>
                     <div class="abs">
                        <div><Link to="/static/resources">{I18n.t("topbar.resources")}</Link></div>
                     </div>
                  </div>
                  <div class="imgs">
                     <a href="https://www.akhmerbuddhistfoundation.org/" target="_blank"><img src="/scripts/static/images/AKBF.jpg"/></a>
                     <a href="https://www.efeo.fr/" target="_blank"><img src="/scripts/static/images/EFEO.jpg"/></a>
                  </div>
               </section>
            </>
           }
           { infoPanelR }
           {  (message.length > 0 || message.length == 0 && !this.props.loading ) && <div id="res-header" ref={this._refs["header"]}>
               <div>
                  <div id="settings" onClick={() => this.setState({collapse:{...this.state.collapse, settings:!this.state.collapse.settings}})}><img src="/icons/settings.svg"/></div>
                  {  // DONE change to popover style open/close
                     sortByList && this.popwidget(I18n.t("Lsidebar.sortBy.title",{by,reverse}),"sortBy",sortByPopup, <ImportExport className="header-icon"/> ) 
                  }
                  { this.state.filters.datatype.includes("Place") && this.props.simple && <div class="widget-header placeMap" style={{marginRight:"auto"}} onClick={
                        () => this.setState({ repage:true, collapse:{...this.state.collapse, placeMap:!this.state.collapse.placeMap}})
                     }>
                     <Visibility style={{verticalAlign:"-4px",marginRight:"8px"}}/>
                     <p class="widget-title" >{I18n.t("search.toggleM")}</p>
                  </div> }
                  { this.state.filters.datatype.includes("Etext") && <div class="widget-header etextBestM" /*style={{marginRight:!metaK.includes("hasMatch")?"auto":0}}*/ onClick={
                           () => this.setState({repage:true, collapse:{...this.state.collapse,"etextOtherM":!this.state.collapse.etextOtherM}})
                     }>{ this.state.collapse.etextOtherM 
                        ? <VisibilityOff style={{verticalAlign:"-4px",marginRight:"8px"}}/>
                        : <Visibility style={{verticalAlign:"-4px",marginRight:"8px"}}/> }
                        <p class="widget-title" >
                           { this.state.collapse.etextOtherM 
                              ? I18n.t("sort.hideAll")
                              : I18n.t("sort.showAll") }
                        </p>
                     </div>}
                  { metaK.includes("hasMatch") &&  this.popwidget(hasMatchTitle,"hasMatchPopup", hasMatchPopup,  <img src="/icons/exact.png" width="20px" style={{marginRight:"8px"}} /> )  }
                  <div id="pagine" lang={this.props.locale}>
                     <div>
                           { pageLinks && <span>{I18n.t("search.page")} { pageLinks }</span>}
                           <span id="nb">{I18n.t("search.result",{count:nbResu})}</span>
                     </div>
                  </div>
               </div>
            </div>
           }
            
           {/* <span>{ ""+this.props.loading }</span> */}

            {/* // #734 proof of concept
            
            <Link to={"/show/bdr:W12827#open-viewer"} onClick={(ev) => {             
               window.top.postMessage(JSON.stringify({"open-viewer":{"rid":"W12827"}}),"*")               
               ev.preventDefault()
               ev.stopPropagation()
              return false;
            }}>open W12827 from iframe parent</Link><br/><br/><br/><br/> */}

           <div id="res-container" >
           { (!this.props.simple && (this.props.loading || this.props.keyword && (!this.props.datatypes || !this.props.datatypes.hash))) && <Loader className="fixloader"/> }
           {  (message.length > 0 || message.length == 0 && !this.props.loading) && this.render_filters(types,counts,sortByList,reverseSort,facetWidgets) }
               { /*false && this.state.keyword.length > 0 && this.state.dataSource.length > 0 &&
                  <div style={{
                     maxWidth: "700px",
                     margin: '0 auto',
                     zIndex:10,
                     position:"relative"
                  }}>
                     <Paper
                        style={{
                           width: "700px",
                           position: "absolute"
                        }}
                     >
                        <List>
                           { this.state.dataSource.map( (v) =>  <MenuItem key={v} style={{lineHeight:"1em"}} onClick={(e)=>this.setState({keyword:v,dataSource:[]})}>{v}</MenuItem> ) }
                        </List>
                     </Paper>
                  </div> */
               }
               { (this.props.simple && !this.props.keyword || (this.props.keyword && (this.props.loading || (this.props.datatypes && !this.props.datatypes.hash)))) && <Loader className="mainloader" /> }
               { message.length == 0 && !this.props.loading && !this.props.keyword && (!this.props.datatypes || this.props.keyword === null) &&
                  !this.props.config.khmerServer && 
                     <List id="samples">
                        {/* { messageD } */}
                        <h3>{ I18n.t("home.message") }</h3>
                        <h4>{ I18n.t("home.submessage") }</h4>
                        { ((!this.props.config || !this.props.config.chineseMirror) && !this.props.auth?.isAuthenticated()) && <h4 class="subsubtitleFront">
                           { I18n.t("home.subsubmessage_account1")}
                           {this.props.locale==="bo"?<span> </span>:""}
                           <span class="uri-link" onClick={() => this.props.auth.login(this.props.history.location,true)} >{I18n.t("home.subsubmessage_account4")}</span>
                           { I18n.t("home.subsubmessage_account2")}
                           <span class="uri-link" style={{textTransform:"capitalize"}} onClick={() => this.props.auth.login(this.props.history.location,true)} >{I18n.t("home.subsubmessage_account5")}</span>
                           { I18n.t("home.subsubmessage_account3")}</h4> }
                        <h4 class="subsubtitleFront feedB">{ I18n.t("home.subsubmessage") }<a title="email us" href="mailto:help@bdrc.io" lang={this.props.locale}>help@bdrc.io</a>{ I18n.t("home.subsubmessage_afteremail") }</h4>
                        <h4 class="subsubtitleFront"><Trans i18nKey="home.help" components={{bold:<b/>, lk:<a class='uri-link' target='_blank' />}}/></h4>
                     </List> }
               { /* (this.props.datatypes && this.props.datatypes.hash && this.props.datatypes.metadata[bdo+this.state.filters.datatype[0]] && message.length === 0 && !this.props.loading) && 
                  <List id="results">
                     <h3 style={{marginLeft:"21px"}}>No result found.</h3>             
                  </List>     */
                }
               { message.length > 0 &&
                  <List key={2} id="results">
                     { this.props.isInstance && this.state.backToWorks && <a className="uri-link"  onClick={(event) => {
                           this.resetFilters(event)
                        }}><img src="/icons/back.png"/><span>{I18n.t("search.backToW")}</span></a> }
                     { message }
                     { pageLinks && <div id="pagine">
                        <NavigateBefore
                           title="Previous page"
                           className={!paginate || paginate.index == 0 ? "hide":""}
                           onClick={this.prevPage.bind(this,id)}/>
                        <div style={{width:"60%"}}>
                              { pageLinks }
                        </div>
                        <NavigateNext
                           title="Next page"
                           className={!paginate || paginate.index == paginate.pages.length - 1 || nbResu < paginate.pages[paginate.index+1]? "hide":""}
                           onClick={this.nextPage.bind(this,id)} />
                     </div> }
                  </List>
               }
               </div>
               { !this.props.config.khmerServer && message.length == 0 && !this.props.loading && !this.props.keyword && (!this.props.config || !this.props.config.chineseMirror) && this.props.latestSyncsNb > 0 &&
                  <div id="latest">
                     <h3>{I18n.t("home.new")}</h3>
                     <Link class="seeAll" to="/latest" onClick={()=>this.setState({filters:{...this.state.filters,datatype:["Scan"]}})}>{I18n.t("misc.seeAnum",{count:this.props.latestSyncsNb})}</Link>
                     <div 
                        onTouchStart={ev => {this.tx0 = ev.targetTouches[0].clientX; this.ty0 = ev.targetTouches[0].clientY; }} 
                        onTouchMove={ev => {this.tx1 = ev.targetTouches[0].clientX; this.ty1 = ev.targetTouches[0].clientY; }} 
                        onTouchEnd={ev => {if(Math.abs(this.ty0 - this.ty1) < Math.abs(this.tx0 - this.tx1) && Math.abs(this.tx0 - this.tx1) > 75) { syncSlide(); } }}
                     >
                        { this.props.latestSyncs === true && <Loader loaded={false}/> }
                        { (this.props.latestSyncs && this.props.latestSyncs !== true) &&
                           <div class={"slide-bg "+(this.state.syncsSlided?"slided":"")} >
                              { Object.keys(this.props.latestSyncs).map(s => {
                                 //console.log("s:",s);
                                 let label = getLangLabel(this,"",this.props.latestSyncs[s][skos+"prefLabel"])
                                 let uri = "/show/"+shortUri(s), value = I18n.t("resource.noT"), lang = this.props.locale
                                 if(label && label.value != "") {
                                    lang = label.lang;
                                    value = label.value;
                                 }
                                 // DONE use thumbnail when available
                                 let thumb = this.props.latestSyncs[s][tmp+"thumbnailIIIFService"]
                                 if(!thumb || !thumb.length) thumb = this.props.latestSyncs[s][tmp+"thumbnailIIIFSelected"]
                                 if(thumb && thumb.length) thumb = thumb[0].value 
                                 //console.log("thumb",thumb)
                                 return (
                                    <div>
                                       <Link to={uri}><div class={"header "+(thumb?"thumb":"")} {...thumb?{style:{"backgroundImage":"url("+ thumb+"/full/"+(thumb.includes(".bdrc.io/")?"!2000,195":",195")+"/0/default.jpg)"}}:{}}></div></Link>
                                       <p lang={lang}>{value}</p>
                                       <Link to={uri}>{I18n.t("misc.readM")}</Link>
                                    </div>
                                 )
                              })}
                           </div>
                        }
                     </div>
                     { (this.props.latestSyncs && this.props.latestSyncs !== true && this.props.latestSyncsNb > 5) && 
                        <div id="syncs-nav" >
                           <span class={this.state.syncsSlided?"on":""} onClick={syncSlide}><img src="/icons/g.svg"/></span>
                           <span class={this.state.syncsSlided||this.props.latestSyncsNb<=5?"":"on"} onClick={syncSlide}><img src="/icons/d.svg"/></span>
                        </div>
                     }
                  </div>
               }
            </div>
            {/* <LanguageSidePaneContainer /> */}
         </div>
         { message.length == 0 && !this.props.loading && !this.props.keyword && (!this.props.config || !this.props.config.chineseMirror) && <Footer locale={this.props.locale} hasSyncs={this.props.config.khmerServer || this.props.latestSyncsNb > 0}/> }
      </div>
      );

      subtime("render")

      return ret 
   }
}

export default withStyles(styles)(App);
