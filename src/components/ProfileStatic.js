
import React, { Component } from 'react';
import history from "../history"
import store from "../index"
import * as data  from "../state/data/actions"
import * as ui from "../state/ui/actions"
import {auth} from "../routes"
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import CheckBoxOutlineBlank from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBox from '@material-ui/icons/CheckBox';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import {shortUri,fullUri} from './App'
import Input from '@material-ui/core/Input';

import bdrcApi from '../lib/api' ;
import renderPatch from '../lib/rdf-patch.js' ; 
import { top_right_menu, report_GA, getGDPRconsent } from './App'
import { top_left_menu } from './ResourceViewer'
import LanguageSidePaneContainer from '../containers/LanguageSidePaneContainer';

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

const propsMap = {  name: skos+"prefLabel", email: foaf+"mbox",
                    gender: bdo+"personGender", male: bdr+"GenderMale", female: bdr+"GenderFemale", "no-answer": bdr+"GenderNotSpecified",
                    interest: bdou+"interest", buddhism: tmp+"buddhism",
                    region: bdou+"mainResidenceArea", outside:tmp+"outside", kham:tmp+"kham", amdo:tmp+"amdo", "u-tsang":tmp+"u-tsang", other:tmp+"other",
                    agree: tmp+"agreeEmail" }

type Props = {
    userID?:url,
    profile:{},
    config:{},
    rightPanel?:boolean,
    passwordReset?:url,
    onToggleLanguagePanel:() => void,
    onUserProfile:() => void
}

type State = {
   name:{},
   gender:{},
   region:{},
   //affiliation:string,
   interest:{},
   patch?:{},
   profile?:{},
   email?:{},
   errors:{[string]:string},
   updating?:boolean
}

export class Profile extends Component<Props,State> {  

  constructor(props : Props) {
    super(props);
    this.state = { name:{type:"literal"}, gender:{}, region:{}, interest:{}, agree:{type:"literal"}, errors:{} }

  }
  
  /*
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
  */

  componentDidUpdate() {

      console.log("didU",this.props)
      report_GA(this.props.config,this.props.history.location);
  }

  static getDerivedStateFromProps(props,state) {
    
    console.log("gDsFp",props,state)

    let s
    if(!state.profile) {
      s = { ...state, profile: {} }
      const { userProfile, getProfile } = props.auth;
      if (!userProfile) {
        getProfile((err, profile) => {
          //this.setState({ profile });
          store.dispatch(data.getUser(profile))
        });
      } else {
        s.profile = userProfile
        store.dispatch(data.getUser(userProfile))
      }
    }

    if((!state.profile || !state.profile.profile) && props.profile && props.profile.profile && props.userID) {

      let userProfile = { ...props.profile }
      s = { ...state, profile:{ ...userProfile.profile } }
      delete userProfile.profile

      // TODO clean profile from resource[userID]
      //store.dispatch(data.gotResource(props.userID, { [props.userID] : userProfile }))

      for(let k of Object.keys(s)) {
        let p
        if(p = propsMap[k]) {
          if(props.profile[p] && s[k] && s[k].value === undefined) { 
            console.log("kp",k,p)
            let type = s[k].type
            if(!type) type = "uri"
            s[k] = { type, value: fullUri(props.profile[p][0].value) }
          }
        }
      }

      if(s.profile.sub.match(/^auth0[|]/) && props.profile[foaf+"mbox"] && s.email === undefined)  s.email = { value: props.profile[foaf+"mbox"][0].value }
    }

    if(s) return s
    else return null
  }

  handlePatch(e) {
    this.executePatch(e);
    this.setState({...this.state, updating:true })
  }

  async executePatch(e) {

    let response, s 

    if(this.state.email && this.state.email.value && this.props.profile && this.props.profile[foaf+"mbox"] && this.props.profile[foaf+"mbox"][0].value !== this.state.email.value) { 
      response = await api.updateEmail(this.state.profile.sub, this.state.email.value)
      if(!response.statusCode || response.statusCode === 200) response = null
      else if(response.message) {

        console.log("response",response)

        if(!s) s = { ...this.state, updating:false }
        s.errors.email = response.message.replace(/.*validation error.*/,"Wrong email format")
      }
    }
    
    if(!response) { 
      response = await api.submitPatch(this.props.userID, this.state.patch)                 

      if(response === "OK") { 
        store.dispatch(data.getUser(this.state.profile))
        if(!s) s = { ...this.state, updating:false }
        s.patch = '' 
      }
    }

    if(s) this.setState(s)
    else this.setState({ ...this.state, updating:false })
  }

