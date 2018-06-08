// @flow

import _ from "lodash";
import Tooltip from 'material-ui/Tooltip';
import React, { Component } from 'react';
import SearchBar from 'material-ui-search-bar'
import Paper from 'material-ui/Paper';
import {MenuItem} from 'material-ui/Menu';
import Button from 'material-ui/Button';
import List,{ListItemText,ListItem,ListItemIcon} from 'material-ui/List';
import Typography from 'material-ui/Typography';
import Loader from 'react-loader';
import Collapse from 'material-ui/transitions/Collapse';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import NavigateBefore from 'material-ui-icons/NavigateBefore';
import NavigateNext from 'material-ui-icons/NavigateNext';
import CheckCircle from 'material-ui-icons/CheckCircle';
import CropFreeIcon from 'material-ui-icons/CropFree';
import CropDin from 'material-ui-icons/CropDin';
import CenterFocusWeak from 'material-ui-icons/CenterFocusWeak';
import CenterFocusStrong from 'material-ui-icons/CenterFocusStrong';
import FilterNone from 'material-ui-icons/FilterNone';
import Checkbox from 'material-ui/Checkbox';
import FormControlLabel from 'material-ui/Form/FormControlLabel';
import { withStyles } from 'material-ui/styles';
import gray from 'material-ui/colors/green';
import { Link } from 'react-router-dom'
import Input, { InputLabel } from 'material-ui/Input';
import { FormControl, FormHelperText } from 'material-ui/Form';
import Select from 'material-ui/Select';
import qs from 'query-string'

import {I18n, Translate, Localize } from "react-redux-i18n" ;

import ResourceViewerContainer from '../containers/ResourceViewerContainer';
import {getEntiType} from '../lib/api';
import './App.css';

const adm  = "http://purl.bdrc.io/ontology/admin/" ;
const bdo  = "http://purl.bdrc.io/ontology/core/";
const bdr  = "http://purl.bdrc.io/resource/";
const rdf  = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const rdfs = "http://www.w3.org/2000/01/rdf-schema#";
const skos = "http://www.w3.org/2004/02/skos/core#";
const tmp = "http://purl.bdrc.io/ontology/tmp/" ;
const _tmp = tmp ;

const prefixes = [adm, bdo,bdr,rdf,rdfs,skos,tmp]

const languages = {
   "zh":"lang.search.zh",
   "zh-hant":"lang.search.zhHant",
   //"zh-hans":"lang.search.zhHans",
   "zh-latn-pinyin":"lang.search.zhLatnPinyin",
   "en":"lang.search.en",
   "sa-x-iast":"lang.search.saXIast",
   "sa-Deva":"lang.search.saDeva",
   "bo":"lang.search.bo",
   "bo-x-ewts":"lang.search.boXEwts"
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
   config:{
      ldspdi:{
         endpoints:string[],
         index:number
      }
   },
   facets:{[string]:boolean|{}},
   searches:{[string]:{}},
   hostFailure?:string,
   loading?:boolean,
   keyword?:string,
   language?:string,
   prefLang?:string,
   locale?:string,
   datatypes:boolean|{},
   history:{},
   ontology:{},
   onStartSearch:(k:string,lg:string,t?:string)=>void,
   onSearchingKeyword:(k:string,lg:string,t?:string[])=>void,
   onGetDatatypes:(k:string,lg:string)=>void,
   onCheckDatatype:(t:string,k:string,lg:string)=>void,
   onGetFacetInfo:(k:string,lg:string,f:string)=>void,
   onCheckFacet:(k:string,lg:string,f:{[string]:string})=> void,
   onSetLocale:(lg:string)=>void,
   onSetPrefLang:(lg:string)=>void
}

type State = {
   loading?:boolean,
   willSearch?:boolean,
   language:string,
   checked?:string,
   unchecked?:string,
   keyword:string,
   dataSource : string[],
   filters:{
      datatype:string[],
      facets?:{[string]:string[]}
   },
   collapse:{ [string] : boolean },
   loader:{[string]:Component<*>},
   facets? : string[],
   autocheck?:boolean,
   paginate:{index:number,pages:number[],n:number[]}
}

class App extends Component<Props,State> {
   _facetsRequested = false;

