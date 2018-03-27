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
   searches:{[string]:{}},
   hostFailure?:string,
   loading?:boolean,
   keyword?:string,
   datatypes:boolean|{},
   history:{},
   onSearchingKeyword:(k:string,lg:string,t:string[])=>void,
   onGetDatatypes:(k:string,lg:string)=>void,
   onCheckDatatype:(t:string,k:string,lg:string)=>void
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
   collapse:{ [string] : boolean }
}

class App extends Component<Props,State> {

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
         collapse:{ "collection":false}
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

   componentWillUpdate() {

   }

   componentDidUpdate()
   {
      if(this.state.willSearch)
      {
         this.requestSearch();
         this.setState({willSearch:false})
      }

      if(this.props.keyword && !this.props.gettingDatatypes && !this.props.datatypes)
      {
         this.props.onGetDatatypes(this.state.keyword,this.state.language)
      }
   }

   handleCheck = (ev:Event,lab:string,val:boolean) => {

      console.log("check",lab,val)

      /* // to be continued ...
      let f = this.state.filters.datatype
      if(f.indexOf(lab) != -1 && !val) f.splice(f.indexOf(lab),1)
      else if(f.indexOf(lab) == -1 && val) f.push(lab)
      */
      let f = [lab]

      this.setState(
         {
            ...this.state,
            filters:
            {
               ...this.state.filters,
               datatype:f
            }
         }
      )

      if(val && this.props.keyword)
      {
         let key = this.state.keyword ;
         if(key.indexOf("\"") === -1) key = "\""+key+"\""
         if(lab != "Any") this.props.onCheckDatatype(lab,key,this.state.language)
         else this.props.onSearchingKeyword(key,this.state.language,f)
         this.props.history.push("/search?q="+key+"&lg="+this.state.language+"&t="+f.join(","))
      }
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
               loader = <Loader loaded={false} className="datatypesLoader" style={{position:"relative"}}/>

            }
            else if( this.props.datatypes.results) for(let r of this.props.datatypes.results.bindings){

               //r = r.bindings
               let typ = r.f.value.replace(/^.*?([^/]+)$/,"$1")

               if(typ != "" && types.indexOf(typ) === -1)
               {
                  m++;

                  types.push(typ);

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
                        { !this.state.collapse["collection"] ? <ExpandLess /> : <ExpandMore />}
                     </ListItem>
                     <Collapse
                        in={!this.state.collapse["collection"]}
                        style={{display:"flex",justifyContent:"flex-start",padding:"10px 0 0 50px",marginBottom:"30px"}}
                        >
                           { ["BDRC" ,"rKTs" ].map((i) => <div key={i} style={{width:"150px",textAlign:"left"}}>
                              <FormControlLabel
                                 control={
                                    <Checkbox
                                       {... i=="rKTs" ?{}:{defaultChecked:true}}
                                       disabled={true}
                                       icon={<span className='checkB'/>}
                                       checkedIcon={<span className='checkedB'><CheckCircle style={{color:"#444",margin:"-3px 0 0 -3px",width:"26px",height:"26px"}}/></span>}
                                       //onChange={(event, checked) => this.handleCheck(event,i,checked)}
                                    />

                                 }
                                 label={i}
                              />
                           </div> )}
                     </Collapse>
                     <ListItem
                        style={{display:"flex",justifyContent:"space-between",padding:"0 20px",borderBottom:"1px solid #bbb",cursor:"pointer"}}
                        onClick={(e) => { this.setState({collapse:{ ...this.state.collapse, "datatype":!this.state.collapse["datatype"]} }); } }
                        >
                        <Typography style={{fontSize:"18px",lineHeight:"50px",}}>Data Type</Typography>
                        { !this.state.collapse["datatype"] ? <ExpandLess /> : <ExpandMore />}
                     </ListItem>
                     <Collapse
                        in={!this.state.collapse["datatype"]}
                        style={{display:"flex",justifyContent:"flex-start",padding:"10px 0 0 50px"}}
                        >
                        { //facetList&&facetList.length > 0?facetList.sort((a,b) => { return a.props.label < b.props.label } ):
                           types.map((i) =>
                        <div key={i} style={{width:"150px",textAlign:"left"}}>
                           <FormControlLabel
                              control={
                                 <Checkbox
                                    //{...i=="Any"?{defaultChecked:true}:{}}
                                    checked={this.state.filters.datatype.indexOf(i) !== -1}
                                    icon={<span className='checkB'/>}
                                    checkedIcon={<span className='checkedB'><CheckCircle style={{color:"#444",margin:"-3px 0 0 -3px",width:"26px",height:"26px"}}/></span>}
                                    onChange={(event, checked) => this.handleCheck(event,i,checked)} />

                              }
                              label={i}
                           />
                           </div>

                     )}
                     </Collapse>
                     {loader}
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
