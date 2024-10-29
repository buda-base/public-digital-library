// Core
import React, { useState, useEffect, useCallback } from "react";
import _ from "lodash"
import Loader from 'react-loader';
import { useLocation, useNavigate } from 'react-router-dom'

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
  ClearRefinements
} from "react-instantsearch";

import I18n from 'i18next';

// hooks
import { useInstantSearch, useSortBy, useClearRefinements, useConfigure } from "react-instantsearch";

// Custom
import CustomHit from "../components/CustomHit";
import CustomDateRange from "../components/CustomDateRange";
import SearchBoxAutocomplete from "../components/SearchBoxAutocomplete";
import RefinementListWithLocalLabels from "../components/RefinementListWithLocalLabels";
import SearchResultsHeader from "../components/SearchResultsHeader"

// PDL
import { top_right_menu, getPropLabel, fullUri, highlight } from '../../../components/App'
import AppContainer from '../../../containers/AppContainer';
import { Component } from 'react';
import qs from 'query-string'
//import history from "../../../history"
import store from '../../../index';
import { initiateApp } from '../../../state/actions';


export const filters = [{ 
    attribute:"author", prefix:"tmp" 
  },{ // #881 not yet
  //  attribute:"scans_quality", sort:true, I18n_prefix: "access.scans.quality", prefix:"tmp"
  //},{
    attribute:"etext_access", sort:true, I18n_prefix: "access.etext", prefix:"tmp"
  },{
    attribute:"etext_quality", sort:true, I18n_prefix: "access.etext.quality", prefix:"tmp",
    tooltips:{
      "6":"Manually typed. Etext is aligned with scans.",
      "5":"Manually typed. Etext is not aligned with scans.",
      "4":"Etext is automatically created with OCR (Optical Character Recognition) and reviewed.",
      "3":"Etext is automatically created with OCR (Optical Character Recognition) and is of good quality without many errors.",
      "2":"Etext is automatically created with OCR (Optical Character Recognition) and is usable, but contains some errors.",
      "1":"Etext is automatically created with OCR (Optical Character Recognition) and contains errors",
    }    
  },{
    attribute:"etext_access", sort:true, I18n_prefix: "access.etext", prefix:"tmp"
  },{
    attribute:"scans_access", sort:true, I18n_prefix: "access.scans", prefix:"tmp"
  },{ 
    attribute:"printMethod" 
  },{
    attribute:"nocomm_search", I18n_prefix: "search.nocomm_search", prefix:"tmp", defaultItems:[{ value: "true" }]
  },{
    attribute:"etext_search", I18n_prefix: "search.etext_search", prefix:"tmp", defaultItems:[{ value: "true" }]
  },{ 
    attribute:"associatedTradition", prefix:"tmp"
  },{ 
    attribute:"workGenre" 
  },{ 
    attribute:"workIsAbout" 
  },{ 
    attribute:"script" 
  },{ 
    attribute:"language" 
  },{
    attribute:"associatedCentury", sort:true, sortFunc:(elem) => Number(elem.value.replace(/[^0-9]/g,"")), prefix:"tmp"
  },{ 
    attribute:"placeType", prefix:"tmp"
  },{
    attribute:"personGender" 
  },{ 
    attribute:"translator", iri:"bdr:R0ER0026" 
  },{ 
    attribute:"inCollection"
  }
]


export const sortItems = [
  {
    label: "Default",
    value: process.env.REACT_APP_ELASTICSEARCH_INDEX,
  },
  {
    label: "Newest scans", //"sync scan date",
    value: "firstScanSyncDate_desc",
  },

  {
    label: "Publication date (most recent) ",
    value: "publicationDate_desc",
  },

  {
    label: "Publication date (oldest)",
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


const MySortBy = ({recent}) => {
  const { currentRefinement, options, refine, initialIndex } = useSortBy({
    items:sortItems,
    //initialIndex: "firstScanSyncDate_desc" // this does not work
  });

  // workaround
  useEffect(() => {
    if(recent) refine("firstScanSyncDate_desc")
  }, [])
  
  //console.log("iidx:", recent, currentRefinement, initialIndex)

  return (
    <select
      value={currentRefinement}
      onChange={(event) => refine(event.target.value)}
      style={{ width:"100%" }}
      class="ais-SortBy-select"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value} class="ais-SortBy-option">
          {option.label}
        </option>
      ))}
    </select>
  );
};

const MyClearRefinements = (props) => {
  
  const { request, setRequest } = props

  const { canRefine, refine } = useClearRefinements();

  return (
    <button
      class="ais-ClearRefinements-button" 
      onClick={() => { refine(); setRequest(""); }} 
      disabled={!canRefine && !request}
    >
      Clear All Filters
    </button>
  );
};
  



