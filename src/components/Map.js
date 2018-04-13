
import React, { Component } from 'react';
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';

export class MapComponent extends Component {
  render() {

console.log("map",this.props)

    return (
      <Map google={this.props.google} zoom={14}>

        <InfoWindow onClose={this.onInfoWindowClose}>
            <div>
            </div>
        </InfoWindow>

      </Map>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyDDy5529NgQcICTmTE3QOEIxDXdSAGIPRI"
})(MapComponent)