   constructor(props : Props) {
      super(props);

      this.requestSearch.bind(this);
      this.handleCheck.bind(this);

      let get = qs.parse(this.props.history.location.search)
      console.log('qs',get)

      this.state = {
         language:get.lg?get.lg:"bo-x-ewts",
         UI:{language:"en"},
         filters: {
            datatype:get.t?get.t.split(","):["Any"]
         },
         dataSource: [],
         keyword:get.q?get.q.replace(/"/g,""):"",
         collapse:{},
         loader:{},
         paginate:{index:0,pages:[0],n:[0]}
      };

   }

   requestSearch(key:string,label?:string)
   {
      if(!key || key == "") return ;
      if(!key.match(/^bdr:/) && key.indexOf("\"") === -1) key = "\""+key+"\""

      let state = { ...this.state, dataSource:[] }
            //this.setState(state);

      console.log("search",key,label,this.state,this.props)

      if(key.match(/^bdr:[TPGW]/))
      {
         if(!label) label = this.state.filters.datatype.filter((f)=>["Person","Work"].indexOf(f) !== -1)[0]

         this.props.history.push({pathname:"/search",search:"?r="+key+(label?"&t="+label:"")})

         if(!this.props.searches[key+"@"+this.state.language]) {

            this.props.onStartSearch(key,"",[label],getEntiType(key))
         }
      }
      else if(label === "Any" || ( !label && ( this.state.filters.datatype.length === 0 || this.state.filters.datatype.indexOf("Any") !== -1 ) ) )
      {
         this.props.history.push({pathname:"/search",search:"?q="+key+"&lg="+this.state.language+"&t=Any"})

         if(!this.props.searches[key+"@"+this.state.language]) {

            this.props.onStartSearch(key,this.state.language)
         }

      }
      else if (label || this.state.filters.datatype.filter((f)=>["Person","Work"].indexOf(f) !== -1).length > 0)
      {
         if(!label) label = this.state.filters.datatype.filter((f)=>["Person","Work"].indexOf(f) !== -1)[0]

         this.props.history.push({pathname:"/search",search:"?q="+key+"&lg="+this.state.language+"&t="+label})

         if(!this.props.searches[label] || !this.props.searches[label][key+"@"+this.state.language]) {

            this.props.onStartSearch(key,this.state.language,[label])
         }

      }


   }

   getEndpoint():string
   {
      return this.props.config.ldspdi.endpoints[this.props.config.ldspdi.index]
   }

   componentDidUpdate() {

      // console.log("didU",this.state.facets,this.props,this.state.filters.datatype)
   }

   componentWillUpdate(newProps,newState) {

      console.log("willU",newProps,newState)

      let update = false ;
      let state = newState ;

      if(newState.willSearch)
      {
         this.requestSearch(this.state.keyword);
         state = { ...state, willSearch:false}
         update = true ;
      }



      // console.log("newProps.facets",newProps.facets)

/*
      if(state.keyword != "" && newProps.config.facets && !this._facetsRequested && !state.facets && state.filters.datatype.length > 0 && state.filters.datatype.indexOf("Any") === -1)
      {
         this._facetsRequested = true ;
         state = this.setFacets(newProps,state,state.filters.datatype[0])
         console.log("facets ???",state)
         update = true ;
      }
*/

      if(update) this.setState(state)

   }
/*
   setFacets = (props:Props,state:State,lab:string) =>
   {
      return ;

      let facets = props.config.facets.simple["bdo:"+lab]
      console.log("facets",facets,props.config.facets,state.filters.datatype)
      if(facets)
      {
         state = {...state,facets}
         let t = 1
         for(let f of facets) {
            // compulsory to delay to avoid saga's bug in quasi-simultaneous events...
            //setTimeout((function(that) { return function() { that.props.onGetFacetInfo(that.state.keyword,that.state.language,f) } })(this), t*10);
            //t++;
            state = { ...state, filters:{ ...state.filters, facets:{ ...state.filters.facets, [f]:["Any"] } } }

            this.props.onGetFacetInfo(state.keyword,state.language,f)
        }
      }
      else {
         state = { ...state, facets:null }
      }

      return state
   }
*/
   handleCheckFacet = (ev:Event,prop:string,lab:string[],val:boolean) => {

      let state =  this.state

      let propSet ;
      if(state.filters.facets) propSet = state.filters.facets[prop]

      let newF ;
      if(prop == bdo+"workGenre") {
         if(!val) lab = ["Any"]
         //newF = { ...prop.map(p => ({ [p] : lab })).reduce((e,acc) => ({...acc,...e}),{}) }
         newF = { [prop] : { alt : [ prop, bdo + "workIsAbout" ], val : lab } }
      }
      else
      {
         newF = { [prop] : lab }
      }

      console.log("checkF",prop,lab,val,newF)

      state = { ...state, paginate:{index:0,pages:[0],n:[0]} }

      if(val)
      {
         state = {  ...state,  filters: {  ...state.filters, facets: { ...state.filters.facets, ...newF } } }
      }
      else if(propSet)
      {
         state = {  ...state,  filters: {  ...state.filters, facets: { ...state.filters.facets, ...newF } } }
      }

      this.setState( state )
   }

      handleCheckUI = (ev:Event,prop:string,lab:string,val:boolean) => {

         console.log("checkUI",prop,lab,val)

         let state =  this.state

         if(val)
         {
            if(prop === "locale") this.props.onSetLocale(lab);
            else if(prop === "prefLang") this.props.onSetPrefLang(lab);
            //state = {  ...state,  UI: { ...state.UI, [prop] : lab } }
         }
         /* // no unchecking possible
         else if(state.UI && state.UI[prop])
         {
            state = {  ...state,  UI: {  ...state.UI, [prop] : [] } }
         }
         */

         //this.setState( state )
}
   /*
   handleFacetCheck = (ev:Event,prop:string,lab:string,val:boolean) => {

      console.log("check",prop,lab,val)

      let typ = this.state.filters.datatype[0]
      let key = this.state.keyword ;
      if(key.indexOf("\"") === -1) key = "\""+key+"\""

      let state =  this.state

      if(val)
      {

         state = {  ...state,  filters: {  ...state.filters, facets: { ...state.filters.facets, [prop] : [lab] } } }

         if(lab == "Any")
         {
            this.props.onSearchingKeyword(key,state.language,[typ])

            state = this.setFacets(this.props,state,state.filters.datatype[0]);
         }
         else {
            this.props.onCheckFacet(key,state.language,{[prop]:lab})
         }

         this.setState( state )
      }
      else
      {
         if(state.filters.facets && state.filters.facets[prop])
         {
            this.props.onSearchingKeyword(key,this.state.language,[typ])

            state = this.setFacets(this.props,state,state.filters.datatype[0]);

            this.setState( {  ...state,  filters: {  ...state.filters, facets: { [prop] : ["Any"] } } } )
         }
      }

   }
   */

   handleCheck = (ev:Event,lab:string,val:boolean) => {

      console.log("check",lab,val,this.props.keyword,'('+this.state.keyword+')')

      //if(this.props.language == "") return

      //  // to be continued ...
      // let f = this.state.filters.datatype
      // if(f.indexOf(lab) != -1 && !val) f.splice(f.indexOf(lab),1)
      // else if(f.indexOf(lab) == -1 && val) f.push(lab)


      let f = [lab]

      let state =  {  ...this.state,  filters: {  ...this.state.filters, datatype:f }, paginate:{index:0,pages:[0],n:[0]} }

      if(val && this.props.keyword)
      {

         if(this.props.language != "")
         {
            //console.log("here?")

            if(["Any","Person","Work"].indexOf(lab) !== -1)
            {

               this.requestSearch(this.props.keyword,lab)

            }
            else  {

               this.props.history.push("/search?q="+this.props.keyword+"&lg="+this.state.language+"&t="+lab);
            }
         }
         else {


               this.props.history.push("/search?r="+this.props.keyword+"&t="+lab);

         }


      }

      this.setState(state)

      /*

      return


      if(!val)
      {

         state = {  ...this.state,  filters: {  ...this.state.filters, datatype:["Any"] } }

         if(this.props.keyword && this.state.filters.datatype && this.state.filters.datatype.indexOf(lab) !== -1)
         {

            let key = this.state.keyword ;
            if(key == "") return ;
            if(key.indexOf("\"") === -1) key = "\""+key+"\""

            state = { ...state, facets:null}
            //this.props.onSearchingKeyword(key,this.state.language)

            // no need because same saerch...
            //this.props.onGetDatatypes(this.state.keyword,this.state.language)

            this.props.history.push("/search?q="+key+"&lg="+this.state.language+"&t=Any");
         }
      }

      this.setState( state ) //, function() {  console.log("CHECKED changed the state",state) } )
      */
   }


  handleLanguage = event => {

     let s = { [event.target.name]: event.target.value }
     if(this.props.keyword) s = { ...s, willSearch:true }

     // console.log("handle",s)

     this.setState( s );
  };

   pretty(str:string)
   {
     for(let p of prefixes) { str = str.replace(new RegExp(p,"g"),"") }

     str = str.replace(/([a-z])([A-Z])/g,"$1 $2")

     return str ;
   }

   fullname(prop:string,preflabs:[])
   {

      if(this.props.ontology[prop] && this.props.ontology[prop][rdfs+"label"])
      {
         preflabs = this.props.ontology[prop][rdfs+"label"]
      }

      if(preflabs)
      {
         if(!Array.isArray(preflabs)) preflabs = [ preflabs ]

         //console.log("fullN",prop,preflabs,this.props.locale,this.props.prefLang,typeof preflabs[0])

         let lang = "@language";
         let val = "@value";
         if(preflabs.length > 0 && preflabs[0]["lang"]) { lang = "lang" ; val = "value"; }
         if(preflabs.length > 0 && preflabs[0]["xml:lang"]) { lang = "xml:lang" ; val = "value"; }

         let label = preflabs.filter(e => e[lang] == this.props.locale )
         if(label.length > 0) return label[0][val]
         label = preflabs.filter(e => e[lang] == this.props.prefLang)
         if(label.length > 0) return label[0][val]
         label = preflabs.filter(e => e[lang] == "en")
         if(label.length > 0) return label[0][val]
         label = preflabs.filter(e => e[lang] == "bo-x-ewts")
         if(label.length > 0) return label[0][val]
         //return preflabs[0][value]
      }

      return this.pretty(prop)
   }

   highlight(val,k):string
   {
      if(!val.match(/↤/))
         val = /*val.replace(/@.* /,"")*/ val.split(new RegExp(k.replace(/ /g,"[ -]"))).map((l) => ([<span>{l}</span>,<span className="highlight">{k}</span>])) ;
      else {
         let str = val.replace(/^.*↦([^↤]+)↤.*$/,"$1")
         val = val.split(/↦[^↤]+↤/).map((l) => ([<span>{l}</span>,<span className="highlight">{str}</span>])) ;
      }

      val = [].concat.apply([],val);
      val.pop();
      return val;
   }

   counTree(tree:{},meta:{},any:integer=0):[]
   {
      let ret = []
      let tmp = Object.keys(tree).map(k => ({[k]:tree[k]}))
      while(tmp.length > 0) {
         let t = tmp[0]

         let kZ = Object.keys(t)
         let kZsub = Object.keys(t[kZ[0]])

         let labels = this.props.ontology[kZ[0]]
         if(labels) labels = labels[rdfs+"label"]
         if(!labels) labels = []

         //console.log("t",t,kZ,kZsub,labels)

         tmp = tmp.concat(kZsub.map(k => ({[k]:t[kZ[0]][k]})))

         let cpt,checkSub ;
         if(meta[kZ[0]]) cpt = meta[kZ[0]]
         else {
            cpt = kZsub.reduce((acc,e) => { return acc + meta[e] ; },0)
            checkSub = true ;
         }

         var elem = {"@id":kZ[0],"taxHasSubClass":kZsub,[_tmp+"count"]:cpt,"skos:prefLabel":labels}
         if(checkSub) elem = { ...elem, checkSub}
         ret.push(elem)

         delete tmp[0]
         tmp = tmp.filter(e=> e != null);

         //console.log("tmp",tmp,ret)
         //break;
      }

      ret = [
               {"@id":"root", "taxHasSubClass":["Any"].concat(Object.keys(tree))},
               {"@id":"Any",[_tmp+"count"]:any,"taxHasSubClass":[]}
           ].concat(ret)

      return ret;
   }

   prevPage()
   {
      let state = this.state.paginate
      if(state.index > 0) { this.setState({ ...this.state, paginate:{...state, index:state.index - 1}}) }
   }

   nextPage()
   {
      let state = this.state.paginate
      if(state.index < state.pages.length - 1) { this.setState({ ...this.state, paginate:{...state, index:state.index + 1}}) }
   }

   inserTree(k:string,p:{},tree:{}):boolean
   {
      //console.log("ins",k,p,tree);

      for(let t of Object.keys(tree))
      {
         //console.log(" t",t)

         if(p[rdfs+"subPropertyOf"] && p[rdfs+"subPropertyOf"].filter(e => e.value == t).length > 0
         || p[rdfs+"subClassOf"] && p[rdfs+"subClassOf"].filter(e => e.value == t).length > 0
         || p[bdo+"taxSubClassOf"] && p[bdo+"taxSubClassOf"].filter(e => e.value == t).length > 0 )
         {
            //console.log("  k",k)
            tree[t] = { ...tree[t], [k]:{} }
            return true
         }
         else if(this.inserTree(k,p,tree[t])) return true ;
      }

      return false ;
   }

   render() {

      console.log("render",this.props,this.state)

      let message = [];
      let results ;
      let facetList = []
      let types = ["Any"]
      let loader ;
      let counts = { "datatype" : { "Any" : 0 } }



      if(this.props.keyword)
      {
         if(this.state.filters.datatype[0] != "Any" && this.props.searches[this.state.filters.datatype[0]])
            results = this.props.searches[this.state.filters.datatype[0]][this.props.keyword+"@"+this.props.language]
         else
            results = this.props.searches[this.props.keyword+"@"+this.props.language]

         //console.log("results?",results,this.props.searches[this.props.keyword+"@"+this.props.language])

         if(results)
         {
            let n = 0, m = 0 ;
            if(results.numResults == 0) {
               message.push(
                  <Typography style={{fontSize:"1.5em",maxWidth:'700px',margin:'50px auto',zIndex:0}}>
                     No result found.
                  </Typography>
               )
            }
            else
            {
               if(!this.props.datatypes || !this.props.datatypes.metadata)
               {
                  //console.log("dtp?",this.props.datatypes)
               }
               else {

                  //if(this.state.loader.datatype)
                  //   this.setState({ loader: { ...this.state.loader, datatype:false }})

                  //console.log("whatelse");

                  if( this.props.datatypes.metadata) for(let r of Object.keys(this.props.datatypes.metadata) ){

                     //r = r.bindings
                     let typ = r.replace(/^.*?([^/]+)$/,"$1")
                     typ = typ[0].toUpperCase() + typ.slice(1)

                     // console.log("typ",typ)

                     if(typ != "" && types.indexOf(typ) === -1)
                     {
                        m++;

                        types.push(typ);

                        counts["datatype"][typ]=Number(this.props.datatypes.metadata[r])
                        counts["datatype"]["Any"]+=Number(this.props.datatypes.metadata[r])

                        /*
                        let value = typ

                        let box =
                        <div key={m} style={{width:"150px",textAlign:"left"}}>
                           <FormControlLabel
                              control={
                                 <Checkbox
                                    checked={this.state.filters.datatype.indexOf(typ) !== -1}
                                    icon={<span className='checkB'/>}
                                    checkedIcon={<span className='checkedB'><CheckCircle style={{color:"#444",margin:"-3px 0 0 -3px",width:"26px",height:"26px"}}/></span>}
                                    onChange={(event, checked) => this.handleCheck(event,value,checked)} />

                              }
                              label={typ}
                           />
                           </div>
                           facetList.push(box)
                              */

                     }

                     types = types.sort(function(a,b) { return counts["datatype"][a] < counts["datatype"][b] })

                     //console.log("counts",counts)

                  }


                  if(types.length == 2 && !this.state.autocheck)
                  {
                     this.setState({ ...this.state, autocheck:true })

                     //console.log("autocheck",types)

                     this.handleCheck(null, types[1], true)
                  }

               }
               //console.log("results",results);
               let list = results.results.bindings

               //if(!list.length) list = Object.keys(list).map((o) => {
                  /*
                  let label = list[o].label
                  if(!label) {
                     label = list[o].prefLabel
                     if(label)
                     {
                        if(label.constructor.name == "Array")  label = label[0]
                        else label = { value:label }
                     }
                  }*/

                  /*
                  if(!label) label = list[o].matching.filter((current) => (current.type === skos+"prefLabel"))[0]
                  if(!label)
                     if(list[o].prefLabel) label = {"value": list[o].prefLabel }
                     else label = {"value":"?"} */

                     /*
                      { ...label,
                            value:label.value.replace(/@.*$/,"")
                         }, */

                         /*
                  let label = list[o].reduce((acc,e) => (e.type && e.type.match(/prefLabelMatch$/ ? e:null)))

                  return (
                     {
                         //f  : { type: "uri", value:list[o].type },
                         lit: label,
                         s  : { type: "uri", value:o },
                         match: list[o].filter((e) => (e.value && e.value.match(/[↦↤]/)))
                     } ) }message )

                     */
               let displayTypes = types //["Person"]
               if(this.state.filters.datatype.indexOf("Any") === -1) displayTypes = this.state.filters.datatype ;

               //console.log("list x types",list,types,displayTypes)

               for(let t of displayTypes) {

                  let willBreak = false ;

                  if(t === "Any") continue ;

                  message.push(<MenuItem  onClick={(e)=>this.handleCheck(e,t,true)}><h4>{I18n.t("types."+t.toLowerCase())+"s"+(counts["datatype"][t]?" ("+counts["datatype"][t]+")":"")}</h4></MenuItem>);

                  let sublist = list[t.toLowerCase()+"s"]
                  let cpt = 0;
                  n = 0
                  let begin = this.state.paginate.pages[this.state.paginate.index]
                  let categ = "Other" ;
                  let end = n

                  let findNext = false ;
                  let findFirst = true ;

                  let absi = -1

                  if(sublist) { for(let o of Object.keys(sublist))
                  {
                     absi ++ ;
                     //console.log("cpt",cpt,n,begin,findFirst,findNext)

                     if(absi < begin && findFirst) { cpt++ ; continue; }
                     else if(cpt == begin && !findNext) {
                        cpt = 0 ;
                        findFirst = false ;
                        n = this.state.paginate.n[this.state.paginate.index];
                     }

                     //message.push(["cpt="+cpt+"="+absi,<br/>])

                     let label = sublist[o].filter((e) => (e.type && e.type.match(/prefLabelMatch$/)))[0]
                     if(!label) label = sublist[o].filter((e) => (e.type && e.type.match(/prefLabel$/) && e["xml:lang"] == this.props.prefLang))[0]
                     if(!label) label = sublist[o].filter((e) => (e.type && e.type.match(/prefLabel$/) && e["xml:lang"] == "bo-x-ewts"))[0]
                     if(!label) label = sublist[o].filter((e) => (e.type && e.type.match(/prefLabel$/)))[0]

                     //console.log("label",label)

                     let preProps = sublist[o].filter((e) => e.type && e.type.match(/relationType$/ )).map(e => this.props.ontology[e.value])

                     let r = {
                        //f  : { type: "uri", value:list[o].type },
                        lit: label,
                        s  : { type: "uri", value: o },
                        match: sublist[o].filter((e) => {

                           let use = true ;

                           if(e.type && e.type.match(/relationType$/)) {
                              let prop = this.props.ontology[e.value]
                              //console.log("e",e,prop)
                              if(prop)
                                 for(let p of preProps) {

                                    //console.log("::",p[rdfs+"subPropertyOf"])

                                    if(p[rdfs+"subClassOf"] && p[rdfs+"subClassOf"].filter(q => q.value == e.value).length > 0
                                       || p[rdfs+"subPropertyOf"] && p[rdfs+"subPropertyOf"].filter(q => q.value == e.value).length > 0
                                       || p[bdo+"taxSubClassOf"] && p[bdo+"taxSubClassOf"].filter(q => q.value == e.value).length > 0
                                    ) {
                                       use = false ;
                                       break ;
                                    }
                                 }
                           }

                           //console.log("e",e,this.state.filters.facets)

                           return ( /*(this.state.filters.facets && e.type && this.state.filters.facets[e.type]) ||*/ use && (
                           ( this.props.language != "" ? e.value && e.value.match(/[↦↤]/) && e.type && !e.type.match(/prefLabelMatch$/)
                                                       : !e.lang && (e.value.match(new RegExp(bdr+this.props.keyword.replace(/bdr:/,"")))
                                                                     || (e.type && e.type.match(/relationType$/) .match) ) )

                              ) ) } )
                     }


                     // || (e.type && e.type.match(/[Ee]xpression/) )
                     // || ( )

                     let isAbs = sublist[o].filter((e) => e.value && e.value.match(/Abstract/))
                     let hasExpr = sublist[o].filter((e) => e.type && e.type.match(/HasExpression/))
                     let isExpr = sublist[o].filter((e) => e.type && e.type.match(/ExpressionOf/))
                     let hasPart = sublist[o].filter((e) => e.type && e.type.match(/HasPart/))
                     let hasRoot = sublist[o].filter((e) => e.type && e.type.match(/HasRoot/))

                     let addTmpProp = (tab,prop,lab) => {

                        if(tab.length > 0)
                        {
                           let subL = sublist[o].filter((e) => (e.type && e.type.match(new RegExp(prop)))) ///(work(Has)?Expression)|(workHasRoot)/) ) )

                           let subR,label ;
                           if(subL.length == 1) {
                              subR = sublist[o].filter((e) => (e.type && e.type.match(new RegExp(lab)))) //(rootPrefLabel)|(prefLabel(Has)?Expression)/) ) )
                              if(subR.length > 0) {
                                 label = subR.filter((e) => (e["xml:lang"] == this.props.prefLang))
                                 if(!label || label.length == 0) label = subR.filter((e) => (e["xml:lang"] == "bo-x-ewts"))
                                 if(!label || label.length == 0) if(subR.length > 0) label = subR

                                 if(label && label[0] && label[0].value) label = label[0].value
                                 else label = null
                              }
                           }

                           //console.log("sub",subL,subR,label);

                           let withKey = subL.reduce((acc,e) => {
                              if(!acc[e.type]) acc[e.type] = []
                              acc[e.type] = [].concat(acc[e.type]) ;
                              acc[e.type].push(e.value);
                              return acc;
                           }, {} )

                           //console.log("wK",withKey);

                           r.match = r.match.concat( Object.keys(withKey).reduce((acc,e)=>{
                              let elem = {"type":e,"value":withKey[e]}
                              if(label) elem = { ...elem, "tmpLabel":label}
                              acc.push(elem);
                              return acc;
                           } ,[]) )

                           //console.log("r.match",r.match)
                        }

                     }

                     addTmpProp(hasExpr,"workHasExpression","prefLabelHasExpression");
                     addTmpProp(isExpr,"workExpression","prefLabelExpression");
                     addTmpProp(hasRoot,"workHasRoot","rootPrefLabel");

                     let k = this.props.keyword.replace(/"/g,"")

                     let id = r.s.value.replace(/^.*?([^/]+)$/,"$1")
                     let lit ;
                     if(r.lit) { lit = this.highlight(r.lit.value,k) }
                     let typ ;
                     //if(r.f && r.f.value) typ = r.f.value.replace(/^.*?([^/]+)$/,"$1")

                     //console.log("r",o,sublist[o],r,label,lit);

                     let filtered = true ;

                     if(this.state.filters.datatype.indexOf("Any") === -1 && this.state.filters && this.state.filters.facets)

                        for(let k of Object.keys(this.state.filters.facets)) {

                           let v = this.state.filters.facets[k]

                           let hasProp = []
                           for(let e of sublist[o]) {
                              //console.log("e",e)
                              if(e.type == k && (e.value == v || (Array.isArray(v) && v.indexOf(e.value) !== -1))) { hasProp.push(e); }
                              else if(v.alt) for(let a of v.alt) {
                                 if(e.type == a && (e.value == v.val || (Array.isArray(v.val) && v.val.indexOf(e.value) !== -1))) {

                                    hasProp.push(e);
                                 }
                              }
                           }

                           //console.log("k",k,v,hasProp);

                           if((this.state.filters.facets[k].val || this.state.filters.facets[k].indexOf("Any") === -1) && (!hasProp || hasProp.length == 0)) {

                              filtered = false

                           }
                           else {

                              //console.log("is good",cpt,n,r.s.value,r)

                           }
                           /*

                           if(r.obj[k] && this.state.filters.facets[k].indexOf("Any") === -1 &&
                           this.state.filters.facets[k].indexOf(r.obj[k]) === -1) {

                              console.log("filtered")
                              filtered = false;

                           }
                           */
                        }

                        //console.log("typ",typ,t,filtered)

                        //if(this.state.filters.datatype.length == 0 || this.state.filters.datatype.indexOf("Any") !== -1 || this.state.filters.datatype.indexOf(typ) !== -1)
                        if((!typ || typ === t) && filtered)
                        {
                           if(findNext) {

                              let next = absi

                              //console.log("good!",next,)

                              if(this.state.paginate.pages.indexOf(next) === -1)
                                 this.setState({...this.state,
                                    paginate:{...this.state.paginate,
                                       pages: this.state.paginate.pages.concat([next]),
                                       n: this.state.paginate.n.concat([end])
                                    }});

                              break;
                           }

                           //console.log("lit",lit,n)

                           let Tag,tip ;
                           if(isAbs.length > 0) { Tag = CropFreeIcon ; tip = "Abstract Work" ; if(categ !== "Abstract") { message.push(<h5>Abstract</h5>); categ = "Abstract" ; if(cpt!=0) {n = 0; } ; willBreak = false ;} }
                           else if(hasExpr.length > 0) { Tag = CenterFocusStrong; tip = "Work Has Expression" ; if(categ !== "HasExpr") { message.push(<h5>Has Expression</h5>); categ = "HasExpr" ; if(cpt!=0) {n = 0; }; willBreak = false ;  } }
                           else if(isExpr.length > 0) { Tag = CenterFocusWeak; tip = "Work Expression Of"; if(categ !== "ExprOf") { message.push(<h5>Expression Of</h5>) ; categ = "ExprOf" ; if(cpt!=0) {n = 0; }; willBreak = false ;  } }
                           else if(categ !== "Other") { Tag = CropDin; tip = "Work" ; message.push(<h5>Other</h5>); categ = "Other"; if(cpt!=0) {n = 0; } willBreak = false ;  }
                           else if(categ === "Other") { Tag = CropDin; tip = "Work" ; }

                           if(Tag == CropDin && hasPart.length > 0) Tag = FilterNone;

                           if(t !== "Work") Tag = null

                           //console.log("lit",lit,n)

                           //console.log("willB",n,willBreak,categ)
                           //if(n != 0 && willBreak) break;
                           //else willBreak = false ;

                           n ++;
                           end = n ;
                           if(!willBreak) message.push(
                              [
                           <Link key={n} to={"/show/bdr:"+id} className="result">

                              <Button key={t+"_"+n+"_"} >
                                    <ListItem style={{paddingLeft:"0",display:"flex"}}>
                                       <div style={{width:"30px",textAlign:"right"}}>{n}</div>
                                       <ListItemText style={{height:"auto",flexGrow:10,flexShrink:10}}
                                          primary={lit}
                                          //secondary={id}
                                          secondary={[id,
                                             Tag?<Tooltip placement="bottom-start" style={{marginLeft:"50px"}} title={
                                                <div style={{margin:"10px"}}>
                                                   {tip}
                                                </div>
                                             }><Tag style={{height:"18px",verticalAlign:"-4px",marginLeft:"5px"}}/></Tooltip>:null]}
                                       ></ListItemText>
                                       {/* { Tag && <ListItemIcon><Tag/></ListItemIcon> } */}
                                    </ListItem>
                              </Button>

                           </Link>
                              ,
                              <div>
                              {
                                 r.match.map((m) => {

                                       //console.log("m",m)

                                       if(!m.type.match(new RegExp(skos+"prefLabel"))) {
                                          let prop = this.fullname(m.type.replace(/.*altLabelMatch/,skos+"altLabel"))
                                          let val,isArray = false ;
                                          if(Array.isArray(m.value)) { val = m.value.map((e)=>this.pretty(e)) ; isArray = true }
                                          else val = this.highlight(this.pretty(m.value),k)

                                          //console.log("val",val,val.length)

                                          let uri = this.props.keyword.replace(/bdr:/,"")
                                          if(m.type.match(/relationType$/)) {
                                             prop = this.fullname(m.value) ;
                                             val = uri
                                          }

                                          //console.log("prop",prop,val)

                                          return (<div className="match">
                                             <span className="label">{prop}:&nbsp;</span>
                                             {!isArray && <span>{val}</span>}
                                             {isArray && <div class="multi">{val.map((e)=><span><Link to={"/show/bdr:"+e}>{m.tmpLabel?m.tmpLabel:e}</Link></span>)}</div>}
                                          </div>)
                                       }
                                 })
                              }
                              </div>
                           ]

                           )

                           cpt ++;
                           if(displayTypes.length >= 2) {
                              if(cpt >= 3) { if(categ == "Other") { break ; } else { willBreak = true; } }
                           } else {
                              if(cpt >= 50 && !findFirst) {

                                 findNext = true ;

                                 //break;
                              }
                           }
                        }
                     }
                     if(cpt == 0 ) { message.push(<Typography style={{margin:"20px 40px"}}><Translate value="search.filters.noresults"/></Typography>);}

                  }
               }

               //console.log("message",message)

               /*
               <Typography>{r.lit}</Typography>
               */
            }
         }
      }
      else
      {
         types = ["Any","Person","Work","Corporation","Place","Item","Etext","Role","Topic","Lineage"]
         types = types.sort()
      }

      let widget = (title:string,txt:string,inCollapse:Component) => (
         [<ListItem
            style={{display:"flex",justifyContent:"space-between",padding:"0 20px",borderBottom:"1px solid #bbb",cursor:"pointer"}}
            onClick={(e) => { this.setState({collapse:{ ...this.state.collapse, [txt]:!this.state.collapse[txt]} }); } }
            >
            <Typography style={{fontSize:"18px",lineHeight:"50px",textTransform:"capitalize"}}>{title}</Typography>
            { this.state.collapse[txt] ? <ExpandLess /> : <ExpandMore />}
         </ListItem>,
         <Collapse
            in={this.state.collapse[txt]}
            className={["collapse",this.state.collapse[txt]?"open":"close"].join(" ")}
            style={{padding:"10px 0 0 50px"}} // ,marginBottom:"30px"
            >
               {inCollapse}
         </Collapse> ]
      )


      let subWidget = (tree:[],jpre:string,subs:[],disable:boolean=false) => {

         if(!Array.isArray(subs)) subs = [ subs ]

         subs = subs.map(str => {
            let index
            let a = tree.filter(e => e["@id"] == str)
            if(a.length > 0 && a[0][tmp+"count"]) index = Number(a[0][tmp+"count"])

            return ({str,index})
         })
         subs = _.orderBy(subs,'index','desc').map(e => e.str)

         //console.log("subW",subs,jpre)

         let checkbox = subs.map(e => {

            let elem = tree.filter(f => f["@id"] == e)

            //console.log("elem",elem,e)

            if(elem.length > 0) elem = elem[0]
            else return


            let label = this.fullname(e,elem["skos:prefLabel"])

            //console.log("check",e,label,elem,disable);

            let cpt = tree.filter(f => f["@id"] == e)[0][_tmp+"count"]

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

                  //console.log("t",t);

                  if(t.length > 0) {
                     t = t[0]
                     if(t) {
                        if(!t["taxHasSubClass"] || t["taxHasSubClass"].length == 0)  { checkable.push(tmp[0]); }
                        else tmp = tmp.concat(t["taxHasSubClass"])
                     }
                  }

                  delete tmp[0]
                  tmp = tmp.filter(String)
                  //console.log("tmp",tmp,checkable)
               }
            }

            checkable = checkable.map(e => e.replace(/bdr:/,bdr))

            let checked = this.state.filters.facets && this.state.filters.facets[jpre]

            //console.log("checked1",jpre,e,checked)


            if(!checked) {
               if(label === "Any") checked = true ;
               else checked = false
            }
            else {
               let toCheck = this.state.filters.facets[jpre]
               if(toCheck.val) toCheck = toCheck.val
               if(checkable.indexOf(e) === -1) {
                 for(let c of checkable) {
                    checked = checked && toCheck.indexOf(c) !== -1  ;
                 }
               }
               else checked = toCheck.indexOf(e) !== -1
            }

            //console.log("checkedN",checked)

            return (
               <div key={e} style={{width:"350px",textAlign:"left"}} className="widget">
                  <FormControlLabel
                     control={
                        <Checkbox
                           checked={checked}
                           className={"checkbox"}
                           icon={<span className='checkB'/>}
                           checkedIcon={<span className='checkedB'><CheckCircle style={{color:"#444",margin:"-3px 0 0 -3px",width:"26px",height:"26px"}}/></span>}
                           onChange={(event, checked) => this.handleCheckFacet(event,jpre,checkable,checked)}
                        />

                     }
                     label={label+" ("+cpt+")"}
                  />
                  {
                     elem && elem["taxHasSubClass"] && elem["taxHasSubClass"].length > 0 &&
                     [
                        <span className="subcollapse"
                              onClick={(ev) => { this.setState({collapse:{ ...this.state.collapse, [e]:!this.state.collapse[e]} }); } }>
                        { this.state.collapse[e] ? <ExpandLess /> : <ExpandMore />}
                        </span>,
                        <Collapse
                           in={this.state.collapse[e]}
                           className={["subcollapse",this.state.collapse[e]?"open":"close"].join(" ")}
                           style={{paddingLeft:35+"px"}} // ,marginBottom:"30px"
                           >
                              { subWidget(tree,jpre,elem["taxHasSubClass"],disable) }
                        </Collapse>
                     ]
                  }
               </div>
            )


         })

         return ( checkbox )
      }

      let meta,metaK = [] ;
      if(this.state.filters.datatype && this.state.filters.datatype.indexOf("Any") === -1) {

         if(this.props.searches && this.props.searches[this.state.filters.datatype[0]]) {

            meta = this.props.searches[this.state.filters.datatype[0]][this.props.keyword+"@"+this.props.language]

            //console.log("ici",meta)

            if(meta) meta = meta.metadata
            if(meta) {
               let that = this.props.config["facets"][this.state.filters.datatype[0]]
               if(that) that = Object.keys(that)
               metaK = Object.keys(meta).sort((a,b) => that.indexOf(a)<that.indexOf(b)?-1:(that.indexOf(a)>that.indexOf(b)?1:0))
            }

         }
      }
      console.log("metaK",metaK)

      return (
<div>

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

         <div className="App" style={{display:"flex"}}>
            <div className="SidePane left" style={{width:"25%",paddingTop:"150px"}}>
               { //this.props.datatypes && (results ? results.numResults > 0:true) &&
                  <div style={{width:"333px",float:"right",position:"relative"}}>
                     <Typography style={{fontSize:"30px",marginBottom:"20px",textAlign:"left"}}>
                        <Translate value="Lsidebar.title" />
                     </Typography>
                     {
                        widget(I18n.t("Lsidebar.collection.title"),"collection",
                        ["BDRC" ,"rKTs" ].map((i) => <div key={i} style={{width:"150px",textAlign:"left"}}>
                              <FormControlLabel
                                 control={
                                    <Checkbox
                                       {... i=="rKTs" ?{}:{defaultChecked:true}}
                                       disabled={true}
                                       className="checkbox disabled"
                                       icon={<span className='checkB'/>}
                                       checkedIcon={<span className='checkedB'><CheckCircle style={{color:"#444",margin:"-3px 0 0 -3px",width:"26px",height:"26px"}}/></span>}
                                       //onChange={(event, checked) => this.handleCheck(event,i,checked)}
                                    />

                                 }
                                 label={i}
                              /></div> ))
                     }
                     {  this.props.datatypes && !this.props.datatypes.hash &&
                        <Loader loaded={false} className="datatypesLoader" style={{position:"relative"}}/>
                     }
                     <ListItem
                        style={{display:"flex",justifyContent:"space-between",padding:"0 20px",borderBottom:"1px solid #bbb",cursor:"pointer"}}
                        onClick={(e) => {
                           //if(!(this.props.datatypes && !this.props.datatypes.hash))
                              this.setState({collapse:{ ...this.state.collapse, "datatype":!this.state.collapse["datatype"]} }); } }
                        >
                        <Typography style={{fontSize:"18px",lineHeight:"50px",}}>
                           <Translate value="Lsidebar.datatypes.title"/>
                        </Typography>
                        { /*this.props.datatypes && this.props.datatypes.hash &&*/ !this.state.collapse["datatype"] ? <ExpandLess /> : <ExpandMore />  }
                     </ListItem>
                     <Collapse
                        in={/*this.props.datatypes && this.props.datatypes.hash &&*/ !this.state.collapse["datatype"]}
                        className={["collapse",  !(this.props.datatypes && !this.props.datatypes.hash)&&!this.state.collapse["datatype"]?"open":"close"].join(" ")}
                         style={{padding:"10px 0 0 50px"}} >
                        <div>
                        { //facetList&&facetList.length > 0?facetList.sort((a,b) => { return a.props.label < b.props.label } ):
                              types.map((i) => {

                                 //console.log("counts",i,counts["datatype"][i],this.state.filters.datatype.indexOf(i))

                           let disabled = (!this.props.keyword && ["Any","Person","Work"].indexOf(i)===-1 && this.props.language  != "")
                           // || (this.props.language == "")

                              return (
                                 <div key={i} style={{textAlign:"left"}}>
                                    <FormControlLabel
                                       control={
                                          <Checkbox
                                             className={"checkbox "+(disabled?"disabled":"")}
                                             //disabled={disabled}
                                             //{...i=="Any"?{defaultChecked:true}:{}}
                                             checked={this.state.filters.datatype.indexOf(i) !== -1}
                                             icon={<span className='checkB'/>}
                                             checkedIcon={<span className='checkedB'><CheckCircle style={{color:"#444",margin:"-3px 0 0 -3px",width:"26px",height:"26px"}}/></span>}
                                             onChange={(event, checked) => this.handleCheck(event,i,checked)}
                                          />

                                       }
                                       {...counts["datatype"][i]?{label:I18n.t("types."+i.toLowerCase()) + " ("+counts["datatype"][i]+")"}:{label:I18n.t("types."+i.toLowerCase())}}
                                    />
                                 </div>
                              )
                           }
                        )}
                        </div>
                     </Collapse>
                     {

                        meta  && this.props.config && this.props.ontology && metaK.map((j) =>
                        {

                           let jpre = this.props.config.facets[this.state.filters.datatype[0]][j]
                           if(!jpre) jpre = j
                           let jlabel = this.props.ontology[jpre]
                           if(jlabel) jlabel = jlabel["http://www.w3.org/2000/01/rdf-schema#label"]
                           //if(jlabel) for(let l of jlabel) { if(l.lang == "en") jlabel = l.value }
                           if(jlabel && jlabel.length) jlabel = jlabel[0].value
                           else jlabel = this.pretty(jpre)

                           if(["tree","relation","langScript"].indexOf(j) !== -1) {

                              //console.log("widgeTree",j,jpre,meta[j],counts["datatype"],this.state.filters.datatype[0])

                              if(j == "tree") { // && meta[j]["@graph"]) { //
                                 let tree ;
                                 if(meta[j]) tree = meta[j]["@graph"]

                                 //console.log("meta tree",tree,meta[j],counts)

                                 if(tree && tree[0]
                                    && this.state.filters && this.state.filters.datatype
                                    && counts["datatype"][this.state.filters.datatype[0]])
                                 {
                                    if(tree[0]["taxHasSubClass"].indexOf("Any") === -1)
                                    {
                                       tree[0]['taxHasSubClass'] = ['Any'].concat(tree[0]['taxHasSubClass'])
                                       tree.splice(1,0,{"@id":"Any",
                                          taxHasSubClass:[],"skos:prefLabel":[],
                                          [tmp+"count"]:counts["datatype"][this.state.filters.datatype[0]]})
                                    }

                                    return widget(jlabel,j,subWidget(tree,jpre,tree[0]['taxHasSubClass'],true));
                                 }
                              }
                              else { //sort according to ontology properties hierarchy
                                 let tree = {}, tmProps = Object.keys(meta[j]).map(e => e), change = false
                                 let rooTax = false
                                 do // until every property has been put somewhere
                                 {
                                    //console.log("loop")
                                    change = false ;
                                    for(let i in tmProps) { // try each one
                                       let k = tmProps[i]
                                       let p = this.props.ontology[k]

                                       //console.log("p",k,p)

                                       if(!p || (!p[rdfs+"subPropertyOf"]
                                          && (!p[rdfs+"subClassOf"] || p[rdfs+"subClassOf"].filter(e => e.value == bdo+"Event").length != 0 )
                                          && (!p[bdo+"taxSubClassOf"] || p[bdo+"taxSubClassOf"].filter(e => e.value == bdr+"LanguageTaxonomy").length != 0 ) ) ) // is it a root property ?
                                       {
                                          //console.log("root",k,p)
                                          tree[k] = {} ;
                                          delete tmProps[i];
                                          change = true ;
                                          break ;
                                       }
                                       else // find its root property in tree
                                       {
                                          change = this.inserTree(k,p,tree)
                                          if(change) {
                                             delete tmProps[i];
                                             break ;
                                          }
                                       }
                                    }
                                    tmProps = tmProps.filter(String)

                                    //if(rooTax) break ;

                                    if(!change && !rooTax) {
                                       //console.log("!no change!")
                                       for(let i in tmProps) {
                                          let k = tmProps[i]
                                          let p = this.props.ontology[k]
                                          // is it a root property ?
                                          if(p && p[bdo+"taxSubClassOf"] && p[bdo+"taxSubClassOf"].filter(q => tmProps.filter(r => r == q.value).length != 0).length == 0)
                                          {
                                             tmProps = tmProps.concat(p[bdo+"taxSubClassOf"].map(e => e.value));
                                             //console.log(" k",k,tmProps)
                                             change = true ;
                                             rooTax = true ;
                                          }
                                          else if(p && p[rdfs+"subClassOf"] && p[rdfs+"subClassOf"].filter(q => tmProps.filter(r => r == q.value).length != 0).length == 0)
                                          {
                                             tmProps = tmProps.concat(p[rdfs+"subClassOf"].map(e => e.value));
                                             //console.log(" k",k,tmProps)
                                             change = true ;
                                             rooTax = true ;
                                          }
                                       }
                                       if(!change)break;
                                    }

                                 }
                                 while(tmProps.length > 0);

                                 //console.log("inserTree",tree)
                                 tree = this.counTree(tree,meta[j],counts["datatype"][this.state.filters.datatype[0]])
                                 //console.log("counTree",tree)

                                 return widget(jlabel,j,subWidget(tree,jpre,tree[0]['taxHasSubClass']));
                              }

                              return ;
                           }
                           else
                           {

                              let meta_sort = Object.keys(meta[j]).sort((a,b) => {
                                 if(Number(meta[j][a]) < Number(meta[j][b])) return 1
                                 else if(Number(meta[j][a]) > Number(meta[j][b])) return -1
                                 else return 0 ;
                              });

                              delete meta_sort[meta_sort.indexOf("Any")]
                              meta_sort.unshift("Any")


                              meta[j]["Any"] =  counts["datatype"][this.state.filters.datatype[0]]

                              return (

                                 widget(jlabel,j,

                                    meta_sort.map(  (i) =>
                                    {

                                       let label = this.props.ontology[i]
                                       if(label) {
                                          for(let l of label["http://www.w3.org/2000/01/rdf-schema#label"])
                                             if(l.lang == "en") label = l.value
                                          if(label["http://www.w3.org/2000/01/rdf-schema#label"]) label = label["http://www.w3.org/2000/01/rdf-schema#label"][0].value
                                       }
                                       else label = this.pretty(i)

                                       // console.log("label",i,label)

                                       let checked = this.state.filters.facets && this.state.filters.facets[jpre]
                                       if(!checked) {
                                          if(label === "Any") checked = true ;
                                          else checked = false ;
                                       }
                                       else checked = this.state.filters.facets[jpre].indexOf(i) !== -1

                                       // console.log("checked",checked)

                                       return (
                                          <div key={i} style={{width:"280px",textAlign:"left"}} className="widget">
                                             <FormControlLabel
                                                control={
                                                   <Checkbox
                                                      checked={checked}
                                                      className="checkbox"
                                                      icon={<span className='checkB'/>}
                                                      checkedIcon={<span className='checkedB'><CheckCircle style={{color:"#444",margin:"-3px 0 0 -3px",width:"26px",height:"26px"}}/></span>}
                                                      onChange={(event, checked) => this.handleCheckFacet(event,jpre,[i],checked)}
                                                   />

                                                }
                                                label={label+" ("+meta[j][i]+")"}
                                             />
                                          </div>
                                       )
                                    })
                                 )
                              )
                           }
                        })
                     }

                     { /*false && this.state.facets && this.props.ontology && this.state.facets.map((i) => {

                        let label = this.props.ontology[i
                           .replace(/bdo:/,"http://purl.bdrc.io/ontology/core/")
                           .replace(/adm:/,"http://purl.bdrc.io/ontology/admin/")
                        ]["http://www.w3.org/2000/01/rdf-schema#label"][0].value

                        //if(label) label = label["http://www.w3.org/2000/01/rdf-schema#label"]
                        //if(label) label = label[0].value


                        let show = false //(this.props.facets&&this.props.facets[i] && !this.props.facets[i].hash)
                        if(!this.props.facets || !this.props.facets[i] || !this.props.facets[i].hash ) show = true

                        //console.log("label",i,label,this.props.facets,counts["datatype"][i])

                        let values = this.props.facets
                        if(values) values = values[i]
                        if(values) values = values.results
                            //{...counts["datatype"][i]?{label:i + " ("+counts["datatype"][i]+")"}:{label:i}}
                        if(values && values.bindings && values.bindings.unshift && values.bindings[0]) {
                              if(values.bindings[0].val && values.bindings[0].val.value && values.bindings[0].val.value != "Any") {
                                 values.bindings.sort(function(a,b){ return Number(a.cid.value) < Number(b.cid.value) } )
                                 values.bindings.unshift({
                                    cid:{datatype: "http://www.w3.org/2001/XMLSchema#integer", type: "literal", value:"?" },
                                    val:{type: "uri", value: "Any"}
                                 })
                              }
                              let n = counts["datatype"][this.state.filters.datatype[0]]
                              if(n) {
                                 values.bindings[0].cid.value = n
                              }
                        }


                        return (
                           <div key={label}>
                              {  show &&
                                 <Loader loaded={false} className="facetLoader" style={{position:"relative"}}/>
                              }
                              <ListItem
                                 style={{display:"flex",justifyContent:"space-between",padding:"0 20px",borderBottom:"1px solid #bbb",cursor:"pointer"}}
                                 onClick={(e) => {
                                    if(!show)
                                       this.setState({collapse:{ ...this.state.collapse, [i]:!this.state.collapse[i]} }); } }
                                 >
                                 <Typography style={{fontSize:"18px",lineHeight:"50px",textTransform:"capitalize"}}>{label}</Typography>
                                 { !show && this.state.collapse[i] ? <ExpandLess /> : <ExpandMore />  }
                              </ListItem>
                              <Collapse
                                 className={["collapse",!show && this.state.collapse[i]?"open":"close"].join(" ")}
                                 in={!show && this.state.collapse[i]}
                                  style={{padding:"10px 0 0 50px"}} >
                                  <div>
                                  {
                                     this.props.facets && this.props.facets[i] &&
                                     values && values.bindings.map((j,idx) => {

                                           //console.log("counts",i,counts["datatype"][i])

                                             if(!j.val || j.cid.value == 0) return  ;

                                           let value = this.props.ontology[j.val.value]

                                           //console.log("value",value)

                                           if(value) value = value["http://www.w3.org/2000/01/rdf-schema#label"] ;
                                           if(value) {
                                              for(let l of value) {
                                                 if(l.lang == "en") { value = l.value; break; }
                                              }
                                              //if(value.length) value = value[0].value;
                                           }

                                           let uri = j.val.value;
                                           if(!value) value = uri.replace(/^.*\/([^/]+)$/,"$1")

                                           //console.log("value",j,value)

                                           let checked = this.state.filters.facets && this.state.filters.facets[i]

                                           if(!checked) checked = false ;
                                           else checked = this.state.filters.facets[i].indexOf(uri) !== -1


                                           // console.log("checked",checked,i,uri)

                                        return (
                                           <div key={value} style={{textAlign:"left",textTransform:"capitalize"}}>
                                              <FormControlLabel
                                                 control={
                                                    <Checkbox
                                                       //{...i=="Any"?{defaultChecked:true}:{}}
                                                       checked={checked}
                                                       icon={<span className='checkB'/>}
                                                       checkedIcon={<span className='checkedB'><CheckCircle style={{color:"#444",margin:"-3px 0 0 -3px",width:"26px",height:"26px"}}/></span>}
                                                       //onChange={(event, checked) => this.handleFacetCheck(event,i,uri,checked)}
                                                    />

                                                 }
                                                 //{...counts["datatype"][i]?{label:i + " ("+counts["datatype"][i]+")"}:{label:i}}
                                                 label={value+ " ("+j.cid.value+")" }
                                              />
                                           </div>
                                        )
                                     }
                                  )}
                                  </div>
                              </Collapse>
                           </div>
                        )
                        }
                     )
                  */ }
                  </div>
               }
            </div>
            <div className="SearchPane" >
               <div>
               { this.props.loading && <Loader/> }
               <SearchBar
                  disabled={this.props.hostFailure}
                  onChange={(value:string) => { this.setState({keyword:value, dataSource: [ value, "possible suggestion","another possible suggestion"]}); } }
                  onRequestSearch={this.requestSearch.bind(this)}
                  value={this.props.hostFailure?"Endpoint error: "+this.props.hostFailure+" ("+this.getEndpoint()+")":this.props.keyword?this.props.keyword.replace(/"/g,""):this.state.keyword}
                  style={{
                     marginTop: '50px',
                     width: "700px"
                  }}
               />
              <FormControl className="formControl" style={{textAlign:"left"}}>
                <InputLabel htmlFor="language"><Translate value="lang.lg"/></InputLabel>
                <Select
                  value={this.state.language}
                  onChange={this.handleLanguage}
                  inputProps={{
                    name: 'language',
                    id: 'language',
                  }}
                >
                   { Object.keys(languages).map((k) => (<MenuItem value={k}><Translate value={""+languages[k]}/></MenuItem>))}
                </Select>
              </FormControl>
           </div>
               { false && this.state.keyword.length > 0 && this.state.dataSource.length > 0 &&
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
                  </div>
               }
               <List style={{maxWidth:"800px",margin:"50px auto",textAlign:"left",zIndex:0}}>
                  { message }
                  <div id="pagine">
                     <NavigateBefore
                        className={this.state.paginate.index == 0 ? "hide":""}
                        onClick={this.prevPage.bind(this)}/>
                     <NavigateNext
                        className={this.state.paginate.index == this.state.paginate.pages.length - 1 ? "hide":""}
                        onClick={this.nextPage.bind(this)} />
                  </div>
               </List>
            </div>
            <div className="SidePane right" style={{width:"25%",paddingTop:"150px"}}>
               <div style={{width:"333px",float:"left",position:"relative"}}>
                  <Typography style={{fontSize:"30px",marginBottom:"20px",textAlign:"left"}}>
                     <Translate value='Rsidebar.title' />
                  </Typography>
                  {
                     widget(I18n.t('Rsidebar.UI.title'),"locale",
                           ["zh", "en", "fr", "bo" ].map((i) => {

                           let label = I18n.t("lang."+i);
                           let disab = ["fr","en"].indexOf(i) === -1

                           return ( <div key={i} style={{width:"150px",textAlign:"left"}}>
                              <FormControlLabel
                                 control={
                                    <Checkbox
                                       checked={i === this.props.locale}
                                       disabled={disab}
                                       className={"checkbox "+ (disab?"disabled":"")}
                                       icon={<span className='checkB'/>}
                                       checkedIcon={<span className='checkedB'><CheckCircle style={{color:"#444",margin:"-3px 0 0 -3px",width:"26px",height:"26px"}}/></span>}
                                       onChange={(event, checked) => this.handleCheckUI(event,"locale",i,checked)}                                    />

                                 }
                                 label={label}
                              />
                           </div>)}))
                  }{
                     widget(I18n.t("Rsidebar.results.title"),"language",
                           Object.keys(languages).map((i) => <div key={i} style={{width:"200px",textAlign:"left"}}>
                              <FormControlLabel
                                 control={
                                    <Checkbox
                                       checked={i === this.props.prefLang}
                                       disabled={false}
                                       className="checkbox"
                                       icon={<span className='checkB'/>}
                                       checkedIcon={<span className='checkedB'><CheckCircle style={{color:"#444",margin:"-3px 0 0 -3px",width:"26px",height:"26px"}}/></span>}
                                       onChange={(event, checked) => this.handleCheckUI(event,"prefLang",i,checked)}
                                    />

                                 }
                                 label={I18n.t(languages[i])}
                              />
                           </div> ))
                  }
               </div>
            </div>
         </div>
      </div>
      );
   }
}

export default withStyles(styles)(App);
