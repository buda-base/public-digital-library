
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

import bdrcApi from '../lib/api';

const api = new bdrcApi();

type State = {
   gender:string,
   region:string,
   affiliation:string,
   interest:string
}
export class Profile extends Component<State> {  
  _dict ;

  constructor(props : Props) {
    super(props);
    this.state = { gender:"", region:"",affiliation:"",interest:"" }
  }
  
  componentWillMount() {
    this.setState({ profile: {} });
    const { userProfile, getProfile } = this.props.auth;
    if (!userProfile) {
      getProfile((err, profile) => {
        this.setState({ profile });
      });
    } else {
      this.setState({ profile: userProfile });
    }
  }
  render() {

    let props = store.getState()
    if( props && props.data && !this.state.dictionary ) { 
      this._dict = props.data.dictionary 
    }

    const { profile } = this.state;
    console.log("profile",profile)
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
          this.setState({...this.state,[e.target.name]:e.target.value})
        }

        return (
          <div className="profile-container">
            <div className="profile-area">
              <h1><img src={profile.picture} alt="profile" />{profile.name}</h1>
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
                  <InputLabel htmlFor="gender">Gender</InputLabel>
                  <Select
                    value={this.state.gender}
                    onChange={handleChange}
                    inputProps={{ name: 'gender', id: 'gender'}}
                  >
                    <MenuItem value={"male"}>Male</MenuItem>
                    <MenuItem value={"female"}>Female</MenuItem>
                    <MenuItem value={"no-answer"}>Prefer not to answer</MenuItem>
                  </Select>
                </FormControl>

                <FormControl className="FC">
                  <InputLabel htmlFor="region">Area of Interest</InputLabel>
                  <Select
                    value={this.state.interest}
                    onChange={handleChange}
                    inputProps={{ name:"interest", id: 'interest'}}
                  >
                    <MenuItem value={"..."}>...</MenuItem>
                  </Select>
                </FormControl>

                <FormControl className="FC">
                  <InputLabel htmlFor="region">Cultural Region (if in China)</InputLabel>
                  <Select
                    value={this.state.region}
                    onChange={handleChange}
                    inputProps={{ name: 'region', id: 'region'}}
                  >
                    <MenuItem value={"outside"}>Not applicable</MenuItem>
                    <MenuItem value={"kham"}>Kham</MenuItem>
                    <MenuItem value={"amdo"}>Amdo</MenuItem>
                    <MenuItem value={"u-tsang"}>U-tsang</MenuItem>
                    <MenuItem value={"other"}>Other</MenuItem>
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