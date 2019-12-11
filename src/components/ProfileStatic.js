
import React, { Component } from 'react';
import history from "../history"
import store from "../index"
import * as data  from "../state/data/actions"
import * as ui from "../state/ui/actions"
import {auth} from "../routes"
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import {shortUri,fullUri} from './App'
import Input from '@material-ui/core/Input';

import bdrcApi from '../lib/api' ;
import renderPatch from '../lib/rdf-patch.js' ; 

const api = new bdrcApi();

const bdg   = "http://purl.bdrc.io/graph/" ;
const bdgu  = "http://purl.bdrc.io/graph-nc/user/" ;
const bdgup = "http://purl.bdrc.io/graph-nc/user-private/" ;
const bdo   = "http://purl.bdrc.io/ontology/core/" ;
const bdou  = "http://purl.bdrc.io/ontology/ext/user/" ;
const bdr   = "http://purl.bdrc.io/resource/";
const foaf  = "http://xmlns.com/foaf/0.1/" ;
const skos  = "http://www.w3.org/2004/02/skos/core#";
const tmp   = "http://purl.bdrc.io/ontology/tmp/" ;

const propsMap = {  name: skos+"prefLabel", 
                    gender: bdo+"Gender", male: bdr+"GenderMale", female: bdr+"GenderFemale", "no-answer": bdr+"GenderNotSpecified",
                    interest: bdou+"interest", buddhism: tmp+"buddhism",
                    region: bdou+"mainResidenceArea", outside:tmp+"outside", kham:tmp+"kham", amdo:tmp+"amdo", "u-tsang":tmp+"u-tsang", other:tmp+"other" }

type Props = {
    userID?:url,
    profile:{}

}

type State = {
   name:string,
   gender:string,
   region:string,
   //affiliation:string,
   interest:string,
   patch?:{}
}

export class Profile extends Component<Props,State> {  

  constructor(props : Props) {
    super(props);
    this.state = { name:{type:"literal"}, gender:{value:""}, region:{value:""}, interest:{value:""} }
  }
  
  componentWillMount() {
    this.setState({ profile: {} });
    const { userProfile, getProfile } = this.props.auth;
    if (!userProfile) {
      getProfile((err, profile) => {
        this.setState({ profile });
        store.dispatch(data.getUser(profile))
      });
    } else {
      this.setState({ profile:userProfile });
      store.dispatch(data.getUser(userProfile))
    }
  }

