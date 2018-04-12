// @flow
import React, { Component } from 'react';
import SearchBar from 'material-ui-search-bar'
import Paper from 'material-ui/Paper';
import {MenuItem} from 'material-ui/Menu';
import Button from 'material-ui/Button';
import List,{ListItemText,ListItem} from 'material-ui/List';
import Typography from 'material-ui/Typography';
import Loader from 'react-loader';
import Collapse from 'material-ui/transitions/Collapse';
import ExpandLess from 'material-ui-icons/ExpandLess';
import ExpandMore from 'material-ui-icons/ExpandMore';
import CheckCircle from 'material-ui-icons/CheckCircle';
import Checkbox from 'material-ui/Checkbox';
import FormControlLabel from 'material-ui/Form/FormControlLabel';
import { withStyles } from 'material-ui/styles';
import gray from 'material-ui/colors/green';
import { Link } from 'react-router-dom'
import Input, { InputLabel } from 'material-ui/Input';
import { FormControl, FormHelperText } from 'material-ui/Form';
import Select from 'material-ui/Select';
import qs from 'query-string'

import './App.css';

const adm  = "http://purl.bdrc.io/ontology/admin/" ;
const bdo  = "http://purl.bdrc.io/ontology/core/";
const bdr  = "http://purl.bdrc.io/resource/";
const rdf  = "http://www.w3.org/1999/02/22-rdf-syntax-ns#";
const rdfs = "http://www.w3.org/2000/01/rdf-schema#";
const skos = "http://www.w3.org/2004/02/skos/core#";

const prefixes = [adm, bdo,bdr,rdf,rdfs,skos]

