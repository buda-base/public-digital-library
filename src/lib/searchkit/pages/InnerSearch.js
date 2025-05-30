// Core
import React, { Component, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom"
import _ from "lodash"
import Loader from "react-loader"
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import IconButton from '@material-ui/core/IconButton';
import Close from '@material-ui/icons/Close';


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
  useSortBy,
  useInstantSearch
} from "react-instantsearch";

import I18n from 'i18next';

// Custom
import { getPropLabel, fullUri } from '../../../components/App'
import CustomHit from "../components/CustomHit";
import SearchBoxAutocomplete from "../components/SearchBoxAutocomplete";
import { searchClient, HitsWithLabels, filters, FiltersSidebar, sortItems, MyConfigure } from "./Search";
import RefinementListWithLocalLabels from "../components/RefinementListWithLocalLabels";
import CustomDateRange from "../components/CustomDateRange";
import SearchResultsHeader from "../components/SearchResultsHeader"

// PDL
import qs from 'query-string'
//import history from "../../../history"
import store from '../../../index';
import { initiateApp } from '../../../state/actions';

const routing = routingConfig()


function OtherVersionsNav({ that, RID, srcVersionID }) {

  const { results } = useInstantSearch();

  const numDiff = srcVersionID ? 1 : 0

  return <div class="other-versions-nav">
    <span onClick={() => that.setState({toggled:!that.state.toggled})} class={results.nbHits-numDiff > 10 ? "show": ""}>
      { !that.state.toggled 
        ? I18n.t("misc.see10MoreN",{count:results.nbHits-numDiff >= 20 ? 10 : results.nbHits-numDiff - 10})
        : I18n.t("misc.hide") }&nbsp;{that.state.toggled ? <ExpandLess /> : <ExpandMore /> }
    </span>
    <span>
      <Link to={"/osearch/associated/"+RID+"/search"}>
        {I18n.t("misc.browseA",{count: results.nbHits - numDiff})}
      </Link>
    </span>
  </div>
}

function MaskWhenNoResult({ setEmpty }) {

  const { status, results } = useInstantSearch();
  
  const [done, setDone] = useState(0)

  //console.log("mwnr:", done, status, results)

  useEffect(() => {
    if(status === "loading" && done == 0) setDone(1)
    else if(status === "idle" && done == 1) setDone(2)
  }, [status, done])

  useEffect(() => {
    if(done === 2) setEmpty(results.query==="" && results.nbPages===0)
  }, [results, done])

  return null
}

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

    let { RID, T, recent, isOtherVersions, srcVersionID, noScrollFilters, customFilters, sortByDefault, customPholder, forceSearch  } = this.props

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

    if(!pageFilters && customFilters || forceSearch) {

      if(!pageFilters && customFilters) pageFilters = customFilters

      if(!forceSearch) leftTitle = I18n.t("resource.findT",{type:I18n.t("types.tradition")})
      else leftTitle = I18n.t("resource.findTrecent")

      if(customPholder) placeholder = customPholder
    
    }

    console.log("iSsC:", searchClient, routingConfig, this.props, pageFilters, storageRef, recent)        
    
    //if(this.state.isEmpty) return null

    const toggleSettings = () => this.setState({collapse:{...this.state.collapse, settings:!this.state.collapse.settings}})

    return (<>
      { (pageFilters || !RID) && <div className={"AppSK InnerSearchPage data empty-"+(this.state.isEmpty)}>
          <InstantSearch
            key={pageFilters+"-"+RID+"_isOtherVersions-"+isOtherVersions+(srcVersionID?"_src-"+srcVersionID:"")+("_recent-"+recent)}            
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
            <MaskWhenNoResult setEmpty={(val) => { if(val != this.state.isEmpty) this.setState({isEmpty:val}); }} />
            <Loader loaded={!this.props.loading}/>
            <div data-prop="tmp:search">
              { (!recent || forceSearch) && <div className="searchbox">
                <h3><span><a class="propref"><span>{leftTitle}{I18n.t("punc.colon")}</span></a></span></h3>
                <div className="search inner-search-bar group">
                  <div>
                    <SearchBoxAutocomplete inner={true} searchAsYouType={false} loading={this.props.loading} {...{ forceSearch, pageFilters, placeholder, routing, that: this }}/>
                  </div>
                </div>
              </div> } 
              { !isOtherVersions && !this.state.collapse.settings && <div id="settings" onClick={toggleSettings}><img src="/icons/settings.svg"/></div> }
              <div className="content">
                {noScrollFilters && !this.state.collapse.settings
                  ? <div className={"filter no-scroll "+(this.state.collapse.settings ? "on":"")}>
                    <FiltersSidebar that={this} recent={recent&&!sortByDefault}/> 
                  </div>
                  : <SimpleBar className={"filter "+(this.state.collapse.settings ? "on":"")}> 
                      <IconButton className="close" onClick={toggleSettings}><Close /></IconButton>
                      <FiltersSidebar that={this} recent={recent&&!sortByDefault}/> 
                  </SimpleBar> 
                }
                <div className="simple-filter-BG" onClick={toggleSettings}></div>
                <div className="main-content">
                  <SearchResultsHeader that={this} inner={true} recent={recent&&!sortByDefault} {...{ storageRef, forceSearch }} />
                  <div className="hits">
                    
                    {/* DONE: use MyConfigure once bug with sorting is fixed (#1029) */}
                    <MyConfigure hitsPerPage={isOtherVersions ? 11 * (this.state.toggled ? 2 : 1) : (recent ? 20 : 5)} { ...{ pageFilters } }  />
                    {/* <Configure hitsPerPage={isOtherVersions ? 11 * (this.state.toggled ? 2 : 1) : (recent ? 20 : 5)}  filters={pageFilters} /> */}
                    
                    <HitsWithLabels that={this} {...{ routing, recent:recent&&!sortByDefault, storageRef, isOtherVersions, srcVersionID }} />
                    { isOtherVersions 
                      ? <OtherVersionsNav {...{ that:this, RID, srcVersionID } }/>
                      : <div className="pagination">
                        <Pagination padding={window.innerWidth <= 665 ? 1 : 3}/>
                      </div> }
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