  preparePatch = (state:{}) =>{

      let mods = Object.keys(state).filter(k => k !== "patch" && state[k].type && state[k].value).reduce( (acc,k) => ({ ...acc, [propsMap[k]]: [ state[k] ] } ), {} )
      let id = shortUri(this.props.userID).split(':')[1]
      let that = { state: { resource:this.props.profile, updates:mods}, props:{ dictionary:this.props.dictionary, IRI:this.props.userID } }

      console.log("mods", mods, id, that)

      state.patch = renderPatch(that, Object.keys(mods), id)

      return state
  }

  render() {

    const { profile } = this.state;
    
    console.log("render",profile,this.state,this.props)
    
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


          let type = this.state[e.target.name].type
          if(!type) type = 'uri'
          let value = propsMap[e.target.value]
          if(!value) value = e.target.value

          if(val1 === "agree") value = val2.toString()

          console.log("e",e.target,val1,val2,type,value)

          let state = {...this.state, [e.target.name]:{ type, value } } 

          state = this.preparePatch(state)
          
          this.setState(state)
        }

        let val = { name:"", gender:"", interest:"", region:"", email:"", agree:"" }
        for(let k of Object.keys(val)) {          
          if(this.state[k] && this.state[k].value !== undefined) val[k] = this.state[k].value
          else if(k !== "email" && this.props.profile && this.props.profile[propsMap[k]]) val.name = this.props.profile[propsMap[k]][0].value
          //if(!val[k]) val[k] = "?"
        }

        console.log("val",val)

        if(this.props.profile && this.state.profile && !this.props.resetLink) store.dispatch(data.getResetLink(this.props.userID, this.props.profile, this.state.profile))

        return (
          [top_left_menu(this),
           top_right_menu(this),
           getGDPRconsent(),
          <div className="profile-container resource user">
            <div className="profile-area">

              <h2>
                <div id="avatar">
                    <img src={profile.picture} width="80"/>
                </div>
                {this.props.profile?this.props.profile[skos+"prefLabel" /*foaf+"mbox"*/ ][0].value:null}
              </h2>
              { 
                this.state.profile && this.state.profile.sub.match(/^auth0[|]/) && //this.props.profile[tmp+"passwordResetLink"] && 
                  <div>
                      <TextField
                        className="FC"
                        label="Email"
                        value={val.email}
                        onChange={handleChange}
                        inputProps={{ name: 'email', id: 'email' }}
                        {... this.state.errors.email?{error:true,helperText:this.state.errors.email}:{} }
                      />
                    { this.props.profile && <a class={"ulink " + (this.props.resetLink && this.props.profile[tmp+"passwordResetLink"]&&!this.state.updating?"on":this.props.profile[tmp+"passwordResetLink"])} {... this.props.profile[tmp+"passwordResetLink"]?{href:this.props.profile[tmp+"passwordResetLink"][0].value}:{} }>
                      Change Password
                    </a> }
                    <br/><br/>
                  </div>
              }

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
                    value={val.region}
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
                <br/>
                <FormControlLabel
                     control={
                        <Checkbox
                           checked={val.agree === "true"}
                           className={"checkbox"}
                           icon={<CheckBoxOutlineBlank/>}
                           checkedIcon={<CheckBox />}
                           onChange={(e,val) => handleChange(e,"agree",val)}
                           inputProps={{ name:"agree", id: 'agree'}}
                        />

                     }
                     label={"I agree to receive emails from BDRC"}
                  />

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
                 
              { this.state.patch && 
                   <pre id="patch" contentEditable="true">
                    { this.state.patch }
                   </pre> 
              }
              <br/>
              <a class={"ulink "+(this.state.patch&&!this.state.updating?"on":"")} id="upd" {... this.state.patch?{onClick:this.handlePatch.bind(this)}:{}}>{this.state.updating?"Updating...":"Update"}</a>

              {/*               
              <h5 onClick={ (e) => { 
                let url = store.getState().ui.profileFromUrl
                if(!url) url = "/"
                history.push(url)
              }}>Back</h5> 
              */}

            </div>
          </div>,          
          <LanguageSidePaneContainer />]
      );
    }
  }
}

export default Profile ;