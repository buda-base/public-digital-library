// Core
import React from "react";

// Utils
import Client from "@searchkit/instantsearch-client";

// Config
import SearchkitConfig, { routingConfig } from "../searchkit.config";

// API
import { getCustomizedBdrcIndexRequest } from "../api/ElasticAPI";

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
import CustomDateRange from "../components/CustomDateRange";
import SearchBoxAutocomplete from "../components/SearchBoxAutocomplete";
import RefinementListWithLocalLabels from "../components/RefinementListWithLocalLabels";
import NumericList from "../components/NumericList";

// PDL
import { top_right_menu, getPropLabel, fullUri, highlight } from '../../../components/App'
import { Component } from 'react';
import qs from 'query-string'
import history from "../../../history"
import store from '../../../index';
import { initiateApp } from '../../../state/actions';


const filters = [{
    attribute:"scans_access", sort:true, I18n_prefix: "access.scans", prefix:"tmp"
  //},{ // #881 not yet
  //  attribute:"scans_quality", sort:true
  },{
    attribute:"etext_access", sort:true, I18n_prefix: "access.etext", prefix:"tmp"
  // },{
  //   attribute:"etext_quality", sort:true, numeric:true, items:[
  //     {
  //       label:"manual-aligned", start:4, end:4
  //     },{
  //       label:"manual-unaligned", start:3, end:3
  //     },{
  //       label:"revised-OCR", start:2, end:2
  //     },{
  //       label:"high", start:0.95, end:1
  //     },{
  //       label:"medium", start:0.8, end:0.95
  //     },{
  //       label:"poor", start:0, end:0.8
  //     }
  //   ]
  },{
    attribute:"inCollection"
  },{ 
    attribute:"language" 
  },{ 
    attribute:"associatedTradition"  
  },{ 
    attribute:"personGender" 
  },{ 
    attribute:"printMethod" 
  },{ 
    attribute:"script" 
  },{ 
    attribute:"workIsAbout" 
  },{ 
    attribute:"workGenre" 
  },{ 
    attribute:"author", prefix:"tmp" 
  },{ 
    attribute:"translator", iri:"bdr:R0ER0026" 
  },{ 
    attribute:"associatedCentury", prefix:"tmp"
  }
]

export const searchClient = Client(
  SearchkitConfig,
  {
    hooks: {
      beforeSearch: async (requests) => {
        const customizedRequest = requests.map((request) => {
          console.log("requests?",requests)
          if (request.indexName === process.env.REACT_APP_ELASTICSEARCH_INDEX) {
            return getCustomizedBdrcIndexRequest(request);
          }
          return request;
        });

        return customizedRequest;
      },
    },
  },
  { debug: process.env.NODE_ENV === "development" }
);

export class SearchPage extends Component<State, Props>
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
    
    //console.log("sC:", searchClient)    

    return (
      <>
        { top_right_menu(this) }
        <div className="AppSK">
          <InstantSearch
            indexName={process.env.REACT_APP_ELASTICSEARCH_INDEX}
            routing={routingConfig}
            searchClient={searchClient}
          >
            <div className="search inner-search-bar">
              <div>
                <SearchBoxAutocomplete />
              </div>
            </div>
            <div className="content">
              <div className="filter">
                <div className="filter-title"><p>Sort by</p></div>

                <SortBy
                  initialIndex={process.env.REACT_APP_ELASTICSEARCH_INDEX}
                  items={[
                    {
                      label: "default",
                      value: process.env.REACT_APP_ELASTICSEARCH_INDEX,
                    },
                    {
                      label: "sync scan date",
                      value: "firstScanSyncDate_desc",
                    },

                    {
                      label: "publication date (most recent) ",
                      value: "publicationDate_desc",
                    },

                    {
                      label: "publication date (oldest)",
                      value: "publicationDate_asc",
                    },
                  ]}
                />
                
                <RefinementListWithLocalLabels I18n_prefix={"types"} that={this} attribute="type" showMore={true} title={I18n.t("Lsidebar.datatypes.title")}/>

                <div className="filter-title MT"><p>{getPropLabel(this,fullUri("tmp:firstScanSyncDate"))}</p></div>
                <CustomDateRange attribute="firstScanSyncDate" />

                { filters.map((filter) => 
                    filter.numeric 
                    ? <NumericList that={this} {...filter} />
                    : <RefinementListWithLocalLabels that={this} {...filter} showMore={true} />
                  )
                }

              </div>
              <div className="main-content">
                <div className="hits">
                  <div className="pagination">
                    <Pagination />
                  </div>
                  <Configure hitsPerPage={20} />
                  <Hits hitComponent={({hit}) => <CustomHit hit={hit} that={this} />} />
                  <div className="pagination">
                    <Pagination />
                  </div>
                </div>
              </div>
            </div>
            {/* <CustomHits /> */}
          </InstantSearch>
        </div>
      </>
    );
  }
};

export default SearchPage;
