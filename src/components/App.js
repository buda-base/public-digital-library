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
   onSearchingKeyword:(k:string)=>void
}
type State = {
   keyword:string,
   dataSource : string[]
}

class App extends Component<Props,State> {

   constructor(props : Props) {
      super(props);

      this.requestSearch.bind(this);

      this.state = {
         dataSource: [],
         keyword:"",
         collapse:{
            datatype:true
         }
      };
   }

   requestSearch()
   {
      this.setState({dataSource:[]})
      console.log("search",this.state)
      this.props.onSearchingKeyword(this.state.keyword)
   }

   getEndpoint():string
   {
      return this.props.config.ldspdi.endpoints[this.props.config.ldspdi.index]
   }

   render() {
      // console.log("render",this.props,this.state)

      let message = [];
      let results ;
      let facetList = []
      let types = []

      if(this.props.keyword && (results = this.props.searches[this.props.keyword]))
      {
         let n = 0 ;
         if(results.numResults == 0) {
            message.push(
               <Typography style={{fontSize:"1.5em",maxWidth:'700px',margin:'50px auto',zIndex:0}}>
                  No result found.
               </Typography>
            )
         }
         else for(let r of results.rows)
         {
            r = r.dataRow
            n ++;
            let lit = r.lit.replace(/@[a-z-]+$/,"") ; /*.replace(/^(.{73}[^ ]+)(.*)$/,"$1 (...)") */
            let typ = r.f.replace(/.*> ([^<]+)<(.*)/,"$1");
            let id = r.s.replace(/.*> ([^<]+)<(.*)/,"$1")

            message.push(
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
            )

            if(types.indexOf(typ) === -1)
            {
               types.push(typ);
               facetList.push(
                  <div style={{width:"150px",textAlign:"left"}}>
                  <FormControlLabel
                     control={
                        <Checkbox
                           icon={<span class='checkB'/>}
                           checkedIcon={<span class='checkedB'><CheckCircle style={{color:"#444",margin:"-3px 0 0 -3px",width:"26px",height:"26px"}}/></span>} />
                     }
                     label={typ} />
                  </div>
               )
            }
            /*
            <Typography>{r.lit}</Typography>
            */
         }
      }

      const { classes } = this.props;

      return (
         <div className="App" style={{display:"flex"}}>
            <div className="SidePane" style={{width:"25%",paddingTop:"150px"}}>
               { message.length > 0 &&
                  <div style={{width:"333px",float:"right"}}>
                     <Typography style={{fontSize:"30px",marginBottom:"20px",textAlign:"left"}}>Refine Your Search</Typography>
                     <ListItem
                        style={{display:"flex",justifyContent:"space-between",padding:"0 20px",borderBottom:"1px solid #bbb",cursor:"pointer"}}
                        onClick={(e) => { this.setState({collapse:{datatype:!this.state.collapse.datatype} }); } }
                        >
                        <Typography style={{fontSize:"18px",lineHeight:"50px",}}>Data Type</Typography>
                        {this.state.collapse.datatype ? <ExpandLess /> : <ExpandMore />}
                     </ListItem>
                     <Collapse
                        in={this.state.collapse.datatype}
                        style={{display:"flex",justifyContent:"flex-start",padding:"10px 0 0 50px"}}
                        >
                        {facetList}
                     </Collapse>
                  </div>
               }
            </div>
            <div className="SearchPane" style={{width:"50%"}}>
               { this.props.loading && <Loader/> }
               <SearchBar
                  disabled={this.props.hostFailure}
                  onChange={(value:string) => { this.setState({keyword:value, dataSource: [ value, "possible suggestion","another possible suggestion"]}); } }
                  onRequestSearch={this.requestSearch.bind(this)}
                  value={this.props.hostFailure?"Endpoint error: "+this.props.hostFailure+" ("+this.getEndpoint()+")":this.state.keyword}
                  style={{
                     margin: '50px auto 0 auto',
                     maxWidth: "700px"
                  }}
               />
               { this.state.keyword.length > 0 && this.state.dataSource.length > 0 &&
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
      );
   }
}

export default withStyles(styles)(App);
