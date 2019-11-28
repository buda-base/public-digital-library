
import React, { Component } from 'react';
import ResourceViewer from './ResourceViewer' ;
import SettingsIcon from '@material-ui/icons/Settings'; 
import CheckIcon from '@material-ui/icons/Check'; 
import DeleteIcon from '@material-ui/icons/Delete'; 
import LibraryAddIcon from '@material-ui/icons/LibraryAdd';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import CancelIcon from '@material-ui/icons/CancelOutlined'; 
import CloseIcon from '@material-ui/icons/Close'; 
import InputAdornment from '@material-ui/core/InputAdornment';
import AccountCircle from '@material-ui/icons/AccountCircle';
import {Translate, I18n} from 'react-redux-i18n';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import bdrcApi from '../lib/api';

const bdou  = "http://purl.bdrc.io/ontology/ext/user/" ;
const foaf  = "http://xmlns.com/foaf/0.1/" ;
const rdfs  = "http://www.w3.org/2000/01/rdf-schema#" ;
const xsd   = "http://www.w3.org/2001/XMLSchema#" ;

const api = new bdrcApi({...process.env.NODE_ENV === 'test' ? {server:"http://localhost:5555/test"}:{}});

class UserViewer extends ResourceViewer
{
    _dontMatchProp = "mbox|type|isActive|hasUserProfile" ;
    _timeOut ;
    _validators ; 
    
    constructor(props){
        super(props);
        this.togglePopover.bind(this)
        this.valueChanged.bind(this)
        this.validateURI.bind(this)
        this.dataValidation.bind(this)

        this._validators = {
            [xsd+"anyURI"] : this.validateURI  
        }
    }
    
    static getDerivedStateFromProps(props,state) {
        if(props.resources && props.resources[props.IRI] && props.resources[props.IRI][props.IRI] && (!state.resource || state.IRI !== props.IRI)) {
            let res = { ...props.resources[props.IRI][props.IRI] }
            
            if(res && !res[bdou+"image"] && props.authUser && props.authUser.picture) res[bdou+"image"] = [ { type: "uri", value:props.authUser.picture } ]

            return { ...state, IRI:props.IRI, resource:res, ready:true }
        }
    }   

    validateURI = async (url) => {
        if(url && !url.match(/^https?:[/][/]/i)) return false

        try {
            let test = await api._fetch( url, { method:"GET", mode:"no-cors" } )            
            //console.log("valid",url,test)
            return true
        }
        catch(e) {
            return false;
        }
    }

    togglePopover = (event:Event, tag:string, clearMod:boolean=false) => {
        
        if(this._timeOut) return ;

        let val = !this.state.collapse[tag], anchor

        if(val) anchor = event.currentTarget.parentNode        

        let state = { ...this.state } //, collapse:{...this.state.collapse, [tag]:val}, anchorElPopover:anchor})
        let update 

        if(val || !this.state.errors[tag] || clearMod) { 
            update = true ;
            state.collapse = {...this.state.collapse, [tag]:val} 
            state.anchorElPopover = anchor
        }
        
        if(!val && clearMod)  {
            update = true ;
            if(state.updates[tag]) delete state.updates[tag]
            if(state.errors[tag]) delete state.errors[tag]
        }

        if(update) this.setState(state)
    }

    renderPopover = (tag:string, content) => {
        return (
            <Popover anchorEl={this.state.anchorElPopover }  open={this.state.collapse[tag]} onClose={(e) => this.togglePopover(e,tag)}
                anchorOrigin={{vertical: 'bottom', horizontal: 'left'}} transformOrigin={{ vertical: 'top', horizontal: 'left'}} 
            >
                <div class="userPopoverContent">{ content }
                    { (this.state.updates[tag] || this.state.errors[tag]) && 
                        <div class="buttons bottom">
                            { !this.state.errors[tag] && 
                                <a title="Save" onClick={(e) => this.togglePopover(e,tag) } ><CheckIcon /></a> }
                            <a title="Cancel" onClick={(e) => this.togglePopover(e,tag,true) } ><CloseIcon /></a>
                        </div> 
                    }
                </div>
            </Popover>
        )
    }    

