
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
import Chip from '@material-ui/core/Chip';
import { createStyles } from '@material-ui/core/styles';
import _ from "lodash";
import WarningIcon from '@material-ui/icons/Warning';

import bdrcApi from '../lib/api' ;
import renderPatch from '../lib/rdf-patch.js' ; 
import { top_right_menu, report_GA, getGDPRconsent, lang_selec } from './App'
import { top_left_menu } from './ResourceViewer'
import LanguageSidePaneContainer,{LangPrefTreeContainer} from '../containers/LanguageSidePaneContainer';
import Footer from "./Footer" 

import I18n from 'i18next';

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
                    picture:bdou+"image",
                    gender: bdo+"personGender", male: bdr+"GenderMale", female: bdr+"GenderFemale", "no-answer": bdr+"GenderNotSpecified",
                    interest: bdou+"interest", otherInterest:tmp+"otherInterest", tibetB:tmp+"TibetanBuddhistTexts", bonpoT:tmp+"BonpoTexts",  sanskT:tmp+"SanskritTexts", zhT:tmp+"ChineseTexts", multiT:tmp+"multiLingualTexts", maps:tmp+"Maps", art:tmp+"BuddhistArt", biblio:tmp+"Bibliographies", SEAt:tmp+"SoutheastAsianTexts",
                    region: bdou+"mainResidenceArea", outside:tmp+"outside", kham:tmp+"kham", amdo:tmp+"amdo", "u-tsang":tmp+"uTsang", other:tmp+"other",
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
   otherInterest:{},
   picture:{},
   patch?:{},
   profile?:{},
   email?:{},
   errors:{[string]:string},
   updating?:boolean,
   collapse:{}
}

export class Profile extends Component<Props,State> {  

  constructor(props : Props) {
    super(props);
    this.state = { email:{type:"literal"},name:{type:"literal"}, picture:{type:"literal"}, gender:{}, region:{}, interest:{},  otherInterest:{}, agree:{type:"literal"}, errors:{}, collapse:{} }
    this.validateURI = this.validateURI.bind(this);
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
      let vs = Object.values(propsMap)


      for(let k of Object.keys(s)) {
        let p
        if(p = propsMap[k]) {
          if(props.profile[p] && s[k] && s[k].value === undefined) { 
            console.log("kp",k,p,props.profile[p])
            let type = s[k].type
            if(!type) type = "uri"

            if(["name", "gender", "region", "interest"].includes(k)) {
                s[k] =  props.profile[p].map(e => e.value).filter(v => k === "name" || vs.includes(v)).map(v => ({ type, value:fullUri(v)}))

                
                if(k !== "interest") s[k] = s[k][0] 
                else s[k] = s[k].map(e => e.value)
            }
            else if(props.profile[p].length === 1) s[k] = { type, value: fullUri(props.profile[p][0].value) }
            else s[k] = props.profile[p].map(e => e.value)
            
            console.log("sk",s[k])
          }
        }
      }

      if(s.profile.sub.match(/^auth0[|]/) && props.profile[foaf+"mbox"] && s.email === undefined)  s.email = { type:"literal", value: props.profile[foaf+"mbox"][0].value }


    }

    if(props.userID && state.needsUpdate) {
      if(!s) s = { ...state }
      s = Profile.preparePatch(s,props)
    }

