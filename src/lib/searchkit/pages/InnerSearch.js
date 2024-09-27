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
  SortBy, useSortBy
} from "react-instantsearch";

import I18n from 'i18next';

// Custom
import { getPropLabel, fullUri } from '../../../components/App'
import CustomHit from "../components/CustomHit";
import SearchBoxAutocomplete from "../components/SearchBoxAutocomplete";
import { searchClient, HitsWithLabels, filters, FiltersSidebar, sortItems } from "./Search";
import RefinementListWithLocalLabels from "../components/RefinementListWithLocalLabels";
import CustomDateRange from "../components/CustomDateRange";
import SearchResultsHeader from "../components/SearchResultsHeader"

// PDL
import qs from 'query-string'
//import history from "../../../history"
import store from '../../../index';
import { initiateApp } from '../../../state/actions';

const routing = routingConfig()

export class InnerSearchPage extends Component<State, Props>
{
  _urlParams = {}

  constructor(props) {
      super(props);
      
      this._urlParams = qs.parse(props.location.search) 
      
      this.state = { collapse:{} } 

      if(!this.props.config) store.dispatch(initiateApp(this._urlParams,null,null,"tradition"))
      
  }

  componentDidUpdate() { 

    if(window.initFeedbucket) window.initFeedbucket()    

  }
  
  render() {
    
    if(!this.props.config) return <div><Loader /></div>

    let pageFilters = "", placeholder = "", leftTitle = ""


    const storageRef = React.createRef() 

    let { RID, T, recent } = this.props

    /* // debug sortBy
    if(recent) {
      pageFilters = "associated_res:P1583"
    }
    */
   
    if(RID) RID = RID.split(":")[1]
    if(RID && T) {
      
      pageFilters = "associated_res:"+RID 
      placeholder = I18n.t("resource.searchT",{ type: I18n.t("types."+T.toLowerCase()).toLowerCase() } )
      leftTitle = I18n.t("resource.findT",{type:I18n.t("types."+T.toLowerCase())})
  
      if(["Person","Topic","Place","Product"].includes(T)) placeholder = I18n.t("resource.searchTn."+T.toLowerCase())
            
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

    console.log("iSsC:", searchClient, routingConfig, this.props, pageFilters, storageRef, recent)        
    
    return (<>
      { (pageFilters || !RID) && <div className="AppSK InnerSearchPage data">
          <InstantSearch
            key={pageFilters+"-"+RID}            
            indexName={process.env.REACT_APP_ELASTICSEARCH_INDEX}
            routing={routing}
            searchClient={searchClient}
            future={{ preserveSharedStateOnUnmount: true }}
            /*
            initialUiState={routing.stateMapping.routeToState(qs.parse(this.props.location.search, {arrayFormat: 'index'}))}
            onStateChange={({uiState, setUiState}) => {
               console.log("oScIS:",uiState)
               setUiState(uiState)
            }}
            */
           /*
            onStateChange={(_ref) => {
              console.log("oScS:",window.lastRouteState,_ref)
              const uiState = _ref.uiState;
              var routeState = routingConfig.stateMapping.stateToRoute(uiState);
              if (window.lastRouteState === undefined || !_.isEqual(window.lastRouteState, routeState)) {
                routingConfig.router.write(routeState)
                console.log("writing:", JSON.stringify(routeState, null, 3))
                window.lastRouteState = routeState;
                _ref.setUiState(uiState)
              }
            }} 
              */
          >
            <Loader loaded={!this.props.loading}/>
            <div data-props="tmp:search">
              { !recent && <div className="searchbox">
                <h3><span><a class="propref"><span>{leftTitle}{I18n.t("punc.colon")}</span></a></span></h3>
                <div className="search inner-search-bar group">
                  <div>
                    <SearchBoxAutocomplete searchAsYouType={false} loading={this.props.loading} {...{ pageFilters, placeholder, routing }}/>
                  </div>
                </div>
              </div> }
              <div className="content">
                <SimpleBar className="filter">
                  <FiltersSidebar that={this} recent={recent}/> 
                </SimpleBar>
                <div className="main-content">
                  <SearchResultsHeader that={this} inner={true} recent={recent} {...{ storageRef }} />
                  <div className="hits">
                    <Configure hitsPerPage={5} filters={pageFilters} />
                    <HitsWithLabels that={this} {...{ routing, recent, storageRef }} />
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
