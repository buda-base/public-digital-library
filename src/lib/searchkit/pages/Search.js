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
import RefinementListWithLabels from "../components/RefinementListWithLabels";
import RefinementListWithLocalLabels from "../components/RefinementListWithLocalLabels";

// PDL
import { top_right_menu, getPropLabel, fullUri } from '../../../components/App'
import { Component } from 'react';
import qs from 'query-string'
import history from "../../../history"
import store from '../../../index';
import { initiateApp } from '../../../state/actions';


const searchClient = Client(
  SearchkitConfig,
  {
    hooks: {
      beforeSearch: async (requests) => {
        const customizedRequest = requests.map((request) => {
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

                <div className="filter-title"><p>{I18n.t("Lsidebar.datatypes.title")}</p></div>
                <RefinementListWithLocalLabels I18n_prefix={"types"} that={this} attribute="type" showMore={true} />

                <div className="filter-title"><p>{getPropLabel(this,fullUri("tmp:firstScanSyncDate"))}</p></div>
                <CustomDateRange attribute="firstScanSyncDate" />

                <div className="filter-title"><p>{getPropLabel(this,fullUri("bdo:inCollection"))}</p></div>
                <RefinementListWithLabels attribute="inCollection" showMore={true}
                />
                <div className="filter-title"><p>{getPropLabel(this,fullUri("bdo:language"))}</p></div>
                <RefinementListWithLocalLabels that={this} attribute="language" showMore={true} />

                <div className="filter-title"><p>{getPropLabel(this,fullUri("bdo:associatedTradition"))}</p></div>
                <RefinementListWithLocalLabels that={this} attribute="associatedTradition" showMore={true} />

                <div className="filter-title"><p>{getPropLabel(this,fullUri("bdo:personGender"))}</p></div>
                <RefinementListWithLocalLabels that={this} attribute="personGender" showMore={true} />

                <div className="filter-title"><p>{getPropLabel(this,fullUri("bdo:printMethod"))}</p></div>
                <RefinementListWithLocalLabels that={this} attribute="printMethod" showMore={true} />

                <div className="filter-title"><p>{getPropLabel(this,fullUri("bdo:script"))}</p></div>
                <RefinementListWithLocalLabels that={this} attribute="script" showMore={true} />

                <div className="filter-title"><p>{getPropLabel(this,fullUri("bdo:workIsAbout"))}</p></div>
                <RefinementListWithLabels attribute="workIsAbout" showMore={true} />

                <div className="filter-title"><p>{getPropLabel(this,fullUri("bdo:workGenre"))}</p></div>
                <RefinementListWithLabels attribute="workGenre" showMore={true} />

                <div className="filter-title"><p>{getPropLabel(this,fullUri("bdr:R0ER0019"))}</p></div>
                <RefinementListWithLabels attribute="author" showMore={true} />

                <div className="filter-title"><p>{getPropLabel(this,fullUri("bdr:R0ER0026"))}</p></div>
                <RefinementListWithLabels attribute="translator" showMore={true} />

                <div className="filter-title"><p>{getPropLabel(this,fullUri("tmp:associatedCentury"))}</p></div>
                <RefinementListWithLocalLabels that={this} attribute="associatedCentury" showMore={true} />
              </div>
              <div className="main-content">
                <div className="hits">
                  <div className="pagination">
                    <Pagination />
                  </div>
                  <Configure hitsPerPage={20} />
                  <Hits hitComponent={CustomHit} />
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