    dataValidation = async (tag:string, value:string) => {
        let range = this.props.dictionary, isOk = true        
        if(range) range = range[tag]
        if(range) range = range[rdfs+"range"]
        if(range) for(let propType of range) isOk = isOk && (!this._validators[propType.value] || (await this._validators[propType.value](value)))
        return isOk
    }

    valueChanged = (event:Event, tag:string, close:boolean = false) => {
        
        console.log("vCh",event.target,event.key,close)

        if(this._timeOut) clearTimeout(this._timeOut)

        this._timeOut = setTimeout(((event,tag,close) => async () => {             

            let value = event.target.value
            let state = { ...this.state }
            let isOk = await this.dataValidation(tag, value)            

            if(!isOk) { 
                state.errors = { ...state.errors, [tag] : true }
            } 
            else {            
                if(close) setTimeout( () => this.togglePopover(event, tag), 10) ;
                if(this.state.errors[tag]) delete this.state.errors[tag]
                if(!state.resource[tag] || state.resource[tag][0].value !== value || state.updates[tag] && state.updates[tag] !== value) state.updates[tag] = value
            }

            this.setState(state)

            this._timeOut = 0


        })({...event},tag,close),!close?650:10) // shorter delay if popover is supposed to be closing

    }
 
    preprop = (k) => {
        return (
            <div class="preprop">
                <a title={I18n.t("user.edit.del")}><DeleteIcon/></a>
                <a title={I18n.t("user.edit.add")}><LibraryAddIcon/></a>
                <a title={I18n.t("user.edit.set")}><SettingsIcon/></a>
                <a title={I18n.t("user.edit.hide")}><VisibilityOffIcon/></a> 
                { false && <a title={I18n.t("user.edit.show")}><VisibilityIcon/></a>  }
            </div>
        )
    }

    getH2 = () => {
        let email,picUrl,pic
        if(this.state.resource) {
            if(this.state.resource[foaf+"mbox"]) {
                email = this.state.resource[foaf+"mbox"]
                console.log("email",email)
                if(email.length) email = email[0].value
            }
            if(this.state.resource[bdou+"image"]) {
                picUrl = this.state.resource[bdou+"image"]
                if(picUrl.length) picUrl = picUrl[0].value
                if(this.state.updates[bdou+"image"]) picUrl = this.state.updates[bdou+"image"]
                pic = 
                    <div id="avatar">
                        <a class="hover" onClick={(e) => this.togglePopover(e, bdou+"image")} title={I18n.t("user.photo.hover")}><SettingsIcon/></a>
                        <img src={picUrl} width="80"/>
                        { 
                            this.renderPopover(
                                bdou+"image",                             
                                <TextField
                                    label={I18n.t("user.photo.label")}
                                    defaultValue={picUrl}
                                    helperText={!this.state.errors[bdou+"image"]?I18n.t("user.photo.helperText"):I18n.t("user.photo.error")}
                                    onChange={(e) => this.valueChanged(e,bdou+"image")}
                                    onKeyPress={(e) => this.valueChanged(e,bdou+"image",e.key === "Enter")  }
                                    fullWidth
                                    {
                                        ...this.state.errors[bdou+"image"] && {
                                            error:true,
                                            /*
                                            InputProps: {
                                                startAdornment: (
                                                    <InputAdornment position="start" style={{marginRight:"2px",color:"red"}} title={I18n.t("user.photo.error")}>
                                                        <CancelIcon/>
                                                    </InputAdornment>
                                                ),
                                            } 
                                            */                                        
                                        } 
                                    }
                                />
                            )
                        }
                    </div>
            }
        }
        return <h2>{pic}{email}</h2>
    }
}

export default UserViewer ;