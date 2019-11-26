
import React, { Component } from 'react';
import ResourceViewer from './ResourceViewer' ;
import PhotoIcon from '@material-ui/icons/Settings'; //PhotoOutlined';
import CheckIcon from '@material-ui/icons/Check'; 
import CancelIcon from '@material-ui/icons/CancelOutlined'; 
import {Translate, I18n} from 'react-redux-i18n';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

const foaf  = "http://xmlns.com/foaf/0.1/" ;

class UserViewer extends ResourceViewer
{
    _dontMatchProp = "mbox|type|isActive|hasUserProfile" ;

    constructor(props){
        super(props);
        this.togglePopover.bind(this)
    }

    togglePopover = (event:Event, tag:string) => {
        let val = !this.state.collapse[tag], anchor
        if(val) anchor = event.currentTarget.parentNode

        this.setState({...this.state, collapse:{...this.state.collapse, [tag]:val}, anchorElPopover:anchor})
    }

    renderPopover = (tag:string,content) => {
        return (
            <Popover anchorEl={this.state.anchorElPopover }  open={this.state.collapse[tag]} onClose={(e) => this.togglePopover(e,tag)}
                anchorOrigin={{vertical: 'bottom', horizontal: 'left'}} transformOrigin={{ vertical: 'top', horizontal: 'left'}} 
            >
                <div class="userPopoverContent">{ content }<div class="buttons"><CheckIcon/><CancelIcon/></div></div>
            </Popover>
        )
    }
    
 
    getH2 = () => {
        let email,picUrl,pic
        if(this.props.resources && this.props.resources[this.props.IRI] && this.props.resources[this.props.IRI][this.props.IRI]  && this.props.resources[this.props.IRI][this.props.IRI][foaf+"mbox"]) {
            email = this.props.resources[this.props.IRI][this.props.IRI][foaf+"mbox"]
            console.log("email",email)
            if(email.length) email = email[0].value
        }
        if(this.props.authUser && this.props.authUser.picture) {
            picUrl = this.props.authUser.picture
            pic = 
                <div id="avatar">
                    <a class="hover" onClick={(e) => this.togglePopover(e, "updatePhoto")} title={I18n.t("user.photo")}><PhotoIcon/></a>
                    <img src={picUrl} width="80"/>
                    { 
                        this.renderPopover(
                            "updatePhoto",                             
                            <TextField
                                label="Profile Picture"
                                defaultValue={picUrl}
                                helperText="Enter URL to existing picture"
                                fullWidth
                            />
                        )
                    }
                </div>
        }
        return <h2>{pic}{email}</h2>
    }
}

export default UserViewer ;