    if(s) return s
    else return null
  }

  handlePatch(e) {

    

    let hasError = !_.isEmpty(this.state.errors)
    let errKeys,byPass ;
    if(hasError) { 
      errKeys = Object.keys(this.state.errors)
      if(errKeys.length === 1 && this.state.errors.email) byPass = true  
    }

    if(hasError && !byPass) return 

    this.executePatch(e);
    
    this.setState({...this.state, updating:true, needsUpdate: false })
  }

  async executePatch(e) {

    let response, s 
    
    if(!_.isEmpty(this.state.errors)) {
      s = { ...this.state, errors:{} }
    }

    if(this.state.email && this.state.email.value && this.props.profile && this.props.profile[foaf+"mbox"] && this.props.profile[foaf+"mbox"][0].value !== this.state.email.value) { 
      response = await api.updateEmail(this.state.profile.sub, this.state.email.value)
      if(!response.statusCode || response.statusCode === 200) response = null
      else if(response.message) {

        console.log("response",response)

        if(!s) s = { ...this.state, updating:false }
        s.errors.email = response.message.replace(/.*validation error.*/,I18n.t("user.errors.email"))
      }
    }
    
    if(!response) { 
      response = await api.updateProfile(this.state.newUserValues, shortUri(this.props.userID))                       

      
      //response = await api.submitPatch(this.props.userID, this.state.patch)                       
      //if(response) response = JSON.parse(response)


      if(response) {
        if(!s) s = { ...this.state, updating:false }
        if(response.status === 200) { 
          store.dispatch(data.getUser(this.state.profile))
          s.patch = '' 
          s.newUserValues = null
        } else  {
          s.errors.server = response.message
        }
      }
      
    }

    if(s) this.setState(s)
    else this.setState({ ...this.state, updating:false })
  }

  static preparePatch = (state:{},props:{}) =>{

      let mods = Object.keys(state).filter(k => k !== "patch" && state[k] && state[k].type && state[k].value !== undefined).reduce( (acc,k) => { 
        let val = state[k]
        if(Array.isArray(val.value)) {
          val = val.value.map(v => ({ ...val, value:v }))
        }
        else val = [ val ]
        return ({ ...acc, 
          [propsMap[k]]: val 
        })
      }, {} )
      let id = shortUri(props.userID).split(':')[1]
      let that = { state: { resource:props.profile, updates:mods}, props:{ dictionary:props.dictionary, IRI:props.userID, locale:props.locale } }
            
      let user = { ...that.state.resource, ...mods, 
          [bdou+"preferredUiLang"]:[{ "type": "literal", "value": props.locale.replace(/zh/,"zh-hans") }],
          [bdou+"preferredUiLiteralLangs"]: props.langPreset.map(p => ({ "type": "literal", "value": p })) 
        }      

      console.log("new user:", props.langPreset, user, mods, id, that)

      state.newUserValues = {  [props.userID]:{  ...user } }
      if(state.newUserValues[props.userID].profile) delete state.newUserValues[props.userID].profile
      if(state.newUserValues[props.userID][tmp+"passwordResetLink"]) delete state.newUserValues[props.userID][tmp+"passwordResetLink"]
      
      //state.patch = renderPatch(that, Object.keys(mods), id)

      return state
  }


  async validateURI(url) {
    console.log("validate",url)

    if(!url) return true ;
    else if(!url.match(/^https?:[/][/]/i)) return false

    try {

      //let test = await api._fetch( url, { method:"GET", mode:"no-cors" } )            
      //if(!test.ok) throw new Error("ERROR:"+test) 

      let img = new Image(), _this = this ;

      _this.setState({errors:{..._this.state.errors, picture:false}})

      img.onerror = function () {
        console.error("validate:cannot load "+url);        
        _this.setState({errors:{..._this.state.errors, picture:I18n.t("user.photo.error")}})
      }
      img.onload = function () {
        console.log("validate:success "+url);        
        let errors = { ..._this.state.errors }
        delete errors.picture
        _this.setState({errors})
      }

      img.src = url

      return true
    }
    catch(e) {
      console.error("validate:catch",e)
      return false;
    }
  }

  render() {

    const { profile } = this.state;
    
    console.log("render",profile,this.state,this.props)
    
    let message = I18n.t("user.get");

    if(!profile || !Object.keys(profile).length) {
      if(!auth.isAuthenticated()) { 
        //message = <span>Please <a onclick={this.props.auth.login(this.props.history.location)}>log in</a></span>
        message = I18n.t("user.redirect")
        this.tO = setTimeout(() => { 
          window.location.href = "/" 
        }, 1500)
        
      }
      return <div className="profile-container">{message}</div>
    }
    else {
        if(this.tO) clearTimeout(this.tO)

        
        let handleChange = (e,val1,val2,forceText:boolean=false) => {
          
          console.log("change:",e,val1,val2,forceText)

          let type = this.state[e.target.name].type
          if(!type) type = 'uri'
          let value = propsMap[e.target.value]
          if(!value || forceText) value = e.target.value

          if(val1 === "agree") value = val2.toString()

          console.log("e",e.target,val1,val2,type,value)

          let lang
          if(type === "literal") lang = this.props.locale

          let state = {...this.state, [e.target.name]:{ type, value, lang }, needsUpdate: true } 

          state = Profile.preparePatch(state, this.props)
          
          this.setState(state)
        }

        let val = { name:"", gender:"", interest:"", region:"", email:"", agree:"", otherInterest:"", picture:"" }
        for(let k of Object.keys(val)) {          
          if(this.state[k] && this.state[k].value !== undefined) val[k] = this.state[k].value
          else if(this.state[k] && Array.isArray(this.state[k])) val[k] = this.state[k]
          else if(k !== "email" && this.props.profile && this.props.profile[propsMap[k]]) val.name = this.props.profile[propsMap[k]][0].value
          //if(!val[k]) val[k] = "?"
        }
        if(!val.interest) val.interest = []
        else if(!Array.isArray(val.interest)) val.interest = [ val.interest ]

        // deprecated / support for property like "tmp:kham"
        // if(val.region && val.region.startsWith(tmp)) val.region = val.region.replace(new RegExp(tmp),"")

        console.log("val",val)

        if(this.props.profile && this.state.profile && !this.props.resetLink) store.dispatch(data.getResetLink(this.props.userID, this.props.profile, this.state.profile))

        let hasError = !_.isEmpty(this.state.errors)
        let errKeys,byPass,servErr ;
        if(hasError) { 
          errKeys = Object.keys(this.state.errors)
          if(errKeys.length === 1 && this.state.errors.email) byPass = true  
          if(this.state.errors.server) { servErr = <div class="error">{I18n.t("user.errors.server1")}<br/>{I18n.t("user.errors.server2")}</div> }
        }


        /*
        const classes = createStyles({root:"green"})
        console.log("makeS:",classes)
        */

        let picUrl = "/icons/header/user.png" 
        if(profile.picture && !profile.picture.match(/gravatar.*cdn[.]auth0/)) picUrl = profile.picture
        if(val.picture && !this.state.errors.picture) picUrl = val.picture

        let title = "User Profile"
        if(this.props.profile && this.props.profile[skos+"prefLabel"]) title =  this.props.profile[skos+"prefLabel"][0].value

        return (
        <div>
          <div class="resource user">
            <div class="index">
              <div class="title">
                <h2 class="on"><span class="T user">{I18n.t("index.userP")}</span></h2>
                <div>
                  <h3><a href="/user#main-info">{I18n.t("index.personalI")}</a></h3>
                  <h3><a href="/user#display">Display Preferences</a></h3>
                </div>
              </div>
            </div>
            <div>
          {[top_left_menu(this),
           top_right_menu(this),
           getGDPRconsent(this),
          <div className="profile-container">
            <div class="title"></div>
            <div class="data" id="head">
              <div class="header">
                <div class="before">
                  <img referrerpolicy="no-referrer" src={picUrl}/>
                </div>
              </div>
            </div>
              <div class="data">
                <h2>{title}</h2>
              </div>
              <div id="main-info" className="profile-area data">


                <div data-props>
                  <h3><span><a class="propref"><span>{I18n.t("user.name")}{I18n.t("punc.colon")}</span></a></span></h3>
                  <div class="group">
                    <FormControl className="FC">
                      <InputLabel htmlFor="name">{I18n.t("user.name")}</InputLabel>
                      <Input
                        value={val.name}
                        onChange={(e,v1,v2) => handleChange(e,v1,v2,true)}
                        inputProps={{ name: 'name', id: 'name' }}
                      />
                    </FormControl>
                  </div>
                </div>

              { 
                this.state.profile && this.state.profile.sub.match(/^auth0[|]/) && //this.props.profile[tmp+"passwordResetLink"] && 
                  <div data-props>
                    <h3><span><a class="propref"><span>{I18n.t("user.email")}{I18n.t("punc.colon")}</span></a></span></h3>
                      <div class="group">
                        <TextField
                          className="FC"
                          label="Email"
                          value={val.email}
                          onChange={(e,v1,v2) => handleChange(e,v1,v2,true)}
                          inputProps={{ name: 'email', id: 'email' }}
                          {... this.state.errors.email?{error:true,helperText:this.state.errors.email}:{} }
                        />
                    { this.props.profile && <a class={"ulink " + (this.props.resetLink && this.props.profile[tmp+"passwordResetLink"]&&!this.state.updating?"on":this.props.profile[tmp+"passwordResetLink"])} {... this.props.profile[tmp+"passwordResetLink"]?{href:this.props.profile[tmp+"passwordResetLink"][0].value}:{} }>
                      {I18n.t("user.password")}
                    </a> }
                    </div>
                  </div>
              }
              
              { 
                 this.state.profile && !this.state.profile.sub.match(/^auth0[|]/) && 

                  <div data-props="foaf:mbox">
                    <h3><span><a class="propref"><span>{I18n.t("user.email")}{I18n.t("punc.colon")}</span></a></span></h3>
                      <div class="group">
                        {/* <h4>{this.props.profile && this.props.profile[foaf+"mbox"] && this.props.profile[foaf+"mbox"][0].value}</h4> */}
                        <TextField
                          className="FC"
                          label="Email"
                          disabled
                          value={this.props.profile && this.props.profile[foaf+"mbox"] && this.props.profile[foaf+"mbox"][0].value}
                          onChange={handleChange}
                          inputProps={{ name: 'email', id: 'email' }}
                          {... this.state.errors.email?{error:true,helperText:this.state.errors.email}:{} }
                        />
                    </div>
                  </div>
              }  


                <div data-props>
                  <h3><span><a class="propref"><span>{I18n.t("user.photo.label")}{I18n.t("punc.colon")}</span></a></span></h3>
                  <div class="group">
                    <FormControl className="FC text">
                      <TextField
                        className="FC"
                        label={I18n.t("user.photo.label")}
                        value={val.picture}
                        onChange={(e,v1,v2) => handleChange(e,v1,v2,true)}
                        onBlur={async (e) => {
                          let ev = { ...e }
                          let value = ev.currentTarget.getAttribute('value') 
                          if(value) {
                            let valid = await this.validateURI(value)
                            console.log("valid:", ev,ev.currenTarget, value, valid)
                            if(!valid) {
                              this.setState({errors:{...this.state.errors, picture:I18n.t("user.photo.error")}})
                            } else if(this.state.errors.picture) {
                              let errors = { ...this.state.errors }
                              delete errors.picture
                              this.setState({errors})
                            }
                          } 
                          else if(this.state.errors.picture) {
                              let errors = { ...this.state.errors }
                              delete errors.picture
                              this.setState({errors})
                          }
                        }}
                        inputProps={{ name: 'picture', id: 'picture' }}
                        {... this.state.errors.picture?{error:true,helperText:this.state.errors.picture}:{} }
                      />
                    </FormControl>
                  </div>
                </div>

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

                <div data-props>
                  <h3><span><a class="propref"><span>{I18n.t("user.gender")}{I18n.t("punc.colon")}</span></a></span></h3>
                  <div class="group">
                    <FormControl className="FC">
                      <InputLabel htmlFor="gender">{I18n.t("user.gender")}</InputLabel>
                      <Select
                        value={val.gender}
                        onChange={handleChange}
                        inputProps={{ name: 'gender', id: 'gender'}}
                      >
                        <MenuItem value={propsMap["male"]}>{I18n.t("user.options.male")}</MenuItem>
                        <MenuItem value={propsMap["female"]}>{I18n.t("user.options.female")}</MenuItem>
                        <MenuItem value={propsMap["no-answer"]}>{I18n.t("user.options.noanswer")}</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>

                <div data-props>
                  <h3><span><a class="propref"><span>{I18n.t("user.area")}{I18n.t("punc.colon")}</span></a></span></h3>
                  <div class="group">
                    <FormControl className="FC">
                      <InputLabel htmlFor="interest" /*classes={{root:classes.root}}*/ >{I18n.t("user.area")}</InputLabel>
                      <Select
                        classes={{root:"multiple-select",select:"multi-selec"}}                        
                        value={val.interest}
                        onChange={handleChange}
                        inputProps={{ name:"interest", id: 'interest'}}
                        multiple
                        input={<Input id="select-multiple-chip" />}
                        renderValue={(selected) => {
                          //console.log("selec:",selected)
                          return (
                            <div>
                              { selected.map((value) => <Chip key={value} className="chip" label={I18n.t("prop."+shortUri(value))} /> ) }
                            </div>
                          )
                        }}
                      >
                        {["TibetanBuddhistTexts", "BonpoTexts", "SanskritTexts", "ChineseTexts", "SoutheastAsianTexts", "multiLingualTexts", "Bibliographies", "Maps", "BuddhistArt", "other"]
                          .map((k) => <MenuItem className={(val.interest.includes(tmp+k)?"selected":"")} value={tmp+k}>{I18n.t("prop."+"tmp:"+k)}</MenuItem>)}
                      </Select>
                    </FormControl>
                    { val.interest.includes(tmp+"other") && <div class="sub otherI">
                      <h4 class="first type"><a class="propref"><span lang={this.props.locale}>{I18n.t("prop.tmp:other")}{I18n.t("punc.colon")}</span></a></h4>
                      <FormControl className="FC">
                        <InputLabel htmlFor="otherInterest">{I18n.t("prop.tmp:other")}</InputLabel>
                        <Input
                          value={val.otherInterest}
                          onChange={(e,v1,v2) => handleChange(e,v1,v2,true)}
                          inputProps={{ name: 'otherInterest', id: 'otherInterest' }}
                        />
                      </FormControl>
                    </div> }
                  </div>
                </div> 

                <div data-props="tmp:cultural" lang={this.props.locale}>
                  <h3><span><a class="propref"><span>{I18n.t("user.region")}{I18n.t("punc.colon")}</span></a></span></h3>
                  <div class="group">
                    <FormControl className="FC">
                      <InputLabel htmlFor="region">{I18n.t("user.region")}</InputLabel>
                      <Select
                        value={val.region}
                        onChange={handleChange}
                        inputProps={{ name: 'region', id: 'region'}}
                      >
                        <MenuItem value={propsMap["outside"]}>{I18n.t("user.options.outside")}</MenuItem>
                        <MenuItem value={propsMap["kham"]}>{I18n.t("user.options.kham")}</MenuItem>
                        <MenuItem value={propsMap["amdo"]}>{I18n.t("user.options.amdo")}</MenuItem>
                        <MenuItem value={propsMap["u-tsang"]}>{I18n.t("user.options.uTsang")}</MenuItem>
                        <MenuItem value={propsMap["other"]}>{I18n.t("user.options.other")}</MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>

                <div data-props>
                  <h3><span><a class="propref"><span></span></a></span></h3>
                  <div class="group">
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
                        label={I18n.t("user.agree")}
                      />
                      <div id="validate">
                        { hasError && <WarningIcon/>}
                        <a class={"ulink "+(this.state.newUserValues&&(!hasError||byPass)&&!this.state.updating?"on":"")} id="upd" {... this.state.newUserValues?{onClick:this.handlePatch.bind(this)}:{}}>{this.state.updating?I18n.t("user.updating"):I18n.t("user.update")}</a>
                        { servErr }
                      </div>
                  </div>
                </div>

            </div>
              <div class="data" id="outline">
                  <h2 id="display">{I18n.t("Rsidebar.title")}</h2>
                  <div class="search">
                    <div>
                      <h3>{I18n.t("Rsidebar.UI.title")}</h3>
                    </div>
                  </div>
                  <div>
                    <div class="help">{I18n.t('Rsidebar.UI.help')}{I18n.t("punc.colon")}</div>
                    <div>{ lang_selec(this, false, true, true, () => { this.setState({ needsUpdate: true }) }) }</div>
                  </div>
                </div>
                <div class="data" id="outline">
                  <div class="search">
                    <div>
                      <h3>{I18n.t("Rsidebar.priority.title")}</h3>
                    </div>
                  </div>
                  <div>
                    <div class="help">{I18n.t('Rsidebar.priority.help')}{I18n.t("punc.colon")}</div>
                    <LangPrefTreeContainer that={this}/>
                  </div>
                </div>

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
                 
              { /*
                this.state.patch && 
                   <pre id="patch" contentEditable="true">
                    { this.state.patch }
                   </pre>
                */ }
              

              {/*               
              <h5 onClick={ (e) => { 
                let url = store.getState().ui.profileFromUrl
                if(!url) url = "/"
                history.push(url)
              }}>Back</h5> 
              */}

              <div class="data profile-area">
                <div data-props>
                  <div class="group">
                      <div id="validate" style={{position:"relative", "marginTop":30}}>
                        { hasError && <WarningIcon/>}
                        <a class={"ulink "+(this.state.newUserValues&&(!hasError||byPass)&&!this.state.updating?"on":"")} id="upd" {... this.state.newUserValues?{onClick:this.handlePatch.bind(this)}:{}}>{this.state.updating?I18n.t("user.updating"):I18n.t("user.update")}</a>
                        { servErr }
                      </div>
                  </div>
                </div>
              </div>
          </div>]}
          </div>
        </div>
        {/* <Footer locale={this.props.locale}/> */}
      </div>
      );
    }
  }
}

export default Profile ;