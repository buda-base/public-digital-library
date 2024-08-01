
import React from "react"

import { useInstantSearch } from "react-instantsearch";
import { Link } from "react-router-dom"
import { Trans } from 'react-i18next'
import I18n from 'i18next';

import { getPropLabel, fullUri } from '../../../components/App'

function SearchResultsHeader(props) {

  const { that, storageRef, inner } = props

  const searchStatus = useInstantSearch();
  const { indexUiState, status, error, results } = searchStatus

  console.log("status:", status, searchStatus)

  const config = (indexUiState?.configure?.filters??"").split(":")  

  const label = getPropLabel(that, fullUri("bdo:"+config[1]), false, true, undefined, undefined, storageRef?.current)
  
  return <header data-hits={results?.nbHits} data-status={status}>    
    { config.length > 1 && config[0] === "associated_res" 
      ? <h1 class={that.props.locale === "bo" || label?.lang === "bo" ? "has-bo" : ""}><Trans i18nKey="result.assocNoT" values={{ name: label?.value || config[1] }} components={{ res: <Link to={inner?"/osearch/associated/"+config[1]+"/search":"/show/bdr:"+config[1]} /> }}/></h1>
    : <h1 lang={that.props.locale}>{I18n.t("result.search")}</h1> }
    { status != "error" && (results?.nbHits || status === "idle")&& <h3>{I18n.t("result.hit"+(results.query?"KW":""),{count:results?.nbHits, interpolation: {escapeValue: false}, ...results.query?{kw:results.query}:{}})}</h3> }
    { status == "error" && <h3>Server error</h3> }
  </header> 
}

export default SearchResultsHeader ;