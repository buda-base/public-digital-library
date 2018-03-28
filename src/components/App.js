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
   datatypes:boolean|{},
   history:{},
   onSearchingKeyword:(k:string,lg:string,t?:string[])=>void,
   onGetDatatypes:(k:string,lg:string)=>void,
   onCheckDatatype:(t:string,k:string,lg:string)=>void,
   onGetFacetInfo:(k:string,lg:string,f:string)=>void
}

type State = {
   willSearch?:boolean,
   language:string,
   checked?:string,
   unchecked?:string,
   keyword:string,
   dataSource : string[],
   filters:{
      datatype:string[]
   },
   collapse:{ [string] : boolean },
   loader:{[string]:Component<*>}
}

class App extends Component<Props,State> {
   _facets : string[]  ;


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
     if(key.indexOf("\"") === -1) key = "\""+key+"\""

      this.setState({dataSource:[]})
      console.log("search",this.state)
      if(this.state.filters.datatype.length === 0 || this.state.filters.datatype.indexOf("Any") !== -1 )
      {
         this.props.onSearchingKeyword(key,this.state.language)
         this.props.history.push("/search?q="+key+"&lg="+this.state.language+"&t=Any")
      }
      else {
         this.props.onSearchingKeyword(key,this.state.language,this.state.filters.datatype)
         this.props.history.push("/search?q="+key+"&lg="+this.state.language+"&t="+this.state.filters.datatype.join(","))
      }

   }

   getEndpoint():string
   {
      return this.props.config.ldspdi.endpoints[this.props.config.ldspdi.index]
   }

   componentWillUpdate(newProps) {

      console.log("willU",this.props,newProps)

      let update = false ;
      let state = this.state ;

      if(state.willSearch)
      {
         this.requestSearch();
         state = { ...state, willSearch:false}
         update = true ;
      }

      if(!newProps.datatypes) //  !this.props.datatypes.hash )
      {
         this.props.onGetDatatypes(this.state.keyword,this.state.language)
      }

      if(!newProps.facets)
      {
         console.log("noFacet")

         if(this.props.config.facets && this.state.filters.datatype && this.state.filters.datatype.length > 0
          && this.state.filters.datatype.indexOf("Any") == -1)
          {

            if(this._facets) for(let f of this._facets) {

               this.props.onGetFacetInfo(this.state.keyword,this.state.language,f)

            }
         }
      }

      if(update) this.setState(state)
   }



   handleCheck = (ev:Event,lab:string,val:boolean) => {

      console.log("check",lab,val)

      /* // to be continued ...
      let f = this.state.filters.datatype
      if(f.indexOf(lab) != -1 && !val) f.splice(f.indexOf(lab),1)
      else if(f.indexOf(lab) == -1 && val) f.push(lab)
      */
      let f = [lab]

      let state =
         {
            ...this.state,
            filters:
            {
               ...this.state.filters,
               datatype:f
            }
         }

      if(val && this.props.keyword)
      {
         let key = this.state.keyword ;
         if(key.indexOf("\"") === -1) key = "\""+key+"\""
         if(lab != "Any") { this.props.onCheckDatatype(lab,key,this.state.language)  }
         else this.props.onSearchingKeyword(key,this.state.language,f)
         this.props.history.push("/search?q="+key+"&lg="+this.state.language+"&t="+f.join(","))
      }
      this.setState( state )
   }


  handleLanguage = event => {

     let s = { [event.target.name]: event.target.value }
     if(this.props.keyword) s = { ...s, willSearch:true }

     // console.log("handle",s)

     this.setState( s );
  };

   render() {

      console.log("render",this.props,this.state)

      let message = [];
      let results ;
      let facetList = []
      let types = ["Any"]
      let loader ;
      let counts = { "datatype" : { "Any" : 0 } }

      if(this.props.keyword && (results = this.props.searches[this.props.keyword+"@"+this.state.language]))
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
            if(!this.props.datatypes || !this.props.datatypes.results)
            {
            }
            else {

               //if(this.state.loader.datatype)
               //   this.setState({ loader: { ...this.state.loader, datatype:false }})

               if( this.props.datatypes.results) for(let r of this.props.datatypes.results.bindings){

                  //r = r.bindings
                  let typ = r.f.value.replace(/^.*?([^/]+)$/,"$1")

                  if(typ != "" && types.indexOf(typ) === -1)
                  {
                     m++;

                     types.push(typ);

                     counts["datatype"][typ]=Number(r.cid.value)
                     counts["datatype"]["Any"]+=Number(r.cid.value)

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
               }
            }

            for(let r of results.results.bindings)
            {
               //console.log("r",r);

               let id = r.s.value.replace(/^.*?([^/]+)$/,"$1")
               let lit ;
               if(r.lit) lit = r.lit.value
               let typ = r.f.value.replace(/^.*?([^/]+)$/,"$1")

               if(this.state.filters.datatype.length == 0 || this.state.filters.datatype.indexOf("Any") !== -1 || this.state.filters.datatype.indexOf(typ) !== -1)
               {
                  n ++;
                  message.push(
                     <Link to={"/resource?IRI="+id}>
                     <Button key={n} style={{padding:"0",marginBottom:"15px",width:"100%",textTransform:"none"}}>
                           <ListItem style={{paddingLeft:"0",display:"flex"}}>
                              <div style={{width:"30px",textAlign:"right"}}>{n}</div>
                              <ListItemText style={{height:"auto",flexGrow:10,flexShrink:10}}
                                 primary={lit }
                                 secondary={typ}
                              />
                              <div>{id}</div>
                           </ListItem>
                     </Button>
                  </Link>

                  )
               }
            }

            /*
            <Typography>{r.lit}</Typography>
            */
         }
      }

      if(!results) types = ["Any","Person","Work","Corporation","Place","Item","Etext","Role","Topic","Lineage"]

      types = types.sort()

         this._facets = null ;


         if(this.props.config.facets && this.state.filters.datatype && this.state.filters.datatype.length > 0
          && this.state.filters.datatype.indexOf("Any") == -1)
          {
             this._facets = this.props.config.facets.simple["bdo:"+this.state.filters.datatype[0]]

         }
         console.log("facets",this._facets,this.props.config.facets,this.state.filters.datatype)

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
                        className={["collapse",this.state.collapse["collection"]?"open":"close"]}
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
                        onClick={(e) => { this.setState({collapse:{ ...this.state.collapse, "datatype":!this.state.collapse["datatype"]} }); } }
                        >
                        <Typography style={{fontSize:"18px",lineHeight:"50px",}}>Data Type</Typography>
                        { this.state.collapse["datatype"] ? <ExpandLess /> : <ExpandMore />}
                     </ListItem>
                     <Collapse
                        in={this.state.collapse["datatype"]}
                        className={["collapse",  this.state.collapse["datatype"]?"open":"close"]}
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
                                             //{...i=="Any"?{defaultChecked:true}:{}}
                                             checked={this.state.filters.datatype.indexOf(i) !== -1}
                                             icon={<span className='checkB'/>}
                                             checkedIcon={<span className='checkedB'><CheckCircle style={{color:"#444",margin:"-3px 0 0 -3px",width:"26px",height:"26px"}}/></span>}
                                             onChange={(event, checked) => this.handleCheck(event,i,checked)} />

                                       }
                                       {...counts["datatype"][i]?{label:i + " ("+counts["datatype"][i]+")"}:{label:i}}
                                    />
                                 </div>
                              )
                           }
                        )}
                        </div>
                     </Collapse>
                     { this._facets && this.props.ontology && this._facets.map((i) => {

                        let label = this.props.ontology[i.replace(/bdo:/,"http://purl.bdrc.io/ontology/core/")]
                           ["http://www.w3.org/2000/01/rdf-schema#label"][0].value

                        console.log("label",i,label)

                        return (
                           <div>
                              {  this.props.facets&&this.props.facets[i] && !this.props.facets[i].hash &&
                                 <Loader loaded={false} className="facetLoader" style={{position:"relative"}}/>
                              }
                              <ListItem
                                 style={{display:"flex",justifyContent:"space-between",padding:"0 20px",borderBottom:"1px solid #bbb",cursor:"pointer"}}
                                 onClick={(e) => { this.setState({collapse:{ ...this.state.collapse, [i]:!this.state.collapse[i]} }); } }
                                 >
                                 <Typography style={{fontSize:"18px",lineHeight:"50px",textTransform:"capitalize"}}>{label}</Typography>
                                 { this.state.collapse[i] ? <ExpandLess /> : <ExpandMore />}
                              </ListItem>
                              <Collapse
                                 className={["collapse",this.state.collapse[i]?"open":"close"]}
                                 in={this.state.collapse[i]}
                                  style={{padding:"10px 0 0 50px"}} >
                                 <div>
                                 {}
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
                   <MenuItem value="zh">Chinese</MenuItem>
                   <MenuItem value="en">English</MenuItem>
                  <MenuItem value="bo">Tibetan</MenuItem>
                  <MenuItem value="bo-x-ewts">Tibetan (Wylie)</MenuItem>
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
