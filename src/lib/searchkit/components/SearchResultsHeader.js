
import React, {useEffect} from "react"

import { useInstantSearch, useConfigure } from "react-instantsearch";
import { Link } from "react-router-dom"
import { useLocation, useNavigate } from "react-router"
import { Trans } from 'react-i18next'
import I18n from 'i18next';

import Close from '@material-ui/icons/Close';

import { getPropLabel, fullUri } from '../../../components/App'

function SearchResultsHeader(props) {

  const { that, storageRef, inner, recent, forceSearch } = props

  const searchStatus = useInstantSearch();
  const { indexUiState, status, error, results, refresh, setIndexUiState} = searchStatus
  
  // const { refine } = useCurrentRefinements(props);

  // const confProps = useConfigure({ attribute: "associated_res" });
  // const { refine } = confProps

  const config = (indexUiState?.configure?.filters??"").split(":")  
  
  const label = getPropLabel(that, fullUri("bdo:"+config[1]), false, true, undefined, undefined, storageRef?.current)
  
  //console.log("status:", status, searchStatus)

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if(location.pathname === '/' && location.search === "") {
      setIndexUiState((prevIndexUiState) => ({
        ...prevIndexUiState,
        refinementList: {
          ...prevIndexUiState.refinementList,
          type: ['Instance'],
        },
      }));
    }
  }, [location])

  useEffect(() => {
    if(results?.processingTimeMS && results?.nbHits === 0) {
      console.log("remove:", searchStatus)

      const latest = JSON.parse(localStorage.getItem('latest_searches') ?? "{}")          
      if(latest[indexUiState.query] && latest[indexUiState.query].pageFilters === indexUiState.configure?.filters) {
        delete latest[indexUiState.query]
        localStorage.setItem('latest_searches', JSON.stringify(latest))
      }
      
    }
  }, [results])

  return <header data-hits={results?.nbHits} data-status={status}>    
    { !inner && <>{ config.length > 1 && config[0] === "associated_res" 
      ? <h1 class={that.props.locale === "bo" || label?.lang === "bo" ? "has-bo" : ""}>
        <Trans i18nKey="result.assocNoT" values={{ name: label?.value || config[1] }} components={{ res: <Link to={inner?"/osearch/associated/"+config[1]+"/search":"/show/bdr:"+config[1]} /> }}/>
        {!inner && 
            <Link className="close-link" to={"/osearch/search" /*+that.props.history.location.search*/} title={I18n.t("resource.back")}
              //target="_blank" // in a new tab otherwise it won't use the same query if given
              onClick={(ev) => {
                //ev.preventDefault()
                //ev.stopPropagation()
                //refine(false)
              }}
            >
              <Close />
            </Link>
          }</h1>
    : <h1 lang={that.props.locale}>{I18n.t("result.search")}</h1> }</> }
    { status != "error" && (results?.nbHits || status === "idle") && (!recent || forceSearch /*&& indexUiState.query && results?.nbHits === 0*/) && 
        ( inner && !indexUiState.query
          ? <h3>{I18n.t("resource.explain"+(recent&&!forceSearch?"R":""))}</h3>
          : <h3>{I18n.t("result.hit"+(results.query?"KW":""),{count:results?.nbHits, interpolation: {escapeValue: false}, ...results.query?{kw:results.query}:{}})}</h3> 
        )
      }
    { status == "error" && 
        <h3>Server error, please retry later.</h3> 
    }
  </header> 
}

export default SearchResultsHeader ;