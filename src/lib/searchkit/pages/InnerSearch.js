// Core
import React, { Component, useState, useEffect, useCallback } from "react";
import _ from "lodash"
import Loader from "react-loader"
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

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
import { getPropLabel, fullUri } from '../../../components/App'
import CustomHit from "../components/CustomHit";
import SearchBoxAutocomplete from "../components/SearchBoxAutocomplete";
import { searchClient, HitsWithLabels, sortItems, filters } from "./Search";
import RefinementListWithLocalLabels from "../components/RefinementListWithLocalLabels";
import CustomDateRange from "../components/CustomDateRange";
import SearchResultsHeader from "../components/SearchResultsHeader"

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

    let pageFilters = "associated_res:"+RID, placeholder = ""
    if(RID) {
      /*
      // DONE: handle OR in ElasticAPI (use associated_res field instead)
      if(T === "Person") { 
        pageFilters = "author:"+RID //+" OR workIsAbout:"+RID 
        placeholder = I18n.t("resource.findTbyP")
      }
      else if(T === "Topic") { 
        pageFilters = "workIsAbout:"+RID //+" OR workGenre:"+RID
        placeholder = I18n.t("resource.findTaboutT")
      }
      */
    }

    const storageRef = React.createRef() 

    console.log("iSsC:", searchClient, routingConfig, this.props, pageFilters, storageRef)    
    
    return (<>
      { pageFilters && <div className="AppSK InnerSearchPage data">
          <InstantSearch
            indexName={process.env.REACT_APP_ELASTICSEARCH_INDEX}
            routing={routingConfig}
            searchClient={searchClient}
          >
            <Loader loaded={!this.props.loading}/>
            <div data-props="tmp:search">
              <div className="searchbox">
                <h3><span><a class="propref"><span>{I18n.t("resource.findT")}{I18n.t("punc.colon")}</span></a></span></h3>
                <div className="search inner-search-bar group">
                  <div>
                    <SearchBoxAutocomplete searchAsYouType={false} loading={this.props.loading} {...{ pageFilters, placeholder }}/>
                  </div>
                </div>
              </div>
              <div className="content">

                <SimpleBar className="filter">

                  <h3>{I18n.t("result.filter")}</h3>

                  <div className="filter-title"><p>Sort by</p></div>

                  <SortBy
                    initialIndex={process.env.REACT_APP_ELASTICSEARCH_INDEX}
                    items={sortItems}
                  />
                  
                  <RefinementListWithLocalLabels that={this} {...filters[0]} />

                  <RefinementListWithLocalLabels I18n_prefix={"types"} that={this} attribute="type" showMore={true} title={I18n.t("Lsidebar.datatypes.title")}/>

                  <div className="filter-title MT"><p>{getPropLabel(this,fullUri("tmp:firstScanSyncDate"))}</p></div>
                  <CustomDateRange attribute="firstScanSyncDate" />

                  { filters.slice(1).map((filter) => <RefinementListWithLocalLabels that={this} {...filter} showMore={true} />) }

                </SimpleBar>
                <div className="main-content">
                  <SearchResultsHeader that={this} {...{ storageRef }} />
                  <div className="hits">
                    <Configure hitsPerPage={5} filters={pageFilters} />
                    <HitsWithLabels that={this} {...{ storageRef }} />
                    <div className="pagination">
                      <Pagination />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* <CustomHits /> */}
        </InstantSearch>
      </div>}
    </>);
  }
};

export default InnerSearchPage;