const languages = {
   "zh-hant":"Chinese (Hanzi)",
   "zl-latn-pinyin":"Chinese (Pinyin)",
   "en":"English",
   "sa-x-iast":"Sanskrit (IAST)",
   "sa-Deva":"Sanskrit (Devanagari)",
   "bo":"Tibetan (Unicode)",
   "bo-x-ewts":"Tibetan (EWTS)"
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
   datatypes:boolean|{},
   history:{},
   ontology:{},
   onStartSearch:(k:string,lg:string)=>void,
   onSearchingKeyword:(k:string,lg:string,t?:string[])=>void,
   onGetDatatypes:(k:string,lg:string)=>void,
   onCheckDatatype:(t:string,k:string,lg:string)=>void,
   onGetFacetInfo:(k:string,lg:string,f:string)=>void,
   onCheckFacet:(k:string,lg:string,f:{[string]:string})=> void
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
         filters: {datatype:get.t?get.t.split(","):["Any"]},
         dataSource: [],
         keyword:get.q?get.q.replace(/"/g,""):"",
         collapse:{},
         loader:{}
      };

   }

   requestSearch()
   {
      let key = this.state.keyword ;
      if(key == "") return ;
      if(key.indexOf("\"") === -1) key = "\""+key+"\""

      let state = { ...this.state, dataSource:[] }

      if(this.state.filters.datatype.length === 0 || this.state.filters.datatype.indexOf("Any") !== -1 )
      {
         if(!this.props.searches[key+"@"+this.state.language])
            this.props.onStartSearch(key,this.state.language)

         state = { ...state, facets:null}

         //this.props.onGetDatatypes(this.state.keyword,this.state.language)

         this.props.history.push("/search?q="+key+"&lg="+this.state.language+"&t=Any")

      }
      else { // TODO search with types already chosen TODO
         /*
         if(!this.props.datatypes) this.props.onStartSearch(this.state.keyword,this.state.language)

         this.props.onSearchingKeyword(key,this.state.language,this.state.filters.datatype)

         state = this.setFacets(this.props,state,this.state.filters.datatype[0]);

         this.props.history.push("/search?q="+key+"&lg="+this.state.language+"&t="+this.state.filters.datatype.join(","))
         */
      }

      this.setState(state);

      console.log("search",this.state)
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
         this.requestSearch();
         state = { ...state, willSearch:false}
         update = true ;
      }


      // console.log("newProps.facets",newProps.facets)


      if(state.keyword != "" && newProps.config.facets && !this._facetsRequested && !state.facets && state.filters.datatype.length > 0 && state.filters.datatype.indexOf("Any") === -1)
      {
         this._facetsRequested = true ;
         state = this.setFacets(newProps,state,state.filters.datatype[0])
         console.log("facets ???",state)
         update = true ;
      }


      if(update) this.setState(state)


      console.log("willUfin",this.state.filters.datatype)
   }

   setFacets = (props:Props,state:State,lab:string) =>
   {
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

   handleCheck = (ev:Event,lab:string,val:boolean) => {

      console.log("check",lab,val,'('+this.state.keyword+')')

      /* // to be continued ...
      let f = this.state.filters.datatype
      if(f.indexOf(lab) != -1 && !val) f.splice(f.indexOf(lab),1)
      else if(f.indexOf(lab) == -1 && val) f.push(lab)
      */

      let f = [lab]

      let state =  {  ...this.state,  filters: {  ...this.state.filters, datatype:f } }

      if(val && this.props.keyword)
      {

         let key = this.state.keyword ;
         if(key.indexOf("\"") === -1) key = "\""+key+"\""

         if(lab != "Any") {

            this.props.onCheckDatatype(lab,key,this.state.language)

            state = this.setFacets(this.props,state,lab);


         }
         else {

            state = { ...state, facets:null}

            this.props.onSearchingKeyword(key,this.state.language,f)

            // no need because same search
            //this.props.onGetDatatypes(this.state.keyword,this.state.language)
         }


         this.props.history.push("/search?q="+key+"&lg="+this.state.language+"&t="+f.join(","))
      }


      if(!val)
      {

         state = {  ...this.state,  filters: {  ...this.state.filters, datatype:["Any"] } }

         if(this.props.keyword && this.state.filters.datatype && this.state.filters.datatype.indexOf(lab) !== -1)
         {

            let key = this.state.keyword ;
            if(key == "") return ;
            if(key.indexOf("\"") === -1) key = "\""+key+"\""

            state = { ...state, facets:null}
            this.props.onSearchingKeyword(key,this.state.language)

            // no need because same saerch...
            //this.props.onGetDatatypes(this.state.keyword,this.state.language)

            this.props.history.push("/search?q="+key+"&lg="+this.state.language+"&t=Any");
         }
      }

      this.setState( state ) //, function() {  console.log("CHECKED changed the state",state) } )
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

     fullname(prop:string)
     {
        if(this.props.ontology[prop] && this.props.ontology[prop][rdfs+"label"] && this.props.ontology[prop][rdfs+"label"][0]
        && this.props.ontology[prop][rdfs+"label"][0].value) {
           return this.props.ontology[prop][rdfs+"label"][0].value
        }

        return this.pretty(prop)
     }

     highlight(val,k):string
     {

        val = val.replace(/@.*/,"").split(new RegExp(k.replace(/ /g,"[ -]"))).map((l) => ([<span>{l}</span>,<span className="highlight">{k}</span>])) ;
        val = [].concat.apply([],val);
        val.pop();
        return val;
     }

   render() {

      console.log("render",this.props,this.state)

      let message = [];
      let results ;
      let facetList = []
      let types = ["Any"]
      let loader ;
      let counts = { "datatype" : { "Any" : 0 } }

      console.log("results?",results,this.props.searches[this.props.keyword+"@"+this.props.language])

      if(this.props.keyword && (results = this.props.searches[this.props.keyword+"@"+this.props.language]))
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
               console.log("dtp?",this.props.datatypes)
            }
            else {

               //if(this.state.loader.datatype)
               //   this.setState({ loader: { ...this.state.loader, datatype:false }})

               console.log("whatelse");

               if( this.props.datatypes.metadata) for(let r of Object.keys(this.props.datatypes.metadata) ){

                  //r = r.bindings
                  let typ = r.replace(/^.*?([^/]+)$/,"$1")

                  console.log("typ",typ)

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

                  console.log("counts",counts)

               }
            }

            let list = results.results.bindings

            if(!list.length) list = Object.keys(list).map((o) => (
            {
                f  : { type: "uri", value:list[o].type },
                lit: { ...list[o].label, value:list[o].label.value.replace(/@.*$/,"")},
                s  : { type: "uri", value:o },
                match: list[o].matching
            } ) )
            console.log("list",list)

            let displayTypes = types //["Person"]

            for(let t of displayTypes) {

               if(t === "Any") continue ;

               message.push(<MenuItem><h4>{t+"s"+(counts["datatype"][t]?" ("+counts["datatype"][t]+")":"")}</h4></MenuItem>);

               let cpt = 0;
               n = 0;
               for(let r of list)
               {
                  // console.log("r",r);
                  let k = this.props.keyword.replace(/"/g,"")

                  let id = r.s.value.replace(/^.*?([^/]+)$/,"$1")
                  let lit ;
                  if(r.lit) { lit = this.highlight(r.lit.value,k) }
                  let typ = r.f.value.replace(/^.*?([^/]+)$/,"$1")


                  //if(this.state.filters.datatype.length == 0 || this.state.filters.datatype.indexOf("Any") !== -1 || this.state.filters.datatype.indexOf(typ) !== -1)
                  if(typ === t)
                  {
                     //console.log("lit",lit)

                     n ++;
                     message.push(
                        [
                     <Link key={n} to={"/show/bdr:"+id} className="result">

                        <Button key={t+"_"+n+"_"}>
                              <ListItem style={{paddingLeft:"0",display:"flex"}}>
                                 <div style={{width:"30px",textAlign:"right"}}>{n}</div>
                                 <ListItemText style={{height:"auto",flexGrow:10,flexShrink:10}}
                                    primary={lit}
                                    secondary={id}
                                 />
                              </ListItem>
                        </Button>

                     </Link>
                        ,
                        <div>{r.match.map((m) =>
                           (!m.type.match(new RegExp(skos+"prefLabel"))?
                              <div className="match">
                                 <span className="label">{this.fullname(m.type)}:&nbsp;</span>
                                 <span>{this.highlight(m.value,k)}</span>
                              </div>
                           :null))}</div>
                     ]

                     )

                     cpt ++;
                     if(displayTypes.length > 2) {
                        if(cpt >= 3) break;
                     } else {
                        if(cpt >= 50) break;
                     }
                  }
               }
            }

            //console.log("message",message)

            /*
            <Typography>{r.lit}</Typography>
            */
         }
      }

      if(!results)
      {
         types = ["Any","Person","Work","Corporation","Place","Item","Etext","Role","Topic","Lineage"]
         types = types.sort()
      }

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
            <div className="SidePane" style={{width:"25%",paddingTop:"150px"}}>
               { //this.props.datatypes && (results ? results.numResults > 0:true) &&
                  <div style={{width:"333px",float:"right",position:"relative"}}>
                     <Typography style={{fontSize:"30px",marginBottom:"20px",textAlign:"left"}}>Refine Your Search</Typography>
                     <ListItem
                        style={{display:"flex",justifyContent:"space-between",padding:"0 20px",borderBottom:"1px solid #bbb",cursor:"pointer"}}
                        onClick={(e) => { this.setState({collapse:{ ...this.state.collapse, "collection":!this.state.collapse["collection"]} }); } }
                        >
                        <Typography style={{fontSize:"18px",lineHeight:"50px",}}>Collection</Typography>
                        { this.state.collapse["collection"] ? <ExpandLess /> : <ExpandMore />}
                     </ListItem>
                     <Collapse
                        in={this.state.collapse["collection"]}
                        className={["collapse",this.state.collapse["collection"]?"open":"close"].join(" ")}
                        style={{padding:"10px 0 0 50px"}} // ,marginBottom:"30px"
                        >
                           { ["BDRC" ,"rKTs" ].map((i) => <div key={i} style={{width:"150px",textAlign:"left"}}>
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
                              />
                           </div> )}
                     </Collapse>
                     {  this.props.datatypes && !this.props.datatypes.hash &&
                        <Loader loaded={false} className="datatypesLoader" style={{position:"relative"}}/>
                     }
                     <ListItem
                        style={{display:"flex",justifyContent:"space-between",padding:"0 20px",borderBottom:"1px solid #bbb",cursor:"pointer"}}
                        onClick={(e) => {
                           if(!(this.props.datatypes && !this.props.datatypes.hash))
                              this.setState({collapse:{ ...this.state.collapse, "datatype":!this.state.collapse["datatype"]} }); } }
                        >
                        <Typography style={{fontSize:"18px",lineHeight:"50px",}}>Data Type</Typography>
                        { this.props.datatypes && this.props.datatypes.hash && !this.state.collapse["datatype"] ? <ExpandLess /> : <ExpandMore />  }
                     </ListItem>
                     <Collapse
                        in={this.props.datatypes && this.props.datatypes.hash && !this.state.collapse["datatype"]}
                        className={["collapse",  !(this.props.datatypes && !this.props.datatypes.hash)&&this.state.collapse["datatype"]?"open":"close"].join(" ")}
                         style={{padding:"10px 0 0 50px"}} >
                        <div>
                        { //facetList&&facetList.length > 0?facetList.sort((a,b) => { return a.props.label < b.props.label } ):
                              types.map((i) => {

                                 //console.log("counts",i,counts["datatype"][i])



                              return (
                                 <div key={i} style={{textAlign:"left"}}>
                                    <FormControlLabel
                                       control={
                                          <Checkbox
                                             className="checkbox disabled"
                                             disabled={true}
                                             //{...i=="Any"?{defaultChecked:true}:{}}
                                             checked={this.state.filters.datatype.indexOf(i) !== -1}
                                             icon={<span className='checkB'/>}
                                             checkedIcon={<span className='checkedB'><CheckCircle style={{color:"#444",margin:"-3px 0 0 -3px",width:"26px",height:"26px"}}/></span>}
                                             //onChange={(event, checked) => this.handleCheck(event,i,checked)}
                                          />

                                       }
                                       {...counts["datatype"][i]?{label:i + " ("+counts["datatype"][i]+")"}:{label:i}}
                                    />
                                 </div>
                              )
                           }
                        )}
                        </div>
                     </Collapse>
                     { this.state.facets && this.props.ontology && this.state.facets.map((i) => {

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
                                                       onChange={(event, checked) => this.handleFacetCheck(event,i,uri,checked)}
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
                  }
                  </div>
               }
            </div>
            <div className="SearchPane" style={{width:"50%"}}>
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
                <InputLabel htmlFor="language">Language</InputLabel>
                <Select
                  value={this.state.language}
                  onChange={this.handleLanguage}
                  inputProps={{
                    name: 'language',
                    id: 'language',
                  }}
                >
                   { Object.keys(languages).map((k) => (<MenuItem value={k}>{languages[k]}</MenuItem>))}
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
               </List>
            </div>
            <div className="Pane" style={{width:"25%"}}>
            </div>
         </div>
      </div>
      );
   }
}

export default withStyles(styles)(App);