export function FiltersSidebar(props) {

  const { that, recent } = props
  
  const [request, setRequest] = useState()

  const searchStatus = useInstantSearch();
  const { indexUiState } = searchStatus
  
  const today = new Date(), lastMonth = new Date();
  lastMonth.setMonth(today.getMonth() - 1);
  const lastMonthFormatted = lastMonth.toISOString().slice(0, 10);

  //console.log("sB?", that, indexUiState, sortItems, recent)

  return <>
    { ! recent && <h3>{I18n.t("result.filter")}</h3> }

    <MyClearRefinements   
      translations={{
        resetButtonText: 'Clear all filters',
      }}
      {...{ request, setRequest } }
    />
    <br/>

    { !recent && <RefinementListWithLocalLabels that={that} {...filters[0] } className={recent ? "": "MT0"}  /> }

    { filters.slice(1).map((filter) => <RefinementListWithLocalLabels that={that} {...filter} showMore={true}  />) }

    <RefinementListWithLocalLabels I18n_prefix={"types"} that={that} attribute="type" showMore={true} title={I18n.t("Lsidebar.datatypes.title")}/>

    <div className="filter-title MT"><p>{getPropLabel(that,fullUri("tmp:firstScanSyncDate"))}</p></div>
    <CustomDateRange attribute="firstScanSyncDate" /*{...recent?{ defaultBefore: lastMonthFormatted }:{}}*/ {...{request, setRequest}} />
    
    <div className="filter-title MT" ><p>Sort by</p></div>
    <span style={{fontSize:"16px"}}>
      <MySortBy recent={recent} />
      {/* <SortBy
        initialIndex={recent ? "firstScanSyncDate_desc" : process.env.REACT_APP_ELASTICSEARCH_INDEX}
        items={recent ? [sortItems[1], sortItems[0], sortItems[2], sortItems[3]] : sortItems}
      />     */}
    </span>

    <br />
    <br />
    <br />

    <MyClearRefinements   
      translations={{
        resetButtonText: 'Clear all filters',
      }}
      {...{ request, setRequest } }
    />
  </>
}

export function HitsWithLabels(props) {

  const {that, sortItems, routing, recent, storageRef} = props

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
    const attrs = ["author", "translator", "inRootInstance", "locatedIn", "placeType", "associated_res", "pagination"]
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
    if(!_.isEqual(newStorage, storage)) { 
      setStorage(newStorage)      
    }

    return items.map(it => ({...it, etext_search: "true" }))
  }

  useEffect(() => {
    if(storageRef) storageRef.current = Object.values(storage).reduce((acc,v) => ({...acc,...v}),{})
  }, [storage, storageRef])

  return <Hits 
    transformItems={prepItemsPage}
    hitComponent={({hit}) => <CustomHit {...{ routing, hit, that, sortItems, recent, storage: storageRef?.current }}/>} 
  />
}


const routing = routingConfig()

function HomeCompo(props = {}) {
  const location = useLocation();
  const navigate = useNavigate();

  /*
  useEffect(() => {
    store.dispatch(initiateApp(qs.parse(location.search)));
  }, [location]); 
  */

  return <AppContainer { ...{ ...props, location, navigate, auth:props.auth } }/> 
}

function QueryRefCompo({ that }) {
  const { indexUiState } = useInstantSearch();
  
  useEffect(() => {
    if(that.state.query != indexUiState.query) that.setState({query:indexUiState.query})
  }, [indexUiState])

  return <></>
} 

export class SearchPage extends Component<State, Props>
{
  _urlParams = {}

  constructor(props) {
      super(props);
      
      this._urlParams = qs.parse(this.props.location.search) 
      
      this.state = { collapse:{} } 

      if(!this.props.config) store.dispatch(initiateApp(this._urlParams,null,null,"tradition"))
      
  }

  componentDidUpdate() { 

    if(window.initFeedbucket) window.initFeedbucket()    

  }
  
  render() {
    
    if(!this.props.config) return <div><Loader /></div>

    const pageFilters = this.props.pageFilters ?? ""

    const storageRef = React.createRef() 

    console.log("sC:", searchClient, routingConfig, pageFilters, storageRef)    
    

    return (
      <>
        { top_right_menu(this,null,null,null,null,this.props.location) }
        <div className={"AppSK"+(this.props.advancedSearch?" advanced":"")}>
          { this.props.advancedSearch && <HomeCompo auth={this.props.auth} SKquery={this.state.SKquery} />}
          <InstantSearch
            key={pageFilters ?? "main"}
            indexName={process.env.REACT_APP_ELASTICSEARCH_INDEX}
            routing={routing}
            searchClient={searchClient}
            future={{ preserveSharedStateOnUnmount: true }}

            /*
            initialUiState={routing.stateMapping.routeToState(qs.parse(this.props.location.search, {arrayFormat: 'index'}))}            
            onStateChange={(_ref) => {
              console.log("oScS:",window.lastRouteState,_ref)
              const uiState = _ref.uiState;
              var routeState = routingConfig.stateMapping.stateToRoute(uiState);
              if (window.lastRouteState === undefined || !_.isEqual(window.lastRouteState, routeState)) {
                console.log("writing:", JSON.stringify(routeState, null, 3))
                //routingConfig.router.write(routeState)
                //this.props.navigate({...this.props.location, state:routeState })
                window.lastRouteState = routeState;
                _ref.setUiState(uiState)

              }
            }}
            */
          >
            <QueryRefCompo that={this} />
            <div className="search inner-search-bar">
              <div>
                <SearchBoxAutocomplete searchAsYouType={false} {...{ that:this, pageFilters, routing }} />
              </div>
            </div>
            <div className="content">
              <div className="filter">
                <FiltersSidebar that={this} />
              </div>
              <div className="main-content">
                <SearchResultsHeader that={this} {...{ storageRef }}/>
                <div className="hits">
                  <div className="pagination">
                    <Pagination />
                  </div>
                  <Configure hitsPerPage={20} filters={pageFilters} />
                  <HitsWithLabels that={this} {...{ routing, sortItems, storageRef }} />
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
