
import React, { Component } from 'react';
import ResourceViewer from './ResourceViewer' ;

const foaf  = "http://xmlns.com/foaf/0.1/" ;

class UserViewer extends ResourceViewer
{
    getH2 = () => {
        let email,pic
        if(this.props.resources && this.props.resources[this.props.IRI] && this.props.resources[this.props.IRI][this.props.IRI]  && this.props.resources[this.props.IRI][this.props.IRI][foaf+"mbox"]) {
            email = this.props.resources[this.props.IRI][this.props.IRI][foaf+"mbox"]
            console.log("email",email)
            if(email.length) email = email[0].value
        }
        if(this.props.authUser && this.props.authUser.picture) {
            pic = <img src={this.props.authUser.picture} width="80"/>
        }
        return <h2>{pic}{email}</h2>
    }
}

export default UserViewer ;