
import React from "react"

import { useInstantSearch, useConfigure } from "react-instantsearch";
import { Link } from "react-router-dom"
import { Trans } from 'react-i18next'
import I18n from 'i18next';

import Close from '@material-ui/icons/Close';

import { getPropLabel, fullUri } from '../../../components/App'

function SearchResultsHeader(props) {

  const { that, storageRef, inner } = props

  const searchStatus = useInstantSearch();
  const { indexUiState, status, error, results, refresh } = searchStatus
  
  // const { refine } = useCurrentRefinements(props);

  // const confProps = useConfigure({ attribute: "associated_res" });
  // const { refine } = confProps

  const config = (indexUiState?.configure?.filters??"").split(":")  
  
  const label = getPropLabel(that, fullUri("bdo:"+config[1]), false, true, undefined, undefined, storageRef?.current)
  
  console.log("status:", status, searchStatus)

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
    { status != "error" && (results?.nbHits || status === "idle")&& 
        ( inner && !indexUiState.query 
          ? <h3>{I18n.t("resource.explain")}</h3>
          : <h3>{I18n.t("result.hit"+(results.query?"KW":""),{count:results?.nbHits, interpolation: {escapeValue: false}, ...results.query?{kw:results.query}:{}})}</h3> 
        )
      }
    { status == "error" && 
        <h3>Server error, please retry later.</h3> 
    }
  </header> 
}

export default SearchResultsHeader ;