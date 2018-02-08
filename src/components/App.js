// @flow
import React, { Component } from 'react';
import SearchBar from 'material-ui-search-bar'
import Paper from 'material-ui/Paper';
import {MenuItem} from 'material-ui/Menu';
import Button from 'material-ui/Button';
import List,{ListItemText,ListItem} from 'material-ui/List';
import Typography from 'material-ui/Typography';
import Loader from 'react-loader';

import './App.css';

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
         keyword:""
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

      if(this.props.keyword && (results = this.props.searches[this.props.keyword]))
      {
         let n = 0 ;
         if(results.numResults == 0) {
            message =
               <Typography style={{fontSize:"1.5em",maxWidth:'700px',margin:'50px auto',zIndex:0}}>
                  No result found.
               </Typography>
         }
         else for(let r of results.rows)
         {
            r = r.dataRow
            n ++;
            message.push(
               <Button key={n} style={{padding:"0",marginBottom:"15px",width:"100%",textTransform:"none"}}>
                  <ListItem style={{paddingLeft:"0"}}>
                     <div style={{width:"30px",textAlign:"right"}}>{n}</div>
                     <ListItemText style={{width:"calc(100% - 30px)",height:"auto"}}
                        primary={r.lit.replace(/@[a-z-]+$/,"").replace(/^(.{80}[^ ]+)(.*)$/,"$1 (...)")}
                        secondary={r.s.replace(/.*> ([^<]+)<(.*)/,"$1")} />
                  </ListItem>
               </Button>
            )
            /*
            <Typography>{r.lit}</Typography>
            */
         }
      }

      return (
         <div className="App">
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
      );
   }
}

export default App;
