// Core
import React, { Component, useState, useEffect, useCallback } from "react";
import _ from "lodash"

// Utils
import Client from "@searchkit/instantsearch-client";

// Config
import SearchkitConfig, { routingConfig } from "../searchkit.config";


// Components
import {
  InstantSearch,
  SearchBox,
  Hits,
  RefinementList,
  Pagination,
  Configure,
  SortBy,
} from "react-instantsearch";

import I18n from 'i18next';

// Custom
import CustomHit from "../components/CustomHit";
import SearchBoxAutocomplete from "../components/SearchBoxAutocomplete";
import { searchClient, HitsWithLabels } from "./Search";

// PDL
import qs from 'query-string'
import history from "../../../history"
import store from '../../../index';
import { initiateApp } from '../../../state/actions';

export class InnerSearchPage extends Component<State, Props>
{
  _urlParams = {}

  constructor(props) {
      super(props);
      
      this._urlParams = qs.parse(history.location.search) 
      
      this.state = { collapse:{} } 

      if(!this.props.config) store.dispatch(initiateApp(this._urlParams,null,null,"tradition"))
      
  }

  componentDidUpdate() { 

    if(window.initFeedbucket) window.initFeedbucket()    

  }
  
  render() {
    
    
    let { RID, T } = this.props
    if(RID) RID = RID.split(":")[1]

    let filters = ""
    if(RID) {
      // TODO: handle OR in ElasticAPI
      if(T === "Person") filters = "author:"+RID //+" OR workIsAbout:"+RID 
      else if(T === "Topic") filters = "workIsAbout:"+RID //+" OR workGenre:"+RID
    }

    console.log("iSsC:", searchClient, routingConfig, this.props, filters)    

    return (
      <>
        { filters && <div className="AppSK InnerSearchPage">
          <InstantSearch
            indexName={process.env.REACT_APP_ELASTICSEARCH_INDEX}
            routing={routingConfig}
            searchClient={searchClient}
          >
            <div className="search inner-search-bar">
              <div>
                <SearchBoxAutocomplete searchAsYouType={false}/>
              </div>
            </div>
            <div className="content">
              <div className="main-content">
                <div className="hits">
                  <Configure hitsPerPage={5} {...{ filters }} />
                  <HitsWithLabels that={this}  />
                  <div className="pagination">
                    <Pagination />
                  </div>
                </div>
              </div>
            </div>
            {/* <CustomHits /> */}
          </InstantSearch>
        </div> }
      </>
    );
  }
};

export default InnerSearchPage;
