// Core
import React, { useState, useEffect, useCallback } from "react";
import _ from "lodash"

// Utils
import Client from "@searchkit/instantsearch-client";

// Config
import SearchkitConfig, { routingConfig } from "../searchkit.config";

// API
import { getCustomizedBdrcIndexRequest, getGenericRequest } from "../api/ElasticAPI";
import { fetchLabels } from "../api/LabelAPI";

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

// PDL
import { top_right_menu, getPropLabel, fullUri, highlight } from '../../../components/App'
import { Component } from 'react';
import qs from 'query-string'
import history from "../../../history"
import store from '../../../index';
import { initiateApp } from '../../../state/actions';


export const filters = [{
    attribute:"scans_access", sort:true, I18n_prefix: "access.scans", prefix:"tmp"
  },{ // #881 not yet
  //  attribute:"scans_quality", sort:true, I18n_prefix: "access.scans.quality", prefix:"tmp"
  //},{
    attribute:"etext_access", sort:true, I18n_prefix: "access.etext", prefix:"tmp"
  },{
    attribute:"etext_quality", sort:true, I18n_prefix: "access.etext.quality", prefix:"tmp"
  },{
    attribute:"inCollection"
  },{ 
    attribute:"language" 
  },{
    attribute:"placeType", prefix:"tmp"
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
    attribute:"associatedCentury", sort:true, sortFunc:(elem) => Number(elem.value.replace(/[^0-9]/g,"")), prefix:"tmp"
  }
]


export const sortItems = [
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
]


export const searchClient = Client(
  SearchkitConfig,
  {
    hooks: {
      beforeSearch: async (requests) => {
        const customizedRequest = requests.map((request) => {          
          if (request.indexName === process.env.REACT_APP_ELASTICSEARCH_INDEX) {
            return getCustomizedBdrcIndexRequest(request);
          }
          return getGenericRequest(request); //request;
        });
        console.log("requests?",requests, customizedRequest)

        return customizedRequest;
      },
    },
  },
  { debug: process.env.NODE_ENV === "development" }
);


export function HitsWithLabels(props) {

  const {that, sortItems} = props

  const [currentItems, setCurrentItems] = useState([]);
  
  const [storage, setStorage] = useState({})

  const [fetching, setFetching] = useState({})

  const goFetch = useCallback(async () => {

    console.log("fetching:", fetching)

    const attribute = "pagination"
    const fetchedItems = await fetchLabels(Object.keys(fetching), attribute)
    
    console.log("fetched", fetchedItems)
    
    const newStorage = { ...storage }
    newStorage[attribute] = { ...storage[attribute], ...fetchedItems }
    sessionStorage.setItem(attribute, JSON.stringify(newStorage[attribute]));
    
    if(!_.isEqual(newStorage, storage)) setStorage(newStorage)

  }, [fetching, storage])


  useEffect(() => {
    
    if(!_.isEmpty(fetching)) goFetch()
    
  }, [fetching])

  const prepItemsPage = (items) => {    
    const attrs = ["author", "translator", "inRootInstance", "locatedIn", "placeType", "pagination"]
    const itemIds = {}
    const newStorage = { ...storage }
    
    for(const attribute of attrs) {
      if (!sessionStorage.getItem(attribute)) {
        sessionStorage.setItem(attribute, JSON.stringify({}));
      }      
      newStorage[attribute] = JSON.parse(sessionStorage.getItem(attribute));
      for(const _item of items) {
        if(_item[attribute]) _item[attribute].map(i => itemIds[i] = true);
      }
    }

    const missingIds = {}
    for(const id of Object.keys(itemIds)) {
      let found = false
      for(const attribute of attrs) { 
        if(storage[attribute][id]){
          found = true
          break;
        }
      }
      if(!found) missingIds[id] = true
    }

    const newFetching = { ...fetching, ...missingIds }
    if(!_.isEqual(newFetching, fetching)) setFetching(newFetching)

    //console.log("prep:", items, itemIds, newStorage, missingIds, newFetching)
    if(!_.isEqual(newStorage, storage)) setStorage(newStorage)

    return items
  }

  return <Hits 
    transformItems={prepItemsPage}
    hitComponent={({hit}) => <CustomHit {...{ hit, that, sortItems, storage: Object.values(storage).reduce((acc,v) => ({...acc,...v}),{}) }}/>} 
  />
}


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
    
    const pageFilters = this.props.pageFilters ?? ""

    console.log("sC:", searchClient, routingConfig, pageFilters)    


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
                <SearchBoxAutocomplete searchAsYouType={false} {...{ pageFilters }}/>
              </div>
            </div>
            <div className="content">
              <div className="filter">
                <div className="filter-title"><p>Sort by</p></div>

                <SortBy
                  initialIndex={process.env.REACT_APP_ELASTICSEARCH_INDEX}
                  items={sortItems}
                />
                
                <RefinementListWithLocalLabels I18n_prefix={"types"} that={this} attribute="type" showMore={true} title={I18n.t("Lsidebar.datatypes.title")}/>

                <div className="filter-title MT"><p>{getPropLabel(this,fullUri("tmp:firstScanSyncDate"))}</p></div>
                <CustomDateRange attribute="firstScanSyncDate" />

                { filters.map((filter) => <RefinementListWithLocalLabels that={this} {...filter} showMore={true} />) }

              </div>
              <div className="main-content">
                <div className="hits">
                  <div className="pagination">
                    <Pagination />
                  </div>
                  <Configure hitsPerPage={20} filters={pageFilters} />
                  <HitsWithLabels that={this} {...{ sortItems }} />
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