  render() {

    const { profile } = this.state;
    
    console.log("profile",profile,this.state,this.props)
    
    let message = "Getting user info..."

    if(!profile || !Object.keys(profile).length) {
      if(!auth.isAuthenticated()) { 
        //message = <span>Please <a onclick={this.props.auth.login(this.props.history.location)}>log in</a></span>
        message = "Not logged in... Redirecting"
        this.tO = setTimeout(() => { 
          window.location.href = "/" 
        }, 1500)
        
      }
      return <div className="profile-container">{message}</div>
    }
    else {
        if(this.tO) clearTimeout(this.tO)

        let handleChange = (e,val1,val2) => {

          //console.log("e",e,val1,val2)

          let type = this.state[e.target.name].type
          if(!type) type = 'uri'
          let value = propsMap[e.target.value]
          if(!value) value = e.target.value

          let state = {...this.state, [e.target.name]:{ type, value } } 

          let mods = Object.keys(state).filter(k => k !== "patch" && state[k].type).reduce( (acc,k) => ({ ...acc, [propsMap[k]]: [ state[k] ] } ), {} )
          let id = shortUri(this.props.userID).split(':')[1]
          let graph = bdgu+id

          let that = { state: { resource:this.props.profile, updates:mods}, props:{ dictionary:this.props.dictionary, IRI:this.props.userID } }

          console.log("mods", mods, id, graph, that)

          state.patch = renderPatch(that, Object.keys(mods), graph)
          
          this.setState(state)
        }

        let val = { name:"", gender:"", interest:"", region:"" }
        for(let k of Object.keys(val)) {
          if(this.state[k] && this.state[k].value !== undefined) val[k] = this.state[k].value
          else if(this.props.profile && this.props.profile[propsMap[k]]) val.name = this.props.profile[propsMap[k]][0].value
        }

        return (
          <div className="profile-container resource user">
            <div className="profile-area">

              <h2>
                <div id="avatar">
                    {/* <a class="hover" onClick={(e) => this.togglePopover(e, bdou+"image", 0)} title={I18n.t("user.photo.hover")}><SettingsIcon/></a> */}
                    <img src={profile.picture} width="80"/>
                    {/* { this.renderPopover(bdou+"image", "user.photo", picUrl, 0) } */}
                </div>
                {this.props.profile?this.props.profile[foaf+"mbox"][0].value:null}
              </h2>

              {/* <h1><img src={profile.picture} alt="profile" />{this.props.profile?this.props.profile[foaf+"mbox"][0].value:null}</h1> */}
              { /*}
              <Panel header="Profile picture: ">
                <img src={profile.picture} alt="profile" /> 
                <div>
                  <ControlLabel><Glyphicon glyph="user" />Nickname: </ControlLabel>
                  <h3 style={{display:"inline-block"}}>{profile.nickname}</h3>
                </div>
                <pre>{JSON.stringify(profile, null, 2)}</pre>
              </Panel> 
              */}
              <form autoComplete="off">
                <FormControl className="FC">
                  <InputLabel htmlFor="name">Name</InputLabel>
                  <Input
                    value={val.name}
                    onChange={handleChange}
                    inputProps={{ name: 'name', id: 'name' }}
                  />
                </FormControl>
                <FormControl className="FC">
                  <InputLabel htmlFor="gender">Gender</InputLabel>
                  <Select
                    value={val.gender}
                    onChange={handleChange}
                    inputProps={{ name: 'gender', id: 'gender'}}
                  >
                    <MenuItem value={propsMap["male"]}>Male</MenuItem>
                    <MenuItem value={propsMap["female"]}>Female</MenuItem>
                    <MenuItem value={propsMap["no-answer"]}>Prefer not to answer</MenuItem>
                  </Select>
                </FormControl>

                <FormControl className="FC">
                  <InputLabel htmlFor="region">Area of Interest</InputLabel>
                  <Select
                    value={val.interest}
                    onChange={handleChange}
                    inputProps={{ name:"interest", id: 'interest'}}
                  >
                    <MenuItem value={propsMap["buddhism"]}>Buddhism</MenuItem>
                  </Select>
                </FormControl>

                <FormControl className="FC">
                  <InputLabel htmlFor="region">Cultural Region (if in China)</InputLabel>
                  <Select
                    value={this.state.region.value}
                    onChange={handleChange}
                    inputProps={{ name: 'region', id: 'region'}}
                  >
                    <MenuItem value={propsMap["outside"]}>Not applicable</MenuItem>
                    <MenuItem value={propsMap["kham"]}>Kham</MenuItem>
                    <MenuItem value={propsMap["amdo"]}>Amdo</MenuItem>
                    <MenuItem value={propsMap["u-tsang"]}>U-tsang</MenuItem>
                    <MenuItem value={propsMap["other"]}>Other</MenuItem>
                  </Select>
                </FormControl>
                {/* <br/> */}

                {/* <FormControl className="FC">
                  <InputLabel htmlFor="region">Affiliation</InputLabel>
                  <Select
                    value={this.state.affiliation}
                    onChange={handleChange}
                    inputProps={{ name:"affiliation", id: 'affiliation'}}
                  >
                    <MenuItem value={".."}>...</MenuItem>
                  </Select>
                </FormControl>
                 */}
                 
              </form>
              { this.state.patch }
              <h5 onClick={ (e) => { 
                let url = store.getState().ui.profileFromUrl
                if(!url) url = "/"
                history.push(url)
              }}>Back</h5>
            </div>
          </div>
      );
    }
  }
}

export default Profile ;